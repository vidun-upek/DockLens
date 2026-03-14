from node:latest
run npm install
copy . .
cmd ["node", "app.js"]
