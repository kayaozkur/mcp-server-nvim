local uv = vim.loop
local dap = require('dap')

-- Claude Advanced Integration Module
local M = {}

-- RPC server state
local rpc_server = nil
local rpc_clients = {}

-- Claude RPC Server Setup
function M.start_rpc_server()
    if rpc_server then
        return -- Server already running
    end
    
    local server = uv.new_tcp()
    local port = 8765 -- Default port for Claude RPC
    
    server:bind("127.0.0.1", port)
    server:listen(128, function(err)
        if err then
            vim.notify("Claude RPC server error: " .. err, vim.log.levels.ERROR)
            return
        end
        
        local client = uv.new_tcp()
        server:accept(client)
        
        table.insert(rpc_clients, client)
        
        client:read_start(function(read_err, chunk)
            if read_err then
                vim.notify("Claude RPC client error: " .. read_err, vim.log.levels.ERROR)
                return
            end
            
            if chunk then
                -- Handle RPC message from Claude
                M.handle_rpc_message(client, chunk)
            else
                -- Client disconnected
                for i, c in ipairs(rpc_clients) do
                    if c == client then
                        table.remove(rpc_clients, i)
                        break
                    end
                end
                client:close()
            end
        end)
    end)
    
    rpc_server = server
    vim.notify("Claude RPC server started on port " .. port, vim.log.levels.INFO)
end

-- Handle incoming RPC messages from Claude
function M.handle_rpc_message(client, message)
    local success, data = pcall(vim.json.decode, message)
    if not success then
        vim.notify("Invalid JSON received from Claude", vim.log.levels.WARN)
        return
    end
    
    -- Process different RPC commands
    if data.method == "debug.start" then
        M.start_debug_session(data.params)
    elseif data.method == "debug.stop" then
        M.stop_debug_session()
    elseif data.method == "debug.breakpoint" then
        M.set_breakpoint(data.params)
    elseif data.method == "eval" then
        M.evaluate_expression(client, data.id, data.params)
    end
end

-- Send response back to Claude
function M.send_rpc_response(client, id, result)
    local response = {
        jsonrpc = "2.0",
        id = id,
        result = result
    }
    client:write(vim.json.encode(response))
end

-- Setup custom RPC server for automation
function M.setup_rpc()
  -- Additional automation socket with unique name based on server address
  local server_addr = vim.v.servername or 'default'
  local socket_name = '/tmp/nvim-automation-' .. vim.fn.fnamemodify(server_addr, ':t') .. '.sock'
  
  -- Only start if not already started
  pcall(function()
    vim.fn.serverstart(socket_name)
  end)
  
  -- Register custom commands for Claude
  vim.api.nvim_create_user_command('ClaudeStatus', function()
    local msg = string.format('Claude integration active on %s and %s', vim.v.servername, socket_name)
    vim.notify(msg, vim.log.levels.INFO)
  end, {})
  
  -- Quick project switcher using FZF
  vim.api.nvim_create_user_command('ClaudeProjects', function()
    require('telescope').extensions.projects.projects{}
  end, {})
  
  -- Start the new RPC server
  M.start_rpc_server()
end

-- DAP Adapter Configuration for Claude
dap.adapters.claude = {
    type = 'server',
    host = '127.0.0.1',
    port = 8766, -- Different port for DAP adapter
    executable = {
        command = 'claude-dap-adapter', -- This would be a separate executable
        args = {'--port', '8766'}
    }
}

-- Setup debug configurations for common languages
function M.setup_dap()
  local dap = require('dap')
  
  -- Python with Claude adapter
  dap.configurations.python = dap.configurations.python or {}
  table.insert(dap.configurations.python, {
      type = 'claude',
      request = 'launch',
      name = 'Claude Debug Python',
      program = '${file}',
      pythonPath = function()
          return '/usr/bin/python3'
      end,
  })
  
  -- Original Python config
  table.insert(dap.configurations.python, {
    type = 'python',
    request = 'launch',
    name = "Launch file",
    program = "${file}",
    pythonPath = function()
      return '/usr/bin/python3'
    end,
  })
  
  -- JavaScript/Node.js with Claude adapter
  dap.configurations.javascript = dap.configurations.javascript or {}
  table.insert(dap.configurations.javascript, {
      type = 'claude',
      request = 'launch',
      name = 'Claude Debug Node.js',
      program = '${file}',
      cwd = '${workspaceFolder}',
  })
  
  -- Original Node.js config
  table.insert(dap.configurations.javascript, {
    type = 'node2',
    request = 'launch',
    name = 'Launch Program',
    program = '${file}',
  })
