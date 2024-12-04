import { initializeChatInterface } from "../chat/chat.js";
import { closeModal } from "../modal/modal.js";
import { showWelcomeScreen } from "../navigation/navigation.js";

// Validation utilities
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  return password.length >= 6;
}

export function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

export function clearErrors() {
  document.querySelectorAll(".error-message").forEach((element) => {
    element.style.display = "none";
  });
}

// Authentication handlers
export async function handleAuth(event) {
  event.preventDefault();
  clearErrors();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validate inputs
  let isValid = true;

  if (!validateEmail(email)) {
    showError("email-error", "Please enter a valid email address");
    isValid = false;
  }

  if (!validatePassword(password)) {
    showError("password-error", "Password must be at least 6 characters long");
    isValid = false;
  }

  if (!isValid) return;

  const type = document
    .getElementById("modal-title")
    .textContent.toLowerCase()
    .includes("log in")
    ? "login"
    : "signup";

  try {
    const response = await fetch(`/api/auth/${type}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email);
      closeModal();
      initializeChatInterface();
    } else {
      showError("email-error", data.message);
    }
  } catch (error) {
    showError("email-error", "An error occurred. Please try again.");
  }
}

export function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  showWelcomeScreen();
}
