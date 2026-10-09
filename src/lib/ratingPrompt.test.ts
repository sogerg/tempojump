import {
  EMPTY_RATING_PROMPT_STATE,
  RATING_PROMPT_RULES,
  RatingPromptState,
  parseRatingPromptState,
  shouldPromptForRating,
  storeReviewLink,
  withFirstLaunch,
  withPromptShown,
  withSessionLogged,
} from './ratingPrompt';

const DAY = 86_400_000;
// Premier lancement un samedi de concours, 9 h.
const FIRST_LAUNCH = Date.UTC(2026, 9, 10, 9);

const threeSessions = (): RatingPromptState => ({ sessionsLogged: 3, firstLaunchAt: FIRST_LAUNCH, lastPromptAt: null });

describe('RATING_PROMPT_RULES', () => {
  it('reprend les seuils de la procédure (3 séances, 2 jours, 120 jours)', () => {
    expect(RATING_PROMPT_RULES).toEqual({ sessionsLogged: 3, daysSinceFirstLaunch: 2, daysBetweenPrompts: 120 });
  });
});

describe('shouldPromptForRating', () => {
  it('demande à la 3e séance, 2 jours après le premier lancement', () => {
    expect(shouldPromptForRating(threeSessions(), FIRST_LAUNCH + 2 * DAY)).toBe(true);
  });

  it('ne demande pas après 2 séances seulement', () => {
    expect(shouldPromptForRating({ ...threeSessions(), sessionsLogged: 2 }, FIRST_LAUNCH + 20 * DAY)).toBe(false);
  });

  it('ne demande pas avant 2 jours, ni sans premier lancement connu', () => {
    expect(shouldPromptForRating(threeSessions(), FIRST_LAUNCH + 2 * DAY - 1)).toBe(false);
    expect(shouldPromptForRating({ ...threeSessions(), firstLaunchAt: null }, FIRST_LAUNCH + 20 * DAY)).toBe(false);
  });

  it('laisse 120 jours entre deux demandes', () => {
    const prompted = withPromptShown({ ...threeSessions(), sessionsLogged: 11 }, FIRST_LAUNCH + 4 * DAY);
    expect(shouldPromptForRating(prompted, FIRST_LAUNCH + 124 * DAY - 1)).toBe(false);
    expect(shouldPromptForRating(prompted, FIRST_LAUNCH + 124 * DAY)).toBe(true);
  });
});

describe('withFirstLaunch / withSessionLogged', () => {
  it('ne déplace jamais le premier lancement', () => {
    const state = withFirstLaunch(withFirstLaunch(EMPTY_RATING_PROMPT_STATE, FIRST_LAUNCH), FIRST_LAUNCH + DAY);
    expect(state.firstLaunchAt).toBe(FIRST_LAUNCH);
  });

  it('compte la séance et date le premier lancement s’il manquait', () => {
    expect(withSessionLogged(EMPTY_RATING_PROMPT_STATE, FIRST_LAUNCH)).toEqual({
      sessionsLogged: 1,
      firstLaunchAt: FIRST_LAUNCH,
      lastPromptAt: null,
    });
  });
});

describe('parseRatingPromptState', () => {
  it('retourne l’état vide pour une valeur absente ou corrompue', () => {
    expect(parseRatingPromptState(null)).toEqual(EMPTY_RATING_PROMPT_STATE);
    expect(parseRatingPromptState('{"sessionsLogged"')).toEqual(EMPTY_RATING_PROMPT_STATE);
  });

  it('écarte un champ invalide sans perdre les autres', () => {
    const raw = JSON.stringify({ sessionsLogged: 6, firstLaunchAt: FIRST_LAUNCH, lastPromptAt: '2026-10-10' });
    expect(parseRatingPromptState(raw)).toEqual({ sessionsLogged: 6, firstLaunchAt: FIRST_LAUNCH, lastPromptAt: null });
  });
});

describe('storeReviewLink', () => {
  const ids = { appStoreId: '6789875302', androidPackage: 'com.sogerg.monappcavalier' };

  it('iOS : formulaire d’avis, ligne masquée sans ID', () => {
    expect(storeReviewLink('ios', ids)).toEqual({ url: 'https://apps.apple.com/app/id6789875302?action=write-review' });
    expect(storeReviewLink('ios', { ...ids, appStoreId: '' })).toBeUndefined();
  });

  it('Android : market:// puis https ; web : rien', () => {
    expect(storeReviewLink('android', ids)).toEqual({
      url: 'market://details?id=com.sogerg.monappcavalier',
      fallbackUrl: 'https://play.google.com/store/apps/details?id=com.sogerg.monappcavalier',
    });
    expect(storeReviewLink('web', ids)).toBeUndefined();
  });
});
