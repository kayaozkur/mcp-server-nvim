#!/usr/bin/env python3
"""
Claude AI Orchestra Controller
Allows 3 Claude AI instances to command and sync with each other
"""

import asyncio
import pynvim
import json
import time
from datetime import datetime
from typing import Dict, List, Any

class ClaudeAIController:
    def __init__(self):
        self.agents = {}
        self.command_history = []
        self.sync_log = []
        self.auto_sync = False
        
    def discover_agents(self):
        """Find all running Claude AI instances"""
        for i, port in enumerate([7777, 7778, 7779], 1):
            try:
                nvim = pynvim.attach('tcp', address='127.0.0.1', port=port)
                self.agents[f'claude{i}'] = {
                    'nvim': nvim,
                    'port': port,
                    'status': 'active',
                    'last_sync': None
                }
                print(f"✓ Connected to Claude Agent {i} (Port {port})")
            except Exception as e:
                print(f"✗ Claude Agent {i} (Port {port}): {e}")
    
    def broadcast_command(self, cmd, exclude=None):
        """Send command to all agents except excluded one"""
        exclude = exclude or []
        results = {}
        
        for agent_name, agent_info in self.agents.items():
            if agent_name in exclude:
                continue
                
            try:
                agent_info['nvim'].command(cmd)
                results[agent_name] = "success"
                print(f"✓ {agent_name}: {cmd}")
            except Exception as e:
                results[agent_name] = f"error: {e}"
                print(f"✗ {agent_name}: {e}")
        
        # Log command
        self.command_history.append({
            'timestamp': datetime.now().isoformat(),
            'command': cmd,
            'results': results,
            'excluded': exclude
        })
        
        return results
    
    def sync_buffers(self, source_agent, target_agents=None):
        """Sync buffer content from source to targets"""
        if source_agent not in self.agents:
            print(f"Source agent {source_agent} not found")
            return False
            
        if target_agents is None:
            target_agents = [name for name in self.agents.keys() if name != source_agent]
        
        try:
            # Get content from source
            source_content = self.agents[source_agent]['nvim'].current.buffer[:]
            source_filename = self.agents[source_agent]['nvim'].current.buffer.name or "[No Name]"
            
            print(f"📄 Syncing '{source_filename}' from {source_agent}")
            
            # Sync to targets
            sync_results = {}
            for target in target_agents:
                if target in self.agents:
                    try:
                        self.agents[target]['nvim'].current.buffer[:] = source_content
                        sync_results[target] = "success"
                        print(f"  ✓ {source_agent} → {target}")
                    except Exception as e:
                        sync_results[target] = f"error: {e}"
                        print(f"  ✗ {source_agent} → {target}: {e}")
            
            # Log sync
            self.sync_log.append({
                'timestamp': datetime.now().isoformat(),
                'source': source_agent,
                'targets': target_agents,
                'filename': source_filename,
                'lines': len(source_content),
                'results': sync_results
            })
            
            return True
            
        except Exception as e:
            print(f"Sync failed: {e}")
            return False
    
    def diff_agents(self, agent1, agent2):
        """Compare buffer content between two agents"""
        if agent1 not in self.agents or agent2 not in self.agents:
            print("Invalid agent names")
            return
            
        try:
            content1 = self.agents[agent1]['nvim'].current.buffer[:]
            content2 = self.agents[agent2]['nvim'].current.buffer[:]
            
            file1 = self.agents[agent1]['nvim'].current.buffer.name or f"[{agent1}]"
            file2 = self.agents[agent2]['nvim'].current.buffer.name or f"[{agent2}]"
            
            print(f"\n📊 Diff: {agent1} vs {agent2}")
            print(f"File 1: {file1} ({len(content1)} lines)")
            print(f"File 2: {file2} ({len(content2)} lines)")
            
            # Simple line-by-line diff
            max_lines = max(len(content1), len(content2))
            differences = 0
            
            for i in range(max_lines):
                line1 = content1[i] if i < len(content1) else ""
                line2 = content2[i] if i < len(content2) else ""
                
                if line1 != line2:
                    differences += 1
                    if differences <= 5:  # Show first 5 differences
                        print(f"  Line {i+1}:")
                        print(f"    {agent1}: {line1[:60]}...")
                        print(f"    {agent2}: {line2[:60]}...")
            
            if differences == 0:
                print("  ✓ Files are identical")
            else:
                print(f"  📝 Found {differences} differences")
                
        except Exception as e:
            print(f"Diff failed: {e}")
    
    def create_collaboration_session(self, task_description):
        """Set up a collaborative session between agents"""
        print(f"\n🤝 Creating collaboration session: {task_description}")
        
        # Create shared workspace file
        workspace_content = [
            f"# Claude AI Orchestra Collaboration Session",
            f"# Task: {task_description}",
            f"# Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            f"# Agents: {', '.join(self.agents.keys())}",
            "",
            "## Agent Assignments:",
            "# Claude1: [Your role here]",
            "# Claude2: [Your role here]", 
            "# Claude3: [Your role here]",
            "",
            "## Collaboration Notes:",
            "# Use comments to communicate between agents",
            "# Sync changes with: sync <source> <targets>",
            "",
            "## Task Progress:",
            "# [ ] Step 1:",
            "# [ ] Step 2:",
            "# [ ] Step 3:",
            "",
        ]
        
        # Load workspace in all agents
        for agent_name, agent_info in self.agents.items():
            try:
                agent_info['nvim'].current.buffer[:] = workspace_content
                print(f"  ✓ Workspace loaded in {agent_name}")
            except Exception as e:
                print(f"  ✗ Failed to load workspace in {agent_name}: {e}")
        
        print(f"🚀 Collaboration session ready!")
        print(f"   Use 'sync claude1 claude2,claude3' to share changes")
        print(f"   Use 'broadcast :w' to save all agents")
    
    def show_status(self):
        """Show status of all agents and recent activity"""
        print(f"\n🎭 Claude AI Orchestra Status")
        print("=" * 50)
        
        print(f"\n📱 Agents ({len(self.agents)} active):")
        for agent_name, agent_info in self.agents.items():
            try:
                current_file = agent_info['nvim'].current.buffer.name or "[No Name]"
                line_count = len(agent_info['nvim'].current.buffer[:])
                print(f"  ✓ {agent_name} (Port {agent_info['port']}): {current_file} ({line_count} lines)")
            except:
                print(f"  ✗ {agent_name} (Port {agent_info['port']}): Connection lost")
        
        print(f"\n📋 Recent Commands ({len(self.command_history)}):")
        for cmd in self.command_history[-3:]:
            timestamp = cmd['timestamp'].split('T')[1][:8]
            print(f"  [{timestamp}] {cmd['command']}")
        
        print(f"\n🔄 Recent Syncs ({len(self.sync_log)}):")
        for sync in self.sync_log[-3:]:
            timestamp = sync['timestamp'].split('T')[1][:8]
            print(f"  [{timestamp}] {sync['source']} → {len(sync['targets'])} agents")
    
    async def run_interactive(self):
        """Run interactive command interface"""
        print("\n🎮 Claude AI Orchestra Controller")
        print("=" * 50)
        
        self.discover_agents()
        
        if not self.agents:
            print("❌ No Claude agents found! Start the orchestra first.")
            return
        
        print(f"\n✅ {len(self.agents)} agents connected!")
        print("\nCommands:")
        print("  broadcast <cmd>           - Send command to all agents")
        print("  sync <source> [targets]   - Sync buffer content")
        print("  diff <agent1> <agent2>    - Compare agent buffers")
        print("  collab <description>      - Start collaboration session")
        print("  status                    - Show agent status")
        print("  help                      - Show commands")
        print("  exit                      - Exit controller")
        
        while True:
            try:
                line = input("\n🎭 > ").strip()
                if not line:
                    continue
                    
                parts = line.split()
                cmd = parts[0].lower()
                
                if cmd == "broadcast":
                    if len(parts) > 1:
                        self.broadcast_command(' '.join(parts[1:]))
                    else:
                        print("Usage: broadcast <vim_command>")
                
                elif cmd == "sync":
                    if len(parts) >= 2:
                        source = parts[1]
                        targets = parts[2].split(',') if len(parts) > 2 else None
                        self.sync_buffers(source, targets)
                    else:
                        print("Usage: sync <source_agent> [target1,target2,...]")
                
                elif cmd == "diff":
                    if len(parts) >= 3:
                        self.diff_agents(parts[1], parts[2])
                    else:
                        print("Usage: diff <agent1> <agent2>")
                
                elif cmd == "collab":
                    description = ' '.join(parts[1:]) if len(parts) > 1 else "General collaboration"
                    self.create_collaboration_session(description)
                
                elif cmd == "status":
                    self.show_status()
                
                elif cmd == "help":
                    print("\nAvailable commands:")
                    print("  broadcast :w              - Save all files")
                    print("  broadcast :echo 'hello'   - Echo in all agents")
                    print("  sync claude1 claude2      - Copy claude1 to claude2")
                    print("  sync claude1              - Copy claude1 to all others")
                    print("  diff claude1 claude2      - Compare two agents")
                    print("  collab 'build web app'    - Start collaboration")
                    print("  status                    - Show detailed status")
                
                elif cmd == "exit":
                    print("👋 Exiting Claude AI Orchestra Controller")
                    break
                    
                else:
                    print(f"Unknown command: {cmd}. Type 'help' for available commands.")
                    
            except KeyboardInterrupt:
                print("\n👋 Exiting...")
                break
            except Exception as e:
                print(f"Error: {e}")

def main():
    controller = ClaudeAIController()
    asyncio.run(controller.run_interactive())

if __name__ == "__main__":
    main()
