// ===================================
// State Management
// ===================================
let products = [];
let projects = [];
let testimonials = [];
let events = [];
let activeSection = 'catalog';
let editingProductId = null;
let editingProjectId = null;
let editingTestimonialId = null;
let editingEventId = null;
let deletingId = null;
let deletingType = null; // 'product', 'project', 'testimonial', 'event'

// ===================================
// DOM Elements
// ===================================
// Authentication
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnLogout = document.getElementById('btnLogout');

// Sections
const catalogSection = document.getElementById('catalogSection');
const portfolioSection = document.getElementById('portfolioSection');
const testimonialsSection = document.getElementById('testimonialsSection');
const eventsSection = document.getElementById('eventsSection');

// Action Buttons
const btnAddProduct = document.getElementById('btnAddProduct');
const btnAddProject = document.getElementById('btnAddProject');
const btnAddTestimonial = document.getElementById('btnAddTestimonial');
const btnAddEvent = document.getElementById('btnAddEvent');

// Modals
const productModal = document.getElementById('productModal');
const projectFormModal = document.getElementById('projectFormModal');
const testimonialModal = document.getElementById('testimonialModal');
const eventAdminModal = document.getElementById('eventAdminModal');
const deleteModal = document.getElementById('deleteModal');
const drawModal = document.getElementById('drawModal');

// Forms
const productForm = document.getElementById('productForm');
const projectForm = document.getElementById('projectForm');
const testimonialForm = document.getElementById('testimonialForm');
const eventAdminForm = document.getElementById('eventAdminForm');

// Modal Components
const modalTitle = document.getElementById('modalTitle');
const projectModalTitle = document.getElementById('projectModalTitle');
const testimonialModalTitle = document.getElementById('testimonialModalTitle');
const deleteItemName = document.getElementById('deleteItemName');

// Grids
const adminProductsGrid = document.getElementById('adminProductsGrid');
const adminProjectsGrid = document.getElementById('adminProjectsGrid');
const adminTestimonialsGrid = document.getElementById('adminTestimonialsGrid');
const adminEventsGrid = document.getElementById('adminEventsGrid');

// Stats
const totalProductsEl = document.getElementById('totalProducts');
const digitalProductsEl = document.getElementById('digitalProducts');
const physicalProductsEl = document.getElementById('physicalProducts');
const totalProjectsEl = document.getElementById('totalProjects');

// Navigation & Filters
let navItems = document.querySelectorAll('.nav-item');
const filterBtns = document.querySelectorAll('.filter-btn');

// File Inputs & Image URL Fields
const productImageInput = document.getElementById('productImage');
const pThumbnailInput = document.getElementById('pThumbnail');
const pImageGalleryInput = document.getElementById('pImageGallery');
const tPhotoInput = document.getElementById('tPhoto');

const productFile = document.getElementById('productFile');
const pThumbFile = document.getElementById('pThumbFile');
const pGalleryFiles = document.getElementById('pGalleryFiles');
const tPhotoFile = document.getElementById('tPhotoFile');

// Close Buttons
const modalClose = document.getElementById('modalClose');
const projectModalClose = document.getElementById('projectModalClose');
const testimonialModalClose = document.getElementById('testimonialModalClose');
const eventAdminModalClose = document.getElementById('eventAdminModalClose');
const deleteModalClose = document.getElementById('deleteModalClose');
const drawModalClose = document.getElementById('drawModalClose');

const btnCancelProduct = document.getElementById('btnCancelProduct');
const btnCancelProject = document.getElementById('btnCancelProject');
const btnCancelTestimonial = document.getElementById('btnCancelTestimonial');
const btnCancelEvent = document.getElementById('btnCancelEvent');
const btnCancelDelete = document.getElementById('btnCancelDelete');

// Other
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnStartDraw = document.getElementById('btnStartDraw');
const drawAnimation = document.getElementById('drawAnimation');
const winnerReveal = document.getElementById('winnerReveal');
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let currentDrawEventId = null;

