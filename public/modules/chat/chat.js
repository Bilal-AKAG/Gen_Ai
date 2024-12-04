import { initializeProfile } from "../profile/profile.js";
import { showChatScreen } from "../navigation/navigation.js";
import { simulateTyping } from "../streaming/stream.js";

export function initializeChatInterface() {
  showChatScreen();
  initializeProfile();
  loadChatHistory();
}

export async function loadChatHistory() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("/api/chat/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load chat history");
    }

    const history = await response.json();
    const chatMessages = document.getElementById("chat-messages");
    chatMessages.innerHTML = ""; // Clear existing messages

    history.forEach((msg) => {
      appendMessage(msg.content, msg.is_user, true);
    });
  } catch (error) {
    console.error("Error loading chat history:", error);
  }
}

export function appendMessage(content, isUser, isHistory = false) {
  const chatMessages = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;

  if (isUser || isHistory) {
    messageDiv.textContent = content;
    chatMessages.appendChild(messageDiv);
  } else {
    chatMessages.appendChild(messageDiv);
    simulateTyping(content, messageDiv);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

export async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to send messages");
    return;
  }

  try {
    appendMessage(message, true);
    input.value = "";

    const response = await fetch("/api/chat/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const data = await response.json();
    appendMessage(data.response, false);
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to send message");
  }
}
