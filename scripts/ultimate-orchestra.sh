
#!/bin/bash
# Ultimate Claude + Neovim Orchestra Setup
# Combines all functionality into one script

set -e

# ──────────────────────────────────────────
# Configuration & Variables
# ──────────────────────────────────────────

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Settings
SESSION_NAME="claude-orchestra"
PORTS=(7777 7778 7779)
NVIM_CONFIG_DIR="$HOME/.config/nvim"

# ──────────────────────────────────────────
# Utility Functions
# ──────────────────────────────────────────

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ──────────────────────────────────────────
# Main Menu System
# ──────────────────────────────────────────

show_main_menu() {
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║       Claude + Neovim Ultimate Orchestra             ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║  1) 🎭 Full Orchestra (3 instances + orchestrator)   ║${NC}"
    echo -e "${CYAN}║  2) 🎸 Solo Session (1 Neovim + tools)              ║${NC}"
    echo -e "${CYAN}║  3) 🎹 Dual Setup (2 instances for testing)         ║${NC}"
    echo -e "${CYAN}║  4) 🎨 Dev Suite (Neovim + browser + terminal)      ║${NC}"
    echo -e "${CYAN}║  5) 🧪 Jupyter Mode (with Molten.nvim)              ║${NC}"
    echo -e "${CYAN}║  6) 📊 Performance Mode (with monitoring)           ║${NC}"
    echo -e "${CYAN}║  7) 🌐 Collaborative Mode (share via network)       ║${NC}"
    echo -e "${CYAN}║  8) 🔬 VimSwarm AI Analysis                         ║${NC}"
    echo -e "${CYAN}║  9) 🔧 System Check & Install Dependencies          ║${NC}"
    echo -e "${CYAN}║  0) 🚪 Exit                                         ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
    echo
}

# ──────────────────────────────────────────
# Dependency Management
# ──────────────────────────────────────────

check_and_install_deps() {
    log_info "Checking dependencies..."
    
    local missing=()
    
    # Core dependencies
    for cmd in tmux nvim python3 fzf bat rg fd; do
        if ! command_exists "$cmd"; then
            missing+=("$cmd")
        fi
    done
    
    # Python packages
    if ! python3 -c "import pynvim" 2>/dev/null; then
        log_warning "Installing pynvim..."
        pip3 install pynvim --break-system-packages
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing: ${missing[*]}"
        log_info "Install with: brew install ${missing[*]}"
        return 1
    fi
    
    log_success "All dependencies satisfied"
    
    # Install TPM if needed
    if [ ! -d ~/.tmux/plugins/tpm ]; then
        log_info "Installing TPM..."
        git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
    fi
    
    # Create helper scripts
    create_all_helpers
}

# ──────────────────────────────────────────
# Helper Script Creation
# ──────────────────────────────────────────

