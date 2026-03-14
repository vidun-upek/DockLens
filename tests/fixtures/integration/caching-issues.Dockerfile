FROM node:20
WORKDIR /app
COPY package.json ./
RUN npm install
RUN npm install --save-dev @types/node typescript
COPY src ./src
RUN npm run build
COPY . .
CMD ["node", "dist/index.js"]
