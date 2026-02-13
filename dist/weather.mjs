// weather.mts - Real-time weather integration for dynamic backgrounds
// Uses Open-Meteo API (free, no API key required)
export async function getWeather(latitude = 28.6139, longitude = 77.209) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode&timezone=auto`;
        const response = await fetch(url);
        if (!response.ok)
            throw new Error('Weather API error');
        const data = await response.json();
        const current = data.current_weather;
        const temp = current.temperature;
        const code = current.weathercode;
        const description = getWeatherDescription(code);
        const gradient = getWeatherGradient(code, temp);
        return {
            temperature: temp,
            weathercode: code,
            description,
            gradient
        };
    }
    catch (error) {
        // Fallback to mock data
        return getWeatherMock();
    }
}
export function getWeatherMock() {
    const now = new Date();
    const hour = now.getHours();
    // Time-based mock weather
    let temp;
    let code;
    let desc;
    if (hour >= 6 && hour < 12) {
        temp = 22 + Math.random() * 5; // Morning: 22-27°C
        code = 0; // Clear
        desc = 'Clear morning';
    }
    else if (hour >= 12 && hour < 18) {
        temp = 28 + Math.random() * 7; // Afternoon: 28-35°C
        code = 1; // Partly cloudy
        desc = 'Sunny afternoon';
    }
    else if (hour >= 18 && hour < 22) {
        temp = 24 + Math.random() * 4; // Evening: 24-28°C
        code = 2; // Cloudy
        desc = 'Pleasant evening';
    }
    else {
        temp = 18 + Math.random() * 4; // Night: 18-22°C
        code = 0; // Clear
        desc = 'Clear night';
    }
    return {
        temperature: Math.round(temp),
        weathercode: code,
        description: desc,
        gradient: getWeatherGradient(code, temp)
    };
}
function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
}
function getWeatherGradient(code, temp) {
    // Generate CSS gradient based on weather
    if (code === 0 || code === 1) { // Clear
        return `linear-gradient(135deg, #87CEEB, #4169E1)`; // Blue sky
    }
    else if (code === 2 || code === 3) { // Cloudy
        return `linear-gradient(135deg, #D3D3D3, #A9A9A9)`; // Grey
    }
    else if (code >= 51 && code <= 67) { // Rain
        return `linear-gradient(135deg, #8A7FBB, #483D8B)`; // Purple
    }
    else if (code >= 71 && code <= 86) { // Snow
        return `linear-gradient(135deg, #FFFFFF, #E0E0E0)`; // White
    }
    else if (code >= 95) { // Storm
        return `linear-gradient(135deg, #2F2F2F, #1a1a1a)`; // Dark
    }
    else {
        return `linear-gradient(135deg, #667eea, #764ba2)`; // Default
    }
}
