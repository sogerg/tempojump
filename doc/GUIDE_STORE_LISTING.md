# Store Listing & ASO Guide

Reference pour toutes les identifier apps. A suivre pour chaque nouvelle app.

---

## Philosophie ASO

### Le but : RANKER

Chaque champ indexable (Title, Subtitle, Short Description, Keywords, Screenshot titles) est une opportunite de ranking. On maximise la couverture de keywords tout en restant **naturel et grammaticalement correct**.

### La regle d'or : SE METTRE A LA PLACE DU USER

Pour chaque langue, se demander : **"qu'est-ce que l'utilisateur taperait dans le store ?"**

- Un francais cherche "scanner plante" pas "identificateur de plante"
- Un allemand cherche "Stein Scanner" pas "Gestein Identifikator"
- Un russe cherche "определить камень" pas une traduction litterale

**JAMAIS traduire betement. TOUJOURS adapter aux termes de recherche reels de la langue cible.**

### L'equilibre : KEYWORDS vs GRAMMAIRE

- Caser un max de keywords dans les espaces courts (Title, Subtitle, Screenshots)
- MAIS la grammaire doit etre correcte — un titre spammy fait fuir les users et peut etre penalise
- Un titre naturel avec de bons keywords > un titre bourre de mots-cles qui sonne faux

---

## Character Limits

| Champ             | Google Play | iOS App Store               |
| ----------------- | ----------- | --------------------------- |
| App Name          | 30 chars    | 30 chars                    |
| Short Description | 80 chars    | -                           |
| Full Description  | 4000 chars  | 4000 chars                  |
| Subtitle          | -           | 30 chars                    |
| Promotional Text  | -           | 170 chars                   |
| Keywords          | -           | 100 chars (commas incluses) |

---

## Strategie de repartition des keywords

### Principe : chaque emplacement couvre des keywords DIFFERENTS

```
Title        = keyword principal + sujet (ex: "Gold Purity Identifier")
Subtitle     = keywords secondaires complementaires (ex: "Scan Hallmarks & Gold Value")
Screenshots  = keywords tertiaires / longue traine (ex: "karat", "price calculator", "fake")
Keywords iOS = tout ce qui n'a pas pu rentrer ailleurs
```

### Exemple concret

- Title couvre : gold, purity, identifier
- Subtitle couvre : scan, hallmarks, value
- Screenshot 1 couvre : karat, identify
- Screenshot 2 couvre : AI, analysis
- Screenshot 3 couvre : price, calculator
- Screenshot 4 couvre : fake, spot
- Screenshot 5 couvre : expert, tools
- **Total : 14 keywords uniques au lieu de 5 si on repetait partout**

---

## App Name & Subtitle (iOS)

### Regles

- Title et Subtitle doivent se **completer**, pas se repeter
- Mettre le keyword principal dans le Title
- **Mener le Title avec le keyword commercial / la marque** (ex: "Gun Value: ..." pas "... : Gun Value") — le premier bloc pese le plus en ASO et c'est ce que le user voit d'abord. Format type : `[kw argent + Objet] : [Verbe d'action que le user tape]`
- Mettre les keywords secondaires dans le Subtitle
- Sonner naturel, pas spammy
- Verifier les char limits dans CHAQUE langue (certaines langues sont plus longues)

### ⛔ INTERDITS dans le Title (erreurs deja faites)

- **JAMAIS "ID" / "& ID"** : PERSONNE ne tape "arme ID", "coin ID". C'est de la place gaspillee sur le champ le plus important de l'ASO. Utiliser le VERBE COMPLET que le user tape : "Identifier", "Identify", "Bestimmen", "Определить"...
- **"Scanner/Scan" depend de la niche, ce n'est PAS un default** :
  - ✅ On "scanne" une carte, un code-barre, un document (objet plat/rapide)
  - ❌ On n'"scanne" PAS une arme, un meuble, une piece de monnaie, un bijou → on l'**IDENTIFIE** / on l'**estime**. Le user tape "identifier X" ou "valeur X", pas "scanner X".
  - Test decisif : **se demander litteralement "le user va-t-il taper SCANNER dans le store pour ca ?"**. Si non → utiliser identifier/estimer/valeur.
