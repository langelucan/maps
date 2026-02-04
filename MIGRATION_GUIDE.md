# Guide de migration vers la nouvelle version

## Problème
Vous voyez "Aucune combinaison trouvée" même si vous avez des mots-clés et villes affichés.

## Cause
L'ancienne version stockait les données localement, la nouvelle version utilise Supabase (base de données en ligne).

## Solution : Migration automatique

### Étape 1 : Ouvrir la page de migration
1. Faites un clic droit sur l'icône de l'extension dans Chrome
2. Ou ouvrez une nouvelle page et allez à : `chrome-extension://[ID_EXTENSION]/migrate-data.html`

### Étape 2 : Exécuter la migration
1. La page va détecter automatiquement vos anciennes données
2. Vous verrez la liste des mots-clés et villes trouvés
3. Cliquez sur "Migrer vers Supabase"
4. Attendez le message "Migration réussie !"

### Étape 3 : Vérifier
1. Ouvrez l'extension
2. Cliquez sur "Options"
3. Vérifiez que les statistiques affichent le bon nombre de combinaisons
4. Retournez sur Google Maps et cliquez sur "Démarrer"

## Alternative : Import manuel

Si la migration automatique ne fonctionne pas :

1. Ouvrez les Options de l'extension
2. Dans la section "Mots-clés", tapez (un par ligne) :
   ```
   taxi
   restaurant
   hotel
   ```
3. Cliquez sur "Importer les mots-clés"
4. Dans la section "Villes", tapez (une par ligne) :
   ```
   Paris
   Lyon
   Marseille
   ```
5. Cliquez sur "Importer les villes"
6. Vérifiez les statistiques

## Support

Si vous avez toujours des problèmes, vérifiez la console du navigateur (F12) pour voir les erreurs.
