const fs = require('fs');
const express = require('express');
const console = require('console');
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
const apiBasePath = process.env.LIBVIRT_API_BASE_PATH;

app.get('/healthz', function (req, res, next) {
    res.sendStatus(200);
});

const server = new ApolloServer(
    {
        typeDefs,
        resolvers,
        dataSources: () => ({
                libvirtAPI: new LibvirtAPI(`${apiRoot}${apiBasePath}`),
        })
    }
);

server.applyMiddleware({ app });

process.on('SIGTERM', () => {
    server.close()
        .then(() => process.exit(0))
        .catch(() => process.exit(-1));
});

const serverURL = `http://localhost:${PORT}${server.graphqlPath}`;

app.listen({ port: PORT },() => {
    console.log(`🚀 Server ready at ${serverURL}`);
});
