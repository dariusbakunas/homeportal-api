export class Domains {
    constructor({ connector }) {
        this.connector = connector;
    }

    getAll = () => {
        return this.connector.get('/domains');
    };

    getByUUID = (uuid) => {
        return this.connector.get(`/domain/${uuid}`);
    };
}

