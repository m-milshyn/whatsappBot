FROM node:18-alpine

# Установка Chromium и необходимых библиотек
# Устанавливаем необходимые зависимости для Chromium
RUN apk add \
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
    libxkbcommon-x11
# Создаем рабочую директорию
WORKDIR /home/app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем остальной код
COPY . .

# Устанавливаем переменные окружения
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser