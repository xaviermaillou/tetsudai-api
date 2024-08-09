const axios = require('axios')
const config = require('../config.json')
const { getKanjiFullList, getVocabularyFullList, getSentencesFullList } = require('../request')

const DATA_SERVER_URL = process.env.NODE_ENV === 'development' ? config.DEV_REQUEST_URL : config.PROD_REQUEST_URL

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
        const result = await axios.post(`${DATA_SERVER_URL}/kanji`, req.body)
        res.json(result.data)
    })
    app.post('/kanji/:id', async (req, res) => {
        const result = await axios.put(`${DATA_SERVER_URL}/kanji/${req.params.id}`, req.body)
        res.json(result.data)
    })
    app.post('/word', async (req, res) => {
        const result = await axios.post(`${DATA_SERVER_URL}/vocabulary`, req.body)
        res.json(result.data)
    })
    app.post('/word/:id', async (req, res) => {
        const result = await axios.put(`${DATA_SERVER_URL}/vocabulary/${req.params.id}`, req.body)
        res.json(result.data)
    })
    app.post('/sentence', async (req, res) => {
        const result = await axios.post(`${DATA_SERVER_URL}/sentences`, req.body)
        res.json(result.data)
    })
    app.post('/sentence/:id', async (req, res) => {
        const result = await axios.put(`${DATA_SERVER_URL}/sentences/${req.params.id}`, req.body)
        res.json(result.data)
    })
}