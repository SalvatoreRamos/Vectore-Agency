// ===================================
// State Management
// ===================================
let products = [];
let projects = [];
let testimonials = [];

let events = [];
let flowAssets = [];
let leads = [];
let siteConfigState = null;
let adminClientProjects = [];
let editingClientOtId = null;
let currentOtDeliverables = [];
let activeSection = 'siteconfig';
let selectedLeadId = null;
let leadFilter = 'all';
let leadSearchTerm = '';
let productSearchTerm = '';
let projectSearchTerm = '';
let testimonialSearchTerm = '';

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
const adminSidebarBackdrop = document.getElementById('adminSidebarBackdrop');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const btnLogout = document.getElementById('btnLogout');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');

// Sections
const siteConfigSection = document.getElementById('siteConfigSection');
const clientPortalSection = document.getElementById('clientPortalSection');
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
const localProjectsEl = document.getElementById('localProjects');
const globalProjectsEl = document.getElementById('globalProjects');
const videoProjectsEl = document.getElementById('videoProjects');
const totalLeadsEl = document.getElementById('totalLeads');
const newLeadsEl = document.getElementById('newLeads');
const contactedLeadsEl = document.getElementById('contactedLeads');
const closedLeadsEl = document.getElementById('closedLeads');

// Navigation & Filters
let navItems = document.querySelectorAll('.nav-item');
const productFilterBtns = document.querySelectorAll('[data-filter]');
const catalogSearchInput = document.getElementById('catalogSearchInput');
const portfolioSearchInput = document.getElementById('portfolioSearchInput');
const testimonialSearchInput = document.getElementById('testimonialSearchInput');
const MOBILE_NAV_BREAKPOINT = 1024;
let sidebarHistoryPushed = false;

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
const briefCopyEmailBtn = document.getElementById('briefCopyEmailBtn');

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
    closeSidebar();
    if (loginScreen) loginScreen.style.display = 'flex';
    if (adminDashboard) adminDashboard.style.display = 'none';
}

