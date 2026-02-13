import { useState } from 'react';
import { render, Box, useInput, useApp } from 'ink';
import { getWeather } from './weather.mjs';
import { getCommandJourney } from './journey-visualizer.mjs';
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
            const journey = getCommandJourney(command);
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
                journey: journey.compact,
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
            setOutput(prev => [...prev, `✗ Error: ${error.message}`]);
            setIsExecuting(false);
        }
    };
    return flexDirection = "column";
    height = "100%" >
        { /* Header */}
        < Box;
    borderStyle = "round";
    borderColor = "blue";
    padding = { 1:  } >
        color;
    "blue";
    bold >
    ;
};
Custom;
Terminal - Interactive;
Mode
    < /Text>
    < /Box>;
{ /* Status Bar */ }
{
    statusData && borderStyle;
    "single";
    borderColor = "green";
    padding = { 1:  } >
        { statusData, : .time };
    {
        statusData.username;
    }
    {
        statusData.weather.description;
    }
    {
        statusData.weather.temperature;
    }
    C | ;
    {
        statusData.journey;
    }
     | ;
    {
        statusData.syscalls;
    }
    syscalls;
    {
        statusData.traceResult && statusData.traceResult.syscallBreakdown.length > 0 && color;
        "yellow" >
            { ' ':  }[{ statusData, : .traceResult.syscallBreakdown
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3)
                    .map(s => `${s.name}(${s.count})`)
                    .join(', ') }]
            < /Text>;
    }
    /Text>
        < /Box>;
}
{ /* Output Area */ }
flexGrow;
{
    1;
}
flexDirection = "column";
padding = { 1:  } >
    color;
"gray" > Output;
/Text>;
{
    output.map((line, index) => key = { index } > { line } < /Text>);
}
{
    isExecuting && color;
    "yellow" > ;
    Executing;
    /Text>;
}
/Box>;
{ /* Input Area */ }
borderStyle;
"single";
borderColor = "cyan";
padding = { 1:  } >
    color;
"cyan" >
    $;
{
    input;
}
color;
"gray";
dimColor >
    { isExecuting, '': '█' }
    < /Text>
    < /Text>
    < /Box>;
{ /* Footer */ }
padding;
{
    1;
}
 >
    color;
"gray";
dimColor >
    Press;
Enter;
to;
execute;
Ctrl + C;
to;
exit;
Type;
a;
command;
above
    < /Text>
    < /Box>
    < /Box>;
;
;
// CLI entry point
const runTerminalUI = () => {
    render(/>);
};
// Export for use in other modules
export { TerminalUI, runTerminalUI };
// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTerminalUI();
}
