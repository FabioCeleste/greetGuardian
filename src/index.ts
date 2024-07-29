require('dotenv').config();

import { Client } from './models/Client';

const token = process.env.DISCORD_TOKEN;

if (token) {
    const client = new Client();

    client.startBot(token);
}
