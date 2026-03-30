# Quick Launch Guide - JSON Formatter

This guide shows you how to launch JSON Formatter quickly without typing commands.

## 🚀 Quick Start

### Option 1: Simple Command (Easiest)

Just run:
```bash
npm start
```

Or double-click `launch.sh` in Finder!

---

## ⌨️ Setup Keyboard Shortcut (Recommended)

Choose one of these methods to bind a global keyboard shortcut (e.g., `Cmd+Shift+J`) to launch JSON Formatter:

### Method A: Using Automator (Built-in macOS) ⭐ RECOMMENDED

**Step 1: Create Quick Action**
1. Open **Automator** (Applications → Utilities → Automator)
2. Click **New Document**
3. Select **Quick Action** and click **Choose**

**Step 2: Configure Workflow**
1. Set "Workflow receives" to: **no input**
2. Set "in" to: **any application**
3. Search for "Run Shell Script" in the left panel
4. Drag **Run Shell Script** to the right panel
5. Paste this script:

```bash
#!/bin/bash
cd /path/to/json-formatter
sh launch.sh
```

**Important**: Replace `/path/to/json-formatter` with your actual project path.

6. Save as: **Launch JSON Formatter** (File → Save)

**Step 3: Assign Keyboard Shortcut**
1. Open **System Settings** → **Keyboard** → **Keyboard Shortcuts**
2. Click **Services** (or **App Shortcuts** on newer macOS)
3. Scroll down to **General** section
4. Find **Launch JSON Formatter**
5. Click **Add Shortcut** and press: `Cmd+Shift+J` (or your preferred shortcut)
6. Click **Done**

**✅ Done!** Now press `Cmd+Shift+J` from anywhere to launch JSON Formatter!

---

### Method B: Using Alfred (If you have Alfred Powerpack)

**Step 1: Create Workflow**
1. Open Alfred Preferences
2. Go to **Workflows** tab
3. Click **+** → **Blank Workflow**
4. Name it: "Launch JSON Formatter"

**Step 2: Add Hotkey Trigger**
1. Click **+** → **Triggers** → **Hotkey**
2. Press your desired shortcut (e.g., `Cmd+Shift+J`)
3. Click **Save**

**Step 3: Add Run Script Action**
1. Click **+** → **Actions** → **Run Script**
2. Set Language to: `/bin/bash`
3. Paste this script:

```bash
cd /path/to/json-formatter
sh launch.sh
```

**Important**: Replace `/path/to/json-formatter` with your actual project path.

4. Click **Save**

**Step 4: Connect**
1. Drag a connection line from Hotkey to Run Script
2. Close the workflow editor

**✅ Done!** Press `Cmd+Shift+J` to launch!

---

### Method C: Using Raycast (If you have Raycast)

**Step 1: Create Script Command**
1. Open Raycast
2. Type: "Create Script Command"
3. Choose location (e.g., `~/scripts`)
4. Select **No Template**

**Step 2: Create the Script**
Create file: `launch-json-formatter.sh`

```bash
#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Launch JSON Formatter
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 📝
# @raycast.packageName Developer Tools

cd /path/to/json-formatter
sh launch.sh

# Replace /path/to/json-formatter with your actual project path
```

**Step 3: Make Executable**
```bash
chmod +x ~/scripts/launch-json-formatter.sh
```

**Step 4: Assign Hotkey**
1. Open Raycast
2. Type: "Launch JSON Formatter"
3. Press `Cmd+K` → **Assign Hotkey**
4. Press your desired shortcut (e.g., `Cmd+Shift+J`)

**✅ Done!** Press `Cmd+Shift+J` to launch!

---

### Method D: Using BetterTouchTool (If you have BTT)

**Step 1: Add Keyboard Shortcut**
1. Open BetterTouchTool
2. Select **Keyboard** tab
3. Click **+ Add New Shortcut**
4. Press your desired key combination (e.g., `Cmd+Shift+J`)

**Step 2: Add Action**
1. Under "Attached Actions", click **+ Add Action**
2. Search for: **Execute Terminal Command**
3. Paste this command:

```bash
cd /path/to/json-formatter && sh launch.sh
```

**Important**: Replace `/path/to/json-formatter` with your actual project path.

4. Check **"Run in background"**
5. Click **Save**

**✅ Done!** Press `Cmd+Shift+J` to launch!

---

## 🎯 Alternative: Add to Dock for Quick Access

1. Open **Automator** and create an **Application** (not Quick Action)
2. Add **Run Shell Script** action with:
   ```bash
   cd /path/to/json-formatter
   sh launch.sh
   ```
   **Important**: Replace `/path/to/json-formatter` with your actual project path.
3. Save as: **JSON Formatter.app** in Applications folder
4. Drag **JSON Formatter.app** to your Dock
5. Click the Dock icon to launch!

---

## 📱 Add to Spotlight/LaunchPad

After creating the Automator app above:
1. The app will appear in Spotlight search
2. Just press `Cmd+Space` and type "JSON Formatter"
3. Press Enter to launch!

---

## 🔧 Troubleshooting

### Script doesn't run
- Make sure `launch.sh` is executable: `chmod +x launch.sh`
- Check the path in the script matches your actual path

### Browser doesn't open
- Run `./launch.sh` manually to see error messages
- Check if port 5173 is already in use: `lsof -i :5173`

### Node version issues
- Update the PATH in `launch.sh` to match your Node.js location
- Find your Node path: `which node`

---

## 💡 Tips

**Check if server is running:**
```bash
lsof -i :5173
```

**Stop the server:**
```bash
# Find the process ID
lsof -i :5173
# Kill it
kill <PID>
```

**Or use pkill:**
```bash
pkill -f "vite"
```

**Restart server:**
Just run `npm start` or `./launch.sh` again - it will detect if already running!

---

## ✅ Summary

**Fastest method**: Use Automator (Method A) - built into macOS, no extra software needed!

**Most powerful**: Alfred/Raycast if you already use them

**Simplest**: Just run `npm start` when needed

Choose whichever method works best for your workflow!
