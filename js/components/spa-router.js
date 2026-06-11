// ============================================
// VECTORE SPA — Room Navigation Router
// Manages lobby ↔ room transitions, accent
// color injection, cursor color, and History API
// ============================================

import { setCursorColor } from './cursor.js';

const ROOM_IDS = ['studio', 'wraps', 'software', 'visuals'];
const DEFAULT_ACCENT = '#8655FF';

let currentRoom = null;
let isTransitioning = false;

export function initSPARouter() {
    const lobby = document.getElementById('lobby');
    const rooms = {};
    ROOM_IDS.forEach(id => {
        rooms[id] = document.getElementById(`room-${id}`);
    });
    const backBtn = document.getElementById('backToLobby');
    const cards = document.querySelectorAll('.lobby__card');
    const root = document.documentElement;
    const navbar = document.getElementById('navbar');

    if (!lobby) return;

    function setAccentColor(color) {
        root.style.setProperty('--accent-primary', color);
        try { setCursorColor(color); } catch(e) {}
    }

    function navigateTo(roomId, pushState = true) {
        if (isTransitioning || !rooms[roomId]) return;
        isTransitioning = true;

        const target = rooms[roomId];
        const accent = target.dataset.accent || target.style.getPropertyValue('--accent-room') || DEFAULT_ACCENT;

        // Fade out lobby
        lobby.style.opacity = '0';
        lobby.style.pointerEvents = 'none';

        setTimeout(() => {
            lobby.classList.remove('active');
            lobby.style.opacity = '';
            lobby.style.pointerEvents = '';

            // Show target room
            target.classList.add('active');
            currentRoom = roomId;

            // Inject accent color
            setAccentColor(accent);

            // Show back button
            if (backBtn) backBtn.style.display = 'flex';

            // Update URL
            if (pushState) {
                history.pushState({ room: roomId }, '', `/${roomId}`);
            }

            // Dispatch custom event for room content loading
            window.dispatchEvent(new CustomEvent('room:enter', { detail: { roomId } }));

            // Scroll to top
            window.scrollTo({ top: 0 });

            isTransitioning = false;
        }, 500);
    }

    function backToLobby(pushState = true) {
        if (isTransitioning || !currentRoom) return;
        isTransitioning = true;

        const activeRoom = rooms[currentRoom];
        if (activeRoom) {
            activeRoom.style.opacity = '0';

            setTimeout(() => {
                activeRoom.classList.remove('active');
                activeRoom.style.opacity = '';

                // Show lobby
                lobby.classList.add('active');
                if (backBtn) backBtn.style.display = 'none';

                // Restore default accent
                setAccentColor(DEFAULT_ACCENT);
                currentRoom = null;

                if (pushState) {
                    history.pushState({ room: null }, '', '/');
                }

                window.scrollTo({ top: 0 });
                isTransitioning = false;
            }, 500);
        } else {
            isTransitioning = false;
        }
    }

    // Card click listeners
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const roomId = card.dataset.room;
            if (roomId) navigateTo(roomId);
        });
    });

    // Back button
    if (backBtn) {
        backBtn.addEventListener('click', () => backToLobby());
    }

    // Browser back/forward
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.room) {
            if (currentRoom) {
                // Direct switch without push
                const activeRoom = rooms[currentRoom];
                if (activeRoom) activeRoom.classList.remove('active');
                currentRoom = null;
            }
            navigateTo(e.state.room, false);
        } else {
            backToLobby(false);
        }
    });

    // Handle deep links on initial load
    const path = location.pathname.slice(1).toLowerCase();
    if (ROOM_IDS.includes(path)) {
        // Set initial history state
        history.replaceState({ room: path }, '', `/${path}`);
        // Direct show without animation
        lobby.classList.remove('active');
        rooms[path].classList.add('active');
        currentRoom = path;
        const accent = rooms[path].dataset.accent || DEFAULT_ACCENT;
        setAccentColor(accent);
        if (backBtn) backBtn.style.display = 'flex';
        window.dispatchEvent(new CustomEvent('room:enter', { detail: { roomId: path } }));
    } else {
        // Set initial state for lobby
        history.replaceState({ room: null }, '', '/');
    }
}

export function getCurrentRoom() {
    return currentRoom;
}
