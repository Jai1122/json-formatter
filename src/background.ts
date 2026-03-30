/// <reference types="chrome"/>

// Open the JSON Formatter app as a full tab when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') }).catch((err) => {
    console.error('[JSON Formatter] Failed to open tab:', err);
  });
});
