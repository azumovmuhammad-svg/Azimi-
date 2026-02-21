document.addEventListener("DOMContentLoaded", async () => {
    // ===== DOM Elements =====
    const chatInput = document.getElementById("chatInput");
    const micSendIcon = document.getElementById("micSendIcon");
    const chatMessages = document.getElementById("chatMessages");
    const headerUsername = document.getElementById("headerUsername");
    const headerAvatar = document.getElementById("headerAvatar");

    // ===== ID-ҳо аз HTML (server-side) =====
    // userId ва peerId дар chat.html муайян шудаанд

    console.log("Chat initialized:", { userId, peerId });

    // ===== WebSocket Connection =====
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/chat/ws/${userId}`);

    // ===== Load Peer Info =====
    async function loadPeerInfo() {
        try {
            const res = await fetch(`/chat/get_user?id=${peerId}`);
            if (!res.ok) throw new Error("Failed to load user");
            const data = await res.json();

            headerUsername.textContent = data.username || "Номаълум";
            headerAvatar.src = data.avatar ? data.avatar : "/static/default-avatar.png";
        } catch (err) {
            console.error("Load peer info error:", err);
            headerUsername.textContent = "Номаълум";
            headerAvatar.src = "/static/default-avatar.png";
        }
    }

    // ===== Load Messages =====
    async function loadMessages() {
        try {
            const res = await fetch(`/chat/messages?user1=${userId}&user2=${peerId}`);
            if (!res.ok) throw new Error("Failed to load messages");
            const data = await res.json();

            chatMessages.innerHTML = "";

            if (data.length === 0) {
                showEmptyState();
            } else {
                data.forEach(msg => appendMessage(msg));
            }

            scrollToBottom();
        } catch (err) {
            console.error("Load messages error:", err);
            chatMessages.innerHTML = "<div style='text-align:center; color:#999; padding:20px;'>Хатогӣ дар боргирӣ</div>";
        }
    }

    function showEmptyState() {
        chatMessages.innerHTML = `
            <div style="text-align:center; color:#999; padding:40px 20px;">
                <i class="fas fa-comments" style="font-size:48px; margin-bottom:10px; opacity:0.3;"></i>
                <p>Паёмҳо нестанд.<br>Аввалин шумо сӯҳбатро оғоз кунед!</p>
            </div>
        `;
    }

    function appendMessage(msg) {
        const isMe = msg.sender_id == userId;
        const msgDiv = document.createElement("div");

        msgDiv.className = `message ${isMe ? 'user' : 'other'}`;

        const time = msg.timestamp || formatTime(new Date());
        const checkmarks = isMe ? '<i class="fas fa-check-double" style="font-size:10px; margin-left:4px;"></i>' : '';

        // Агар овоз бошад (HTML audio tag)
        if (msg.content && msg.content.includes("<audio")) {
            msgDiv.innerHTML = `
                <div class="message-content">
                    ${msg.content}
                    <span class="time">${time} ${checkmarks}</span>
                </div>
            `;
        } else {
            // Паёми матнӣ
            msgDiv.innerHTML = `
                <div class="message-content">
                    <span class="text">${escapeHtml(msg.content)}</span>
                    <span class="time">${time} ${checkmarks}</span>
                </div>
            `;
        }

        chatMessages.appendChild(msgDiv);
    }

    function escapeHtml(text) {
        if (!text) return "";
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ===== Send Message =====
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        const timestamp = formatTime(new Date());

        // Намоиш дар UI (optimistic)
        appendMessage({
            sender_id: userId,
            content: text,
            timestamp: timestamp
        });

        scrollToBottom();

        // Пок кардани input
        chatInput.value = "";
        updateSendIcon();
        chatInput.focus();

        // Фиристодан ба сервер
        try {
            const formData = new FormData();
            formData.append("user_id", userId);
            formData.append("receiver_id", peerId);
            formData.append("content", text);

            const res = await fetch("/chat/send", {
                method: "POST",
                credentials: "include",
                body: formData
            });

            if (!res.ok) throw new Error("Send failed");

            // WebSocket барои real-time
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    sender_id: parseInt(userId),
                    receiver_id: parseInt(peerId),
                    content: text,
                    timestamp: timestamp
                }));
            }
        } catch (err) {
            console.error("Send error:", err);
            // Нишон додани хатогӣ
            const lastMsg = chatMessages.lastElementChild;
            if (lastMsg) {
                lastMsg.style.opacity = "0.5";
                lastMsg.title = "Фиристода нашуд";
            }
        }
    }

    // ===== Event Listeners =====
    function updateSendIcon() {
        const hasText = chatInput.value.trim().length > 0;
        micSendIcon.className = hasText ? "fas fa-paper-plane" : "fas fa-microphone";
    }

    chatInput.addEventListener("input", updateSendIcon);

    chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    micSendIcon.addEventListener("click", () => {
        if (chatInput.value.trim()) {
            sendMessage();
        } else {
            // Овоз сабт кардан (агар лозим бошад)
            console.log("Voice recording started...");
            // recordVoice();
        }
    });

    // ===== WebSocket Handlers =====
    ws.onopen = () => {
        console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log("📩 WS received:", data);

            // Танҳо агар паём аз ҳамсуҳбат бошад
            if (data.sender_id == peerId && data.receiver_id == userId) {
                appendMessage(data);
                scrollToBottom();

                // Notification (агар саҳифа фокус надошта бошад)
                if (!document.hidden) {
                    // Play sound ё notification
                }
            }
        } catch (err) {
            console.error("WS message error:", err);
        }
    };

    ws.onclose = () => {
        console.log("❌ WebSocket disconnected");
        // Метавонед кӯшиши пайвастшавии дубора кунед
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
    };

    // ===== Initialize =====
    await loadPeerInfo();
    await loadMessages();
    chatInput.focus();
});

