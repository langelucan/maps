let scrapingState = {
  isRunning: false,
  combinations: [],
  currentIndex: 0,
  totalStartTime: 0,
  totalResults: 0,
  allResults: [],
  config: {},
  progressContainer: null,
  liveResultsContainer: null,
  currentSessionId: null,
  timers: {
    total: null
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') {
    sendResponse({ ready: true });
    return true;
  } else if (message.action === 'startScraping') {
    startScraping(message.config);
    sendResponse({ started: true });
    return true;
  } else if (message.action === 'stopScraping') {
    stopScraping();
    sendResponse({ stopped: true });
    return true;
  }
});

async function checkForPendingConfig() {
  const result = await chrome.storage.local.get(['pendingConfig']);
  if (result.pendingConfig) {
    showStartupPanel(result.pendingConfig);
  }
}

function showStartupPanel(config) {
  if (document.getElementById('scraper-startup-panel')) {
    return;
  }

  const panel = document.createElement('div');
  panel.id = 'scraper-startup-panel';
  panel.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10000;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.05);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      overflow: hidden;
      max-width: 600px;
      width: 90%;
    ">
      <style>
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .scraper-radio {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #059669;
        }
        .scraper-mode-card {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          align-items: start;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .scraper-mode-card:hover {
          background: #f0fdf4;
          border-color: #059669;
        }
        .scraper-mode-card input:checked ~ * {
          color: #059669;
        }
        #scraper-start-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(5,150,105,0.4);
        }
        #scraper-cancel-btn:hover {
          background: #f3f4f6;
        }
      </style>

      <!-- Bandeau vert -->
      <div style="
        background: linear-gradient(135deg, #059669 0%, #10b981 100%);
        padding: 20px 24px;
        color: white;
      ">
        <h2 style="
          margin: 0 0 6px 0;
          font-size: 20px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Extraction de données
        </h2>
        <p style="margin: 0; font-size: 14px; opacity: 0.95;">
          <strong>${config.combinations.length} recherches</strong> prêtes à être traitées
        </p>
      </div>

      <!-- Contenu -->
      <div style="padding: 24px;">
        <label style="
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">Mode d'extraction</label>

        <!-- Options radio -->
        <div style="display: grid; gap: 10px; margin-bottom: 24px;">
          <label class="scraper-mode-card">
            <input type="radio" name="extraction-mode" value="full" class="scraper-radio" ${(config.extractionMode || 'full') === 'full' ? 'checked' : ''}>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 2px;">
                Complète
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                Nom, catégorie, adresse, téléphone, site web, note (lent)
              </div>
            </div>
          </label>

          <label class="scraper-mode-card">
            <input type="radio" name="extraction-mode" value="urls" class="scraper-radio" ${config.extractionMode === 'urls' ? 'checked' : ''}>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 2px;">
                URLs uniquement
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                Liens vers les fiches Google Maps (rapide)
              </div>
            </div>
          </label>

          <label class="scraper-mode-card">
            <input type="radio" name="extraction-mode" value="phones" class="scraper-radio" ${config.extractionMode === 'phones' ? 'checked' : ''}>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 2px;">
                Téléphones uniquement
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                Numéros de téléphone (rapide)
              </div>
            </div>
          </label>

          <label class="scraper-mode-card">
            <input type="radio" name="extraction-mode" value="urls_phones" class="scraper-radio" ${config.extractionMode === 'urls_phones' ? 'checked' : ''}>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 2px;">
                URLs + Téléphones
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                Liens et numéros (rapide)
              </div>
            </div>
          </label>

          <label class="scraper-mode-card">
            <input type="radio" name="extraction-mode" value="websites" class="scraper-radio" ${config.extractionMode === 'websites' ? 'checked' : ''}>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 2px;">
                Sites web uniquement
              </div>
              <div style="font-size: 12px; color: #6b7280;">
                URLs des sites web (rapide)
              </div>
            </div>
          </label>
        </div>

        <div style="
          background: #fef3c7;
          border-left: 3px solid #f59e0b;
          padding: 10px 14px;
          border-radius: 6px;
          margin-bottom: 20px;
        ">
          <p style="margin: 0; font-size: 12px; color: #92400e;">
            ⚡ Les modes rapides sont 3x plus rapides (pas de clic par fiche)
          </p>
        </div>

        <label style="
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        ">Format de téléchargement</label>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
          <label class="scraper-mode-card" style="padding: 12px;">
            <input type="radio" name="export-format" value="csv" class="scraper-radio" ${(config.exportFormat || 'csv') === 'csv' ? 'checked' : ''}>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #111827;">
                📊 CSV
              </div>
            </div>
          </label>

          <label class="scraper-mode-card" style="padding: 12px;">
            <input type="radio" name="export-format" value="xlsx" class="scraper-radio" ${config.exportFormat === 'xlsx' ? 'checked' : ''}>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #111827;">
                📈 Excel
              </div>
            </div>
          </label>

          <label class="scraper-mode-card" style="padding: 12px;">
            <input type="radio" name="export-format" value="json" class="scraper-radio" ${config.exportFormat === 'json' ? 'checked' : ''}>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px; color: #111827;">
                📄 JSON
              </div>
            </div>
          </label>
        </div>

        <!-- Boutons -->
        <div style="display: flex; gap: 12px;">
          <button id="scraper-start-btn" style="
            flex: 1;
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(5,150,105,0.3);
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Lancer l'extraction
          </button>
          <button id="scraper-cancel-btn" style="
            background: #f9fafb;
            color: #6b7280;
            border: 1px solid #e5e7eb;
            padding: 14px 24px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          ">
            Annuler
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById('scraper-start-btn').addEventListener('click', async () => {
    const selectedMode = panel.querySelector('input[name="extraction-mode"]:checked').value;
    const selectedFormat = panel.querySelector('input[name="export-format"]:checked').value;

    const updatedConfig = {
      ...config,
      extractionMode: selectedMode,
      exportFormat: selectedFormat
    };

    panel.remove();
    await chrome.storage.local.remove('pendingConfig');
    startScraping(updatedConfig);
  });

  document.getElementById('scraper-cancel-btn').addEventListener('click', async () => {
    panel.remove();
    await chrome.storage.local.remove('pendingConfig');
  });
}

