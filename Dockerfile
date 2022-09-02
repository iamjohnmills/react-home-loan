# Non-arm
# FROM node:16
# Arm64
FROM arm64v8/node
WORKDIR /src
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000 3001
