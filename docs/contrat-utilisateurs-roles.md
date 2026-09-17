# Utilisateurs et roles du back-office — contrat propose

> Proposition ecrite par la session front le 2026-09-17, a la demande d'Elsa,
> dans la meme forme que `docs/contrat-parametres-ambassade.md`. Le back reste
> libre de la forme interne ; ce document fige **ce que le front appelle, ce
> qu'il lit, et les refus sur lesquels il compte**. En cas d'ecart, c'est le
> document du depot back qui tranchera, comme pour le bootstrap.
>
> **Amende le meme jour** apres les reponses de la session back : la section
> « La session » est corrigee (la demande d'aligner `nom` sur `name` etait
> sans objet, l'erreur venait du front), et la section des questions est
> remplacee par l'etat reel du back, qui n'a aujourd'hui **ni routes
> utilisateurs, ni role `editeur`, ni suspension, ni invitation**.

## Pourquoi

L'administration du CMS n'a aujourd'hui qu'un seul compte par ambassade, cree
a la main. Toute personne qui doit publier quelque chose partage donc les
memes identifiants que celle qui change l'adresse postale, le theme du site et
le nom officiel du pays. C'est intenable des que l'ambassade est plus d'une
personne, et le Gabon l'est deja : le mot de bienvenue, les services
consulaires et le calendrier ne seront pas tenus par le meme agent.

Il manque deux choses, et elles ne se separent pas : **des comptes** (les
creer, les suspendre, les retirer) et **des roles** (ce que chacun peut
faire). Un CRUD sans roles ne fait que multiplier les comptes tout-puissants.

## Ce que le code fait deja, et ce qui manque

Trois constats releves dans le depot front le 2026-09-17, parce qu'ils
determinent la surface demandee.

1. **Le role est deja servi, et deja ignore.** `POST /api/auth/login` rend
   `{ token, user: { id, nom, email, role } }`, et le front stocke `role` en
   `string` libre. Rien ne le lit. Aucun ecran, aucune route, aucune entree de
   menu n'en depend.
2. **Le role est perdu au rechargement.** `restaurerSession()` relit le jeton
   depuis `localStorage` mais **ne rehydrate pas l'utilisateur** : apres un F5,
   `estAuthentifie` vaut `true` et `utilisateur` vaut `null`. Tant que ce trou
   existe, aucun affichage conditionne au role ne peut tenir : l'ecran ne sait
   pas qui il a en face. Le faux serveur local sert deja `GET /api/auth/me`,
   mais **le front ne l'appelle nulle part** — c'est un correctif front, pose
   ici parce que le contrat en depend.
3. **L'entree de menu « Utilisateurs » existe et ne mene a rien d'utile.** Elle
   est dans la sidebar sous « Ambassade Secure », et `/dashboard/utilisateurs`
   redirige vers `UserList.vue`, qui est un **ecran de pointage de presence**
   herite du fork, avec un selecteur d'annee 2024-2026 en dur et aucun appel
   API. `AddUser.vue` est un formulaire sans `submit`, dont le champ « Role »
   est une saisie de texte libre. Ces deux ecrans seront remplaces, pas
   branches.

## Les roles : trois, et pourquoi pas quatre

La spec (§4.3) n'en exigeait que deux, `admin` par ambassade et `super_admin`
transverse. Un troisieme est necessaire, et un quatrieme ne l'est pas.

| Role | Portee | Ce qu'il tient |
| --- | --- | --- |
| `super_admin` | La plateforme | Le provisionnement : creer une ambassade, son domaine, ses modules. **Aucun rattachement a une ambassade.** |
| `admin` | Une ambassade | Tout le contenu, les parametres du poste, et les comptes de son ambassade. |
| `editeur` | Une ambassade | Tout le contenu. Ni les parametres, ni les comptes. |

La frontiere entre `admin` et `editeur` n'est pas une gradation de confiance,
c'est une difference de nature : **l'editeur publie, l'administrateur engage
l'ambassade**. Changer le mot de bienvenue est reparable en trente secondes ;
changer `country_name_official`, l'adresse ou l'email de contact se voit sur
chaque page et dans chaque partage, et une faute de frappe sur le theme rend
le site illisible. Ce sont deux gestes qui n'appellent pas la meme main.

**Pas de role en lecture seule.** Un « observateur » est le role qu'on ajoute
parce qu'il parait prudent, et que personne n'attribue jamais : le site public
est deja en lecture libre pour tout le monde, donc un compte qui ne peut que
lire l'administration ne donne acces a rien que le visiteur n'ait deja.

**Pas de role « evenements » separe**, malgre la tentation : la feuille de
presence et le scan des invites forment une surface distincte du reste. Mais
tant qu'une seule ambassade tient des evenements et qu'aucune n'a demande a
cloisonner cette equipe, ce serait un role sans porteur. A rouvrir quand
quelqu'un le demande, pas avant.

Le jeu est **ferme**. `role` est une enumeration de trois valeurs et pas une
chaine libre, comme `type` l'est pour les jours feries : le front en depend
pour ses libelles et ses gardes, et une quatrieme valeur inattendue serait
traitee comme le role le moins capable (`editeur`), jamais comme un
administrateur.

## La matrice, surface par surface

Etablie sur les surfaces d'administration qui existent vraiment, pas sur
celles qu'on projette.

| Surface | `editeur` | `admin` |
| --- | --- | --- |
| Contenu de l'accueil (bienvenue, ambassadeur, dirigeants, vitrine, banniere) | oui | oui |
| Services consulaires | oui | oui |
| Annuaire (personnel, consuls honoraires) | oui | oui |
| Jours feries, reglages et document | oui | oui |
| Evenements, invites, presence | oui | oui |
| Articles et actualites (contrat a ecrire) | oui | oui |
| Televersement de medias | oui | oui |
| **Parametres de l'ambassade** (identite, coordonnees, theme) | **non** | oui |
| **Utilisateurs** | **non** | oui |

Deux refus, donc, et tout le reste est du contenu. C'est volontairement grossier :
une matrice fine par module se paierait en ecran de permissions que personne
n'ira regler, et le decoupage reel de la charge dans une ambassade de trois
agents n'est pas connu.

## La resolution du tenant : par le compte, pas par le domaine

C'est la divergence a retenir, et elle est deja vraie : **l'administration
resout l'ambassade par le COMPTE authentifie**, alors que le site visiteur la
resout par le domaine. Les routes ci-dessous sont donc portees par le jeton
seul ; `X-Embassy-Domain` n'a pas a les influencer, et un `?domain=` pointant
une autre ambassade ne doit pas etre honore.

La consequence a enoncer explicitement : **un `admin` du Gabon ne voit ni ne
touche aucun compte d'une autre ambassade**, et la liste ci-dessous est
toujours celle de son poste. Comme `super_admin` n'est rattache a aucune
ambassade, il n'apparait dans aucune liste — par construction, sans regle
particuliere.

## Surface d'administration

Enveloppe `{ "data": … }` comme les autres routes d'administration.

### Lire la liste

```
GET /api/admin/users
```

```json
{
  "data": [
    {
      "id": 1,
      "name": "Mariam Bongo",
      "email": "direction@ambagabonguinee.com",
      "role": "admin",
      "status": "actif",
      "last_login_at": "2026-09-17T08:41:00Z",
      "created_at": "2026-06-02T10:00:00Z"
    }
  ]
}
```

Liste nue, sans pagination : une ambassade a une poignee de comptes, et
paginer une liste de cinq lignes ajoute un cas d'erreur sans rien resoudre. Si
le back pagine quand meme, qu'il le dise — le front lit `data` comme un
tableau aujourd'hui.

`status` vaut `actif` ou `suspendu`. `last_login_at` est `null` pour un compte
qui ne s'est jamais connecte : c'est ce qui permet a l'administrateur de voir
qu'une invitation n'a pas ete honoree.

**Pas de champ « titre ».** Le formulaire herite en proposait un ; la fonction
publiee d'un agent appartient a l'annuaire (`role` de `staff`), qui est du
contenu affiche sur le site. La dupliquer sur le compte garantirait deux
verites divergentes.

### Creer

```
POST /api/admin/users
{ "name": "Awa Diallo", "email": "a.diallo@ambagabonguinee.com", "role": "editeur" }
```

**Aucun mot de passe dans le corps.** Un mot de passe choisi par
l'administrateur transite par son ecran, sa presse-papiers et probablement un
message WhatsApp ; il est aussi presque toujours reutilise. Le compte est donc
cree sans secret, et le serveur emet une invitation :

```json
{
  "data": { "id": 7, "name": "Awa Diallo", "email": "…", "role": "editeur",
            "status": "suspendu", "last_login_at": null, "created_at": "…" },
  "invitation": { "url": "https://ambagabonguinee.com/invitation/9f3c…",
                  "expires_at": "2026-09-24T08:41:00Z", "sent": true }
}
```

`sent` dit si le courriel est parti. S'il vaut `false` — messagerie non
configuree, ce qui est le cas plausible aujourd'hui — l'ecran affiche le lien
pour que l'administrateur le transmette lui-meme. **Une seule forme de reponse
couvre les deux situations**, ce qui evite de faire dependre l'ecran d'une
infrastructure de courriel dont le front ne sait rien.

Le compte reste `suspendu` jusqu'a ce que l'invitation soit honoree : un compte
sans mot de passe qui compterait comme actif ferait mentir la liste.

Renvoyer une invitation, ou la regenerer apres expiration :

```
POST /api/admin/users/{id}/invitation
```

Meme bloc `invitation` en reponse. L'ancien lien doit cesser de valoir.

### Modifier

```
PATCH /api/admin/users/{id}
{ "name": "…", "role": "admin" }
```

Fusion, pas remplacement : un champ absent n'est pas touche. `email` est
modifiable, mais c'est l'identifiant de connexion — le back dira s'il exige
une reconfirmation ; le front est pret a afficher un `invitation` en reponse si
un changement d'adresse en declenche une.

### Suspendre, reactiver, supprimer

```
PATCH /api/admin/users/{id}/status   { "status": "suspendu" }
DELETE /api/admin/users/{id}
```

Deux gestes distincts parce qu'ils repondent a deux situations. Un agent qui
part en conge, ou dont on doute, se **suspend** : reversible, et ce qu'il a
publie garde son auteur. Un compte cree par erreur se **supprime**.

La suppression touche l'integrite interne (un article, un evenement ont un
auteur) et cela releve du back, qui possede le schema. Deux issues sont
acceptables et le front sait afficher les deux : soit la suppression est
refusee en 422 quand le compte a produit du contenu, avec un message qui
oriente vers la suspension ; soit elle est acceptee et l'auteur devient
anonyme. Ce qui n'est pas acceptable, c'est un 500, ou une suppression qui
emporte le contenu.

