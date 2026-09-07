}

// ========================================
// GLOBALMEDIA AI
// FIXED GPT-STYLE RESPONSE SYSTEM
// + RELIABLE COPY CODE
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
  document.getElementById("newChatButton");


// ========================================
// CONVERSATION HISTORY
// ========================================

let conversationHistory = [];


// ========================================
// FORMAT AI RESPONSE
// ========================================

function formatAIResponse(text) {

  let html = String(text || "");

  // --------------------------------------
  // ESCAPE HTML
  // --------------------------------------

  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");


  // --------------------------------------
  // PROTECT CODE BLOCKS
  // --------------------------------------

  const codeBlocks = [];

  html = html.replace(
    /```([a-zA-Z0-9_+-]*)\s*\n?([\s\S]*?)```/g,
    function(match, language, code) {

      const index =
        codeBlocks.length;

      const cleanCode =
        code
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .trim();

      codeBlocks.push({
        language:
          language || "code",

        code:
          cleanCode
      });

      return `___GLOBALMEDIA_CODE_${index}___`;
    }
  );


  // --------------------------------------
  // HEADINGS
  // --------------------------------------

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


  // --------------------------------------
  // BOLD
  // --------------------------------------

  html = html.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );


  // --------------------------------------
  // ITALIC
  // --------------------------------------

  html = html.replace(
    /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
    "<em>$1</em>"
  );


  // --------------------------------------
  // INLINE CODE
  // --------------------------------------

  html = html.replace(
    /`([^`\n]+)`/g,
    "<code class=\"inline-code\">$1</code>"
  );


  // --------------------------------------
  // BLOCKQUOTES
  // --------------------------------------

  html = html.replace(
    /^>\s?(.*)$/gm,
    "<blockquote>$1</blockquote>"
  );


  // --------------------------------------
  // NUMBERED LIST
  // --------------------------------------

  html = html.replace(
    /^\s*(\d+)\.\s+(.*)$/gm,
    `<div class="ai-list-item">
       <span class="list-number">$1.</span>
       <span>$2</span>
     </div>`
  );


  // --------------------------------------
  // BULLET LIST
  // --------------------------------------

  html = html.replace(
    /^\s*[-•]\s+(.*)$/gm,
    `<div class="ai-list-item">
       <span class="list-bullet">•</span>
       <span>$1</span>
     </div>`
  );


  // --------------------------------------
  // NEWLINES
  // --------------------------------------

  html = html.replace(
    /\n\n/g,
    "<br><br>"
  );

  html = html.replace(
    /\n/g,
    "<br>"
  );


  // --------------------------------------
  // RESTORE CODE BLOCKS
  // --------------------------------------

  codeBlocks.forEach(
    function(block, index) {

      const placeholder =
        `___GLOBALMEDIA_CODE_${index}___`;

      const safeCode =
        block.code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");

      const codeHTML = `
        <div class="code-wrapper">

          <div class="code-header">

            <span class="code-language">
              ${block.language}
            </span>

            <button
              type="button"
              class="copy-code"
              data-code-index="${index}"
            >
              Copy
            </button>

          </div>

          <pre class="ai-code"><code>${safeCode}</code></pre>

        </div>
      `;

      html =
        html.replace(
          placeholder,
          codeHTML
        );

    }
  );


  return html;
}


// ========================================
// ADD MESSAGE
// ========================================

function addMessage(text, sender) {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    sender === "user"
      ? "message user-message"
      : "message ai-message";


  // --------------------------------------
  // AVATAR
  // --------------------------------------

  const avatar =
    document.createElement("div");

  avatar.className =
    "avatar";

  avatar.textContent =
    sender === "user"
      ? "You"
      : "GM";


  // --------------------------------------
  // MESSAGE CONTENT
  // --------------------------------------

  const content =
    document.createElement("div");

  content.className =
    "message-content";


  if (sender === "ai") {

    content.innerHTML =
      formatAIResponse(text);

  } else {

    content.textContent =
      text;

  }


  wrapper.appendChild(avatar);

  wrapper.appendChild(content);

  messagesContainer.appendChild(wrapper);


  scrollToBottom();

  return wrapper;
}


// ========================================
// COPY CODE
// ========================================

async function copyCode(button) {

  const codeIndex =
    Number(
      button.getAttribute(
        "data-code-index"
      )
    );


  /*
    Find the actual code block
    inside the same wrapper.
  */

  const wrapper =
    button.closest(
      ".code-wrapper"
    );


  if (!wrapper) {

    console.error(
      "Code wrapper not found."
    );

    return;

  }


  const codeElement =
    wrapper.querySelector(
      "code"
    );


  if (!codeElement) {

    console.error(
      "Code element not found."
    );

    return;

  }


  const code =
    codeElement.textContent;


  try {

    await navigator.clipboard.writeText(
      code
    );


    const oldText =
      button.textContent;


    button.textContent =
      "Copied ✓";


    setTimeout(
      function() {

        button.textContent =
          oldText;

      },
      2000
    );


  } catch (error) {

    console.error(
      "Clipboard error:",
      error
    );


    /*
      Fallback for browsers where
      Clipboard API is unavailable.
    */

    const textarea =
      document.createElement(
        "textarea"
      );

    textarea.value =
      code;

    textarea.style.position =
      "fixed";

    textarea.style.left =
      "-9999px";

    document.body.appendChild(
      textarea
    );

    textarea.select();


    try {

      document.execCommand(
        "copy"
      );

      button.textContent =
        "Copied ✓";

    } catch (fallbackError) {

      console.error(
        fallbackError
      );

      button.textContent =
        "Copy failed";

    }


    document.body.removeChild(
      textarea
    );


    setTimeout(
      function() {

        button.textContent =
          "Copy";

      },
      2000
    );

  }

}


// ========================================
// CODE COPY EVENT
// ========================================

document.addEventListener(
  "click",
  function(event) {

    const button =
      event.target.closest(
        ".copy-code"
      );


    if (!button) {
      return;
    }


    copyCode(button);

  }
);


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
    <span class="typing-dot">●</span>
    <span class="typing-dot">●</span>
    <span class="typing-dot">●</span>
  `;


  wrapper.appendChild(
    avatar
  );

  wrapper.appendChild(
    content
  );

  messagesContainer.appendChild(
    wrapper
  );


  scrollToBottom();


  return wrapper;
}


