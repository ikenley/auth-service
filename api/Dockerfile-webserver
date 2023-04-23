# syntax=docker/dockerfile:1

FROM node:17 AS build

USER node
WORKDIR /usr/src/app

# Install app dependencies
COPY --chown=node:node package*.json ./
RUN npm install
# If you are building your code for production
#RUN npm ci --only=production

# Bundle app source
COPY --chown=node:node . .
RUN npm run build

# This will use a minimal base image for the runtime
FROM node:17-alpine

USER node
WORKDIR /usr/src/app

EXPOSE 8080

# Copy results from previous stage
COPY --chown=node:node --from=build /usr/src/app/package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

RUN npm prune --production

CMD [ "node", "dist/index.js" ]