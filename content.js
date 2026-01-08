// content.js
console.log("Prompt Optimizer content script loaded");

const OBSERVER_CONFIG = { childList: true, subtree: true };
let observer;

function init() {
    observer = new MutationObserver(handleMutations);
    observer.observe(document.body, OBSERVER_CONFIG);
    scanForTextareas();
}

function handleMutations(mutations) {
    // Simple throttle/debounce could be added here if performance suffers
    scanForTextareas();
}

function scanForTextareas() {
    // Different selectors for different sites
    const hostname = window.location.hostname;
    let textareas = [];

    if (hostname.includes('claude.ai')) {
        // Claude uses contenteditable divs often, or standard textareas
        textareas = document.querySelectorAll('div[contenteditable="true"], textarea');
    } else if (hostname.includes('aistudio.google.com')) {
        textareas = document.querySelectorAll('textarea');
    } else if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
        textareas = document.querySelectorAll('#prompt-textarea, textarea, div[contenteditable="true"]');
    } else if (hostname.includes('gemini.google.com')) {
        textareas = document.querySelectorAll('div[contenteditable="true"], textarea, rich-textarea > div');
    }

    textareas.forEach(processTextarea);
}

function processTextarea(textarea) {
    if (textarea.dataset.promptOptimizerAttached) return;

    // Attach marker
    textarea.dataset.promptOptimizerAttached = "true";

    // Create wrapper/button
    // Note: Inserting directly next to textarea might break site layout.
    // Overlaying or appending to parent is safer.
    const parent = textarea.parentElement;
    if (!parent) return;

    // Ensure parent is relative for absolute positioning of button
    const originalPosition = window.getComputedStyle(parent).position;
    if (originalPosition === 'static') {
        // Only change if strictly necessary, but be careful of breaking layout
        // parent.style.position = 'relative'; 
        // Changing layout CSS is risky. Let's try to append a sibling container if possible,
        // or just float it in the bottom right of the parent if it happens to work.
        // For Claude/AI Studio, usually the input box is in a container.
    }

    const btn = document.createElement('button');
    btn.className = 'prompt-optimizer-btn';
    btn.innerHTML = `<span>Optimize</span><div class="optimizer-spinner"></div>`;
    btn.title = "Optimize with Gemma 3-12b (by Ayushmaan)";

    // Inject button - Strategy: Append to parent, position absolute bottom-right
    // We might need to adjust parent style to relative to contain it.
    // Let's force relative on the immediate parent wrapper if it looks safe.
    if (originalPosition === 'static') {
        parent.style.position = 'relative';
    }

    parent.appendChild(btn);

    // Event Listener
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent submitting the form

        if (btn.classList.contains('loading')) return;

        const currentText = getText(textarea);
        if (!currentText || currentText.trim().length === 0) {
            alert('Please enter a prompt first.');
            return;
        }

        setLoading(btn, true);

        try {
            const apiKey = await getApiKey();
            if (!apiKey) {
                alert('Please set your Google AI Studio API Key in the extension popup.');
                setLoading(btn, false);
                return;
            }

            const response = await chrome.runtime.sendMessage({
                action: "optimizePrompt",
                prompt: currentText,
                apiKey: apiKey
            });

            if (response.success) {
                setText(textarea, response.data);
            } else {
                console.error("Optimization error:", response.error);
                alert(`Error: ${response.error}`);
            }

        } catch (err) {
            console.error("Optimization failed:", err);
            alert(`Optimization failed: ${err.message}`);
        } finally {
            setLoading(btn, false);
        }
    });
}

function getText(element) {
    if (element.tagName === 'TEXTAREA') {
        return element.value;
    } else if (element.isContentEditable) {
        return element.innerText; // or textContent
    }
    return '';
}

function setText(element, newText) {
    if (element.tagName === 'TEXTAREA') {
        element.value = newText;
        // Trigger input event for frameworks (React/Angular/etc)
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.isContentEditable) {
        element.innerText = newText;
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

function setLoading(btn, isLoading) {
    if (isLoading) {
        btn.classList.add('loading');
        btn.querySelector('span').textContent = 'Optimizing...';
    } else {
        btn.classList.remove('loading');
        btn.querySelector('span').textContent = 'Optimize';
    }
}

function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['googleApiKey'], (result) => {
            resolve(result.googleApiKey);
        });
    });
}

// Start
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
