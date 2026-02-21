let currentUserId = null;
let socket = null;

// Register
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const res = await fetch("/auth/register", {
        method: "POST",
        body: formData
    });
    const data = await res.json();
    alert(data.message || data.detail);
});

// Login
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const username = formData.get("username");

    const res = await fetch("/auth/login", {
        method: "POST",
        body: formData
    });
    const data = await res.json();

    if (res.ok) {
        alert(data.message);
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("chat-container").style.display = "block";

        // Ҷустуҷӯи user_id
        const dbRes = await fetch("/chat/get_user_id?username=" + username);
        const dbData = await dbRes.json();
        currentUserId = dbData.user_id;

        initWebSocket(); // WebSocket оғоз мешавад
    } else {
        alert(data.detail);
    }
});

// WebSocket
function initWebSocket() {
    socket = new WebSocket(`ws://${window.location.host}/ws/chat`);

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const messages = data.messages;
        const ul = document.getElementById("messages");
        ul.innerHTML = "";
        messages.forEach(msg => {
            const li = document.createElement("li");
            li.textContent = `${msg.username}: ${msg.content}`;
            if (msg.user_id === currentUserId) li.classList.add("self");
            ul.appendChild(li);
        });
        // Scroll ба поён
        ul.scrollTop = ul.scrollHeight;
    };
}

// Send message
document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("message-input");
    const content = input.value;
    if (!content || !socket) return;

    socket.send(JSON.stringify({ user_id: currentUserId, content }));
    input.value = "";
});
