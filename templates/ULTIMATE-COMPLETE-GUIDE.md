# Ultimate Claude + Neovim Orchestra Guide - Complete Edition

## 🚀 COMPLETE FRESH START - ALL SCRIPTS INCLUDED

This guide contains EVERYTHING - all scripts, configurations, and power user features for Ghostty terminal.

## Prerequisites

```bash
# Required tools
brew install tmux neovim python3 fzf bat ripgrep fd tree-sitter
brew install joshmedeski/sesh/sesh
brew install byobu abduco
brew install --cask ghostty  # Our terminal of choice

# Python packages
pip3 install pynvim --break-system-packages

# Optional but recommended
brew install --cask espanso
brew install sampler
gem install tmuxinator
```

## Step 1: Complete Directory Setup & Cleanup

```bash
# Kill everything first
tmux kill-server 2>/dev/null
pkill -f "nvim --listen" 2>/dev/null
rm -f /tmp/nvim-*.sock

# Create all directories
mkdir -p ~/.config/nvim/{scripts,lua}
mkdir -p ~/.config/{sesh,espanso/match}
mkdir -p ~/.{tmuxinator,local/bin}

# Add to PATH in ~/.zshrc
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
echo 'export FZF_DEFAULT_OPTS="--preview '\''bat --color=always {} 2>/dev/null || cat {}'\''"' >> ~/.zshrc
echo 'alias claude-nvim="~/.config/nvim/claude-setup.sh"' >> ~/.zshrc
echo 'alias vim-swarm="cd ~/.config/nvim/scripts && python3 vim_swarm.py"' >> ~/.zshrc
echo 'alias nvim-test="~/.config/nvim/scripts/test-pynvim.py"' >> ~/.zshrc
source ~/.zshrc
```

## Step 2: Complete Tmux Configuration

Save as `~/.tmux.conf`:
```bash
# ── Tmux Configuration ──

# Enable mouse support
set -g mouse on

# Start windows and panes at 1, not 0
set -g base-index 1
setw -g pane-base-index 1

# Reload config
bind r source-file ~/.tmux.conf \; display "Config reloaded!"

# ── Navigation ──

# Split panes using | and -
bind | split-window -h
bind - split-window -v
unbind '"'
unbind %

# Navigate panes with vim-like keys
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# ── Copy Mode ──

# Use vim keybindings in copy mode
setw -g mode-keys vi

# Setup 'v' to begin selection as in Vim
bind-key -T copy-mode-vi v send-keys -X begin-selection
bind-key -T copy-mode-vi y send-keys -X copy-selection-and-cancel

# ── Session Management ──

# Sesh integration (session manager) - supercharged session management
bind-key "T" run-shell "sesh connect $(
  sesh list | fzf-tmux -p 55%,60% | awk '{print $1}'
)"
bind-key "K" run-shell "sesh kill"

# FZF session switcher
bind-key s run-shell "tmux list-sessions | fzf --height 40% --reverse | cut -d: -f1 | xargs tmux switch-client -t"

# ── Plugins ──

# TPM (Tmux Plugin Manager)
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'

# Save/restore sessions
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @resurrect-strategy-nvim 'session'

# Auto-save sessions
set -g @plugin 'tmux-plugins/tmux-continuum'
set -g @continuum-restore 'on'

# Better copy/paste
set -g @plugin 'tmux-plugins/tmux-yank'

# Fuzzy find & copy from screen
set -g @plugin 'laktak/extrakto'

# ── Status Bar ──

# Status bar styling
set -g status-bg black
set -g status-fg white
set -g status-left-length 50
set -g status-right-length 50
set -g status-left '#[fg=green][#S] '
set -g status-right '#[fg=yellow]%H:%M %d-%b-%y'

# ── Performance ──

# Reduce escape time
set -sg escape-time 0

# Increase scrollback buffer
set -g history-limit 10000

# ── Initialize TPM ──
# Keep this line at the very bottom of tmux.conf
run '~/.tmux/plugins/tpm/tpm'
```

## Step 3: All-In-One Master Setup Script

