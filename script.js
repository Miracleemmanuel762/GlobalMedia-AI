const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const newChat = document.getElementById("newChat");

function addMessage(text, type) {
    const message = document.createElement("div");
    message.className = "message";

    const avatar = document.createElement("div");
    avatar.className =
        "avatar " + (type === "user" ? "user-avatar" : "ai-avatar");
    avatar.textContent = type === "user" ? "YOU" : "GM";

    const content = document.createElement("div");
    content.className = "message-content";
    content.textContent = text;

    message.appendChild(avatar);
    message.appendChild(content);
    messages.appendChild(message);

    messages.scrollTop = messages.scrollHeight;
}

async function sendMessage() {
    const text = input.value.trim();

    if (!text) {
        return;
    }

    addMessage(text, "user");
    input.value = "";

    /*
       Gemini connection will be added
       in the next step.
    */

    addMessage(
        "I'm getting ready to connect to Gemini...",
        "ai"
    );
}

sendButton.addEventListener("click", sendMessage);

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

newChat.addEventListener("click", function() {
    messages.innerHTML = "";

    const welcome = document.createElement("div");
    welcome.className = "welcome";

    welcome.innerHTML = `
        <div class="welcome-icon">GM</div>
        <h2>Welcome to GlobalMedia AI</h2>
        <p>Start a new conversation with GlobalMedia AI.</p>
    `;

    messages.appendChild(welcome);
});
