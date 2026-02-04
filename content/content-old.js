let scrapingState = {
  isRunning: false,
  combinations: [],
  currentIndex: 0,
  totalStartTime: 0,
  combinationStartTime: 0,
  totalResults: 0,
  allData: [],
  config: {},
  progressContainer: null,
  timers: {
    update: null
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startScraping') {
    startScraping(message.config);
  } else if (message.action === 'stopScraping') {
    stopScraping();
  }
});

function startScraping(config) {
  if (scrapingState.isRunning) {
    return;
  }

  scrapingState = {
    isRunning: true,
    combinations: config.combinations,
    currentIndex: 0,
    totalStartTime: Date.now(),
    combinationStartTime: Date.now(),
    totalResults: 0,
    allData: [],
    config: config,
    progressContainer: null,
    timers: {
      update: null
    }
  };

  saveScrapingState();
  createProgressUI();
  processNextCombination();
}

function stopScraping() {
  scrapingState.isRunning = false;
  clearTimers();
  removeProgressUI();
  saveScrapingState();

  sendMessageToPopup({
    action: 'updateStatus',
    text: 'Arrêté',
    state: 'ready'
  });
}

function saveScrapingState() {
  chrome.storage.local.set({
    scrapingState: {
      isRunning: scrapingState.isRunning,
      status: scrapingState.isRunning ? 'En cours...' : 'Arrêté',
      progress: {
        current: scrapingState.currentIndex,
        total: scrapingState.combinations.length,
        results: scrapingState.totalResults,
        timeElapsed: Math.floor((Date.now() - scrapingState.totalStartTime) / 1000)
      }
    }
  });
}

