import { Client } from 'discord.js';
import fetch, { Response } from 'node-fetch';
import { SCAM_DOMAINS } from '../utils/keys';
import { logger } from '../utils/logger';

function checkResponse(response: Response) {
	if (response.ok) return response;
	logger.warn({ response }, 'Fetching scam domains returned a non 2xx response code.');
	process.exit(1);
}

export async function updateScamDomains(client: Client) {
	const { redis } = client;
	const list = await fetch(process.env.SCAM_DOMAIN_URL!)
		.then(checkResponse)
		.then((r) => r.json());
	const before = await redis.scard(SCAM_DOMAINS);

	await redis.sadd(SCAM_DOMAINS, ...list);
	const after = await redis.scard(SCAM_DOMAINS);
	logger.info(
		{
			before,
			after,
		},
		'Scam domains updated',
	);
}
