return {
  {
    "stevearc/conform.nvim",
    -- event = 'BufWritePre', -- uncomment for format on save
    opts = require "configs.conform",
  },

  -- These are some examples, uncomment them if you want to see them work!
  {
    "neovim/nvim-lspconfig",
    config = function()
      require "configs.lspconfig"
    end,
  },

  -- test new blink
  -- { import = "nvchad.blink.lazyspec" },

  -- {
  -- 	"nvim-treesitter/nvim-treesitter",
  -- 	opts = {
  -- 		ensure_installed = {
  -- 			"vim", "lua", "vimdoc",
  --      "html", "css"
  -- 		},
  -- 	},
  -- },

  -- Productivity plugins
  {
    "folke/todo-comments.nvim",
    event = "VeryLazy",
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      require("todo-comments").setup()
    end,
  },

  {
    "folke/trouble.nvim",
    cmd = { "Trouble", "TroubleToggle" },
    config = function()
      require("trouble").setup()
    end,
  },

  {
    "akinsho/toggleterm.nvim",
    cmd = { "ToggleTerm" },
    keys = { { "<C-\\>", "<cmd>ToggleTerm<cr>", desc = "Toggle terminal" } },
    opts = {
      size = 20,
      open_mapping = [[<C-\>]],
      direction = "float",
      float_opts = {
        border = "curved",
      },
    },
  },

  -- Navigation plugins
  {
    "folke/flash.nvim",
    event = "VeryLazy",
    config = function()
      require("flash").setup()
    end,
    keys = {
      { "s", mode = { "n", "x", "o" }, function() require("flash").jump() end, desc = "Flash" },
      { "S", mode = { "n", "x", "o" }, function() require("flash").treesitter() end, desc = "Flash Treesitter" },
      { "r", mode = "o", function() require("flash").remote() end, desc = "Remote Flash" },
      { "R", mode = { "o", "x" }, function() require("flash").treesitter_search() end, desc = "Treesitter Search" },
      { "<c-s>", mode = { "c" }, function() require("flash").toggle() end, desc = "Toggle Flash Search" },
    },
  },

  {
    "ThePrimeagen/harpoon",
    branch = "harpoon2",
    dependencies = { "nvim-lua/plenary.nvim" },
    keys = {
      { "<leader>ma", function() require("harpoon"):list():add() end, desc = "Mark: Add file" },
      { "<leader>mm", function() require("harpoon").ui:toggle_quick_menu(require("harpoon"):list()) end, desc = "Mark: Menu" },
      { "<leader>m1", function() require("harpoon"):list():select(1) end, desc = "Mark: Go to file 1" },
      { "<leader>m2", function() require("harpoon"):list():select(2) end, desc = "Mark: Go to file 2" },
      { "<leader>m3", function() require("harpoon"):list():select(3) end, desc = "Mark: Go to file 3" },
      { "<leader>m4", function() require("harpoon"):list():select(4) end, desc = "Mark: Go to file 4" },
    },
    config = function()
      require("harpoon"):setup()
    end,
  },

  -- Development plugins
  {
    "github/copilot.vim",
    event = "InsertEnter",
    config = function()
      vim.g.copilot_no_tab_map = true
      vim.keymap.set("i", "<C-j>", 'copilot#Accept("\\<CR>")', {
        expr = true,
        replace_keycodes = false
      })
    end,
  },

  {
    "mfussenegger/nvim-dap",
    dependencies = {
      "rcarriga/nvim-dap-ui",
      "nvim-neotest/nvim-nio",
      "theHamsta/nvim-dap-virtual-text",
    },
    config = function()
      local dap = require("dap")
      local dapui = require("dapui")
      
      dapui.setup()
      require("nvim-dap-virtual-text").setup()

      -- Auto open/close DAP UI
      dap.listeners.after.event_initialized["dapui_config"] = function()
        dapui.open()
      end
      dap.listeners.before.event_terminated["dapui_config"] = function()
        dapui.close()
      end
      dap.listeners.before.event_exited["dapui_config"] = function()
        dapui.close()
      end
    end,
    keys = {
      { "<leader>db", function() require("dap").toggle_breakpoint() end, desc = "Toggle breakpoint" },
      { "<leader>dc", function() require("dap").continue() end, desc = "Continue" },
      { "<leader>di", function() require("dap").step_into() end, desc = "Step into" },
      { "<leader>do", function() require("dap").step_over() end, desc = "Step over" },
      { "<leader>dO", function() require("dap").step_out() end, desc = "Step out" },
      { "<leader>dr", function() require("dap").repl.open() end, desc = "Open REPL" },
      { "<leader>dl", function() require("dap").run_last() end, desc = "Run last" },
      { "<leader>du", function() require("dapui").toggle() end, desc = "Toggle DAP UI" },
    },
  },

  {
    "nvim-neotest/neotest",
    dependencies = {
      "nvim-neotest/nvim-nio",
      "nvim-lua/plenary.nvim",
      "nvim-treesitter/nvim-treesitter",
      -- Add test adapters as needed:
      -- "nvim-neotest/neotest-python",
      -- "nvim-neotest/neotest-jest",
      -- "nvim-neotest/neotest-go",
    },
    config = function()
      require("neotest").setup({
        adapters = {
          -- Configure adapters here
        },
      })
    end,
    keys = {
      { "<leader>tt", function() require("neotest").run.run() end, desc = "Run nearest test" },
      { "<leader>tf", function() require("neotest").run.run(vim.fn.expand("%")) end, desc = "Run file" },
      { "<leader>td", function() require("neotest").run.run({strategy = "dap"}) end, desc = "Debug test" },
      { "<leader>ts", function() require("neotest").summary.toggle() end, desc = "Toggle summary" },
      { "<leader>to", function() require("neotest").output.open({ enter = true }) end, desc = "Show output" },
    },
  },

  -- UI plugins
  {
    "folke/noice.nvim",
    event = "VeryLazy",
    dependencies = {
      "MunifTanjim/nui.nvim",
      "rcarriga/nvim-notify",
    },
    opts = {
      lsp = {
        override = {
          ["vim.lsp.util.convert_input_to_markdown_lines"] = true,
          ["vim.lsp.util.stylize_markdown"] = true,
          ["cmp.entry.get_documentation"] = true,
        },
      },
      presets = {
        bottom_search = true,
        command_palette = true,
        long_message_to_split = true,
        inc_rename = false,
        lsp_doc_border = false,
      },
    },
  },

  {
    "akinsho/bufferline.nvim",
    event = "VeryLazy",
    dependencies = "nvim-tree/nvim-web-devicons",
    opts = {
      options = {
        diagnostics = "nvim_lsp",
        offsets = {
          {
            filetype = "NvimTree",
            text = "File Explorer",
            text_align = "left",
            separator = true,
          },
        },
      },
    },
    keys = {
      { "<S-h>", "<cmd>BufferLineCyclePrev<cr>", desc = "Prev buffer" },
      { "<S-l>", "<cmd>BufferLineCycleNext<cr>", desc = "Next buffer" },
      { "<leader>bp", "<cmd>BufferLineTogglePin<cr>", desc = "Toggle pin" },
      { "<leader>bP", "<cmd>BufferLineGroupClose ungrouped<cr>", desc = "Delete non-pinned buffers" },
    },
  },

  -- Additional requested plugins
  {
    "gbprod/substitute.nvim",
    event = "VeryLazy",
    config = function()
      require("substitute").setup()
    end,
    keys = {
      { "gr", function() require("substitute").operator() end, desc = "Substitute operator" },
      { "grr", function() require("substitute").line() end, desc = "Substitute line" },
      { "gR", function() require("substitute").eol() end, desc = "Substitute to end of line" },
      { "gr", function() require("substitute").visual() end, mode = "x", desc = "Substitute visual" },
    },
  },

  {
    "Wansmer/treesj",
    dependencies = { "nvim-treesitter/nvim-treesitter" },
    cmd = { "TSJToggle", "TSJSplit", "TSJJoin" },
    keys = {
      { "<leader>sj", "<cmd>TSJToggle<cr>", desc = "Split/join toggle" },
    },
    config = function()
      require("treesj").setup({
        use_default_keymaps = false,
      })
    end,
  },

  {
    "folke/snacks.nvim",
    priority = 1000,
    lazy = false,
    config = function()
      require("snacks").setup({
        bigfile = { enabled = true },
        notifier = { enabled = true },
        quickfile = { enabled = true },
        statuscolumn = { enabled = true },
        words = { enabled = true },
        bufdelete = { enabled = true },
      })
    end,
    keys = {
      { "<leader>sn", function() require("snacks").notifier.show_history() end, desc = "Notification History" },
      { "<leader>un", function() require("snacks").notifier.hide() end, desc = "Dismiss All Notifications" },
      { "<leader>bd", function() require("snacks").bufdelete.delete() end, desc = "Delete Buffer" },
      { "<leader>bo", function() require("snacks").bufdelete.other() end, desc = "Delete Other Buffers" },
    },
  },


  {
    "HiPhish/rainbow-delimiters.nvim",
    event = "VeryLazy",
    config = function()
      require("rainbow-delimiters.setup").setup()
    end,
  },

  {
    "rmagatti/auto-session",
    lazy = false,
    config = function()
      vim.o.sessionoptions = "blank,buffers,curdir,folds,help,tabpages,winsize,winpos,terminal,localoptions"
      require("auto-session").setup({
        log_level = "error",
        suppressed_dirs = { "~/", "~/Downloads", "/" },
      })
    end,
  },

  {
    "nvim-lualine/lualine.nvim",
    enabled = false, -- Disable since NvChad has its own statusline
  },

  {
    "shortcuts/no-neck-pain.nvim",
    cmd = { "NoNeckPain" },
    keys = {
      { "<leader>cn", "<cmd>NoNeckPain<cr>", desc = "Center text (No Neck Pain)" },
    },
    config = function()
      require("no-neck-pain").setup({
        width = 120,
      })
    end,
  },

  {
    "christoomey/vim-tmux-navigator",
    cmd = {
      "TmuxNavigateLeft",
      "TmuxNavigateDown",
      "TmuxNavigateUp",
      "TmuxNavigateRight",
    },
    keys = {
      { "<C-h>", "<cmd>TmuxNavigateLeft<cr>", desc = "Navigate left" },
      { "<C-j>", "<cmd>TmuxNavigateDown<cr>", desc = "Navigate down" },
      { "<C-k>", "<cmd>TmuxNavigateUp<cr>", desc = "Navigate up" },
      { "<C-l>", "<cmd>TmuxNavigateRight<cr>", desc = "Navigate right" },
    },
  },

  {
    "antonk52/npm_scripts.nvim",
    ft = { "json", "javascript", "typescript", "javascriptreact", "typescriptreact" },
    config = function()
      require("npm_scripts").setup()
    end,
    keys = {
      { "<leader>ns", function() require("npm_scripts").run() end, desc = "Run npm script" },
    },
  },

  {
    "tpope/vim-rsi",
    event = { "InsertEnter", "CmdlineEnter" },
  },

  {
    "OXY2DEV/helpview.nvim",
    ft = "help",
    dependencies = {
      "nvim-treesitter/nvim-treesitter",
    },
  },

  {
    "chrishrb/gx.nvim",
    keys = { { "gx", "<cmd>Browse<cr>", mode = { "n", "x" }, desc = "Open URL" } },
    cmd = { "Browse" },
    dependencies = { "nvim-lua/plenary.nvim" },
    config = function()
      require("gx").setup({
        handlers = {
          plugin = true,
          github = true,
          brewfile = true,
          package_json = true,
          search = true,
        },
      })
    end,
  },

  {
    "bitc/vim-bad-whitespace",
    event = "VeryLazy",
  },

  {
    "lambdalisue/vim-suda",
    cmd = { "SudaRead", "SudaWrite" },
  },

  {
    "vim-scripts/bufkill.vim",
    cmd = { "BD", "BW", "BUN", "BDEL" },
  },

  {
    "fdschmidt93/telescope-egrepify.nvim",
    dependencies = { "nvim-telescope/telescope.nvim", "nvim-lua/plenary.nvim" },
    config = function()
      require("telescope").load_extension("egrepify")
    end,
    keys = {
      { "<leader>fG", function() require("telescope").extensions.egrepify.egrepify() end, desc = "Enhanced live grep" },
    },
  },

  {
    "bagohart/vim-insert-append-single-character",
    keys = {
      { "<leader>is", "<Plug>InsertSingleCharacter", desc = "Insert single character" },
      { "<leader>as", "<Plug>AppendSingleCharacter", desc = "Append single character" },
    },
  },

  {
    "chrisgrieser/nvim-rip-substitute",
    cmd = "RipSubstitute",
    keys = {
      {
        "<leader>rS",
        function() require("rip-substitute").sub() end,
        mode = { "n", "x" },
        desc = "Advanced substitute",
      },
    },
    config = function()
      require("rip-substitute").setup()
    end,
  },

  {
    "stevearc/overseer.nvim",
    cmd = {
      "OverseerRun",
      "OverseerToggle",
      "OverseerSaveBundle",
      "OverseerLoadBundle",
      "OverseerDeleteBundle",
      "OverseerRunCmd",
      "OverseerQuickAction",
      "OverseerTaskAction",
    },
    keys = {
      { "<leader>or", "<cmd>OverseerRun<cr>", desc = "Run task" },
      { "<leader>ot", "<cmd>OverseerToggle<cr>", desc = "Toggle task list" },
      { "<leader>oa", "<cmd>OverseerTaskAction<cr>", desc = "Task action" },
      { "<leader>oq", "<cmd>OverseerQuickAction<cr>", desc = "Quick action" },
    },
    config = function()
      require("overseer").setup({
        templates = { "builtin" },
        task_list = {
          direction = "bottom",
          min_height = 10,
          max_height = 20,
        },
      })
    end,
  },

  {
    "MagicDuck/grug-far.nvim",
    cmd = "GrugFar",
    keys = {
      { "<leader>sr", "<cmd>GrugFar<cr>", desc = "Search and replace (Grug Far)" },
      { "<leader>sr", mode = "v", "<cmd>GrugFar<cr>", desc = "Search and replace selection" },
    },
    config = function()
      require("grug-far").setup({
        windowCreationCommand = "vsplit",
        keymaps = {
          replace = { n = "<leader>r" },
          qflist = { n = "<leader>q" },
          syncLocations = { n = "<leader>s" },
          syncLine = { n = "<leader>l" },
          close = { n = "<leader>c" },
          historyOpen = { n = "<leader>t" },
          historyAdd = { n = "<leader>a" },
          refresh = { n = "<leader>f" },
          openLocation = { n = "<enter>" },
          gotoLocation = { n = "<leader><enter>" },
          pickHistoryEntry = { n = "<enter>" },
          abort = { n = "<leader>b" },
        },
      })
    end,
  },

  {
    "b0o/incline.nvim",
    event = "VeryLazy",
    dependencies = {
      "nvim-tree/nvim-web-devicons",
    },
    config = function()
      require("incline").setup({
        render = function(props)
          local filename = vim.fn.fnamemodify(vim.api.nvim_buf_get_name(props.buf), ":t")
          local icon, color = require("nvim-web-devicons").get_icon_color(filename)
          return {
            { icon, guifg = color },
            { " " },
            { filename },
          }
        end,
        window = {
          margin = {
            horizontal = 0,
            vertical = 0,
          },
        },
      })
    end,
  },

  -- Additional workflow plugins
  {
    "numToStr/Comment.nvim",
    event = "VeryLazy",
    config = function()
      require("Comment").setup()
    end,
  },

  {
    "sindrets/diffview.nvim",
    cmd = { "DiffviewOpen", "DiffviewClose", "DiffviewToggleFiles", "DiffviewFocusFiles", "DiffviewRefresh" },
    dependencies = "nvim-lua/plenary.nvim",
    config = function()
      require("diffview").setup()
    end,
    keys = {
      { "<leader>gd", "<cmd>DiffviewOpen<cr>", desc = "Open diffview" },
      { "<leader>gc", "<cmd>DiffviewClose<cr>", desc = "Close diffview" },
    },
  },

  {
    "ibhagwan/fzf-lua",
    cmd = "FzfLua",
    dependencies = { "nvim-tree/nvim-web-devicons" },
    keys = {
      { "<leader>zf", "<cmd>FzfLua files<cr>", desc = "FzfLua files" },
      { "<leader>zg", "<cmd>FzfLua live_grep<cr>", desc = "FzfLua grep" },
      { "<leader>zb", "<cmd>FzfLua buffers<cr>", desc = "FzfLua buffers" },
    },
    config = function()
      require("fzf-lua").setup({})
    end,
  },

  {
    "stevearc/aerial.nvim",
    cmd = { "AerialToggle", "AerialOpen", "AerialClose" },
    keys = {
      { "<leader>aa", "<cmd>AerialToggle<cr>", desc = "Toggle aerial" },
      { "{", "<cmd>AerialPrev<cr>", desc = "Aerial previous" },
      { "}", "<cmd>AerialNext<cr>", desc = "Aerial next" },
    },
    config = function()
      require("aerial").setup({
        backends = { "treesitter", "lsp", "markdown", "man" },
      })
    end,
  },

  {
    "gelguy/wilder.nvim",
    event = "CmdlineEnter",
    dependencies = {
      "romgrk/fzy-lua-native",
    },
    config = function()
      local wilder = require("wilder")
      wilder.setup({
        modes = { ":", "/", "?" },
      })
      wilder.set_option("renderer", wilder.popupmenu_renderer({
        pumblend = 20,
      }))
    end,
  },

  {
    "cenk1cenk2/jq.nvim",
    ft = { "json", "yaml" },
    cmd = { "Jq", "JqPlay" },
    config = function()
      require("jq").setup()
    end,
  },

  {
    "mrjones2014/legendary.nvim",
    cmd = "Legendary",
    keys = {
      { "<leader>lg", "<cmd>Legendary<cr>", desc = "Legendary" },
    },
    dependencies = {
      "kkharji/sqlite.lua",
      "stevearc/dressing.nvim",
    },
    config = function()
      require("legendary").setup({
        extensions = {
          lazy_nvim = true,
          which_key = {
            auto_register = true,
          },
        },
      })
    end,
  },

  {
    "nvimtools/hydra.nvim",
    event = "VeryLazy",
    config = function()
      local Hydra = require("hydra")
      
      Hydra({
        name = "Window",
        mode = "n",
        body = "<C-w>",
        heads = {
          { "h", "<C-w>h", { desc = "Move left" } },
          { "j", "<C-w>j", { desc = "Move down" } },
          { "k", "<C-w>k", { desc = "Move up" } },
          { "l", "<C-w>l", { desc = "Move right" } },
          { "H", "<C-w>5<" },
          { "J", "<C-w>5-" },
          { "K", "<C-w>5+" },
          { "L", "<C-w>5>" },
          { "=", "<C-w>=", { desc = "Equal size" } },
          { "s", "<C-w>s", { desc = "Split horizontal" } },
          { "v", "<C-w>v", { desc = "Split vertical" } },
          { "q", "<C-w>q", { desc = "Close window", exit = true } },
          { "<Esc>", nil, { exit = true, nowait = true, desc = "Exit" } },
        },
      })
    end,
  },

  {
    "Cassin01/wf.nvim",
    event = "VeryLazy",
    config = function()
      require("wf").setup()
    end,
  },

  {
    "ahmedkhalf/project.nvim",
    event = "VeryLazy",
    config = function()
      require("project_nvim").setup({
        detection_methods = { "lsp", "pattern" },
        patterns = { ".git", "_darcs", ".hg", ".bzr", ".svn", "Makefile", "package.json" },
      })
      require("telescope").load_extension("projects")
    end,
    keys = {
      { "<leader>fp", "<cmd>Telescope projects<cr>", desc = "Find projects" },
    },
  },

  {
    "folke/edgy.nvim",
    event = "VeryLazy",
    init = function()
      vim.opt.laststatus = 3
      vim.opt.splitkeep = "screen"
    end,
    config = function()
      require("edgy").setup({
        bottom = {
          {
            ft = "toggleterm",
            size = { height = 0.4 },
            filter = function(buf, win)
              return vim.api.nvim_win_get_config(win).relative == ""
            end,
          },
          "Trouble",
          { ft = "qf", title = "QuickFix" },
        },
        left = {
          {
            title = "Neo-Tree",
            ft = "neo-tree",
            filter = function(buf)
              return vim.b[buf].neo_tree_source == "filesystem"
            end,
            size = { height = 0.5 },
          },
        },
      })
    end,
  },

  {
    "aserowy/tmux.nvim",
    event = "VeryLazy",
    config = function()
      require("tmux").setup({
        copy_sync = {
          enable = true,
        },
        navigation = {
          enable_default_keybindings = false,
        },
        resize = {
          enable_default_keybindings = false,
        },
      })
    end,
  },

  {
    "kevinhwang91/nvim-ufo",
    dependencies = "kevinhwang91/promise-async",
    event = "VeryLazy",
    config = function()
      vim.o.foldcolumn = "1"
      vim.o.foldlevel = 99
      vim.o.foldlevelstart = 99
      vim.o.foldenable = true

      require("ufo").setup({
        provider_selector = function(bufnr, filetype, buftype)
          return { "treesitter", "indent" }
        end,
      })
    end,
    keys = {
      { "zR", function() require("ufo").openAllFolds() end, desc = "Open all folds" },
      { "zM", function() require("ufo").closeAllFolds() end, desc = "Close all folds" },
    },
  },

  {
    "NStefan002/screenkey.nvim",
    cmd = "Screenkey",
    config = function()
      require("screenkey").setup()
    end,
  },

  {
    "echasnovski/mini.nvim",
    event = "VeryLazy",
    config = function()
      require("mini.ai").setup() -- Better text objects
      require("mini.surround").setup() -- Surround actions
      require("mini.pairs").setup() -- Auto pairs
      require("mini.move").setup() -- Move lines/selections
    end,
  },

  {
    "m4xshen/hardtime.nvim",
    event = "VeryLazy",
    dependencies = { "MunifTanjim/nui.nvim", "nvim-lua/plenary.nvim" },
    config = function()
      require("hardtime").setup({
        disabled_filetypes = { "qf", "netrw", "NvimTree", "lazy", "mason", "oil" },
      })
    end,
  },

  -- Advanced integration plugins
  {
    "willothy/flatten.nvim",
    lazy = false,
    priority = 1001,
    config = function()
      require("flatten").setup({
        window = {
          open = "alternate",
        },
      })
    end,
  },

  {
    "glacambre/firenvim",
    build = ":call firenvim#install(0)",
    cond = not vim.g.started_by_firenvim,
  },

  {
    "kevinhwang91/nvim-fundo",
    dependencies = "kevinhwang91/promise-async",
    build = function()
      require("fundo").install()
    end,
    config = function()
      require("fundo").setup()
    end,
  },

  {
    "3rd/image.nvim",
    enabled = vim.fn.has("nvim-0.10") == 1,
    ft = { "markdown", "md", "norg" },
    dependencies = {
      "nvim-treesitter/nvim-treesitter",
    },
    config = function()
      require("image").setup({
        backend = "kitty",
        integrations = {
          markdown = {
            enabled = true,
            sizing_strategy = "auto",
          },
        },
      })
    end,
  },

  {
    "folke/persistence.nvim",
    event = "BufReadPre",
    config = function()
      require("persistence").setup({
        dir = vim.fn.expand(vim.fn.stdpath("state") .. "/sessions/"),
        options = { "buffers", "curdir", "tabpages", "winsize" },
      })
    end,
    keys = {
      { "<leader>qs", function() require("persistence").load() end, desc = "Restore Session" },
      { "<leader>ql", function() require("persistence").load({ last = true }) end, desc = "Restore Last Session" },
      { "<leader>qd", function() require("persistence").stop() end, desc = "Don't Save Current Session" },
    },
  },

  -- Power User plugins
  {
    "benlubas/molten-nvim",
    version = "^1.0.0",
    dependencies = { "3rd/image.nvim" },
    build = ":UpdateRemotePlugins",
    init = function()
      vim.g.molten_image_provider = "image.nvim"
      vim.g.molten_output_win_max_height = 20
      vim.g.molten_auto_open_output = false
      vim.g.molten_virt_text_output = true
      vim.g.molten_use_border_highlights = true
    end,
    keys = {
      { "<leader>mi", ":MoltenInit<CR>", desc = "Initialize Molten" },
      { "<leader>me", ":MoltenEvaluateOperator<CR>", desc = "Evaluate operator" },
      { "<leader>ml", ":MoltenEvaluateLine<CR>", desc = "Evaluate line" },
      { "<leader>mc", ":MoltenReevaluateCell<CR>", desc = "Re-evaluate cell" },
      { "<leader>md", ":MoltenDelete<CR>", desc = "Delete cell" },
      { "<leader>mo", ":MoltenShowOutput<CR>", desc = "Show output" },
      { "<leader>mr", ":MoltenInterrupt<CR>", desc = "Interrupt execution" },
    },
  },

  {
    "jbyuki/instant.nvim",
    cmd = { "InstantStartServer", "InstantJoinSession", "InstantStop", "InstantStatus" },
    config = function()
      vim.g.instant_username = vim.fn.hostname() .. "-" .. os.getenv("USER")
    end,
    keys = {
      { "<leader>is", ":InstantStartServer 0.0.0.0 8080<CR>", desc = "Start instant server" },
      { "<leader>ij", ":InstantJoinSession ", desc = "Join instant session" },
      { "<leader>ix", ":InstantStop<CR>", desc = "Stop instant" },
      { "<leader>iu", ":InstantStatus<CR>", desc = "Instant status" },
    },
  },

  {
    "nvim-neotest/neotest-python",
    ft = "python",
  },

  {
    "nvim-neotest/neotest-jest",
    ft = { "javascript", "typescript", "javascriptreact", "typescriptreact" },
  },

  {
    "rouge8/neotest-rust",
    ft = "rust",
  },

  {
    "akinsho/git-conflict.nvim",
    event = "VeryLazy",
    config = function()
      require("git-conflict").setup({
        default_mappings = {
          ours = "<leader>co",
          theirs = "<leader>ct",
          none = "<leader>cn",
          both = "<leader>cb",
          next = "]x",
          prev = "[x",
        },
      })
    end,
  },

  {
    "pwntester/octo.nvim",
    cmd = "Octo",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-telescope/telescope.nvim",
      "nvim-tree/nvim-web-devicons",
    },
    config = function()
      require("octo").setup({
        enable_builtin = true,
      })
    end,
    keys = {
      { "<leader>go", "<cmd>Octo<cr>", desc = "Octo" },
      { "<leader>gp", "<cmd>Octo pr list<cr>", desc = "List PRs" },
      { "<leader>gi", "<cmd>Octo issue list<cr>", desc = "List issues" },
    },
  },

  {
    "rest-nvim/rest.nvim",
    dependencies = { "nvim-lua/plenary.nvim" },
    ft = "http",
    config = function()
      require("rest-nvim").setup({
        result_split_horizontal = false,
        result_split_in_place = false,
        skip_ssl_verification = false,
        encode_url = true,
        highlight = {
          enabled = true,
          timeout = 150,
        },
        result = {
          show_url = true,
          show_curl_command = false,
          show_http_info = true,
          show_headers = true,
          formatters = {
            json = "jq",
            html = function(body)
              return vim.fn.system({"tidy", "-i", "-q", "-"}, body)
            end,
          },
        },
      })
    end,
    keys = {
      { "<leader>rr", "<Plug>RestNvim<cr>", desc = "Run REST request" },
      { "<leader>rp", "<Plug>RestNvimPreview<cr>", desc = "Preview REST request" },
      { "<leader>rl", "<Plug>RestNvimLast<cr>", desc = "Run last REST request" },
    },
  },

  {
    "danymat/neogen",
    dependencies = "nvim-treesitter/nvim-treesitter",
    cmd = "Neogen",
    config = function()
      require("neogen").setup({
        snippet_engine = "luasnip",
      })
    end,
    keys = {
      { "<leader>ng", ":Neogen<cr>", desc = "Generate documentation" },
    },
  },

  {
    "ThePrimeagen/refactoring.nvim",
    dependencies = {
      "nvim-lua/plenary.nvim",
      "nvim-treesitter/nvim-treesitter",
    },
    keys = {
      { "<leader>re", ":Refactor extract ", mode = "x", desc = "Extract function" },
      { "<leader>rf", ":Refactor extract_to_file ", mode = "x", desc = "Extract to file" },
      { "<leader>rv", ":Refactor extract_var ", mode = "x", desc = "Extract variable" },
      { "<leader>ri", ":Refactor inline_var", mode = { "n", "x" }, desc = "Inline variable" },
      { "<leader>rI", ":Refactor inline_func", desc = "Inline function" },
    },
    config = function()
      require("refactoring").setup()
    end,
  },
}
