# Build app
FROM node:10.12-alpine as app

WORKDIR /usr/src/app/

# By doing this separate we allow Docker to cache this
COPY package.json package-lock.json /usr/src/app/
RUN npm install

COPY . /usr/src/app/
RUN npm run build

# Build server
FROM node:10.12-alpine as server

WORKDIR /usr/src/app/

# By doing this separate we allow Docker to cache this
COPY server/package.json server/package-lock.json /usr/src/app/
RUN npm install

COPY server/ /usr/src/app/

RUN npm install
RUN npm run build
RUN npm prune --production

# Combine
FROM node:10.12-alpine

COPY --from=app /usr/src/app/build/ /usr/src/app/build/
COPY --from=server /usr/src/app/build/ /usr/src/app/
COPY --from=server /usr/src/app/node_modules/ /usr/src/app/node_modules/
WORKDIR /usr/src/app/

ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80
USER node

CMD node_modules/.bin/sequelize db:migrate && node --harmony index.js
