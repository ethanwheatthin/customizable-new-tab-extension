// Favorites management
class FavoritesManager {
    constructor() {
        this.favorites = [];
        this.groups = [];

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

        // Bind modal elements for group editing
        document.addEventListener('DOMContentLoaded', () => {
            this.groupModal = document.getElementById('edit-group-modal');
            this.groupForm = document.getElementById('group-form');
            this.groupIdInput = document.getElementById('group-id');
            this.groupNameInput = document.getElementById('group-name');
            this.groupColorInput = document.getElementById('group-color');
            this.randomizeColorBtn = document.getElementById('randomize-color');
            this.deleteGroupBtn = document.getElementById('delete-group');

            // Wire up form
            this.groupForm?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGroupFromModal();
            });

            this.randomizeColorBtn?.addEventListener('click', () => {
                this.groupColorInput.value = this.randomColor();
            });

            // Cancel buttons inside modal
            const cancels = Array.from(this.groupModal?.querySelectorAll('.close-btn-cancel') || []);
            cancels.forEach(btn => btn.addEventListener('click', () => this.closeGroupModal()));

            // Close X button
            const xs = Array.from(this.groupModal?.querySelectorAll('.close-btn') || []);
            xs.forEach(btn => btn.addEventListener('click', () => this.closeGroupModal()));

            this.deleteGroupBtn?.addEventListener('click', () => {
                const id = this.groupIdInput.value;
                if (id && confirm('Delete this group? Favorites will be moved to the default group.')) {
                    this.removeGroup(Number(id));
                    this.closeGroupModal();
                }
            });
        });
    }

    async loadFavorites() {
        this.favorites = await Storage.getFavorites();
        this.groups = await Storage.getGroups();

        // Assign any favorites missing groupId to the default group
        const defaultId = this.groups[0].id;
        this.favorites = (this.favorites || []).map(f => ({ ...f, groupId: f.groupId || defaultId }));

        await this.saveFavorites();
        this.renderFavorites();
        this.renderQuickAccess();
    }

    async addFavorite(name, url, icon = '', groupId = null) {
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

        const assignedGroup = groupId || (this.groups && this.groups[0] && this.groups[0].id) || null;

        const favorite = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            name: name.trim(),
            url: url.trim(),
            icon: icon.trim() || this.getDefaultIcon(url),
            groupId: assignedGroup,
            createdAt: new Date().toISOString()
        };

        this.favorites.push(favorite);
        await this.saveFavorites();
        this.renderFavorites();
        return favorite;
    }

    async addFavoritesBulk(sites, groupId = null) {
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
                groupId: groupId || (this.groups && this.groups[0] && this.groups[0].id),
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
        await Storage.setFavorites(this.favorites || []);
    }

    // Provide a sensible default icon class for a site URL
    getDefaultIcon(url) {
        try {
            const domain = new URL(url).hostname.toLowerCase();

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
                if (domain.includes(site)) return icon;
            }

            if (domain.includes('mail') || domain.includes('gmail')) return 'fas fa-envelope';
            if (domain.includes('news') || domain.includes('cnn') || domain.includes('bbc')) return 'fas fa-newspaper';
            if (domain.includes('shop') || domain.includes('store') || domain.includes('cart')) return 'fas fa-shopping-cart';
            if (domain.includes('bank') || domain.includes('finance')) return 'fas fa-university';
            if (domain.includes('weather')) return 'fas fa-cloud-sun';

            return 'fas fa-globe';
        } catch (e) {
            return 'fas fa-globe';
        }
    }

    // Group management
    _makeGroup(name, color = null, isDefault = false) {
        return {
            id: Date.now() + Math.floor(Math.random() * 1000) + (isDefault ? 0 : Math.floor(Math.random() * 1000)),
            name: name || 'Group',
            color: color || this.randomColor(),
            isDefault: !!isDefault
        };
    }

    randomColor() {
        // pastel random color
        const h = Math.floor(Math.random() * 360);
        const s = 60 + Math.floor(Math.random() * 10);
        const l = 65 + Math.floor(Math.random() * 5);
        return `hsl(${h} ${s}% ${l}%)`;
    }

    async createGroup(name = 'New Group', color = null) {
        const group = this._makeGroup(name, color || this.randomColor());
        this.groups.push(group);
        await Storage.setGroups(this.groups);
        this.renderFavorites();
        return group;
    }

    async editGroup(id, updates = {}) {
        const g = this.groups.find(x => x.id === id);
        if (!g) return null;
        Object.assign(g, updates);
        await Storage.setGroups(this.groups);
        this.renderFavorites();
        return g;
    }

    async removeGroup(id) {
        // Ensure at least one group remains
        // if (this.groups.length <= 1) {
        //     alert('Cannot remove the last group');
        //     return false;
        // }

        // Move favorites to the first group
        const target = this.groups[0].id === id ? (this.groups[1] && this.groups[1].id) : this.groups[0].id;
        this.favorites.forEach(f => { if (f.groupId === id) f.groupId = target; });

        this.groups = this.groups.filter(g => g.id !== id);
        await Storage.setGroups(this.groups);
        await this.saveFavorites();
        this.renderFavorites();
        return true;
    }

    // Render grouped favorites
    renderFavorites() {
        const container = document.getElementById('favorites-container');
        if (!container) return;
        container.innerHTML = '';

        // Controls: if there are no favorites and no groups
        if ((!this.favorites || this.favorites.length === 0) && this.groups.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"></i>
                    <p>No favorites yet. Add your favorite sites to get started!</p>
                </div>
            `;
            return;
        }

        // Render each custom (non-default) group as a column.
        // Do NOT render the default 'Ungrouped' column. Only show group columns
        // if the user has added custom groups.
        const groupsToRender = (this.groups || []).filter(g => !g.isDefault).filter(g => g.name !== "Ungrouped");
        groupsToRender.forEach(group => {
            const groupEl = document.createElement('div');
            groupEl.className = 'favorite-group';
            groupEl.dataset.groupId = group.id;

            const header = document.createElement('div');
            header.className = 'favorite-group-header';
            header.innerHTML = `
                <div class="group-title">
                    <span class="group-color" style="background:${group.color}"></span>
                    <span class="group-name">${group.name}</span>
                </div>
                <div class="group-actions">
                    <button class="edit-group-btn" title="Edit Group"><i class="fas fa-pen"></i></button>
                </div>
            `;

            const list = document.createElement('div');
            list.className = 'favorite-group-list';
            list.dataset.groupId = group.id;

            // Drop handlers for group
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drag-over');
            });
            list.addEventListener('dragleave', () => list.classList.remove('drag-over'));
            list.addEventListener('drop', async (e) => {
                e.preventDefault();
                list.classList.remove('drag-over');
                const id = Number(e.dataTransfer.getData('text/plain'));
                const fav = this.favorites.find(f => f.id === id);
                if (!fav) return;
                fav.groupId = group.id;
                await this.saveFavorites();
                this.renderFavorites();
                this.renderQuickAccess();
            });

            // Populate favorites in this group
            const favs = (this.favorites || []).filter(f => f.groupId === group.id);
            if (favs.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'group-empty';
                empty.textContent = 'No sites yet';
                list.appendChild(empty);
            }

            favs.forEach(favorite => {
                const item = document.createElement('a');
                item.className = 'favorite-item';
                item.href = favorite.url;
                item.target = '_blank';
                item.rel = 'noopener noreferrer';
                item.draggable = true;
                item.dataset.id = favorite.id;

                item.innerHTML = `
                    <i class="${favorite.icon}"></i>
                    <div class="name">${favorite.name}</div>
                    <button class="delete-btn" title="Remove">×</button>
                `;

                // Drag handlers
                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', String(favorite.id));
                    e.dataTransfer.effectAllowed = 'move';
                    item.classList.add('dragging');
                });
                item.addEventListener('dragend', () => item.classList.remove('dragging'));

                const deleteBtn = item.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.removeFavorite(favorite.id);
                    this.renderQuickAccess();
                });

                list.appendChild(item);
            });

            // Wire edit group button
            header.querySelector('.edit-group-btn')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.openGroupModal(group.id);
            });

            groupEl.appendChild(header);
            groupEl.appendChild(list);
            container.appendChild(groupEl);
        });

        // Update the group select in add favorite form
        this._populateGroupSelect();

        // Wire add-group button (idempotent)
        const addGroupBtn = document.getElementById('add-group-btn');
        if (addGroupBtn && !addGroupBtn._wired) {
            addGroupBtn._wired = true;
            addGroupBtn.addEventListener('click', async () => {
                const newGroup = await this.createGroup('New Group');
                this.openGroupModal(newGroup.id);
            });
        }

        // Ensure quick access is updated
        this.renderQuickAccess();
    }

    // Render quick-access row
    renderQuickAccess() {
        const quickContainer = document.getElementById('quick-access-list');
        if (!quickContainer) return;
        quickContainer.innerHTML = '';

        // Quick access shows favorites that are specially marked or belong to default group
        const defaultGroupId = this.groups && this.groups[0] && this.groups[0].id;
        const quickFavorites = (this.favorites || []).filter(f => !f.groupId || f.groupId === defaultGroupId);

        quickFavorites.forEach(favorite => {
            const item = document.createElement('a');
            item.className = 'favorite-item quick';
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
                this.removeFavorite(favorite.id);
                this.renderFavorites();
            });

            quickContainer.appendChild(item);
        });
    }

    _populateGroupSelect() {
        const sel = document.getElementById('site-group');
        if (!sel) return;
        sel.innerHTML = '';
        this.groups.forEach(g => {
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.textContent = g.name;
            sel.appendChild(opt);
        });
    }

    // Group modal helpers
    openGroupModal(groupId) {
        const g = this.groups.find(x => x.id === groupId);
        if (!g) return;
        this.groupIdInput.value = String(g.id);
        this.groupNameInput.value = g.name;
        // Use hex if possible, otherwise set to empty and rely on color input fallback
        this.groupColorInput.value = this._toHex(g.color) || '#667eea';
        this.groupModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeGroupModal() {
        this.groupModal.classList.remove('active');
        document.body.style.overflow = '';
        this.groupForm.reset();
    }

    async saveGroupFromModal() {
        const id = Number(this.groupIdInput.value);
        const name = this.groupNameInput.value.trim() || 'Group';
        const color = this.groupColorInput.value;
        await this.editGroup(id, { name, color });
        this.closeGroupModal();
    }

    _toHex(color) {
        // If already a hex color return it; if hsl(), convert roughly to hex by creating a temp element
        if (!color) return null;
        if (color.startsWith('#')) return color;
        try {
            const ctx = document.createElement('canvas').getContext('2d');
            ctx.fillStyle = color;
            return ctx.fillStyle;
        } catch {
            return null;
        }
    }

    // Import favorites from bookmarks (if permission is granted)
    async importFromBookmarks() {
        try {
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
            groups: this.groups,
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
            // Merge groups if provided
            if (Array.isArray(data.groups)) {
                // Avoid duplicate group ids; if conflict, generate new id
                const existingGroupIds = new Set(this.groups.map(g => g.id));
                data.groups.forEach(g => {
                    if (!existingGroupIds.has(g.id)) this.groups.push(g);
                    else {
                        // remap group id on imported favorites to a created group
                        const newG = this._makeGroup(g.name, g.color);
                        this.groups.push(newG);
                        this.favorites.forEach(f => { if (f.groupId === g.id) f.groupId = newG.id; });
                    }
                });
            }

            await Storage.setGroups(this.groups);
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
                    const groupSelect = document.getElementById('site-group');
                    const groupId = groupSelect && groupSelect.value ? Number(groupSelect.value) : null;

                    const addedCount = await this.addFavoritesBulk(sites, groupId);
                    alert(`Added ${addedCount} site(s) to favorites.`);

                    // Clear selections
                    listContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                    const selectAllBox = document.getElementById('select-all-quick');
                    if (selectAllBox) selectAllBox.checked = false;

                    // Refresh UI
                    this.renderQuickAccess();
                    this.renderFavorites();

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
