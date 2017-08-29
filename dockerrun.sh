#!/usr/bin/env bash
set -e
set -x

export NODE_ENV="${NODE_ENV:-development}"

if [ $NODE_ENV == "development" ]; then
  # this runs webpack-dev-server with hot reloading
  npm install
  npm start
else
  # build a full production version
  npm install
  npm run build
  cd ./server
  # build the server and serve it
  npm install
  su node
  npm start
fi
