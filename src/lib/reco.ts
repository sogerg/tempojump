/**
 * Reco en marchant (1.1) — domaine pur, sans React ni stockage.
 *
 * Le cavalier marche le parcours ; à chaque obstacle il appuie sur « Obstacle » et l'app garde le
 * nombre de pas depuis le précédent. Tout le reste se déduit ici : distance (pas étalonné), foulées
 * théoriques et conseillées POUR LE CHEVAL choisi, numérotation 1, 2, 3, 4a/4b/4c, signal court/long
 * dans les combinaisons, longueur totale et temps accordé.
 *
 * Les formules équestres ne sont pas recopiées : elles viennent de mathUtils (effectiveStrideLength
 * via stepsToStrides et combinationDistance, allowedTime). Voir doc/cahier-des-charges-1.1-reco-en-marchant.md.
 */
import { allowedTime, combinationDistance, stepsToStrides } from './mathUtils';
import { EnvironmentAdjustments, Horse, ObstacleType, SpeedLevel, StrideMarker, Terrain } from '../types';

/** Un obstacle relevé pendant la reco (un élément d'une combinaison compte pour un obstacle). */
export interface CourseWalkObstacle {
  id: string;
  /** Numéro affiché : « 1 », « 2 », « 4a »… Recalculé par `numeroter` à chaque ajout/retrait. */
  numero: string;
  type: ObstacleType;
  /** Vrai si cet élément suit le précédent dans la même combinaison (4b après 4a). */
  enCombinaison: boolean;
  /** Hauteur en mètres, facultative. */
  hauteur?: number;
  /** Pas comptés depuis l'obstacle précédent (depuis le départ pour le premier). */
  pasDepuisPrecedent: number;
  /** Distance depuis le précédent, en mètres (pas × longueur de pas de la reco). */
  distanceMetres: number;
  /** Foulées conseillées pour le cheval de la reco ; absent pour le premier obstacle. */
  foulees?: number;
  /** Contrat de foulées choisi par le cavalier pour cet intervalle. */
  contrat?: number;
  note?: string;
}

/** Une reconnaissance de parcours (cahier §3.4). */
export interface CourseWalk {
  id: string;
  /** Date et heure de la reco, ISO. */
  date: string;
  eventName?: string;
  horseId: string;
  terrain: Terrain;
  speed: SpeedLevel;
  /** Vitesse imposée du barème (m/min), pour le temps accordé. */
  speedMetersPerMinute: number;
  /** Longueur de pas du cavalier (m) au moment de la reco : les distances restent stables si on
   * réétalonne plus tard. */
  longueurPas: number;
  obstacles: CourseWalkObstacle[];
  /** Pas entre le dernier obstacle et la ligne d'arrivée (comptés au moment de « Terminer »). */
  pasJusquArrivee?: number;
  /** Longueur totale en mètres (départ → arrivée). */
  longueurTotale: number;
  /** Faux tant que la reco n'est pas terminée : elle se reprend depuis l'historique. */
  terminee: boolean;
  planId?: string;
  journalEntryId?: string;
}

// ——— Vitesses du barème ———————————————————————————————————————————————————————————————

/** Vitesses proposées (m/min) — par défaut, à confirmer par l'utilisateur (cahier §7). */
export const VITESSES_BAREME = [300, 325, 350, 375, 400] as const;

/** Bornes de la vitesse libre et valeur de départ (défaut dans [min, max] : test dédié). */
export const VITESSE_BAREME = { defaut: 350, min: 150, max: 600 };

/** Bornes d'un nombre de pas saisi ou corrigé entre deux obstacles. */
export const PAS_INTERVALLE = { defaut: 0, min: 0, max: 999 };

/** Bornes de la hauteur facultative d'un obstacle (m). */
export const HAUTEUR_OBSTACLE = { defaut: 1.1, min: 0.3, max: 2.2 };

/** Bornes du contrat de foulées d'un intervalle. */
export const CONTRAT_FOULEES = { defaut: 5, min: 0, max: 30 };

