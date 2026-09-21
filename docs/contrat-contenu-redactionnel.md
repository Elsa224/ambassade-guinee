# Contenu redactionnel des pages de l'ambassade — contrat propose

> Proposition ecrite par la session front le 2026-09-21. Elle ne demande rien
> de nouveau a l'ambassade : le texte existe deja, le secretariat de
> l'ambassade du Gabon l'a transmis dans sa FICHE DE RENSEIGNEMENTS du
> 2026-09-17 (reponse rendue dans `docs/reponse-fiche-renseignements-gabon.md`).
> Il n'a simplement aucun endroit ou se poser. Le back reste libre de la forme
> interne ; ce document fige **ce que le front appelle et ce qu'il lit**. En
> cas d'ecart, c'est le document du depot back qui tranchera, comme pour le
> bootstrap, le contenu d'accueil et les services consulaires.

## Pourquoi

Trois pages du site public portent encore, compile dans le bundle, le texte de
l'ambassade de Guinee aux Etats-Unis :

| Page | Lignes ecrites en dur | Ce qu'elle raconte aujourd'hui |
| --- | --- | --- |
| `/presentation` | `src/components/ambassade/Presentation.vue`, 428 | « Ambassade de la Republique de Guinee », juridiction « Etats-Unis, Costa-Rica, Haiti, Bahamas », « 1959 », « 186 ambassades a Washington DC » |
| `/relations-bilaterales` | `src/views/RelationsBilaterales.vue`, 324, plus cinq pages pays (`Usa`, `CostaRica`, `Haiti`, `Bahamas`, `FondMonetaire`), 2 117 | les relations de la Guinee avec quatre pays qui ne concernent aucune autre ambassade |
| `/chancellerie` | `src/components/ambassade/Chancellerie.vue`, 202 | l'annuaire vient du CMS depuis la PR #31 ; **le texte de mission et la liste de juridiction ont ete retires sans remplacement**, faute de contrat |

Soit environ 3 000 lignes de contenu guineen. La parade actuelle est une
fermeture : les rubriques `presentation` et `bilateral` sont FERMEES pour toute
ambassade dont le slug n'est pas `CONTENU_INTEGRE_DE` (`src/tenant/rubriques.ts`).
Cela protege le Gabon de montrer le contenu guineen, mais ne lui donne rien :
sur `ambagabonguinee.com`, « Presentation » et « Relations bilaterales »
n'existent pas.

La fiche du secretariat gabonais remplit exactement ces pages-la : presentation
du Gabon, relations Gabon-Guinee, onze domaines de cooperation, missions de
l'ambassade en neuf sections, presentation de la Chancellerie, vision de la
digitalisation. Le contenu officiel est ecrit, signe, et attend une case.

## Une regle de forme, tiree du contenu recu

Les neuf sections de missions de la fiche gabonaise ne sont pas les quatre
cartes du gabarit (« Representer, Informer, Negocier, Proteger »). Un schema
qui imposerait les memes rubriques a toutes les ambassades les forcerait a
retrancher leur texte ou a laisser des blocs vides. Le corps de chaque page est
donc un **`body_html` libre et assaini**, comme le mot de bienvenue et comme le
corps des services consulaires.

Deux exceptions, et seulement deux : la juridiction et les chiffres marquants
sont des donnees, pas de la prose. Le gabarit les dessine (une liste a puces
dans une carte, quatre grands nombres sur un bandeau colore), et du HTML libre
les rendrait en paragraphes ternes. Ils recoivent donc des champs propres.

## Surface visiteur

Un seul appel, anonyme, resolu par domaine (en-tete `X-Embassy-Domain` ou
parametre `?domain=` en local, comme `/api/bootstrap`).

```
GET /api/content/pages
```

```json
{
  "data": {
    "pages": [
      {
        "id": 4,
        "slug": "presentation",
        "title": "L'Ambassade du Gabon en Republique de Guinee",
        "subtitle": "Une mission au service du rayonnement du Gabon",
        "hero_image_url": "https://cms.test/pages/presentation.webp",
        "body_html": "<h2>Nos missions</h2><p>...</p>",
        "position": 1,
        "published": true
      }
    ],
    "jurisdiction": ["Republique de Guinee", "Republique de Sierra Leone"],
    "figures": [
      { "value": "2026", "label": "Annee d'etablissement" },
      { "value": "11", "label": "Domaines de cooperation" }
    ]
  }
}
```

