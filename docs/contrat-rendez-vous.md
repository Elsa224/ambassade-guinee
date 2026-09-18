# Prise de rendez-vous servie par le CMS — contrat propose

> Proposition ecrite par la session front le 2026-09-18, a la demande de
> l'ambassade du Gabon, qui veut ouvrir la rubrique « Prise de rendez-vous ».
> Le back reste libre de la forme interne ; ce document fige **ce que le front
> appelle et ce qu'il lit**. En cas d'ecart, c'est le document du depot back
> qui tranchera, comme pour le bootstrap, le contenu d'accueil et les services
> consulaires.

## Pourquoi, et l'etat exact d'aujourd'hui

La page `/rendez-vous` du gabarit est une **maquette**. Son formulaire est
complet et soigne, mais `submitRendezVous` ne contacte aucun serveur :

```js
// Simuler l'envoi au serveur (a remplacer par votre API)
await new Promise((resolve) => setTimeout(resolve, 1500))
console.log('Rendez-vous demande:', formData)
```

Il attend une seconde et demie, vide le formulaire, puis affiche « Votre
demande de rendez-vous a ete enregistree avec succes. Nous vous contacterons
sous 48h ». **La demande du citoyen est jetee.** Personne au poste ne la voit,
et le visiteur repart en croyant avoir un rendez-vous consulaire.

Rien n'est expose pour l'instant : `rendez_vous` vaut `false` pour toutes les
ambassades, donc la rubrique est masquee et le formulaire inatteignable. Ce
drapeau ne doit pas passer a `true` avant que les deux surfaces decrites ici
existent. C'est la seule garantie qui tienne : une fausse confirmation sur un
rendez-vous consulaire coute un deplacement a quelqu'un.

## Ce que ce module est, et ce qu'il n'est pas

C'est une **demande** de rendez-vous, pas une reservation. Le visiteur indique
le service, une date et une heure souhaitees ; le poste traite la demande
depuis son back-office et confirme lui-meme. Decision d'Elsa du 18/09/2026.

Il n'y a donc **ni disponibilites, ni quotas, ni creneaux libres** : rien dans
ce contrat ne dit qu'une heure est prise. Un moteur de reservation en temps
reel suppose un planning tenu a jour tous les jours par le poste ; le poste
gabonais n'a pas encore livre ses telephones ni son annuaire. Un calendrier de
disponibilites mal tenu est pire que pas de calendrier : il affiche des
creneaux libres pour lesquels les gens se deplacent.

La consequence tient en une phrase, et elle porte sur la redaction : le site ne
doit jamais ecrire « votre rendez-vous est confirme », mais « votre demande est
enregistree, le poste vous recontacte ».

## Surface visiteur

Un seul appel, anonyme, resolu par domaine (en-tete `X-Embassy-Domain` ou
parametre `?domain=` en local, comme `/api/bootstrap`).

```
POST /api/content/appointments
```

```json
{
  "service": "passeport",
  "first_name": "Aya",
  "last_name": "Camara",
  "email": "aya.camara@example.org",
  "phone": "+224 000 00 00 00",
  "preferred_date": "2026-09-24",
  "preferred_time": "09:30",
  "documents": "Acte de naissance, ancien passeport",
  "message": "Je suis disponible le matin uniquement."
}
```

Reponse attendue en cas de succes, **201** :

```json
{
  "data": {
    "reference": "RDV-2026-000123",
    "status": "nouveau",
    "created_at": "2026-09-18T10:12:04+00:00"
  }
}
```

La `reference` est le seul element que le front affiche au visiteur apres
l'envoi : c'est ce qu'il pourra citer au telephone. Elle doit etre lisible a
l'oral et unique par ambassade.

### Champs, et bornes

| Champ | Obligatoire | Borne proposee |
| --- | --- | --- |
| `service` | oui | slug d'un service publie par l'ambassade, ou `autre` |
| `first_name` | oui | 1 a 80 caracteres |
| `last_name` | oui | 1 a 80 caracteres |
| `email` | oui | adresse valide, 255 max |
| `phone` | oui | 6 a 32 caracteres, forme libre |
| `preferred_date` | oui | `AAAA-MM-JJ`, aujourd'hui + 2 jours au plus tot |
| `preferred_time` | oui | `HH:MM` |
| `documents` | non | 1000 caracteres |
| `message` | non | 2000 caracteres |

Deux precisions sur `service`. Le formulaire actuel porte une liste de services
ecrite en dur (`passeport`, `carte-consulaire`, `etat-civil`, `legalisation`,
`visa`, `ambassadeur`, `autre`) : c'est un reste du gabarit guineen. Le front
la remplacera par les services que l'ambassade a publies dans le module
`services_consulaires`, plus `autre`, de sorte qu'une ambassade ne propose
jamais un rendez-vous pour un service qu'elle n'offre pas. Le back doit donc
accepter n'importe quel slug de sa propre table de services, plus la valeur
`autre`, et refuser le reste en 422.

