FROM node:11.11-alpine as build

WORKDIR /usr/src/app/
ENV NODE_ENV=production

# By doing this separate we allow Docker to cache this
COPY package.json package-lock.json /usr/src/app/
RUN npm ci --dev

COPY . /usr/src/app/
RUN npm run build

FROM nginx:1.13.9-alpine

COPY --from=build /usr/src/app/build /usr/share/nginx/html

EXPOSE 80
USER nginx

CMD ["nginx", "-g", "daemon off;"]