/** Nombre maximal d'éléments d'une combinaison (triple). */
export const ELEMENTS_COMBINAISON_MAX = 3;

/** Écart (m) au-delà duquel une distance de combinaison est signalée courte ou longue. */
export const TOLERANCE_COMBINAISON_M = 0.3;

/** Vrai si la vitesse libre est acceptable. */
export function vitesseValide(v: number): boolean {
  return Number.isFinite(v) && v >= VITESSE_BAREME.min && v <= VITESSE_BAREME.max;
}

/** Ramène un nombre de pas dans ses bornes, entier. */
export function bornerPas(pas: number): number {
  if (!Number.isFinite(pas)) return 0;
  return Math.min(PAS_INTERVALLE.max, Math.max(PAS_INTERVALLE.min, Math.round(pas)));
}

// ——— Calculs ———————————————————————————————————————————————————————————————————————————

/** Distance (m) parcourue en `pas` pas, au pas étalonné du cavalier. */
export function pasEnMetres(pas: number, longueurPas: number): number {
  if (!(pas > 0) || !(longueurPas > 0)) return 0;
  return pas * longueurPas;
}

/** Arrondit une distance au centimètre (ce que l'on stocke et affiche). */
export function arrondiCm(metres: number): number {
  return Math.round(metres * 100) / 100;
}

/**
 * Numérotation des obstacles : 1, 2, 3, puis 4a, 4b, 4c pour une combinaison. `enCombinaison[i]`
 * dit si l'obstacle i suit le précédent dans la même combinaison (ignoré pour le premier).
 */
export function numeroter(enCombinaison: boolean[]): string[] {
  // Regroupe d'abord en obstacles numérotés (un groupe = un numéro).
  const groupes: number[] = [];
  enCombinaison.forEach((suit, i) => {
    if (i > 0 && suit) groupes[groupes.length - 1]++;
    else groupes.push(1);
  });
  const numeros: string[] = [];
  groupes.forEach((taille, g) => {
    const n = String(g + 1);
    if (taille === 1) numeros.push(n);
    else for (let k = 0; k < taille; k++) numeros.push(n + String.fromCharCode(97 + k));
  });
  return numeros;
}

/** Nombre d'éléments de la combinaison qui se termine par le dernier obstacle de la liste. */
export function tailleCombinaisonCourante(obstacles: Pick<CourseWalkObstacle, 'enCombinaison'>[]): number {
  if (obstacles.length === 0) return 0;
  let n = 1;
  for (let i = obstacles.length - 1; i > 0 && obstacles[i].enCombinaison; i--) n++;
  return n;
}

/** Vrai si on peut encore ajouter un élément à la combinaison en cours (après un obstacle, < triple). */
export function peutAjouterElement(obstacles: Pick<CourseWalkObstacle, 'enCombinaison'>[]): boolean {
  return obstacles.length > 0 && tailleCombinaisonCourante(obstacles) < ELEMENTS_COMBINAISON_MAX;
}

export type SignalCombinaison = 'court' | 'juste' | 'long';

/** Ce que l'app dit d'un intervalle, pour un cheval donné. */
export interface Intervalle {
  distanceMetres: number;
  fouleesTheoriques: number;
  fouleesConseillees: number;
  /** Pour un élément de combinaison seulement. */
  combinaison?: {
    /** Distance conseillée (combinationDistance) pour `fouleesConseillees` foulées. */
    distanceConseillee: number;
    /** Distance mesurée − distance conseillée (m) : négatif = court. */
    ecart: number;
    signal: SignalCombinaison;
  };
}

/**
 * Hauteur prise pour l'intervalle : la plus haute des deux barres (à défaut 0, ce qui donne
 * l'allocation « amplitude » de fixedAllowanceForHeight, celle des barres sous 1,15 m).
 */
function hauteurIntervalle(precedent: CourseWalkObstacle, courant: CourseWalkObstacle): number {
  return Math.max(precedent.hauteur ?? 0, courant.hauteur ?? 0);
}

