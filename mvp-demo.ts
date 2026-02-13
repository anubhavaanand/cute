// mvp-demo.ts - Sample MVP runner for the custom terminal project
import { getWeather } from './weather';
import { getCommandJourney } from './journey-visualizer';
import { showOverlay } from './overlay';

async function main() {
  // Weather demo
  const city = 'London';
  const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
  try {
    const weather = await getWeather(city, apiKey);
    showOverlay(`Weather in ${city}: ${weather.weather[0].main}, ${weather.main.temp}°C`);
  } catch (e) {
    showOverlay('Weather fetch failed');
  }

  // Command journey demo
  const journey = getCommandJourney('sudo pacman -Syu');
  showOverlay('Command Journey: ' + journey.map(s => `${s.icon} ${s.label}`).join(' → '));
}

main();
