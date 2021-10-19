import {
	ButtonInteraction,
	CommandInteraction,
	MessageComponentInteraction,
	MessageEmbed,
	SelectMenuInteraction,
} from 'discord.js';
import { COLOR_DISCORD_DANGER, COLOR_DISCORD_SUCCESS } from './constants';

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
	return interaction.reply({
		embeds: [new MessageEmbed().setColor(COLOR_DISCORD_DANGER).setDescription(content)],
		ephemeral: true,
	});
}

/**
 * Reply to an interaction with an ephemeral error message
 * @param interaction - Interaction to reply to
 * @param content - Content to reply with
 * @returns Interaction reply value
 */
export function replyWithSuccess(interaction: ReplyableInteraction, content: string) {
	return interaction.reply({
		embeds: [new MessageEmbed().setColor(COLOR_DISCORD_SUCCESS).setDescription(content)],
		ephemeral: true,
	});
}

export function editReplyWithError(interaction: ReplyableInteraction, content: string) {
	void interaction.editReply({
		embeds: [new MessageEmbed().setColor(COLOR_DISCORD_DANGER).setDescription(content)],
	});
}

export function editReplyWithSuccess(interaction: ReplyableInteraction, content: string) {
	void interaction.editReply({
		embeds: [new MessageEmbed().setColor(COLOR_DISCORD_SUCCESS).setDescription(content)],
	});
}
