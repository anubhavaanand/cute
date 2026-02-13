// Animated icons that cycle
export class AnimatedIcon {
    constructor(icons, interval = 500) {
        this.currentIndex = 0;
        this.lastUpdate = Date.now();
        this.icons = icons;
        this.lastUpdate = Date.now();
    }
    getIcon() {
        const now = Date.now();
        if (now - this.lastUpdate > 500) {
            this.currentIndex = (this.currentIndex + 1) % this.icons.length;
            this.lastUpdate = now;
        }
        return this.icons[this.currentIndex];
    }
}
// Predefined animated icons
export const animatedIcons = {
    loading: new AnimatedIcon(['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']),
    weather: new AnimatedIcon(['☀️', '⛅', '☁️', '🌧️', '⛈️', '❄️']),
    network: new AnimatedIcon(['🌐', '📡', '📶', '📱']),
    filesystem: new AnimatedIcon(['💾', '💿', '📁', '📂'])
};
// Weather-based themes
export function getWeatherTheme(weathercode) {
    if (weathercode <= 1)
        return { bg: '\x1b[48;5;226m', fg: '\x1b[38;5;232m', accent: '\x1b[38;5;214m' }; // Sunny
    if (weathercode <= 3)
        return { bg: '\x1b[48;5;250m', fg: '\x1b[38;5;232m', accent: '\x1b[38;5;244m' }; // Cloudy
    if (weathercode >= 51)
        return { bg: '\x1b[48;5;39m', fg: '\x1b[38;5;15m', accent: '\x1b[38;5;27m' }; // Rainy
    return { bg: '\x1b[48;5;255m', fg: '\x1b[38;5;232m', accent: '\x1b[38;5;240m' }; // Default
}
// Progress bar component
export class ProgressBar {
    render(data) {
        if (!data.progress)
            return '';
        const width = 30;
        const filled = Math.round((data.progress / 100) * width);
        const empty = width - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        const percent = data.progress.toFixed(1);
        return `\x1b[32m[${bar}]\x1b[0m ${percent}% ${data.currentStep || ''}`;
    }
}
// Status line component with animations
export class StatusLine {
    constructor() {
        this.timeIcon = new AnimatedIcon(['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛']);
    }
    render(data) {
        const theme = data.weather.weathercode ? getWeatherTheme(data.weather.weathercode) : { bg: '', fg: '', accent: '\x1b[36m' };
        const timeIcon = this.timeIcon.getIcon();
        // Color cycling for username and directory
        const now = new Date();
        const colorIndex = now.getSeconds() % 6;
        const userColors = ['\x1b[31m', '\x1b[32m', '\x1b[33m', '\x1b[34m', '\x1b[35m', '\x1b[36m'];
        const dirColors = ['\x1b[91m', '\x1b[92m', '\x1b[93m', '\x1b[94m', '\x1b[95m', '\x1b[96m'];
        const userColor = userColors[colorIndex];
        const dirColor = dirColors[(colorIndex + 3) % 6];
        const reset = '\x1b[0m';
        let output = `${timeIcon} ${data.time} ${userColor}${data.username}${reset}@${dirColor}${data.currentDir}${reset} `;
        output += `${theme.accent}🌍 ${data.weather.description} ${data.weather.temperature}°C${reset} | `;
        output += `📍 ${data.journey} | 📊 ${data.syscalls} syscalls`;
        // Add syscall breakdown if available
        if (data.traceResult && data.traceResult.syscallBreakdown.length > 0) {
            const topSyscalls = data.traceResult.syscallBreakdown
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map(s => `${s.name}(${s.count})`)
                .join(', ');
            output += ` [${topSyscalls}]`;
        }
        return output;
    }
}
// Journey visualization component
export class JourneyVisualizer {
    render(data) {
        if (!data.journey)
            return '';
        const steps = data.journey.split(' → ');
        let visualization = '🚀 Journey: ';
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const isLast = i === steps.length - 1;
            // Add animation for current step
            if (data.currentStep && step.includes(data.currentStep)) {
                visualization += `\x1b[32m${animatedIcons.loading.getIcon()} ${step}\x1b[0m`;
            }
            else {
                visualization += `${step}`;
            }
            if (!isLast)
                visualization += ' → ';
        }
        return visualization;
    }
}
// Main overlay manager
export class OverlayManager {
    constructor() {
        this.components = [];
    }
    addComponent(component) {
        this.components.push(component);
    }
    render(data) {
        return this.components.map(comp => comp.render(data)).filter(line => line.length > 0);
    }
    update() {
        this.components.forEach(comp => {
            if (comp.update)
                comp.update();
        });
    }
}
// Convenience functions
export function showOverlay(message) {
    console.log(`[Overlay]: ${message}`);
}
export function showStatusLine(data) {
    const manager = new OverlayManager();
    manager.addComponent(new StatusLine());
    const lines = manager.render(data);
    lines.forEach(line => console.log(line));
}
export function showStatusBar(data) {
    const manager = new OverlayManager();
    manager.addComponent(new StatusLine());
    manager.addComponent(new ProgressBar());
    manager.addComponent(new JourneyVisualizer());
    const lines = manager.render(data);
    lines.forEach(line => console.log(line));
}
export function createProgressBar(progress, width = 20) {
    const filled = Math.round(progress * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}
export function formatWithColor(text, color) {
    const colors = {
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
