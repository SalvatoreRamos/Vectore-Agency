// ============================================
// VECTORE GLOBAL — Animations Module
// Scroll reveals, counters, tilt, magnetic buttons,
// parallax orbs
// ============================================

/**
 * Initialize scroll reveal with IntersectionObserver
 */
export function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal--scale, .reveal--blur, .reveal-stagger');

    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

/**
 * Animated counters
 */
export function initCounters() {
    const counters = document.querySelectorAll('[data-count-target]');

    const countUp = (el) => {
        const target = parseInt(el.getAttribute('data-count-target'), 10);
        const suffix = el.getAttribute('data-count-suffix') || '+';
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out quart for natural deceleration
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(eased * target);

            el.textContent = current + (progress >= 1 ? suffix : '');

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                countUp(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

/**
 * 3D Tilt effect on cards (premium smooth with rAF interpolation)
 */
export function initTiltEffect() {
    if (window.innerWidth < 1025) return;

    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        let targetRotX = 0;
        let targetRotY = 0;
        let currentRotX = 0;
        let currentRotY = 0;
        let animating = false;

        // Smooth interpolation (lerp)
        const ease = 0.08;
        const maxTilt = 8;

        function lerp(start, end, factor) {
            return start + (end - start) * factor;
        }

        function animate() {
            currentRotX = lerp(currentRotX, targetRotX, ease);
            currentRotY = lerp(currentRotY, targetRotY, ease);

            card.style.transform = `perspective(1000px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) scale3d(1.02, 1.02, 1.02)`;

            // Stop animation when close enough to target
            if (Math.abs(currentRotX - targetRotX) > 0.01 || Math.abs(currentRotY - targetRotY) > 0.01) {
                requestAnimationFrame(animate);
            } else {
                animating = false;
            }
        }

        function startAnimating() {
            if (!animating) {
                animating = true;
                requestAnimationFrame(animate);
            }
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            targetRotX = (0.5 - y) * maxTilt;
            targetRotY = (x - 0.5) * maxTilt;

            startAnimating();
        });

        card.addEventListener('mouseleave', () => {
            targetRotX = 0;
            targetRotY = 0;
            startAnimating();
        });
    });
}

/**
 * Magnetic pull on buttons
 */
export function initMagneticButtons() {
    if (window.innerWidth < 1025) return;

    const btns = document.querySelectorAll('.btn, .social-link, .portfolio-nav__btn');

    btns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

/**
 * Parallax effect on ambient orbs
 */
export function initParallaxOrbs() {
    if (window.innerWidth < 768) return;

    const orbs = document.querySelectorAll('.hero__orb');
    if (orbs.length === 0) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const factors = [
        { x: 0.02, y: 0.02 },
        { x: -0.03, y: 0.015 },
        { x: 0.015, y: -0.025 },
    ];

    function animate() {
        orbs.forEach((orb, i) => {
            const factor = factors[i] || { x: 0.01, y: 0.01 };
            const offsetX = (window.innerWidth / 2 - mouseX) * factor.x;
            const offsetY = (window.innerHeight / 2 - mouseY) * factor.y;
            orb.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/**
 * Smooth scroll for anchor links
 */
export function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/**
 * Navbar scroll effect
 */
export function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    function check() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', check, { passive: true });
    check();
}

/**
 * Mobile nav toggle
 */
export function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    const overlay = document.getElementById('navOverlay');
    const closeBtn = document.getElementById('navMenuClose');

    if (!toggle || !menu || !overlay) return;

    function closeMenu() {
        toggle.classList.remove('active');
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function openMenu() {
        if (menu.classList.contains('active')) return;
        
        // Push state BEFORE updating UI to ensure back button works
        try {
            if (!history.state || history.state.menuOpen !== true) {
                history.pushState({ menuOpen: true }, '');
            }
        } catch (e) {
            console.warn('History API not supported or blocked');
        }

        toggle.classList.add('active');
        menu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    toggle.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        if (menu.classList.contains('active')) {
            history.back();
        } else {
            openMenu();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            if (e) e.preventDefault();
            // If we have a menu state, go back. Otherwise just close.
            if (history.state && history.state.menuOpen === true) {
                history.back();
            } else {
                closeMenu();
            }
        });
    }

    overlay.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        if (history.state && history.state.menuOpen === true) {
            history.back();
        } else {
            closeMenu();
        }
    });

    // Close on link click
    menu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
            // Try to pop the history state silently
            if (history.state && history.state.menuOpen === true) {
                history.back();
            }
        });
    });

    // Handle back button
    window.addEventListener('popstate', (event) => {
        // ALWAYS close menu on popstate if it's active, regardless of state content
        if (menu.classList.contains('active')) {
            closeMenu();
        }
    });
}
