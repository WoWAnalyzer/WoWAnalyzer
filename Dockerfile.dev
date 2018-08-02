FROM node:10.4-alpine

WORKDIR /usr/src/wowanalyzer/

# By doing this separate we allow Docker to cache this
COPY package.json package-lock.json /usr/src/wowanalyzer/
RUN npm install

# Note that several files (including node_modules) are ignored in .dockerignore
COPY . /usr/src/wowanalyzer/

EXPOSE 3000

CMD ["npm", "run", "safestart"]
