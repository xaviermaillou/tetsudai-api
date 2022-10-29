const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 8000

const { dictionnary } = require('tetsudai-common')
const libFunctions = require('./src/lib/common')
const filters = require('./src/lib/filters')
const data = require('./src/lib/data')
const schedule = require('node-schedule')

// Middlewares
const morgan = require('morgan')
const favicon = require('serve-favicon')

app.use(cors())

let kanjiList
let vocabularyList
let sentencesList
data.buildData().then((response) => {
    kanjiList = response.kanjiList
    vocabularyList = response.vocabularyList
    sentencesList = response.sentencesList
})
schedule.scheduleJob('0 0 * * *', () => {
    data.buildData().then((response) => {
        kanjiList = response.kanjiList
        vocabularyList = response.vocabularyList
        sentencesList = response.sentencesList
    })
})

app
    .use(morgan('dev'))
    .use(favicon(__dirname + '/favicon.ico'))

app.get('/', (req, res) => res.send(`
:: Tetsudai API ::

Available endpoints:
    - /kanjiList/:offset/:level/:grammar/:collection/:search?
    - /vocabularyList/:offset/:level/:grammar/:collection/:search?
    - /kanji/:id
    - /word/:id

`))

app.get('/kanjiList/:offset/:level/:grammar/:collection/:search?', (req, res) => {
    const level = Number(req.params.level)
    const grammar = Number(req.params.grammar)
    const collection = Number(req.params.collection)
    const search = req.params.search || ""

    const offset = Number(req.params.offset)

    if (isNaN(offset)) {
        res.status(400).json('Offset must be a number')
        return
    }

    if (!dictionnary.levels[level]) {
        res.status(400).json(`Level query must be a number between 0 and ${
            Object.keys(dictionnary.levels)
                [Object.keys(dictionnary.levels).length - 1]
        }`)
        return
    }
    if (!dictionnary.pluralClasses[grammar]) {
        res.status(400).json(`Grammar query must be a number between 0 and ${
            Object.keys(dictionnary.pluralClasses)
                [Object.keys(dictionnary.pluralClasses).length - 1]
        }`)
        return
    }
    if (!dictionnary.collections[collection]) {
        res.status(400).json(`Collection query must be a number between 0 and ${
            Object.keys(dictionnary.collections)
                [Object.keys(dictionnary.collections).length - 1]
        }`)
        return
    }

    console.log('\nKanji requêtés \n',
        'Niveau:', dictionnary.levels[level], 'Grammaire:', dictionnary.pluralClasses[grammar],
        'Collection:', dictionnary.collections[collection], 'Recherche:', search,
        '\nOffset:', offset)
        
    const kanjiArray = []
    kanjiList.forEach((kanji) => {
        if (
            (
                (kanji.collections?.includes(collection) || collection === 0)
                && (dictionnary.levels[level] === kanji.level || !level) 
                && (kanji.grammar.includes(grammar) || grammar === 0)
            ) 
            &&
            (
                filters.searchThroughKanji(kanji, search)
                || !search
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
                        .getKanjiImportance(kanji, search)
                })
            } else if (alreadyAddedItem.importance === 0) {
                alreadyAddedItem.importance = filters
                    .getKanjiImportance(kanji, search)
            }
        }
    })

    const splittedSearch = search.split(/['\s]+/)

    splittedSearch.forEach((searchElement) => {
        kanjiList.forEach((kanji) => {
            if (
                (
                    (kanji.collections?.includes(collection) || collection === 0)
                    && (dictionnary.levels[level] === kanji.level || !level) 
                    && (kanji.grammar.includes(grammar) || grammar === 0)
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

app.get('/vocabularyList/:offset/:level/:grammar/:collection/:search?', (req, res) => {
    const level = Number(req.params.level)
    const grammar = Number(req.params.grammar)
    const collection = Number(req.params.collection)
    const search = req.params.search || ""

    const offset = Number(req.params.offset)

    if (isNaN(offset)) {
        res.status(400).json('Offset must be a number')
        return
    }

    if (!dictionnary.levels[level]) {
        res.status(400).json(`Level query must be a number between 0 and ${
            Object.keys(dictionnary.levels)
                [Object.keys(dictionnary.levels).length - 1]
        }`)
        return
    }
    if (!dictionnary.pluralClasses[grammar]) {
        res.status(400).json(`Grammar query must be a number between 0 and ${
            Object.keys(dictionnary.pluralClasses)
                [Object.keys(dictionnary.pluralClasses).length - 1]
        }`)
        return
    }
    if (!dictionnary.collections[collection]) {
        res.status(400).json(`Collection query must be a number between 0 and ${
            Object.keys(dictionnary.collections)
                [Object.keys(dictionnary.collections).length - 1]
        }`)
        return
    }

    console.log('\nVocabulaire requêté \n',
        'Niveau:', dictionnary.levels[level], 'Grammaire:', dictionnary.pluralClasses[grammar],
        'Collection:', dictionnary.collections[collection], 'Recherche:', search,
        '\nOffset:', offset)
    
    const vocabularyArray = []

    vocabularyList.forEach((word) => {
        if (
            (word.collections?.includes(collection) || collection === 0)
            && (dictionnary.levels[level] === word.level || !level) 
            && (word.grammar.includes(grammar) || grammar === 0)
            && (filters.searchThroughWord(word, search)
                || !search)
        ) {
            const alreadyAddedItem = vocabularyArray.find((element) => element.id === word.id)
            if (alreadyAddedItem === undefined) {
                vocabularyArray.push({
                    id: word.id,
                    elements: word.elements,
                    jukujikun: word.jukujikun,
                    frequency: word.frequency,
                    translation: word.translation,
                    jukujikunAsMain: word.jukujikunAsMain,
                    importance: filters
                        .getWordImportance(word, search)
                })
            } else if (alreadyAddedItem.importance === 0) {
                alreadyAddedItem.importance = filters
                    .getWordImportance(word, search)
            }
        }
    })

    const splittedSearch = search.split(/['\s]+/)

    splittedSearch.forEach((searchElement) => {
        vocabularyList.forEach((word) => {
            if (
                (word.collections?.includes(collection) || collection === 0)
                && (dictionnary.levels[level] === word.level || !level) 
                && (word.grammar.includes(grammar) || grammar === 0)
                && (filters.searchThroughWord(word, searchElement)
                    || !searchElement)
            ) {
                const alreadyAddedItem = vocabularyArray.find((element) => element.id === word.id)
                if (alreadyAddedItem === undefined) {
                    vocabularyArray.push({
                        id: word.id,
                        elements: word.elements,
                        jukujikun: word.jukujikun,
                        frequency: word.frequency,
                        translation: word.translation,
                        jukujikunAsMain: word.jukujikunAsMain,
                        importance: filters
                            .getWordImportance(word, searchElement)
                    })
                } else if (alreadyAddedItem.importance === 0) {
                    alreadyAddedItem.importance = filters
                        .getWordImportance(word, searchElement)
                }
            }
        })
    })

    const sortedByFrequencyData = vocabularyArray.sort((a, b) => a.frequency - b.frequency)
    const sortedByLevel = libFunctions.sortByObjectKey(sortedByFrequencyData, dictionnary.levels)
    const sortedByImportance = sortedByLevel.sort((a, b) => b.importance - a.importance)

    const slicedVocabularyArray = sortedByImportance.slice(offset, offset + 100)

    console.log('Vocabulaire envoyé:', slicedVocabularyArray.length)
    res.json(libFunctions.sortByObjectKey(slicedVocabularyArray, dictionnary.levels))
})

app.get('/sentences/:id', (req, res) => {
    const id = Number(req.params.id)

    if (isNaN(id)) {
        res.status(400).json('Requested id must be a number')
        return
    }

    const sentencesArray = []

    sentencesList.forEach((sentence) => {
        sentence.elements.every((element) => {
            if (element.id === id) {
                sentencesArray.push(sentence)
                return false
            }
            return true
        })
    })

    res.json(sentencesArray.sort((a, b) => a.elements.length - b.elements.length))
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
        res.status(404).json('Aucun kanji ne correspond à cet id.')
        return
    }

    res.json(foundKanji)
})

app.get('/word/:id', (req, res) => {
    const id = Number(req.params.id)

    if (isNaN(id)) {
        res.status(400).json('Requested id must be a number')
        return
    }

    let foundWord

    vocabularyList.forEach((word) => {
        if (word.id === id) foundWord = word
    })

    if (!foundWord) {
        res.status(404).json('Aucun mot ne correspond à cet id.')
        return
    }

    res.json(foundWord)
})

app.get('/kanjiTrainingList/:level/:grammar/:collection', (req, res) => {
    const level = Number(req.params.level)
    const grammar = Number(req.params.grammar)
    const collection = Number(req.params.collection)

    if (!dictionnary.levels[level]) {
        res.status(400).json(`Level query must be a number between 0 and ${
            Object.keys(dictionnary.levels)
                [Object.keys(dictionnary.levels).length - 1]
        }`)
        return
    }
    if (!dictionnary.pluralClasses[grammar]) {
        res.status(400).json(`Grammar query must be a number between 0 and ${
            Object.keys(dictionnary.pluralClasses)
                [Object.keys(dictionnary.pluralClasses).length - 1]
        }`)
        return
    }
    if (!dictionnary.collections[collection]) {
        res.status(400).json(`Collection query must be a number between 0 and ${
            Object.keys(dictionnary.collections)
                [Object.keys(dictionnary.collections).length - 1]
        }`)
        return
    }

    console.log('\nKanji requêtés pour l\'entraînement \n',
        'Niveau:', dictionnary.levels[level], 'Grammaire:', dictionnary.pluralClasses[grammar],
        'Collection:', dictionnary.collections[collection])
        
    const kanjiArray = []

    kanjiList.forEach((kanji) => {
        if (
            (kanji.collections?.includes(collection) || collection === 0)
            && (dictionnary.levels[level] === kanji.level || !level) 
            && (kanji.grammar.includes(grammar) || grammar === 0)
        ) {
            kanjiArray.push({ 
                id: kanji.id,
            })
        }
    })

    console.log('Kanji d\'entraînement envoyés:', kanjiArray.length)
    res.json(kanjiArray)
})

app.get('/vocabularyTrainingList/:level/:grammar/:collection', (req, res) => {
    const level = Number(req.params.level)
    const grammar = Number(req.params.grammar)
    const collection = Number(req.params.collection)

    if (!dictionnary.levels[level]) {
        res.status(400).json(`Level query must be a number between 0 and ${
            Object.keys(dictionnary.levels)
                [Object.keys(dictionnary.levels).length - 1]
        }`)
        return
    }
    if (!dictionnary.pluralClasses[grammar]) {
        res.status(400).json(`Grammar query must be a number between 0 and ${
            Object.keys(dictionnary.pluralClasses)
                [Object.keys(dictionnary.pluralClasses).length - 1]
        }`)
        return
    }
    if (!dictionnary.collections[collection]) {
        res.status(400).json(`Collection query must be a number between 0 and ${
            Object.keys(dictionnary.collections)
                [Object.keys(dictionnary.collections).length - 1]
        }`)
        return
    }

    console.log('\nVocabulaire requêté pour l\'entraînement \n',
        'Niveau:', dictionnary.levels[level], 'Grammaire:', dictionnary.pluralClasses[grammar],
        'Collection:', dictionnary.collections[collection])
        
    const vocabularyArray = []

    vocabularyList.forEach((word) => {
        if (
            (word.collections?.includes(collection) || collection === 0)
            && (dictionnary.levels[level] === word.level || !level) 
            && (word.grammar.includes(grammar) || grammar === 0)
        ) {
            vocabularyArray.push({ 
                id: word.id,
            })
        }
    })

    console.log('Vocabulaire d\'entraînement envoyé:', vocabularyArray.length)
    res.json(vocabularyArray)
})

app.listen(port, () => console.log(`L'application Node est démarrée sur http://localhost:${port}`))