# Integration continue et livraison

Deux workflows GitHub Actions vivent dans `.github/workflows/` :

| Fichier | Declencheur | Role |
| --- | --- | --- |
| `ci.yml` | PR vers `develop` ou `main`, push sur `develop`, lancement manuel | Lint, types, tests unitaires, build, tests de bout en bout |
| `livraison-production.yml` | Lancement manuel uniquement | Verifie, construit, puis deploie apres approbation |

## Pourquoi Docker

Chaque travail s'execute dans un conteneur (`node:22-bookworm-slim` pour les
verifications, l'image officielle Playwright pour les tests de bout en bout).
Le serveur qui heberge le runner n'a donc besoin que de Docker : ni Node, ni
navigateurs, ni dependances systeme a maintenir a la main, et l'environnement
est identique d'une execution a l'autre.

L'image Playwright porte un numero de version (`v1.58.2-noble`) qui doit
rester aligne sur `@playwright/test` dans `package.json`. Les deux montent
ensemble, sinon les navigateurs ne correspondent plus au client.

## Runner auto-heberge

Le projet vise un runner auto-heberge, installe sur le serveur, pour ne pas
consommer les minutes GitHub Actions.

Les workflows n'ecrivent pas `self-hosted` en dur. Ils lisent une variable de
depot :

```yaml
runs-on: ${{ vars.RUNNER_CI || 'ubuntu-latest' }}
```

Tant que `RUNNER_CI` n'est pas definie, tout tourne sur les runners GitHub :
la CI fonctionne des maintenant. Une fois le runner installe :

1. Depot > Settings > Actions > Runners > New self-hosted runner, suivre les
   instructions pour la machine cible.
2. Verifier que l'utilisateur du runner appartient au groupe `docker` : les
   travaux s'executent dans des conteneurs, le runner doit pouvoir en lancer.
3. Depot > Settings > Secrets and variables > Actions > Variables > New
   variable : nom `RUNNER_CI`, valeur `self-hosted` (ou l'etiquette choisie).

Aucun fichier de workflow n'est a modifier ; la bascule se fait par cette
seule variable, et se defait en la supprimant.

## Rien ne part en production tout seul

`livraison-production.yml` n'ecoute aucun evenement automatique. Fusionner sur
`main` ne declenche pas de deploiement : il faut ouvrir l'onglet Actions,
choisir la reference a livrer et taper `LIVRER` dans le champ de confirmation.

Le travail `deployer` est rattache a l'environnement GitHub `production`.
Configurer cet environnement avec des relecteurs obligatoires (Settings >
Environments > production) ajoute une approbation humaine avant que quoi que
ce soit ne touche le serveur.

L'etape de deploiement elle-meme n'est pas encore ecrite : elle appartient a
la session dediee au deploiement. En attendant, ce travail s'arrete en echec
plutot que de laisser croire qu'une livraison a eu lieu.

## Ce qui n'est pas encore verrouille

- **Le formatage.** `prettier --check src/` signale aujourd'hui 84 fichiers,
  heritage du code d'origine. La verification n'est volontairement pas dans la
  CI : l'y ajouter la ferait echouer immediatement. Elle pourra etre activee
  apres une PR de reformatage dediee.
- **Les protections de branche.** Rendre la CI bloquante se fait cote GitHub
  (Settings > Branches), en exigeant les controles `Lint, types et tests
  unitaires` et `Build et tests de bout en bout` avant fusion.
