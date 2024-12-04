export function simulateTyping(text, element, speed = 30) {
  let index = 0;
  element.textContent = "";

  // Add typing indicator
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "typing-indicator";
  typingIndicator.innerHTML = "<span></span><span></span><span></span>";
  element.appendChild(typingIndicator);

  return new Promise((resolve) => {
    function type() {
      if (index === 0) {
        // Remove typing indicator when starting to type
        element.removeChild(typingIndicator);
      }

      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }

    // Start typing after a brief delay
    setTimeout(type, 1000);
  });
}
