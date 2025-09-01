# Installation and Setup Guide

## Quick Start

### 1. Load the Extension in Chrome

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in your address bar, or
   - Go to Chrome menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to the `customizable-new-tab-extension` folder
   - Select the folder and click "Select Folder"

4. **Verify Installation**
   - You should see the extension listed with a colorful icon
   - The extension should be automatically enabled

### 2. Test Your New Tab

1. **Open a New Tab**
   - Press `Ctrl+T` (Windows/Linux) or `Cmd+T` (Mac)
   - You should see your new customizable dashboard instead of the default Chrome new tab

2. **First Time Setup**
   - The dashboard will appear with a welcome interface
   - Start by adding your first favorite site
   - Try adding a widget to see the functionality

## Detailed Setup

### Adding Your First Favorite

1. Click the "Add Site" button in the Quick Access section
2. Fill in the form:
   - **Site Name**: e.g., "Google"
   - **URL**: e.g., "https://www.google.com"
   - **Icon** (optional): e.g., "fab fa-google"
3. Click "Add Site"

### Adding Your First Widget

1. Click the "Add Widget" button in the Widgets section
2. Choose from available widgets:
   - **Weather**: Shows current weather (demo data)
   - **Clock**: Displays current time and date
   - **To-Do List**: Manage your daily tasks
   - **Notes**: Quick note-taking
   - **Stocks**: Track stock prices (demo data)

### Customizing the Appearance

1. Click the settings gear icon in the top-right
2. Try different themes:
   - Default (blue gradient)
   - Dark (dark mode)
   - Light (clean white)
   - Gradient (colorful)
3. Experiment with layouts:
   - Grid (organized)
   - Masonry (Pinterest-style)
   - Compact (space-efficient)

## Troubleshooting

### Extension Not Loading
- Make sure Developer mode is enabled
- Check that you selected the correct folder (should contain `manifest.json`)
- Look for error messages in the Extensions page

### New Tab Not Changing
- Refresh any open tabs after installing
- Try opening a completely new tab window
- Check if the extension is enabled in the Extensions page

### Widgets Not Working
- Some widgets use demo data for privacy
- Weather and Stocks widgets show randomized sample data
- Clock widget should work immediately
- To-do and Notes widgets store data locally

### Data Not Saving
- Make sure Chrome has permission to access storage
- Check if you're in incognito mode (data may not persist)
- Try refreshing the new tab page

## Advanced Configuration

### Custom Icons for Favorites
Use Font Awesome classes for custom icons:
- `fab fa-google` - Google logo
- `fab fa-youtube` - YouTube logo
- `fab fa-github` - GitHub logo
- `fas fa-envelope` - Email icon
- `fas fa-shopping-cart` - Shopping icon

### Custom Background Images
In settings, you can add a background image URL:
- Use high-quality images (1920x1080 or higher)
- Ensure the URL is publicly accessible
- HTTPS URLs are recommended

### Keyboard Shortcuts
- `F` - Add new favorite
- `W` - Add new widget  
- `S` - Open settings
- `T` - Cycle themes
- `ESC` - Close dialogs

## Next Steps

1. **Customize to Your Needs**
   - Add all your frequently visited sites
   - Choose widgets that match your workflow
   - Pick a theme you enjoy

2. **Explore Features**
   - Try drag-and-drop reordering (coming in future updates)
   - Experiment with different layouts
   - Use keyboard shortcuts for efficiency

3. **Share Feedback**
   - Report any issues you encounter
   - Suggest new widget types
   - Share your customization ideas

Enjoy your new personalized dashboard! 🎉
