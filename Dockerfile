FROM node:12.8-alpine as build

WORKDIR /usr/src/app/

ARG REACT_APP_ENVIRONMENT_NAME
ARG REACT_APP_VERSION
ARG DISABLE_AUTOMATIC_ESLINT

ENV NODE_ENV=production

# By doing this separate we allow Docker to cache this
COPY package.json yarn.lock /usr/src/app/
RUN yarn

COPY . /usr/src/app/
RUN yarn build

FROM nginx:1.13.9-alpine

COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