/**
 * Foulées de l'intervalle qui mène à `obstacles[index]` (rien pour le premier obstacle).
 * - Ligne : stepsToStrides (foulées théoriques, arrondi = conseillées).
 * - Combinaison : nombre de foulées dont la distance conseillée (combinationDistance, avec le
 *   bonus vertical/oxer) est la plus proche de la distance mesurée, puis écart et signal.
 */
export function calculerIntervalle(
  obstacles: CourseWalkObstacle[],
  index: number,
  longueurPas: number,
  horse: Horse,
  env: EnvironmentAdjustments
): Intervalle | null {
  if (index <= 0 || index >= obstacles.length) return null;
  const precedent = obstacles[index - 1];
  const courant = obstacles[index];
  const hauteur = hauteurIntervalle(precedent, courant);
  const ligne = stepsToStrides(courant.pasDepuisPrecedent, longueurPas, horse, hauteur, env);
  const distanceMetres = ligne.distanceMeters;

  if (!courant.enCombinaison) {
    return {
      distanceMetres,
      fouleesTheoriques: ligne.theoreticalStrides,
      fouleesConseillees: ligne.suggestedStrides,
    };
  }

  // Dans une combinaison : 0 (saut de puce), 1 ou 2 foulées, au plus près de la distance mesurée.
  let meilleur = { n: 0, distance: Infinity };
  for (let n = 0; n <= 3; n++) {
    const d = combinationDistance(n, precedent.type, courant.type, hauteur, horse, env).distanceMeters;
    if (Math.abs(distanceMetres - d) < Math.abs(distanceMetres - meilleur.distance)) meilleur = { n, distance: d };
  }
  const ecart = distanceMetres - meilleur.distance;
  const signal: SignalCombinaison =
    ecart < -TOLERANCE_COMBINAISON_M ? 'court' : ecart > TOLERANCE_COMBINAISON_M ? 'long' : 'juste';
  return {
    distanceMetres,
    fouleesTheoriques: ligne.theoreticalStrides,
    fouleesConseillees: meilleur.n,
    combinaison: { distanceConseillee: meilleur.distance, ecart, signal },
  };
}

/** Longueur totale (m) : tous les intervalles, approche du premier obstacle et fin comprises. */
export function longueurTotale(walk: Pick<CourseWalk, 'obstacles' | 'pasJusquArrivee' | 'longueurPas'>): number {
  const pas = walk.obstacles.reduce((s, o) => s + Math.max(0, o.pasDepuisPrecedent), 0) + Math.max(0, walk.pasJusquArrivee ?? 0);
  return arrondiCm(pasEnMetres(pas, walk.longueurPas));
}

/** Temps accordé (s) de la reco, à la vitesse du barème choisie. */
export function tempsAccorde(walk: Pick<CourseWalk, 'obstacles' | 'pasJusquArrivee' | 'longueurPas' | 'speedMetersPerMinute'>): number {
  return allowedTime(longueurTotale(walk), walk.speedMetersPerMinute);
}

/** Temps accordé arrondi à la seconde supérieure (usage des barèmes : on ne retire jamais de temps). */
export function tempsAccordeSecondes(walk: Pick<CourseWalk, 'obstacles' | 'pasJusquArrivee' | 'longueurPas' | 'speedMetersPerMinute'>): number {
  return Math.ceil(tempsAccorde(walk) - 1e-9);
}

/**
 * Recalcule tout ce qui se déduit des pas : numéros, distances, foulées conseillées (pour le cheval
 * donné), longueur totale. À appeler après chaque ajout, retrait ou correction.
 */
