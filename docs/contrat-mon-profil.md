# Mon profil et mot de passe — contrat propose

> Proposition ecrite par la session front le 2026-09-17, a la demande d'Elsa,
> dans la meme forme que `docs/contrat-utilisateurs-roles.md`. Le back reste
> libre de la forme interne ; ce document fige **ce que le front appelle, ce
> qu'il lit, et les refus sur lesquels il compte**. En cas d'ecart, c'est le
> document du depot back qui tranchera.
>
> **Perimetre : le CMS** (`ambassade-cms-api`), et rien d'autre. Ces routes ne
> touchent pas Ambassade Secure, dont les six roles internes
> (`super_admin`, `company_admin`, `manager`, `employee`, `security_agent`,
> `mail_agent`) sont invisibles depuis le front d'ambassade : le CMS s'y logue
> avec un compte de service unique par poste. Confondre les deux couches
> serait refaire l'erreur des etats d'evenement, ou le front a porte trois
> jours des valeurs qui n'existaient nulle part.

## Pourquoi maintenant

Le gabarit heritait de trois ecrans sur ce sujet, et **les trois mentaient** :

- `ChangePassword.vue` validait la saisie, verifiait la longueur, puis
  affichait `alert('Mot de passe modifie avec succes !')` — **sans envoyer
  quoi que ce soit a personne**. Le commentaire d'origine le disait :
  « Ici tu peux envoyer la modification au backend ».
- `Deconnexion.vue` affichait `alert('Vous etes maintenant deconnecte !')`
  puis redirigeait, **sans effacer le jeton**. La session restait ouverte.
- `MonProfil.vue` affichait « John Doe » en dur.

Ils etaient orphelins — aucune route n'y menait — et ils ont ete SUPPRIMES le
2026-09-17. Elsa veut un vrai ecran a leur place. Il n'y a rien a rebrancher :
il n'existe aujourd'hui aucune route CMS pour lire ou modifier son propre
compte, ni pour changer son mot de passe.

Ce lot vient apres celui des roles, et pas avant : il partage sa surface
(`/api/auth/me`), son modele d'authentification et son enveloppe d'erreurs.

## Ce que le front a deja

`GET /api/auth/me` existe et rend `{ user, embassy }`. Le front l'appelle au
demarrage depuis `restaurerSession()` et **ignore deliberement le bloc
`embassy`** : l'ambassade est deja resolue par le bootstrap, et deux verites
sur une meme ambassade finiraient par diverger.

La forme de `user` servie aujourd'hui, verifiee dans le code du back :

```json
{ "id": 7, "name": "Awa Ndong", "email": "awa@exemple.test", "role": "admin", "embassy_id": 1 }
```

**Le champ est `name`, pas `nom`.** Le front avait invente `nom` dans son faux
serveur, ses tests avaient recopie l'invention, et le nom de l'administrateur
ne s'est jamais affiche en production. C'est repare ; c'est aussi la raison
pour laquelle ce document n'invente aucun nom de champ.

## Les trois routes demandees

### 1. Lire son propre compte

Aucune route nouvelle. `GET /api/auth/me` suffit, a une condition : qu'il
rende aussi les champs que l'ecran affiche et laisse modifier. La forme
proposee, en ajout de l'existant :

```json
{
  "user": {
    "id": 7,
    "name": "Awa Ndong",
    "email": "awa@exemple.test",
    "role": "admin",
    "embassy_id": 1,
    "last_login_at": "2026-09-17T08:12:44Z",
    "password_changed_at": "2026-06-02T10:03:11Z"
  }
}
```

**`phone` et `job_title` sont retires de la demande.** Ils figuraient dans la
premiere version de ce document ; les colonnes n'existent pas cote CMS, et la
session back a recommande de ne pas les creer sans usage precis. La discipline
du gabarit tranche dans le meme sens : un champ facultatif que personne ne
remplit reste une case vide a l'ecran pour toujours, et ce que le CMS ne sert
pas n'existe pas.

