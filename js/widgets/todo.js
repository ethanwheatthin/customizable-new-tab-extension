// TodoWidget
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

window.WidgetClasses = window.WidgetClasses || {};
window.WidgetClasses.TodoWidget = TodoWidget;
