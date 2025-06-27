-- Instance 1: Statusline Component
-- Orchestra Test: Collaborative Plugin Development

local M = {}

M.orchestra_status = function()
  local state_file = vim.fn.expand("~/.config/nvim/orchestra/state.json")
  if vim.fn.filereadable(state_file) == 1 then
    local content = vim.fn.readfile(state_file)
    local ok, state = pcall(vim.json.decode, table.concat(content))
    if ok then
      local active = 0
      for _, instance in pairs(state.instances) do
        if instance.status == "active" then
          active = active + 1
        end
      end
      return string.format("🎭 Orchestra: %d/3", active)
    end
  end
  return "🎭 Orchestra: offline"
end

return M