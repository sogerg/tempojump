import {
  CONTRAT_FOULEES,
  CourseWalk,
  HAUTEUR_OBSTACLE,
  PAS_INTERVALLE,
  VITESSES_BAREME,
  VITESSE_BAREME,
  ajouterObstacle,
  annulerDernier,
  arrondiCm,
  calculerIntervalle,
  dupliquerReco,
  longueurTotale,
  modifierObstacle,
  nouvelleReco,
  numeroter,
  parseCourseWalks,
  pasEnMetres,
  peutAjouterElement,
  recalculer,
  tempsAccorde,
  tempsAccordeSecondes,
  trierEtFiltrer,
  vitesseValide,
} from './reco';
import { allowedTime, stepsToStrides } from './mathUtils';
import { lireNombre } from './units';
import { Horse } from '../types';

const cheval: Horse = { id: 'h1', name: 'Voltigeur', withersHeight: 160 }; // foulée 3,51 m (plat, standard)
const poney: Horse = { id: 'h2', name: 'Poney', withersHeight: 130 };

let n = 0;
const id = () => `o${++n}`;

function reco(longueurPas = 1): CourseWalk {
  return nouvelleReco({
    id: 'w1',
    date: '2026-10-28T09:00:00.000Z',
    horse: cheval,
    terrain: 'Plat',
    speed: 'Standard',
    speedMetersPerMinute: 350,
    longueurPas,
    eventName: '  Grand Prix de Lamotte  ',
  });
}

describe('pas → distance', () => {
  it('multiplie par le pas étalonné', () => {
    expect(pasEnMetres(24, 0.92)).toBeCloseTo(22.08, 6);
  });
  it('rend 0 pour une saisie absurde', () => {
    expect(pasEnMetres(-3, 1)).toBe(0);
    expect(pasEnMetres(10, 0)).toBe(0);
    expect(pasEnMetres(NaN, 1)).toBe(0);
  });
  it('arrondit au centimètre', () => {
    expect(arrondiCm(22.0849)).toBe(22.08);
    expect(arrondiCm(22.085)).toBe(22.09);
  });
});

describe('numérotation', () => {
  it('1, 2, 3 pour des obstacles isolés', () => {
    expect(numeroter([false, false, false])).toEqual(['1', '2', '3']);
  });
  it('4a/4b/4c pour une triple, puis on reprend à 5', () => {
    expect(numeroter([false, false, false, false, true, true, false])).toEqual(['1', '2', '3', '4a', '4b', '4c', '5']);
  });
  it('ignore « en combinaison » sur le premier obstacle', () => {
    expect(numeroter([true, true])).toEqual(['1a', '1b']);
    expect(numeroter([])).toEqual([]);
  });
  it('limite une combinaison à trois éléments', () => {
    let w = reco();
    w = ajouterObstacle(w, cheval, { id: id(), pas: 10, type: 'Vertical', enCombinaison: false });
    w = ajouterObstacle(w, cheval, { id: id(), pas: 8, type: 'Oxer', enCombinaison: true });
    w = ajouterObstacle(w, cheval, { id: id(), pas: 11, type: 'Vertical', enCombinaison: true });
    expect(peutAjouterElement(w.obstacles)).toBe(false);
    w = ajouterObstacle(w, cheval, { id: id(), pas: 8, type: 'Vertical', enCombinaison: true });
    expect(w.obstacles.map((o) => o.numero)).toEqual(['1a', '1b', '1c', '2']);
  });
});