// ===================================
// Initialization
// ===================================
async function init() {
    // Hide preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 800);
    }

    // Check Auth
    if (api.token) {
        try {
            await api.getCurrentUser();
            showDashboard();
        } catch (error) {
            console.log('Session expired or invalid');
            api.logout();
            showLogin();
        }
    } else {
        showLogin();
    }

    setupEventListeners();

    // Prevent right click on protected images
    document.addEventListener('contextmenu', (e) => {
        if (e.target.classList.contains('product-protection-overlay')) {
            e.preventDefault();
        }
    });
}

// ===================================
// Helper Library
// ===================================
function getTargetData(e, className) {
    const card = e.target.closest('.admin-product-card');
    const btn = e.target.closest(className);
    if (!card || !btn) return null;
    return {
        id: card.dataset.id,
        name: card.dataset.name
    };
}

function getProduct(id) {
    return products.find(p => p._id === id || p.id === id);
}

function getProductIcon(product) {
    if (product.icon) return product.icon;
    const name = product.name.toLowerCase();
    if (name.includes('logo')) return '🎨';
    if (name.includes('web')) return '💻';
    if (name.includes('redes')) return '📱';
    if (name.includes('video')) return '🎬';
    if (name.includes('tarjeta')) return '💳';
    if (name.includes('flyer')) return '📄';
    return product.category === 'digital' ? '✨' : '📦';
}

function getGradient(category, id) {
    const numId = typeof id === 'string' ? id.charCodeAt(id.length - 1) : id;
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
// Authentication Logic
// ===================================
function showLogin() {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminDashboard) adminDashboard.style.display = 'none';
}

async function showDashboard() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'flex';
    await Promise.all([
        fetchAndRenderProducts(),
        fetchAndRenderProjects(),
        fetchAndRenderTestimonials(),
        fetchAndRenderEvents()
    ]);
}

async function handleLogin(email, password) {
    try {
        const response = await api.login(email, password);
        if (response.success) {
            showDashboard();
            return { success: true };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: error.message };
    }
    return { success: false, message: 'Fallo al iniciar sesión' };
}

function logout() {
    api.logout();
    showLogin();
}

// ===================================
// Navigation Logic
// ===================================
function switchSection(section) {
    activeSection = section;

    // Update Nav
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    // Toggle Visibility
    if (catalogSection) catalogSection.style.display = section === 'catalog' ? 'block' : 'none';
    if (portfolioSection) portfolioSection.style.display = section === 'portfolio' ? 'block' : 'none';
    if (testimonialsSection) testimonialsSection.style.display = section === 'testimonials' ? 'block' : 'none';
    if (eventsSection) eventsSection.style.display = section === 'events' ? 'block' : 'none';
}

// ===================================
// Rendering Functions
// ===================================
function updateStats() {
    if (totalProductsEl) totalProductsEl.textContent = products.length;
    if (digitalProductsEl) digitalProductsEl.textContent = products.filter(p => p.category === 'digital').length;
    if (physicalProductsEl) physicalProductsEl.textContent = products.filter(p => p.category === 'physical').length;
    if (totalProjectsEl) totalProjectsEl.textContent = projects.length;
    if (document.getElementById('totalTestimonials')) {
        document.getElementById('totalTestimonials').textContent = testimonials.length;
    }
}

async function fetchAndRenderProducts() {
    try {
        if (adminProductsGrid) adminProductsGrid.innerHTML = '<div class=\"loader\">Loading...</div>';
        const response = await api.getProducts();
        products = response.data || [];
        renderProducts();
        updateStats();
    } catch (error) {
        console.error('Error fetching products:', error);
        if (adminProductsGrid) adminProductsGrid.innerHTML = 'Error loading products';
    }
}

