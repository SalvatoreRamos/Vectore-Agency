// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    // Initial scroll check
    revealOnScroll();

    // Load products from API
    await loadProducts();
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

        // Render products (API + Backup if needed)
        let productsToRender = [];

        if (products.length > 0) {
            productsToRender = [...products];

            // Si hay pocos productos en la API, añadimos algunos backup que no estén repetidos
            if (products.length < 6) {
                const existingNames = products.map(p => p.name.toLowerCase());
                const extraProducts = BACKUP_PRODUCTS.filter(p => !existingNames.includes(p.name.toLowerCase()));
                productsToRender = [...productsToRender, ...extraProducts.slice(0, 12 - products.length)];
            }
        } else {
            // Si la API devuelve un array vacío, usamos los de backup
            productsToRender = BACKUP_PRODUCTS;
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


function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card reveal';
    div.dataset.category = product.category;

    const icon = getProductIcon(product);
    const productId = product._id || product.id;
    const gradient = getGradient(product.category, productId);

    const imageContent = product.images && product.images.length > 0 && product.images[0].url
        ? `<img src="${product.images[0].url}" alt="${product.name}" class="product-img-bg">`
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
                <div class="product-actions">
                    <button class="btn-quote" onclick="window.location.href='https://wa.me/950699910?text=Hola, me interesa el producto: ${product.name}'">Consultar por WhatsApp</button>
                </div>
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
