import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { LibVirtConnector } from './libvirt/connector';
import { Domains } from './libvirt/models';
import schema from './schema';

if (!process.env.LIBVIRT_API_ROOT) {
    require('dotenv').config();
}

// Constants
const PORT = process.env.PORT || 8080;
// if you're not using docker-compose for local development,
// this will default to 8080 to prevent non-root permission problems with 80.
// Dockerfile is set to make this 80 because containers don't have that issue :)


// App
const app = express();

app.use(morgan('common'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// const socket = io(`${process.env.LIBVIRT_API_ROOT}/libvirt`);
//
// socket.on('connect', () => {
//     console.log('Websocket connected');
// });
//
// socket.on('libvirt-event', (data) => {
//     // pubsub.publish(LIBVIRT_EVENT, { libvirtEvent: data });
//     console.log('Received event: ', data);
// });
//
// socket.on('disconnect', () => {
//     console.log('Websocket disconnected');
// });
//
// // Create WebSocket listener server
// const websocketServer = createServer((request, response) => {
//     response.writeHead(404);
//     response.end();
// });
//
// // Bind it to port and start listening
// websocketServer.listen(process.env.WS_PORT, () => console.log(
//     `Websocket Server is now running on
// http://localhost:${process.env.WS_PORT}`
// ));

// const subscriptionServer = SubscriptionServer.create(
//     {
//         schema,
//         execute,
//         subscribe,
//     },
//     {
//         server: websocketServer,
//         path: '/graphql',
//     },
// );

//{ schema: executableSchema }
app.use('/graphql', graphqlExpress((req) => {
    const query = req.query.query || req.body.query;

    if (query && query.length > 2000) {
        // None of our app's queries are this long
        // Probably indicates someone trying to send an overly expensive query
        throw new Error('Query too large.');
    }

    const apiRoot = process.env.LIBVIRT_API_ROOT;
    const apiBasePath = process.env.LIBVIRT_API_BASE_PATH;

    const libvirtConnector = new LibVirtConnector(`${apiRoot}${apiBasePath}`);

    return {
        schema,
        context: {
            Domains: new Domains({ connector: libvirtConnector })
        },
        // tracing: true,
        // cacheControl: true
    };
}));

app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:${process.env.WS_PORT}/graphql`,
    query: `
    {
        domains {
          id
          name
        }   
    }
    `,
}));


app.get('/healthz', function (req, res) {
    res.send('I am happy and healthy\n');
});

const server = app.listen(PORT, function () {
    console.log('Webserver is ready');
});


// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint () {
    console.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ',
        new Date().toISOString());
    shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm () {
    console.info('Got SIGTERM (docker container stop). Graceful shutdown ',
        new Date().toISOString());
    shutdown();
});

// shut down server
function shutdown() {
    server.close(function onServerClosed (err) {
        if (err) {
            console.error(err);
            process.exitCode = 1;
        }
        process.exit();
    });
}
//
// need above in docker container to properly exit
//