end

-- Debug session management
function M.start_debug_session(params)
    local config = {
        type = 'claude',
        request = params.request or 'launch',
        name = 'Claude Debug Session',
        program = params.program or vim.fn.expand('%:p'),
    }
    
    -- Merge additional parameters
    for k, v in pairs(params) do
        config[k] = v
    end
    
    dap.run(config)
    vim.notify("Debug session started", vim.log.levels.INFO)
end

function M.stop_debug_session()
    dap.terminate()
    vim.notify("Debug session stopped", vim.log.levels.INFO)
end

function M.set_breakpoint(params)
    local file = params.file or vim.fn.expand('%:p')
    local line = params.line or vim.fn.line('.')
    
    dap.set_breakpoint(nil, nil, nil, file, line)
    vim.notify("Breakpoint set at " .. file .. ":" .. line, vim.log.levels.INFO)
end

function M.evaluate_expression(client, id, params)
    local expression = params.expression
    if not expression then
        M.send_rpc_response(client, id, {error = "No expression provided"})
        return
    end
    
    -- Use DAP to evaluate expression
    dap.session():evaluate(expression, function(err, resp)
        if err then
            M.send_rpc_response(client, id, {error = err.message})
        else
            M.send_rpc_response(client, id, {value = resp.result})
        end
    end)
end

-- Utility functions for Claude integration
function M.get_current_context()
    return {
        file = vim.fn.expand('%:p'),
        line = vim.fn.line('.'),
        column = vim.fn.col('.'),
        buffer_content = table.concat(vim.api.nvim_buf_get_lines(0, 0, -1, false), '\n'),
        cursor_word = vim.fn.expand('<cword>')
    }
end

function M.send_context_to_claude()
    local context = M.get_current_context()
    for _, client in ipairs(rpc_clients) do
        local message = {
            jsonrpc = "2.0",
            method = "context.update",
            params = context
        }
        client:write(vim.json.encode(message))
    end
end

-- Keybindings for Claude integration
function M.setup_keybindings()
    vim.api.nvim_set_keymap('n', '<leader>cs', ':lua require("claude-integration").start_rpc_server()<CR>', 
        {noremap = true, silent = true, desc = "Start Claude RPC server"})
    vim.api.nvim_set_keymap('n', '<leader>cc', ':lua require("claude-integration").send_context_to_claude()<CR>', 
        {noremap = true, silent = true, desc = "Send context to Claude"})
    vim.api.nvim_set_keymap('n', '<leader>db', ':lua require("dap").toggle_breakpoint()<CR>', 
        {noremap = true, silent = true, desc = "Toggle breakpoint"})
    vim.api.nvim_set_keymap('n', '<leader>dc', ':lua require("dap").continue()<CR>', 
        {noremap = true, silent = true, desc = "Debug continue"})
    vim.api.nvim_set_keymap('n', '<leader>ds', ':lua require("dap").step_over()<CR>', 
        {noremap = true, silent = true, desc = "Debug step over"})
    vim.api.nvim_set_keymap('n', '<leader>di', ':lua require("dap").step_into()<CR>', 
        {noremap = true, silent = true, desc = "Debug step into"})
    vim.api.nvim_set_keymap('n', '<leader>do', ':lua require("dap").step_out()<CR>', 
        {noremap = true, silent = true, desc = "Debug step out"})
end

-- Auto-start RPC server when Neovim starts
function M.setup()
    M.setup_keybindings()
    M.setup_dap()
    
    -- Auto-start RPC server
    vim.defer_fn(function()
        M.start_rpc_server()
    end, 1000) -- Delay to ensure everything is loaded
    
    -- Send context updates on cursor move (throttled)
    local context_timer = uv.new_timer()
    vim.api.nvim_create_autocmd({"CursorMoved", "CursorMovedI"}, {
        callback = function()
            context_timer:stop()
            context_timer:start(500, 0, function() -- 500ms throttle
                vim.schedule(M.send_context_to_claude)
            end)
        end
    })
end

-- Cleanup function
function M.cleanup()
    if rpc_server then
        rpc_server:close()
        rpc_server = nil
    end
    
    for _, client in ipairs(rpc_clients) do
        client:close()
    end
    rpc_clients = {}
end

-- Auto cleanup on exit
vim.api.nvim_create_autocmd("VimLeavePre", {
    callback = M.cleanup
})

-- Don't auto-setup to avoid conflicts
-- Call M.setup() manually if needed

return M
