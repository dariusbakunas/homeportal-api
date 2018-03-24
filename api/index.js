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
// if you're not using docker-compose for local development, this will default to 8080
// to prevent non-root permission problems with 80. Dockerfile is set to make this 80
// because containers don't have that issue :)


// App
const app = express();

app.use(morgan('common'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//{ schema: executableSchema }
app.use('/graphql', graphqlExpress((req) => {
    const query = req.query.query || req.body.query;

    if (query && query.length > 2000) {
        // None of our app's queries are this long
        // Probably indicates someone trying to send an overly expensive query
        throw new Error('Query too large.');
    }

    const libvirtConnector = new LibVirtConnector(process.env.LIBVIRT_API_ROOT);

    return {
        schema,
        context: {
            Domains: new Domains({ connector: libvirtConnector })
        },
        tracing: true,
        cacheControl: true
    };
}));

app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    query: `{
    domains {
      id
      name
    }   
}`,}));


app.get('/healthz', function (req, res) {
    // do app logic here to determine if app is truly healthy
    // you should return 200 if healthy, and anything else will fail
    // if you want, you should be able to restrict this to localhost (include ipv4 and ipv6)
    res.send('I am happy and healthy\n');
});

const server = app.listen(PORT, function () {
    console.log('Webserver is ready');
});


//
// need this in docker container to properly exit since node doesn't handle SIGINT/SIGTERM
// this also won't work on using npm start since:
// https://github.com/npm/npm/issues/4603
// https://github.com/npm/npm/pull/10868
// https://github.com/RisingStack/kubernetes-graceful-shutdown-example/blob/master/src/index.js
// if you want to use npm then start with `docker run --init` to help, but I still don't think it's
// a graceful shutdown of node process
//

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint () {
    console.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
    shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm () {
    console.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
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
    })
}
//
// need above in docker container to properly exit
//
