// journey-visualizer.mts - Command parsing & execution flow visualization

export interface CommandStep {
  label: string;
  icon: string;
}

export function getCommandJourney(cmd: string): CommandStep[] {
  const steps: CommandStep[] = [
    { label: 'parse', icon: '⌨️' }
  ];

  const parts = cmd.split(' ');
  const command = parts[0];

  if (command === 'sudo') {
    steps.push({ label: 'auth', icon: '🛡️' });
    const realCmd = parts[1];
    if (realCmd === 'pacman') {
      steps.push({ label: 'pacman', icon: '📦' });
    } else if (realCmd === 'apt' || realCmd === 'apt-get') {
      steps.push({ label: 'apt', icon: '📦' });
    } else {
      steps.push({ label: realCmd, icon: '⚙️' });
    }
  } else if (command === 'pacman') {
    steps.push({ label: 'pacman', icon: '📦' });
  } else if (command === 'git') {
    steps.push({ label: 'git', icon: '📚' });
  } else if (command === 'npm' || command === 'yarn') {
    steps.push({ label: command, icon: '📦' });
  } else if (command === 'curl' || command === 'wget') {
    steps.push({ label: command, icon: '🌐' });
  } else {
    steps.push({ label: command, icon: '⚙️' });
  }

  // Add common steps
  steps.push({ label: 'filesystem', icon: '🗄️' });
  
  if (cmd.includes('pacman') || cmd.includes('apt') || cmd.includes('curl') || cmd.includes('wget') || cmd.includes('git clone')) {
    steps.push({ label: 'network', icon: '🌐' });
  }

  steps.push({ label: 'complete', icon: '✅' });

  return steps;
}

export function formatJourneyCompact(journey: CommandStep[]): string {
  return journey.map(s => `${s.icon} ${s.label}`).join(' → ');
}

export function formatJourneyDetailed(journey: CommandStep[]): string {
  return journey.map((s, i) => `${i + 1}. ${s.icon} ${s.label}`).join('\n');
}

export function getExecutionTree(journey: CommandStep[]): string {
  let tree = '';
  journey.forEach((step, i) => {
    const prefix = i === journey.length - 1 ? '└── ' : '├── ';
    tree += `${prefix}${step.icon} ${step.label}\n`;
  });
  return tree;
}
