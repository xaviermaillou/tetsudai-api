const { dictionnary } = require('tetsudai-common')
const filters = require('../lib/filters')

module.exports = (app, kanjiList) => {
    app.get('/kanjiList/:offset/:level/:grammar/:collection/:search?', (req, res) => {
        const level = Number(req.params.level)
        const grammar = String(req.params.grammar)
        const collection = String(req.params.collection)
        const search = req.params.search || ""
    
        const offset = Number(req.params.offset)
    
        if (isNaN(offset)) {
            res.status(400).json('Offset must be a number')
            return
        }
    
        if (!dictionnary.fr.levels[level] && dictionnary.fr.levels[level] !== null) {
            res.status(400).json(`Level query must be a number between 0 and ${
                Object.keys(dictionnary.fr.levels)
                    [Object.keys(dictionnary.fr.levels).length - 1]
            }`)
            return
        }
        if (!dictionnary.fr.pluralClasses[grammar]) {
            res.status(400).json(`Grammar query must be one of those:
            ${Object.keys(dictionnary.fr.classes).map((key) => key)}`)
            return
        }
        if (!dictionnary.fr.collections[collection]) {
            res.status(400).json(`Collection query must be one of those:
            ${Object.keys(dictionnary.fr.collections).map((key) => key)}`)
            return
        }
    
        console.log('\nKanji requêtés \n',
            'Niveau:', dictionnary.fr.levels[level], '| Grammaire:', dictionnary.fr.pluralClasses[grammar],
            '| Collection:', dictionnary.fr.collections[collection], '| Recherche:', search,
            '\nOffset:', offset)
            
        const kanjiArray = []

        const searchIsLatin = (/^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/).test(search)

        const splittedSearch = [ search, ...search.split(/['\s]+/) ]
        let previousWord
        splittedSearch.forEach((searchElement) => {
            if (previousWord) splittedSearch.push(previousWord + ' ' + searchElement)
            previousWord = searchElement
        })

        splittedSearch.forEach((searchElement) => {
            kanjiList.forEach((kanji) => {
                if (
                    (
                        (kanji.collections?.includes(collection) || collection === "0")
                        && (dictionnary.fr.levels[level] === kanji.level || !level) 
                        && (kanji.grammar?.includes(grammar) || grammar === "0")
                    ) 
                    &&
                    (
                        filters.searchThroughKanji(kanji, searchElement, searchIsLatin)
                        || !searchElement
                    )
                ) {
                    const alreadyAddedItem = kanjiArray.find((element) => element.id === kanji.id)
                    if (alreadyAddedItem === undefined) {
                        kanjiArray.push({ 
                            id: kanji.id,
                            kanji: kanji.kanji,
                            readings: kanji.readings,
                            frequency: kanji.frequency,
                            translation: kanji.translation,
                            importance: filters
                                .getKanjiImportance(kanji, searchElement, 2, searchIsLatin)
                        })
                    } else if (alreadyAddedItem.importance < 2) {
                        alreadyAddedItem.importance = filters
                            .getKanjiImportance(kanji, searchElement, 2, searchIsLatin)
                    }
                }
            })
        })
    
        const sortedByImportance = kanjiArray.sort((a, b) => b.importance - a.importance)
    
        const slicedKanjiArray = sortedByImportance.slice(offset, offset + 100)
    
        console.log('Kanji envoyés:', slicedKanjiArray.length)
        res.json(slicedKanjiArray)
    })
    
    app.get('/kanji/:id', (req, res) => {
        const id = Number(req.params.id)
    
        if (isNaN(id)) {
            res.status(400).json('Requested id must be a number')
            return
        }
    
        let foundKanji
    
        kanjiList.forEach((kanji) => {
            if (kanji.id === id) foundKanji = kanji
        })

        if (!foundKanji) {
            res.status(404).json('No kanji found with this id.')
            return
        }
    
        res.json(foundKanji)
    })
}