// mvp-demo.mts - Main orchestrator for custom terminal visualization
import { getWeather, getWeatherMock } from './weather.mjs';
import { getCommandJourney, formatJourneyCompact } from './journey-visualizer.mjs';
import { showStatusBar } from './overlay.mjs';
import { traceCommandSyscalls } from './tracer.mjs';
async function main() {
    const args = process.argv.slice(2);
    const command = args.length > 0 ? args.join(' ') : 'sudo pacman -S neofetch';
    console.log(`[Overlay]: Starting terminal demo...`);
    console.log(`[Overlay]: Command: "${command}"`);
    // Get weather
    console.log(`[Overlay]: Fetching weather...`);
    let weather;
    try {
        weather = await getWeather();
    }
    catch (error) {
        console.log(`[Overlay]: Weather fetch failed, using mock data`);
        weather = getWeatherMock();
    }
    // Get command journey
    const journey = getCommandJourney(command);
    const journeyStr = formatJourneyCompact(journey);
    // Trace actual syscalls
    console.log(`[Overlay]: Tracing syscalls...`);
    let traceResult;
    try {
        traceResult = await traceCommandSyscalls(command);
        console.log(`[Overlay]: Traced ${traceResult.totalSyscalls} syscalls in ${traceResult.executionTime}ms`);
    }
    catch (error) {
        console.log(`[Overlay]: Tracing failed, using estimation`);
        // Fallback to estimation
        const estimated = estimateSyscalls(command);
        traceResult = {
            totalSyscalls: estimated,
            syscallBreakdown: [],
            executionTime: 0,
            command
        };
    }
    // Get current user and directory
    const username = process.env.USER || process.env.USERNAME || 'user';
    const currentDir = process.cwd().split('/').pop() || '~';
    // Get current time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    // Format output
    const output = `${timeStr} 🌍 ${weather.description} ${weather.temperature}°C | 📍 ${journeyStr} | 📊 ${traceResult.totalSyscalls} syscalls`;
    showStatusBar({
        time: timeStr,
        weather: weather,
        journey: journeyStr,
        syscalls: traceResult.totalSyscalls,
        username: username,
        currentDir: currentDir,
        traceResult: traceResult
    });
}
function estimateSyscalls(cmd) {
    // Rough estimation based on command type
    let base = 100;
    if (cmd.includes('sudo'))
        base += 50;
    if (cmd.includes('pacman') || cmd.includes('apt') || cmd.includes('yum'))
        base += 200;
    if (cmd.includes('git'))
        base += 150;
    if (cmd.includes('npm') || cmd.includes('yarn'))
        base += 300;
    if (cmd.includes('curl') || cmd.includes('wget'))
        base += 100;
    if (cmd.includes('docker'))
        base += 400;
    // Add some randomness
    return base + Math.floor(Math.random() * 100);
}
main().catch(console.error);
