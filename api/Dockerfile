# api/Dockerfile
FROM node:16

WORKDIR /usr/src/app

COPY api.js .
COPY products.json .
COPY package.json .

RUN npm install express cors graphql express-graphql

EXPOSE 8080

CMD ["node", "api.js"]