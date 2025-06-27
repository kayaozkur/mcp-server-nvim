#!/usr/bin/env python3
"""
VimSwarm - Multiple AI agents collaborating in Neovim
Each agent runs in a separate Neovim instance for parallel processing
"""

import asyncio
import pynvim
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import json
import tempfile
import subprocess
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Suggestion:
    agent_name: str
    type: str  # 'refactor', 'security', 'performance', 'docs'
    line_start: int
    line_end: int
    original: str
    suggested: str
    reason: str
    severity: str  # 'info', 'warning', 'error'
    confidence: float  # 0.0 to 1.0


class BaseAgent(ABC):
    """Base class for all VimSwarm agents"""
    
    def __init__(self, name: str, nvim_port: int):
        self.name = name
        self.nvim_port = nvim_port
        self.nvim = None
        
    def connect(self):
        """Connect to Neovim instance"""
        try:
            self.nvim = pynvim.attach('tcp', address='127.0.0.1', port=self.nvim_port)
            print(f"✓ {self.name} connected to port {self.nvim_port}")
            return True
        except Exception as e:
            print(f"✗ {self.name} failed to connect: {e}")
            return False
            
    @abstractmethod
    async def analyze(self, content: List[str]) -> List[Suggestion]:
        """Analyze content and return suggestions"""
        pass
    
    async def highlight_issue(self, suggestion: Suggestion):
        """Highlight issues in Neovim"""
        if self.nvim:
            # Create a custom highlight group
            self.nvim.command(f'highlight {self.name}Issue ctermbg=red guibg=#ff0000')
            
            # Add virtual text for the issue
            ns_id = self.nvim.funcs.nvim_create_namespace(self.name)
            self.nvim.funcs.nvim_buf_set_virtual_text(
                0, ns_id, suggestion.line_start - 1,
                [[f" {self.name}: {suggestion.reason}", f"{self.name}Issue"]], {}
            )


class RefactorAgent(BaseAgent):
    """Agent focused on code refactoring and clean code principles"""
    
    def __init__(self, nvim_port: int = 7777):
        super().__init__("RefactorAgent", nvim_port)
        
    async def analyze(self, content: List[str]) -> List[Suggestion]:
        suggestions = []
        
        # Check for long functions
        in_function = False
        function_start = 0
        function_lines = 0
        
        for i, line in enumerate(content):
            if 'def ' in line or 'function ' in line or 'func ' in line:
                in_function = True
                function_start = i
                function_lines = 0
            elif in_function:
                function_lines += 1
                if function_lines > 20 and (line.strip() == '' or i == len(content) - 1):
                    suggestions.append(Suggestion(
                        agent_name=self.name,
                        type='refactor',
                        line_start=function_start + 1,
                        line_end=i + 1,
                        original="Long function",
                        suggested="Split into smaller functions",
                        reason=f"Function is {function_lines} lines long (recommended: <20)",
                        severity='warning',
                        confidence=0.8
                    ))
                    in_function = False
        
        # Check for duplicate code patterns
        for i in range(len(content) - 3):
            pattern = content[i:i+3]
            for j in range(i + 3, len(content) - 3):
                if content[j:j+3] == pattern and len(''.join(pattern).strip()) > 30:
                    suggestions.append(Suggestion(
                        agent_name=self.name,
                        type='refactor',
                        line_start=i + 1,
                        line_end=i + 3,
                        original=''.join(pattern),
                        suggested="Extract to function",
                        reason="Duplicate code detected",
                        severity='info',
                        confidence=0.7
                    ))
                    break
        
        return suggestions


