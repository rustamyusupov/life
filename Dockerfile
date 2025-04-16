FROM node:23-alpine AS build

WORKDIR /
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=build /dist /usr/share/nginx/html
COPY maintain/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080