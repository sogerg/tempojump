# Screenshot Design Guide

Reference pour la creation des screenshots store pour toutes les identifier apps. IMPORTANT LES STORES UTILISENT MAITNENTN LES TITLES DES SCREENSHOTS POUR RANKER DONC IMPORTANT

---

## Dimensions & Format

On utilise **1290 x 2796** comme taille unique pour toutes les plateformes. (on élargie juste avec du background pour les creneshots tablette)

---

## Approche : UI generee par IA text-to-image + Canva

Les vrais screenshots de l'app sont **illisibles** en miniature dans le store. On genere donc des **UI simplifiees** avec des elements bien plus gros, optimisees pour etre lues en scrollant vite.

### Workflow

1. **Regarder l'ecran reel de l'app** (ex: `app/(identification)/[identificationId].tsx`) pour comprendre quels elements sont affiches, dans quel ordre, avec quelles couleurs
2. **Generer l'UI via text-to-image** (GPT-4o, Gemini, etc.) — les modeles recents gerent bien le texte dans les images. Le prompt doit decrire un ecran mobile simplifie avec les elements cles EN PLUS GROS
3. **Assembler dans Canva** : placer l'UI generee dans le phone mockup, ajouter le background et le titre
4. **Placer les assets manuellement** (ex: image de l'objet) si on les a deja — ne pas les faire re-generer par l'IA pour garder la coherence entre screenshots

### Principes

- **1 info cle par screenshot** qui saute aux yeux (un verdict, un prix, un chiffre)
- **Textes 3x plus gros** que dans la vraie app
- **Couleurs contrastees** : vert = positif, rouge = negatif, dore = premium
- **Moins d'elements** que dans la vraie app — epurer au max
- Le user doit comprendre le screenshot en **1 seconde** de scroll
- **Ne montrer que du positif/impressionnant** — pas de badges "Less likely", pas d'incertitude visible. Le screenshot doit vendre, pas nuancer
- **Ne pas laisser d'espace vide en haut** — on place l'image objet manuellement dans Canva par-dessus l'UI generee
- **Laisser ~10% d'espace vide en bas** — les modeles text-to-image (Gemini etc.) ajoutent un watermark/trademark en bas qui peut chevaucher le contenu et empecher un crop propre

---

exemple pour un screenshot d'idenfitication par exemple :

Full-screen mobile UI design, light/white theme, background #FFFFFF, 1290x2796 pixels portrait.

Centered content starting from the top:

Large bold antique brown (#714214) title text: "Ming-Style Blue & White Porcelain Vase"

A row of 3 small rounded antique brown (#714214) tag badges with 10% opacity background and brown text: "Authentic" "Ceramic" "Antique"

A thin horizontal divider line in light gray (#E5E5E5).

A prominent value card with light gray background (#F7F7F7), rounded corners, and a gold/brown (#714214) left border accent:
A small gem icon and label "ESTIMATED VALUE" in small gray (#717179) text,
with large bold green (#16A34A) text below: "$1,200 – $3,500"
A small warm gold badge "High Value" next to the price.

Below, a centered Quick Info Bar row:
Calendar icon + "1620 – 1680" in dark text | Globe icon + "China" in dark text

Then a section card with light gray background (#F7F7F7), rounded corners, 1.5px antique brown (#714214) border, and a header bar with 10% brown opacity background:
Header: palette icon in a rounded square with brown tint + "Materials & Technique" in bold dark text
Content rows with gray (#717179) labels on left and dark (#0A0A0F) values on right:

- "Material" → "Porcelain (Kaolin Clay)"
- "Glaze" → "Cobalt Blue Underglaze"
- "Technique" → "Hand-painted Lotus Scroll"
- "Base" → "Recessed Foot Ring, Unglazed"

No phone frame, no mockup, no device border. Just the flat UI content filling the entire canvas.
Clean, minimal, modern light app design with warm antique brown (#714214) accents.

////

## Structure des 5 screenshots

### Screenshot 1 : Scan / Camera

**Titre** : [Verbe] + [Sujet] + [Keyword] (ex: "Identify Gold Karat")

**Layout** :

```
┌─────────────────────┐
│                     │
│   TITRE EN ITALIC   │  ← Gros titre dore/colore en haut
│     GROS TEXTE      │
│                     │
│  ┌───────────────┐  │
│  │  ┌─┐     ┌─┐ │  │
│  │  └─┘     └─┘ │  │
│  │               │  │
│  │  [IMAGE OBJET]│  │  ← Photo generee de l'objet (fond white, detoure)
│  │  dans viewfind│  │     placee dans le viewfinder de l'app
│  │               │  │
│  │  ┌─┐     ┌─┐ │  │
│  │  └─┘     └─┘ │  │
│  │               │  │
│  │ [BOUTON SCAN] │  │  ← Bouton CTA visible
│  │               │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

**Image objet** : generee avec IA google nano banana pro

- Fond blanc pour detourage facile
- L'objet doit montrer des details que l'app identifie (hallmarks, textures, etc.)
- Ces details doivent etre visibles mais PAS evidents (pour montrer l'utilite de l'app)

**Background** : genere separement (velours, bois, pierre...) en 1290x2796, adapte a la niche.

### Screenshot 2 : Resultat AI

**Titre** : [Adjectif/Verbe] + [Sujet] + [Analysis/Result] (ex: "Detailed Gold Analysis", "Full Stamp Appraisal")

**Source** : s'inspirer de l'ecran `app/(identification)/[identificationId].tsx` — regarder les SectionCard, ValueCard, et Quick Info Bar pour comprendre les elements affiches.

**Layout** :

```
┌─────────────────────┐
│                     │
│   TITRE EN ITALIC   │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │               │  │  ← On place l'image objet manuellement dans Canva
│  │               │  │     (meme asset que screenshot 1 pour coherence)
│  │───────────────│  │
│  │               │  │
│  │  ✓ VERDICT    │  │  ← Authenticity card : nom + badge vert "Authentic"
│  │  "Baroque     │  │     EN GROS, le nom de l'objet identifie
│  │   Armchair"   │  │
│  │               │  │
│  │  🎨 Style     │  │  ← Quick Info Bar : 2-3 infos avec icones
│  │  📅 Period    │  │     (style, periode, origine)
│  │  🌍 Origin    │  │
│  │               │  │
│  │ ┌───────────┐ │  │
│  │ │ 💰 VALUE  │ │  │  ← Value Card EN GROS, dore/vert
│  │ │$2,500-    │ │  │     C'est l'accroche principale
│  │ │  $5,000   │ │  │
│  │ └───────────┘ │  │
│  │               │  │
│  │  🪵 Materials │  │  ← UNE section detail (la plus impressionnante)
│  │  Primary:     │  │     ex: Materials, Construction, ou Condition
│  │  Walnut       │  │     PAS de candidates/likelihood (eviter l'incertitude)
│  │               │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

**Important** :

- Le verdict principal (nom de l'objet) doit etre lisible meme en miniature
- La Value Card est l'element le plus accrocheur — c'est ce qui vend l'app
- Ne montrer qu'UNE section detail (Materials ou Construction) — pas les candidates avec badges "Less likely" qui donnent une impression d'incertitude
- Choisir la section la plus impressionnante/concrete (ex: "Carved Walnut, French Polish" > "Possible: Rococo")

### Screenshot 3 : Outil principal (Calculateur)

**Titre** : [Sujet] + [Price/Value] + [Calculator] (ex: "Gold Price Calculator")

**Layout** :

```
┌─────────────────────┐
│                     │
│   TITRE EN ITALIC   │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │  Spot Price   │  │  ← Prix en temps reel en haut
│  │  $X,XXX.XX/oz │  │
│  │               │  │
│  │  [Inputs]     │  │  ← Champs de saisie (poids, unite, purete)
│  │  Weight: XXXg │  │
│  │  Karat: 18K   │  │
│  │               │  │
│  │ ┌───────────┐ │  │
│  │ │           │ │  │
│  │ │ RESULTAT  │ │  │  ← LE GROS CHIFFRE au centre
│  │ │ $X,XXX.XX │ │  │     en vert, bien visible
│  │ │           │ │  │
│  │ └───────────┘ │  │
│  │  "Melt Value" │  │
│  │               │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

**Le chiffre du resultat** doit etre LE plus gros element du screenshot.

### Screenshot 4 : Detection faux / Feature differenciante

**Titre** : [Spot/Detect] + [Fake] + [Sujet] (ex: "Spot Fake Gold")

**Layout** :

```
┌─────────────────────┐
│                     │
│   TITRE EN ITALIC   │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │  ● VERDICT    │  │  ← Verdict en GROS en haut
│  │  "Likely Fake"│  │     Rouge = fake, Vert = genuine
│  │   ████████░░  │  │     Barre de score visuelle
│  │               │  │
│  │  ✓ Check 1    │  │  ← 4-5 items de checklist
│  │  ✓ Check 2    │  │     avec icones vert/rouge
│  │  ✗ Check 3    │  │     bien grosses
│  │  ✓ Check 4    │  │
│  │  ✗ Check 5    │  │
│  │               │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

**Conseil** : montrer un mix vert/rouge (pas tout vert ni tout rouge) pour que ce soit visuellement interessant. Un verdict "Likely Fake" en rouge est plus accrocheur qu'un "Genuine" en vert.

### Screenshot 5 : Liste des tools

**Titre** : [N] + [Expert/Pro] + [Sujet] + [Tools] (ex: "7 Expert Gold Tools")

**Layout** :

```
┌─────────────────────┐
│                     │
│   TITRE EN ITALIC   │
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │ ┌────┐┌────┐ │  │  ← Grille de carres colores
│  │ │ 🔍 ││ 💰 │ │  │     avec icone + nom du tool
│  │ │Tool1││Tool2│ │  │     + sous-titre court
│  │ │descr││descr│ │  │
│  │ └────┘└────┘ │  │
│  │ ┌────┐┌────┐ │  │
│  │ │ 🛡️ ││ 📊 │ │  │
│  │ │Tool3││Tool4│ │  │
│  │ │descr││descr│ │  │
│  │ └────┘└────┘ │  │
│  │ ┌────┐┌────┐ │  │
│  │ │ 🧪 ││ ⚖️ │ │  │
│  │ │Tool5││Tool6│ │  │
│  │ │descr││descr│ │  │
│  │ └────┘└────┘ │  │
│  │    ┌────┐    │  │
│  │    │ 🧹 │    │  │
│  │    │Tool7│    │  │
│  │    └────┘    │  │
│  └───────────────┘  │
│                     │
└─────────────────────┘
```

**Style** : carres avec couleurs pastels differentes (comme le screenshot fitness), icones grandes, texte court.

---

## Titres des screenshots

- Affiches EN HAUT du screenshot, en dehors du phone mockup
- Font : **italic**, couleur premium (dore, ou couleur theme de l'app)
- Taille : assez gros pour etre lu en miniature dans le store
- Max **3 lignes** (attention DE, RU, PT qui sont plus longs)
- Voir `STORE_LISTING_GUIDE.md` pour la strategie ASO des titres

---

## Phone Mockup

- Utiliser un mockup **iPhone** style (bords arrondis, encoche)
- Couleur du mockup : **blanc** ou **argent** (ressort bien sur fond sombre)
- Le mockup ne prend pas toute la hauteur — laisser de l'espace pour le titre en haut
- Le contenu du mockup est la **UI generee** (pas un vrai screenshot)

---

## Backgrounds

Generer des backgrounds en **1290 x 2796** adaptes a la niche :

| Niche            | Background suggere                           | Notes                                       |
| ---------------- | -------------------------------------------- | ------------------------------------------- |
| Bijoux/Or/Argent | Velours noir                                 |                                             |
| Pierres/Mineraux | Ardoise / pierre grise                       |                                             |
| Plantes/Nature   | Bois clair / table jardin                    |                                             |
| Food/Cuisine     | Plan de travail marbre / bois                |                                             |
| Health/Fitness   | Gradient clean / couleur unie                |                                             |
| Furniture/Antiq  | Marbre blanc (Canva: "white marble texture") | Marbre etendu full-bg y compris hors mockup |

Le background doit etre **sobre** pour ne pas concurrencer le contenu du phone mockup.

**Attention** : le background doit **contraster** avec la couleur primaire de l'app. Ex: si la couleur accent est marron, eviter un fond bois marron (tout se fond). Preferer un fond clair (marbre, pierre) ou un fond sombre froid (ardoise, bleu nuit).

---

## Couleurs par theme d'app

Utiliser la couleur **--primary** definie dans le `global.css` de l'app (variable HSL). C'est cette couleur qui doit etre utilisee comme accent dans les titres et les UI generees des screenshots. genere toujours l'UI en white background

---

## Checklist par screenshot

- [ ] Taille 1290 x 2796 px
- [ ] Titre en italic visible en haut
- [ ] Titre < 3 lignes (tester dans toutes les langues)
- [ ] Phone mockup present et bien cadre
- [ ] UN element principal qui saute aux yeux
- [ ] Textes assez gros pour etre lus en miniature
- [ ] Couleurs contrastees et coherentes avec le theme
- [ ] Background adapte a la niche
- [ ] Pas de donnees sensibles / realistes qui pourraient poser probleme
