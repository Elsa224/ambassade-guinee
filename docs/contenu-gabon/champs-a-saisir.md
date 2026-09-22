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

---

## Etat de la saisie au 22/09/2026

Releve sur l'API. Ce document garde ce qui est fait, marque comme tel, plutot
que de le supprimer : le chemin parcouru reste lisible.

| Bloc | Dev | Production |
|---|---|---|
| Bandeau, mot de bienvenue, Ambassadeur, dirigeants | saisi | saisi |
| Adresse postale | saisie | saisie |
| Les quatre pages redactionnelles | **saisies et publiees** | a reporter |
| Juridiction et chiffres marquants | **saisis** | a reporter |
| Annuaire, cinq agents | a saisir | a saisir |
| Actualites, cinq articles | a saisir | a saisir |
| Nouvelles photographies (President, Ministre, Ambassadeur) | a poser | a poser |
| Numeros de telephone | **attendus du poste** | attendus |

Un guide de remplissage avec boutons de copie reprend les deux blocs a saisir :
https://claude.ai/code/artifact/019381df-a62d-48a1-af36-8a9f6e23baa6

---

## Annuaire — l'equipe de la chancellerie

Six portraits transmis par le poste le 22/09, avec les noms et les fonctions.
Les photographies optimisees sont dans
`~/VueJS/medias-gabon/a-televerser/equipe-chancellerie/`.

**L'Ambassadeur n'entre PAS dans cette liste.** La page de la chancellerie le
tire du bloc « L'Ambassadeur » du contenu d'accueil ; l'inscrire aussi dans le
personnel l'afficherait deux fois. Sa nouvelle photographie se pose dans
Contenu de l'accueil.

L'ordre ci-dessous est celui du poste, et le conserver a un effet visible : la
page derive l'ordre des services de la position de leurs membres.

| # | Nom | Fonction | Service | Photographie |
|---|---|---|---|---|
| 1 | Barry Diawadou | Premier conseiller, chargé des affaires consulaires | Service Visa et Actes consulaires | `premier-conseiller.webp` |
| 2 | Syron Amiss NDONG MINSTA | Conseiller économique, chargé de la Chancellerie | Service économique et commercial | `conseiller-economique.webp` |
| 3 | Guy-Roger ROMBONOT MOUSSAVOU | Conseiller académique et culturel | *(vide)* | `conseiller-academique.webp` |
| 4 | Oswald Kevin DOUKAGHA | Conseiller communication, chargé des médias | Unité de communication et de digitalisation | `conseiller-communication.webp` |
| 5 | Pyssame Gael IVALA | Chef du Protocole | *(vide)* | `chef-du-protocole.webp` |

**Reserves a lever :**

- **L'Ambassadeur n'entre PAS dans l'annuaire.** La page de la chancellerie le tire du bloc « L'Ambassadeur » du contenu d'accueil. L'inscrire aussi dans le personnel l'afficherait deux fois. Sa nouvelle photographie se pose dans Contenu de l'accueil, pas ici.
- **Deux agents ne relèvent d'aucun des quatre services.** Le Conseiller académique et culturel et le Chef du Protocole : les quatre services que l'ambassade nomme dans son propre texte ne les couvrent pas. Laisser leur service vide les range en fin de liste sans titre de groupe, ce qui est correct. À faire trancher par le poste.
- **Un service reste sans agent.** « Responsabilité administrative et financière » est nommée dans le texte de la chancellerie mais aucun des six noms transmis ne s'y rattache.
- **Deux orthographes à confirmer.** « Pyssame Gael IVALA » — « Gaël » prend peut-être un tréma. Et le document écrit « Conseiller accademique et culturelle » : corrigé en « académique et culturel », accordé au masculin comme le mot « Conseiller ».
- **Deux personnes viendront plus tard.** La secrétaire particulière de l'Ambassadeur et la secrétaire du pool des conseillers, annoncées par le poste. Elles s'ajouteront à la suite, sans rien changer à ce qui précède.

---

## Articles — la revue de presse du 4 juin au 11 septembre

Cinq articles tires du document de revue de presse envoye par le poste. Les
corps sont dans le dossier `actualites/` voisin, un fichier par article. Les
images sont dans `~/VueJS/medias-gabon/a-televerser/actualites/`.

Les cinq portent la categorie **Actualites de l'ambassade** et prennent la date
de l'EVENEMENT, non celle de la saisie. Le statut doit passer a **Publie** :
laisse en brouillon, l'article n'apparait pas sur le site.

