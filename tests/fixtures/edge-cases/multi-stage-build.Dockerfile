FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM node:20 AS runtime
WORKDIR /app
COPY . .
RUN npm install
COPY --from=builder /app/dist ./dist
CMD ["node", "dist/server.js"]
