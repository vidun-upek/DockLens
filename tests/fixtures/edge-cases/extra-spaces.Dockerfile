FROM     node:latest
RUN     npm install
COPY     . .
CMD     ["node", "app.js"]
