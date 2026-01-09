// ===================================
// State Management
// ===================================
let products = [];
let currentFilter = 'all';
let editingProductId = null;
let deletingProductId = null;

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

// Modal elements
const productModal = document.getElementById('productModal');
const deleteModal = document.getElementById('deleteModal');
const productForm = document.getElementById('productForm');
const modalTitle = document.getElementById('modalTitle');
const modalClose = document.getElementById('modalClose');
const btnCancelProduct = document.getElementById('btnCancelProduct');
const deleteModalClose = document.getElementById('deleteModalClose');
const btnCancelDelete = document.getElementById('btnCancelDelete');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const deleteProductName = document.getElementById('deleteProductName');

// Stats elements
const totalProductsEl = document.getElementById('totalProducts');
const digitalProductsEl = document.getElementById('digitalProducts');
const physicalProductsEl = document.getElementById('physicalProducts');

// Products grid
const adminProductsGrid = document.getElementById('adminProductsGrid');

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
    await fetchAndRenderProducts();
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
// Products CRUD
// ===================================
async function fetchAndRenderProducts() {
    try {
        adminProductsGrid.innerHTML = '<div class="loader">Loading...</div>';
        const response = await api.getProducts();
        products = response.data;
        renderProducts();
        updateStats();
    } catch (error) {
        console.error('Error fetching products:', error);
        adminProductsGrid.innerHTML = 'Error loading products';
    }
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
    const filteredProducts = currentFilter === 'all'
        ? products
        : products.filter(p => p.category === currentFilter);

    if (filteredProducts.length === 0) {
        adminProductsGrid.innerHTML = '<div class="no-products">No matches found</div>';
        return;
    }

    adminProductsGrid.innerHTML = filteredProducts.map(product => {
        // Handle MongoDB _id
        const productId = product._id || product.id;
        // Determine icon or image
        const imageContent = product.images && product.images.length > 0 && product.images[0].url
            ? `<img src="${product.images[0].url}" alt="${product.name}">`
            : `<span>${getProductIcon(product)}</span>`;

        // Handle category display
        const categoryLabel = product.category === 'digital' ? 'Digital' : 'Físico';
        const categoryClass = product.category;

        return `
        <div class="admin-product-card" data-id="${productId}">
            <div class="admin-product-image" style="background: ${getGradient(product.category, productId)}">
                ${imageContent}
                <span class="category-badge ${categoryClass}">${categoryLabel}</span>
            </div>
            <div class="admin-product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="admin-product-price">Desde $${product.price}</div>
                <div class="admin-product-actions">
                    <button class="btn-edit" onclick="openEditModal('${productId}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Editar
                    </button>
                    <button class="btn-delete" onclick="openDeleteModal('${productId}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
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
    const digitalCount = products.filter(p => p.category === 'digital').length;
    const physicalCount = products.filter(p => p.category === 'physical' || p.category === 'fisico').length;

    totalProductsEl.textContent = products.length;
    digitalProductsEl.textContent = digitalCount;
    physicalProductsEl.textContent = physicalCount;
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

function openDeleteModal(id) {
    deletingProductId = id;
    const product = getProduct(id);
    if (!product) return;

    deleteProductName.textContent = product.name;
    deleteModal.classList.add('active');
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
    deletingProductId = null;
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

    // Modal close buttons
    modalClose.addEventListener('click', closeProductModal);
    btnCancelProduct.addEventListener('click', closeProductModal);
    deleteModalClose.addEventListener('click', closeDeleteModal);
    btnCancelDelete.addEventListener('click', closeDeleteModal);

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

    // Delete confirm
    btnConfirmDelete.addEventListener('click', () => {
        if (deletingProductId) {
            deleteProductAction(deletingProductId);
            closeDeleteModal();
        }
    });

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
