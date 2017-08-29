FROM node:8.2.1
WORKDIR /usr/src/wowanalyzer
COPY . /usr/src/wowanalyzer
CMD ["/bin/bash", "dockerrun.sh"]
