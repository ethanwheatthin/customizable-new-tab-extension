// ClockWidget
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

window.WidgetClasses = window.WidgetClasses || {};
window.WidgetClasses.ClockWidget = ClockWidget;
