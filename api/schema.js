import { merge } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
import { schema as libvirtSchema } from './libvirt/schema';

const rootSchema = [`
    type Query {
        domains: [Domain]
    }
`];

const rootResolvers = {
    Query: {
        domains: (root, args, context) => {
            return context.Domains.getAll();
        }
    }
};

const schema = [...rootSchema, ...libvirtSchema];
const resolvers = merge(rootResolvers);

const executableSchema = makeExecutableSchema({
    typeDefs: schema,
    resolvers,
});

export default executableSchema;