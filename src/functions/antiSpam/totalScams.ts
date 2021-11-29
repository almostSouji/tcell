import { Client } from 'discord.js';
import { redisNumberOrDefault } from '../../utils';
import { SCAM_EXPIRE_SECONDS, USER_SCAM } from '../../utils/keys';

export async function totalScams(
	client: Client,
	scamDomains: string[],
	guildId: string,
	userId: string,
): Promise<number> {
	const redis = client.redis;

	const scamKey = USER_SCAM(guildId, userId);
	const total = await redis.incrby(scamKey, scamDomains.length ? 1 : 0);
	await redis.expire(scamKey, await redisNumberOrDefault(redis, SCAM_EXPIRE_SECONDS(guildId), 20));
	return total;
}
