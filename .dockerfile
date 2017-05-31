FROM node:8.0.0-alpine
ENV NODE_ENV=production
RUN mkdir -p /usr/src/wowanalyzer
COPY . /usr/src/wowanalyzer
WORKDIR /usr/src/wowanalyzer/server
USER node
RUN npm install
CMD ["node","index.js"]
