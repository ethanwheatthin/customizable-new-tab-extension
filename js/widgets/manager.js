// WidgetManager (extracted)
class WidgetManager {
    constructor() {
        this.widgets = [];
        this.widgetTypes = {
            weather: window.WidgetClasses?.WeatherWidget,
            clock: window.WidgetClasses?.ClockWidget,
            todo: window.WidgetClasses?.TodoWidget,
            notes: window.WidgetClasses?.NotesWidget,
            stocks: window.WidgetClasses?.StocksWidget,
            rss: window.WidgetClasses?.RssWidget
        };
    }

    async loadWidgets() {
        const savedWidgets = await Storage.getWidgets();
        this.widgets = [];
        
        for (const widgetData of savedWidgets) {
            const widget = this.createWidget(widgetData.type, widgetData.id, widgetData.config);
            if (widget) {
                this.widgets.push(widget);
            }
        }
        
        this.renderWidgets();
    }

    createWidget(type, id = null, config = {}) {
        const WidgetClass = this.widgetTypes[type];
        if (!WidgetClass) {
            console.error(`Unknown widget type: ${type}`);
            return null;
        }

        const widgetId = id || `${type}_${Date.now()}`;
        const widget = new WidgetClass(widgetId, config);
        return widget;
    }

    addWidget(type, config = {}) {
        const widget = this.createWidget(type, null, config);
        if (widget) {
            this.widgets.push(widget);
            this.saveWidgets();
            this.renderWidgets();
            return widget;
        }
        return null;
    }

    removeWidget(widgetId) {
        const index = this.widgets.findIndex(w => w.id === widgetId);
        if (index !== -1) {
            this.widgets.splice(index, 1);
            this.saveWidgets();
            this.renderWidgets();
            // Clean up widget data
            Storage.remove(`widget_${widgetId}`);
        }
    }

    async saveWidgets() {
        const widgetData = this.widgets.map(widget => ({
            type: widget.type,
            id: widget.id,
            config: widget.config
        }));
        await Storage.setWidgets(widgetData);
    }

    renderWidgets() {
        const container = document.getElementById('widgets-container');
        container.innerHTML = '';

        this.widgets.forEach(widget => {
            const element = widget.render();
            container.appendChild(element);
        });
    }
}

// Initialize widget manager
window.widgetManager = new WidgetManager();
