# Plugin Keybindings Summary

This document contains all keybindings provided by installed plugins, organized by plugin name with mode, key combination, and functionality details.

## Terminal & Development Tools

### ToggleTerm
- **Plugin**: akinsho/toggleterm.nvim
- **Mode**: Normal
- **Key**: `<C-\>`
- **Function**: Toggle terminal

### GitHub Copilot
- **Plugin**: github/copilot.vim
- **Mode**: Insert
- **Key**: `<C-j>`
- **Function**: Accept Copilot suggestion

### DAP (Debug Adapter Protocol)
- **Plugin**: mfussenegger/nvim-dap
- **Keybindings**:
  - `<leader>db` (Normal) - Toggle breakpoint
  - `<leader>dc` (Normal) - Continue debugging
  - `<leader>di` (Normal) - Step into
  - `<leader>do` (Normal) - Step over
  - `<leader>dO` (Normal) - Step out
  - `<leader>dr` (Normal) - Open REPL
  - `<leader>dl` (Normal) - Run last
  - `<leader>du` (Normal) - Toggle DAP UI

### Neotest
- **Plugin**: nvim-neotest/neotest
- **Keybindings**:
  - `<leader>tt` (Normal) - Run nearest test
  - `<leader>tf` (Normal) - Run file tests
  - `<leader>td` (Normal) - Debug test
  - `<leader>ts` (Normal) - Toggle summary
  - `<leader>to` (Normal) - Show output

## Navigation & Movement

### Flash (Enhanced Navigation)
- **Plugin**: folke/flash.nvim
- **Keybindings**:
  - `s` (Normal, Visual, Operator) - Flash jump
  - `S` (Normal, Visual, Operator) - Flash treesitter
  - `r` (Operator) - Remote flash
  - `R` (Operator, Visual) - Treesitter search
  - `<c-s>` (Command) - Toggle flash search

### Harpoon (File Marking)
- **Plugin**: ThePrimeagen/harpoon
- **Keybindings**:
  - `<leader>ma` (Normal) - Mark: Add file
  - `<leader>mm` (Normal) - Mark: Menu
  - `<leader>m1` (Normal) - Mark: Go to file 1
  - `<leader>m2` (Normal) - Mark: Go to file 2
  - `<leader>m3` (Normal) - Mark: Go to file 3
  - `<leader>m4` (Normal) - Mark: Go to file 4

### Tmux Navigator
- **Plugin**: christoomey/vim-tmux-navigator
- **Keybindings**:
  - `<C-h>` (Normal) - Navigate left
  - `<C-j>` (Normal) - Navigate down
  - `<C-k>` (Normal) - Navigate up
  - `<C-l>` (Normal) - Navigate right

### Aerial (Symbol Navigation)
- **Plugin**: stevearc/aerial.nvim
- **Keybindings**:
  - `<leader>aa` (Normal) - Toggle aerial
  - `{` (Normal) - Aerial previous
  - `}` (Normal) - Aerial next

## Buffer & Window Management

### BufferLine
- **Plugin**: akinsho/bufferline.nvim
- **Keybindings**:
  - `<S-h>` (Normal) - Previous buffer
  - `<S-l>` (Normal) - Next buffer
  - `<leader>bp` (Normal) - Toggle pin
  - `<leader>bP` (Normal) - Delete non-pinned buffers

### Snacks (Buffer Management)
- **Plugin**: folke/snacks.nvim
- **Keybindings**:
  - `<leader>sn` (Normal) - Notification History
  - `<leader>un` (Normal) - Dismiss All Notifications
  - `<leader>bd` (Normal) - Delete Buffer
  - `<leader>bo` (Normal) - Delete Other Buffers

### No Neck Pain (Centering)
- **Plugin**: shortcuts/no-neck-pain.nvim
- **Keybindings**:
  - `<leader>cn` (Normal) - Center text (No Neck Pain)

## Text Manipulation & Editing

