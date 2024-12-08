import { ensureDir } from "jsr:@std/fs@1.0.6";
import { join, resolve, toFileUrl, fromFileUrl } from "jsr:@std/path@1.0.6";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const RED = "\x1b[31m";
const GRAY = "\x1b[2m";

export async function BotCommand(token?: string, path?: string) {
  try {
    // Normalize and resolve the path
    const targetPath = path
      ? resolve(fromFileUrl(toFileUrl(path)))
      : Deno.cwd();

    // Ensure the directory exists
    await ensureDir(targetPath);

    // Write deno.json
    await Deno.writeTextFile(
      join(targetPath, "deno.json"),
      JSON.stringify(
        {
          tasks: {
            start:
              "deno run --allow-net --allow-read --allow-env --env=.env bot.ts",
          },
        },
        null,
        2,
      ),
    );
    console.log(`${GRAY}Initialized Deno project in ${targetPath}${RESET}`);

    // Fetch and write example bot code
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

    await Deno.writeTextFile(join(targetPath, "bot.ts"), botExampleCode);
    console.log(`${GRAY}Created bot.ts with the example code${RESET}`);

    // Write .env file
    const envContent = `DISCORD_TOKEN="${token ?? "your_discord_token_here"}"`;
    await Deno.writeTextFile(join(targetPath, ".env"), envContent);
    console.log(`${GRAY}.env file created${RESET}`);

    // Create plugins directory
    await ensureDir(join(targetPath, "plugins"));
    console.log(`${GRAY}Plugins folder created${RESET}`);

    // Automatically install the @blitz-bots/bot package
    console.log(`${GRAY}Installing required Deno package...${RESET}`);
    const command = new Deno.Command(Deno.execPath(), {
      args: ["add", "jsr:@blitz-bots/bot"],
      cwd: targetPath, // Ensure the command runs in the target directory
      stdin: "null",
      stdout: "piped",
      stderr: "piped",
    });
    const child = command.spawn();

    // Read and log output and errors
    const stdoutText = child.stdout.pipeThrough(new TextDecoderStream());
    const stderrText = child.stderr.pipeThrough(new TextDecoderStream());

    const [status] = await Promise.all([
      child.status,
      stdoutText.pipeTo(
        new WritableStream({
          write(chunk) {
            console.log(`${GRAY}${chunk}${RESET}`);
          },
        }),
      ),
      stderrText.pipeTo(
        new WritableStream({
          write(chunk) {
            console.error(`${RED}${chunk}${RESET}`);
          },
        }),
      ),
    ]);

    if (status.success) {
      console.log(`${GRAY}Package installed successfully!${RESET}`);
    } else {
      console.log(
        `${BOLD}${RED}Failed to install the required package. Please try running "deno add @blitz-bots/bot" manually.${RESET}`,
      );
    }

    // Final instructions
    console.log(
      `\n\n${BOLD}Bot Has Been Created!${RESET}\n\nEnter Token In:\n ${join(
        targetPath,
        ".env",
      )}\n\nStart The Bot:\n deno task start\n\n`,
    );
  } catch (error) {
    console.error(
      `An error occurred while setting up the project:${BOLD}${RED}`,
      error,
      `${RESET}`,
    );
  }
}
