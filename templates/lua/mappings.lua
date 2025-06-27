require "nvchad.mappings"

-- ⚠️ WARNING: DO NOT MODIFY KEYBINDINGS
-- These keybindings are carefully preset and optimized.
-- They should NEVER be changed by Claude or any automated process.
-- Any modifications will likely break the integration.
-- If you need different keybindings, create a separate custom configuration.

-- add yours here

local map = vim.keymap.set

-- Basic mappings
map("n", ";", ":", { desc = "CMD enter command mode" })
map("i", "jk", "<ESC>", { desc = "Exit insert mode" })
map({ "n", "i", "v" }, "<C-s>", "<cmd> w <cr>", { desc = "Save file" })

-- Better window navigation (more intuitive than tmux-navigator for some)
map("n", "<leader>wh", "<C-w>h", { desc = "Move to left window" })
map("n", "<leader>wj", "<C-w>j", { desc = "Move to bottom window" })
map("n", "<leader>wk", "<C-w>k", { desc = "Move to top window" })
map("n", "<leader>wl", "<C-w>l", { desc = "Move to right window" })
map("n", "<leader>ws", "<cmd>split<cr>", { desc = "Split window horizontally" })
map("n", "<leader>wv", "<cmd>vsplit<cr>", { desc = "Split window vertically" })
map("n", "<leader>wc", "<cmd>close<cr>", { desc = "Close current window" })
map("n", "<leader>wo", "<cmd>only<cr>", { desc = "Close all other windows" })

-- Better buffer navigation (supplement the existing ones)
map("n", "<leader>bn", "<cmd>bnext<cr>", { desc = "Next buffer" })
map("n", "<leader>bp", "<cmd>bprevious<cr>", { desc = "Previous buffer" })
map("n", "<leader>bx", "<cmd>bdelete<cr>", { desc = "Delete current buffer" })

-- Quick save and quit
map("n", "<leader>w", "<cmd>w<cr>", { desc = "Save file" })
map("n", "<leader>q", "<cmd>q<cr>", { desc = "Quit" })
map("n", "<leader>Q", "<cmd>qa<cr>", { desc = "Quit all" })

-- Clear search highlighting
map("n", "<leader>nh", "<cmd>nohl<cr>", { desc = "Clear search highlights" })

-- Better indenting in visual mode
map("v", "<", "<gv", { desc = "Indent left and reselect" })
map("v", ">", ">gv", { desc = "Indent right and reselect" })

-- Move selected lines up/down
map("v", "J", ":m '>+1<CR>gv=gv", { desc = "Move selection down" })
map("v", "K", ":m '<-2<CR>gv=gv", { desc = "Move selection up" })
