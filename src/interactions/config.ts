import { ApplicationCommandOptionType, ChannelType } from 'discord-api-types/v9';

export const ConfigCommand = {
	type: 1,
	name: 'config',
	description: '🧪 Show or edit configuration',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'show',
			description: 'Show current configuration',
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'spam',
			description: 'Configure anti spam settings (set either argument to 0 to disable)',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'threshold',
					description: 'Amount of messages with equal content to consider a spam attempt',
					required: true,
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'expire',
					description: 'Duration (seconds) after which the duplicate counter should reset',
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'scam',
			description: 'Configure anti scam settings (set either argument to 0 to disable)',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'threshold',
					description: 'Amount of messages with equal content and scam domains to consider a scam attempt',
					required: true,
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'expire',
					description: 'Duration (seconds) after which the duplicate counter should reset',
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'mentions',
			description: 'Configure mention raid settings (set either argument to 0 to disable)',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'threshold',
					description: 'Amount of mentions to consider a spam attempt',
					required: true,
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'expire',
					description: 'Duration (seconds) after which the mention counter should reset',
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'log',
			description: 'Configure log channel',
			options: [
				{
					type: ApplicationCommandOptionType.Channel,
					name: 'channel',
					description: 'Channel to log actions in',
					channel_types: [ChannelType.GuildText, ChannelType.GuildPublicThread],
					required: true,
				},
			],
		},
	],
} as const;
