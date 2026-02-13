import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { getWeather } from './weather.mjs';
import { getCommandJourney, formatJourneyCompact } from './journey-visualizer.mjs';
import { traceCommandSyscalls } from './tracer.mjs';
import { showStatusLine } from './overlay.mjs';

interface WeatherData {
  description: string;
  temperature: number;
  gradient?: string;
}

interface TraceResult {
  totalSyscalls: number;
  syscallBreakdown: Array<{ name: string; count: number }>;
}

interface StatusData {
  time: string;
  weather: WeatherData;
  journey: string;
  syscalls: number;
  username: string;
  currentDir: string;
  traceResult?: TraceResult;
}

const TerminalUI = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const { exit } = useApp();

  // Handle keyboard input
  useInput((inputChar, key) => {
    if (key.return) {
      if (input.trim()) {
        executeCommand(input.trim());
        setInput('');
      }
    } else if (key.ctrl && inputChar === 'c') {
      exit();
    } else if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
    } else if (!key.ctrl && !key.meta && inputChar) {
      setInput(prev => prev + inputChar);
    }
  });

  const executeCommand = async (command: string) => {
    setIsExecuting(true);
    setOutput(prev => [...prev, `$ ${command}`]);

    try {
      // Get weather data
      const weather = await getWeather();

      // Get command journey
      const journeySteps = getCommandJourney(command);
      const journeyStr = formatJourneyCompact(journeySteps);

      // Trace syscalls
      const traceResult = await traceCommandSyscalls(command);

      // Get system info
      const username = process.env.USER || 'user';
      const currentDir = process.cwd().split('/').pop() || '~';

      // Create status data
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const status: StatusData = {
        time: timeStr,
        weather,
        journey: journeyStr,
        syscalls: traceResult.totalSyscalls,
        username,
        currentDir,
        traceResult
      };

      setStatusData(status);

      // Simulate command execution (in real implementation, this would actually run the command)
      setTimeout(() => {
        setOutput(prev => [...prev, `✓ Command completed: ${command}`]);
        setIsExecuting(false);
      }, 1000);

    } catch (error) {
      setOutput(prev => [...prev, `✗ Error: ${error instanceof Error ? error.message : String(error)}`]);
      setIsExecuting(false);
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="round" borderColor="blue" padding={1}>
        <Text color="blue" bold>
          🌟 Custom Terminal - Interactive Mode
        </Text>
      </Box>

      {/* Status Bar */}
      {statusData && (
        <Box borderStyle="single" borderColor="green" padding={1}>
          <Text>
            {statusData.time} {statusData.username}@{statusData.currentDir} 🌍 {statusData.weather.description} {statusData.weather.temperature}°C | 📍 {statusData.journey} | 📊 {statusData.syscalls} syscalls
            {statusData.traceResult && statusData.traceResult.syscallBreakdown.length > 0 && (
              <Text color="yellow">
                {' '}[
                {statusData.traceResult.syscallBreakdown
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 3)
                  .map(s => `${s.name}(${s.count})`)
                  .join(', ')}
                ]
              </Text>
            )}
          </Text>
        </Box>
      )}

      {/* Output Area */}
      <Box flexGrow={1} flexDirection="column" padding={1}>
        <Text color="gray">Output:</Text>
        {output.map((line, index) => (
          <Text key={index}>{line}</Text>
        ))}
        {isExecuting && (
          <Text color="yellow">⏳ Executing...</Text>
        )}
      </Box>

      {/* Input Area */}
      <Box borderStyle="single" borderColor="cyan" padding={1}>
        <Text color="cyan">
          $ {input}
          <Text color="gray" dimColor>
            {isExecuting ? '' : '█'}
          </Text>
        </Text>
      </Box>

      {/* Footer */}
      <Box padding={1}>
        <Text color="gray" dimColor>
          Press Enter to execute • Ctrl+C to exit • Type a command above
        </Text>
      </Box>
    </Box>
  );
};

// CLI entry point
const runTerminalUI = () => {
  // Check if we're in a TTY environment
  if (process.stdout.isTTY) {
    render(<TerminalUI />);
  } else {
    // Fallback for non-TTY environments (like CI/CD or automated testing)
    console.log('🌟 Custom Terminal - Interactive Mode');
    console.log('Note: Running in non-interactive mode. Use a real terminal for full UI experience.');
    console.log('');

    // Run a simple demo command
    const demoCommand = 'echo "Hello from Custom Terminal!"';
    console.log(`$ ${demoCommand}`);

    // Simulate the execution flow
    setTimeout(async () => {
      try {
        const weather = await getWeather();
        const journeySteps = getCommandJourney(demoCommand.split(' ')[0]);
        const journeyStr = formatJourneyCompact(journeySteps);
        const traceResult = await traceCommandSyscalls(demoCommand);

        const username = process.env.USER || 'user';
        const currentDir = process.cwd().split('/').pop() || '~';
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        console.log(`✓ Command completed: ${demoCommand}`);
        console.log('');
        console.log('📊 Status Summary:');
        console.log(`   Time: ${timeStr}`);
        console.log(`   User: ${username}@${currentDir}`);
        console.log(`   Weather: 🌤️ ${weather.description} ${weather.temperature}°C`);
        console.log(`   Journey: 🧭 ${journeyStr}`);
        console.log(`   Syscalls: 📊 ${traceResult.totalSyscalls} total`);
        if (traceResult.syscallBreakdown.length > 0) {
          const topSyscalls = traceResult.syscallBreakdown
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map(s => `${s.name}(${s.count})`)
            .join(', ');
          console.log(`   Top syscalls: ${topSyscalls}`);
        }
        console.log('');
        console.log('💡 To use the interactive UI, run this in a real terminal with TTY support.');
      } catch (error) {
        console.error(`✗ Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }, 100);
  }
};

// Export for use in other modules
export { TerminalUI, runTerminalUI };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTerminalUI();
}