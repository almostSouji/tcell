import { Client } from 'discord.js';
import { SCAM_DOMAINS } from '../../utils/keys';
import { logger } from '../../utils/logger';
import { resolveRedirect } from '../../utils/resolveRedirect';
import { URL } from 'url';

function urlOption(url: string): URL | null {
	try {
		return new URL(url);
	} catch {
		return null;
	}
}

export async function checkScam(client: Client, content: string): Promise<string[]> {
	const redis = client.redis;

	const linkRegex = /(?:https?:\/\/)(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b[-a-zA-Z0-9@:%_\+.~#?&//=]*/gi;

	const trippedDomains = [];
	let matches: any[] | null = [];

	const scamDomains = await redis.smembers(SCAM_DOMAINS);

	while ((matches = linkRegex.exec(content)) !== null) {
		const url = urlOption(matches[0]);
		if (!url) {
			continue;
		}

		const hit = scamDomains.find((d) => url.host.endsWith(d));

		if (hit) {
			trippedDomains.push(hit);
			continue;
		}

		try {
			const r = await resolveRedirect(url.href);
			const resolved = urlOption(r);
			if (!resolved) {
				continue;
			}

			const hit = scamDomains.find((domain) => resolved.host.endsWith(domain));

			if (hit) {
				trippedDomains.push(hit);
			}
		} catch (e) {
			const error = e as Error;
			logger.error(error, error.message);
		}
	}

	return trippedDomains;
}
