#!/bin/bash
# Orchestra Broadcast Tool

MESSAGE="$@"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_FILE="$HOME/.config/nvim/orchestra/messages.log"

# Log the broadcast
echo "[$TIMESTAMP] Broadcast: $MESSAGE" >> "$LOG_FILE"

# Send to all instances
for port in 7777 7778 7779; do
  echo "Sending to port $port..."
  nvim --server 127.0.0.1:$port --remote-send ":echo '[Orchestra] $MESSAGE'<CR>" 2>/dev/null || echo "Instance on $port not active"
done