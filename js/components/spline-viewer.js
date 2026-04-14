// ============================================
// VECTORE GLOBAL — Spline 3D Viewer Integration
// Lazy loads Spline runtime, with CSS fallback
// ============================================

/**
 * Initialize the Spline 3D viewer in the hero section.
 * If no Spline URL is provided, shows a glassmorphism fallback
 * with animated logo.
 */
export function initSplineViewer() {
    const container = document.getElementById('splineContainer');
    if (!container) return;

    const splineUrl = container.getAttribute('data-spline-url');

    if (!splineUrl) {
        // Show fallback (already in HTML)
        return;
    }

    // Lazy load with IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadSpline(container, splineUrl);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(container);
}

async function loadSpline(container, url) {
    try {
        // Check if it's an embed URL (iframe) or runtime URL (.splinecode)
        if (url.includes('spline.design') && url.includes('/embed/')) {
            // Use iframe embed
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.cssText = 'width: 100%; height: 100%; border: none; border-radius: inherit;';
            iframe.loading = 'lazy';
            iframe.title = 'Vectore 3D Logo';
            iframe.setAttribute('allow', 'autoplay');

            // Remove fallback and append iframe
            const fallback = container.querySelector('.hero__spline-fallback');
            if (fallback) fallback.style.display = 'none';

            container.appendChild(iframe);
        } else if (url.endsWith('.splinecode')) {
            // Use Spline Runtime
            const { Application } = await import('https://unpkg.com/@splinetool/runtime@latest/build/runtime.js');

            const canvas = document.createElement('canvas');
            canvas.style.cssText = 'width: 100%; height: 100%; border-radius: inherit;';
            canvas.id = 'splineCanvas';

            const fallback = container.querySelector('.hero__spline-fallback');
            if (fallback) fallback.style.display = 'none';

            container.appendChild(canvas);

            const app = new Application(canvas);
            await app.load(url);

            // Track 3D interactions for analytics
            canvas.addEventListener('mousedown', () => {
                if (typeof gtag === 'function') {
                    gtag('event', 'spline_interaction', {
                        event_category: '3D',
                        event_label: 'logo_click'
                    });
                }
            });
        }
    } catch (error) {
        console.warn('Spline failed to load, keeping fallback:', error);
    }
}
