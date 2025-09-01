// Favorites management
class FavoritesManager {
    constructor() {
        this.favorites = [];

        // Predefined quick-add sites
        this.quickSites = [
            { name: 'Google', url: 'https://www.google.com/' },
            { name: 'GitHub', url: 'https://www.github.com/' },
            { name: 'Facebook', url: 'https://www.facebook.com/' },
            { name: 'YouTube', url: 'https://www.youtube.com/' },
            { name: 'Twitter', url: 'https://www.twitter.com/' },
            { name: 'LinkedIn', url: 'https://www.linkedin.com/' },
            { name: 'Instagram', url: 'https://www.instagram.com/' },
            { name: 'Reddit', url: 'https://www.reddit.com/' },
            { name: 'Microsoft', url: 'https://www.microsoft.com/' },
            { name: 'Apple', url: 'https://www.apple.com/' },
            { name: 'Amazon', url: 'https://www.amazon.com/' },
            { name: 'Netflix', url: 'https://www.netflix.com/' },
            { name: 'Gmail', url: 'https://mail.google.com/' },
            { name: 'Drive', url: 'https://drive.google.com/' },
            { name: 'Dropbox', url: 'https://www.dropbox.com/' },
            { name: 'Wikipedia', url: 'https://www.wikipedia.org/' },
            { name: 'Stack Overflow', url: 'https://www.stackoverflow.com/' },
            { name: 'Hacker News', url: 'https://news.ycombinator.com/' },
            { name: 'PayPal', url: 'https://www.paypal.com/' },
            { name: 'Spotify', url: 'https://www.spotify.com/' },
            { name: 'Twitch', url: 'https://www.twitch.tv/' },
            { name: 'Medium', url: 'https://www.medium.com/' },
            { name: 'Cloudflare', url: 'https://www.cloudflare.com/' },
            { name: 'Office', url: 'https://www.office.com/' },
            { name: 'Google Accounts', url: 'https://accounts.google.com/signin' }
        ];
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

    async addFavoritesBulk(sites) {
        // sites: array of {name, url}
        const existingUrls = new Set(this.favorites.map(f => f.url));
        const added = [];

        for (const s of sites) {
            if (!s.url) continue;
            if (existingUrls.has(s.url)) continue;

            try {
                new URL(s.url);
            } catch {
                continue; // skip invalid URLs
            }

            const fav = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: (s.name || s.url).trim(),
                url: s.url.trim(),
                icon: this.getDefaultIcon(s.url),
                createdAt: new Date().toISOString()
            };

            this.favorites.push(fav);
            added.push(fav);
        }

        if (added.length > 0) {
            await this.saveFavorites();
            this.renderFavorites();
        }

        return added.length;
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

    // Render quick-add list inside modal
    renderQuickAddList() {
        const listContainer = document.getElementById('quick-add-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        this.quickSites.forEach((site, idx) => {
            const id = `quick-site-${idx}`;
            const item = document.createElement('label');
            item.className = 'quick-item';
            item.setAttribute('for', id);
            item.innerHTML = `
                <div class="left">
                    <input type="checkbox" data-url="${site.url}" data-name="${site.name}" id="${id}">
                    <div class="text">
                        <div class="quick-name">${site.name}</div>
                        <div class="quick-url">${site.url}</div>
                    </div>
                </div>
            `;
            listContainer.appendChild(item);
        });

        // Setup select all handler
        const selectAll = document.getElementById('select-all-quick');
        if (selectAll) {
            selectAll.checked = false;
            selectAll.addEventListener('change', (e) => {
                const checked = e.target.checked;
                listContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = checked);
            });
        }

        // Setup add selected button
        const addBtn = document.getElementById('add-selected-btn');
        if (addBtn) {
            addBtn.onclick = async () => {
                const checked = Array.from(listContainer.querySelectorAll('input[type="checkbox"]:checked'));
                if (checked.length === 0) {
                    alert('Please select at least one site to add.');
                    return;
                }

                const sites = checked.map(cb => ({ name: cb.dataset.name, url: cb.dataset.url }));
                try {
                    const addedCount = await this.addFavoritesBulk(sites);
                    alert(`Added ${addedCount} site(s) to favorites.`);

                    // Close modal
                    const modal = document.getElementById('add-favorite-modal');
                    modal && modal.classList.remove('active');
                    document.body.style.overflow = '';
                } catch (err) {
                    console.error('Bulk add failed:', err);
                    alert('Failed to add selected sites.');
                }
            };
        }

        // Cancel quick add
        const cancelQuick = document.getElementById('cancel-quick');
        if (cancelQuick) {
            cancelQuick.onclick = () => {
                const modal = document.getElementById('add-favorite-modal');
                modal && modal.classList.remove('active');
                document.body.style.overflow = '';
            };
        }
    }
}

// Initialize favorites manager
window.favoritesManager = new FavoritesManager();