Les regles, dans l'ordre d'importance :

1. **Toujours 200, jamais 404.** Une ambassade qui n'a rien saisi recoit
   `{"data": {"pages": [], "jurisdiction": [], "figures": []}}`. Meme
   discipline de retractation que les jours feries et le contenu d'accueil :
   le front n'affiche alors rien, et surtout ne retombe jamais sur le gabarit.
2. **`slug` est pris dans une liste fermee**, celle des pages que le gabarit
   sait dessiner : `presentation`, `chancellerie`, `relations-bilaterales`.
   Ce n'est pas un identifiant libre : chaque slug correspond a une route du
   site. Une page dont le slug est inconnu du front est ignoree, sans erreur.
   Ouvrir des pages libres est un sujet distinct, voir « Ce qui reste a
   trancher ».
3. **`published` a `false` retire la page du payload visiteur.** Le front ne
   filtre pas : ce qui est servi est publie. Le champ n'apparait que sur la
   surface d'administration.
4. **`body_html` est assaini par le serveur**, profil « riche » (titres,
   listes, liens, gras, italique, tableaux), comme le corps des services
   consulaires. Le front le rend sans le retoucher ; il ne peut donc pas etre
   le maillon de confiance.
5. **`subtitle` et `hero_image_url` sont facultatifs** et valent `null`. Le
   bandeau se rabat alors sur le nom de l'ambassade servi par le bootstrap,
   comme le fait deja `/chancellerie`.
6. **`position` ordonne l'affichage**, et peut porter des trous. L'ordre servi
   fait foi : le front ne retrie pas.
7. **`jurisdiction` et `figures` sont globaux a l'ambassade**, pas attaches a
   une page : la juridiction est affichee a la fois sur `/presentation` et sur
   `/chancellerie`, et la dupliquer dans deux corps de page garantirait qu'elle
   diverge. `figures` est une liste ordonnee de couples ; le gabarit en affiche
   quatre par ligne et s'accommode de deux comme de huit.

## Relations bilaterales

Les cinq pages pays actuelles (`/usa`, `/costa-rica`, `/haiti`, `/bahamas`,
`/fond-monetaire`) sont des routes ecrites en dur pour la Guinee. Elles
disparaissent au profit d'une collection, resolue par domaine :

```
GET /api/content/bilateral-relations
```

```json
{
  "data": [
    {
      "id": 1,
      "slug": "guinee",
      "country_name": "Republique de Guinee",
      "flag_image_url": "https://cms.test/pays/guinee.webp",
      "summary": "Une amitie ancienne, onze domaines de cooperation.",
      "body_html": "<h2>Cooperation economique</h2><p>...</p>",
      "position": 1,
      "published": true
    }
  ]
}
```

Le front sert alors `/relations-bilaterales` comme index (une carte par pays,
drapeau, nom, resume) et `/relations-bilaterales/{slug}` comme page. Memes
regles que ci-dessus : 200 toujours, tableau vide pour une ambassade sans
relations publiees, `body_html` assaini, ordre servi faisant foi.

Une institution internationale (le FMI pour la Guinee) entre dans la meme
collection : c'est un partenaire avec un nom, un logo et un texte. Rien dans
le schema ne distingue un pays d'une institution, et rien ne doit le faire —
sinon chaque ambassade devra ranger ses partenaires dans une taxonomie qui
n'est pas la sienne.

## Surface d'administration

Memes conventions que les services consulaires : role requis, corps complet en
remplacement, 422 avec `errors` par champ, 204 sur suppression.

```
GET    /api/admin/pages
PUT    /api/admin/pages/{slug}
GET    /api/admin/bilateral-relations
POST   /api/admin/bilateral-relations
PATCH  /api/admin/bilateral-relations/{id}
DELETE /api/admin/bilateral-relations/{id}
PUT    /api/admin/pages-settings        (jurisdiction, figures)
```

Deux precisions que le front demande noir sur blanc, pour avoir ete mordu
ailleurs :