- **Toujours prioriser le VERBE/kw que le user tape reellement** sur un mot court "malin" mais mort en recherche.

### Le tool gratuit = argument de telechargement

- Si l'app a un tool gratuit (le reste en premium), le mettre en avant : c'est un hook de download honnete et fort
- Le montrer sur le **screenshot #3** (voir structure ci-dessous), et le choisir comme le tool le plus abouti/le plus utile MAIS pas un moteur d'achat (garder les tools "combien vaut MON objet / est-il authentique" en premium)

### Notes par langue pour le Title

Choisir le verbe selon la niche (identifier vs estimer vs valeur), PAS "scanner" par reflexe.

- **FR** : "Identifier" (infinitif) / "Valeur [objet]" / "Estimer". Ex: "Valeur Arme à Feu : Identifier"
- **DE** : mots composes longs, garder concis. Verbe "Bestimmen" (identifier) / "Wert" (valeur). "Erkennen" marche aussi
- **ES** : "Identificar" / "Valor". ("Escanear" seulement pour cartes/docs)
- **IT** : "Identificare" / "Valore" / "Identificatore"
- **PT** : "Identificar" / "Valor". Cibler BR + PT (termes communs)
- **NL** : "Herkennen"/"Identificeren" / "Waarde"
- **PL** : "Rozpoznaj"/"Identyfikuj" / "Wartość"
- **RU** : "Определить" (identifier) / "Оценка"/"Стоимость" (valeur). Cyrillique prend de la place, verbe complet quand meme
- **CS** : "Identifikuj"/"Rozpoznej" / "Hodnota"
- **FI** : "Tunnista" (identifier) / "Arvo" (valeur)
- **SV** : "Identifiera" / "Värde"

---

## Screenshot Titles

### Regles

- **Max 3 lignes** sur l'ecran du phone (texte en haut du screenshot)
- **5 screenshots** par app
- Les stores indexent le texte des screenshots pour le ranking ASO
- Chaque titre doit cibler des **keywords differents** du title/subtitle
- Verifier que ca tient en 3 lignes dans les langues longues (DE, RU, PT)

### Structure type (5 screenshots)

| #   | Contenu             | Ce qu'on montre                                                        |
| --- | ------------------- | --------------------------------------------------------------------- |
| 1   | Scan/Camera screen  | L'ecran principal de scan avec un objet (keyword: identify/scan)       |
| 2   | Resultat AI         | L'ecran de resultat — **placer VALUE / PRICE / APPRAISAL** (kw argent) |
| 3   | Tool #1 (le free)   | Le tool gratuit / le plus vendeur (guide, calculateur...)              |
| 4   | Tool #2 differenciant | Un 2e tool : detection faux/refinished, grade, etc.                 |
| 5   | Liste des tools     | Montrer la richesse de l'app (N tools)                                 |

**Exception a la regle "keywords differents"** : le keyword argent (value/price/appraisal) DOIT apparaitre sur le screenshot #2 (resultat) meme s'il est deja dans le Title. C'est le keyword de conversion le plus fort, on le renforce une fois sur l'ecran resultat. Confirme par toutes les apps existantes (old-coin, funko, antique, HW, baseball).

---

## Pieges grammaticaux par langue

### FR - Francais

- ❌ "Identifiez le Carat Or" → "Or" sans preposition apres un article
- ✅ "Identifiez les Carats" ou "Identifiez le Carat d'Or"
- ❌ "Outils Or Experts" → mot qui flotte au milieu
- ✅ "Outils Experts" ou "Outils d'Or"
- ✅ "Calculateur Prix Or" → style telegraphique nom-nom-nom OK (pas de verbe devant)

