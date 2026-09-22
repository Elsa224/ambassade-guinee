# Mises à jour du site du Gabon — état du terrain

Préparé le 17 septembre 2026. Ce dossier ne contient que du contenu prêt à
poser et ce plan. Il est versionné depuis le 22 septembre 2026 ; le relevé
ci-dessous est celui du 17 et n'a pas été rafraîchi — l'état à jour est en tête
de `champs-a-saisir.md`.

Relevé de production du 17 septembre au soir, sur `ambagabonguinee.com` :

| Surface | État servi |
|---|---|
| `hero` | diaporama, 3 diapositives, titre vide, même citation sur les trois |
| `welcome` | rempli, texte provisoire non signé |
| `ambassador` | **null** — la page se retracte et sort du menu |
| `leaders` | 3 dirigeants avec photographies, 2 titres abrégés |
| `showcase` | 4 photographies |
| `contact.address` | **null** |
| `contact.phones` | **vide** |
| `directory` | **vide** (ni agents, ni consuls) |
| `holidays` | **vide**, rubrique fermée |
| `articles` | **aucun** |
| services | 7 services en ligne, plateforme Express54 |
| modules ouverts | `secure_events`, `services_consulaires` — tout le reste fermé |

---

## Lot 1 — À poser dans l'administration, sans une ligne de code

Rien n'y attend de développement : les champs existent, les textes sont dans ce
dossier. Voir `champs-a-saisir.md`, `mot-de-bienvenue.html` et
`biographie-ambassadeur.html`.

1. Le mot de bienvenue officiel, qui remplace le texte provisoire.
2. La biographie de l'Ambassadeur, **qui ouvre une page aujourd'hui absente**.
3. Le titre et l'accroche du bandeau.
4. Les deux titres de dirigeants à rétablir.
5. L'adresse de la Chancellerie.

Ordre conseillé : la biographie d'abord, parce qu'elle rend une page au site,
puis l'adresse, puis le bandeau et les titres.

**Deux points à confirmer avant de poser le bandeau** : l'accroche prend-elle
la place du nom de l'ambassade en titre, et que fait-on des trois diapositives
qui portent la même citation. Les deux sont notés dans `champs-a-saisir.md`.

---

## Lot 2 — Le contrat de contenu rédactionnel

C'est le vrai chantier, et il n'appartient pas qu'au front.

Le poste a envoyé des textes de fond pour des pages dont le contenu est
**compilé dans le gabarit** et reste celui de l'ambassade de Guinée aux
États-Unis : `/presentation` (adresse à Washington, juridiction États-Unis,
Costa Rica, Haïti, Bahamas, « 1959 », « 186 ambassades à Washington DC »),
`/relations-bilaterales` et ses cinq pages par pays, `/chancellerie` qui ne
porte que des personnes. Ces rubriques sont fermées sur le domaine gabonais
par `CONTENU_INTEGRE_DE` dans `src/tenant/rubriques.ts`, ce qui était la bonne
décision : mieux vaut ne rien montrer que le contenu du voisin.

Textes en attente d'un champ : missions de l'Ambassade en neuf sections,
organigramme, présentation du Gabon, relations Gabon-Guinée, onze domaines de
coopération, présentation et juridiction de la Chancellerie, et une éventuelle
bande d'annonce sur l'accueil.

**Forme proposée, à écrire et à soumettre au back** : une page rédactionnelle
est un enregistrement `{ slug, title, body_html, position, published }`, servi
en lecture sur `/api/content/pages` et `/api/content/pages/{slug}`, administré
sous `/api/admin/pages`. Le jeu de `slug` est **fermé** et calé sur les
rubriques que le gabarit sait déjà afficher, pour qu'aucune page ne puisse être
créée sans un endroit où la rendre. Une page absente ou non publiée laisse sa
rubrique fermée, exactement comme aujourd'hui — c'est la règle qui a évité la
fuite des dirigeants guinéens sur l'accueil gabonais.

Deux questions restent ouvertes et bloquent une partie du lot :

- **L'organigramme** est un arbre, l'annuaire une liste ordonnée. Présenter les
  agents par service dans l'ordre de l'organigramme ne demande aucun
  développement ; dessiner un organigramme est un chantier à part.
- **Le texte sur la digitalisation** annonce des services qui n'existent pas
  (rendez-vous, pré-demandes, suivi de dossier). Publié tel quel, il se lira
  comme une promesse.

Les deux ont été posées au poste dans `docs/reponse-fiche-renseignements-gabon.md`.

---

## Lot 3 — Ce qui attend le poste, et rien d'autre

Numéros de téléphone, confirmation du courriel et des horaires, date
d'établissement de la mission, chiffres marquants, juridiction, équipe
diplomatique, secrétariat, consuls honoraires, actualités, liens des réseaux
sociaux, validation du calendrier des fêtes légales, et **toutes les images** :
aucune n'était jointe à la fiche. Le portrait de l'Ambassadeur est le seul dont
l'absence se voit immédiatement sur une page.

Deux réserves techniques déjà signalées au poste :

- le CMS téléverse des images, pas des documents : les formulaires consulaires à
  télécharger n'ont aucun endroit où se poser ;
- aucun champ ne porte les liens de réseaux sociaux.

---

## Un piège écarté

Le dossier des fichiers déposés contient une biographie d'ambassadeur qui n'est
**pas** celle du Gabon : `BIOGRAPHIE_DE_SEM_IBRAHIMA_NDAIRY_DIALLO` est celle
de l'Ambassadeur de Guinée aux États-Unis. Elle appartient au tenant
`guinee-usa`. La coller dans le CMS gabonais produirait exactement la fuite que
tout le travail sur les tenants a servi à fermer.
