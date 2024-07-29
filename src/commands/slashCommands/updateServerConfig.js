/* eslint-disable */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 150000,
    data: new SlashCommandBuilder()
        .setName('update-server-config')
        .setDescription('update-server-config')
        .addIntegerOption((opt) =>
            opt
                .setName('delay')
                .setDescription(
                    'Set the cooldown time in minutes for a user to play a sound again.'
                )
        )
        .addBooleanOption((opt) =>
            opt
                .setName('play')
                .setDescription('Setting this to false will turn the bot off.')
        ),
    async execute(interaction) {
        interaction.reply('Saved.');
    },
};
