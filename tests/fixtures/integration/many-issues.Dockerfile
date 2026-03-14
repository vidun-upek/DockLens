FROM node:latest
WORKDIR /app
ADD . /app
RUN curl -sSL https://example.com/install.sh | bash
RUN apt update
RUN apt install -y curl
RUN apt install -y git
CMD ["node", "app.js"]
