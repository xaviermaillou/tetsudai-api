const frenchRegularization = (string) => {
    return string.split('\'').join(' ').split('é').join('e').split('è').join('e').split('ê').join('e')
        .split('à').join('a').split('â').join('a').split('î').join('i').split('ô').join('o').split('û')
        .join('u').split('-').join('').split('ç').join('c').split('œ').join('oe')
}
const romajiRegularization = (string) => {
    return string.split('ou').join('o').split('ei').join('e').split('aa').join('a').split('ii').join('i').split('uu').join('u')
}

module.exports = {
    searchThroughKanji: (kanji, string) => {
        let includes = false

        // French filtering
        if (string.length > 1) {
            kanji.translationArray?.forEach((word) => {
                if (frenchRegularization(word.toLowerCase())
                    .includes(frenchRegularization(string.toLowerCase()))
                ) includes = true
            })
            kanji.readings.kunyomi.forEach((yomi) => {
                yomi.examples.forEach((word) => {
                    if (frenchRegularization(word.translation.toLowerCase())
                        .includes(frenchRegularization(string.toLowerCase()))
                    ) includes = true
                })
            })
            kanji.readings.onyomi.forEach((yomi) => {
                yomi.examples.forEach((word) => {
                    if (frenchRegularization(word.translation.toLowerCase())
                        .includes(frenchRegularization(string.toLowerCase()))
                    ) includes = true
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
                if (typeof word.romaji === 'string') {
                    // This part is to remove when all the romaji are arrays and not strings anymore
                    if (romajiRegularization(word.romaji.toLowerCase())
                        .includes(romajiRegularization(string.toLowerCase()))
                    ) includes = true
                } else {
                    word.romaji?.forEach((word) => {
                        if (romajiRegularization(word.toLowerCase())
                            .includes(romajiRegularization(string.toLowerCase()))
                        ) includes = true
                    })
                }
            })
        })
        kanji.readings.onyomi.forEach((yomi) => {
            yomi.examples.forEach((word) => {
                if (typeof word.romaji === 'string') {
                    // This part is to remove when all the romaji are arrays and not strings anymore
                    if (romajiRegularization(word.romaji.toLowerCase())
                        .includes(romajiRegularization(string.toLowerCase()))
                    ) includes = true
                } else {
                    word.romaji?.forEach((word) => {
                        if (romajiRegularization(word.toLowerCase())
                            .includes(romajiRegularization(string.toLowerCase()))
                        ) includes = true
                    })
                }
            })
        })

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

        return includes
    },

    getKanjiImportance: (kanji, string) => {
        let matchingScore = 0

        // French filtering
        if (string.length > 1) {
            kanji.translationArray?.forEach((word) => {
                if (frenchRegularization(word.toLowerCase())
                    === frenchRegularization(string.toLowerCase())
                ) matchingScore = 1
            })
        }

        // Romaji filtering
        kanji.romaji?.forEach((word) => {
            if (word && romajiRegularization(word.toLowerCase())
                === romajiRegularization(string.toLowerCase())
            ) matchingScore = 1
        })

        // Kanji filtering
        if (kanji.kanji === string) matchingScore = 1
        kanji.kanjiVariations?.forEach((variation) => {
            if (variation === string) matchingScore = 1
        })

        // Kanas filtering
        kanji.readings.kunyomi.forEach((reading) => {
            if (reading && reading === string) matchingScore = 1
        })
        kanji.readings.onyomi.forEach((reading) => {
            if (reading && reading === string) matchingScore = 1
        })
        return matchingScore
    },

    searchThroughWord: (vocabularyWord, string) => {
        let includes = false
        let foundWord

        // French filtering
        if (string.length > 1) {
            vocabularyWord.translationArray?.forEach((word) => {
                if (frenchRegularization(word.toLowerCase())
                    .includes(frenchRegularization(string.toLowerCase()))
                ) includes = true
            })
            vocabularyWord.alternatives?.forEach((word) => {
                if (frenchRegularization(word.toLowerCase())
                    .includes(frenchRegularization(string.toLowerCase()))
                ) includes = true
            })
        }
        
        // Romaji filtering
        if (typeof vocabularyWord.romaji === 'string') {
            // This part is to remove when all the romaji are arrays and not strings anymore
            if (romajiRegularization(vocabularyWord.romaji.toLowerCase())
                .includes(romajiRegularization(string.toLowerCase()))
            ) includes = true
        } else {
            vocabularyWord.romaji?.forEach((word) => {
                if (romajiRegularization(word.toLowerCase())
                    .includes(romajiRegularization(string.toLowerCase()))
                ) includes = true
            })
        }

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
                    foundWord = inflexion
                }
            })
        }

        // Main word filtering
        const japaneseWord = vocabularyWord.completeWord
        if (japaneseWord.includes(string) || string.includes(japaneseWord)) {
            includes = true
            foundWord = vocabularyWord.completeWord
        }

        return { includes, foundWord }
    },

    getWordImportance: (vocabularyWord, string) => {
        let matchingScore = 0

        // French filtering
        if (string.length > 1) {
            vocabularyWord.translationArray?.forEach((word) => {
                if (frenchRegularization(word.toLowerCase())
                    === frenchRegularization(string.toLowerCase())
                ) matchingScore = 1
            })
    
            vocabularyWord.alternatives?.forEach((word) => {
                if (frenchRegularization(word.toLowerCase())
                    === frenchRegularization(string.toLowerCase())
                ) matchingScore = 1
            })
        }

        // Romaji filtering
        if (typeof vocabularyWord.romaji === 'string') {
            // This part is to remove when all the romaji are arrays and not strings anymore
            if (romajiRegularization(vocabularyWord.romaji.toLowerCase())
                === romajiRegularization(string.toLowerCase())
            ) matchingScore = 1
        } else {
            vocabularyWord.romaji?.forEach((word) => {
                if (romajiRegularization(word.toLowerCase())
                    === romajiRegularization(string.toLowerCase())
                ) matchingScore = 1
            })
        }

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
                if (inflexion === string) matchingScore = 1
            })
        }

        // Main word filtering
        const japaneseWord = vocabularyWord.completeWord
        if (japaneseWord === string) matchingScore = 1
        // Taking in account suru verbs
        if (vocabularyWord.grammar.includes(14) && japaneseWord + 'する' === string) matchingScore = 1

        return matchingScore
    },

    findSentence: (foundJapaneseWordsArray, string) => {
        // We create a copy of 'search' string, which will be sliced from the beginning at each found word
        let searchCopy = string
        const foundSentence = []
        for (let i = 0; i < searchCopy.length; i++) {
            // 'stringToCompare' value is equal to 'searchCopy' with an 'i' amount of letters removed from its ending
            const stringToCompare = i === 0 ? searchCopy : searchCopy.slice(0, -i)
            // The current word 'stringToCompare' (a slice of 'searchCopy') matches one of the found words
            if (foundJapaneseWordsArray.includes(stringToCompare)) {
                foundSentence.push(stringToCompare)
                searchCopy = searchCopy.slice(-i)
                if (searchCopy === stringToCompare) break
                else i = -1
            }
            // No match has been found between any of the 'stringToCompare' variables (slices of 'searchCopy') and the found words
            // so we remove one letter from the beginning of 'searchCopy' and start a new loop with this new value of 'searchCopy'
            else if (i === (searchCopy.length - 1)) {
                if (stringToCompare === "。" || stringToCompare === "、" || stringToCompare === "？") {
                    foundSentence.push(stringToCompare)
                }
                searchCopy = searchCopy.slice(-i)
                if (searchCopy === stringToCompare) break
                else i = -1
            }
        }
        return foundSentence
    }
}