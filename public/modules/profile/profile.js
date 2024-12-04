export function initializeProfile() {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) return;

  const profileHtml = `
        <div class="user-profile">
            <div class="profile-circle">${userEmail[0].toUpperCase()}</div>
            <div class="profile-popup">
                <div class="email">${userEmail}</div>
                <button class="logout-btn" onclick="handleLogout()">Log Out</button>
            </div>
        </div>
    `;

  const profileContainer = document.createElement("div");
  profileContainer.innerHTML = profileHtml;
  document.body.appendChild(profileContainer);

  setupProfileListeners();
}

function setupProfileListeners() {
  const profileCircle = document.querySelector(".profile-circle");
  const profilePopup = document.querySelector(".profile-popup");

  profileCircle.addEventListener("click", () => {
    profilePopup.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-profile")) {
      profilePopup.classList.remove("active");
    }
  });
}
