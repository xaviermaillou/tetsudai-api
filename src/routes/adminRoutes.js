const fs = require('fs')
const { readJSON } = require('../lib/common')

module.exports = (app) => {
    app.get('/kanjiFullList', (req, res) => {
        readJSON('kanji', (data) => res.json(data))
    })
    app.get('/vocabularyFullList', (req, res) => {
        readJSON('vocabulary', (data) => res.json(data))
    })
    app.get('/sentencesFullList', (req, res) => {
        readJSON('sentences', (data) => res.json(data))
    })

    const addElement = (type, body, data, res) => {
        body.id = data.length + 1

        const updatedData = [ body, ...data ]

        fs.writeFile(process.cwd() + `/src/data/${type}.json`, JSON.stringify(updatedData), (err) => {
            if (err) {
                console.log("An error has occurred ", err)
                return
            }
            console.log("Data written successfully to the file:", type)
            console.log("Element added:", body)
            res.sendStatus(204)
        })
    }

    const editElement = (type, id, body, data, res) => {
        const updatedData = data.map((element) => {
            if (Number(element.id) === id) return body
            else return element
        })

        fs.writeFile(process.cwd() + `/src/data/${type}.json`, JSON.stringify(updatedData), (err) => {
            if (err) {
                console.log("An error has occurred ", err)
                return
            }
            console.log("Data written successfully to the file:", type)
            console.log("Element edited:", body)
            res.sendStatus(204)
        })
    }

    app.post('/kanji', (req, res) => {
        const body = req.body
        readJSON('kanji', (data) => addElement('kanji', body, data, res))
    })

    app.post('/kanji/:id', (req, res) => {
        const id = Number(req.params.id)
        const body = req.body
        readJSON('kanji', (data) => editElement('kanji', id, body, data, res))
    })

    app.post('/word', (req, res) => {
        const body = req.body
        readJSON('kanji', (data) => addElement('vocabulary', body, data, res))
    })

    app.post('/word/:id', (req, res) => {
        const id = Number(req.params.id)
        const body = req.body
        readJSON('kanji', (data) => editElement('vocabulary', id, body, data, res))
    })

    app.post('/sentence', (req, res) => {
        const body = req.body
        readJSON('kanji', (data) => addElement('sentences', body, data, res))
    })

    app.post('/sentence/:id', (req, res) => {
        const id = Number(req.params.id)
        const body = req.body
        readJSON('kanji', (data) => editElement('sentences', id, body, data, res))
    })
}