### 1. Présentation des copies figurées des lettres de créance de l'Ambassadeur du Gabon en République de Guinée

**Date de publication** : 4 juin 2026 &nbsp;·&nbsp; **Image** : `01-lettres-de-creance-copies-figurees.webp`

**Resume**

```
Le 4 juin 2026, l'Ambassadeur Persis Lionel Essono Ondo a présenté les copies figurées de ses lettres de créance au ministre guinéen des Affaires étrangères, étape protocolaire préalable à leur remise officielle au Chef de l'État.
```

**Contenu** : coller `actualites/2026-06-04-copies-figurees.html` (1848 caracteres).

### 2. AFG Bank Guinée se lance officiellement à Conakry en présence de l'Ambassadeur du Gabon

**Date de publication** : 28 juin 2026 &nbsp;·&nbsp; **Image** : `02-afg-bank-guinee-lancement.webp`

**Resume**

```
Le groupe bancaire panafricain Atlantic Financial Group a lancé ses activités en Guinée le 28 juin 2026. L'Ambassadeur du Gabon a pris part à la cérémonie, marquant la dimension régionale de ce déploiement.
```

**Contenu** : coller `actualites/2026-06-28-afg-bank.html` (1529 caracteres).

### 3. Mission d'inspection à Kindia : l'Ambassadeur du Gabon visite les installations industrielles du groupe SONOCO

**Date de publication** : 3 juillet 2026 &nbsp;·&nbsp; **Image** : `03-sonoco-kindia-inspection.webp`

**Resume**

```
Le 3 juillet 2026, l'Ambassadeur du Gabon a inspecté les installations de la société SONOCO à Kindia, afin d'évaluer sa capacité à accompagner un projet envisagé au Gabon et d'identifier des partenariats industriels entre les deux pays.
```

**Contenu** : coller `actualites/2026-07-03-sonoco.html` (2129 caracteres).

### 4. L'Ambassadeur du Gabon en Guinée à la finale de la Coupe de l'Unité africaine à Conakry

**Date de publication** : 23 juillet 2026 &nbsp;·&nbsp; **Image** : `04-coupe-unite-africaine-finale.webp`

**Resume**

```
L'Ambassadeur du Gabon a pris part le 23 juillet 2026 à la finale de la Coupe de l'Unité africaine à Conakry, une rencontre placée sous le signe de la fraternité et du rapprochement entre les peuples du continent.
```

**Contenu** : coller `actualites/2026-07-23-coupe-unite.html` (2213 caracteres).

### 5. Présentation des lettres de créance de l'Ambassadeur du Gabon au Président de la République de Guinée

**Date de publication** : 11 septembre 2026 &nbsp;·&nbsp; **Image** : `05-lettres-de-creance-president.webp`

**Resume**

```
Le 11 septembre 2026, au Palais Mohammed V, l'Ambassadeur Persis Lionel Essono Ondo a remis ses lettres de créance au Général Mamadi Doumbouya, Président de la République de Guinée, aux côtés de neuf autres ambassadeurs nouvellement accrédités.
```

**Contenu** : coller `actualites/2026-09-11-lettres-de-creance.html` (2609 caracteres).

**La photographie du 11 septembre est trop petite** : 472 px de large, la ou
la page d'article en affiche environ 900. Elle sera visiblement floue, et c'est
l'article le plus important des cinq. A redemander au poste.

### Ce qui a ete corrige dans le texte du poste

Le fond n'a pas ete reecrit. Seules des fautes materielles ont ete reprises :

| Ou | Quoi |
|---|---|
| Titre de l'article du 4 juin | « … lettres de créance l'Ambassadeur du Gabon » — il manquait « de ». |
| Article du 4 juin | « Conackry » corrigé en « Conakry ». |
| Titre de l'article du 11 septembre | « à son Excellence General Mamadi DOUMBOUYA, Président de la République Chef de l'Etat » : capitales, accent sur « État », virgule manquante. Le titre a été raccourci, la formule complète restant dans le premier paragraphe. |
| Article du 11 septembre | « DOUMBAOUYA » corrigé en « DOUMBOUYA » — le document écrit le nom de deux façons dans le même article. |
| Partout | « COMMUNICATION DE L'AMBASSADE » devient une signature en italique en fin d'article, au lieu d'une ligne en capitales. |
| Partout | dates en toutes lettres homogénéisées (« 04 juin » → « 4 juin »), doubles espaces supprimés, « coopération sud-sud » → « Sud-Sud ». |
