// L'essai gratuit tel que LA BOUTIQUE le déclare, lu dans les données RevenueCat — jamais figé
// dans l'app. C'est un badge « 3 jours d'essai gratuit » écrit en dur qui a fait mentir la version
// en ligne pendant deux jours, quand Apple accordait déjà un mois. Si la boutique ne déclare rien,
// on n'affiche rien : un badge absent vaut mieux qu'un badge faux.
//
// Google Play porte l'essai (durée libre en jours) ; sur iPhone la période gratuite est gérée par
// l'app (src/utils/trial.ts) et l'offre d'introduction Apple sera retirée une fois la 1.0.3 en
// ligne — ce lecteur rendra alors 0 sur iOS, ce qui est la vérité.

interface IntroPriceLike {
  price: number;
  periodUnit: string;
  periodNumberOfUnits: number;
}

interface PeriodLike {
  unit: string;
  value: number;
}

interface ProductLike {
  introPrice?: IntroPriceLike | null;
  defaultOption?: { freePhase?: { billingPeriod?: PeriodLike | null } | null } | null;
  subscriptionOptions?: { freePhase?: { billingPeriod?: PeriodLike | null } | null }[] | null;
}

const DAYS: Record<string, number> = { DAY: 1, WEEK: 7, MONTH: 30, YEAR: 365 };

function toDays(unit: string | undefined, count: number | undefined): number {
  if (!unit || !count) return 0;
  return (DAYS[unit.toUpperCase()] ?? 0) * count;
}

/** Jours d'essai gratuit déclarés par la boutique pour ce produit, 0 s'il n'y en a pas. */
export function freeTrialDays(product: ProductLike | null | undefined): number {
  if (!product) return 0;
  const intro = product.introPrice;
  if (intro && intro.price === 0) {
    const d = toDays(intro.periodUnit, intro.periodNumberOfUnits);
    if (d > 0) return d;
  }
  // Google : l'essai est une phase gratuite de l'option d'abonnement.
  const phase = product.defaultOption?.freePhase ?? product.subscriptionOptions?.find((o) => o?.freePhase)?.freePhase;
  return toDays(phase?.billingPeriod?.unit, phase?.billingPeriod?.value);
}
