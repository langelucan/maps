# Guide d'Installation - Google Maps Scraper Pro

Guide pas à pas pour installer et utiliser votre extension Chrome.

## Prérequis

- Google Chrome (version 88 ou supérieure)
- Accès à chrome://extensions/
- Le dossier `extension` de ce projet

## Étape 1 : Générer les icônes

**⚠️ ÉTAPE OBLIGATOIRE - Ne pas sauter**

1. Naviguez vers le dossier `extension/icons/`
2. Ouvrez le fichier `generate-icons.html` dans Chrome
3. Vous verrez 4 icônes affichées
4. Cliquez sur le bouton "Télécharger" sous chaque icône
5. Enregistrez tous les fichiers PNG dans le dossier `extension/icons/`

Fichiers requis :
- ✅ icon16.png
- ✅ icon32.png
- ✅ icon48.png
- ✅ icon128.png

**Alternative** : Vous pouvez créer vos propres icônes avec un outil de design graphique. Assurez-vous qu'elles respectent les dimensions requises.

## Étape 2 : Activer le mode développeur

1. Ouvrez Google Chrome
2. Dans la barre d'adresse, tapez : `chrome://extensions/`
3. Appuyez sur Entrée
4. En haut à droite de la page, activez le **"Mode développeur"**

![Mode développeur](https://via.placeholder.com/600x100/059669/FFFFFF?text=Activez+le+Mode+d%C3%A9veloppeur)

## Étape 3 : Charger l'extension

### Méthode A : Charger le dossier

1. Sur la page `chrome://extensions/`
2. Cliquez sur le bouton **"Charger l'extension non empaquetée"**
3. Une fenêtre de sélection de dossier s'ouvre
4. Naviguez et sélectionnez le dossier `extension`
5. Cliquez sur **"Sélectionner le dossier"**

### Méthode B : Glisser-déposer

1. Compressez le dossier `extension` en fichier .zip
2. Glissez-déposez le fichier .zip sur la page `chrome://extensions/`
3. Chrome chargera automatiquement l'extension

## Étape 4 : Vérifier l'installation

Une fois chargée, vous devriez voir :

- ✅ Le nom : "Google Maps Scraper Pro"
- ✅ La version : "1.0.0"
- ✅ La description
- ✅ L'icône verte (si vous avez généré les icônes)
- ✅ Le statut : "Activé"

## Étape 5 : Épingler l'extension

Pour un accès facile :

1. Cliquez sur l'icône en forme de pièce de puzzle dans la barre d'outils Chrome (à côté de votre profil)
2. Trouvez "Google Maps Scraper Pro" dans la liste
3. Cliquez sur l'icône de punaise 📌 à côté du nom
4. L'icône apparaîtra maintenant dans votre barre d'outils

## Première utilisation

### Test rapide

1. Ouvrez [Google Maps](https://www.google.com/maps)
2. Cliquez sur l'icône de l'extension
3. La popup devrait s'ouvrir avec l'interface
4. Entrez un mot-clé simple, par exemple : "restaurant Paris"
5. Cliquez sur "Démarrer l'extraction"
6. Attendez la fin du processus
7. Un fichier CSV sera automatiquement téléchargé

### Configuration initiale

1. Dans la popup, cliquez sur "Options" en bas
2. La page de configuration s'ouvre
3. Ajustez les paramètres selon vos besoins :
   - Délai de défilement : 1000ms (par défaut)
   - Délai entre recherches : 3000ms (par défaut)
   - Inclure le mot-clé : Activé
   - Supprimer les doublons : Activé
4. Cliquez sur "Enregistrer les modifications"

## Utilisation avancée

### Extraction multi-mots-clés

1. Ouvrez Google Maps
2. Cliquez sur l'icône de l'extension
3. Dans le champ "Mots-clés", entrez plusieurs mots-clés (un par ligne) :
   ```
   taxi Paris
   taxi Lyon
   taxi Marseille
   ```
4. Choisissez votre format d'export
5. Activez "Regrouper en un seul fichier" si désiré
6. Cliquez sur "Démarrer l'extraction"

### Utiliser les mots-clés par défaut

1. Dans la popup, cliquez sur "Charger les taxis FR"
2. 100 mots-clés pour les taxis en France seront chargés
3. Vous pouvez modifier la liste avant de démarrer

## Résolution de problèmes

### Problème : L'extension ne s'installe pas

**Solution 1 : Vérifiez les icônes**
- Assurez-vous que tous les fichiers d'icônes sont présents dans `extension/icons/`
- Les fichiers doivent être nommés exactement : icon16.png, icon32.png, icon48.png, icon128.png

**Solution 2 : Vérifiez le manifest**
- Ouvrez `extension/manifest.json`
- Vérifiez qu'il n'y a pas d'erreurs de syntaxe

**Solution 3 : Permissions**
- Vérifiez que vous avez les droits d'accès au dossier

### Problème : L'icône ne s'affiche pas

**Solution :**
1. Retournez à l'Étape 1 et générez les icônes
2. Rechargez l'extension :
   - Allez dans `chrome://extensions/`
   - Trouvez "Google Maps Scraper Pro"
   - Cliquez sur l'icône de rafraîchissement 🔄

### Problème : "Charger l'extension non empaquetée" est grisé

**Solution :**
- Vérifiez que le "Mode développeur" est bien activé (interrupteur en haut à droite)

### Problème : L'extension ne fonctionne pas sur Google Maps

**Solution :**
1. Vérifiez que vous êtes sur google.com/maps ou google.fr/maps
2. Rechargez la page Google Maps
3. Ouvrez la console (F12) pour voir les éventuelles erreurs

### Problème : Aucun fichier n'est téléchargé

**Solution :**
1. Vérifiez les paramètres de téléchargement de Chrome
2. Assurez-vous que Chrome a la permission de télécharger des fichiers
3. Vérifiez qu'il y a des résultats sur Google Maps

## Désinstallation

Si vous souhaitez désinstaller l'extension :

1. Allez dans `chrome://extensions/`
2. Trouvez "Google Maps Scraper Pro"
3. Cliquez sur le bouton **"Supprimer"**
4. Confirmez la suppression

Toutes les données et paramètres seront supprimés.

## Mise à jour

Pour mettre à jour l'extension :

1. Remplacez les fichiers dans le dossier `extension`
2. Allez dans `chrome://extensions/`
3. Trouvez "Google Maps Scraper Pro"
4. Cliquez sur l'icône de rafraîchissement 🔄
5. L'extension est maintenant à jour

## Conseils de sécurité

- ✅ Cette extension est locale et ne transmet aucune donnée
- ✅ Vérifiez toujours le code source avant d'installer
- ✅ N'installez que des extensions de sources fiables
- ✅ Gardez Chrome à jour

## Support

Si vous rencontrez des problèmes non couverts par ce guide :

1. Consultez le README.md principal
2. Ouvrez la console Chrome (F12) pour voir les erreurs
3. Vérifiez que tous les fichiers sont présents
4. Essayez de recharger l'extension

## Checklist d'installation

Avant de commencer à utiliser l'extension, assurez-vous que :

- [ ] Les 4 fichiers d'icônes sont générés et dans le dossier icons/
- [ ] Le mode développeur est activé dans Chrome
- [ ] L'extension est chargée et apparaît dans chrome://extensions/
- [ ] L'extension est épinglée dans la barre d'outils
- [ ] Vous avez testé avec un mot-clé simple
- [ ] La page Options s'ouvre correctement

## Félicitations !

Votre extension Google Maps Scraper Pro est maintenant installée et prête à l'emploi ! 🎉

---

**Bon scraping !** 🗺️
