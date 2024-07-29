import { ChatInputCommandInteraction, Client, Collection } from 'discord.js';

interface ClientInterface extends Client {
    commands: Collection<unknown, CommandType>;
    cooldowns: Collection<unknown, any>;
}

interface CommandType {
    data: {
        name: string;
        description: string;
    };
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export default ClientInterface;
