// background.js
importScripts('optimize.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "optimizePrompt") {
        // handleOptimization is defined in optimize.js
        handleOptimization(request.prompt, request.apiKey)
            .then(response => sendResponse({ success: true, data: response }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Will respond asynchronously
    }
});
