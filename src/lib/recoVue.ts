/**
 * Mise en forme d'une reco pour l'écran récapitulatif, la fiche « dernier regard » et le PDF.
 * Les calculs restent dans reco.ts ; ici on ne fait que traduire, formater et isoler (arabe).
 */
import type { TFunction } from 'i18next';
import { CourseWalk, calculerIntervalle, longueurTotale, recalculer, tempsAccordeSecondes } from './reco';
import { formatLength, formatNumber, formatSpeed, UnitSystem } from './units';
import { isoler } from './bidi';
import { Horse } from '../types';

export interface LigneReco {
  id: string;
  numero: string;
  /** « 1 → 2 », « départ → 1 » (isolé de gauche à droite). */
  intervalle: string;
  type: string;
  hauteur?: string;
  pas: number;
  distance: string;
  theoriques?: string;
  /** « 6 foulées » pour le cheval affiché. */
  conseillees?: string;
  contrat?: string;
  /** « Court : −0,40 m (7,26 m conseillés) » pour un élément de combinaison. */
  signal?: { niveau: 'court' | 'juste' | 'long'; texte: string };
  note?: string;
}

export interface VueReco {
  lignes: LigneReco[];
  /** Dernier intervalle jusqu'à l'arrivée, s'il a été compté. */
  arrivee?: { intervalle: string; distance: string };
  longueur: string;
  temps: string;
  vitesse: string;
}

export function vueReco(walk: CourseWalk, horse: Horse, unitSystem: UnitSystem, t: TFunction): VueReco {
  const w = recalculer(walk, horse);
  const env = { terrain: w.terrain, speed: w.speed };
  const lignes: LigneReco[] = w.obstacles.map((o, i) => {
    const intervalle = calculerIntervalle(w.obstacles, i, w.longueurPas, horse, env);
    const depuis = i === 0 ? t('reco.startLine') : w.obstacles[i - 1].numero;
    const ligne: LigneReco = {
      id: o.id,
      numero: o.numero,
      intervalle: isoler(`${depuis} → ${o.numero}`),
      type: t(`reco.type${o.type}`),
      hauteur: o.hauteur ? isoler(formatLength(o.hauteur, unitSystem)) : undefined,
      pas: o.pasDepuisPrecedent,
      distance: isoler(formatLength(o.distanceMetres, unitSystem)),
      contrat: o.contrat !== undefined ? t('exercises.strideCount', { count: o.contrat }) : undefined,
      note: o.note,
    };
    if (intervalle) {
      ligne.theoriques = isoler(formatNumber(intervalle.fouleesTheoriques, 1));
      ligne.conseillees = t('exercises.strideCount', { count: intervalle.fouleesConseillees });
      if (intervalle.combinaison) {
        const { signal, ecart, distanceConseillee } = intervalle.combinaison;
        const signe = ecart > 0 ? '+' : ecart < 0 ? '−' : '';
        ligne.signal = {
          niveau: signal,
          texte: t('reco.signalDetail', {
            signal: t(`reco.signal_${signal}`),
            ecart: isoler(`${signe}${formatLength(Math.abs(ecart), unitSystem)}`),
            distance: isoler(formatLength(distanceConseillee, unitSystem)),
          }),
        };
      }
    }
    return ligne;
  });
  const dernier = w.obstacles[w.obstacles.length - 1];
  const arrivee =
    dernier && w.pasJusquArrivee
      ? {
          intervalle: isoler(`${dernier.numero} → ${t('reco.finishLine')}`),
          distance: isoler(formatLength(w.pasJusquArrivee * w.longueurPas, unitSystem)),
        }
      : undefined;
  return {
    lignes,
    arrivee,
    longueur: isoler(formatLength(longueurTotale(w), unitSystem)),
    temps: t('reco.seconds', { value: isoler(formatNumber(tempsAccordeSecondes(w), 0)) }),
    vitesse: isoler(formatSpeed(w.speedMetersPerMinute, unitSystem)),
  };
}

/** Échappe un texte saisi par l'utilisateur (nom du concours, notes) avant de l'écrire en HTML. */
export function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Document HTML du récapitulatif (expo-print). `rtl` : arabe — le tableau garde ses nombres isolés. */
export function htmlReco(params: {
  titre: string;
  infos: [string, string][];
  entetes: string[];
  vue: VueReco;
  rtl: boolean;
  langue: string;
}): string {
  const e = echapperHtml;
  const { vue } = params;
  const lignes = vue.lignes
    .map(
      (l) => `<tr>
  <td class="n">${e(l.intervalle)}</td>
  <td>${e(l.type)}${l.hauteur ? ` · ${e(l.hauteur)}` : ''}</td>
  <td class="n">${e(String(l.pas))}</td>
  <td class="n">${e(l.distance)}</td>
  <td class="n">${l.theoriques ? e(l.theoriques) : ''}</td>
  <td class="n fort">${l.conseillees ? e(l.conseillees) : ''}${l.signal ? `<div class="signal ${l.signal.niveau}">${e(l.signal.texte)}</div>` : ''}</td>
  <td>${l.contrat ? e(l.contrat) : ''}</td>
  <td>${l.note ? e(l.note) : ''}</td>
</tr>`
    )
    .join('\n');
  const arrivee = vue.arrivee
    ? `<tr><td class="n">${e(vue.arrivee.intervalle)}</td><td></td><td></td><td class="n">${e(vue.arrivee.distance)}</td><td></td><td></td><td></td><td></td></tr>`
    : '';
  const infos = params.infos.map(([k, v]) => `<div><span class="k">${e(k)}</span> ${e(v)}</div>`).join('\n');
  return `<!DOCTYPE html>
<html lang="${e(params.langue)}" dir="${params.rtl ? 'rtl' : 'ltr'}">
<head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, Roboto, "Noto Sans", sans-serif; color: #3B2A20; margin: 28px; }
  h1 { font-size: 22px; margin: 0 0 12px; }
  .infos { display: flex; flex-wrap: wrap; gap: 6px 22px; font-size: 13px; margin-bottom: 16px; }
  .k { color: #8A6F5C; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #F3EDE0; text-align: start; padding: 6px; border-bottom: 2px solid #D9BE98; }
  td { padding: 6px; border-bottom: 1px solid #EDE0D0; vertical-align: top; }
  td.n { white-space: nowrap; }
  .fort { font-weight: 700; }
  .signal { font-weight: 400; font-size: 11px; }
  .court, .long { color: #B5675A; }
  .juste { color: #5E7A4A; }
</style></head>
<body>
<h1>${e(params.titre)}</h1>
<div class="infos">${infos}</div>
<table>
<thead><tr>${params.entetes.map((h) => `<th>${e(h)}</th>`).join('')}</tr></thead>
<tbody>
${lignes}
${arrivee}
</tbody>
</table>
</body></html>`;
}
