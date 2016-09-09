FROM mhart/alpine-node:4.4.5

WORKDIR /app

RUN apk add --no-cache make gcc g++ python
ADD . /app

RUN cd /app \
    && npm install --unsafe-perm --production --silent

ENV PORT 80
EXPOSE 80

CMD npm start