function renderProducts() {
    if (!adminProductsGrid) return;
    const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const mappedFilter = filter === 'fisico' ? 'physical' : filter;

    const filteredProducts = mappedFilter === 'all'
        ? products
        : products.filter(p => p.category === mappedFilter);

    if (filteredProducts.length === 0) {
        adminProductsGrid.innerHTML = '<div class=\"no-products\">No se encontraron productos</div>';
        return;
    }

    adminProductsGrid.innerHTML = filteredProducts.map(product => {
        const productId = product._id || product.id;
        const imageContent = product.images && product.images.length > 0 && product.images[0].url
            ? `<img src=\"${product.images[0].url}\" alt=\"${product.name}\">`
            : `<span>${getProductIcon(product)}</span>`;

        return `
        <div class=\"admin-product-card\" data-id=\"${productId}\" data-name=\"${product.name}\">
            <div class=\"admin-product-image\" style=\"background: ${getGradient(product.category, productId)}\">
                ${imageContent}
                <div class="product-protection-overlay"></div>
                <span class=\"category-badge ${product.category}\">${product.category === 'digital' ? 'Digital' : 'Físico'}</span>
            </div>
            <div class=\"admin-product-info\">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class=\"admin-product-price\">Desde S/ ${product.price}</div>
                <div class=\"admin-product-actions\">
                    <button class=\"btn-edit\">Editar</button>
                    <button class=\"btn-delete\">Eliminar</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

async function fetchAndRenderProjects() {
    try {
        if (adminProjectsGrid) adminProjectsGrid.innerHTML = '<div class=\"loader\">Loading...</div>';
        const response = await api.getProjects();
        projects = response.data || [];
        renderProjects();
        updateStats();
    } catch (error) {
        console.error('Error fetching projects:', error);
        if (adminProjectsGrid) adminProjectsGrid.innerHTML = 'Error loading projects';
    }
}

function renderProjects() {
    if (!adminProjectsGrid) return;
    if (projects.length === 0) {
        adminProjectsGrid.innerHTML = '<div class=\"no-products\">No hay proyectos en el portafolio</div>';
        return;
    }

    adminProjectsGrid.innerHTML = projects.map(project => {
        const projectId = project._id || project.id;
        const isVideo = project.thumbnail && (
            project.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|wmv)$/i) ||
            project.thumbnail.includes('/video/upload/')
        );

        return `
        <div class="admin-product-card" data-id="${projectId}" data-name="${project.title}">
            <div class="admin-product-image">
                ${isVideo ?
                `<video src="${project.thumbnail}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>` :
                `<img src="${project.thumbnail}" alt="${project.title}" onerror="this.src='https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'">`
            }
                <div class="product-protection-overlay"></div>
                <span class="category-badge digital">${project.category}</span>
                ${isVideo ? `<span class="video-badge" style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.7); color:white; padding:2px 8px; border-radius:4px; font-size:10px;">VIDEO</span>` : ''}
            </div>
            <div class="admin-product-info">
                <h3>${project.title}</h3>
                <p><strong>Cliente:</strong> ${project.client}</p>
                <div class="admin-product-actions">
                    <button class="btn-edit">Editar</button>
                    <button class="btn-delete">Eliminar</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

async function fetchAndRenderTestimonials() {
    try {
        if (adminTestimonialsGrid) adminTestimonialsGrid.innerHTML = '<div class=\"loader\">Loading...</div>';
        const response = await api.getAllTestimonials();
        testimonials = response.data || [];
        renderTestimonials();
        updateStats();
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        if (adminTestimonialsGrid) adminTestimonialsGrid.innerHTML = 'Error loading testimonials';
    }
}

function renderTestimonials() {
    if (!adminTestimonialsGrid) return;
    adminTestimonialsGrid.innerHTML = '';

    if (testimonials.length === 0) {
        adminTestimonialsGrid.innerHTML = '<p style=\"color: var(--text-muted); padding: 2rem;\">No hay clientes destacados aún.</p>';
        return;
    }

    testimonials.forEach(t => {
        const card = document.createElement('div');
        card.className = 'admin-product-card';
        card.dataset.id = t._id;
        card.dataset.name = t.clientName;
        card.innerHTML = `
            <div class="admin-product-image">
                <img src="${t.photo}" alt="${t.clientName}" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+Foto'">
                <div class="product-protection-overlay"></div>
            </div>
            <div class=\"admin-product-info\">
                <h3>${t.clientName}</h3>
                <p class=\"product-category\">${t.businessName}</p>
                <p class=\"product-description\">\"${t.comment.substring(0, 60)}${t.comment.length > 60 ? '...' : ''}\"</p>
            </div>
            <div class=\"admin-product-actions\">
                <button class=\"btn-edit\">Editar</button>
                <button class=\"btn-delete\">Eliminar</button>
            </div>
        `;
        adminTestimonialsGrid.appendChild(card);
    });
}

async function fetchAndRenderEvents() {
    try {
        if (adminEventsGrid) adminEventsGrid.innerHTML = '<div class=\"loader\">Loading...</div>';
        const response = await api.getEvents();
        events = response.data || [];
        renderEvents();
    } catch (error) {
        console.error('Error fetching events:', error);
        if (adminEventsGrid) adminEventsGrid.innerHTML = 'Error loading events';
    }
}

function renderEvents() {
    if (!adminEventsGrid) return;
    if (events.length === 0) {
        adminEventsGrid.innerHTML = '<p class=\"no-products\">No hay eventos creados.</p>';
        return;
    }

    adminEventsGrid.innerHTML = events.map(event => {
        const statusLabel = event.isActive ? 'ACTIVO' : 'FINALIZADO';
        const statusColor = event.isActive ? '#4CAF50' : '#888';

        return `
        <div class=\"admin-product-card event-card\" data-id=\"${event._id}\" data-name=\"${event.title}\">
            <div class=\"event-card-header\" style=\"background: ${statusColor}; color: white; padding: 10px; font-weight: bold; text-align: center; border-radius: 8px 8px 0 0;\">
                ${statusLabel}
            </div>
            <div class=\"admin-product-info\">
                <h3>${event.title}</h3>
                <p><strong>Premio:</strong> ${event.prize}</p>
                <p><strong>Fin:</strong> ${new Date(event.endDate).toLocaleDateString()}</p>
                ${event.winner ? `
                <div class=\"winner-badge\" style=\"background: #fff9c4; color: #827717; padding: 10px; border-radius: 8px; margin-top: 10px; border: 1px solid #fbc02d; display: flex; align-items: center; gap: 8px;\">
                    <span>🏆</span>
                    <span><strong>Ganador:</strong> ${typeof event.winner === 'object' ? event.winner.name : 'Sorteo realizado'}</span>
                </div>` : ''}
                <div class=\"admin-product-actions\" style=\"margin-top: 15px; flex-wrap: wrap;\">
                    <button class=\"btn btn-edit\">Editar</button>
                    ${!event.winner && event.isActive ? `<button class=\"btn btn-draw\">🎲 Sortear</button>` : ''}
                    <button class=\"btn btn-participants\">👥 Participantes</button>
                    <button class=\"btn btn-delete\">Eliminar</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ===================================
// CRUD Logic
// ===================================
async function addProduct(productData) {
    try {
        await api.createProduct(productData);
        await fetchAndRenderProducts();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function updateProduct(id, productData) {
    try {
        await api.updateProduct(id, productData);
        await fetchAndRenderProducts();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function saveProject(projectData) {
    try {
        if (editingProjectId) {
            await api.updateProject(editingProjectId, projectData);
        } else {
            await api.createProject(projectData);
        }
        await fetchAndRenderProjects();
        closeProjectModal();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function saveTestimonial(testimonialData) {
    try {
        if (editingTestimonialId) {
            await api.updateTestimonial(editingTestimonialId, testimonialData);
        } else {
            await api.createTestimonial(testimonialData);
        }
        await fetchAndRenderTestimonials();
        closeTestimonialModal();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function saveEvent(eventData) {
    try {
        if (editingEventId) {
            await api.updateEvent(editingEventId, eventData);
        } else {
            await api.createEvent(eventData);
        }
        await fetchAndRenderEvents();
        closeEventAdminModal();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteItemAction() {
    if (!deletingId) return;
    try {
        let res;
        if (deletingType === 'product') res = await api.deleteProduct(deletingId);
        else if (deletingType === 'project') res = await api.deleteProject(deletingId);
        else if (deletingType === 'testimonial') res = await api.deleteTestimonial(deletingId);
        else if (deletingType === 'event') res = await api.deleteEvent(deletingId);

        if (res.success) {
            setTimeout(async () => {
                if (deletingType === 'product') await fetchAndRenderProducts();
                else if (deletingType === 'project') await fetchAndRenderProjects();
                else if (deletingType === 'testimonial') await fetchAndRenderTestimonials();
                else if (deletingType === 'event') await fetchAndRenderEvents();
                alert('Eliminado con éxito');
            }, 500);
        }
    } catch (error) {
        alert('Error al eliminar: ' + error.message);
    }
    closeDeleteModal();
}

// ===================================
// Modal & UI Helpers
// ===================================
function openAddModal() {
    editingProductId = null;
    modalTitle.textContent = 'Agregar Producto';
    productForm.reset();
    productModal.classList.add('active');
}

function openEditModal(id) {
    editingProductId = id;
    const product = getProduct(id);
    if (!product) return;
    modalTitle.textContent = 'Editar Producto';
    document.getElementById('productId').value = product._id || product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category === 'physical' ? 'fisico' : product.category;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productImage').value = (product.images && product.images.length > 0) ? product.images[0].url : '';
    productModal.classList.add('active');
}

function closeProductModal() {
    productModal.classList.remove('active');
    editingProductId = null;
    productForm.reset();
}

function openAddProjectModal() {
    editingProjectId = null;
    projectModalTitle.textContent = 'Agregar Proyecto';
    projectForm.reset();
    projectFormModal.classList.add('active');
}

function openEditProjectModal(id) {
    editingProjectId = id;
    const project = projects.find(p => p._id === id || p.id === id);
    if (!project) return;
    projectModalTitle.textContent = 'Editar Proyecto';
    document.getElementById('pTitle').value = project.title;
    document.getElementById('pClient').value = project.client;
    document.getElementById('pCategory').value = project.category;
    document.getElementById('pDescription').value = project.description;
    document.getElementById('pThumbnail').value = project.thumbnail;
    const galleryUrls = (project.images || []).map(img => img.url).join(', ');
    document.getElementById('pImageGallery').value = galleryUrls;
    projectFormModal.classList.add('active');
}

function closeProjectModal() {
    projectFormModal.classList.remove('active');
    editingProjectId = null;
    projectForm.reset();
}

function openAddTestimonialModal() {
    testimonialModalTitle.textContent = 'Agregar Cliente';
    editingTestimonialId = null;
    testimonialForm.reset();
    testimonialModal.classList.add('active');
}

function openEditTestimonialModal(id) {
    const testimonial = testimonials.find(t => t._id === id);
    if (!testimonial) return;
    testimonialModalTitle.textContent = 'Editar Cliente';
    editingTestimonialId = id;
    document.getElementById('tClientName').value = testimonial.clientName;
    document.getElementById('tBusinessName').value = testimonial.businessName;
    document.getElementById('tComment').value = testimonial.comment;
    document.getElementById('tPhoto').value = testimonial.photo;
    testimonialModal.classList.add('active');
}

function closeTestimonialModal() {
    testimonialModal.classList.remove('active');
    editingTestimonialId = null;
}

function openEventAdminModal(id = null) {
    eventAdminForm.reset();
    editingEventId = id;
    if (id) {
        const event = events.find(e => e._id === id);
        document.getElementById('modalEventTitle').textContent = 'Editar Evento';
        document.getElementById('eTitle').value = event.title;
        document.getElementById('eDescription').value = event.description;
        document.getElementById('ePrize').value = event.prize;
        const date = new Date(event.endDate);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        document.getElementById('eEndDate').value = date.toISOString().slice(0, 16);
        document.getElementById('eIsActive').checked = event.isActive;
    } else {
        document.getElementById('modalEventTitle').textContent = 'Nuevo Evento';
    }
    eventAdminModal.classList.add('active');
}

function closeEventAdminModal() {
    eventAdminModal.classList.remove('active');
    editingEventId = null;
}

function openDeleteModal(id, type, name) {
    deletingId = id;
    deletingType = type;
    deleteItemName.textContent = name;
    deleteModal.classList.add('active');
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
}

window.openDrawModal = function (id) {
    console.log('Opening Draw Modal for:', id);
    currentDrawEventId = id;
    drawModal.classList.add('active');
    drawAnimation.style.display = 'flex';
    winnerReveal.style.display = 'none';
    btnStartDraw.disabled = false;
    btnStartDraw.innerHTML = '🎁 ¡Girar Ruleta!';
};

async function performDraw() {
    if (!currentDrawEventId) return;
    btnStartDraw.disabled = true;
    btnStartDraw.onclick = null; // Important: Clear previous handlers
    btnStartDraw.innerHTML = 'Girando...';
    let counter = 0;
    const interval = setInterval(() => {
        drawAnimation.querySelector('h2').textContent = Math.floor(Math.random() * 9999);
        counter++;
        if (counter > 20) {
            clearInterval(interval);
            finalizeDraw();
        }
    }, 100);

    async function finalizeDraw() {
        try {
            const response = await api.drawWinner(currentDrawEventId);
            if (response.success) {
                drawAnimation.style.display = 'none';
                winnerReveal.style.display = 'block';
                document.getElementById('wName').textContent = response.winner.name;
                document.getElementById('wTicket').textContent = response.winner.ticketId;
                document.getElementById('wPhone').textContent = response.winner.phoneMasked;

                // Celebrate!
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#8655FF', '#160F50', '#ffffff'],
                        zIndex: 999999
                    });
                }

                btnStartDraw.innerHTML = 'Cerrar y Actualizar';
                btnStartDraw.disabled = false;
                btnStartDraw.onclick = () => {
                    drawModal.classList.remove('active');
                    btnStartDraw.onclick = null; // Reset
                };
                await fetchAndRenderEvents();
            } else {
                alert(response.message);
                drawModal.classList.remove('active');
            }
        } catch (error) {
            alert('Error: ' + error.message);
            btnStartDraw.disabled = false;
        }
    }
}


// Participants Modal
window.openParticipantsModal = async function (id) {
    console.log('Opening Participants for:', id);
    const event = events.find(e => e._id === id);
    if (!event) return;

    const modal = document.getElementById('participantsModal');
    const list = document.getElementById('participantsList');
    const title = document.getElementById('participantsTitle');

    title.textContent = `Participantes: ${event.title}`;
    list.innerHTML = '<li class=\"participant-item\">Cargando...</li>';
    modal.classList.add('active');

    try {
        // Use the correct endpoint for participants
        const res = await api.request(`/events/${id}/stats`);
        console.log('Participants fetch res:', res);

        // API returns: { success: true, total: X, recent: [...] }
        const participants = res.recent || [];

        if (participants.length === 0) {
            list.innerHTML = '<li class=\"no-participants\">No hay participantes registrados aún.</li>';
        } else {
            list.innerHTML = participants.map(p => `
                <li class=\"participant-item\">
                    <div class=\"p-info\">
                        <span class=\"p-name\">${p.name}</span>
                        <span class=\"p-ticket\">Ticket: ${p.ticketId}</span>
                    </div>
                    <a href=\"https://wa.me/51${p.phone}\" target=\"_blank\" class=\"btn btn-primary btn-sm btn-wa-direct\" style=\"background:#25d366; border:none; color: white !important;\">
                        WhatsApp
                    </a>
                </li>
            `).join('');
        }
    } catch (error) {
        console.error('Error fetching participants:', error);
        list.innerHTML = '<li class=\"error\">Error al cargar participantes.</li>';
    }
}


// ===================================
// Event Listeners
// ===================================
function setupEventListeners() {
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (item.getAttribute('href') === 'index.html') return;
            e.preventDefault();
            switchSection(item.dataset.section);
            // Hide sidebar on mobile after clicking
            if (window.innerWidth <= 768) {
                adminDashboard.classList.remove('sidebar-open');
            }
        });
    });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobileMenuToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            adminDashboard.classList.toggle('sidebar-open');
        });
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            loginError.textContent = 'Cargando...';
            const res = await handleLogin(email, password);
            if (!res.success) loginError.textContent = res.message;
        });
    }

    // Logout
    if (btnLogout) btnLogout.addEventListener('click', logout);

    // Filter
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts();
        });
    });

    // Action Buttons
    if (btnAddProduct) btnAddProduct.addEventListener('click', openAddModal);
    if (btnAddProject) btnAddProject.addEventListener('click', openAddProjectModal);
    if (btnAddTestimonial) btnAddTestimonial.addEventListener('click', openAddTestimonialModal);
    if (btnAddEvent) btnAddEvent.addEventListener('click', () => openEventAdminModal());

    // Modals
    if (modalClose) modalClose.addEventListener('click', closeProductModal);
    if (btnCancelProduct) btnCancelProduct.addEventListener('click', closeProductModal);
    if (projectModalClose) projectModalClose.addEventListener('click', closeProjectModal);
    if (btnCancelProject) btnCancelProject.addEventListener('click', closeProjectModal);
    if (testimonialModalClose) testimonialModalClose.addEventListener('click', closeTestimonialModal);
    if (btnCancelTestimonial) btnCancelTestimonial.addEventListener('click', closeTestimonialModal);
    if (eventAdminModalClose) eventAdminModalClose.addEventListener('click', closeEventAdminModal);
    if (btnCancelEvent) btnCancelEvent.addEventListener('click', closeEventAdminModal);
    if (deleteModalClose) deleteModalClose.addEventListener('click', closeDeleteModal);
    if (btnCancelDelete) btnCancelDelete.addEventListener('click', closeDeleteModal);
    if (drawModalClose) drawModalClose.addEventListener('click', () => drawModal.classList.remove('active'));
    if (document.getElementById('participantsModalClose')) {
        document.getElementById('participantsModalClose').addEventListener('click', () => {
            document.getElementById('participantsModal').classList.remove('active');
        });
    }

    if (btnStartDraw) btnStartDraw.addEventListener('click', performDraw);
    if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', deleteItemAction);

    // Form Submissions
    if (productForm) productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cat = document.getElementById('productCategory').value;
        const data = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            category: cat === 'fisico' ? 'physical' : cat,
            subcategory: cat === 'fisico' ? 'Impresión' : 'Diseño', // Default subcategories
            price: parseInt(document.getElementById('productPrice').value),
            icon: document.getElementById('productIcon').value || '🎨',
            images: document.getElementById('productImage').value ? [{ url: document.getElementById('productImage').value, isPrimary: true }] : []
        };
        if (editingProductId) updateProduct(editingProductId, data);
        else addProduct(data);
        closeProductModal();
    });

    if (projectForm) projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const gal = document.getElementById('pImageGallery').value;
        const data = {
            title: document.getElementById('pTitle').value,
            client: document.getElementById('pClient').value,
            category: document.getElementById('pCategory').value,
            description: document.getElementById('pDescription').value,
            thumbnail: document.getElementById('pThumbnail').value,
            images: gal.split(',').map(u => ({ url: u.trim() })).filter(u => u.url)
        };
        saveProject(data);
    });

    if (testimonialForm) testimonialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            clientName: document.getElementById('tClientName').value,
            businessName: document.getElementById('tBusinessName').value,
            comment: document.getElementById('tComment').value,
            photo: document.getElementById('tPhoto').value
        };
        saveTestimonial(data);
    });

    if (eventAdminForm) eventAdminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            title: document.getElementById('eTitle').value,
            description: document.getElementById('eDescription').value,
            prize: document.getElementById('ePrize').value,
            endDate: document.getElementById('eEndDate').value,
            isActive: document.getElementById('eIsActive').checked
        };
        saveEvent(data);
    });

    // Delegations
    if (adminProductsGrid) adminProductsGrid.addEventListener('click', (e) => {
        const d = getTargetData(e, '.btn-edit'); if (d) openEditModal(d.id);
        const del = getTargetData(e, '.btn-delete'); if (del) openDeleteModal(del.id, 'product', del.name);
    });
    if (adminProjectsGrid) adminProjectsGrid.addEventListener('click', (e) => {
        const d = getTargetData(e, '.btn-edit'); if (d) openEditProjectModal(d.id);
        const del = getTargetData(e, '.btn-delete'); if (del) openDeleteModal(del.id, 'project', del.name);
    });
    if (adminTestimonialsGrid) adminTestimonialsGrid.addEventListener('click', (e) => {
        const d = getTargetData(e, '.btn-edit'); if (d) openEditTestimonialModal(d.id);
        const del = getTargetData(e, '.btn-delete'); if (del) openDeleteModal(del.id, 'testimonial', del.name);
    });
    if (adminEventsGrid) adminEventsGrid.addEventListener('click', (e) => {
        const edit = getTargetData(e, '.btn-edit'); if (edit) openEventAdminModal(edit.id);
        const del = getTargetData(e, '.btn-delete'); if (del) openDeleteModal(del.id, 'event', del.name);
        const draw = getTargetData(e, '.btn-draw'); if (draw) openDrawModal(draw.id);
        const part = getTargetData(e, '.btn-participants'); if (part) openParticipantsModal(part.id);
    });

    // File Uploads
    if (productFile) productFile.addEventListener('change', async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try {
            productImageInput.value = 'Subiendo...';
            const res = await api.uploadImage(f);
            if (res.success) productImageInput.value = res.data.url;
            else throw new Error(res.message);
        } catch (error) {
            alert('Error subiendo imagen: ' + error.message);
            productImageInput.value = '';
            productFile.value = '';
        }
    });

    if (pThumbFile) pThumbFile.addEventListener('change', async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try {
            pThumbnailInput.value = 'Subiendo...';
            const res = await api.uploadImage(f);
            if (res.success) pThumbnailInput.value = res.data.url;
            else throw new Error(res.message);
        } catch (error) {
            alert('Error subiendo miniatura o video: ' + error.message);
            pThumbnailInput.value = '';
            pThumbFile.value = '';
        }
    });

    if (pGalleryFiles) pGalleryFiles.addEventListener('change', async (e) => {
        const files = e.target.files; if (files.length === 0) return;
        const originalValue = pImageGalleryInput.value;
        const subiendoStr = originalValue ? `${originalValue}, Subiendo...` : 'Subiendo...';
        pImageGalleryInput.value = subiendoStr;

        try {
            const res = await api.uploadImages(files);
            if (res.success) {
                const urls = res.data.map(img => img.url).join(', ');
                pImageGalleryInput.value = originalValue ? `${originalValue}, ${urls}` : urls;
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            alert('Error subiendo imágenes a la galería: ' + error.message);
            pImageGalleryInput.value = originalValue;
            pGalleryFiles.value = '';
        }
    });

    if (tPhotoFile) tPhotoFile.addEventListener('change', async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try {
            tPhotoInput.value = 'Subiendo...';
            const res = await api.uploadImage(f);
            if (res.success) tPhotoInput.value = res.data.url;
            else throw new Error(res.message);
        } catch (error) {
            alert('Error subiendo foto: ' + error.message);
            tPhotoInput.value = '';
            tPhotoFile.value = '';
        }
    });
}

// Cursor
document.addEventListener('mousemove', (e) => {
    if (cursor) cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    if (cursorDot) cursorDot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
});

window.switchSection = switchSection;
init();
