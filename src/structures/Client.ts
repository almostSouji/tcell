import { Client } from 'discord.js';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import * as Redis from 'ioredis';
import { join } from 'path';
import { CronJob } from 'cron';
import { logger } from '../utils/logger';
import { updateScamDomains } from '../jobs/updateScamDomains';

declare module 'discord.js' {
	export interface Client {
		readonly redis: Redis.Redis;
	}
}

export default class extends Client {
	public readonly redis: Redis.Redis = new Redis.default(6379, 'redis');
	public readonly listDict = new Map<string, string[]>();

	public async init() {
		await i18next.use(Backend).init({
			backend: {
				loadPath: join(__dirname, '../../locales/{{lng}}/{{ns}}.json'),
			},
			cleanCode: true,
			fallbackLng: ['en-US'],
			defaultNS: 'translation',
			lng: 'en-US',
			ns: ['translation'],
		});

		if (!process.env.SCAM_DOMAIN_URL) {
			logger.warn('Missing environment variable: SCAM_DOMAIN_URL.');
			process.exit(1);
		}

		const job = new CronJob('*/5 * * * *', () => {
			void updateScamDomains(this);
		});
		job.start();
	}
}
