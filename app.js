const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 9001

const explanationRoutes = require('./src/routes/explanationRoutes')
const kanjiRoutes = require('./src/routes/kanjiRoutes')
const vocabularyRoutes = require('./src/routes/vocabularyRoutes')
const adminRoutes = require('./src/routes/adminRoutes')

const data = require('./src/lib/data')
const schedule = require('node-schedule')

// Middlewares
const morgan = require('morgan')
const favicon = require('serve-favicon')

app
    .use(cors())
    .use(morgan('dev'))
    .use(favicon(__dirname + '/favicon.ico'))
    .use(express.json())

const launchRoutes = (response) => {
    explanationRoutes(app)
    kanjiRoutes(app, response.kanjiList)
    vocabularyRoutes(app, response.vocabularyList, response.sentencesList)
    adminRoutes(app)
}

data.buildData().then((response) => launchRoutes(response))
schedule.scheduleJob('0 0 * * *', () => {
    data.buildData().then((response) => launchRoutes(response))
})

app.listen(port, () => console.log(`L'application Node est démarrée sur http://localhost:${port}`))