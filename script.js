// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    // Initial scroll check
    revealOnScroll();

    // Load products
    loadProducts();

    // Load portfolio projects
    loadProjects();
});

// ===================================
// Portfolio & Project Modal
// ===================================
async function loadProjects() {
    const marquee = document.getElementById('portfolioMarquee');
    if (!marquee) return;

    try {
        const response = await api.getProjects();
        const projects = response.data || [];

        if (projects.length === 0) {
            // Render dummy projects if DB is empty
            const dummyProjects = [
                { title: 'Identidad Vectore', client: 'Vectore Agency', category: 'Branding', thumbnail: 'https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg', description: 'Desarrollo de identidad corporativa completa para agencia creativa.' },
                { title: 'Eco Home App', client: 'EcoSmart', category: 'UI/UX Design', thumbnail: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg', description: 'Interfaz intuitiva para control de hogar inteligente.' },
                { title: 'Nebula Coffee', client: 'Nebula', category: 'Packaging', thumbnail: 'https://images.pexels.com/photos/4264049/pexels-photo-4264049.jpeg', description: 'Diseño de empaques premium para café de especialidad.' },
                { title: 'Urban Flota', client: 'Urban Express', category: 'Vehicle Wrap', thumbnail: 'https://images.pexels.com/photos/3853338/pexels-photo-3853338.jpeg', description: 'Rotulación integral de flota vehicular logística.' }
            ];
            renderPortfolioItems([...dummyProjects, ...dummyProjects]); // Duplicate for smooth loop
        } else {
            renderPortfolioItems([...projects, ...projects]);
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderPortfolioItems(projects) {
    const marquee = document.getElementById('portfolioMarquee');
    marquee.innerHTML = '';

    projects.forEach(project => {
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `
            <img src="${project.thumbnail}" alt="Proyecto Vectore: ${project.title}" loading="lazy" onerror="this.src='https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'">
            <div class="portfolio-overlay">
                <span class="portfolio-category">${project.category}</span>
                <h3 class="portfolio-title">${project.title}</h3>
                <span class="portfolio-client">${project.client}</span>
            </div>
        `;
        item.addEventListener('click', () => openProjectModal(project));
        marquee.appendChild(item);
    });

    // Setup touch/scroll pause behavior
    setupMarqueeInteraction(marquee);
}

// Pause marquee on user interaction (touch/scroll), resume after inactivity
function setupMarqueeInteraction(marquee) {
    const container = marquee.closest('.portfolio-marquee-container');
    if (!container) return;

    let resumeTimeout = null;

    function pauseMarquee() {
        marquee.style.animationPlayState = 'paused';
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            marquee.style.animationPlayState = 'running';
        }, 3000); // Resume after 3 seconds of no interaction
    }

    // Touch events for mobile
    container.addEventListener('touchstart', pauseMarquee, { passive: true });
    container.addEventListener('touchmove', pauseMarquee, { passive: true });

    // Wheel/scroll events for desktop
    container.addEventListener('wheel', pauseMarquee, { passive: true });
}

function openProjectModal(project) {
    const modal = document.getElementById('projectModal');
    const content = document.getElementById('projectModalContent');

    // Behance-style template
    content.innerHTML = `
        <div class="project-header">
            <span class="section-badge">${project.category}</span>
            <h1>${project.title}</h1>
            <div class="project-meta">
                <span><strong>Cliente</strong> ${project.client}</span>
                <span><strong>Fecha</strong> ${new Date(project.date || Date.now()).toLocaleDateString()}</span>
                <span><strong>Servicio</strong> ${project.category}</span>
            </div>
        </div>

        <div class="project-description">
            <p>${project.description}</p>
        </div>

        <img src="${project.thumbnail}" alt="${project.title}" class="project-main-image" onerror="this.src='https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'">

        <div class="project-gallery">
            ${(project.images || []).map(img => `
                <img src="${img.url}" alt="Galería: ${project.title}" loading="lazy" onerror="this.style.display='none'">
            `).join('')}
        </div>

        <div class="project-footer">
            <h2>¿Te gusta lo que ves?</h2>
            <p>Hablemos sobre tu próximo proyecto</p>
            <a href="#whatsapp" class="btn btn-primary" onclick="closeProjectModalFunc()">Contactar por WhatsApp</a>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

function closeProjectModalFunc() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeProjectModal');
    const overlay = document.querySelector('.project-modal-overlay');

    if (closeBtn) closeBtn.addEventListener('click', closeProjectModalFunc);
    if (overlay) overlay.addEventListener('click', closeProjectModalFunc);
});

// ===================================
// Navigation
// ===================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===================================
// Catalog & API Integration
// ===================================
const productCatalog = {};

// Productos estáticos de respaldo por si la API está vacía o tiene pocos productos
const BACKUP_PRODUCTS = [
    {
        _id: 'bkup-1',
        name: 'Diseño de Logo Premium',
        description: 'Identidad visual única para tu marca con entrega de archivos editables y manual de uso.',
        category: 'digital',
        price: 150,
        isAvailable: true
    },
    {
        _id: 'bkup-2',
        name: 'Diseño Web Profesional',
        description: 'Sitios web modernos, responsivos y optimizados para SEO y conversión.',
        category: 'digital',
        price: 450,
        isAvailable: true
    },
    {
        _id: 'bkup-3',
        name: 'Gestión de Redes Sociales',
        description: 'Estrategia y creación de contenido mensual para tus canales digitales.',
        category: 'digital',
        price: 200,
        isAvailable: true
    },
    {
        _id: 'bkup-4',
        name: 'Diseño de Interiores',
        description: 'Planificación y visualización 3D profesional para transformar tus espacios.',
        category: 'digital',
        price: 500,
        isAvailable: true
    },
    {
        _id: 'bkup-5',
        name: 'Personalización de Vehículos',
        description: 'Diseño creativo de wraps y rotulación para flotas comerciales.',
        category: 'digital',
        price: 200,
        isAvailable: true
    },
    {
        _id: 'bkup-6',
        name: 'Diseño de Fachada',
        description: 'Propuestas arquitectónicas visuales para el exterior de tu negocio.',
        category: 'digital',
        price: 300,
        isAvailable: true
    },
    {
        _id: 'bkup-7',
        name: 'Tarjetas de Presentación',
        description: '500 unidades en papel premium con acabados especiales y diseño incluido.',
        category: 'physical',
        price: 30,
        isAvailable: true
    },
    {
        _id: 'bkup-8',
        name: 'Flyers Publicitarios',
        description: 'Mil volantes a full color en alta resolución para promocionar tu negocio.',
        category: 'physical',
        price: 45,
        isAvailable: true
    },
    {
        _id: 'bkup-9',
        name: 'Banners y Gigantografías',
        description: 'Impresión en gran formato para máxima visibilidad en exteriores.',
        category: 'physical',
        price: 55,
        isAvailable: true
    }
];

// El estado del usuario y carrito ha sido removido para simplificar la experiencia de usuario.

async function loadProducts(retries = 3) {
    const catalogGrid = document.getElementById('catalogGrid');

    try {
        const response = await api.getProducts();
        let products = response.data || [];

        // Clear current content
        catalogGrid.innerHTML = '';

        // Render logic: If there are real products in the API, show ONLY those.
        // Backups are only for showing a nice UI on the very first visit.
        let productsToRender = [];

        if (products.length > 0) {
            productsToRender = products;
            console.log(`Rendering ${products.length} products from database.`);
        } else {
            productsToRender = BACKUP_PRODUCTS;
            console.log("No products in DB, showing backup products.");
        }

        productsToRender.forEach(product => {
            const card = createProductCard(product);
            catalogGrid.appendChild(card);
        });

        // Initialize events
        initializeCatalogEvents();

    } catch (error) {
        console.error('Error loading products:', error);

        // En caso de error de conexión, mostramos al menos los productos de respaldo
        // para que el sitio no se vea vacío
        catalogGrid.innerHTML = '';
        BACKUP_PRODUCTS.forEach(product => {
            const card = createProductCard(product);
            catalogGrid.appendChild(card);
        });

        initializeCatalogEvents();

        if (retries > 0) {
            console.log(`Load failed, retrying in 3s... (${retries} retries left)`);
            setTimeout(() => loadProducts(retries - 1), 3000);
        }
    }
}

// ===================================
// Preloader & Custom Cursor Logic
// ===================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 1000);
});

const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

document.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    cursor.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
    cursorDot.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
});

// Cursor Hover Effects (Event Delegation for dynamic elements)
document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .product-card, .social-link, .filter-btn');
    if (target) {
        cursor.classList.add('active');
        cursorDot.classList.add('active');
    }
});

document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, .product-card, .social-link, .filter-btn');
    if (target) {
        cursor.classList.remove('active');
        cursorDot.classList.remove('active');
    }
});

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card reveal';
    div.dataset.category = product.category;

    const icon = getProductIcon(product);
    const productId = product._id || product.id;
    const gradient = getGradient(product.category, productId);

    const imageContent = product.images && product.images.length > 0 && product.images[0].url
        ? `<img src="${product.images[0].url}" alt="Catálogo Vectore: ${product.name}" class="product-img-bg" loading="lazy">`
        : `<div class="product-placeholder" style="background: ${gradient}"><span class="product-icon">${icon}</span></div>`;

    const categoryTag = product.category === 'digital'
        ? '<span class="product-tag">Digital</span>'
        : '<span class="product-tag physical">Físico</span>';

    div.innerHTML = `
        <div class="product-image">
            ${imageContent}
            ${categoryTag}
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">
                <span class="price">Desde $${product.price}</span>
            </div>
        </div>
    `;

    return div;
}

function getProductIcon(product) {
    if (product.icon) return product.icon;
    const name = product.name ? product.name.toLowerCase() : '';
    if (name.includes('logo')) return '🎨';
    if (name.includes('web')) return '💻';
    if (name.includes('redes')) return '📱';
    if (name.includes('video')) return '🎬';
    if (name.includes('tarjeta')) return '💳';
    if (name.includes('flyer')) return '📄';
    return product.category === 'digital' ? '✨' : '📦';
}

function getGradient(category, id) {
    const numId = typeof id === 'string' ? id.charCodeAt(id.length - 1) : 0;
    const gradients = category === 'digital' ? [
        'linear-gradient(135deg, #8655FF 0%, #a67fff 100%)',
        'linear-gradient(135deg, #5a35cc 0%, #8655FF 100%)',
        'linear-gradient(135deg, #a67fff 0%, #c9b3ff 100%)',
        'linear-gradient(135deg, #160F50 0%, #2a1f6b 100%)',
        'linear-gradient(135deg, #6b3fd9 0%, #8655FF 100%)'
    ] : [
        'linear-gradient(135deg, #160F50 0%, #8655FF 100%)',
        'linear-gradient(135deg, #2a1f6b 0%, #5a35cc 100%)',
        'linear-gradient(135deg, #8655FF 0%, #160F50 100%)',
        'linear-gradient(135deg, #5a35cc 0%, #a67fff 100%)',
        'linear-gradient(135deg, #a67fff 0%, #8655FF 100%)'
    ];
    return gradients[numId % gradients.length];
}

// La lógica de carrito y notificaciones asociadas ha sido removida.

// ===================================
// Catalog Filters
// ===================================
function initializeCatalogEvents() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            productCards.forEach(card => {
                const category = card.dataset.category;
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}


// ===================================
// Contact Form
// ===================================
// La lógica del formulario de contacto ha sido removida en favor del contacto por WhatsApp.

// ===================================
// Scroll Reveal Animation
// ===================================
const revealOnScroll = () => {
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
            el.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);

// ===================================
// Smooth scroll for anchor links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
