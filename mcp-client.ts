// mcp-client.ts - MCP client for AI-assisted terminal features
import * as cp from 'child_process';

export interface MCPSuggestion {
  command: string;
  description: string;
  confidence: number;
}

export class MCPClient {
  private server: cp.ChildProcess | null = null;
  private isConnected = false;
  private retryCount = 0;
  private maxRetries = 3;

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      if (this.retryCount >= this.maxRetries) {
        reject(new Error(`MCP connection failed after ${this.maxRetries} attempts`));
        return;
      }

      this.retryCount++;
      console.log(`[MCP] Attempting connection (attempt ${this.retryCount}/${this.maxRetries})`);

      try {
        this.server = cp.spawn('npx', ['-y', '@azure/mcp@latest', 'server', 'start', '--transport', 'stdio'], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, NODE_ENV: 'production' }
        });

        if (!this.server) {
          reject(new Error('Failed to spawn MCP server process'));
          return;
        }

        let connectionTimeout: NodeJS.Timeout;

        const cleanup = () => {
          if (connectionTimeout) clearTimeout(connectionTimeout);
        };

        this.server.stdout?.on('data', (data) => {
          try {
            const message = data.toString().trim();
            if (message.includes('ready') || message.includes('connected') || message.includes('listening')) {
              this.isConnected = true;
              this.retryCount = 0; // Reset retry count on success
              cleanup();
              resolve();
            }
            console.log(`[MCP]: ${message}`);
          } catch (error) {
            console.error('[MCP] Error processing stdout:', error);
          }
        });

        this.server.stderr?.on('data', (data) => {
          const errorMsg = data.toString().trim();
          console.error(`[MCP Error]: ${errorMsg}`);

          // Check for specific error conditions
          if (errorMsg.includes('command not found') || errorMsg.includes('ENOENT')) {
            cleanup();
            reject(new Error('MCP server not available. Please install @azure/mcp package.'));
          }
        });

        this.server.on('close', (code) => {
          this.isConnected = false;
          console.log(`MCP server exited with code ${code}`);
          if (code !== 0 && code !== null) {
            cleanup();
            reject(new Error(`MCP server exited unexpectedly with code ${code}`));
          }
        });

        this.server.on('error', (error) => {
          this.isConnected = false;
          console.error('[MCP] Process error:', error);
          cleanup();
          reject(error);
        });

        // Timeout after 15 seconds
        connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            this.disconnect();
            reject(new Error('MCP connection timeout'));
          }
        }, 15000);

      } catch (error) {
        reject(new Error(`Failed to start MCP server: ${error}`));
      }
    });
  }

  async getCommandSuggestions(partialCommand: string): Promise<MCPSuggestion[]> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      // For now, return mock suggestions based on partial command
      // In a real implementation, this would send a request to the MCP server
      return this.generateMockSuggestions(partialCommand);
    } catch (error) {
      console.warn('[MCP] Connection failed, falling back to mock suggestions:', error);
      // Fallback to mock suggestions if MCP is unavailable
      return this.generateMockSuggestions(partialCommand);
    }
  }

  private generateMockSuggestions(partial: string): MCPSuggestion[] {
    const suggestions: MCPSuggestion[] = [];

    if (partial.startsWith('git ')) {
      suggestions.push(
        { command: 'git status', description: 'Check repository status', confidence: 0.9 },
        { command: 'git add .', description: 'Stage all changes', confidence: 0.8 },
        { command: 'git commit -m "message"', description: 'Commit with message', confidence: 0.8 },
        { command: 'git push', description: 'Push to remote', confidence: 0.7 }
      );
    } else if (partial.startsWith('npm ')) {
      suggestions.push(
        { command: 'npm install', description: 'Install dependencies', confidence: 0.9 },
        { command: 'npm run build', description: 'Build the project', confidence: 0.8 },
        { command: 'npm start', description: 'Start the application', confidence: 0.8 },
        { command: 'npm test', description: 'Run tests', confidence: 0.7 }
      );
    } else if (partial.startsWith('sudo ')) {
      suggestions.push(
        { command: 'sudo apt update', description: 'Update package lists', confidence: 0.8 },
        { command: 'sudo apt upgrade', description: 'Upgrade packages', confidence: 0.7 },
        { command: 'sudo pacman -Syu', description: 'Update Arch packages', confidence: 0.8 }
      );
    } else {
      suggestions.push(
        { command: 'ls -la', description: 'List all files with details', confidence: 0.6 },
        { command: 'pwd', description: 'Print working directory', confidence: 0.5 },
        { command: 'clear', description: 'Clear terminal screen', confidence: 0.4 }
      );
    }

    return suggestions.filter(s => s.command.startsWith(partial)).slice(0, 5);
  }

  disconnect(): void {
    if (this.server) {
      this.server.kill();
      this.server = null;
      this.isConnected = false;
    }
  }
}

// Export singleton instance
export const mcpClient = new MCPClient();
