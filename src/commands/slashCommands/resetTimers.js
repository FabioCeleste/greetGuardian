/* eslint-disable */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 150000,
    data: new SlashCommandBuilder()
        .setName('reset-all-users-timers')
        .setDescription(
            'This command will reset the sound play cooldown for all users in this server.'
        ),

    async execute(interaction) {
        interaction.reply('Saved.');
    },
};
