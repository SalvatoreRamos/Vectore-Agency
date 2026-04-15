// ===================================
// State Management
// ===================================
let products = [];
let projects = [];
let testimonials = [];

let events = [];
let flowAssets = [];
let leads = [];
let activeSection = 'catalog';
let selectedLeadId = null;
let leadFilter = 'all';
let leadSearchTerm = '';

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
const flowSection = document.getElementById('flowSection');
const briefsSection = document.getElementById('briefsSection');
const notificationsSection = document.getElementById('notificationsSection');
const usersSection = document.getElementById('usersSection');
const ordersSection = document.getElementById('ordersSection');

let adminOrders = [];
let ordersFilter = 'all';

// Action Buttons
const btnAddProduct = document.getElementById('btnAddProduct');
const btnAddProject = document.getElementById('btnAddProject');
const btnAddTestimonial = document.getElementById('btnAddTestimonial');

const btnAddEvent = document.getElementById('btnAddEvent');
const btnAddFlow = document.getElementById('btnAddFlow');

// Modals
const productModal = document.getElementById('productModal');
const projectFormModal = document.getElementById('projectFormModal');
const testimonialModal = document.getElementById('testimonialModal');
const eventAdminModal = document.getElementById('eventAdminModal');
const deleteModal = document.getElementById('deleteModal');

const drawModal = document.getElementById('drawModal');
const flowModal = document.getElementById('flowModal');

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
const adminFlowGrid = document.getElementById('adminFlowGrid');
const briefsList = document.getElementById('briefsList');

// Stats
const totalProductsEl = document.getElementById('totalProducts');
const digitalProductsEl = document.getElementById('digitalProducts');
const physicalProductsEl = document.getElementById('physicalProducts');
const totalProjectsEl = document.getElementById('totalProjects');
const totalLeadsEl = document.getElementById('totalLeads');
const newLeadsEl = document.getElementById('newLeads');
const contactedLeadsEl = document.getElementById('contactedLeads');
const closedLeadsEl = document.getElementById('closedLeads');

// Navigation & Filters
let navItems = document.querySelectorAll('.nav-item');
const productFilterBtns = document.querySelectorAll('[data-filter]');

// Brief Inbox
const leadSearchInput = document.getElementById('leadSearchInput');
const briefDetailEmpty = document.getElementById('briefDetailEmpty');
const briefDetailContent = document.getElementById('briefDetailContent');
const briefDetailStatusBadge = document.getElementById('briefDetailStatusBadge');
const briefDetailPriorityBadge = document.getElementById('briefDetailPriorityBadge');
const briefDetailName = document.getElementById('briefDetailName');
const briefDetailMeta = document.getElementById('briefDetailMeta');
const briefDetailScore = document.getElementById('briefDetailScore');
const briefDetailService = document.getElementById('briefDetailService');
const briefDetailTimeline = document.getElementById('briefDetailTimeline');
const briefDetailBudget = document.getElementById('briefDetailBudget');
const briefDetailSource = document.getElementById('briefDetailSource');
const briefDetailDescription = document.getElementById('briefDetailDescription');
const briefDetailEmail = document.getElementById('briefDetailEmail');
const briefDetailCompany = document.getElementById('briefDetailCompany');
const briefDetailCreatedAt = document.getElementById('briefDetailCreatedAt');
const briefDetailUpdatedAt = document.getElementById('briefDetailUpdatedAt');
const briefStatusSelect = document.getElementById('briefStatusSelect');
const briefPrioritySelect = document.getElementById('briefPrioritySelect');
const briefNotesInput = document.getElementById('briefNotesInput');
const briefSaveBtn = document.getElementById('briefSaveBtn');
const briefMarkUnreadBtn = document.getElementById('briefMarkUnreadBtn');

// File Inputs & Image URL Fields
const productImageInput = document.getElementById('productImage');
const pThumbnailInput = document.getElementById('pThumbnail');
const pImageGalleryInput = document.getElementById('pImageGallery');
const tPhotoInput = document.getElementById('tPhoto');

const productFile = document.getElementById('productFile');
const pThumbFile = document.getElementById('pThumbFile');
const pGalleryFiles = document.getElementById('pGalleryFiles');

const tPhotoFile = document.getElementById('tPhotoFile');
const fFile = document.getElementById('fFile');

// Close Buttons
const modalClose = document.getElementById('modalClose');
const projectModalClose = document.getElementById('projectModalClose');
const testimonialModalClose = document.getElementById('testimonialModalClose');
const eventAdminModalClose = document.getElementById('eventAdminModalClose');
const deleteModalClose = document.getElementById('deleteModalClose');
const drawModalClose = document.getElementById('drawModalClose');
const flowModalClose = document.getElementById('flowModalClose');

const btnCancelProduct = document.getElementById('btnCancelProduct');
const btnCancelProject = document.getElementById('btnCancelProject');
const btnCancelTestimonial = document.getElementById('btnCancelTestimonial');
const btnCancelEvent = document.getElementById('btnCancelEvent');
const btnCancelFlow = document.getElementById('btnCancelFlow');
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
        fetchAndRenderEvents(),
        fetchAndRenderFlowAssets(),
        fetchAndRenderLeads()
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
    if (flowSection) flowSection.style.display = section === 'flow' ? 'block' : 'none';
    if (briefsSection) briefsSection.style.display = section === 'briefs' ? 'block' : 'none';
    if (notificationsSection) notificationsSection.style.display = section === 'notifications' ? 'block' : 'none';
    if (usersSection) usersSection.style.display = section === 'users' ? 'block' : 'none';
    if (ordersSection) ordersSection.style.display = section === 'orders' ? 'block' : 'none';

    // Load data when switching to specific sections
    if (section === 'briefs') fetchAndRenderLeads();
    if (section === 'notifications') fetchAndRenderAdminNotifs();
    if (section === 'users') fetchAndRenderUsers();
    if (section === 'orders') fetchAndRenderOrders();
}