async function showDashboard() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (adminDashboard) adminDashboard.style.display = 'flex';
    closeSidebar();
    switchSection(activeSection || 'siteconfig');
    await Promise.allSettled([
        fetchAndRenderProjects(),
        fetchAndRenderSiteConfig(),
        fetchAndRenderProducts(),
        fetchAndRenderTestimonials(),
        fetchAndRenderFlowAssets(),
        fetchAndRenderLeads(),
        fetchAndRenderClientProjects()
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

function isMobileSidebarViewport() {
    return window.innerWidth <= MOBILE_NAV_BREAKPOINT;
}

function syncSidebarLock(isOpen) {
    if (adminDashboard) adminDashboard.classList.toggle('sidebar-open', isOpen);
    document.body.classList.toggle('admin-nav-locked', isOpen);
}

function openSidebar() {
    if (!adminDashboard || !isMobileSidebarViewport()) return;
    syncSidebarLock(true);

    if (!sidebarHistoryPushed) {
        history.pushState({ ...(history.state || {}), adminSidebar: true }, '', window.location.href);
        sidebarHistoryPushed = true;
    }
}

function closeSidebar(fromHistory = false) {
    syncSidebarLock(false);

    if (fromHistory) {
        sidebarHistoryPushed = false;
        return;
    }

    if (sidebarHistoryPushed) {
        sidebarHistoryPushed = false;
        history.back();
    }
}

function toggleSidebar() {
    if (!adminDashboard || !isMobileSidebarViewport()) return;
    if (adminDashboard.classList.contains('sidebar-open')) {
        closeSidebar();
        return;
    }
    openSidebar();
}

function handleSidebarPopState(event) {
    if (event.state?.adminSidebar) {
        if (isMobileSidebarViewport()) {
            syncSidebarLock(true);
            sidebarHistoryPushed = true;
        }
        return;
    }

    if (adminDashboard?.classList.contains('sidebar-open') || sidebarHistoryPushed) {
        closeSidebar(true);
    }
}

// ===================================
// Navigation Logic
// ===================================
function switchSection(section) {
    if (!section) return;
    activeSection = section;

    // Update Nav
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    // Toggle Visibility
    if (siteConfigSection) siteConfigSection.style.display = section === 'siteconfig' ? 'grid' : 'none';
    if (clientPortalSection) clientPortalSection.style.display = section === 'clientportal' ? 'grid' : 'none';
    if (catalogSection) catalogSection.style.display = section === 'catalog' ? 'grid' : 'none';
    if (portfolioSection) portfolioSection.style.display = section === 'portfolio' ? 'grid' : 'none';
    if (testimonialsSection) testimonialsSection.style.display = section === 'testimonials' ? 'grid' : 'none';
    if (eventsSection) eventsSection.style.display = section === 'events' ? 'grid' : 'none';
    if (flowSection) flowSection.style.display = section === 'flow' ? 'grid' : 'none';
    if (briefsSection) briefsSection.style.display = section === 'briefs' ? 'grid' : 'none';
    if (notificationsSection) notificationsSection.style.display = section === 'notifications' ? 'grid' : 'none';
    if (usersSection) usersSection.style.display = section === 'users' ? 'grid' : 'none';
    if (ordersSection) ordersSection.style.display = section === 'orders' ? 'grid' : 'none';

    // Load data when switching to specific sections
    if (section === 'siteconfig') fetchAndRenderSiteConfig();
    if (section === 'clientportal') fetchAndRenderClientProjects();
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
    if (digitalProductsEl) digitalProductsEl.textContent = products.filter(p => p.scope === 'local' || !p.scope).length;
    if (physicalProductsEl) physicalProductsEl.textContent = products.filter(p => p.scope === 'global').length;
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

function getLeadSourceLabel(source, channel) {
    if (channel === 'whatsapp_direct') return '💬 WhatsApp Directo';
    if (channel === 'formal_proforma') return '✉️ Proforma Correo';
    if (source === 'b2b') return '🏢 Corporativo B2B';
    return source === 'es' ? 'Perú' : 'Web B2B';
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

async function copyTextToClipboard(text, triggerButton, successLabel = 'Copiado') {
    if (!text) return;

    const originalText = triggerButton ? triggerButton.textContent : '';

    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            const tempInput = document.createElement('textarea');
            tempInput.value = text;
            tempInput.setAttribute('readonly', '');
            tempInput.style.position = 'absolute';
            tempInput.style.left = '-9999px';
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
        }

        if (triggerButton) {
            triggerButton.textContent = successLabel;
            triggerButton.disabled = true;
            setTimeout(() => {
                triggerButton.textContent = originalText;
                triggerButton.disabled = false;
            }, 1200);
        }
    } catch (error) {
        console.error('Copy failed:', error);
        if (triggerButton) {
            triggerButton.textContent = 'Error';
            setTimeout(() => {
                triggerButton.textContent = originalText;
            }, 1200);
        }
    }
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
                lead.quotationCode,
                lead.name,
                lead.email,
                lead.companyOrRuc,
                lead.company,
                lead.city,
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
        const entityLabel = lead.companyOrRuc || lead.company || lead.email || 'Prospecto B2B';
        const codeTag = lead.quotationCode ? `[${lead.quotationCode}] ` : '';
        const summary = [
            getLeadServiceLabel(lead.service),
            lead.city ? `📍 ${lead.city}` : '',
            getLeadSourceLabel(lead.source, lead.channel)
        ]
            .filter(Boolean)
            .join(' · ');

        return `
        <article class="lead-card ${selectedLeadId === lead._id ? 'is-selected' : ''} ${!lead.readAt ? 'is-unread' : ''}" data-lead-id="${lead._id}">
            <div class="lead-card__header">
                <div>
                    <h3>${codeTag}${escapeHtml(lead.name)}</h3>
                    <p>${escapeHtml(entityLabel)}</p>
                </div>
                <span class="lead-badge lead-badge--priority lead-badge--${priorityInfo.tone}">${priorityInfo.label}</span>
            </div>
            <div class="lead-card__meta">
                <span class="lead-badge lead-badge--${statusInfo.tone}">${statusInfo.label}</span>
                ${lead.entityType === 'ruc20' ? '<span class="lead-badge" style="background:rgba(0,214,143,0.18);color:#00D68F;">RUC 20</span>' : ''}
                ${!lead.readAt ? '<span class="lead-badge lead-badge--unread">Nuevo</span>' : ''}
            </div>
            <p class="lead-card__summary">${escapeHtml(summary)}</p>
            <div class="lead-card__footer">
                <span>${escapeHtml(lead.email || 'Vía WhatsApp Directo')}</span>
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

    const entityName = lead.companyOrRuc || lead.company || 'No especificada';
    const codeStr = lead.quotationCode || 'COT-B2B';
    briefDetailName.textContent = `${codeStr} · ${lead.name}`;
    briefDetailMeta.textContent = `${entityName} · ${lead.city || 'Perú'} · ${formatLeadDate(lead.createdAt)}`;
    briefDetailScore.textContent = `${lead.qualificationScore || 0}/100`;
    briefDetailService.textContent = lead.referenceItem
        ? `${getLeadServiceLabel(lead.service)} (${lead.referenceItem})`
        : getLeadServiceLabel(lead.service);
    briefDetailTimeline.textContent = lead.timeline ? getLeadTimelineLabel(lead.timeline) : (lead.city || 'Por coordinar');
    briefDetailBudget.textContent = lead.budget ? getLeadBudgetLabel(lead.budget) : (lead.entityType === 'ruc20' ? 'Corporativo RUC 20' : 'A cotizar');
    briefDetailSource.textContent = getLeadSourceLabel(lead.source, lead.channel);
    briefDetailDescription.textContent = lead.description || 'El cliente no dejó un brief detallado.';

    const contactStr = [lead.email, lead.phone].filter(Boolean).join(' · ') || 'Vía WhatsApp Directo';
    briefDetailEmail.textContent = contactStr;
    briefDetailEmail.href = lead.email ? `mailto:${lead.email}` : '#';
    briefDetailCompany.textContent = entityName;

    const cityEl = document.getElementById('briefDetailCity');
    if (cityEl) cityEl.textContent = lead.city || 'No especificada';

    const rfpWrap = document.getElementById('briefDetailRfpWrap');
    if (rfpWrap) {
        rfpWrap.innerHTML = lead.rfpLink
            ? `<a href="${escapeHtml(lead.rfpLink)}" target="_blank" rel="noopener" style="color:#a67fff;font-weight:600;">Abrir TDR / Archivos ↗</a>`
            : '<span style="opacity:0.6;">Sin adjunto</span>';
    }

    const waReplyBtn = document.getElementById('briefWhatsappReplyBtn');
    if (waReplyBtn) {
        const cleanPhone = (lead.phone || '').replace(/[^\d]/g, '');
        const waTarget = cleanPhone.length >= 9
            ? (cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`)
            : '';
        const replyMsg = `Hola ${lead.name}, te saludamos de *Agencia Vectore* respecto a tu solicitud corporativa *${codeStr}* para *${entityName}* (${lead.service || 'Proyecto B2B'}).`;
        waReplyBtn.href = waTarget
            ? `https://wa.me/${waTarget}?text=${encodeURIComponent(replyMsg)}`
            : `https://wa.me/?text=${encodeURIComponent(replyMsg)}`;
        waReplyBtn.textContent = waTarget
            ? `💬 Responder a ${lead.phone} en WhatsApp`
            : '💬 Preparar Mensaje en WhatsApp';
    }

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
        if (adminProductsGrid) adminProductsGrid.innerHTML = '<div class="loader">Loading...</div>';
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
    const query = (productSearchTerm || '').trim().toLowerCase();

    const filteredProducts = products.filter(p => {
        // Category filter
        if (filter !== 'all' && p.category !== filter) return false;
        
        // Search filter
        if (!query) return true;
        const haystack = [
            p.name,
            p.category,
            p.subcategory,
            p.description,
            p.material
        ].join(' ').toLowerCase();
        
        return haystack.includes(query);
    });

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

        const scopeLabel = (product.scope === 'global') ? '🌍 Global' : '🇵🇪 Local';
        const scopeColor = (product.scope === 'global') ? '#2563eb' : '#16a34a';
        const currencySymbol = (product.currency === 'USD') ? '$' : 'S/';

        // Override price display: hide fixed retail prices when 0/unset (In-House B2B mode)
        const priceDisplayFinal = (product.price && Number(product.price) > 0)
            ? `Ref. Interna: ${currencySymbol} ${product.price} / ${product.unit || 'unid.'}`
            : 'Cotización Corporativa (In-House)';

        return `
        <div class="admin-product-card admin-card--catalog" data-id="${productId}" data-name="${product.name}">
            <div class="admin-product-image" style="background: ${getGradient(product.category, productId)}">
                ${imageContent}
                <div class="product-protection-overlay"></div>
                ${product.material ? `<span class="category-badge" style="background: rgba(0,0,0,0.6); top: 10px; left: 10px; position: absolute;">${product.material}</span>` : ''}
                <span class="category-badge" style="background: ${scopeColor}; top: 10px; right: 10px; position: absolute; font-size: 0.7rem;">${scopeLabel}</span>
            </div>
            <div class="admin-product-info">
                <h3>${product.name}</h3>
                <p class="product-kicker">${catLabel}${product.subcategory ? ` • ${product.subcategory}` : ''}</p>
                <p class="product-description">${product.description}</p>
                ${product.deliveryTime ? `<p>⏳ ${product.deliveryTime}</p>` : ''}
                <div class="admin-product-price">${priceDisplayFinal}</div>
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
        if (adminProjectsGrid) adminProjectsGrid.innerHTML = '<div class="loader">Cargando casos...</div>';
        const response = await api.getAdminProjects().catch(() => api.getProjects());
        projects = response.data || [];
        renderProjects();
        populateFloatingProjectSelect();
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
    
    const query = (projectSearchTerm || '').trim().toLowerCase();
    const filteredProjects = projects.filter(p => {
        // Scope filter
        if (window.projectFilter !== 'all' && p.scope !== window.projectFilter) return false;
        
        // Search filter
        if (!query) return true;
        const haystack = [
            p.title,
            p.client,
            p.category,
            p.description
        ].join(' ').toLowerCase();
        
        return haystack.includes(query);
    });

    if (filteredProjects.length === 0) {
        adminProjectsGrid.innerHTML = '<div class="no-products">No hay proyectos en el portafolio para este filtro</div>';
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
        <div class="admin-product-card admin-card--portfolio" data-id="${projectId}" data-name="${project.title}">
                        <div class="admin-product-image">
                            ${isVideo ?
                            `<video src="${project.thumbnail}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>` :
                            `<img src="${project.thumbnail}" alt="${project.title}" onerror="this.src='https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg'">`
                        }
                            <div class="product-protection-overlay"></div>
                            <span class="category-badge badge-scope">${project.isWhiteLabel ? '🔒 NDA / Marca Blanca' : scopeLabel}</span>
                            <span class="category-badge badge-cat">${project.isFeatured ? '⭐ ' : ''}${project.category}</span>
                            ${isVideo ? `<span class="video-badge">VIDEO</span>` : ''}
                        </div>
            <div class="admin-product-info">
                <h3>${project.title}</h3>
                <p class="product-kicker">${project.sector || project.category || 'Caso B2B'}${project.client ? ` • ${project.client}` : ''}${project.location ? ` • 📍 ${project.location}` : ''}</p>
                <p class="product-description">${project.description || 'Proyecto listo para edición y seguimiento desde el panel.'}</p>
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
        if (adminTestimonialsGrid) adminTestimonialsGrid.innerHTML = '<div class="loader">Loading...</div>';
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

    const query = (testimonialSearchTerm || '').trim().toLowerCase();
    const filteredTestimonials = testimonials.filter(t => {
        if (!query) return true;
        const haystack = [
            t.clientName,
            t.businessName,
            t.comment
        ].join(' ').toLowerCase();
        return haystack.includes(query);
    });

    if (filteredTestimonials.length === 0) {
        adminTestimonialsGrid.innerHTML = '<p style="color: var(--text-muted); padding: 2rem;">No se encontraron clientes destacados.</p>';
        return;
    }

    adminTestimonialsGrid.innerHTML = '';
    filteredTestimonials.forEach(t => {
        const card = document.createElement('div');
        card.className = 'admin-product-card admin-card--testimonial';
        card.dataset.id = t._id;
        card.dataset.name = t.clientName;
        card.innerHTML = `
            <div class="admin-product-image">
                <img src="${t.photo}" alt="${t.clientName}" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+Foto'">
                <div class="product-protection-overlay"></div>
            </div>
            <div class="admin-product-info">
                <h3>${t.clientName}</h3>
                <p class="product-category">${t.businessName}</p>
                <p class="product-description">"${t.comment.substring(0, 60)}${t.comment.length > 60 ? '...' : ''}"</p>
                <div class="admin-product-actions">
                    <button class="btn-edit">Editar</button>
                    <button class="btn-delete">Eliminar</button>
                </div>
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
                     <button class="btn-copy-flow-url" data-url="${imgUrl}">Copiar URL</button>
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
        else if (deletingType === 'clientproject') res = await api.deleteAdminClientProject(deletingId);

        if (res.success) {
            setTimeout(async () => {
                if (deletingType === 'product') await fetchAndRenderProducts();
                else if (deletingType === 'project') await fetchAndRenderProjects();
                else if (deletingType === 'testimonial') await fetchAndRenderTestimonials();
                else if (deletingType === 'event') await fetchAndRenderEvents();
                else if (deletingType === 'flow') await fetchAndRenderFlowAssets();
                else if (deletingType === 'clientproject') await fetchAndRenderClientProjects();
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
    document.getElementById('productScope').value = product.scope || 'local';
    document.getElementById('productCurrency').value = product.currency || 'PEN';
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
    projectModalTitle.textContent = 'Editar Caso de Éxito B2B';
    document.getElementById('pTitle').value = project.title || '';
    document.getElementById('pClient').value = project.client || '';
    document.getElementById('pCategory').value = project.category || '';
    document.getElementById('pScope').value = project.scope || 'local';
    if (document.getElementById('pSector')) document.getElementById('pSector').value = project.sector || '';
    if (document.getElementById('pLocation')) document.getElementById('pLocation').value = project.location || 'Pucallpa, Ucayali';
    if (document.getElementById('pIsWhiteLabel')) document.getElementById('pIsWhiteLabel').checked = Boolean(project.isWhiteLabel);
    if (document.getElementById('pPublicClientLabel')) document.getElementById('pPublicClientLabel').value = project.publicClientLabel || '';
    if (document.getElementById('pIsFeatured')) document.getElementById('pIsFeatured').checked = Boolean(project.isFeatured);
    if (document.getElementById('pDeliverables')) {
        document.getElementById('pDeliverables').value = Array.isArray(project.deliverables) ? project.deliverables.join(', ') : '';
    }
    document.getElementById('pDescription').value = project.description || '';
    document.getElementById('pThumbnail').value = project.thumbnail || '';
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
            if (!item.dataset.section) return;
            e.preventDefault();
            switchSection(item.dataset.section);
            // Hide sidebar on mobile after clicking
            if (window.innerWidth <= MOBILE_NAV_BREAKPOINT) {
                closeSidebar();
            }
        });
    });

    // Mobile Menu Toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            toggleSidebar();
        });
    }

    if (adminSidebarBackdrop) {
        adminSidebarBackdrop.addEventListener('click', closeSidebar);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeSidebar();
    });

    window.addEventListener('popstate', handleSidebarPopState);

    window.addEventListener('resize', () => {
        if (window.innerWidth > MOBILE_NAV_BREAKPOINT) closeSidebar();
    });

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

    if (briefCopyEmailBtn) {
        briefCopyEmailBtn.addEventListener('click', () => {
            const email = briefDetailEmail.textContent;
            if (email && email !== '-') {
                copyTextToClipboard(email, briefCopyEmailBtn);
            }
        });
    }

    if (catalogSearchInput) {
        catalogSearchInput.addEventListener('input', (e) => {
            productSearchTerm = e.target.value || '';
            renderProducts();
        });
    }

    if (portfolioSearchInput) {
        portfolioSearchInput.addEventListener('input', (e) => {
            projectSearchTerm = e.target.value || '';
            renderProjects();
        });
    }

    if (testimonialSearchInput) {
        testimonialSearchInput.addEventListener('input', (e) => {
            testimonialSearchTerm = e.target.value || '';
            renderTestimonials();
        });
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
            scope: document.getElementById('productScope').value || 'local',
            currency: document.getElementById('productCurrency').value || 'PEN',
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
        const delivsRaw = document.getElementById('pDeliverables') ? document.getElementById('pDeliverables').value : '';
        const data = {
            title: document.getElementById('pTitle').value,
            client: document.getElementById('pClient').value,
            category: document.getElementById('pCategory').value,
            sector: document.getElementById('pSector') ? document.getElementById('pSector').value : '',
            location: document.getElementById('pLocation') ? document.getElementById('pLocation').value : 'Pucallpa, Ucayali',
            isWhiteLabel: document.getElementById('pIsWhiteLabel') ? document.getElementById('pIsWhiteLabel').checked : false,
            publicClientLabel: document.getElementById('pPublicClientLabel') ? document.getElementById('pPublicClientLabel').value : '',
            isFeatured: document.getElementById('pIsFeatured') ? document.getElementById('pIsFeatured').checked : false,
            deliverables: delivsRaw.split(',').map(s => s.trim()).filter(Boolean),
            scope: document.getElementById('pScope').value || 'local',
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
        const copyBtn = e.target.closest('.btn-copy-flow-url');
        if (copyBtn) {
            const url = copyBtn.dataset.url;
            copyTextToClipboard(url, copyBtn, 'Copiado');
        }
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

// ===================================
// B2B SITE CONFIG CMS (Hero, Fallback, OPEN PROJECT, Sectors & Footer)
// ===================================
function populateFloatingProjectSelect() {
    const sel = document.getElementById('scFloatingProjectSelect');
    if (!sel) return;
    const currentVal = siteConfigState?.hero?.floatingCard?.projectId || sel.value || '';
    sel.innerHTML = '<option value="">-- Seleccionar proyecto --</option>' +
        projects.map(p => `<option value="${p._id}" ${String(p._id) === String(currentVal) ? 'selected' : ''}>${escapeHtml(p.title)} (${escapeHtml(p.category || 'Caso')})</option>`).join('');
}

const CMS_SECTOR_ICONS = {
    building: {
        label: '🏢 Centros Comerciales',
        svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/></svg>'
    },
    landmark: {
        label: '🏛️ Entidades / Estado',
        svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>'
    },
    film: {
        label: '🎬 Cines & Eventos',
        svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>'
    },
    truck: {
        label: '🚚 Logística & Mayoristas',
        svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>'
    },
    leaf: {
        label: '🌿 Agroindustria',
        svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'
    },
    shield: {
        label: '🛡️ Banca & Finanzas',
        svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    },
    activity: {
        label: '🩺 Clínicas & Salud',
        svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>'
    },
    compass: {
        label: '🧭 Automotriz & Flotas',
        svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>'
    },
    layers: {
        label: '✨ Inmobiliaria / General',
        svg: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
    }
};

function syncHeroLivePreview() {
    const bgUrl = (document.getElementById('scHeroBgUrl')?.value || '').trim();
    const op = Number(document.getElementById('scHeroOpacity')?.value || 0.58);
    const badge = (document.getElementById('scBadgeText')?.value || '').trim();
    const h1 = (document.getElementById('scHeadline1')?.value || '').trim();
    const h2 = (document.getElementById('scHeadlineHighlight')?.value || '').trim();
    const sub = (document.getElementById('scSubtitle')?.value || '').trim();
    const btn1 = (document.getElementById('scPrimaryCta')?.value || '').trim();
    const btn2 = (document.getElementById('scSecondaryCta')?.value || '').trim();
    const floatEnabled = document.getElementById('scFloatingEnabled')?.checked !== false;
    const floatLabel = (document.getElementById('scFloatingLabel')?.value || 'OPEN PROJECT').trim();
    const floatMode = document.getElementById('scFloatingMode')?.value || 'latest';

    const manualGroup = document.getElementById('scFloatingManualGroup');
    if (manualGroup) {
        manualGroup.style.display = floatMode === 'manual' ? 'block' : 'none';
    }

    const modeTag = document.getElementById('scHeroBgModeTag');
    const mediaEl = document.getElementById('scHeroPreviewMedia');
    if (mediaEl) {
        if (!bgUrl || bgUrl.startsWith('Subiendo')) {
            mediaEl.style.backgroundImage = 'none';
            mediaEl.innerHTML = '';
            if (modeTag) modeTag.textContent = 'Fondo Animado Original';
        } else {
            const isVid = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(bgUrl) || bgUrl.includes('/video/upload/');
            if (isVid) {
                mediaEl.style.backgroundImage = 'none';
                if (!mediaEl.querySelector('video') || mediaEl.querySelector('video').src !== bgUrl) {
                    mediaEl.innerHTML = `<video src="${escapeHtml(bgUrl)}" autoplay muted loop playsinline></video>`;
                }
                if (modeTag) modeTag.textContent = 'Video MP4 Activo';
            } else {
                mediaEl.innerHTML = '';
                mediaEl.style.backgroundImage = `url("${bgUrl.replace(/"/g, '%22')}")`;
                if (modeTag) modeTag.textContent = 'Imagen Personalizada';
            }
        }
    }

    const scrimEl = document.getElementById('scHeroPreviewScrim');
    if (scrimEl) {
        scrimEl.style.background = `linear-gradient(180deg, rgba(12,9,39,${(op * 0.65).toFixed(2)}) 0%, rgba(12,9,39,0.92) 100%)`;
    }

    const setTxt = (id, val, fallback) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || fallback;
    };

    setTxt('scPrevBadge', badge, 'PUBLICIDAD & BTL EN PERÚ · PACKAGING 3D & SOFTWARE');
    setTxt(
        'scPrevTitle',
        `${h1 || 'Ejecutamos tus despliegues BTL en Pucallpa'} ${h2 || 'y creamos publicidad, diseño especializado, packaging 3D y software a medida.'}`.trim(),
        ''
    );
    setTxt('scPrevSub', sub, 'Taller propio para marcas de Lima y todo el Perú.');
    setTxt('scPrevBtn1', btn1 ? `${btn1} →` : '', 'Cotizar proyecto →');
    setTxt('scPrevBtn2', btn2, 'Ver portafolio');
    setTxt('scPrevFloatLabel', floatLabel, 'OPEN PROJECT');

    const floatCard = document.getElementById('scPrevFloatCard');
    if (floatCard) {
        floatCard.style.display = floatEnabled ? 'flex' : 'none';
    }
}

