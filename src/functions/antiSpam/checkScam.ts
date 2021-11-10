import { Client } from 'discord.js';
import { SCAM_DOMAINS } from '../../utils/keys';
import { logger } from '../../utils/logger';
import { resolveRedirect } from '../../utils/resolveRedirect';

export async function checkScam(client: Client, content: string): Promise<string[]> {
	const redis = client.redis;

	const urlRegex =
		/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

	const trippedDomains = [];
	let matches: any[] | null = [];

	const scamDomains = await redis.smembers(SCAM_DOMAINS);

	while ((matches = urlRegex.exec(content)) !== null) {
		const url = matches[0];
		const hit = scamDomains.find((d) => url.toLowerCase().includes(d));

		if (hit) {
			trippedDomains.push(hit);
			continue;
		}

		try {
			const resolved = await resolveRedirect(url);
			const hit = scamDomains.find((d) => resolved.toLowerCase().includes(d));
			if (hit) {
				trippedDomains.push(hit);
			}
		} catch (e) {
			const err = e as Error;
			logger.error(err, 'Error while trying to resolve Redirect:');
		}
	}

	return trippedDomains;
}