function createProgressUI() {
  scrapingState.progressContainer = document.createElement('div');
  scrapingState.progressContainer.id = 'maps-scraper-progress';
  scrapingState.progressContainer.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 20px;
    background: linear-gradient(135deg, rgba(5, 150, 105, 0.98) 0%, rgba(16, 185, 129, 0.98) 100%);
    color: white;
    font-size: 14px;
    z-index: 999999;
    border-radius: 16px;
    min-width: 340px;
    line-height: 1.6;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    backdrop-filter: blur(10px);
  `;
  document.body.appendChild(scrapingState.progressContainer);

  startTimers();
}

function removeProgressUI() {
  if (scrapingState.progressContainer) {
    scrapingState.progressContainer.remove();
    scrapingState.progressContainer = null;
  }
}

function updateProgressUI(message) {
  if (scrapingState.progressContainer) {
    const progress = `${scrapingState.currentIndex}/${scrapingState.combinations.length}`;
    const percentage = ((scrapingState.currentIndex / scrapingState.combinations.length) * 100).toFixed(1);

    scrapingState.progressContainer.innerHTML = `
      <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <div>
          <strong style="font-size: 16px; display: block;">Maps Scraper Pro</strong>
          <span style="font-size: 11px; opacity: 0.9;">Extraction en cours</span>
        </div>
      </div>

      <div style="background: rgba(255, 255, 255, 0.15); border-radius: 10px; padding: 12px; margin-bottom: 12px;">
        ${message}
      </div>

      <div style="background: rgba(255, 255, 255, 0.1); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
        <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%); transition: width 0.3s;"></div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px;">
        <div style="background: rgba(255, 255, 255, 0.1); padding: 8px; border-radius: 8px;">
          <div style="opacity: 0.8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Progression</div>
          <strong style="font-size: 16px;">${progress}</strong>
        </div>
        <div style="background: rgba(255, 255, 255, 0.1); padding: 8px; border-radius: 8px;">
          <div style="opacity: 0.8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Résultats</div>
          <strong style="font-size: 16px;">${scrapingState.totalResults}</strong>
        </div>
      </div>
    `;
  }
}

function startTimers() {
  scrapingState.combinationStartTime = Date.now();

  scrapingState.timers.update = setInterval(() => {
    const totalElapsed = Math.floor((Date.now() - scrapingState.totalStartTime) / 1000);
    const combinationElapsed = Math.floor((Date.now() - scrapingState.combinationStartTime) / 1000);

    const combination = scrapingState.combinations[scrapingState.currentIndex] || '';

    updateProgressUI(`
      <div style="font-size: 13px;">
        <strong style="color: #fef3c7;">🎯 ${combination}</strong>
      </div>
      <div style="margin-top: 8px; font-size: 12px; opacity: 0.9;">
        ⏱️ Temps: ${formatTime(totalElapsed)}
      </div>
    `);

    sendMessageToPopup({
      action: 'updateProgress',
      current: scrapingState.currentIndex,
      total: scrapingState.combinations.length,
      results: scrapingState.totalResults,
      timeElapsed: totalElapsed
    });

    saveScrapingState();
  }, 1000);
}

function clearTimers() {
  if (scrapingState.timers.update) {
    clearInterval(scrapingState.timers.update);
    scrapingState.timers.update = null;
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function processNextCombination() {
  if (!scrapingState.isRunning) {
    return;
  }

  if (scrapingState.currentIndex >= scrapingState.combinations.length) {
    completeScraping();
    return;
  }

  const combination = scrapingState.combinations[scrapingState.currentIndex];
  scrapingState.combinationStartTime = Date.now();

  sendMessageToPopup({
    action: 'updateStatus',
    text: `Recherche: ${combination}`,
    state: 'active'
  });

  searchCombination(combination, () => {
    if (scrapingState.config.autoScroll) {
      autoScrollContainer(() => {
        scrapeData();
      });
    } else {
      setTimeout(() => {
        scrapeData();
      }, 2000);
    }
  });
}

function searchCombination(combination, callback) {
  updateProgressUI(`Recherche de "<strong>${combination}</strong>"...`);

  const searchInput = document.querySelector('input#searchboxinput');
  if (!searchInput) {
    console.error('Champ de recherche non trouvé');
    handleError('Champ de recherche non trouvé');
    return;
  }

  searchInput.value = combination;
  searchInput.dispatchEvent(new Event('input', { bubbles: true }));

  const searchButton = document.querySelector('button#searchbox-searchbutton');
  if (!searchButton) {
    console.error('Bouton de recherche non trouvé');
    handleError('Bouton de recherche non trouvé');
    return;
  }

  searchButton.click();

  setTimeout(callback, 3000);
}

function autoScrollContainer(callback) {
  updateProgressUI('Chargement des résultats...');

  const scrollContainer = document.querySelector('div.m6QErb.DxyBCb[role="feed"]');

  if (!scrollContainer) {
    console.error('Conteneur de défilement non trouvé');
    callback();
    return;
  }

  let lastScrollTop = -1;
  let sameScrollCount = 0;
  const maxSameScrollCount = 10;

  const scrollInterval = setInterval(() => {
    if (!scrapingState.isRunning) {
      clearInterval(scrollInterval);
      return;
    }

    if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight) {
      clearInterval(scrollInterval);
      callback();
      return;
    }

    scrollContainer.scrollBy(0, 500);

    if (scrollContainer.scrollTop === lastScrollTop) {
      sameScrollCount++;
      if (sameScrollCount >= maxSameScrollCount) {
        clearInterval(scrollInterval);
        callback();
      }
    } else {
      sameScrollCount = 0;
      lastScrollTop = scrollContainer.scrollTop;
    }
  }, 1000);
}

function scrapeData() {
  updateProgressUI('Extraction des données...');

  const elements = document.querySelectorAll('div.Nv2PK');
  const combinationData = [];
  const combination = scrapingState.combinations[scrapingState.currentIndex];

  elements.forEach((el) => {
    const nameElement = el.querySelector('.qBF1Pd');
    const name = nameElement ? nameElement.innerText.trim() : 'N/A';

    const ratingElement = el.querySelector('.MW4etd');
    const rating = ratingElement ? ratingElement.innerText.trim() : 'N/A';

    let category = 'N/A';
    const categoryElement = el.querySelector('.W4Efsd > div.W4Efsd > span:first-child span');
    if (categoryElement) {
      category = categoryElement.innerText.trim();
    }

    let address = 'N/A';
    const addressElement = el.querySelector('.W4Efsd > div.W4Efsd > span:nth-child(2) span:nth-child(2)');
    if (addressElement) {
      address = addressElement.innerText.trim();
    }

    const phoneElement = el.querySelector('.UsdlK');
    const phone = phoneElement ? phoneElement.innerText.trim() : 'N/A';

    const websiteElement = el.querySelector('a.lcr4fd.S9kvJb');
    const website = websiteElement ? websiteElement.getAttribute('href') : 'N/A';

    const data = {
      search: combination,
      name: name,
      rating: rating,
      category: category,
      address: address,
      phone: phone,
      website: website
    };

    combinationData.push(data);
    scrapingState.allData.push(data);

    if (scrapingState.config.showLiveResults) {
      sendMessageToPopup({
        action: 'newResult',
        data: data
      });
    }
  });

  scrapingState.totalResults += combinationData.length;

  if (combinationData.length > 0) {
    if (!scrapingState.config.groupResults) {
      exportData(combinationData, combination);
    }

    updateProgressUI(`<strong>${combinationData.length}</strong> résultats trouvés`);
  } else {
    updateProgressUI('Aucune donnée trouvée');
  }

  scrapingState.currentIndex++;
  setTimeout(() => {
    processNextCombination();
  }, 1000);
}

function exportData(data, searchTerm) {
  const format = scrapingState.config.exportFormat || 'csv';
  const filename = searchTerm ? `${searchTerm.replace(/\s+/g, '_')}.${format}` : `maps_scraper_all.${format}`;

  let content, mimeType;

  if (format === 'csv') {
    content = convertToCSV(data);
    mimeType = 'text/csv;charset=utf-8;';
  } else if (format === 'json') {
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json;charset=utf-8;';
  } else if (format === 'xlsx') {
    content = convertToCSV(data);
    mimeType = 'text/csv;charset=utf-8;';
  }

  downloadFile(content, filename, mimeType);
}

function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function completeScraping() {
  clearTimers();

  if (scrapingState.config.groupResults && scrapingState.allData.length > 0) {
    exportData(scrapingState.allData, null);
  }

  const totalElapsed = Math.floor((Date.now() - scrapingState.totalStartTime) / 1000);

  updateProgressUI(`
    <div style="text-align: center;">
      <div style="font-size: 32px; margin-bottom: 8px;">✓</div>
      <strong style="font-size: 16px;">Extraction terminée!</strong>
      <div style="margin-top: 8px; opacity: 0.9; font-size: 13px;">
        ${scrapingState.totalResults} résultats en ${formatTime(totalElapsed)}
      </div>
    </div>
  `);

  sendMessageToPopup({
    action: 'scrapingComplete',
    totalResults: scrapingState.totalResults,
    totalTime: totalElapsed
  });

  setTimeout(() => {
    removeProgressUI();
  }, 5000);

  scrapingState.isRunning = false;
  saveScrapingState();
}

function handleError(error) {
  clearTimers();
  scrapingState.isRunning = false;

  updateProgressUI(`<strong style="color: #fef2f2;">Erreur:</strong> ${error}`);

  sendMessageToPopup({
    action: 'scrapingError',
    error: error
  });

  setTimeout(() => {
    removeProgressUI();
  }, 5000);

  saveScrapingState();
}

function sendMessageToPopup(message) {
  chrome.runtime.sendMessage(message).catch(() => {});
}

if (window.location.href.includes('google.com/maps') || window.location.href.includes('google.fr/maps')) {
  chrome.storage.local.get(['scrapingState'], (result) => {
    if (result.scrapingState && result.scrapingState.isRunning) {
      console.log('Restauration de l\'état du scraping...');
    }
  });
}
