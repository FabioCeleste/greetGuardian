import {
    Collection,
    Client as DiscordClient,
    Events,
    GatewayIntentBits,
} from 'discord.js';
import path, { join } from 'node:path';
import fs from 'node:fs';
import ClientInterface from '../types/client';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';

import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    NoSubscriberBehavior,
} from '@discordjs/voice';

export class Client {
    private _client: ClientInterface;

    private _maxFileSize: number;
    private _prisma: PrismaClient<
        Prisma.PrismaClientOptions,
        never,
        DefaultArgs
    >;

    constructor() {
        this._client = new DiscordClient({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
            ],
        }) as ClientInterface;

        this._prisma = new PrismaClient();
        this._maxFileSize = 250 * 1024;
    }

    public async startBot(discordToken: string) {
        this._client.once(Events.ClientReady, (c) => {
            console.log(`Ready! Logged in as ${c.user.tag}`);
        });

        await this._client.login(discordToken);

        this._startCommands();
        this._handleConfigureNewSound();
        this._handleVoiceUpdate();
        this._handleCleanAllTimers();
        this._handleTurnUserSoundsOff();
        this._handleResetuserTimer();
        this._handleJoinToNewGuild();
        this._handleUpdateGuildConfig();
    }

    private _startCommands() {
        this._client.commands = new Collection();
        this._client.cooldowns = new Collection();

        const slashCommandsPath = path.join(
            __dirname,
            '..',
            'commands',
            'slashCommands'
        );
        const commandFiles = fs
            .readdirSync(slashCommandsPath)
            .filter((file: any) => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(slashCommandsPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                this._client.commands.set(command.data.name, command);
            } else {
                console.log(
                    `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                );
            }
        }
    }

    private _handleConfigureNewSound() {
        this._client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;
            const command = this._client.commands.get(interaction.commandName);

            if (!command) return;

            if (command.data.name === 'config-new-sound') {
                const targetUser = interaction.options.getUser('target');
                const targetFile = interaction.options.getAttachment('sound');

                if (targetFile && targetUser) {
                    try {
                        if (targetFile.contentType !== 'audio/mpeg') {
                            await interaction.reply('sound should be a mp3.');
                            return;
                        }

                        if (targetFile.size > this._maxFileSize) {
                            await interaction.reply(
                                'sound max size is 250 KB.'
                            );
                            return;
                        }

                        const savedUser =
                            await this._prisma.userSound.findFirst({
                                where: {
                                    userId: targetUser.id,
                                    guildId: interaction.guildId || 'noguild',
                                },
                            });

                        const filePath = path.resolve(
                            __dirname,
                            '..',
                            'savedSounds',
                            interaction.guildId || 'noguild',
                            targetUser.id + '.mp3'
                        );

                        await Client.downloadSound(targetFile.url, filePath);

                        if (!savedUser) {
                            await this._prisma.userSound.create({
                                data: {
                                    lastPlayed: null,
                                    userId: targetUser.id,
                                    guildId: interaction.guildId || 'noguild',
                                    shouldPlay: true,
                                },
                            });
                        }

                        await interaction.reply(
                            `\u{1F3B6} Congratulatoins! you have configured a new sound effect for ${targetUser.displayName} \u{1F3B6}`
                        );
                    } catch (error) {
                        console.error(error);
                        await interaction.reply({
                            content:
                                'There was an error while executing this command! please try again later',
                            ephemeral: true,
                        });
                    }
                }
            }
        });
    }

    private _handleVoiceUpdate() {
        this._client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
            if (oldState.channelId === newState.channelId) {
                return;
            }

            if (newState.channelId === null) {
                return;
            }

            if (newState.member) {
                const interactionsUserId = newState.member.user.id;
                const interactionGuildId = newState.guild.id;

                const savedUser = await this._prisma.userSound.findFirst({
                    where: {
                        userId: interactionsUserId,
                        guildId: interactionGuildId,
                    },
                });

                if (!savedUser || !savedUser.shouldPlay) {
                    return;
                }

                const guildConfig = await this._prisma.guildConfig.findFirst({
                    where: {
                        id: interactionGuildId,
                    },
                });

                if (guildConfig && !guildConfig.isSoundsOn) {
                    return;
                }

                const minToCompare = guildConfig
                    ? guildConfig.delayInMinutes
                    : 60;

                if (savedUser.lastPlayed) {
                    const diffInMin = Client.minDiff(
                        savedUser.lastPlayed.toISOString(),
                        new Date().toISOString()
                    );

                    if (diffInMin < minToCompare) {
                        return;
                    }
                }

                const audioResource = createAudioResource(
                    join(
                        __dirname,
                        '..',
                        'savedSounds',
                        interactionGuildId,
                        interactionsUserId + '.mp3'
                    )
                );

                const connection = joinVoiceChannel({
                    channelId: newState.channelId,
                    guildId: interactionGuildId,
                    adapterCreator: newState.guild.voiceAdapterCreator,
                });

                const player = createAudioPlayer({
                    behaviors: {
                        noSubscriber: NoSubscriberBehavior.Pause,
                    },
                });

                player.play(audioResource);

                connection.subscribe(player);

                await this._prisma.userSound.update({
                    data: {
                        lastPlayed: new Date().toISOString(),
                    },
                    where: {
                        id: savedUser.id,
                    },
                });
            }
        });
    }

    private async _handleCleanAllTimers() {
        this._client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = this._client.commands.get(interaction.commandName);

            if (!command) return;
            if (command.data.name === 'reset-all-users-timers') {
                try {
                    await this._prisma.userSound.updateMany({
                        where: {
                            guildId: interaction.guildId || 'guildId',
                        },
                        data: {
                            lastPlayed: null,
                        },
                    });

                    await interaction.reply(
                        '\u{23F3} The cooldowns timers are reset for all users \u{23F3}'
                    );
                } catch (error) {
                    console.log(error);
                }
            }
        });
    }

    private async _handleTurnUserSoundsOff() {
        this._client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = this._client.commands.get(interaction.commandName);

            if (!command) return;
            if (command.data.name === 'toggle-user-sound') {
                try {
                    const targetUser = interaction.options.getUser('target');
                    if (targetUser) {
                        const savedUser =
                            await this._prisma.userSound.findFirst({
                                where: {
                                    userId: targetUser.id,
                                    guildId: interaction.guildId || 'noguild',
                                },
                            });

                        if (!savedUser) {
                            await interaction.reply(
                                "\u{274C} This user doesn't have a sound configured."
                            );
                            return;
                        }

                        await this._prisma.userSound.update({
                            where: { id: savedUser.id },
                            data: {
                                shouldPlay: !savedUser.shouldPlay,
                            },
                        });

                        await interaction.reply(
                            `\u{1F51B} The user ${targetUser.displayName} is now with sounds ${savedUser.shouldPlay ? 'off' : 'on'}.`
                        );
                    }
                } catch (error) {
                    await interaction.reply({
                        content:
                            'There was an error while executing this command! please try again later',
                        ephemeral: true,
                    });
                    console.log(error);
                }
            }
        });
    }

    private async _handleResetuserTimer() {
        this._client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = this._client.commands.get(interaction.commandName);

            if (!command) return;
            if (command.data.name === 'reset-user-timer') {
                try {
                    const targetUser = interaction.options.getUser('target');
                    if (targetUser) {
                        const savedUser =
                            await this._prisma.userSound.findFirst({
                                where: {
                                    userId: targetUser.id,
                                    guildId: interaction.guildId || 'noguild',
                                },
                            });

                        if (!savedUser) {
                            await interaction.reply(
                                "\u{274C} This user doesn't have a sound configured."
                            );
                            return;
                        }

                        await this._prisma.userSound.update({
                            where: { id: savedUser.id },
                            data: {
                                lastPlayed: null,
                            },
                        });

                        await interaction.reply(
                            `\u{1F509} I will play a sound next time ${targetUser.displayName} joins a channel.`
                        );
                    }
                } catch (error) {
                    await interaction.reply({
                        content:
                            'There was an error while executing this command! please try again later',
                        ephemeral: true,
                    });
                }
            }
        });
    }

    private async _handleUpdateGuildConfig() {
        this._client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = this._client.commands.get(interaction.commandName);

            if (!command) return;
            if (
                command.data.name === 'update-server-config' &&
                interaction.guildId
            ) {
                try {
                    const newDelay = interaction.options.getInteger('delay');
                    const newSoundOn = interaction.options.getBoolean('play');

                    const savedGuildConfig =
                        await this._prisma.guildConfig.findFirst({
                            where: {
                                id: interaction.guildId,
                            },
                        });

                    if (savedGuildConfig) {
                        await this._prisma.guildConfig.update({
                            where: {
                                id: interaction.guildId,
                            },
                            data: {
                                delayInMinutes:
                                    newDelay || savedGuildConfig.delayInMinutes,
                                isSoundsOn:
                                    newSoundOn === null
                                        ? savedGuildConfig.isSoundsOn
                                        : newSoundOn,
                            },
                        });

                        await interaction.reply(
                            '\u{1F4BE} The new configuration is saved for this server.'
                        );
                        return;
                    }

                    await this._prisma.guildConfig.create({
                        data: {
                            id: interaction.guildId,
                            isSoundsOn: newSoundOn || true,
                            delayInMinutes: newDelay || 60,
                        },
                    });

                    await interaction.reply(
                        '\u{1F4BE} The new configuration is saved for this server.'
                    );
                } catch (error) {
                    console.log(error);

                    await interaction.reply({
                        content:
                            'There was an error while executing this command! please try again later',
                        ephemeral: true,
                    });
                }
            }
        });
    }

    private async _handleJoinToNewGuild() {
        this._client.on('guildCreate', async (guild) => {
            try {
                const guildConfig = await this._prisma.guildConfig.findFirst({
                    where: {
                        id: guild.id,
                    },
                });

                if (!guildConfig) {
                    await this._prisma.guildConfig.create({
                        data: {
                            id: guild.id,
                            isSoundsOn: true,
                            delayInMinutes: 60,
                        },
                    });
                }
            } catch (error) {
                console.log(error);
            }
        });
    }

    static async downloadSound(url: string, outputPath: string) {
        try {
            const tempPath = path.resolve(
                __dirname,
                '..',
                'savedSounds',
                uuidv4() + '.mp3'
            );

            const outputDir = path.dirname(outputPath);

            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream',
            });

            const writer = fs.createWriteStream(tempPath);

            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            await new Promise((resolve, reject) => {
                ffmpeg(tempPath)
                    .audioBitrate(128)
                    .on('end', resolve)
                    .on('error', reject)
                    .save(outputPath);
            });

            fs.unlinkSync(tempPath);
        } catch (error) {
            console.error(`Error downloading the file: ${error}`);
        }
    }

    static minDiff(date1: string, date2: string) {
        const formattedDate1 = new Date(date1);
        const formattedDate2 = new Date(date2);

        const msDiffer = Math.abs(
            formattedDate2.getTime() - formattedDate1.getTime()
        );

        const mDiffer = msDiffer / (1000 * 60);

        return parseInt(`${mDiffer}`);
    }
}
