<template>
  <!--
    Racine de la rubrique Evenements : elle n'ajoute aucun habillage, elle
    existe pour que la fiche soit IMBRIQUEE sous `/dashboard/evenements` et
    non posee a cote.

    La nuance est visible a l'ecran : `active-class` de vue-router allume un
    lien des que sa route est un ancetre de la route courante. Deux routes
    soeurs a plat, et la rubrique « Evenements » de la barre laterale
    s'eteindrait des qu'on ouvre un evenement.
  -->
  <RouterView />
</template>
