// Theme management
class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.currentLayout = 'grid';
        this.backgroundImage = '';
        this.customColor = '#667eea'; // Default custom color
    }

    async loadSettings() {
        const settings = await Storage.getSettings();
        this.currentTheme = settings.theme || 'default';
        this.currentLayout = settings.layout || 'grid';
        this.backgroundImage = settings.backgroundImage || '';
        this.customColor = settings.customColor || '#667eea';
        
        this.applyTheme();
        this.applyLayout();
        this.applyBackground();
    }

    async saveSettings() {
        const settings = {
            theme: this.currentTheme,
            layout: this.currentLayout,
            backgroundImage: this.backgroundImage,
            customColor: this.customColor
        };
        await Storage.setSettings(settings);
    }

    setTheme(theme) {
        // Remove existing theme classes
        document.body.classList.remove('theme-default', 'theme-dark', 'theme-light', 'theme-gradient', 'theme-custom');
        
        // Apply new theme
        this.currentTheme = theme;
        document.body.classList.add(`theme-${theme}`);

        if (theme === 'custom') {
            this.applyCustomColor();
        }
        
        this.saveSettings();

        // Dispatch event for other parts of the app to listen to
        document.dispatchEvent(new CustomEvent('themeApplied', { detail: { theme: this.currentTheme } }));
    }

    setLayout(layout) {
        // Remove existing layout classes
        document.body.classList.remove('layout-grid', 'layout-masonry', 'layout-compact');
        
        // Apply new layout
        this.currentLayout = layout;
        document.body.classList.add(`layout-${layout}`);
        
        this.saveSettings();
    }

    setCustomColor(color) {
        this.customColor = color;
        this.applyCustomColor();
        this.saveSettings();
    }

    setBackground(imageUrl) {
        this.backgroundImage = imageUrl;
        this.applyBackground();
        this.saveSettings();
    }

    applyTheme() {
        document.body.classList.add(`theme-${this.currentTheme}`);
        if (this.currentTheme === 'custom') {
            this.applyCustomColor();
        }
    }

    applyLayout() {
        document.body.classList.add(`layout-${this.currentLayout}`);
    }

    applyCustomColor() {
        document.body.style.setProperty('--custom-bg-color', this.customColor);
    }

    applyBackground() {
        if (this.backgroundImage) {
            document.body.style.backgroundImage = `url(${this.backgroundImage})`;
            document.body.classList.add('custom-background');
        } else {
            document.body.style.backgroundImage = '';
            document.body.classList.remove('custom-background');
        }
    }

    cycleTheme() {
        const themes = ['default', 'dark', 'light', 'gradient', 'custom'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
        
        // Show notification
        this.showThemeNotification(themes[nextIndex]);
    }

    showThemeNotification(themeName) {
        // Remove existing notification
        const existing = document.querySelector('.theme-notification');
        if (existing) {
            existing.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <i class="fas fa-palette"></i>
            <span>Theme: ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}</span>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '25px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideIn 0.3s ease-out',
            fontSize: '0.9rem',
            fontWeight: '500'
        });

        document.body.appendChild(notification);

        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    getThemeInfo() {
        return {
            current: this.currentTheme,
            available: [
                { id: 'default', name: 'Default Gradient', description: 'Blue to purple gradient' },
                { id: 'dark', name: 'Dark Mode', description: 'Dark theme for low light' },
                { id: 'light', name: 'Light Mode', description: 'Clean white theme' },
                { id: 'gradient', name: 'Colorful Gradient', description: 'Multi-color gradient' },
                { id: 'custom', name: 'Custom Color', description: 'Choose your own color' }
            ]
        };
    }

    getLayoutInfo() {
        return {
            current: this.currentLayout,
            available: [
                { id: 'grid', name: 'Grid Layout', description: 'Organized grid structure' },
                { id: 'masonry', name: 'Masonry Layout', description: 'Pinterest-style layout' },
                { id: 'compact', name: 'Compact Layout', description: 'Space-efficient layout' }
            ]
        };
    }

    // Accessibility features
    enableHighContrast() {
        document.body.classList.add('high-contrast');
        this.saveSettings();
    }

    disableHighContrast() {
        document.body.classList.remove('high-contrast');
        this.saveSettings();
    }

    // Auto theme based on system preference
    enableAutoTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const updateTheme = (e) => {
            this.setTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', updateTheme);
        updateTheme(mediaQuery); // Apply immediately

        return () => mediaQuery.removeEventListener('change', updateTheme);
    }

    // Reset to defaults
    resetToDefaults() {
        this.setTheme('default');
        this.setLayout('grid');
        this.setBackground('');
        this.setCustomColor('#667eea');
        document.body.classList.remove('high-contrast');
    }
}

// Add CSS for notifications
(() => {
    const themeNotificationCSS = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;

    const styleEl = document.createElement('style');
    styleEl.textContent = themeNotificationCSS;
    document.head.appendChild(styleEl);
})();

// Initialize theme manager
window.themeManager = new ThemeManager();
