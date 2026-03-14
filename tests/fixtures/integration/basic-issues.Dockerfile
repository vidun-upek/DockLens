FROM ubuntu:latest
RUN apt update && apt install -y curl git wget
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 5000 8080
CMD ["npm", "start"]
