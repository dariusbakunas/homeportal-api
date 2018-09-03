const { RESTDataSource } = require('apollo-datasource-rest');

const apiRoot = process.env.LIBVIRT_API_ROOT;
const apiBasePath = process.env.LIBVIRT_API_BASE_PATH;

class LibvirtAPI extends RESTDataSource {
    constructor(baseURL) {
        super();
        this.baseURL = baseURL;
    }

    // willSendRequest(request) {
    //     request.headers.set('user-agent', 'HomeAPIGraphQL');
    // }

    async getDomains() {
        return this.get('/domains');
    }
}

module.exports = LibvirtAPI;
