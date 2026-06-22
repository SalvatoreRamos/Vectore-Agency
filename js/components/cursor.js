// ============================================
// VECTORE GLOBAL — Premium Custom Cursor
// Smooth ring + dot with hover state changes
// ============================================

export function initCursor() {
    // Only on desktop
    if (window.innerWidth < 1025) return;

    const ring = document.getElementById('cursorRing');
    const dot = document.getElementById('cursorDot');
    if (!ring || !dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    const easing = 0.15;

    // Track mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animation loop
    function animate() {
        // Ring follows with easing
        ringX += (mouseX - ringX) * easing;
        ringY += (mouseY - ringY) * easing;

        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        // Dot follows instantly
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

        requestAnimationFrame(animate);
    }

    animate();

    // Hover effects — event delegation for dynamic elements
    const interactiveSelector = 'a, button, .service-card, .case-card, .portfolio-scroll__item, .social-link, .form-option, .lang-switch__btn, .nav-link, .btn';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelector)) {
            ring.classList.add('active');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelector)) {
            ring.classList.remove('active');
        }
    });
}
