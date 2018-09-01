import rp from 'request-promise';
import DataLoader from 'dataloader';

export class LibVirtConnector {
    constructor(apiRoot) {
        this.rp = rp;
        this.apiRoot = apiRoot;

        this.loader = new DataLoader(this.fetch.bind(this), {
            batch: false,
        });
    }

    fetch(urls) {
        const options = {
            json: true,
            resolveWithFullResponse: true,
            headers: {
                'user-agent': 'HomeAPIGraphQL',
            },
        };

        return Promise.all(urls.map((url) => {
            return new Promise((resolve, reject) => {
                this.rp({
                    uri: url,
                    ...options,
                }).then((response) => {
                    const body = response.body;
                    resolve(body);
                }).catch((err) => {
                    reject(err);
                });
            });
        }));
    }

    get(path) {
        return this.loader.load(this.apiRoot + path);
    }
}
