const GEMINI_API_KEY = "AIzaSyAWu9Yvg9OuoIJDTB_0W_NAY_p8digHx1I";

async function sendMessage() {
  const input = document.getElementById("userInput");
  const userText = input.value.trim();
  if (!userText) return;

  // Show user messagev
  addMessage(userText, "user");
  input.value = "";

  // Show typing indicator
  addMessage("Thinking...", "bot", "typing");

  try {
    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AIzaSyCAJ7QW_tUktln2j3IDUpNMLr7jnEQBawA}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are RoadSoS emergency assistant. 
              Someone met with a road accident in India. 
              Give short, calm, step-by-step first aid 
              and emergency guidance. Keep response under 
              5 lines. User says: ${userText}`
            }]
          }]
        }),
      }
    );

    const data = await response.json();
    const botReply =
      data.candidates[0].content.parts[0].text;

    // Remove typing indicator and show real response
    document.getElementById("typing")?.remove();
    addMessage(botReply, "bot");

  } catch (error) {
    document.getElementById("typing")?.remove();
    addMessage(
      "Call 108 (Ambulance) or 100 (Police) immediately!",
      "bot"
    );
  }
}

function addMessage(text, sender, id = "") {
  const messages = document.getElementById("chatMessages");
  const div = document.createElement("div");
  div.className = sender === "user" ? "user-msg" : "bot-msg";
  div.textContent = text;
  if (id) div.id = id;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Send message on Enter key
document.getElementById("userInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendMessage();
  });