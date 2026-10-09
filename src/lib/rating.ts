// TempoJump — native side of the rating prompt (expo-store-review) and the Settings « Noter l'app »
// row. Nothing here is awaited by a screen and every failure is swallowed: a rider who just logged
// a session must never see a spinner or an error because of us.
import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';
import { loadRatingPromptState, saveRatingPromptState } from './storage';
import {
  shouldPromptForRating,
  storeReviewLink,
  withFirstLaunch,
  withPromptShown,
  withSessionLogged,
} from './ratingPrompt';

/** TempoJump on the App Store (docs/procedure/asc-identifiants-apps.md) and on Google Play. */
const STORE_IDS = { appStoreId: '6789875302', androidPackage: 'com.sogerg.monappcavalier' };

/** App start (App.tsx): remembers the first launch date once. */
export function trackFirstLaunch(): void {
  loadRatingPromptState()
    .then((state) => (state.firstLaunchAt === null ? saveRatingPromptState(withFirstLaunch(state, Date.now())) : undefined))
    .catch(() => undefined);
}

/** A new session was saved in the journal. Fire and forget. */
export function onSessionLogged(): void {
  const now = Date.now();
  const run = async () => {
    const state = withSessionLogged(await loadRatingPromptState(), now);
    await saveRatingPromptState(state);
    if (!shouldPromptForRating(state, now)) return;
    if (!(await StoreReview.isAvailableAsync())) return;
    await saveRatingPromptState(withPromptShown(state, now));
    await StoreReview.requestReview().catch(() => undefined);
  };
  run().catch(() => undefined);
}

export function hasRatingLink(): boolean {
  return storeReviewLink(Platform.OS, STORE_IDS) !== undefined;
}

export async function openRatingPage(): Promise<void> {
  const link = storeReviewLink(Platform.OS, STORE_IDS);
  if (!link) return;
  try {
    await Linking.openURL(link.url);
  } catch {
    if (link.fallbackUrl) await Linking.openURL(link.fallbackUrl).catch(() => undefined);
  }
}
