FROM node:20-alpine

RUN apk update && apk add --no-cache openssl

ARG BUILD_CONTEXT
ENV WORKSPACE $BUILD_CONTEXT

WORKDIR /microservices

# Copy yarn workspaces stuff
COPY package.json .
COPY yarn.lock .

COPY .yarnrc .
COPY .yarn ./.yarn

# Copy the current build context's package.json
COPY ./microservices/$BUILD_CONTEXT/package.json microservices/$BUILD_CONTEXT/package.json

# Copy the modules
COPY ./modules modules

## Install dependencies
RUN yarn --frozen-lockfile

# Use a different directory for the node_modules
ENV NODE_MODULES_CACHE=/usr/src/cache/node_modules
RUN mkdir -p $NODE_MODULES_CACHE

# Use the cache for the node_modules
RUN ln -s $NODE_MODULES_CACHE node_modules

# copy envs
#COPY microservices/control/.env envs/.env

# Copy the current build context
COPY ./microservices/$BUILD_CONTEXT microservices/$BUILD_CONTEXT

# Install dependencies
RUN yarn workspace logger build
RUN yarn workspace library build
RUN yarn workspace microservice build
RUN yarn workspace middlewares build

# Run build for the current workspace
RUN yarn workspace $BUILD_CONTEXT build

# Clean up image
RUN rm -rf microservices/$BUILD_CONTEXT/src
RUN rm -rf microservices/$BUILD_CONTEXT/.eslintrc.json
RUN rm -rf microservices/$BUILD_CONTEXT/tsconfig.json

# Expose the port and start the server
EXPOSE 80
CMD yarn workspace ${WORKSPACE} start