create_all_helpers() {
    log_info "Creating helper commands..."
    
    # orchestra-connect
    cat > "$HOME/.local/bin/orchestra-connect" << 'EOF'
#!/bin/bash
if tmux has-session -t claude-orchestra 2>/dev/null; then
    tmux attach -t claude-orchestra
else
    echo "No orchestra session found. Run nvim-orchestra first."
fi
EOF

    # orchestra-broadcast
    cat > "$HOME/.local/bin/orchestra-broadcast" << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
    echo "Usage: orchestra-broadcast '<vim command>'"
    exit 1
fi
for port in 7777 7778 7779; do
    nvim --server 127.0.0.1:$port --remote-send "$1<CR>" 2>/dev/null && \
        echo "✓ Port $port" || echo "✗ Port $port"
done
EOF

    # orchestra-status
    cat > "$HOME/.local/bin/orchestra-status" << 'EOF'
#!/bin/bash
echo "🎭 Claude + Neovim Orchestra Status"
echo "=================================="
echo
echo "📺 Tmux Sessions:"
tmux ls 2>/dev/null || echo "  No active sessions"
echo
echo "📝 Neovim Instances:"
for port in 7777 7778 7779; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo "  ✓ Port $port: Active"
    else
        echo "  ✗ Port $port: Inactive"
    fi
done
echo
echo "🚀 Commands:"
echo "  orchestra-connect   - Attach to session"
echo "  orchestra-broadcast - Send to all instances"
echo "  orchestra-status    - This status check"
echo "  vim-swarm          - AI analysis"
EOF

    # nvim-orchestra launcher
    cat > "$HOME/.local/bin/nvim-orchestra" << 'EOF'
#!/bin/bash
~/.config/nvim/scripts/ultimate-orchestra.sh
EOF

    # vim-swarm launcher
    cat > "$HOME/.local/bin/vim-swarm" << 'EOF'
#!/bin/bash
cd ~/.config/nvim/scripts && python3 vim_swarm.py
EOF

    # ghostty-orchestra (Ghostty specific launcher)
    cat > "$HOME/.local/bin/ghostty-orchestra" << 'EOF'
#!/bin/bash
# Launch orchestra in Ghostty
osascript -e 'tell application "Ghostty" to activate'
sleep 0.5
osascript -e 'tell application "System Events" to keystroke "tmux attach -t claude-orchestra" & return'
EOF

    chmod +x ~/.local/bin/*
    log_success "Helper commands created"
}

# ──────────────────────────────────────────
# Session Setup Functions
# ──────────────────────────────────────────

cleanup_existing() {
    log_info "Cleaning up existing sessions..."
    
    if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true
    fi
    
    for port in "${PORTS[@]}"; do
        if lsof -ti:$port >/dev/null 2>&1; then
            kill -9 $(lsof -ti:$port) 2>/dev/null || true
        fi
    done
    
    rm -f /tmp/nvim-*.sock
    log_success "Cleanup complete"
}

setup_full_orchestra() {
    cleanup_existing
    log_info "Setting up Full Orchestra..."
    
    # Create session with 4 windows instead of panes for reliability
    tmux new-session -d -s "$SESSION_NAME" -n "nvim1" "nvim --listen 127.0.0.1:7777"
    tmux new-window -t "$SESSION_NAME" -n "nvim2" "nvim --listen 127.0.0.1:7778"
    tmux new-window -t "$SESSION_NAME" -n "nvim3" "nvim --listen 127.0.0.1:7779"
    tmux new-window -t "$SESSION_NAME" -n "orchestrator" "cd ~/.config/nvim/scripts && python3 nvim_orchestrator.py"
    
    # Select first window
    tmux select-window -t "$SESSION_NAME:nvim1"
    
    log_success "Full Orchestra ready! 4 windows: 3 Neovim + 1 Orchestrator"
    log_info "Use Ctrl-b + number (1-4) to switch between instances"
    connect_to_session
}

setup_solo_session() {
    cleanup_existing
    log_info "Setting up Solo Session..."
    
    tmux new-session -d -s "$SESSION_NAME" -n "solo"
    
    # Main Neovim (60% width)
    tmux send-keys -t "$SESSION_NAME:solo" "nvim --listen 127.0.0.1:7777" Enter
    
    # Right side tools (40% width)
    tmux split-window -t "$SESSION_NAME:solo" -h -p 40
    tmux send-keys -t "$SESSION_NAME:solo.1" "watch -n 2 'git status -sb && echo && git log --oneline -5'" Enter
    
    # Terminal below git status
    tmux split-window -t "$SESSION_NAME:solo.1" -v
    
    log_success "Solo Session ready!"
    connect_to_session
}

setup_dual_setup() {
    cleanup_existing
    log_info "Setting up Dual Setup..."
    
    tmux new-session -d -s "$SESSION_NAME" -n "dual"
    
    # Two Neovim instances side by side
    tmux send-keys -t "$SESSION_NAME:dual" "nvim --listen 127.0.0.1:7777" Enter
    tmux split-window -t "$SESSION_NAME:dual" -h
    tmux send-keys "nvim --listen 127.0.0.1:7778" Enter
    
    # Small terminal at bottom - use absolute pane targeting
    tmux split-window -t "$SESSION_NAME:dual" -v -p 20 -b
    
    log_success "Dual Setup ready!"
    connect_to_session
}

setup_dev_suite() {
    cleanup_existing
    log_info "Setting up Development Suite..."
    
    tmux new-session -d -s "$SESSION_NAME" -n "suite"
    
    # Main Neovim
    tmux send-keys -t "$SESSION_NAME:suite" "nvim --listen 127.0.0.1:7777" Enter
    
    # File browser (right side)
    tmux split-window -t "$SESSION_NAME:suite" -h -p 40
    tmux send-keys "lf || ranger || broot || ls -la" Enter
    
    # Terminal (split from bottom)
    tmux split-window -t "$SESSION_NAME:suite" -v -p 40 -b
    
    # Simple layout - 3 panes is enough
    log_success "Dev Suite ready! 3 panes: Neovim + File Browser + Terminal"
    connect_to_session
}

setup_jupyter_mode() {
    cleanup_existing
    log_info "Setting up Jupyter Mode..."
    
    tmux new-session -d -s "$SESSION_NAME" -n "jupyter"
    
    # Jupyter server
    tmux send-keys -t "$SESSION_NAME:jupyter" "cd ~/notebooks && jupyter lab --no-browser" Enter
    
    # Neovim with Molten
    tmux split-window -t "$SESSION_NAME:jupyter" -v
    tmux send-keys -t "$SESSION_NAME:jupyter.1" "nvim --listen 127.0.0.1:7777" Enter
    sleep 2
    tmux send-keys -t "$SESSION_NAME:jupyter.1" ":MoltenInit" Enter
    
    log_success "Jupyter Mode ready!"
    log_info "Jupyter URL will appear in the top pane"
    connect_to_session
}

setup_performance_mode() {
    cleanup_existing
    log_info "Setting up Performance Mode..."
    
    tmux new-session -d -s "$SESSION_NAME" -n "perf"
    
    # Neovim with startup profiling
    tmux send-keys -t "$SESSION_NAME:perf" "nvim --listen 127.0.0.1:7777 --startuptime /tmp/nvim-startup.log" Enter
    
    # Performance monitoring
    tmux split-window -t "$SESSION_NAME:perf" -h
    if command_exists sampler; then
        tmux send-keys -t "$SESSION_NAME:perf.1" "sampler" Enter
    else
        tmux send-keys -t "$SESSION_NAME:perf.1" "htop || btop || top" Enter
    fi
    
    # Startup log viewer
    tmux split-window -t "$SESSION_NAME:perf" -v -p 30
    tmux send-keys -t "$SESSION_NAME:perf.2" "watch -n 1 'tail -20 /tmp/nvim-startup.log 2>/dev/null || echo Waiting...'" Enter
    
    log_success "Performance Mode ready!"
    connect_to_session
}

setup_collaborative_mode() {
    cleanup_existing
    log_info "Setting up Collaborative Mode..."
    
    tmux new-session -d -s "$SESSION_NAME" -n "collab"
    
    # Neovim with server
    tmux send-keys -t "$SESSION_NAME:collab" "nvim --listen 127.0.0.1:7777" Enter
    sleep 2
    
    # Try to start collaboration server
    tmux send-keys -t "$SESSION_NAME:collab" ":InstantStartServer 0.0.0.0 8080" Enter
    
    # Info pane
    tmux split-window -t "$SESSION_NAME:collab" -v -p 30
    local ip=$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)
    tmux send-keys -t "$SESSION_NAME:collab.1" "echo 'Share this address: ${ip}:8080' && echo 'Others can connect with: :InstantJoinSession ${ip} 8080'" Enter
    
    log_success "Collaborative Mode ready!"
    connect_to_session
}

run_vim_swarm() {
    if ! tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
        log_error "No orchestra session found. Start one first!"
        return 1
    fi
    
    log_info "Launching VimSwarm AI Analysis..."
    cd ~/.config/nvim/scripts && python3 vim_swarm.py
}

# ──────────────────────────────────────────
# Session Connection
# ──────────────────────────────────────────

connect_to_session() {
    echo
    echo -e "${CYAN}Session ready! Connect with:${NC}"
    echo -e "  ${YELLOW}orchestra-connect${NC}        - From terminal"
    echo -e "  ${YELLOW}ghostty-orchestra${NC}        - Open in Ghostty"
    echo -e "  ${YELLOW}tmux attach -t $SESSION_NAME${NC} - Manual attach"
    echo
    read -p "Connect now? (y/n/g for Ghostty): " choice
    
    case $choice in
        y|Y)
            tmux attach -t "$SESSION_NAME"
            ;;
        g|G)
            osascript -e 'tell application "Ghostty" to activate'
            sleep 0.5
            osascript -e "tell application \"System Events\" to keystroke \"tmux attach -t $SESSION_NAME\" & return"
            ;;
        *)
            echo "Session running in background. Use orchestra-connect to attach."
            ;;
    esac
}

# ──────────────────────────────────────────
# Main Program Loop
# ──────────────────────────────────────────

main() {
    while true; do
        show_main_menu
        read -p "Select option [0-9]: " choice
        
        case $choice in
            1) setup_full_orchestra ;;
            2) setup_solo_session ;;
            3) setup_dual_setup ;;
            4) setup_dev_suite ;;
            5) setup_jupyter_mode ;;
            6) setup_performance_mode ;;
            7) setup_collaborative_mode ;;
            8) run_vim_swarm ;;
            9) check_and_install_deps ;;
            0) echo "Goodbye!"; exit 0 ;;
            *) log_error "Invalid choice" ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Run main program
main "$@"