function getModeLabel(mode) {
  const labels = {
    'full': '🔍 Complet',
    'urls': '🔗 URLs',
    'phones': '📞 Téléphones',
    'urls_phones': '🔗📞 URLs+Tél',
    'websites': '🌐 Sites web'
  };
  return labels[mode] || '🔍 Complet';
}

if (window.location.href.includes('google.com/maps') || window.location.href.includes('google.fr/maps')) {
  setTimeout(() => checkForPendingConfig(), 2000);
}

async function startScraping(config) {
  if (scrapingState.isRunning) {
    return;
  }

  const combinations = config.combinations;
  if (!combinations || combinations.length === 0) {
    alert('Aucune combinaison trouvée. Veuillez entrer des mots-clés et villes dans le popup.');
    return;
  }

  let sessionId = null;
  try {
    const sessionResponse = await fetch(`${supabase.url}/rest/v1/scraping_sessions`, {
      method: 'POST',
      headers: supabase.headers,
      body: JSON.stringify({
        total_combinations: combinations.length,
        status: 'running'
      })
    });
    const session = await sessionResponse.json();
    sessionId = session[0]?.id;
  } catch (error) {
    console.warn('Impossible de créer une session Supabase, continuation sans:', error);
  }

  const settings = await new Promise(resolve => {
    chrome.storage.local.get(['settings'], result => {
      resolve(result.settings || {});
    });
  });

  scrapingState = {
    isRunning: true,
    combinations: combinations,
    currentIndex: 0,
    totalStartTime: Date.now(),
    totalResults: 0,
    allResults: [],
    config: { ...config, ...settings },
    progressContainer: null,
    liveResultsContainer: null,
    currentSessionId: sessionId,
    timers: {
      total: null
    }
  };

  saveScrapingState();
  createProgressUI();
  createLiveResultsUI();
  processNextCombination();
}

