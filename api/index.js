const fs = require('fs');
const { ApolloServer, gql } = require('apollo-server');

if (!process.env.LIBVIRT_API_ROOT) {
    require('dotenv').config();
}

const LibvirtAPI = require('./libvirtApi');

// Constants
const PORT = process.env.PORT || 8080;

const typeDefs = gql`${fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8')}`;

const resolvers = {
    Query: {
        domains: async (_source, _args, { dataSources }) => {
            return dataSources.libvirtAPI.getDomains();
        }
    }
};

const apiRoot = process.env.LIBVIRT_API_ROOT;
const apiBasePath = process.env.LIBVIRT_API_BASE_PATH;

const server = new ApolloServer(
    {
        typeDefs,
        resolvers,
        dataSources: () => ({
                libvirtAPI: new LibvirtAPI(`${apiRoot}${apiBasePath}`),
        })
    }
);

server.listen({ port: PORT }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
