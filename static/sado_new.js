// ===== SADO AI - Real AI Integration =====
// Файл: sado_new.js

const API_BASE_URL = "/sado";  // ё URL-и сервери шумо

// ===== Элементҳо =====
const chatBody = document.getElementById("chatBody");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");

// User ID аз localStorage ё сервер
const userId = parseInt(localStorage.getItem("user_id")) || Math.floor(Math.random() * 10000);
localStorage.setItem("user_id", userId);

// ===== ИНИЦИАЛИЗАТСИЯ =====
document.addEventListener("DOMContentLoaded", () => {
    loadChatHistory();
    setupEventListeners();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Enter тугма
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Click тугма
    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
    }
}

// ===== ФИРИСТОДАНИ ПАЁМ =====
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    // Нишон додани паёми корбар
    addMessage(text, "user");
    messageInput.value = "";

    // Нишон додани "Sado AI дар ҳоли навиштан..."
    showTypingIndicator();

    try {
        // Фиристодан ба сервер
        const response = await fetch(`${API_BASE_URL}/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId,
                message: text
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Пинҳон кардани typing indicator
        hideTypingIndicator();

        // Нишон додани ҷавоб бо эффекти typing
        if (data.reply) {
            typingEffect(data.reply, "ai");
        } else {
            addMessage("Бубахшед, хатогӣ рӯй дод.", "ai");
        }

    } catch (error) {
        console.error("Error:", error);
        hideTypingIndicator();
        addMessage("Бубахшед, сервер дастрас нест. Лутфан боз кӯшиш кунед.", "ai");
    }
}

// ===== ИЛОВАИ ПАЁМ БА ЧАТ =====
function addMessage(text, role) {
    const div = document.createElement("div");
    div.className = `message ${role}`;

    // Агар матн HTML дошта бошад (тасвирҳо), иҷозат диҳ
    if (text.includes("<img") || text.includes("<a")) {
        div.innerHTML = text;
    } else {
        div.textContent = text;
    }

    // Вақт
    const time = document.createElement("div");
    time.className = "message-time";
    time.textContent = new Date().toLocaleTimeString("tg-TJ", {
        hour: "2-digit",
        minute: "2-digit"
    });
    time.style.cssText = "font-size: 11px; opacity: 0.7; margin-top: 4px; text-align: right;";
    div.appendChild(time);

    chatBody.appendChild(div);
    scrollToBottom();
}

// ===== ЭФФЕКТИ TYPING =====
function typingEffect(text, role) {
    const div = document.createElement("div");
    div.className = `message ${role}`;
    chatBody.appendChild(div);

    let i = 0;
    const speed = 15; // Миллисония

    function type() {
        if (i < text.length) {
            div.textContent += text.charAt(i);
            i++;
            scrollToBottom();
            setTimeout(type, speed);
        } else {
            // Иловаи вақт ба охир
            const time = document.createElement("div");
            time.className = "message-time";
            time.textContent = new Date().toLocaleTimeString("tg-TJ", {
                hour: "2-digit",
                minute: "2-digit"
            });
            time.style.cssText = "font-size: 11px; opacity: 0.7; margin-top: 4px; text-align: right;";
            div.appendChild(time);
        }
    }

    type();
}

// ===== TYPING INDICATOR =====
function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = "flex";
        scrollToBottom();
    }
}

function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = "none";
    }
}

// ===== ЛОД КАРДАНИ ТАЪРИХ =====
async function loadChatHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/history?user_id=${userId}`);
        const data = await response.json();

        if (data.history && data.history.length > 0) {
            chatBody.innerHTML = ""; // Пок кардани паёми default

            data.history.forEach(msg => {
                addMessage(msg.message, msg.role === "sado" ? "ai" : "user");
            });
        }
    } catch (error) {
        console.error("Error loading history:", error);
    }
}

// ===== ПОК КАРДАНИ ТАЪРИХ =====
async function clearHistory() {
    try {
        const response = await fetch(`${API_BASE_URL}/clear-history?user_id=${userId}`, {
            method: "POST"
        });

        if (response.ok) {
            chatBody.innerHTML = `
                <div class="message ai">
                    Салом! Ман Sado AI ҳастам. Чӣ кӯмак кунам?
                    <div class="message-time" style="font-size: 11px; opacity: 0.7; margin-top: 4px; text-align: right;">
                        ${new Date().toLocaleTimeString("tg-TJ", {hour: "2-digit", minute: "2-digit"})}
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error clearing history:", error);
    }
}

// ===== ЁРИИ СКРОЛЛ =====
function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
}

// ===== ГЕНЕРАТСИЯИ ТАСВИР (Агар лозим бошад) =====
async function generateImage(description) {
    try {
        const response = await fetch(`${API_BASE_URL}/generate-image`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId,
                description: description
            })
        });

        const data = await response.json();

        if (data.image_url) {
            const imgHTML = `
                <div style="margin-top: 8px;">
                    <img src="${data.image_url}" style="max-width: 100%; border-radius: 8px;" alt="Generated">
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">${data.description}</div>
                </div>
            `;
            addMessage(imgHTML, "ai");
        }
    } catch (error) {
        console.error("Error generating image:", error);
    }
}

// ===== ПЕШНИҲОДҲОИ ЗЕРИ ИНПУТ =====
const suggestions = [
    "Мошинҳои истифодашуда",
    "iPhone 15 Pro нарх",
    "Хонаи фурӯшӣ дар Душанбе",
    "Samsung Galaxy S24",
    "Мошини арзон"
];

function showSuggestions() {
    const container = document.getElementById("suggestions");
    if (!container) return;

    container.innerHTML = "";
    suggestions.forEach(text => {
        const btn = document.createElement("button");
        btn.className = "suggestion-btn";
        btn.textContent = text;
        btn.onclick = () => {
            messageInput.value = text;
            sendMessage();
        };
        container.appendChild(btn);
    });
}

// Нишон додани пешниҳодҳо дар оғоз
showSuggestions();


