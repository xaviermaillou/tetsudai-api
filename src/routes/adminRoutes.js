const fs = require('fs')
const kanjiList = require('../data/kanji.json')
const vocabularyList = require('../data/vocabulary.json')
const sentencesList = require('../data/sentences.json')

module.exports = (app) => {
    app.get('/kanjiFullList', (req, res) => {
        res.json(kanjiList)
    })
    app.get('/vocabularyFullList', (req, res) => {
        res.json(vocabularyList)
    })
    app.get('/sentencesFullList', (req, res) => {
        res.json(sentencesList)
    })

    app.post('/kanji', (req, res) => {
        const body = req.body
        const data = [ ...kanjiList ]

        const updatedData = [ body, ...data ]

        fs.writeFile(process.cwd() + '/src/data/kanji.json', JSON.stringify(updatedData), (err) => {
            if (err) {
                console.log("An error has occurred ", err)
                return
            }
            console.log("Data written successfully to the file")
            res.sendStatus(204)
        })
    })

    app.post('/kanji/:id', (req, res) => {
        const id = Number(req.params.id)
        const body = req.body
        const data = [ ...kanjiList ]

        const updatedData = data.map((kanji) => {
            if (Number(kanji.id) === id) return body
            else return kanji
        })

        fs.writeFile(process.cwd() + '/src/data/kanji.json', JSON.stringify(updatedData), (err) => {
            if (err) {
                console.log("An error has occurred ", err)
                return
            }
            console.log("Data written successfully to the file")
            res.sendStatus(204)
        })
    })

    app.post('/word', (req, res) => {
        const body = req.body
        const data = [ ...vocabularyList ]

        const updatedData = [ body, ...data ]

        fs.writeFile(process.cwd() + '/src/data/vocabulary.json', JSON.stringify(updatedData), (err) => {
            if (err) {
                console.log("An error has occurred ", err)
                return
            }
            console.log("Data written successfully to the file")
            res.sendStatus(204)
        })
    })

    app.post('/word/:id', (req, res) => {
        const id = Number(req.params.id)
        const body = req.body
        const data = [ ...vocabularyList ]

        const updatedData = data.map((word) => {
            if (Number(word.id) === id) return body
            else return word
        })

        fs.writeFile(process.cwd() + '/src/data/vocabulary.json', JSON.stringify(updatedData), (err) => {
            if (err) {
                console.log("An error has occurred ", err)
                return
            }
            console.log("Data written successfully to the file")
            res.sendStatus(204)
        })
    })

    app.post('/sentence', (req, res) => {
        const body = req.body
        const data = [ ...sentencesList ]

        const updatedData = [ body, ...data ]

        fs.writeFile(process.cwd() + '/src/data/sentences.json', JSON.stringify(updatedData), (err) => {
            if (err) {
                console.log("An error has occurred ", err)
                return
            }
            console.log("Data written successfully to the file")
            res.sendStatus(204)
        })
    })

    app.post('/sentence/:id', (req, res) => {
        const id = Number(req.params.id)
        const body = req.body
        const data = [ ...sentencesList ]

        const updatedData = data.map((sentence) => {
            if (Number(sentence.id) === id) return body
            else return sentence
        })

        fs.writeFile(process.cwd() + '/src/data/sentences.json', JSON.stringify(updatedData), (err) => {
            if (err) {
                console.log("An error has occurred ", err)
                return
            }
            console.log("Data written successfully to the file")
            res.sendStatus(204)
        })
    })
}