// WeatherWidget (extracted)
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

window.WidgetClasses = window.WidgetClasses || {};
window.WidgetClasses.WeatherWidget = WeatherWidget;
