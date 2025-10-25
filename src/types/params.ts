interface Params {
    skip: Int16Array,
    sort: string,
    sortDirection: string,
    filter: string,
    id: string,
    slug: string,
    searchQuery: [
        {
            queryName: string,
            queryValue: string,
            characters: 
                 {
                    character1: string,
                    character2: string,
                    characterId: string,
                    opposingCharacterId: string
                }
            
        }
    ],
    tagFilter: string,
    limit: number
}

export default Params