**Regle FR** : le style telegraphique (sans articles) marche pour les labels/noms composes, mais PAS apres un verbe conjugue.

### IT - Italien

- ❌ "Carati Oro" → meme probleme que FR, manque la preposition
- ✅ "i Carati" ou "Carati d'Oro"
- ❌ "Strumenti Esperti Oro" → "Oro" qui traine
- ✅ "Strumenti Esperti"

**Regle IT** : comme le FR. Apres un verbe, il faut l'article ou la preposition.

### DE - Allemand

- Les mots composes sont TRES longs → garder les titres ultra-courts
- Les anglicismes passent bien : "Tools", "Scanner", "Guide"
- Les noms composes colles sont naturels : "Goldpreis-Rechner", "KI-Analyse"

### RU - Russe

- Le cyrillique prend plus de place horizontalement que le latin
- Garder les titres encore plus courts qu'en EN
- L'imperatif informel (ты) fonctionne bien pour les titres : "Определи", "Найди"

### ES/PT - Espagnol/Portugais

- Plus verbeux que EN, attention aux limites de chars
- PT est souvent plus long que ES pour dire la meme chose
- Le tutoiement (tu) est OK pour ES, vouvoiement (voce) pour PT-BR

### JA/ZH/KO - Asiatiques

- Tres compacts, rarement de probleme de longueur
- JA : attention aux mix katakana/kanji — garder lisible
- ZH : le separateur "·" (middle dot) est courant dans les sous-titres
- KO : les espaces entre les mots sont importants pour la lisibilite

---

## Specificites culturelles a connaitre

Pour chaque app, rechercher les **termes et habitudes specifiques** du marche cible :

- **FR** : brocante, vide-greniers (ou les gens trouvent des objets)
- **DE** : Flohmarkt (marche aux puces), tres axe "Echtheit" (authenticite)
- **RU/PL** : systeme "проба/proba" avec numeros (585, 750, 333) — les inclure dans les keywords
- **JA** : notations locales (K18 au lieu de 18K), unites de mesure locales
- **ZH** : standards locaux (足金, 千足金), la Chine est souvent le plus gros marche
- **KO** : traditions locales (돌반지 pour l'or), unites locales
- **IT** : marche fort pour le luxe/bijoux/mode
- **PT** : toujours penser BR + PT (2 marches differents, memes mots)
- **NL** : petit marche mais peu de concurrence ASO, facile a ranker

---

## Structure du fichier store listing

Chaque langue a un fichier `store_listings/{lang}.md` :

```markdown
# Store Listing - {Langue} ({code})

## Screenshots Text (5 screenshots)

1: ...
2: ...
3: ...
4: ...
5: ...

## App Name (30 char max)

## Short Description (80 char max)

## Full Description

---

## iOS App Store

### Subtitle (30 char max)

### Promotional Text (170 char max)

### Keywords (100 char max, commas included)
```

---

## Checklist avant publication

- [ ] App Name < 30 chars dans CHAQUE langue (compter !)
- [ ] Short Description < 80 chars
- [ ] iOS Subtitle < 30 chars
- [ ] iOS Keywords < 100 chars (commas incluses)
- [ ] iOS Promotional Text < 170 chars
- [ ] Pas de repetition keywords entre Title, Subtitle et Screenshots
- [ ] Screenshots titles courts (max 3 lignes, tester DE/RU/PT)
- [ ] Screenshots ciblent des keywords DIFFERENTS du Title/Subtitle
- [ ] Termes adaptes a la langue cible (pas traduits betement)
- [ ] URLs privacy/terms correctes
- [ ] Mention subscription dans la Full Description (ex: "Some premium features require a subscription.") — **OBLIGATOIRE Apple guideline 2.3.2, j'ai été rejeté sur les dernieres apps ! **
- [ ] Grammaire verifiee — surtout FR/IT : pas de "Noun Noun" sans preposition apres un verbe
- [ ] Relire chaque titre a voix haute : si ca sonne spammy, reformuler
