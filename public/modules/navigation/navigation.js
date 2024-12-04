export function showWelcomeScreen() {
  document.getElementById("welcome-screen").classList.add("active");
  document.getElementById("chat-screen").classList.remove("active");

  // Remove the profile UI when showing welcome screen
  const profileUI = document.querySelector(".user-profile");
  if (profileUI) {
    profileUI.remove();
  }
}

export function showChatScreen() {
  document.getElementById("welcome-screen").classList.remove("active");
  document.getElementById("chat-screen").classList.add("active");
}
