FROM node:12-alpine

WORKDIR /usr/src/app

RUN apk add make gcc g++ python git libffi-dev linux-headers udev 

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]