const { dictionnary, types, validation } = require('tetsudai-common')
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
            'Niveau:', dictionnary.fr.levels[level], '| Grammaire:', dictionnary.fr.pluralClasses[grammar],
            '| Collection:', dictionnary.fr.collections[collection], '| Recherche:', search,
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
                            ...libFunctions.getBasicWordElements(word),
                            frequency: word.frequency,
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

        // If none of the found words is the whole search string, we can assume there are several words in the search
        if (!foundJapaneseWordsArray.includes(libFunctions.katakanaRegularization(libFunctions.numberRegularization(search)))) {
            // Based on all the found elements, and the search string, we try to build a sentence
            foundSentence = libFunctions.findComposingWords(foundJapaneseWordsArray, search)
        }

        const foundSentenceWithIds = []

        const injectImportanceToWordIfMatch = (id) => {
            const alreadyAddedItem = vocabularyArray.find((element) => element.id === id)
            if (alreadyAddedItem?.importance < 2) {
                alreadyAddedItem.importance = 2
            }
        }

        // With the found sentence, we execute a new search loop with the separated words
        // so that we can reinject the word id
        foundSentence.forEach((sentenceElement) => {
            // With bypass we decide that we can assume we already know what the current sentence element is
            let bypass = false
            if (libFunctions.sentencePriorityFindings.includes(sentenceElement)) bypass = true

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
                    if(libFunctions.sentenceIgnoreFindings[sentenceElement] === word.primaryWord) return

                    if (bypass) {
                        // If we assumed the sentence element is already known
                        // and the current word base matches with the sentence element
                        // we can directly push the current word...
                        if (word.primaryWord === sentenceElement) {
                            matchingWords.push({
                                id: word.id,
                                word: sentenceElement
                            })
                            // Here we add importance to the found word in vocabulary array for classic results
                            injectImportanceToWordIfMatch(word.id)
                        }
                        // ...and ignore any other word
                        else return
                    }
                    // If no bypass, we check if the current sentence element perfectly matches with the current word
                    else if (filters.getWordImportance(word, sentenceElement, 2, searchIsLatin) === 2) {
                        matchingWords.push({
                            id: word.id,
                            word: sentenceElement
                        })
                        // Here we add importance to the found word in vocabulary array for classic results
                        injectImportanceToWordIfMatch(word.id)
                    }
                })
                
                foundSentenceWithIds.push({
                    // If there is more than one matching word, we define ambiguity as true
                    ambiguity: matchingWords.length > 1,
                    foundElements: matchingWords
                })
            }
        })

        const sortedByImportance = vocabularyArray.sort((a, b) => b.importance - a.importance)
    
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

        let foundWord
    
        vocabularyList.forEach((word) => {
            if (word.id === id) {
                foundWord = {
                    primary: word.primaryWord,
                    secondary: word.secondaryWord,
                    inflexions: word.inflexions
                }
            }
        })
    
        if (!foundWord) {
            res.status(404).json('No word found with this id.')
            return
        }
    
        const sentencesArray = []
        let matchingWord
    
        sentencesList.forEach((sentence) => {
            
            let matchingWord
            
            if (sentence.sentence.includes(foundWord.primary)) {
                matchingWord = foundWord.primary
            }
            else if (sentence.sentence.includes(foundWord.secondary)) {
                matchingWord = foundWord.secondary
            }
            else if (foundWord.inflexions) {
                const foundInflexion = libFunctions.findByInflexion(foundWord, sentence.sentence)
                if (foundInflexion.foundWords?.length > 0) {
                    matchingWord = foundInflexion.foundWords[0]
                }
            }
            
            if(libFunctions.sentenceIgnoreFindings[matchingWord] === foundWord.primary) return
            if (!!matchingWord) {
                let splittedSentence = []
                let index = 0
                
                while (index < sentence.sentence.length) {
                    let matchingWordIndex = sentence.sentence.indexOf(matchingWord, index)
                    
                    if (matchingWordIndex === -1) {
                        splittedSentence.push({string: sentence.sentence.slice(index), match: false})
                        break
                    }
        
                    if (matchingWordIndex > index) {
                        splittedSentence.push({string: sentence.sentence.slice(index, matchingWordIndex), match: false})
                    }
        
                    splittedSentence.push({string: matchingWord, match: true})
                    
                    index = matchingWordIndex + matchingWord.length
                }

                sentencesArray.push({
                    sections: splittedSentence,
                    translation: sentence.translation
                })
            }
        })
        
        console.log(`${sentencesArray.length} phrases trouvées pour ${foundWord.primary} sous la forme ${matchingWord}`)

        // Type validation
        validation.validateDataObjectsArray(sentencesArray, types.EnrichedSentence, [])

        res.json(libFunctions.shuffle(sentencesArray).slice(0, 20))
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

        // We try to solve ambiguities based on grammar function of the word, the previous and the next one
        fullDataElements.forEach((fullDataElement, i) => {
            let overridingWords = []

            for (let j = 0; j < fullDataElement.foundElements.length; j++) {
                let found = false
                let skip = false
                if (fullDataElement.ambiguity) {
                    fullDataElements[i - 1]?.foundElements.forEach((previousElement) => {
                        grammar.grammarPriorityCombinations.forEach(combination => {
                            if (previousElement.grammar[0] + "+" + fullDataElement.foundElements[j].grammar[0] === combination) {
                                overridingWords = [ fullDataElement.foundElements[j] ]
                                skip = true
                                return
                            }
                        })
                        if (skip) return
                        grammar.grammarProbableCombinations.forEach(combination => {
                            if (previousElement.grammar[0] + "+" + fullDataElement.foundElements[j].grammar[0] === combination) {
                                overridingWords.push(fullDataElement.foundElements[j])
                                found = true
                                return
                            }
                        })
                    })
                    if (skip) break
                    if (found) continue
                    fullDataElements[i + 1]?.foundElements.forEach((nextElement) => {
                        grammar.grammarPriorityCombinations.forEach(combination => {
                            if (fullDataElement.foundElements[j].grammar[0] + "+" + nextElement.grammar[0] === combination) {
                                overridingWords = [ fullDataElement.foundElements[j] ]
                                skip = true
                                return
                            }
                        })
                        if (skip) return
                        grammar.grammarProbableCombinations.forEach(combination => {
                            if (fullDataElement.foundElements[j].grammar[0] + "+" + nextElement.grammar[0] === combination) {
                                overridingWords.push(fullDataElement.foundElements[j])
                                return
                            }
                        })
                    })
                    if (skip) break
                }
            }
            console.log(overridingWords)
            if (fullDataElement.ambiguity && overridingWords.length === 1) {
                fullDataElement.foundElements = overridingWords
                fullDataElement.ambiguity = false
            }
        })

        fullDataElements.forEach((fullDataElement, i) => {
            fullDataElement.foundElements.forEach((element) => {
                element.sentenceGrammar = grammar
                    .dispatchFunctionInSentence(
                        element,
                        element.word,
                        fullDataElements[i - 1]?.foundElements[0],
                        fullDataElements[i + 1]?.foundElements[0]
                    )
            })
        })

        res.json({
            elements: fullDataElements,
            translation: req.body.translation,
            id: req.body.id
        })
    })
}