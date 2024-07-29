/* eslint-disable */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 150000,
    data: new SlashCommandBuilder()
        .setName('config-new-sound')
        .setDescription(
            "This command allow you to create or update a user's sound effect."
        )
        .addUserOption((opt) =>
            opt
                .setName('target')
                .setDescription(
                    'The user whose you want to create or update sound.'
                )
                .setRequired(true)
        )
        .addAttachmentOption((opt) =>
            opt
                .setName('sound')
                .setDescription(
                    'The file should be an MP3 with a maximum size of 250 KB.'
                )
                .setRequired(true)
        ),

    async execute(interaction) {
        interaction.reply('Saved.');
    },
};
