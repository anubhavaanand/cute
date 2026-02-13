//! main.rs - Entry point for Custom Terminal

mod weather;
mod visualizer;
mod overlay;

use crossterm::event::{self, Event, KeyCode};
use std::io::{self, Write};

fn main() -> io::Result<()> {
    println!("Welcome to Custom Terminal!");
    // TODO: Initialize weather, visualizer, and overlay modules
    // Main event loop
    loop {
        if event::poll(std::time::Duration::from_millis(100))? {
            if let Event::Key(key_event) = event::read()? {
                match key_event.code {
                    KeyCode::Char('q') => break,
                    _ => {}
                }
            }
        }
        // TODO: Render overlays, weather backgrounds, etc.
    }
    Ok(())
}
