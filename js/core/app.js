// ============================================
// VECTORE GLOBAL — App Entry Point
// Unified SPA architecture with room navigation
// ============================================

import { initCursor } from '../components/cursor.js';
import { initScrollReveal, initCounters, initTiltEffect, initMagneticButtons, initParallaxOrbs, initSmoothScroll, initNavbarScroll, initMobileNav, refreshAnimations } from '../components/animations.js?v=23';
import { initSplineViewer } from '../components/spline-viewer.js';
import { initSmartForm } from '../components/forms.js';
import { initThemeToggle } from '../components/theme-toggle.js';
import { initSPARouter } from '../components/spa-router.js';
import { initRoomContent } from '../components/room-content.js';

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

    // SPA Router — room navigation
    initSPARouter();

    // Room content lazy-loader
    initRoomContent();

    // Refresh animations when room content loads
    window.addEventListener('room:enter', () => {
        // Small delay to let DOM render
        setTimeout(() => {
            refreshAnimations();
        }, 100);
    });

    // Preloader
    initPreloader();

    // Logo click → back to lobby
    const navLogo = document.getElementById('navLogo');
    if (navLogo) {
        navLogo.addEventListener('click', (e) => {
            e.preventDefault();
            const backBtn = document.getElementById('backToLobby');
            if (backBtn && backBtn.style.display === 'flex') {
                backBtn.click();
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // SPA-aware internal link interception
    // Intercept clicks on <a href="/studio">, <a href="/wraps"> etc.
    // so they navigate via SPA router instead of full page reload
    const ROOM_PATHS = ['studio', 'wraps', 'software', 'visuals'];
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[href]');
        if (!anchor) return;

        const href = anchor.getAttribute('href');
        // Only intercept local paths (not external, mailto, tel, etc.)
        if (!href || !href.startsWith('/')) return;

        const path = href.slice(1).toLowerCase().split('?')[0].split('#')[0];

        if (path === '' || path === '/') {
            // Home/lobby link
            e.preventDefault();
            const backBtn = document.getElementById('backToLobby');
            if (backBtn && backBtn.style.display === 'flex') {
                backBtn.click();
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else if (ROOM_PATHS.includes(path)) {
            // Room link — find the lobby card and click it
            e.preventDefault();
            const card = document.querySelector(`.lobby__card[data-room="${path}"]`);
            if (card) {
                // If we're already in a room, go back first
                const backBtn = document.getElementById('backToLobby');
                if (backBtn && backBtn.style.display === 'flex') {
                    backBtn.click();
                    // Wait for transition then navigate
                    setTimeout(() => card.click(), 600);
                } else {
                    card.click();
                }
            }
        }
        // All other paths (external links, /terminos, etc.) pass through normally
    });

    // Forms
    initSmartForm();
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
