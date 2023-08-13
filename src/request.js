const axios = require('axios')
const config = require('./config.json')

const DATA_SERVER_URL = process.env.NODE_ENV === 'development' ? config.DEV_REQUEST_URL : config.PROD_REQUEST_URL

module.exports = {
    getKanjiFullList: async () =>  {
        const result = await axios.get(`${DATA_SERVER_URL}/kanji`)
        return result.data
    },
    getVocabularyFullList: async () =>  {
        const result = await axios.get(`${DATA_SERVER_URL}/vocabulary`)
        return result.data
    },
    getSentencesFullList: async () =>  {
        const result = await axios.get(`${DATA_SERVER_URL}/sentences`)
        return result.data
    },
}