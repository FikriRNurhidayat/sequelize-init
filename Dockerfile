FROM node:12.13-alpine

WORKDIR /app
COPY . .
RUN npm install

CMD npm start
