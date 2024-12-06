import { ensureDir } from "jsr:@std/fs@1.0.6";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const RED = "\x1b[31m";
const GRAY = "\x1b[2m";

export async function BotCommand() {
  try {
    // Initialize Deno project
    await Deno.writeTextFile(
      "deno.json",
      JSON.stringify(
        {
          tasks: {
            start: "deno run --allow-net --allow-read --allow-env --env=.env bot.ts",
          },
        },
        null,
        2,
      ),
    );
    console.log(`${GRAY} Initialized Deno project${RESET}`);

    // Fetch the bot example file content
    const botExampleUrl =
      "https://raw.githubusercontent.com/BLITZ-BOTS/Bot/main/Examples/basic.ts";
    const botExampleCode = await fetch(botExampleUrl).then((res) => {
      if (!res.ok) {
        throw new Error(
          `${BOLD}${RED}Failed to fetch bot example from ${botExampleUrl}${RESET}`,
        );
      }
      return res.text();
    });

    // Create bot.ts
    await Deno.writeTextFile("bot.ts", botExampleCode);
    console.log(`${GRAY}Created bot.ts with the example code${RESET}`);

    // Create .env file
    const envContent = "DISCORD_TOKEN=your_discord_token_here";
    await Deno.writeTextFile(".env", envContent);
    console.log(`${GRAY}.env file created${RESET}`);

    // Create plugins folder
    await ensureDir("plugins");
    console.log(`${GRAY}Plugins folder created${RESET}`);

    console.log(
      `\n\n${BOLD}Bot Has Been Created!${RESET}\n\nInstall Dependencies:\n deno i @blitz-bots/bot\n\nEnter Token In:\n .env\n\nStart The Bot:\n deno run start\n\n`,
    );
  } catch (error) {
    console.log(
      `An error occurred while setting up the project:${BOLD}${RED}`,
      error,
      `${RESET}`,
    );
  }
}
