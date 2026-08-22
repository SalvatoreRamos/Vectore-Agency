// ============================================
// FLOW EXPRESS — Supabase-powered quick orders
// ============================================

const SUPABASE_URL = 'https://ppdirywkrmuexufadekw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZGlyeXdrcm11ZXh1ZmFkZWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTAzNzUsImV4cCI6MjA4Njc4NjM3NX0.SRfTT08pn-x1sEUk9yUvulhZuWHBY1NzgXUyZRHrH9w';

let supabaseClient = null;
let currentUser = null;
let currentProfile = null;
let orders = [];

// ============================================
// Init
// ============================================

async function initFlowExpress() {
    // Initialize Supabase client
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        }
    });

    // Check for existing session
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        currentUser = session.user;
        await loadProfile();
        showApp();
        await loadOrders();
    } else {
        showLogin();
    }

    // Listen for auth changes (Google OAuth redirect)
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            await loadProfile();
            showApp();
            await loadOrders();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            currentProfile = null;
            showLogin();
        }
    });
}

// ============================================
// Auth
// ============================================

async function loadProfile() {
    if (!currentUser) return;
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

    if (!error && data) {
        currentProfile = data;
    }
}

async function handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('feLoginEmail').value.trim();
    const password = document.getElementById('feLoginPassword').value;
    const errorEl = document.getElementById('feLoginError');
    const btn = document.getElementById('feLoginBtn');

    if (!email || !password) {
        errorEl.textContent = 'Ingresa correo y contraseña';
        errorEl.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="fe-spinner"></div> Entrando...';
    errorEl.style.display = 'none';

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        errorEl.textContent = error.message || 'Error al iniciar sesión';
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = '⚡ Entrar';
        return;
    }

    // Auth state change listener will handle the rest
}

async function handleGoogleLogin() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + '/vf',
        }
    });

    if (error) {
        const errorEl = document.getElementById('feLoginError');
        errorEl.textContent = error.message || 'Error con Google';
        errorEl.style.display = 'block';
    }
}

async function handleLogout() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    currentProfile = null;
    orders = [];
    showLogin();
}

// ============================================
// UI State
// ============================================

function showLogin() {
    document.getElementById('feLoginScreen').style.display = 'flex';
    document.getElementById('feApp').style.display = 'none';
}

function showApp() {
    document.getElementById('feLoginScreen').style.display = 'none';
    document.getElementById('feApp').style.display = 'flex';

    // Update user info in header
    const nameEl = document.getElementById('feUserName');
    if (currentProfile) {
        nameEl.textContent = currentProfile.full_name || currentUser.email;
    } else {
        nameEl.textContent = currentUser.email;
    }
}

// ============================================
// Quick Orders CRUD
// ============================================

async function loadOrders() {
    if (!currentProfile) return;

    const { data, error } = await supabaseClient
        .from('quick_orders')
        .select('*')
        .eq('workspace_id', currentProfile.workspace_id)
        .order('created_at', { ascending: false })
        .limit(30);

    if (!error && data) {
        orders = data;
        renderOrders();
    }
}

async function handleCreateOrder(e) {
    e.preventDefault();

    const clientName = document.getElementById('feClientName').value.trim();
    const detail = document.getElementById('feDetail').value.trim();
    const priceStr = document.getElementById('fePrice').value.trim();
    const btn = document.getElementById('feSubmitBtn');

    if (!clientName || !detail || !priceStr) {
        showToast('Completa los 3 campos', 'error');
        return;
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
        showToast('Precio inválido', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="fe-spinner"></div> Guardando...';

    const { data, error } = await supabaseClient
        .from('quick_orders')
        .insert({
            workspace_id: currentProfile.workspace_id,
            created_by: currentUser.id,
            client_name: clientName,
            detail: detail,
            price: price,
            status: 'pendiente'
        })
        .select()
        .single();

    btn.disabled = false;
    btn.innerHTML = '⚡ Guardar Pedido';

    if (error) {
        showToast('Error: ' + (error.message || 'No se pudo guardar'), 'error');
        return;
    }

    // Success
    showToast('¡Pedido registrado! ✓', 'success');

    // Clear form
    document.getElementById('feClientName').value = '';
    document.getElementById('feDetail').value = '';
    document.getElementById('fePrice').value = '';
    document.getElementById('feClientName').focus();

    // Add to top of list
    orders.unshift(data);
    renderOrders();
}

async function handleExpressComplete(orderId) {
    const { data, error } = await supabaseClient
        .from('quick_orders')
        .update({
            status: 'completado',
            completed_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

    if (error) {
        showToast('Error al completar', 'error');
        return;
    }

    // Update local list
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) orders[idx] = data;
    renderOrders();
    showToast('Completado Express ⚡', 'success');
}

// ============================================
// Render
// ============================================

function renderOrders() {
    const listEl = document.getElementById('feOrdersList');
    const countEl = document.getElementById('feOrdersCount');
    const pendingCount = orders.filter(o => o.status === 'pendiente').length;

    countEl.textContent = pendingCount > 0 ? `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}` : 'Todo al día';

    if (orders.length === 0) {
        listEl.innerHTML = `
            <div class="fe-empty">
                <div class="fe-empty-icon">📋</div>
                <p>Aún no hay pedidos.<br>Registra tu primer pedido arriba.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = orders.map(order => {
        const date = new Date(order.created_at);
        const dateStr = date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

        const expressBtn = order.status === 'pendiente'
            ? `<button class="fe-express-btn" onclick="handleExpressComplete('${order.id}')">⚡ Express</button>`
            : `<span class="fe-status-badge ${order.status}">${order.status}</span>`;

        return `
            <div class="fe-order-card">
                <div class="fe-order-top">
                    <span class="fe-order-client">${escapeHtml(order.client_name)}</span>
                    <span class="fe-order-price">S/. ${Number(order.price).toFixed(2)}</span>
                </div>
                <div class="fe-order-detail">${escapeHtml(order.detail)}</div>
                <div class="fe-order-bottom">
                    <span class="fe-order-date">${dateStr}</span>
                    ${expressBtn}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// Utilities
// ============================================

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

let toastTimeout = null;
function showToast(message, type = 'info') {
    const toast = document.getElementById('feToast');
    toast.textContent = message;
    toast.className = `fe-toast ${type}`;

    // Force reflow
    void toast.offsetWidth;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ============================================
// Boot
// ============================================

document.addEventListener('DOMContentLoaded', initFlowExpress);
