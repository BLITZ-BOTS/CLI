import { ensureDir } from "https://deno.land/std@0.224.0/fs/mod.ts";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const RED = "\x1b[31m";
const GRAY = "\x1b[2m";

// Semantic Version Regex
const SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)$/;

export async function PluginCommand() {
    try {
        // Prompt the user for plugin details
        const pluginName = prompt("Enter the plugin name:")?.trim();
        const pluginDescription = prompt("Enter the plugin description:")?.trim();
        const pluginVersion = prompt("Enter the plugin version (e.g., 1.0.0):")?.trim();

        // Validate input
        if (!pluginName || !pluginDescription || !pluginVersion) {
            throw new Error(`${BOLD}${RED}All fields are required!${RESET}`);
        }

        if (!SEMVER_REGEX.test(pluginVersion)) {
            throw new Error(
                `${BOLD}${RED}Version must be in semantic version format (e.g., 1.0.0)!${RESET}`
            );
        }

        // Create blitz.config.yaml
        const configContent = `
name: ${pluginName}
description: ${pluginDescription}
version: ${pluginVersion}
        `.trim();

        await Deno.writeTextFile("blitz.config.yaml", configContent);
        console.log(`${GRAY}Created blitz.config.yaml with plugin details${RESET}`);

        // Create commands and events folders
        await ensureDir("commands");
        console.log(`${GRAY}Commands folder created${RESET}`);

        await ensureDir("events");
        console.log(`${GRAY}Events folder created${RESET}`);

        console.log(
            `\n\n${BOLD}Plugin Has Been Created!${RESET}\n\nEdit Plugin Configuration:\n blitz.config.yaml\n\nAdd Commands In:\n commands/\n\nAdd Events In:\n events/\n\n`,
        );
    } catch (error) {
        console.log(
            `An error occurred while creating the plugin:${BOLD}${RED}`,
            error,
            `${RESET}`,
        );
    }
}
