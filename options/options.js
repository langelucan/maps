const defaultSettings = {
  scrollDelay: 1000,
  scrollStep: 500,
  searchDelay: 3000,
  maxSameScroll: 10,
  includeKeyword: true,
  includeTimestamp: false,
  removeDuplicates: true,
  filePrefix: 'maps_scraper',
  showProgress: true,
  consoleLogging: false,
  extractionMode: 'full'
};

const elements = {
  scrollDelay: document.getElementById('scrollDelay'),
  scrollStep: document.getElementById('scrollStep'),
  searchDelay: document.getElementById('searchDelay'),
  maxSameScroll: document.getElementById('maxSameScroll'),
  includeKeyword: document.getElementById('includeKeyword'),
  includeTimestamp: document.getElementById('includeTimestamp'),
  removeDuplicates: document.getElementById('removeDuplicates'),
  filePrefix: document.getElementById('filePrefix'),
  showProgress: document.getElementById('showProgress'),
  consoleLogging: document.getElementById('consoleLogging'),
  saveBtn: document.getElementById('saveBtn'),
  clearStorage: document.getElementById('clearStorage'),
  resetDefaults: document.getElementById('resetDefaults'),
  notification: document.getElementById('notification')
};

function loadSettings() {
  chrome.storage.local.get(['settings'], (result) => {
    const settings = result.settings || defaultSettings;

    elements.scrollDelay.value = settings.scrollDelay;
    elements.scrollStep.value = settings.scrollStep;
    elements.searchDelay.value = settings.searchDelay;
    elements.maxSameScroll.value = settings.maxSameScroll;
    elements.includeKeyword.checked = settings.includeKeyword;
    elements.includeTimestamp.checked = settings.includeTimestamp;
    elements.removeDuplicates.checked = settings.removeDuplicates;
    elements.filePrefix.value = settings.filePrefix;
    elements.showProgress.checked = settings.showProgress;
    elements.consoleLogging.checked = settings.consoleLogging;

    const extractionModeRadio = document.querySelector(`input[name="extractionMode"][value="${settings.extractionMode}"]`);
    if (extractionModeRadio) {
      extractionModeRadio.checked = true;
    }
  });
}

function saveSettings() {
  const settings = {
    scrollDelay: parseInt(elements.scrollDelay.value),
    scrollStep: parseInt(elements.scrollStep.value),
    searchDelay: parseInt(elements.searchDelay.value),
    maxSameScroll: parseInt(elements.maxSameScroll.value),
    includeKeyword: elements.includeKeyword.checked,
    includeTimestamp: elements.includeTimestamp.checked,
    removeDuplicates: elements.removeDuplicates.checked,
    filePrefix: elements.filePrefix.value,
    showProgress: elements.showProgress.checked,
    consoleLogging: elements.consoleLogging.checked,
    extractionMode: document.querySelector('input[name="extractionMode"]:checked').value
  };

  chrome.storage.local.set({ settings }, () => {
    showNotification('Paramètres enregistrés avec succès', 'success');
  });
}

function clearStorage() {
  if (confirm('Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.')) {
    chrome.storage.local.clear(() => {
      loadSettings();
      showNotification('Toutes les données ont été effacées', 'success');
    });
  }
}

function resetToDefaults() {
  if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
    chrome.storage.local.set({ settings: defaultSettings }, () => {
      loadSettings();
      showNotification('Paramètres réinitialisés', 'success');
    });
  }
}

function showNotification(message, type = 'success') {
  elements.notification.textContent = message;
  elements.notification.className = `notification ${type}`;
  elements.notification.classList.add('show');

  setTimeout(() => {
    elements.notification.classList.remove('show');
  }, 3000);
}

elements.saveBtn.addEventListener('click', saveSettings);
elements.clearStorage.addEventListener('click', clearStorage);
elements.resetDefaults.addEventListener('click', resetToDefaults);

document.addEventListener('DOMContentLoaded', loadSettings);

async function migrateOldKeywords() {
  try {
    const result = await new Promise(resolve => {
      chrome.storage.local.get(['keywords'], resolve);
    });

    if (!result.keywords) {
      showNotification('Aucune donnée à migrer trouvée', 'error');
      return;
    }

    const oldKeywords = result.keywords.split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (oldKeywords.length === 0) {
      showNotification('Aucun mot-clé à migrer', 'error');
      return;
    }

    showNotification(`Migration de ${oldKeywords.length} mots-clés en cours...`, 'success');

    const extractedData = oldKeywords.map(kw => {
      const parts = kw.split(' ');
      if (parts.length >= 2) {
        const keyword = parts[0];
        const city = parts.slice(1).join(' ');
        return { keyword, city };
      }
      return { keyword: kw, city: null };
    });

    const uniqueKeywords = [...new Set(extractedData.map(d => d.keyword))];
    const uniqueCities = [...new Set(extractedData.map(d => d.city).filter(c => c))];

    const keywordObjects = uniqueKeywords.map(k => ({
      keyword: k,
      is_active: true
    }));

    const cityObjects = uniqueCities.map(c => ({
      name: c,
      country: 'France',
      is_active: true
    }));

    if (keywordObjects.length > 0) {
      await supabase.insert('keywords', keywordObjects);
    }

    if (cityObjects.length > 0) {
      await supabase.insert('cities', cityObjects);
    }

    await loadStats();
    showNotification(`Migration réussie ! ${uniqueKeywords.length} mots-clés et ${uniqueCities.length} villes importés`, 'success');
  } catch (error) {
    console.error('Erreur migration:', error);
    showNotification('Erreur: ' + error.message, 'error');
  }
}

if (document.getElementById('migrateBtn')) {
  document.getElementById('migrateBtn').addEventListener('click', migrateOldKeywords);
}