// ===================================
// Rendering Functions
// ===================================
function updateStats() {
    if (totalProductsEl) totalProductsEl.textContent = products.length;
    if (digitalProductsEl) digitalProductsEl.textContent = products.filter(p => p.category === 'digital').length;
    if (physicalProductsEl) physicalProductsEl.textContent = products.filter(p => p.category !== 'digital').length;
    if (totalProjectsEl) totalProjectsEl.textContent = projects.length;
    if (document.getElementById('totalTestimonials')) {
        document.getElementById('totalTestimonials').textContent = testimonials.length;
    }
    updateLeadStats();
}

const leadStatusMeta = {
    new: { label: 'Pendiente', tone: 'pending' },
    contacted: { label: 'Respondido', tone: 'contacted' },
    qualified: { label: 'Calificado', tone: 'qualified' },
    closed: { label: 'Finalizado', tone: 'closed' }
};

const leadPriorityMeta = {
    low: { label: 'Baja', tone: 'low' },
    medium: { label: 'Media', tone: 'medium' },
    high: { label: 'Alta', tone: 'high' }
};

const leadServiceLabels = {
    ai_agents: 'AI Agents & Automation',
    '3d_renders': '3D Renders & Digital Assets',
    branding: 'Brand Identity & Design',
    saas: 'SaaS / Web Application',
    other: 'Other / Not sure yet',
    '': 'Sin definir'
};

const leadTimelineLabels = {
    asap: 'ASAP',
    '1-2_months': '1-2 meses',
    '3+_months': '3+ meses',
    exploring: 'Explorando opciones',
    '': 'Sin definir'
};

const leadBudgetLabels = {
    under_5k: 'Menos de $5,000',
    '5k-15k': '$5,000 - $15,000',
    '15k-50k': '$15,000 - $50,000',
    '50k+': '$50,000+',
    not_sure: 'No definido',
    '': 'Sin definir'
};

function getLeadStatusInfo(status) {
    return leadStatusMeta[status] || leadStatusMeta.new;
}

function getLeadPriorityInfo(priority) {
    return leadPriorityMeta[priority] || leadPriorityMeta.medium;
}

function getLeadServiceLabel(service) {
    return leadServiceLabels[service] || service || 'Sin definir';
}

function getLeadTimelineLabel(timeline) {
    return leadTimelineLabels[timeline] || timeline || 'Sin definir';
}

function getLeadBudgetLabel(budget) {
    return leadBudgetLabels[budget] || budget || 'Sin definir';
}

function getLeadSourceLabel(source) {
    return source === 'es' ? 'Peru' : 'Internacional';
}

function formatLeadDate(dateValue, options = {}) {
    if (!dateValue) return '-';

    return new Date(dateValue).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
    });
}

