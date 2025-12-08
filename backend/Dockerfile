FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install --only=production

# Copy source
COPY src ./src

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "src/index.js"]
