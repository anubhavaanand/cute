// weather.rs - Weather API integration for dynamic backgrounds
// Uses Open-Meteo API (free, no API key required)

use reqwest::Error;
use serde::Deserialize;

#[derive(Deserialize, Debug, Clone)]
pub struct WeatherData {
    pub temperature: f32,
    pub weathercode: i32,
    pub description: String,
}

#[derive(Deserialize, Debug)]
struct OpenMeteoResponse {
    current_weather: CurrentWeather,
}

#[derive(Deserialize, Debug)]
struct CurrentWeather {
    temperature: f32,
    weathercode: i32,
}

pub async fn fetch_weather(latitude: f32, longitude: f32) -> Result<WeatherData, Error> {
    let url = format!(
        "https://api.open-meteo.com/v1/forecast?latitude={}&longitude={}&current_weather=true",
        latitude, longitude
    );
    let response = reqwest::get(&url).await?;
    let data: OpenMeteoResponse = response.json().await?;
    
    let description = get_weather_description(data.current_weather.weathercode);
    
    Ok(WeatherData {
        temperature: data.current_weather.temperature,
        weathercode: data.current_weather.weathercode,
        description,
    })
}

fn get_weather_description(code: i32) -> String {
    match code {
        0 => "Clear sky",
        1 => "Mainly clear",
        2 => "Partly cloudy",
        3 => "Overcast",
        45 => "Fog",
        48 => "Depositing rime fog",
        51 => "Light drizzle",
        53 => "Moderate drizzle",
        55 => "Dense drizzle",
        56 => "Light freezing drizzle",
        57 => "Dense freezing drizzle",
        61 => "Slight rain",
        63 => "Moderate rain",
        65 => "Heavy rain",
        66 => "Light freezing rain",
        67 => "Heavy freezing rain",
        71 => "Slight snow fall",
        73 => "Moderate snow fall",
        75 => "Heavy snow fall",
        77 => "Snow grains",
        80 => "Slight rain showers",
        81 => "Moderate rain showers",
        82 => "Heavy rain showers",
        85 => "Slight snow showers",
        86 => "Heavy snow showers",
        95 => "Thunderstorm",
        96 => "Thunderstorm with slight hail",
        99 => "Thunderstorm with heavy hail",
        _ => "Unknown",
    }.to_string()
}