function formatLeadShortDate(dateValue) {
    if (!dateValue) return '-';

    return new Date(dateValue).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function updateLeadStats() {
    if (totalLeadsEl) totalLeadsEl.textContent = leads.length;
    if (newLeadsEl) newLeadsEl.textContent = leads.filter(lead => lead.status === 'new').length;
    if (contactedLeadsEl) contactedLeadsEl.textContent = leads.filter(lead => lead.status === 'contacted').length;
    if (closedLeadsEl) closedLeadsEl.textContent = leads.filter(lead => lead.status === 'closed').length;
}

function getFilteredLeads() {
    const query = leadSearchTerm.trim().toLowerCase();
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    return [...leads]
        .filter(lead => leadFilter === 'all' || lead.status === leadFilter)
        .filter(lead => {
            if (!query) return true;

            const haystack = [
                lead.name,
                lead.email,
                lead.company,
                getLeadServiceLabel(lead.service),
                getLeadBudgetLabel(lead.budget),
                getLeadTimelineLabel(lead.timeline)
            ].join(' ').toLowerCase();

            return haystack.includes(query);
        })
        .sort((a, b) => {
            const unreadA = a.readAt ? 1 : 0;
            const unreadB = b.readAt ? 1 : 0;
            if (unreadA !== unreadB) return unreadA - unreadB;

            const priorityDiff = (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
            if (priorityDiff !== 0) return priorityDiff;

            return new Date(b.createdAt) - new Date(a.createdAt);
        });
}

async function fetchAndRenderLeads() {
    if (!briefsList) return;

    briefsList.innerHTML = '<div class="lead-list__empty">Cargando briefs...</div>';

    try {
        const response = await api.getLeads();
        leads = response.data || [];

        if (!selectedLeadId && leads.length > 0) {
            selectedLeadId = leads[0]._id;
        }

        if (selectedLeadId && !leads.some(lead => lead._id === selectedLeadId)) {
            selectedLeadId = leads[0]?._id || null;
        }

        updateLeadStats();
        renderLeadList();
        renderLeadDetail();
    } catch (error) {
        console.error('Error fetching briefs:', error);
        briefsList.innerHTML = '<div class="lead-list__empty">No se pudieron cargar los briefs.</div>';
        renderLeadDetail();
    }
}

function renderLeadList() {
    if (!briefsList) return;

    const filteredLeads = getFilteredLeads();

    if (filteredLeads.length > 0 && !filteredLeads.some(lead => lead._id === selectedLeadId)) {
        selectedLeadId = filteredLeads[0]._id;
    }

    if (filteredLeads.length === 0) {
        selectedLeadId = null;
    }

    if (filteredLeads.length === 0) {
        briefsList.innerHTML = '<div class="lead-list__empty">No hay briefs para este filtro.</div>';
        return;
    }

    briefsList.innerHTML = filteredLeads.map(lead => {
        const statusInfo = getLeadStatusInfo(lead.status);
        const priorityInfo = getLeadPriorityInfo(lead.priority);
        const companyOrEmail = lead.company || lead.email;
        const summary = [getLeadServiceLabel(lead.service), getLeadBudgetLabel(lead.budget), getLeadTimelineLabel(lead.timeline)]
            .filter(Boolean)
            .join(' · ');

        return `
        <article class="lead-card ${selectedLeadId === lead._id ? 'is-selected' : ''} ${!lead.readAt ? 'is-unread' : ''}" data-lead-id="${lead._id}">
            <div class="lead-card__header">
                <div>
                    <h3>${lead.name}</h3>
                    <p>${companyOrEmail}</p>
                </div>
                <span class="lead-badge lead-badge--priority lead-badge--${priorityInfo.tone}">${priorityInfo.label}</span>
            </div>
            <div class="lead-card__meta">
                <span class="lead-badge lead-badge--${statusInfo.tone}">${statusInfo.label}</span>
                ${!lead.readAt ? '<span class="lead-badge lead-badge--unread">Nuevo</span>' : ''}
            </div>
            <p class="lead-card__summary">${summary}</p>
            <div class="lead-card__footer">
                <span>${lead.email}</span>
                <span>${formatLeadShortDate(lead.createdAt)}</span>
            </div>
        </article>`;
    }).join('');
}

function renderLeadDetail() {
    const lead = leads.find(item => item._id === selectedLeadId);

    if (!lead || !briefDetailContent || !briefDetailEmpty) {
        if (briefDetailContent) briefDetailContent.style.display = 'none';
        if (briefDetailEmpty) briefDetailEmpty.style.display = 'grid';
        return;
    }

    const statusInfo = getLeadStatusInfo(lead.status);
    const priorityInfo = getLeadPriorityInfo(lead.priority);

    briefDetailEmpty.style.display = 'none';
    briefDetailContent.style.display = 'block';

    briefDetailStatusBadge.textContent = statusInfo.label;
    briefDetailStatusBadge.className = `lead-badge lead-badge--${statusInfo.tone}`;

    briefDetailPriorityBadge.textContent = `Prioridad ${priorityInfo.label}`;
    briefDetailPriorityBadge.className = `lead-badge lead-badge--priority lead-badge--${priorityInfo.tone}`;

    briefDetailName.textContent = lead.name;
    briefDetailMeta.textContent = `${lead.company || 'Sin empresa'} · ${formatLeadDate(lead.createdAt)}`;
    briefDetailScore.textContent = `${lead.qualificationScore || 0}/100`;
    briefDetailService.textContent = getLeadServiceLabel(lead.service);
    briefDetailTimeline.textContent = getLeadTimelineLabel(lead.timeline);
    briefDetailBudget.textContent = getLeadBudgetLabel(lead.budget);
    briefDetailSource.textContent = getLeadSourceLabel(lead.source);
    briefDetailDescription.textContent = lead.description || 'El cliente no dejó un brief detallado.';
    briefDetailEmail.textContent = lead.email;
    briefDetailEmail.href = `mailto:${lead.email}`;
    briefDetailCompany.textContent = lead.company || 'No especificada';
    briefDetailCreatedAt.textContent = formatLeadDate(lead.createdAt);
    briefDetailUpdatedAt.textContent = formatLeadDate(lead.lastStatusChangeAt || lead.updatedAt);
    briefStatusSelect.value = lead.status || 'new';
    briefPrioritySelect.value = lead.priority || 'medium';
    briefNotesInput.value = lead.internalNotes || '';
    briefMarkUnreadBtn.disabled = !lead.readAt;
}

function updateLeadInState(updatedLead) {
    const index = leads.findIndex(lead => lead._id === updatedLead._id);
    if (index === -1) {
        leads.unshift(updatedLead);
    } else {
        leads[index] = updatedLead;
    }

    updateLeadStats();
    renderLeadList();
    renderLeadDetail();
}

function selectLead(leadId, { markAsRead = true } = {}) {
    selectedLeadId = leadId;
    renderLeadList();
    renderLeadDetail();

    const lead = leads.find(item => item._id === leadId);
    if (!lead || lead.readAt || !markAsRead) return;

    lead.readAt = new Date().toISOString();
    renderLeadList();
    renderLeadDetail();

    api.updateLead(leadId, { markAsRead: true })
        .then(response => updateLeadInState(response.data))
        .catch(error => {
            console.error('Error marking brief as read:', error);
            lead.readAt = null;
            renderLeadList();
            renderLeadDetail();
        });
}

async function saveSelectedLeadChanges() {
    const lead = leads.find(item => item._id === selectedLeadId);
    if (!lead || !briefSaveBtn) return;

    const originalText = briefSaveBtn.textContent;
    briefSaveBtn.disabled = true;
    briefSaveBtn.textContent = 'Guardando...';

    try {
        const response = await api.updateLead(lead._id, {
            status: briefStatusSelect.value,
            priority: briefPrioritySelect.value,
            internalNotes: briefNotesInput.value
        });

        updateLeadInState(response.data);
        briefSaveBtn.textContent = 'Guardado';
    } catch (error) {
        console.error('Error saving brief:', error);
        alert(`No se pudo guardar el brief: ${error.message}`);
        briefSaveBtn.textContent = originalText;
    } finally {
        setTimeout(() => {
            briefSaveBtn.disabled = false;
            briefSaveBtn.textContent = originalText;
        }, 900);
    }
}

async function markSelectedLeadAsUnread() {
    const lead = leads.find(item => item._id === selectedLeadId);
    if (!lead || !lead.readAt || !briefMarkUnreadBtn) return;

    const originalText = briefMarkUnreadBtn.textContent;
    briefMarkUnreadBtn.disabled = true;
    briefMarkUnreadBtn.textContent = 'Actualizando...';

    try {
        const response = await api.updateLead(lead._id, { markAsUnread: true });
        updateLeadInState(response.data);
    } catch (error) {
        console.error('Error updating unread state:', error);
        alert(`No se pudo actualizar el estado de lectura: ${error.message}`);
    } finally {
        briefMarkUnreadBtn.disabled = false;
        briefMarkUnreadBtn.textContent = originalText;
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
    const filter = document.querySelector('[data-filter].active')?.dataset.filter || 'all';

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter);

    if (filteredProducts.length === 0) {
        adminProductsGrid.innerHTML = '<div class="no-products">No se encontraron productos</div>';
        return;
    }

    adminProductsGrid.innerHTML = filteredProducts.map(product => {
        const productId = product._id || product.id;
        const imageContent = product.images && product.images.length > 0 && product.images[0].url
            ? `<img src="${product.images[0].url}" alt="${product.name}">`
            : `<span>${getProductIcon(product)}</span>`;

        // Format price and unit
        const priceDisplay = (product.unit && product.unit !== 'unidad')
            ? `S/ ${product.price} / ${product.unit}`
            : `Desde S/ ${product.price}`;

        // Format labels
        const categoryMap = {
            'diseno': '🎨 Diseño', 'impresion': '🖨️ Impresión',
            'packaging': '📦 Packaging', 'senalizacion': '🔧 Señalización',
            'vinilo': '🚗 Vinilo', 'digital': '💻 Digital', 'espacios': '🏠 Espacios'
        };
        const catLabel = categoryMap[product.category] || product.category;

        return `
        <div class="admin-product-card" data-id="${productId}" data-name="${product.name}">
            <div class="admin-product-image" style="background: ${getGradient(product.category, productId)}">
                ${imageContent}
                <div class="product-protection-overlay"></div>
                ${product.material ? `<span class="category-badge" style="background: rgba(0,0,0,0.6); top: 10px; left: 10px; position: absolute;">${product.material}</span>` : ''}
            </div>
            <div class="admin-product-info">
                <h3>${product.name}</h3>
                <p style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 5px;">${catLabel} • ${product.subcategory || ''}</p>
                <p>${product.description}</p>
                ${product.deliveryTime ? `<p style="font-size: 0.8rem; color: #888; margin-top: 5px;">⏳ ${product.deliveryTime}</p>` : ''}
                <div class="admin-product-price">${priceDisplay}</div>
                <div class="admin-product-actions">
                    <button class="btn-edit">Editar</button>
                    <button class="btn-delete">Eliminar</button>
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
    
    // Add global project filter variable if not defined
    if (typeof window.projectFilter === 'undefined') window.projectFilter = 'all';
    
    const filteredProjects = window.projectFilter === 'all' 
        ? projects 
        : projects.filter(p => p.scope === window.projectFilter);

    if (filteredProjects.length === 0) {
        adminProjectsGrid.innerHTML = '<div class=\"no-products\">No hay proyectos en el portafolio para este filtro</div>';
        return;
    }

    adminProjectsGrid.innerHTML = filteredProjects.map(project => {
        const projectId = project._id || project.id;
        const isVideo = project.thumbnail && (
            project.thumbnail.match(/\.(mp4|webm|ogg|mov|avi|flv|wmv)$/i) ||
            project.thumbnail.includes('/video/upload/')
        );
        const scopeLabel = project.scope === 'global' ? '🌍 Global' : '🇵🇪 Local';

        return `
        <div class="admin-product-card" data-id="${projectId}" data-name="${project.title}">
            <div class="admin-product-image">
                ${isVideo ?
                `<video src="${project.thumbnail}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>` :
                `<img src="${project.thumbnail}" alt="${project.title}" onerror="this.src='https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'">`
            }
                <div class="product-protection-overlay"></div>
                <span class="category-badge digital" style="top: 10px; right: 10px;">${scopeLabel}</span>
                <span class="category-badge digital" style="bottom: 10px; right: 10px;">${project.category}</span>
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
                </div>
            </div>
        </div>`;
    }).join('');
}

async function fetchAndRenderFlowAssets() {
    try {
        const flowGrid = document.getElementById('adminFlowGrid');
        if (!flowGrid) return;

        flowGrid.innerHTML = '<div class="loader">Loading...</div>';
        const response = await api.getSoftwareAssets();

        if (response.success) {
            flowAssets = response.data || [];
            renderFlowAssets();
        } else {
            flowGrid.innerHTML = 'Error loading assets';
        }
    } catch (error) {
        console.error('Error fetching flow assets:', error);
        const flowGrid = document.getElementById('adminFlowGrid');
        if (flowGrid) flowGrid.innerHTML = 'Error loading assets';
    }
}

function renderFlowAssets() {
    const flowGrid = document.getElementById('adminFlowGrid');
    if (!flowGrid) return;

    if (flowAssets.length === 0) {
        flowGrid.innerHTML = '<p class="no-products">No hay imágenes en Flow.</p>';
        return;
    }

    flowGrid.innerHTML = flowAssets.map(asset => {
        // Use either _id or id depending on what backend sends
        const assetId = asset._id || asset.id;

        // Ensure image URL is valid
        const imgUrl = asset.url || 'https://via.placeholder.com/300x200?text=No+Image';

        return `
        <div class="admin-product-card flow-card" data-id="${assetId}" data-name="${asset.title}">
            <div class="admin-product-image">
                <img src="${imgUrl}" alt="${asset.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Error'">
                <div class="product-protection-overlay"></div>
                <span class="category-badge digital" style="background: #8655FF;">${asset.section || 'General'}</span>
            </div>
            <div class="admin-product-info">
                <h3 style="margin-bottom: 5px;">${asset.title}</h3>
                <p style="font-size: 0.8rem; opacity: 0.7; margin-bottom: 10px;">${asset.section}</p>
                <div class="admin-product-actions">
                     <button class="btn-edit" onclick="navigator.clipboard.writeText('${imgUrl}').then(() => alert('URL copiada'))">Copiar URL</button>
                    <button class="btn-delete">Eliminar</button>
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

async function saveFlowAsset(data) {
    try {
        await api.createSoftwareAsset(data);
        await fetchAndRenderFlowAssets();
        closeFlowModal();
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
        else if (deletingType === 'flow') res = await api.deleteSoftwareAsset(deletingId);

        if (res.success) {
            setTimeout(async () => {
                if (deletingType === 'product') await fetchAndRenderProducts();
                else if (deletingType === 'project') await fetchAndRenderProjects();
                else if (deletingType === 'testimonial') await fetchAndRenderTestimonials();
                else if (deletingType === 'event') await fetchAndRenderEvents();
                else if (deletingType === 'flow') await fetchAndRenderFlowAssets();
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
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productSubcategory').value = product.subcategory || '';
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productUnit').value = product.unit || 'unidad';
    document.getElementById('productDeliveryTime').value = product.deliveryTime || '';
    document.getElementById('productMaterial').value = product.material || '';
    document.getElementById('productDimensions').value = product.dimensions || '';
    document.getElementById('productMinQuantity').value = product.minQuantity || 1;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productIcon').value = product.icon || '🎨';
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
    document.getElementById('pScope').value = project.scope || 'local';
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

function openFlowModal() {
    const form = document.getElementById('flowForm');
    if (form) form.reset();
    flowModal.classList.add('active');
}

function closeFlowModal() {
    flowModal.classList.remove('active');
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

    // Product filter
    productFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            productFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts();
        });
    });

    // Brief filters
    document.querySelectorAll('[data-lead-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-lead-filter]').forEach(button => button.classList.remove('active'));
            btn.classList.add('active');
            leadFilter = btn.dataset.leadFilter;
            renderLeadList();
            renderLeadDetail();
        });
    });

    if (leadSearchInput) {
        leadSearchInput.addEventListener('input', (event) => {
            leadSearchTerm = event.target.value || '';
            renderLeadList();
            renderLeadDetail();
        });
    }

    if (briefsList) {
        briefsList.addEventListener('click', (event) => {
            const card = event.target.closest('[data-lead-id]');
            if (!card) return;
            selectLead(card.dataset.leadId);
        });
    }

    if (briefSaveBtn) {
        briefSaveBtn.addEventListener('click', saveSelectedLeadChanges);
    }

    if (briefMarkUnreadBtn) {
        briefMarkUnreadBtn.addEventListener('click', markSelectedLeadAsUnread);
    }

    // Action Buttons
    if (btnAddProduct) btnAddProduct.addEventListener('click', openAddModal);
    if (btnAddProject) btnAddProject.addEventListener('click', openAddProjectModal);
    if (btnAddTestimonial) btnAddTestimonial.addEventListener('click', openAddTestimonialModal);

    if (btnAddEvent) btnAddEvent.addEventListener('click', () => openEventAdminModal());
    if (btnAddFlow) btnAddFlow.addEventListener('click', openFlowModal);

    // Modals
    if (modalClose) modalClose.addEventListener('click', closeProductModal);
    if (btnCancelProduct) btnCancelProduct.addEventListener('click', closeProductModal);
    if (projectModalClose) projectModalClose.addEventListener('click', closeProjectModal);
    if (btnCancelProject) btnCancelProject.addEventListener('click', closeProjectModal);
    if (testimonialModalClose) testimonialModalClose.addEventListener('click', closeTestimonialModal);
    if (btnCancelTestimonial) btnCancelTestimonial.addEventListener('click', closeTestimonialModal);
    if (eventAdminModalClose) eventAdminModalClose.addEventListener('click', closeEventAdminModal);

    if (btnCancelEvent) btnCancelEvent.addEventListener('click', closeEventAdminModal);
    if (flowModalClose) flowModalClose.addEventListener('click', closeFlowModal);
    if (btnCancelFlow) btnCancelFlow.addEventListener('click', closeFlowModal);
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
            category: cat,
            subcategory: document.getElementById('productSubcategory').value || 'General',
            price: parseInt(document.getElementById('productPrice').value) || 0,
            unit: document.getElementById('productUnit').value || 'unidad',
            deliveryTime: document.getElementById('productDeliveryTime').value || '',
            material: document.getElementById('productMaterial').value || '',
            dimensions: document.getElementById('productDimensions').value || '',
            minQuantity: parseInt(document.getElementById('productMinQuantity').value) || 1,
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
            scope: document.getElementById('pScope').value,
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

    if (document.getElementById('flowForm')) {
        document.getElementById('flowForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                title: document.getElementById('fTitle').value,
                section: document.getElementById('fSection').value,
                url: document.getElementById('fUrl').value
            };
            saveFlowAsset(data);
        });
    }

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
    if (adminFlowGrid) adminFlowGrid.addEventListener('click', (e) => {
        const del = getTargetData(e, '.btn-delete'); if (del) openDeleteModal(del.id, 'flow', del.name);
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

    if (fFile) fFile.addEventListener('change', async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try {
            document.getElementById('fUrl').value = 'Subiendo...';
            const res = await api.uploadImage(f);
            if (res.success) document.getElementById('fUrl').value = res.data.url;
            else throw new Error(res.message);
        } catch (error) {
            alert('Error subiendo imagen flow: ' + error.message);
            document.getElementById('fUrl').value = '';
            fFile.value = '';
        }
    });
}

// Cursor
document.addEventListener('mousemove', (e) => {
    if (cursor) cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
    if (cursorDot) cursorDot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
});

window.switchSection = switchSection;

// ===================================
// Admin Notifications
// ===================================
const adminNotifForm = document.getElementById('adminNotifForm');
const notifTarget = document.getElementById('notifTarget');
const notifEmailGroup = document.getElementById('notifEmailGroup');
const adminNotifsGrid = document.getElementById('adminNotifsGrid');

// Show/hide email field based on target selection
if (notifTarget) {
    notifTarget.addEventListener('change', () => {
        if (notifEmailGroup) {
            notifEmailGroup.style.display = notifTarget.value === 'specific' ? 'block' : 'none';
        }
    });
}

// Submit form to create notification
if (adminNotifForm) {
    adminNotifForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = {
            title: document.getElementById('notifTitle').value,
            message: document.getElementById('notifMessage').value,
            type: document.getElementById('notifType').value,
            target: notifTarget.value
        };

        if (notifTarget.value === 'specific') {
            data.targetEmail = document.getElementById('notifEmail').value;
            if (!data.targetEmail) {
                alert('Por favor ingresa el correo del usuario');
                return;
            }
        }

        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api.token}`
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.success) {
                alert('✅ Notificación enviada');
                adminNotifForm.reset();
                if (notifEmailGroup) notifEmailGroup.style.display = 'none';
                fetchAndRenderAdminNotifs();
            } else {
                alert('Error: ' + (result.message || 'No se pudo enviar'));
            }
        } catch (error) {
            alert('Error de conexión: ' + error.message);
        }
    });
}

async function fetchAndRenderAdminNotifs() {
    if (!adminNotifsGrid) return;
    adminNotifsGrid.innerHTML = '<div class="loader">Cargando...</div>';

    try {
        const res = await fetch('/api/notifications/admin', {
            headers: { 'Authorization': `Bearer ${api.token}` }
        });
        const data = await res.json();

        if (data.success && data.notifications.length > 0) {
            const typeIcons = { offer: '🏷️', winner: '🏆', general: '📢' };
            const typeLabels = { offer: 'Oferta', winner: 'Ganador', general: 'Aviso' };

            adminNotifsGrid.innerHTML = data.notifications.map(n => {
                const icon = typeIcons[n.type] || '📢';
                const label = typeLabels[n.type] || 'Aviso';
                const date = new Date(n.createdAt).toLocaleDateString('es-PE', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                const target = n.target === 'all' ? 'Todos' :
                    (n.targetUsers && n.targetUsers.length > 0 ?
                        n.targetUsers.map(u => u.email || u.name || 'Usuario').join(', ') : 'Específico');
                const readCount = n.readBy ? n.readBy.length : 0;

                return `
                <div class="admin-product-card" data-id="${n._id}" data-name="${n.title}">
                    <div class="admin-product-image" style="background: ${n.type === 'offer' ? 'linear-gradient(135deg, #25D366, #128C7E)' : n.type === 'winner' ? 'linear-gradient(135deg, #FFD700, #FF8C00)' : 'linear-gradient(135deg, #8655FF, #5a35cc)'}; display: flex; align-items: center; justify-content: center; font-size: 2.5rem;">
                        ${icon}
                    </div>
                    <div class="admin-product-info">
                        <h3>${n.title}</h3>
                        <p>${n.message.substring(0, 80)}${n.message.length > 80 ? '...' : ''}</p>
                        <p style="font-size: 0.78rem; color: #888; margin-top: 6px;">
                            <strong>${label}</strong> · ${target} · ${date} · 👁 ${readCount} leídas
                        </p>
                        <div class="admin-product-actions" style="margin-top: 10px;">
                            <button class="btn-delete">Eliminar</button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        } else {
            adminNotifsGrid.innerHTML = '<p class="no-products">No hay notificaciones enviadas.</p>';
        }
    } catch (error) {
        adminNotifsGrid.innerHTML = '<p class="no-products">Error al cargar notificaciones.</p>';
    }
}