> Elsa n'a pas exprime d'usage pour ces deux champs ; c'est donc le repli qui
> s'applique, et il se defait en une ligne. Si une ambassade a besoin de
> savoir qui, parmi ses comptes, tient quoi, `job_title` reviendra a cote du
> role sur l'ecran des utilisateurs — deux colonnes nullables ne coutent rien
> une fois qu'on sait a quoi elles servent.

`last_login_at` et `password_changed_at` sont en **lecture seule**. Le second
n'est pas cosmetique : c'est le seul moyen pour un agent de savoir si son mot
de passe date d'avant un incident.

### 2. Modifier son propre compte

```
PATCH /api/auth/me
```

Corps accepte, tous les champs facultatifs, seuls ceux presents sont ecrits :

```json
{ "name": "Awa Ndong" }
```

Un seul champ modifiable aujourd'hui, et c'est assez : le nom est ce que
l'ecran des utilisateurs et le menu affichent. La route reste au pluriel —
`PATCH` avec un objet — pour que l'ajout d'un champ plus tard ne change pas
sa forme.

Reponse `200` avec l'utilisateur complet, dans la meme forme que `me`.

**`email` n'est PAS modifiable ici, et `role` ni `embassy_id` non plus.**
- Le courriel est l'identifiant de connexion : le changer est un geste qui
  demande une verification par courriel, donc son propre lot. Presente sur
  cet ecran sans verification, il permettrait a un compte compromis de
  verrouiller son proprietaire dehors.
- Le role est l'affaire d'un administrateur, sur l'ecran des utilisateurs.
  Un compte qui peut modifier son propre role n'a pas de role.
- `embassy_id` changerait de tenant. Il n'a rien a faire dans un formulaire.

Un champ refuse doit rendre **422**, jamais l'ignorer en silence : un
enregistrement qui reussit sans rien changer est pire qu'un refus.

### 3. Changer son mot de passe

```
POST /api/auth/password
```

```json
{
  "current_password": "…",
  "password": "…",
  "password_confirmation": "…"
}
```

Reponse `204`, sans corps.

**L'ancien mot de passe est obligatoire**, et c'est le point central de cette
route. Sans lui, un poste laisse ouvert quelques minutes suffit a s'approprier
definitivement un compte. Le refus attendu sur un ancien mot de passe faux est
**422**, avec un message en francais directement presentable, comme partout
ailleurs.

Le front ne connait aucune regle de robustesse et n'en inventera aucune : il
verifie seulement que les deux saisies coincident, ce qui evite un
aller-retour evident. **Toute regle de longueur ou de composition appartient
au serveur**, qui la rend en 422 avec son message. L'ecran herite verifiait
« au moins 6 caracteres » en dur, dans un ecran qui n'envoyait rien : une
regle inventee cote client est une promesse que personne ne tient.

### Deux comportements, tranches par Elsa le 2026-09-17

Ils etaient poses en questions dans la premiere version de ce document. Ce ne
sont pas des details d'implementation : ce sont des **promesses faites a un
utilisateur**, et elles appartenaient donc a Elsa, pas aux sessions. Elle a
tranche, dans le sens que la session du CMS back recommandait.

**1. Les autres jetons sont revoques — TOUS SAUF celui en cours.**

Quelqu'un qui change son mot de passe parce qu'il le croit compromis s'attend
a ce que l'autre poste tombe, et n'a aucune raison d'etre ejecte du sien.

Deux consequences pour le front, et la seconde est contre-intuitive :

- l'ecran **previent avant d'enregistrer** : « Vos autres sessions seront
  fermees. » Une deconnexion silencieuse sur un autre appareil serait prise
  pour une panne ;
- l'ecran **ne traite AUCUN 401 comme normal** apres l'enregistrement,
  puisque la session courante survit. Un 401 qui surviendrait malgre tout est
  une anomalie a signaler, pas un effet attendu. C'est l'inverse de ce que le
  front aurait fait si la revocation avait tout emporte — d'ou l'importance
  d'avoir pose la question au lieu de supposer.

