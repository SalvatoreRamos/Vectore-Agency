// ===================================
// State Management
// ===================================
let products = [];
let projects = [];
let activeSection = 'catalog';
let editingProductId = null;
let editingProjectId = null;
let deletingId = null;
let deletingType = null; // 'product' or 'project'

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

// Section elements
const catalogSection = document.getElementById('catalogSection');
const portfolioSection = document.getElementById('portfolioSection');
const navItems = document.querySelectorAll('.nav-item');

// Modal elements
const productModal = document.getElementById('productModal');
const projectFormModal = document.getElementById('projectFormModal');
const deleteModal = document.getElementById('deleteModal');
const productForm = document.getElementById('productForm');
const projectForm = document.getElementById('projectForm');
const modalTitle = document.getElementById('modalTitle');
const projectModalTitle = document.getElementById('projectModalTitle');
const modalClose = document.getElementById('modalClose');
const projectModalClose = document.getElementById('projectModalClose');
const btnCancelProduct = document.getElementById('btnCancelProduct');
const btnCancelProject = document.getElementById('btnCancelProject');
const deleteModalClose = document.getElementById('deleteModalClose');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const deleteItemName = document.getElementById('deleteItemName');

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
        fetchAndRenderProjects()
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

async function deleteItemAction() {
    if (!deletingId) return;
    try {
        const res = deletingType === 'product'
            ? await api.deleteProduct(deletingId)
            : await api.deleteProject(deletingId);

        if (res.success) {
            setTimeout(async () => {
                if (deletingType === 'product') await fetchAndRenderProducts();
                else await fetchAndRenderProjects();
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
        <div class="admin-product-card" data-id="${productId}">
            <div class="admin-product-image" style="background: ${getGradient(product.category, productId)}">
                ${imageContent}
                <span class="category-badge ${product.category}">${product.category === 'digital' ? 'Digital' : 'Físico'}</span>
            </div>
            <div class="admin-product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="admin-product-price">Desde $${product.price}</div>
                <div class="admin-product-actions">
                    <button class="btn-edit" onclick="openEditModal('${productId}')">Editar</button>
                    <button class="btn-delete" onclick="openDeleteModal('${productId}', 'product', '${product.name}')">Eliminar</button>
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
        <div class="admin-product-card" data-id="${projectId}">
            <div class="admin-product-image">
                <img src="${project.thumbnail}" alt="${project.title}">
                <span class="category-badge digital">${project.category}</span>
            </div>
            <div class="admin-product-info">
                <h3>${project.title}</h3>
                <p><strong>Cliente:</strong> ${project.client}</p>
                <div class="admin-product-actions">
                    <button class="btn-edit" onclick="openEditProjectModal('${projectId}')">Editar</button>
                    <button class="btn-delete" onclick="openDeleteModal('${projectId}', 'project', '${project.title}')">Eliminar</button>
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
}

function switchSection(section) {
    activeSection = section;
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    if (section === 'catalog') {
        catalogSection.style.display = 'block';
        portfolioSection.style.display = 'none';
    } else {
        catalogSection.style.display = 'none';
        portfolioSection.style.display = 'block';
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
    deleteModalClose.addEventListener('click', closeDeleteModal);
    btnCancelDelete.addEventListener('click', closeDeleteModal);

    btnAddProduct.addEventListener('click', openAddModal);
    btnAddProject.addEventListener('click', openAddProjectModal);

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

    // Close modals on outside click
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
    });

    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
}

// Make functions available globally for onclick handlers
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;

// Initialize on load
init();
