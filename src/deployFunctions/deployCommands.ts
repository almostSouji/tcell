import { config } from 'dotenv';
import { resolve } from 'path';
import { REST } from '@discordjs/rest';
import { Routes, Snowflake } from 'discord-api-types/v9';

config({ path: resolve(__dirname, '../../.env') });

/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-enable @typescript-eslint/no-unused-vars */
import { logger } from '../utils/logger';
import { ConfigCommand } from '../interactions/config';

const commands = [ConfigCommand];

async function main() {
	const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN!);

	try {
		logger.info('Start refreshing interaction (/) commands');
		await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID as Snowflake, '900017700850507807'), {
			body: commands,
		});
		logger.info('Successfully reloaded interaction (/) commands.');
	} catch (e: any) {
		logger.error(e, e.message);
	}
}

void main();