export function recalculer(walk: CourseWalk, horse: Horse): CourseWalk {
  const numeros = numeroter(walk.obstacles.map((o) => o.enCombinaison));
  const env: EnvironmentAdjustments = { terrain: walk.terrain, speed: walk.speed };
  const base = walk.obstacles.map((o, i) => ({
    ...o,
    enCombinaison: i === 0 ? false : o.enCombinaison,
    numero: numeros[i],
    pasDepuisPrecedent: bornerPas(o.pasDepuisPrecedent),
    distanceMetres: arrondiCm(pasEnMetres(bornerPas(o.pasDepuisPrecedent), walk.longueurPas)),
  }));
  const obstacles = base.map((o, i) => {
    const intervalle = calculerIntervalle(base, i, walk.longueurPas, horse, env);
    return { ...o, foulees: intervalle ? intervalle.fouleesConseillees : undefined };
  });
  const suivant = { ...walk, horseId: horse.id, obstacles };
  return { ...suivant, longueurTotale: longueurTotale(suivant) };
}

/** Ajoute un obstacle à la fin (nouvel obstacle ou élément de la combinaison en cours). */
export function ajouterObstacle(
  walk: CourseWalk,
  horse: Horse,
  obstacle: { id: string; pas: number; type: ObstacleType; enCombinaison: boolean; hauteur?: number }
): CourseWalk {
  const enCombinaison = obstacle.enCombinaison && peutAjouterElement(walk.obstacles);
  const nouveau: CourseWalkObstacle = {
    id: obstacle.id,
    numero: '',
    type: obstacle.type,
    enCombinaison,
    hauteur: obstacle.hauteur,
    pasDepuisPrecedent: bornerPas(obstacle.pas),
    distanceMetres: 0,
  };
  return recalculer({ ...walk, obstacles: [...walk.obstacles, nouveau] }, horse);
}

/** Retire le dernier obstacle (« Annuler le dernier ») ; rend aussi ses pas, à recompter. */
export function annulerDernier(walk: CourseWalk, horse: Horse): { walk: CourseWalk; pasRendus: number } {
  const dernier = walk.obstacles[walk.obstacles.length - 1];
  if (!dernier) return { walk, pasRendus: 0 };
  return {
    walk: recalculer({ ...walk, obstacles: walk.obstacles.slice(0, -1) }, horse),
    pasRendus: dernier.pasDepuisPrecedent,
  };
}

/** Modifie un obstacle (type, hauteur, pas corrigés, contrat, note) puis recalcule. */
export function modifierObstacle(
  walk: CourseWalk,
  horse: Horse,
  id: string,
  changement: Partial<Pick<CourseWalkObstacle, 'type' | 'hauteur' | 'pasDepuisPrecedent' | 'contrat' | 'note'>>
): CourseWalk {
  return recalculer(
    { ...walk, obstacles: walk.obstacles.map((o) => (o.id === id ? { ...o, ...changement } : o)) },
    horse
  );
}

/** Nouvelle reco vide. */
export function nouvelleReco(params: {
  id: string;
  date: string;
  horse: Horse;
  terrain: Terrain;
  speed: SpeedLevel;
  speedMetersPerMinute: number;
  longueurPas: number;
  eventName?: string;
}): CourseWalk {
  const nom = params.eventName?.trim();
  return {
    id: params.id,
    date: params.date,
    eventName: nom ? nom : undefined,
    horseId: params.horse.id,
    terrain: params.terrain,
    speed: params.speed,
    speedMetersPerMinute: params.speedMetersPerMinute,
    longueurPas: params.longueurPas,
    obstacles: [],
    longueurTotale: 0,
    terminee: false,
  };
}

/** Copie d'une reco (même parcours, nouvelle date, sans lien vers le carnet). */
export function dupliquerReco(walk: CourseWalk, id: string, date: string, idObstacle: (i: number) => string): CourseWalk {
  return {
    ...walk,
    id,
    date,
    journalEntryId: undefined,
    obstacles: walk.obstacles.map((o, i) => ({ ...o, id: idObstacle(i) })),
  };
}

