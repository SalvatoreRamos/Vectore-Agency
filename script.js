// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    // Initial scroll check
    revealOnScroll();

    // Load content
    loadProducts();
    loadProjects();
    loadTestimonials();

    // Init dynamic interactions
    initAnimatedCounters();
    initTiltEffect();
    initMagneticButtons();
    initHeroTypingEffect();

    // Prevent right click on protected images
    document.addEventListener('contextmenu', (e) => {
        if (e.target.classList.contains('product-protection-overlay') || e.target.classList.contains('portfolio-overlay')) {
            e.preventDefault();
        }
    });
});

// ===================================
// Testimonials Logic
// ===================================
async function loadTestimonials() {
    const grid = document.getElementById('testimonialsGrid');
    if (!grid) return;

    try {
        const response = await api.getTestimonials();
        const testimonials = response.data || [];

        if (testimonials.length === 0) {
            // Dummy testimonials to show visual potential
            const dummy = [
                { clientName: 'Ana Ruiz', businessName: 'Café Lavanda', comment: '¡Increíble trabajo con mi logo y redes! La gente ahora me reconoce en toda la ciudad.', photo: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg' },
                { clientName: 'Juan Pérez', businessName: 'Taller Mecánico JP', comment: 'Los flyers y la publicidad exterior que hicieron atrajeron muchos clientes nuevos este mes.', photo: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
                { clientName: 'Elena Soto', businessName: 'Sport Fit', comment: 'Mi web ahora es súper rápida y mis clientes pueden agendar clases sin problemas.', photo: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg' }
            ];
            renderTestimonials(dummy);
        } else {
            renderTestimonials(testimonials);
        }
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

function renderTestimonials(testimonials) {
    const grid = document.getElementById('testimonialsGrid');
    grid.innerHTML = testimonials.map(t => `
        <div class="testimonial-card reveal">
            <div class="testimonial-image">
                <img src="${t.photo}" alt="${t.clientName}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x300?text=Vectore+Client'">
            </div>
            <div class="testimonial-content">
                <p class="testimonial-comment">"${t.comment}"</p>
            </div>
            <div class="testimonial-footer">
                <span class="testimonial-business">${t.businessName}</span>
                <span class="testimonial-client">${t.clientName}</span>
            </div>
        </div>
    `).join('');
}

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
            renderPortfolioItems(dummyProjects);
        } else {
            renderPortfolioItems(projects);
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
        // Improved detection for Cloudinary videos and various formats
        const isVideo = project.thumbnail && (
            project.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|wmv)$|^data:video/i) ||
            project.thumbnail.includes('/video/upload/')
        );

        item.innerHTML = `
            ${isVideo ?
                `<video src="${project.thumbnail}" autoplay loop muted playsinline class="portfolio-video-bg"></video>` :
                `<img src="${project.thumbnail}" alt="Proyecto Vectore: ${project.title}" loading="lazy" onerror="this.src='https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'">`
            }
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

// Pause marquee on user interaction and enable manual scroll
function setupMarqueeInteraction(marquee) {
    const container = marquee.closest('.portfolio-marquee-container');
    if (!container) return;

    const prevBtn = document.getElementById('portfolioPrev');
    const nextBtn = document.getElementById('portfolioNext');

    let resumeTimeout = null;

    function pauseMarquee() {
        marquee.classList.add('paused');
        clearTimeout(resumeTimeout);
        resumeTimeout = setTimeout(() => {
            marquee.classList.remove('paused');
        }, 5000);
    }

    // Arrow navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -400, behavior: 'smooth' });
            pauseMarquee();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: 400, behavior: 'smooth' });
            pauseMarquee();
        });
    }

    // Touch events for mobile
    container.addEventListener('touchstart', pauseMarquee, { passive: true });
}

function openProjectModal(project) {
    const modal = document.getElementById('projectModal');
    const content = document.getElementById('projectModalContent');

    // Behance-style template
    const isMainVideo = project.thumbnail && (
        project.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|wmv)$|^data:video/i) ||
        project.thumbnail.includes('/video/upload/')
    );

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

            <div class="project-image-wrapper">
                ${isMainVideo ?
            `<video src="${project.thumbnail}" controls autoplay loop muted playsinline class="project-main-image"></video>` :
            `<img src="${project.thumbnail}" alt="${project.title}" class="project-main-image" onerror="this.src='https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'">`
        }
                <div class="product-protection-overlay"></div>
            </div>

            <div class="project-gallery">
                ${(project.images || []).map(img => {
            const isGalleryVideo = img.url && (
                img.url.match(/\.(mp4|webm|ogg|mov|avi|flv|wmv)$|^data:video/i) ||
                img.url.includes('/video/upload/')
            );
            return `
                        <div class="project-image-wrapper">
                            ${isGalleryVideo ?
                    `<video src="${img.url}" controls autoplay loop muted playsinline class="gallery-video"></video>` :
                    `<img src="${img.url}" alt="Galería: ${project.title}" loading="lazy" onerror="this.style.display='none'">`
                }
                            <div class="product-protection-overlay"></div>
                        </div>
                    `;
        }).join('')}
            </div>

        <div class="project-footer">
            <h2>¿Te gusta lo que ves?</h2>
            <p>Hablemos sobre tu próximo proyecto</p>
            <a href="#whatsapp" class="btn btn-primary" onclick="closeProjectModalFunc()">Contactar por WhatsApp</a>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scroll

    // Reset scroll to top
    const container = modal.querySelector('.project-modal-container');
    if (container) container.scrollTop = 0;

    // Handle back button (History API)
    if (!window.location.hash.includes('modal')) {
        history.pushState({ modalOpen: true }, '', '#modal');
    }
}

function closeProjectModalFunc() {
    const modal = document.getElementById('projectModal');
    if (!modal || !modal.classList.contains('active')) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';

    // If we closed via UI (not back button), and hash is #modal, go back
    if (window.location.hash === '#modal') {
        history.back();
    }
}

// Window popstate for Android back button and browser navigation
window.addEventListener('popstate', (event) => {
    const modal = document.getElementById('projectModal');
    if (modal && modal.classList.contains('active')) {
        // Close without calling history.back() again
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

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
        price: 300,
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
        price: 250,
        isAvailable: true
    },
    {
        _id: 'bkup-6',
        name: 'Diseño de Fachada',
        description: 'Propuestas arquitectónicas visuales para el exterior de tu negocio.',
        category: 'digital',
        price: 350,
        isAvailable: true
    },
    {
        _id: 'bkup-7',
        name: 'Tarjetas de Presentación',
        description: '500 unidades en papel premium con acabados especiales y diseño incluido.',
        category: 'physical',
        price: 45,
        isAvailable: true
    },
    {
        _id: 'bkup-8',
        name: 'Flyers Publicitarios',
        description: 'Mil volantes a full color en alta resolución para promocionar tu negocio.',
        category: 'physical',
        price: 65,
        isAvailable: true
    },
    {
        _id: 'bkup-9',
        name: 'Banners y Gigantografías',
        description: 'Impresión en gran formato en alta resolución para máxima visibilidad en exteriores Pucallpa.',
        category: 'physical',
        price: 85,
        isAvailable: true
    },
    {
        _id: 'bkup-10',
        name: 'Stickers y Etiquetas',
        description: 'Stickers personalizados troquelados en vinil adhesivo, ideales para branding de productos.',
        category: 'physical',
        price: 35,
        isAvailable: true
    },
    {
        _id: 'bkup-11',
        name: 'Vinilos y Rotulación',
        description: 'Vinilos decorativos y publicitarios para locales comerciales y oficinas en Pucallpa.',
        category: 'physical',
        price: 120,
        isAvailable: true
    }
];

// Product management

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

// Custom Cursor, Parallax Tracking & Smoothing
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let targetX = mouseX;
let targetY = mouseY;

document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
});

function animateParallax() {
    // Faster interpolation for better responsiveness
    const easing = 0.15;
    const parallaxEasing = 0.08; // Keep parallax a bit smoother

    mouseX += (targetX - mouseX) * easing;
    mouseY += (targetY - mouseY) * easing;

    if (window.innerWidth >= 768) {
        // Cursor dot follows instantly for immediate feedback, small ring follows with easing
        if (cursor) cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        if (cursorDot) cursorDot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;

        // Background shapes parallax
        const shapes = document.querySelectorAll('.shape-container');
        const parallaxFactors = [
            { x: 0.03, y: 0.03 },
            { x: -0.05, y: 0.02 },
            { x: 0.02, y: -0.04 },
            { x: -0.08, y: -0.06 }
        ];

        shapes.forEach((shape, index) => {
            const factor = parallaxFactors[index] || { x: 0.02, y: 0.02 };
            // Parallax uses smoothed mouseX/Y but with its own extra "laziness"
            const x = (window.innerWidth / 2 - mouseX) * factor.x;
            const y = (window.innerHeight / 2 - mouseY) * factor.y;
            shape.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });

        // Hero title parallax (Individual lines)
        const titleLines = document.querySelectorAll('.title-line');
        if (titleLines.length > 0) {
            const rect = document.querySelector('.hero').getBoundingClientRect();
            const relX = mouseX - rect.left;
            const relY = mouseY - rect.top;

            const zoneX = (relX / rect.width) - 0.5;
            const zoneY = (relY / rect.height) - 0.5;

            titleLines.forEach((line, index) => {
                const factor = (index + 1) * 20;
                const tx = zoneX * factor;
                const ty = zoneY * factor;
                line.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
            });
        }
    }

    requestAnimationFrame(animateParallax);
}

// Start animation loop
animateParallax();

// Always hide default cursor on desktop
document.addEventListener('mousemove', () => {
    if (window.innerWidth >= 768) {
        document.body.style.cursor = 'none';
    }
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
        ? `<img src="${product.images[0].url}" alt="${product.name}" class="product-img-bg" loading="lazy">`
        : `<div class="product-placeholder" style="background: ${gradient}"><span class="product-icon">${icon}</span></div>`;

    const categoryTag = product.category === 'digital'
        ? '<span class="product-tag">Digital</span>'
        : '<span class="product-tag physical">Físico</span>';

    div.innerHTML = `
        <div class="product-image">
            ${imageContent}
            <div class="product-protection-overlay"></div>
            ${categoryTag}
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">
                <span class="price">Desde S/ ${product.price}</span>
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
// Contact Logic

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
// ===================================
// Interactive Elements (Counters, Tilt, Magnetic)
// ===================================

function initAnimatedCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const countUp = (el) => {
        const target = +el.getAttribute('data-target');
        const count = +el.innerText;
        const speed = target / 100;

        if (count < target) {
            el.innerText = Math.ceil(count + speed);
            setTimeout(() => countUp(el), 30);
        } else {
            el.innerText = target + '+';
        }
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

function initTiltEffect() {
    if (window.innerWidth < 1025) return;

    const cards = document.querySelectorAll('.service-card, .product-card, .testimonial-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Dividir la tarjeta en una rejilla 3x3 para obtener ángulos preestablecidos
            const zoneX = Math.floor((x / rect.width) * 3);
            const zoneY = Math.floor((y / rect.height) * 3);

            // Ángulos fijos y suaves (ajustado para evitar deformación excesiva)
            let rotX = 0;
            let rotY = 0;

            // Mapeo de zonas a ángulos (Arriba: pos, Abajo: neg | Izquierda: neg, Derecha: pos)
            // Zona Y: 0 (Arriba), 1 (Centro), 2 (Abajo)
            if (zoneY === 0) rotX = 5;
            else if (zoneY === 2) rotX = -5;

            // Zona X: 0 (Izquierda), 1 (Centro), 2 (Derecha)
            if (zoneX === 0) rotY = -5;
            else if (zoneX === 2) rotY = 5;

            // Aplicamos la transformación con escala reducida (1.02)
            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

function initMagneticButtons() {
    if (window.innerWidth < 1025) return;

    const btns = document.querySelectorAll('.btn');

    btns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0, 0)`;
        });
    });
}

function initHeroTypingEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const originalText = "Expertos en diseño gráfico, impresiones de alta calidad, stickers y diseño web en Pucallpa. Llevamos tu marca al siguiente nivel con soluciones creativas que impactan.";

    // Cleanup: Ensure the element is absolutely empty before typing
    subtitle.innerHTML = '';
    subtitle.textContent = '';

    let i = 0;
    const speed = 25;

    function type() {
        if (i < originalText.length) {
            // Using textContent is safer for sequential typing
            subtitle.textContent += originalText.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    setTimeout(() => {
        subtitle.style.opacity = '1';
        type();
    }, 1500);
}