function stopScraping() {
  scrapingState.isRunning = false;
  clearTimers();
  removeProgressUI();
  removeLiveResultsUI();

  if (scrapingState.currentSessionId) {
    updateSession('stopped');
  }

  saveScrapingState();

  sendMessageToPopup({
    action: 'updateStatus',
    text: 'Arrêté',
    state: 'ready'
  });
}

async function updateSession(status) {
  if (!scrapingState.currentSessionId) {
    return;
  }

  try {
    await fetch(`${supabase.url}/rest/v1/scraping_sessions?id=eq.${scrapingState.currentSessionId}`, {
      method: 'PATCH',
      headers: supabase.headers,
      body: JSON.stringify({
        status: status,
        completed_at: new Date().toISOString(),
        total_results: scrapingState.totalResults
      })
    });
  } catch (error) {
    console.warn('Impossible de mettre à jour la session Supabase:', error);
  }
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
    top: 10px;
    right: 10px;
    padding: 16px 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    font-size: 14px;
    z-index: 999999;
    border-radius: 12px;
    max-width: 320px;
    line-height: 1.6;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  `;
  document.body.appendChild(scrapingState.progressContainer);

  startTimers();
}

function createLiveResultsUI() {
  // Ne pas créer l'affichage en direct, uniquement le compteur
}

function removeProgressUI() {
  if (scrapingState.progressContainer) {
    scrapingState.progressContainer.remove();
    scrapingState.progressContainer = null;
  }
}

function removeLiveResultsUI() {
  // Plus d'affichage en direct à supprimer
}

function updateProgressUI(message) {
  if (scrapingState.progressContainer) {
    const progress = `${scrapingState.currentIndex + 1}/${scrapingState.combinations.length}`;
    const percentage = ((scrapingState.currentIndex / scrapingState.combinations.length) * 100).toFixed(1);

    const mode = scrapingState.config.extractionMode || 'full';
    const modeLabel = {
      'full': '🔍 Complet',
      'urls': '🔗 URLs',
      'phones': '📞 Téléphones',
      'urls_phones': '🔗📞 URLs+Tél',
      'websites': '🌐 Sites web'
    }[mode];

    scrapingState.progressContainer.innerHTML = `
      <div style="margin-bottom: 12px;">
        <strong style="color: #10b981;">Maps Scraper Pro</strong>
        <span style="margin-left: 8px; font-size: 11px; background: rgba(16,185,129,0.2); padding: 2px 8px; border-radius: 4px;">${modeLabel}</span>
      </div>
      <div>${message}</div>
      <div style="margin-top: 12px; background: rgba(255,255,255,0.1); border-radius: 8px; height: 8px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #059669, #10b981); height: 100%; width: ${percentage}%; transition: width 0.3s;"></div>
      </div>
      <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
        <strong>Progression:</strong> ${progress} (${percentage}%) | <strong>Résultats:</strong> ${scrapingState.totalResults}
      </div>
    `;
  }
}

function addLiveResult(result) {
  // Désactivé - pas d'affichage en direct
  return;

  const resultDiv = document.createElement('div');
  resultDiv.style.cssText = `
    padding: 10px;
    margin-bottom: 8px;
    background: #f9fafb;
    border-radius: 8px;
    border-left: 3px solid #10b981;
    animation: slideIn 0.3s ease;
  `;

  let content = '';
  if (mode === 'full') {
    content = `
      <div style="font-weight: 600; color: #059669; margin-bottom: 4px;">${result.name}</div>
      <div style="font-size: 11px; color: #6b7280;">
        ${result.category} • ${result.address}
        ${result.phone !== 'N/A' ? `<br>📞 ${result.phone}` : ''}
      </div>
    `;
  } else if (mode === 'urls') {
    content = `
      <div style="font-weight: 600; color: #059669; margin-bottom: 4px;">🔗 URL extraite</div>
      <div style="font-size: 10px; color: #6b7280; word-break: break-all;">
        ${result.url !== 'N/A' ? result.url : 'Pas d\'URL'}
      </div>
    `;
  } else if (mode === 'phones') {
    content = `
      <div style="font-weight: 600; color: #059669; margin-bottom: 4px;">📞 ${result.phone !== 'N/A' ? result.phone : 'Pas de téléphone'}</div>
    `;
  } else if (mode === 'urls_phones') {
    content = `
      <div style="font-weight: 600; color: #059669; margin-bottom: 4px;">
        ${result.phone !== 'N/A' ? `📞 ${result.phone}` : 'Pas de téléphone'}
      </div>
      <div style="font-size: 10px; color: #6b7280; word-break: break-all;">
        ${result.url !== 'N/A' ? `🔗 ${result.url}` : 'Pas d\'URL'}
      </div>
    `;
  }

  content += `<div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">${result.search_query}</div>`;
  resultDiv.innerHTML = content;

  listElement.insertBefore(resultDiv, listElement.firstChild);

  if (listElement.children.length > 10) {
    listElement.removeChild(listElement.lastChild);
  }
}

