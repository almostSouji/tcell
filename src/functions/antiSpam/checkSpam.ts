import { bold, inlineCode, spoiler } from '@discordjs/builders';
import { Message, MessageEmbed, Permissions, Snowflake } from 'discord.js';
import i18next from 'i18next';
import { redisNumberOrDefault } from '../../utils';
import { COLOR_DISCORD_DANGER, COLOR_DISCORD_SUCCESS } from '../../utils/constants';
import { LOGCHANNEL, MENTION_THRESHOLD, SCAM_THRESHOLD, SPAM_THRESHOLD } from '../../utils/keys';
import { logger } from '../../utils/logger';
import { checkScam } from './checkScam';
import { totalContent } from './totalContent';
import { totalMentions } from './totalMentions';
import { totalScams } from './totalScams';

export async function checkSpam(message: Message) {
	try {
		const {
			client: { redis },
			client,
			guild,
			content,
			author,
			member,
		} = message;
		if (author.bot || !guild || !content.length) return;

		const totalMentionCount = await totalMentions(message);
		const totalContentCount = await totalContent(client, content, guild.id, author.id);
		const scamDomains = await checkScam(client, content);
		const totalScamCount = await totalScams(client, scamDomains, guild.id, author.id);

		const mentionThreshold = await redisNumberOrDefault(redis, MENTION_THRESHOLD(guild.id), Infinity);
		const spamThreshold = await redisNumberOrDefault(redis, SPAM_THRESHOLD(guild.id), Infinity);
		const scamThreshold = await redisNumberOrDefault(redis, SCAM_THRESHOLD(guild.id), Infinity);

		const mentionExceeded = totalMentionCount >= mentionThreshold;
		const contentExceeded = totalContentCount >= spamThreshold;
		const scamExceeded = totalScamCount >= scamThreshold;

		if (scamExceeded || mentionExceeded || contentExceeded) {
			if (!member?.bannable) return;
			const embed = new MessageEmbed().setTimestamp();

			const logChannelId = await redis.get(LOGCHANNEL(guild.id));
			const logChannel = guild.channels.resolve(logChannelId as Snowflake);

			if (logChannel && !logChannel.isText()) return;

			const descriptionParts: string[] = [];
			const reasonParts: string[] = [];

			logger.debug({
				mentionExceeded,
				contentExceeded,
				scamExceeded,
			});

			descriptionParts.push(
				`${bold(i18next.t('antiraid.description.member'))}: ${inlineCode(author.tag)} (${author.id})`,
			);

			if (scamExceeded) {
				descriptionParts.push(bold(i18next.t('antiraid.reason.scam')));
				descriptionParts.push(
					`${bold(i18next.t('antiraid.description.domains', { count: scamDomains.length }))}: ${scamDomains
						.map((s) => spoiler(s))
						.join(', ')}`,
				);
				reasonParts.push(i18next.t('antiraid.reason.scam'));
			} else if (mentionExceeded) {
				descriptionParts.push(bold(i18next.t('antiraid.reason.mentions')));
				reasonParts.push(i18next.t('antiraid.reason.mentions'));
			} else if (contentExceeded) {
				descriptionParts.push(bold(i18next.t('antiraid.reason.content')));
				reasonParts.push(i18next.t('antiraid.reason.content'));
			}

			try {
				await member.ban({ days: 1, reason: reasonParts.join(' ') });
				embed.setColor(COLOR_DISCORD_SUCCESS);
			} catch (error: any) {
				embed.setColor(COLOR_DISCORD_DANGER);
				descriptionParts.push(`${bold(i18next.t('antiraid.description.error'))}: ${inlineCode(error.message)}`);
			}

			embed.setDescription(descriptionParts.join('\n'));
			if (
				logChannel
					?.permissionsFor(client.user!)
					?.has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.VIEW_CHANNEL])
			) {
				await logChannel.send({ embeds: [embed] });
			}
		}
	} catch (e) {
		const error = e as Error;
		logger.error(error, error.message);
	}
}
