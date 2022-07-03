const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 8000

const kanjiJSON = require('./src/data/kanjis')
const vocabularyJSON = require('./src/data/vocabulary')
const sentencesJSON = require('./src/data/sentences')

const commonLib = require('./src/lib/common')
const filters = require('./src/lib/filters')
const data = require('./src/lib/data')
const inflexions = require('./src/lib/inflexions')

app.use(cors())

const { kanjiList, vocabularyList } = data.buildData(kanjiJSON, vocabularyJSON)

app.get('/', (req, res) => res.send('Tetsudai API running'))

app.get('/kanjiList/:level/:grammar/:collection/:search?', (req, res) => {
    const level = Number(req.params.level)
    const grammar = Number(req.params.grammar)
    const collection = Number(req.params.collection)
    const search = req.params.search || ""

    console.log('\nKanji requêtés \n',
        'Niveau:', commonLib.levels[level], 'Grammaire:', commonLib.pluralClasses[grammar],
        'Collection:', commonLib.collections[collection], 'Recherche:', search)

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
                filters.searchThroughKanji(kanji.vocabulary, kanji.romaji, kanji.translationArray, search)
                || !search
            )
        ) {
            kanjiArray.push({ 
                id: kanji.id,
                kanji: kanji.kanji,
                readings: kanji.readings,
                translation: kanji.translation,
                importance: filters
                    .getKanjiImportance(kanji.vocabulary, kanji.romaji, kanji.translationArray, search)
            })
        }
    })

    console.log('Kanji envoyés:', kanjiArray.length)
    const sortedByFrecuencyData = kanjiArray.sort((a, b) => a.frecuency - b.frecuency)
    res.json(commonLib.sortByObjectKey(sortedByFrecuencyData, commonLib.levels))
})
app.get('/vocabularyList/:level/:grammar/:collection/:search?', (req, res) => {
    const level = Number(req.params.level)
    const grammar = Number(req.params.grammar)
    const collection = Number(req.params.collection)
    const search = req.params.search || ""

    console.log('\nVocabulaire requêté \n',
        'Niveau:', commonLib.levels[level], 'Grammaire:', commonLib.pluralClasses[grammar],
        'Collection:', commonLib.collections[collection], 'Recherche:', search)

    const vocabularyArray = []

    vocabularyList.forEach((word) => {
        if (
            (word.collections?.includes(collection) || collection === 0)
            && (commonLib.levels[level] === word.level || !level) 
            && (word.grammar.includes(grammar) || grammar === 0)
            && (filters.searchThroughWord(word.romaji, word.translationArray, search)
                || !search)
        ) {
            vocabularyArray.push({
                id: word.id,
                elements: word.elements,
                jukujikun: word.jukujikun,
                translation: word.translation,
                importance: filters
                    .getWordImportance(word.romaji, word.translationArray, word.variants, search)
            })
        }
    })

    console.log('Vocabulaire envoyé:', vocabularyArray.length)
    const sortedByFrecuencyData = vocabularyArray.sort((a, b) => a.frecuency - b.frecuency)
    res.json(commonLib.sortByObjectKey(sortedByFrecuencyData, commonLib.levels))
})
app.get('/sentences/:id', (req, res) => {
    const id = Number(req.params.id)

    console.log('\nPhrases requêtées\n')

    const sentencesArray = []

    sentencesJSON.forEach((sentence) => {
        sentence.elements.forEach((element) => {
            if (element.id === id) sentencesArray.push(sentence)
        })
    })

    res.json(sentencesArray)
})
app.get('/inflexions/:id', (req, res) => {
    const id = Number(req.params.id)

    console.log('\nConjugaison requêtée\n')

    let wordInflexions

    vocabularyList.forEach((word) => {
        if (word.id === id) wordInflexions = inflexions.dispatchInflexion(word)
    })

    res.json(wordInflexions)
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

app.listen(port, () => console.log(`L'application Node est démarrée sur http://localhost:${port}`))