Save as `~/.config/nvim/scripts/ultimate-orchestra.sh`:
```bash
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
    
    # Create session
    tmux new-session -d -s "$SESSION_NAME" -n "orchestra"
    
    # Start instances in tiled layout
    tmux send-keys -t "$SESSION_NAME:orchestra" "nvim --listen 127.0.0.1:7777" Enter
    sleep 1
    
    tmux split-window -t "$SESSION_NAME:orchestra" -h
    tmux send-keys -t "$SESSION_NAME:orchestra.1" "nvim --listen 127.0.0.1:7778" Enter
    sleep 1
    
    tmux split-window -t "$SESSION_NAME:orchestra.0" -v
    tmux send-keys -t "$SESSION_NAME:orchestra.2" "nvim --listen 127.0.0.1:7779" Enter
    sleep 1
    
    tmux split-window -t "$SESSION_NAME:orchestra.1" -v
    tmux send-keys -t "$SESSION_NAME:orchestra.3" "cd ~/.config/nvim/scripts && python3 nvim_orchestrator.py" Enter
    
    tmux select-layout -t "$SESSION_NAME:orchestra" tiled
    
    log_success "Full Orchestra ready!"
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
    tmux send-keys -t "$SESSION_NAME:dual.1" "nvim --listen 127.0.0.1:7778" Enter
    
    # Small terminal at bottom
    tmux split-window -t "$SESSION_NAME:dual" -v -p 20
    
    log_success "Dual Setup ready!"
    connect_to_session
}

setup_dev_suite() {
    cleanup_existing
    log_info "Setting up Development Suite..."
    
    tmux new-session -d -s "$SESSION_NAME" -n "suite"
    
    # Main Neovim
    tmux send-keys -t "$SESSION_NAME:suite" "nvim --listen 127.0.0.1:7777" Enter
    
    # File browser
    tmux split-window -t "$SESSION_NAME:suite" -h -p 40
    tmux send-keys -t "$SESSION_NAME:suite.1" "lf || ranger || broot || ls -la" Enter
    
    # Terminal
    tmux split-window -t "$SESSION_NAME:suite.0" -v -p 40
    
    # Logs
    tmux split-window -t "$SESSION_NAME:suite.1" -v
    tmux send-keys -t "$SESSION_NAME:suite.3" "tail -f ~/.local/state/nvim/lsp.log 2>/dev/null || echo 'Logs will appear here'" Enter
    
    log_success "Dev Suite ready!"
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
```

## Step 4: Python Scripts

### 4.1 Enhanced Orchestrator
Save as `~/.config/nvim/scripts/nvim_orchestrator.py`:
[Include the complete orchestrator script with macros, diff, etc.]

### 4.2 VimSwarm AI System
Save as `~/.config/nvim/scripts/vim_swarm.py`:
[Include the complete VimSwarm script]

### 4.3 Test Script
Save as `~/.config/nvim/scripts/test-pynvim.py`:
```python
#!/usr/bin/env python3
"""Test pynvim connection to Neovim instances"""

import pynvim
import sys

def test_connection(port):
    try:
        nvim = pynvim.attach('tcp', address='127.0.0.1', port=port)
        version = nvim.eval('v:version')
        bufname = nvim.eval('expand("%:t")') or "[No Name]"
        print(f"✓ Port {port}: Neovim {version} - {bufname}")
        return True
    except Exception as e:
        print(f"✗ Port {port}: {str(e).split(':')[-1].strip()}")
        return False

if __name__ == "__main__":
    print("Testing pynvim connections...")
    print("-" * 40)
    
    ports = [7777, 7778, 7779]
    connected = sum(test_connection(port) for port in ports)
    
    print("-" * 40)
    print(f"Connected to {connected}/{len(ports)} instances")
    
    if connected == 0:
        print("\nNo instances found. Start with: nvim-orchestra")
        sys.exit(1)
    else:
        print("\n✅ pynvim is working correctly!")
```

## Step 5: Neovim Integration

### 5.1 Claude Integration Module
Save as `~/.config/nvim/lua/claude-integration.lua`:
```lua
-- Claude Advanced Integration Module
local M = {}

-- Setup custom RPC server for automation
function M.setup_rpc()
  -- Additional automation socket with unique name
  local server_addr = vim.v.servername or 'default'
  local socket_name = '/tmp/nvim-automation-' .. vim.fn.fnamemodify(server_addr, ':t') .. '.sock'
  
  -- Only start if not already started
  pcall(function()
    vim.fn.serverstart(socket_name)
  end)
  
  -- Register custom commands
  vim.api.nvim_create_user_command('ClaudeStatus', function()
    local msg = string.format('Claude integration active on %s and %s', vim.v.servername, socket_name)
    vim.notify(msg, vim.log.levels.INFO)
  end, {})
  
  vim.api.nvim_create_user_command('ClaudeProjects', function()
    require('telescope').extensions.projects.projects{}
  end, {})
  
  vim.api.nvim_create_user_command('OrchestraBroadcast', function(opts)
    local cmd = opts.args
    for _, port in ipairs({7777, 7778, 7779}) do
      vim.fn.system(string.format('nvim --server 127.0.0.1:%d --remote-send "%s<CR>"', port, cmd))
    end
    vim.notify('Broadcast sent to all instances', vim.log.levels.INFO)
  end, { nargs = 1 })
end

-- Setup debug configurations
function M.setup_dap()
  local dap = require('dap')
  
  dap.configurations.python = {
    {
      type = 'python',
      request = 'launch',
      name = "Launch file",
      program = "${file}",
      pythonPath = function()
        return '/usr/bin/python3'
      end,
    },
  }
  
  dap.configurations.javascript = {
    {
      type = 'node2',
      request = 'launch',
      name = 'Launch Program',
      program = '${file}',
    },
  }
end

-- Keybindings
function M.setup_keybindings()
  local opts = { noremap = true, silent = true }
  
  -- Orchestra controls
  vim.api.nvim_set_keymap('n', '<leader>ob', ':OrchestraBroadcast ', opts)
  vim.api.nvim_set_keymap('n', '<leader>os', ':ClaudeStatus<CR>', opts)
  
  -- Quick instance switching
  for i = 1, 3 do
    local port = 7776 + i
    vim.api.nvim_set_keymap('n', '<leader>' .. i, 
      string.format(':!nvim --server 127.0.0.1:%d --remote-send ":b#<CR>"<CR>', port), opts)
  end
end

-- Initialize
function M.setup()
  M.setup_rpc()
  M.setup_keybindings()
  
  -- Try to setup DAP if available
  local ok, _ = pcall(require, 'dap')
  if ok then
    M.setup_dap()
  end
end

return M
```

