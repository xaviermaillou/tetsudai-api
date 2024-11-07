const { dictionnary } = require('tetsudai-common')
const libCommon = require('../lib/common')
const filters = require('../lib/filters')
const libGrammar = require('../lib/grammar')

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
        const foundWords = []

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
                            ...libCommon.getBasicWordElements(word),
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
                    foundWords.push( ...searchThroughWordResult.foundWords )
            })
        })

        let foundSentence

        // If none of the found words is the whole search string, we can assume there are several words in the search
        if (!foundWords.some(word => word.matching === libCommon.katakanaRegularization(libCommon.numberRegularization(search)))) {
            // Based on all the found elements, and the search string, we try to build a sentence
            foundSentence = libCommon.findComposingWords(foundWords, search)
            
            foundSentence.elements.forEach((sentenceElement, i) => {
                if (!sentenceElement.ambiguity) return
                
                let overridingWords = libGrammar.disambiguateMultipleMatchings(sentenceElement.foundElements, foundSentence.elements, i)
    
                if (overridingWords.length === 1) {
                    sentenceElement.foundElements = overridingWords
                    sentenceElement.ambiguity = false
                }
            })
    
            foundSentence.elements.forEach((sentenceElement, i) => {
                sentenceElement.foundElements.forEach(element => {
                    vocabularyArray.forEach(word => {
                        if (word.id === element.id) word.importance = 2
                    })
                    if (element.id) {
                        element.importance = libCommon.getImportanceWithinSentence(element.grammar[0])
                        element.sentenceGrammar = libGrammar
                            .dispatchFunctionInSentence(
                                element,
                                element.matching,
                                foundSentence.elements[i - 1]?.foundElements[0],
                                foundSentence.elements[i + 1]?.foundElements[0]
                            )
                    }
                })
            })
        }

        const sortedByImportance = vocabularyArray.sort((a, b) => b.importance - a.importance)
    
        const slicedVocabularyArray = sortedByImportance.slice(offset, offset + 100)
    
        console.log('Vocabulaire envoyé:', slicedVocabularyArray.length)
        res.json({
            results: libCommon.sortByObjectKey(slicedVocabularyArray, dictionnary.fr.levels),
            sentence: (!!search && foundSentence?.strings.join("").length === search.length) ? foundSentence.elements : null,
            foundSentence: foundSentence?.strings // Used for detectMissingParts function in tetsudai-data-server
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

        const sentencesArray = []
        const matchingWords = []

        sentencesList.forEach((sentence) => {            
            let matchingWord
            
            if (foundWord.inflexions) {
                const foundInflexion = libCommon.findByInflexion(foundWord, sentence.sentence)
                if (foundInflexion.foundWords?.length > 0) {
                    matchingWord = foundInflexion.foundWords[0]
                }
                const extractedBase = libGrammar.dispatchBaseWord(foundWord.primaryWord, foundWord.verbPrecisions)
                if (extractedBase) {
                    if (sentence.sentence.includes(extractedBase.teForm)) {
                        matchingWord = extractedBase.teForm
                    }
                    else if (sentence.sentence.includes(extractedBase.stem)) {
                        matchingWord = extractedBase.stem
                    }
                }
            }
            else if (sentence.sentence.includes(foundWord.primaryWord)) {
                matchingWord = foundWord.primaryWord
            }
            else if (sentence.sentence.includes(foundWord.secondaryWord)) {
                matchingWord = foundWord.secondaryWord
            }

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
                
                if (!matchingWords.includes(matchingWord)) matchingWords.push(matchingWord)

                sentencesArray.push({
                    sections: splittedSentence,
                    translation: sentence.translation
                })
            }
        })
        
        console.log(`${sentencesArray.length} phrases trouvées pour ${foundWord.primaryWord} sous la/les forme(s) ${matchingWords}`)
    
        res.json({
            word: foundWord,
            sentences: libCommon.shuffle(sentencesArray).slice(0, 20)
        })
    })
}