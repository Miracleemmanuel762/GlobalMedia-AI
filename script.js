// ========================================
// GLOBALMEDIA AI
// GPT-STYLE RESPONSE + COPY CODE
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
// CONVERSATION MEMORY
// ========================================

let conversationHistory = [];


// ========================================
// FORMAT AI RESPONSE
// ========================================

function formatAIResponse(text) {

  let html = text;

  // Escape HTML first
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");


  // ======================================
  // CODE BLOCKS
  // ======================================

  html = html.replace(
    /```(\w+)?\n?([\s\S]*?)```/g,
    function(match, language, code) {

      const lang =
        language || "code";

      const cleanCode =
        code.trim();

      const encodedCode =
        encodeURIComponent(cleanCode);

      return `
        <div class="code-wrapper">

          <div class="code-header">

            <span class="code-language">
              ${lang}
            </span>

            <button
              class="copy-code"
              data-code="${encodedCode}"
              onclick="copyCode(this)"
            >
              Copy
            </button>

          </div>

          <pre class="ai-code"><code>${cleanCode}</code></pre>

        </div>
      `;
    }
  );


  // ======================================
  // INLINE CODE
  // ======================================

  html = html.replace(
    /`([^`]+)`/g,
    "<code class='inline-code'>$1</code>"
  );


  // ======================================
  // HEADINGS
  // ======================================

  html = html.replace(
    /^### (.*)$/gm,
    "<h4>$1</h4>"
  );

  html = html.replace(
    /^## (.*)$/gm,
    "<h3>$1</h3>"
  );

  html = html.replace(
    /^# (.*)$/gm,
    "<h2>$1</h2>"
  );


  // ======================================
  // BOLD
  // ======================================

  html = html.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );


  // ======================================
  // ITALIC
  // ======================================

  html = html.replace(
    /(?<!\*)\*([^*]+)\*(?!\*)/g,
    "<em>$1</em>"
  );


  // ======================================
  // BLOCKQUOTE
  // ======================================

  html = html.replace(
    /^>\s?(.*)$/gm,
    "<blockquote>$1</blockquote>"
  );


  // ======================================
  // NUMBERED LISTS
  // ======================================

  html = html.replace(
    /^\s*(\d+)\.\s+(.*)$/gm,
    `
      <div class="ai-list-item">
        <span class="list-number">$1.</span>
        <span>$2</span>
      </div>
    `
  );


  // ======================================
  // BULLET LISTS
  // ======================================

  html = html.replace(
    /^\s*[-•]\s+(.*)$/gm,
    `
      <div class="ai-list-item">
        <span class="list-bullet">•</span>
        <span>$1</span>
      </div>
    `
  );


  // ======================================
  // LINE BREAKS
  // ======================================

  html = html.replace(
    /\n\n/g,
    "<br><br>"
  );

  html = html.replace(
    /\n/g,
    "<br>"
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


  // ======================================
  // AVATAR
  // ======================================

  const avatar =
    document.createElement("div");

  avatar.className =
    "avatar";

  avatar.textContent =
    sender === "user"
      ? "You"
      : "GM";


  // ======================================
  // CONTENT
  // ======================================

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


  wrapper.appendChild(avatar);

  wrapper.appendChild(content);

  messagesContainer.appendChild(wrapper);

  scrollToBottom();


  return wrapper;
}


// ========================================
// COPY CODE
// ========================================

window.copyCode = async function(button) {

  try {

    const encoded =
      button.getAttribute("data-code");

    const code =
      decodeURIComponent(encoded);


    await navigator.clipboard.writeText(code);


    const originalText =
      button.textContent;


    button.textContent =
      "Copied ✓";


    setTimeout(() => {

      button.textContent =
        originalText;

    }, 2000);


  } catch (error) {

    console.error(
      "Copy failed:",
      error
    );

    button.textContent =
      "Failed";

  }

};


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


  messageInput.value = "";


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


    // Save conversation
    conversationHistory.push({

      role: "user",

      text:
        message

    });


    conversationHistory.push({

      role: "model",

      text:
        aiReply

    });


  } catch (error) {

    console.error(
      "GlobalMedia AI:",
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

      conversationHistory = [];


      messagesContainer.innerHTML = `

        <div class="message ai-message">

          <div class="avatar">
            GM
          </div>

          <div class="message-content">

            Hello! 👋 I'm
            <strong>GlobalMedia AI</strong>.

            <br><br>

            How can I help you today?

          </div>

        </div>

      `;


      messageInput.value = "";

      messageInput.focus();

    }
  );

}
