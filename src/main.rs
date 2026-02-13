//! main.rs - Entry point for Custom Terminal

mod weather;
mod visualizer;
mod overlay;

use crossterm::event::{self, Event, KeyCode, KeyModifiers};
use crossterm::terminal::{self, Clear, ClearType};
use crossterm::cursor;
use std::io::{self, Write, stdout};
use std::process::Command;
use std::env;
use tokio;

#[tokio::main]
async fn main() -> io::Result<()> {
    // Initialize terminal
    terminal::enable_raw_mode()?;
    let mut stdout = stdout();
    
    // Clear screen and setup
    crossterm::execute!(stdout, Clear(ClearType::All), cursor::MoveTo(0, 0))?;
    
    println!("🚀 Custom Terminal - Rust Backend");
    println!("=================================");
    println!("Press 'r' to run a demo command, 'q' to quit");
    println!();
    
    // Get initial weather
    let weather = match weather::fetch_weather(28.6139, 77.209).await {
        Ok(w) => w,
        Err(e) => {
            println!("Weather fetch failed: {}", e);
            weather::WeatherData {
                temperature: 25.0,
                weathercode: 0,
                description: "Clear".to_string(),
            }
        }
    };
    
    let username = env::var("USER").unwrap_or_else(|_| "user".to_string());
    let current_dir = env::current_dir()
        .unwrap_or_else(|_| std::path::PathBuf::from("~"))
        .file_name()
        .unwrap_or(std::ffi::OsStr::new("~"))
        .to_string_lossy()
        .to_string();
    
    // Main event loop
    let mut input_buffer = String::new();
    let mut command_history: Vec<String> = Vec::new();
    
    loop {
        // Render status line
        let journey = if command_history.is_empty() {
            vec![]
        } else {
            visualizer::get_command_journey(command_history.last().unwrap())
        };
        
        let status = overlay::create_status_data(
            weather.clone(),
            journey,
            &username,
            &current_dir,
            0 // TODO: Add syscall counting
        );
        
        // Clear and redraw
        crossterm::execute!(stdout, cursor::MoveTo(0, 0))?;
        overlay::render_status_line(&status);
        
        println!();
        println!("Command history:");
        for (i, cmd) in command_history.iter().enumerate() {
            println!("  {}. {}", i + 1, cmd);
        }
        println!();
        print!("$ {}█", input_buffer);
        stdout.flush()?;
        
        // Handle input
        if event::poll(std::time::Duration::from_millis(100))? {
            if let Event::Key(key_event) = event::read()? {
                match key_event.code {
                    KeyCode::Char('q') => break,
                    KeyCode::Char('c') if key_event.modifiers.contains(KeyModifiers::CONTROL) => break,
                    KeyCode::Char('r') => {
                        // Run demo command
                        let demo_cmd = "echo 'Hello from Rust Terminal!'";
                        run_command(demo_cmd).await?;
                        command_history.push(demo_cmd.to_string());
                    },
                    KeyCode::Char(c) => {
                        input_buffer.push(c);
                    },
                    KeyCode::Backspace => {
                        input_buffer.pop();
                    },
                    KeyCode::Enter => {
                        if !input_buffer.trim().is_empty() {
                            run_command(&input_buffer).await?;
                            command_history.push(input_buffer.clone());
                            input_buffer.clear();
                        }
                    },
                    _ => {}
                }
            }
        }
    }
    
    // Cleanup
    terminal::disable_raw_mode()?;
    println!("\nGoodbye!");
    Ok(())
}

async fn run_command(cmd: &str) -> io::Result<()> {
    println!("\n▶️  Executing: {}", cmd);
    
    // Run the command
    let output = Command::new("bash")
        .arg("-c")
        .arg(cmd)
        .output()?;
    
    // Display output
    if !output.stdout.is_empty() {
        println!("Output:");
        println!("{}", String::from_utf8_lossy(&output.stdout));
    }
    
    if !output.stderr.is_empty() {
        println!("Errors:");
        println!("{}", String::from_utf8_lossy(&output.stderr));
    }
    
    println!("✓ Command completed");
    println!();
    
    Ok(())
}
