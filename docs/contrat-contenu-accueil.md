# Contenu d'accueil servi par le CMS — contrat propose

> Proposition ecrite par la session front le 2026-09-11, a partir du besoin
> decrit dans le brief remis au back. Le back reste libre de la forme interne ;
> ce document fige **ce que le front appelle et ce qu'il lit**. En cas d'ecart,
> c'est le document du depot back qui tranchera, comme pour le bootstrap.

## Pourquoi

Le bloc « Mot de bienvenue », les portraits des dirigeants et les photos de
vitrine sont aujourd'hui ecrits en dur dans le gabarit. Ce sont ceux de
l'ambassade de Guinee aux Etats-Unis. Sur le domaine gabonais, les afficher a
produit une fuite d'identite visible du public — trois fois.

Ces trois blocs sont du **contenu**, pas de la configuration : ils changent
souvent, ils appartiennent a l'ambassade, et ils portent des images. Ils sont
donc servis par le CMS, resolus par domaine comme le reste.

## Surface visiteur

Un seul appel, anonyme, resolu par domaine (en-tete `X-Embassy-Domain` ou
parametre `?domain=` en local, comme `/api/bootstrap`).

```
GET /api/content/home
```

```json
{
  "data": {
    "welcome": {
      "title": "Mot de bienvenue",
      "body_html": "<p>Chers compatriotes…</p>"
    },
    "leaders": [
      {
        "id": 1,
        "name": "Brice Clotaire Oligui Nguema",
        "role": "President de la Republique, Chef de l'Etat",
        "subtitle": "Republique Gabonaise",
        "image_url": "https://ambagabonguinee.com/api/media/leaders/1",
        "position": 1
      }
    ],
    "showcase": [
      {
        "id": 7,
        "image_url": "https://ambagabonguinee.com/api/media/showcase/7",
        "alt": "Drapeau du Gabon",
        "position": 1
      }
    ]
  }
}
```

Quatre regles, dans l'ordre d'importance :

1. **Une ambassade sans contenu rend des listes vides et `welcome: null`**, pas
   une erreur. Le gabarit masque alors la section — c'est le comportement voulu
   tant que l'ambassade n'a rien fourni, et c'est ce qui empeche la fuite.
2. **`image_url` est une URL du domaine de l'ambassade**, posable telle quelle
   dans un `<img src>`, sans en-tete ni authentification — comme le `logoUrl` de
   la surface visiteur des evenements. Jamais une URL de stockage signee.
3. **`body_html` est assaini cote serveur.** Le front l'insere avec `v-html` ;
   il ne peut pas etre la derniere ligne de defense.
4. **`position` ordonne la liste**, croissant. A defaut, l'ordre du tableau fait
   foi.

`subtitle` et `alt` peuvent valoir `null`. Tout le reste est requis des lors que
l'entree existe.

## Surface d'administration

Prefixe `/api/admin/content`, jeton porteur Sanctum, ambassade deduite de
l'utilisateur — rien a envoyer.

| Methode | Route | Role |
|---|---|---|
| GET | `home` | Les trois blocs, meme forme que la surface visiteur |
| PUT | `welcome` | Remplace le mot de bienvenue (`title`, `body_html`) |
| DELETE | `welcome` | Retire le mot de bienvenue — la section disparait |
| POST | `leaders` | Ajoute un dirigeant |
| PATCH | `leaders/{id}` | Modifie un dirigeant |
| DELETE | `leaders/{id}` | Retire un dirigeant |
| PUT | `leaders/order` | Reordonne : `{ "ids": [3, 1, 2] }` |
| POST | `showcase` | Ajoute une image de vitrine |
| PATCH | `showcase/{id}` | Modifie son texte alternatif |
| DELETE | `showcase/{id}` | Retire l'image |
| PUT | `showcase/order` | Reordonne : `{ "ids": [7, 4] }` |
| POST | `media` | Televerse une image, rend `{ "data": { "url": "…" } }` |

Corps d'un dirigeant : `name` (requis, 191), `role` (requis, 191),
`subtitle` (facultatif, 191), `image_url` (requis).
Corps d'une image de vitrine : `image_url` (requis), `alt` (facultatif, 191).

**Le televersement.** `POST media` accepte un `multipart/form-data` avec un
champ `file`, borne a 5 Mo, en `image/webp`, `image/png` ou `image/jpeg`. Il
rend l'URL definitive, du domaine de l'ambassade. Le front pose ensuite cette
URL dans `image_url`.

Un envoi presigne vers le stockage conviendrait aussi, mais il exige alors un
CORS correct sur le seau : c'est le piege deja rencontre sur le logo des
evenements. Un televersement qui passe par le CMS n'a pas ce probleme.

## Contrat d'erreur

Le meme que le reste de l'API : `422` sur validation, `404` sur ressource
inexistante, `401` sur jeton absent ou expire, `413` si le fichier depasse la
borne. Chaque reponse porte un `message` en francais directement affichable.

## Ce que le front garantit de son cote

- Il n'affiche **aucun** de ces trois blocs tant que l'API n'en sert pas le
  contenu. Le repli n'est pas le contenu guineen : c'est l'absence.
- Il n'ecrit jamais `image_url` a la main : elle vient toujours de `POST media`
  ou d'une entree existante.
- Il ordonne par `position` et non par `id`.
