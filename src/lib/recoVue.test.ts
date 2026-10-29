// Reco 1.1 : chaque langue a toutes les chaînes de la reco, aucune clé brute ne s'affiche
// (récapitulatif, fiche « dernier regard », PDF), et l'arabe garde « 1 → 2 » et les distances
// de gauche à droite (isolement LRI … PDI).
import i18n from '../i18n';
import { ajouterObstacle, modifierObstacle, nouvelleReco, recalculer } from './reco';
import { echapperHtml, htmlReco, isolerIntervalle, vueReco } from './recoVue';

const cheval = { id: 'h1', name: 'Voltigeur', withersHeight: 160 };
let w = nouvelleReco({ id: 'w', date: '2026-10-28T09:00:00.000Z', horse: cheval, terrain: 'Plat', speed: 'Standard', speedMetersPerMinute: 350, longueurPas: 0.9 });
w = ajouterObstacle(w, cheval, { id: 'a', pas: 20, type: 'Vertical', enCombinaison: false, hauteur: 1.2 });
w = ajouterObstacle(w, cheval, { id: 'b', pas: 30, type: 'Vertical', enCombinaison: false, hauteur: 1.2 });
w = ajouterObstacle(w, cheval, { id: 'c', pas: 7, type: 'Oxer', enCombinaison: true, hauteur: 1.2 });
w = modifierObstacle(w, cheval, 'b', { contrat: 7, note: 'ombre <b>&</b> "piège"' });
w = recalculer({ ...w, pasJusquArrivee: 12, terminee: true }, cheval);

const donnees = i18n.store.data as Record<string, { translation: Record<string, Record<string, string>> }>;
const langues = Object.keys(donnees);
const clesFr = Object.keys(donnees.fr.translation.reco).sort();

afterAll(() => i18n.changeLanguage('fr'));

describe.each(langues)('reco en %s', (langue) => {
  test('toutes les chaînes de la reco sont traduites', () => {
    expect(Object.keys(donnees[langue].translation.reco ?? {}).sort()).toEqual(clesFr);
    expect(donnees[langue].translation.nav.recos).toBeTruthy();
    expect(donnees[langue].translation.nav.recoWalk).toBeTruthy();
  });

  test('aucune clé brute dans le récapitulatif ni dans le PDF', async () => {
    await i18n.changeLanguage(langue);
    const vue = vueReco(w, cheval, 'metric', i18n.t);
    expect(vue.lignes.map((l) => l.intervalle)).toHaveLength(3);
    expect(vue.lignes[2].signal?.niveau).toBe('court');
    const html = htmlReco({ titre: i18n.t('reco.pdfTitle'), infos: [[i18n.t('reco.dateLabel'), 'x']], entetes: [i18n.t('reco.colSteps')], vue, rtl: langue === 'ar', langue });
    const tout = JSON.stringify(vue) + html;
    expect(tout).not.toMatch(/\b(reco|exercises|nav)\.[a-zA-Z_]+/);
    expect(tout).not.toContain('{{');
    // Note saisie : échappée, jamais interprétée comme du HTML.
    expect(html).toContain('ombre &lt;b&gt;&amp;&lt;/b&gt; &quot;piège&quot;');
    expect(html).not.toContain('<b>&</b>');
    if (langue === 'ar') {
      expect(html).toContain('dir="rtl"');
      expect(vue.lignes[1].intervalle).toBe('⁦⁦1⁩ → ⁦2a⁩⁩');
    }
  });
});

test('échappement HTML', () => {
  expect(echapperHtml(`<script>alert('x')</script>`)).toBe('&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;');
});

describe('défauts vus au S24 le 28/10', () => {
  test('« départ → 1 » : chaque bout est isolé, sinon l’arabe retourne la ligne', () => {
    expect(isolerIntervalle('البداية', '1')).toBe('⁦⁦البداية⁩ → ⁦1⁩⁩');
  });

  test('un intervalle plus court qu’une foulée n’affiche pas de foulées théoriques négatives', async () => {
    await i18n.changeLanguage('fr');
    let court = nouvelleReco({ id: 'x', date: '2026-10-28T09:00:00.000Z', horse: cheval, terrain: 'Plat', speed: 'Standard', speedMetersPerMinute: 350, longueurPas: 0.85 });
    court = ajouterObstacle(court, cheval, { id: 'a', pas: 20, type: 'Vertical', enCombinaison: false });
    court = ajouterObstacle(court, cheval, { id: 'b', pas: 1, type: 'Vertical', enCombinaison: false });
    const vue = vueReco(court, cheval, 'metric', i18n.t);
    expect(vue.lignes[1].theoriques).not.toMatch(/[-−]/);
  });
});
