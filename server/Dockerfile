FROM node:lts-alpine as builder

ARG NPM_TOKEN
## Install build toolchain, install node deps and compile native add-ons
RUN apk add --no-cache python make g++

COPY package*.json ./
COPY .npmrc .npmrc
RUN npm ci --only=production

FROM node:lts-alpine as app

WORKDIR /usr/app

## Copy built node modules and binaries without including the toolchain
COPY package.json LICENSE ./
COPY lib lib
COPY --from=builder node_modules node_modules

EXPOSE 8080
CMD [ "npm", "start" ]
