# Services consulaires servis par le CMS — contrat propose

> Proposition ecrite par la session front le 2026-09-16, a la demande de
> l'ambassade du Gabon, qui veut une rubrique « Nos services » alimentee par
> son administration. Amendee le meme jour par la session back, dont les sept
> amendements sont integres ici : surface visiteur non gardee par le module,
> profil d'assainissement « riche » distinct, validation de `icon` cote
> serveur, bornes des champs, slug modifiable par l'administrateur,
> suppressions en 204. Le back reste libre de la forme interne ; ce document
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
2. **`body_html` est assaini cote serveur**, selon un profil « riche » propre
   aux corps de services : celui du mot de bienvenue — qui autorise deja les
   titres de niveau 2 et 3 — augmente des tableaux, `colspan` et `rowspan`
   compris. Une grille de tarifs est le cas normal ici, et un `colspan` retire
   en silence disloque la grille a l'affichage. Le profil reste distinct de
   celui du mot de bienvenue, qui n'a pas a recevoir de tableaux. Le front
   insere ce corps avec `v-html` : il ne peut pas etre la derniere ligne de
   defense.
3. **`slug` identifie le service dans l'URL publique** `/services/{slug}`. Il
   est unique par ambassade, stable dans le temps, en minuscules sans accent
   (`^[a-z0-9]+(-[a-z0-9]+)*$`, 60 caracteres au plus). Le back le derive du
   titre a la creation si l'administrateur n'en propose pas ; il ne le change
   jamais tout seul ensuite, car un slug qui bouge casse les liens deja
   partages.
4. **`icon` est une cle d'une liste fermee**, tenue en configuration cote back
   et connue du front :
   `visa`, `passeport`, `carte-consulaire`, `etat-civil`, `legalisation`,
   `document`, `transport`, `assistance`, `entreprise`, `etudes`. Le back
   refuse une cle inconnue par une 422 sur le champ `icon` : sans cela, un
   agent qui saisit « visas » obtiendrait l'icone generique sans comprendre
   pourquoi. `null` reste accepte. Le front, lui, rend `document` pour toute
   cle qu'il ne connait pas, y compris une cle ajoutee plus tard en
   configuration : une version en avance du back ne casse jamais la page.
   Le CMS ne sert jamais de balisage d'icone : ce serait une surface
   d'injection pour un gain nul.
5. **`position` ordonne la liste**, croissant. A defaut, l'ordre du tableau
   fait foi.
6. **`delay` et `fee` sont des chaines courtes et libres** (60 caracteres au
   plus), pas des nombres : « 5 jours ouvrables », « gratuit », « selon la
   nationalite » sont des reponses honnetes qu'un entier ne sait pas porter.
   Elles peuvent valoir `null`, et le bandeau qui les porte disparait alors.

`platform`, `summary`, `delay`, `fee` et `icon` peuvent valoir `null`. Tout le
reste est requis des lors que l'entree existe.

### Bornes

| Champ | Borne |
|---|---|
| `title` | 120 caracteres |
| `summary` | 255 caracteres |
| `slug` | 60 caracteres |
| `delay`, `fee` | 60 caracteres chacun |
| `body_html` | 16 000 caracteres en entree, 60 000 octets apres assainissement |

La borne du corps est double, et les deux comptent. La colonne est un `TEXT`
MySQL, donc 65 535 **octets** et non caracteres, et l'assainissement en ajoute
a l'ecriture : HTMLPurifier pose `rel="noreferrer noopener"` sur chaque lien.
Une borne en caracteres seule ne protegerait donc pas la colonne. C'est la
meme valeur que le mot de bienvenue ; le plus long brouillon gabonais fait
2 500 caracteres, soit un facteur six de marge.

### Ce que la surface visiteur ne fait pas

`GET /api/content/services` **n'est pas garde par le module**. Il rend 200 avec
`services: []` et `platform: null` quand l'ambassade n'a rien saisi, y compris
quand elle ne declare pas `services_consulaires`. Le drapeau de modules sert au
front a decider s'il annonce la rubrique au menu, rien de plus.

Deux mecanismes de retraction qui se contredisent finissent toujours par
diverger : celui-ci vit dans la reponse, pas dans un code d'erreur. Le risque
de fuite est nul, puisqu'une ambassade sans service enregistre rend une
reponse vide quoi qu'il arrive.

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
partout ailleurs ; le front affiche ses messages tels quels. Les suppressions
rendent 204 sans corps.

L'administrateur **peut** changer un slug par PATCH s'il en assume la
consequence — les liens deja diffuses cassent, et l'ecran le dit. Le back, lui,
ne rederive jamais le slug d'un titre modifie.

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
