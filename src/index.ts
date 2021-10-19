/* eslint-disable @typescript-eslint/no-misused-promises */
import { Intents } from 'discord.js';
import Client from './structures/Client';
import { logger } from './utils/logger';
import { handleCommands } from './functions/commandHandling/handleCommands';
import i18next from 'i18next';
import { replyWithError } from './utils/responses';
import { checkSpam } from './functions/antiSpam/checkSpam';

export interface ProcessEnv {
	DISCORD_TOKEN: string;
	DISCORD_CLIENT_ID: string;
	DEPLOY_GUILD_ID?: string;
	SCAM_URL_REMOTE_URL: string;
}

async function main() {
	const client = new Client({
		intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS],
	});

	try {
		await client.init();

		client.on('messageCreate', async (message) => {
			try {
				if (message.author.bot || !message.content.length) return;
				await checkSpam(message);
			} catch (err: any) {
				logger.error(err, err.message);
			}
		});

		client.on('ready', () => {
			logger.info(
				i18next.t('ready.ready_log', {
					user: client.user!.tag,
					id: client.user!.id,
					lng: 'en-US',
				}),
			);
		});

		client.on('interactionCreate', async (interaction) => {
			if (interaction.isCommand() || interaction.isContextMenu()) {
				try {
					await handleCommands(interaction);
				} catch (error: any) {
					Error.stackTraceLimit = Infinity;
					logger.error(error, error.message);
					await replyWithError(interaction, i18next.t('common.errors.during_command'));
				}
				return;
			}

			// ~ unhandled interaction
			logger.debug({
				msg: 'unknown interaction',
				interaction,
			});
		});

		await client.login(process.env.DISCORD_TOKEN);
	} catch (error: any) {
		logger.error(error, error.message);
	}
}

void main();
