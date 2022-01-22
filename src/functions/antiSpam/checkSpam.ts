import { bold, inlineCode, spoiler } from '@discordjs/builders';
import { Message, MessageActionRow, MessageButton, MessageEmbed, Permissions, Snowflake } from 'discord.js';
import i18next from 'i18next';
import { redisNumberOrDefault } from '../../utils';
import { CID_SEPARATOR, COLOR_DISCORD_DANGER, COLOR_DISCORD_SUCCESS } from '../../utils/constants';
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
		const scamDomains = await checkScam(redis, content);
		const totalScamCount = await totalScams(
			client,
			scamDomains.map((d) => d.host),
			guild.id,
			author.id,
		);

		const mentionThreshold = await redisNumberOrDefault(redis, MENTION_THRESHOLD(guild.id), Infinity);
		const spamThreshold = await redisNumberOrDefault(redis, SPAM_THRESHOLD(guild.id), Infinity);
		const scamThreshold = await redisNumberOrDefault(redis, SCAM_THRESHOLD(guild.id), Infinity);

		const mentionExceeded = totalMentionCount >= mentionThreshold;
		const contentExceeded = totalContentCount >= spamThreshold;
		const scamExceeded = totalScamCount >= scamThreshold;

		logger.debug({
			totalMentionCount,
			totalContentCount,
			scamDomains,
			totalScamCount,
			mentionThreshold,
			spamThreshold,
			scamThreshold,
			mentionExceeded,
			contentExceeded,
			scamExceeded,
			authorId: message.author.id,
			author: message.author.tag,
		});

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
						.map((s) => spoiler(s.host))
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

			let success = true;
			try {
				if (guild.id !== '900017700850507807') {
					await member.ban({ days: 1, reason: reasonParts.join(' ') });
				}

				const keys = await redis.keys(`*guild:${guild.id}*user:${author.id}*`);
				if (keys.length) {
					await redis.unlink(keys);
				}

				embed.setColor(COLOR_DISCORD_SUCCESS);
				success = true;
			} catch (error: any) {
				embed.setColor(COLOR_DISCORD_DANGER);
				descriptionParts.push(`${bold(i18next.t('antiraid.description.error'))}: ${inlineCode(error.message)}`);
				success = false;
			}

			embed.setDescription(descriptionParts.join('\n'));
			if (
				logChannel
					?.permissionsFor(client.user!)
					?.has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.EMBED_LINKS, Permissions.FLAGS.VIEW_CHANNEL])
			) {
				const components = [];
				if (success) {
					// ~ unban button
					components.push(
						new MessageActionRow().addComponents(
							new MessageButton()
								.setStyle('SUCCESS')
								.setCustomId(`unban${CID_SEPARATOR}${author.id}`)
								.setLabel(i18next.t('button.label.unban')),
						),
					);
				}

				await logChannel.send({ embeds: [embed], components });
			}
		}
	} catch (e) {
		const error = e as Error;
		logger.error(error, error.message);
	}
}
