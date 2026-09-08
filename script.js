// ========================================
// GLOBALMEDIA AI
// FRONTEND SCRIPT V2
// ========================================

// ========================================
// CONFIGURATION
// ========================================

const DEVELOPER_NAME = "Miracle Emmanuel";

const DEVELOPER_IMAGE =
    "https://i.postimg.cc/qq6fQynF/unnamed-(2)-(7)-(1).jpg";


// ========================================
// ELEMENTS
// ========================================

const messagesContainer =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const newChatButton =
    document.getElementById("newChat");

const themeButton =
    document.getElementById("themeButton");

const voiceButton =
    document.getElementById("voiceButton");

const voiceStatus =
    document.getElementById("voiceStatus");


// ========================================
// STATE
// ========================================

let conversationHistory = [];

let isGenerating = false;

let lastUserMessage = "";

let recognition = null;

let isListening = false;


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    if (text === null || text === undefined) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// FORMAT AI RESPONSE
// ========================================

function formatAIResponse(text) {

    if (!text) {
        return "";
    }

    let workingText = String(text);

    const codeBlocks = [];

    // ------------------------------------
    // Extract fenced code blocks first
    // ------------------------------------

    workingText = workingText.replace(
        /```([\w#+.-]*)\n?([\s\S]*?)```/g,
        function (_, language, code) {

            const index = codeBlocks.length;

            codeBlocks.push({
                language: language || "code",
                code: code.replace(/^\n+|\n+$/g, "")
            });

            return `___GLOBALMEDIA_CODE_BLOCK_${index}___`;
        }
    );


    // ------------------------------------
    // Escape normal text
    // ------------------------------------

    workingText = escapeHTML(workingText);


    // ------------------------------------
    // Headings
    // ------------------------------------

    workingText = workingText.replace(
        /^### (.+)$/gm,
        "<h4>$1</h4>"
    );

    workingText = workingText.replace(
        /^## (.+)$/gm,
        "<h3>$1</h3>"
    );

    workingText = workingText.replace(
        /^# (.+)$/gm,
        "<h2>$1</h2>"
    );


    // ------------------------------------
    // Bold
    // ------------------------------------

    workingText = workingText.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );


    // ------------------------------------
    // Italic
    // ------------------------------------

    workingText = workingText.replace(
        /(^|[^\*])\*([^*\n]+)\*(?!\*)/g,
        "$1<em>$2</em>"
    );


    // ------------------------------------
    // Inline code
    // ------------------------------------

    workingText = workingText.replace(
        /`([^`\n]+)`/g,
        '<span class="inline-code">$1</span>'
    );


    // ------------------------------------
    // Blockquotes
    // ------------------------------------

    workingText = workingText.replace(
        /^&gt; (.+)$/gm,
        '<blockquote>$1</blockquote>'
    );


    // ------------------------------------
    // Numbered lists
    // ------------------------------------

    workingText = workingText.replace(
        /^(\d+)\.\s+(.+)$/gm,
        '<div class="ai-list-item"><span class="list-number">$1.</span><span>$2</span></div>'
    );


    // ------------------------------------
    // Bullet lists
    // ------------------------------------

    workingText = workingText.replace(
        /^[•*-]\s+(.+)$/gm,
        '<div class="ai-list-item"><span class="list-bullet">•</span><span>$1</span></div>'
    );


    // ------------------------------------
    // Line breaks
    // ------------------------------------

    workingText = workingText.replace(
        /\n/g,
        "<br>"
    );


    // ------------------------------------
    // Restore code blocks
    // ------------------------------------

    codeBlocks.forEach(function (block, index) {

        const placeholder =
            `___GLOBALMEDIA_CODE_BLOCK_${index}___`;

        const safeLanguage =
            escapeHTML(block.language);

        const safeCode =
            escapeHTML(block.code);

        const codeHTML = `
            <div class="code-wrapper">

                <div class="code-header">

                    <span class="code-language">
                        ${safeLanguage}
                    </span>

                    <div class="code-actions">

                        <button
                            type="button"
                            class="copy-code"
                            title="Copy code">
                            Copy
                        </button>

                        <button
                            type="button"
                            class="download-code"
                            title="Download code">
                            Download
                        </button>

                    </div>

                </div>

                <pre class="ai-code"><code>${safeCode}</code></pre>

            </div>
        `;

        workingText =
            workingText.replace(
                placeholder,
                codeHTML
            );
    });


    return workingText;
}


// ========================================
// ADD MESSAGE
// ========================================

function addMessage(role, text) {

    const message =
        document.createElement("div");

    message.className =
        `message ${role}-message`;

    const avatar =
        document.createElement("div");

    avatar.className = "avatar";


    // ------------------------------------
    // AI avatar
    // ------------------------------------

    if (role === "ai") {

        avatar.textContent = "GM";

    } else {

        avatar.textContent = "You";

    }


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    // ------------------------------------
    // AI message
    // ------------------------------------

    if (role === "ai") {

        content.innerHTML =
            formatAIResponse(text);


        // --------------------------------
        // AI actions
        // --------------------------------

        const actions =
            document.createElement("div");

        actions.className =
            "message-actions";

        actions.innerHTML = `
            <button
                type="button"
                class="copy-response"
                title="Copy response">
                Copy
            </button>

            <button
                type="button"
                class="regenerate-response"
                title="Regenerate response">
                Regenerate
            </button>
        `;

        content.appendChild(actions);


        // --------------------------------
        // Ensure code is actual text
        // --------------------------------

        content
            .querySelectorAll(".ai-code code")
            .forEach(function (codeElement) {

                const html =
                    codeElement.innerHTML;

                const temporary =
                    document.createElement("textarea");

                temporary.innerHTML = html;

                codeElement.textContent =
                    temporary.value;
            });

    }


    // ------------------------------------
    // User message
    // ------------------------------------

    else {

        content.textContent = text;

        const actions =
            document.createElement("div");

        actions.className =
            "message-actions";

        actions.innerHTML = `
            <button
                type="button"
                class="edit-message"
                title="Edit message">
                Edit
            </button>
        `;

        content.appendChild(actions);
    }


    // ------------------------------------
    // Build message
    // ------------------------------------

    message.appendChild(avatar);

    message.appendChild(content);

    messagesContainer.appendChild(message);

    scrollToBottom();

    return message;
}


// ========================================
// TYPING INDICATOR
// ========================================

function showTyping() {

    const message =
        document.createElement("div");

    message.className =
        "message ai-message typing-message";

    message.innerHTML = `
        <div class="avatar">GM</div>

        <div class="message-content">

            <div class="typing-indicator">

                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>

            </div>

        </div>
    `;

    messagesContainer.appendChild(message);

    scrollToBottom();

    return message;
}


// ========================================
// SCROLL
// ========================================

function scrollToBottom() {

    requestAnimationFrame(function () {

        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth"
        });

    });
}


// ========================================
// TEXTAREA RESIZE
// ========================================

function resizeTextarea() {

    messageInput.style.height = "auto";

    const newHeight =
        Math.min(
            messageInput.scrollHeight,
            180
        );

    messageInput.style.height =
        newHeight + "px";
}


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage(customMessage = null) {

    if (isGenerating) {
        return;
    }


    const message =
        customMessage !== null
            ? String(customMessage).trim()
            : messageInput.value.trim();


    if (!message) {
        return;
    }


    // ------------------------------------
    // Save message
    // ------------------------------------

    lastUserMessage = message;


    // ------------------------------------
    // Clear input
    // ------------------------------------

    messageInput.value = "";

    resizeTextarea();


    // ------------------------------------
    // Add user message
    // ------------------------------------

    addMessage(
        "user",
        message
    );


    // ------------------------------------
    // Add to conversation
    // ------------------------------------

    conversationHistory.push({
        role: "user",
        parts: [
            {
                text: message
            }
        ]
    });


    // ------------------------------------
    // Loading state
    // ------------------------------------

    isGenerating = true;

    sendButton.disabled = true;

    const typingMessage =
        showTyping();


    try {

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: message,
                        history:
                            conversationHistory
                    })
                }
            );


        let data = null;

        try {

            data = await response.json();

        } catch (jsonError) {

            throw new Error(
                "The server returned an invalid response."
            );
        }


        // --------------------------------
        // Remove typing indicator
        // --------------------------------

        typingMessage.remove();


        // --------------------------------
        // Server error
        // --------------------------------

        if (!response.ok) {

            throw new Error(
                data?.error ||
                `Request failed with status ${response.status}.`
            );
        }


        // --------------------------------
        // Get AI response
        // --------------------------------

        const aiText =
            data?.reply ||
            data?.text ||
            data?.response;


        if (!aiText) {

            throw new Error(
                "GlobalMedia AI returned an empty response."
            );
        }


        // --------------------------------
        // Add AI message
        // --------------------------------

        addMessage(
            "ai",
            aiText
        );


        // --------------------------------
        // Save AI response
        // --------------------------------

        conversationHistory.push({
            role: "model",
            parts: [
                {
                    text: aiText
                }
            ]
        });


    } catch (error) {

        console.error(
            "GlobalMedia AI Error:",
            error
        );


        if (
            typingMessage &&
            typingMessage.parentNode
        ) {
            typingMessage.remove();
        }


        let errorMessage =
            "Sorry, something went wrong while connecting to GlobalMedia AI.";


        if (error.message) {

            errorMessage =
                error.message;
        }


        addMessage(
            "ai",
            `**Error**\n\n${errorMessage}\n\nPlease try again.`
        );

    } finally {

        isGenerating = false;

        sendButton.disabled = false;

        messageInput.focus();

    }
}


// ========================================
// SEND BUTTON
// ========================================

sendButton.addEventListener(
    "click",
    function () {

        sendMessage();

    }
);


// ========================================
// ENTER TO SEND
// ========================================

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


// ========================================
// TEXTAREA INPUT
// ========================================

messageInput.addEventListener(
    "input",
    function () {

        resizeTextarea();

    }
);


// ========================================
// SUGGESTIONS
// ========================================

document.addEventListener(
    "click",
    function (event) {

        const suggestion =
            event.target.closest(
                ".suggestion"
            );


        if (!suggestion) {
            return;
        }


        const prompt =
            suggestion.dataset.prompt;


        if (!prompt) {
            return;
        }


        sendMessage(prompt);

    }
);


// ========================================
// NEW CHAT
// ========================================

newChatButton.addEventListener(
    "click",
    function () {

        if (isGenerating) {
            return;
        }


        conversationHistory = [];

        lastUserMessage = "";


        messagesContainer.innerHTML = `
            <div class="welcome">

                <div class="welcome-icon">
                    GM
                </div>

                <h2>
                    Welcome to GlobalMedia AI
                </h2>

                <p>
                    Ask questions, learn new things,
                    generate ideas, write content,
                    write code, or simply have a conversation.
                </p>

                <div class="suggestions">

                    <button
                        type="button"
                        class="suggestion"
                        data-prompt="Explain HTML to me like I am a complete beginner.">

                        <span>💡</span>
                        <span>Learn something</span>

                    </button>


                    <button
                        type="button"
                        class="suggestion"
                        data-prompt="Create a simple professional HTML webpage for a beginner.">

                        <span>💻</span>
                        <span>Write some code</span>

                    </button>


                    <button
                        type="button"
                        class="suggestion"
                        data-prompt="Give me three powerful ideas for improving myself.">

                        <span>✨</span>
                        <span>Get ideas</span>

                    </button>

                </div>

            </div>
        `;


        messageInput.value = "";

        resizeTextarea();

        messageInput.focus();

    }
);


// ========================================
// THEME
// ========================================

function updateThemeButton() {

    const dark =
        document.body.classList.contains(
            "dark"
        );


    themeButton.textContent =
        dark ? "☀" : "☾";


    themeButton.setAttribute(
        "aria-label",
        dark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );


    themeButton.setAttribute(
        "title",
        dark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );
}


// ----------------------------------------
// Load saved theme
// ----------------------------------------

const savedTheme =
    localStorage.getItem(
        "globalmedia-ai-theme"
    );


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark"
    );

}


updateThemeButton();


// ----------------------------------------
// Theme button
// ----------------------------------------

themeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "globalmedia-ai-theme",
            dark
                ? "dark"
                : "light"
        );


        updateThemeButton();

    }
);


// ========================================
// COPY CODE
// ========================================

async function copyCode(button) {

    const wrapper =
        button.closest(
            ".code-wrapper"
        );


    if (!wrapper) {
        return;
    }


    const codeElement =
        wrapper.querySelector(
            "code"
        );


    if (!codeElement) {
        return;
    }


    const code =
        codeElement.textContent;


    try {

        await navigator.clipboard.writeText(
            code
        );

        const original =
            button.textContent;

        button.textContent =
            "Copied!";


        setTimeout(
            function () {

                button.textContent =
                    original;

            },
            1500
        );


    } catch (error) {

        fallbackCopy(code, button);

    }
}


// ========================================
// FALLBACK COPY
// ========================================

function fallbackCopy(
    text,
    button = null
) {

    const textarea =
                document.createElement(
            "textarea"
        );


    textarea.value = text;

    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";

    textarea.style.top =
        "0";


    document.body.appendChild(
        textarea
    );


    textarea.focus();

    textarea.select();


    try {

        document.execCommand(
            "copy"
        );


        if (button) {

            const original =
                button.textContent;

            button.textContent =
                "Copied!";


            setTimeout(
                function () {

                    button.textContent =
                        original;

                },
                1500
            );

        }

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );

    }


    textarea.remove();
}


// ========================================
// DOWNLOAD CODE
// ========================================

function downloadCode(button) {

    const wrapper =
        button.closest(
            ".code-wrapper"
        );


    if (!wrapper) {
        return;
    }


    const codeElement =
        wrapper.querySelector(
            "code"
        );


    if (!codeElement) {
        return;
    }


    const code =
        codeElement.textContent;


    const languageElement =
        wrapper.querySelector(
            ".code-language"
        );


    const language =
        languageElement
            ? languageElement.textContent
                .trim()
                .toLowerCase()
            : "code";


    const extensions = {

        html: "html",
        htm: "html",

        css: "css",

        js: "js",
        javascript: "js",

        json: "json",

        xml: "xml",

        php: "php",

        py: "py",
        python: "py",

        java: "java",

        c: "c",

        cpp: "cpp",
        "c++": "cpp",

        sql: "sql",

        txt: "txt",
        text: "txt"

    };


    const extension =
        extensions[language] ||
        "txt";


    const blob =
        new Blob(
            [code],
            {
                type:
                    "text/plain;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        `globalmedia-code.${extension}`;


    document.body.appendChild(
        link
    );


    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );
}


// ========================================
// MESSAGE ACTIONS
// ========================================

document.addEventListener(
    "click",
    async function (event) {


        // --------------------------------
        // COPY CODE
        // --------------------------------

        const copyCodeButton =
            event.target.closest(
                ".copy-code"
            );


        if (copyCodeButton) {

            await copyCode(
                copyCodeButton
            );

            return;
        }


        // --------------------------------
        // DOWNLOAD CODE
        // --------------------------------

        const downloadButton =
            event.target.closest(
                ".download-code"
            );


        if (downloadButton) {

            downloadCode(
                downloadButton
            );

            return;
        }


        // --------------------------------
        // COPY AI RESPONSE
        // --------------------------------

        const copyResponseButton =
            event.target.closest(
                ".copy-response"
            );


        if (copyResponseButton) {

            const content =
                copyResponseButton.closest(
                    ".message-content"
                );


            if (!content) {
                return;
            }


            const clone =
                content.cloneNode(
                    true
                );


            const actions =
                clone.querySelector(
                    ".message-actions"
                );


            if (actions) {
                actions.remove();
            }


            const text =
                clone.innerText.trim();


            try {

                await navigator.clipboard.writeText(
                    text
                );


                const original =
                    copyResponseButton.textContent;


                copyResponseButton.textContent =
                    "Copied!";


                setTimeout(
                    function () {

                        copyResponseButton.textContent =
                            original;

                    },
                    1500
                );


            } catch (error) {

                fallbackCopy(
                    text,
                    copyResponseButton
                );

            }


            return;
        }


        // --------------------------------
        // REGENERATE RESPONSE
        // --------------------------------

        const regenerateButton =
            event.target.closest(
                ".regenerate-response"
            );


        if (regenerateButton) {

            if (
                isGenerating ||
                !lastUserMessage
            ) {
                return;
            }


            // Remove latest AI message

            const aiMessages =
                messagesContainer.querySelectorAll(
                    ".ai-message:not(.typing-message)"
                );


            const latestAI =
                aiMessages[
                    aiMessages.length - 1
                ];


            if (latestAI) {
                latestAI.remove();
            }


            // Remove latest model response
            // from conversation history

            for (
                let i =
                    conversationHistory.length - 1;
                i >= 0;
                i--
            ) {

                if (
                    conversationHistory[i].role ===
                    "model"
                ) {

                    conversationHistory.splice(
                        i,
                        1
                    );

                    break;
                }

            }


            await sendMessage(
                lastUserMessage
            );


            return;
        }


        // --------------------------------
        // EDIT USER MESSAGE
        // --------------------------------

        const editButton =
            event.target.closest(
                ".edit-message"
            );


        if (editButton) {

            const messageElement =
                editButton.closest(
                    ".message"
                );


            if (!messageElement) {
                return;
            }


            const content =
                messageElement.querySelector(
                    ".message-content"
                );


            if (!content) {
                return;
            }


            // Get only the user's message text

            const clone =
                content.cloneNode(
                    true
                );


            const actions =
                clone.querySelector(
                    ".message-actions"
                );


            if (actions) {
                actions.remove();
            }


            const oldText =
                clone.innerText.trim();


            messageInput.value =
                oldText;


            resizeTextarea();

            messageInput.focus();


            // Remove message from screen

            messageElement.remove();


            // Remove corresponding user message
            // from conversation history

            for (
                let i =
                    conversationHistory.length - 1;
                i >= 0;
                i--
            ) {

                if (
                    conversationHistory[i].role ===
                    "user"
                ) {

                    conversationHistory.splice(
                        i,
                        1
                    );

                    break;
                }

            }


            return;
        }

    }
);


// ========================================
// VOICE INPUT
// ========================================

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    // ------------------------------------
    // Browser support check
    // ------------------------------------

    if (!SpeechRecognition) {

        voiceButton.addEventListener(
            "click",
            function () {

                voiceStatus.textContent =
                    "Voice input is not supported in this browser.";

                setTimeout(
                    function () {

                        voiceStatus.textContent =
                            "";

                    },
                    3500
                );

            }
        );

        return;
    }


    // ------------------------------------
    // Create recognition
    // ------------------------------------

    recognition =
        new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = true;

    recognition.lang = "en-US";


    // ------------------------------------
    // Speech result
    // ------------------------------------

    recognition.onresult =
        function (event) {

            let finalTranscript = "";

            let interimTranscript = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const transcript =
                    event.results[i][0]
                        .transcript;


                if (
                    event.results[i].isFinal
                ) {

                    finalTranscript +=
                        transcript;

                } else {

                    interimTranscript +=
                        transcript;

                }

            }


            if (finalTranscript) {

                if (
                    messageInput.value.trim()
                ) {

                    messageInput.value +=
                        " " +
                        finalTranscript.trim();

                } else {

                    messageInput.value =
                        finalTranscript.trim();

                }

            }


            if (interimTranscript) {

                voiceStatus.textContent =
                    interimTranscript;

            } else {

                voiceStatus.textContent =
                    "Listening...";

            }


            resizeTextarea();

        };


    // ------------------------------------
    // Recognition started
    // ------------------------------------

    recognition.onstart =
        function () {

            isListening = true;


            voiceButton.classList.add(
                "listening"
            );


            voiceStatus.textContent =
                "Listening...";

        };


    // ------------------------------------
    // Recognition ended
    // ------------------------------------

    recognition.onend =
        function () {

            isListening = false;


            voiceButton.classList.remove(
                "listening"
            );


            if (
                voiceStatus.textContent ===
                "Listening..."
            ) {

                voiceStatus.textContent =
                    "Voice input finished.";

            }


            setTimeout(
                function () {

                    voiceStatus.textContent =
                        "";

                },
                2000
            );

        };


    // ------------------------------------
    // Recognition error
    // ------------------------------------

    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );


            isListening = false;


            voiceButton.classList.remove(
                "listening"
            );


            let message =
                "Voice input failed.";


            if (
                event.error ===
                "not-allowed"
            ) {

                message =
                    "Microphone permission was denied.";

            }


            else if (
                event.error ===
                "no-speech"
            ) {

                message =
                    "No speech detected.";

            }


            else if (
                event.error ===
                "network"
            ) {

                message =
                    "Voice recognition needs an internet connection.";

            }


            voiceStatus.textContent =
                message;


            setTimeout(
                function () {

                    voiceStatus.textContent =
                        "";

                },
                3500
            );

        };


    // ------------------------------------
    // Microphone button
    // ------------------------------------

    voiceButton.addEventListener(
        "click",
        function () {

            if (isListening) {

                recognition.stop();

                return;
            }


            try {

                recognition.start();

            } catch (error) {

                console.error(
                    "Could not start microphone:",
                    error
                );

            }

        }
    );
}


// ========================================
// INITIALIZE VOICE
// ========================================

setupVoiceRecognition();


// ========================================
// INITIALIZE TEXTAREA
// ========================================

resizeTextarea();


// ========================================
// INITIAL FOCUS
// ========================================

messageInput.focus();


// ========================================
// GLOBALMEDIA AI READY
// ========================================

console.log(
    `GlobalMedia AI initialized. Developer: ${DEVELOPER_NAME}`
);
            
