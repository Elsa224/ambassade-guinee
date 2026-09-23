# Prise de rendez-vous de chancellerie — ce que le front appelle

> Ecrit par la session front le 2026-09-22. **Ce document ne propose rien.**
> Il enregistre le contrat que la session back a verifie contre son propre
> code, et consigne ce que le front en consomme. En cas d'ecart, c'est le
> depot back qui tranche.
>
> Il remplace une proposition du 2026-09-18 qui reposait sur des premisses
> fausses de bout en bout : un `POST /api/content/appointments` qui n'existe
> pas, un ecran d'administration qui n'a aucun objet, un champ `service` qui
> n'est pas accepte, et le mauvais drapeau de module. La lecon tient en une
> phrase : un contrat ecrit par le front n'est une proposition que tant que
> le back ne l'a pas amende, et il ne faut pas le lire ensuite comme un
> releve de l'existant.

## Deux rendez-vous, et un seul est ici

Le rendez-vous **consulaire** — passeport, visa, etat civil, legalisation —
se prend **exclusivement sur Express54**, deja presente en bloc `platform`
sur la page des services. Aucune route de ce document ne le sert.

Le rendez-vous de **chancellerie** — voir l'Ambassadeur ou son secretariat —
est une visite physique, avec controle a l'entree. Ambassade Secure la sert,
et le CMS n'est qu'un **relais** : il n'ecrit aucune donnee personnelle de
visiteur dans sa base.

C'est le risque principal du lot, et il est de redaction autant que de code.
Le formulaire du gabarit proposait « Demande de passeport », « Information
visa », « Actes d'etat civil ». Branche tel quel sur ces routes, il aurait
envoye des demandes de passeport au secretariat de l'Ambassadeur. La page
doit dire ce qu'elle n'est pas, et renvoyer vers Express54.

## Le drapeau

**`secure_rdv`**, et non `rendez_vous`. Il vaut `false` partout par defaut ;
tant qu'il l'est, les routes rendent le refus du middleware
`secure.module:secure_rdv`. Il ne passera a `true` que sur decision d'Elsa.

Cote front, `/rendez-vous` est passe de `RUBRIQUE_PAR_CHEMIN` a
`MODULE_PAR_CHEMIN` dans `src/tenant/rubriques.ts`. Ce n'est pas un
rangement : les deux tables ont des defauts **opposes**. En rubrique de
contenu, un drapeau absent laisse la page **ouverte** sur le site d'origine
et quand aucun tenant n'est charge — le formulaire de maquette etait donc
atteignable des qu'un bootstrap echouait. En module, l'absence ferme.

## Aucune surface d'administration

Il n'y a pas de `admin/appointments`, pas de table de rendez-vous cote CMS,
donc **pas de `/dashboard/rendez-vous`** : il n'y aurait rien a y afficher.
Le poste traite ses demandes dans Ambassade Secure.

## Les deux routes, publiques, sous `tenant.public`

### `GET /api/secure/rdv` — 30 requetes par minute

```json
{ "data": { "name": "Ambassade du Gabon", "departments": [{ "slug": "protocole", "name": "Protocole" }] } }
```

Rien d'autre. C'est cette liste qui alimente le choix du visiteur : une
ambassade ne propose jamais un departement qu'elle n'a pas declare.

### `POST /api/secure/rdv` — 5 requetes par minute

Champs acceptes, aux noms de SecureCheck et non a ceux du CMS :

| Champ | Obligatoire | Remarque |
| --- | --- | --- |
| `firstName` | oui | |
| `lastName` | oui | |
| `phone` | oui | |
| `email` | oui | |
| `date` | oui | `AAAA-MM-JJ` |
| `time` | oui | `HH:MM` |
| `host` | non | personne visitee |
| `departmentSlug` | non | un `slug` rendu par le GET |
| `purpose` | oui | motif de la visite |
| `idNumber` | non | |
| `idCardFront` | non | image, 10 Mo |
| `idCardBack` | non | image, 10 Mo |

Trois pieges nommes par le back :