// Handle delete click on notification cards
if (adminNotifsGrid) {
    adminNotifsGrid.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.btn-delete');
        if (!deleteBtn) return;
        const card = deleteBtn.closest('.admin-product-card');
        if (!card) return;
        const id = card.dataset.id;
        if (!confirm('¿Eliminar esta notificación?')) return;

        try {
            const res = await fetch(`/api/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${api.token}` }
            });
            const result = await res.json();
            if (result.success) {
                fetchAndRenderAdminNotifs();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}

init();

// ===================================
// Users Management
// ===================================
let allUsers = [];
let userFilterActive = 'all';

async function fetchAndRenderUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Cargando usuarios...</td></tr>';

    try {
        const res = await fetch('/api/users', {
            headers: { 'Authorization': `Bearer ${api.token}` }
        });
        const data = await res.json();

        if (data.success) {
            allUsers = data.users || [];

            // Update stats
            const totalEl = document.getElementById('totalUsers');
            const verifiedEl = document.getElementById('verifiedUsers');
            const pendingEl = document.getElementById('pendingUsers');
            if (totalEl) totalEl.textContent = data.stats.total;
            if (verifiedEl) verifiedEl.textContent = data.stats.verified;
            if (pendingEl) pendingEl.textContent = data.stats.pending;

            renderUsersTable();
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Error al cargar usuarios</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Error de conexión</td></tr>';
    }
}

