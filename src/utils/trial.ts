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
 */
export function trialStatus(firstLaunchAt: number | null | undefined, now = Date.now()): TrialStatus {
  const start = Number.isFinite(firstLaunchAt) && (firstLaunchAt as number) > 0 ? (firstLaunchAt as number) : now;
  const end = start + TRIAL_DAYS * DAY_MS;
  const daysLeft = Math.max(0, Math.ceil((end - now) / DAY_MS));
  return { daysLeft, active: daysLeft > 0 };
}
