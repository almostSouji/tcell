import { CommandInteraction } from 'discord.js';
import { transformInteraction } from './transformInteraction';
import { replyWithError } from '../../utils/responses';
import i18next from 'i18next';
import { PREFIX_BUG } from '../../utils/constants';

import { inlineCode } from '@discordjs/builders';
import { ConfigCommand } from '../../interactions/config';
import { handleConfigCommand } from './commands/config';

export async function handleCommands(interaction: CommandInteraction) {
	const { commandName, options } = interaction;
	const args = [...options.data.values()];

	switch (commandName) {
		case ConfigCommand.name:
			return handleConfigCommand(interaction, transformInteraction<typeof ConfigCommand>(args));

		default:
			await replyWithError(
				interaction,
				`${PREFIX_BUG} ${i18next.t('commandexecution.no_handler', {
					command: inlineCode(interaction.commandName),
					id: inlineCode(interaction.id),
				})}`,
			);
	}
}
