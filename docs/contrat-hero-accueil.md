# Banniere d'accueil (hero) servie par le CMS — contrat propose

> Proposition ecrite par la session front le 2026-09-17, a la demande de
> l'ambassade du Gabon. Une seconde maquette de banniere existe (un diaporama
> plein ecran, visible sur https://ambassade-gabon.vercel.app/), et la
> direction la veut. Elle ne doit pas remplacer la banniere actuelle du
> gabarit : chaque ambassade choisira la sienne depuis son administration.
> Amende le meme jour par la session back, qui l'accepte sur le fond : ses
> sept amendements sont integres ici (bloc toujours present a `null`, `intro`
> en texte brut et non en HTML assaini, bornes comptees en caracteres,
> suppression franche qui emporte les diapositives, creation par l'une ou
> l'autre route, diaporama vide enregistrable). Le back reste libre de la forme
> interne ; ce document fige **ce que le front appelle et ce qu'il lit**. En cas
> d'ecart, c'est le document du depot back qui tranchera, comme pour le
> bootstrap et le contenu d'accueil.

## Pourquoi

La banniere d'accueil du gabarit est aujourd'hui ecrite en dur : une image de
fond compilee dans le bundle, un titre qui reprend le nom de l'ambassade, deux
boutons decides par le code, et une grille de photos de vitrine. Elle n'a
aucune accroche, parce que le faux texte de maquette a ete retire sans que
rien ne le remplace.

La maquette gabonaise propose autre chose : un diaporama plein ecran, trois
images de fond qui defilent, et sur chaque vue une citation signee. C'est une
**mise en page differente du meme bloc**, pas un bloc supplementaire.

Deux bannieres compilees dans le meme gabarit, dont une seule s'affiche selon
le domaine, reconstituerait exactement la panne qu'on a passe trois semaines a
demonter : le contenu d'une ambassade present dans le bundle d'une autre. La
banniere devient donc du contenu, servie par le CMS et choisie par l'ambassade.

Le defaut est la banniere actuelle. Une ambassade qui ne saisit rien garde ce
qu'elle a aujourd'hui : cette proposition n'ecrase rien.

## Surface visiteur

Pas de nouvel appel : un bloc `hero` s'ajoute a la reponse existante de
`GET /api/content/home`, a cote de `welcome`, `ambassador`, `leaders` et
`showcase`.

```json
{
  "data": {
    "hero": {
      "variant": "diaporama",
      "title": "Ambassade de la Republique du Gabon en Guinee",
      "intro": "Bienvenue sur le portail officiel de l'Ambassade du Gabon en Guinee. Retrouvez l'ensemble de nos services consulaires, demarches administratives et actualites diplomatiques.",
      "slides": [
        {
          "id": 1,
          "image_url": "https://cms.example.org/storage/hero/1.webp",
          "quote": "Notre engagement est de renforcer les liens d'amitie et de cooperation entre le Gabon et la Guinee.",
          "author": "SEM Brice Clotaire Oligui Nguema",
          "position": 1
        }
      ]
    },
    "welcome": { "…": "inchange" }
  }
}
```

### Champs

| Champ | Type | Regle |
| --- | --- | --- |
| `variant` | `"classique"` \| `"diaporama"` | Obligatoire des lors que `hero` est servi. Toute autre valeur est traitee par le front comme `classique`. |
| `title` | `string \| null` | 200 caracteres. `null` : le front affiche le nom de l'ambassade du bootstrap, comme aujourd'hui. |
| `intro` | `string \| null` | 400 caracteres, texte brut. `null` : aucune accroche affichee. |
| `slides` | tableau | Vide autorise. Au plus 5 elements. |
| `slides[].image_url` | `string` | URL absolue, televersee par la meme route media que le reste du contenu. |
| `slides[].quote` | `string \| null` | 300 caracteres, texte brut. |
| `slides[].author` | `string \| null` | 120 caracteres. |
| `slides[].position` | `entier` | Ordre d'affichage, comme `leaders` et `showcase`. |

La cle `hero` est **toujours presente**. Sa valeur d'absence est `null`, comme
`welcome` et `ambassador` ; les listes, elles, valent `[]`. « Absent ou null »
seraient deux etats pour un seul sens, et le front finirait par n'en tester
qu'un. `"hero": null` vaut donc « l'ambassade n'a rien choisi » : le front sert
la banniere actuelle. C'est la meme discipline que les autres blocs — l'absence
n'est jamais remplacee par le contenu d'une autre ambassade.

### Quatre champs de texte brut, et aucun HTML

`title`, `intro`, `quote` et `author` sont du texte brut, stocke en texte brut :
les balises sont **retirees a l'ecriture**, pas echappees. Ils se lient donc en
interpolation normale, jamais avec `v-html`. C'est ecrit ici parce que le
gabarit porte deja des champs assainis qui, eux, s'inserent en `v-html`
(`welcome.body_html`, la biographie, le corps d'un service) : le reflexe
existe, et il passerait la revue.

Leurs bornes — 200, 400, 300 et 120 — sont comptees en **caracteres**, pas en
octets. La lecon vient de `body_html`, ou le plafond etait en octets et ou
l'assainissement ajoutait des octets invisibles : l'editrice ne comptait pas la
meme chose que le serveur. Ici rien n'est ajoute, et les deux comptes
coincident.

### Deux regles que le front applique seul

Elles ne demandent rien au back, elles sont ecrites ici pour que les deux
sessions lisent la meme chose.

1. **`diaporama` sans diapositive retombe sur `classique`.** Un diaporama vide
   n'est pas un diaporama, c'est un aplat noir plein ecran ou personne ne
   trouve le menu. Le front ne fait donc pas confiance a la seule valeur du
   champ : il verifie qu'il y a au moins une image.

   Le back, lui, **enregistre** cette combinaison sans broncher, et c'est
   voulu : la refuser imposerait un ordre de saisie — les images d'abord, la
   variante ensuite — que rien ne justifie. La regle de repli n'a de sens qu'a
   l'affichage, c'est-a-dire ici.
2. **Les boutons de la banniere restent au front.** La maquette en montre deux
   (« Nos Services » et « Voir plus »), le gabarit en montre deux autres. Ils
   ne sont pas saisis : ils sont deduits des modules ouverts pour l'ambassade,
   comme aujourd'hui. Une adresse de destination saisie a la main pointerait
   tot ou tard sur une page fermee, et un libelle saisi a la main ne serait
   traduit nulle part. Si la direction veut un jour choisir la destination, ce
   sera une liste fermee des rubriques ouvertes, pas un champ libre — c'est un
   avenant, pas ce contrat.

### Ce que ce contrat ne porte pas

Les couleurs. La maquette ecrit le jaune gabonais `#FCD116` en dur dans la
banniere ; le gabarit tire deja `primary`, `secondary` et `accent` du tenant.
Le back a verifie le point : `#FCD116` **est deja** le `color_secondary` du
locataire Gabon, et `#009E60` son `color_primary`. Les jetons existent, la
variante `diaporama` n'a rien a inventer. Aucune couleur n'est saisie.

## Surface d'administration

Sous le prefixe existant `/api/admin/content`, authentifie, ambassade resolue
par le compte.

```
GET    /api/admin/content/home          -> le bloc `hero` s'ajoute a la reponse
PUT    /api/admin/content/hero          -> remplace variant, title et intro
DELETE /api/admin/content/hero          -> 204, l'ambassade revient au defaut

POST   /api/admin/content/hero/slides         -> cree une diapositive
PATCH  /api/admin/content/hero/slides/{id}    -> modifie une diapositive
DELETE /api/admin/content/hero/slides/{id}    -> 204
PUT    /api/admin/content/hero/slides/order   -> { "ids": [3, 1, 2] }
```

Le corps du `PUT /hero` porte `variant`, `title` et `intro`, et **rien
d'autre** : les diapositives ont leurs propres routes, comme `leaders` et
`showcase`. Un `PUT /hero` ne les touche pas. L'effacement franc est reserve au
`DELETE`, et c'est la toute la difference entre les deux gestes. Les
images passent par `POST /api/admin/content/media`, deja en place, avec les
memes bornes (WebP, PNG ou JPEG, 5 Mo) : on televerse, le serveur rend une URL,
et `image_url` porte cette URL a l'ecriture comme a la lecture. Le front ne
manipule jamais de cle de stockage.

Le bloc se cree par le **premier `PUT /hero` ou le premier
`POST /hero/slides`, indifferemment**. Aucun 409 pour avoir appele les deux
routes dans un ordre plutot que dans l'autre : l'ordre des gestes de l'editrice
ne regarde pas le serveur.

C'est le back qui refuse une sixieme diapositive, en 422 avec un message en
francais presentable. Le front en affiche cinq au plus mais ne tranche pas.

### La suppression est franche, et l'ecran doit le dire

`DELETE /hero` **emporte les diapositives**. Un « retour au defaut » qui
garderait secretement cinq images, pretes a reapparaitre a la prochaine
ecriture de la banniere, est un piege : l'editrice croit avoir efface, et le
contenu ressuscite des semaines plus tard sans que personne comprenne.

Consequence pour l'ecran d'administration, qui est une obligation du front et
pas une preference : si un bouton propose de revenir a la banniere par defaut,
il doit annoncer en toutes lettres que les diapositives seront perdues. Celle
qui veut garder ses images en affichant la banniere simple ne supprime rien —
elle pose `variant: classique`. C'est precisement a cela que sert la variante.

## Contrat d'erreur

Celui de `docs/contrat-contenu-accueil.md`, inchange : `message` en francais
directement affichable, 422 pour une saisie refusee, 413 pour un fichier trop
lourd.

## Ce que le front doit traiter, et que la maquette ne dit pas

Ces points sont sortis de la lecture du composant d'origine
(`Danielle074/ambassade-gabon`, commit `76cc338`). Ils ne demandent rien au
back ; ils sont notes ici parce qu'ils conditionnent la reprise.

- **L'en-tete doit passer en surimpression, et seulement la.** La maquette
  accompagne son diaporama d'une barre de navigation translucide a texte blanc,
  posee par-dessus l'image plein ecran. Ce traitement ne tient que devant un
  fond sombre : applique partout, il rendrait le menu illisible sur toutes les
  autres pages, et sur la variante `classique` dont le fond est clair. Le mode
  surimpression suit donc la variante **et** la route d'accueil ; ailleurs,
  l'en-tete reste celui du gabarit.
- **Le defilement automatique tourne toutes les 6 secondes**, et un clic sur
  une pastille le relance depuis zero plutot que de le laisser reprendre la
  main aussitot. Il s'arrete sous `prefers-reduced-motion`, et la premiere
  diapositive reste alors affichee : une banniere qui bouge toute seule n'est
  pas negociable pour qui a demande qu'elle ne bouge pas.
- **Le texte du diaporama est pose sur un voile, pas sur la photo.** C'est la
  seule regle de cette liste qui ne se rattrape pas apres coup, et elle merite
  d'etre lue avant d'ecrire le gabarit.

  Le controle de contraste de l'ecran des parametres juge une couleur contre
  une autre couleur. Ici, le titre, l'accroche, la citation et la signature ne
  sont pas poses sur une couleur : ils sont poses sur une **photographie
  televersee par l'ambassade**. Aucune valeur n'est mesurable a l'avance, le
  rapport varie d'un point a l'autre de la meme image, et ni le formulaire ni
  l'API ne savent ce que contient le fichier. Une editrice qui choisit une
  photo de ciel clair rend son propre titre illisible, et rien ne l'en
  avertit.

  La reponse est donc structurelle et non mesurable. Deux dispositifs, et les
  deux, pas l'un ou l'autre :

  1. un voile assombrissant **systematique** entre l'image et le texte, avec
     un plancher qui ne descend pas au milieu de la banniere — la maquette
     d'origine y passe a `black/20`, ce qui suffit devant ses trois portraits
     sombres et ne suffira pas devant la premiere photo claire ;
  2. derriere le seul bloc de texte, un fond plus dense encore, pour que la
     lisibilite ne depende pas de ce que l'image contient a cet endroit-la.

  Cote API, la contrainte est nulle : le back ne sert que l'URL de l'image, le
  gabarit pose ce qu'il veut par-dessus. Point souleve par la session back le
  2026-09-17, pendant l'implementation, et note ici plutot que decouvert par
  une ambassade.

- **Le bouton flottant « calendrier » n'est pas repris.** Il est declare
  `fixed` a l'interieur de la section : il suit donc le visiteur sur toute la
  page, alors qu'il est ecrit comme un element de la banniere. Le gabarit a
  deja sa route `/calendrier`, servie par le CMS et gardee par son module.
- **Les trois textes de la maquette ne sont pas repris non plus.** Deux sont
  encore des marqueurs de maquette en production (« Texte de la deuxieme
  slide. A personnaliser… », signe « AUTEUR 2 »). C'est precisement ce que ce
  contrat supprime : ces textes se saisissent.

## Ce que le front garantit de son cote

- La banniere actuelle reste le defaut, pour toute ambassade qui ne saisit
  rien, y compris celles deja en ligne.
- Un `variant` inconnu, un bloc partiel, un tableau de diapositives vide : rien
  ne casse, on retombe sur le defaut.
- Aucune image de la maquette gabonaise n'entre dans le bundle. Les trois fonds
  du diaporama sont televerses par l'ambassade.

## Voir aussi

- `docs/contrat-contenu-accueil.md` — le bloc auquel `hero` s'ajoute.
- `docs/contrat-services-consulaires.md` — la meme discipline de retractation.
- `Danielle074/ambassade-gabon`, commit `76cc338` « remplacement de hero par
  des hero en slides » — la maquette d'origine, sur l'ancien depot
  mono-ambassade. Rien n'en est fusionne : elle est relue, pas reprise.