async function fetchAndRenderSiteConfig() {
    if (!document.getElementById('siteConfigSection')) return;
    try {
        const res = await api.getSiteConfig();
        if (!res?.success || !res.data) return;
        const cfg = res.data;
        siteConfigState = cfg;

        const hero = cfg.hero || {};
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el && val !== undefined && val !== null) el.value = val;
        };

        setVal('scHeroBgUrl', hero.backgroundUrl || '');
        setVal('scHeroMobileUrl', hero.mobileBackgroundUrl || '');
        const op = typeof hero.overlayOpacity === 'number' ? hero.overlayOpacity : 0.58;
        setVal('scHeroOpacity', op);
        const opLabel = document.getElementById('scHeroOpacityVal');
        if (opLabel) opLabel.textContent = `${Math.round(op * 100)}%`;

        setVal('scBadgeText', hero.badgeText || '');
        setVal('scHeadline1', hero.headlineLine1 || '');
        setVal('scHeadlineHighlight', hero.headlineHighlight || '');
        setVal('scSubtitle', hero.subtitle || '');
        setVal('scPrimaryCta', hero.primaryCtaText || '');
        setVal('scSecondaryCta', hero.secondaryCtaText || '');

        const fc = hero.floatingCard || {};
        const flEnabled = document.getElementById('scFloatingEnabled');
        if (flEnabled) flEnabled.checked = fc.enabled !== false;
        setVal('scFloatingLabel', fc.label || 'OPEN PROJECT');
        setVal('scFloatingMode', fc.mode || 'latest');
        populateFloatingProjectSelect();
        if (fc.projectId) setVal('scFloatingProjectSelect', fc.projectId);

        renderAdminSectorsList(Array.isArray(cfg.sectors) ? cfg.sectors : []);

        const corp = cfg.corporate || {};
        setVal('scWhatsappNumber', corp.whatsappNumber || '51950699910');
        setVal('scPhoneDisplay', corp.phoneDisplay || '+51 950 699 910');
        setVal('scCorpEmail', corp.email || 'agenciavectore@gmail.com');
        setVal('scCorpAddress', corp.address || '');
        setVal('scCorpRucInfo', corp.rucInfo || '');

        syncHeroLivePreview();
    } catch (err) {
        console.error('Error loading SiteConfig in Admin:', err);
    }
}

