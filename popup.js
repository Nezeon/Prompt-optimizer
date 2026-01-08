document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    // Load saved key
    chrome.storage.sync.get(['googleApiKey'], (result) => {
        if (result.googleApiKey) {
            apiKeyInput.value = result.googleApiKey;
            showStatus('API Key loaded', 'success', 2000);
        }
    });

    // Save key
    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        chrome.storage.sync.set({ googleApiKey: apiKey }, () => {
            showStatus('Settings saved successfully!', 'success');
        });
    });

    function showStatus(message, type, timeout = 3000) {
        statusDiv.textContent = message;
        statusDiv.className = type;

        if (timeout) {
            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = '';
            }, timeout);
        }
    }
});
