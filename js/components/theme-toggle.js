// ============================================
// VECTORE GLOBAL — Theme Toggle (Dark/Light)
// Persists preference in localStorage
// Respects system preference on first visit
// ============================================

const STORAGE_KEY = 'vectore_theme';

/**
 * Initialize theme toggle functionality
 */
export function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Apply saved preference or system default
    applyTheme(getPreferredTheme());

    // Toggle on click
    toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually chosen
        if (!localStorage.getItem(STORAGE_KEY)) {
            applyTheme(e.matches ? 'light' : 'dark');
        }
    });
}

/**
 * Get the preferred theme
 */
function getPreferredTheme() {
    // 1. Check localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;

    // 2. Check system preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
    }

    // 3. Default: dark
    return 'dark';
}

/**
 * Apply theme to the document
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}
