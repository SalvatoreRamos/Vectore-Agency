/* =========================================
   EVENT / GIVEAWAY LOGIC MODULE
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    initEventManager();
});

const EVENT_CONFIG = {
    scrollTrigger: 0.75, // Show at 75% scroll
    timeTrigger: 30000,  // Or after 30 seconds
    apiActive: '/api/events/active',
    apiJoin: (id) => `/api/events/${id}/join`
};

let activeEvent = null;
let hasShownBalloon = false;

async function initEventManager() {
    // 1. Check if there is an active event
    try {
        const response = await fetch(EVENT_CONFIG.apiActive);
        const data = await response.json();

        if (data.success && data.active && data.data) {
            activeEvent = data.data;
            setupEventModule();
        }
    } catch (error) {
        console.log('No active events currently.');
    }
}

function setupEventModule() {
    const balloon = document.getElementById('eventBalloonContainer');
    const modal = document.getElementById('eventModal');
    const closeBtn = document.getElementById('closeEventModal');
    const form = document.getElementById('eventForm');

    // Fill Event Info
    document.getElementById('eventTitle').textContent = activeEvent.title;
    document.getElementById('eventDescription').textContent = activeEvent.description;

    // Timer logic
    startEventTimer(activeEvent.endDate);

    // Triggers
    setupTriggers(balloon);

    // Click events
    balloon.addEventListener('click', () => {
        openEventModal();
        /* Optional: Play Pop Sound */
    });

    closeBtn.addEventListener('click', closeEventModal);

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('event-modal-overlay')) closeEventModal();
    });

    // Form Submit
    form.addEventListener('submit', handleEventSubmit);
}

function setupTriggers(balloon) {
    // 1. Scroll Trigger
    window.addEventListener('scroll', () => {
        if (hasShownBalloon) return;

        const scrollPercent = (window.scrollY + window.innerHeight) / document.body.offsetHeight;
        if (scrollPercent > EVENT_CONFIG.scrollTrigger) {
            showBalloon();
        }
    });

    // 2. Time Trigger
    setTimeout(() => {
        if (!hasShownBalloon) showBalloon();
    }, EVENT_CONFIG.timeTrigger);

    function showBalloon() {
        if (!activeEvent) return;
        balloon.style.display = 'block';
        hasShownBalloon = true;
    }
}

function openEventModal() {
    const modal = document.getElementById('eventModal');
    modal.classList.add('active');

    // Reset Form
    document.getElementById('eventSuccess').style.display = 'none';
    document.getElementById('eventForm').style.display = 'block';

    triggerConfetti();
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
}

async function handleEventSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = 'Registrando...';

    const name = document.getElementById('participantName').value;
    const phone = document.getElementById('participantPhone').value;

    try {
        const response = await fetch(EVENT_CONFIG.apiJoin(activeEvent._id), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone })
        });

        const result = await response.json();

        if (result.success) {
            showSuccessTicket(result.ticketId);
        } else {
            // If already registered, show ticket anyway
            if (result.ticketId) {
                showSuccessTicket(result.ticketId);
                alert('¡Ya estabas registrado! Aquí tienes tu ticket nuevamente.');
            } else {
                alert(result.message || 'Error al registrarse');
            }
        }

    } catch (error) {
        alert('Error de conexión. Inténtalo de nuevo.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function showSuccessTicket(ticketId) {
    document.getElementById('eventForm').style.display = 'none';
    const successDiv = document.getElementById('eventSuccess');
    document.getElementById('userTicketId').textContent = ticketId;
    successDiv.style.display = 'block';

    // Re-trigger confetti for celebration
    triggerConfetti(true);

    document.getElementById('closeEventSuccess').addEventListener('click', closeEventModal);
}

function startEventTimer(endDateStr) {
    const endDate = new Date(endDateStr).getTime();

    function update() {
        const now = new Date().getTime();
        const distance = endDate - now;

        if (distance < 0) {
            document.getElementById('eventTimer').innerHTML = "¡Evento Finalizado!";
            document.getElementById('eventForm').style.display = 'none';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        document.getElementById('timerDays').textContent = String(days).padStart(2, '0');
        document.getElementById('timerHours').textContent = String(hours).padStart(2, '0');
        document.getElementById('timerMins').textContent = String(minutes).padStart(2, '0');
    }

    update();
    setInterval(update, 60000); // 1 minute update is enough for UI
}

// Real Confetti Effect
function triggerConfetti(intense = false) {
    if (typeof confetti !== 'function') {
        console.log('Confetti library not loaded yet');
        return;
    }

    if (intense) {
        // Celebration blast
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#8655FF', '#160F50', '#ffffff']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#8655FF', '#160F50', '#ffffff']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    } else {
        // Single burst
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#8655FF', '#160F50', '#ffffff']
        });
    }
}
