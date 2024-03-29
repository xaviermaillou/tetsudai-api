const { katakanaRegularization, numberRegularization } = require("./common")

const frenchRegularization = (string) => {
    return string.split('\'').join(' ').split('é').join('e').split('è').join('e').split('ê').join('e')
        .split('à').join('a').split('â').join('a').split('î').join('i').split('ô').join('o').split('û')
        .join('u').split('-').join('').split('ç').join('c').split('œ').join('oe')
}
const romajiRegularization = (string) => {
    return string.split('ou').join('o').split('ei').join('e').split('aa').join('a').split('ii').join('i').split('uu').join('u')
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
                word.romaji?.forEach((word) => {
                    if (word && romajiRegularization(word.toLowerCase())
                        === romajiRegularization(string.toLowerCase())
                    ) matchingScore = score
                })
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
            const regularizedString = katakanaRegularization(numberRegularization(string))

            // Main word filtering
            const japaneseWord = vocabularyWord.completeWord
            if (japaneseWord.includes(regularizedString) || regularizedString.includes(japaneseWord)) {
                includes = true
                if (regularizedString.includes(japaneseWord)) foundWords.push(japaneseWord)
                if (vocabularyWord.adjectivePrecisions?.type === "na" && regularizedString.includes(japaneseWord + "な")) foundWords.push(japaneseWord + "な")
            }
    
            // Alternative word filtering
            const alternativeWord = vocabularyWord.alternativeWord
            if (alternativeWord.includes(regularizedString) || regularizedString.includes(alternativeWord)) includes = true
    
            // Inflexions filtering
            if (vocabularyWord.inflexions && (string.length > 1 || string === "だ")) {
                const inflexionsArray = []
                Object.values(vocabularyWord.inflexions).map((tense) => {
                    if (tense?.affirmative?.neutral) inflexionsArray.push(tense.affirmative.neutral.main + tense.affirmative.neutral.ending)
                    if (tense?.affirmative?.polite) inflexionsArray.push(tense.affirmative.polite.main + tense.affirmative.polite.ending) 
                    if (tense?.negative?.neutral) inflexionsArray.push(tense.negative.neutral.main + tense.negative.neutral.ending) 
                    if (tense?.negative?.polite) inflexionsArray.push(tense.negative.polite.main + tense.negative.polite.ending)
                })
                inflexionsArray.forEach((inflexion) => {
                    if (inflexion.includes(string) || string.includes(inflexion)) {
                        includes = true
                        if (string.includes(inflexion)) foundWords.push(inflexion)
                    }
                })
            }
        }

        return { includes, foundWords }
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
            const japaneseWord = vocabularyWord.completeWord
            if (japaneseWord === regularizedString) matchingScore = score
            // Taking in account na adjectives
            if (vocabularyWord.adjectivePrecisions?.type === "na" && japaneseWord + "な" === regularizedString) matchingScore = score
    
            // Alternative word filtering
            const alternativeWord = vocabularyWord.alternativeWord
            if (alternativeWord === regularizedString && !!!matchingScore) matchingScore = 1
    
            // Inflexions filtering
            if (vocabularyWord.inflexions) {
                const inflexionsArray = []
                Object.values(vocabularyWord.inflexions).map((tense) => {
                    if (tense?.affirmative?.neutral) inflexionsArray.push(tense.affirmative.neutral.main + tense.affirmative.neutral.ending)
                    if (tense?.affirmative?.polite) inflexionsArray.push(tense.affirmative.polite.main + tense.affirmative.polite.ending) 
                    if (tense?.negative?.neutral) inflexionsArray.push(tense.negative.neutral.main + tense.negative.neutral.ending) 
                    if (tense?.negative?.polite) inflexionsArray.push(tense.negative.polite.main + tense.negative.polite.ending) 
                })
                inflexionsArray.forEach((inflexion) => {
                    if (inflexion === string) matchingScore = score
                })
            }
        }

        return matchingScore
    }
}