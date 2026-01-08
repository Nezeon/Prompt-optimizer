// optimize.js

/**
 * Sends the user prompt to the Google Gemma 3-12b API for optimization.
 * @param {string} prompt - The original user prompt.
 * @param {string} apiKey - The Google AI Studio API key.
 * @returns {Promise<string>} - The optimized prompt.
 */
async function handleOptimization(prompt, apiKey) {
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-12b-it:generateContent";
    const SYSTEM_INSTRUCTION = "You are a prompt engineering expert. Optimize this prompt for clarity, specificity, and structure. Return ONLY the optimized prompt content without any introductory or concluding text, markdown headers, or surrounding quotes. The output should be ready to paste directly into an LLM.";

    const payload = {
        contents: [{
            parts: [{
                text: `${SYSTEM_INSTRUCTION}\n\n[USER PROMPT]:\n${prompt}`
            }]
        }],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 400
        }
    };

    try {
        const response = await fetch(`${API_URL}?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        const optimizedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!optimizedText) {
            throw new Error("Invalid response format from API");
        }

        return optimizedText.trim();
    } catch (error) {
        console.error("Optimization failed:", error);
        throw error;
    }
}
