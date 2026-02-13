// overlay.mts - Terminal visualization and ANSI colors
import { TraceResult } from './tracer.mjs';

export interface StatusData {
  time: string;
  weather: { description: string; temperature: number };
  journey: string;
  syscalls: number;
  username: string;
  currentDir: string;
  traceResult?: TraceResult;
}

export function showOverlay(message: string) {
  console.log(`[Overlay]: ${message}`);
}

export function showStatusLine(data: StatusData) {
  // Color cycling for username and directory based on time
  const now = new Date();
  const colorIndex = now.getSeconds() % 6; // Cycle every second
  
  const userColors = ['\x1b[31m', '\x1b[32m', '\x1b[33m', '\x1b[34m', '\x1b[35m', '\x1b[36m']; // Red, Green, Yellow, Blue, Magenta, Cyan
  const dirColors = ['\x1b[91m', '\x1b[92m', '\x1b[93m', '\x1b[94m', '\x1b[95m', '\x1b[96m']; // Bright versions
  
  const userColor = userColors[colorIndex];
  const dirColor = dirColors[(colorIndex + 3) % 6]; // Offset for different color
  const reset = '\x1b[0m';
  
  let output = `${data.time} ${userColor}${data.username}${reset}@${dirColor}${data.currentDir}${reset} 🌍 ${data.weather.description} ${data.weather.temperature}°C | 📍 ${data.journey} | 📊 ${data.syscalls} syscalls`;
  
  // Add syscall breakdown if available
  if (data.traceResult && data.traceResult.syscallBreakdown.length > 0) {
    const topSyscalls = data.traceResult.syscallBreakdown
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(s => `${s.name}(${s.count})`)
      .join(', ');
    output += ` [${topSyscalls}]`;
  }
  
  console.log(output);
}

export function showStatusBar(data: StatusData) {
  const bar = `┌─ ${data.time} ── Weather: ${data.weather.description} ${data.weather.temperature}°C ── Syscalls: ${data.syscalls} ─┐`;
  const journey = `│ ${data.journey} │`;
  const bottom = '└' + '─'.repeat(bar.length - 2) + '┘';
  
  console.log(bar);
  console.log(journey);
  console.log(bottom);
}

export function createProgressBar(progress: number, width: number = 20): string {
  const filled = Math.round(progress * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export function formatWithColor(text: string, color: string): string {
  const colors: { [key: string]: string } = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    reset: '\x1b[0m'
  };
  return (colors[color] || '') + text + (colors.reset || '');
}
