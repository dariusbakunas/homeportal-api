const { RESTDataSource } = require('apollo-datasource-rest');

class LibvirtAPI extends RESTDataSource {
    constructor(baseURL) {
        super();
        this.baseURL = baseURL;
    }

    async getDomains() {
        return this.get('/domains');
    }
}

module.exports = LibvirtAPI;
