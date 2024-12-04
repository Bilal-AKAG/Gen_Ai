import { clearErrors } from "../auth/auth.js";

// Modal functions
export function showAuthModal(type) {
  const modal = document.getElementById("auth-modal");
  const title = document.getElementById("modal-title");
  const switchText = document.getElementById("auth-switch");

  // Add fade out animation
  switchText.classList.add("fade-out");

  // Wait for fade out to complete before changing text
  setTimeout(() => {
    if (type === "login") {
      title.textContent = "Log In";
      switchText.innerHTML =
        'Don\'t have an account? <a href="#" onclick="showAuthModal(\'signup\')">Sign up</a>';
    } else {
      title.textContent = "Sign Up";
      switchText.innerHTML =
        'Already have an account? <a href="#" onclick="showAuthModal(\'login\')">Log in</a>';
    }

    // Remove fade out and trigger fade in
    switchText.classList.remove("fade-out");
  }, 300);

  modal.style.display = "block";
}

export function closeModal() {
  document.getElementById("auth-modal").style.display = "none";
  document.getElementById("auth-form").reset();
  clearErrors();
}

// Make functions globally available
window.showAuthModal = showAuthModal;
window.closeModal = closeModal;