// ========================================
// SCROLL
// ========================================

function scrollToBottom() {

  messagesContainer.scrollTop =
    messagesContainer.scrollHeight;

}


// ========================================
// SEND MESSAGE
// ========================================

async function sendMessage() {

  const message =
    messageInput.value.trim();


  if (!message) {
    return;
  }


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

            message:
              message,

            history:
              conversationHistory

          })

        }
      );


    const data =
      await response.json();


    typingMessage.remove();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Something went wrong."
      );

    }


    const aiReply =
      data.reply;


    addMessage(
      aiReply,
      "ai"
    );


    // ------------------------------------
    // SAVE CONVERSATION
    // ------------------------------------

    conversationHistory.push({

      role:
        "user",

      text:
        message

    });


    conversationHistory.push({

      role:
        "model",

      text:
        aiReply

    });


  } catch (error) {

    console.error(
      "GlobalMedia AI Error:",
      error
    );


    typingMessage.remove();


    addMessage(
      "Sorry, I couldn't connect to GlobalMedia AI right now. Please try again.",
      "ai"
    );

  }


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
    sendMessage
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
// NEW CHAT
// ========================================

if (newChatButton) {

  newChatButton.addEventListener(
    "click",
    function() {

      conversationHistory =
        [];


      messagesContainer.innerHTML = `

        <div class="message ai-message">

          <div class="avatar">
            GM
          </div>

          <div class="message-content">

            Hello! 👋 I'm
            <strong>
              GlobalMedia AI
            </strong>.

            <br><br>

            How can I help you today?

          </div>

        </div>

      `;


      messageInput.value =
        "";

      messageInput.focus();

    }
  );

    }
