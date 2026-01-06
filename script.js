// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    // Initial scroll check
    revealOnScroll();

    // Load products from API
    await loadProducts();
});

// ===================================
// Navigation
// ===================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===================================
// Catalog & API Integration
// ===================================
const productCatalog = {}; // To store products for chatbot

async function loadProducts() {
    const catalogGrid = document.getElementById('catalogGrid');

    // Show skeleton/loading state if needed
    // catalogGrid.innerHTML = '<div class="loader">Loading...</div>';

    try {
        const response = await api.getProducts();
        const products = response.data;

        // Clear current content
        catalogGrid.innerHTML = '';

        if (products.length === 0) {
            catalogGrid.innerHTML = '<div class="no-products">No hay productos disponibles por el momento.</div>';
            return;
        }

        // Populate catalog map for chatbot
        products.forEach(p => {
            productCatalog[p.name] = {
                basePrice: p.price,
                description: p.description,
                // Assuming backend might have options or we use defaults
                options: p.specifications ? formatSpecsToOptions(p.specifications) : getDefaultOptions(p)
            };
        });

        // Render products
        products.forEach(product => {
            const card = createProductCard(product);
            catalogGrid.appendChild(card);
        });

        // Re-initialize animations and event listeners for new elements
        initializeCatalogEvents();
        initializeQuoteButtons();

    } catch (error) {
        console.error('Error loading products:', error);
        catalogGrid.innerHTML = '<div class="error">Hubo un error al cargar los productos. Por favor intenta más tarde.</div>';
    }
}

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card reveal';
    div.dataset.category = product.category;

    // Determine icon based on category/name if image fails or as placeholder
    const icon = getProductIcon(product);

    const imageContent = product.images && product.images.length > 0 && product.images[0].url
        ? `<img src="${product.images[0].url}" alt="${product.name}" class="product-img-bg">`
        : `<div class="product-placeholder ${product.category}-1"><span class="product-icon">${icon}</span></div>`;

    const categoryTag = product.category === 'digital'
        ? '<span class="product-tag">Digital</span>'
        : '<span class="product-tag physical">Físico</span>';

    div.innerHTML = `
        <div class="product-image">
            ${imageContent}
            ${categoryTag}
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">
                <span class="price">Desde $${product.price}</span>
                <button class="btn-quote" data-product="${product.name}">Cotizar</button>
            </div>
        </div>
    `;
    return div;
}

function getProductIcon(product) {
    // Simple mapping keywords to emojis
    const name = product.name.toLowerCase();
    if (name.includes('logo')) return '🎨';
    if (name.includes('web')) return '💻';
    if (name.includes('redes') || name.includes('social')) return '📱';
    if (name.includes('video') || name.includes('motion')) return '🎬';
    if (name.includes('tarjeta')) return '💳';
    if (name.includes('flyer')) return '📄';
    return product.category === 'digital' ? '✨' : '📦';
}

function getDefaultOptions(product) {
    // Fallback options if none provided
    return {
        'básico': { price: product.price, includes: 'Servicio estándar' },
        'premium': { price: Math.round(product.price * 1.5), includes: 'Servicio prioritario + extras' }
    };
}

function formatSpecsToOptions(specs) {
    // Helper to convert specifications map to chatbot options format
    // Implementation depends on how specs are stored
    return {
        'estándar': { price: 0, includes: 'Según especificaciones' }
    };
}

// ===================================
// Catalog Filters
// ===================================
function initializeCatalogEvents() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            // Filter products with animation
            productCards.forEach(card => {
                const category = card.dataset.category;

                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fadeInUp 0.5s ease forwards';
                    card.style.display = 'block';
                } else {
                    card.classList.add('hidden');
                    setTimeout(() => {
                        if (card.classList.contains('hidden')) card.style.display = 'none';
                    }, 500); // Wait for fade out if any
                    card.style.display = 'none'; // Immediate hide for simplicity
                }
            });
        });
    });
}

