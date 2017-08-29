FROM node:8.2.1-alpine

WORKDIR /usr/src/wowanalyzer

# By doing this separate we allow Docker to cache this
COPY package.json package-lock.json /usr/src/
RUN npm install

COPY . /usr/src/wowanalyzer

# Webpack dev server has to poll because https://github.com/webpack/webpack-dev-server/issues/143
ENV WEBPOCK_WATCH_POLL=true

CMD ["npm", "start"]
