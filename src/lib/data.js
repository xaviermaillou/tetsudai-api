const commonLib = require('./common')

module.exports = {
    buildData: (kanjiJSON, vocabularyJSON) => {
        kanjiJSON.forEach((kanji) => {
            kanji.translationArray = commonLib.cutStringToArray(kanji.translation)
            kanji.vocabulary = []
            kanji.grammar = []
            vocabularyJSON.forEach((word) => {
                word.sentences = []
                word.translationArray = commonLib.cutStringToArray(word.translation)
                word.elements.every((element) => {
                    if (kanji.kanji === element.kanji) {
                    kanji.vocabulary.push({
                        id: word.id,
                        elements: word.elements,
                        romaji: word.romaji,
                        translation: word.translation
                    })
                    kanji.grammar.push(...word.grammar)
                    element.details = {
                        id: kanji.id,
                        kanji: kanji.kanji,
                        readings: kanji.readings,
                        romaji: kanji.romaji,
                        translation: kanji.translation
                    }
                    return false
                    }
                    return true
                })
            })
        })
        return {
            kanjiList: kanjiJSON,
            vocabularyList: vocabularyJSON
        }
    }
}