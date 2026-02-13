import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { getWeather } from './weather.mjs';
import { getCommandJourney, formatJourneyCompact } from './journey-visualizer.mjs';
import { traceCommandSyscalls } from './tracer.mjs';
const TerminalUI = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState([]);
    const [isExecuting, setIsExecuting] = useState(false);
    const [statusData, setStatusData] = useState(null);
    const { exit } = useApp();
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
            const status = {
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
        }
        catch (error) {
            setOutput(prev => [...prev, `✗ Error: ${error instanceof Error ? error.message : String(error)}`]);
            setIsExecuting(false);
        }
    };
    return (_jsxs(Box, { flexDirection: "column", height: "100%", children: [_jsx(Box, { borderStyle: "round", borderColor: "blue", padding: 1, children: _jsx(Text, { color: "blue", bold: true, children: "\uD83C\uDF1F Custom Terminal - Interactive Mode" }) }), statusData && (_jsx(Box, { borderStyle: "single", borderColor: "green", padding: 1, children: _jsxs(Text, { children: [statusData.time, " ", statusData.username, "@", statusData.currentDir, " \uD83C\uDF0D ", statusData.weather.description, " ", statusData.weather.temperature, "\u00B0C | \uD83D\uDCCD ", statusData.journey, " | \uD83D\uDCCA ", statusData.syscalls, " syscalls", statusData.traceResult && statusData.traceResult.syscallBreakdown.length > 0 && (_jsxs(Text, { color: "yellow", children: [' ', "[", statusData.traceResult.syscallBreakdown
                                    .sort((a, b) => b.count - a.count)
                                    .slice(0, 3)
                                    .map(s => `${s.name}(${s.count})`)
                                    .join(', '), "]"] }))] }) })), _jsxs(Box, { flexGrow: 1, flexDirection: "column", padding: 1, children: [_jsx(Text, { color: "gray", children: "Output:" }), output.map((line, index) => (_jsx(Text, { children: line }, index))), isExecuting && (_jsx(Text, { color: "yellow", children: "\u23F3 Executing..." }))] }), _jsx(Box, { borderStyle: "single", borderColor: "cyan", padding: 1, children: _jsxs(Text, { color: "cyan", children: ["$ ", input, _jsx(Text, { color: "gray", dimColor: true, children: isExecuting ? '' : '█' })] }) }), _jsx(Box, { padding: 1, children: _jsx(Text, { color: "gray", dimColor: true, children: "Press Enter to execute \u2022 Ctrl+C to exit \u2022 Type a command above" }) })] }));
};
// CLI entry point
const runTerminalUI = () => {
    render(_jsx(TerminalUI, {}));
};
// Export for use in other modules
export { TerminalUI, runTerminalUI };
// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTerminalUI();
}
