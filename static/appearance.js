// APPEARANCE JS - SadoMarket

// Go back function
function goBack() {
    window.history.back();
}

// Select color
function selectColor() {
    const colors = ['#ff5722', '#2196f3', '#4caf50', '#9c27b0', '#f44336', '#ffc107'];
    const current = document.getElementById('accentColor').style.background;
    let currentIndex = 0;

    colors.forEach((color, index) => {
        if (current.includes(color)) currentIndex = index;
    });

    const nextIndex = (currentIndex + 1) % colors.length;
    const newColor = colors[nextIndex];

    document.getElementById('accentColor').style.background = newColor;
    document.querySelector('.preview-price').style.color = newColor;

    // Update active icon color
    document.querySelector('.icon.active').style.background = newColor;

    localStorage.setItem('accentColor', newColor);
    showToast('Цвет изменен');
}

// Set grid view
function setGrid(type) {
    const icons = document.querySelectorAll('.icon');
    icons.forEach(icon => icon.classList.remove('active'));

    icons[type - 1].classList.add('active');

    const color = document.getElementById('accentColor').style.background || '#6fa8ff';
    icons[type - 1].style.background = color;
    icons[type - 1].style.color = '#0b1625';

    // Reset other icons
    icons.forEach((icon, index) => {
        if (index !== type - 1) {
            icon.style.background = 'rgba(255,255,255,0.05)';
            icon.style.color = '#90a4ae';
        }
    });

    localStorage.setItem('gridView', type);
    showToast('Вид изменен');
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
    // Load saved color
    const savedColor = localStorage.getItem('accentColor');
    if (savedColor) {
        document.getElementById('accentColor').style.background = savedColor;
        document.querySelector('.preview-price').style.color = savedColor;
    }

    // Load saved grid
    const savedGrid = localStorage.getItem('gridView');
    if (savedGrid) {
        setGrid(parseInt(savedGrid));
    }

    // Text size slider
    const textSize = document.getElementById('textSize');
    const savedTextSize = localStorage.getItem('textSize');
    if (savedTextSize) {
        textSize.value = savedTextSize;
        updateTextSize(savedTextSize);
    }

    textSize.addEventListener('input', function() {
        localStorage.setItem('textSize', this.value);
        updateTextSize(this.value);
    });

    // Checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        const saved = localStorage.getItem(checkbox.id);
        if (saved !== null) {
            checkbox.checked = saved === 'true';
        }

        checkbox.addEventListener('change', function() {
            localStorage.setItem(this.id, this.checked);
        });
    });
});

// Update text size
function updateTextSize(size) {
    document.querySelector('.preview-title').style.fontSize = size + 'px';
}
