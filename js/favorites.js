// Favorites management
class FavoritesManager {
    constructor() {
        this.favorites = [];
    }

    async loadFavorites() {
        this.favorites = await Storage.getFavorites();
        this.renderFavorites();
    }

    async addFavorite(name, url, icon = '') {
        // Validate URL
        try {
            new URL(url);
        } catch {
            throw new Error('Invalid URL format');
        }

        // Check if already exists
        if (this.favorites.some(fav => fav.url === url)) {
            throw new Error('This site is already in your favorites');
        }

        const favorite = {
            id: Date.now(),
            name: name.trim(),
            url: url.trim(),
            icon: icon.trim() || this.getDefaultIcon(url),
            createdAt: new Date().toISOString()
        };

        this.favorites.push(favorite);
        await this.saveFavorites();
        this.renderFavorites();
        return favorite;
    }

    async removeFavorite(id) {
        this.favorites = this.favorites.filter(fav => fav.id !== id);
        await this.saveFavorites();
        this.renderFavorites();
    }

    async saveFavorites() {
        await Storage.setFavorites(this.favorites);
    }

    getDefaultIcon(url) {
        const domain = new URL(url).hostname.toLowerCase();
        
        // Common site icons
        const iconMap = {
            'google.com': 'fab fa-google',
            'youtube.com': 'fab fa-youtube',
            'facebook.com': 'fab fa-facebook',
            'twitter.com': 'fab fa-twitter',
            'instagram.com': 'fab fa-instagram',
            'linkedin.com': 'fab fa-linkedin',
            'github.com': 'fab fa-github',
            'stackoverflow.com': 'fab fa-stack-overflow',
            'reddit.com': 'fab fa-reddit',
            'wikipedia.org': 'fab fa-wikipedia-w',
            'amazon.com': 'fab fa-amazon',
            'ebay.com': 'fab fa-ebay',
            'paypal.com': 'fab fa-paypal',
            'spotify.com': 'fab fa-spotify',
            'netflix.com': 'fas fa-film',
            'twitch.tv': 'fab fa-twitch',
            'discord.com': 'fab fa-discord',
            'slack.com': 'fab fa-slack',
            'dropbox.com': 'fab fa-dropbox',
            'microsoft.com': 'fab fa-microsoft',
            'apple.com': 'fab fa-apple'
        };

        for (const [site, icon] of Object.entries(iconMap)) {
            if (domain.includes(site)) {
                return icon;
            }
        }

        // Category-based icons
        if (domain.includes('mail') || domain.includes('gmail')) {
            return 'fas fa-envelope';
        }
        if (domain.includes('news') || domain.includes('cnn') || domain.includes('bbc')) {
            return 'fas fa-newspaper';
        }
        if (domain.includes('shop') || domain.includes('store')) {
            return 'fas fa-shopping-cart';
        }
        if (domain.includes('bank') || domain.includes('finance')) {
            return 'fas fa-university';
        }
        if (domain.includes('weather')) {
            return 'fas fa-cloud-sun';
        }

        return 'fas fa-globe';
    }

    renderFavorites() {
        const container = document.getElementById('favorites-container');
        container.innerHTML = '';

        if (this.favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <p>No favorites yet. Add your favorite sites to get started!</p>
                </div>
            `;
            return;
        }

        this.favorites.forEach(favorite => {
            const item = document.createElement('a');
            item.className = 'favorite-item slide-in';
            item.href = favorite.url;
            item.target = '_blank';
            item.rel = 'noopener noreferrer';
            
            item.innerHTML = `
                <i class="${favorite.icon}"></i>
                <div class="name">${favorite.name}</div>
                <button class="delete-btn" title="Remove">×</button>
            `;

            const deleteBtn = item.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (confirm(`Remove "${favorite.name}" from favorites?`)) {
                    this.removeFavorite(favorite.id);
                }
            });

            container.appendChild(item);
        });
    }

    // Import favorites from bookmarks (if permission is granted)
    async importFromBookmarks() {
        try {
            // This would require additional permissions in manifest.json
            // chrome.bookmarks.getTree() etc.
            alert('Bookmark import feature requires additional permissions. This is a demo implementation.');
        } catch (error) {
            console.error('Failed to import bookmarks:', error);
            throw new Error('Failed to import bookmarks');
        }
    }

    // Export favorites
    exportFavorites() {
        const data = {
            favorites: this.favorites,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `favorites-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Import favorites from file
    async importFavorites(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!data.favorites || !Array.isArray(data.favorites)) {
                throw new Error('Invalid file format');
            }

            // Merge with existing favorites (avoid duplicates)
            const existingUrls = new Set(this.favorites.map(f => f.url));
            const newFavorites = data.favorites.filter(f => !existingUrls.has(f.url));
            
            this.favorites.push(...newFavorites);
            await this.saveFavorites();
            this.renderFavorites();
            
            return newFavorites.length;
        } catch (error) {
            console.error('Failed to import favorites:', error);
            throw new Error('Failed to import favorites: ' + error.message);
        }
    }
}

// Initialize favorites manager
window.favoritesManager = new FavoritesManager();
