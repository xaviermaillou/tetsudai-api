const firebase = require('../Firebase')
require( "firebase/firestore")
const libFunctions = require('./common')
const inflexions = require('../lib/inflexions')
const { kanasDictionnary } = require('tetsudai-common')

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
            kanji.translationArray = libFunctions.cutStringToArray(kanji.translation)
            kanji.vocabulary = []
            kanji.grammar = []
            vocabularyList.forEach((word) => {
                word.sentences = []
                word.translationArray = libFunctions.cutStringToArray(word.translation)
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
                word.relatedWords = {}
            })
        })
        vocabularyList.forEach((word) => {
            const base = word.rareKanji ?
                (word.jukujikun || word.elements.map((element) => element.kana).join(''))
                :
                word.elements.map((element) => element.kanji || element.kana).join('')

            word.elements.forEach((element) => {
                if (word.forceHiragana) {
                    const katakana = element.kana
                    element.kana = kanasDictionnary.translateToHiragana(katakana)
                }
                if (element.kana === "する") {
                    const wordWithoutSuru = base.slice(0, -2)
                    vocabularyList.every((word2) => {
                        const base2 = word2.rareKanji ?
                            (word2.jukujikun || word2.elements.map((element) => element.kana).join(''))
                            :
                            word2.elements.map((element) => element.kanji || element.kana).join('')
                        if (base2 === wordWithoutSuru) {
                            word.relatedWords.baseWord = {
                                id: word2.id,
                                elements: word2.elements,
                                romaji: word2.romaji,
                                translation: word2.translation
                            }
                            word2.relatedWords.suruForm = {
                                id: word.id,
                                elements: word.elements,
                                romaji: word.romaji,
                                translation: word.translation
                            }
                            return false
                        }
                        return true
                    })
                }
            })
            if (word.verbPrecisions) {
                const stem = inflexions.dispatchBaseWord(word)
                vocabularyList.every((word2) => {
                    const base2 = word2.rareKanji ?
                        (word2.jukujikun || word2.elements.map((element) => element.kana).join(''))
                        :
                        word2.elements.map((element) => element.kanji || element.kana).join('')
                    if (base2 === stem) {
                        console.log(stem, base2)
                        word.relatedWords.stem = {
                            id: word2.id,
                            elements: word2.elements,
                            romaji: word2.romaji,
                            translation: word2.translation
                        }
                        word2.relatedWords.verbForm = {
                            id: word.id,
                            elements: word.elements,
                            romaji: word.romaji,
                            translation: word.translation
                        }
                        return false
                    }
                    return true
                })
            }
        })
        console.log(kanjiList.length, 'kanji chargés le', new Date().toLocaleString('fr-FR'))
        console.log(vocabularyList.length, 'mots chargés le', new Date().toLocaleString('fr-FR'))
        console.log(sentencesList.length, 'phrases chargées le', new Date().toLocaleString('fr-FR'))
        return {
            kanjiList: kanjiList,
            vocabularyList: vocabularyList,
            sentencesList: sentencesList
        }
    }
}