# frontend/Dockerfile
FROM node:16

WORKDIR /usr/src/app

COPY server.js .
COPY admin.html .
COPY index.html .
COPY products.json .
COPY package.json .

RUN npm install express

EXPOSE 3000

CMD ["node", "server.js"]