describe('foulées pour le cheval', () => {
  it('ligne : réutilise stepsToStrides (24 m, 1,10 m → 5,84 théoriques, 6 conseillées)', () => {
    let w = reco();
    w = ajouterObstacle(w, cheval, { id: id(), pas: 30, type: 'Vertical', enCombinaison: false, hauteur: 1.1 });
    w = ajouterObstacle(w, cheval, { id: id(), pas: 24, type: 'Oxer', enCombinaison: false, hauteur: 1.1 });
    const i = calculerIntervalle(w.obstacles, 1, 1, cheval, { terrain: 'Plat', speed: 'Standard' })!;
    expect(i.distanceMetres).toBeCloseTo(24, 6);
    expect(i.fouleesTheoriques).toBeCloseTo((24 - 3.51) / 3.51, 4);
    expect(i.fouleesConseillees).toBe(6);
    expect(i.combinaison).toBeUndefined();
    expect(w.obstacles[1].foulees).toBe(6);
    expect(w.obstacles[0].foulees).toBeUndefined();
    const ref = stepsToStrides(24, 1, cheval, 1.1, { terrain: 'Plat', speed: 'Standard' });
    expect(i.fouleesConseillees).toBe(ref.suggestedStrides);
  });

  it('prend la plus haute des deux barres', () => {
    let w = reco();
    w = ajouterObstacle(w, cheval, { id: id(), pas: 10, type: 'Vertical', enCombinaison: false, hauteur: 1.3 });
    w = ajouterObstacle(w, cheval, { id: id(), pas: 24, type: 'Vertical', enCombinaison: false });
    const i = calculerIntervalle(w.obstacles, 1, 1, cheval, { terrain: 'Plat', speed: 'Standard' })!;
    expect(i.fouleesTheoriques).toBeCloseTo((24 - 3.9) / 3.51, 4);
  });

  it('change avec le cheval : recalcul pour une autre monture', () => {
    let w = reco();
    w = ajouterObstacle(w, cheval, { id: id(), pas: 10, type: 'Vertical', enCombinaison: false });
    w = ajouterObstacle(w, cheval, { id: id(), pas: 28, type: 'Vertical', enCombinaison: false });
    const pourPoney = recalculer(w, poney);
    expect(pourPoney.horseId).toBe('h2');
    const env = { terrain: 'Plat' as const, speed: 'Standard' as const };
    expect(pourPoney.obstacles[1].foulees).toBe(stepsToStrides(28, 1, poney, 0, env).suggestedStrides);
    expect(calculerIntervalle(pourPoney.obstacles, 1, 1, poney, env)!.fouleesTheoriques).not.toBeCloseTo(
      calculerIntervalle(w.obstacles, 1, 1, cheval, env)!.fouleesTheoriques,
      2
    );
    expect(pourPoney.obstacles[1].distanceMetres).toBe(w.obstacles[1].distanceMetres);
  });

  describe('combinaison (vertical → oxer, 1,20 m : 7,26 m pour 1 foulée)', () => {
    const avec = (pas: number, longueurPas: number) => {
      let w = reco(longueurPas);
      w = ajouterObstacle(w, cheval, { id: id(), pas: 10, type: 'Vertical', enCombinaison: false, hauteur: 1.2 });
      w = ajouterObstacle(w, cheval, { id: id(), pas, type: 'Oxer', enCombinaison: true, hauteur: 1.2 });
      return calculerIntervalle(w.obstacles, 1, longueurPas, cheval, { terrain: 'Plat', speed: 'Standard' })!;
    };
    it('juste à 7,20 m', () => {
      const i = avec(8, 0.9);
      expect(i.fouleesConseillees).toBe(1);
      expect(i.combinaison!.distanceConseillee).toBeCloseTo(7.26, 4);
      expect(i.combinaison!.ecart).toBeCloseTo(-0.06, 4);
      expect(i.combinaison!.signal).toBe('juste');
    });
    it('court à 6 m', () => {
      const i = avec(6, 1);
      expect(i.fouleesConseillees).toBe(1);
      expect(i.combinaison!.signal).toBe('court');
    });
    it('long à 9 m (entre 1 et 2 foulées)', () => {
      const i = avec(10, 0.9);
      expect(i.combinaison!.signal).toBe('long');
    });
    it('2 foulées à 10,80 m', () => {
      const i = avec(12, 0.9);
      expect(i.fouleesConseillees).toBe(2);
      expect(i.combinaison!.signal).toBe('juste');
    });
  });
});

