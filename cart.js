// ===================================
// Vectore — Auth + Cart System
// ===================================

const GOOGLE_CLIENT_ID = '433259886019-haiklq9fuqr673839bq03p97jmnlnvtt.apps.googleusercontent.com';

// ===================================
// State
// ===================================
let currentUser = null;
let cart = [];

// ===================================
// Init
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadSession();
    renderCartCount();
    initCartUI();
    initGoogleSignIn();
});

// ===================================
// Google Sign-In
// ===================================
function initGoogleSignIn() {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false
        });
    };
    document.head.appendChild(script);
}

async function handleGoogleResponse(response) {
    try {
        const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
        });

        const data = await res.json();

        if (data.success) {
            currentUser = data.user;
            localStorage.setItem('vectore_token', data.token);
            localStorage.setItem('vectore_user', JSON.stringify(data.user));
            renderUserUI();
            closeAuthModal();
            showToast(`¡Bienvenido, ${data.user.name}!`);
        } else {
            showToast('Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Google auth error:', error);
        showToast('Error de conexión', 'error');
    }
}

function loadSession() {
    const token = localStorage.getItem('vectore_token');
    const user = localStorage.getItem('vectore_user');
    if (token && user) {
        currentUser = JSON.parse(user);
        renderUserUI();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('vectore_token');
    localStorage.removeItem('vectore_user');
    renderUserUI();
    showToast('Sesión cerrada');
}

// ===================================
// Auth UI
// ===================================
function renderUserUI() {
    const authArea = document.getElementById('authArea');
    if (!authArea) return;

    if (currentUser) {
        authArea.innerHTML = `
            <div class="user-menu">
                <button class="user-avatar-btn" onclick="toggleUserDropdown()" aria-label="Menú de usuario">
                    <img src="${currentUser.avatar || ''}" alt="${currentUser.name}" class="user-avatar" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                    <span class="user-avatar-fallback" style="display:none">${currentUser.name.charAt(0).toUpperCase()}</span>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-dropdown-header">
                        <strong>${currentUser.name}</strong>
                        <small>${currentUser.email}</small>
                    </div>
                    <hr>
                    <button onclick="logout()" class="dropdown-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Cerrar sesión
                    </button>
                </div>
            </div>
        `;
    } else {
        authArea.innerHTML = `
            <button class="btn-signin" onclick="openAuthModal()" aria-label="Iniciar sesión">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span class="signin-text">Ingresar</span>
            </button>
        `;
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Render Google button
        setTimeout(() => {
            const container = document.getElementById('googleBtnContainer');
            if (container && google?.accounts?.id) {
                container.innerHTML = '';
                google.accounts.id.renderButton(container, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: 'signin_with',
                    shape: 'pill',
                    logo_alignment: 'center',
                    width: 300
                });
            }
        }, 100);
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ===================================
// Cart Logic
// ===================================
function loadCart() {
    const saved = localStorage.getItem('vectore_cart');
    cart = saved ? JSON.parse(saved) : [];
}

function saveCart() {
    localStorage.setItem('vectore_cart', JSON.stringify(cart));
    renderCartCount();
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image || '',
            qty: 1
        });
    }
    saveCart();
    showToast(`"${product.name}" agregado al carrito`);
    renderCartItems();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCartItems();
}

function updateQty(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }
    saveCart();
    renderCartItems();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ===================================
// Cart UI
// ===================================
function initCartUI() {
    // Inject auth area, cart button, auth modal, and cart sidebar into DOM
    const navbar = document.querySelector('.nav-container');
    if (!navbar) return;

    // Create auth + cart area in navbar
    const rightArea = document.createElement('div');
    rightArea.className = 'nav-right';
    rightArea.innerHTML = `
        <div id="authArea"></div>
        <button class="cart-btn" onclick="toggleCart()" aria-label="Carrito">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span class="cart-count" id="cartCount">0</span>
        </button>
    `;
    navbar.appendChild(rightArea);

    // Create auth modal
    const authModal = document.createElement('div');
    authModal.id = 'authModal';
    authModal.className = 'auth-modal';
    authModal.innerHTML = `
        <div class="auth-modal-overlay" onclick="closeAuthModal()"></div>
        <div class="auth-modal-content">
            <button class="auth-close" onclick="closeAuthModal()" aria-label="Cerrar">✕</button>
            <div class="auth-header">
                <img src="Vectore-iso.svg" alt="Vectore" class="auth-logo">
                <h2>Iniciar sesión</h2>
                <p>Ingresa con tu cuenta de Google para guardar tu carrito y realizar pedidos</p>
            </div>
            <div id="googleBtnContainer" class="google-btn-container"></div>
            <p class="auth-terms">Al continuar, aceptas nuestros <a href="/terminos">Términos y Condiciones</a></p>
        </div>
    `;
    document.body.appendChild(authModal);

    // Create cart sidebar
    const cartSidebar = document.createElement('div');
    cartSidebar.id = 'cartSidebar';
    cartSidebar.className = 'cart-sidebar';
    cartSidebar.innerHTML = `
        <div class="cart-overlay" onclick="toggleCart()"></div>
        <div class="cart-panel">
            <div class="cart-header">
                <h3>🛒 Mi Carrito</h3>
                <button class="cart-close" onclick="toggleCart()" aria-label="Cerrar carrito">✕</button>
            </div>
            <div class="cart-items" id="cartItems"></div>
            <div class="cart-footer" id="cartFooter"></div>
        </div>
    `;
    document.body.appendChild(cartSidebar);

    renderUserUI();
    renderCartItems();
}

function renderCartCount() {
    const el = document.getElementById('cartCount');
    if (el) {
        const count = getCartCount();
        el.textContent = count;
        el.style.display = count > 0 ? 'flex' : 'none';
    }
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');
    if (!container || !footer) return;

    renderCartCount();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">🛒</span>
                <p>Tu carrito está vacío</p>
                <small>Explora nuestro catálogo y agrega productos</small>
            </div>
        `;
        footer.innerHTML = '';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="cart-item-price">S/ ${item.price}</span>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="updateQty('${item.id}', -1)" aria-label="Reducir">−</button>
                <span class="qty-value">${item.qty}</span>
                <button class="qty-btn" onclick="updateQty('${item.id}', 1)" aria-label="Aumentar">+</button>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
            </div>
        </div>
    `).join('');

    const total = getCartTotal();
    footer.innerHTML = `
        <div class="cart-total">
            <span>Total:</span>
            <strong>S/ ${total.toFixed(2)}</strong>
        </div>
        <button class="btn-checkout" onclick="checkout()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Pedir por WhatsApp
        </button>
    `;
}

// ===================================
// Checkout
// ===================================
function checkout() {
    if (cart.length === 0) return;

    // Build WhatsApp message with cart summary
    let msg = '¡Hola! Quisiera hacer el siguiente pedido:\n\n';
    cart.forEach((item, i) => {
        msg += `${i + 1}. *${item.name}* x${item.qty} — S/ ${(item.price * item.qty).toFixed(2)}\n`;
    });
    msg += `\n*Total: S/ ${getCartTotal().toFixed(2)}*`;

    if (currentUser) {
        msg += `\n\nNombre: ${currentUser.name}\nCorreo: ${currentUser.email}`;
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/51950699910?text=${encoded}`, '_blank');
}

// ===================================
// Toast Notifications
// ===================================
function showToast(message, type = 'success') {
    // Remove existing toast
    const old = document.querySelector('.toast-notification');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : '✕'}</span>
        <p>${message}</p>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
