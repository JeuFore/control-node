FROM node:12-alpine

WORKDIR /usr/src/app

RUN apk add make gcc g++ python3 git libffi-dev linux-headers udev

COPY package*.json ./

RUN npm install

RUN npm rebuild --build-from-source

COPY . .

CMD [ "npm", "start" ]