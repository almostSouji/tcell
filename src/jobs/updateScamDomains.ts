import { Client } from 'discord.js';
import { refreshScamDomains } from '../functions/antiSpam/refreshScamDomains';

export async function updateScamDomains(client: Client) {
	const { redis } = client;
	await refreshScamDomains(redis);
}