function renderAdminSectorsList(sectors) {
    const listEl = document.getElementById('scSectorsList');
    if (!listEl) return;

    const iconKeys = Object.keys(CMS_SECTOR_ICONS);
    listEl.innerHTML = sectors.map((sec, idx) => {
        const iconKey = CMS_SECTOR_ICONS[sec.icon] ? sec.icon : 'layers';
        const isActive = sec.isActive !== false;
        return `
            <div class="sector-admin-row cms-sector-row ${isActive ? '' : 'is-inactive'}" data-sector-idx="${idx}">
                <div class="cms-sector-status-cell">
                    <label class="cms-switch" title="Mostrar u ocultar sector en la web">
                        <input type="checkbox" class="sec-active" ${isActive ? 'checked' : ''}>
                        <span class="cms-switch__slider"></span>
                    </label>
                </div>
                <div class="cms-sector-name-wrap">
                    <span class="cms-sector-icon-badge" data-sector-icon-box>${CMS_SECTOR_ICONS[iconKey].svg}</span>
                    <input type="text" class="cms-input sec-name" value="${escapeHtml(sec.name || '')}" placeholder="Ej. Centros Comerciales & Retail">
                </div>
                <input type="text" class="cms-input sec-sub" value="${escapeHtml(sec.subtitle || '')}" placeholder="Ej. Módulos, activaciones y señalética">
                <select class="cms-select sec-icon">
                    ${iconKeys.map(ic => `<option value="${ic}" ${iconKey === ic ? 'selected' : ''}>${CMS_SECTOR_ICONS[ic].label}</option>`).join('')}
                </select>
                <button type="button" class="cms-remove-btn sec-remove-btn" title="Eliminar sector" aria-label="Eliminar sector">✕</button>
            </div>
        `;
    }).join('');
}

