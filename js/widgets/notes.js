// NotesWidget
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

window.WidgetClasses = window.WidgetClasses || {};
window.WidgetClasses.NotesWidget = NotesWidget;