### Substitute
- **Plugin**: gbprod/substitute.nvim
- **Keybindings**:
  - `gr` (Normal) - Substitute operator
  - `grr` (Normal) - Substitute line
  - `gR` (Normal) - Substitute to end of line
  - `gr` (Visual) - Substitute visual selection

### TreeSJ (Split/Join)
- **Plugin**: Wansmer/treesj
- **Keybindings**:
  - `<leader>sj` (Normal) - Split/join toggle

### Insert/Append Single Character
- **Plugin**: bagohart/vim-insert-append-single-character
- **Keybindings**:
  - `<leader>is` (Normal) - Insert single character
  - `<leader>as` (Normal) - Append single character

### Rip Substitute (Advanced Replace)
- **Plugin**: chrisgrieser/nvim-rip-substitute
- **Keybindings**:
  - `<leader>rS` (Normal, Visual) - Advanced substitute

### UFO (Folding)
- **Plugin**: kevinhwang91/nvim-ufo
- **Keybindings**:
  - `zR` (Normal) - Open all folds
  - `zM` (Normal) - Close all folds

## Search & Find

### Telescope Egrepify
- **Plugin**: fdschmidt93/telescope-egrepify.nvim
- **Keybindings**:
  - `<leader>fG` (Normal) - Enhanced live grep

### FZF Lua
- **Plugin**: ibhagwan/fzf-lua
- **Keybindings**:
  - `<leader>zf` (Normal) - FzfLua files
  - `<leader>zg` (Normal) - FzfLua grep
  - `<leader>zb` (Normal) - FzfLua buffers

### Grug Far (Search & Replace)
- **Plugin**: MagicDuck/grug-far.nvim
- **Keybindings**:
  - `<leader>sr` (Normal, Visual) - Search and replace (Grug Far)

### GX (URL Opening)
- **Plugin**: chrishrb/gx.nvim
- **Keybindings**:
  - `gx` (Normal, Visual) - Open URL

## Project & Task Management

### Overseer (Task Runner)
- **Plugin**: stevearc/overseer.nvim
- **Keybindings**:
  - `<leader>or` (Normal) - Run task
  - `<leader>ot` (Normal) - Toggle task list
  - `<leader>oa` (Normal) - Task action
  - `<leader>oq` (Normal) - Quick action

### Project.nvim
- **Plugin**: ahmedkhalf/project.nvim
- **Keybindings**:
  - `<leader>fp` (Normal) - Find projects

### NPM Scripts
- **Plugin**: antonk52/npm_scripts.nvim
- **Keybindings**:
  - `<leader>ns` (Normal) - Run npm script

## Version Control

### Diffview
- **Plugin**: sindrets/diffview.nvim
- **Keybindings**:
  - `<leader>gd` (Normal) - Open diffview
  - `<leader>gc` (Normal) - Close diffview

### Git Conflict
- **Plugin**: akinsho/git-conflict.nvim
- **Keybindings**:
  - `<leader>co` (Normal) - Accept ours
  - `<leader>ct` (Normal) - Accept theirs
  - `<leader>cn` (Normal) - Accept none
  - `<leader>cb` (Normal) - Accept both
  - `]x` (Normal) - Next conflict
  - `[x` (Normal) - Previous conflict

### Octo (GitHub Integration)
- **Plugin**: pwntester/octo.nvim
- **Keybindings**:
  - `<leader>go` (Normal) - Octo
  - `<leader>gp` (Normal) - List PRs
  - `<leader>gi` (Normal) - List issues

## Advanced Development Tools

### REST Client
- **Plugin**: rest-nvim/rest.nvim
- **Keybindings**:
  - `<leader>rr` (Normal) - Run REST request
  - `<leader>rp` (Normal) - Preview REST request
  - `<leader>rl` (Normal) - Run last REST request

### Neogen (Documentation)
- **Plugin**: danymat/neogen
- **Keybindings**:
  - `<leader>ng` (Normal) - Generate documentation