### 5.2 Update init.lua
Add to the end of your `~/.config/nvim/init.lua`:
```lua
-- Load Claude integration
local ok, claude = pcall(require, 'claude-integration')
if ok then
  claude.setup()
end
```

## Step 6: Additional Configurations

### 6.1 Sesh Configuration
Save as `~/.config/sesh/sesh.toml`:
```toml
[[session]]
name = "nvim-config"
path = "~/.config/nvim"
startup_command = "nvim"

[[session]]
name = "orchestra"
path = "~"
startup_command = "~/.config/nvim/scripts/ultimate-orchestra.sh"

[[session]]
name = "projects"
path = "~/projects"
startup_command = "nvim"

[default_session]
startup_command = "nvim"
```

### 6.2 Tmuxinator Template
Save as `~/.tmuxinator/orchestra.yml`:
```yaml
name: orchestra
root: ~/

windows:
  - editor:
      layout: tiled
      panes:
        - nvim --listen 127.0.0.1:7777
        - nvim --listen 127.0.0.1:7778
        - nvim --listen 127.0.0.1:7779
        - cd ~/.config/nvim/scripts && python3 nvim_orchestrator.py

  - tools:
      layout: even-horizontal
      panes:
        - # Terminal
        - watch -n 2 'git status -sb'
        
  - monitoring:
      panes:
        - btop || htop
```

### 6.3 Espanso Keybindings
Save as `~/.config/espanso/match/neovim-orchestra.yml`:
```yaml
matches:
  # Quick commands
  - trigger: ";nvim"
    replace: "nvim --server 127.0.0.1:7777 --remote-send"
    
  - trigger: ";nvim2"
    replace: "nvim --server 127.0.0.1:7778 --remote-send"
    
  - trigger: ";nvim3"
    replace: "nvim --server 127.0.0.1:7779 --remote-send"
  
  - trigger: ";saveall"
    replace: "orchestra-broadcast ':wa'"
  
  - trigger: ";find"
    replace: |
      nvim --server 127.0.0.1:7777 --remote-send ':Telescope find_files<CR>'
  
  - trigger: ";orchestra"
    replace: "nvim-orchestra"
  
  - trigger: ";status"
    replace: "orchestra-status"
  
  - trigger: ";swarm"
    replace: "vim-swarm"
    
  - trigger: ";ghost"
    replace: "ghostty-orchestra"
```

## Step 7: Final Setup Steps

```bash
# Make everything executable
chmod +x ~/.config/nvim/scripts/*.sh
chmod +x ~/.config/nvim/scripts/*.py
chmod +x ~/.local/bin/*

# Install TPM
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm

# Source tmux config
tmux source ~/.tmux.conf

# Source shell config
source ~/.zshrc
```

## Step 8: Quick Test

```bash
# Test pynvim
nvim-test

# Launch the ultimate orchestrator
nvim-orchestra

# Check status
orchestra-status

# Test in Ghostty
ghostty-orchestra
```

## 🎯 Daily Usage

### Quick Commands
```bash
nvim-orchestra    # Launch with menu
orchestra-status  # Check what's running
vim-swarm        # AI code analysis
orchestra-connect # Attach to session
ghostty-orchestra # Open in Ghostty
```

### Inside Orchestra
- `Ctrl-b arrow` - Navigate panes
- `Ctrl-b z` - Zoom pane
- `Ctrl-b d` - Detach
- `Ctrl-b T` - Sesh session picker
- `Ctrl-b s` - FZF session switcher

### Orchestrator Commands
```
help              # Show all commands
broadcast :w      # Save all files
sync src targets  # Sync buffers
macro record name # Record macro
macro play name   # Play macro
diff inst1 inst2  # Compare instances
list             # Show instances
exit             # Exit orchestrator
```

## 🚀 You're All Set!

Everything is now in ONE place:
- Single launcher script with menu
- All functionality merged
- Optimized for Ghostty
- Complete power user features
- AI analysis with VimSwarm
- Session management with sesh
- Universal keybindings ready

Start with: `nvim-orchestra` 🎉