import { ensureDir } from "jsr:@std/fs@1.0.5";
import { join } from "jsr:@std/path@1.0.8";
import * as colors from "jsr:@std/fmt@1.0.3/colors";

// Pinkish-red color for questions
const promptColor = (text: string) => colors.bold(colors.rgb8(text, 207)); // Apply color and bold separately

// Helper function to prompt for a required field
function promptRequired(message: string): string {
  let input: string | null = null;
  while (!input) {
    input = prompt(promptColor(message));
    if (!input) {
      console.log(colors.red("This field is required. Please enter a value."));
    }
  }
  return input;
}

// Helper function to prompt for yes/no questions with "y/n" options
function promptYesNo(message: string): boolean {
  let input: string | null = null;  // Allow both string and null
  while (!input) {
    input = prompt(promptColor(`${message} (y/n):`))?.toLowerCase() ?? ''; // Default to empty string if null
    if (input === "yes" || input === "y") return true;
    if (input === "no" || input === "n") return false;
    console.log(colors.red("Invalid input. Please enter 'yes', 'no', 'y', or 'n'."));
    input = null; // Continue prompting
  }
  return false;
}

// Helper function to validate semantic versioning (SemVer)
function validateSemVer(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+$/; // Format: major.minor.patch
  return semverRegex.test(version);
}

async function init() {
  const encoder = new TextEncoder();

  // Step 1: Collect all user inputs first
  const name = promptRequired("Enter project name *:");
  let version = prompt(promptColor("Enter version (default: 0.0.1):")) || "0.0.1";

  // Validate version format (SemVer)
  while (!validateSemVer(version)) {
    console.log(colors.red("Invalid version format. Please use SemVer format (e.g., 0.0.1)."));
    version = prompt(promptColor("Enter version (default: 0.0.1):")) || "0.0.1";
  }

  const description = prompt(promptColor("Enter description:")) || "";
  const repo = prompt(promptColor("Enter repository URL:")) || "";
  const installDeps = promptYesNo("Do you want to install dependencies");

  // Step 2: Create `blitz.config.json`
  console.log(colors.gray("Creating blitz.config.json..."));
  const config = {
    name,
    version,
    description,
    repo,
  };
  await Deno.writeTextFile("blitz.config.json", JSON.stringify(config, null, 2));
  console.log(colors.green("✔ Created blitz.config.json"));

  // Step 3: Create folder structure
  console.log(colors.gray("Creating directories 'commands' and 'events'..."));
  await ensureDir("commands");
  await ensureDir("events");
  console.log(colors.green("✔ Created directories: 'commands' and 'events'"));

  // Step 4: Create `ping.ts` and `ready.ts` files with new content
  console.log(colors.gray("Creating 'commands/ping.ts' and 'events/ready.ts'..."));
  const pingContent = `import { CommandBuilder } from '@blitz-bots/builder';

export default new CommandBuilder({ 
  name: "ping", 
  description: "Return Pong", 
  action: (message) => {  
    message.reply("Pong!"); 
  },
});
`;
  const readyContent = `import { EventBuilder } from '@blitz-bots/builder';

const readyEvent = new EventBuilder({
  name: "Log Client Ready",
  event: "ready",
  description: "Logs when the client is online",
  action: () => {
    console.log("Client is online");
  },
});
`;
  await Deno.writeFile(join("commands", "ping.ts"), encoder.encode(pingContent));
  await Deno.writeFile(join("events", "ready.ts"), encoder.encode(readyContent));
  console.log(colors.green("✔ Created files: 'commands/ping.ts' and 'events/ready.ts'"));

  // Step 5: Create .gitignore file
  console.log(colors.gray("Creating .gitignore..."));
  const gitignoreContent = `node_modules/\ndist/\n.env\n`;
  await Deno.writeFile(".gitignore", encoder.encode(gitignoreContent));
  console.log(colors.green("✔ Created .gitignore"));

  // Step 6: Install dependencies if user agreed
  if (installDeps) {
    console.log(colors.gray("Installing dependencies..."));
    const installProcess = new Deno.Command("deno", {
      args: ["install", "--unstable", "jsr:@blitz-bots/builder"],
      stdout: "piped",
      stderr: "piped",
    });

    // Capture the output and check if the installation was successful
    const { code, stderr } = await installProcess.output();

    if (code === 0) {
      console.log(colors.green("✔ Installed @blitz-bots/builder dependency."));
    } else {
      const errorOutput = new TextDecoder().decode(stderr);
      console.log(colors.red("Failed to install dependencies:\n"), errorOutput);
    }
  } else {
    console.log(colors.gray("Skipped dependency installation."));
  }
}

// Parse the CLI arguments
const args = Deno.args;
if (args[0] === "init") {
  await init();
} else {
  console.log(promptColor("Usage: deno run --allow-write --allow-run cli.ts init"));
}
