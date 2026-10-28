# TempoJump 1.1 — « Reco en marchant » : cahier des charges

> Rédigé le 26/10/2026, à partir de l'étude de CleaRound (concurrent sorti le 17/09/2026) et du code de
> la 1.0.5 en vente. À valider par l'utilisateur (section « Points à trancher ») avant tout code.

## 1. Pourquoi

**CleaRound – Reconnaissance CSO** (App Store, Jean-Yves Cossin, 1.0.3 du 15/10/2026, FR + EN, iOS 26.2
minimum, 2 notes à 5 étoiles) fait une seule chose : la **reconnaissance à pied**. Le cavalier marche son
tracé ; à chaque obstacle il indique le profil, et le parcours se construit sur le téléphone avec les
distances (lignes, courbes, combinaisons), ses notes et ses contrats de foulées ; un récapitulatif
s'exporte. Écran de calibration : distances au podomètre étalonné sur le pas. Pas d'historique dans
l'app. Modèle : premier parcours complet offert, puis gratuit jusqu'à 7 obstacles, au-delà Pro
7,99 €/mois ou 49,99 €/an. Déclare du suivi publicitaire.

**TempoJump** a déjà tout le calcul, mais à la main : pas comptés → foulées, combinaisons, métronome,
plan photographié et annoté, carnet, multi-chevaux, 25 langues. Il lui manque le **moment de la
reco** : marcher le parcours et voir les foulées se calculer **pour son cheval**.

Ce que TempoJump peut faire mieux que CleaRound :
1. **Foulées du cheval choisi**, pas seulement des distances (taille au garrot, terrain, vitesse :
   `effectiveStrideLength`, `stepsToStrides` existent déjà dans `src/lib/mathUtils.ts`).
2. **Historique** des recos par concours et par cheval (CleaRound ne garde rien).
3. **Lien avec le plan photographié** et le carnet de bord existants.
4. **25 langues** (CleaRound : 2), **aucun suivi publicitaire**.

## 2. Ce qui existe et sera réutilisé

| Brique | Où | Rôle dans la reco |
|---|---|---|
| `calibrateStepLength(distance, pas)` | `src/lib/mathUtils.ts` | étalonnage du pas du cavalier (déjà utilisé) |
| `RiderProfile.stepLength` | `src/types/index.ts` | pas du cavalier en mètres |
| `stepsToStrides(...)` | `src/lib/mathUtils.ts` | pas → foulées théoriques / conseillées |
| `combinationDistance(...)` | `src/lib/mathUtils.ts` | distance conseillée dans une combinaison |
| `allowedTime(longueur, vitesse)` | `src/lib/mathUtils.ts` | temps accordé |
| `Horse`, `HorseContext` | `src/types`, `src/context` | cheval choisi pour la reco |
| `CoursePlan` + éditeur | `src/screens/CoursePlan*` | plan photographié, repères numérotés |
| `JournalEntry` | `src/screens/JournalScreen.tsx` | carnet de bord |

## 3. Fonctions de la 1.1

