# Ecriture des evenements — contrat propose

> Proposition ecrite par la session front le 2026-09-11. La surface de
> LECTURE (`GET /api/admin/secure/events`) est deja livree et confirmee par le
> back. Ce document ne couvre que ce qui manque : creer, modifier, annuler,
> publier, et la liste des types. En cas d'ecart, c'est le document du depot
> back qui tranchera, comme pour le bootstrap.

## Le principe : ecrire dans la forme qu'on lit

Le CMS ne relaie pas Ambassade Secure brut, il en sert une vue normalisee —
`toEventView()`. Le front lit donc deja un evenement sous une forme precise :
`name`, `date`, `time`, `location`, `capacity`, `registrationOpen`…

**La forme d'ecriture est le miroir de cette forme de lecture.** Le BFF existe
precisement pour traduire vers le vocabulaire d'Ambassade Secure ; c'est son
travail, et il est le seul a pouvoir le faire sans se tromper. Demander au
front d'ecrire dans un vocabulaire et de lire dans un autre garantirait la
divergence : le jour ou Ambassade Secure renomme un champ, deux endroits
casseraient au lieu d'un.

Une seule asymetrie est assumee, et elle est irreductible : **on ecrit
`typeEventSlug`, on lit `typeLabel`**. L'un identifie, l'autre s'affiche. Elle
impose la route des types, ci-dessous.

## Les types d'evenement

```
GET /api/admin/secure/event-types
```

```json
{ "data": [{ "slug": "fete-nationale", "label": "Fete nationale" }] }
```

Sans cette route, le formulaire ne peut proposer qu'un champ libre ou l'agent
tape un slug a la main — c'est-a-dire une erreur de saisie a chaque creation.
Une liste vide est une reponse valide : le champ « Type » se retire alors.

## Creer

```
POST /api/admin/secure/events
```

```json
{
  "name": "Fete nationale du Gabon",
  "date": "2026-08-17",
  "time": "18:30",
  "location": "Chancellerie, Conakry",
  "description": "Reception officielle.",
  "capacity": 250,
  "registrationOpen": true,
  "registrationDeadline": "2026-08-14",
  "typeEventSlug": "fete-nationale"
}
```

Requis : `name`, `date`, `time`, `location`.
Facultatifs, et `null` est une valeur qui veut dire quelque chose :
`capacity: null` = sans limite, `registrationDeadline: null` = pas de cloture,
`typeEventSlug: null` = sans type. `description` vaut `""` par defaut.

La reponse est **l'evenement complet, dans la forme de lecture** —
`{ "data": { … } }`, exactement ce que sert la fiche. Le front a besoin du
`slug` attribue pour rediriger vers la fiche creee ; renvoyer un corps vide
l'obligerait a re-interroger la liste et a deviner lequel est le bon.

## Modifier

```
PATCH /api/admin/secure/events/{slug}
```

Memes champs, tous facultatifs : seuls ceux envoyes sont modifies. Meme
reponse que la creation. `status` est modifiable ici — c'est ainsi qu'on annule
un evenement (`"status": "CANCELLED"`).

## Publier sur le site

```
PUT /api/admin/secure/events/{slug}/publication
{ "isPublished": true }
```

Ambassade Secure n'a aucune notion de publication : elle vit uniquement cote
CMS, dans `secure_event_publications`. C'est pourquoi cette bascule est une
route a part et non un champ de `PATCH` : elle n'est pas relayee, elle est
traitee sur place. Reponse : l'evenement, avec `isPublished` et `publishedAt`.

## Ce que le front ne demande pas

**La suppression.** Un evenement auquel des gens se sont inscrits porte leurs
inscriptions ; l'effacer les efface avec lui. Le geste juste est l'annulation
(`status: "CANCELLED"`), qui garde la trace et permet de prevenir les inscrits.
Si le back expose tout de meme `DELETE`, le front ne l'appellera pas.

**Le logo, pour l'instant.** `logoUrl` est reecrit par le CMS vers une route
locale qui exige le jeton porteur. Le televerser demande de trancher d'abord ou
il atterrit — `POST /api/admin/content/media` du contrat contenu, ou une route
propre a Ambassade Secure. Tant que ce n'est pas tranche, le formulaire ne
propose pas de logo, plutot que d'en proposer un qui ne s'affichera pas.

## Contrat d'erreur

Le meme que le reste de l'API. Sur `422`, le front lit **`errors`** autant que
`message` :

```json
{
  "message": "Les donnees fournies sont invalides.",
  "errors": { "capacity": ["La capacite doit etre au moins 1."] }
}
```

Les clefs de `errors` sont les noms de champs ci-dessus, pas ceux d'Ambassade
Secure : sans cela le front ne peut pas placer le message sous le bon champ, et
doit se rabattre sur un bandeau general. `409` convient si Ambassade Secure
refuse une modification (capacite abaissee sous le nombre d'inscrits, par
exemple) ; `message` est alors affiche tel quel.

## Ce que le front garantit de son cote

- Il n'envoie jamais `typeLabel` en ecriture, ni n'attend `typeEventSlug` en
  lecture.
- Il n'invente pas de `slug` : il vient toujours de la reponse du back.
- Il borne ce qu'il peut borner avant d'envoyer (champs requis, capacite
  entiere positive), sans jamais considerer cela comme suffisant : la
  validation qui fait foi est celle du serveur.

## Voir aussi

`docs/contrat-contenu-accueil.md` et `docs/contrat-parametres-ambassade.md`
couvrent les surfaces CMS pures. Celle-ci est la seule qui traverse le BFF vers
Ambassade Secure.
