#!/bin/bash
# Cleanup old orchestra files - keeping only the essential ones

echo "🧹 Cleaning up old orchestra files..."
echo "This will remove redundant files and keep only the ultimate setup"
echo
read -p "Continue? (y/n): " confirm

if [[ $confirm != "y" ]]; then
    echo "Cleanup cancelled"
    exit 0
fi

# Remove old documentation (keeping only ULTIMATE-COMPLETE-GUIDE.md)
echo "📄 Removing old documentation..."
rm -f ~/.config/nvim/COMPLETE-SETUP-GUIDE.md
rm -f ~/.config/nvim/COMPLETE-SETUP-WITH-SCRIPTS.md
rm -f ~/.config/nvim/CLAUDE-ORCHESTRA.md
rm -f ~/.config/nvim/CLAUDE-ADVANCED.md
rm -f ~/.config/nvim/CLAUDE-WORKFLOWS.md

# Remove old setup scripts (keeping only ultimate-orchestra.sh)
echo "📜 Removing old setup scripts..."
rm -f ~/.config/nvim/scripts/orchestra-setup.sh
rm -f ~/.config/nvim/scripts/orchestra-flexible.sh
rm -f ~/.config/nvim/claude-setup.sh
rm -f ~/.config/nvim/claude-advanced-setup.sh
rm -f ~/.config/nvim/claude-ultimate-setup.sh
rm -f ~/.config/nvim/claude-poweruser-setup.sh

# Remove duplicate launcher scripts
echo "🚀 Removing duplicate launchers..."
rm -f ~/.local/bin/orchestra-lite
rm -f ~/.local/bin/claude-power

# Clean up old config files
echo "⚙️  Cleaning configurations..."
# Keep tmux.conf, but remove any backups
rm -f ~/.tmux.conf.backup
rm -f ~/.config/nvim/lua/claude-integration.lua.backup

echo
echo "✅ Cleanup complete! Remaining files:"
echo
echo "📚 Documentation:"
echo "  - ULTIMATE-COMPLETE-GUIDE.md (main guide)"
echo "  - CLAUDE.md (original basic guide)"
echo
echo "🔧 Scripts:"
echo "  - ultimate-orchestra.sh (main launcher)"
echo "  - nvim_orchestrator.py (orchestrator)"
echo "  - vim_swarm.py (AI analysis)"
echo "  - test-pynvim.py (testing)"
echo
echo "🚀 Commands:"
echo "  - nvim-orchestra (launches ultimate-orchestra.sh)"
echo "  - orchestra-connect"
echo "  - orchestra-broadcast"
echo "  - orchestra-status"
echo "  - vim-swarm"
echo "  - ghostty-orchestra"
echo
echo "Start with: nvim-orchestra"