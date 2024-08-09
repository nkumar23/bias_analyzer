console.log("Content script loaded and running");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeContent') {
    const text = document.body.innerText || '';
    if (text.trim().length > 0) {
      console.log('Content script: Content is ready');
      chrome.runtime.sendMessage({ action: 'contentReady', contentAvailable: true });
    } else {
      console.log('Content script: No content available');
      chrome.runtime.sendMessage({ action: 'contentReady', contentAvailable: false });
    }
    sendResponse({ text });
    return true;
  }
});

// Automatically check if content is available when the script is loaded
const text = document.body.innerText || '';
if (text.trim().length > 0) {
  console.log('Content script: Content is ready');
  chrome.runtime.sendMessage({ action: 'contentReady', contentAvailable: true });
} else {
  console.log('Content script: No content available');
  chrome.runtime.sendMessage({ action: 'contentReady', contentAvailable: false });
}
