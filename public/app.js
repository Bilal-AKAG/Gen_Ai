import { handleAuth, handleLogout } from "./modules/auth/auth.js";
import { showAuthModal, closeModal } from "./modules/modal/modal.js";
import {
  initializeChatInterface,
  loadChatHistory,
  appendMessage,
  sendMessage,
} from "./modules/chat/chat.js";
import { showWelcomeScreen } from "./modules/navigation/navigation.js";

// Make functions available globally
window.handleAuth = handleAuth;
window.handleLogout = handleLogout;
window.showAuthModal = showAuthModal;
window.closeModal = closeModal;
window.sendMessage = sendMessage;

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  // Always show welcome screen first
  showWelcomeScreen();

  // Add Enter key event listener for chat input
  document.getElementById("user-input")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Add click event listener for modal close
  window.onclick = (event) => {
    const modal = document.getElementById("auth-modal");
    if (event.target === modal) {
      closeModal();
    }
  };
});