Sur `preferred_date`, la regle « aujourd'hui + 2 jours » est aujourd'hui tenue
par le front seul, et un front n'est pas une garantie. **Le serveur doit la
refuser lui aussi.** Si le module des jours feries est actif, refuser en plus
une date fermee serait un vrai service rendu — c'est un souhait, pas une
exigence.

### Erreurs

Le detail par champ prime sur le message agrege, comme partout ailleurs :

```json
{
  "message": "Les donnees fournies sont invalides.",
  "errors": {
    "preferred_date": ["La date doit etre posterieure d'au moins deux jours."]
  }
}
```

Le front affiche l'erreur sous le champ concerne et n'ouvre **jamais** la
fenetre de confirmation tant qu'il n'a pas recu un 201.

### Abus

C'est une route publique, anonyme, qui ecrit en base et qui declenche
probablement un courriel : c'est la surface la plus exposee du CMS. Le front
n'a aucun moyen de s'en proteger. Le back est demande sur trois points :

- une limitation par adresse IP et par ambassade, avec **429** et `Retry-After`
  — le front affichera alors « trop de demandes, reessayez dans un moment »,
  pas une fausse confirmation ;
- un plafond de demandes par adresse de courriel sur une periode ;
- l'assainissement des champs libres, qui finiront dans un courriel et dans un
  ecran d'administration.

### Accuse de reception

Le site promet aujourd'hui un rappel sous 48h. Pour que cette promesse tienne,
il faut que quelqu'un soit prevenu. Deux envois sont demandes au back, et le
front adaptera son texte a ce que le back accepte de faire :

- au visiteur, un accuse de reception portant sa reference ;
- a l'ambassade, une notification a l'adresse de contact du bootstrap.

Si aucun des deux n'est fait, le front retirera la mention des 48h.

## Surface d'administration

Gardee par le compte, comme le reste du back-office : l'ambassade est resolue
par l'utilisateur connecte, jamais par le domaine.

```
GET    /api/admin/appointments?status=nouveau&page=1
GET    /api/admin/appointments/{id}
PATCH  /api/admin/appointments/{id}
DELETE /api/admin/appointments/{id}
```

La liste sert les memes champs que l'envoi, augmentes de :

```json
{
  "id": 123,
  "reference": "RDV-2026-000123",
  "status": "nouveau",
  "staff_note": null,
  "created_at": "2026-09-18T10:12:04+00:00",
  "updated_at": "2026-09-18T10:12:04+00:00"
}
```

`status` est une liste fermee : `nouveau`, `confirme`, `refuse`, `honore`,
`annule`. Le front tient les libelles et les couleurs, comme pour les types de
jours feries ; il ne les recoit pas du serveur.

`PATCH` ne porte que `status` et `staff_note` : le poste ne recrit pas la
demande d'un citoyen, il la traite. La note reste interne et n'est jamais
servie sur la surface visiteur.

La pagination suit celle des autres listes d'administration, et le tri par
defaut est la date de creation decroissante.

### Donnees personnelles

Une demande porte un nom, un courriel et un telephone. Deux exigences en
decoulent, et elles appartiennent au back :

- l'acces est reserve aux roles qui traitent le consulaire ; ce n'est pas du
  contenu editorial et cela ne doit pas etre visible de tout compte du CMS ;
- une duree de conservation, au-dela de laquelle les demandes traitees sont
  purgees. Le front n'a pas d'avis sur la duree, mais il y en faut une.

## Ce que le front fait de tout cela

1. `src/api/rendez-vous.ts` : types, envoi, liste d'administration, changement
   de statut.
2. `RendezVous.vue` : le `setTimeout` disparait, la liste des services vient du
   module `services_consulaires`, les erreurs 422 s'affichent sous les champs,
   la fenetre de confirmation n'apparait qu'apres un 201 et porte la reference.
3. `/dashboard/rendez-vous` : la liste des demandes, filtrable par statut, le
   detail d'une demande et le changement de statut.
4. `rendez_vous` ne passe a `true` pour aucune ambassade avant que les points
   1 a 3 soient en production.

## Ce qui reste a trancher par le back

- Le nom des routes : `appointments` est propose par coherence avec
  `/api/content/services`, mais le back a le dernier mot.
- Les valeurs de `status` : proposees en francais pour suivre les types de
  jours feries, alors que le reste du contrat est en anglais.
- La plateforme Ambassade Secure gere-t-elle deja des rendez-vous en amont ?
  Si oui, le CMS pourrait relayer `/api/secure/rdv` comme il relaie les
  evenements, plutot que tenir sa propre table. Le front s'adapte a l'un ou a
  l'autre, mais pas aux deux.