## Les refus sur lesquels le front compte

Ils sont a **enforcer cote serveur**, et repetes cote ecran pour eviter un
aller-retour evident. La garde du front est **cosmetique** : elle masque une
entree de menu, elle ne protege rien. Toute route d'ecriture doit refuser
d'elle-meme.

1. **Le dernier administrateur ne peut etre ni supprime, ni suspendu, ni
   retrograde en editeur.** 422. Sans cette regle une ambassade se verrouille
   hors de son propre site en trois clics, et seule une intervention en base
   la reouvre. C'est le refus le plus important de ce contrat.
2. **On n'agit pas sur son propre compte** par ces routes : ni suppression, ni
   suspension, ni changement de role. 422. Un administrateur qui se
   retrograde par erreur ne peut plus se relever.
3. **`super_admin` est refuse en ecriture** depuis une route d'ambassade, a la
   creation comme a la modification : 403, explicitement, et non ignore en
   silence. C'est le precedent de `slug`, `domain` et `modules` dans les
   parametres — un champ hors de portee se refuse, il ne s'escamote pas.
4. **`editeur` n'atteint aucune de ces routes**, en lecture comme en ecriture :
   403. Y compris `GET /api/admin/users` — la liste des comptes et des adresses
   de ses collegues n'est pas du contenu.
