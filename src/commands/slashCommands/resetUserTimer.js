/* eslint-disable */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 150000,
    data: new SlashCommandBuilder()
        .setName('reset-user-timer')
        .setDescription(
            'This command allows you to reset the cooldown time for a specific user.'
        )
        .addUserOption((opt) =>
            opt
                .setName('target')
                .setDescription('The user whose timer you want to reset.')
                .setRequired(true)
        ),
    async execute(interaction) {
        interaction.reply('Saved.');
    },
};
