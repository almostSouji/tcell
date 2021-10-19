import { ButtonInteraction, CommandInteraction, MessageComponentInteraction, SelectMenuInteraction } from 'discord.js';

export type ReplyableInteraction =
	| CommandInteraction
	| ButtonInteraction
	| MessageComponentInteraction
	| SelectMenuInteraction;

/**
 * Reply to an interaction with an ephemeral error message
 * @param interaction - Interaction to reply to
 * @param content - Content to reply with
 * @returns Interaction reply value
 */
export function replyWithError(interaction: ReplyableInteraction, content: string) {
	return interaction.reply({ content, ephemeral: true });
}
