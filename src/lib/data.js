const commonLib = require('./common')
const kanjiJSON = require('../data/kanjis')
const vocabularyJSON = require('../data/vocabulary')
const alternativesJSON = require('../data/alternatives')
const inflexions = require('../lib/inflexions')

module.exports = {
    buildData: () => {
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
                word.inflexions = inflexions.dispatchInflexion(word)
                word.alternatives = []
                alternativesJSON.forEach((alternative) => {
                    if (alternative.id === word.id) word.alternatives = alternative.alternatives || [ ...alternative.conjugation.nonPast, ...alternative.conjugation.past ]
                })
            })
        })
        return {
            kanjiList: kanjiJSON,
            vocabularyList: vocabularyJSON
        }
    }
}