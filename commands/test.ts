import { Bot } from "jsr:@blitz-bots/bot@1.5.0";

export function TestCommand(token?: string, path?: string) {
  if (!token) throw new Error("No token provided.");
  const bot = new Bot({ token: token, pluginsDir: "/" });
  bot.start();
}
