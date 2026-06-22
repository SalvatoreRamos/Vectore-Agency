// ============================================
// VECTORE GLOBAL — App Entry Point (EN)
// Initializes all modules for the global site
// ============================================

import { initCursor } from '../components/cursor.js';
import { initScrollReveal, initCounters, initTiltEffect, initMagneticButtons, initParallaxOrbs, initSmoothScroll, initNavbarScroll, initMobileNav } from '../components/animations.js?v=22';
import { initSplineViewer } from '../components/spline-viewer.js';
import { initSmartForm } from '../components/forms.js';
import { initThemeToggle } from '../components/theme-toggle.js';

// ===================================
// Boot
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Core interactions
    initCursor();
    initThemeToggle();
    initNavbarScroll();
    initMobileNav();
    initSmoothScroll();

    // Animations
    initScrollReveal();
    initCounters();
    initTiltEffect();
    initMagneticButtons();
    initParallaxOrbs();

    // 3D
    initSplineViewer();

    // Forms
    initSmartForm();

    // Geo-detection banner (Cloudflare cf-ipcountry)
    initGeoBanner();

    // Portfolio scroll navigation
    initPortfolioScroll();

    // Preloader
    initPreloader();
});

// ===================================
// Preloader
// ===================================
function initPreloader() {
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => preloader.classList.add('hidden'), 600);
        }
    });
}

// ===================================
// Portfolio horizontal scroll nav
// ===================================
function initPortfolioScroll() {
    const track = document.querySelector('.portfolio-scroll__track');
    const prevBtn = document.getElementById('portfolioPrev');
    const nextBtn = document.getElementById('portfolioNext');

    if (!track) return;

    const scrollAmount = 500;

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
}

// ===================================
// Geo-detection Banner
// Shows a Peru site suggestion if Cloudflare detects PE country
// ===================================
function initGeoBanner() {
    const banner = document.getElementById('geoBanner');
    const closeBtn = document.getElementById('geoBannerClose');
    if (!banner) return;

    // Don't show if already dismissed this session
    if (sessionStorage.getItem('geo_banner_dismissed')) return;

    // Check server response for geo-detection header
    fetch(window.location.href, { method: 'HEAD' })
        .then(res => {
            const suggest = res.headers.get('X-Suggest-Locale');
            if (suggest === 'pe') {
                banner.style.display = 'flex';
                banner.classList.add('is-visible');
            }
        })
        .catch(() => { /* silent fail */ });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            banner.style.display = 'none';
            banner.classList.remove('is-visible');
            sessionStorage.setItem('geo_banner_dismissed', '1');
        });
    }
}
