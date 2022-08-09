const firebase = require('../Firebase')
require( "firebase/firestore")
const libFunctions = require('./common')
const inflexions = require('../lib/inflexions')

module.exports = {
    buildData: async () => {

        let kanjiList = []
        const kanjiSnapshot = await firebase.firestore().collection('Kanjis').get()
        kanjiSnapshot.forEach((doc) => {
            kanjiList.push({
                ...doc.data(),
                doc,
            })
        })

        let vocabularyList = []
        const vocabularySnapshot = await firebase.firestore().collection('Vocabulary').get()
        vocabularySnapshot.forEach((doc) => {
            vocabularyList.push({
                ...doc.data(),
                doc,
            })
        })

        let alternativesList = []
        const alternativesSnapshot = await firebase.firestore().collection('Alternatives').get()
        alternativesSnapshot.forEach((doc) => {
            alternativesList.push({
                ...doc.data(),
                doc,
            })
        })

        let sentencesList = []
        const sentencesSnapshot = await firebase.firestore().collection('Sentences').get()
        sentencesSnapshot.forEach((doc) => {
            sentencesList.push({
                ...doc.data(),
                doc,
            })
        })

        kanjiList.forEach((kanji) => {
            kanji.translationArray = commonLib.cutStringToArray(kanji.translation)
            kanji.vocabulary = []
            kanji.grammar = []
            vocabularyList.forEach((word) => {
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
                alternativesList.forEach((alternative) => {
                    if (alternative.id === word.id) word.alternatives = alternative.alternatives || [ ...alternative.conjugation.nonPast, ...alternative.conjugation.past ]
                })
            })
        })
        console.log(kanjiList.length, 'kanji chargés')
        console.log(vocabularyList.length, 'mots chargés')
        console.log(sentencesList.length, 'phrases chargées')
        return {
            kanjiList: kanjiList,
            vocabularyList: vocabularyList,
            sentencesList: sentencesList
        }
    }
}