class SecurityAgent(BaseAgent):
    """Agent focused on security vulnerabilities and best practices"""
    
    def __init__(self, nvim_port: int = 7778):
        super().__init__("SecurityAgent", nvim_port)
        self.sensitive_patterns = [
            'password', 'api_key', 'secret', 'token', 'private_key',
            'aws_access_key', 'database_url', 'connection_string'
        ]
        
    async def analyze(self, content: List[str]) -> List[Suggestion]:
        suggestions = []
        
        for i, line in enumerate(content):
            line_lower = line.lower()
            
            # Check for hardcoded secrets
            for pattern in self.sensitive_patterns:
                if pattern in line_lower and '=' in line and ('"' in line or "'" in line):
                    suggestions.append(Suggestion(
                        agent_name=self.name,
                        type='security',
                        line_start=i + 1,
                        line_end=i + 1,
                        original=line.strip(),
                        suggested=f"{pattern.upper()} = os.getenv('{pattern.upper()}')",
                        reason=f"Possible hardcoded {pattern.replace('_', ' ')}",
                        severity='error',
                        confidence=0.9
                    ))
            
            # Check for SQL injection vulnerabilities
            if 'execute' in line_lower and '%' in line:
                suggestions.append(Suggestion(
                    agent_name=self.name,
                    type='security',
                    line_start=i + 1,
                    line_end=i + 1,
                    original=line.strip(),
                    suggested="Use parameterized queries",
                    reason="Potential SQL injection vulnerability",
                    severity='error',
                    confidence=0.85
                ))
            
            # Check for eval() usage
            if 'eval(' in line:
                suggestions.append(Suggestion(
                    agent_name=self.name,
                    type='security',
                    line_start=i + 1,
                    line_end=i + 1,
                    original=line.strip(),
                    suggested="Use ast.literal_eval() or json.loads()",
                    reason="eval() is dangerous with untrusted input",
                    severity='warning',
                    confidence=0.95
                ))
        
        return suggestions


class PerformanceAgent(BaseAgent):
    """Agent focused on performance optimization"""
    
    def __init__(self, nvim_port: int = 7779):
        super().__init__("PerformanceAgent", nvim_port)
        
    async def analyze(self, content: List[str]) -> List[Suggestion]:
        suggestions = []
        
        for i, line in enumerate(content):
            # Check for inefficient list operations in loops
            if 'for ' in line and i + 1 < len(content):
                next_line = content[i + 1]
                if '.append(' in next_line and 'for ' in line:
                    suggestions.append(Suggestion(
                        agent_name=self.name,
                        type='performance',
                        line_start=i + 1,
                        line_end=i + 2,
                        original=line + next_line,
                        suggested="Consider list comprehension",
                        reason="List comprehension is more efficient than append in loop",
                        severity='info',
                        confidence=0.7
                    ))
            
            # Check for repeated file operations
            if 'open(' in line and 'for ' in content[max(0, i-3):i]:
                suggestions.append(Suggestion(
                    agent_name=self.name,
                    type='performance',
                    line_start=i + 1,
                    line_end=i + 1,
                    original=line.strip(),
                    suggested="Move file operation outside loop",
                    reason="File I/O in loop can be slow",
                    severity='warning',
                    confidence=0.8
                ))
            
            # Check for inefficient string concatenation
            if '+=' in line and ('str(' in line or '""' in line or "''" in line):
                suggestions.append(Suggestion(
                    agent_name=self.name,
                    type='performance',
                    line_start=i + 1,
                    line_end=i + 1,
                    original=line.strip(),
                    suggested="Use list.append() and ''.join()",
                    reason="String concatenation in loop is inefficient",
                    severity='info',
                    confidence=0.6
                ))
        
        return suggestions


class DocumentationAgent(BaseAgent):
    """Agent focused on documentation and code clarity"""
    
    def __init__(self, nvim_port: int = 7777):  # Share with RefactorAgent
        super().__init__("DocumentationAgent", nvim_port)
        
    async def analyze(self, content: List[str]) -> List[Suggestion]:
        suggestions = []
        
        # Check for undocumented functions
        for i, line in enumerate(content):
            if ('def ' in line or 'function ' in line) and i + 1 < len(content):
                next_line = content[i + 1].strip()
                if not (next_line.startswith('"""') or next_line.startswith("'''")):
                    suggestions.append(Suggestion(
                        agent_name=self.name,
                        type='docs',
                        line_start=i + 1,
                        line_end=i + 1,
                        original=line.strip(),
                        suggested="Add docstring",
                        reason="Function lacks documentation",
                        severity='warning',
                        confidence=0.9
                    ))
            
            # Check for complex lines without comments
            if len(line) > 80 and '#' not in line and not line.strip().startswith('#'):
                suggestions.append(Suggestion(
                    agent_name=self.name,
                    type='docs',
                    line_start=i + 1,
                    line_end=i + 1,
                    original=line.strip()[:50] + "...",
                    suggested="Add explanatory comment",
                    reason="Complex line without explanation",
                    severity='info',
                    confidence=0.5
                ))
        
        return suggestions


