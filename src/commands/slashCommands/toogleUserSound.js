/* eslint-disable */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 150000,
    data: new SlashCommandBuilder()
        .setName('toggle-user-sound')
        .setDescription(
            "Use this command to toggle the bot's sound on or off when a specific user joins the server."
        )
        .addUserOption((opt) =>
            opt
                .setName('target')
                .setDescription(
                    'The user who will be affected by this command.'
                )
                .setRequired(true)
        ),
    async execute(interaction) {
        interaction.reply('Saved.');
    },
};
