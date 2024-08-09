
console.log("Background script loaded and running");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'analyzeContent') {
      console.log('Hitting the API...');
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer <YOUR API KEY>`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: `Analyze the following text for political bias and provide the following labels: 
              1. Overall bias (extreme left, left-leaning, centrist, right-leaning, extreme right)
              2. Author's bias 
              3. Source's bias
              4. Overall analysis justification
              
              Text: ${message.text}` }
          ],
          max_tokens: 16000
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log('API Response:', data); // Log the entire response
        if (data.choices && data.choices.length > 0) {
          const content = data.choices[0].message.content;
          const overallBias = extractLabel(content, 'Overall bias');
          const authorBias = extractLabel(content, 'Author\'s bias');
          const sourceBias = extractLabel(content, 'Source\'s bias');
          const analysis = extractAnalysis(content);
          sendResponse({ overallBias, authorBias, sourceBias, analysis });
        } else {
          console.error('Unexpected API response format:', data);
          sendResponse({ error: 'Unexpected API response format' });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        sendResponse({ error: 'Failed to analyze content' });
      });
      return true;  // Indicates you wish to send a response asynchronously
    }
  });
  
  function extractLabel(text, label) {
    const regex = new RegExp(`${label}:\\s*(.*?)\\s*(?=(\\n|$))`, 'i');
    const match = text.match(regex);
    return match ? match[1] : 'unknown';
  }
  
  function extractAnalysis(text) {
    const regex = /Overall analysis justification:([\s\S]*)/i;
    const match = text.match(regex);
    return match ? match[1].trim() : 'unknown';
  }
  