describe('longueur totale et temps accordé', () => {
  it('additionne l’approche, les intervalles et la fin', () => {
    let w = reco(0.9);
    w = ajouterObstacle(w, cheval, { id: id(), pas: 20, type: 'Vertical', enCombinaison: false });
    w = ajouterObstacle(w, cheval, { id: id(), pas: 30, type: 'Oxer', enCombinaison: false });
    w = recalculer({ ...w, pasJusquArrivee: 15 }, cheval);
    expect(w.longueurTotale).toBeCloseTo(58.5, 6);
    expect(longueurTotale(w)).toBeCloseTo(58.5, 6);
  });
  it('temps accordé = allowedTime, arrondi à la seconde supérieure', () => {
    const w = { obstacles: [{ pasDepuisPrecedent: 400 }], pasJusquArrivee: 20, longueurPas: 1, speedMetersPerMinute: 350 } as unknown as CourseWalk;
    expect(tempsAccorde(w)).toBeCloseTo(allowedTime(420, 350), 6);
    expect(tempsAccorde(w)).toBeCloseTo(72, 6);
    expect(tempsAccordeSecondes(w)).toBe(72);
    expect(tempsAccordeSecondes({ ...w, speedMetersPerMinute: 325 })).toBe(78); // 77,54 s
  });
});

describe('édition pendant la marche', () => {
  it('annuler le dernier rend ses pas et renumérote', () => {
    let w = reco();
    w = ajouterObstacle(w, cheval, { id: id(), pas: 12, type: 'Vertical', enCombinaison: false });
    w = ajouterObstacle(w, cheval, { id: id(), pas: 9, type: 'Oxer', enCombinaison: true });
    const r = annulerDernier(w, cheval);
    expect(r.pasRendus).toBe(9);
    expect(r.walk.obstacles.map((o) => o.numero)).toEqual(['1']);
    expect(annulerDernier(r.walk, cheval).walk.obstacles).toEqual([]);
    expect(annulerDernier(reco(), cheval).pasRendus).toBe(0);
  });
  it('corriger les pas, le type, le contrat, la note', () => {
    let w = reco();
    w = ajouterObstacle(w, cheval, { id: 'a', pas: 12, type: 'Vertical', enCombinaison: false });
    w = ajouterObstacle(w, cheval, { id: 'b', pas: 24, type: 'Vertical', enCombinaison: false });
    w = modifierObstacle(w, cheval, 'b', { pasDepuisPrecedent: 25, contrat: 6, note: 'abord en courbe à gauche', type: 'Oxer' });
    expect(w.obstacles[1]).toMatchObject({ pasDepuisPrecedent: 25, distanceMetres: 25, contrat: 6, note: 'abord en courbe à gauche', type: 'Oxer' });
    w = modifierObstacle(w, cheval, 'b', { pasDepuisPrecedent: -4 });
    expect(w.obstacles[1].pasDepuisPrecedent).toBe(0);
  });
  it('nettoie le nom du concours', () => {
    expect(reco().eventName).toBe('Grand Prix de Lamotte');
    expect(nouvelleReco({ ...{ id: 'x', date: 'd', horse: cheval, terrain: 'Plat', speed: 'Standard', speedMetersPerMinute: 350, longueurPas: 1 }, eventName: '   ' }).eventName).toBeUndefined();
  });
});

