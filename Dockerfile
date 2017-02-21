FROM mhart/alpine-node:6.9.3

WORKDIR /app

RUN apk add --no-cache make gcc g++ python

COPY package.json /app
RUN npm install --unsafe-perm --production --silent

COPY . /app

ENV PORT 80
EXPOSE 80 443

CMD make prod