function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    let filtered = allUsers;
    if (userFilterActive === 'verified') filtered = allUsers.filter(u => u.isVerified);
    if (userFilterActive === 'pending') filtered = allUsers.filter(u => !u.isVerified);

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:#999;">No hay usuarios en esta categoría</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(user => {
        const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
        const avatarHtml = user.avatar
            ? `<img src="${user.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" alt="">`
            : `<div class="user-avatar-small">${initials}</div>`;

        const roleBadge = user.role === 'admin'
            ? '<span class="badge badge-admin">Admin</span>'
            : '<span class="badge badge-user">Usuario</span>';

        const verifiedBadge = user.isVerified
            ? '<span class="badge badge-verified">✓ Verificado</span>'
            : '<span class="badge badge-pending">⏳ Pendiente</span>';

        const activeBadge = user.isActive
            ? '<span class="badge badge-active">Activo</span>'
            : '<span class="badge badge-inactive">Inactivo</span>';

        const createdDate = user.createdAt
            ? new Date(user.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
            : '-';

        const isAdminUser = user.role === 'admin';

        return `
        <tr data-user-id="${user._id}">
            <td>
                <div class="user-name-cell">
                    ${avatarHtml}
                    <span>${user.name || 'Sin nombre'}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${roleBadge}</td>
            <td>${verifiedBadge}</td>
            <td>${activeBadge}</td>
            <td>${createdDate}</td>
            <td>
                <div class="user-actions">
                    <button class="btn-verify" data-action="verify" title="${user.isVerified ? 'Quitar verificación' : 'Verificar'}">
                        ${user.isVerified ? '✗' : '✓'}
                    </button>
                    <button class="btn-toggle-active" data-action="toggle-active" title="${user.isActive ? 'Desactivar' : 'Activar'}">
                        ${user.isActive ? '🔒' : '🔓'}
                    </button>
                    ${!isAdminUser ? `<button class="btn-delete-user" data-action="delete" title="Eliminar">🗑</button>` : ''}
                </div>
            </td>
        </tr>`;
    }).join('');
}

