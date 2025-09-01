// Storage utility functions
class Storage {
    static async get(key, defaultValue = null) {
        try {
            const result = await chrome.storage.sync.get([key]);
            return result[key] !== undefined ? result[key] : defaultValue;
        } catch (error) {
            console.error('Error getting storage:', error);
            return defaultValue;
        }
    }

    static async set(key, value) {
        try {
            await chrome.storage.sync.set({ [key]: value });
            return true;
        } catch (error) {
            console.error('Error setting storage:', error);
            return false;
        }
    }

    static async remove(key) {
        try {
            await chrome.storage.sync.remove([key]);
            return true;
        } catch (error) {
            console.error('Error removing storage:', error);
            return false;
        }
    }

    static async clear() {
        try {
            await chrome.storage.sync.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    // Get all data
    static async getAll() {
        try {
            const result = await chrome.storage.sync.get(null);
            return result;
        } catch (error) {
            console.error('Error getting all storage:', error);
            return {};
        }
    }

    // Specific getter/setter methods for common data
    static async getFavorites() {
        return await this.get('favorites', []);
    }

    static async setFavorites(favorites) {
        return await this.set('favorites', favorites);
    }

    static async getWidgets() {
        return await this.get('widgets', []);
    }

    static async setWidgets(widgets) {
        return await this.set('widgets', widgets);
    }

    static async getSettings() {
        return await this.get('settings', {
            theme: 'default',
            layout: 'grid',
            backgroundImage: '',
            dashboardTitle: 'My Dashboard'
        });
    }

    static async setSettings(settings) {
        return await this.set('settings', settings);
    }

    static async getGroups() {
        return await this.get('groups', []);
    }

    static async setGroups(groups) {
        return await this.set('groups', groups);
    }

    static async getWidgetData(widgetId) {
        return await this.get(`widget_${widgetId}`, {});
    }

    static async setWidgetData(widgetId, data) {
        return await this.set(`widget_${widgetId}`, data);
    }
}

// Export for use in other files
window.Storage = Storage;
