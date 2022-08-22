const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 8000

const commonLib = require('tetsudai-common')
const libFunctions = require('./src/lib/common')
const filters = require('./src/lib/filters')
const data = require('./src/lib/data')
const schedule = require('node-schedule')

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

    console.log('\nKanji requêtés \n',
        'Niveau:', commonLib.levels[level], 'Grammaire:', commonLib.pluralClasses[grammar],
        'Collection:', commonLib.collections[collection], 'Recherche:', search,
        '\nOffset:', offset)
        
    const kanjiArray = []
    kanjiList.forEach((kanji) => {
        if (
            (
                (kanji.collections?.includes(collection) || collection === 0)
                && (commonLib.levels[level] === kanji.level || !level) 
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
                    && (commonLib.levels[level] === kanji.level || !level) 
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
    const sortedByLevel = libFunctions.sortByObjectKey(sortedByFrequencyData, commonLib.levels)
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

    console.log('\nVocabulaire requêté \n',
        'Niveau:', commonLib.levels[level], 'Grammaire:', commonLib.pluralClasses[grammar],
        'Collection:', commonLib.collections[collection], 'Recherche:', search,
        '\nOffset:', offset)
    
    const vocabularyArray = []

    vocabularyList.forEach((word) => {
        if (
            (word.collections?.includes(collection) || collection === 0)
            && (commonLib.levels[level] === word.level || !level) 
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
                    rareKanji: word.rareKanji,
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
                && (commonLib.levels[level] === word.level || !level) 
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
    const sortedByLevel = libFunctions.sortByObjectKey(sortedByFrequencyData, commonLib.levels)
    const sortedByImportance = sortedByLevel.sort((a, b) => b.importance - a.importance)

    const slicedVocabularyArray = sortedByImportance.slice(offset, offset + 100)

    console.log('Vocabulaire envoyé:', slicedVocabularyArray.length)
    res.json(libFunctions.sortByObjectKey(slicedVocabularyArray, commonLib.levels))
})

app.get('/sentences/:id', (req, res) => {
    const id = Number(req.params.id)

    console.log('\nPhrases requêtées\n')

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

    console.log('\nKanji spécifique requêté\n')

    let foundKanji

    kanjiList.forEach((kanji) => {
        if (kanji.id === id) foundKanji = kanji
    })

    res.json(foundKanji)
})

app.get('/word/:id', (req, res) => {
    const id = Number(req.params.id)

    console.log('\nMot spécifique requêté\n')

    let foundWord

    vocabularyList.forEach((word) => {
        if (word.id === id) foundWord = word
    })

    res.json(foundWord)
})

app.get('/kanjiTrainingList/:level/:grammar/:collection', (req, res) => {
    const level = Number(req.params.level)
    const grammar = Number(req.params.grammar)
    const collection = Number(req.params.collection)

    console.log('\nKanji requêtés pour l\'entraînement \n',
        'Niveau:', commonLib.levels[level], 'Grammaire:', commonLib.pluralClasses[grammar],
        'Collection:', commonLib.collections[collection])
        
    const kanjiArray = []

    kanjiList.forEach((kanji) => {
        if (
            (kanji.collections?.includes(collection) || collection === 0)
            && (commonLib.levels[level] === kanji.level || !level) 
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

    console.log('\nVocabulaire requêté pour l\'entraînement \n',
        'Niveau:', commonLib.levels[level], 'Grammaire:', commonLib.pluralClasses[grammar],
        'Collection:', commonLib.collections[collection])
        
    const vocabularyArray = []

    vocabularyList.forEach((word) => {
        if (
            (word.collections?.includes(collection) || collection === 0)
            && (commonLib.levels[level] === word.level || !level) 
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