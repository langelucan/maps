const DEFAULT_KEYWORDS = ['taxi', 'restaurant', 'hôtel', 'boulangerie', 'pharmacie', 'médecin', 'dentiste', 'coiffeur', 'garage', 'plombier'];

const DEFAULT_CITIES = ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Toulon', 'Le Havre', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'];

let isRunning = false;

const elements = {
  openMapsBtn: document.getElementById('openMapsBtn'),
  stopBtn: document.getElementById('stopBtn'),
  keywordsList: document.getElementById('keywordsList'),
  citiesList: document.getElementById('citiesList'),
  keywordCount: document.getElementById('keywordCount'),
  cityCount: document.getElementById('cityCount'),
  loadKeywordsBtn: document.getElementById('loadKeywordsBtn'),
  loadCitiesBtn: document.getElementById('loadCitiesBtn'),
  optionsBtn: document.getElementById('optionsBtn'),
  helpBtn: document.getElementById('helpBtn'),
  statusText: document.getElementById('statusText'),
  statusIndicator: document.getElementById('statusIndicator').querySelector('.pulse'),
  progressFill: document.getElementById('progressFill'),
  combinationsCount: document.getElementById('combinationsCount'),
  resultsCount: document.getElementById('resultsCount'),
  timeElapsed: document.getElementById('timeElapsed'),
  autoScroll: document.getElementById('autoScroll'),
  groupResults: document.getElementById('groupResults'),
  showLiveResults: document.getElementById('showLiveResults'),
  liveResults: document.getElementById('liveResults'),
  liveResultsList: document.getElementById('liveResultsList'),
  clearResultsBtn: document.getElementById('clearResultsBtn')
};

function loadSettings() {
  chrome.storage.local.get(['keywords', 'cities', 'exportFormat', 'autoScroll', 'groupResults', 'showLiveResults'], (result) => {
    if (result.keywords) {
      elements.keywordsList.value = result.keywords;
      updateKeywordCount();
    }
    if (result.cities) {
      elements.citiesList.value = result.cities;
      updateCityCount();
    }
    if (result.exportFormat) {
      const formatInput = document.querySelector(`input[name="exportFormat"][value="${result.exportFormat}"]`);
      if (formatInput) formatInput.checked = true;
    }
    if (result.autoScroll !== undefined) {
      elements.autoScroll.checked = result.autoScroll;
    }
    if (result.groupResults !== undefined) {
      elements.groupResults.checked = result.groupResults;
    }
    if (result.showLiveResults !== undefined) {
      elements.showLiveResults.checked = result.showLiveResults;
    }
  });
}

function saveSettings() {
  const keywords = elements.keywordsList.value;
  const cities = elements.citiesList.value;
  const exportFormat = document.querySelector('input[name="exportFormat"]:checked').value;
  const autoScroll = elements.autoScroll.checked;
  const groupResults = elements.groupResults.checked;
  const showLiveResults = elements.showLiveResults.checked;

  chrome.storage.local.set({
    keywords,
    cities,
    exportFormat,
    autoScroll,
    groupResults,
    showLiveResults
  });
}

function updateKeywordCount() {
  const keywords = getKeywords();
  elements.keywordCount.textContent = `${keywords.length} mot${keywords.length > 1 ? 's' : ''}-clé${keywords.length > 1 ? 's' : ''}`;
  updateCombinationsCount();
}

function updateCityCount() {
  const cities = getCities();
  elements.cityCount.textContent = `${cities.length} ville${cities.length > 1 ? 's' : ''}`;
  updateCombinationsCount();
}

function updateCombinationsCount() {
  const keywords = getKeywords();
  const cities = getCities();
  const total = keywords.length * cities.length;
  elements.combinationsCount.textContent = total;
}

function getKeywords() {
  return elements.keywordsList.value
    .split('\n')
    .map(k => k.trim())
    .filter(k => k.length > 0);
}

function getCities() {
  return elements.citiesList.value
    .split('\n')
    .map(c => c.trim())
    .filter(c => c.length > 0);
}

function generateCombinations(keywords, cities) {
  const combinations = [];
  for (const keyword of keywords) {
    for (const city of cities) {
      combinations.push(`${keyword} ${city}`);
    }
  }
  return combinations;
}

elements.keywordsList.addEventListener('input', () => {
  updateKeywordCount();
  saveSettings();
});

elements.citiesList.addEventListener('input', () => {
  updateCityCount();
  saveSettings();
});

elements.loadKeywordsBtn.addEventListener('click', () => {
  elements.keywordsList.value = DEFAULT_KEYWORDS.join('\n');
  updateKeywordCount();
  saveSettings();
});

