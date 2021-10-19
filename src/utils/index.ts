import { MessageEmbed, DMChannel, GuildChannel, ThreadChannel, PartialDMChannel } from 'discord.js';
import { Redis } from 'ioredis';

/**
 * Return the key value as number or fallback if not present or not parseable
 * @param redis - The redis instance to use
 * @param key - The redis key to look up
 * @param fallback - The fallback value
 * @returns The key value or fallback
 */
export async function redisNumberOrDefault(redis: Redis, key: string, fallback: number): Promise<number> {
	const str = await redis.get(key);
	if (!str) return fallback;
	const num = parseInt(str, 10);
	return Number.isNaN(str) ? fallback : num;
}

/**
 * Return a custom emoji or fallback string based on the everyone permissions in the provided channel
 * @param channel - The channel the permissions should be checked in
 * @param emoji - The custom emoji to return
 * @param fallback - The fallback string to return
 * @returns Custom emoji or fallback string
 */
export function emojiOrFallback(
	channel: GuildChannel | DMChannel | ThreadChannel | PartialDMChannel | null,
	emoji: string,
	fallback: string,
) {
	if (channel instanceof DMChannel || !channel || channel.partial) return emoji;
	// ! can not determine permissions in threads because the parent is not sent with slash commands
	if (channel instanceof ThreadChannel) return emoji;
	return channel.permissionsFor(channel.guild.roles.everyone).has('USE_EXTERNAL_EMOJIS') ? emoji : fallback;
}

/**
 * Truncate a text to a provided length using a provided splitcharacter
 * @param text - Text to truncate
 * @param len - Length to truncate to
 * @param splitChar - Split character to use
 * @returns The truncated text
 */
export function truncate(text: string, len: number, splitChar = ' '): string {
	if (text.length <= len) return text;
	const words = text.split(splitChar);
	const res: string[] = [];
	for (const word of words) {
		const full = res.join(splitChar);
		if (full.length + word.length + 1 <= len - 3) {
			res.push(word);
		}
	}

	const resText = res.join(splitChar);
	return resText.length === text.length ? resText : `${resText.trim()}...`;
}

export const LIMIT_EMBED_DESCRIPTION = 4048 as const;
export const LIMIT_EMBED_TITLE = 256 as const;
export const LIMIT_EMBED_FIELDS = 25 as const;
export const LIMIT_EMBED_FIELD_NAME = 256 as const;
export const LIMIT_EMBED_FIELD_VALUE = 1024 as const;
export const LIMIT_EMBED_AUTHOR_NAME = 256 as const;
export const LIMIT_EMBED_FOOTER_TEXT = 2048 as const;

/**
 * Truncate the provided embed
 * @param embed - The embed to truncate
 * @returns The truncated embed
 */
export function truncateEmbed(embed: MessageEmbed): MessageEmbed {
	if (embed.description && embed.description.length > LIMIT_EMBED_DESCRIPTION) {
		embed.description = truncate(embed.description, LIMIT_EMBED_DESCRIPTION);
	}
	if (embed.title && embed.title.length > LIMIT_EMBED_TITLE) {
		embed.title = truncate(embed.title, LIMIT_EMBED_TITLE);
	}
	if (embed.fields.length > LIMIT_EMBED_FIELDS) {
		embed.fields = embed.fields.slice(0, LIMIT_EMBED_FIELDS);
	}
	if (embed.author?.name) {
		embed.author.name = truncate(embed.author.name, LIMIT_EMBED_AUTHOR_NAME);
	}
	if (embed.footer?.text) {
		embed.footer.text = truncate(embed.footer.text, LIMIT_EMBED_FOOTER_TEXT);
	}
	for (const field of embed.fields) {
		field.name = truncate(field.name, LIMIT_EMBED_FIELD_NAME);
		field.value = truncate(field.value, LIMIT_EMBED_FIELD_VALUE);
	}
	return embed;
}

export function arraysEqual<T>(a1: T[], a2: T[]): boolean {
	return a1.every((e) => a2.includes(e)) && a2.every((e) => a1.includes(e));
}