class VimSwarm:
    """Orchestrator for multiple AI agents in Neovim"""
    
    def __init__(self):
        self.agents = [
            RefactorAgent(7777),
            SecurityAgent(7778),
            PerformanceAgent(7779),
            DocumentationAgent(7777)  # Shares instance with RefactorAgent
        ]
        self.results = []
        
    def initialize(self):
        """Connect all agents to their Neovim instances"""
        connected = []
        for agent in self.agents:
            if agent.connect():
                connected.append(agent)
        self.agents = connected
        return len(connected)
        
    async def analyze_buffer(self, content: List[str]) -> List[Suggestion]:
        """Run all agents in parallel and collect suggestions"""
        print(f"\n🐝 VimSwarm analyzing {len(content)} lines...")
        
        # Run all agents in parallel
        results = await asyncio.gather(*[
            agent.analyze(content) for agent in self.agents
        ])
        
        # Flatten results
        all_suggestions = []
        for agent_results in results:
            all_suggestions.extend(agent_results)
        
        # Sort by severity and line number
        severity_order = {'error': 0, 'warning': 1, 'info': 2}
        all_suggestions.sort(key=lambda s: (severity_order.get(s.severity, 3), s.line_start))
        
        return all_suggestions
    
    async def visualize_results(self, suggestions: List[Suggestion]):
        """Display results in a dedicated Neovim buffer"""
        nvim = pynvim.attach('tcp', address='127.0.0.1', port=7777)
        
        # Create results buffer
        nvim.command('vsplit')
        nvim.command('enew')
        nvim.command('setlocal buftype=nofile')
        nvim.command('setlocal bufhidden=wipe')
        nvim.command('file VimSwarm-Results')
        
        # Format results
        lines = ["# VimSwarm Analysis Results", f"Generated at: {datetime.now()}", ""]
        
        for severity in ['error', 'warning', 'info']:
            severity_suggestions = [s for s in suggestions if s.severity == severity]
            if severity_suggestions:
                lines.append(f"\n## {severity.upper()}S ({len(severity_suggestions)})")
                lines.append("")
                
                for s in severity_suggestions:
                    lines.extend([
                        f"**{s.agent_name}** - Line {s.line_start}-{s.line_end}",
                        f"- Type: {s.type}",
                        f"- Issue: {s.reason}",
                        f"- Current: `{s.original[:60]}...`" if len(s.original) > 60 else f"- Current: `{s.original}`",
                        f"- Suggestion: {s.suggested}",
                        f"- Confidence: {s.confidence:.0%}",
                        ""
                    ])
        
        # Write to buffer
        nvim.current.buffer[:] = lines
        
        # Apply syntax highlighting
        nvim.command('setlocal filetype=markdown')
        
    def merge_suggestions(self, suggestions: List[Suggestion]) -> List[Suggestion]:
        """Merge overlapping suggestions from different agents"""
        # Group by line range
        merged = []
        processed = set()
        
        for i, s1 in enumerate(suggestions):
            if i in processed:
                continue
                
            overlapping = [s1]
            for j, s2 in enumerate(suggestions[i+1:], i+1):
                if (s1.line_start <= s2.line_end and s2.line_start <= s1.line_end):
                    overlapping.append(s2)
                    processed.add(j)
            
            if len(overlapping) > 1:
                # Merge overlapping suggestions
                merged_suggestion = Suggestion(
                    agent_name="+".join([s.agent_name for s in overlapping]),
                    type="multiple",
                    line_start=min(s.line_start for s in overlapping),
                    line_end=max(s.line_end for s in overlapping),
                    original=overlapping[0].original,
                    suggested="Multiple issues detected - see individual suggestions",
                    reason="; ".join([f"{s.agent_name}: {s.reason}" for s in overlapping]),
                    severity=min(overlapping, key=lambda s: ['error', 'warning', 'info'].index(s.severity)).severity,
                    confidence=max(s.confidence for s in overlapping)
                )
                merged.append(merged_suggestion)
            else:
                merged.append(s1)
        
        return merged


