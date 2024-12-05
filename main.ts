import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
import { AuthCommand } from "./commands/auth.ts";
import { BotCommand } from "./commands/bot.ts";
import { PluginCommand } from "./commands/plugin.ts";
import { PublishCommand } from "./commands/publish.ts";
import { InstallCommand } from "./commands/install.ts";
import { DeleteCommand } from "./commands/delete.ts";

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
  });
program
  .command("publish")
  .description("Publish A New Blitz Plugin")
  .action(() => {
    console.clear();
    PublishCommand();
  });

program
  .command("install")
  .description("Install A Blitz Plugin")
  .arguments("<plugin:string>")
  .action((_options, plugin) => {
    console.clear();
    InstallCommand(plugin);
  });

program
  .command("delete")
  .description("Delete A Blitz Plugin")
  .arguments("<plugin:string>")
  .action((_options, plugin) => {
    console.clear();
    DeleteCommand(plugin);
  });

program.parse(Deno.args);