function collectAdminSectors() {
    const rows = document.querySelectorAll('#scSectorsList .sector-admin-row');
    return Array.from(rows).map((row, idx) => ({
        id: `sec-${idx + 1}`,
        isActive: row.querySelector('.sec-active')?.checked !== false,
        name: (row.querySelector('.sec-name')?.value || '').trim(),
        subtitle: (row.querySelector('.sec-sub')?.value || '').trim(),
        icon: row.querySelector('.sec-icon')?.value || 'layers',
        order: idx + 1
    })).filter(s => s.name);
}

// Bind SiteConfig Events
(function bindSiteConfigAdminEvents() {
    const opacityInput = document.getElementById('scHeroOpacity');
    if (opacityInput) {
        opacityInput.addEventListener('input', () => {
            const lbl = document.getElementById('scHeroOpacityVal');
            if (lbl) lbl.textContent = `${Math.round(Number(opacityInput.value) * 100)}%`;
            syncHeroLivePreview();
        });
    }

    ['scHeroBgUrl', 'scBadgeText', 'scHeadline1', 'scHeadlineHighlight', 'scSubtitle', 'scPrimaryCta', 'scSecondaryCta', 'scFloatingLabel', 'scFloatingEnabled', 'scFloatingMode'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', syncHeroLivePreview);
            el.addEventListener('change', syncHeroLivePreview);
        }
    });

    const heroFile = document.getElementById('scHeroFile');
    if (heroFile) {
        heroFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const urlInput = document.getElementById('scHeroBgUrl');
            try {
                if (urlInput) urlInput.value = 'Subiendo a Cloudinary...';
                const res = await api.uploadImage(file);
                if (res?.success && res.data?.url) {
                    if (urlInput) urlInput.value = res.data.url;
                    syncHeroLivePreview();
                } else {
                    throw new Error(res?.message || 'Error al subir archivo');
                }
            } catch (err) {
                alert('Error subiendo portada: ' + err.message);
                if (urlInput) urlInput.value = '';
                heroFile.value = '';
                syncHeroLivePreview();
            }
        });
    }

    const addSecBtn = document.getElementById('btnAddSectorRow');
    if (addSecBtn) {
        addSecBtn.addEventListener('click', () => {
            const current = collectAdminSectors();
            current.push({ id: `sec-${Date.now()}`, name: '', subtitle: '', icon: 'layers', isActive: true });
            renderAdminSectorsList(current);
            const inputs = document.querySelectorAll('#scSectorsList .sec-name');
            if (inputs.length) inputs[inputs.length - 1].focus();
        });
    }

    const secList = document.getElementById('scSectorsList');
    if (secList) {
        secList.addEventListener('click', (e) => {
            const rm = e.target.closest('.sec-remove-btn');
            if (!rm) return;
            const row = rm.closest('.sector-admin-row');
            if (row) row.remove();
        });

        secList.addEventListener('change', (e) => {
            const row = e.target.closest('.sector-admin-row');
            if (!row) return;
            if (e.target.classList.contains('sec-active')) {
                row.classList.toggle('is-inactive', !e.target.checked);
            } else if (e.target.classList.contains('sec-icon')) {
                const iconBox = row.querySelector('[data-sector-icon-box]');
                const cfg = CMS_SECTOR_ICONS[e.target.value] || CMS_SECTOR_ICONS.layers;
                if (iconBox) iconBox.innerHTML = cfg.svg;
            }
        });
    }

    const saveBtn = document.getElementById('btnSaveSiteConfig');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            const bgUrl = (document.getElementById('scHeroBgUrl')?.value || '').trim();
            const isVid = /\.(mp4|webm|mov|ogg)(\?|$)/i.test(bgUrl) || bgUrl.includes('/video/upload/');
            const payload = {
                hero: {
                    backgroundType: !bgUrl ? 'default' : (isVid ? 'video' : 'image'),
                    backgroundUrl: bgUrl,
                    mobileBackgroundUrl: (document.getElementById('scHeroMobileUrl')?.value || '').trim(),
                    overlayOpacity: Number(document.getElementById('scHeroOpacity')?.value || 0.58),
                    badgeText: document.getElementById('scBadgeText')?.value || '',
                    headlineLine1: document.getElementById('scHeadline1')?.value || '',
                    headlineHighlight: document.getElementById('scHeadlineHighlight')?.value || '',
                    subtitle: document.getElementById('scSubtitle')?.value || '',
                    primaryCtaText: document.getElementById('scPrimaryCta')?.value || '',
                    secondaryCtaText: document.getElementById('scSecondaryCta')?.value || '',
                    floatingCard: {
                        enabled: document.getElementById('scFloatingEnabled')?.checked !== false,
                        label: document.getElementById('scFloatingLabel')?.value || 'OPEN PROJECT',
                        mode: document.getElementById('scFloatingMode')?.value || 'latest',
                        projectId: document.getElementById('scFloatingProjectSelect')?.value || null
                    }
                },
                sectors: collectAdminSectors(),
                corporate: {
                    whatsappNumber: document.getElementById('scWhatsappNumber')?.value || '51950699910',
                    phoneDisplay: document.getElementById('scPhoneDisplay')?.value || '+51 950 699 910',
                    email: document.getElementById('scCorpEmail')?.value || 'agenciavectore@gmail.com',
                    address: document.getElementById('scCorpAddress')?.value || '',
                    rucInfo: document.getElementById('scCorpRucInfo')?.value || ''
                }
            };

            const origHtml = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.textContent = 'Guardando cambios...';
            try {
                await api.updateSiteConfig(payload);
                alert('✅ Portada, Sectores y Datos Corporativos actualizados en vivo.');
                await fetchAndRenderSiteConfig();
            } catch (err) {
                alert('Error al guardar: ' + err.message);
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = origHtml;
            }
        });
    }

    const resetBtn = document.getElementById('btnResetHeroBg');
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            if (!confirm('¿Restaurar el fondo oscuro animado original en la Portada?')) return;
            try {
                await api.resetHeroBackground();
                document.getElementById('scHeroBgUrl').value = '';
                document.getElementById('scHeroMobileUrl').value = '';
                syncHeroLivePreview();
                alert('✅ Fondo original restaurado.');
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    }

    syncHeroLivePreview();

    const copyCompBtn = document.getElementById('briefCopyCompanyBtn');
    if (copyCompBtn) {
        copyCompBtn.addEventListener('click', () => {
            const txt = document.getElementById('briefDetailCompany')?.textContent || '';
            if (txt && txt !== '-') copyTextToClipboard(txt, copyCompBtn);
        });
    }
})();

