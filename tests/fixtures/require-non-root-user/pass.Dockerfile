FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN adduser -D appuser
USER appuser
CMD ["node", "app.js"]