function initializeQuoteButtons() {
    document.querySelectorAll('.btn-quote').forEach(btn => {
        btn.addEventListener('click', () => {
            const product = btn.dataset.product;

            // Scroll to quoter section
            document.querySelector('#cotizador').scrollIntoView({ behavior: 'smooth' });

            // Simulate clicking on product in chat
            setTimeout(() => {
                addMessage(product, false);
                generateResponse(product);
            }, 800);
        });
    });
}

// ===================================
// AI Chatbot
// ===================================
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const btnSend = document.getElementById('btnSend');
const quickActions = document.getElementById('quickActions');

// Conversation state
let conversationState = {
    step: 'initial',
    product: null,
    quantity: null
};

// Add message to chat
function addMessage(content, isBot = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isBot ? 'bot' : 'user'}`;
    messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}

// Generate AI response
function generateResponse(userMessage) {
    showTyping();

    setTimeout(() => {
        hideTyping();

        const lowerMessage = userMessage.toLowerCase();

        // Check if user mentions a product
        let detectedProduct = null;
        for (const product in productCatalog) {
            if (lowerMessage.includes(product.toLowerCase()) ||
                product.toLowerCase().includes(lowerMessage)) {
                detectedProduct = product;
                break;
            }
        }

        // Check for partial matches
        if (!detectedProduct) {
            const keywords = {
                'logo': 'Diseño de Logo',
                'logotipo': 'Diseño de Logo',
                'web': 'Diseño Web',
                'página web': 'Diseño Web',
                'sitio web': 'Diseño Web',
                'redes': 'Contenido Redes Sociales',
                'tarjeta': 'Tarjetas de Presentación',
                'flyer': 'Flyers y Folletos'
            };

            for (const keyword in keywords) {
                if (lowerMessage.includes(keyword)) {
                    // Only select if it exists in loaded catalog
                    const targetName = keywords[keyword];
                    // Find actual product name in catalog that matches
                    const catalogName = Object.keys(productCatalog).find(k => k.includes(targetName) || targetName.includes(k));
                    if (catalogName) detectedProduct = catalogName;
                    break;
                }
            }
        }

        if (detectedProduct) {
            conversationState.product = detectedProduct;
            conversationState.step = 'options';

            const product = productCatalog[detectedProduct];
            let optionsHTML = `¡Excelente elección! 🎨 <strong>${detectedProduct}</strong> - ${product.description}<br><br>`;
            optionsHTML += `Tenemos las siguientes opciones:<br><br>`;

            for (const [option, details] of Object.entries(product.options)) {
                optionsHTML += `<strong>• ${option.charAt(0).toUpperCase() + option.slice(1)}</strong>: $${details.price} USD<br>`;
                optionsHTML += `<small style="color: #6c757d; margin-left: 12px;">Incluye: ${details.includes}</small><br><br>`;
            }

            optionsHTML += `¿Cuál de estas opciones te interesa?`;

            addMessage(optionsHTML);

            // Update quick actions
            quickActions.innerHTML = '';
            for (const option of Object.keys(product.options)) {
                const btn = document.createElement('button');
                btn.className = 'quick-action';
                btn.dataset.value = option;
                btn.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                btn.addEventListener('click', () => handleQuickAction(option));
                quickActions.appendChild(btn);
            }

        } else if (conversationState.step === 'options' && conversationState.product) {
            // Check if user selected an option
            const product = productCatalog[conversationState.product];
            let selectedOption = null;

            for (const option of Object.keys(product.options)) {
                if (lowerMessage.includes(option.toLowerCase())) {
                    selectedOption = option;
                    break;
                }
            }

            if (selectedOption) {
                const details = product.options[selectedOption];
                const quoteHTML = `
                    ¡Perfecto! He generado tu cotización:
                    <div class="quote-result">
                        <h5>📋 COTIZACIÓN</h5>
                        <p><strong>Producto:</strong> ${conversationState.product}</p>
                        <p><strong>Opción:</strong> ${selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}</p>
                        <p><strong>Incluye:</strong> ${details.includes}</p>
                        <p class="quote-price">Total: $${details.price} USD</p>
                    </div>
                    <br>
                    ¿Te gustaría proceder con esta cotización? Puedes contactarnos directamente o explorar otros productos. 🚀
                `;
                addMessage(quoteHTML);

                // Initialize creating quotation in backend
                createBackendQuotation(conversationState.product, selectedOption, details);

                // Reset state
                conversationState = { step: 'initial', product: null, quantity: null };

                // Restore default quick actions
                restoreDefaultQuickActions();

            } else {
                addMessage(`Disculpa, no encontré esa opción. Por favor, selecciona una de las opciones disponibles o escribe "ver productos" para explorar nuestro catálogo completo. 🤔`);
            }

        } else if (lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
            addMessage(`¡Con gusto te ayudo! Por favor selecciona un producto del catálogo o escribe el nombre de lo que buscas.`);
            restoreDefaultQuickActions();

        } else if (lowerMessage.includes('hola')) {
            addMessage(`¡Hola! 👋 Soy VectoreBot. ¿Qué producto te interesa hoy?`);

        } else {
            addMessage(`Para ayudarte mejor, cuéntame ¿qué producto o servicio te interesa?`);
        }

    }, 1000 + Math.random() * 1000);
}

// Function to send quotation to backend (placeholder for now as we don't have user details in chat)
async function createBackendQuotation(product, option, details) {
    // In a real flow, we would ask for name/email here.
    // For now, we just log it or maybe create a "draft" quotation if we had session.
    console.log("Quotation generated:", { product, option, details });
}

// Restore default quick actions
function restoreDefaultQuickActions() {
    const defaultActions = [
        { value: 'Diseño de Logo', label: '🎨 Logo' },
        { value: 'Diseño Web', label: '💻 Web' }
    ];
    // Populate from loaded catalog if possible
    if (Object.keys(productCatalog).length > 0) {
        // take first 4 keys
        const keys = Object.keys(productCatalog).slice(0, 4);
        quickActions.innerHTML = '';
        keys.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'quick-action';
            btn.dataset.value = key;
            // extract icon if possible or use generic
            btn.textContent = key;
            btn.addEventListener('click', () => handleQuickAction(key));
            quickActions.appendChild(btn);
        });
    } else {
        quickActions.innerHTML = '';
        defaultActions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'quick-action';
            btn.dataset.value = action.value;
            btn.textContent = action.label;
            btn.addEventListener('click', () => handleQuickAction(action.value));
            quickActions.appendChild(btn);
        });
    }
}

// Handle quick action clicks
function handleQuickAction(value) {
    addMessage(value, false);
    generateResponse(value);
}

// Send message
function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, false);
    chatInput.value = '';
    generateResponse(message);
}

// Event listeners for chat
btnSend.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Quick actions initial setup
quickActions.querySelectorAll('.quick-action').forEach(btn => {
    btn.addEventListener('click', () => handleQuickAction(btn.dataset.value));
});


// ===================================
// Contact Form
// ===================================
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Enviando...</span>';
    btn.disabled = true;

    try {
        // Since we don't have a specific endpoint for contact form messages in this quick backend, 
        // we could create a "Quotation" request or just log it for now.
        // Let's assume we map it to a basic quotation request or just success message

        // Mock API call delay
        await new Promise(r => setTimeout(r, 1000));

        // Success
        btn.innerHTML = '<span>¡Mensaje Enviado!</span> ✓';
        btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.disabled = false;
            contactForm.reset();
        }, 3000);

    } catch (error) {
        console.error('Error sending message:', error);
        btn.innerHTML = '<span>Error</span>';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 3000);
    }
});

// ===================================
// Scroll Reveal Animation
// ===================================
const revealElements = document.querySelectorAll('.service-card, .product-card, .contact-item');

const revealOnScroll = () => {
    const elements = document.querySelectorAll('.service-card, .product-card, .contact-item');
    elements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
            el.classList.add('reveal', 'active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);

// ===================================
// Smooth scroll for anchor links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// Form validation styles
// ===================================
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea, .form-group select');

formInputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', () => {
        input.parentElement.classList.remove('focused');
        if (input.value) {
            input.parentElement.classList.add('filled');
        } else {
            input.parentElement.classList.remove('filled');
        }
    });
});
