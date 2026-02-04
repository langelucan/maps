chrome.runtime.onInstalled.addListener(() => {
  console.log('Google Maps Scraper Pro installé avec succès');

  chrome.storage.local.set({
    keywords: '',
    exportFormat: 'csv',
    autoScroll: true,
    groupResults: false,
    scrapingState: {
      isRunning: false,
      status: 'Prêt',
      progress: {
        current: 0,
        total: 0,
        results: 0,
        timeElapsed: 0
      }
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateStatus') {
    chrome.storage.local.set({
      scrapingState: {
        isRunning: message.state === 'active',
        status: message.text,
        progress: message.progress || {}
      }
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes('google.com/maps') || tab.url.includes('google.fr/maps')) {
    chrome.action.openPopup();
  } else {
    chrome.tabs.create({ url: 'https://www.google.com/maps' });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (tab.url && (tab.url.includes('google.com/maps') || tab.url.includes('google.fr/maps'))) {
      chrome.storage.local.get(['scrapingState'], (result) => {
        if (result.scrapingState && result.scrapingState.isRunning) {
          console.log('Google Maps rechargé - état du scraping préservé');
        }
      });
    }
  }
});

chrome.downloads.onChanged.addListener((delta) => {
  if (delta.state && delta.state.current === 'complete') {
    console.log('Téléchargement terminé');
  }
});
