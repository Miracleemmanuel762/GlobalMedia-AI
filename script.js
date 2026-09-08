// ========================================
// GLOBALMEDIA AI
// FRONTEND UPGRADE V2
// ========================================


// ========================================
// DEVELOPER
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
// HTML ESCAPE
// ========================================

function escapeHTML(text) {

    return String(text || "")
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

    let html = String(text || "");

    const codeBlocks = [];

    /*
        IMPORTANT:

        Code blocks are extracted BEFORE
        normal Markdown formatting.

        This prevents <html>, <body>,
        CSS and JavaScript from being
        interpreted as actual HTML.
    */

    html = html.replace(
        /```([a-zA-Z0-9_+#.-]*)[ \t]*\r?\n?([\s\S]*?)```/g,
        function(match, language, code) {

            const index = codeBlocks.length;

            let cleanCode = code
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n");

            /*
                Remove only the first and last
                accidental blank line.
            */

            cleanCode = cleanCode
                .replace(/^\n/, "")
                .replace(/\n$/, "");

            codeBlocks.push({

                language:
                    language ||
                    "code",

                code:
                    cleanCode

            });

            return `___GLOBALMEDIA_CODE_${index}___`;
        }
    );


    /*
        Escape normal AI text.

        Code blocks have already been
        replaced with placeholders.
    */

    html = escapeHTML(html);


    // ====================================
    // HEADINGS
    // ====================================

    html = html.replace(
        /^###\s+(.*)$/gm,
        "<h4>$1</h4>"
    );

    html = html.replace(
        /^##\s+(.*)$/gm,
        "<h3>$1</h3>"
    );

    html = html.replace(
        /^#\s+(.*)$/gm,
        "<h2>$1</h2>"
    );


    // ====================================
    // BOLD
    // ====================================

    html = html.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );


    // ====================================
    // ITALIC
    // ====================================

    html = html.replace(
        /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
        "<em>$1</em>"
    );


    // ====================================
    // INLINE CODE
    // ====================================

    html = html.replace(
        /`([^`\n]+)`/g,
        '<code class="inline-code">$1</code>'
    );


    // ====================================
    // BLOCKQUOTE
    // ====================================

    html = html.replace(
        /^>\s?(.*)$/gm,
        "<blockquote>$1</blockquote>"
    );


    // ====================================
    // NUMBERED LIST
    // ====================================

    html = html.replace(
        /^\s*(\d+)\.\s+(.*)$/gm,
        `
        <div class="ai-list-item">
            <span class="list-number">$1.</span>
            <span>$2</span>
        </div>
        `
    );


    // ====================================
    // BULLET LIST
    // ====================================

    html = html.replace(
        /^\s*[-•*]\s+(.*)$/gm,
        `
        <div class="ai-list-item">
            <span class="list-bullet">•</span>
            <span>$1</span>
        </div>
        `
    );


    // ====================================
    // LINE BREAKS
    // ====================================

    html = html.replace(
        /\n\n/g,
        "<br><br>"
    );

    html = html.replace(
        /\n/g,
        "<br>"
    );


    // ====================================
    // RESTORE CODE BLOCKS
    // ====================================

    codeBlocks.forEach(
        function(block, index) {

            const placeholder =
                `___GLOBALMEDIA_CODE_${index}___`;

            /*
                We escape code for safe HTML,
                but the browser will display
                it as:

                <html>

                NOT:

                &lt;html&gt;

                because textContent is used
                inside the <code> element.
            */

            const codeId =
                "gm-code-" +
                Date.now() +
                "-" +
                index;

            const codeHTML = `
                <div class="code-wrapper">

                    <div class="code-header">

                        <span class="code-language">
                            ${escapeHTML(block.language)}
                        </span>

                        <div class="code-actions">

                            <button
                                type="button"
                                class="copy-code"
                                data-code-id="${codeId}">
                                Copy
                            </button>

                            <button
                                type="button"
                                class="download-code"
                                data-code-id="${codeId}">
                                Download
                            </button>

                        </div>

                    </div>

                    <pre class="ai-code"><code id="${codeId}"></code></pre>

                </div>
            `;

            html =
                html.replace(
                    placeholder,
                    codeHTML
                );

        }
    );


    return {
        html: html,
        codeBlocks: codeBlocks
    };
}


// ========================================
// ADD MESSAGE
// ========================================

function addMessage(
    text,
    sender,
    options = {}
) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        sender === "user"
            ? "message user-message"
            : "message ai-message";


    // ====================================
    // AVATAR
    // ====================================

    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar";

    avatar.textContent =
        sender === "user"
            ? "You"
            : "GM";


    // ====================================
    // CONTENT
    // ====================================

    const content =
        document.createElement("div");

    content.className =
        "message-content";


    if (sender === "ai") {

        const formatted =
            formatAIResponse(text);

        content.innerHTML =
            formatted.html;

        /*
            Put actual code into code elements
            using textContent.

            This is the important fix for:

            &lt;html&gt;

            becoming:

            <html>
        */

        formatted.codeBlocks.forEach(
            function(block, index) {

                const codeId =
                    content.querySelector(
                        `.code-wrapper:nth-of-type(${index + 1}) code`
                    );

                /*
                    Safer lookup using all code blocks.
                */

                const allCode =
                    content.querySelectorAll(
                        ".ai-code code"
                    );

                if (allCode[index]) {

                    allCode[index].textContent =
                        block.code;
                }

            }
        );

    } else {

        content.textContent =
            text;

    }


    wrapper.appendChild(avatar);

    wrapper.appendChild(content);


    // ====================================
    // MESSAGE ACTIONS
    // ====================================

    if (sender === "ai" && options.actions !== false) {

        const actions =
            document.createElement("div");

        actions.className =
            "message-actions";

        actions.innerHTML = `

            <button
                type="button"
                class="message-copy">
                Copy
            </button>

            <button
                type="button"
                class="message-regenerate">
                Regenerate
            </button>

        `;

        content.appendChild(actions);
    }


    if (sender === "user" && options.actions !== false) {

        const actions =
            document.createElement("div");

        actions.className =
            "message-actions";

        actions.innerHTML = `

            <button
                type="button"
                class="message-edit">
                Edit
            </button>

        `;

        content.appendChild(actions);
    }


    messagesContainer.appendChild(wrapper);

    scrollToBottom();

    return wrapper;
}


// ========================================
// TYPING INDICATOR
// ========================================

function showTyping() {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message ai-message";


    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar";

    avatar.textContent =
        "GM";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    content.innerHTML = `

        <div class="typing-indicator">

            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>

        </div>

    `;


    wrapper.appendChild(avatar);

    wrapper.appendChild(content);

    messagesContainer.appendChild(wrapper);

    scrollToBottom();


    return wrapper;
}


// ========================================
// SCROLL
// ========================================

function scrollToBottom() {

    setTimeout(
        function() {

            messagesContainer.scrollTop =
                messagesContainer.scrollHeight;

        },
        20
    );

}


// ========================================
// AUTO RESIZE TEXTAREA
// ========================================

function resizeTextarea() {

    messageInput.style.height =
        "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            180
        ) + "px";
}


messageInput.addEventListener(
    "input",
    resizeTextarea
);


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage(customMessage = null) {

    if (isGenerating) {
        return;
    }


    const message =
        customMessage !== null
            ? customMessage.trim()
            : messageInput.value.trim();


    if (!message) {
        return;
    }


    isGenerating = true;

    lastUserMessage = message;


    messageInput.disabled =
        true;

    sendButton.disabled =
        true;


    addMessage(
        message,
        "user"
    );


    messageInput.value =
        "";

    resizeTextarea();


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

                    body:
                        JSON.stringify({

                            message:
                                message,

                            history:
                                conversationHistory

                        })

                }
            );


        let data;

        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "The server returned an invalid response."
            );

        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Something went wrong."
            );

        }


        const aiReply =
            data.reply;


        if (!aiReply) {

            throw new Error(
                "GlobalMedia AI returned an empty response."
            );

        }


        typingMessage.remove();


        addMessage(
            aiReply,
            "ai"
        );


        // =================================
        // SAVE HISTORY
        // =================================

        conversationHistory.push({

            role: "user",

            text: message

        });


        conversationHistory.push({

            role: "model",

            text: aiReply

        });


    } catch (error) {

        console.error(
            "GlobalMedia AI Error:",
            error
        );


        if (typingMessage) {

            typingMessage.remove();

        }


        addMessage(
            "Sorry, I couldn't connect to GlobalMedia AI right now. Please try again.",
            "ai"
        );

    }


    isGenerating =
        false;

    messageInput.disabled =
        false;

    sendButton.disabled =
        false;

    messageInput.focus();

}


// ========================================
// SEND BUTTON
// ========================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        function() {

            sendMessage();

        }
    );

}


// ========================================
// ENTER TO SEND
// ========================================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


// ========================================
// SUGGESTIONS
// ========================================

document.addEventListener(
    "click",
    function(event) {

        const suggestion =
            event.target.closest(
                ".suggestion"
            );


        if (!suggestion) {
            return;
        }


        const prompt =
            suggestion.getAttribute(
                "data-prompt"
            );


        if (!prompt) {
            return;
        }


        messageInput.value =
            prompt;

        resizeTextarea();

        sendMessage();

    }
);


// ========================================
// COPY CODE
// ========================================

async function copyCode(button) {

    const codeId =
        button.getAttribute(
            "data-code-id"
        );


    const codeElement =
        document.getElementById(
            codeId
        );


    if (!codeElement) {

        console.error(
            "Code element not found."
        );

        return;
    }


    const code =
        codeElement.textContent;


    const oldText =
        button.textContent;


    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                code
            );

        } else {

            fallbackCopy(code);

        }


        button.textContent =
            "Copied ✓";


    } catch (error) {

        console.error(
            "Clipboard error:",
            error
        );


        try {

            fallbackCopy(code);

            button.textContent =
                "Copied ✓";

        } catch {

            button.textContent =
                "Copy failed";

        }

    }


    setTimeout(
        function() {

            button.textContent =
                oldText;

        },
        2000
    );

}


// ========================================
// FALLBACK COPY
// ========================================

function fallbackCopy(text) {

    const textarea =
        document.createElement(
            "textarea"
        );

    textarea.value =
        text;

    textarea.style.position =
        "fixed";

    textarea.style.top =
        "0";

    textarea.style.left =
        "-9999px";

    textarea.style.opacity =
        "0";


    document.body.appendChild(
        textarea
    );


    textarea.focus();

    textarea.select();


    const successful =
        document.execCommand(
            "copy"
        );


    textarea.remove();


    if (!successful) {

        throw new Error(
            "Copy command failed."
        );

    }

}


// ========================================
// DOWNLOAD CODE
// ========================================

function downloadCode(button) {

    const codeId =
        button.getAttribute(
            "data-code-id"
        );


    const codeElement =
        document.getElementById(
            codeId
        );


    if (!codeElement) {
        return;
    }


    const code =
        codeElement.textContent;


    const wrapper =
        button.closest(
            ".code-wrapper"
        );


    const language =
        wrapper
            ?.querySelector(
                ".code-language"
            )
            ?.textContent
            ?.trim()
            .toLowerCase() ||
        "txt";


    const extensions = {

        html: "html",
        htm: "html",

        css: "css",

        javascript: "js",
        js: "js",

        typescript: "ts",
        ts: "ts",

        python: "py",

        php: "php",

        java: "java",

        json: "json",

        xml: "xml",

        sql: "sql",

        bash: "sh",
        shell: "sh",

        text: "txt",
        txt: "txt",

        code: "txt"

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


    link.href =
        url;


    link.download =
        `globalmedia-ai-code.${extension}`;


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
    async function(event) {

        // ---------------------------------
        // COPY CODE
        // ---------------------------------

        const copyCodeButton =
            event.target.closest(
                ".copy-code"
            );


        if (copyCodeButton) {

            await copyCode(
                copyCodeButton
            );

            return;

   
