# Parametres de l'ambassade — contrat propose

> Proposition ecrite par la session front le 2026-09-11, dans la meme forme que
> `docs/contrat-contenu-accueil.md`. Le back reste libre de la forme interne ;
> ce document fige **ce que le front appelle et ce qu'il lit**. En cas d'ecart,
> c'est le document du depot back qui tranchera, comme pour le bootstrap.

## Pourquoi

Quarante-quatre informations manquent au site gabonais. La recherche en ligne a
etabli qu'elles sont **introuvables** : l'ambassade a ouvert en juin 2026, elle
n'a ni annuaire publie, ni fiche de repertoire, ni personnel nomme nulle part.
Elles ne viendront donc que de l'ambassade elle-meme.

Or aujourd'hui **elle ne peut rien saisir**. Les coordonnees arrivent par
`GET /api/bootstrap`, que le front ne fait que lire ; le personnel et les
consuls honoraires n'existent dans aucune table ; le calendrier non plus. Le
seul contrat d'administration existant, `/api/admin/content/*`, couvre le mot
de bienvenue, les dirigeants et la vitrine — rien d'autre.

Ce document decrit les trois surfaces qui manquent.

## Ce qui est deja regle et ne change pas

Le televersement d'images reste **celui du contrat d'accueil** :

```
POST /api/admin/content/media
```

multipart, champ `file`, 5 Mo, `webp` / `png` / `jpeg`, reponse
`{"data": {"url": "…"}}`. Le logo et le drapeau passent par la meme route :
inutile d'en ouvrir une seconde.

---

## 1. Identite et coordonnees

C'est la famille qui couvre **quinze** des quarante-quatre champs : sept pour
l'adresse postale, huit pour les numeros de telephone.

### Lecture

```
GET /api/admin/embassy
```

Rend exactement la forme de `embassy` dans `/api/bootstrap` — meme imbrication
de `identite`, memes noms de champs. Le front sait deja la normaliser :
reutiliser cette forme evite d'ecrire un second normaliseur qui divergerait du
premier.

### Ecriture

```
PUT /api/admin/embassy
```

```json
{
  "display_name": "Ambassade de la Republique du Gabon en Guinee",
  "identite": {
    "country_name_official": "Republique Gabonaise",
    "country_name_short": "Gabon",
    "demonym": "gabonais",
    "logo_image": "https://ambagabonguinee.com/api/media/embassy/logo",
    "flag_image": "https://ambagabonguinee.com/api/media/embassy/flag"
  },
  "contact": {
    "address": "…",
    "phone": "…",
    "email": "…",
    "hours": "…"
  },
  "theme": { "primary": "#009e60", "secondary": "#fcd116" }
}
```

### Ce que l'ambassade ne doit PAS pouvoir modifier

Trois champs de `embassy` sont absents de la charge utile, et ce n'est pas un
oubli :

| Champ | Pourquoi il reste hors de portee |
|---|---|
| `slug` | Identifie le tenant partout, y compris dans les relations deja ecrites |
| `domain` | Change le domaine qui resout l'ambassade : une erreur de saisie rend le site injoignable |
| `modules` | C'est du **provisionnement**. Une ambassade ne doit pas pouvoir s'ouvrir un module qu'elle n'a pas souscrit |

`modules` est le point le plus important des trois. Le front traite ces
drapeaux comme fermes par defaut et s'y fie pour decider ce qu'il affiche : les
rendre modifiables depuis le tableau de bord de l'ambassade reviendrait a lui
laisser ouvrir des rubriques que l'exploitant n'a pas provisionnees. Si un
ecran doit un jour les piloter, c'est un ecran d'exploitant, sur une route
distincte et une autorisation distincte.

### La regle qui compte : le bootstrap doit refleter le PUT

`GET /api/bootstrap` est appele a chaque chargement de page et il est
vraisemblablement mis en cache cote serveur. **Un PUT accepte doit invalider ce
cache immediatement.** Sans cela, l'ambassade corrige son numero de telephone,
recharge son site, voit l'ancien, et conclut que l'enregistrement n'a pas
fonctionne — puis recommence.

C'est le seul point de ce document ou un ecart produirait un bug qu'aucun code
du front ne peut rattraper.

### Sur le theme

