import { Client } from 'discord.js';
import { SCAM_DOMAINS } from '../../utils/keys';

export async function checkScam(client: Client, content: string): Promise<string[]> {
	const redis = client.redis;

	const scamDomains = await redis.smembers(SCAM_DOMAINS);
	return scamDomains.filter((domain) => content.toLowerCase().includes(domain));
}
