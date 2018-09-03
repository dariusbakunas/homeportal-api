# ---- Base Node ----
FROM alpine:3.5 AS base
# install node
RUN apk add --no-cache nodejs-current tini
# set working directory
WORKDIR /root/app
# Set tini as entrypoint
ENTRYPOINT ["/sbin/tini", "--"]
# copy project file
COPY .eslintrc .babelrc package.json ./

#
# ---- Dependencies ----
FROM base AS dependencies
# install node packages
RUN npm set progress=false && npm config set depth 0
RUN npm install

#
# ---- Test ----
# run linters, build and tests
FROM dependencies AS test
COPY . .
RUN  npm run lint && npm run test
RUN npm prune --production

#
# ---- Release ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /root/app/node_modules ./node_modules
# copy app sources
COPY --from=test /root/app/api ./api
# expose port and define CMD
EXPOSE 5000
CMD npm run serve
