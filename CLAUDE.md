# JSON Formatter - Claude Context File

This file provides comprehensive context for Claude (or other AI assistants) to understand and work with this codebase.

## Project Overview

**Name**: JSON Formatter & Editor
**Type**: Local web application
**Purpose**: Format, validate, and edit JSON files with a clean UI
**Privacy**: 100% offline, all processing happens client-side
**Target Platform**: macOS (but works on any modern browser)

## Architecture

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite (zero-config, fast HMR)
- **Editor**: Monaco Editor (VSCode's editor component)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)

### Design Philosophy
1. **Privacy First**: No network calls, all data processing is local
2. **Fast & Simple**: Minimal dependencies, instant load times
3. **User-Friendly**: Keyboard shortcuts, drag-and-drop, intuitive UI
4. **Offline**: Works completely without internet connection

## Project Structure

```
src/
├── components/           # React components (UI)
│   ├── Editor.tsx       # Monaco-based JSON text editor
│   ├── TreeView.tsx     # Collapsible tree visualization
│   ├── Toolbar.tsx      # Top action bar (format, save, etc.)
│   ├── DiffView.tsx     # Side-by-side JSON comparison
│   ├── SearchPanel.tsx  # Floating search UI
│   └── Notification.tsx # Toast notifications
├── utils/               # Pure functions (no React)
│   ├── jsonParser.ts    # Validate, format, minify JSON
│   ├── jsonPath.ts      # Generate JSON paths ($.foo.bar[0])
│   ├── jsonTree.ts      # Build tree structure from JSON
│   └── fileSaver.ts     # File I/O and clipboard operations
├── types/               # TypeScript type definitions
│   └── index.ts         # Shared types
├── App.tsx              # Main app component (state management)
├── main.tsx             # React entry point
└── index.css            # Global styles + Tailwind
```

## Key Components

### App.tsx
**Purpose**: Root component, manages global state and layout

**State**:
- `jsonContent` - Main JSON string being edited
- `diffLeftContent` / `diffRightContent` - JSON for diff comparison
- `viewMode` - Current view ('editor' | 'tree' | 'split' | 'diff')
- `currentPath` - JSON path of selected tree node
- `searchQuery` - Current search string
- `notification` - Toast notification state

**Key Features**:
- Keyboard shortcuts (Cmd+K format, Cmd+F search, etc.)
- Drag-and-drop file handling
- View mode switching
- Notification management

### Editor.tsx
**Purpose**: Monaco editor wrapper for JSON editing

**Props**:
- `value` - JSON string to edit
- `onChange` - Callback when content changes
- `readOnly` - Whether editor is read-only
- `onValidation` - Callback with validation results

**Features**:
- Real-time JSON validation
- Syntax highlighting
- Auto-formatting on paste
- Line numbers, folding, error markers

### TreeView.tsx
**Purpose**: Renders JSON as collapsible tree structure

**Props**:
- `jsonString` - JSON to visualize
- `onNodeClick` - Callback when node is clicked
- `searchQuery` - Highlight matching nodes

**Features**:
- Expand/collapse nodes
- Color-coded value types
- Copy path or value on hover
- Search highlighting
- JSON path display

### Toolbar.tsx
**Purpose**: Top action bar with all main actions

**Actions**:
- Load file (file picker)
- Save file (download)
- Format JSON (pretty-print)
- Minify JSON (compact)
- Copy to clipboard
- Clear content
- View mode toggles

### DiffView.tsx
**Purpose**: Side-by-side JSON comparison

**Layout**: Two Monaco editors side-by-side
**Features**: Independent editing, validation status for each side

### SearchPanel.tsx
**Purpose**: Floating search UI (bottom-right)

**Features**:
- Global keyboard shortcut (Cmd/Ctrl+F)
- Search in keys and values
- Result count
- ESC to close

## Utility Functions

### jsonParser.ts
- `validateJSON(jsonString)` - Returns validation result with error details
- `formatJSON(jsonString, indent)` - Pretty-prints JSON
- `minifyJSON(jsonString)` - Removes all whitespace
- `safeParseJSON(jsonString)` - Parse without throwing

### jsonPath.ts
- `generateJSONPath(pathArray)` - Converts `['users', 0, 'name']` to `$.users[0].name`
- `getValueAtPath(obj, pathArray)` - Retrieves value at path
- `escapePathSegment(segment)` - Escapes special characters

### jsonTree.ts
- `buildJSONTree(obj, key, path)` - Converts JSON object to tree structure
- `getType(value)` - Returns type string for display
- `formatValueForDisplay(value, type)` - Formats values for tree view
- `searchInTree(node, query, results)` - Searches tree nodes
- `toggleNodeExpansion(node, path)` - Toggles expand/collapse
- `expandAll(node)` / `collapseAll(node)` - Bulk expand/collapse

### fileSaver.ts
- `downloadFile(content, filename)` - Downloads content as file
- `readFileContent(file)` - Reads File object as string (Promise)
- `copyToClipboard(text)` - Copies to clipboard (with fallback)

## Type Definitions

```typescript
// types/index.ts

interface ValidationResult {
  isValid: boolean;
  error?: string;
  line?: number;
  column?: number;
}

interface JSONNode {
  key: string;           // Key name or array index
  value: any;            // The actual value
  type: string;          // 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array'
  path: string;          // JSON path ($.foo.bar)
  isExpanded?: boolean;  // Expand/collapse state
  children?: JSONNode[]; // Child nodes
}

type ViewMode = 'editor' | 'tree' | 'split' | 'diff';
```

## Keyboard Shortcuts

| Shortcut | Action | Implementation |
|----------|--------|----------------|
| Cmd/Ctrl + K | Format JSON | `App.tsx` event listener |
| Cmd/Ctrl + Shift + K | Minify JSON | `App.tsx` event listener |
| Cmd/Ctrl + F | Open search | `SearchPanel.tsx` event listener |
| Cmd/Ctrl + S | Save reminder | `App.tsx` event listener |
| Cmd/Ctrl + D | Toggle diff | `App.tsx` event listener |
| Esc | Close search | `SearchPanel.tsx` keydown handler |

## State Flow

1. **User loads JSON** (file picker or drag-drop)
   → `App.jsonContent` updated
   → Triggers re-render of Editor and TreeView

2. **User edits in Monaco**
   → `Editor.onChange` called
   → `App.jsonContent` updated
   → TreeView rebuilds from new content

3. **User clicks tree node**
   → `TreeView.onNodeClick` called
   → `App.currentPath` updated
   → Displayed in Toolbar

4. **User searches**
   → `SearchPanel.onSearch` called
   → `App.searchQuery` updated
   → TreeView highlights matching nodes

## Common Modification Patterns

### Adding a New Action Button

1. Add button to `Toolbar.tsx`
2. Create handler function
3. Pass callback via props if needed
4. Add keyboard shortcut in `App.tsx` if desired

Example:
```typescript
// In Toolbar.tsx
const handleNewAction = () => {
  // Your logic here
  onNotification('Action completed', 'success');
};

<button onClick={handleNewAction}>New Action</button>
```

### Adding a New View Mode

1. Add new mode to `ViewMode` type in `types/index.ts`
2. Add toggle button in `Toolbar.tsx`
3. Add rendering logic in `App.tsx`

Example:
```typescript
// types/index.ts
type ViewMode = 'editor' | 'tree' | 'split' | 'diff' | 'newmode';

// App.tsx
{viewMode === 'newmode' && (
  <YourNewComponent jsonString={jsonContent} />
)}
```

### Adding a New Utility Function

1. Create function in appropriate `utils/*.ts` file
2. Export function
3. Import in component where needed
4. Add TypeScript types if needed

Example:
```typescript
// utils/jsonParser.ts
export function sortJSON(jsonString: string): string {
  const parsed = JSON.parse(jsonString);
  const sorted = sortObjectKeys(parsed);
  return JSON.stringify(sorted, null, 2);
}
```

## Dependencies

### Production
- `react` / `react-dom` - UI framework
- `@monaco-editor/react` - Monaco editor wrapper
- `json-diff` - (Optional) For diff highlighting
- `lodash` - Utility functions

### Development
- `vite` - Build tool
- `@vitejs/plugin-react` - React plugin for Vite
- `typescript` - Type checking
- `tailwindcss` - CSS framework
- `postcss` / `autoprefixer` - CSS processing

## Build & Development

### Development
```bash
npm run dev          # Start dev server on localhost:5173
```

### Production
```bash
npm run build        # Build to dist/
npm run preview      # Preview production build
```

### Configuration Files
- `vite.config.ts` - Vite settings (port, plugins)
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS plugins

## Performance Considerations

### File Size Limits
- **Optimal**: < 100 KB
- **Recommended**: < 10 MB
- **Maximum**: ~50 MB (browser dependent)

### Optimization Strategies
1. Tree view auto-expands only first 2 levels
2. Monaco editor has virtualization built-in
3. Search debouncing could be added if needed
4. Large arrays show `[...] X items` instead of rendering all

## Known Limitations

1. **No Undo/Redo** - Monaco provides this, but state management doesn't persist across view changes
2. **No Real Diff Engine** - DiffView just shows two editors, doesn't highlight differences
3. **Search is Simple** - Case-insensitive string match only, no regex
4. **No Schema Validation** - Just JSON syntax validation

## Future Enhancement Ideas

1. **Undo/Redo Across Views** - Use history stack for `jsonContent`
2. **Advanced Diff** - Use `diff-match-patch` library for visual diff
3. **JSON Schema Support** - Validate against user-provided schemas
4. **Themes** - Light mode, custom Monaco themes
5. **Virtualized Tree** - For very large JSON files
6. **Export Formats** - CSV, XML, YAML conversion
7. **Bookmarks** - Save frequently used JSON snippets
8. **Multi-file Tabs** - Work with multiple JSON files

## Debugging Tips

### Check Console
All errors are logged to browser console. Open with:
- Chrome/Edge: `Cmd+Option+J` (Mac) or `F12` (Windows)
- Firefox: `Cmd+Option+K` (Mac) or `F12` (Windows)
- Safari: `Cmd+Option+C` (Mac)

### Monaco Not Loading
- Check network tab for failed requests
- Monaco loads from CDN by default
- Hard refresh: `Cmd+Shift+R`

### State Issues
Add logging in `App.tsx`:
```typescript
useEffect(() => {
  console.log('State changed:', { viewMode, jsonContent: jsonContent.slice(0, 100) });
}, [viewMode, jsonContent]);
```

### Tree Not Updating
Check if JSON is valid:
```typescript
try {
  JSON.parse(jsonContent);
  console.log('Valid JSON');
} catch (e) {
  console.error('Invalid JSON:', e);
}
```

## Testing

### Manual Testing Checklist
- [ ] Load JSON file via file picker
- [ ] Drag and drop JSON file
- [ ] Format valid JSON
- [ ] Try to format invalid JSON (should show error)
- [ ] Minify JSON
- [ ] Copy to clipboard
- [ ] Save/download JSON
- [ ] Switch between view modes
- [ ] Expand/collapse tree nodes
- [ ] Search in tree view
- [ ] Click tree node (path should appear in toolbar)
- [ ] Copy path from tree node
- [ ] Copy value from tree node
- [ ] Test all keyboard shortcuts
- [ ] Diff two JSON documents
- [ ] Load large JSON file (5-10 MB)

### Edge Cases to Test
- Empty JSON object: `{}`
- Empty JSON array: `[]`
- Null values
- Very long strings
- Deeply nested objects (10+ levels)
- Large arrays (1000+ items)
- Special characters in keys
- Unicode characters
- Numbers (integers, floats, scientific notation)

## Common Issues & Solutions

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
Check `tsconfig.json` settings, ensure strict mode is appropriate for your use case.

### Styling not applied
Ensure Tailwind is processing:
```bash
npm run dev
# Check browser console for CSS errors
```

### Monaco editor blank
- Check if CDN is accessible
- Hard refresh browser
- Check browser console for errors

## Code Style Guidelines

1. **Components**: PascalCase (e.g., `TreeView.tsx`)
2. **Utils**: camelCase (e.g., `jsonParser.ts`)
3. **Interfaces**: PascalCase (e.g., `ValidationResult`)
4. **Props**: Interface named `{Component}Props`
5. **Exports**: Use default export for components, named exports for utils
6. **Types**: Define in `types/index.ts` if shared across files

## When Modifying This Project

### Before Making Changes
1. Read this file thoroughly
2. Check `README.md` for user-facing features
3. Test current functionality to understand behavior
4. Check TypeScript types to understand data flow

### While Making Changes
1. Maintain TypeScript strict mode compliance
2. Test in browser after each significant change
3. Ensure no network calls are added (offline requirement)
4. Keep components focused and single-purpose

### After Making Changes
1. Update this file if architecture changes
2. Update `README.md` if user-facing features change
3. Test all keyboard shortcuts still work
4. Test with sample JSON files
5. Check browser console for errors

## Contact & Context

This project was built by Claude (AI assistant) based on these requirements:
- Local web app (runs on localhost)
- Clone and run from source
- Format, validate, edit JSON
- Tree view + text view + diff view
- Search and filter
- Strictly offline
- macOS-friendly (but cross-platform)
- Simple and fast

The code prioritizes clarity and maintainability over clever abstractions. Each component and utility should be self-contained and easy to understand.

---

**Last Updated**: December 2024
**Version**: 1.0.0
**AI Assistant**: Claude (Anthropic)
