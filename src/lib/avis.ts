// Demande d'avis in-app et lien « Noter l'app » (docs/procedure/avis-in-app.md).
// La décision est dans avisDecision.ts (testée) ; ici, seulement le stockage et le module natif.
// Rien n'est jamais attendu par l'écran et toute erreur est avalée : noter l'app ne doit jamais
// gêner l'utilisateur.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { Linking, Platform } from 'react-native';
import {
  adressesNoterApp,
  avecMomentDeSatisfaction,
  avecPremiereOuverture,
  doitDemanderAvis,
  lireEtatAvis,
} from './avisDecision';

/** ID App Store (docs/procedure/asc-identifiants-apps.md). (TempoJump, en vente). */
export const ID_APP_STORE = '6789875302';
export const PACKAGE_ANDROID = 'com.sogerg.monappcavalier';

const CLE = '@cavalier/avis';

async function lire() {
  return lireEtatAvis(await AsyncStorage.getItem(CLE));
}

async function ecrire(etat: ReturnType<typeof lireEtatAvis>) {
  await AsyncStorage.setItem(CLE, JSON.stringify(etat));
}

/** À appeler au lancement de l'app : mémorise la date de première ouverture. */
export function noterOuvertureApp(): void {
  (async () => {
    const etat = await lire();
    if (etat.premiereOuverture === null) await ecrire(avecPremiereOuverture(etat, Date.now()));
  })().catch(() => {});
}

/** À appeler (sans await) quand l'utilisateur vient d'obtenir ce qu'il venait chercher. */
export function noterMomentDeSatisfaction(): void {
  (async () => {
    const maintenant = Date.now();
    const etat = avecMomentDeSatisfaction(await lire(), maintenant);
    await ecrire(etat);
    if (!doitDemanderAvis(etat, maintenant)) return;
    if (!(await StoreReview.isAvailableAsync())) return;
    await ecrire({ ...etat, derniereDemande: maintenant });
    try {
      await StoreReview.requestReview();
    } catch {
      // silencieux : le système peut refuser d'afficher la fenêtre
    }
  })().catch(() => {});
}

/** Vrai si la ligne « Noter l'app » doit être affichée sur cette plateforme. */
export function lienNoterAppDisponible(): boolean {
  return adressesNoterApp(Platform.OS, ID_APP_STORE, PACKAGE_ANDROID) !== null;
}

/** Ouvre le formulaire d'avis du store (lien des Réglages). */
export async function ouvrirNoterApp(): Promise<void> {
  const a = adressesNoterApp(Platform.OS, ID_APP_STORE, PACKAGE_ANDROID);
  if (!a) return;
  try {
    await Linking.openURL(a.principale);
  } catch {
    if (a.repli) await Linking.openURL(a.repli).catch(() => {});
  }
}
