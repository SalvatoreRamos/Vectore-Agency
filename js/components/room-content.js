// ============================================
// VECTORE SPA — Room Content Loader
// Lazy-loads data and renders UI for each room
// when entered for the first time
// ============================================

const roomInitialized = { studio: false, wraps: false, software: false, visuals: false };

// API helper
function apiUrl(path) {
    const port = window.location.port ? `:${window.location.port}` : '';
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const base = isLocal ? `http://${window.location.hostname}${port}/api` : '/api';
    return `${base}${path}`;
}

async function apiFetch(path) {
    const res = await fetch(apiUrl(path));
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'API error');
    return data.data;
}

// ===================================
// Room Content Initializer
// ===================================
export function initRoomContent() {
    // Listen for room:enter events from the SPA router
    window.addEventListener('room:enter', (e) => {
        const { roomId } = e.detail;
        loadRoomContent(roomId);
    });
}

async function loadRoomContent(roomId) {
    if (roomInitialized[roomId]) return;
    roomInitialized[roomId] = true;

    try {
        switch (roomId) {
            case 'studio':
                await loadStudioProducts();
                break;
            case 'wraps':
                await loadWrapsGallery();
                break;
            case 'software':
                await loadSoftwareShowcase();
                break;
            case 'visuals':
                await loadVisualsPortfolio();
                break;
        }
    } catch (error) {
        console.error(`Error loading room ${roomId}:`, error);
    }
}

// ===================================
// Room 1: Vectore Studio — Products
// Categories: diseno, impresion, packaging, digital, espacios
// ===================================
const STUDIO_CATEGORIES = ['diseno', 'impresion', 'packaging', 'digital', 'espacios'];
const CATEGORY_LABELS = {
    all: 'Todos',
    diseno: 'Diseño',
    impresion: 'Impresión',
    packaging: 'Packaging',
    digital: 'Digital',
    espacios: 'Espacios'
};

