const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const newChatButton = document.getElementById("newChatButton");

let conversationHistory = [];


// ================================
// ADD MESSAGE TO CHAT
// ================================

function addMessage(text, sender) {
  const messageWrapper = document.createElement("div");

  messageWrapper.className =
    sender === "user"
      ? "message user-message"
      : "message ai-message";

  const avatar = document.createElement("div");

  avatar.className = "avatar";

  avatar.textContent =
    sender === "user"
      ? "You"
      : "GM";

  const content = document.createElement("div");

  content.className = "message-content";

  /*
    textContent prevents HTML entered by the user
    from being executed as code.
  */
  content.textContent = text;

  messageWrapper.appendChild(avatar);
  messageWrapper.appendChild(content);

  messagesContainer.appendChild(messageWrapper);

  scrollToBottom();

  return messageWrapper;
}


// ================================
// SHOW TYPING MESSAGE
// ================================

function showTyping() {
  const wrapper = document.createElement("div");

  wrapper.className = "message ai-message typing-message";

  const avatar = document.createElement("div");

  avatar.className = "avatar";
  avatar.textContent = "GM";

  const content = document.createElement("div");

  content.className = "message-content";
  content.textContent = "GlobalMedia AI is thinking...";

  wrapper.appendChild(avatar);
  wrapper.appendChild(content);

  messagesContainer.appendChild(wrapper);

  scrollToBottom();

  return wrapper;
}


// ================================
// SCROLL TO BOTTOM
// ================================

function scrollToBottom() {
  messagesContainer.scrollTop =
    messagesContainer.scrollHeight;
}


// ================================
// SEND MESSAGE
// ================================

async function sendMessage() {
  const message = messageInput.value.trim();

  if (!message) {
    return;
  }

  // Disable input while AI is responding
  messageInput.disabled = true;
  sendButton.disabled = true;

  // Display user's message
  addMessage(message, "user");

  // Clear input
  messageInput.value = "";

  // Show typing indicator
  const typingMessage = showTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message: message,
        history: conversationHistory
      })
    });

    const data = await response.json();

    // Remove typing indicator
    typingMessage.remove();

    if (!response.ok) {
      throw new Error(
        data.error || "Something went wrong."
      );
    }

    const aiReply = data.reply;

    // Display AI response
    addMessage(aiReply, "ai");

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
    console.error(error);

    typingMessage.remove();

    addMessage(
      "Sorry, I couldn't connect to Gemini right now. Please try again.",
      "ai"
    );
  }

  // Enable input again
  messageInput.disabled = false;
  sendButton.disabled = false;

  messageInput.focus();
}


// ================================
// SEND BUTTON
// ================================

if (sendButton) {
  sendButton.addEventListener("click", sendMessage);
}


// ================================
// ENTER KEY
// ================================

if (messageInput) {
  messageInput.addEventListener("keydown", function (event) {

    /*
      Enter = send
      Shift + Enter = new line
    */

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      sendMessage();
    }
  });
}


// ================================
// NEW CHAT
// ================================

if (newChatButton) {
  newChatButton.addEventListener("click", function () {

    conversationHistory = [];

    messagesContainer.innerHTML = `
      <div class="message ai-message">

        <div class="avatar">
          GM
        </div>

        <div class="message-content">
          Hello! I'm GlobalMedia AI. How can I help you today?
        </div>

      </div>
    `;

    messageInput.value = "";

    messageInput.focus();
  });
}
