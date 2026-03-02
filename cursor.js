// ===================================
// Custom Cursor (Lightweight for Legal Pages)
// ===================================
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let targetX = mouseX;
let targetY = mouseY;

document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
});

function animateCursor() {
    const easing = 0.15;
    mouseX += (targetX - mouseX) * easing;
    mouseY += (targetY - mouseY) * easing;

    if (window.innerWidth >= 768) {
        if (cursor) cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        if (cursorDot) cursorDot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(animateCursor);
}

animateCursor();

// Hide default cursor on desktop
document.addEventListener('mousemove', () => {
    if (window.innerWidth >= 768) {
        document.body.style.cursor = 'none';
    }
});

// Hover effects
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .btn, input, select, textarea');
    if (target) {
        cursor.classList.add('active');
        cursorDot.classList.add('active');
    }
});

document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, .btn, input, select, textarea');
    if (target) {
        cursor.classList.remove('active');
        cursorDot.classList.remove('active');
    }
});
