const { dictionnary } = require('tetsudai-common')
const libFunctions = require('../lib/common')
const filters = require('../lib/filters')
const grammar = require('../lib/grammar')

module.exports = (app, vocabularyList, sentencesList) => {
    app.get('/vocabularyList/:offset/:level/:grammar/:collection/:search?', (req, res) => {
        const level = Number(req.params.level)
        const grammar = Number(req.params.grammar)
        const collection = Number(req.params.collection)
        const search = req.params.search || ""
    
        const offset = Number(req.params.offset)
    
        if (isNaN(offset)) {
            res.status(400).json('Offset must be a number')
            return
        }
    
        if (!dictionnary.levels[level]) {
            res.status(400).json(`Level query must be a number between 0 and ${
                Object.keys(dictionnary.levels)
                    [Object.keys(dictionnary.levels).length - 1]
            }`)
            return
        }
        if (!dictionnary.pluralClasses[grammar]) {
            res.status(400).json(`Grammar query must be a number between 0 and ${
                Object.keys(dictionnary.pluralClasses)
                    [Object.keys(dictionnary.pluralClasses).length - 1]
            }`)
            return
        }
        if (!dictionnary.collections[collection]) {
            res.status(400).json(`Collection query must be a number between 0 and ${
                Object.keys(dictionnary.collections)
                    [Object.keys(dictionnary.collections).length - 1]
            }`)
            return
        }
    
        console.log('\nVocabulaire requêté \n',
            'Niveau:', dictionnary.levels[level], 'Grammaire:', dictionnary.pluralClasses[grammar],
            'Collection:', dictionnary.collections[collection], 'Recherche:', search,
            '\nOffset:', offset)
        
        const vocabularyArray = []
        const foundJapaneseWordsArray = []
    
        const splittedSearch = [ search, ...search.split(/['\s]+/) ]

        let previousWord
        splittedSearch.forEach((searchElement, i) => {
            if (i > 1) splittedSearch.push(previousWord + ' ' + searchElement)
            previousWord = searchElement
        })

        splittedSearch.forEach((searchElement) => {
            vocabularyList.forEach((word) => {
                const searchThroughWordResult = filters.searchThroughWord(word, searchElement)
                if (
                    (word.collections?.includes(collection) || collection === 0)
                    && (dictionnary.levels[level] === word.level || !level) 
                    && (word.grammar.includes(grammar) || grammar === 0)
                    && (searchThroughWordResult.includes
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
                            jukujikunAsMain: word.jukujikunAsMain,
                            importance: filters
                                .getWordImportance(word, searchElement)
                        })
                    } else if (alreadyAddedItem.importance === 0) {
                        alreadyAddedItem.importance = filters
                            .getWordImportance(word, searchElement)
                    }
                }
                if (searchElement
                    && searchThroughWordResult.includes
                    && searchThroughWordResult.foundWords.length > 0
                )
                    foundJapaneseWordsArray.push( ...searchThroughWordResult.foundWords )
            })
        })

        let foundSentence = []
        // If one of the found words is not the whole search string, we can assume there are several words in the search
        if (!foundJapaneseWordsArray.includes(search)) {
            foundSentence = filters.findSentence(foundJapaneseWordsArray, search)
        }

        const fullSentence = []
        // With the found japanese sentence, we execute a new search loop with the separated words
        // so that we can reinject the word id
        foundSentence.forEach((sentenceElement) => {
            if (libFunctions.sentenceExceptionCharacters.includes(sentenceElement)) {
                fullSentence.push({
                    word: sentenceElement
                })
            }
            else {
                vocabularyList.forEach((word) => {
                    if (filters.getWordImportance(word, sentenceElement)) {
                        fullSentence.push({
                            id: word.id,
                            word: sentenceElement
                        })
                        // Here we add importance to the found word in vocabulary array for classic results
                        const alreadyAddedItem = vocabularyArray.find((element) => element.id === word.id)
                        if (alreadyAddedItem?.importance === 0) {
                            alreadyAddedItem.importance = filters
                                .getWordImportance(word, sentenceElement)
                        }
                    }
                })
            }
        })
    
        const sortedByFrequencyData = vocabularyArray.sort((a, b) => a.frequency - b.frequency)
        const sortedByLevel = libFunctions.sortByObjectKey(sortedByFrequencyData, dictionnary.levels)
        const sortedByImportance = sortedByLevel.sort((a, b) => b.importance - a.importance)
    
        const slicedVocabularyArray = sortedByImportance.slice(offset, offset + 100)
    
        console.log('Vocabulaire envoyé:', slicedVocabularyArray.length)
        res.json({
            results: libFunctions.sortByObjectKey(slicedVocabularyArray, dictionnary.levels),
            sentence: (search && foundSentence.join('').length === search.length) ? fullSentence : null
        })
    })
    
    app.get('/word/:id', (req, res) => {
        const id = Number(req.params.id)
    
        if (isNaN(id)) {
            res.status(400).json('Requested id must be a number')
            return
        }
    
        let foundWord
    
        vocabularyList.forEach((word) => {
            if (word.id === id) foundWord = word
        })
    
        if (!foundWord) {
            res.status(404).json('Aucun mot ne correspond à cet id.')
            return
        }
    
        res.json(foundWord)
    })
    
    app.get('/sentences/:id', (req, res) => {
        const id = Number(req.params.id)
    
        if (isNaN(id)) {
            res.status(400).json('Requested id must be a number')
            return
        }
    
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

    app.post('/sentence', (req, res) => {
        const body = req.body
        const sentenceElements = []

        body.elements.forEach((element) => {
            if (!element.id) {
                sentenceElements.push({
                    word: element.word,
                })
            } else {
                vocabularyList.forEach((word, i) => {
                    if (word.id === element.id) {
                        sentenceElements.push({
                            id: element.id,
                            word: element.word,
                            elements: word.elements,
                            jukujikun: word.jukujikun,
                            translation: word.translation,
                            jukujikunAsMain: word.jukujikunAsMain,
                            verbPrecisions: word.verbPrecisions,
                            grammar: word.grammar,
                            inflexions: word.inflexions,
                            sentenceGrammar: undefined,
                            importance: libFunctions.getImportanceWithinSentence(word.grammar[0])
                        })
                    }
                })
            }
        })

        sentenceElements.forEach((element, i) => {
            element.sentenceGrammar = grammar
                .dispatchFunctionInSentence(element, element.word, sentenceElements[i - 1], sentenceElements[i + 1])
        })

        res.json({
            elements: sentenceElements,
            translation: req.body.translation,
            id: req.body.id
        })
    })
    
    app.get('/vocabularyTrainingList/:level/:grammar/:collection', (req, res) => {
        const level = Number(req.params.level)
        const grammar = Number(req.params.grammar)
        const collection = Number(req.params.collection)
    
        if (!dictionnary.levels[level]) {
            res.status(400).json(`Level query must be a number between 0 and ${
                Object.keys(dictionnary.levels)
                    [Object.keys(dictionnary.levels).length - 1]
            }`)
            return
        }
        if (!dictionnary.pluralClasses[grammar]) {
            res.status(400).json(`Grammar query must be a number between 0 and ${
                Object.keys(dictionnary.pluralClasses)
                    [Object.keys(dictionnary.pluralClasses).length - 1]
            }`)
            return
        }
        if (!dictionnary.collections[collection]) {
            res.status(400).json(`Collection query must be a number between 0 and ${
                Object.keys(dictionnary.collections)
                    [Object.keys(dictionnary.collections).length - 1]
            }`)
            return
        }
    
        console.log('\nVocabulaire requêté pour l\'entraînement \n',
            'Niveau:', dictionnary.levels[level], 'Grammaire:', dictionnary.pluralClasses[grammar],
            'Collection:', dictionnary.collections[collection])
            
        const vocabularyArray = []
    
        vocabularyList.forEach((word) => {
            if (
                (word.collections?.includes(collection) || collection === 0)
                && (dictionnary.levels[level] === word.level || !level) 
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
}