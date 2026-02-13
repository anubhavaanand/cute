// weather.ts - Weather API integration for dynamic backgrounds (MVP)
import fetch from 'node-fetch';

export async function getWeather(city: string, apiKey: string) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather API error');
  return res.json();
}
