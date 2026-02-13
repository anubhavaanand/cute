import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { getWeather } from './weather.mjs';
import { getCommandJourney, formatJourneyCompact } from './journey-visualizer.mjs';
import { SyscallStreamer } from './tracer.mjs';
import { mcpClient } from './mcp-client';
const TerminalUI = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [statusData, setStatusData] = useState(null);
    const { exit } = useApp();
    // Get MCP suggestions when input changes
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (input.trim().length > 0) {
                try {
                    const suggestions = await mcpClient.getCommandSuggestions(input);
                    setStatusData(prev => prev ? { ...prev, mcpSuggestions: suggestions } : null);
                }
                catch (error) {
                    // Ignore MCP errors
                }
            }
            else {
                setStatusData(prev => prev ? { ...prev, mcpSuggestions: [] } : null);
            }
        };
        fetchSuggestions();
    }, [input]);
    // Handle keyboard input
    useInput((inputChar, key) => {
        if (key.return) {
            if (input.trim()) {
                executeCommand(input.trim());
                setInput('');
            }
        }
        else if (key.ctrl && inputChar === 'c') {
            exit();
        }
        else if (key.backspace || key.delete) {
            setInput(prev => prev.slice(0, -1));
        }
        else if (!key.ctrl && !key.meta && inputChar) {
            setInput(prev => prev + inputChar);
        }
    });
    const executeCommand = async (command) => {
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
            const initialStatus = {
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
            streamer.on('output', (data) => {
                setOutput(prev => [...prev, data.trim()]);
            });
            streamer.on('syscall', (syscall) => {
                setStatusData(prev => {
                    if (!prev)
                        return prev;
                    const liveSyscalls = prev.liveSyscalls || [];
                    const existingIndex = liveSyscalls.findIndex(s => s.name === syscall.name);
                    if (existingIndex >= 0) {
                        liveSyscalls[existingIndex] = {
                            name: syscall.name,
                            count: syscall.count,
                            timestamp: syscall.timestamp
                        };
                    }
                    else {
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
            streamer.on('progress', (progress) => {
                setStatusData(prev => {
                    if (!prev)
                        return prev;
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
            streamer.on('error', (error) => {
                setOutput(prev => [...prev, `✗ Error: ${error.message}`]);
            });
            // Start streaming and wait for completion
            const traceResult = await streamer.startStreaming();
            // Update final status
            setStatusData(prev => {
                if (!prev)
                    return prev;
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
        }
        catch (error) {
            setOutput(prev => [...prev, `✗ Error: ${error instanceof Error ? error.message : String(error)}`]);
            setIsExecuting(false);
        }
    };
    return (_jsxs(Box, { flexDirection: "column", height: "100%", children: [_jsx(Box, { borderStyle: "round", borderColor: "blue", padding: 1, children: _jsx(Text, { color: "blue", bold: true, children: "\uD83C\uDF1F Custom Terminal - Interactive Mode" }) }), statusData && (_jsxs(Box, { borderStyle: "single", borderColor: "green", padding: 1, children: [_jsxs(Text, { children: [statusData.time, " ", statusData.username, "@", statusData.currentDir, " \uD83C\uDF0D ", statusData.weather.description, " ", statusData.weather.temperature, "\u00B0C | \uD83D\uDCCD ", statusData.journey, isExecuting && (_jsxs(Text, { color: "cyan", children: [' ', "(", statusData.journeyProgress, "% - ", statusData.currentStep, ")"] })), ' ', " | \uD83D\uDCCA ", statusData.syscalls, " syscalls", statusData.liveSyscalls && statusData.liveSyscalls.length > 0 && (_jsxs(Text, { color: "yellow", children: [' ', "[", statusData.liveSyscalls
                                        .slice(-5) // Show last 5 live syscalls
                                        .map(s => `${s.name}(${s.count})`)
                                        .join(', '), "]"] }))] }), isExecuting && (_jsxs(Box, { marginTop: 1, children: [_jsx(Text, { color: "gray", children: "Journey Progress: " }), _jsxs(Text, { color: "green", children: ["[", '█'.repeat(Math.floor(statusData.journeyProgress / 10)), '░'.repeat(10 - Math.floor(statusData.journeyProgress / 10)), "]", ' ', statusData.journeyProgress, "%"] })] }))] })), statusData?.mcpSuggestions && statusData.mcpSuggestions.length > 0 && (_jsxs(Box, { borderStyle: "single", borderColor: "magenta", padding: 1, children: [_jsx(Text, { color: "magenta", bold: true, children: "\uD83E\uDD16 AI Suggestions:" }), statusData.mcpSuggestions.slice(0, 3).map((suggestion, index) => (_jsxs(Box, { marginTop: 0, children: [_jsx(Text, { color: "cyan", children: suggestion.command }), _jsxs(Text, { color: "gray", children: [" - ", suggestion.description] })] }, index)))] })), _jsxs(Box, { flexGrow: 1, flexDirection: "column", padding: 1, children: [_jsx(Text, { color: "gray", children: "Output:" }), output.map((line, index) => (_jsx(Text, { children: line }, index))), isExecuting && (_jsx(Text, { color: "yellow", children: "\u23F3 Executing..." }))] }), _jsx(Box, { borderStyle: "single", borderColor: "cyan", padding: 1, children: _jsxs(Text, { color: "cyan", children: ["$ ", input, _jsx(Text, { color: "gray", dimColor: true, children: isExecuting ? '' : '█' })] }) }), _jsx(Box, { padding: 1, children: _jsx(Text, { color: "gray", dimColor: true, children: "Press Enter to execute \u2022 Ctrl+C to exit \u2022 Type a command above" }) })] }));
};
// CLI entry point
const runTerminalUI = () => {
    // Check if we're in a TTY environment
    if (process.stdout.isTTY) {
        render(_jsx(TerminalUI, {}));
    }
    else {
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
        streamer.on('progress', (progress) => {
            progressUpdates++;
            if (progressUpdates % 5 === 0) { // Update every 5 progress events
                console.log(`⏳ Journey: ${progress.currentStep} (${progress.journeyProgress}%) - ${progress.totalSyscalls} syscalls`);
            }
        });
        streamer.on('syscall', (syscall) => {
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
            }
            catch (error) {
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
