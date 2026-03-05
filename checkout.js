// ===================================
// Vectore — Checkout Logic
// Culqi Checkout v4 Integration
// ===================================

// ===================================
// State
// ===================================
let checkoutCart = [];
let checkoutUser = null;
let selectedPaymentMethod = 'card'; // 'card' or 'whatsapp'
let culqiConfig = null;
let currentCulqiOrderId = null;

// ===================================
// Init
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutData();
    loadCulqiConfig();
    initEventListeners();
});

// ===================================
// Load cart and user from localStorage
// ===================================
function loadCheckoutData() {
    const savedCart = localStorage.getItem('vectore_cart');
    const savedUser = localStorage.getItem('vectore_user');
    const savedToken = localStorage.getItem('vectore_token');

    checkoutCart = savedCart ? JSON.parse(savedCart) : [];
    checkoutUser = savedUser ? JSON.parse(savedUser) : null;

    if (checkoutCart.length === 0) {
        showEmptyCart();
        return;
    }

    if (!checkoutUser || !savedToken) {
        // Redirect to home to login
        showCheckoutToast('Debes iniciar sesión para continuar', 'error');
        setTimeout(() => { window.location.href = '/'; }, 2000);
        return;
    }

    // Pre-fill form with user data
    const nameField = document.getElementById('checkoutName');
    const emailField = document.getElementById('checkoutEmail');
    if (nameField && checkoutUser.name) nameField.value = checkoutUser.name;
    if (emailField && checkoutUser.email) emailField.value = checkoutUser.email;

    renderOrderSummary();
}

// ===================================
// Load Culqi config from backend
// ===================================
async function loadCulqiConfig() {
    try {
        const res = await fetch('/api/payments/config');
        const data = await res.json();
        if (data.success) {
            culqiConfig = data;
            // Set Culqi public key
            if (typeof Culqi !== 'undefined') {
                Culqi.publicKey = data.publicKey;
            }
        }
    } catch (err) {
        console.error('Failed to load Culqi config:', err);
    }
}

