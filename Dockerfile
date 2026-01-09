FROM node:23-alpine AS build

ARG VITE_WIKI_PAGE_URL
ARG VITE_WIKI_TABLE_CAPTION

ENV VITE_WIKI_PAGE_URL=$VITE_WIKI_PAGE_URL
ENV VITE_WIKI_TABLE_CAPTION=$VITE_WIKI_TABLE_CAPTION

WORKDIR /
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine

COPY --from=build /dist /usr/share/nginx/html
COPY maintain/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080