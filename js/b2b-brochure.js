/**
 * AGENCIA VECTORE — Unified B2B Corporate Brochure Controller
 * Handles Admin-driven Hero + Fallback, OPEN PROJECT card, Sectors Marquee,
 * White-Label (NDA) Portfolio, In-House Workshop, Theme Toggle, Liquid Glass Sheen,
 * and Dual Direct-Close Quotation Funnel (Instant WhatsApp Bridge + Formal Email Proforma).
 */

(function () {
    'use strict';

    // =========================================================================
    // CURATED FALLBACK DATA (Used if MongoDB collection is empty or offline)
    // =========================================================================
    const FALLBACK_SECTORS = [
        { id: 'malls', name: 'Centros Comerciales & Retail Moderno', subtitle: 'Islas, escaparates, tótems y campañas de temporada', icon: 'building', isActive: true, order: 1 },
        { id: 'government', name: 'Entidades del Estado & Sector Público', subtitle: 'Señalética normativa, módulos institucionales y eventos', icon: 'landmark', isActive: true, order: 2 },
        { id: 'cinema', name: 'Cadenas de Cines & Entretenimiento', subtitle: 'Corpóreos, carteleras retroiluminadas y estrenos BTL', icon: 'film', isActive: true, order: 3 },
        { id: 'wholesale', name: 'Distribuidoras Mayoristas & Consumo Masivo', subtitle: 'Trade marketing, vestimenta de PDV y flotas de reparto', icon: 'truck', isActive: true, order: 4 },
        { id: 'agro', name: 'Agroindustria, Forestal & Exportadoras', subtitle: 'Packaging 3D, etiquetado industrial y stands feriales', icon: 'leaf', isActive: true, order: 5 },
        { id: 'banking', name: 'Banca, Cajas & Finanzas', subtitle: 'Acondicionamiento de agencias, fachadas y letreros LED', icon: 'shield', isActive: true, order: 6 },
        { id: 'health', name: 'Clínicas, Laboratorios & Salud', subtitle: 'Arquitectura interior aséptica, señalización y software', icon: 'activity', isActive: true, order: 7 },
        { id: 'automotive', name: 'Concesionarios Automotrices & Logística', subtitle: 'Showrooms comerciales y wrapping vehicular de alta resistencia', icon: 'compass', isActive: true, order: 8 },
        { id: 'realestate', name: 'Inmobiliarias, Constructoras & Hotelería', subtitle: 'Casetas de venta, vallas perimetrales y visualización 3D', icon: 'layers', isActive: true, order: 9 }
    ];

    const FALLBACK_CASES = [
        {
            _id: 'case-btl-retail',
            title: 'Implementación Integral de Campaña Retail & Corpóreos Retroiluminados',
            client: 'Ejecución Marca Blanca · Cadena Retail Nacional',
            isWhiteLabel: true,
            publicClientLabel: 'Ejecución Marca Blanca · Agencia BTL Lima',
            sector: 'Centros Comerciales & Retail',
            location: 'Pucallpa, Ucayali',
            category: 'Ejecución BTL & Producción',
            description: 'Producción en planta propia de estructuras autoportantes, viniles laminados de alto tránsito, cajas de luz LED y montaje nocturno certificado en centro comercial sin costo de flete desde Lima.',
            deliverables: ['Producción Gran Formato UV', 'Corpóreo Acrílico LED', 'Montaje Nocturno Certificado', 'Dossier Fotográfico HD'],
            thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
            images: [
                { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85', caption: 'Despliegue estructural e iluminación en piso de exhibición.' }
            ],
            date: '2026-09-15',
            isFeatured: true
        },
        {
            _id: 'case-3d-packaging',
            title: 'Ingeniería de Empaque & Visualización CGI 3D para Línea Agroindustrial',
            client: 'Consorcio Agroexportador Amazónico',
            isWhiteLabel: true,
            publicClientLabel: 'Proyecto Confidencial · Sector Agroexportador',
            sector: 'Agroindustria & Consumo Masivo',
            location: 'Lima / Ucayali',
            category: 'Packaging 3D & Diseño Especializado',
            description: 'Modelado tridimensional de envases doy-pack y frascos de vidrio, texturizado PBR con acabados metalizados/barniz sectorizado y artes finales calibrados para rotograbado industrial.',
            deliverables: ['Modelado & Render 3D 4K', 'Planos de Troquel Industrial', 'Pre-prensa Cromática', 'Key Visuals de Lanzamiento'],
            thumbnail: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&w=1200&q=80',
            images: [
                { url: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?auto=format&fit=crop&w=1400&q=85', caption: 'Render fotorrealista de línea de empaques previo a tiraje industrial.' }
            ],
            date: '2026-08-20',
            isFeatured: true
        },
        {
            _id: 'case-arquitectura-stand',
            title: 'Diseño Espacial, Planimetría y Fabricación de Módulo Comercial',
            client: 'Operador Corporativo Regional',
            isWhiteLabel: false,
            sector: 'Arquitectura Comercial & Stands',
            location: 'Pucallpa, Ucayali',
            category: 'Arquitectura Comercial & Stands',
            description: 'Desarrollo arquitectónico llave en mano: expediente técnico para centro comercial, estructura metálica, mobiliario en melamina RH, iluminación indirecta y señalética normativa.',
            deliverables: ['Expediente Técnico Mall', 'Renders 3D Aprobados', 'Carpintería & Metalmecánica', 'Instalación Eléctrica LED'],
            thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
            images: [
                { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85', caption: 'Acabados corporativos de alta durabilidad para atención al público.' }
            ],
            date: '2026-07-10',
            isFeatured: false
        },
        {
            _id: 'case-vectore-flow',
            title: 'Vectore Flow: Sistema ERP Desktop & Cloud para Gestión de Planta Gráfica',
            client: 'División Ingeniería Vectore',
            isWhiteLabel: false,
            sector: 'Ingeniería de Software & SaaS',
            location: 'Nacional / Cloud',
            category: 'Software & Plataformas B2B',
            description: 'Arquitectura de software propia creada para controlar cotizaciones por metro cuadrado, órdenes de trabajo en taller, kárdex de sustratos, facturación y autenticación SSO.',
            deliverables: ['Aplicación Desktop & Web', 'Motor de Costeo Paramétrico', 'Tablero Kanban de Producción', 'SSO Google OAuth + JWT'],
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            images: [
                { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85', caption: 'Panel ejecutivo en modo oscuro de alta legibilidad operativa.' }
            ],
            date: '2026-10-01',
            isFeatured: true
        }
    ];

    const FALLBACK_WORKSHOP = [
        {
            _id: 'ws-1',
            name: 'Gigantografías, Lonas & Viniles de Alta Durabilidad Amazónica',
            category: 'gran-formato',
            tagLabel: 'Gran Formato UV',
            icon: '🖨️',
            description: 'Impresión de alta resolución resistente a radiación solar intensa y lluvias tropicales para vallas, fachadas y puntos de venta.',
            specs: ['Lona 13oz / Backlight', 'Vinil Arlon / 3M Laminado', 'Ancho continuo 3.20m']
        },
        {
            _id: 'ws-2',
            name: 'Letreros Corpóreos 3D, Cajas de Luz & Acrílico LED',
            category: 'estructuras',
            tagLabel: 'Metalmecánica & LED',
            icon: '💡',
            description: 'Fabricación en taller propio de letras volumétricas en acrílico, PVC espumado, aluminio compuesto ( Alucobond ) y módulos LED IP67.',
            specs: ['Corte Router / Láser', 'Iluminación LED IP67', 'Instalación en Altura']
        },
        {
            _id: 'ws-3',
            name: 'Brandeo y Rotulación Integral de Flotas Vehiculares',
            category: 'gran-formato',
            tagLabel: 'Flotas Comerciales',
            icon: '🚚',
            description: 'Forrado parcial o integral de camiones repartidores, camionetas 4x4 y unidades logísticas con laminado protector UV.',
            specs: ['Vinil Conformable', 'Laminado Mate / Brillo', 'Garantía de Adherencia']
        },
        {
            _id: 'ws-4',
            name: 'Señalética Normativa INDECI, Industrial & Corporativa',
            category: 'estructuras',
            tagLabel: 'Normativa Técnica',
            icon: '🛡️',
            description: 'Señalización fotoluminiscente, reflectiva grado ingeniería y directorios arquitectónicos para plantas, clínicas y entidades públicas.',
            specs: ['Celtex / Acrílico / Alucobond', 'Reflectivo 3M', 'Norma NTP 399.010']
        },
        {
            _id: 'ws-5',
            name: 'Stickers Troquelados UV, Etiquetas en Rollo & DTF UV',
            category: 'impresion',
            tagLabel: 'Etiquetado Industrial',
            icon: '🏷️',
            description: 'Etiquetas resistentes al agua, frío y fricción para envases agroindustriales, bebidas, cosmética y sellos de seguridad.',
            specs: ['Troquel Digital Exacto', 'DTF UV Alto Relieve', 'Tirajes Cortos y Masivos']
        },
        {
            _id: 'ws-6',
            name: 'Displays POP, Exhibidores, Backing de Prensa & Counters',
            category: 'estructuras',
            tagLabel: 'Activaciones BTL',
            icon: '🏛️',
            description: 'Módulos desarmables de activación, ruletas corporativas, marcos selfie, tótems publicitarios y estructuras spider listas en Pucallpa.',
            specs: ['PVC / MDF / Aluminio', 'Cero Flete desde Lima', 'Entrega en Punto de Evento']
        },
        {
            _id: 'ws-7',
            name: 'Papelería Corporativa, Brochures, Carpetas & Credenciales PVC',
            category: 'impresion',
            tagLabel: 'Imprenta Ejecutiva',
            icon: '📑',
            description: 'Carpetas institucionales con bolsillo, fotochecks PVC con cinta impresa, memorias anuales, talonarios y material de capacitación.',
            specs: ['Couché 300g Plastificado', 'Fotochecks PVC Térmico', 'Acabado Mate / UV']
        },
        {
            _id: 'ws-8',
            name: 'Merchandising Corporativo, Textil Bordado & Kits de Evento',
            category: 'merch',
            tagLabel: 'Merchandising B2B',
            icon: '🎁',
            description: 'Polos piqué/jersey para staff de activación, gorras, tomatodos grabados en láser, libretas ejecutivas y bolsas ecológicas.',
            specs: ['Grabado Láser / DTF', 'Uniformes de Campaña', 'Despacho Local Inmediato']
        }
    ];

    const SECTOR_ICONS = {
        building: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="9" y1="18" x2="15" y2="18"/></svg>',
        landmark: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>',
        film: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
        truck: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
        leaf: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>',
        shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        activity: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
        compass: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
        layers: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
    };

    // =========================================================================
    // STATE
    // =========================================================================
    const state = {
        whatsappNumber: '51950699910',
        floatingProject: null,
        cases: [],
        activeCaseFilter: 'all',
        workshopItems: [],
        activeWorkshopFilter: 'all'
    };

    // =========================================================================
    // HELPERS
    // =========================================================================
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function isVideoUrl(url) {
        if (!url) return false;
        return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) || url.includes('/video/upload/');
    }

    function formatShortDate(dateInput) {
        if (!dateInput) return '2026';
        const d = new Date(dateInput);
        if (Number.isNaN(d.getTime())) return '2026';
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        return `${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        const yearEl = document.getElementById('currentYear');
        if (yearEl) yearEl.textContent = String(new Date().getFullYear());

        initNavbarAndDrawer();
        initThemeToggle();
        initLiquidGlassSheen();
        initModals();
        initQuotationForms();
        initCopyButtons();

        // Render immediate resilient defaults so first paint feels instantaneous
        renderSectorsMarquee(FALLBACK_SECTORS);
        state.cases = FALLBACK_CASES;
        renderCasesGrid();
        bindFloatingProjectCard(FALLBACK_CASES[0], 'OPEN PROJECT');
        state.workshopItems = FALLBACK_WORKSHOP;
        renderWorkshopGrid();

        // Hydrate live Admin configuration & MongoDB records in parallel
        Promise.allSettled([
            loadSiteConfig(),
            loadPortfolio(),
            loadWorkshop(),
            loadSoftwarePreview()
        ]).finally(() => {
            hidePreloader();
        });

        // Safety cap so preloader never blocks UX
        setTimeout(hidePreloader, 850);
    });

    function hidePreloader() {
        const preloader = document.getElementById('b2bPreloader');
        if (preloader && !preloader.classList.contains('is-hidden')) {
            preloader.classList.add('is-hidden');
        }
    }

    // =========================================================================
    // NAVBAR, MOBILE DRAWER & THEME TOGGLE
    // =========================================================================
    function initNavbarAndDrawer() {
        const header = document.getElementById('b2bHeader');
        const onScroll = () => {
            if (!header) return;
            header.classList.toggle('is-scrolled', window.scrollY > 40);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        const burger = document.getElementById('mobileMenuBtn');
        const drawer = document.getElementById('mobileDrawer');
        const closeBtn = document.getElementById('mobileDrawerClose');

        const toggleDrawer = (open) => {
            if (!drawer) return;
            drawer.classList.toggle('is-open', open);
            drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
            document.body.style.overflow = open ? 'hidden' : '';
        };

        if (burger) burger.addEventListener('click', () => toggleDrawer(true));
        if (closeBtn) closeBtn.addEventListener('click', () => toggleDrawer(false));
        if (drawer) {
            drawer.addEventListener('click', (e) => {
                if (e.target === drawer) toggleDrawer(false);
            });
            drawer.querySelectorAll('[data-drawer-link], [data-open-quote]').forEach((el) => {
                el.addEventListener('click', () => toggleDrawer(false));
            });
        }
    }

    function initThemeToggle() {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try {
                localStorage.setItem('vectore_theme', next);
            } catch (_) { /* ignore storage quota */ }
        });
    }

    function initLiquidGlassSheen() {
        let rafPending = false;
        document.addEventListener('pointermove', (e) => {
            if (rafPending) return;
            const card = e.target.closest('.liquid-glass--interactive');
            if (!card) return;
            rafPending = true;
            requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--sheen-x', `${x}px`);
                card.style.setProperty('--sheen-y', `${y}px`);
                rafPending = false;
            });
        }, { passive: true });
    }

    function initCopyButtons() {
        const copyBtn = document.getElementById('copyEmailBtn');
        if (!copyBtn) return;
        copyBtn.addEventListener('click', async () => {
            const email = copyBtn.getAttribute('data-copy-email') || 'agenciavectore@gmail.com';
            try {
                await navigator.clipboard.writeText(email);
                const prev = copyBtn.textContent;
                copyBtn.textContent = '¡Copiado!';
                setTimeout(() => { copyBtn.textContent = prev; }, 1800);
            } catch (_) {
                window.location.href = `mailto:${email}`;
            }
        });
    }

    // =========================================================================
    // FASE 2: SITE CONFIG (HERO + FALLBACK + OPEN PROJECT + SECTORS + FOOTER)
    // =========================================================================
    async function loadSiteConfig() {
        const res = await api.getSiteConfig();
        if (!res || !res.success || !res.data) return;

        const cfg = res.data;
        const hero = cfg.hero || {};

        // 1. Hero Texts
        const setTxt = (id, val) => {
            const el = document.getElementById(id);
            if (el && val) el.textContent = val;
        };
        setTxt('heroBadgeText', hero.badgeText);
        setTxt('heroHeadline1', hero.headlineLine1);
        setTxt('heroHeadlineHighlight', hero.headlineHighlight);
        setTxt('heroSubtitle', hero.subtitle);
        setTxt('heroPrimaryCtaLabel', hero.primaryCtaText);
        setTxt('heroSecondaryCtaLabel', hero.secondaryCtaText);

        // 2. Scrim Opacity
        const heroEl = document.getElementById('inicio');
        if (heroEl && typeof hero.overlayOpacity === 'number') {
            heroEl.style.setProperty('--hero-overlay', String(hero.overlayOpacity));
        }

        // 3. Hero Background Media with Guaranteed Fallback
        applyHeroBackground(hero);

        // 4. Floating OPEN PROJECT Card
        const floatingCardCfg = hero.floatingCard || {};
        const floatingEl = document.getElementById('heroFloatingProject');
        if (floatingEl) {
            if (floatingCardCfg.enabled === false) {
                floatingEl.style.display = 'none';
            } else {
                floatingEl.style.display = '';
                const targetProj = cfg.floatingProject || state.cases[0] || FALLBACK_CASES[0];
                bindFloatingProjectCard(targetProj, floatingCardCfg.label || 'OPEN PROJECT');
            }
        }

        // 5. Sectors Marquee
        if (Array.isArray(cfg.sectors) && cfg.sectors.length > 0) {
            const activeSectors = cfg.sectors
                .filter(s => s.isActive !== false && s.name)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
            if (activeSectors.length > 0) {
                renderSectorsMarquee(activeSectors);
            }
        }

        // 6. Corporate Footer & WhatsApp Number
        if (cfg.corporate) {
            const corp = cfg.corporate;
            if (corp.whatsappNumber) {
                state.whatsappNumber = corp.whatsappNumber.replace(/[^\d]/g, '') || '51950699910';
            }
            if (corp.email) {
                const emailLink = document.getElementById('footerEmailLink');
                const copyBtn = document.getElementById('copyEmailBtn');
                if (emailLink) {
                    emailLink.textContent = corp.email;
                    emailLink.href = `mailto:${corp.email}`;
                }
                if (copyBtn) copyBtn.setAttribute('data-copy-email', corp.email);
            }
            if (corp.phoneDisplay) {
                const phoneLink = document.getElementById('footerPhoneLink');
                if (phoneLink) {
                    phoneLink.textContent = corp.phoneDisplay;
                    phoneLink.href = `https://wa.me/${state.whatsappNumber}`;
                }
            }
            setTxt('footerAddressText', corp.address);
            setTxt('footerRucInfo', corp.rucInfo);

            if (Array.isArray(corp.businessLines) && corp.businessLines.length > 0) {
                const girosGrid = document.getElementById('footerGirosGrid');
                if (girosGrid) {
                    girosGrid.innerHTML = corp.businessLines.map(line => `
                        <div class="giro-card">
                            <span class="giro-card__code">${escapeHtml(line.code || 'GIRO REGISTRADO')}</span>
                            <h4>${escapeHtml(line.title)}</h4>
                            <p>${escapeHtml(line.description)}</p>
                        </div>
                    `).join('');
                }
            }
        }
    }

    function applyHeroBackground(hero) {
        const mediaContainer = document.getElementById('heroCustomMedia');
        if (!mediaContainer) return;

        const isMobile = window.matchMedia('(max-width: 640px)').matches;
        const rawUrl = (isMobile && hero.mobileBackgroundUrl) ? hero.mobileBackgroundUrl : hero.backgroundUrl;

        // Rule: If no custom media is set in Admin, keep original animated dark fallback intact
        if (!rawUrl || hero.backgroundType === 'default') {
            mediaContainer.classList.remove('is-loaded');
            mediaContainer.innerHTML = '';
            return;
        }

        const useVideo = hero.backgroundType === 'video' || isVideoUrl(rawUrl);

        if (useVideo) {
            const video = document.createElement('video');
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');
            video.src = rawUrl;

            video.addEventListener('loadeddata', () => {
                mediaContainer.classList.add('is-loaded');
            });
            video.addEventListener('error', () => {
                mediaContainer.classList.remove('is-loaded');
                mediaContainer.innerHTML = '';
            });

            mediaContainer.innerHTML = '';
            mediaContainer.appendChild(video);
        } else {
            const probe = new Image();
            probe.onload = () => {
                mediaContainer.innerHTML = `<img src="${escapeHtml(rawUrl)}" alt="Portada Agencia Vectore">`;
                requestAnimationFrame(() => mediaContainer.classList.add('is-loaded'));
            };
            probe.onerror = () => {
                mediaContainer.classList.remove('is-loaded');
                mediaContainer.innerHTML = '';
            };
            probe.src = rawUrl;
        }
    }

    function bindFloatingProjectCard(project, labelText = 'OPEN PROJECT') {
        if (!project) return;
        state.floatingProject = project;

        const card = document.getElementById('heroFloatingProject');
        const labelEl = document.getElementById('openProjectLabel');
        const dateEl = document.getElementById('openProjectDate');
        const mediaEl = document.getElementById('openProjectMedia');
        const catEl = document.getElementById('openProjectCategory');
        const titleEl = document.getElementById('openProjectTitle');

        if (labelEl) labelEl.textContent = labelText || 'OPEN PROJECT';
        if (dateEl) dateEl.textContent = formatShortDate(project.date || project.createdAt);
        if (catEl) catEl.textContent = project.sector || project.category || 'Caso Corporativo';
        if (titleEl) titleEl.textContent = project.title || 'Ver Caso de Éxito';

        if (mediaEl && project.thumbnail) {
            const ndaBadge = project.isWhiteLabel
                ? `<span class="open-project-card__nda">🔒 Marca Blanca · NDA</span>`
                : '';
            if (isVideoUrl(project.thumbnail)) {
                mediaEl.innerHTML = `<video src="${escapeHtml(project.thumbnail)}" autoplay muted loop playsinline></video>${ndaBadge}`;
            } else {
                mediaEl.innerHTML = `<img src="${escapeHtml(project.thumbnail)}" alt="${escapeHtml(project.title)}" loading="eager">${ndaBadge}`;
            }
        }

        if (card && !card.dataset.bound) {
            card.dataset.bound = 'true';
            const triggerOpen = () => {
                if (state.floatingProject) openCaseModal(state.floatingProject);
            };
            card.addEventListener('click', triggerOpen);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    triggerOpen();
                }
            });
        }
    }

    // =========================================================================
    // FASE 3A: SECTORS MARQUEE
    // =========================================================================
    function renderSectorsMarquee(sectors) {
        const track = document.getElementById('sectorsMarquee');
        if (!track || !Array.isArray(sectors) || sectors.length === 0) return;

        // Duplicate array once so translateX(-50%) creates a seamless infinite belt
        const belt = [...sectors, ...sectors];
        track.innerHTML = belt.map((sec) => {
            const svg = SECTOR_ICONS[sec.icon] || SECTOR_ICONS.layers;
            return `
                <div class="sector-pill liquid-glass" role="button" tabindex="0"
                     data-open-quote data-quote-service="Soluciones para ${escapeHtml(sec.name)}"
                     data-quote-ref="Rubro: ${escapeHtml(sec.name)}">
                    <span class="sector-pill__icon">${svg}</span>
                    <div>
                        <span class="sector-pill__name">${escapeHtml(sec.name)}</span>
                        ${sec.subtitle ? `<span class="sector-pill__sub">${escapeHtml(sec.subtitle)}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // FASE 3B: PORTFOLIO B2B & MARCA BLANCA (NDA)
    // =========================================================================
    async function loadPortfolio() {
        const chipsWrap = document.getElementById('portfolioChips');
        if (chipsWrap && !chipsWrap.dataset.bound) {
            chipsWrap.dataset.bound = 'true';
            chipsWrap.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-case-filter]');
                if (!btn) return;
                chipsWrap.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                state.activeCaseFilter = btn.getAttribute('data-case-filter') || 'all';
                renderCasesGrid();
            });
        }

        const res = await api.getProjects();
        const dbProjects = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (dbProjects.length > 0) {
            state.cases = dbProjects;
            renderCasesGrid();
            // If SiteConfig didn't already pin a DB floatingProject, update OPEN PROJECT to latest real DB case
            if (!state.floatingProject || String(state.floatingProject._id).startsWith('case-')) {
                bindFloatingProjectCard(dbProjects[0], document.getElementById('openProjectLabel')?.textContent || 'OPEN PROJECT');
            }
        }
    }

    function matchesCaseFilter(proj, filter) {
        if (filter === 'all') return true;
        const haystack = [
            proj.category,
            proj.sector,
            proj.title,
            proj.description,
            ...(Array.isArray(proj.tags) ? proj.tags : [])
        ].join(' ').toLowerCase();

        if (filter === 'btl') return /btl|producci|impresi|gigantograf|vinil|activaci|flota|rotul|branding|campa/.test(haystack);
        if (filter === 'arquitectura') return /arquitect|interior|stand|isla|retail|módulo|modulo|señal|mobiliario/.test(haystack);
        if (filter === '3d') return /3d|packag|empaque|envase|render|cgi|modelado|etiqueta/.test(haystack);
        if (filter === 'software') return /software|web|app|saas|ia|inteligencia|sistema|erp|digital|flow/.test(haystack);
        return true;
    }

    function renderCasesGrid() {
        const grid = document.getElementById('casesGrid');
        if (!grid) return;

        const filtered = state.cases.filter(p => matchesCaseFilter(p, state.activeCaseFilter));
        const list = filtered.length > 0 ? filtered : state.cases;

        grid.innerHTML = list.map((proj, idx) => {
            const clientLabel = proj.isWhiteLabel
                ? (proj.publicClientLabel || proj.client || 'Ejecución Marca Blanca (NDA)')
                : (proj.client || 'Cliente Corporativo');
            const location = proj.location || 'Pucallpa, Ucayali';
            const mediaHtml = isVideoUrl(proj.thumbnail)
                ? `<video src="${escapeHtml(proj.thumbnail)}" autoplay muted loop playsinline></video>`
                : `<img src="${escapeHtml(proj.thumbnail)}" alt="${escapeHtml(proj.title)}" loading="lazy">`;

            return `
                <article class="case-card" data-case-idx="${idx}" role="button" tabindex="0">
                    <div class="case-card__media">
                        ${mediaHtml}
                        <div class="case-card__badges">
                            <span class="badge-pill badge-pill--cat">${escapeHtml(proj.category || 'Caso B2B')}</span>
                            ${proj.isWhiteLabel ? `<span class="badge-pill badge-pill--nda">🔒 Marca Blanca · NDA</span>` : ''}
                        </div>
                    </div>
                    <div class="case-card__body">
                        <div>
                            <div class="case-card__meta">
                                <span>${escapeHtml(clientLabel)}</span>
                                <span>•</span>
                                <span>📍 ${escapeHtml(location)}</span>
                            </div>
                            <h3 class="case-card__title">${escapeHtml(proj.title)}</h3>
                            <p class="case-card__desc">${escapeHtml(proj.description)}</p>
                        </div>
                        <div class="case-card__footer">
                            <span>Abrir Expediente del Caso</span>
                            <span>↗</span>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        grid.querySelectorAll('[data-case-idx]').forEach((cardEl) => {
            const item = list[Number(cardEl.getAttribute('data-case-idx'))];
            if (!item) return;
            cardEl.addEventListener('click', () => openCaseModal(item));
            cardEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openCaseModal(item);
                }
            });
        });
    }

    function openCaseModal(proj) {
        const modal = document.getElementById('projectModal');
        const body = document.getElementById('projectModalBody');
        if (!modal || !body || !proj) return;

        const clientDisplay = proj.isWhiteLabel
            ? (proj.publicClientLabel || proj.client || 'Proyecto bajo Acuerdo de Confidencialidad (NDA)')
            : (proj.client || 'Cuenta Corporativa');

        const galleryItems = Array.isArray(proj.images) && proj.images.length > 0
            ? proj.images
            : (proj.thumbnail ? [{ url: proj.thumbnail, caption: proj.title }] : []);

        const deliverables = Array.isArray(proj.deliverables) && proj.deliverables.length > 0
            ? proj.deliverables
            : (Array.isArray(proj.tags) ? proj.tags : []);

        body.innerHTML = `
            <div style="padding-right:42px;">
                <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px;">
                    <span class="eyebrow-tag" style="margin-bottom:0;">${escapeHtml(proj.category || 'Caso de Éxito')}</span>
                    ${proj.isWhiteLabel ? `<span class="badge-pill badge-pill--nda">🔒 Ejecución Marca Blanca (NDA Protegido)</span>` : ''}
                    <span class="mono" style="font-size:0.75rem;color:var(--vf-text-muted);">${escapeHtml(formatShortDate(proj.date || proj.createdAt))}</span>
                </div>

                <h2 style="font-size:clamp(1.45rem,2.6vw,2.15rem);font-weight:800;color:var(--vf-heading-contrast);line-height:1.18;margin-bottom:12px;">
                    ${escapeHtml(proj.title)}
                </h2>

                <p style="font-size:0.96rem;color:var(--vf-text-secondary);line-height:1.68;margin-bottom:20px;">
                    ${escapeHtml(proj.description)}
                </p>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;padding:16px;border-radius:var(--radius-md);background:var(--vf-bg);border:1px solid var(--vf-border-subtle);margin-bottom:20px;">
                    <div>
                        <span class="mono" style="font-size:0.68rem;color:var(--vf-text-muted);display:block;">MODALIDAD / CLIENTE</span>
                        <strong style="font-size:0.88rem;color:var(--vf-heading-contrast);">${escapeHtml(clientDisplay)}</strong>
                    </div>
                    <div>
                        <span class="mono" style="font-size:0.68rem;color:var(--vf-text-muted);display:block;">SECTOR ATENDIDO</span>
                        <strong style="font-size:0.88rem;color:var(--vf-heading-contrast);">${escapeHtml(proj.sector || proj.category || 'Corporativo')}</strong>
                    </div>
                    <div>
                        <span class="mono" style="font-size:0.68rem;color:var(--vf-text-muted);display:block;">SEDE DE EJECUCIÓN</span>
                        <strong style="font-size:0.88rem;color:var(--vf-heading-contrast);">📍 ${escapeHtml(proj.location || 'Pucallpa, Ucayali')}</strong>
                    </div>
                </div>

                ${deliverables.length > 0 ? `
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">
                        ${deliverables.map(d => `<span class="workshop-spec">✓ ${escapeHtml(d)}</span>`).join('')}
                    </div>
                ` : ''}
            </div>

            <div class="case-modal__gallery">
                ${galleryItems.map((img) => {
                    const url = typeof img === 'string' ? img : img.url;
                    const cap = typeof img === 'object' && img.caption ? img.caption : '';
                    const media = isVideoUrl(url)
                        ? `<video src="${escapeHtml(url)}" controls autoplay muted loop playsinline></video>`
                        : `<img src="${escapeHtml(url)}" alt="${escapeHtml(cap || proj.title)}" loading="lazy">`;
                    return `
                        <figure style="margin:0;">
                            ${media}
                            ${cap ? `<figcaption style="font-size:0.8rem;color:var(--vf-text-muted);margin-top:8px;text-align:center;">${escapeHtml(cap)}</figcaption>` : ''}
                        </figure>
                    `;
                }).join('')}
            </div>

            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;padding-top:18px;border-top:1px solid var(--vf-border-subtle);">
                <span style="font-size:0.86rem;color:var(--vf-text-secondary);">
                    ¿Necesitas un despliegue similar para tu marca o agencia aliada?
                </span>
                <button type="button" class="btn-cta-pill" id="quoteSimilarProjectBtn">
                    <span>Cotizar un Proyecto Similar</span>
                    <span>↗</span>
                </button>
            </div>
        `;

        const quoteSimilarBtn = document.getElementById('quoteSimilarProjectBtn');
        if (quoteSimilarBtn) {
            quoteSimilarBtn.addEventListener('click', () => {
                closeModal('projectModal');
                openQuotationModal({
                    service: proj.category || 'Proyecto Similar de Portafolio',
                    referenceItem: `Caso de Referencia: ${proj.title}`
                });
            });
        }

        openModal('projectModal');
    }

    // =========================================================================
    // SECONDARY SECTION: IN-HOUSE WORKSHOP (/api/products WITHOUT PRICES/STOCK)
    // =========================================================================
    async function loadWorkshop() {
        const chipsWrap = document.getElementById('workshopChips');
        if (chipsWrap && !chipsWrap.dataset.bound) {
            chipsWrap.dataset.bound = 'true';
            chipsWrap.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-workshop-filter]');
                if (!btn) return;
                chipsWrap.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                state.activeWorkshopFilter = btn.getAttribute('data-workshop-filter') || 'all';
                renderWorkshopGrid();
            });
        }

        const res = await api.getProducts({ limit: 24 });
        const dbItems = Array.isArray(res?.data) ? res.data : [];
        if (dbItems.length > 0) {
            state.workshopItems = dbItems.map(mapDbProductToWorkshopItem);
            renderWorkshopGrid();
        }
    }

    function mapDbProductToWorkshopItem(p) {
        const rawCat = `${p.category || ''} ${p.subcategory || ''} ${p.name || ''}`.toLowerCase();
        let normCat = 'impresion';
        let tagLabel = 'Planta Propia';

        if (/gigantograf|banner|lona|vinil|flota|vehicul|gran formato|rollup/.test(rawCat)) {
            normCat = 'gran-formato';
            tagLabel = 'Gran Formato & Viniles';
        } else if (/letrero|corp|acr[ií]lico|led|stand|estructura|se[ñn]al|interior|arquitect/.test(rawCat)) {
            normCat = 'estructuras';
            tagLabel = 'Estructuras & LED';
        } else if (/merch|polo|gorra|taza|tomatodo|lapicero|llavero|bolsa|regalo/.test(rawCat)) {
            normCat = 'merch';
            tagLabel = 'Merchandising B2B';
        } else {
            normCat = 'impresion';
            tagLabel = p.subcategory || 'Producción In-House';
        }

        const imgUrl = Array.isArray(p.images) && p.images[0]?.url ? p.images[0].url : '';
        const specs = Array.isArray(p.features) && p.features.length > 0
            ? p.features.slice(0, 3)
            : ['Producción en Pucallpa', 'Control de Calidad', 'Factura RUC 20'];

        return {
            _id: p._id,
            name: p.name,
            category: normCat,
            tagLabel,
            imageUrl: imgUrl,
            icon: p.icon || '⚙️',
            description: p.description || 'Fabricación directa en nuestro taller propio en Pucallpa con acabados corporativos.',
            specs
        };
    }

    function renderWorkshopGrid() {
        const grid = document.getElementById('workshopGrid');
        if (!grid) return;

        const filtered = state.activeWorkshopFilter === 'all'
            ? state.workshopItems
            : state.workshopItems.filter(item => item.category === state.activeWorkshopFilter);

        const list = filtered.length > 0 ? filtered : state.workshopItems;

        grid.innerHTML = list.map((item) => {
            const visual = item.imageUrl
                ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" loading="lazy">`
                : `<span class="workshop-card__placeholder">${escapeHtml(item.icon || '⚙️')}</span>`;

            return `
                <article class="workshop-card">
                    <div class="workshop-card__visual">
                        ${visual}
                        <span class="workshop-card__tag">${escapeHtml(item.tagLabel || 'Taller Propio')}</span>
                    </div>
                    <div class="workshop-card__body">
                        <div>
                            <h3 class="workshop-card__title">${escapeHtml(item.name)}</h3>
                            <p class="workshop-card__desc">${escapeHtml(item.description)}</p>
                            <div class="workshop-specs">
                                ${(item.specs || []).map(s => `<span class="workshop-spec">${escapeHtml(s)}</span>`).join('')}
                            </div>
                        </div>
                        <button type="button" class="btn-card-quote"
                            data-open-quote
                            data-quote-service="Producción Taller In-House (Pucallpa)"
                            data-quote-ref="Línea de Taller: ${escapeHtml(item.name)}">
                            <span>Cotizar Producción / Lote</span>
                            <span>↗</span>
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    }

    // =========================================================================
    // VECTORE FLOW SCREENSHOT PREVIEW (/api/software)
    // =========================================================================
    async function loadSoftwarePreview() {
        const frame = document.getElementById('vectoreFlowPreview');
        if (!frame) return;

        const res = await api.getSoftwareAssets();
        const assets = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const mainShot = assets.find(a => a.section === 'main_screenshot' || a.type === 'screenshot') || assets[0];
        if (mainShot && mainShot.imageUrl) {
            frame.innerHTML = `<img src="${escapeHtml(mainShot.imageUrl)}" alt="${escapeHtml(mainShot.title || 'Vectore Flow SaaS')}" loading="lazy">`;
        }
    }

    // =========================================================================
    // MODALS CONTROLLER
    // =========================================================================
    function initModals() {
        document.addEventListener('click', (e) => {
            const openQuoteTrigger = e.target.closest('[data-open-quote]');
            if (openQuoteTrigger) {
                e.preventDefault();
                openQuotationModal({
                    service: openQuoteTrigger.getAttribute('data-quote-service') || 'Proyecto Corporativo Integral',
                    referenceItem: openQuoteTrigger.getAttribute('data-quote-ref') || ''
                });
                return;
            }

            const closeTrigger = e.target.closest('[data-close-modal]');
            if (closeTrigger) {
                closeModal(closeTrigger.getAttribute('data-close-modal'));
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal('projectModal');
                closeModal('quotationModal');
            }
        });
    }

    function openModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        if (!document.querySelector('.b2b-modal.is-open')) {
            document.body.style.overflow = '';
        }
    }

    function openQuotationModal({ service = 'Proyecto Corporativo Integral', referenceItem = '' } = {}) {
        const form = document.getElementById('modalQuotationForm');
        const successBox = document.getElementById('modalQuotationSuccess');
        const serviceInput = document.getElementById('mqService');
        const refInput = document.getElementById('mqReferenceItem');
        const subEl = document.getElementById('modalQuoteContextSub');

        if (form) form.style.display = '';
        if (successBox) successBox.classList.remove('is-visible');
        if (serviceInput) serviceInput.value = service;
        if (refInput) refInput.value = referenceItem;
        if (subEl) {
            subEl.textContent = referenceItem
                ? `Referencia seleccionada: ${referenceItem}`
                : `División: ${service}`;
        }

        openModal('quotationModal');
    }

    // =========================================================================
    // FASE 4: DUAL DIRECT-CLOSE QUOTATION FUNNEL (WhatsApp + Email Proforma)
    // =========================================================================
    function initQuotationForms() {
        // 1. Channel Tab Switching (WhatsApp vs Email Proforma)
        document.querySelectorAll('[data-channel-select]').forEach((tabBtn) => {
            tabBtn.addEventListener('click', () => {
                const channel = tabBtn.getAttribute('data-channel-select');
                const formId = tabBtn.getAttribute('data-target-form');
                const form = document.getElementById(formId);
                if (!form) return;

                const tabGroup = tabBtn.parentElement;
                if (tabGroup) {
                    tabGroup.querySelectorAll('.channel-tab').forEach(b => b.classList.remove('is-active'));
                }
                tabBtn.classList.add('is-active');

                form.setAttribute('data-channel', channel);
                const isProforma = channel === 'formal_proforma';
                form.classList.toggle('is-proforma-mode', isProforma);

                const submitBtn = form.querySelector('[data-submit-btn]');
                const submitLabel = form.querySelector('[data-submit-label]');
                const submitHint = form.querySelector('[data-submit-hint]');

                if (submitBtn) {
                    submitBtn.classList.toggle('btn-submit-b2b--wa', !isProforma);
                    submitBtn.classList.toggle('btn-submit-b2b--email', isProforma);
                }
                if (submitLabel) {
                    submitLabel.textContent = isProforma
                        ? 'Enviar Solicitud de Proforma Formal ✉️'
                        : 'Registrar y Abrir WhatsApp Corporativo ↗';
                }
                if (submitHint) {
                    submitHint.textContent = isProforma
                        ? 'Recibirás código de expediente oficial (COT-XXXX) sin abrir WhatsApp.'
                        : 'Guarda tu solicitud en nuestro CRM y abre WhatsApp con el resumen listo.';
                }
            });
        });

        // 2. Live RUC 20 / 10 Detector
        document.querySelectorAll('input[name="companyOrRuc"]').forEach((input) => {
            input.addEventListener('input', () => {
                const field = input.closest('.b2b-field');
                const badge = field ? field.querySelector('[data-ruc-badge]') : null;
                if (!badge) return;
                const val = input.value.trim();
                const isRuc20 = /\b20\d{9}\b/.test(val);
                const isRuc10 = /\b10\d{9}\b/.test(val);
                if (isRuc20) {
                    badge.textContent = '✓ RUC 20 CORPORATIVO';
                    badge.classList.add('is-visible');
                } else if (isRuc10) {
                    badge.textContent = '✓ RUC 10 NEGOCIO';
                    badge.classList.add('is-visible');
                } else {
                    badge.classList.remove('is-visible');
                }
            });
        });

        // 3. Reset Form Buttons
        document.querySelectorAll('[data-reset-form]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const form = document.getElementById(btn.getAttribute('data-reset-form'));
                if (!form) return;
                form.reset();
                form.style.display = '';
                const successBox = document.getElementById(
                    form.id === 'inlineQuotationForm' ? 'inlineQuotationSuccess' : 'modalQuotationSuccess'
                );
                if (successBox) successBox.classList.remove('is-visible');
            });
        });

        // 4. Form Submit Handler
        ['inlineQuotationForm', 'modalQuotationForm'].forEach((formId) => {
            const form = document.getElementById(formId);
            if (!form) return;
            form.addEventListener('submit', (e) => handleQuotationSubmit(e, form));
        });
    }

    async function handleQuotationSubmit(event, form) {
        event.preventDefault();

        const fd = new FormData(form);
        const channel = form.getAttribute('data-channel') || 'whatsapp_direct';
        const payload = {
            website_url: (fd.get('website_url') || '').toString().trim(),
            name: (fd.get('name') || '').toString().trim(),
            companyOrRuc: (fd.get('companyOrRuc') || '').toString().trim(),
            city: (fd.get('city') || '').toString().trim(),
            service: (fd.get('service') || 'Proyecto Corporativo').toString().trim(),
            referenceItem: (fd.get('referenceItem') || '').toString().trim(),
            description: (fd.get('description') || '').toString().trim(),
            email: (fd.get('email') || '').toString().trim(),
            phone: (fd.get('phone') || '').toString().trim(),
            rfpLink: (fd.get('rfpLink') || '').toString().trim(),
            channel
        };

        if (!payload.name || !payload.companyOrRuc || !payload.city || !payload.description) {
            alert('Por favor completa Nombre, Empresa o RUC, Ciudad y la Descripción de tu proyecto.');
            return;
        }

        if (channel === 'formal_proforma') {
            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
            if (!emailOk) {
                alert('Por favor ingresa un correo corporativo válido para remitirte la Proforma Formal.');
                return;
            }
        }

        const submitBtn = form.querySelector('[data-submit-btn]');
        const submitLabel = form.querySelector('[data-submit-label]');
        const successBox = document.getElementById(
            form.id === 'inlineQuotationForm' ? 'inlineQuotationSuccess' : 'modalQuotationSuccess'
        );

        // =====================================================================
        // CHANNEL A: INSTANT WHATSAPP BRIDGE (Zero Popup-Blocker Synchronous Open)
        // =====================================================================
        if (channel === 'whatsapp_direct') {
            const waLines = [
                '*SOLICITUD CORPORATIVA — AGENCIA VECTORE*',
                '────────────────────────',
                `• *Contacto:* ${payload.name}`,
                `• *Empresa / RUC:* ${payload.companyOrRuc}`,
                `• *Ciudad / Eje:* ${payload.city}`,
                `• *División:* ${payload.service}`
            ];
            if (payload.referenceItem) {
                waLines.push(`• *Referencia:* ${payload.referenceItem}`);
            }
            waLines.push('────────────────────────');
            waLines.push(`*Alcance del Proyecto:*\n${payload.description}`);

            const waUrl = `https://wa.me/${state.whatsappNumber}?text=${encodeURIComponent(waLines.join('\n'))}`;

            // Persist prospect to MongoDB asynchronously with keepalive:true
            api.createQuotation(payload, true).catch((err) => {
                console.warn('Background CRM save warning:', err.message);
            });

            // Open WhatsApp synchronously inside user gesture so iOS Safari / Mobile Chrome never block it
            window.open(waUrl, '_blank', 'noopener,noreferrer');

            form.style.display = 'none';
            if (successBox) {
                const titleEl = successBox.querySelector('[data-success-title]');
                const msgEl = successBox.querySelector('[data-success-msg]');
                if (titleEl) titleEl.textContent = '¡Solicitud Registrada y Puente WhatsApp Abierto!';
                if (msgEl) {
                    msgEl.innerHTML = `Hemos guardado tu requerimiento para <strong>${escapeHtml(payload.companyOrRuc)}</strong>. Si tu navegador no abrió la pestaña automáticamente, <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener" style="color:var(--vf-emerald);text-decoration:underline;font-weight:600;">haz clic aquí para abrir WhatsApp</a>.`;
                }
                successBox.classList.add('is-visible');
            }
            return;
        }

        // =====================================================================
        // CHANNEL B: FORMAL CORPORATE EMAIL PROFORMA (No WhatsApp)
        // =====================================================================
        const prevText = submitLabel ? submitLabel.textContent : '';
        if (submitBtn) submitBtn.disabled = true;
        if (submitLabel) submitLabel.textContent = 'Registrando Expediente Corporativo...';

        try {
            const res = await api.createQuotation(payload, false);
            const code = res?.quotationCode || res?.data?.quotationCode || 'COT-REGISTRADO';

            form.style.display = 'none';
            if (successBox) {
                const titleEl = successBox.querySelector('[data-success-title]');
                const msgEl = successBox.querySelector('[data-success-msg]');
                if (titleEl) titleEl.textContent = `Expediente ${code} Recibido`;
                if (msgEl) {
                    msgEl.textContent = `Hemos registrado tu solicitud formal para ${payload.companyOrRuc}. Nuestro equipo remitirá la evaluación y proforma al correo ${payload.email}.`;
                }
                successBox.classList.add('is-visible');
            }
        } catch (err) {
            alert(err.message || 'No se pudo registrar la solicitud. Intenta nuevamente o usa la pestaña de WhatsApp.');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (submitLabel) submitLabel.textContent = prevText;
        }
    }
})();
