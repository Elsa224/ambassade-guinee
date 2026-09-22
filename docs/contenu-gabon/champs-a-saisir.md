# Champs courts à saisir — tenant gabon-guinee

> **Etat au 22/09/2026 — releve sur l'API de dev et de production.**
> Tout ce document est SAISI des deux cotes : accroche du bandeau, mot de
> bienvenue, nom, titre, biographie et photographie de l'Ambassadeur, les deux
> titres de dirigeants a corriger, et l'adresse postale. Les textes ci-dessous
> restent la reference de ce qui a ete pose, ils ne sont plus une liste de
> taches.
>
> Ce qui reste vide en production : les **numeros de telephone**
> (`contact.phones` est un tableau vide), l'**annuaire** (`staff` et `consuls`
> vides, faute de liste envoyee par le poste) et les **pages redactionnelles**
> — la route `/api/content/pages` rend encore 404 en production, elle repond
> sur dev mais aucune des quatre pages n'y est redigee.
>
> Les trois citations du diaporama sont volontairement vides : sans citation,
> le bandeau se centre, conformement a la variante retenue en PR #75.

---

Chaque bloc indique l'écran, le champ et sa limite. Les textes longs sont dans
les deux fichiers `.html` voisins, à coller tels quels dans les zones de texte
correspondantes : le champ accepte les balises simples (paragraphes, gras,
italique, retours à la ligne).

---

## Tableau de bord / Contenu de l'accueil — Bandeau

**Titre** (200 caractères au maximum)

```
Représenter. Protéger. Rassembler. Coopérer.
```

**Accroche** (400 caractères au maximum, 308 utilisés)

```
Au service de la diplomatie gabonaise, de l’amitié entre les peuples et d’un partenariat d’avenir entre le Gabon et la Guinée. L’Ambassade porte la voix de la République Gabonaise, défend ses intérêts et œuvre au renforcement des relations d’amitié, de fraternité et de coopération avec la République de Guinée.
```

Le bandeau est en mode diaporama, qui affiche le titre et l'accroche par-dessus
la photographie. **Le titre vide laisse le nom de l'ambassade s'afficher**, ce
qui est le cas aujourd'hui : poser l'accroche à sa place est un choix à
confirmer. L'autre voie est de laisser le nom en titre et de faire commencer
l'accroche par les quatre verbes.

**Les trois diapositives portent la même citation**, attribuée au Président.
La fiche n'en fournit aucune. Deux possibilités : n'en garder qu'une sur la
première photographie et vider les deux autres, ou demander au poste trois
citations distinctes.

---

## Tableau de bord / Contenu de l'accueil — Mot de bienvenue

**Titre** (191 caractères au maximum)

```
Mot de bienvenue de l'Ambassadeur
```

**Texte** : coller `mot-de-bienvenue.html` (11 paragraphes). Il remplace le
texte provisoire non signé actuellement en ligne.

---

## Tableau de bord / Contenu de l'accueil — L'Ambassadeur

**Nom** (191 caractères au maximum)

```
Son Excellence Monsieur Persis Lionel Essono Ondo
```

**Titre** (191 caractères au maximum)

```
Ambassadeur Extraordinaire et Plénipotentiaire de la République Gabonaise près la République de Guinée
```

**Texte** : coller `biographie-ambassadeur.html` (13 paragraphes).

**Photographie** : posée le 22/09, elle est servie en production.

---

## Tableau de bord / Contenu de l'accueil — Dirigeants

Deux titres à corriger, un à laisser tel quel.

| Personne | Titre actuel | Titre à poser |
|---|---|---|
| Dr. Marie-Édith Tassyla-Ye-Doumbeneny | Ministre des Affaires Étrangères | Ministre des Affaires Étrangères et de la Coopération, chargée de l'Intégration et de la Diaspora |
| M. Persis Lionel Essono Ondo | Ambassadeur Extraordinaire et Plénipotentiaire | Ambassadeur Extraordinaire et Plénipotentiaire de la République Gabonaise près la République de Guinée |
| S. E. M. Brice Clotaire Oligui Nguema | Président de la République, Chef de l'État | inchangé, déjà exact |

Les deux titres ont été posés le 22/09 et sont servis en production.

---

## Tableau de bord / Paramètres de l'ambassade

