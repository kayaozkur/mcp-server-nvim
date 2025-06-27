#!/usr/bin/env python3
"""Neovim Orchestrator - Control multiple Neovim instances"""

import asyncio
import pynvim
from typing import Dict, List
import os
import json

class NeovimOrchestrator:
    def __init__(self):
        self.instances = {}
        self.discover_instances()
        self.macros = {}
    
    def discover_instances(self):
        """Find all running Neovim instances"""
        sockets = []
        # Check TCP ports
        for port in range(7777, 7787):
            try:
                nvim = pynvim.attach('tcp', address='127.0.0.1', port=port)
                self.instances[f'nvim-{port}'] = nvim
                print(f"Found Neovim on port {port}")
            except:
                pass
        
        # Check Unix sockets
        for socket in ['/tmp/nvim', '/tmp/nvim-automation.sock']:
            if os.path.exists(socket):
                try:
                    nvim = pynvim.attach('socket', path=socket)
                    self.instances[socket] = nvim
                    print(f"Found Neovim on socket {socket}")
                except:
                    pass
    
    async def broadcast_command(self, cmd):
        """Send command to all Neovim instances"""
        for name, nvim in self.instances.items():
            try:
                nvim.command(cmd)
                print(f"✓ {name}: {cmd}")
            except Exception as e:
                print(f"✗ {name}: {e}")
    
    async def sync_buffers(self, source, targets):
        """Sync buffer content across instances"""
        if source not in self.instances:
            print(f"Source {source} not found")
            return
            
        content = self.instances[source].current.buffer[:]
        for target in targets:
            if target in self.instances:
                self.instances[target].current.buffer[:] = content
                print(f"✓ Synced {source} -> {target}")
    
    async def orchestrate_split_view(self):
        """Create synchronized split view across instances"""
        if len(self.instances) < 2:
            print("Need at least 2 instances for split view")
            return
            
        instances = list(self.instances.values())
        # Make first instance show file tree
        instances[0].command('NvimTreeToggle')
        # Make second instance show current file
        instances[1].command('e %')
    
    async def record_macro(self, name, commands):
        """Record a sequence of commands as a macro"""
        self.macros[name] = commands
        print(f"✓ Macro '{name}' recorded with {len(commands)} commands")
    
    async def play_macro(self, name, target='all'):
        """Play a recorded macro on target instances"""
        if name not in self.macros:
            print(f"✗ Macro '{name}' not found")
            return
            
        commands = self.macros[name]
        if target == 'all':
            for cmd in commands:
                await self.broadcast_command(cmd)
        else:
            if target in self.instances:
                for cmd in commands:
                    self.instances[target].command(cmd)
    
    async def diff_instances(self, inst1, inst2):
        """Show diff between two instances' current buffers"""
        if inst1 not in self.instances or inst2 not in self.instances:
            print("Invalid instance names")
            return
            
        # Get buffer contents
        buf1 = self.instances[inst1].current.buffer[:]
        buf2 = self.instances[inst2].current.buffer[:]
        
        # Create temp files and show diff
        import tempfile
        import subprocess
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f1:
            f1.write('\n'.join(buf1))
            file1 = f1.name
            
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f2:
            f2.write('\n'.join(buf2))
            file2 = f2.name
            
        subprocess.run(['diff', '--color=always', '-u', file1, file2])

if __name__ == "__main__":
    import sys
    orch = NeovimOrchestrator()
    
    if len(sys.argv) > 1:
        cmd = ' '.join(sys.argv[1:])
        asyncio.run(orch.broadcast_command(cmd))
    else:
        # Interactive mode
        print("Neovim Orchestrator")
        print("Commands: broadcast <cmd>, sync <source> <target1,target2>, split")
        while True:
            try:
                line = input("> ")
                parts = line.split()
                if not parts:
                    continue
                    
                if parts[0] == "broadcast":
                    asyncio.run(orch.broadcast_command(' '.join(parts[1:])))
                elif parts[0] == "sync" and len(parts) >= 3:
                    targets = parts[2].split(',')
                    asyncio.run(orch.sync_buffers(parts[1], targets))
                elif parts[0] == "split":
                    asyncio.run(orch.orchestrate_split_view())
                elif parts[0] == "macro" and len(parts) >= 3:
                    if parts[1] == "record":
                        macro_name = parts[2]
                        print(f"Recording macro '{macro_name}'. Enter commands (empty line to finish):")
                        commands = []
                        while True:
                            cmd = input("  > ")
                            if not cmd:
                                break
                            commands.append(cmd)
                        asyncio.run(orch.record_macro(macro_name, commands))
                    elif parts[1] == "play" and len(parts) >= 3:
                        target = parts[3] if len(parts) > 3 else 'all'
                        asyncio.run(orch.play_macro(parts[2], target))
                elif parts[0] == "diff" and len(parts) >= 3:
                    asyncio.run(orch.diff_instances(parts[1], parts[2]))
                elif parts[0] == "list":
                    print("\nActive instances:")
                    for name in orch.instances:
                        print(f"  - {name}")
                    print("\nRecorded macros:")
                    for name in orch.macros:
                        print(f"  - {name} ({len(orch.macros[name])} commands)")
                elif parts[0] == "help":
                    print("\nCommands:")
                    print("  broadcast <cmd>     - Send command to all instances")
                    print("  sync <src> <targets> - Sync buffer from source to targets")
                    print("  split              - Create split view layout")
                    print("  macro record <name> - Record a command sequence")
                    print("  macro play <name> [target] - Play macro (default: all)")
                    print("  diff <inst1> <inst2> - Show diff between instances")
                    print("  list               - List instances and macros")
                    print("  help               - Show this help")
                    print("  exit               - Exit orchestrator")
                elif parts[0] == "exit":
                    break
            except KeyboardInterrupt:
                break
