import React, { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { getWeather } from './weather.mjs';
import { getCommandJourney, formatJourneyCompact } from './journey-visualizer.mjs';
import { traceCommandSyscalls, SyscallStreamer, StreamingTraceResult } from './tracer.mjs';
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

interface StreamingStatusData {
  time: string;
  weather: WeatherData;
  journey: string;
  journeyProgress: number;
  currentStep: string;
  syscalls: number;
  username: string;
  currentDir: string;
  traceResult?: TraceResult | StreamingTraceResult;
  liveSyscalls?: Array<{ name: string; count: number; timestamp: number }>;
}

interface StatusData extends StreamingStatusData {
  // StatusData inherits all properties from StreamingStatusData
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

      // Get system info
      const username = process.env.USER || 'user';
      const currentDir = process.cwd().split('/').pop() || '~';

      // Create initial status data
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const initialStatus: StreamingStatusData = {
        time: timeStr,
        weather,
        journey: journeyStr,
        journeyProgress: 0,
        currentStep: 'parse',
        syscalls: 0,
        username,
        currentDir,
        liveSyscalls: []
      };

      setStatusData(initialStatus);

      // Create streaming tracer
      const streamer = new SyscallStreamer(command);

      // Set up event listeners for real-time updates
      streamer.on('output', (data: string) => {
        setOutput(prev => [...prev, data.trim()]);
      });

      streamer.on('syscall', (syscall: { name: string; count: number; timestamp: number; args: string; result: string }) => {
        setStatusData(prev => {
          if (!prev) return prev;
          const liveSyscalls = prev.liveSyscalls || [];
          const existingIndex = liveSyscalls.findIndex(s => s.name === syscall.name);

          if (existingIndex >= 0) {
            liveSyscalls[existingIndex] = {
              name: syscall.name,
              count: syscall.count,
              timestamp: syscall.timestamp
            };
          } else {
            liveSyscalls.push({
              name: syscall.name,
              count: syscall.count,
              timestamp: syscall.timestamp
            });
          }

          return {
            ...prev,
            syscalls: prev.syscalls + 1,
            liveSyscalls: liveSyscalls.slice(-10) // Keep last 10 syscalls
          };
        });
      });

      streamer.on('progress', (progress: { journeyProgress: number; currentStep: string; totalSyscalls: number; syscallBreakdown: Array<{ name: string; count: number }> }) => {
        setStatusData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            journeyProgress: progress.journeyProgress,
            currentStep: progress.currentStep,
            syscalls: progress.totalSyscalls,
            liveSyscalls: progress.syscallBreakdown.slice(-10).map(s => ({
              name: s.name,
              count: s.count,
              timestamp: Date.now()
            }))
          };
        });
      });

      streamer.on('error', (error: Error) => {
        setOutput(prev => [...prev, `✗ Error: ${error.message}`]);
      });

      // Start streaming and wait for completion
      const traceResult = await streamer.startStreaming();

      // Update final status
      setStatusData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          journeyProgress: 100,
          currentStep: 'complete',
          syscalls: traceResult.totalSyscalls,
          traceResult
        };
      });

      setOutput(prev => [...prev, `✓ Command completed: ${command}`]);
      setIsExecuting(false);

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
            {statusData.time} {statusData.username}@{statusData.currentDir} 🌍 {statusData.weather.description} {statusData.weather.temperature}°C | 📍 {statusData.journey}
            {isExecuting && (
              <Text color="cyan">
                {' '}({statusData.journeyProgress}% - {statusData.currentStep})
              </Text>
            )}
            {' '} | 📊 {statusData.syscalls} syscalls
            {statusData.liveSyscalls && statusData.liveSyscalls.length > 0 && (
              <Text color="yellow">
                {' '}[
                {statusData.liveSyscalls
                  .slice(-5) // Show last 5 live syscalls
                  .map(s => `${s.name}(${s.count})`)
                  .join(', ')}
                ]
              </Text>
            )}
          </Text>
          {/* Journey Progress Bar */}
          {isExecuting && (
            <Box marginTop={1}>
              <Text color="gray">Journey Progress: </Text>
              <Text color="green">
                [{'█'.repeat(Math.floor(statusData.journeyProgress / 10))}{'░'.repeat(10 - Math.floor(statusData.journeyProgress / 10))}]
                {' '}{statusData.journeyProgress}%
              </Text>
            </Box>
          )}
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

    // Use streaming tracer for demo
    const streamer = new SyscallStreamer(demoCommand);
    let progressUpdates = 0;

    streamer.on('progress', (progress: { journeyProgress: number; currentStep: string; totalSyscalls: number }) => {
      progressUpdates++;
      if (progressUpdates % 5 === 0) { // Update every 5 progress events
        console.log(`⏳ Journey: ${progress.currentStep} (${progress.journeyProgress}%) - ${progress.totalSyscalls} syscalls`);
      }
    });

    streamer.on('syscall', (syscall: { name: string; count: number }) => {
      if (syscall.count % 10 === 0) { // Log every 10th occurrence of a syscall
        console.log(`🔍 Syscall: ${syscall.name} (${syscall.count})`);
      }
    });

    // Simulate the execution flow
    setTimeout(async () => {
      try {
        const weather = await getWeather();
        const journeySteps = getCommandJourney(demoCommand.split(' ')[0]);
        const journeyStr = formatJourneyCompact(journeySteps);
        const traceResult = await streamer.startStreaming();

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
        console.log('📊 Final Status Summary:');
        console.log(`   Time: ${timeStr}`);
        console.log(`   User: ${username}@${currentDir}`);
        console.log(`   Weather: 🌤️ ${weather.description} ${weather.temperature}°C`);
        console.log(`   Journey: 🧭 ${journeyStr} (100% complete)`);
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
if (true || import.meta.url === `file://${process.argv[1]}`) {
  runTerminalUI();
}