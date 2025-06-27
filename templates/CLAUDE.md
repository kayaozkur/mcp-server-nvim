# Claude + Neovim Integration Guide

## Quick Start - Choose Your Setup

### 🟢 Basic Setup
```bash
~/.config/nvim/claude-setup.sh
# Simple tmux + Neovim with remote control
```

### 🔵 Advanced Setup  
```bash
~/.config/nvim/claude-advanced-setup.sh
# Adds Zellij, Kitty graphics, tmuxinator
```

### 🟣 Ultimate Setup
```bash
~/.config/nvim/claude-ultimate-setup.sh
# Installs missing tools, configures everything
```

### ⚡ Power User Setup
```bash
~/.config/nvim/claude-poweruser-setup.sh
# Jupyter, orchestration, collaboration, monitoring
```

### 🚀 Quick Launch (after any setup)
```bash
claude-nvim    # Basic/Ultimate launcher
claude-power   # Power user launcher with 6 modes
```

## Environment Details

### What This Sets Up

1. **Tmux session** named `claude-nvim` with:
   - Window 0 (`editor`): Neovim with listener on port 7777
   - Window 1 (`terminal`): Regular terminal for commands

2. **Neovim** running with `--listen 127.0.0.1:7777` for remote control

3. **ToggleTerm** available via `Ctrl+\` for integrated terminal

### How Claude Can Control Your Neovim

When this environment is running, Claude can:
- Send commands directly to Neovim
- Open/edit files
- Run tests
- Navigate code
- Execute any Neovim command

### Manual Setup (if script fails)

```bash
# Start tmux
tmux new -s claude-nvim

# Inside tmux, start Neovim
nvim --listen 127.0.0.1:7777

# From another terminal, verify connection
nvim --server 127.0.0.1:7777 --remote-send ':echo "Connected!"<CR>'
```

### Useful Commands

**Inside tmux:**
- `Ctrl-b d` - Detach from session (keeps running)
- `Ctrl-b 0` - Switch to Neovim window
- `Ctrl-b 1` - Switch to terminal window
- `Ctrl-b c` - Create new window
- `Ctrl-b n/p` - Next/previous window

**Inside Neovim:**
- `Ctrl+\` - Toggle integrated terminal
- `<Space>` - Leader key (shows which-key menu)
- `:Lazy` - Manage plugins

**From outside (for Claude):**
```bash
# Send command to Neovim
nvim --server 127.0.0.1:7777 --remote-send ':Telescope find_files<CR>'

# Send keys to tmux
tmux send-keys -t claude-nvim:0 ':w<CR>'
```

### Reconnecting

If disconnected, simply run:
```bash
tmux attach -t claude-nvim
```

### Stopping the Environment

```bash
# Kill the tmux session
tmux kill-session -t claude-nvim
```

## Tips for Working with Claude

1. **Tell Claude the environment is ready** by mentioning you've run the setup script
2. **Share any errors** you see - Claude can help debug
3. **Ask Claude to explain** what commands are being run
4. **Request step-by-step guidance** for complex tasks

## ⚠️ IMPORTANT WARNING: Keybindings Configuration

**DO NOT MODIFY KEYBINDINGS** - The keybindings in this configuration are carefully preset and optimized. They should **NEVER** be changed by Claude or any automated process. 

- All keybindings are documented in `plugin_keybindings_summary.md`
- The keybinding configuration is locked and should remain unchanged
- If you need different keybindings, create a separate custom configuration
- Any attempts to modify keybindings will likely break the integration

## Troubleshooting

**Connection refused errors:**
- Make sure Neovim is running with `--listen 127.0.0.1:7777`
- Check if port 7777 is already in use: `lsof -i :7777`

**Tmux session issues:**
- List sessions: `tmux ls`
- Kill old session: `tmux kill-session -t claude-nvim`
- Start fresh with the setup script

**Plugin not working:**
- Run `:Lazy sync` in Neovim
- Check `:checkhealth` for issues
- Restart Neovim after plugin installation