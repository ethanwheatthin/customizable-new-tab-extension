// BaseWidget class (extracted from widgets.js)
class BaseWidget {
    constructor(id, config = {}) {
        this.id = id;
        this.type = this.constructor.name.toLowerCase().replace('widget', '');
        this.config = config;
        this.element = null;
    }

    render() {
        this.element = document.createElement('div');
        this.element.className = `widget ${this.type}-widget`;
        this.element.innerHTML = this.getHTML();
        this.setupEventListeners();
        this.initialize();
        return this.element;
    }

    getHTML() {
        return `
            <div class="widget-header">
                <h3 class="widget-title">
                    <i class="${this.getIcon()}"></i>
                    ${this.getTitle()}
                </h3>
                <div class="widget-actions">
                    <button class="widget-btn settings-btn" title="Settings">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="widget-btn delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="widget-content">
                ${this.getContentHTML()}
            </div>
        `;
    }

    setupEventListeners() {
        const deleteBtn = this.element.querySelector('.delete-btn');
        const settingsBtn = this.element.querySelector('.settings-btn');

        deleteBtn?.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this widget?')) {
                window.widgetManager.removeWidget(this.id);
            }
        });

        settingsBtn?.addEventListener('click', () => {
            this.openSettings();
        });
    }

    getTitle() {
        return this.type.charAt(0).toUpperCase() + this.type.slice(1);
    }

    getIcon() {
        return 'fas fa-cube';
    }

    getContentHTML() {
        return '<p>Widget content goes here</p>';
    }

    initialize() {
        // Override in child classes
    }

    openSettings() {
        // Override in child classes
        alert('Settings not implemented for this widget');
    }

    async saveData(data) {
        await Storage.setWidgetData(this.id, data);
    }

    async loadData() {
        return await Storage.getWidgetData(this.id);
    }
}

// Expose registry container for widget classes
window.WidgetClasses = window.WidgetClasses || {};
