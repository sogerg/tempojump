# TempoJump — prompts des captures store (1.1, 28/10/2026)

Méthode du portefeuille (`docs/procedure/canva-screenshots.md`, règle permanente ASO) : UI générée par
Gemini, fidèle à l'écran réel, puis mockup iPhone + fond + titre dans Canva, titres en masse par
`doc/store_listings/captures-canva.csv` (`node scripts/gen-csv-captures.js`). Un seul jeu pour l'App
Store et Google Play.

## Nombre : 6 (5 + 1 justifié)

| # | Écran | Mots portés (FR / EN) | Pourquoi |
|---|---|---|---|
| 1 | **Reco en marchant** (nouveau, 1.1) | reconnaissance à pied, podomètre / walk, round, pedometer | Différenciateur de la 1.1 et réponse directe à CleaRound (concurrent reco à pied du 17/09) ; cluster « reconnaissance / course walk » qu'aucun des 5 écrans existants ne porte. |
| 2 | Calcul de foulées (existant) | calcule, instantanément / calculate, instantly | Fonction d'origine, inchangée. |
| 3 | Résultat : foulées théoriques & distance (existant) | théoriques, distance exacte | Écran résultat, seul autorisé à répéter un mot du nom. |
| 4 | Check-list concours (existant) | check-list, concours / checklist, show | Cluster distinct. |
| 5 | Plan de parcours annoté (existant) | dessine, plan | Cluster distinct. |
| 6 | Carnet de bord & vidéos (existant) | carnet, vidéos / training log, videos | Cluster distinct. |

Aucun volume chiffré pour l'équitation dans `docs/NICHES_V8.md` (niche hors V8) : le 6ᵉ écran se
justifie par le différenciateur produit, pas par un exact match chiffré. Rester à 6 (8 max).

**Ordre des fichiers** : la capture reco devient `1.png` dans `doc/store_screenshots_apple/<langue>/`
(et `store_screenshots_google`) ; les cinq existantes passent de `1..5.png` à `2..6.png`. Les cinq
designs Canva existants ne changent pas de texte : seuls leurs calques doivent être renommés
`screenshot2`…`screenshot6` si on refait leur « Créer en masse » avec le nouveau CSV.

## Capture 1 — Reco en marchant (écran réel : `src/screens/reco/RecoWalkScreen.tsx`)

Couleurs de l'app (`src/constants/colors.ts`, thème clair) : fond `#FFFDF9`, carte `#F0DFD8` bordure
`#D9BE98`, texte `#3B2A20`, texte secondaire `#8A6F5C`, vert olive primaire `#8FA377` (texte blanc
dessus), or `#C9A24B`. Fond Canva conseillé : vert sapin très sombre uni (`#1F2A22`) ou sable de carrière
flouté — contraste avec le vert olive et le beige.

Règle « ce qui suit une chaîne entre guillemets finit à l'écran » : la taille est toujours écrite AVANT
le texte cité.

```
Full-screen mobile UI design, light theme, background #FFFDF9, portrait 1290x2796 canvas.
Keep all content inside the central 70% of the width: 15% empty margin on the left and right,
8% empty margin at the top, 15% empty margin at the bottom. No phone frame, no mockup, no device border.

At the top, a small header bar, background #F3EDE0, with dark brown (#3B2A20) bold text at font size 30
reading "Walking the course" and nothing else.

Below it, a small olive green (#8FA377) status line with a small footprints icon, text at font size 26 reading
"Pedometer on" and nothing else.

Then a large rounded card, background #F0DFD8, 2px border #D9BE98:
- small muted brown (#8A6F5C) label, font size 26: "Steps since fence 2"
- a huge bold dark brown (#3B2A20) number, font size 150: "14"
- below, dark brown text, font size 30: "11.90 m  ·  2.3 theoretical → 2"
- a row with a round "−" button on the left, the muted label "Pedometer correction" in the middle,
  a round "+" button on the right. Exactly two round buttons, no more.

Then one very large full-width olive green (#8FA377) rounded button, white bold text at font size 48,
reading "Fence" and nothing else.
Below it, one full-width outlined olive green rounded button, olive text at font size 30, reading
"Next element of the combination" and nothing else.

Then a section label in muted brown, font size 24: "Fences recorded (tap to edit)"
followed by exactly two white rows with a thin #DEC6A6 border, and no other rows:
- row 1: bold number at font size 34 "1", then dark text "Vertical · 21.25 m" and below it olive bold text "5 strides"
- row 2: bold number at font size 34 "2", then dark text "Oxer · 18.70 m" and below it olive bold text "4 strides  ·  Plan: 4 strides"

No other text anywhere. Clean, elegant equestrian style, generous spacing, large readable type.
```

**Version française (à utiliser)** : les cinq captures existantes ont une interface en français dans
toutes les langues (seul le titre Canva change). Libellés repris de `src/i18n/locales/fr.json` (`reco.*`).

```
Full-screen mobile UI design, light theme, background #FFFDF9, portrait 1290x2796 canvas.
Keep all content inside the central 70% of the width: 15% empty margin on the left and right,
8% empty margin at the top, 15% empty margin at the bottom. No phone frame, no mockup, no device border.
All text in the image is in French, exactly as written below.

At the top, a small header bar, background #F3EDE0, with dark brown (#3B2A20) bold text at font size 30
reading "Reco en marchant" and nothing else.

Below it, a small olive green (#8FA377) status line with a small footprints icon, text at font size 26 reading
"Podomètre actif" and nothing else.

Then a large rounded card, background #F0DFD8, 2px border #D9BE98:
- small muted brown (#8A6F5C) label, font size 26: "Pas depuis l'obstacle 2"
- a huge bold dark brown (#3B2A20) number, font size 150: "14"
- below, dark brown text, font size 30: "11,90 m  ·  2,3 théoriques → 2"
- a row with a round "−" button on the left, the muted label "Correction du podomètre" in the middle,
  a round "+" button on the right. Exactly two round buttons, no more.

Then one very large full-width olive green (#8FA377) rounded button, white bold text at font size 48,
reading "Obstacle" and nothing else.
Below it, one full-width outlined olive green rounded button, olive text at font size 30, reading
"Élément suivant de la combinaison" and nothing else.

Then a section label in muted brown, font size 24: "Obstacles relevés (touche pour modifier)"
followed by exactly two white rows with a thin #DEC6A6 border, and no other rows:
- row 1: bold number at font size 34 "1", then dark text "Vertical · 21,25 m" and below it olive bold text "5 foulées"
- row 2: bold number at font size 34 "2", then dark text "Oxer · 18,70 m" and below it olive bold text "4 foulées  ·  Contrat : 4 foulées"

No other text anywhere. Clean, elegant equestrian style, generous spacing, large readable type.
```

Contrôles après génération : ratio 0,461 (sinon `docs/scripts/recadrer-ui-gemini.py`), aucun texte
parasite (compter les deux boutons et les deux lignes), aucun « px » ni taille de police rendus.

## Titres (CSV `captures-canva.csv`, colonne `screenshot1`)

Titre de la capture 1 par langue : section « Screenshots Text » de chaque `doc/store_listings/<langue>.md`
(≤ 38 caractères, aucun mot du nom ni du sous-titre de la langue — contrôlé par script le 28/10).
FR « Reconnaissance à Pied au Podomètre » · EN « Walk Your Round With a Pedometer » ·
en-GB/en-AU « Walk the Course With a Pedometer » (le sous-titre y est « Showjumping Distances & Poles »,
donc « course » est libre) · DE « Parcoursbegehung mit Schrittzähler ».
Arabe : après Canva, repasser le titre en RTL (procédure § 9).
