// journey-visualizer.mts - Enhanced command parsing & execution flow visualization

export interface CommandStep {
  label: string;
  icon: string;
  type: 'parse' | 'auth' | 'command' | 'pipe' | 'redirect' | 'network' | 'filesystem' | 'complete';
  confidence?: number;
}

export interface CommandPattern {
  pattern: RegExp;
  steps: CommandStep[];
  description: string;
}

export interface CommandHistory {
  command: string;
  journey: CommandStep[];
  timestamp: number;
  success: boolean;
}

// Predefined command patterns for recognition
const COMMAND_PATTERNS: CommandPattern[] = [
  {
    pattern: /^sudo\s+/,
    steps: [{ label: 'elevate', icon: '🛡️', type: 'auth' }],
    description: 'Superuser privilege escalation'
  },
  {
    pattern: /\b(pacman|apt|apt-get|yum|dnf)\b/,
    steps: [{ label: 'package manager', icon: '📦', type: 'command' }],
    description: 'Package management operations'
  },
  {
    pattern: /\bgit\s+(clone|pull|push|fetch)/,
    steps: [
      { label: 'version control', icon: '📚', type: 'command' },
      { label: 'network sync', icon: '🌐', type: 'network' }
    ],
    description: 'Git repository operations'
  },
  {
    pattern: /\b(npm|yarn|pnpm)\s+(install|add)/,
    steps: [
      { label: 'package manager', icon: '📦', type: 'command' },
      { label: 'dependency resolution', icon: '🔗', type: 'network' }
    ],
    description: 'JavaScript package installation'
  },
  {
    pattern: /\b(curl|wget)\b/,
    steps: [
      { label: 'download', icon: '⬇️', type: 'network' },
      { label: 'filesystem', icon: '💾', type: 'filesystem' }
    ],
    description: 'File download operations'
  },
  {
    pattern: /\bdocker\b/,
    steps: [
      { label: 'container runtime', icon: '🐳', type: 'command' },
      { label: 'isolation', icon: '🔒', type: 'command' }
    ],
    description: 'Container operations'
  },
  {
    pattern: /\|/,
    steps: [{ label: 'pipeline', icon: '🔗', type: 'pipe' }],
    description: 'Command pipeline'
  },
  {
    pattern: /[<>]/,
    steps: [{ label: 'redirection', icon: '↪️', type: 'redirect' }],
    description: 'I/O redirection'
  }
];

export function getCommandJourney(cmd: string): CommandStep[] {
  const steps: CommandStep[] = [
    { label: 'parse', icon: '⌨️', type: 'parse' }
  ];

  // Check for complex patterns (pipelines, redirections)
  if (cmd.includes('|')) {
    steps.push({ label: 'pipeline setup', icon: '🔗', type: 'pipe' });
  }
  if (cmd.includes('>') || cmd.includes('<')) {
    steps.push({ label: 'I/O redirect', icon: '↪️', type: 'redirect' });
  }

  // Apply pattern recognition
  for (const pattern of COMMAND_PATTERNS) {
    if (pattern.pattern.test(cmd)) {
      steps.push(...pattern.steps.map(step => ({ ...step, confidence: 0.8 })));
    }
  }

  // Parse command parts
  const parts = cmd.split(/\s*\|\s*|\s*>\s*|\s*<\s*/);
  const mainCommand = parts[0].trim().split(' ')[0];

  // Add main command step if not already covered
  if (!steps.some(s => s.type === 'command')) {
    const commandStep = getCommandStep(mainCommand);
    if (commandStep) {
      steps.push(commandStep);
    }
  }

  // Add filesystem access for most commands
  if (!cmd.includes('pwd') && !cmd.includes('echo') && parts.length > 0) {
    steps.push({ label: 'filesystem', icon: '🗄️', type: 'filesystem' });
  }

  // Add network step for network-related commands
  if (cmd.includes('curl') || cmd.includes('wget') || cmd.includes('git clone') || 
      cmd.includes('npm install') || cmd.includes('pacman -S') || cmd.includes('apt install')) {
    steps.push({ label: 'network', icon: '🌐', type: 'network' });
  }

  // Handle multiple commands in pipeline
  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i++) {
      const subCmd = parts[i].trim().split(' ')[0];
      const subStep = getCommandStep(subCmd);
      if (subStep) {
        steps.push({ ...subStep, label: `${subStep.label} (pipe)`, confidence: 0.6 });
      }
    }
  }

  steps.push({ label: 'complete', icon: '✅', type: 'complete' });

  return steps;
}

