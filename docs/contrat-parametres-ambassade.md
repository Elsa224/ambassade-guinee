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
de `identite`, memes noms de champs, meme classe de ressource cote serveur. Le
front sait deja la normaliser : reutiliser cette forme evite d'ecrire un second
normaliseur qui divergerait du premier.

Une seule difference, et elle est d'enveloppe, pas de forme : `/api/bootstrap`
rend `{ "embassy": … }`, les routes d'administration rendent une ressource
seule, donc `{ "data": … }`. Le `PUT` rend l'ambassade mise a jour dans cette
meme enveloppe, et non un 204 : l'ecran reaffiche ce que le serveur a retenu,
plutot que ce qu'il croit avoir envoye.

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
    "phones": [{ "label": "Standard", "number": "+224 000 00 00 00" }],
    "email": "…",
    "hours": "…"
  },
  "theme": {
    "color_primary": "#009e60",
    "color_secondary": "#fcd116",
    "color_accent": "#3a75c4"
  }
}
```

> **Corrige le 2026-09-17.** Ce bloc annoncait `"theme": { "primary", "secondary" }`
> et un `contact.phone` au singulier. Les deux etaient faux, et la premiere
> erreur etait la plus couteuse des deux : la validation ne connait pas les
> cles nues, l'aplatissement en colonnes ne lit que les trois noms prefixes,
> et un envoi de `primary` aurait ete **ignore en silence** — un formulaire qui
> enregistre sans rien changer et sans erreur. Releve par la session back a la
> lecture de `UpdateEmbassyRequest`, en reponse a une question posee avant
> d'ecrire l'ecran.

### Les trois couleurs, et leurs noms

`theme.color_primary`, `theme.color_secondary` et `theme.color_accent` — trois
cles prefixees, celles que sert deja `/api/bootstrap`. Les trois sont NOT NULL :
on les remplace, on ne les vide pas. Chacune est un hexadecimal a trois ou six
chiffres, casse libre.

### Le numero principal est derive, pas stocke

`contact.phones` est une **liste ordonnee** d'objets `{ label, number }`, au
plus vingt entrees, les deux champs obligatoires, libelle 60 caracteres et
numero 40. Aucun format n'est impose sur le numero, et c'est assume : les
usages nationaux varient trop, et un refus a tort coute plus cher qu'une
saisie qu'un humain corrige.

`contact.phone`, que le bootstrap sert bien en lecture, est le `number` de la
**premiere entree** de cette liste. Il n'est jamais stocke — deux sources de
verite pour un meme numero divergeraient a la premiere modification — et il
est **explicitement refuse en ecriture**, par une erreur de validation et non
par un filtrage silencieux : l'ecran apprend que son intention n'a pas ete
honoree.

Consequence directe pour tout formulaire : **l'ordre de la liste porte du
sens**. Changer le numero principal du site, c'est changer la premiere entree,
et un ecran qui n'offre pas de reordonner la liste rend ce geste impossible.

Le reste de `contact` : `address` (2000 caracteres, effacable), `email`
(valide comme adresse, 191, effacable), `hours` (500, effacable).

### Ce qui est effacable, et ce qui ne l'est pas

`identite.country_name_official` et `country_name_short` ne sont pas
`nullable` : on les remplace, on ne les vide pas. `display_name`, lui, l'est —
et c'est precisement ce qui rend atteignable la chaine de repli vers
« Ambassade de la {country_name_official} ». Un ecran qui propose de vider ce
champ arme donc ce repli, et il doit le dire a l'endroit ou il le propose.

### Ce que l'ambassade ne doit PAS pouvoir modifier

Trois champs de `embassy` sont absents de la charge utile, et ce n'est pas un
oubli :

| Champ | Pourquoi il reste hors de portee |
|---|---|
| `slug` | Identifie le tenant partout, y compris dans les relations deja ecrites |
| `domain` | Change le domaine qui resout l'ambassade : une erreur de saisie rend le site injoignable |
| `modules` | C'est du **provisionnement**. Une ambassade ne doit pas pouvoir s'ouvrir un module qu'elle n'a pas souscrit |

Les trois sont **refuses par une erreur de validation**, avec un message
chacun, et non filtres en silence. La consequence est concrete pour un ecran
d'administration : reposter tel quel l'objet recu en lecture fait echouer
l'enregistrement entier en 422. On n'envoie que les champs modifiables.

`modules` est le point le plus important des trois. Le front traite ces
drapeaux comme fermes par defaut et s'y fie pour decider ce qu'il affiche : les
rendre modifiables depuis le tableau de bord de l'ambassade reviendrait a lui
laisser ouvrir des rubriques que l'exploitant n'a pas provisionnees. Si un
ecran doit un jour les piloter, c'est un ecran d'exploitant, sur une route
distincte et une autorisation distincte.

### La regle qui compte : le bootstrap doit refleter le PUT

`GET /api/bootstrap` est appele a chaque chargement de page. Si sa reponse
etait mise en cache, l'ambassade corrigerait son numero de telephone,
rechargerait son site, verrait l'ancien, et conclurait que l'enregistrement n'a
pas fonctionne — puis recommencerait.

**Le point est regle, et mieux qu'attendu : il n'y a aucun cache a invalider.**
Verifie en production par la session back le 2026-09-17 — le controleur relit
la base a chaque requete, et la reponse porte `Cache-Control: no-cache,
private`. Ce document demandait une invalidation ; il n'y a rien a invalider.
Un rechargement du tenant apres enregistrement suffit, et l'ambassade voit son
site a jour sans se deconnecter.

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

## 3. Calendrier des jours feries

Le dernier champ des quarante-quatre. Cette section proposait une forme
— `GET /api/content/calendar`, un tableau plat, les cles `label` et
`recurrent` — qui n'a pas ete retenue.

**C'est `docs/contrat-jours-feries.md` du depot back qui fait autorite**, et
le front s'y conforme depuis le branchement de `Calendrier.vue`. Ce qui suit
n'en retient que ce qui engage le front, pour eviter d'entretenir deux
descriptions qui divergeraient :

```
GET /api/content/holidays
GET /api/content/holidays?year=2027
```

```json
{
  "data": {
    "year": 2026,
    "available_years": [2025, 2026, 2027],
    "intro": null,
    "document_url": null,
    "holidays": [
      { "id": 1, "name": "Jour de l'An", "date": "2026-01-01", "type": "legale", "note": null }
    ]
  }
}
```

Quatre points s'imposent au front et ont ete obtenus explicitement :

1. **Une annee sans aucune fete rend 200**, `holidays` vide et
   `available_years` toujours renseigne. Jamais 404. La page garde donc son
   selecteur d'annee : consulter une annee vide ne doit pas effacer le moyen
   d'en sortir.
2. **Le bloc de reglages est toujours present** : `intro` et `document_url`
   valent `null` quand rien n'est saisi. Rien n'est guineen par defaut — le
   texte du decret, jadis ecrit en dur dans le gabarit, est desormais saisi
   par l'ambassade ou n'existe pas.
3. **`available_years` ne porte que les annees pourvues.** L'annee servie peut
   en etre absente ; c'est au front d'ajouter cette valeur aux options de son
   selecteur, et non au back de fausser le sens du champ.
4. **Le PDF s'ouvre dans l'onglet** : le relais ne pose pas de
   `Content-Disposition`. Le bouton dit donc « Consulter », pas
   « Telecharger ». Forcer le telechargement demanderait un
   `Content-Disposition: attachment` cote back, ce qui n'a pas ete demande.

La notion de fete **recurrente** projetee par le back a ete abandonnee : il
ne calcule aucune date et ne duplique pas une annee sur la suivante. Chaque
annee est saisie en entier, dates fixes comprises. Une duplication d'annee
serait un ajout ulterieur, pas une correction.

`type` vaut `legale`, `nationale` ou `religieuse`, et rien d'autre : le
libelle affiche et la couleur de la pastille sont au front. La pastille
« Fete musulmane » du gabarit a disparu au profit de « Fete religieuse ».

Administration : `GET`, `POST`, `PATCH` et `DELETE` sur `/api/admin/holidays`,
plus `PUT` et `DELETE` sur `/api/admin/holidays/settings`. **Le `PUT` des
reglages est un remplacement complet, pas une fusion** : un champ absent du
corps vaut `null`, donc un `PUT` portant seulement `intro` efface le document.
L'ecran d'administration envoie toujours les deux champs. Le document se
televerse sur `POST /api/admin/content/document` — PDF seul, 5 Mo — et la
route des images continue de refuser les PDF.

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
