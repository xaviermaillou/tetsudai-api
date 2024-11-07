const { katakanaRegularization, numberRegularization, findByInflexion, sentencePriorityFindings, sentenceIgnoreAlternatives } = require("./common")
const grammar = require("./grammar")

const frenchRegularization = (string) => {
    return string.split('\'').join(' ').split('é').join('e').split('è').join('e').split('ê').join('e')
        .split('à').join('a').split('â').join('a').split('î').join('i').split('ô').join('o').split('û')
        .join('u').split('-').join('').split('ç').join('c').split('œ').join('oe')
}
const romajiRegularization = (string) => {
    return string.split('ou').join('o').split('ei').join('e').split('aa').join('a').split('ii').join('i').split('uu').join('u')
}

const japaneseWordMatching = (string, word, wordData) => {
    let matching
    if (string.includes(word)) matching = word
    if (wordData.adjectivePrecisions?.type === "na" && string.includes(word + "な")) matching = word + "な"
    if (string.includes("お" + word)) matching = "お" + word

    if (!!matching) return { matching, ...wordData }
    else return null
}

module.exports = {
    searchThroughKanji: (kanji, string, searchIsLatin) => {
        let includes = false

        if (searchIsLatin) {
            // Translations filtering
            if (string.length > 1) {
                Object.keys(kanji.translation)?.forEach((key) => {
                    kanji.translation[key]?.forEach((element) => {
                        element.split(', ').forEach((word) => {
                            if (frenchRegularization(word.toLowerCase())
                                .includes(frenchRegularization(string.toLowerCase()))
                            ) includes = true
                        })
                    })
                })
                Object.keys(kanji.alternatives)?.forEach((key) => {
                    kanji.alternatives[key]?.forEach((element) => {
                        element.split(', ').forEach((alternative) => {
                            if (frenchRegularization(alternative.toLowerCase())
                                .includes(frenchRegularization(string.toLowerCase()))
                            ) includes = true
                        })
                    })
                })
                kanji.readings.kunyomi.forEach((yomi) => {
                    yomi.examples.forEach((word) => {
                        Object.keys(word.translation)?.forEach((key) => {
                            word.translation[key]?.forEach((element) => {
                                element.split(', ').forEach((word2) => {
                                    if (frenchRegularization(word2.toLowerCase())
                                        .includes(frenchRegularization(string.toLowerCase()))
                                    ) includes = true
                                })
                            })
                        })
                    })
                })
                kanji.readings.onyomi.forEach((yomi) => {
                    yomi.examples.forEach((word) => {
                        Object.keys(word.translation)?.forEach((key) => {
                            word.translation[key]?.forEach((element) => {
                                element.split(', ').forEach((word2) => {
                                    if (frenchRegularization(word2.toLowerCase())
                                        .includes(frenchRegularization(string.toLowerCase()))
                                    ) includes = true
                                })
                            })
                        })
                    })
                })
            }
    
            // Romaji filtering
            kanji.romaji?.forEach((word) => {
                if (word && romajiRegularization(word.toLowerCase())
                    .includes(romajiRegularization(string.toLowerCase()))
                ) includes = true
            })
            kanji.readings.kunyomi.forEach((yomi) => {
                yomi.examples.forEach((word) => {
                    word.romaji?.forEach((word) => {
                        if (romajiRegularization(word.toLowerCase())
                            .includes(romajiRegularization(string.toLowerCase()))
                        ) includes = true
                    })
                })
            })
            kanji.readings.onyomi.forEach((yomi) => {
                yomi.examples.forEach((word) => {
                    word.romaji?.forEach((word) => {
                        if (romajiRegularization(word.toLowerCase())
                            .includes(romajiRegularization(string.toLowerCase()))
                        ) includes = true
                    })
                })
            })
        }
        else {
            // Kanji filtering
            if (kanji.kanji === string) includes = true
            if (string.includes(kanji.kanji)) includes = true
            if (kanji.kanjiVariations?.includes(string)) includes = true
    
    
            // Kanas filtering
            kanji.readings.kunyomi.forEach((reading) => {
                if (reading && reading.kana.includes(string)) includes = true
            })
            kanji.readings.onyomi.forEach((reading) => {
                if (reading && reading.kana.includes(string)) includes = true
            })
        }

        return includes
    },

    getKanjiImportance: (kanji, string, score, searchIsLatin) => {
        let matchingScore = 0

        if (searchIsLatin) {
            // French filtering
            if (string.length > 1) {
                Object.keys(kanji.translation)?.forEach((key) => {
                    kanji.translation[key]?.forEach((element) => {
                        element.split(', ').forEach((word) => {
                            if (frenchRegularization(word.toLowerCase())
                                === frenchRegularization(string.toLowerCase())
                            ) matchingScore = score
                        })
                    })
                })
                Object.keys(kanji.alternatives)?.forEach((key) => {
                    kanji.alternatives[key]?.forEach((element) => {
                        element.split(', ').forEach((alternative) => {
                            if (frenchRegularization(alternative.toLowerCase())
                                === frenchRegularization(string.toLowerCase())
                            ) matchingScore = score
                        })
                    })
                })
            }
    
            // Romaji filtering
            kanji.romaji?.forEach((word) => {
                if (word && romajiRegularization(word.toLowerCase())
                    === romajiRegularization(string.toLowerCase())
                ) matchingScore = score
            })
        }
        else {
            // Kanji filtering
            if (kanji.kanji === string) matchingScore = score
            kanji.kanjiVariations?.forEach((variation) => {
                if (variation === string) matchingScore = score
            })
    
            // Kanas filtering
            kanji.readings.kunyomi.forEach((reading) => {
                if (reading && reading === string) matchingScore = score
            })
            kanji.readings.onyomi.forEach((reading) => {
                if (reading && reading === string) matchingScore = score
            })
        }
    
        return matchingScore
    },

    searchThroughWord: (vocabularyWord, string, searchIsLatin) => {
        // "includes" gives the current word a pass to be included in results
        // "foundWords" is used for building a possible sentence out of the string sent by the user
        let includes = false
        let foundWords = []

        if (searchIsLatin) {
            // French filtering
            if (string.length > 1) {
                Object.keys(vocabularyWord.translation)?.forEach((key) => {
                    vocabularyWord.translation[key]?.forEach((element) => {
                        element.split(', ').forEach((word) => {
                            if (frenchRegularization(word.toLowerCase())
                                .includes(frenchRegularization(string.toLowerCase()))
                            ) includes = true
                        })
                    })
                })
                Object.keys(vocabularyWord.alternatives)?.forEach((key) => {
                    vocabularyWord.alternatives[key]?.forEach((element) => {
                        element.split(', ').forEach((word) => {
                            if (frenchRegularization(word.toLowerCase())
                                .includes(frenchRegularization(string.toLowerCase()))
                            ) includes = true
                        })
                    })
                })
            }
            // Romaji filtering
            vocabularyWord.romaji?.forEach((word) => {
                if (romajiRegularization(word.toLowerCase())
                    .includes(romajiRegularization(string.toLowerCase()))
                ) includes = true
            })
        }
        else {
            // Japanese filtering
            const regularizedString = katakanaRegularization(numberRegularization(string))

            // Main word filtering
            const japaneseWord = katakanaRegularization(vocabularyWord.primaryWord)
            if (japaneseWord.includes(regularizedString) || regularizedString.includes(japaneseWord)) {
                includes = true
                const matching = japaneseWordMatching(regularizedString, japaneseWord, vocabularyWord)
                if (!!matching) foundWords.push(matching)
            }
    
            // Alternative word filtering
            const secondaryWord = katakanaRegularization(vocabularyWord.secondaryWord)
            if (secondaryWord.includes(regularizedString) || regularizedString.includes(secondaryWord)) {
                includes = true
                if (!sentencePriorityFindings.includes(secondaryWord) && !sentenceIgnoreAlternatives.includes(secondaryWord)) {
                    const matching = japaneseWordMatching(regularizedString, secondaryWord, vocabularyWord)
                    if (!!matching) foundWords.push(matching)
                }
            }
    
            // Inflexions filtering
            if (vocabularyWord.inflexions && (string.length > 1 || string === "だ")) {
                const inflexionResult = findByInflexion(vocabularyWord, string)
                if (inflexionResult.includes) includes = true
                foundWords = [ ...foundWords, ...inflexionResult.foundWords ]
            }

            // Stem and te form filtering
            const extractedBase = grammar.dispatchBaseWord(vocabularyWord.primaryWord, vocabularyWord.verbPrecisions)
            if (!!extractedBase?.stem && (extractedBase.stem.includes(regularizedString) || regularizedString.includes(extractedBase.stem))) {
                includes = true
                if (regularizedString.includes(extractedBase.stem)) foundWords.push({ matching: extractedBase.stem, ...vocabularyWord })
            }
            if (!!extractedBase?.teForm && (extractedBase.teForm.includes(regularizedString) || regularizedString.includes(extractedBase.teForm))) {
                includes = true
                if (regularizedString.includes(extractedBase.teForm)) foundWords.push({ matching: extractedBase.teForm, ...vocabularyWord })
            }
        }

        const cumulatedWords = []

        return {
            includes,
            foundWords: foundWords.filter(word => {
                if (!cumulatedWords.some(el => el.id === word.id && el.matching === word.matching)) {
                    cumulatedWords.push({
                        id: word.id,
                        matching: word.matching
                    })
                    return true
                }
                else return false
            })
        }
    },

    getWordImportance: (vocabularyWord, string, score, searchIsLatin) => {
        let matchingScore = 0

        if (searchIsLatin) {
            // French filtering
            if (string.length > 1) {
                Object.keys(vocabularyWord.translation)?.forEach((key) => {
                    vocabularyWord.translation[key]?.forEach((element) => {
                        element.split(', ').forEach((word) => {
                            if (frenchRegularization(word.toLowerCase())
                                === frenchRegularization(string.toLowerCase())
                            ) matchingScore = score
                        })
                    })
                })
                Object.keys(vocabularyWord.alternatives)?.forEach((key) => {
                    vocabularyWord.alternatives[key]?.forEach((element) => {
                        element.split(', ').forEach((word) => {
                            if (frenchRegularization(word.toLowerCase())
                                === frenchRegularization(string.toLowerCase())
                            ) matchingScore = score
                        })
                    })
                })
            }
    
            // Romaji filtering
            vocabularyWord.romaji?.forEach((word) => {
                if (romajiRegularization(word.toLowerCase())
                    === romajiRegularization(string.toLowerCase())
                ) matchingScore = score
            })
        }
        else {
            const regularizedString = katakanaRegularization(numberRegularization(string))
    
            // Main word filtering
            const japaneseWord = katakanaRegularization(vocabularyWord.primaryWord)
            if (japaneseWord === regularizedString) matchingScore = score
            // Taking in account na adjectives
            if (vocabularyWord.adjectivePrecisions?.type === "na" && japaneseWord + "な" === regularizedString) matchingScore = score
            if ("お" + japaneseWord === regularizedString) matchingScore = score
    
            // Alternative word filtering
            const secondaryWord = katakanaRegularization(vocabularyWord.secondaryWord)
            if (secondaryWord === regularizedString && !!!matchingScore) matchingScore = score
    
            // Inflexions filtering
            if (vocabularyWord.inflexions) {
                const inflexionResult = findByInflexion(vocabularyWord, string, score)
                if (!!inflexionResult.score) matchingScore = inflexionResult.score
            }

            // Stem and te form filtering
            const extractedBase = grammar.dispatchBaseWord(vocabularyWord.primaryWord, vocabularyWord.verbPrecisions)
            if (!!extractedBase?.stem && extractedBase.stem === regularizedString) matchingScore = score
            if (!!extractedBase?.teForm && extractedBase.teForm === regularizedString) matchingScore = score
        }

        return matchingScore
    }
}