import { ConfigCommand } from '../../../interactions/config';

import {
	CommandInteraction,
	DMChannel,
	GuildMember,
	MessageEmbed,
	Permissions,
	Snowflake,
	TextChannel,
} from 'discord.js';
import { ArgumentsOf } from '../../../types/ArgumentsOf';
import i18next from 'i18next';
import { replyWithError } from '../../../utils/responses';
import { redisNumberOrDefault } from '../../../utils';
import {
	MENTION_THRESHOLD,
	SPAM_THRESHOLD,
	SCAM_THRESHOLD,
	SPAM_EXPIRE_SECONDS,
	MENTION_EXPIRE_SECONDS,
	LOGCHANNEL,
	SCAM_EXPIRE_SECONDS,
} from '../../../utils/keys';
import { COLOR_DISCORD_BLURPLE, COLOR_DISCORD_DANGER, COLOR_DISCORD_SUCCESS } from '../../../utils/constants';
import { bold, channelMention, inlineCode } from '@discordjs/builders';
import { logger } from '../../../utils/logger';
export enum IMMUNITY_LEVEL {
	NONE,
	MANAGE_MESSAGES,
	BAN_MEMBERS,
	ADMINISTRATOR,
}

export async function handleConfigCommand(interaction: CommandInteraction, args: ArgumentsOf<typeof ConfigCommand>) {
	const {
		client: { redis, user: clientUser },
		guild,
		channel,
	} = interaction;

	if (!guild || channel instanceof DMChannel) {
		return replyWithError(interaction, i18next.t('common.errors.not_in_dm'));
	}

	const member = interaction.member as GuildMember;
	if (!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
		await replyWithError(interaction, i18next.t('common.errors.missing_permissions'));
		return;
	}

	const mentionThreshold = await redisNumberOrDefault(redis, MENTION_THRESHOLD(guild.id), -1);
	const spamThreshold = await redisNumberOrDefault(redis, SPAM_THRESHOLD(guild.id), -1);
	const scamThreshold = await redisNumberOrDefault(redis, SCAM_THRESHOLD(guild.id), -1);

	const mentionExpireSeconds = await redisNumberOrDefault(redis, MENTION_EXPIRE_SECONDS(guild.id), -1);
	const spamExpireSeconds = await redisNumberOrDefault(redis, SPAM_EXPIRE_SECONDS(guild.id), -1);
	const scamExpireSeconds = await redisNumberOrDefault(redis, SCAM_EXPIRE_SECONDS(guild.id), -1);

	const logChannelId = await redis.get(LOGCHANNEL(guild.id));
	const logChannel = guild.channels.resolve(logChannelId as Snowflake);

	const embed = new MessageEmbed();
	const descriptionParts: string[] = [];

	try {
		switch (Object.keys(args)[0] as keyof ArgumentsOf<typeof ConfigCommand>) {
			case 'show':
				{
					let anything = false;
					if (spamThreshold > 0 && spamExpireSeconds > 0) {
						anything = true;
						const lines = [
							`${bold(i18next.t('command.config.show.settings.threshold'))}: ${spamThreshold}`,
							`${bold(i18next.t('command.config.show.settings.expire'))}: ${i18next.t('units.seconds', {
								count: spamExpireSeconds,
							})}`,
						];
						embed.addField(i18next.t('command.config.show.settings.spam'), lines.join('\n'), true);
					}

					if (mentionThreshold > 0 && mentionExpireSeconds > 0) {
						anything = true;
						const lines = [
							`${bold(i18next.t('command.config.show.settings.threshold'))}: ${mentionThreshold}`,
							`${bold(i18next.t('command.config.show.settings.expire'))}: ${i18next.t('units.seconds', {
								count: mentionExpireSeconds,
							})}}`,
						];
						embed.addField(i18next.t('command.config.show.settings.mentions'), lines.join('\n'), true);
					}

					if (scamThreshold > 0 && scamExpireSeconds > 0) {
						anything = true;
						const lines = [
							`${bold(i18next.t('command.config.show.settings.threshold'))}: ${scamThreshold}`,
							`${bold(i18next.t('command.config.show.settings.expire'))}: ${i18next.t('units.seconds', {
								count: scamExpireSeconds,
							})}`,
						];
						embed.addField(i18next.t('command.config.show.settings.scam'), lines.join('\n'), true);
					}

					if (logChannel) {
						anything = true;
						embed.addField(i18next.t('command.config.show.settings.logchannel'), channelMention(logChannel.id), true);
					}
					if (!anything) {
						descriptionParts.push(i18next.t('command.config.show.none'));
					}
				}
				embed.setColor(COLOR_DISCORD_BLURPLE);
				break;
			case 'scam':
				{
					const thresholdKey = SCAM_THRESHOLD(guild.id);
					const expireKey = SCAM_EXPIRE_SECONDS(guild.id);

					if (args.scam.threshold === 0) {
						// + disabled
						await redis.del(thresholdKey);
						await redis.del(expireKey);
						descriptionParts.push(i18next.t('command.config.scam.disabled'));
					} else {
						// + enabled
						await redis.set(thresholdKey, args.scam.threshold);
						await redis.set(expireKey, args.scam.expire);
						descriptionParts.push(
							i18next.t('command.config.scam.enabled', {
								threshold: args.scam.threshold,
								count: args.scam.expire,
							}),
						);
					}
				}
				embed.setColor(COLOR_DISCORD_SUCCESS);
				break;
			case 'spam':
				{
					const thresholdKey = SPAM_THRESHOLD(guild.id);
					const expireKey = SPAM_EXPIRE_SECONDS(guild.id);

					if (args.spam.threshold === 0 || args.spam.expire === 0) {
						await redis.del(thresholdKey);
						await redis.del(expireKey);
						// + disabled
						descriptionParts.push(i18next.t('command.config.spam.disabled'));
					} else {
						// + enabled
						await redis.set(thresholdKey, args.spam.threshold);
						await redis.set(expireKey, args.spam.expire);
						descriptionParts.push(
							i18next.t('command.config.spam.enabled', {
								threshold: args.spam.threshold,
								count: args.spam.expire,
							}),
						);
					}
				}
				embed.setColor(COLOR_DISCORD_SUCCESS);
				break;
			case 'mentions':
				{
					const thresholdKey = MENTION_THRESHOLD(guild.id);
					const expireKey = MENTION_EXPIRE_SECONDS(guild.id);

					if (args.mentions.threshold === 0 || args.mentions.expire === 0) {
						await redis.del(thresholdKey);
						await redis.del(expireKey);
						// + disabled
						descriptionParts.push(i18next.t('command.config.mentions.disabled'));
					} else {
						// + enabled
						await redis.set(thresholdKey, args.mentions.threshold);
						await redis.set(expireKey, args.mentions.expire);
						descriptionParts.push(
							i18next.t('command.config.mentions.enabled', {
								threshold: args.mentions.threshold,
								count: args.mentions.expire,
							}),
						);
					}
				}
				embed.setColor(COLOR_DISCORD_SUCCESS);
				break;

			case 'log':
				{
					const channel = args.log.channel as TextChannel;
					const hasPerms = channel
						.permissionsFor(clientUser!)
						?.has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.VIEW_CHANNEL]);

					if (hasPerms) {
						// + set channel
						await redis.set(LOGCHANNEL(guild.id), channel.id);
						descriptionParts.push(
							i18next.t('command.config.log.success', { channel: channelMention(args.log.channel.id) }),
						);
					} else {
						// - missing perms
						descriptionParts.push(
							i18next.t('command.config.log.permissions', { channel: channelMention(args.log.channel.id) }),
						);
					}
				}
				embed.setColor(COLOR_DISCORD_SUCCESS);
				break;
		}

		if (descriptionParts.length) {
			embed.setDescription(descriptionParts.join('\n'));
		}
	} catch (error: any) {
		logger.error(error);
		embed.setColor(COLOR_DISCORD_DANGER);
		embed.setDescription(`${i18next.t('common.errors.during_command')}: ${inlineCode(error.message)}`);
	}

	await interaction.reply({
		embeds: [embed],
		ephemeral: true,
	});
}
