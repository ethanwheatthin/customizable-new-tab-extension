// RSS Reader Widget
class RssWidget extends BaseWidget {
    getIcon() {
        return 'fas fa-rss';
    }

    getTitle() {
        return 'RSS Reader';
    }

    getContentHTML() {
        return `
            <div class="rss-controls">
                <div class="rss-config">
                    <input class="rss-url-input" type="text" placeholder="Enter feed URL..." maxlength="1024">
                    <button class="rss-load-btn">Load</button>
                </div>
            </div>
            <div class="rss-content">
                <div class="widget-loading">
                    <div class="spinner"></div>
                </div>
            </div>
        `;
    }

    async initialize() {
        const data = await this.loadData();
        this.feedUrl = data.feedUrl || '';

        const input = this.element.querySelector('.rss-url-input');
        const loadBtn = this.element.querySelector('.rss-load-btn');

        if (this.feedUrl) input.value = this.feedUrl;

        loadBtn.addEventListener('click', () => {
            const url = input.value.trim();
            if (url) {
                this.feedUrl = url;
                this.saveData({ feedUrl: this.feedUrl });
                this.loadFeed();
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loadBtn.click();
        });

        // Initial load
        this.loadFeed();
    }

    async loadFeed() {
        const content = this.element.querySelector('.rss-content');
        content.innerHTML = `<div class="widget-loading"><div class="spinner"></div></div>`;

        if (!this.feedUrl) {
            content.innerHTML = `<div class="widget-error"><p>No feed configured. Paste a feed URL above and click Load or use Settings.</p></div>`;
            return;
        }

        try {
            const res = await fetch(this.feedUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const text = await res.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'application/xml');

            if (doc.querySelector('parsererror')) throw new Error('Failed to parse feed XML');

            let items = Array.from(doc.querySelectorAll('item'));
            if (items.length === 0) items = Array.from(doc.querySelectorAll('entry')); // Atom support

            const feedItems = items.slice(0, 8).map(item => {
                const titleNode = item.querySelector('title');
                const linkNode = item.querySelector('link');
                const descriptionNode = item.querySelector('description') || item.querySelector('summary') || item.querySelector('content');
                const pubDateNode = item.querySelector('pubDate') || item.querySelector('updated') || item.querySelector('published');

                const title = titleNode ? titleNode.textContent.trim() : 'No title';
                let link = '#';
                if (linkNode) {
                    // Atom link may be an href attribute
                    link = linkNode.getAttribute && linkNode.getAttribute('href') ? linkNode.getAttribute('href') : (linkNode.textContent || '#');
                }
                const pubDate = pubDateNode ? pubDateNode.textContent.trim() : '';
                const description = descriptionNode ? descriptionNode.textContent.trim() : '';

                return { title, link, pubDate, description };
            });

            if (feedItems.length === 0) {
                content.innerHTML = `<div class="widget-error"><p>No feed entries found.</p></div>`;
                return;
            }

            const list = document.createElement('div');
            list.className = 'rss-list';

            feedItems.forEach(f => {
                const itemEl = document.createElement('div');
                itemEl.className = 'rss-item';

                const titleEl = document.createElement('a');
                titleEl.href = f.link || '#';
                titleEl.target = '_blank';
                titleEl.rel = 'noopener noreferrer';
                titleEl.textContent = f.title;

                const meta = document.createElement('div');
                meta.className = 'rss-meta';
                try {
                    meta.textContent = f.pubDate ? new Date(f.pubDate).toLocaleString() : '';
                } catch (e) {
                    meta.textContent = f.pubDate || '';
                }

                const desc = document.createElement('div');
                desc.className = 'rss-desc';
                desc.textContent = f.description ? f.description.replace(/\s+/g, ' ').trim() : '';

                itemEl.appendChild(titleEl);
                if (meta.textContent) itemEl.appendChild(meta);
                if (desc.textContent) itemEl.appendChild(desc);

                list.appendChild(itemEl);
            });

            content.innerHTML = '';
            content.appendChild(list);
        } catch (err) {
            console.error('RSS load error', err);
            content.innerHTML = `<div class="widget-error"><i class="fas fa-exclamation-triangle"></i><p>Failed to load feed (${err.message}). CORS may block some feeds. Try a CORS-enabled feed or use a proxy.</p></div>`;
        }
    }

    openSettings() {
        const url = prompt('Enter RSS/Atom feed URL:', this.feedUrl || '');
        if (url !== null) {
            this.feedUrl = url.trim();
            this.saveData({ feedUrl: this.feedUrl });
            const input = this.element.querySelector('.rss-url-input');
            if (input) input.value = this.feedUrl;
            this.loadFeed();
        }
    }
}

window.WidgetClasses = window.WidgetClasses || {};
window.WidgetClasses.RssWidget = RssWidget;
