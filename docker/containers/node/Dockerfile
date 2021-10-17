FROM node:16-alpine
USER root
RUN apk --no-cache add yarn --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
RUN yarn add global @nestjs/cli
RUN yarn install