5. **L'adresse est unique sur toute la plateforme**, puisqu'elle sert a se
   connecter. Un doublon rend 422, et **le message ne doit pas reveler qu'un
   compte existe ailleurs** : « Cette adresse est deja utilisee » suffit, et
   « deja utilisee par l'ambassade du Gabon » apprend a un tenant qui travaille
   chez un autre.
6. **Un role inconnu est refuse en ecriture** (422) plutot que converti.

## La session, qui conditionne le reste — regle le 2026-09-17

Cette section posait deux demandes au back. Les deux ont ete tranchees le jour
meme, et l'une l'a ete contre moi.

**`GET /api/auth/me` existe et est deploye en production.** Son enveloppe n'est
ni `{ "user": … }` seul ni `{ "data": … }` :

```json
{ "user": { "id": 1, "name": "…", "email": "…", "role": "admin", "embassy_id": 1 },
  "embassy": null }
```

C'est la meme forme que `POST /api/auth/login`, au jeton pres. Le front la lit
desormais au demarrage : `restaurerSession()` ne rehydratait pas l'utilisateur,
si bien qu'apres un rechargement on etait authentifie sans savoir qui.

**La demande d'aligner `nom` sur `name` etait sans objet, et l'erreur etait de
mon cote.** Le back n'a jamais servi `nom` : `AuthController::userPayload()`
rend `name`, a la connexion comme sur `me`. C'est le faux serveur local qui
avait invente le champ, et le gabarit qui s'y etait aligne — donc **le nom de
l'administrateur connecte ne s'affichait jamais en production**, le menu se
rabattant silencieusement sur « Administrateur ». Aucune rupture a planifier
cote back : un bug front, corrige.

