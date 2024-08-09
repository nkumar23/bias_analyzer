document.addEventListener('DOMContentLoaded', () => {
    const analyzeButton = document.getElementById('analyze-button');
    const labelElement = document.getElementById('label');
    const analysisElement = document.getElementById('analysis');
  
    analyzeButton.addEventListener('click', () => {
      labelElement.innerText = 'Content being analyzed...';
      analysisElement.innerText = '';
  
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (tabs[0]) {
          console.log('Sending message to content script');
          chrome.tabs.sendMessage(tabs[0].id, { action: 'analyzeContent' }, response => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              labelElement.innerText = 'Error communicating with content script.';
              return;
            }
            if (response && response.text) {
              console.log('Received content from content script');
              chrome.runtime.sendMessage({ action: 'analyzeContent', text: response.text }, res => {
                if (res && res.overallBias && res.authorBias && res.sourceBias && res.analysis) {
                  labelElement.innerHTML = `
                    <strong>Overall Bias:</strong> ${res.overallBias}<br>
                    <strong>Author's Bias:</strong> ${res.authorBias}<br>
                    <strong>Source's Bias:</strong> ${res.sourceBias}<br>
                  `;
                  analysisElement.innerText = `Analysis: ${res.analysis}`;
                } else {
                  labelElement.innerText = 'No analysis available.';
                  analysisElement.innerText = '';
                }
              });
            } else {
              labelElement.innerText = 'No content available.';
              analysisElement.innerText = '';
            }
          });
        } else {
          labelElement.innerText = 'No active tab found.';
          analysisElement.innerText = '';
        }
      });
    });
  });
  