# Maps Scraper Pro - Version Complète

## ✨ Fonctionnalités

### 🚀 Auto-ouverture de Google Maps
Cliquez sur "Démarrer" n'importe où, l'extension ouvre automatiquement Google Maps pour vous.

### 📊 Compteur en temps réel
Regardez le compteur s'incrémenter à chaque fiche scrapée en direct.

### 📥 Téléchargement automatique ville par ville
Les données sont automatiquement téléchargées en CSV à la fin de chaque ville.

### ✅ Format CSV compatible Excel
Tous les fichiers sont en CSV avec encodage UTF-8 BOM, compatible avec Excel, Google Sheets, etc.

## 🚀 Utilisation

1. **Cliquer sur l'extension** (n'importe où)
2. **Saisir vos mots-clés** :
   ```
   taxi
   restaurant
   ```
3. **Saisir vos villes** :
   ```
   Paris
   Lyon
   Marseille
   ```
4. **Cliquer sur "Démarrer"**
5. **Google Maps s'ouvre automatiquement**
6. **Le compteur s'incrémente à chaque fiche**
7. **Les fichiers CSV se téléchargent automatiquement**

## 🎯 Modes d'extraction

### 🔍 Complet (par défaut)
Nom, catégorie, adresse, téléphone, site web, note, URL Google Maps

### 🔗 URLs uniquement (3x plus rapide)
Seulement les liens Google Maps

### 📞 Téléphones uniquement (3x plus rapide)
Seulement les numéros de téléphone

### 🔗📞 URLs + Téléphones (2x plus rapide)
Les deux : liens + téléphones

### 🌐 Sites web uniquement (3x plus rapide) ⭐ NOUVEAU
Extrait UNIQUEMENT les URLs des sites web des entreprises (www.restaurant.com, etc.)
Idéal pour récupérer les sites web des entreprises rapidement !

## 📊 Interface

Pendant l'extraction, vous verrez en haut à droite :

```
┌─────────────────────────────────┐
│ Maps Scraper Pro  🌐 Sites web  │
│                                 │
│ Extraction en cours...          │
│ restaurant Paris                │
│ [████████████████░░░] 45%       │
│                                 │
│ Progression: 45/100 (45%)       │
│ Résultats: 237 ← Se met à jour │
└─────────────────────────────────┘
```

Le compteur **Résultats: 237** s'incrémente à chaque fiche scrapée.

## 📥 Fichiers téléchargés

**Exemple avec mode "Sites web uniquement"** :
- Mot-clé : `restaurant`
- Villes : `Paris, Lyon, Marseille`

**Résultat** : 3 fichiers CSV
- `paris_2025-10-27.csv` (URLs des sites web des restaurants de Paris)
- `lyon_2025-10-27.csv` (URLs des sites web des restaurants de Lyon)
- `marseille_2025-10-27.csv` (URLs des sites web des restaurants de Marseille)

**Contenu du CSV (mode Sites web)** :
```
keyword_id,city_id,search_query,website
1,1,"restaurant Paris","https://www.lerestaurant.fr"
1,1,"restaurant Paris","https://www.bistrot-parisien.com"
1,1,"restaurant Paris","https://www.chez-marie.fr"
```

## 💡 Cas d'usage du mode "Sites web uniquement"

### 1. Collecte de sites web pour prospection
Vous voulez contacter des restaurants ? Récupérez tous leurs sites web en quelques minutes.

### 2. Analyse de marché
Vérifiez combien d'entreprises dans votre secteur ont un site web.

### 3. Base de données de contacts
Créez une base de données d'URLs pour scraping ultérieur des emails/téléphones.

### 4. Audit SEO
Collectez les sites web des concurrents pour analyse SEO.

## 🔧 Configuration

Pour activer le mode "Sites web uniquement" :

1. Cliquer sur "Options" dans le popup
2. Aller dans "Mode d'extraction"
3. Sélectionner "Sites web uniquement"
4. Sauvegarder

Ou simplement lancer l'extraction, le mode par défaut est "Complet" qui inclut les sites web.

## 🎁 Avantages

- ✅ Zéro configuration
- ✅ Compteur qui monte en direct (1, 2, 3, 4...)
- ✅ Pas d'affichage en direct qui ralentit
- ✅ Fichiers CSV automatiques par ville
- ✅ Compatible Excel, Google Sheets, LibreOffice
- ✅ Mode "Sites web uniquement" pour extraction ultra-rapide
- ✅ Toutes les données disponibles : URLs, téléphones, sites web

## 📋 Récapitulatif des modes

| Mode | Vitesse | Données extraites |
|------|---------|-------------------|
| 🔍 Complet | Normal | Nom, catégorie, adresse, tél, site, note, URL |
| 🔗 URLs | 3x plus rapide | Seulement liens Google Maps |
| 📞 Téléphones | 3x plus rapide | Seulement numéros de téléphone |
| 🔗📞 URLs+Tél | 2x plus rapide | Liens + téléphones |
| 🌐 Sites web | 3x plus rapide | **Seulement sites web des entreprises** |

Bonne extraction ! 🚀