### 3.1 Démarrer une reco
- Bouton « Reco en marchant » (écran d'accueil / onglet Plans).
- Choix : cheval (par défaut celui sélectionné), terrain, vitesse (Standard/Elite), **vitesse imposée
  du barème en m/min** (liste 300 / 325 / 350 / 375 / 400, libre) pour le temps accordé, nom du
  concours (facultatif).
- Si le pas du cavalier n'est pas étalonné : proposer l'étalonnage existant (marcher une distance
  connue) avant de commencer.

### 3.2 Marcher le parcours
- **Compteur de pas en direct** (podomètre du téléphone, §5) et distance depuis le dernier obstacle.
- Bouton large **« Obstacle »** à chaque abord : on choisit le type (vertical, oxer, combinaison
  double/triple), hauteur facultative, numéro proposé automatiquement (1, 2, 3, 4a/4b…).
- Pour chaque intervalle : distance, **foulées théoriques et conseillées pour ce cheval** ; pour une
  combinaison, comparaison avec la distance conseillée (`combinationDistance`) et un signal
  « court / long ».
- Correction à la main du nombre de pas (+/−), annuler le dernier obstacle, pause.
- **Contrat de foulées** modifiable par intervalle (ex. « 5 tenues ») et note libre (« abord en
  courbe à gauche », « attention ombre »).
- Écran gardé allumé pendant la reco (`expo-keep-awake`), gros boutons utilisables en marchant.
- Repli : si le podomètre est refusé ou absent, saisie manuelle des pas (le calcul actuel).

### 3.3 Récapitulatif
- Liste des obstacles, distances, foulées conseillées, contrats, notes ; **longueur totale** et
  **temps accordé** (`allowedTime`).
- Choisir un autre cheval → foulées recalculées pour lui (utile avec plusieurs montures).

### 3.4 Historique
- Nouvelle donnée **`CourseWalk`** : `{ id, date, eventName?, horseId, terrain, speed,
  speedMetersPerMinute, obstacles: [{ numero, type, hauteur?, pasDepuisPrecedent, distanceMetres,
  foulees, contrat?, note? }], longueurTotale, planId?, journalEntryId? }`, stockée comme les autres
  données (`src/lib/storage.ts`), incluse dans la sauvegarde/restauration si elle existe.
- Liste des recos (par date, par cheval), rouvrir, dupliquer, supprimer.
- Lien vers une fiche du carnet (« après le parcours ») et vers un plan photographié.

### 3.5 Plan photographié
- Depuis une reco : « Placer sur le plan » → ouvre le plan choisi avec les repères 1…n déjà créés
  (`StrideMarker`), à glisser sur les obstacles de la photo.

### 3.6 Fiche « dernier regard »
- Plein écran, gros caractères, contraste fort : obstacles, foulées, contrats, notes clés. Pour le
  paddock, juste avant d'entrer en piste.

### 3.7 Export / partage
- PDF (`expo-print`) ou image : récapitulatif complet, à partager à l'entraîneur.
- ⚠️ Règle S24 : aperçu par « Imprimer → Enregistrer au format PDF » seulement ; ne jamais lire ni
  capturer la feuille de partage.

## 4. Hors périmètre 1.1 (plus tard)
- Tracé GPS du parcours (précision insuffisante en carrière : quelques mètres d'erreur).
- Apple Watch, widget d'écran d'accueil.
- Partage d'une reco entre cavaliers.

## 5. Points techniques
- **Podomètre** : `expo-sensors` → `Pedometer` (iOS : CMPedometer ; `watchStepCount` en premier plan).
  Le comptage peut avoir une seconde de retard : la valeur est lue **au moment de l'appui** sur
  « Obstacle » et reste corrigeable.
- **Autorisation « Mouvements et forme » (NSMotionUsageDescription)** : texte RÉEL en 25 langues
  (rappel mémoire « chaînes d'usage » : un texte générique = refus 5.1.1 ; ne pas mettre
  `motionUsagePermission: false`, qui provoque ITMS-90683). Vérifier qu'aucune autre chaîne
  d'usage n'est ajoutée par le plugin.
- Android (pas en ligne tant que Google Play est bloqué) : `ACTIVITY_RECOGNITION`, à prévoir mais
  pas bloquant.
- Calculs dans des fonctions pures testées (`src/lib/reco.ts` + `reco.test.ts`) : pas → distance,
  distance → foulées pour un cheval, numérotation 4a/4b, longueur totale, temps accordé.
- 25 langues ; arabe et hébreu (le plan et les distances restent de gauche à droite, isoler les
  nombres et unités) ; unités mètres/pieds (convertisseur existant).
- Aucune donnée ne quitte le téléphone (comme aujourd'hui) : rien à changer à la confidentialité,
  sauf la déclaration « Mouvements et forme » si Apple la demande (donnée non collectée).

## 6. Fiche App Store (après le code)
- Lire les 4 documents ASO en entier avant d'écrire (mémoire « lire-les-quatre-docs-aso »).
- Mots à couvrir : reconnaissance / reco / parcours / distances / foulées (FR) ; course walk /
  striding (EN)… volumes à vérifier (NICHES_V8 puis recherche si absent).
- Nouvelle capture « reco en marchant » en tête ; nouveautés 25 langues.

## 7. Points à trancher (utilisateur)
1. **Accès** : (a) la reco dans Pro comme le reste (essai 30 jours puis abonnement) ; (b) reco
   **gratuite jusqu'à 7 obstacles** même après 30 jours, comme CleaRound, pour garder l'app installée
   et pousser vers Pro. → **TRANCHÉ le 28/10 : (a)**. On garde le modèle actuel, 30 jours d'essai
   puis paywall sur toute l'app, reco comprise ; pas de palier gratuit à 7 obstacles. (Rapports
   Apple lus le 28/10 : septembre 14 installations / 5 suppressions, octobre 35 / 13 ; la meilleure
   rétention du portefeuille.)
2. **Historique** : dans le carnet de bord existant, ou une liste « Recos » séparée.
   → **Par défaut, à confirmer par l'utilisateur (28/10)** : liste « Recos » SÉPARÉE (par date,
   filtrable par monture ; rouvrir, dupliquer, supprimer) ; chaque reco peut être liée à une
   entrée du journal de bord et à un plan photographié.
3. **Vitesses du barème** proposées par défaut (liste FFE à confirmer).
   → **Par défaut, à confirmer par l'utilisateur (28/10)** : 300 / 325 / 350 / 375 / 400 m/min +
   valeur libre (bornée 150–600 m/min) ; 350 m/min présélectionné.
4. **Version** : 1.1 (nouveauté majeure) — fiche ASO à refaire avec.

## 8. Tour S24 et validation
- Expo Go n'ouvre plus les apps SDK 57 : tour sur APK local (mémoire « build-android-local »).
- Le podomètre se teste en marchant réellement avec le téléphone (l'utilisateur), sinon saisie
  manuelle.
- Puis TestFlight sur l'iPhone de Marie (podomètre iOS réel, autorisation « Mouvements »), puis build
  et soumission sur ordre.
