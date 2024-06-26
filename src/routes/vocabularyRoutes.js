const { dictionnary } = require('tetsudai-common')
const libFunctions = require('../lib/common')
const filters = require('../lib/filters')
const grammar = require('../lib/grammar')

module.exports = (app, vocabularyList, sentencesList) => {
    app.get('/vocabularyList/:offset/:level/:grammar/:collection/:search?', (req, res) => {
        const level = Number(req.params.level)
        const grammar = String(req.params.grammar)
        const collection = String(req.params.collection)
        const search = req.params.search || ""
    
        const offset = Number(req.params.offset)
    
        if (isNaN(offset)) {
            res.status(400).json('Offset must be a number')
            return
        }
    
        if (!dictionnary.fr.levels[level] && dictionnary.fr.levels[level] !== null) {
            res.status(400).json(`Level query must be a number between 0 and ${
                Object.keys(dictionnary.fr.levels)
                    [Object.keys(dictionnary.fr.levels).length - 1]
            }`)
            return
        }
        if (!dictionnary.fr.pluralClasses[grammar]) {
            res.status(400).json(`Grammar query must be one of those:
            ${Object.keys(dictionnary.fr.classes).map((key) => key)}`)
            return
        }
        if (!dictionnary.fr.collections[collection]) {
            res.status(400).json(`Collection query must be one of those:
            ${Object.keys(dictionnary.fr.collections).map((key) => key)}`)
            return
        }
    
        console.log('\nVocabulaire requêté \n',
            'Niveau:', dictionnary.fr.levels[level], 'Grammaire:', dictionnary.fr.pluralClasses[grammar],
            'Collection:', dictionnary.fr.collections[collection], 'Recherche:', search,
            '\nOffset:', offset)
        
        const vocabularyArray = []
        const foundJapaneseWordsArray = []

        const searchIsLatin = (/^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/).test(search)
    
        const splittedSearch = [ search, ...(search.split(/['\s]+/).length > 1 ? search.split(/['\s]+/) : []) ]

        if (splittedSearch.length > 1) {
            let previousWord
            splittedSearch.forEach((searchElement, i) => {
                if (i > 1) splittedSearch.push(previousWord + ' ' + searchElement)
                previousWord = searchElement
            })
        }

        splittedSearch.forEach((searchElement, i) => {
            vocabularyList.forEach((word) => {
                const searchThroughWordResult = filters.searchThroughWord(word, searchElement, searchIsLatin)
                if (
                    (word.collections?.includes(collection) || collection === "0")
                    && (dictionnary.fr.levels[level] === word.level || !level) 
                    && (word.grammar?.includes(grammar) || grammar === "0")
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
                            grammar: word.grammar,
                            verbPrecisions: word.verbPrecisions,
                            jukujikunAsMain: word.jukujikunAsMain,
                            importance: filters
                                .getWordImportance(word, searchElement, i === 0 ? 2 : 1, searchIsLatin)
                        })
                    } else if (alreadyAddedItem.importance < 2) {
                        alreadyAddedItem.importance = filters
                            .getWordImportance(word, searchElement, i === 0 ? 2 : 1, searchIsLatin)
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
        if (!foundJapaneseWordsArray.includes(libFunctions.katakanaRegularization(libFunctions.numberRegularization(search)))) {
            foundSentence = libFunctions.findComposingWords(foundJapaneseWordsArray, search)
        }

        const foundSentenceWithIds = []
        // With the found japanese sentence, we execute a new search loop with the separated words
        // so that we can reinject the word id
        foundSentence.forEach((sentenceElement) => {
            if (libFunctions.sentenceExceptionCharacters.includes(sentenceElement)) {
                foundSentenceWithIds.push({
                    ambiguity: false,
                    foundElements: [
                        {
                            word: sentenceElement
                        }
                    ]
                })
            }
            else {
                const matchingWords = []
                vocabularyList.forEach((word) => {
                    if (filters.getWordImportance(word, sentenceElement, 2, searchIsLatin) === 2) {
                        matchingWords.push({
                            id: word.id,
                            word: sentenceElement
                        })
                        // Here we add importance to the found word in vocabulary array for classic results
                        const alreadyAddedItem = vocabularyArray.find((element) => element.id === word.id)
                        if (alreadyAddedItem?.importance < 2) {
                            alreadyAddedItem.importance = 2
                        }
                    }
                })
                foundSentenceWithIds.push({
                    ambiguity: matchingWords.length > 1,
                    foundElements: matchingWords
                })
            }
        })

        const sortedByFrequencyData = vocabularyArray.sort((a, b) => a.frequency - b.frequency)
        const sortedByLevel = libFunctions.sortByObjectKey(sortedByFrequencyData, dictionnary.fr.levels)
        const sortedByImportance = sortedByLevel.sort((a, b) => b.importance - a.importance)
    
        const slicedVocabularyArray = sortedByImportance.slice(offset, offset + 100)
    
        console.log('Vocabulaire envoyé:', slicedVocabularyArray.length)
        res.json({
            results: libFunctions.sortByObjectKey(slicedVocabularyArray, dictionnary.fr.levels),
            sentence: (search && foundSentence.join('').length === search.length) ? foundSentenceWithIds : null
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
            res.status(404).json('No word found with this id.')
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

    app.post('/foundSentence', (req, res) => {
        const fullDataElements = [ ...req.body.elements ]
        fullDataElements.forEach((fullDataElement) => {
            fullDataElement.foundElements.forEach((element) => {
                if (element.id) {
                    vocabularyList.forEach((word, i) => {
                        if (word.id === element.id) {
                            element.elements = word.elements
                            element.jukujikun = word.jukujikun
                            element.translation = word.translation
                            element.jukujikunAsMain = word.jukujikunAsMain
                            element.verbPrecisions = word.verbPrecisions
                            element.grammar = word.grammar
                            element.inflexions = word.inflexions
                            element.sentenceGrammar = undefined
                            element.importance = libFunctions.getImportanceWithinSentence(word.grammar[0])
                        }
                    })
                }
            })
        })
        fullDataElements.forEach((fullDataElement) => {
            fullDataElement.foundElements.forEach((element, i) => {
                element.sentenceGrammar = grammar
                    .dispatchFunctionInSentence(element, element.word, fullDataElements[i - 1], fullDataElements[i + 1])
            })
        })
        res.json({
            elements: fullDataElements,
            translation: req.body.translation,
            id: req.body.id
        })
    })
    
    app.get('/vocabularyTrainingList/:level/:grammar/:collection', (req, res) => {
        const level = Number(req.params.level)
        const grammar = String(req.params.grammar)
        const collection = String(req.params.collection)
    
        if (!dictionnary.fr.levels[level] && dictionnary.fr.levels[level] !== null) {
            res.status(400).json(`Level query must be a number between 0 and ${
                Object.keys(dictionnary.fr.levels)
                    [Object.keys(dictionnary.fr.levels).length - 1]
            }`)
            return
        }
        if (!dictionnary.fr.pluralClasses[grammar]) {
            res.status(400).json(`Grammar query must be one of those:
            ${Object.keys(dictionnary.fr.classes).map((key) => key)}`)
            return
        }
        if (!dictionnary.fr.collections[collection]) {
            res.status(400).json(`Collection query must be one of those:
            ${Object.keys(dictionnary.fr.collections).map((key) => key)}`)
            return
        }
    
        console.log('\nVocabulaire requêté pour l\'entraînement \n',
            'Niveau:', dictionnary.fr.levels[level], 'Grammaire:', dictionnary.fr.pluralClasses[grammar],
            'Collection:', dictionnary.fr.collections[collection])
            
        const vocabularyArray = []
    
        vocabularyList.forEach((word) => {
            if (
                (word.collections?.includes(collection) || collection === "0")
                && (dictionnary.fr.levels[level] === word.level || !level) 
                && (word.grammar?.includes(grammar) || grammar === "0")
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