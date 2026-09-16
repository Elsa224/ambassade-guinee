# Services consulaires servis par le CMS — contrat propose

> Proposition ecrite par la session front le 2026-09-16, a la demande de
> l'ambassade du Gabon, qui veut une rubrique « Nos services » alimentee par
> son administration. Le back reste libre de la forme interne ; ce document
> fige **ce que le front appelle et ce qu'il lit**. En cas d'ecart, c'est le
> document du depot back qui tranchera, comme pour le bootstrap et le contenu
> d'accueil.

## Pourquoi

La page `/services-ambassadeur` du gabarit est ecrite en dur et son texte est
celui de l'ambassade de Guinee aux Etats-Unis : elle parle des « ressortissants
guineens etablis aux Etats-Unis » et renvoie vers un prestataire americain.
Elle est aujourd'hui fermee pour toute ambassade qui ne declare pas le module
`services`, ce qui protege les autres tenants mais ne leur donne rien.

Les services consulaires sont du **contenu** : ils different d'un poste a
l'autre, ils changent (un tarif, un delai, une piece exigee), et ils
appartiennent a l'ambassade. Ils sont donc servis par le CMS, resolus par
domaine comme le reste.

Une regle de forme prealable, tiree des sites existants : deux services n'ont
pas la meme structure. Une demande de visa a des frais et une procedure ; un
passeport biometrique a deux jeux de pieces, premiere demande et
renouvellement, et aucun delai affiche. Un schema qui imposerait les memes
rubriques a tous les services forcerait les ambassades a mentir par omission ou
a laisser des blocs vides. Le corps de la page est donc un `body_html` libre et
assaini, comme le mot de bienvenue.

## Surface visiteur

Un seul appel, anonyme, resolu par domaine (en-tete `X-Embassy-Domain` ou
parametre `?domain=` en local, comme `/api/bootstrap`).

```
GET /api/content/services
```

```json
{
  "data": {
    "platform": {
      "name": "Express54",
      "url": "https://www.express54.org",
      "phone": "+224 000 00 00 00",
      "description": "Deposez et suivez vos demandes en ligne."
    },
    "services": [
      {
        "id": 3,
        "slug": "visa",
        "title": "Visa",
        "summary": "Demande de visa pour le Gabon et informations sur les procedures.",
        "icon": "visa",
        "delay": "5 jours ouvrables",
        "fee": "50 000 GNF",
        "body_html": "<h2>Pieces a fournir</h2><ul><li>…</li></ul>",
        "position": 1
      }
    ]
  }
}
```

Les regles, dans l'ordre d'importance :

1. **Une ambassade sans service rend `services: []` et `platform: null`**, pas
   une erreur. Le gabarit masque alors la rubrique entiere, entree de menu
   comprise. C'est ce qui empeche la fuite : une page « Nos services » vide
   vaudrait mieux que le texte d'une autre ambassade, mais une rubrique absente
   vaut mieux que les deux.
2. **`body_html` est assaini cote serveur**, avec le meme jeu de balises que le
   mot de bienvenue, augmente des titres de niveau 2 et 3 et des tableaux :
   une grille de tarifs est le cas normal ici. Le front l'insere avec `v-html`,
   il ne peut pas etre la derniere ligne de defense.
3. **`slug` identifie le service dans l'URL publique** `/services/{slug}`. Il
   est unique par ambassade, stable dans le temps, en minuscules sans accent
   (`^[a-z0-9]+(-[a-z0-9]+)*$`, 60 caracteres au plus). Le back le derive du
   titre a la creation si l'administrateur n'en propose pas ; il ne le change
   jamais tout seul ensuite, car un slug qui bouge casse les liens deja
   partages.
4. **`icon` est une cle d'une liste fermee**, tenue par le front :
   `visa`, `passeport`, `carte-consulaire`, `etat-civil`, `legalisation`,
   `document`, `transport`, `assistance`, `entreprise`, `etudes`. Une cle
   inconnue, ou `null`, rend l'icone generique `document`. Le CMS ne sert
   jamais de balisage d'icone : ce serait une surface d'injection pour un gain
   nul.
5. **`position` ordonne la liste**, croissant. A defaut, l'ordre du tableau
   fait foi.
6. **`delay` et `fee` sont des chaines courtes et libres** (60 caracteres au
   plus), pas des nombres : « 5 jours ouvrables », « gratuit », « selon la
   nationalite » sont des reponses honnetes qu'un entier ne sait pas porter.
   Elles peuvent valoir `null`, et le bandeau qui les porte disparait alors.

`platform`, `summary`, `delay`, `fee` et `icon` peuvent valoir `null`. Tout le
reste est requis des lors que l'entree existe.

### Le bloc `platform`

Il porte la plateforme externe de demarches en ligne quand l'ambassade en a
une — Express54 pour le consulat de Cote d'Ivoire a New York, rien pour le
Gabon a Conakry aujourd'hui. Il est rendu en tete de la page des services et en
pied de chaque page de detail. **Il n'est jamais invente par le gabarit** :
`platform: null` fait disparaitre le bandeau. `name` et `url` sont requis des
lors que le bloc existe ; `phone` et `description` peuvent manquer.

## Surface d'administration

Prefixe `/api/admin/content`, jeton porteur Sanctum, ambassade deduite de
l'utilisateur — rien a envoyer. Meme forme que les dirigeants et la vitrine.

| Methode | Route | Role |
|---|---|---|
| GET | `services` | La liste et la plateforme, meme forme que la surface visiteur |
| POST | `services` | Cree un service |
| PATCH | `services/{id}` | Modifie un service |
| DELETE | `services/{id}` | Retire un service |
| PUT | `services/order` | Reordonne : `{ "ids": [3, 1, 2] }` |
| PUT | `services/platform` | Enregistre le bloc `platform` |
| DELETE | `services/platform` | Retire le bandeau |

Le corps accepte en POST et PATCH : `slug`, `title`, `summary`, `icon`,
`delay`, `fee`, `body_html`. Le back repond 422 avec `errors` par champ, comme
partout ailleurs ; le front affiche ses messages tels quels.

Deux erreurs a distinguer, parce que le front les presente differemment :

- un `slug` deja pris dans la meme ambassade est une 422 sur le champ `slug` ;
- un `slug` pris dans une autre ambassade n'en est pas une. Les URL publiques
  sont resolues par domaine : deux ambassades ont chacune leur `/services/visa`.

## Ce que le front fait de tout cela

- `/services` liste les cartes : icone, `title`, `summary`, lien « En savoir
  plus ». La page et son entree de menu se retractent quand la liste est vide.
- `/services/{slug}` rend le detail : `title`, `summary` en chapeau, le bandeau
  `delay` / `fee` s'il y a de quoi le remplir, puis `body_html`. Un slug
  inconnu rend la page « rubrique introuvable » du gabarit, pas une erreur.
- `/services-ambassadeur` **n'est pas touchee** par ce contrat. Elle reste la
  page en dur de l'ambassade de Guinee aux Etats-Unis, derriere son module
  `services`, jusqu'a ce que son contenu soit saisi dans le CMS. Le jour ou il
  le sera, la page en dur disparait du depot.
