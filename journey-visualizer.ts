// journey-visualizer.ts - MVP for graphical command journey
export interface CommandStep {
  label: string;
  icon: string;
}

export function getCommandJourney(cmd: string): CommandStep[] {
  // Example: sudo pacman -Syu
  return [
    { label: 'sudo (auth)', icon: '🛡️' },
    { label: 'pacman (pkg mgr)', icon: '📦' },
    { label: 'filesystem', icon: '🗄️' },
    { label: 'network', icon: '🌐' }
  ];
}
