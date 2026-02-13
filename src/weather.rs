// weather.rs - Weather API integration for dynamic backgrounds

use reqwest::Error;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct Weather {
    pub main: Main,
    pub weather: Vec<WeatherType>,
}

#[derive(Deserialize, Debug)]
pub struct Main {
    pub temp: f32,
}

#[derive(Deserialize, Debug)]
pub struct WeatherType {
    pub main: String,
    pub description: String,
}

pub async fn fetch_weather(api_key: &str, city: &str) -> Result<Weather, Error> {
    let url = format!(
        "https://api.openweathermap.org/data/2.5/weather?q={}&appid={}&units=metric",
        city, api_key
    );
    let resp = reqwest::get(&url).await?.json::<Weather>().await?;
    Ok(resp)
}
