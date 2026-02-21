notifications_js = '''// NOTIFICATIONS JS - SadoMarket

// Go back function
function goBack() {
    window.history.back();
}

// Change sound
function changeSound(type) {
    const sounds = ['По умолчанию', 'Звук 1', 'Звук 2', 'Без звука'];
    const current = document.getElementById(type === 'message' ? 'msgSound' : 'orderSound').textContent;
    const currentIndex = sounds.indexOf(current);
    const nextIndex = (currentIndex + 1) % sounds.length;

    document.getElementById(type === 'message' ? 'msgSound' : 'orderSound').textContent = sounds[nextIndex];

    // Save to localStorage
    localStorage.setItem(type + 'Sound', sounds[nextIndex]);
}

// Reset notifications
function resetNotifications() {
    if (confirm('Сбросить все настройки уведомлений?')) {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = true);

        document.getElementById('msgSound').textContent = 'По умолчанию';
        document.getElementById('orderSound').textContent = 'По умолчанию';

        localStorage.clear();
        showToast('Настройки сброшены');
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 24px;
        font-size: 14px;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// Save settings on change
document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        // Load saved state
        const saved = localStorage.getItem(checkbox.id);
        if (saved !== null) {
            checkbox.checked = saved === 'true';
        }

        // Save on change
        checkbox.addEventListener('change', function() {
            localStorage.setItem(this.id, this.checked);
        });
    });

    // Load saved sounds
    const msgSound = localStorage.getItem('messageSound');
    const orderSound = localStorage.getItem('orderSound');
    if (msgSound) document.getElementById('msgSound').textContent = msgSound;
    if (orderSound) document.getElementById('orderSound').textContent = orderSound;
});
'''

print(notifications_js)