- **`PUT /api/admin/pages/{slug}` cree ou remplace.** Les pages ne se creent
  pas : leur liste est fermee. Un `PUT` sur un slug qui n'a pas encore de ligne
  doit la creer, et non rendre 404 — c'est exactement le chemin qui a produit
  l'incident 500 sur `PUT /api/admin/content/welcome` en production.
- **Le remplacement est complet.** Un champ absent du corps est mis a `null`,
  il n'est pas conserve. Si le back prefere la fusion, qu'il le dise : le front
  enverra tous les champs dans les deux cas, mais l'ecran d'administration
  n'affichera pas la meme promesse.

## Bornes des champs

| Champ | Type | Borne proposee |
| --- | --- | --- |
| `slug` | chaine | liste fermee cote pages ; 2 a 60 caracteres, minuscules, tirets, unique par ambassade cote relations |
| `title` | chaine | 3 a 180 caracteres, obligatoire |
| `subtitle` | chaine ou null | 200 caracteres |
| `country_name` | chaine | 2 a 120 caracteres, obligatoire |
| `summary` | chaine ou null | 400 caracteres |
| `body_html` | chaine ou null | 200 000 caracteres avant assainissement |
| `hero_image_url`, `flag_image_url` | URL ou null | image televersee par le CMS |
| `position` | entier | 0 a 9 999 |
| `published` | booleen | defaut `false` |
| `jurisdiction[]` | chaine | 1 a 120 caracteres, 20 entrees au plus |
| `figures[].value` | chaine | 1 a 12 caracteres — une chaine et non un entier : « 11 », « 2026 », mais aussi « 1 200+ » |
| `figures[].label` | chaine | 1 a 80 caracteres, 8 entrees au plus |

## Ce que le front fait de tout cela

- `/presentation`, `/chancellerie` et `/relations-bilaterales` cessent d'etre
  gardees par les drapeaux `presentation` et `bilateral` : elles se retractent
  d'elles-memes quand le CMS ne sert rien, comme `/ambassadeur`,
  `/consuls-honoraires` et `/calendrier` avant elles. Les drapeaux
  disparaissent de `RUBRIQUE_PAR_CHEMIN`.
- Les cinq pages pays guineennes et leurs routes sont supprimees.
- Environ 3 000 lignes de contenu guineen quittent le bundle, et la constante
  `CONTENU_INTEGRE_DE` perd ses derniers usages : c'est la fin annoncee des
  fuites d'identite du gabarit, voir `docs/` et la PR #78.
- Un ecran d'administration `/dashboard/contenu/pages` recoit les trois pages,
  la juridiction et les chiffres ; un second recoit les relations bilaterales.

## Ce qui reste a trancher par le back

1. **Pages libres.** Le contrat ci-dessus ferme la liste des slugs, parce que
   chaque page a un gabarit dessine. Une ambassade qui voudrait une page
   « Bourses d'etudes » n'a aujourd'hui aucun moyen de l'obtenir. Faut-il
   prevoir des maintenant des pages libres avec leur entree de menu, ou
   attendre qu'une ambassade le demande ? Le front recommande d'attendre : une
   page libre demande un editeur de menu, qui est un chantier a part.
2. **Documents a telecharger.** Le CMS televerse des IMAGES. La fiche gabonaise
   annonce des formulaires consulaires a telecharger, et ils n'ont aucun endroit
   ou se poser. Le nombre et le format ont ete demandes a l'ambassade ; si la
   reponse est « une dizaine de PDF », c'est un contrat de plus, pas un champ.
3. **`og:description`.** La demande de contrat du 2026-09-15 laissait ce champ
   sans porteur. Le `subtitle` de la page `presentation` pourrait le porter, ou
   un champ dedie dans les parametres de l'ambassade. A trancher avec le point
   `og:` par domaine, qui reste le plus urgent des contrats en attente.
4. **Le texte sur la digitalisation.** La fiche gabonaise annonce des services
   qui n'existent pas encore (rendez-vous, pre-demandes en ligne, suivi de
   dossier). Publie tel quel dans `body_html`, il sera lu comme une promesse.
   Ce n'est pas un point de contrat mais une decision editoriale, deja posee a
   l'ambassade dans la reponse du 2026-09-17.
