#!/bin/bash

# JSON Formatter Launch Script (Universal)
# Works on any macOS/Linux machine with Node.js installed
# No hardcoded paths - fully dynamic

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located (works anywhere)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# ============================================================================
# EARLY SETUP: Load nvm if available (BEFORE functions)
# ============================================================================
# This ensures the correct Node version is available throughout the script
if [ -f "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    source "$NVM_DIR/nvm.sh" >/dev/null 2>&1 || true

    # Try to use .nvmrc if it exists in project
    if [ -f "$SCRIPT_DIR/.nvmrc" ]; then
        nvm use >/dev/null 2>&1 || true
    else
        # Use default or latest LTS
        nvm use default >/dev/null 2>&1 || nvm use --lts >/dev/null 2>&1 || true
    fi

    # Ensure PATH is properly set with the Node binary directory
    if command -v node >/dev/null 2>&1; then
        NODE_BIN=$(dirname "$(command -v node)")
        export PATH="$NODE_BIN:$PATH"
    fi
fi

# ============================================================================
# FUNCTION: Find npm command
# ============================================================================
find_npm() {
    # nvm is already loaded at the top of the script, so just check for npm

    # Check if npm is available after sourcing nvm
    if command -v npm >/dev/null 2>&1; then
        # Verify Node version is sufficient (16+)
        NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1)
        if [ -n "$NODE_VERSION" ] && [ "$NODE_VERSION" -ge 16 ]; then
            echo "npm"
            return 0
        fi
        # If version is too old, try to find a newer one
    fi

    # Try common npm locations for newer Node versions
    local npm_locations=(
        "$HOME/.nvm/versions/node/v[2-9][0-9]*/bin/npm"  # v20+, v19+, v18+, etc.
        "$HOME/.nvm/versions/node/v1[89]*/bin/npm"       # v18+, v19+
        "/opt/homebrew/bin/npm"                          # Homebrew Apple Silicon
        "/usr/local/bin/npm"                              # Homebrew Intel
        "/usr/bin/npm"                                    # System npm
    )

    for npm_pattern in "${npm_locations[@]}"; do
        # Expand glob pattern and sort in reverse to get highest version first
        for npm_path in $(ls -r $npm_pattern 2>/dev/null | head -1); do
            if [ -x "$npm_path" ]; then
                # Add this npm's directory to PATH
                NPM_DIR=$(dirname "$npm_path")
                export PATH="$NPM_DIR:$PATH"
                echo "$npm_path"
                return 0
            fi
        done
    done

    return 1
}

# ============================================================================
# FUNCTION: Check if Vite dev server is running
# ============================================================================
is_vite_running() {
    # Check if any process is running vite dev server
    if pgrep -f "vite" >/dev/null 2>&1; then
        return 0
    fi
    return 1
}

# ============================================================================
# FUNCTION: Find which port Vite is using
# ============================================================================
find_vite_port() {
    # Try common ports (5173, 5174, 5175, etc.)
    for port in {5173..5180}; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            # Check if it's a node process (likely Vite)
            local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null | head -1)
            if [ -n "$pid" ]; then
                local process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "")
                if [[ "$process_name" == *"node"* ]] || [[ "$process_name" == *"vite"* ]]; then
                    echo $port
                    return 0
                fi
            fi
        fi
    done
    return 1
}

# ============================================================================
# FUNCTION: Open URL in browser
# ============================================================================
open_browser() {
    local url=$1

    # Try different open commands based on OS
    if command -v open >/dev/null 2>&1; then
        # macOS
        open "$url" 2>/dev/null || true
    elif command -v xdg-open >/dev/null 2>&1; then
        # Linux
        xdg-open "$url" 2>/dev/null || true
    elif command -v wslview >/dev/null 2>&1; then
        # WSL
        wslview "$url" 2>/dev/null || true
    else
        # Fallback: just print the URL
        echo -e "${YELLOW}ℹ️  Could not auto-open browser${NC}"
        echo -e "${BLUE}   Please open: $url${NC}"
    fi
}

# ============================================================================
# MAIN SCRIPT
# ============================================================================

echo -e "${BLUE}🚀 JSON Formatter Launcher${NC}"
echo ""

# 1. Find npm
echo -e "${YELLOW}🔍 Finding npm...${NC}"
NPM_CMD=$(find_npm)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: npm not found!${NC}"
    echo ""
    echo "Please install Node.js:"
    echo "  • Homebrew: brew install node"
    echo "  • nvm: https://github.com/nvm-sh/nvm"
    echo "  • Official: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Found npm at: $NPM_CMD${NC}"

# 2. Check if server is already running
echo -e "${YELLOW}🔍 Checking for running server...${NC}"
if is_vite_running; then
    RUNNING_PORT=$(find_vite_port)
    if [ -n "$RUNNING_PORT" ]; then
        echo -e "${GREEN}✅ JSON Formatter is already running on port $RUNNING_PORT!${NC}"
        echo -e "${YELLOW}📖 Opening in browser...${NC}"
        open_browser "http://localhost:$RUNNING_PORT"
        echo ""
        echo -e "${BLUE}📝 URL: http://localhost:$RUNNING_PORT${NC}"
        exit 0
    fi
fi

# 3. Start the server
echo -e "${YELLOW}🚀 Starting development server...${NC}"

# Create temporary file for server output
TMP_LOG=$(mktemp)
trap "rm -f $TMP_LOG" EXIT

# Start server in background and capture output
"$NPM_CMD" run dev > "$TMP_LOG" 2>&1 &
SERVER_PID=$!

# 4. Wait for server to start and detect port
echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
PORT=""
MAX_WAIT=30  # Maximum 30 seconds
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    # Check if process is still running
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo -e "${RED}❌ Server process died unexpectedly!${NC}"
        echo -e "${YELLOW}Last output:${NC}"
        tail -20 "$TMP_LOG"
        exit 1
    fi

    # Try to find the port from Vite output
    if grep -q "Local:.*http://localhost:" "$TMP_LOG" 2>/dev/null; then
        PORT=$(grep "Local:.*http://localhost:" "$TMP_LOG" | grep -oE 'localhost:[0-9]+' | cut -d: -f2 | head -1)
        if [ -n "$PORT" ]; then
            break
        fi
    fi

    # Also try to detect by port scanning
    DETECTED_PORT=$(find_vite_port)
    if [ -n "$DETECTED_PORT" ]; then
        PORT=$DETECTED_PORT
        break
    fi

    sleep 0.5
    WAITED=$((WAITED + 1))
done

# 5. Check if we successfully detected the port
if [ -z "$PORT" ]; then
    echo -e "${RED}❌ Could not detect server port after ${MAX_WAIT} seconds${NC}"
    echo -e "${YELLOW}Server output:${NC}"
    cat "$TMP_LOG"
    echo ""
    echo -e "${YELLOW}The server might still be starting. Try checking manually:${NC}"
    echo -e "${BLUE}   http://localhost:5173${NC}"
    exit 1
fi

# 6. Success! Open browser
echo -e "${GREEN}✅ Server started successfully on port $PORT!${NC}"
sleep 1

echo -e "${YELLOW}📖 Opening in browser...${NC}"
open_browser "http://localhost:$PORT"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 JSON Formatter is running at:${NC}"
echo -e "${BLUE}   http://localhost:$PORT${NC}"
echo ""
echo -e "${YELLOW}🛑 To stop the server, run:${NC}"
echo -e "${YELLOW}   kill $SERVER_PID${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
