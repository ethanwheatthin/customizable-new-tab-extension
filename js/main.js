// Main application logic
class Dashboard {
    constructor() {
        this.isInitialized = false;
        this.modals = {};
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initialize all managers
            await this.initializeManagers();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load data
            await this.loadData();
            
            // Apply initial settings
            await this.applyInitialSettings();
            
            this.isInitialized = true;
            console.log('Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showError('Failed to initialize dashboard. Please refresh the page.');
        }
    }

    async initializeManagers() {
        // Managers are already initialized globally
        // Just ensure they exist
        if (!window.favoritesManager) {
            throw new Error('Favorites manager not initialized');
        }
        if (!window.widgetManager) {
            throw new Error('Widget manager not initialized');
        }
        if (!window.themeManager) {
            throw new Error('Theme manager not initialized');
        }
    }

    setupEventListeners() {
        this.setupModalHandlers();
        this.setupHeaderButtons();
        this.setupThemeDropdown();
        this.setupHeaderRename();
        this.setupFavoriteForm();
        this.setupWidgetSelection();
        this.setupSettingsForm();
        this.setupKeyboardShortcuts();
    }

    // Allow inline renaming of the dashboard title via double-click
    setupHeaderRename() {
        const titleEl = document.querySelector('.dashboard-title');
        if (!titleEl) return;

        // Make it obvious it's editable on hover
        titleEl.style.cursor = 'text';

        const startEditing = () => {
            // Prevent multiple inputs
            if (titleEl.dataset.editing === 'true') return;
            titleEl.dataset.editing = 'true';

            const current = titleEl.textContent || '';
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'inline-title-input';
            input.value = current;
            input.style.minWidth = '200px';
            input.style.fontSize = '1.25rem';
            input.style.padding = '4px 8px';

            // Replace title with input
            titleEl.textContent = '';
            titleEl.appendChild(input);
            input.focus();
            input.select();

            const finish = (save) => {
                const newVal = input.value.trim();
                // Remove input
                titleEl.removeChild(input);
                titleEl.dataset.editing = 'false';

                if (save && newVal) {
                    titleEl.textContent = newVal;
                    // Persist
                    Storage.getSettings().then(settings => {
                        settings.dashboardTitle = newVal;
                        Storage.setSettings(settings);
                    }).catch(err => console.warn('Failed to save dashboard title:', err));
                } else {
                    // restore previous
                    titleEl.textContent = current;
                }
            };

            // Save on Enter, cancel on Escape
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    finish(true);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    finish(false);
                }
            });

            // Save on blur
            input.addEventListener('blur', () => finish(true));
        };

        // Double-click to edit; also allow single-click when holding Ctrl
        titleEl.addEventListener('dblclick', startEditing);
        titleEl.addEventListener('click', (e) => {
            if (e.ctrlKey) startEditing();
        });
    }

    setupModalHandlers() {
        // Get all modals
        this.modals = {
            addFavorite: document.getElementById('add-favorite-modal'),
            addWidget: document.getElementById('add-widget-modal'),
            settings: document.getElementById('settings-modal')
        };

        // Setup close buttons (support multiple close buttons per modal)
        Object.values(this.modals).forEach(modal => {
            if (!modal) return; // guard if modal element is missing

            const closeBtns = modal.querySelectorAll('.close-btn');
            closeBtns.forEach(btn => {
                btn.addEventListener('click', () => this.closeModal(modal));
            });

            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    setupThemeDropdown() {
        const themeOptions = document.querySelectorAll('.theme-option');
        const dropdown = document.getElementById('theme-dropdown');

        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const theme = option.dataset.theme;
                window.themeManager.setTheme(theme);
                
                // Update active state in dropdown
                themeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                // Also update the settings modal select if it exists
                const themeSelect = document.getElementById('theme-select');
                if (themeSelect) {
                    themeSelect.value = theme;
                }

                // Hide dropdown after selection
                if (dropdown) {
                    dropdown.classList.remove('active');
                }
            });
        });

        // Set initial active state
        document.addEventListener('themeApplied', (e) => {
            themeOptions.forEach(opt => {
                opt.classList.toggle('active', opt.dataset.theme === e.detail.theme);
            });
        });
    }

    setupHeaderButtons() {
        // Theme toggle button - now just for show, dropdown handles logic
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => {
            const dropdown = document.getElementById('theme-dropdown');
            dropdown?.classList.toggle('active');
        });

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        settingsBtn?.addEventListener('click', () => {
            this.openSettingsModal();
        });

        // Add favorite button
        const addFavoriteBtn = document.getElementById('add-favorite-btn');
        addFavoriteBtn?.addEventListener('click', () => {
            this.openModal(this.modals.addFavorite);
        });

        // Add widget button
        const addWidgetBtn = document.getElementById('add-widget-btn');
        addWidgetBtn?.addEventListener('click', () => {
            this.openModal(this.modals.addWidget);
        });

        // Search form handling
        const searchForm = document.getElementById('search-form');
        const searchInput = document.getElementById('search-input');
        const engineSelect = document.getElementById('search-engine');

        const engineMap = {
            google: 'https://www.google.com/search?q=%s',
            bing: 'https://www.bing.com/search?q=%s',
            duckduckgo: 'https://duckduckgo.com/?q=%s',
            brave: 'https://search.brave.com/search?q=%s'
        };

        const isLikelyUrl = (text) => {
            try {
                const maybe = new URL(text);
                return true;
            } catch (e) {
                // If no scheme but contains a dot and no spaces, treat as URL
                return /\S+\.\S+/.test(text) && !/\s/.test(text);
            }
        };

        searchForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const raw = (searchInput.value || '').trim();
            if (!raw) return;

            let targetUrl = '';

            if (isLikelyUrl(raw)) {
                // If user typed a URL without scheme, add https
                try {
                    const u = new URL(raw);
                    targetUrl = u.href;
                } catch (err) {
                    targetUrl = 'https://' + raw;
                }
            } else {
                const engine = engineSelect?.value || 'google';
                const template = engineMap[engine] || engineMap.google;
                targetUrl = template.replace('%s', encodeURIComponent(raw));
            }

            // Open in a new tab (Chrome/new tab environment will open externally)
            window.open(targetUrl, '_blank');
            // Optionally clear the input
            // searchInput.value = '';
        });
    }

    setupFavoriteForm() {
        const form = document.getElementById('favorite-form');
        const cancelBtn = document.getElementById('cancel-favorite');

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddFavorite();
        });

        cancelBtn?.addEventListener('click', () => {
            this.closeModal(this.modals.addFavorite);
        });
    }

    setupWidgetSelection() {
        const widgetTypes = document.querySelectorAll('.widget-type');
        widgetTypes.forEach(type => {
            type.addEventListener('click', () => {
                const widgetType = type.dataset.type;
                this.handleAddWidget(widgetType);
            });
        });
    }

    setupSettingsForm() {
        const saveBtn = document.getElementById('save-settings');
        const resetBtn = document.getElementById('reset-settings');

        saveBtn?.addEventListener('click', () => {
            this.handleSaveSettings();
        });

        resetBtn?.addEventListener('click', () => {
            this.handleResetSettings();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger if not typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch (e.key) {
                case 'f':
                case 'F':
                    e.preventDefault();
                    this.openModal(this.modals.addFavorite);
                    break;
                case 'w':
                case 'W':
                    e.preventDefault();
                    this.openModal(this.modals.addWidget);
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    this.openSettingsModal();
                    break;
                case 't':
                case 'T':
                    e.preventDefault();
                    window.themeManager.cycleTheme();
                    break;
            }
        });
    }

    async loadData() {
        // Load favorites
        await window.favoritesManager.loadFavorites();
        
        // Load widgets
        await window.widgetManager.loadWidgets();
        
        // Load theme settings
        await window.themeManager.loadSettings();
    }

    async applyInitialSettings() {
        const settings = await Storage.getSettings();
        
        // Update dashboard title if customized
        if (settings.dashboardTitle) {
            const titleElement = document.querySelector('.dashboard-title');
            if (titleElement) {
                titleElement.textContent = settings.dashboardTitle;
            }
        }
    }

    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

        // If opening the add-favorite modal, render quick-add list and wire up tabs
        if (modal && modal.id === 'add-favorite-modal') {
            // Render quick list
            try {
                window.favoritesManager.renderQuickAddList();
            } catch (e) {
                console.warn('Failed to render quick add list:', e);
            }

            // Setup tab buttons inside modal (idempotent)
            const modalEl = modal;
            const tabBtns = modalEl.querySelectorAll('.tab-btn');
            const panels = modalEl.querySelectorAll('.tab-panel');

            tabBtns.forEach(btn => {
                btn.onclick = () => {
                    const target = btn.dataset.tab;
                    tabBtns.forEach(b => b.classList.toggle('active', b === btn));
                    panels.forEach(p => p.classList.toggle('active', p.id === target));

                    // Focus first input in active panel
                    const first = modalEl.querySelector('.tab-panel.active input, .tab-panel.active textarea, .tab-panel.active select');
                    if (first) setTimeout(() => first.focus(), 80);
                };
            });
        }
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear form data
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }

    closeAllModals() {
        Object.values(this.modals).forEach(modal => {
            this.closeModal(modal);
        });
    }

    async handleAddFavorite() {
        const form = document.getElementById('favorite-form');
        const formData = new FormData(form);
        
        const name = document.getElementById('site-name').value.trim();
        const url = document.getElementById('site-url').value.trim();
        const icon = document.getElementById('site-icon').value.trim();
        const groupSelect = document.getElementById('site-group');
        const groupId = groupSelect && groupSelect.value ? Number(groupSelect.value) : null;

        try {
            await window.favoritesManager.addFavorite(name, url, icon, groupId);
            this.closeModal(this.modals.addFavorite);
            this.showSuccess(`Added "${name}" to favorites!`);
        } catch (error) {
            this.showError(error.message);
        }
    }

    handleAddWidget(type) {
        try {
            const widget = window.widgetManager.addWidget(type);
            if (widget) {
                this.closeModal(this.modals.addWidget);
                this.showSuccess(`Added ${type} widget!`);
            }
        } catch (error) {
            this.showError(`Failed to add ${type} widget: ${error.message}`);
        }
    }

    openSettingsModal() {
        // Populate current settings
        const themeSelect = document.getElementById('theme-select');
        const layoutSelect = document.getElementById('layout-select');
        const backgroundInput = document.getElementById('background-input');
        const titleInput = document.getElementById('dashboard-title-input');
        const customColorInput = document.getElementById('custom-color-input');

        if (themeSelect) themeSelect.value = window.themeManager.currentTheme;
        if (layoutSelect) layoutSelect.value = window.themeManager.currentLayout;
        if (backgroundInput) backgroundInput.value = window.themeManager.backgroundImage;
        if (customColorInput) customColorInput.value = window.themeManager.customColor;

        // Populate dashboard title from saved settings (or current DOM title as fallback)
        if (titleInput) {
            Storage.getSettings().then(settings => {
                titleInput.value = settings.dashboardTitle || document.querySelector('.dashboard-title')?.textContent || 'My Dashboard';
            }).catch(() => {
                titleInput.value = document.querySelector('.dashboard-title')?.textContent || 'My Dashboard';
            });
        }

        this.openModal(this.modals.settings);
    }

    handleSaveSettings() {
        const themeSelect = document.getElementById('theme-select');
        const layoutSelect = document.getElementById('layout-select');
        const backgroundInput = document.getElementById('background-input');
        const titleInput = document.getElementById('dashboard-title-input');
        const customColorInput = document.getElementById('custom-color-input');

        // Apply settings
        if (customColorInput && customColorInput.value !== window.themeManager.customColor) {
            window.themeManager.setCustomColor(customColorInput.value);
        }

        if (themeSelect && themeSelect.value !== window.themeManager.currentTheme) {
            window.themeManager.setTheme(themeSelect.value);
        }
        
        if (layoutSelect && layoutSelect.value !== window.themeManager.currentLayout) {
            window.themeManager.setLayout(layoutSelect.value);
        }
        
        if (backgroundInput) {
            window.themeManager.setBackground(backgroundInput.value.trim());
        }

        // Update dashboard title and persist it
        if (titleInput) {
            const newTitle = titleInput.value.trim();
            if (newTitle) {
                const titleEl = document.querySelector('.dashboard-title');
                if (titleEl) titleEl.textContent = newTitle;

                // Persist dashboardTitle in settings
                Storage.getSettings().then(settings => {
                    settings.dashboardTitle = newTitle;
                    Storage.setSettings(settings);
                }).catch(err => {
                    console.warn('Failed to persist dashboard title:', err);
                });
            }
        }

        this.closeModal(this.modals.settings);
        this.showSuccess('Settings saved!');
    }

    handleResetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            window.themeManager.resetToDefaults();

            // Reset dashboard title to default and persist
            const defaultTitle = 'My Dashboard';
            const titleEl = document.querySelector('.dashboard-title');
            if (titleEl) titleEl.textContent = defaultTitle;

            Storage.getSettings().then(settings => {
                settings.dashboardTitle = defaultTitle;
                settings.customColor = '#667eea'; // Also reset custom color in storage
                Storage.setSettings(settings);
            }).catch(err => {
                console.warn('Failed to persist reset dashboard title:', err);
            });

            this.closeModal(this.modals.settings);
            this.showSuccess('Settings reset to default!');
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 
                       type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 
                       'rgba(59, 130, 246, 0.9)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '25px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: '10001',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideDown 0.3s ease-out',
            fontSize: '0.9rem',
            fontWeight: '500',
            maxWidth: '400px',
            textAlign: 'center'
        });

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add notification animations
(() => {
    const notificationCSS = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }

    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }

    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: rgba(255, 255, 255, 0.7);
        grid-column: 1 / -1;
    }

    .empty-state i {
        font-size: 3rem;
        margin-bottom: 15px;
        opacity: 0.5;
    }

    .empty-state p {
        font-size: 1.1rem;
        margin: 0;
    }
`;

    const styleEl = document.createElement('style');
    styleEl.textContent = notificationCSS;
    document.head.appendChild(styleEl);
})();

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    dashboard.initialize();
});

// Make dashboard globally available
window.dashboard = new Dashboard();
