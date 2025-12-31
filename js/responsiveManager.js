/**
 * Responsive Manager - Handles mobile navigation, view toggles, and responsive features
 */

const ResponsiveManager = {
    // View preference key for localStorage
    VIEW_PREFERENCE_KEY: 'categoryViewPreference',
    currentView: 'grid',

    /**
     * Initialize responsive features
     */
    init() {
        this.setupViewToggle();
        this.setupMobileNavigation();
        this.setupHamburgerMenu();
        this.loadViewPreference();
    },

    /**
     * Setup category grid/list view toggle
     */
    setupViewToggle() {
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        const categoriesGrid = document.getElementById('categoriesGrid');

        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                this.setView('grid', gridViewBtn, listViewBtn, categoriesGrid);
            });
        }

        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => {
                this.setView('list', gridViewBtn, listViewBtn, categoriesGrid);
            });
        }
    },

    /**
     * Set view type and save preference
     */
    setView(view, gridBtn, listBtn, grid) {
        this.currentView = view;
        localStorage.setItem(this.VIEW_PREFERENCE_KEY, view);

        if (view === 'grid') {
            grid.classList.remove('list-view');
            gridBtn.classList.add('active');
            listBtn.classList.remove('active');
        } else {
            grid.classList.add('list-view');
            gridBtn.classList.remove('active');
            listBtn.classList.add('active');
        }

        // Re-render categories if function exists
        if (typeof CategoryManager !== 'undefined' && CategoryManager.renderCategories) {
            CategoryManager.renderCategories();
        }
    },

    /**
     * Load view preference from localStorage
     */
    loadViewPreference() {
        const saved = localStorage.getItem(this.VIEW_PREFERENCE_KEY);
        if (saved === 'list') {
            setTimeout(() => {
                const listViewBtn = document.getElementById('listViewBtn');
                const gridViewBtn = document.getElementById('gridViewBtn');
                const categoriesGrid = document.getElementById('categoriesGrid');
                if (listViewBtn && gridViewBtn && categoriesGrid) {
                    this.setView('list', gridViewBtn, listViewBtn, categoriesGrid);
                }
            }, 100);
        }
    },

    /**
     * Setup mobile bottom navigation
     */
    setupMobileNavigation() {
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        // Only use sidebar items that have a data-page attribute
        const sidebarItems = Array.from(document.querySelectorAll('.nav-item'))
            .filter(item => item.getAttribute('data-page'));

        bottomNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                const action = item.getAttribute('data-action');

                if (page) {
                    this.navigateTo(page);
                    this.updateActiveNav(item, sidebarItems, bottomNavItems);
                } else if (action) {
                    this.handleAction(action);
                    this.updateActiveNav(item, sidebarItems, bottomNavItems, true);
                }
                this.closeSidebar();
            });
        });

        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (!page) return;
                this.navigateTo(page);
                this.updateActiveNav(item, sidebarItems, bottomNavItems);
            });
        });

        // Handle reminder/settings (no data-page) for mobile taps
        const reminderItem = document.getElementById('reminderNavItem');
        if (reminderItem) {
            reminderItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAction('reminders');
                this.closeSidebar();
            });
        }

        const settingsItem = document.getElementById('settingsNavItem');
        if (settingsItem) {
            settingsItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAction('settings');
                this.closeSidebar();
            });
        }
    },

    /**
     * Navigate to page
     */
    navigateTo(page) {
        if (typeof App === 'undefined') return;

        if (typeof App.switchPage === 'function') {
            App.switchPage(page);
        } else if (typeof App.showPage === 'function') {
            App.showPage(page);
        }
    },

    /**
     * Handle non-page actions (reminders/settings)
     */
    handleAction(action) {
        if (typeof App === 'undefined') return;

        if (action === 'reminders' && typeof App.openReminders === 'function') {
            App.openReminders();
        }

        if (action === 'settings' && typeof App.openSettings === 'function') {
            App.openSettings();
        }
    },

    /**
     * Update active navigation item
     */
    updateActiveNav(activeItem, sidebarItems, bottomItems, skipSidebarSync = false) {
        sidebarItems.forEach(item => item.classList.remove('active'));
        bottomItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');

        if (skipSidebarSync) return;

        const page = activeItem.getAttribute('data-page');
        if (!page) return;

        const correspondingItem = document.querySelector(`[data-page="${page}"]`);
        if (correspondingItem) {
            correspondingItem.classList.add('active');
        }
    },

    /**
     * Setup hamburger menu toggle
     */
    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburgerMenu');
        const sidebar = document.querySelector('.sidebar');

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Close sidebar when clicking outside
        document.addEventListener('click', (e) => {
            if (sidebar && sidebar.classList.contains('mobile-open')) {
                if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                    this.closeSidebar();
                }
            }
        });
    },

    /**
     * Toggle sidebar visibility
     */
    toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const hamburger = document.getElementById('hamburgerMenu');

        if (sidebar) {
            sidebar.classList.toggle('mobile-open');
            hamburger.classList.toggle('open');
        }
    },

    /**
     * Close sidebar
     */
    closeSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const hamburger = document.getElementById('hamburgerMenu');

        if (sidebar && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
            if (hamburger) {
                hamburger.classList.remove('open');
            }
        }
    },

    /**
     * Format category card for list view
     */
    formatListViewCard(category) {
        return `
            <div class="category-info">
                <span class="category-name">${category.name}</span>
                <span class="category-total">₹${category.total || 0}</span>
            </div>
        `;
    }
};

// Initialize responsive manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ResponsiveManager.init();
    });
} else {
    ResponsiveManager.init();
}
