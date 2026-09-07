// ========================================
// GLOBALMEDIA AI
// Frontend Chat System
// ========================================


// ========================================
// DEVELOPER INFORMATION
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
// MARKDOWN FORMATTER
// ========================================

function formatAIResponse(text) {

  let safeText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");


  // Code blocks
  safeText = safeText.replace(
    /```([\s\S]*?)```/g,
    function(match, code) {

      return `
        <pre class="ai-code">
          <code>${code.trim()}</code>
        </pre>
      `;
    }
  );


  // Bold
  safeText = safeText.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );


  // Italic
  safeText = safeText.replace(
    /(?<!\*)\*([^*]+)\*(?!\*)/g,
    "<em>$1</em>"
  );


  // Headings
  safeText = safeText.replace(
    /^### (.*)$/gm,
    "<h4>$1</h4>"
  );

  safeText = safeText.replace(
    /^## (.*)$/gm,
    "<h3>$1</h3>"
  );

  safeText = safeText.replace(
    /^# (.*)$/gm,
    "<h2>$1</h2>"
  );


  // Numbered lists
  safeText = safeText.replace(
    /^\s*(\d+)\.\s+(.*)$/gm,
    "<div class='ai-list-item'><strong>$1.</strong> $2</div>"
  );


  // Bullet lists
  safeText = safeText.replace(
    /^\s*[-•]\s+(.*)$/gm,
    "<div class='ai-list-item'>• $1</div>"
  );


  // Line breaks
  safeText = safeText.replace(
    /\n\n/g,
    "<br><br>"
  );

  safeText = safeText.replace(
    /\n/g,
    "<br>"
  );


  return safeText;
}


// ========================================
// ADD MESSAGE
// ========================================

function addMessage(text, sender) {

  const messageWrapper =
    document.createElement("div");

  messageWrapper.className =
    sender === "user"
      ? "message user-message"
      : "message ai-message";


  // ======================================
  // AVATAR
  // ======================================

  const avatar =
    document.createElement("div");

  avatar.className = "avatar";


  if (sender === "user") {

    avatar.textContent = "You";

  } else {

    avatar.textContent = "GM";

  }


  // ======================================
  // MESSAGE CONTENT
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


  messageWrapper.appendChild(avatar);

  messageWrapper.appendChild(content);

  messagesContainer.appendChild(
    messageWrapper
  );


  scrollToBottom();

  return messageWrapper;
}


// ========================================
// ADD DEVELOPER CARD
// ========================================

function addDeveloperCard() {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "developer-card";


  wrapper.innerHTML = `

    <img
      src="${DEVELOPER_IMAGE}"
      alt="${DEVELOPER_NAME}"
      class="developer-image"
    >

    <div class="developer-info">

      <strong>
        ${DEVELOPER_NAME}
      </strong>

      <span>
        Developer of GlobalMedia AI
      </span>

      <small>
        GlobalMedia Development
      </small>

    </div>

  `;


  messagesContainer.appendChild(wrapper);

  scrollToBottom();
}


// ========================================
// TYPING INDICATOR
// ========================================

function showTyping() {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "message ai-message typing-message";


  const avatar =
    document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent = "GM";


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


  // Disable controls
  messageInput.disabled = true;

  sendButton.disabled = true;


  // Show user message
  addMessage(
    message,
    "user"
  );


  // Clear input
  messageInput.value = "";


  // Show typing
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


    const data =
      await response.json();


    // Remove typing
    typingMessage.remove();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "Something went wrong."
      );

    }


    const aiReply =
      data.reply;


    // Display response
    addMessage(
      aiReply,
      "ai"
    );


    // Save conversation
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


    typingMessage.remove();


    addMessage(
      "I'm sorry, I couldn't connect to the AI service right now. Please try again.",
      "ai"
    );

  }


  // Re-enable controls
  messageInput.disabled = false;

  sendButton.disabled = false;

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
