// visualizer.rs - Command journey visualization logic

#[derive(Debug, Clone)]
pub struct CommandStep {
    pub label: String,
    pub icon: String,
}

pub fn get_command_journey(command: &str) -> Vec<CommandStep> {
    let parts: Vec<&str> = command.split_whitespace().collect();
    let mut journey = Vec::new();
    
    if let Some(cmd) = parts.get(0) {
        match *cmd {
            "sudo" => {
                journey.push(CommandStep {
                    label: "sudo (elevated)".to_string(),
                    icon: "🛡️".to_string(),
                });
                if let Some(next_cmd) = parts.get(1) {
                    journey.extend(get_base_journey(next_cmd));
                }
            },
            "pacman" => {
                journey.extend(get_pacman_journey(&parts));
            },
            "apt" | "apt-get" => {
                journey.extend(get_apt_journey(&parts));
            },
            "git" => {
                journey.extend(get_git_journey(&parts));
            },
            "curl" | "wget" => {
                journey.extend(get_download_journey(&parts));
            },
            "npm" | "yarn" | "pnpm" => {
                journey.extend(get_package_manager_journey(cmd, &parts));
            },
            "cargo" => {
                journey.extend(get_cargo_journey(&parts));
            },
            _ => {
                journey.push(CommandStep {
                    label: format!("{} (command)", cmd),
                    icon: "⚡".to_string(),
                });
                journey.push(CommandStep {
                    label: "execute".to_string(),
                    icon: "▶️".to_string(),
                });
            }
        }
    }
    
    journey
}

fn get_base_journey(cmd: &str) -> Vec<CommandStep> {
    match cmd {
        "pacman" => get_pacman_journey(&vec![cmd]),
        "apt" | "apt-get" => get_apt_journey(&vec![cmd]),
        "git" => get_git_journey(&vec![cmd]),
        "curl" | "wget" => get_download_journey(&vec![cmd]),
        "npm" | "yarn" | "pnpm" => get_package_manager_journey(cmd, &vec![cmd]),
        "cargo" => get_cargo_journey(&vec![cmd]),
        _ => vec![
            CommandStep {
                label: format!("{} (system)", cmd),
                icon: "🔧".to_string(),
            },
            CommandStep {
                label: "execute".to_string(),
                icon: "▶️".to_string(),
            }
        ]
    }
}

fn get_pacman_journey(parts: &[&str]) -> Vec<CommandStep> {
    let mut journey = vec![
        CommandStep {
            label: "pacman (pkg mgr)".to_string(),
            icon: "📦".to_string(),
        }
    ];
    
    if parts.len() > 1 {
        match parts[1] {
            "-S" | "-Syu" | "install" => {
                journey.push(CommandStep {
                    label: "download".to_string(),
                    icon: "⬇️".to_string(),
                });
                journey.push(CommandStep {
                    label: "filesystem".to_string(),
                    icon: "🗄️".to_string(),
                });
            },
            "-R" | "remove" => {
                journey.push(CommandStep {
                    label: "filesystem".to_string(),
                    icon: "🗄️".to_string(),
                });
            },
            _ => {}
        }
    }
    
    journey
}

fn get_apt_journey(parts: &[&str]) -> Vec<CommandStep> {
    let mut journey = vec![
        CommandStep {
            label: "apt (pkg mgr)".to_string(),
            icon: "📦".to_string(),
        }
    ];
    
    if parts.len() > 1 {
        match parts[1] {
            "install" | "upgrade" => {
                journey.push(CommandStep {
                    label: "network".to_string(),
                    icon: "🌐".to_string(),
                });
                journey.push(CommandStep {
                    label: "filesystem".to_string(),
                    icon: "🗄️".to_string(),
                });
            },
            "remove" => {
                journey.push(CommandStep {
                    label: "filesystem".to_string(),
                    icon: "🗄️".to_string(),
                });
            },
            _ => {}
        }
    }
    
    journey
}

fn get_git_journey(parts: &[&str]) -> Vec<CommandStep> {
    let mut journey = vec![
        CommandStep {
            label: "git (version ctrl)".to_string(),
            icon: "📚".to_string(),
        }
    ];
    
    if parts.len() > 1 {
        match parts[1] {
            "clone" => {
                journey.push(CommandStep {
                    label: "network".to_string(),
                    icon: "🌐".to_string(),
                });
                journey.push(CommandStep {
                    label: "filesystem".to_string(),
                    icon: "🗄️".to_string(),
                });
            },
            "push" | "pull" => {
                journey.push(CommandStep {
                    label: "network".to_string(),
                    icon: "🌐".to_string(),
                });
            },
            _ => {}
        }
    }
    
    journey
}

fn get_download_journey(_parts: &[&str]) -> Vec<CommandStep> {
    vec![
        CommandStep {
            label: "download".to_string(),
            icon: "⬇️".to_string(),
        },
        CommandStep {
            label: "network".to_string(),
            icon: "🌐".to_string(),
        },
        CommandStep {
            label: "filesystem".to_string(),
            icon: "🗄️".to_string(),
        }
    ]
}

fn get_package_manager_journey(cmd: &str, parts: &[&str]) -> Vec<CommandStep> {
    let mut journey = vec![
        CommandStep {
            label: format!("{} (js pkg mgr)", cmd),
            icon: "📦".to_string(),
        }
    ];
    
    if parts.len() > 1 {
        match parts[1] {
            "install" | "add" => {
                journey.push(CommandStep {
                    label: "network".to_string(),
                    icon: "🌐".to_string(),
                });
                journey.push(CommandStep {
                    label: "filesystem".to_string(),
                    icon: "🗄️".to_string(),
                });
            },
            "run" | "start" => {
                journey.push(CommandStep {
                    label: "execute".to_string(),
                    icon: "▶️".to_string(),
                });
            },
            _ => {}
        }
    }
    
    journey
}

fn get_cargo_journey(parts: &[&str]) -> Vec<CommandStep> {
    let mut journey = vec![
        CommandStep {
            label: "cargo (rust pkg mgr)".to_string(),
            icon: "🦀".to_string(),
        }
    ];
    
    if parts.len() > 1 {
        match parts[1] {
            "build" | "run" => {
                journey.push(CommandStep {
                    label: "compile".to_string(),
                    icon: "🔨".to_string(),
                });
                journey.push(CommandStep {
                    label: "execute".to_string(),
                    icon: "▶️".to_string(),
                });
            },
            _ => {}
        }
    }
    
    journey
}

pub fn format_journey_compact(journey: &[CommandStep]) -> String {
    journey.iter()
        .map(|step| step.icon.clone())
        .collect::<Vec<_>>()
        .join(" → ")
}
