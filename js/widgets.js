// Widget management system
class WidgetManager {
    constructor() {
        this.widgets = [];
        this.widgetTypes = {
            weather: WeatherWidget,
            clock: ClockWidget,
            todo: TodoWidget,
            notes: NotesWidget,
            stocks: StocksWidget
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

// Base Widget Class
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

// Weather Widget
class WeatherWidget extends BaseWidget {
    getIcon() {
        return 'fas fa-cloud-sun';
    }

    getTitle() {
        return 'Weather';
    }

    getContentHTML() {
        return `
            <div class="weather-info">
                <div class="widget-loading">
                    <div class="spinner"></div>
                </div>
            </div>
        `;
    }

    async initialize() {
        const data = await this.loadData();
        this.location = data.location || 'New York';
        this.loadWeather();
    }

    async loadWeather() {
        const weatherInfo = this.element.querySelector('.weather-info');
        
        try {
            // Mock weather data (in real implementation, you'd use a weather API)
            const mockWeatherData = {
                temperature: Math.round(Math.random() * 30 + 10),
                description: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
                humidity: Math.round(Math.random() * 50 + 30),
                windSpeed: Math.round(Math.random() * 20 + 5)
            };

            weatherInfo.innerHTML = `
                <div class="weather-temp">${mockWeatherData.temperature}°C</div>
                <div class="weather-desc">${mockWeatherData.description}</div>
                <div class="weather-details">
                    <div class="weather-detail">
                        <i class="fas fa-tint"></i>
                        <div>Humidity: ${mockWeatherData.humidity}%</div>
                    </div>
                    <div class="weather-detail">
                        <i class="fas fa-wind"></i>
                        <div>Wind: ${mockWeatherData.windSpeed} km/h</div>
                    </div>
                </div>
            `;
        } catch (error) {
            weatherInfo.innerHTML = `
                <div class="widget-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load weather data</p>
                </div>
            `;
        }
    }

    openSettings() {
        const newLocation = prompt('Enter location:', this.location);
        if (newLocation) {
            this.location = newLocation;
            this.saveData({ location: this.location });
            this.loadWeather();
        }
    }
}

// Clock Widget
class ClockWidget extends BaseWidget {
    getIcon() {
        return 'fas fa-clock';
    }

    getTitle() {
        return 'Clock';
    }

    getContentHTML() {
        return `
            <div class="clock-time">--:--:--</div>
            <div class="clock-date">-- -- ----</div>
            <div class="clock-timezone">Local Time</div>
        `;
    }

    initialize() {
        this.updateClock();
        this.interval = setInterval(() => this.updateClock(), 1000);
    }

    updateClock() {
        const now = new Date();
        const timeElement = this.element.querySelector('.clock-time');
        const dateElement = this.element.querySelector('.clock-date');

        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        timeElement.textContent = timeString;
        dateElement.textContent = dateString;
    }
}

// Todo Widget
class TodoWidget extends BaseWidget {
    getIcon() {
        return 'fas fa-list-check';
    }

    getTitle() {
        return 'To-Do List';
    }

    getContentHTML() {
        return `
            <div class="todo-input">
                <input type="text" placeholder="Add a new task..." maxlength="100">
                <button class="todo-add-btn">Add</button>
            </div>
            <div class="todo-list"></div>
        `;
    }

    async initialize() {
        const data = await this.loadData();
        this.todos = data.todos || [];
        this.setupEventListeners();
        this.renderTodos();
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        const input = this.element.querySelector('.todo-input input');
        const addBtn = this.element.querySelector('.todo-add-btn');

        addBtn.addEventListener('click', () => this.addTodo());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
    }

    addTodo() {
        const input = this.element.querySelector('.todo-input input');
        const text = input.value.trim();
        
        if (text) {
            this.todos.push({
                id: Date.now(),
                text: text,
                completed: false
            });
            input.value = '';
            this.saveTodos();
            this.renderTodos();
        }
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.renderTodos();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.saveTodos();
        this.renderTodos();
    }

    renderTodos() {
        const list = this.element.querySelector('.todo-list');
        list.innerHTML = '';

        this.todos.forEach(todo => {
            const item = document.createElement('div');
            item.className = 'todo-item';
            item.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <button class="todo-delete">×</button>
            `;

            const checkbox = item.querySelector('.todo-checkbox');
            const deleteBtn = item.querySelector('.todo-delete');

            checkbox.addEventListener('change', () => this.toggleTodo(todo.id));
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));

            list.appendChild(item);
        });
    }

    async saveTodos() {
        await this.saveData({ todos: this.todos });
    }
}

// Notes Widget
class NotesWidget extends BaseWidget {
    getIcon() {
        return 'fas fa-sticky-note';
    }

    getTitle() {
        return 'Notes';
    }

    getContentHTML() {
        return `
            <textarea placeholder="Write your notes here..." rows="6"></textarea>
        `;
    }

    async initialize() {
        const data = await this.loadData();
        const textarea = this.element.querySelector('textarea');
        textarea.value = data.notes || '';
        
        textarea.addEventListener('input', () => {
            this.saveData({ notes: textarea.value });
        });
    }
}

// Stocks Widget
class StocksWidget extends BaseWidget {
    getIcon() {
        return 'fas fa-chart-line';
    }

    getTitle() {
        return 'Stocks';
    }

    getContentHTML() {
        return `
            <div class="stock-input">
                <input type="text" placeholder="Enter symbol (e.g., AAPL)" maxlength="10">
                <button class="stock-add-btn">Add</button>
            </div>
            <div class="stocks-list"></div>
        `;
    }

    async initialize() {
        const data = await this.loadData();
        this.stocks = data.stocks || [];
        this.setupEventListeners();
        this.renderStocks();
    }

    setupEventListeners() {
        super.setupEventListeners();
        
        const input = this.element.querySelector('.stock-input input');
        const addBtn = this.element.querySelector('.stock-add-btn');

        addBtn.addEventListener('click', () => this.addStock());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addStock();
        });
    }

    addStock() {
        const input = this.element.querySelector('.stock-input input');
        const symbol = input.value.trim().toUpperCase();
        
        if (symbol && !this.stocks.find(s => s.symbol === symbol)) {
            this.stocks.push({
                symbol: symbol,
                price: (Math.random() * 1000 + 10).toFixed(2),
                change: ((Math.random() - 0.5) * 20).toFixed(2)
            });
            input.value = '';
            this.saveStocks();
            this.renderStocks();
        }
    }

    deleteStock(symbol) {
        this.stocks = this.stocks.filter(s => s.symbol !== symbol);
        this.saveStocks();
        this.renderStocks();
    }

    renderStocks() {
        const list = this.element.querySelector('.stocks-list');
        list.innerHTML = '';

        this.stocks.forEach(stock => {
            const item = document.createElement('div');
            item.className = 'stock-item';
            const changeClass = parseFloat(stock.change) >= 0 ? 'positive' : 'negative';
            const changeSymbol = parseFloat(stock.change) >= 0 ? '+' : '';
            
            item.innerHTML = `
                <div class="stock-symbol">${stock.symbol}</div>
                <div class="stock-price">$${stock.price}</div>
                <div class="stock-change ${changeClass}">${changeSymbol}${stock.change}%</div>
                <button class="stock-delete">×</button>
            `;

            const deleteBtn = item.querySelector('.stock-delete');
            deleteBtn.addEventListener('click', () => this.deleteStock(stock.symbol));

            list.appendChild(item);
        });
    }

    async saveStocks() {
        await this.saveData({ stocks: this.stocks });
    }
}

// Initialize widget manager
window.widgetManager = new WidgetManager();
