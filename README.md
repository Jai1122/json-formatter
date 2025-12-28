# JSON Formatter & Editor

A fast, local JSON formatter and editor tool for macOS. Features a clean interface with tree view, text editor, diff comparison, and search capabilities. All processing happens client-side in your browser - your data never leaves your machine.

![JSON Formatter](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Privacy](https://img.shields.io/badge/privacy-100%25%20offline-brightgreen)

## Features

### Core Functionality
- ✨ **Format & Validate** - Pretty-print or minify JSON with validation
- 🔧 **Auto-Fix JSON** - Automatically fix common JSON errors (trailing commas, quotes, comments, etc.)
- 🌳 **Tree View** - Collapsible hierarchical view of JSON structure
- 📝 **Text Editor** - Monaco editor (VSCode's editor) with syntax highlighting
- 🔀 **Split View** - Side-by-side tree and text view
- 🔍 **Diff Comparison** - Compare two JSON files side-by-side
- 🔎 **Search & Filter** - Search through keys and values
- 📍 **JSON Path** - Display and copy JSON paths
- 💾 **File Operations** - Load from and save to files
- 📋 **Copy to Clipboard** - Quick copy of formatted JSON
- ⌨️ **Keyboard Shortcuts** - Fast workflow with hotkeys

### Privacy & Performance
- 🔒 **100% Offline** - No network calls, all processing happens locally
- 🚀 **Fast** - Handles JSON files up to 10MB smoothly
- 🎨 **Dark Theme** - Easy on the eyes for extended use
- 🖱️ **Drag & Drop** - Drag JSON files directly into the app

## Quick Start

### Prerequisites

You need Node.js installed. **Important**: This project requires Node.js v16 or higher.

Check your Node version:
```bash
node --version
```

If you have Node v14 or lower, please upgrade:
- **Via Homebrew**: `brew install node`
- **Via nvm**: `nvm install 18 && nvm use 18`
- **Download**: https://nodejs.org/

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd json-formatter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**

   The app will automatically open at `http://localhost:5173`

   If it doesn't open automatically, manually navigate to the URL shown in the terminal.

That's it! The app is now running locally on your machine.

## Usage Guide

### View Modes

#### Editor Mode
Pure text editor with syntax highlighting and validation.

#### Tree Mode
Expandable/collapsible tree view of JSON structure. Click nodes to see JSON paths. Use **Expand All** and **Collapse All** buttons for quick navigation.

#### Split Mode (Default)
Best of both worlds - tree view on the left, text editor on the right.

#### Diff Mode
Compare two JSON documents side-by-side. Perfect for spotting differences.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Format JSON |
| `Cmd/Ctrl + Shift + K` | Minify JSON |
| `Cmd/Ctrl + F` | Open search |
| `Cmd/Ctrl + S` | Reminder to use Save button |
| `Cmd/Ctrl + D` | Toggle Diff view |
| `Esc` | Close search panel |

### File Operations

**Load File**
- Click "Load" button and select a JSON file
- Or drag and drop a `.json` file anywhere in the app

**Save File**
- Click "Save" button to download current JSON
- Files are named with timestamp: `json-export-2024-01-15T10-30-45.json`

### Working with the Tree View

- Click the `▶` / `▼` icons to expand/collapse nodes
- Click on a node to see its JSON path in the toolbar
- Hover over nodes to see "Path" and "Copy" buttons
- **Path** button copies the JSON path (e.g., `$.users[0].name`)
- **Copy** button copies the node's value

### Search Feature

1. Click the "Search" button (bottom-right) or press `Cmd/Ctrl + F`
2. Type your search query
3. Matching nodes are highlighted in the tree view
4. Press `Esc` to close search

### Validation

- Invalid JSON is indicated with a red dot in the toolbar
- Error messages appear in notifications
- Monaco editor shows inline error markers

## Project Structure

```
json-formatter/
├── src/
│   ├── components/          # React components
│   │   ├── Editor.tsx       # Monaco-based text editor
│   │   ├── TreeView.tsx     # JSON tree visualization
│   │   ├── Toolbar.tsx      # Top toolbar with actions
│   │   ├── DiffView.tsx     # Side-by-side comparison
│   │   ├── SearchPanel.tsx  # Search UI
│   │   └── Notification.tsx # Toast notifications
│   ├── utils/               # Utility functions
│   │   ├── jsonParser.ts    # Validation, formatting
│   │   ├── jsonPath.ts      # JSON path generation
│   │   ├── jsonTree.ts      # Tree structure builder
│   │   └── fileSaver.ts     # File I/O operations
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # This file
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Monaco Editor** - VSCode's editor component
- **Tailwind CSS** - Utility-first styling
- **Node.js** - Local development server

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory. You can serve them with any static file server.

## Troubleshooting

### Node.js Version Issues

**Error**: `Unexpected token '||='` or similar syntax errors

**Solution**: Upgrade to Node.js v16 or higher
```bash
# Check version
node --version

# Upgrade via Homebrew
brew install node

# Or use nvm
nvm install 18
nvm use 18
```

### Port Already in Use

**Error**: `Port 5173 is already in use`

**Solution**: Kill the process using the port or change the port in `vite.config.ts`

```bash
# Find and kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Dependencies Installation Failed

**Error**: Issues during `npm install`

**Solution**: Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Monaco Editor Not Loading

**Error**: Blank editor area

**Solution**: Hard refresh your browser
- Chrome/Edge: `Cmd + Shift + R` (macOS) or `Ctrl + Shift + R` (Windows)
- Firefox: `Cmd + Shift + R` (macOS) or `Ctrl + F5` (Windows)
- Safari: `Cmd + Option + R`

## Performance Tips

- **Large Files**: For JSON files over 10MB, consider using Editor mode instead of Split view
- **Search**: Search is optimized for files up to 10MB
- **Browser**: Chrome and Edge provide the best performance with Monaco editor

## Privacy & Security

- ✅ All processing happens in your browser
- ✅ No data sent to any server
- ✅ No analytics or tracking
- ✅ No external API calls
- ✅ Files are processed entirely client-side

## Contributing

This is a local tool project. Feel free to fork and customize for your needs!

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `CLAUDE.md` for technical implementation details
3. Ensure you're using Node.js v16+

---

**Built with ❤️ for developers who value privacy and speed**
