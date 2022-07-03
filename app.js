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

app.use(cors())

const { kanjiList, vocabularyList } = data.buildData(kanjiJSON, vocabularyJSON)

app.get('/', (req, res) => res.send('Tetsudai API running'))

app.get('/kanji/:level/:grammar/:collection/:search?', (req, res) => {
    const level = Number(req.params.level)
    const grammar = Number(req.params.grammar)
    const collection = Number(req.params.collection)
    const search = req.params.search || ""

    console.log('KANJI LIST FETCHED', 'level', level, 'grammar', grammar, 'collection', collection, 'search', search)

    const kanjiArray = [ ...kanjiList ]

    kanjiArray.forEach((kanji) => {
        let result = {}
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
            result = {
                open: true,
                importance: filters.getKanjiImportance(kanji.vocabulary, kanji.romaji, kanji.translationArray, search)
            }
        } else {
            result = {
                open: false,
                importance: null,
            }
        }
        kanji.result = result
    })

    const sortedByFrecuencyData = kanjiArray.sort((a, b) => a.frecuency - b.frecuency)
    res.json(commonLib.sortByObjectKey(sortedByFrecuencyData, commonLib.levels))
})
app.get('/vocabulary/:level/:grammar/:collection/:search?', (req, res) => {
    const level = Number(req.params.level)
    const grammar = Number(req.params.grammar)
    const collection = Number(req.params.collection)
    const search = req.params.search || ""

    console.log('VOCABULARY LIST FETCHED', 'level', level, 'grammar', grammar, 'collection', collection, 'search', search)

    const vocabularyArray = [ ...vocabularyList ]

    vocabularyArray.forEach((word) => {
        let result = {}
        if (
            (word.collections?.includes(collection) || collection === 0)
            && (commonLib.levels[level] === word.level || !level) 
            && (word.grammar.includes(grammar) || grammar === 0)
            && (filters.searchThroughWord(word.romaji, word.translationArray, search)
                || !search)
        ) {
            result = {
                open: true,
                importance: filters.getWordImportance(word.romaji, word.translationArray, word.variants, search),
            }
        } else {
            result = {
                open: false,
                importance: null,
            }
        }
        word.result = result
    })

    const sortedByFrecuencyData = vocabularyArray.sort((a, b) => a.frecuency - b.frecuency)
    res.json(commonLib.sortByObjectKey(sortedByFrecuencyData, commonLib.levels))
})
app.get('/sentences/:id', (req, res) => {
    const id = Number(req.params.id)

    console.log('SENTENCES LIST FETCHED')

    const sentencesArray = []

    sentencesJSON.forEach((sentence) => {
        sentence.elements.forEach((element) => {
            if (element.id === id) sentencesArray.push(sentence)
        })
    })

    res.json(sentencesArray)
})

app.listen(port, () => console.log(`L'application Node est démarrée sur http://localhost:${port}`))