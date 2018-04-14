export const schema = [`
    type Domain {
        id: Int!
        name: String!
        isActive: Boolean!
        uuid: String!
    }
    
    type LibvirtEvent {
        uuid: String!
        event: String!
        detail: String!
    }
`];