### Refactoring
- **Plugin**: ThePrimeagen/refactoring.nvim
- **Keybindings**:
  - `<leader>re` (Visual) - Extract function
  - `<leader>rf` (Visual) - Extract to file
  - `<leader>rv` (Visual) - Extract variable
  - `<leader>ri` (Normal, Visual) - Inline variable
  - `<leader>rI` (Normal) - Inline function

## Power User & Specialized Tools

### Molten (Jupyter Integration)
- **Plugin**: benlubas/molten-nvim
- **Keybindings**:
  - `<leader>mi` (Normal) - Initialize Molten
  - `<leader>me` (Normal) - Evaluate operator
  - `<leader>ml` (Normal) - Evaluate line
  - `<leader>mc` (Normal) - Re-evaluate cell
  - `<leader>md` (Normal) - Delete cell
  - `<leader>mo` (Normal) - Show output
  - `<leader>mr` (Normal) - Interrupt execution

### Instant (Collaborative Editing)
- **Plugin**: jbyuki/instant.nvim
- **Keybindings**:
  - `<leader>is` (Normal) - Start instant server
  - `<leader>ij` (Normal) - Join instant session
  - `<leader>ix` (Normal) - Stop instant
  - `<leader>iu` (Normal) - Instant status

### Legendary (Command Palette)
- **Plugin**: mrjones2014/legendary.nvim
- **Keybindings**:
  - `<leader>lg` (Normal) - Legendary

### Session Management
- **Plugin**: folke/persistence.nvim
- **Keybindings**:
  - `<leader>qs` (Normal) - Restore Session
  - `<leader>ql` (Normal) - Restore Last Session
  - `<leader>qd` (Normal) - Don't Save Current Session

## Claude Integration (Custom)
- **Plugin**: Custom claude-integration.lua
- **Keybindings**:
  - `<leader>cs` (Normal) - Start Claude RPC server
  - `<leader>cc` (Normal) - Send context to Claude
  - `<leader>db` (Normal) - Toggle breakpoint (DAP)
  - `<leader>dc` (Normal) - Debug continue
  - `<leader>ds` (Normal) - Debug step over
  - `<leader>di` (Normal) - Debug step into
  - `<leader>do` (Normal) - Debug step out

## Custom Mappings (mappings.lua)
These are user-defined keybindings that complement the plugin keybindings:

### Basic Navigation
- `;` (Normal) - Enter command mode
- `jk` (Insert) - Exit insert mode
- `<C-s>` (Normal, Insert, Visual) - Save file

### Window Management
- `<leader>wh` (Normal) - Move to left window
- `<leader>wj` (Normal) - Move to bottom window
- `<leader>wk` (Normal) - Move to top window
- `<leader>wl` (Normal) - Move to right window
- `<leader>ws` (Normal) - Split window horizontally
- `<leader>wv` (Normal) - Split window vertically
- `<leader>wc` (Normal) - Close current window
- `<leader>wo` (Normal) - Close all other windows

### Buffer Management
- `<leader>bn` (Normal) - Next buffer
- `<leader>bp` (Normal) - Previous buffer
- `<leader>bx` (Normal) - Delete current buffer

### Quick Actions
- `<leader>w` (Normal) - Save file
- `<leader>q` (Normal) - Quit
- `<leader>Q` (Normal) - Quit all
- `<leader>nh` (Normal) - Clear search highlights

### Visual Mode
- `<` (Visual) - Indent left and reselect
- `>` (Visual) - Indent right and reselect
- `J` (Visual) - Move selection down
- `K` (Visual) - Move selection up

## Notes
- `<leader>` is typically mapped to space key in most configurations
- Some plugins may have additional keybindings defined in their default configurations
- Keybindings marked with specific modes: (Normal), (Insert), (Visual), (Command), (Operator)
- Several plugins are configured but may not have explicit keybindings (they use default ones or are command-based)
