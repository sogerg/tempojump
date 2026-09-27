# Statut TempoJump

1.0.3 (build 18) en vente sur l'App Store. Google Play : compte développeur bloqué, rien ne part.
Ce fichier est né le 28/09/2026. Avant cette date, l'historique est dans les messages de commit.

## 28/09/2026 — fiche Android séparée, balayage

### Fait

- **Générateur de fiche** (`scripts/build-fastlane-metadata.js`) : chaque
  `doc/store_listings/{lang}.md` (25 langues) porte deux sections Android, « Android Trial
  Paragraph » et « Android Subscription Paragraph ». Dans `fastlane/metadata/android/*/full_description.txt`
  **seulement**, elles remplacent le paragraphe IMPORTANT (30 jours gérés par l'app) et le dernier
  (résiliation dans le compte Apple) : essai porté par Google Play, résiliation dans Google Play.
  La durée de l'essai Play n'est pas écrite (elle se règle dans la Play Console). Le script
  s'arrête si une fiche sort du schéma ou si le texte Android nomme encore Apple.
  **iOS inchangé** : `diff -r` des métadonnées et captures iOS avant/après = identiques.
- **Chaîne Face ID générique retirée** : `expo-secure-store` ajoutait
  `NSFaceIDUsageDescription` = « Allow $(PRODUCT_NAME) to access your Face ID biometric data. »
  sans aucune biométrie dans l'app. `faceIDPermission: false` → introspect : 0 chaîne générique.
  Le build 18 en vente la porte encore ; corrigé au prochain build.
- **`npm test` réparé** : jest-expo 57 exige `@react-native/jest-preset` (ajouté, 0.86.3).
  31 tests verts. `tsc --noEmit` propre, `expo export --platform android` OK.
- `toFixed` : aucun d'affichage (seul le repli annoté de `src/lib/units.ts`).

### Écarts notés, à trancher

- **Chaînes d'usage en français seulement** (caméra, micro, photos) pour une app en 25 langues :
  un utilisateur anglais ou japonais voit la demande d'autorisation en français. Recommandation :
  au prochain build, `expo.locales` dans `app.json` avec un `InfoPlist` traduit par langue
  (clés `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`,
  `NSPhotoLibraryUsageDescription`) et une chaîne anglaise par défaut dans le plugin.
- **expo-doctor** : 4 paquets en retard d'un patch (expo 57.0.24→.25, expo-image-picker,
  expo-sharing, expo-video). Laissés tels quels pour que `master` reste le build 18 ; à passer
  avec `npx expo install --check` au prochain build.
- Rappels (mémoire `tempojump-mois-gratuit-sequence`) : retirer l'offre d'introduction Apple
  seulement après mise en ligne ; le jour où Play revient, relancer
  `node scripts/build-fastlane-metadata.js` puis vérifier la fiche Android avant tout envoi.
