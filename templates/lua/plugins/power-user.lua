return {
  -- Jupyter integration for Molten.nvim
  {
    "benlubas/molten-nvim",
    version = "^1.0.0", 
    dependencies = { "3rd/image.nvim" },
    build = ":UpdateRemotePlugins",
    init = function()
      vim.g.molten_image_provider = "image.nvim"
      vim.g.molten_output_win_max_height = 20
      vim.g.molten_auto_open_output = false
    end,
    keys = {
      { "<leader>mi", ":MoltenInit<CR>", desc = "Initialize Molten" },
      { "<leader>me", ":MoltenEvaluateOperator<CR>", desc = "Evaluate operator" },
      { "<leader>ml", ":MoltenEvaluateLine<CR>", desc = "Evaluate line" },
      { "<leader>mc", ":MoltenReevaluateCell<CR>", desc = "Re-evaluate cell" },
      { "<leader>md", ":MoltenDelete<CR>", desc = "Delete cell" },
      { "<leader>mo", ":MoltenShowOutput<CR>", desc = "Show output" },
    },
  },
  -- Collaborative editing for real-time sharing
  {
    "jbyuki/instant.nvim",
    cmd = { "InstantStartServer", "InstantJoinSession", "InstantStop" },
    config = function()
      vim.g.instant_username = vim.fn.hostname()
    end,
    keys = {
      { "<leader>is", ":InstantStartServer 0.0.0.0 8080<CR>", desc = "Start instant server" },
      { "<leader>ij", ":InstantJoinSession ", desc = "Join instant session" },
      { "<leader>ix", ":InstantStop<CR>", desc = "Stop instant" },
    },
  },
}
