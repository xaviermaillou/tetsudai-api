const axios = require('axios')
const { getKanjiFullList, getVocabularyFullList, getSentencesFullList } = require('../request')

module.exports = (app) => {
    app.get('/kanjiFullList', async (req, res) => {
        const list = await getKanjiFullList()
        res.json(list)
    })
    app.get('/vocabularyFullList', async (req, res) => {
        const list = await getVocabularyFullList()
        res.json(list)
    })
    app.get('/sentencesFullList', async (req, res) => {
        const list = await getSentencesFullList()
        res.json(list)
    })

    app.post('/kanji', async (req, res) => {
        const result = await axios.post("http://localhost:9002/kanji", req.body)
        res.json(result.data)
    })
    app.post('/kanji/:id', async (req, res) => {
        const result = await axios.put(`http://localhost:9002/kanji/${req.params.id}`, req.body)
        res.json(result.data)
    })
    app.post('/word', async (req, res) => {
        const result = await axios.post("http://localhost:9002/vocabulary", req.body)
        res.json(result.data)
    })
    app.post('/word/:id', async (req, res) => {
        const result = await axios.put(`http://localhost:9002/vocabulary/${req.params.id}`, req.body)
        res.json(result.data)
    })
    app.post('/sentence', async (req, res) => {
        const result = await axios.post("http://localhost:9002/sentences", req.body)
        res.json(result.data)
    })
    app.post('/sentence/:id', async (req, res) => {
        const result = await axios.put(`http://localhost:9002/sentences/${req.params.id}`, req.body)
        res.json(result.data)
    })
}