function getCommandStep(command: string): CommandStep | null {
  const commandMap: { [key: string]: CommandStep } = {
    'sudo': { label: 'privilege escalation', icon: '🛡️', type: 'auth' },
    'pacman': { label: 'Arch package manager', icon: '📦', type: 'command' },
    'apt': { label: 'Debian package manager', icon: '📦', type: 'command' },
    'apt-get': { label: 'Debian package manager', icon: '📦', type: 'command' },
    'yum': { label: 'RPM package manager', icon: '📦', type: 'command' },
    'dnf': { label: 'RPM package manager', icon: '📦', type: 'command' },
    'git': { label: 'version control', icon: '📚', type: 'command' },
    'npm': { label: 'Node.js packages', icon: '📦', type: 'command' },
    'yarn': { label: 'Node.js packages', icon: '📦', type: 'command' },
    'pnpm': { label: 'Node.js packages', icon: '📦', type: 'command' },
    'curl': { label: 'HTTP client', icon: '🌐', type: 'network' },
    'wget': { label: 'HTTP client', icon: '🌐', type: 'network' },
    'docker': { label: 'container runtime', icon: '🐳', type: 'command' },
    'ls': { label: 'list directory', icon: '📁', type: 'filesystem' },
    'cd': { label: 'change directory', icon: '📂', type: 'filesystem' },
    'cp': { label: 'copy files', icon: '📋', type: 'filesystem' },
    'mv': { label: 'move files', icon: '📦', type: 'filesystem' },
    'rm': { label: 'remove files', icon: '🗑️', type: 'filesystem' },
    'mkdir': { label: 'create directory', icon: '📁', type: 'filesystem' },
    'touch': { label: 'create file', icon: '📄', type: 'filesystem' },
    'cat': { label: 'display file', icon: '📖', type: 'filesystem' },
    'grep': { label: 'search text', icon: '🔍', type: 'command' },
    'find': { label: 'locate files', icon: '🔍', type: 'filesystem' },
    'ps': { label: 'process list', icon: '⚙️', type: 'command' },
    'kill': { label: 'terminate process', icon: '💀', type: 'command' },
    'top': { label: 'system monitor', icon: '📊', type: 'command' },
    'htop': { label: 'system monitor', icon: '📊', type: 'command' }
  };

  return commandMap[command] || { label: command, icon: '⚙️', type: 'command' };
}

export function formatJourneyCompact(journey: CommandStep[]): string {
  return journey.map(s => s.icon).join(' → ');
}

export function formatJourneyDetailed(journey: CommandStep[]): string {
  return journey.map((s, i) => `${i + 1}. ${s.icon} ${s.label}`).join('\n');
}

export function getExecutionTree(journey: CommandStep[]): string {
  let tree = '';
  journey.forEach((step, i) => {
    const prefix = i === journey.length - 1 ? '└── ' : '├── ';
    const confidence = step.confidence ? ` (${Math.round(step.confidence * 100)}%)` : '';
    tree += `${prefix}${step.icon} ${step.label}${confidence}\n`;
  });
  return tree;
}

// Command history and pattern learning
export class CommandHistoryManager {
  private history: CommandHistory[] = [];
  private maxHistory = 100;

  addEntry(command: string, journey: CommandStep[], success: boolean) {
    this.history.push({
      command,
      journey,
      timestamp: Date.now(),
      success
    });

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  getRecentCommands(limit: number = 10): CommandHistory[] {
    return this.history.slice(-limit).reverse();
  }

  getCommandPatterns(): { pattern: string; frequency: number }[] {
    const patterns: { [key: string]: number } = {};
    
    this.history.forEach(entry => {
      const parts = entry.command.split(' ');
      const pattern = parts[0]; // Simple pattern by first word
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    });

    return Object.entries(patterns)
      .map(([pattern, frequency]) => ({ pattern, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }

  predictNextCommand(currentCommand: string): string[] {
    const suggestions: string[] = [];
    const currentParts = currentCommand.split(' ');
    
    // Find similar commands in history
    const similar = this.history
      .filter(entry => entry.command.startsWith(currentCommand) && entry.success)
      .map(entry => entry.command)
      .slice(0, 5);
    
    suggestions.push(...similar);
    
    // Add common completions
    if (currentParts.length === 1) {
      const cmd = currentParts[0];
      if (cmd === 'git') {
        suggestions.push('git status', 'git add', 'git commit', 'git push', 'git pull');
      } else if (cmd === 'npm') {
        suggestions.push('npm install', 'npm run', 'npm test', 'npm build');
      }
    }
    
    return [...new Set(suggestions)].slice(0, 5);
  }
}

export const commandHistory = new CommandHistoryManager();