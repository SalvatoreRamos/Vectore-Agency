/**
 * AGENCIA VECTORE — Corporate Client Hub & Private Payment Ticket Controller
 * Supports 1-Click Google OAuth, SSO token persistence for Vectore Flow,
 * Work Order (OT) tracking, HD Artwork approval, Photo Reports/PDF Invoices download,
 * and Admin-issued private Culqi payment tickets.
 */

(function () {
    'use strict';

    const STATUS_LABELS = {
        briefing: { label: 'Levantamiento & Brief', cls: '' },
        in_design: { label: 'En Diseño & Pre-Prensa', cls: '' },
        pending_approval: { label: 'Esperando Aprobación de Arte', cls: 'ot-status-pill--pending' },
        in_production: { label: 'En Producción Taller Pucallpa', cls: '' },
        installed: { label: 'Instalado / Desplegado en Campo', cls: 'ot-status-pill--ready' },
        completed: { label: 'Orden Cerrada & Entregada', cls: 'ot-status-pill--ready' }
    };

    const DELIVERABLE_TYPES = {
        art_hd: { icon: '🎨', badge: 'Arte en Alta Resolución' },
        photo_report: { icon: '📸', badge: 'Reporte Fotográfico de Instalación' },
        invoice_pdf: { icon: '🧾', badge: 'Factura / Comprobante PDF' },
        technical_doc: { icon: '📐', badge: 'Expediente / Plano Técnico' }
    };

    const state = {
        user: null,
        googleClientId: '433259886019-haiklq9fuqr673839bq03p97jmnlnvtt.apps.googleusercontent.com',
        culqiPublicKey: '',
        activeTicket: null,
        projects: []
    };

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    document.addEventListener('DOMContentLoaded', async () => {
        initThemeToggle();
        initAuthHandlers();

        // 1. Load public integrations config (Google Client ID + Culqi Public Key)
        try {
            const cfgRes = await api.getSiteConfig();
            if (cfgRes?.data?.integrations) {
                if (cfgRes.data.integrations.googleClientId) {
                    state.googleClientId = cfgRes.data.integrations.googleClientId;
                }
                if (cfgRes.data.integrations.culqiPublicKey) {
                    state.culqiPublicKey = cfgRes.data.integrations.culqiPublicKey;
                }
            }
        } catch (_) { /* continue with fallback Google Client ID */ }

        initGoogleOneClick();

        // 2. Check if URL contains a private Admin-issued payment ticket (?ticket=TOKEN)
        const params = new URLSearchParams(window.location.search);
        const ticketToken = params.get('ticket');
        if (ticketToken) {
            await loadPrivateTicketSpotlight(ticketToken);
        }

        // 3. Restore existing JWT session if present
        if (api.token) {
            try {
                const meRes = await api.getCurrentUser();
                const user = meRes?.user || meRes?.data;
                if (user && user.email) {
                    onAuthenticated(user);
                    return;
                }
            } catch (_) {
                api.logout();
            }
        }
    });

    function initThemeToggle() {
        const btn = document.getElementById('portalThemeBtn');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('vectore_theme', next); } catch (_) { }
        });
    }

    function initAuthHandlers() {
        const form = document.getElementById('clientLoginForm');
        const errBox = document.getElementById('portalAuthError');
        const submitBtn = document.getElementById('portalLoginSubmit');
        const logoutBtn = document.getElementById('portalLogoutBtn');
        const refreshBtn = document.getElementById('refreshPortalBtn');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (errBox) errBox.style.display = 'none';
                const email = document.getElementById('portalEmail').value.trim();
                const password = document.getElementById('portalPassword').value;

                if (submitBtn) submitBtn.disabled = true;
                try {
                    const res = await api.login(email, password);
                    onAuthenticated(res.user);
                } catch (err) {
                    if (errBox) {
                        errBox.textContent = err.message || 'Credenciales incorrectas.';
                        errBox.style.display = 'block';
                    }
                } finally {
                    if (submitBtn) submitBtn.disabled = false;
                }
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                api.logout();
                state.user = null;
                document.getElementById('portalDashboardView').style.display = 'none';
                document.getElementById('portalLoginView').style.display = '';
                logoutBtn.style.display = 'none';
                renderTicketSpotlightUI();
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => loadClientProjects());
        }
    }

    function initGoogleOneClick() {
        const container = document.getElementById('googleSignInContainer');
        if (!container) return;

        let attempts = 0;
        const tryMount = () => {
            if (window.google && window.google.accounts && window.google.accounts.id) {
                window.google.accounts.id.initialize({
                    client_id: state.googleClientId,
                    callback: handleGoogleCredential
                });
                window.google.accounts.id.renderButton(container, {
                    theme: 'filled_black',
                    size: 'large',
                    shape: 'pill',
                    text: 'continue_with',
                    width: 300
                });
            } else if (attempts < 20) {
                attempts += 1;
                setTimeout(tryMount, 300);
            }
        };
        tryMount();
    }

    async function handleGoogleCredential(response) {
        const errBox = document.getElementById('portalAuthError');
        if (errBox) errBox.style.display = 'none';
        try {
            const res = await api.loginWithGoogle(response.credential);
            if (res?.user) {
                onAuthenticated(res.user);
            }
        } catch (err) {
            if (errBox) {
                errBox.textContent = err.message || 'No se pudo autenticar con Google.';
                errBox.style.display = 'block';
            }
        }
    }

    function onAuthenticated(user) {
        state.user = user;
        document.getElementById('portalLoginView').style.display = 'none';
        document.getElementById('portalDashboardView').style.display = '';
        document.getElementById('portalLogoutBtn').style.display = 'inline-flex';

        const greeting = document.getElementById('portalUserGreeting');
        const emailDisp = document.getElementById('portalUserEmailDisplay');
        if (greeting) greeting.textContent = `Hola, ${user.name || 'Cliente Corporativo'}`;
        if (emailDisp) emailDisp.textContent = `Cuenta vinculada: ${user.email}`;

        renderTicketSpotlightUI();
        loadClientProjects();
    }

    // =========================================================================
    // CLIENT WORK ORDERS (OTs) & DELIVERABLE APPROVALS
    // =========================================================================
    async function loadClientProjects() {
        const listEl = document.getElementById('portalProjectsList');
        if (!listEl) return;

        listEl.innerHTML = `<div style="padding:36px;text-align:center;color:var(--vf-text-secondary);">Cargando tus expedientes corporativos...</div>`;

        try {
            const res = await api.getMyClientProjects();
            const projects = Array.isArray(res?.data) ? res.data : [];
            state.projects = projects;
            updatePortalMetrics(projects);
            renderProjectsList(projects);
        } catch (err) {
            listEl.innerHTML = `<div class="ot-card"><p style="color:#ff6b7a;">Error al cargar expedientes: ${escapeHtml(err.message)}</p></div>`;
        }
    }

    function updatePortalMetrics(projects) {
        let pendingArts = 0;
        let totalFiles = 0;
        projects.forEach((p) => {
            (p.deliverables || []).forEach((d) => {
                totalFiles += 1;
                if (d.type === 'art_hd' && d.approvalStatus === 'pending') {
                    pendingArts += 1;
                }
            });
        });

        document.getElementById('statTotalOts').textContent = String(projects.length);
        document.getElementById('statPendingArts').textContent = String(pendingArts);
        document.getElementById('statTotalFiles').textContent = String(totalFiles);
    }

    function renderProjectsList(projects) {
        const listEl = document.getElementById('portalProjectsList');
        if (!listEl) return;

        if (projects.length === 0) {
            const email = state.user?.email || '';
            listEl.innerHTML = `
                <div class="ot-card" style="text-align:center;padding:48px 28px;">
                    <div style="font-size:2.4rem;margin-bottom:12px;">📂</div>
                    <h3 style="font-size:1.3rem;color:var(--vf-heading-contrast);margin-bottom:8px;">
                        Aún no hay Órdenes de Trabajo vinculadas a ${escapeHtml(email)}
                    </h3>
                    <p style="font-size:0.92rem;color:var(--vf-text-secondary);max-width:560px;margin:0 auto 22px;">
                        Si tu empresa ya tiene un despliegue en curso con Agencia Vectore, indícale a tu Ejecutivo de Cuenta que habilite el expediente para este correo de Google.
                    </p>
                    <a href="https://wa.me/51950699910?text=${encodeURIComponent(`Hola Vectore, inicié sesión en el Portal de Clientes con ${email}. Por favor vinculen mi Orden de Trabajo.`)}"
                       target="_blank" rel="noopener" class="btn-cta-pill">
                        <span>Vincular mi Orden por WhatsApp ↗</span>
                    </a>
                </div>
            `;
            return;
        }

        listEl.innerHTML = projects.map((proj) => {
            const st = STATUS_LABELS[proj.status] || { label: proj.status || 'En Curso', cls: '' };
            const deliverables = Array.isArray(proj.deliverables) ? proj.deliverables : [];
            const ticket = proj.paymentTicket || {};

            return `
                <article class="ot-card">
                    <div class="ot-header">
                        <div>
                            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
                                <span class="mono" style="font-size:0.8rem;font-weight:700;color:var(--vf-primary-hover);">${escapeHtml(proj.otCode || 'OT-ACTIVA')}</span>
                                <span style="font-size:0.8rem;color:var(--vf-text-muted);">• ${escapeHtml(proj.clientCompany || proj.clientName || 'Cuenta Corporativa')}</span>
                                <span style="font-size:0.8rem;color:var(--vf-text-muted);">• 📍 ${escapeHtml(proj.location || 'Pucallpa')}</span>
                            </div>
                            <h2 style="font-size:1.35rem;font-weight:800;color:var(--vf-heading-contrast);">${escapeHtml(proj.title)}</h2>
                        </div>
                        <span class="ot-status-pill ${st.cls}">${escapeHtml(st.label)} · ${Number(proj.progress) || 0}%</span>
                    </div>

                    <div class="ot-progress-track">
                        <div class="ot-progress-fill" style="width:${Math.min(100, Math.max(4, Number(proj.progress) || 10))}%;"></div>
                    </div>

                    ${proj.timelineNotes ? `
                        <p style="font-size:0.9rem;color:var(--vf-text-secondary);padding:12px 16px;border-radius:var(--radius-sm);background:var(--vf-bg);border-left:3px solid var(--vf-primary);margin-bottom:18px;">
                            <strong>Reporte Operativo:</strong> ${escapeHtml(proj.timelineNotes)}
                        </p>
                    ` : ''}

                    ${ticket.enabled && Number(ticket.amountPen) > 0 ? `
                        <div style="padding:16px 20px;border-radius:var(--radius-md);background:rgba(134,85,255,0.1);border:1px solid rgba(134,85,255,0.32);display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:20px;">
                            <div>
                                <span class="mono" style="font-size:0.72rem;color:var(--vf-primary-hover);display:block;">TICKET DE PAGO CORPORATIVO HABILITADO</span>
                                <strong style="font-size:1rem;color:var(--vf-heading-contrast);">${escapeHtml(ticket.concept || `Liquidación / Adelanto ${proj.otCode}`)} — S/ ${Number(ticket.amountPen).toFixed(2)}</strong>
                            </div>
                            ${ticket.status === 'paid'
                                ? `<span class="ot-status-pill ot-status-pill--ready">✓ PAGADO</span>`
                                : `<button type="button" class="btn-cta-pill" data-pay-ticket="${escapeHtml(ticket.ticketToken)}" data-pay-amount="${Number(ticket.amountPen)}" data-pay-title="${escapeHtml(proj.otCode + ' · ' + (ticket.concept || proj.title))}">
                                    <span>💳 Pagar S/ ${Number(ticket.amountPen).toFixed(2)} con Tarjeta</span>
                                   </button>`
                            }
                        </div>
                    ` : ''}

                    <h3 style="font-size:0.92rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--vf-text-muted);margin-top:8px;">
                        Archivos en Alta Resolución, Reportes de Campo &amp; Facturas (${deliverables.length})
                    </h3>

                    ${deliverables.length === 0 ? `
                        <p style="font-size:0.86rem;color:var(--vf-text-muted);margin-top:10px;">
                            Los artes finales, reportes de montaje y comprobantes PDF aparecerán aquí conforme avance la Orden de Trabajo.
                        </p>
                    ` : `
                        <div class="deliverables-grid">
                            ${deliverables.map((deliv) => renderDeliverableCard(proj._id, deliv)).join('')}
                        </div>
                    `}
                </article>
            `;
        }).join('');

        // Bind deliverable approval buttons
        listEl.querySelectorAll('[data-review-action]').forEach((btn) => {
            btn.addEventListener('click', () => handleDeliverableReview(btn));
        });

        // Bind ticket payment buttons
        listEl.querySelectorAll('[data-pay-ticket]').forEach((btn) => {
            btn.addEventListener('click', () => {
                startCulqiTicketPayment({
                    ticketToken: btn.getAttribute('data-pay-ticket'),
                    amountPen: Number(btn.getAttribute('data-pay-amount')),
                    title: btn.getAttribute('data-pay-title')
                });
            });
        });
    }

    function renderDeliverableCard(projectId, d) {
        const meta = DELIVERABLE_TYPES[d.type] || { icon: '📄', badge: 'Documento Corporativo' };
        let approvalHtml = '';

        if (d.type === 'art_hd') {
            if (d.approvalStatus === 'approved') {
                approvalHtml = `<div style="font-size:0.78rem;color:var(--vf-emerald);font-weight:600;">✓ Arte Aprobado para Producción</div>`;
            } else if (d.approvalStatus === 'changes_requested') {
                approvalHtml = `<div style="font-size:0.78rem;color:var(--vf-amber);font-weight:600;">✎ Ajustes solicitados: "${escapeHtml(d.clientFeedback || 'En revisión')}"</div>`;
            } else {
                approvalHtml = `
                    <div style="display:flex;gap:8px;flex-wrap:wrap;">
                        <button type="button" class="chip-btn is-active" style="padding:7px 12px;font-size:0.78rem;background:var(--vf-emerald);border-color:var(--vf-emerald);"
                            data-review-action="approved" data-proj-id="${projectId}" data-deliv-id="${d._id}">
                            ✓ Aprobar Arte
                        </button>
                        <button type="button" class="chip-btn" style="padding:7px 12px;font-size:0.78rem;"
                            data-review-action="changes_requested" data-proj-id="${projectId}" data-deliv-id="${d._id}">
                            ✎ Pedir Ajuste
                        </button>
                    </div>
                `;
            }
        }

        return `
            <div class="deliverable-item">
                <div>
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">
                        <span style="font-size:0.73rem;font-family:var(--font-mono);color:var(--vf-primary-hover);">${meta.icon} ${escapeHtml(meta.badge)}</span>
                        ${d.version ? `<span class="mono" style="font-size:0.7rem;color:var(--vf-text-muted);">${escapeHtml(d.version)}</span>` : ''}
                    </div>
                    <strong style="display:block;font-size:0.96rem;color:var(--vf-heading-contrast);margin-bottom:4px;">
                        ${escapeHtml(d.title)}
                    </strong>
                    ${d.notes ? `<p style="font-size:0.82rem;color:var(--vf-text-secondary);">${escapeHtml(d.notes)}</p>` : ''}
                </div>

                <div style="display:flex;flex-direction:column;gap:10px;">
                    <a href="${escapeHtml(d.fileUrl)}" target="_blank" rel="noopener" class="btn-card-quote" style="padding:9px 14px;font-size:0.82rem;">
                        <span>Ver / Descargar Archivo Original</span>
                        <span>↓</span>
                    </a>
                    ${approvalHtml}
                </div>
            </div>
        `;
    }

    async function handleDeliverableReview(btn) {
        const status = btn.getAttribute('data-review-action');
        const projectId = btn.getAttribute('data-proj-id');
        const delivId = btn.getAttribute('data-deliv-id');

        let feedback = '';
        if (status === 'changes_requested') {
            feedback = window.prompt('Indica brevemente el ajuste requerido en el arte (medida, texto, color):', '');
            if (feedback === null) return;
        } else {
            const ok = window.confirm('¿Confirmas la aprobación formal de este arte en alta resolución para pasar a producción/impresión?');
            if (!ok) return;
        }

        btn.disabled = true;
        try {
            await api.reviewDeliverable(projectId, delivId, status, feedback);
            await loadClientProjects();
        } catch (err) {
            alert(err.message || 'No se pudo registrar la revisión.');
            btn.disabled = false;
        }
    }

    // =========================================================================
    // PRIVATE B2B PAYMENT TICKETS (?ticket=TOKEN + Culqi Checkout v4)
    // =========================================================================
    async function loadPrivateTicketSpotlight(token) {
        try {
            const res = await api.getPaymentTicket(token);
            if (res?.success && res.data) {
                state.activeTicket = { ...res.data, ticketToken: token };
                if (res.data.culqiPublicKey) {
                    state.culqiPublicKey = res.data.culqiPublicKey;
                }
                renderTicketSpotlightUI();
            }
        } catch (err) {
            const el = document.getElementById('privateTicketSpotlight');
            if (el) {
                el.style.display = 'block';
                el.innerHTML = `<p style="color:#ff6b7a;font-size:0.9rem;">⚠️ El enlace de ticket privado no existe o ha expirado.</p>`;
            }
        }
    }

    function renderTicketSpotlightUI() {
        const el = document.getElementById('privateTicketSpotlight');
        if (!el || !state.activeTicket) return;

        const t = state.activeTicket;
        el.style.display = 'block';

        const actionHtml = t.status === 'paid'
            ? `<span class="ot-status-pill ot-status-pill--ready">✓ PAGO CORPORATIVO CONFIRMADO</span>`
            : (state.user
                ? `<button type="button" class="btn-cta-pill" id="spotlightPayBtn">
                    <span>💳 Abonar S/ ${Number(t.amountPen).toFixed(2)} con Tarjeta (Culqi)</span>
                   </button>`
                : `<span style="font-size:0.84rem;color:var(--vf-amber);font-weight:600;">
                    ↓ Inicia sesión abajo con Google para procesar el abono de forma segura
                   </span>`
            );

        el.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;">
                <div>
                    <span class="mono" style="font-size:0.74rem;color:var(--vf-primary-hover);display:block;margin-bottom:4px;">
                        ORDEN DE PAGO PRIVADA · ${escapeHtml(t.otCode)}
                    </span>
                    <h2 style="font-size:1.28rem;font-weight:800;color:var(--vf-heading-contrast);margin-bottom:4px;">
                        ${escapeHtml(t.concept)} — S/ ${Number(t.amountPen).toFixed(2)} PEN
                    </h2>
                    <span style="font-size:0.85rem;color:var(--vf-text-secondary);">
                        Proyecto: ${escapeHtml(t.title)} · Cliente: ${escapeHtml(t.clientCompany || t.clientEmail)}
                    </span>
                </div>
                <div>${actionHtml}</div>
            </div>
        `;

        const payBtn = document.getElementById('spotlightPayBtn');
        if (payBtn) {
            payBtn.addEventListener('click', () => {
                startCulqiTicketPayment({
                    ticketToken: t.ticketToken,
                    amountPen: Number(t.amountPen),
                    title: `${t.otCode} · ${t.concept}`
                });
            });
        }
    }

    function ensureCulqiScript() {
        return new Promise((resolve, reject) => {
            if (window.Culqi) return resolve(window.Culqi);
            const script = document.createElement('script');
            script.src = 'https://checkout.culqi.com/js/v4';
            script.onload = () => resolve(window.Culqi);
            script.onerror = () => reject(new Error('No se pudo cargar la pasarela segura Culqi.'));
            document.head.appendChild(script);
        });
    }

    async function startCulqiTicketPayment({ ticketToken, amountPen, title }) {
        if (!state.user) {
            alert('Por favor inicia sesión primero para autorizar el pago corporativo.');
            return;
        }
        if (!state.culqiPublicKey) {
            alert('La pasarela con tarjeta está en mantenimiento. Coordina transferencia bancaria directa con tu Ejecutivo de Cuenta.');
            return;
        }

        try {
            const Culqi = await ensureCulqiScript();
            Culqi.publicKey = state.culqiPublicKey;
            Culqi.settings({
                title: 'Agencia Vectore B2B',
                currency: 'PEN',
                amount: Math.round(amountPen * 100)
            });
            Culqi.options({
                lang: 'auto',
                installments: true,
                paymentMethods: { tarjeta: true, yape: true }
            });

            window.culqi = async function () {
                if (Culqi.token) {
                    const tokenId = Culqi.token.id;
                    const email = Culqi.token.email || state.user.email;
                    Culqi.close();
                    try {
                        await api.payTicketWithCulqi(ticketToken, { tokenId, email });
                        alert('¡Pago corporativo procesado con éxito!');
                        if (state.activeTicket && state.activeTicket.ticketToken === ticketToken) {
                            state.activeTicket.status = 'paid';
                            renderTicketSpotlightUI();
                        }
                        await loadClientProjects();
                    } catch (chargeErr) {
                        alert(chargeErr.message || 'El cargo fue rechazado.');
                    }
                } else if (Culqi.error) {
                    alert(Culqi.error.user_message || 'Error en datos de tarjeta.');
                }
            };

            Culqi.open();
        } catch (err) {
            alert(err.message);
        }
    }
})();
