// StocksWidget
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

window.WidgetClasses = window.WidgetClasses || {};
window.WidgetClasses.StocksWidget = StocksWidget;
