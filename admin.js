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

// ... (Rest of code)

// Global helper for event delegation
function getTargetData(e, className) {
    const card = e.target.closest('.admin-product-card');
    const btn = e.target.closest(className);
    if (!card || !btn) return null;
    return {
        id: card.dataset.id,
        name: card.dataset.name
    };
}

// ...

// ===================================
// DOM Elements
// ===================================
// ... (Previous DOM elements)
const catalogSection = document.getElementById('catalogSection');
const portfolioSection = document.getElementById('portfolioSection');
const testimonialsSection = document.getElementById('testimonialsSection');
const eventsSection = document.getElementById('eventsSection');

// Events DOM
const adminEventsGrid = document.getElementById('adminEventsGrid');
const eventAdminModal = document.getElementById('eventAdminModal');
const eventAdminForm = document.getElementById('eventAdminForm');
const btnAddEvent = document.getElementById('btnAddEvent');
const btnCancelEvent = document.getElementById('btnCancelEvent');
const eventAdminModalClose = document.getElementById('eventAdminModalClose');

const drawModal = document.getElementById('drawModal');
const drawModalClose = document.getElementById('drawModalClose');
const btnStartDraw = document.getElementById('btnStartDraw');
const drawAnimation = document.getElementById('drawAnimation');
const winnerReveal = document.getElementById('winnerReveal');
let currentDrawEventId = null;

// ===================================
// Initialize
// ===================================
async function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'flex';
    await Promise.all([
        fetchAndRenderProducts(),
        fetchAndRenderProjects(),
        fetchAndRenderTestimonials(),
        fetchAndRenderEvents()
    ]);
}

// ...

function switchSection(section) {
    activeSection = section;
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    catalogSection.style.display = section === 'catalog' ? 'block' : 'none';
    portfolioSection.style.display = section === 'portfolio' ? 'block' : 'none';
    if (testimonialsSection) {
        testimonialsSection.style.display = section === 'testimonials' ? 'block' : 'none';
    }
    if (eventsSection) {
        eventsSection.style.display = section === 'events' ? 'block' : 'none';
    }
}

// ===================================
// CRUD Logic - Events
// ===================================
async function fetchAndRenderEvents() {
    try {
        adminEventsGrid.innerHTML = '<div class="loader">Loading...</div>';
        const response = await api.getEvents();
        events = response.data || [];
        renderEvents();
    } catch (error) {
        console.error('Error fetching events:', error);
        adminEventsGrid.innerHTML = 'Error loading events';
    }
}