- `companySlug` **n'est pas accepte** : l'entreprise vient du domaine.
- un `hostSlug` recu est **ignore** en silence — le choix du departement se
  fait avec `departmentSlug`.
- la piece d'identite est faite de **deux** fichiers facultatifs, recto et
  verso. La documentation amont qui annonce un `idCard` unique est perimee.

**Encodage : `multipart/form-data` systematique.** Les deux encodages sont
acceptes par la FormRequest, et les deux sont couverts par les tests du back,
mais l'ecran propose toujours les deux pieces d'identite : coder deux chemins
selon qu'un fichier est joint ou non, c'est deux chemins a tester pour un
gain nul. Un multipart sans fichier est valide.

Un piege propre au multipart, signale par le back : il n'a ni booleen ni
`null`, tout y est chaine. Un champ facultatif non rempli doit donc etre
**omis**, jamais envoye en chaine vide — le CMS retire les cles nulles avant
de relayer, il ne devine pas qu'une chaine vide voulait dire « absent ».

Reponse **201**, liste blanche fermee de **six cles** :

```json
{
  "data": {
    "reference": "...",
    "status": "pending",
    "scheduledAt": "2026-10-01T10:30:00.000Z",
    "department": { "slug": "...", "name": "..." },
    "purpose": "...",
    "host": null
  }
}
```

Ni `kind`, ni `visitor`, ni `createdAt`, ni `rejectionReason`. `department`
vaut `{ slug, name }` ou `null` ; `host` est une chaine ou `null`.

`status` est un code technique de SecureCheck, **en anglais**, a traduire
cote front. L'enumeration amont complete : `pending`, `approved`, `rejected`,
`cancelled`, `checked_in`, `checked_out`. A la creation, seul `pending`
apparait — mais les six sont traduits ici. Afficher un code non reconnu tel
quel est exactement la faute deja commise sur les etats d'evenement.

**`scheduledAt` ne doit pas etre reformate dans le fuseau du navigateur.**
L'amont construit la date avec `new Date("2026-10-01T10:30")`, sans fuseau :
elle est interpretee dans le fuseau du serveur SecureCheck, puis serialisee
avec un suffixe `Z` qu'elle n'a pas merite. Passer ce `Z` a
`toLocaleString()` afficherait 12:30 a un visiteur parisien qui a demande
10:30. Le recapitulatif montre donc la date et l'heure que le visiteur vient
de saisir : on les a sous la main, elles sont exactes, et elles sont ce qu'il
a voulu dire.

Le bloc `visitor` de l'amont ne passe jamais. La `reference` est le seul
element que le visiteur emporte : c'est ce qu'il citera au telephone. **Le
CMS n'a aucune route pour relire une demande creee** : le recapitulatif de
confirmation est la seule et derniere vue qu'il en aura.

## Bornes tenues par le serveur

La date est bornee cote serveur : `after_or_equal:today`, et une fenetre de
90 jours. Au-dela, 422 avec un message francais directement presentable — le
front l'affiche tel quel plutot que d'en fabriquer un.

Le front borne le meme champ dans le selecteur de date, pour que la borne se
voie avant l'envoi. Ce n'est pas une garantie : un front n'en est jamais une,
et c'est bien le serveur qui refuse.

**Les deux bornes ne coincident pas, et l'ecart est visible par le
visiteur.** Le CMS valide `after_or_equal:today` sur la date **seule** ;
l'amont, lui, refuse tout horodatage anterieur a l'instant present. Une
demande deposee aujourd'hui pour une heure deja passee franchit donc le 422
du CMS et se fait refuser plus loin, par SecureCheck, sous la forme d'un
refus amont relaye. Le formulaire borne l'heure quand la date choisie est
aujourd'hui, pour que ce cas ne se produise pas.

## Ce que la page ne doit jamais ecrire

« Votre rendez-vous est confirme. » C'est une **demande** : ni disponibilites,
ni quotas, ni creneaux libres (decision d'Elsa du 18/09/2026). Le poste
confirme lui-meme. Une fausse confirmation coute un deplacement a quelqu'un.