elements.loadCitiesBtn.addEventListener('click', () => {
  elements.citiesList.value = DEFAULT_CITIES.join('\n');
  updateCityCount();
  saveSettings();
});

elements.clearResultsBtn.addEventListener('click', () => {
  elements.liveResultsList.innerHTML = '';
  elements.liveResults.style.display = 'none';
});

elements.openMapsBtn.addEventListener('click', async () => {
  const keywords = getKeywords();
  const cities = getCities();

  if (keywords.length === 0) {
    alert('Veuillez entrer au moins un mot-clé');
    return;
  }

  if (cities.length === 0) {
    alert('Veuillez entrer au moins une ville');
    return;
  }

  saveSettings();

  const combinations = keywords.map((keyword, kIdx) =>
    cities.map((city, cIdx) => ({
      keywordId: kIdx + 1,
      cityId: cIdx + 1,
      keyword: keyword,
      city: city,
      searchQuery: `${keyword} ${city}`
    }))
  ).flat();

  const result = await chrome.storage.local.get(['extractionMode']);
  const extractionMode = result.extractionMode || 'full';

  const config = {
    combinations,
    keywords,
    cities,
    exportFormat: document.querySelector('input[name="exportFormat"]:checked').value,
    autoScroll: elements.autoScroll.checked,
    groupResults: elements.groupResults.checked,
    showLiveResults: false,
    extractionMode
  };

  await chrome.storage.local.set({ pendingConfig: config });

  elements.statusText.textContent = 'Ouverture de Google Maps...';

  await chrome.tabs.create({ url: 'https://www.google.com/maps', active: true });

  window.close();
});

elements.stopBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    action: 'stopScraping'
  });

  isRunning = false;
  updateUI(false);
  updateStatus('Arrêté par l\'utilisateur', 'ready');
});

elements.optionsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

elements.helpBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/yourusername/maps-scraper-pro' });
});

function updateUI(running) {
  elements.startBtn.style.display = running ? 'none' : 'flex';
  elements.stopBtn.style.display = running ? 'flex' : 'none';
  elements.startBtn.disabled = running;
  elements.keywordsList.disabled = running;
  elements.citiesList.disabled = running;
  elements.loadKeywordsBtn.disabled = running;
  elements.loadCitiesBtn.disabled = running;

  document.querySelectorAll('input[name="exportFormat"]').forEach(input => {
    input.disabled = running;
  });

  elements.autoScroll.disabled = running;
  elements.groupResults.disabled = running;
  elements.showLiveResults.disabled = running;
}

function updateStatus(text, state = 'ready') {
  elements.statusText.textContent = text;
  elements.statusIndicator.className = 'pulse';

  if (state === 'active') {
    elements.statusIndicator.classList.add('active');
  } else if (state === 'error') {
    elements.statusIndicator.classList.add('error');
  }
}

function updateProgress(current, total, results, timeElapsed) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  elements.progressFill.style.width = `${percentage}%`;
  elements.resultsCount.textContent = results;

  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;
  elements.timeElapsed.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function addLiveResult(data) {
  if (!elements.showLiveResults.checked) return;

  const item = document.createElement('div');
  item.className = 'live-result-item';
  item.innerHTML = `
    <strong>${data.name}</strong>
    <div class="result-meta">${data.category} • ${data.address}</div>
  `;
  elements.liveResultsList.insertBefore(item, elements.liveResultsList.firstChild);

  if (elements.liveResultsList.children.length > 50) {
    elements.liveResultsList.removeChild(elements.liveResultsList.lastChild);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStatus') {
    updateStatus(message.text, message.state);
  } else if (message.action === 'updateProgress') {
    updateProgress(
      message.current,
      message.total,
      message.results,
      message.timeElapsed
    );
  } else if (message.action === 'newResult') {
    addLiveResult(message.data);
  } else if (message.action === 'scrapingComplete') {
    isRunning = false;
    updateUI(false);
    updateStatus('Extraction terminée', 'ready');
  } else if (message.action === 'scrapingError') {
    isRunning = false;
    updateUI(false);
    updateStatus(`Erreur: ${message.error}`, 'error');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  updateKeywordCount();
  updateCityCount();
});

chrome.storage.local.get(['scrapingState'], (result) => {
  if (result.scrapingState && result.scrapingState.isRunning) {
    isRunning = true;
    updateUI(true);
    updateStatus(result.scrapingState.status || 'En cours...', 'active');

    if (result.scrapingState.progress) {
      updateProgress(
        result.scrapingState.progress.current,
        result.scrapingState.progress.total,
        result.scrapingState.progress.results,
        result.scrapingState.progress.timeElapsed
      );
    }

    if (elements.showLiveResults.checked) {
      elements.liveResults.style.display = 'flex';
    }
  }
});
