import { Command } from "https://deno.land/x/cliffy@v0.25.6/command/mod.ts";
import { AuthCommand } from "./commands/auth.ts";
import { BotCommand } from "./commands/bot.ts";
import { PluginCommand } from "./commands/plugin.ts";
import { PublishCommand } from "./commands/publish.ts";

const program = new Command();

program
  .name("blitz")
  .version("1.0.0")
  .description("A CLI tool for managing Blitz projects and plugins")
  .command("auth")
  .description("Authenticate using Discord OAuth")
  .action(() => {
    console.clear();
    AuthCommand();
  });

program
  .command("bot")
  .description("Create A New Blitz Bot")
  .action(() => {
    console.clear();
    BotCommand();
  });

program
  .command("plugin")
  .description("Create A New Blitz Plugin")
  .action(() => {
    console.clear();
    PluginCommand();
  })
  program
  .command("publish")
  .description("Publish A New Blitz Plugin")
  .action(() => {
    console.clear();
    PublishCommand();
  });

program.parse(Deno.args);
