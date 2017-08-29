FROM node:8.2.1-alpine
WORKDIR /usr/src/wowanalyzer
COPY . /usr/src/wowanalyzer
CMD ["/bin/sh", "dockerrun.sh"]