**2. Un courriel de notification part**, a l'adresse du compte.

C'est le seul signal qu'aurait quelqu'un dont le compte a ete pris : celui
qui change le mot de passe n'est pas forcement celui qui le connaissait.
L'ecran l'annonce donc explicitement, avant l'enregistrement, en meme temps
que l'avertissement sur les sessions.

Le corps du courriel appartient au back, pas au front. Une seule exigence, et
elle n'est pas cosmetique : **il ne doit contenir ni mot de passe, ni jeton,
ni lien qui authentifie**. Un courriel dont l'interception suffit a prendre le
compte annule le benefice de l'avertissement.

## Les refus sur lesquels le front compte

Six, et le front s'appuie sur chacun. Aucun n'est verifie cote client, sauf le
premier qui l'est en plus par confort.

| Situation | Code | Pourquoi |
| --- | --- | --- |
| Les deux nouveaux mots de passe ne coincident pas | 422 | Le front le verifie aussi, pour eviter un aller-retour. Le serveur reste l'autorite. |
| L'ancien mot de passe est faux | 422 | Le seul rempart contre l'appropriation d'un poste laisse ouvert. |
| Le nouveau mot de passe ne respecte pas la politique | 422 | Avec le message du serveur. Le front n'en connait pas les regles. |
| `email`, `role` ou `embassy_id` dans `PATCH /api/auth/me` | 422 | Jamais ignore en silence. |
| `name` vide ou absent de toute valeur utile | 422 | Un compte sans nom rend l'ecran des utilisateurs illisible. |
| Jeton absent ou invalide | 401 | Traite par le gestionnaire global du front, qui deconnecte. |

## Ce que le front livrera

Un ecran `/dashboard/profil`, accessible a **tous les roles** — `super_admin`,
`admin` et `editeur`, les trois que porte `docs/contrat-utilisateurs-roles.md`
et que l'enumeration du back applique. C'est la seule surface du back-office
qui ne depend pas du role, et c'est voulu : un compte qui ne peut pas changer
son mot de passe est un compte qu'on ne peut pas securiser.

> **Correction du 2026-09-17.** Cette phrase citait un role `lecteur` qui
> N'EXISTE PAS : le contrat des roles le refuse explicitement — « un
> observateur est le role qu'on ajoute quand on n'ose pas trancher » — et
> l'enumeration du back ne le porte pas. Releve par la session du CMS back,
> qui a verifie contre le code. C'est la meme erreur que
> `ACTIVE`/`COMPLETED` sur les etats d'evenement, prise un tour plus tot :
> un role invente dans un contrat devient une condition morte dans un ecran.
>
> Les etats de compte, pour la meme raison, sont **`actif`** et
> **`suspendu`** : en francais, en minuscules, tels que le back les applique.

Deux sections : l'identite (le nom, et le courriel affiche en lecture seule
avec la raison), puis le mot de passe — avec l'avertissement sur les autres
sessions et le courriel de notification, pose AVANT le bouton et non apres.
La date du dernier changement est affichee si le back la sert, et absente
sinon.

L'entree de menu remplacera « Mon profil », retiree du gabarit le 2026-09-17
parce qu'elle menait a un ecran qui affichait « John Doe ».

## Ce que ce lot ne demande pas

- **Pas de photo de profil.** Aucune surface du CMS n'en affiche, et un
  televersement suppose un seau, une politique de taille et une purge. Le jour
  ou un ecran en montre une, ce sera son lot.
- **Pas de reinitialisation par courriel.** C'est le parcours « mot de passe
  oublie », qui part de l'ecran de connexion et non du profil, et qui a ses
  propres refus. Il n'est pas demande ici.
- **Pas de double authentification.** Elle se decide, elle ne s'ajoute pas.