// ===================================
// Render order summary
// ===================================
function renderOrderSummary() {
    const containers = ['summaryItems', 'summaryItemsPayment'];
    const total = getTotal();

    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        checkoutCart.forEach(item => {
            const itemTotal = (item.price * item.qty).toFixed(2);
            const imgContent = item.image
                ? `<img src="${item.image}" alt="${item.name}">`
                : '📦';

            html += `
                <div class="summary-item">
                    <div class="summary-item-img">${imgContent}</div>
                    <div class="summary-item-details">
                        <div class="summary-item-name">${item.name}</div>
                        <div class="summary-item-meta">Cant: ${item.qty} × S/ ${item.price}</div>
                    </div>
                    <div class="summary-item-price">S/ ${itemTotal}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    });

    // Update totals
    const totalStr = `S/ ${total.toFixed(2)}`;
    ['summarySubtotal', 'summarySubtotalPayment'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = totalStr;
    });
    ['summaryTotal', 'summaryTotalPayment'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = totalStr;
    });
}

function getTotal() {
    return checkoutCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// ===================================
// Event Listeners
// ===================================
function initEventListeners() {
    // Form submission (Step 1 → Step 2)
    const form = document.getElementById('checkoutForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            goToStep(2);
        });
    }

    // Payment method selection
    const btnCard = document.getElementById('btnPayCard');
    const btnWhatsApp = document.getElementById('btnPayWhatsApp');

    if (btnCard) {
        btnCard.addEventListener('click', () => {
            selectPaymentMethod('card');
        });
    }

    if (btnWhatsApp) {
        btnWhatsApp.addEventListener('click', () => {
            selectPaymentMethod('whatsapp');
        });
    }

    // Process payment button
    const btnProcess = document.getElementById('btnProcessPayment');
    if (btnProcess) {
        btnProcess.addEventListener('click', () => {
            processPayment();
        });
    }

    // Back button
    const btnBack = document.getElementById('btnBackToData');
    if (btnBack) {
        btnBack.addEventListener('click', () => {
            goToStep(1);
        });
    }
}

// ===================================
// Payment method selection
// ===================================
function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    const btnCard = document.getElementById('btnPayCard');
    const btnWhatsApp = document.getElementById('btnPayWhatsApp');
    const btnProcess = document.getElementById('btnProcessPayment');
    const btnPayText = document.getElementById('btnPayText');

    if (btnCard) btnCard.classList.toggle('active', method === 'card');
    if (btnWhatsApp) btnWhatsApp.classList.toggle('active', method === 'whatsapp');

    if (method === 'card') {
        btnProcess.classList.remove('btn-whatsapp');
        btnPayText.textContent = `Pagar S/ ${getTotal().toFixed(2)}`;
    } else {
        btnProcess.classList.add('btn-whatsapp');
        btnPayText.textContent = 'Enviar pedido por WhatsApp';
    }
}

// ===================================
// Step Navigation
// ===================================
function goToStep(step) {
    const steps = document.querySelectorAll('.checkout-step');
    steps.forEach(s => s.style.display = 'none');

    const stepIndicators = document.querySelectorAll('.step');
    const stepLines = document.querySelectorAll('.step-line');

    stepIndicators.forEach((s, i) => {
        s.classList.remove('active', 'completed');
        if (i + 1 < step) s.classList.add('completed');
        if (i + 1 === step) s.classList.add('active');
    });

    stepLines.forEach((line, i) => {
        line.classList.toggle('completed', i + 1 < step);
    });

    if (step === 1) {
        document.getElementById('stepData').style.display = 'flex';
    } else if (step === 2) {
        // Validate step 1
        const name = document.getElementById('checkoutName').value.trim();
        const email = document.getElementById('checkoutEmail').value.trim();
        if (!name || !email) {
            showCheckoutToast('Completa tu nombre y correo', 'error');
            goToStep(1);
            return;
        }

        document.getElementById('stepPayment').style.display = 'flex';
        // Set initial payment text
        selectPaymentMethod(selectedPaymentMethod);
    } else if (step === 3) {
        document.getElementById('stepConfirmation').style.display = 'flex';
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================
// Process Payment
// ===================================
async function processPayment() {
    if (selectedPaymentMethod === 'whatsapp') {
        processWhatsAppOrder();
        return;
    }

    // Card payment via Culqi
    processCulqiPayment();
}

// ===================================
// Culqi Payment
// ===================================
async function processCulqiPayment() {
    const total = getTotal();
    const amountInCents = Math.round(total * 100);

    if (!culqiConfig || typeof Culqi === 'undefined') {
        showCheckoutToast('Error al cargar la pasarela de pagos. Recarga la página.', 'error');
        return;
    }

    try {
        // First, create a Culqi order for multipago support
        const token = localStorage.getItem('vectore_token');
        const name = document.getElementById('checkoutName').value.trim();
        const email = document.getElementById('checkoutEmail').value.trim();
        const phone = document.getElementById('checkoutPhone').value.trim();

        let culqiOrderId = '';
        try {
            const orderRes = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: amountInCents,
                    email: email,
                    customerName: name,
                    customerPhone: phone || '999999999',
                    items: checkoutCart
                })
            });
            const orderData = await orderRes.json();
            if (orderData.success) {
                culqiOrderId = orderData.culqiOrderId;
                currentCulqiOrderId = culqiOrderId;
            }
        } catch (e) {
            console.warn('Could not create Culqi order, proceeding with card-only:', e);
        }

        // Configure Culqi Checkout
        const settingsObj = {
            title: 'Vectore Agency',
            currency: 'PEN',
            amount: amountInCents
        };

        // Add RSA keys for encryption
        if (culqiConfig.rsaId) {
            settingsObj.xculqirsaid = culqiConfig.rsaId;
        }
        if (culqiConfig.rsaPublicKey) {
            settingsObj.rsapublickey = culqiConfig.rsaPublicKey;
        }

        // Add order if created successfully (enables multipago)
        if (culqiOrderId) {
            settingsObj.order = culqiOrderId;
        }

        Culqi.settings(settingsObj);

        // Customize Culqi UI
        Culqi.options({
            lang: 'auto',
            installments: false,
            paymentMethods: {
                tarjeta: true,
                yape: true,
                bancaMovil: !!culqiOrderId,
                agente: !!culqiOrderId,
                billetera: !!culqiOrderId,
                cuotealo: false
            },
            style: {
                logo: window.location.origin + '/favicon.png',
                bannerColor: '#6366f1',
                buttonBackground: '#6366f1',
                buttonTextColor: '#ffffff',
                menuColor: '#6366f1',
                linksColor: '#818cf8',
                priceColor: '#f1f1f4'
            }
        });

        // Open Culqi Checkout
        Culqi.open();

    } catch (error) {
        console.error('Culqi payment error:', error);
        showCheckoutToast('Error al abrir la pasarela de pagos', 'error');
    }
}

// ===================================
// Culqi Global Callback
// This function must be named 'culqi' — it's called by Culqi.js
// ===================================
window.culqi = function () {
    if (Culqi.token) {
        // Card token received — create charge on backend
        handleCulqiToken(Culqi.token);
    } else if (Culqi.order) {
        // Order payment (Yape, PagoEfectivo, etc.)
        handleCulqiOrder(Culqi.order);
    } else {
        // Error
        console.error('Culqi error:', Culqi.error);
        const errorMsg = Culqi.error?.user_message || Culqi.error?.merchant_message || 'Error en el pago';
        showCheckoutToast(errorMsg, 'error');
    }
};

// ===================================
// Handle Culqi Token (card payment)
// ===================================
async function handleCulqiToken(tokenData) {
    showLoading(true);

    const total = getTotal();
    const amountInCents = Math.round(total * 100);
    const jwtToken = localStorage.getItem('vectore_token');

    const name = document.getElementById('checkoutName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const street = document.getElementById('checkoutStreet').value.trim();
    const district = document.getElementById('checkoutDistrict').value.trim();
    const city = document.getElementById('checkoutCity').value.trim();
    const reference = document.getElementById('checkoutReference').value.trim();
    const notes = document.getElementById('checkoutNotes').value.trim();

    try {
        const res = await fetch('/api/payments/create-charge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({
                tokenId: tokenData.id,
                amount: amountInCents,
                email: email,
                items: checkoutCart,
                customerName: name,
                customerPhone: phone,
                shippingAddress: {
                    street: street,
                    district: district,
                    city: city,
                    reference: reference
                },
                notes: notes
            })
        });

        const data = await res.json();

        showLoading(false);

        if (data.success) {
            showConfirmation(data.order);
            clearCart();
        } else {
            showCheckoutToast(data.message || 'Error al procesar el pago', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Charge creation error:', error);
        showCheckoutToast('Error de conexión. Intenta de nuevo.', 'error');
    }
}

// ===================================
// Handle Culqi Order (Yape, PagoEfectivo, etc.)
// ===================================
async function handleCulqiOrder(orderData) {
    showLoading(true);

    const jwtToken = localStorage.getItem('vectore_token');
    const total = getTotal();
    const amountInCents = Math.round(total * 100);

    const name = document.getElementById('checkoutName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const street = document.getElementById('checkoutStreet').value.trim();
    const district = document.getElementById('checkoutDistrict').value.trim();
    const city = document.getElementById('checkoutCity').value.trim();
    const reference = document.getElementById('checkoutReference').value.trim();
    const notes = document.getElementById('checkoutNotes').value.trim();

    try {
        const res = await fetch('/api/payments/confirm-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify({
                culqiOrderId: orderData.id || currentCulqiOrderId,
                items: checkoutCart,
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                shippingAddress: {
                    street: street,
                    district: district,
                    city: city,
                    reference: reference
                },
                notes: notes,
                amount: amountInCents
            })
        });

        const data = await res.json();
        showLoading(false);

        if (data.success) {
            showConfirmation(data.order);
            clearCart();
        } else {
            showCheckoutToast(data.message || 'Error al confirmar la orden', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Order confirmation error:', error);
        showCheckoutToast('Error de conexión', 'error');
    }
}

// ===================================
// WhatsApp Order
// ===================================
function processWhatsAppOrder() {
    const name = document.getElementById('checkoutName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const street = document.getElementById('checkoutStreet').value.trim();
    const district = document.getElementById('checkoutDistrict').value.trim();
    const notes = document.getElementById('checkoutNotes').value.trim();

    let msg = '¡Hola! Quisiera hacer el siguiente pedido:\n\n';
    checkoutCart.forEach((item, i) => {
        msg += `${i + 1}. *${item.name}* x${item.qty} — S/ ${(item.price * item.qty).toFixed(2)}\n`;
    });
    msg += `\n*Total: S/ ${getTotal().toFixed(2)}*`;
    msg += `\n\n📋 Datos:`;
    msg += `\nNombre: ${name}`;
    msg += `\nCorreo: ${email}`;
    if (phone) msg += `\nTeléfono: ${phone}`;
    if (street) msg += `\nDirección: ${street}${district ? ', ' + district : ''}`;
    if (notes) msg += `\nNotas: ${notes}`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/51950699910?text=${encoded}`, '_blank');
}

// ===================================
// Show Confirmation
// ===================================
function showConfirmation(order) {
    const details = document.getElementById('confirmationDetails');
    if (details) {
        details.innerHTML = `
            <div class="confirmation-detail-row">
                <span class="label">Nº de Pedido</span>
                <span class="value">${order.orderNumber}</span>
            </div>
            <div class="confirmation-detail-row">
                <span class="label">Total pagado</span>
                <span class="value">S/ ${order.total.toFixed(2)}</span>
            </div>
            <div class="confirmation-detail-row">
                <span class="label">Estado</span>
                <span class="value" style="color: #10b981;">✓ Pagado</span>
            </div>
            <div class="confirmation-detail-row">
                <span class="label">Fecha</span>
                <span class="value">${new Date(order.paidAt).toLocaleString('es-PE')}</span>
            </div>
        `;
    }

    goToStep(3);
}

// ===================================
// Clear cart after successful purchase
// ===================================
function clearCart() {
    localStorage.removeItem('vectore_cart');
    checkoutCart = [];
}

// ===================================
// Show empty cart state
// ===================================
function showEmptyCart() {
    const main = document.querySelector('.checkout-main');
    if (main) {
        main.innerHTML = `
            <div class="checkout-card empty-cart-message">
                <div class="empty-icon">🛒</div>
                <h2>Tu carrito está vacío</h2>
                <p>Agrega productos a tu carrito para continuar con el checkout</p>
                <a href="/" class="btn-continue">
                    Ir al catálogo
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
            </div>
        `;
    }
}

// ===================================
// Loading indicator
// ===================================
function showLoading(show) {
    const overlay = document.getElementById('checkoutLoading');
    if (overlay) {
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// ===================================
// Toast notifications
// ===================================
function showCheckoutToast(message, type = 'success') {
    const old = document.querySelector('.checkout-toast');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = `checkout-toast toast-${type}`;
    toast.innerHTML = `
        <span>${type === 'success' ? '✓' : '✕'}</span>
        <p>${message}</p>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}
