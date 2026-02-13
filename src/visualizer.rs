// visualizer.rs - Command journey visualization logic

pub struct CommandStep {
    pub label: &'static str,
    pub icon: &'static str,
}

pub fn get_journey(command: &str) -> Vec<CommandStep> {
    // Example: sudo pacman -Syu
    vec![
        CommandStep { label: "sudo (auth)", icon: "🛡️" },
        CommandStep { label: "pacman (pkg mgr)", icon: "📦" },
        CommandStep { label: "filesystem", icon: "🗄️" },
        CommandStep { label: "network", icon: "🌐" },
    ]
}

// TODO: Render journey as a compact overlay (e.g., string of icons/labels)
