# Statut TempoJump

## 28/10/2026 — 1.1.0 « Reco en marchant » (branche `v1.1-reco`, rien de construit ni d'envoyé)
Spécification : `doc/cahier-des-charges-1.1-reco-en-marchant.md` (§7 : historique séparé et vitesses
300–400 m/min notés « par défaut, à confirmer par l'utilisateur »). Accès : dans Pro comme le reste
(30 jours gérés par l'app puis paywall sur toute l'app) — achats, paywall et TrialContext non touchés.
`version` 1.1.0 ; `buildNumber` (20) et `versionCode` (5) non touchés : ils montent dans un commit à part
au moment du build, comme pour la 1.0.5.

### Fait
- **Domaine** `src/lib/reco.ts` (+ `reco.test.ts`, `storage.reco.test.ts`) : `CourseWalk` (§3.4, + pas
  étalonné de la reco, pas jusqu'à l'arrivée, `terminee`), pas → distance, foulées théoriques/conseillées
  via `stepsToStrides` / `combinationDistance` (non dupliqués ; hauteur = la plus haute des deux barres),
  numérotation 1, 2, 4a/4b/4c (triple au plus), signal court / juste / long à ±30 cm en combinaison,
  longueur totale, temps accordé (`allowedTime`, arrondi à la seconde supérieure), annuler, corriger,
  dupliquer, recalcul pour une autre monture, repères de plan. `lireNombre` (units.ts) : virgule, point,
  « ٫ », chiffres arabo-indiens ; NaN sinon (jamais de nombre tronqué).
- **Stockage** : clé `@cavalier/courseWalks`, relecture tolérante (téléphone venu de la 1.0.5 = liste
  vide, autres données intactes — testé). ⚠️ L'app n'a **aucune sauvegarde/restauration** (ni avant ni
  maintenant) : rien à y inclure ; voir « À trancher ».
- **Écrans** (`src/screens/reco/`, `src/components/reco/`) : accueil → bouton « Reco en marchant »
  (historique), onglet Plus → « Recos » ; démarrer (monture, terrain, Standard/Élite, barème
  300/325/350/375/400 + libre, concours, étalonnage proposé si le pas n'a jamais été enregistré) ;
  marcher (podomètre `Pedometer.watchStepCount` lu à l'appui, correction +/−, Obstacle / élément de
  combinaison, type, hauteur, contrat, note, annuler le dernier avec confirmation, pause, `useKeepAwake`,
  saisie manuelle si refusé/absent ou au choix ; reco enregistrée à chaque obstacle, reprise depuis
  l'historique) ; récapitulatif (longueur, temps, foulées pour une autre monture, édition) ; « Dernier
  regard » plein écran blanc sur noir ; PDF `expo-print` (Imprimer / Partager, notes échappées) ;
  « Placer sur le plan » (repères 1…n posés en haut du plan choisi ou d'une nouvelle photo, éditeur
  ouvert en mode Repères, enregistrés à la fermeture, plan relié à la reco) ; lien vers le journal de
  bord (entrée existante ou créée ; le journal se relit à chaque affichage de l'onglet).
- **Natif** : `expo-sensors`, `expo-keep-awake`, `expo-print` (npx expo install). Plugin expo-sensors avec
  `motionPermission` réel (jamais `false`) ; `NSMotionUsageDescription` dans `locales/<langue>.json`
  (25 langues) ; `ACTIVITY_RECOGNITION` dans app.json. Vérifié par `expo config --type introspect` (le
  prebuild iOS refuse de tourner sous Windows ; copie temporaire supprimée, aucun dossier ios/) :
  4 chaînes d'usage (caméra, micro, photos, mouvements), aucune générique.
- **i18n** : 95 chaînes `reco.*` + 2 `nav.*` dans les 25 langues ; aucun nouveau pluriel (foulées via
  `exercises.strideCount`, déjà complet ; compteurs en forme neutre) ; arabe : nombres, unités et
  « 1 → 2a » isolés LRI/PDI (`src/lib/bidi.ts`), PDF en `dir="rtl"`. Test `recoVue.test.ts` : mêmes clés
  partout, aucune clé brute ni « {{ ».
- **Contrôles** : 178 tests verts, `tsc --noEmit` propre, audit des défauts connus : 0 ligne
  mon-appli-cavalier. `expo-doctor` : 8 paquets en retard d'un patch (expo 57.0.24 → .31, expo-asset,
  image-picker, navigation-bar, screen-orientation, sharing, video, jest-expo) — laissés, voir « À trancher ».

### Tour S24 du 28/10 (APK release local, clé de débogage, paywall neutralisé dans la COPIE E:\b\tj seulement)
- ✅ Gestes 1, 2 (8,5 m / 10 pas → 85 cm), 3 (100 refusé, 362,5 accepté), 7 (tuer/relancer : reco
  « En cours — touche pour reprendre », reprise exacte), 8 (récapitulatif : 37,40 m, 7 s, combinaison
  « Juste : +28 cm (7,37 m conseillés) » ; dernier regard), 9 (aperçu PDF une page, propre ; fermé sans
  imprimer), 11 (entrée « Fontainebleau » créée au journal), 12 (refus → bandeau et saisie manuelle ;
  accepté à la reprise → « Podomètre actif »), 13 (arabe).
- Numérotation 1 / 2a / 2b juste ; +/− de l'éditeur : 20 pas → 17,00 m.
- 🔧 Corrigés (commit suivant, revus au S24) : « -1,0 théoriques » à 0 pas (affichage borné à 0) ;
  en arabe « البداية → 1 » s'affichait « 1 → البداية » (chaque bout isolé, `isolerIntervalle`).
- ✅ Suite du tour (28/10 soir) : 4 (marche RÉELLE par l'utilisateur : reco « Paris », Gege, 22 / 21 /
  38 pas au podomètre, 46,29 m, 8 s, 2 et 5 foulées), 5 (hauteur « 3 » → « Hauteur entre 0,30 et
  2,20 m », « 1,25 » acceptée ; note enregistrée ; défilement en partant du champ de note), 6
  (SCREEN_BRIGHT_WAKE_LOCK au nom de l'app pendant la reco), 10 (nouveau plan depuis la galerie :
  repères 1-3 posés, repère glissé gardé à la réouverture, « Plan : Nouveau plan » sur la reco), 14
  (police 2.0 : tout utilisable, « Annuler le dernier » sur 3 lignes), 15 (impérial : 151 ft 10,4 in,
  383 yd/min). **Tour S24 de la 1.1 complet.**
- Données de test laissées sur le S24 : plan « Nouveau plan » (photo d'écran) relié à « Paris », entrée
  « Fontainebleau » du journal ; recos de test supprimées.
- Le pas enregistré est de 57 cm (pas naturel) : en reco, les cavaliers marchent souvent un pas d'un
  mètre — l'étalonnage doit se faire avec la même foulée que pendant la reco.
- Remarques : 362,5 m/min s'affiche « 363 m/min » (arrondi d'affichage, calcul juste) ; l'app
  masque la barre d'état partout (voulu, App.tsx) ; sur Android l'app s'ouvre sur le paywall
  (essai Play) : neutraliser `SubscriptionGate` dans la copie de build pour le tour.

### Gestes S24 (APK local, mémoire « build-android-local » ; Expo Go n'ouvre plus le SDK 57)
1. Installer l'APK local, ouvrir l'app : bouton « Reco en marchant » sous la carte d'accueil, ligne
   « Recos » dans Plus.
2. « Nouvelle reco » sur un téléphone jamais étalonné : la carte d'étalonnage apparaît ; taper « 8,5 »
   (virgule) dans la distance et « 10 » dans les pas → « Pas mesuré : 85 cm » ; enregistrer.
3. Barème « Autre » : taper « 362,5 » (virgule) → accepté ; « 100 » → message de plage, bouton grisé.
4. Commencer : accepter l'autorisation « Activité physique » ; **marcher réellement** (à faire par
   l'utilisateur) une vingtaine de pas, vérifier que le compteur monte, appuyer « Obstacle », puis
   « Élément suivant de la combinaison » → numéros 1, 2a, 2b ; corriger +/− ; « Pause » : le compteur ne
   bouge plus en marchant ; « Reprendre ».
5. Toucher un obstacle relevé : hauteur « 1,25 » (virgule) acceptée, « 3 » refusée (message) ; contrat
   +/− ; note longue ; faire défiler en partant du champ de note (mémoire « champ de saisie qui bloque
   le défilement »).
6. Écran allumé : laisser le téléphone posé 2 min pendant la reco → l'écran ne s'éteint pas.
7. Tuer l'app pendant une reco, relancer → Plus → Recos : la reco est « En cours », la rouvrir, les
   obstacles sont là ; terminer.
8. Récapitulatif : changer de monture → foulées recalculées ; « Dernier regard » plein écran lisible.
9. PDF : « Imprimer » → « Enregistrer au format PDF » seulement (ne jamais lire ni capturer la feuille
   de partage) ; ouvrir le PDF : tableau complet, une note contenant « < & » affichée telle quelle.
10. « Placer sur le plan » → plan existant : éditeur en mode Repères avec 1…n en haut, glisser, fermer,
    rouvrir le plan : repères enregistrés ; idem avec « Nouveau plan (photo) ».
11. « Lier au journal de bord » → « Créer une entrée » : l'onglet Journal la montre.
12. Refus de l'autorisation (Réglages Android → Applis → TempoJump → Autorisations → Activité physique
    → Refuser), relancer une reco → message « refusé », champ « Pas comptés » (taper « 24 »),
    « Obstacle » fonctionne.
13. Arabe (Réglages → Langue) : « 1 → 2 », distances et « 22,5 m » restent de gauche à droite dans la
    marche, le récapitulatif, le dernier regard et le PDF.
14. Police système au maximum : gros boutons, compteur, dernier regard sans texte coupé.
15. Unités impériales : distances en ft/in, hauteur en ft, vitesse en yd/min.
Puis TestFlight sur l'iPhone de Marie : fenêtre « Mouvements et forme » en français ET dans une autre
langue, podomètre iOS réel (CMPedometer livre ses comptes par paquets de quelques secondes : vérifier
que la correction +/− suffit).

### Reste (après validation — rien de cela n'est écrit)
- Fiche ASO à refaire (lire les 4 documents ASO d'abord), capture « reco en marchant » en tête,
  Nouveautés 1.1 dans les 25 langues. Fiche store et mots-clés non touchés.
- buildNumber 21 (et versionCode) dans un commit à part au moment du build, sur ordre.

### À trancher
1. **Historique séparé** et **vitesses 300–400 m/min (libre 150–600, défaut 350)** : appliqués par
   défaut, à confirmer (cahier §7).
2. **Sauvegarde/restauration** : l'app n'en a pas ; les recos (comme les plans, le journal, les
   montures) ne survivent pas à une réinstallation. À créer un jour pour toutes les données ?
3. **expo-doctor** : 8 patchs en retard. Les monter (`npx expo install --check`) touche expo et peut
   faire monter expo-modules-jsi (patch-package `patches/expo-modules-jsi+57.1.0.patch`) : à faire en
   connaissance de cause avant le build, pas dans cette branche sans essai.
4. **Hauteur d'un intervalle** : la plus haute des deux barres sert à l'allocation fixe ; sans hauteur
   saisie, allocation « amplitude » (barres < 1,15 m). Tolérance court/long en combinaison : 30 cm.
5. **Contrat** stocké en nombre de foulées (« 5 ») ; un qualificatif (« tenues ») va dans la note.
6. Android : pas en ligne tant que Google Play est bloqué ; `ACTIVITY_RECOGNITION` prête.

## 17/10/2026 matin — chaînes d'autorisation traduites (OUBLIÉES dans la 1.0.4)
- Le build 19 (1.0.4, en vérification) est parti avec les textes caméra / micro / photos en français seulement : point du
  dashboard non traité avant le build. Corrigé dans le code pour la PROCHAINE version : `locales/<langue>.json` (25 langues,
  clé `ios` dans le fichier), `expo.locales` en chemins texte, `CFBundleAllowMixedLocalizations` ; 0 chaîne générique.
- À la prochaine version : passer en 1.0.5 (la 1.0.4 est en vérification), vérifier la fenêtre d'autorisation dans une
  autre langue que le français sur l'iPhone de Marie (TestFlight).

## 09/10/2026 — Restes de gabarit (audit 4.3)
Avis in-app réécrit propre à l'app (09/10) : `src/lib/ratingPrompt.ts` (règles, + `ratingPrompt.test.ts`, 12 cas), `src/lib/rating.ts` (natif), stockage par `loadRatingPromptState` / `saveRatingPromptState` dans `src/lib/storage.ts` (clé `@cavalier/ratingPrompt`) ; moment inchangé (nouvelle séance au carnet) ; comportement inchangé. Médias retirés : 12 restes non référencés de `assets/` (bouton menu icone, cavalier jump icon, cheval-filigrane, horse-head…svgrepo.svg, icone pente descendante/montante, icone plat, icone-strideOn, splash-icon, sreenshot amelioré, tempojump-icon, tete cheval icone ; leurs remplaçants renommés restent).

1.0.3 (build 18) en vente sur l'App Store. Google Play : compte développeur bloqué, rien ne part.
Ce fichier est né le 28/09/2026. Avant cette date, l'historique est dans les messages de commit.

## 08/10/2026 — Avis in-app (prochaine version, après la 1.0.3 build 18 en vente)
Procédure `docs/procedure/avis-in-app.md`. Ni version ni buildNumber touchés, aucun build.
- Aucun mécanisme équivalent avant (ni demande d'avis ni lien de notation ; l'app n'a pas de rappels).
- **Moment de satisfaction** = nouvelle séance enregistrée au carnet (`src/screens/JournalScreen.tsx`,
  `handleSaveEntry`, hors retouche d'une séance existante). Demande native (`expo-store-review` ~57.0.3)
  seulement après 3 moments, 2 jours depuis la première ouverture (notée dans `App.tsx`, `AppContent`),
  120 jours entre deux demandes. Jamais sur le paywall (le carnet n'est accessible qu'hors paywall).
  Décision pure testée : `src/lib/avisDecision.ts` (+ `.test.ts`) ; AsyncStorage `@cavalier/avis`
  (`src/lib/avis.ts`).
- **Ligne « Noter l'app »** dans Réglages, sous « Langue » (même style de ligne), clé `settings.rateApp`
  en 25 langues. iOS : `https://apps.apple.com/app/id6789875302?action=write-review` ; Android : fiche
  Play `com.sogerg.monappcavalier`.
- Module natif : effet au prochain build. À vérifier sur appareil : la fenêtre native n'apparaît pas en
  TestFlight (normal), le lien ouvre le store.

## 28/09/2026 — variantes régionales de fiche (prêtes, partent avec la prochaine version)

Procédure `docs/procedure/variantes-regionales-fiche.md`. Quatre fiches
`doc/store_listings/{en-GB,en-AU,es-MX,fr-CA}.md`, même schéma que les 25 langues (sections
Android comprises) ; `scripts/build-fastlane-metadata.js` les connaît (`VARIANTES`) et les écrit :
iOS `fastlane/metadata/<locale>/` (nom, sous-titre, mots-clés, promo, description + URL
confidentialité/support/marketing reprises de la mère), Android
`fastlane/metadata/android/{en-GB,en-AU,es-419,fr-CA}/` (titre, courte, longue avec les
paragraphes Play). **Contrôle bloquant propre aux variantes** : paragraphe IMPORTANT (30 jours),
paragraphe de résiliation et les deux sections Android identiques mot pour mot à la langue mère ;
limites ; mots-clés (pas de mot du nom/sous-titre, pas de copie de la mère) ; titres de captures.
Relancé : les 25 langues existantes ressortent identiques (`git status` propre).

| Locale (iOS / Play) | Mère | Ce qui change |
|---|---|---|
| en-GB / en-GB | en | sous-titre « Showjumping Distances & Poles », treble, upright, the going, instructor, colours, metres/yards and feet |
| en-AU / en-AU | en | même sous-titre, gridwork, jumps, metres |
| es-MX / es-419 | es | sous-titre « Salto Ecuestre y Recorridos », trancos, ingresa, piso, video, hípica |
| fr-CA / fr-CA | fr | sous-titre « Saut d'obstacles & distances », liste de vérification, parcours, carnet d'entraînement (contenu générique : vaut au Québec) |

Écartée : **en-CA** (pas de vocabulaire équestre canadien distinct de l'anglais américain : ce
serait une copie). Titres de captures : dans chaque `.md` (section « Screenshots Text ») — ce
dépôt n'a pas de CSV Canva ; les captures de la langue mère conviennent (aucun dossier
`doc/store_screenshots_apple/<variante>`, donc rien de copié).

**Envoi** : la 1.0.3 en vente n'accepte pas de nouvelle locale → iOS avec la **prochaine
version** (celle du build qui retire la chaîne Face ID) ; Android le jour où le compte Play revient.

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