function startTimers() {
  scrapingState.timers.total = setInterval(() => {
    const totalElapsed = Math.floor((Date.now() - scrapingState.totalStartTime) / 1000);

    const combination = scrapingState.combinations[scrapingState.currentIndex];
    if (combination) {
      updateProgressUI(`
        Recherche: <strong style="color: #fbbf24;">${combination.searchQuery}</strong><br>
        Temps total: <span style="color: #60a5fa;">${formatTime(totalElapsed)}</span>
      `);
    }

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
  if (scrapingState.timers.total) {
    clearInterval(scrapingState.timers.total);
    scrapingState.timers.total = null;
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
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

  sendMessageToPopup({
    action: 'updateStatus',
    text: `Recherche: ${combination.searchQuery}`,
    state: 'active'
  });

  searchCombination(combination, () => {
    if (scrapingState.config.autoScroll !== false) {
      autoScrollContainer(() => {
        scrapeData(combination);
      });
    } else {
      setTimeout(() => {
        scrapeData(combination);
      }, 2000);
    }
  });
}

function searchCombination(combination, callback) {
  updateProgressUI(`Recherche: "<strong>${combination.searchQuery}</strong>"...`);

  const searchInput = document.querySelector('input#searchboxinput');
  if (!searchInput) {
    console.error('Champ de recherche non trouvé');
    handleError('Champ de recherche non trouvé');
    return;
  }

  searchInput.value = combination.searchQuery;
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
  updateProgressUI('Défilement automatique des résultats...');

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

async function scrapeData(combination) {
  updateProgressUI('Extraction des données...');

  const mode = scrapingState.config.extractionMode || 'full';
  const elements = document.querySelectorAll('div.Nv2PK');
  const results = [];

  for (const el of elements) {
    const data = {
      keyword_id: combination.keywordId,
      city_id: combination.cityId,
      search_query: combination.searchQuery
    };

    if (mode === 'websites' || mode === 'full') {
      const websiteElement = el.querySelector('a.lcr4fd.S9kvJb');
      data.website = websiteElement ? websiteElement.getAttribute('href') : 'N/A';
    } else {
      data.website = 'N/A';
    }

    if (mode === 'urls' || mode === 'urls_phones' || mode === 'full') {
      const linkElement = el.querySelector('a.hfpxzc');
      data.url = linkElement ? (linkElement.getAttribute('href') || 'N/A') : 'N/A';
    } else {
      data.url = 'N/A';
    }

    if (mode === 'phones' || mode === 'urls_phones' || mode === 'full') {
      const phoneElement = el.querySelector('.UsdlK');
      data.phone = phoneElement ? phoneElement.innerText.trim() : 'N/A';
    } else {
      data.phone = 'N/A';
    }

    if (mode === 'full') {
      const nameElement = el.querySelector('.qBF1Pd');
      data.name = nameElement ? nameElement.innerText.trim() : 'N/A';

      const ratingElement = el.querySelector('.MW4etd');
      data.rating = ratingElement ? ratingElement.innerText.trim() : 'N/A';

      const categoryElement = el.querySelector('.W4Efsd > div.W4Efsd > span:first-child span');
      data.category = categoryElement ? categoryElement.innerText.trim() : 'N/A';

      const addressElement = el.querySelector('.W4Efsd > div.W4Efsd > span:nth-child(2) span:nth-child(2)');
      data.address = addressElement ? addressElement.innerText.trim() : 'N/A';
    } else if (mode === 'websites') {
      data.name = 'N/A';
      data.rating = 'N/A';
      data.category = 'N/A';
      data.address = 'N/A';
      data.url = 'N/A';
      data.phone = 'N/A';
    } else {
      data.name = 'N/A';
      data.rating = 'N/A';
      data.category = 'N/A';
      data.address = 'N/A';
    }

    results.push(data);
    scrapingState.totalResults++;
    updateProgressUI(`Extraction en cours... <strong>${combination.searchQuery}</strong>`);
  }

  // totalResults déjà incrémenté fiche par fiche

  if (!scrapingState.cityResults) {
    scrapingState.cityResults = {
      currentCity: combination.city,
      results: [],
      keywords: []
    };
  }

  if (results.length > 0) {
    scrapingState.cityResults.results.push(...results);
    scrapingState.allResults.push(...results);
    if (!scrapingState.cityResults.keywords.includes(combination.keyword)) {
      scrapingState.cityResults.keywords.push(combination.keyword);
    }
    await saveResultsToDatabase(results);
    updateProgressUI(`Extraction terminée: <strong>${results.length}</strong> résultats`);
  } else {
    updateProgressUI('Aucune donnée trouvée');
  }

  scrapingState.currentIndex++;

  const nextCombination = scrapingState.combinations[scrapingState.currentIndex];
  const cityChanged = !nextCombination || nextCombination.city !== combination.city;

  if (cityChanged && scrapingState.cityResults.results.length > 0) {
    if (!scrapingState.config.groupResults) {
      await downloadCombinationResults(
        scrapingState.cityResults.results,
        scrapingState.cityResults.keywords,
        combination.city
      );
    }
    scrapingState.cityResults = nextCombination ? {
      currentCity: nextCombination.city,
      results: [],
      keywords: []
    } : null;
  }

  const delay = (mode === 'full') ? 1000 : 500;
  setTimeout(() => {
    processNextCombination();
  }, delay);
}


async function downloadCombinationResults(results, keywords, city) {
  if (!results || results.length === 0) return;

  const format = scrapingState.config.exportFormat || 'csv';

  const uniqueSearchQueries = [...new Set(results.map(r => r.search_query))];
  const searchQuerySlug = uniqueSearchQueries
    .slice(0, 3)
    .map(q => q.toLowerCase().replace(/\s+/g, '_'))
    .join('_');

  const baseFilename = searchQuerySlug;

  let content;
  let mimeType;
  let filename;

  const headers = Object.keys(results[0]);
  const rows = [headers.join(',')];
  for (const item of results) {
    const values = headers.map(h => {
      const val = item[h] !== undefined ? item[h] : '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    rows.push(values.join(','));
  }
  const csvContent = rows.join('\n');

  if (format === 'json') {
    filename = `${baseFilename}.json`;
    content = JSON.stringify(results, null, 2);
    mimeType = 'application/json;charset=utf-8;';
  } else {
    filename = `${baseFilename}.csv`;
    content = csvContent;
    mimeType = 'text/csv;charset=utf-8;';
  }

  const blobContent = '\uFEFF' + content;
  const blob = new Blob([blobContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

async function downloadAllResults(results) {
  if (!results || results.length === 0) return;

  const format = scrapingState.config.exportFormat || 'csv';
  const keywords = scrapingState.config.keywords || ['export'];
  const cities = scrapingState.config.cities || [];

  const keywordSlug = keywords.slice(0, 3).join('_').toLowerCase().replace(/\s+/g, '_');
  const citySlug = cities.slice(0, 2).join('_').toLowerCase().replace(/\s+/g, '_');
  const baseFilename = citySlug ? `${keywordSlug}_${citySlug}` : keywordSlug;

  let content;
  let mimeType;
  let filename;

  const headers = Object.keys(results[0]);
  const rows = [headers.join(',')];
  for (const item of results) {
    const values = headers.map(h => {
      const val = item[h] !== undefined ? item[h] : '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    rows.push(values.join(','));
  }
  const csvContent = rows.join('\n');

  if (format === 'json') {
    filename = `${baseFilename}.json`;
    content = JSON.stringify(results, null, 2);
    mimeType = 'application/json;charset=utf-8;';
  } else {
    filename = `${baseFilename}.csv`;
    content = csvContent;
    mimeType = 'text/csv;charset=utf-8;';
  }

  const blobContent = '\uFEFF' + content;
  const blob = new Blob([blobContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}


async function saveResultsToDatabase(results) {
  try {
    await fetch(`${supabase.url}/rest/v1/scraped_results`, {
      method: 'POST',
      headers: supabase.headers,
      body: JSON.stringify(results)
    });
  } catch (error) {
    console.error('Erreur sauvegarde résultats:', error);
  }
}

async function completeScraping() {
  clearTimers();

  if (scrapingState.currentSessionId) {
    await updateSession('completed');
  }

  const totalElapsed = Math.floor((Date.now() - scrapingState.totalStartTime) / 1000);

  if (scrapingState.allResults.length > 0) {
    if (scrapingState.config.groupResults) {
      updateProgressUI(`
        <strong style="color: #10b981;">✓ Extraction terminée!</strong><br>
        Téléchargement en cours...<br>
        Total résultats: <strong>${scrapingState.totalResults}</strong>
      `);

      await downloadAllResults(scrapingState.allResults);

      updateProgressUI(`
        <strong style="color: #10b981;">✓ Extraction terminée!</strong><br>
        Total résultats: <strong>${scrapingState.totalResults}</strong><br>
        Temps total: <strong>${formatTime(totalElapsed)}</strong><br>
        <strong style="color: #059669;">Fichier téléchargé avec succès!</strong>
      `);
    } else {
      if (scrapingState.cityResults && scrapingState.cityResults.results.length > 0) {
        await downloadCombinationResults(
          scrapingState.cityResults.results,
          scrapingState.cityResults.keywords,
          scrapingState.cityResults.currentCity
        );
      }

      updateProgressUI(`
        <strong style="color: #10b981;">✓ Extraction terminée!</strong><br>
        Total résultats: <strong>${scrapingState.totalResults}</strong><br>
        Temps total: <strong>${formatTime(totalElapsed)}</strong><br>
        <strong style="color: #059669;">Fichiers téléchargés avec succès!</strong>
      `);
    }
  } else {
    updateProgressUI(`
      <strong style="color: #10b981;">✓ Extraction terminée!</strong><br>
      Total résultats: <strong>${scrapingState.totalResults}</strong><br>
      Temps total: <strong>${formatTime(totalElapsed)}</strong>
    `);
  }

  sendMessageToPopup({
    action: 'scrapingComplete',
    totalResults: scrapingState.totalResults,
    totalTime: totalElapsed
  });

  setTimeout(() => {
    removeProgressUI();
    removeLiveResultsUI();
  }, 8000);

  scrapingState.isRunning = false;
  saveScrapingState();
}

function handleError(error) {
  clearTimers();
  scrapingState.isRunning = false;

  if (scrapingState.currentSessionId) {
    updateSession('error');
  }

  updateProgressUI(`<strong style="color: #ef4444;">Erreur:</strong> ${error}`);

  sendMessageToPopup({
    action: 'scrapingError',
    error: error
  });

  setTimeout(() => {
    removeProgressUI();
    removeLiveResultsUI();
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
