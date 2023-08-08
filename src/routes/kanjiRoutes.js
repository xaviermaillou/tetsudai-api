const { dictionnary } = require('tetsudai-common')
const libFunctions = require('../lib/common')
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
    
        if (!dictionnary.levels[level] && dictionnary.levels[level] !== null) {
            res.status(400).json(`Level query must be a number between 0 and ${
                Object.keys(dictionnary.levels)
                    [Object.keys(dictionnary.levels).length - 1]
            }`)
            return
        }
        if (!dictionnary.pluralClasses[grammar]) {
            res.status(400).json(`Grammar query must be one of those:
            ${Object.keys(dictionnary.classes).map((key) => key)}`)
            return
        }
        if (!dictionnary.collections[collection]) {
            res.status(400).json(`Collection query must be one of those:
            ${Object.keys(dictionnary.collections).map((key) => key)}`)
            return
        }
    
        console.log('\nKanji requêtés \n',
            'Niveau:', dictionnary.levels[level], 'Grammaire:', dictionnary.pluralClasses[grammar],
            'Collection:', dictionnary.collections[collection], 'Recherche:', search,
            '\nOffset:', offset)
            
        const kanjiArray = []

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
                        && (dictionnary.levels[level] === kanji.level || !level) 
                        && (kanji.grammar?.includes(grammar) || grammar === "0")
                    ) 
                    &&
                    (
                        filters.searchThroughKanji(kanji, searchElement)
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
                                .getKanjiImportance(kanji, searchElement)
                        })
                    } else if (alreadyAddedItem.importance === 0) {
                        alreadyAddedItem.importance = filters
                            .getKanjiImportance(kanji, searchElement)
                    }
                }
            })
        })
    
    
        const sortedByFrequencyData = kanjiArray.sort((a, b) => a.frequency - b.frequency)
        const sortedByLevel = libFunctions.sortByObjectKey(sortedByFrequencyData, dictionnary.levels)
        const sortedByImportance = sortedByLevel.sort((a, b) => b.importance - a.importance)
    
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
    
    app.get('/kanjiTrainingList/:level/:grammar/:collection', (req, res) => {
        const level = Number(req.params.level)
        const grammar = String(req.params.grammar)
        const collection = String(req.params.collection)
    
        if (!dictionnary.levels[level] && dictionnary.levels[level] !== null) {
            res.status(400).json(`Level query must be a number between 0 and ${
                Object.keys(dictionnary.levels)
                    [Object.keys(dictionnary.levels).length - 1]
            }`)
            return
        }
        if (!dictionnary.pluralClasses[grammar]) {
            res.status(400).json(`Grammar query must be one of those:
            ${Object.keys(dictionnary.classes).map((key) => key)}`)
            return
        }
        if (!dictionnary.collections[collection]) {
            res.status(400).json(`Collection query must be one of those:
            ${Object.keys(dictionnary.collections).map((key) => key)}`)
            return
        }
    
        console.log('\nKanji requêtés pour l\'entraînement \n',
            'Niveau:', dictionnary.levels[level], 'Grammaire:', dictionnary.pluralClasses[grammar],
            'Collection:', dictionnary.collections[collection])
            
        const kanjiArray = []
    
        kanjiList.forEach((kanji) => {
            if (
                (kanji.collections?.includes(collection) || collection === "0")
                && (dictionnary.levels[level] === kanji.level || !level) 
                && (kanji.grammar?.includes(grammar) || grammar === "0")
            ) {
                kanjiArray.push({ 
                    id: kanji.id,
                })
            }
        })
    
        console.log('Kanji d\'entraînement envoyés:', kanjiArray.length)
        res.json(kanjiArray)
    })
}