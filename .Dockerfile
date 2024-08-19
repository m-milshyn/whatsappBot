# Используем образ Node.js с Alpine Linux
FROM node:18-alpine

# Установка Chromium и необходимых библиотек
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    libx11 \
    libxcomposite \
    libxdamage \
    libxrandr \
    libxtst \
    libxi \
    gtk+3.0 \
    libxshmfence \
    libxcb \
    libxkbcommon \
    libxkbcommon-x11 \
    bash

# Создаем рабочую директорию
WORKDIR /home/app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем остальной код приложения
COPY . .

# Устанавливаем переменные окружения для Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser