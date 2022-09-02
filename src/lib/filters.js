const frenchRegularization = (string) => {
    return string.split('\'').join('').split('é').join('e').split('è').join('e').split('ê').join('e')
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
            kanji.vocabulary.forEach((word) => {
                if (frenchRegularization(word.translation.toLowerCase())
                    .includes(frenchRegularization(string.toLowerCase()))
                ) includes = true
            })
        }

        // Romaji filtering
        kanji.romaji?.forEach((word) => {
            if (romajiRegularization(word.toLowerCase())
                .includes(romajiRegularization(string.toLowerCase()))
            ) includes = true
        })
        kanji.vocabulary.forEach((word) => {
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

        // Kanji filtering
        if (kanji.kanji === string) includes = true
        if (string.includes(kanji.kanji)) includes = true


        // Kanas filtering
        kanji.readings.kunyomi.forEach((reading) => {
            if (reading.kana.includes(string)) includes = true
        })
        kanji.readings.onyomi.forEach((reading) => {
            if (reading.kana.includes(string)) includes = true
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
            if (romajiRegularization(word.toLowerCase())
                === romajiRegularization(string.toLowerCase())
            ) matchingScore = 1
        })

        // Kanji filtering
        if (kanji.kanji === string) matchingScore = 1

        // Kanas filtering
        kanji.readings.kunyomi.forEach((word) => {
            if (word === string) matchingScore = 1
        })
        kanji.readings.onyomi.forEach((word) => {
            if (word === string) matchingScore = 1
        })
        return matchingScore
    },

    searchThroughWord: (vocabularyWord, string) => {
        let includes = false

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
        if (vocabularyWord.inflexions) {
            const inflexionsArray = []
            Object.values(vocabularyWord.inflexions).map((tense) => {
                if (tense?.affirmative?.neutral) inflexionsArray.push(tense.affirmative.neutral.main + tense.affirmative.neutral.ending)
                if (tense?.affirmative?.polite) inflexionsArray.push(tense.affirmative.polite.main + tense.affirmative.polite.ending) 
                if (tense?.negative?.neutral) inflexionsArray.push(tense.negative.neutral.main + tense.negative.neutral.ending) 
                if (tense?.negative?.polite) inflexionsArray.push(tense.negative.polite.main + tense.negative.polite.ending) 
            })
            inflexionsArray.forEach((inflexion) => {
                if (inflexion.includes(string) || string.includes(inflexion)) includes = true
            })
        }

        // Main word filtering
        const japaneseWord = vocabularyWord.jukujikun || vocabularyWord.elements
            .map((element) => element.kanji || element.kana).join('')
        if (japaneseWord.includes(string) || string.includes(japaneseWord)) includes = true
        if (vocabularyWord.grammar.includes(14) && ((japaneseWord + 'する').includes(string) || string.includes(japaneseWord + 'する'))) includes = true

        return includes
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
        const japaneseWord = vocabularyWord.jukujikun || vocabularyWord.elements
            .map((element) => element.kanji || element.kana).join('')
        if (japaneseWord === string) matchingScore = 1
        // Taking in account suru verbs
        if (vocabularyWord.grammar.includes(14) && japaneseWord + 'する' === string) matchingScore = 1

        return matchingScore
    }
}