# websocket/Dockerfile
FROM node:16

WORKDIR /usr/src/app

COPY websocket-server.js .
COPY package.json .

RUN npm install ws

EXPOSE 8081

CMD ["node", "websocket-server.js"]