describe('historique', () => {
  it('dupliquer garde le parcours, change les identifiants, oublie le carnet', () => {
    let w: CourseWalk = { ...reco(), journalEntryId: 'j1', planId: 'p1' };
    w = ajouterObstacle(w, cheval, { id: 'a', pas: 12, type: 'Vertical', enCombinaison: false });
    const copie = dupliquerReco(w, 'w2', '2026-10-29T08:00:00.000Z', (i) => `c${i}`);
    expect(copie.id).toBe('w2');
    expect(copie.journalEntryId).toBeUndefined();
    expect(copie.planId).toBe('p1');
    expect(copie.obstacles[0].id).toBe('c0');
    expect(copie.obstacles[0].pasDepuisPrecedent).toBe(12);
  });
  it('trie par date décroissante et filtre par cheval', () => {
    const a = { ...reco(), id: 'a', date: '2026-10-01T10:00:00.000Z' };
    const b = { ...reco(), id: 'b', date: '2026-10-20T10:00:00.000Z', horseId: 'h2' };
    const c = { ...reco(), id: 'c', date: '2026-10-10T10:00:00.000Z' };
    expect(trierEtFiltrer([a, b, c], null).map((w) => w.id)).toEqual(['b', 'c', 'a']);
    expect(trierEtFiltrer([a, b, c], 'h1').map((w) => w.id)).toEqual(['c', 'a']);
  });
});

describe('relecture du stockage', () => {
  it('données d’une version sans recos : liste vide', () => {
    expect(parseCourseWalks(null)).toEqual([]);
    expect(parseCourseWalks('')).toEqual([]);
    expect(parseCourseWalks('{abîmé')).toEqual([]);
    expect(parseCourseWalks('{"pas":"une liste"}')).toEqual([]);
  });
  it('aller-retour sans perte', () => {
    let w: CourseWalk = { ...reco(), planId: 'p1' };
    w = ajouterObstacle(w, cheval, { id: 'a', pas: 12, type: 'Vertical', enCombinaison: false, hauteur: 1.15 });
    w = ajouterObstacle(w, cheval, { id: 'b', pas: 8, type: 'Oxer', enCombinaison: true });
    w = modifierObstacle(w, cheval, 'b', { contrat: 1, note: 'attention ombre' });
    expect(parseCourseWalks(JSON.stringify([w]))).toEqual([w]);
  });
  it('champs manquants ou faux : valeurs sûres', () => {
    const [w] = parseCourseWalks(JSON.stringify([{ id: 'v', speedMetersPerMinute: 9999, obstacles: [{ pasDepuisPrecedent: 'x', type: 'Mur', enCombinaison: true }] }]));
    expect(w.speedMetersPerMinute).toBe(VITESSE_BAREME.defaut);
    expect(w.terrain).toBe('Plat');
    expect(w.terminee).toBe(true);
    expect(w.obstacles[0]).toMatchObject({ type: 'Vertical', enCombinaison: false, pasDepuisPrecedent: 0 });
  });
});

describe('défauts dans les limites', () => {
  it.each([
    ['vitesse du barème', VITESSE_BAREME],
    ['pas entre deux obstacles', PAS_INTERVALLE],
    ['hauteur', HAUTEUR_OBSTACLE],
    ['contrat de foulées', CONTRAT_FOULEES],
  ])('%s', (_nom, borne) => {
    expect(borne.defaut).toBeGreaterThanOrEqual(borne.min);
    expect(borne.defaut).toBeLessThanOrEqual(borne.max);
  });
  it('les vitesses proposées sont valides, et 350 m/min est dans la liste', () => {
    VITESSES_BAREME.forEach((v) => expect(vitesseValide(v)).toBe(true));
    expect(VITESSES_BAREME).toContain(VITESSE_BAREME.defaut);
    expect(vitesseValide(100)).toBe(false);
    expect(vitesseValide(NaN)).toBe(false);
  });
});

describe('saisie avec virgule (lireNombre)', () => {
  it.each([
    ['1,10', 1.1],
    ['1.10', 1.1],
    [' 362,5 ', 362.5],
    ['٣٥٠', 350],
    ['١٫٢', 1.2],
    ['24', 24],
    [',5', 0.5],
  ])('« %s » → %d', (t, v) => {
    expect(lireNombre(t)).toBeCloseTo(v, 9);
  });
  it.each(['', '  ', 'abc', '1,2,3', '1..2', '12m'])('« %s » → NaN (jamais un nombre tronqué)', (t) => {
    expect(Number.isNaN(lireNombre(t))).toBe(true);
  });
});
