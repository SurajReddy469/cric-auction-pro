FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY server/ ./server/
ENV PORT=5175
EXPOSE 5175
CMD ["node", "server/multiplayerServer.js"]
