import { merge } from 'lodash';
import { makeExecutableSchema } from 'graphql-tools';
import { schema as libvirtSchema } from './libvirt/schema';
import { pubsub, LIBVIRT_EVENT } from './libvirt/events';

const rootSchema = [`
    type Query {
        domains: [Domain]
    }
    type Subscription {
        libvirtEvent: LibvirtEvent
    }
`];

const rootResolvers = {
    Query: {
        domains: (root, args, context) => {
            return context.Domains.getAll();
        }
    },
    Subscription: {
        libvirtEvent: {
            subscribe: () => pubsub.asyncIterator(LIBVIRT_EVENT),
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
