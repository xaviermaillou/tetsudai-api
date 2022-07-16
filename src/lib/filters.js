const searchRegularization = (string) => {
    return string.split('\'').join('').split('é').join('e').split('è').join('e').split('ê').join('e')
        .split('à').join('a').split('â').join('a').split('î').join('i').split('ô').join('o').split('û')
        .join('u').split('-').join('').split('ç').join('c')
}
const romajiRegularization = (string) => {
    return string.split('ou').join('o').split('ei').join('e').split('aa').join('a').split('ii').join('i').split('uu').join('u')
}

module.exports = {
    searchThroughKanji: (kanji, string) => {
        let includes = false

        kanji.romaji?.forEach((word) => {
            if (romajiRegularization(word.toLowerCase())
                .includes(romajiRegularization(string.toLowerCase()))
            ) includes = true
        })

        kanji.translationArray?.forEach((word) => {
            if (searchRegularization(word.toLowerCase())
                .includes(searchRegularization(string.toLowerCase()))
            ) includes = true
        })

        kanji.vocabulary.forEach((word) => {
            if (searchRegularization(word.translation.toLowerCase())
                .includes(searchRegularization(string.toLowerCase()))
            ) includes = true
            if (romajiRegularization(word.romaji.toLowerCase())
                .includes(romajiRegularization(string.toLowerCase()))
            ) includes = true
        })

        if (kanji.kanji === string) includes = true
        if (string.includes(kanji.kanji)) includes = true

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
        kanji.romaji?.forEach((word) => {
            if (romajiRegularization(word.toLowerCase())
                === romajiRegularization(string.toLowerCase())
            ) matchingScore ++
        })

        kanji.translationArray?.forEach((word) => {
            if (searchRegularization(word.toLowerCase())
                === searchRegularization(string.toLowerCase())
            ) matchingScore ++
        })

        if (kanji.kanji === string) matchingScore ++

        kanji.readings.kunyomi.forEach((word) => {
            if (word === string) matchingScore ++
        })

        kanji.readings.onyomi.forEach((word) => {
            if (word === string) matchingScore ++
        })

        /* vocabulary.forEach((word) => {
            if (word.translation.toLowerCase() === string.toLowerCase()) matchingScore ++
            if (word.romaji.toLowerCase() === string.toLowerCase()) matchingScore ++
        }) */
        return matchingScore
    },

    searchThroughWord: (vocabularyWord, string) => {
        let includes = false
        vocabularyWord.translationArray?.forEach((word) => {
            if (searchRegularization(word.toLowerCase())
                .includes(searchRegularization(string.toLowerCase()))
            ) includes = true
        })

        vocabularyWord.alternatives?.forEach((word) => {
            if (searchRegularization(word.toLowerCase())
                .includes(searchRegularization(string.toLowerCase()))
            ) includes = true
        })
        
        if (romajiRegularization(vocabularyWord.romaji.toLowerCase())
            .includes(romajiRegularization(string.toLowerCase()))
        ) includes = true

        if (vocabularyWord.inflexions) {
            const inflexionsArray = []
            Object.values(vocabularyWord.inflexions).map((tense) => {
                inflexionsArray.push(tense.affirmative.neutral.main + tense.affirmative.neutral.ending)
                if (tense.affirmative.polite) inflexionsArray.push(tense.affirmative.polite.main + tense.affirmative.polite.ending) 
                inflexionsArray.push(tense.negative.neutral.main + tense.negative.neutral.ending) 
                if (tense.negative.polite) inflexionsArray.push(tense.negative.polite.main + tense.negative.polite.ending) 
            })
            inflexionsArray.forEach((inflexion) => {
                if (inflexion.includes(string) || string.includes(inflexion)) includes = true
            })
        }

        const japaneseWord = vocabularyWord.jukujikun || vocabularyWord.elements
            .map((element) => element.kanji || element.kana).join('')

        if (japaneseWord.includes(string) || string.includes(japaneseWord)) includes = true

        return includes
    },

    getWordImportance: (vocabularyWord, string) => {
        let matchingScore = 0
        console.log(vocabularyWord.romaji)
        if (romajiRegularization(vocabularyWord.romaji.toLowerCase())
            === romajiRegularization(string.toLowerCase())
        ) matchingScore ++

        vocabularyWord.translationArray?.forEach((word) => {
            if (vocabularyWord.id === 9) {
                console.log(searchRegularization(word.toLowerCase()))
                console.log(searchRegularization(string.toLowerCase()))
            }
            if (searchRegularization(word.toLowerCase())
                === searchRegularization(string.toLowerCase())
            ) matchingScore ++
        })

        vocabularyWord.alternatives?.forEach((word) => {
            if (searchRegularization(word.toLowerCase())
                === searchRegularization(string.toLowerCase())
            ) matchingScore ++
        })
        if (vocabularyWord.inflexions) {
            const inflexionsArray = []
            Object.values(vocabularyWord.inflexions).map((tense) => {
                inflexionsArray.push(tense.affirmative.neutral.main + tense.affirmative.neutral.ending)
                if (tense.affirmative.polite) inflexionsArray.push(tense.affirmative.polite.main + tense.affirmative.polite.ending) 
                inflexionsArray.push(tense.negative.neutral.main + tense.negative.neutral.ending) 
                if (tense.negative.polite) inflexionsArray.push(tense.negative.polite.main + tense.negative.polite.ending) 
            })
            inflexionsArray.forEach((inflexion) => {
                if (inflexion === string) matchingScore ++
            })
        }

        const japaneseWord = vocabularyWord.jukujikun || vocabularyWord.elements
            .map((element) => element.kanji || element.kana).join('')

        if (japaneseWord === string) matchingScore ++

        return matchingScore
    }
}