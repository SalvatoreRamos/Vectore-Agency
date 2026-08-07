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

    // Services (Products with global scope)
    initServices();

    // Preloader
    initPreloader();
});

// ===================================
// Services (Global Products)
// ===================================
async function initServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    try {
        const res = await fetch('/api/products?scope=global');
        const data = await res.json();
        
        if (data.success && data.data && data.data.length > 0) {
            // Empty the grid (removes fallbacks)
            servicesGrid.innerHTML = '';
            
            data.data.forEach(product => {
                const currencySymbol = product.currency === 'USD' ? '$' : 'S/';
                
                const card = document.createElement('div');
                card.className = 'service-card';
                card.setAttribute('data-tilt', '');
                
                // Construct the features list
                let featuresHtml = '';
                if (product.features && product.features.length > 0) {
                    featuresHtml = product.features.map(f => `<li>${f}</li>`).join('');
                } else {
                    if (product.material) featuresHtml += `<li>${product.material}</li>`;
                    if (product.dimensions) featuresHtml += `<li>${product.dimensions}</li>`;
                    if (product.deliveryTime) featuresHtml += `<li>${product.deliveryTime}</li>`;
                }

                card.innerHTML = `
                    <div class="service-card__icon" style="font-size: 2rem; display: flex; align-items: center; justify-content: center;">
                        ${product.icon || '✨'}
                    </div>
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div style="margin-top: auto;">
                        <p style="font-weight: 600; color: var(--color-primary); font-size: 1.1rem; margin-top: 15px;">
                            ${product.unit && product.unit !== 'unidad' ? `${currencySymbol} ${product.price} / ${product.unit}` : `Desde ${currencySymbol} ${product.price}`}
                        </p>
                    </div>
                    <ul class="service-card__features">
                        ${featuresHtml}
                    </ul>
                `;
                
                servicesGrid.appendChild(card);
            });
            
            // Re-initialize tilt effect for new dynamically added cards if the function exists
            if (typeof VanillaTilt !== 'undefined') {
                VanillaTilt.init(document.querySelectorAll(".service-card[data-tilt]"), {
                    max: 5,
                    speed: 400,
                    glare: true,
                    "max-glare": 0.2,
                });
            }
        }
    } catch (err) {
        console.error('Failed to fetch services:', err);
        // Silently fail and leave the fallback HTML intact
    }
}

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
