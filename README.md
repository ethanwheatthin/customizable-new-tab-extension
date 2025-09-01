# Customizable New Tab Chrome Extension

A powerful, fully customizable dashboard that replaces your default Chrome new tab page with a beautiful and functional workspace.

## Features

### 🔖 Quick Access Favorites
- Add your most visited websites with custom names and icons
- Drag-and-drop to reorder favorites
- Automatic icon detection for popular sites
- One-click access to your favorite pages

### 🧩 Customizable Widgets
- **Weather Widget**: Current weather and forecast for any location
- **Clock Widget**: Customizable time and date display
- **To-Do List**: Manage your daily tasks
- **Notes Widget**: Quick notes and reminders
- **Stocks Widget**: Track your favorite stocks and market data

### 🎨 Themes & Customization
- Multiple built-in themes (Default, Dark, Light, Gradient)
- Custom background image support
- Layout options (Grid, Masonry, Compact)
- Keyboard shortcuts for quick access
- Responsive design for all screen sizes

### ⚡ Performance & Features
- Fast loading and smooth animations
- Local data storage with Chrome sync
- Import/export favorites
- Keyboard shortcuts
- Accessible design
- No external API dependencies (widgets use mock data for demo)

## Installation

1. **Download the Extension**
   - Clone or download this repository
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension folder

2. **Pin the Extension**
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Customizable New Tab Dashboard" and click the pin icon

3. **Start Using**
   - Open a new tab to see your new dashboard
   - Begin customizing with favorites and widgets

## Usage Guide

### Adding Favorites
1. Click the "Add Site" button
2. Enter the site name and URL
3. Optionally add a Font Awesome icon class
4. Click "Add Site" to save

### Adding Widgets
1. Click the "Add Widget" button
2. Choose from available widget types
3. Configure widget settings as needed
4. Widgets will auto-save their data

### Customizing Appearance
1. Click the settings gear icon
2. Choose your preferred theme
3. Select a layout style
4. Add a custom background image URL if desired
5. Save your changes

### Keyboard Shortcuts
- `F` - Add new favorite
- `W` - Add new widget
- `S` - Open settings
- `T` - Cycle through themes
- `ESC` - Close modals

## Technical Details

### File Structure
```
customizable-new-tab-extension/
├── manifest.json          # Extension configuration
├── newtab.html            # Main dashboard HTML
├── styles/
│   ├── main.css          # Core dashboard styles
│   ├── widgets.css       # Widget-specific styles
│   └── themes.css        # Theme and layout styles
├── js/
│   ├── main.js           # Main application logic
│   ├── storage.js        # Chrome storage utilities
│   ├── favorites.js      # Favorites management
│   ├── widgets.js        # Widget system
│   └── themes.js         # Theme management
└── icons/                # Extension icons
```

### Data Storage
- Uses Chrome's `chrome.storage.sync` API
- Data syncs across Chrome installations
- Automatic backup and restore
- No external servers required

### Browser Compatibility
- Chrome (Manifest V3)
- Chromium-based browsers
- Requires Chrome 88+ for full functionality

## Development

### Setting Up Development Environment
1. Clone the repository
2. Make your changes
3. Load the unpacked extension in Chrome
4. Test your modifications

### Adding New Widget Types
1. Create a new widget class extending `BaseWidget` in `js/widgets.js`
2. Implement required methods (`getIcon`, `getTitle`, `getContentHTML`, `initialize`)
3. Add the widget type to the `WidgetManager.widgetTypes` object
4. Add UI for the new widget in the add widget modal

### Customizing Themes
1. Add new theme styles in `styles/themes.css`
2. Update the theme selector in the settings modal
3. Add theme handling in `js/themes.js`

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

### Guidelines
- Follow the existing code style
- Test thoroughly in Chrome
- Update documentation as needed
- Ensure accessibility compliance

## Privacy & Security

- No data is sent to external servers
- All data stored locally using Chrome's storage API
- No tracking or analytics
- Open source and auditable

## License

MIT License - feel free to use, modify, and distribute as needed.

## Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check the Chrome Web Store listing for updates
- Review the documentation above

---

**Enjoy your new customizable dashboard!** 🚀
