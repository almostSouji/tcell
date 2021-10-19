import { createHash } from 'crypto';
import { Client } from 'discord.js';
import { redisNumberOrDefault } from '../../utils';
import { SPAM_EXPIRE_SECONDS, USER_SPAM } from '../../utils/keys';

export async function totalContent(client: Client, content: string, guildId: string, userId: string): Promise<number> {
	const redis = client.redis;

	const contentHash = createHash('md5').update(content.toLowerCase()).digest('hex');
	const channelSpamKey = USER_SPAM(guildId, userId, contentHash);
	const total = await redis.incr(channelSpamKey);
	await redis.expire(channelSpamKey, await redisNumberOrDefault(redis, SPAM_EXPIRE_SECONDS(guildId), 20));
	return total;
}
