import { normaliserEmbassy } from '@/api/bootstrap'
import type { Embassy } from '@/api/bootstrap'
import guinee from './bootstrap.json'
import gabon from './bootstrap-gabon.json'
import gabonAvantColonnes from './bootstrap-gabon-production.json'

/**
 * Les tenants des fixtures, tels que le store les detient reellement.
 *
 * Les tests assignaient auparavant la fixture brute au store, ce qui court-
 * circuitait la normalisation et masquait la forme reellement servie par
 * l'API. C'est ainsi qu'une fuite d'identite a atteint la production : la
 * fixture etait a plat quand la reponse etait imbriquee.
 */
export const GUINEE: Embassy = normaliserEmbassy(guinee.embassy)
export const GABON: Embassy = normaliserEmbassy(gabon.embassy)

/**
 * Le Gabon tel qu'il etait provisionne avant `display_name` et avant les
 * quatre cles de modules ajoutees ensuite. Le contrat prevoit ce cas pour
 * toute ambassade creee avant ces colonnes : il sert ici de garde.
 */
export const GABON_AVANT_COLONNES: Embassy = normaliserEmbassy(gabonAvantColonnes.embassy)
