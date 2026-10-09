// TempoJump — when to ask the rider for a store rating. Pure logic only (no native module),
// tested in ratingPrompt.test.ts. Storage lives in storage.ts, the native call in rating.ts.
//
// Le « moment de satisfaction » de TempoJump : une nouvelle séance enregistrée dans le carnet
// (JournalScreen). Une retouche d'une séance existante ne compte pas.
// Règles du portefeuille (docs/procedure/avis-in-app.md) : 3 séances enregistrées, 2 jours depuis le
// premier lancement, 120 jours depuis la dernière demande de TempoJump. Le système décide ensuite.

export const RATING_PROMPT_RULES = {
  sessionsLogged: 3,
  daysSinceFirstLaunch: 2,
  daysBetweenPrompts: 120,
} as const;

const DAY = 86_400_000;

export interface RatingPromptState {
  /** Nouvelles séances enregistrées dans le carnet depuis l'installation. */
  sessionsLogged: number;
  /** Premier lancement (epoch ms) ; null tant qu'il n'a pas été noté. */
  firstLaunchAt: number | null;
  /** Dernière demande faite par TempoJump (epoch ms) ; null si jamais. */
  lastPromptAt: number | null;
}

export const EMPTY_RATING_PROMPT_STATE: Readonly<RatingPromptState> = Object.freeze({
  sessionsLogged: 0,
  firstLaunchAt: null,
  lastPromptAt: null,
});

const asTimestamp = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/** Lit la valeur brute d'AsyncStorage ; tout contenu inattendu redonne l'état vide. */
export function parseRatingPromptState(raw: string | null): RatingPromptState {
  if (raw == null || raw === '') return { ...EMPTY_RATING_PROMPT_STATE };
  let data: Partial<Record<keyof RatingPromptState, unknown>>;
  try {
    data = JSON.parse(raw) ?? {};
  } catch {
    return { ...EMPTY_RATING_PROMPT_STATE };
  }
  const sessions = asTimestamp(data.sessionsLogged);
  return {
    sessionsLogged: sessions !== null && sessions > 0 ? Math.floor(sessions) : 0,
    firstLaunchAt: asTimestamp(data.firstLaunchAt),
    lastPromptAt: asTimestamp(data.lastPromptAt),
  };
}

export function withFirstLaunch(state: RatingPromptState, now: number): RatingPromptState {
  if (state.firstLaunchAt !== null) return state;
  return { ...state, firstLaunchAt: now };
}

export function withSessionLogged(state: RatingPromptState, now: number): RatingPromptState {
  return { ...withFirstLaunch(state, now), sessionsLogged: state.sessionsLogged + 1 };
}

export function withPromptShown(state: RatingPromptState, now: number): RatingPromptState {
  return { ...state, lastPromptAt: now };
}

/** True when TempoJump may call StoreReview (availability is checked separately in rating.ts). */
export function shouldPromptForRating(state: RatingPromptState, now: number): boolean {
  const { sessionsLogged, daysSinceFirstLaunch, daysBetweenPrompts } = RATING_PROMPT_RULES;
  if (state.sessionsLogged < sessionsLogged) return false;
  if (state.firstLaunchAt === null || now - state.firstLaunchAt < daysSinceFirstLaunch * DAY) return false;
  return state.lastPromptAt === null || now - state.lastPromptAt >= daysBetweenPrompts * DAY;
}

export interface StoreReviewLink {
  url: string;
  fallbackUrl?: string;
}

/**
 * Link behind « Noter l'app » in Settings: App Store write-review form on iOS (undefined without a
 * numeric App Store ID, so the row is hidden), Google Play listing on Android with an https fallback.
 */
export function storeReviewLink(
  platform: string,
  ids: { appStoreId: string; androidPackage: string },
): StoreReviewLink | undefined {
  if (platform === 'ios') {
    const appStoreId = ids.appStoreId.trim();
    if (!/^\d+$/.test(appStoreId)) return undefined;
    return { url: `https://apps.apple.com/app/id${appStoreId}?action=write-review` };
  }
  if (platform === 'android' && ids.androidPackage) {
    return {
      url: `market://details?id=${ids.androidPackage}`,
      fallbackUrl: `https://play.google.com/store/apps/details?id=${ids.androidPackage}`,
    };
  }
  return undefined;
}
