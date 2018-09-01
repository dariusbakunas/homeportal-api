export const schema = [`
    type Domain {
        id: Int
        name: String!
        state: String!
        uuid: String!
    }
    
    type LibvirtEvent {
        uuid: String!
        event: String!
        detail: String!
    }
`];