/** Recos triées de la plus récente à la plus ancienne, filtrées par cheval si demandé. */
export function trierEtFiltrer(walks: CourseWalk[], horseId: string | null): CourseWalk[] {
  return walks
    .filter((w) => !horseId || w.horseId === horseId)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

// ——— Plan photographié ——————————————————————————————————————————————————————————————

/**
 * Repères 1…n d'une reco à poser sur un plan (StrideMarker, coordonnées en fraction de la photo).
 * Ceux qui existent déjà (même libellé) sont gardés à leur place ; les autres sont alignés en haut
 * de la photo, 6 par rangée, prêts à être glissés sur leurs obstacles.
 */
export function reperesPourPlan(existants: StrideMarker[], numeros: string[], genererId: () => string): StrideMarker[] {
  const deja = new Set(existants.map((m) => m.label));
  const manquants = numeros.filter((n) => !deja.has(n));
  const nouveaux = manquants.map((label, i) => ({
    id: genererId(),
    label,
    x: 0.1 + (i % 6) * 0.16,
    y: Math.min(0.92, 0.08 + Math.floor(i / 6) * 0.1),
  }));
  return [...existants, ...nouveaux];
}

// ——— Lecture du stockage ———————————————————————————————————————————————————————————————

const TERRAINS: Terrain[] = ['Plat', 'Montant', 'Descendant', 'Lourd'];
const VITESSES: SpeedLevel[] = ['Standard', 'Elite'];
const TYPES: ObstacleType[] = ['Vertical', 'Oxer'];

const nombre = (v: unknown, defaut: number) => (typeof v === 'number' && Number.isFinite(v) ? v : defaut);
const texte = (v: unknown) => (typeof v === 'string' && v.trim() ? v : undefined);

/**
 * Relit les recos enregistrées. Tolère une absence (données d'une version sans recos : liste vide),
 * un JSON abîmé, et des champs manquants (valeurs sûres plutôt qu'un écran blanc).
 */
export function parseCourseWalks(raw: string | null): CourseWalk[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data
    .filter((w): w is Record<string, unknown> => !!w && typeof w === 'object' && typeof (w as { id?: unknown }).id === 'string')
    .map((w) => {
      const obstaclesBruts = Array.isArray(w.obstacles) ? (w.obstacles as Record<string, unknown>[]) : [];
      const obstacles: CourseWalkObstacle[] = obstaclesBruts
        .filter((o) => !!o && typeof o === 'object')
        .map((o, i) => ({
          id: typeof o.id === 'string' ? o.id : `${String(w.id)}-${i}`,
          numero: typeof o.numero === 'string' ? o.numero : String(i + 1),
          type: TYPES.includes(o.type as ObstacleType) ? (o.type as ObstacleType) : 'Vertical',
          enCombinaison: i > 0 && o.enCombinaison === true,
          hauteur: typeof o.hauteur === 'number' && o.hauteur > 0 ? o.hauteur : undefined,
          pasDepuisPrecedent: bornerPas(nombre(o.pasDepuisPrecedent, 0)),
          distanceMetres: nombre(o.distanceMetres, 0),
          foulees: typeof o.foulees === 'number' ? o.foulees : undefined,
          contrat: typeof o.contrat === 'number' ? o.contrat : undefined,
          note: texte(o.note),
        }));
      const vitesse = nombre(w.speedMetersPerMinute, VITESSE_BAREME.defaut);
      return {
        id: w.id as string,
        date: typeof w.date === 'string' ? w.date : new Date(0).toISOString(),
        eventName: texte(w.eventName),
        horseId: typeof w.horseId === 'string' ? w.horseId : '',
        terrain: TERRAINS.includes(w.terrain as Terrain) ? (w.terrain as Terrain) : 'Plat',
        speed: VITESSES.includes(w.speed as SpeedLevel) ? (w.speed as SpeedLevel) : 'Standard',
        speedMetersPerMinute: vitesseValide(vitesse) ? vitesse : VITESSE_BAREME.defaut,
        longueurPas: nombre(w.longueurPas, 1) > 0 ? nombre(w.longueurPas, 1) : 1,
        obstacles,
        pasJusquArrivee: typeof w.pasJusquArrivee === 'number' ? bornerPas(w.pasJusquArrivee) : undefined,
        longueurTotale: nombre(w.longueurTotale, 0),
        terminee: w.terminee !== false,
        planId: texte(w.planId),
        journalEntryId: texte(w.journalEntryId),
      };
    });
}