async function loadStudioProducts() {
    const container = document.getElementById('studioCatalog');
    const filtersContainer = document.getElementById('studioFilters');
    if (!container) return;

    let products = [];
    try {
        const allProducts = await apiFetch('/products');
        products = (allProducts || []).filter(p => STUDIO_CATEGORIES.includes(p.category));
    } catch (e) {
        console.warn('Could not load products:', e);
    }

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-tertiary); grid-column: 1/-1;">No products available at this time.</p>';
        return;
    }

    // Render filter buttons
    if (filtersContainer) {
        filtersContainer.innerHTML = `
            <button class="catalog-filter-btn active" data-filter="all">Todos</button>
            ${STUDIO_CATEGORIES
                .filter(cat => products.some(p => p.category === cat))
                .map(cat => `<button class="catalog-filter-btn" data-filter="${cat}">${CATEGORY_LABELS[cat] || cat}</button>`)
                .join('')}
        `;

        filtersContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.catalog-filter-btn');
            if (!btn) return;
            const filter = btn.dataset.filter;

            filtersContainer.querySelectorAll('.catalog-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            container.querySelectorAll('.product-card').forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
            });
        });
    }

    // Render product cards
    container.innerHTML = products.map(p => {
        const img = p.images?.[0]?.url || p.primaryImage || '/favicon.png';
        const price = p.price ? `S/ ${p.price.toFixed(2)}` : 'Consultar';
        return `
            <div class="product-card" data-category="${p.category}" data-tilt>
                <img class="product-card__image" src="${img}" alt="${p.name}" loading="lazy">
                <div class="product-card__body">
                    <div class="product-card__category">${CATEGORY_LABELS[p.category] || p.category}</div>
                    <h3 class="product-card__name">${p.name}</h3>
                    <div class="product-card__price">${price}</div>
                    <div class="product-card__actions">
                        <button class="btn btn--primary btn--sm btn-add-cart" data-product-id="${p._id}" data-product-name="${p.name}" data-product-price="${p.price || 0}" data-product-image="${img}">
                            Add to Cart
                        </button>
                        <a href="https://wa.me/51950699910?text=${encodeURIComponent('Hola, me interesa: ' + p.name)}" target="_blank" class="btn btn--ghost btn--sm" rel="noopener">
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===================================
// Room 2: Vectore Wraps — Gallery
// Categories: vinilo, senalizacion
// ===================================
async function loadWrapsGallery() {
    const container = document.getElementById('wrapsGallery');
    if (!container) return;

    // Load products for wraps categories
    let wrapProducts = [];
    try {
        const allProducts = await apiFetch('/products');
        wrapProducts = (allProducts || []).filter(p => ['vinilo', 'senalizacion'].includes(p.category));
    } catch (e) {
        console.warn('Could not load wrap products:', e);
    }

    // Load projects for gallery
    let projects = [];
    try {
        const allProjects = await apiFetch('/projects');
        projects = (allProjects || []).filter(p =>
            p.category?.toLowerCase().includes('wrap') ||
            p.category?.toLowerCase().includes('vinyl') ||
            p.category?.toLowerCase().includes('vinilo') ||
            p.category?.toLowerCase().includes('vehicle') ||
            p.tags?.some(t => ['wrap', 'vinyl', 'vinilo', 'vehicle', 'fleet', 'senalizacion', 'signage'].includes(t.toLowerCase()))
        );
    } catch (e) {
        console.warn('Could not load projects:', e);
    }

    let html = '';

    // Render project gallery
    if (projects.length > 0) {
        html += projects.map(p => {
            const isVideo = p.thumbnail && (p.thumbnail.match(/\.(mp4|webm|ogg|mov)$/i) || p.thumbnail.includes('/video/upload/'));
            const media = isVideo
                ? `<video class="wraps-card__image" src="${p.thumbnail}" autoplay loop muted playsinline></video>`
                : `<img class="wraps-card__image" src="${p.thumbnail}" alt="${p.title}" loading="lazy">`;
            return `
                <div class="wraps-card">
                    ${media}
                    <div class="wraps-card__overlay">
                        <h3 class="wraps-card__title">${p.title}</h3>
                        <span class="wraps-card__client">${p.client || p.category}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render wrap products as cards
    if (wrapProducts.length > 0) {
        html += wrapProducts.map(p => {
            const img = p.images?.[0]?.url || p.primaryImage || '/favicon.png';
            return `
                <div class="wraps-card">
                    <img class="wraps-card__image" src="${img}" alt="${p.name}" loading="lazy">
                    <div class="wraps-card__overlay">
                        <h3 class="wraps-card__title">${p.name}</h3>
                        <span class="wraps-card__client">${p.category === 'vinilo' ? 'Vinyl Wrapping' : 'Signage'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (!html) {
        html = '<p style="text-align:center; color: var(--text-tertiary); grid-column: 1/-1;">Gallery coming soon. Contact us for vehicle wrap projects.</p>';
    }

    container.innerHTML = html;
}

// ===================================
// Room 3: Vectore Software — Showcase
// ===================================
async function loadSoftwareShowcase() {
    const container = document.getElementById('softwareShowcase');
    if (!container) return;

    let assets = [];
    try {
        assets = await apiFetch('/software');
    } catch (e) {
        console.warn('Could not load software assets:', e);
    }

    // Static feature cards (always show)
    const features = [
        { icon: '📋', title: 'Order Management', desc: 'End-to-end order tracking from quote to delivery. Real-time status updates and automated notifications.' },
        { icon: '🔄', title: 'Production Sync', desc: 'Real-time synchronization across all devices. Kanban boards for visual workflow management.' },
        { icon: '📱', title: 'Installer App', desc: 'Dedicated mobile app for field installers. GPS tracking, photo documentation, and sign-off.' },
        { icon: '📊', title: 'Analytics Dashboard', desc: 'Revenue insights, production metrics, and client retention data. PDF exports for stakeholders.' }
    ];

    container.innerHTML = features.map(f => `
        <div class="software-feature-card" data-tilt>
            <div class="software-feature-card__icon">${f.icon}</div>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
        </div>
    `).join('');

    // If there's a hero/mockup asset, show preview
    const heroAsset = assets.find(a => a.section === 'hero' || a.section === 'mockup');
    const previewContainer = document.getElementById('softwarePreview');
    if (heroAsset && heroAsset.url && previewContainer) {
        previewContainer.innerHTML = `<img src="${heroAsset.url}" alt="Vectore Flow Preview" style="width: 100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-xl);" loading="lazy">`;
    }

    // Init the smart form if it exists in this room
    // The form HTML is already in the page, forms.js initSmartForm will handle it
}

// ===================================
// Room 4: Vectore Visuals — Portfolio
// ===================================
async function loadVisualsPortfolio() {
    const track = document.getElementById('visualsTrack');
    if (!track) return;

    let projects = [];
    try {
        const allProjects = await apiFetch('/projects');
        projects = (allProjects || []).filter(p =>
            p.tags?.some(t => ['3d', '3d_renders', 'archviz', 'astrophotography', 'render', 'visual', 'comfyui'].includes(t.toLowerCase())) ||
            p.category?.toLowerCase().includes('3d') ||
            p.category?.toLowerCase().includes('render') ||
            p.category?.toLowerCase().includes('visual') ||
            p.category?.toLowerCase().includes('photo')
        );
    } catch (e) {
        console.warn('Could not load visual projects:', e);
    }

    if (projects.length === 0) {
        // Fallback placeholder items
        track.innerHTML = `
            <div class="portfolio-scroll__item">
                <div class="portfolio-scroll__image">
                    <div style="aspect-ratio:16/10; background: var(--bg-elevated); display:flex; align-items:center; justify-content:center; color: var(--text-tertiary);">
                        <p>Visual portfolio coming soon</p>
                    </div>
                </div>
                <div class="portfolio-scroll__overlay">
                    <span class="portfolio-scroll__category">ArchViz</span>
                    <h3 class="portfolio-scroll__title">Hyperrealistic Renders</h3>
                    <span class="portfolio-scroll__client">Vectore Visuals</span>
                </div>
            </div>
        `;
        return;
    }

    track.innerHTML = projects.map(p => {
        const isVideo = p.thumbnail && (p.thumbnail.match(/\.(mp4|webm|ogg|mov)$/i) || p.thumbnail.includes('/video/upload/'));
        const mediaHtml = isVideo
            ? `<video src="${p.thumbnail}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>`
            : `<img src="${p.thumbnail}" alt="${p.title}" loading="lazy">`;
        return `
            <div class="portfolio-scroll__item reveal--scale">
                <div class="portfolio-scroll__image">${mediaHtml}</div>
                <div class="portfolio-scroll__overlay">
                    <span class="portfolio-scroll__category">${p.category}</span>
                    <h3 class="portfolio-scroll__title">${p.title}</h3>
                    <span class="portfolio-scroll__client">${p.client}</span>
                </div>
            </div>
        `;
    }).join('');

    // Re-init portfolio scroll for this track
    initVisualsScroll();
}

function initVisualsScroll() {
    const track = document.getElementById('visualsTrack');
    const prevBtn = document.getElementById('visualsPrev');
    const nextBtn = document.getElementById('visualsNext');
    if (!track) return;

    const scrollAmount = 500;
    if (prevBtn) prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
}