// User filter buttons
document.querySelectorAll('[data-user-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('[data-user-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        userFilterActive = btn.dataset.userFilter;
        renderUsersTable();
    });
});

// User action clicks
const usersTableBody = document.getElementById('usersTableBody');
if (usersTableBody) {
    usersTableBody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const row = btn.closest('tr');
        if (!row) return;
        const userId = row.dataset.userId;
        const action = btn.dataset.action;

        if (action === 'verify') {
            try {
                const res = await fetch(`/api/users/${userId}/verify`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${api.token}` }
                });
                const data = await res.json();
                if (data.success) {
                    fetchAndRenderUsers();
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }

        if (action === 'toggle-active') {
            try {
                const res = await fetch(`/api/users/${userId}/toggle-active`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${api.token}` }
                });
                const data = await res.json();
                if (data.success) {
                    fetchAndRenderUsers();
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }

        if (action === 'delete') {
            if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;
            try {
                const res = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${api.token}` }
                });
                const data = await res.json();
                if (data.success) {
                    fetchAndRenderUsers();
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }
    });
}

// ===================================
// Orders Management
// ===================================
async function fetchAndRenderOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (!ordersTableBody) return;

    ordersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Cargando pedidos...</td></tr>';

    try {
        const res = await fetch('/api/payments/admin/orders', {
            headers: { 'Authorization': `Bearer ${api.token}` }
        });
        const data = await res.json();
        if (data.success) {
            adminOrders = data.data || [];
            renderOrders();
            updateOrderStats();
        } else {
            ordersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #ef4444;">Error al cargar pedidos</td></tr>';
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        ordersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #ef4444;">Error de conexión</td></tr>';
    }
}

function updateOrderStats() {
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const paidOrdersEl = document.getElementById('paidOrders');
    const pendingOrdersEl = document.getElementById('pendingOrders');

    if (totalOrdersEl) totalOrdersEl.textContent = adminOrders.length;

    const paidList = adminOrders.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'completed');
    if (paidOrdersEl) paidOrdersEl.textContent = paidList.length;

    const pendingList = adminOrders.filter(o => o.paymentStatus === 'pending');
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingList.length;

    const totalRevenue = paidList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    if (totalRevenueEl) totalRevenueEl.textContent = `S/ ${(totalRevenue / 100).toFixed(2)}`;
}

function renderOrders() {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (!ordersTableBody) return;

    let filtered = adminOrders;
    if (ordersFilter !== 'all') {
        if (ordersFilter === 'paid') {
            filtered = adminOrders.filter(o => o.paymentStatus === 'paid' || o.paymentStatus === 'completed');
        } else if (ordersFilter === 'pending') {
            filtered = adminOrders.filter(o => o.paymentStatus === 'pending');
        } else if (ordersFilter === 'failed') {
            filtered = adminOrders.filter(o => o.paymentStatus === 'failed' || o.paymentStatus === 'denied');
        } else if (ordersFilter === 'shipped') {
            filtered = adminOrders.filter(o => o.status === 'shipped' || o.status === 'delivered');
        }
    }

    if (filtered.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #6c757d;">No hay pedidos con este filtro</td></tr>';
        return;
    }

    const statusLabels = {
        'pending': { label: 'Pendiente', color: '#f59e0b', bg: '#fffbeb' },
        'paid': { label: 'Pagado', color: '#10b981', bg: '#ecfdf5' },
        'completed': { label: 'Completado', color: '#10b981', bg: '#ecfdf5' },
        'failed': { label: 'Fallido', color: '#ef4444', bg: '#fef2f2' },
        'denied': { label: 'Rechazado', color: '#ef4444', bg: '#fef2f2' },
        'refunded': { label: 'Reembolsado', color: '#6366f1', bg: '#eef2ff' }
    };

    ordersTableBody.innerHTML = filtered.map(order => {
        const payStatus = statusLabels[order.paymentStatus] || statusLabels['pending'];
        const methodIcon = order.paymentMethod === 'card' ? '💳' : order.paymentMethod === 'whatsapp' ? '💬' : '🔄';
        const date = new Date(order.createdAt).toLocaleDateString('es-PE', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
        const total = ((order.totalAmount || 0) / 100).toFixed(2);
        const customerName = order.customer?.name || order.customer?.email || 'N/A';

        return `
        <tr>
            <td><strong style="color: #8655FF;">${order.orderNumber || order._id.substring(0, 8)}</strong></td>
            <td>
                <div style="display: flex; flex-direction: column;">
                    <span style="font-weight: 600;">${customerName}</span>
                    <small style="color: #6c757d;">${order.customer?.email || ''}</small>
                </div>
            </td>
            <td><strong>S/ ${total}</strong></td>
            <td>${methodIcon} ${order.paymentMethod || 'N/A'}</td>
            <td>
                <span style="padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: ${payStatus.bg}; color: ${payStatus.color};">
                    ${payStatus.label}
                </span>
            </td>
            <td style="font-size: 0.85rem; color: #6c757d;">${date}</td>
            <td>
                <select class="order-status-select" data-order-id="${order._id}" style="padding: 4px 8px; border: 1px solid #dee2e6; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>📦 Procesando</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>✅ Confirmado</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>🚚 Enviado</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>📬 Entregado</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Cancelado</option>
                </select>
            </td>
        </tr>`;
    }).join('');
}

// Order filter buttons
document.addEventListener('click', function (e) {
    const filterBtn = e.target.closest('[data-order-filter]');
    if (!filterBtn) return;

    document.querySelectorAll('[data-order-filter]').forEach(btn => btn.classList.remove('active'));
    filterBtn.classList.add('active');

    ordersFilter = filterBtn.dataset.orderFilter;
    renderOrders();
});

// Project filter buttons
document.addEventListener('click', function (e) {
    const filterBtn = e.target.closest('[data-project-filter]');
    if (!filterBtn) return;

    document.querySelectorAll('[data-project-filter]').forEach(btn => btn.classList.remove('active'));
    filterBtn.classList.add('active');

    window.projectFilter = filterBtn.dataset.projectFilter;
    renderProjects();
});

// Order status change handler
document.addEventListener('change', async function (e) {
    if (!e.target.classList.contains('order-status-select')) return;

    const orderId = e.target.dataset.orderId;
    const newStatus = e.target.value;

    try {
        const res = await fetch(`/api/payments/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api.token}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            const order = adminOrders.find(o => o._id === orderId);
            if (order) order.status = newStatus;
            alert('Estado actualizado correctamente');
        } else {
            alert('Error: ' + (data.message || 'No se pudo actualizar'));
            fetchAndRenderOrders();
        }
    } catch (err) {
        alert('Error de conexión: ' + err.message);
        fetchAndRenderOrders();
    }
});
