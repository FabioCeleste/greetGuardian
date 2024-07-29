-- CreateTable
CREATE TABLE "UserSound" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "lastPlayed" TIMESTAMP(3),
    "shouldPlay" BOOLEAN NOT NULL,

    CONSTRAINT "UserSound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildConfig" (
    "id" TEXT NOT NULL,
    "isSoundsOn" BOOLEAN NOT NULL,
    "delayInMinutes" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "GuildConfig_pkey" PRIMARY KEY ("id")
);
