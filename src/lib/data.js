const firebase = require('../Firebase')
require( "firebase/firestore")
const commonLib = require('./common')
const inflexions = require('../lib/inflexions')

module.exports = {
    buildData: async () => {

        let kanjiList = []
        firebase.firestore().collection('Kanjis').onSnapshot((snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                ...doc.data(),
                 doc,
            }))
            kanjiList = data
        })
        /* const kanjiSnapshot = await firebase.firestore().collection('Kanjis').get()
        kanjiSnapshot.forEach((doc) => {
            kanjiList.push({
                ...doc.data(),
                doc,
            })
        }) */

        let vocabularyList = []
        firebase.firestore().collection('Vocabulary').onSnapshot((snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                ...doc.data(),
                 doc,
            }))
            vocabularyList = data
        })
        /* const vocabularySnapshot = await firebase.firestore().collection('Vocabulary').get()
        vocabularySnapshot.forEach((doc) => {
            vocabularyList.push({
                ...doc.data(),
                doc,
            })
        }) */

        let alternativesList = []
        firebase.firestore().collection('Alternatives').onSnapshot((snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                ...doc.data(),
                 doc,
            }))
            alternativesList = data
        })
        /* const alternativesSnapshot = await firebase.firestore().collection('Alternatives').get()
        alternativesSnapshot.forEach((doc) => {
            alternativesList.push({
                ...doc.data(),
                doc,
            })
        }) */

        let sentencesList = []
        firebase.firestore().collection('Sentences').onSnapshot((snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                ...doc.data(),
                 doc,
            }))
            sentencesList = data
        })
        /* const sentencesSnapshot = await firebase.firestore().collection('Sentences').get()
        sentencesSnapshot.forEach((doc) => {
            sentencesList.push({
                ...doc.data(),
                doc,
            })
        }) */

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

        return {
            kanjiList: kanjiList,
            vocabularyList: vocabularyList,
            sentencesList: sentencesList
        }
    }
}