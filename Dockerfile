FROM mhart/alpine-node:7.4.0

WORKDIR /app

RUN apk add --no-cache make gcc g++ python

COPY package.json /app
RUN npm install --unsafe-perm --production --silent

COPY . /app

ENV PORT 3000
EXPOSE 3000

CMD make prod
