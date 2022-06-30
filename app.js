const express = require('express')
const cors = require('cors')

const app = express()
const port = 8000

const kanjiJSON = require('./src/data/kanjis')
const vocabularyJSON = require('./src/data/vocabulary')
const sentencesJSON = require('./src/data/sentences')

app.use(cors())

app.get('/kanji', (req, res) => res.json(kanjiJSON))
app.get('/vocabulary', (req, res) => res.json(vocabularyJSON))
app.get('/sentences', (req, res) => res.json(sentencesJSON))

app.listen(port, () => console.log(`L'application Node est démarrée sur http://localhost:${port}`))