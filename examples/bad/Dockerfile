FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN apt-get update && \
	apt-get install -y --no-install-recommends \
		curl git make gcc g++ python3 pkg-config openssl ca-certificates && \
	rm -rf /var/lib/apt/lists/*
ADD local-file.txt /tmp/local-file.txt
COPY .env /app/.env
RUN curl -fsSL https://example.com/install.sh | bash
CMD ["node", "server.js"]