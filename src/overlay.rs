// overlay.rs - UI overlay system for icons, animations, and quick actions

use crate::weather::WeatherData;
use crate::visualizer::CommandStep;
use chrono::{Local, Timelike};

#[derive(Debug)]
pub struct StatusData {
    pub time: String,
    pub weather: WeatherData,
    pub journey: String,
    pub username: String,
    pub current_dir: String,
    pub syscalls: u32,
}

pub fn render_status_line(status: &StatusData) {
    println!("┌─ {} {}@{} 🌍 {} {}°C | 📍 {} | 📊 {} syscalls ─┐",
             status.time,
             status.username,
             status.current_dir,
             status.weather.description,
             status.weather.temperature,
             status.journey,
             status.syscalls);
}

pub fn create_status_data(weather: WeatherData, journey: Vec<CommandStep>, username: &str, current_dir: &str, syscalls: u32) -> StatusData {
    let now = Local::now();
    let time_str = format!("{:02}:{:02}:{:02}", now.hour(), now.minute(), now.second());
    let journey_str = crate::visualizer::format_journey_compact(&journey);
    
    StatusData {
        time: time_str,
        weather,
        journey: journey_str,
        username: username.to_string(),
        current_dir: current_dir.to_string(),
        syscalls,
    }
}

pub fn render_overlay() {
    // TODO: Draw overlays (progress bars, icons, etc.)
    // Placeholder: print overlay info
    println!("[Overlay: Progress/Icons/Weather]");
}
