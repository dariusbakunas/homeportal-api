FROM node:9.8

RUN mkdir -p /opt/app

# defaults to production, compose overrides this to development on build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

# default to port 80 for node
ARG PORT=80
ENV PORT $PORT
EXPOSE $PORT

# check every 30s to ensure this service returns HTTP 200
HEALTHCHECK CMD curl -fs http://localhost:$PORT/healthz || exit 1

# install dependencies first, in a different location for easier app bind mounting for local development
WORKDIR /opt
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force
RUN npm install -g babel-cli
ENV PATH /opt/node_modules/.bin:$PATH

# copy in our source code last, as it changes the most
WORKDIR /opt/app
COPY . /opt/app

# Add Tini
ENV TINI_VERSION v0.17.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# if you want to use npm start instead, then use `docker run --init in production`
# so that signals are passed properly. Note the code in index.js is needed to catch Docker signals
# using node here is still more graceful stopping then npm with --init afaik
# I still can't come up with a good production way to run with npm and graceful shutdown
CMD [ "npm", "start" ]