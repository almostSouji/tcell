import type { Message } from 'discord.js';

import { MENTION_EXPIRE_SECONDS, USER_MENTIONS } from '../../utils/keys';
import { redisNumberOrDefault } from '../../utils';

export async function totalMentions(message: Message): Promise<number> {
	const {
		client: { redis },
		guild,
		author,
		content,
	} = message;

	const attemptAtEveryoneOrHere = ['@everyone', '@here'].some((pattern) => content.includes(pattern));
	const mentionCountKey = USER_MENTIONS(guild!.id, author.id);
	const increment = message.mentions.users.size + (attemptAtEveryoneOrHere ? 1 : 0);

	const total = await redis.incrby(mentionCountKey, increment);

	if (total === increment) {
		await redis.expire(mentionCountKey, await redisNumberOrDefault(redis, MENTION_EXPIRE_SECONDS(guild!.id), 0));
	}

	return total;
}