// ===================================
// CORPORATE CLIENT PORTAL OTs & PRIVATE PAYMENT TICKETS
// ===================================
async function fetchAndRenderClientProjects() {
    const grid = document.getElementById('adminClientOtsGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loader">Cargando Órdenes de Trabajo...</div>';

    try {
        const res = await api.getAdminClientProjects();
        adminClientProjects = Array.isArray(res?.data) ? res.data : [];
        renderAdminClientProjects();
    } catch (err) {
        grid.innerHTML = `<p class="no-products">Error al cargar OTs: ${escapeHtml(err.message)}</p>`;
    }
}

function renderAdminClientProjects() {
    const grid = document.getElementById('adminClientOtsGrid');
    if (!grid) return;

    if (adminClientProjects.length === 0) {
        grid.innerHTML = '<p class="no-products">No hay Órdenes de Trabajo creadas aún. Pulsa "+ Nueva Orden de Trabajo (OT)" para habilitar el portal a un cliente.</p>';
        return;
    }

    grid.innerHTML = adminClientProjects.map((ot) => {
        const delivCount = Array.isArray(ot.deliverables) ? ot.deliverables.length : 0;
        const approvedCount = (ot.deliverables || []).filter(d => d.approvalStatus === 'approved').length;
        const ticket = ot.paymentTicket || {};
        const ticketUrl = ticket.enabled && ticket.ticketToken
            ? `${window.location.origin}/clientes?ticket=${ticket.ticketToken}`
            : '';

        return `
            <div class="admin-product-card" data-id="${ot._id}" data-name="${escapeHtml(ot.title)}">
                <div class="admin-product-info" style="padding:20px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <strong style="color:#a67fff;font-size:0.82rem;">${escapeHtml(ot.otCode || 'OT')}</strong>
                        <span style="font-size:0.76rem;padding:3px 8px;border-radius:99px;background:rgba(134,85,255,0.16);color:#c4b5fd;">
                            Avance ${Number(ot.progress) || 0}%
                        </span>
                    </div>
                    <h3>${escapeHtml(ot.title)}</h3>
                    <p style="font-size:0.84rem;opacity:0.85;margin-bottom:6px;">
                        👤 ${escapeHtml(ot.clientCompany || ot.clientName || 'Cliente')} · ✉️ ${escapeHtml(ot.clientEmail)}
                    </p>
                    <p style="font-size:0.8rem;opacity:0.75;margin-bottom:10px;">
                        📂 ${delivCount} archivos (${approvedCount} aprobados)
                        ${ticket.enabled ? ` · 💳 Ticket S/ ${Number(ticket.amountPen || 0).toFixed(2)} (${ticket.status === 'paid' ? 'PAGADO' : 'PENDIENTE'})` : ''}
                    </p>
                    ${ticketUrl ? `
                        <button type="button" class="btn btn-secondary btn-copy-ticket-link" data-ticket-url="${escapeHtml(ticketUrl)}" style="width:100%;margin-bottom:10px;font-size:0.78rem;padding:7px 10px;">
                            🔗 Copiar Link de Pago Privado
                        </button>
                    ` : ''}
                    <div class="admin-product-actions">
                        <button class="btn-edit">Editar OT</button>
                        <button class="btn-delete">Eliminar</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderDeliverableRowsInModal() {
    const container = document.getElementById('cpDeliverablesList');
    if (!container) return;

    if (currentOtDeliverables.length === 0) {
        container.innerHTML = '<small style="opacity:0.65;">Sin archivos aún. Sube uno arriba o pulsa "+ Agregar Archivo".</small>';
        return;
    }

    container.innerHTML = currentOtDeliverables.map((d, i) => `
        <div class="cp-deliv-row" data-idx="${i}" style="display:grid;grid-template-columns:140px 1fr 1fr auto;gap:8px;align-items:center;">
            <select class="cpd-type">
                <option value="art_hd" ${d.type === 'art_hd' ? 'selected' : ''}>🎨 Arte HD (Aprobable)</option>
                <option value="photo_report" ${d.type === 'photo_report' ? 'selected' : ''}>📸 Reporte Instalación</option>
                <option value="invoice_pdf" ${d.type === 'invoice_pdf' ? 'selected' : ''}>🧾 Factura PDF</option>
                <option value="technical_doc" ${d.type === 'technical_doc' ? 'selected' : ''}>📐 Plano / Técnico</option>
            </select>
            <input type="text" class="cpd-title" value="${escapeHtml(d.title || '')}" placeholder="Título del entregable">
            <input type="url" class="cpd-url" value="${escapeHtml(d.fileUrl || '')}" placeholder="https://...">
            <button type="button" class="btn-delete cpd-remove" style="padding:6px 10px;">✕</button>
        </div>
    `).join('');
}

function syncDeliverablesFromModalDOM() {
    const rows = document.querySelectorAll('#cpDeliverablesList .cp-deliv-row');
    currentOtDeliverables = Array.from(rows).map((row, idx) => {
        const prev = currentOtDeliverables[idx] || {};
        return {
            ...prev,
            type: row.querySelector('.cpd-type')?.value || 'art_hd',
            title: (row.querySelector('.cpd-title')?.value || '').trim(),
            fileUrl: (row.querySelector('.cpd-url')?.value || '').trim()
        };
    });
}

function openClientProjectModal(id = null) {
    const modal = document.getElementById('clientProjectModal');
    const form = document.getElementById('clientProjectForm');
    if (!modal || !form) return;

    editingClientOtId = id;
    form.reset();

    if (id) {
        const ot = adminClientProjects.find(p => p._id === id);
        if (!ot) return;
        document.getElementById('clientProjectModalTitle').textContent = `Editar ${ot.otCode || 'Orden de Trabajo'}`;
        document.getElementById('cpTitle').value = ot.title || '';
        document.getElementById('cpClientEmail').value = ot.clientEmail || '';
        document.getElementById('cpClientCompany').value = ot.clientCompany || '';
        document.getElementById('cpClientName').value = ot.clientName || '';
        document.getElementById('cpStatus').value = ot.status || 'in_design';
        document.getElementById('cpProgress').value = ot.progress ?? 25;
        document.getElementById('cpLocation').value = ot.location || 'Pucallpa, Ucayali';
        document.getElementById('cpTimelineNotes').value = ot.timelineNotes || '';
        currentOtDeliverables = Array.isArray(ot.deliverables) ? ot.deliverables.map(d => ({ ...d })) : [];

        const tk = ot.paymentTicket || {};
        document.getElementById('cpTicketEnabled').checked = Boolean(tk.enabled);
        document.getElementById('cpTicketConcept').value = tk.concept || '';
        document.getElementById('cpTicketAmount').value = tk.amountPen || '';
    } else {
        document.getElementById('clientProjectModalTitle').textContent = 'Nueva Orden de Trabajo (Portal Clientes)';
        currentOtDeliverables = [];
    }

    renderDeliverableRowsInModal();
    modal.classList.add('active');
}

(function bindClientPortalAdminEvents() {
    const btnAdd = document.getElementById('btnAddClientOt');
    const modal = document.getElementById('clientProjectModal');
    const closeBtn = document.getElementById('clientProjectModalClose');
    const cancelBtn = document.getElementById('btnCancelClientProject');
    const form = document.getElementById('clientProjectForm');
    const grid = document.getElementById('adminClientOtsGrid');
    const addDelivBtn = document.getElementById('btnAddDeliverableRow');
    const quickUpload = document.getElementById('cpDeliverableQuickUpload');
    const delivList = document.getElementById('cpDeliverablesList');

    const closeModalFn = () => {
        if (modal) modal.classList.remove('active');
        editingClientOtId = null;
    };

    if (btnAdd) btnAdd.addEventListener('click', () => openClientProjectModal(null));
    if (closeBtn) closeBtn.addEventListener('click', closeModalFn);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModalFn);

    if (addDelivBtn) {
        addDelivBtn.addEventListener('click', () => {
            syncDeliverablesFromModalDOM();
            currentOtDeliverables.push({ type: 'art_hd', title: '', fileUrl: '', approvalStatus: 'pending' });
            renderDeliverableRowsInModal();
        });
    }

    if (delivList) {
        delivList.addEventListener('click', (e) => {
            const rm = e.target.closest('.cpd-remove');
            if (!rm) return;
            syncDeliverablesFromModalDOM();
            const idx = Number(rm.closest('.cp-deliv-row')?.dataset.idx);
            if (!Number.isNaN(idx)) {
                currentOtDeliverables.splice(idx, 1);
                renderDeliverableRowsInModal();
            }
        });
    }

    if (quickUpload) {
        quickUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            syncDeliverablesFromModalDOM();
            try {
                const res = await api.uploadImage(file);
                if (res?.success && res.data?.url) {
                    const isPdf = /\.pdf$/i.test(file.name);
                    currentOtDeliverables.push({
                        type: isPdf ? 'invoice_pdf' : 'art_hd',
                        title: file.name.replace(/\.[^/.]+$/, ''),
                        fileUrl: res.data.url,
                        approvalStatus: 'pending'
                    });
                    renderDeliverableRowsInModal();
                }
            } catch (err) {
                alert('Error subiendo entregable: ' + err.message);
            } finally {
                quickUpload.value = '';
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            syncDeliverablesFromModalDOM();
            const payload = {
                title: document.getElementById('cpTitle').value.trim(),
                clientEmail: document.getElementById('cpClientEmail').value.trim().toLowerCase(),
                clientCompany: document.getElementById('cpClientCompany').value.trim(),
                clientName: document.getElementById('cpClientName').value.trim(),
                status: document.getElementById('cpStatus').value,
                progress: Number(document.getElementById('cpProgress').value) || 0,
                location: document.getElementById('cpLocation').value.trim(),
                timelineNotes: document.getElementById('cpTimelineNotes').value.trim(),
                deliverables: currentOtDeliverables.filter(d => d.title && d.fileUrl),
                paymentTicket: {
                    enabled: document.getElementById('cpTicketEnabled').checked,
                    concept: document.getElementById('cpTicketConcept').value.trim(),
                    amountPen: Number(document.getElementById('cpTicketAmount').value) || 0
                }
            };

            try {
                if (editingClientOtId) {
                    await api.updateAdminClientProject(editingClientOtId, payload);
                } else {
                    await api.createAdminClientProject(payload);
                }
                closeModalFn();
                await fetchAndRenderClientProjects();
            } catch (err) {
                alert('Error guardando OT: ' + err.message);
            }
        });
    }

    if (grid) {
        grid.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.btn-copy-ticket-link');
            if (copyBtn) {
                copyTextToClipboard(copyBtn.getAttribute('data-ticket-url'), copyBtn, '¡Link Copiado!');
                return;
            }
            const edit = getTargetData(e, '.btn-edit');
            if (edit) openClientProjectModal(edit.id);
            const del = getTargetData(e, '.btn-delete');
            if (del) openDeleteModal(del.id, 'clientproject', del.name);
        });
    }
})();

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


// ==========================================
// FLOW EXPRESS INTEGRATION
// ==========================================
const SUPABASE_URL = 'https://ppdirywkrmuexufadekw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZGlyeXdrcm11ZXh1ZmFkZWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTAzNzUsImV4cCI6MjA4Njc4NjM3NX0.SRfTT08pn-x1sEUk9yUvulhZuWHBY1NzgXUyZRHrH9w';

let supabaseClient = null;

async function initExpressOrders() {
    if (typeof supabase === 'undefined') return;
    
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Solo cargamos los pedidos Express al hacer clic en el tab
    const tabBtn = document.getElementById('tab-express');
    if (tabBtn) {
        tabBtn.addEventListener('click', () => {
            loadExpressOrders();
        });
    }
}

async function loadExpressOrders() {
    const tbody = document.getElementById('express-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando pedidos...</td></tr>';
    
    try {
        const { data, error } = await supabaseClient
            .from('quick_orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
            
        if (error) throw error;
        
        if (!data || data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay pedidos express.</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.map(order => {
            const date = new Date(order.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            
            let statusBadge = '';
            if (order.status === 'pendiente') statusBadge = '<span class="status-badge" style="background:#FFBB55;color:#1a1354;padding:4px 8px;border-radius:4px;font-weight:bold;">PENDIENTE</span>';
            else if (order.status === 'procesado') statusBadge = '<span class="status-badge" style="background:#4DA8FF;color:white;padding:4px 8px;border-radius:4px;">PROCESADO</span>';
            else statusBadge = '<span class="status-badge" style="background:#00D68F;color:white;padding:4px 8px;border-radius:4px;">COMPLETADO</span>';
            
            return `
                <tr>
                    <td>${date}</td>
                    <td style="font-weight:bold;">${escapeHtml(order.client_name)}</td>
                    <td>${escapeHtml(order.detail)}</td>
                    <td style="color:#FFBB55;font-weight:bold;">S/. ${Number(order.price).toFixed(2)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        }).join('');
        
    } catch (e) {
        console.error('Error cargando pedidos express:', e);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-red-500">Error al cargar los pedidos.</td></tr>';
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initExpressOrders, 1000); // Esperar a que Supabase cargue
});