**Adresse** (2 000 caractères au maximum)

```
Chancellerie, Centre Émetteur, Plaza Diamond lot 85, Conakry, République de Guinée
```

Saisie le 22/09 sur dev et en production, au libellé exact ci-dessus.

**Ce qui reste vide dans ce même écran** : les numéros de téléphone. Le premier
de la liste est celui que le site affiche partout. Le courriel
`ambassade@gabon-gn.org` et les horaires « du lundi au vendredi, 8h - 16h »
sont en place mais n'ont pas été confirmés par le poste.

---

## Tableau de bord / Pages de l'ambassade — les quatre pages rédactionnelles

Rien n'est rédigé aujourd'hui : `/api/content/pages` rend 404 en production
(le module n'y est pas encore déployé) et sert une liste vide sur dev. Tant
qu'une page n'est pas enregistrée, le site affiche « Rubrique en préparation »
à sa place — jamais le texte d'une autre ambassade.

Les quatre corps sont dans le dossier `pages/` voisin, un fichier par page, à
coller tels quels dans la zone de texte. Ils reprennent la fiche du
secrétariat sans la réécrire. La case **Publier** doit être cochée : une page
enregistrée mais non publiée reste invisible, et une page publiée sans texte
est annoncée « masquée » par l'écran, ce qui est la vérité.

---

### Présentation

**Titre** (200 caractères au maximum)

```
Une représentation au service de l'État, des citoyens et de la coopération
```

**Sous-titre** (200 caractères au maximum)

```
Représenter. Protéger. Rassembler. Coopérer.
```

**Texte** : coller `pages/presentation.html` (8022 caractères).

Le corps porte neuf sections numérotées puis « Le Gabon ». Le gabarit
compte ces titres et dessine de lui-même une grille de neuf cartes, puis
détache « Le Gabon » en bande de clôture : les numéros affichés sont ceux
écrits dans les titres, le gabarit n'en invente aucun. Ne pas retirer la
numérotation, elle est porteuse.

---

### La Chancellerie

**Titre** (200 caractères au maximum)

```
La Chancellerie diplomatique
```

**Sous-titre** (200 caractères au maximum)

```
La structure de la mission, et les femmes et les hommes qui la servent.
```

**Texte** : coller `pages/chancellerie.html` (643 caractères).

Ce texte s'affiche AU-DESSUS de l'équipe, sur la page qui présente les
agents. Il nomme les quatre services ; ce sont eux qui grouperont l'annuaire
le jour où le poste enverra la liste des agents.

---

### Relations bilatérales

**Titre** (200 caractères au maximum)

```
Gabon – Guinée : une relation d'amitié et de coopération
```

**Sous-titre** (200 caractères au maximum)

```
Fondée sur le respect mutuel et la solidarité entre les peuples africains.
```

**Texte** : coller `pages/relations-bilaterales.html` (3378 caractères).

Le corps porte trois sections : sous le seuil de quatre, le gabarit les
dessine en colonne de lecture plutôt qu'en grille. C'est voulu.

---

### Notre ambition numérique

**Titre** (200 caractères au maximum)

```
Une Ambassade moderne, accessible et connectée
```

**Sous-titre** (200 caractères au maximum)

```
Ce que l'Ambassade construit. Les services décrits ici ne sont pas encore ouverts.
```

**Texte** : coller `pages/ambition-numerique.html` (5583 caractères).

Le sous-titre dit explicitement que les services décrits ne sont pas encore
ouverts. Décision d'Elsa du 21/09 : le texte officiel est publié sans être
réécrit, mais sur une page qui se présente comme une vision et non comme une
offre de services. Ne pas supprimer cette phrase.

---

### Juridiction et chiffres marquants

Ces deux blocs sont globaux à l'ambassade, pas attachés à une page : ils
s'enregistrent une seule fois, par le bouton
« Enregistrer juridiction et chiffres » du même écran.

**Pays sous juridiction** : une ligne.

```
République de Guinée
```

**Chiffres marquants** : trois lignes, valeur puis libellé.

| Valeur | Libellé |
|---|---|
| 2026 | Année d'ouverture de la mission |
| 11 | Domaines de coopération |
| 1 | Pays sous juridiction |

La valeur est un texte libre et non un nombre : « 1 200+ » est accepté aussi
bien que « 11 ».
