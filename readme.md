<h1 align="center">GreetGuardian</h1>

<div align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D%2020.0.0-brightgreen" alt="Node.js version">
  <img src="https://img.shields.io/badge/prisma-%5E5.17.0-blue" alt="Prisma version">
  <img src="https://img.shields.io/badge/discord.js-%5E14.15.3-blueviolet" alt="Discord.js version">
  <img src="https://img.shields.io/badge/ffmpeg-%3E%3D%207.0.0-red" alt="FFmpeg version">
  <img src="https://img.shields.io/badge/postgresql-%3E%3D%2016.0-blue" alt="PostgreSQL version">
  <img src="https://img.shields.io/badge/docker-%3E%3D%2024.0.0-blue" alt="Docker version">
  <img src="https://img.shields.io/badge/eslint-9.7.0-blue" alt="ESLint version">
  <img src="https://img.shields.io/badge/prettier-3.3.3-orange" alt="Prettier version">
</div>

---

GreetGuardian is a Discord bot designed to enhance your server's experience by playing a custom sound whenever a specific user joins a voice channel. Whether you want to welcome users with a friendly greeting, a fun sound effect, or even a personalized message, GreetGuardian makes sure every entry is noticed.

## Table of Contents

-   [How to Use the Bot](#how-to-use-the-bot)
-   [How to Run the Bot Locally](#how-to-run-the-bot-locally)
-   [What Tech is Used and How it's Made](#what-tech-is-used-and-how-its-made)
-   [Contact](#contact)

## How to Use the Bot

1. **Add GreetGuardian to Your Server**  
   Use [this link](https://discord.com/oauth2/authorize?client_id=1267459165337550951) to add the bot to your server.

2. **Commands**
   <a name="config-new-sound"></a>

    - **/config-new-sound**  
      Configures a new sound to play when a user enters the server. By default, the bot plays the sound for the same user only once every 60 minutes. This time interval can be configured using the `/update-server-config` command. This command has 2 required parameters:

        - **@target**: The user to add a new sound for in the server.
        - **sound**: The sound file to play when the user joins a channel. Note that the file needs to be an mp3 with a maximum size of 250kb.

    - **/toggle-user-sound**  
      Turns on and off the functionality of the bot to play sound for a specific user. This command has 1 required parameter:

        - **@target**: The user affected by the command.

    - **/reset-user-timer**  
      Resets the timer for the bot to play sound again for a specific user. This command has 1 required parameter:

        - **@target**: The user affected by the command.

    - **/reset-all-users-timers**  
      Resets the timer for the bot to play sound again for all users.

    - **/update-server-config**  
      Configures the server settings for the bot. This command has 2 optional parameters:
        - **play**: Whether the bot should stop playing sound in that server.
        - **delay**: The number of minutes the bot should wait to play sound again for a specific user.

## How to Run the Bot Locally

<a name="how-to-run-the-bot-locally"></a>
Step-by-step guide to running the bot on your local machine:

1. **Ensure Prerequisites**

    - **Git**: Install Git for version control and repository management.
    - **Node.js**: Install Node.js version 20 or higher.
    - **FFmpeg**: Install FFmpeg for audio processing.
    - **Docker**: Install Docker to run the bot in a containerized environment.

2. **Clone the Repository**

    ```
    git clone https://github.com/FabioCeleste/greetGuardian.git
    cd greetGuardian
    ```

3. **Ensure Prerequisites**

    Run the following command to install the required Node.js packages:

    ```
    npm install
    ```

4. **Configure Environment Variables**

    Create a .env file in the root directory with the following content:

    ```
    DISCORD_TOKEN=your_discord_bot_token
    DISCORD_CLIENT_ID=your_discord_bot_client_id
    DISCORD_GUILD_ID=your_guild_id_for_slash_commands

    DATABASE_URL=database_url
    POSTGRES_PASSWORD=database_password
    POSTGRES_DB=postgres_database
    ```

    Note: If DISCORD_GUILD_ID is not provided, slash commands will be registered to all servers the bot is added to.

5. **Register Slash Commands**

    If slash commands are not configured, run:

    ```
    npm run register-commands-dev
    ```

6. **Start the Bot**

    Finally, run:

    ```
    docker-compose up --build
    ```

## What Tech is Used and How it's Made

<a name="what-tech-is-used-and-how-its-made"></a>
GreetGuardian leverages a powerful stack of technologies to deliver a seamless and reliable experience. Here’s a look at what’s under the hood:

-   **Node.js with TypeScript**: The project is built on Node.js, using TypeScript to provide strong typing and modern JavaScript features for robust and maintainable code.

-   **Discord.js**: This library powers the bot's interaction with Discord's API, enabling it to handle events, manage voice channels, and execute commands.

-   **FFmpeg**: Used for audio compression and processing, FFmpeg ensures that sound files are optimized for performance without compromising quality.

-   **PostgreSQL**: This reliable relational database serves as the backbone for storing user configurations and sound files, providing a solid foundation for data management.

-   **Prisma**: Acting as the ORM layer, Prisma facilitates smooth database interactions with an intuitive API, allowing for efficient data querying and manipulation.

-   **ESLint and Prettier**: Code quality is maintained with ESLint for linting and Prettier for code formatting, ensuring a consistent and error-free codebase.

-   **Docker and GitHub Actions**: Docker containers are used for consistent and isolated development environments, while GitHub Actions automates the build, test, and deployment processes, streamlining the CI/CD pipeline.

This tech stack not only ensures high performance and reliability but also enhances the developer experience with modern tooling and practices.

## Contact

<a name="contact"></a>
For support or collaboration, you can reach out via the following:

-   **LinkedIn**: [Fabio Celeste](https://www.linkedin.com/in/fabio-celeste/)
-   **GitHub**: [FabioCeleste](https://github.com/FabioCeleste)
-   **Email**: [fabio.wow.lol@gmail.com](mailto:fabio.wow.lol@gmail.com)