Deux couleurs seulement, et elles habillent le site entier. Un couple mal
choisi rend le texte illisible sans que personne ne le voie avant les
visiteurs. Le front sait afficher un apercu et refuser un contraste
insuffisant ; **le back doit refuser de son cote** les valeurs qui ne sont pas
des couleurs hexadecimales valides, la validation d'un formulaire n'etant
jamais une garantie.

---

## 2. Annuaire : personnel et consuls honoraires

Vingt-neuf champs sur quarante-quatre : onze pour le personnel de la
chancellerie, dix-huit pour les quatre consuls honoraires.

Ces deux listes ont **exactement la forme des dirigeants** du contrat
d'accueil : des elements ordonnes, avec un nom, une fonction, une image
facultative. Le front peut donc reutiliser ses composants de liste ordonnee
sans en ecrire de nouveaux, a condition que la forme servie soit la meme.

### Surface visiteur

```
GET /api/content/directory
```

```json
{
  "data": {
    "staff": [
      {
        "id": 1,
        "name": "…",
        "role": "Premier Conseiller",
        "email": null,
        "phone": null,
        "image_url": null,
        "position": 1
      }
    ],
    "consuls": [
      {
        "id": 1,
        "name": "…",
        "role": "Consul honoraire",
        "city": "Kankan",
        "address": null,
        "email": null,
        "phone": null,
        "position": 1
      }
    ]
  }
}
```

### Administration

```
POST   /api/admin/directory/staff
PATCH  /api/admin/directory/staff/{id}
DELETE /api/admin/directory/staff/{id}
PUT    /api/admin/directory/staff/order      { "ids": [3, 1, 2] }
```

et les quatre memes verbes sur `/api/admin/directory/consuls`.

`position` ordonne, `PUT …/order` reordonne d'un coup en recevant les
identifiants dans l'ordre voulu — identique au contrat d'accueil, pour la meme
raison : reordonner element par element fait diverger les positions des que
deux requetes se croisent.

---

## 3. Calendrier des fetes

Le dernier champ, et le seul des quarante-quatre qui soit **trouvable en
ligne** : les fetes gabonaises sont publiques et le releve est fait. Il reste a
le faire valider par l'ambassade, d'ou un ecran plutot qu'une table figee.

Deux natures de fetes, qui ne se stockent pas pareil :

- **fixes** — meme date chaque annee : 17 aout, 1er mai, 25 decembre ;
- **mobiles** — Paques, Ascension, Aid el-Fitr, Aid el-Kebir : la date change
  chaque annee et ne se calcule pas d'une regle simple, surtout pour les fetes
  musulmanes qui dependent de l'observation.

```
GET /api/content/calendar?year=2027
```

```json
{
  "data": [
    { "id": 1, "label": "Fete de l'Independance", "date": "2027-08-17", "recurrent": true },
    { "id": 2, "label": "Aid el-Fitr", "date": "2027-03-20", "recurrent": false }
  ]
}
```

`recurrent: true` signifie que la date se repete a l'identique chaque annee ;
le back la projette sur l'annee demandee. `recurrent: false` vaut pour une
annee donnee et doit etre ressaisie — c'est un travail annuel de l'ambassade,
pas un defaut.

Administration : les quatre memes verbes sur `/api/admin/calendar`.

---

## Les regles communes

Elles reprennent celles du contrat d'accueil, parce que le front y compte deja
et qu'un traitement different par surface se paierait en cas particuliers :

1. **Une ambassade sans donnee rend des listes vides**, pas une erreur. Le
   gabarit masque alors la section. C'est le comportement voulu : l'ambassade
   du Gabon n'a aujourd'hui ni personnel ni consuls a publier.
2. **Les images sont des URL du domaine de l'ambassade**, posables telles
   quelles dans un `<img src>`, sans jeton.
3. **Tout texte libre est assaini cote serveur.** Le front ne desinfecte pas ;
   il pose ce qu'on lui sert.
4. **Chaque route est resolue par domaine**, en-tete `X-Embassy-Domain` ou
   parametre `?domain=` en local, comme `/api/bootstrap`.

## Ce que ce contrat ne couvre pas

Le contenu redactionnel des pages — presentation de la chancellerie, biographie
de l'ambassadeur, texte des demarches consulaires. Ces blocs sont encore ecrits
en dur dans le gabarit et constituent la derniere source connue de fuite
d'identite. Ils meritent leur propre contrat, et il faudra l'ecrire.
