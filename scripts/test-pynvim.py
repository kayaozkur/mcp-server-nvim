#!/usr/bin/env python3
"""Test pynvim connection to Neovim instances"""

import pynvim
import sys

def test_connection(port):
    try:
        nvim = pynvim.attach('tcp', address='127.0.0.1', port=port)
        version = nvim.eval('v:version')
        print(f"✓ Connected to Neovim on port {port} (version: {version})")
        return True
    except Exception as e:
        print(f"✗ Failed to connect to port {port}: {e}")
        return False

if __name__ == "__main__":
    print("Testing pynvim connections...")
    print("-" * 40)
    
    ports = [7777, 7778, 7779]
    connected = 0
    
    for port in ports:
        if test_connection(port):
            connected += 1
    
    print("-" * 40)
    print(f"Connected to {connected}/{len(ports)} instances")
    
    if connected == 0:
        print("\nNo Neovim instances found. Start orchestra first:")
        print("  nvim-orchestra")
        sys.exit(1)
    else:
        print("\n✅ pynvim is working correctly!")