import { Client, Events, MessageReaction, WebhookClient } from "npm:discord.js";

export default {
  event: Events.MessageReactionAdd,
  once: false,
  action: async (
    _client: Client,
    config: { reaction: string; reactionCount: number; webhookUrl: string },
    reaction: MessageReaction
  ) => {
    if (reaction.emoji.name !== config.reaction) return;

    if (reaction.count && reaction.count > config.reactionCount) {
      const messageContent = reaction.message.content;
      
      if (!messageContent) {
        console.log("The message has no content to send.");
        return;
      }

      try {
        const webhookClient = new WebhookClient({ url: config.webhookUrl });
        await webhookClient.send({
          content: `# ${reaction.emoji.name}\n\n${messageContent}`,
        });

        console.log("Message content sent to webhook.");
      } catch (error) {
        console.error("Failed to send message to webhook:", error);
      }
    }
  },
};
