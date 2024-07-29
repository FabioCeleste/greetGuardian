require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guiildId = process.env.DISCORD_GUILD_ID;

const commands = [];
const commandsPath = path.join(__dirname, 'slashCommands');
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file: any) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        if (!guiildId) {
            console.log('deploy slash prod');
            const data = await rest.put(Routes.applicationCommands(clientId), {
                body: commands,
            });

            console.log(
                `Successfully reloaded ${data.length} application (/) commands.`
            );
        } else {
            console.log('deploy slash dev');

            const data = await rest.put(
                Routes.applicationGuildCommands(clientId, guiildId),
                {
                    body: commands,
                }
            );

            console.log(
                `Successfully reloaded ${data.length} application (/) commands.`
            );
        }
    } catch (error) {
        console.error(error);
    }
})();