La lecon vaut d'etre ecrite ici, parce qu'elle se repetera : **un bouchon qui
s'ecarte du contrat ne simplifie pas le developpement, il deplace le bug
jusqu'au deploiement**, ou plus personne ne le cherche. Verifier contre le code
du back, jamais contre le faux serveur.

Le store ne retient pas le bloc `embassy` servi a cote du compte : la
configuration du site vient du bootstrap, resolu par le DOMAINE, et en garder
une seconde copie resolue par le COMPTE ouvrirait deux verites sur la meme
ambassade.

## Regles communes

Celles des contrats precedents s'appliquent telles quelles : texte libre
assaini cote serveur, `{ "data": … }` en enveloppe d'administration, 422 pour
une validation avec le detail par champ, et pas de cache a invalider.

Une seule s'ajoute, propre a cette surface : **toute action sur un compte est
journalisee cote serveur** — qui, sur qui, quand. Ce n'est pas un ecran
demande, et le front n'a rien a en lire ; c'est la trace sans laquelle un
« je n'ai pas fait ca » ne se tranche pas.

## Ce que ce contrat ne couvre pas

- **L'ecran `super_admin`** — gerer les ambassades, leurs domaines et leurs
  modules. C'est une surface transverse, elle merite son propre contrat, et
  elle est deja au dossier des restes a faire.
- **Le changement de mot de passe par l'interesse** et l'oubli de mot de
  passe. `ChangePassword.vue` et `MonProfil.vue` existent dans le gabarit,
  herites et non branches. Ce sont des routes de compte et non
  d'administration ; elles vont avec l'invitation et devraient etre tranchees
  dans la meme passe, mais elles ne sont pas ci-dessus.
- **La double authentification.** Pas demandee.
- **Le bandeau « Vous editez le site de … »**, qui devient utile des qu'un
  `super_admin` entre dans l'administration d'un poste. Deja au dossier.

## Etat cote back au 2026-09-17

La session back a repondu aux quatre questions et releve l'essentiel : **cette
surface n'existe pas encore**. Son inventaire, verifie dans son depot :

- **Aucune route utilisateurs.** `routes/api.php` n'a que `auth/login`,
  `auth/me` et `auth/logout`.
- **Deux roles, pas trois.** `app/Enums/UserRole.php` ne declare que `admin` et
  `super_admin` : **`editeur` n'existe pas**. La regle « un role inconnu est
  traite comme `editeur` » reste la bonne prudence cote front, mais elle ne
  protege rien tant que le role n'existe pas en base.
- **Aucune notion de suspension** : la table `users` porte `embassy_id` et
  `role`, sans colonne d'etat.
- **Aucun mecanisme d'invitation.**
- **La messagerie n'est pas configuree**, et surtout le depot ne contient aucun
  Mailable ni aucune Notification : `invitation.sent` ne peut donc pas valoir
  `true` aujourd'hui, et pas seulement faute de SMTP. Le choix de rendre `sent`
  dans la reponse et d'afficher le lien quand il vaut `false` tient : c'est
  meme ce qui rend la surface utilisable des le premier jour.
- **La question du compte supprime ayant publie est sans objet** : aucune table
  de contenu ne reference `users`, et `articles` ne porte que `embassy_id` et
  `categorie_id`. La paternite n'etant stockee nulle part, une suppression ne
  peut ni emporter du contenu ni laisser un auteur orphelin — mais « auteur
  anonymise » est tout aussi impossible a afficher. Afficher un auteur serait
  un ajout de schema, pas un choix de comportement.

Ce document decrit donc un **lot back entier** — schema, role `editeur`,
invitations, garde du dernier administrateur, refus 403 du `super_admin` depuis
une route d'ambassade — et non un branchement. C'est une decision d'Elsa, pas
une suite automatique. La session back a indique vouloir reprendre la garde du
dernier administrateur telle quelle.