def main():
    """Main entry point for VimSwarm"""
    swarm = VimSwarm()
    
    # Initialize agents
    connected_count = swarm.initialize()
    print(f"✓ Connected to {connected_count} Neovim instances")
    
    if connected_count == 0:
        print("No Neovim instances available. Start some with nvim-orchestra first.")
        return
    
    # Get content from the first Neovim instance
    try:
        nvim = pynvim.attach('tcp', address='127.0.0.1', port=7777)
        content = nvim.current.buffer[:]
        filename = nvim.current.buffer.name or "[No Name]"
        print(f"Analyzing file: {filename}")
    except Exception as e:
        print(f"Failed to get buffer content: {e}")
        return
    
    if not content or all(not line.strip() for line in content):
        print("Buffer is empty. Open a file first.")
        return
    
    # Run analysis synchronously for now (simpler approach)
    print(f"\n🐝 VimSwarm analyzing {len(content)} lines...")
    
    all_suggestions = []
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Analyze with each agent
        for agent in swarm.agents:
            suggestions = loop.run_until_complete(agent.analyze(content))
            all_suggestions.extend(suggestions)
            print(f"  ✓ {agent.name}: {len(suggestions)} suggestions")
        
        # Sort by severity and line number
        severity_order = {'error': 0, 'warning': 1, 'info': 2}
        all_suggestions.sort(key=lambda s: (severity_order.get(s.severity, 3), s.line_start))
        
        # Display results
        print(f"\n📊 Found {len(all_suggestions)} suggestions:")
        print(f"  - Errors: {len([s for s in all_suggestions if s.severity == 'error'])}")
        print(f"  - Warnings: {len([s for s in all_suggestions if s.severity == 'warning'])}")
        print(f"  - Info: {len([s for s in all_suggestions if s.severity == 'info'])}")
        
        # Show top 5 most critical issues
        if all_suggestions:
            print("\n🔥 Top Critical Issues:")
            for i, s in enumerate(all_suggestions[:5]):
                print(f"  {i+1}. Line {s.line_start}: {s.reason} ({s.agent_name})")
        
        # Create a simple results file
        with open('/tmp/vimswarm_results.txt', 'w') as f:
            f.write(f"VimSwarm Analysis Results\n")
            f.write(f"File: {filename}\n")
            f.write(f"Generated: {datetime.now()}\n\n")
            
            for severity in ['error', 'warning', 'info']:
                severity_suggestions = [s for s in all_suggestions if s.severity == severity]
                if severity_suggestions:
                    f.write(f"\n{severity.upper()}S ({len(severity_suggestions)})\n")
                    f.write("=" * 50 + "\n")
                    
                    for s in severity_suggestions:
                        f.write(f"\n{s.agent_name} - Line {s.line_start}-{s.line_end}\n")
                        f.write(f"Issue: {s.reason}\n")
                        f.write(f"Current: {s.original[:80]}...\n" if len(s.original) > 80 else f"Current: {s.original}\n")
                        f.write(f"Suggestion: {s.suggested}\n")
                        f.write(f"Confidence: {s.confidence:.0%}\n")
        
        print(f"\n✅ Analysis complete! Results saved to /tmp/vimswarm_results.txt")
        
    finally:
        loop.close()


if __name__ == "__main__":
    main()