function renderEvents() {
    if (events.length === 0) {
        adminEventsGrid.innerHTML = '<p class="no-products">No hay eventos creados.</p>';
        return;
    }

    adminEventsGrid.innerHTML = events.map(event => {
        const isActive = event.isActive ? 'active' : 'inactive';
        const statusLabel = event.isActive ? 'ACTIVO' : 'FINALIZADO';
        const statusColor = event.isActive ? '#4CAF50' : '#888';

        return `
        <div class="admin-product-card event-card" data-id="${event._id}" data-name="${event.title}">
            <div class="event-card-header" style="background: ${statusColor}; color: white; padding: 10px; font-weight: bold; text-align: center;">
                ${statusLabel}
            </div>
            <div class="admin-product-info">
                <h3>${event.title}</h3>
                <p><strong>Premio:</strong> ${event.prize}</p>
                <p><strong>Fin:</strong> ${new Date(event.endDate).toLocaleDateString()}</p>
                
                ${event.winner ? `<p class="winner-badge">🏆 Ganador Seleccionado</p>` : ''}

                <div class="admin-product-actions">
                    <button class="btn-edit">Editar</button>
                    ${!event.winner ? `<button class="btn-draw" onclick="openDrawModal('${event._id}')">🎲 Sortear</button>` : ''}
                    <button class="btn-delete">Eliminar</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

async function saveEvent(eventData) {
    try {
        if (editingEventId) {
            await api.updateEvent(editingEventId, eventData);
            alert('Evento actualizado');
        } else {
            await api.createEvent(eventData);
            alert('Evento creado');
        }
        await fetchAndRenderEvents();
        closeEventAdminModal();
    } catch (error) {
        alert('Error: ' + error.message);
    }
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
        // Format date for datetime-local
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

// Draw Logic window
window.openDrawModal = function (id) {
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
    btnStartDraw.innerHTML = 'Girando...';

    // Simulate animation
    let counter = 0;
    const interval = setInterval(() => {
        drawAnimation.querySelector('h2').textContent = Math.floor(Math.random() * 9999);
        counter++;
        if (counter > 20) { // Stop animation after 2 seconds roughly
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

                btnStartDraw.innerHTML = 'Sorteo Finalizado';
                await fetchAndRenderEvents();
            } else {
                alert(response.message);
                drawModal.classList.remove('active');
            }
        } catch (error) {
            alert('Error al realizar sorteo: ' + error.message);
            btnStartDraw.disabled = false;
        }
    }
}

// ...

// ===================================
// Event Listeners (Updated)
// ===================================
function setupEventListeners() {
    // ... (Previous listeners)

    // Events Section Listeners
    if (btnAddEvent) btnAddEvent.addEventListener('click', () => openEventAdminModal());
    if (btnCancelEvent) btnCancelEvent.addEventListener('click', closeEventAdminModal);
    if (eventAdminModalClose) eventAdminModalClose.addEventListener('click', closeEventAdminModal);

    if (eventAdminForm) {
        eventAdminForm.addEventListener('submit', (e) => {
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
    }

    if (adminEventsGrid) {
        adminEventsGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-edit')) {
                const card = e.target.closest('.event-card');
                openEventAdminModal(card.dataset.id);
            }
            if (e.target.classList.contains('btn-delete')) {
                const card = e.target.closest('.event-card');
                openDeleteModal(card.dataset.id, 'event', card.dataset.name);
            }
        });
    }

    // Draw Modal
    if (drawModalClose) drawModalClose.addEventListener('click', () => drawModal.classList.remove('active'));
    if (btnStartDraw) btnStartDraw.addEventListener('click', performDraw);

    // Delete Action Update
    if (btnConfirmDelete) btnConfirmDelete.addEventListener('click', deleteItemAction);
}

// Update deleteItemAction to handle events
async function deleteItemAction() {
    if (!deletingId) return;
    try {
        let res;
        if (deletingType === 'product') res = await api.deleteProduct(deletingId);
        else if (deletingType === 'project') res = await api.deleteProject(deletingId);
        else if (deletingType === 'testimonial') res = await api.deleteTestimonial(deletingId);
        else if (deletingType === 'event') res = await api.deleteEvent(deletingId); // New!

        if (res.success) {
            setTimeout(async () => {
                if (deletingType === 'product') await fetchAndRenderProducts();
                else if (deletingType === 'project') await fetchAndRenderProjects();
                else if (deletingType === 'testimonial') await fetchAndRenderTestimonials();
                else if (deletingType === 'event') await fetchAndRenderEvents(); // New!
                alert('Eliminado con éxito');
            }, 500);
        }
    } catch (error) {
        alert('Error al eliminar: ' + error.message);
    }
    closeDeleteModal();
}

// Global helper for event delegation
function getTargetData(e, className) {
    const card = e.target.closest('.admin-product-card');
    const btn = e.target.closest(className);
    if (!card || !btn) return null;
    return {
        id: card.dataset.id,
        name: card.dataset.name // We'll add this to the HTML
    };
}

// ===================================
// Preloader & Custom Cursor Logic
// ===================================
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 800);
});

const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

document.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    cursor.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
    cursorDot.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
});

document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('a, button, .admin-product-card, .filter-btn, .nav-item');
    if (target) {
        cursor.classList.add('active');
        cursorDot.classList.add('active');
    }
});

document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('a, button, .admin-product-card, .filter-btn, .nav-item');
    if (target) {
        cursor.classList.remove('active');
        cursorDot.classList.remove('active');
    }
});

// ===================================
// DOM Elements
// ===================================
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnLogout = document.getElementById('btnLogout');
const btnAddProduct = document.getElementById('btnAddProduct');
const btnAddProject = document.getElementById('btnAddProject');
const btnAddTestimonial = document.getElementById('btnAddTestimonial');

// Modal elements
const productModal = document.getElementById('productModal');
const projectFormModal = document.getElementById('projectFormModal');
const testimonialModal = document.getElementById('testimonialModal');
const deleteModal = document.getElementById('deleteModal');
const productForm = document.getElementById('productForm');
const projectForm = document.getElementById('projectForm');
const testimonialForm = document.getElementById('testimonialForm');
const modalTitle = document.getElementById('modalTitle');
const projectModalTitle = document.getElementById('projectModalTitle');
const testimonialModalTitle = document.getElementById('testimonialModalTitle');
const modalClose = document.getElementById('modalClose');
const projectModalClose = document.getElementById('projectModalClose');
const testimonialModalClose = document.getElementById('testimonialModalClose');
const btnCancelProduct = document.getElementById('btnCancelProduct');
const btnCancelProject = document.getElementById('btnCancelProject');
const btnCancelTestimonial = document.getElementById('btnCancelTestimonial');
const deleteModalClose = document.getElementById('deleteModalClose');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const deleteItemName = document.getElementById('deleteItemName');

// File inputs
const productFile = document.getElementById('productFile');
const pThumbFile = document.getElementById('pThumbFile');
const pGalleryFiles = document.getElementById('pGalleryFiles');
const tPhotoFile = document.getElementById('tPhotoFile');
const productImageInput = document.getElementById('productImage');
const pThumbnailInput = document.getElementById('pThumbnail');
const pImageGalleryInput = document.getElementById('pImageGallery');
const tPhotoInput = document.getElementById('tPhoto');

// Stats elements
const totalProductsEl = document.getElementById('totalProducts');
const digitalProductsEl = document.getElementById('digitalProducts');
const physicalProductsEl = document.getElementById('physicalProducts');
const totalProjectsEl = document.getElementById('totalProjects');

// Grids
const adminProductsGrid = document.getElementById('adminProductsGrid');
const adminProjectsGrid = document.getElementById('adminProjectsGrid');

// Filter buttons
const filterBtns = document.querySelectorAll('.filter-btn');

// ===================================
// Initialize
// ===================================
async function init() {
    // Check if we have a token (simple check, validation happens on API call)
    if (api.token) {
        try {
            // Verify token is valid by getting current user
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
}

// ===================================
// Authentication
// ===================================
function showLogin() {
    loginScreen.style.display = 'flex';
    adminDashboard.style.display = 'none';
}

async function showDashboard() {
    loginScreen.style.display = 'none';
    adminDashboard.style.display = 'flex';
    await Promise.all([
        fetchAndRenderProducts(),
        fetchAndRenderProjects(),
        fetchAndRenderTestimonials()
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

function closeProductModal() {
    productModal.classList.remove('active');
    editingProductId = null;
    productForm.reset();
}

function closeProjectModal() {
    projectFormModal.classList.remove('active');
    editingProjectId = null;
    projectForm.reset();
}

function logout() {
    api.logout();
    showLogin();
}

// ===================================
// CRUD Logic - Products
// ===================================
async function fetchAndRenderProducts() {
    try {
        adminProductsGrid.innerHTML = '<div class="loader">Loading...</div>';
        const response = await api.getProducts();
        products = response.data || [];
        renderProducts();
        updateStats();
    } catch (error) {
        console.error('Error fetching products:', error);
        adminProductsGrid.innerHTML = 'Error loading products';
    }
}

// ===================================
// CRUD Logic - Projects
// ===================================
async function fetchAndRenderProjects() {
    try {
        adminProjectsGrid.innerHTML = '<div class="loader">Loading...</div>';
        const response = await api.getProjects();
        projects = response.data || [];
        renderProjects();
        updateStats();
    } catch (error) {
        console.error('Error fetching projects:', error);
        adminProjectsGrid.innerHTML = 'Error loading projects';
    }
}

async function saveProject(projectData) {
    try {
        if (editingProjectId) {
            await api.updateProject(editingProjectId, projectData);
            alert('Proyecto actualizado');
        } else {
            await api.createProject(projectData);
            alert('Proyecto creado');
        }
        await fetchAndRenderProjects();
        closeProjectModal();
    } catch (error) {
        alert('Error al guardar proyecto: ' + error.message);
    }
}

// ===================================
// CRUD Logic - Testimonials
// ===================================
async function fetchAndRenderTestimonials() {
    try {
        const grid = document.getElementById('adminTestimonialsGrid');
        grid.innerHTML = '<div class="loader">Loading...</div>';
        const response = await api.getAllTestimonials();
        testimonials = response.data || [];
        renderTestimonials();
        updateStats();
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        document.getElementById('adminTestimonialsGrid').innerHTML = 'Error loading testimonials';
    }
}

function renderTestimonials() {
    const grid = document.getElementById('adminTestimonialsGrid');
    grid.innerHTML = '';

    if (testimonials.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-muted); padding: 2rem;">No hay clientes destacados aún.</p>';
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
            </div>
            <div class="admin-product-info">
                <h3>${t.clientName}</h3>
                <p class="product-category">${t.businessName}</p>
                <p class="product-description">"${t.comment.substring(0, 60)}${t.comment.length > 60 ? '...' : ''}"</p>
            </div>
            <div class="admin-product-actions">
                <button class="btn-edit">Editar</button>
                <button class="btn-delete">Eliminar</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function saveTestimonial(testimonialData) {
    try {
        if (editingTestimonialId) {
            await api.updateTestimonial(editingTestimonialId, testimonialData);
            alert('Cliente actualizado');
        } else {
            await api.createTestimonial(testimonialData);
            alert('Cliente agregado');
        }
        await fetchAndRenderTestimonials();
        closeTestimonialModal();
    } catch (error) {
        alert('Error al guardar cliente: ' + error.message);
    }
}

function openAddTestimonialModal() {
    testimonialModalTitle.textContent = 'Agregar Cliente Destacado';
    editingTestimonialId = null;
    testimonialForm.reset();
    testimonialModal.classList.add('active');
}

function openEditTestimonialModal(id) {
    const testimonial = testimonials.find(t => t._id === id);
    if (!testimonial) return;

    testimonialModalTitle.textContent = 'Editar Cliente Destacado';
    editingTestimonialId = id;
    document.getElementById('editTestimonialId').value = id;
    document.getElementById('tClientName').value = testimonial.clientName;
    document.getElementById('tBusinessName').value = testimonial.businessName;
    document.getElementById('tComment').value = testimonial.comment;
    document.getElementById('tPhoto').value = testimonial.photo;
    testimonialModal.classList.add('active');
}

function closeTestimonialModal() {
    testimonialModal.classList.remove('active');
    editingTestimonialId = null;
    testimonialForm.reset();
}

async function deleteItemAction() {
    if (!deletingId) return;
    try {
        let res;
        if (deletingType === 'product') {
            res = await api.deleteProduct(deletingId);
        } else if (deletingType === 'project') {
            res = await api.deleteProject(deletingId);
        } else if (deletingType === 'testimonial') {
            res = await api.deleteTestimonial(deletingId);
        }

        if (res.success) {
            setTimeout(async () => {
                if (deletingType === 'product') await fetchAndRenderProducts();
                else if (deletingType === 'project') await fetchAndRenderProjects();
                else if (deletingType === 'testimonial') await fetchAndRenderTestimonials();
                alert('Eliminado con éxito');
            }, 500);
        }
    } catch (error) {
        alert('Error al eliminar: ' + error.message);
    }
    closeDeleteModal();
}

async function addProduct(productData) {
    try {
        await api.createProduct(productData);
        await fetchAndRenderProducts();
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product: ' + error.message);
    }
}

async function updateProduct(id, productData) {
    try {
        await api.updateProduct(id, productData);
        await fetchAndRenderProducts();
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product: ' + error.message);
    }
}

async function deleteProductAction(id) {
    try {
        const response = await api.deleteProduct(id);
        if (response.success) {
            // Small delay to let DB update
            setTimeout(async () => {
                await fetchAndRenderProducts();
                alert('Producto eliminado con éxito');
            }, 500);
        } else {
            throw new Error(response.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('No se pudo eliminar: ' + error.message);
    }
}

function getProduct(id) {
    return products.find(p => p.id === id || p._id === id);
}

// ===================================
// UI Rendering
// ===================================
function renderProducts() {
    const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    const mappedFilter = filter === 'fisico' ? 'physical' : filter;

    const filteredProducts = mappedFilter === 'all'
        ? products
        : products.filter(p => p.category === mappedFilter);

    if (filteredProducts.length === 0) {
        adminProductsGrid.innerHTML = '<div class="no-products">No se encontraron productos</div>';
        return;
    }

    adminProductsGrid.innerHTML = filteredProducts.map(product => {
        const productId = product._id || product.id;
        const imageContent = product.images && product.images.length > 0 && product.images[0].url
            ? `<img src="${product.images[0].url}" alt="${product.name}">`
            : `<span>${getProductIcon(product)}</span>`;

        return `
        <div class="admin-product-card" data-id="${productId}" data-name="${product.name}">
            <div class="admin-product-image" style="background: ${getGradient(product.category, productId)}">
                ${imageContent}
                <span class="category-badge ${product.category}">${product.category === 'digital' ? 'Digital' : 'Físico'}</span>
            </div>
            <div class="admin-product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="admin-product-price">Desde $${product.price}</div>
                <div class="admin-product-actions">
                    <button class="btn-edit">Editar</button>
                    <button class="btn-delete">Eliminar</button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function renderProjects() {
    if (projects.length === 0) {
        adminProjectsGrid.innerHTML = '<div class="no-products">No hay proyectos en el portafolio</div>';
        return;
    }

    adminProjectsGrid.innerHTML = projects.map(project => {
        const projectId = project._id || project.id;
        return `
        <div class="admin-product-card" data-id="${projectId}" data-name="${project.title}">
            <div class="admin-product-image">
                <img src="${project.thumbnail}" alt="${project.title}" onerror="this.src='https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'">
                <span class="category-badge digital">${project.category}</span>
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

function getProductIcon(product) {
    // If icon is stored directly (legacy) or derive from name
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
    // Hash id to get consistent gradient
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

function updateStats() {
    totalProductsEl.textContent = products.length;
    digitalProductsEl.textContent = products.filter(p => p.category === 'digital').length;
    physicalProductsEl.textContent = products.filter(p => p.category === 'physical').length;
    totalProjectsEl.textContent = projects.length;
    if (document.getElementById('totalTestimonials')) {
        document.getElementById('totalTestimonials').textContent = testimonials.length;
    }
}

function switchSection(section) {
    activeSection = section;
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    catalogSection.style.display = section === 'catalog' ? 'block' : 'none';
    portfolioSection.style.display = section === 'portfolio' ? 'block' : 'none';
    if (testimonialsSection) {
        testimonialsSection.style.display = section === 'testimonials' ? 'block' : 'none';
    }
}

// ===================================
// Modal Functions
// ===================================
function openAddModal() {
    editingProductId = null;
    modalTitle.textContent = 'Agregar Producto';
    productForm.reset();
    productModal.classList.add('active');
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
    document.getElementById('editProjectId').value = project._id;
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
    document.getElementById('productIcon').value = getProductIcon(product);
    document.getElementById('productImage').value = (product.images && product.images.length > 0) ? product.images[0].url : '';

    productModal.classList.add('active');
}

function closeProductModal() {
    productModal.classList.remove('active');
    editingProductId = null;
    productForm.reset();
}

function openDeleteModal(id, type, name) {
    deletingId = id;
    deletingType = type;
    deleteItemName.textContent = name;
    deleteModal.classList.add('active');
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
    deletingId = null;
    deletingType = null;
}

// ===================================
// Event Listeners
// ===================================
function setupEventListeners() {
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section) switchSection(section);
        });
    });

    // Login form
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        loginError.textContent = 'Iniciando sesión...';

        const result = await handleLogin(email, password);
        if (result.success) {
            loginError.textContent = '';
        } else {
            loginError.textContent = result.message || 'Credenciales incorrectas. Intenta de nuevo.';
        }
    });

    // Logout
    btnLogout.addEventListener('click', logout);

    // Add product button
    btnAddProduct.addEventListener('click', openAddModal);

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (section) switchSection(section);
        });
    });

    // Modal close buttons
    modalClose.addEventListener('click', closeProductModal);
    btnCancelProduct.addEventListener('click', closeProductModal);
    projectModalClose.addEventListener('click', closeProjectModal);
    btnCancelProject.addEventListener('click', closeProjectModal);
    testimonialModalClose.addEventListener('click', closeTestimonialModal);
    btnCancelTestimonial.addEventListener('click', closeTestimonialModal);
    deleteModalClose.addEventListener('click', closeDeleteModal);
    btnCancelDelete.addEventListener('click', closeDeleteModal);

    btnAddProduct.addEventListener('click', openAddModal);
    btnAddProject.addEventListener('click', openAddProjectModal);
    btnAddTestimonial.addEventListener('click', openAddTestimonialModal);

    // Product form submit
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Map form values to API structure
        const categoryVal = document.getElementById('productCategory').value;
        const apiCategory = categoryVal === 'fisico' ? 'physical' : categoryVal;

        const imageUrl = document.getElementById('productImage').value;

        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            category: apiCategory,
            subcategory: 'General', // Default subcategory
            price: parseInt(document.getElementById('productPrice').value),
            images: imageUrl ? [{ url: imageUrl, isPrimary: true }] : [],
            // We can also store icon if we extend the model, or just use it for display
            // For now, let's assume we might depend on images or defaults
            stock: 100 // Default stock
        };

        if (editingProductId) {
            updateProduct(editingProductId, productData);
        } else {
            addProduct(productData);
        }

        closeProductModal();
    });

    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const galleryRaw = document.getElementById('pImageGallery').value;
        const images = galleryRaw.split(',').map(url => ({ url: url.trim() })).filter(img => img.url);

        const projectData = {
            title: document.getElementById('pTitle').value,
            client: document.getElementById('pClient').value,
            category: document.getElementById('pCategory').value,
            description: document.getElementById('pDescription').value,
            thumbnail: document.getElementById('pThumbnail').value,
            images: images
        };

        saveProject(projectData);
    });

    // Testimonial form submit
    testimonialForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const testimonialData = {
            clientName: document.getElementById('tClientName').value,
            businessName: document.getElementById('tBusinessName').value,
            comment: document.getElementById('tComment').value,
            photo: document.getElementById('tPhoto').value
        };

        saveTestimonial(testimonialData);
    });

    // Testimonial photo file upload
    if (tPhotoFile) {
        tPhotoFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            tPhotoInput.value = 'Subiendo...';
            try {
                const result = await api.uploadImage(file);
                tPhotoInput.value = result.url || result.data?.url || '';
            } catch (error) {
                alert('Error al subir imagen: ' + error.message);
                tPhotoInput.value = '';
            }
        });
    }

    // Delete confirm
    btnConfirmDelete.addEventListener('click', deleteItemAction);

    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            // Map 'fisico' to 'physical' if needed depending on how backend returns data
            // Since backend uses 'physical', but UI button might use 'fisico'
            currentFilter = filter === 'fisico' ? 'physical' : filter;

            // If API returns 'category: physical' but button is 'fisico', we need to match
            // Actually, let's keep it simple: filter on frontend array
            // If button is 'fisico', filter products where category is 'fisico' or 'physical'
            if (btn.dataset.filter === 'fisico') currentFilter = 'physical';
            else currentFilter = btn.dataset.filter;

            renderProducts();
        });
    });

    // Grid Event Delegation
    adminProductsGrid.addEventListener('click', (e) => {
        const editData = getTargetData(e, '.btn-edit');
        if (editData) openEditModal(editData.id);

        const deleteData = getTargetData(e, '.btn-delete');
        if (deleteData) openDeleteModal(deleteData.id, 'product', deleteData.name);
    });

    adminProjectsGrid.addEventListener('click', (e) => {
        const editData = getTargetData(e, '.btn-edit');
        if (editData) openEditProjectModal(editData.id);

        const deleteData = getTargetData(e, '.btn-delete');
        if (deleteData) openDeleteModal(deleteData.id, 'project', deleteData.name);
    });

    // Close modals on outside click
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
    });

    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    projectFormModal.addEventListener('click', (e) => {
        if (e.target === projectFormModal) closeProjectModal();
    });

    testimonialModal.addEventListener('click', (e) => {
        if (e.target === testimonialModal) closeTestimonialModal();
    });

    // Testimonial grid delegation
    const adminTestimonialsGrid = document.getElementById('adminTestimonialsGrid');
    if (adminTestimonialsGrid) {
        adminTestimonialsGrid.addEventListener('click', (e) => {
            const editData = getTargetData(e, '.btn-edit');
            if (editData) openEditTestimonialModal(editData.id);

            const deleteData = getTargetData(e, '.btn-delete');
            if (deleteData) openDeleteModal(deleteData.id, 'testimonial', deleteData.name);
        });
    }

    // File Upload Listeners
    productFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            productImageInput.value = 'Subiendo...';
            const res = await api.uploadImage(file);
            if (res.success) {
                productImageInput.value = res.data.url;
            }
        } catch (error) {
            console.error('Upload error:', error);
            productImageInput.value = '';
            alert('Error al subir imagen');
        }
    });

    pThumbFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            pThumbnailInput.value = 'Subiendo...';
            const res = await api.uploadImage(file);
            if (res.success) {
                pThumbnailInput.value = res.data.url;
            }
        } catch (error) {
            console.error('Upload error:', error);
            pThumbnailInput.value = '';
            alert('Error al subir miniatura');
        }
    });

    pGalleryFiles.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files.length === 0) return;

        try {
            const currentVal = pImageGalleryInput.value;
            pImageGalleryInput.value = (currentVal ? currentVal + ', ' : '') + 'Subiendo ' + files.length + ' imágenes...';

            const res = await api.uploadImages(files);
            if (res.success) {
                const newUrls = res.data.map(img => img.url).join(', ');
                pImageGalleryInput.value = (currentVal ? currentVal + ', ' : '') + newUrls;
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error al subir imágenes a la galería');
        }
    });
}

// Make functions available globally just in case, but using delegation is safer
window.openAddModal = openAddModal;
window.openAddProjectModal = openAddProjectModal;
window.switchSection = switchSection;

// Initialize on load
init();
