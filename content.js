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
    scanForTextareas();
}

function scanForTextareas() {
    const hostname = window.location.hostname;
    let textareas = [];

    if (hostname.includes('claude.ai')) {
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
    // Check if button is already attached and ALIVE in the DOM
    if (textarea._promptOptimizerButton && document.body.contains(textarea._promptOptimizerButton)) {
        return;
    }

    let container = textarea.parentElement;
    const hostname = window.location.hostname;

    // Site-specific container finding logic to place button outside/above
    if (hostname.includes('claude.ai')) {
        const fieldset = textarea.closest('fieldset');
        if (fieldset) container = fieldset;
    } else if (hostname.includes('chatgpt.com') || hostname.includes('openai.com')) {
        const form = textarea.closest('form');
        const mainWrapper = textarea.closest('.group');
        if (mainWrapper) container = mainWrapper;
        else if (form) container = form;
    } else if (hostname.includes('gemini.google.com')) {
        const richTextarea = textarea.closest('rich-textarea');
        if (richTextarea) container = richTextarea;
    }

    if (!container) return;

    // Ensure container is relative so absolute child indexes correctly
    const originalPosition = window.getComputedStyle(container).position;
    if (originalPosition === 'static') {
        container.style.position = 'relative';
    }

    // Ensure button is visible if positioned outside (top: -px)
    // We iterate up a few parents to ensure no clipping
    let el = container;
    for (let i = 0; i < 3; i++) {
        if (!el) break;
        const style = window.getComputedStyle(el);
        if (style.overflow === 'hidden' || style.overflow === 'auto' || style.overflow === 'scroll') {
            el.style.overflow = 'visible';
        }
        el = el.parentElement;
    }

    const btn = document.createElement('button');
    btn.className = 'prompt-optimizer-btn';
    btn.innerHTML = `<span>Optimize</span><div class="optimizer-spinner"></div>`;
    btn.title = "Optimize with Gemma 3-12b (by Ayushmaan)";

    container.appendChild(btn);

    // Save reference on the DOM element itself
    textarea._promptOptimizerButton = btn;
    textarea.dataset.promptOptimizerAttached = "true";

    // Event Listener
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

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
