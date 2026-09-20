// La période gratuite gérée par l'app. Pure, sans import natif : le contexte qui la persiste est
// à côté, dans `context/TrialContext.tsx`.
//
// POURQUOI UNE PÉRIODE GÉRÉE PAR L'APP, ET NON L'ESSAI D'APPLE
// L'« essai gratuit » d'Apple est une offre d'introduction : l'utilisateur doit S'ABONNER le
// premier jour pour en bénéficier, puis il est prélevé au bout d'un mois s'il n'annule pas. Le
// paywall est donc obligatoire dès l'ouverture — c'est ce que l'app faisait, et c'est agressif.
// Ici, l'app est entière pendant 30 jours à partir de la première ouverture, sans rien demander ;
// le paywall n'apparaît qu'à l'expiration, et bloque alors tout. L'offre d'introduction Apple est
// retirée le jour où cette version est en ligne — pas avant, sinon la version en ligne promet un
// essai qui n'existe plus.

export const TRIAL_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface TrialStatus {
  /** Jours entiers restants, arrondis au supérieur : le dernier jour compte pour 1. */
  daysLeft: number;
  active: boolean;
}

/**
 * Où en est la période gratuite, à partir de la date de première ouverture.
 *
 * `firstLaunchAt` absent ou illisible vaut « commence maintenant » : un trousseau vide est le cas
 * normal de la première ouverture, et un trousseau cassé ne doit pas bloquer l'app au lancement.
 *
 * ⚠️ L'HORLOGE DU TÉLÉPHONE SE RECULE. Sans garde-fou, reculer la date d'un mois rallonge le mois
 * gratuit d'autant — c'est le contournement le plus simple qui soit. `lastSeenAt` est la date la
 * plus tardive que l'app a jamais vue (persistée à chaque ouverture) : le temps écoulé se calcule
 * sur max(now, lastSeenAt), donc il ne peut jamais diminuer. Une horloge reculée ne rallonge rien ;
 * une horloge avancée puis remise à l'heure ne bloque personne — le compteur s'arrête, sans reculer.
 */
export function trialStatus(
  firstLaunchAt: number | null | undefined,
  now = Date.now(),
  lastSeenAt?: number | null
): TrialStatus {
  const seen = Number.isFinite(lastSeenAt) && (lastSeenAt as number) > 0 ? (lastSeenAt as number) : 0;
  const effectiveNow = Math.max(now, seen);
  const start = Number.isFinite(firstLaunchAt) && (firstLaunchAt as number) > 0 ? (firstLaunchAt as number) : effectiveNow;
  const end = start + TRIAL_DAYS * DAY_MS;
  const daysLeft = Math.min(TRIAL_DAYS, Math.max(0, Math.ceil((end - effectiveNow) / DAY_MS)));
  return { daysLeft, active: daysLeft > 0 };
}
