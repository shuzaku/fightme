interface Params {
    skip: Int16Array,
    sortOption: string,
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
}

export default Params