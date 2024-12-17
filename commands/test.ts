import { Bot } from "jsr:@blitz-bots/bot";

export function TestCommand(token?: string, path?: string) {
  if (!token) throw new Error("No token provided.");
  const bot = new Bot({ token: token, pluginsDir: "/" });
  bot.start();
}
