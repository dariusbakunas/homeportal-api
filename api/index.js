const fs = require('fs');
const express = require('express');
const console = require('console');
const morgan = require('morgan');
const path = require('path');
const winston = require('winston');
const { ApolloServer, gql } = require('apollo-server-express');

if (!process.env.LIBVIRT_API_ROOT) {
    require('dotenv').config();
}

const LibvirtAPI = require('./libvirtApi');

// Constants
const PORT = process.env.PORT || 8080;
const app = express();

const schema = fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8');

const typeDefs = gql`${schema}`;

const resolvers = {
    Query: {
        domains: async (_source, _args, { dataSources }) => {
            return dataSources.libvirtAPI.getDomains();
        }
    }
};

const apiRoot = process.env.LIBVIRT_API_ROOT;
const apiBasePath = process.env.LIBVIRT_API_BASE_PATH || '';

app.use(morgan('combined'));

app.get('/healthz', function (req, res, next) {
    res.sendStatus(200);
});

const server = new ApolloServer(
    {
        typeDefs,
        resolvers,
        dataSources: () => ({
                libvirtAPI: new LibvirtAPI(path.join(apiRoot, apiBasePath)),
        })
    }
);

server.applyMiddleware({ app });

const signals = {
    'SIGHUP': 1,
    'SIGINT': 2,
    'SIGTERM': 15
};

const shutdown = (signal, value) => {
    app.close(() => {
        winston.info(`server stopped by ${signal} with value ${value}`);
        process.exit(128 + value);
    });
};

Object.keys(signals).forEach((signal) => {
    process.on(signal, () => {
        console.log(`process received a ${signal} signal`);
        shutdown(signal, signals[signal]);
    });
});

const serverURL = `http://localhost:${PORT}${server.graphqlPath}`;

app.listen({ port: PORT },() => {
    console.log(`🚀 Server ready at ${serverURL}`);
});
