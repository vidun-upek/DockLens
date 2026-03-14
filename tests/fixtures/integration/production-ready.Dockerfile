FROM node:20
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN adduser -D appuser
USER appuser
EXPOSE 3000
CMD ["node", "dist/server.js"]
