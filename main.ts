import { Command } from "https://deno.land/x/cliffy@v0.25.6/command/mod.ts";
import { AuthCommand } from "./commands/auth.ts";
import { BotCommand } from "./commands/bot.ts";
import { PluginCommand } from "./commands/plugin.ts";


const program = new Command();


program
  .command("auth")
  .description("Authenticate using Discord OAuth")
  .action(() => {
    console.clear();
    AuthCommand();
  })
  .command("bot")
  .description("Create A New Blitz Bot")
  .action(() => {
    console.clear();
    BotCommand();
  })
  .command("plugin")
  .description("Create A New Blitz Plugin")
  .action(() => {
    console.clear();
    PluginCommand();
  })

program.parse(Deno.args);
