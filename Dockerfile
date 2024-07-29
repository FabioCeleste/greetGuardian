FROM node:20.10.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache ffmpeg

RUN npm install --legacy-peer-deps --omit=dev

COPY . .
