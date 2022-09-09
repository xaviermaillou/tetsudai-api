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
                        kanji.vocabulary.push(libFunctions.getBasicWordElements(word))
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

        vocabularyList.forEach((word) => {
            word.completeWord = word.jukujikunAsMain ?
                (word.jukujikun || word.elements.map((element) => element.kana).join(''))
                :
                word.elements.map((element) => element.option === "rareKanji" ? element.kana : element.kanji || element.kana).join('')

            word.inflexions = inflexions.dispatchInflexion(word)

            word.alternatives = []
            alternativesList.forEach((alternative) => {
                if (alternative.id === word.id) word.alternatives = alternative.alternatives || [ ...alternative.conjugation.nonPast, ...alternative.conjugation.past ]
            })

            word.relatedWords = {
                stem: [],
                verbForm: [],
                stemUsedIn: [],
                stemTakenFrom: [],
                wordUsedIn: [],
                wordTakenFrom: [],
                baseWord: [],
                suruForm: [],
            }
        })
        
        vocabularyList.forEach((word) => {
            const base = word.completeWord
            const baseWrittenInKana = word.elements.map((element) => element.kana).join('')

            const stem = inflexions.dispatchBaseWord(word)
            vocabularyList.forEach((word2) => {
                const base2 = word2.completeWord
                const baseWrittenInKana2 = word2.elements.map((element) => element.kana).join('')
                if (!!stem
                    && base2 === stem
                ) {
                    word.relatedWords.stem.push(libFunctions.getBasicWordElements(word2))
                    word2.relatedWords.verbForm.push(libFunctions.getBasicWordElements(word))
                }
                else if (!!stem
                    && stem.length > 1
                    && base2.includes(stem)
                ) {
                    word.relatedWords.stemUsedIn.push(libFunctions.getBasicWordElements(word2))
                    word2.relatedWords.stemTakenFrom.push(libFunctions.getBasicWordElements(word))
                }
                else if (base2.includes(base)
                    && baseWrittenInKana2.includes(baseWrittenInKana)
                    && base.length > 1
                    && word.id !== word2.id
                ) {
                    word.relatedWords.wordUsedIn.push(libFunctions.getBasicWordElements(word2))
                    word2.relatedWords.wordTakenFrom.push(libFunctions.getBasicWordElements(word))
                }
            })

            word.elements.forEach((element) => {
                if (word.forceHiragana) {
                    const katakana = element.kana
                    element.kana = kanasDictionnary.translateToHiragana(katakana)
                }
                if (element.kana === "する") {
                    const wordWithoutSuru = base.slice(0, -2)
                    vocabularyList.every((word2) => {
                        const base2 = word2.base
                        if (base2 === wordWithoutSuru) {
                            word.relatedWords.baseWord.push(libFunctions.getBasicWordElements(word2))
                            word2.relatedWords.suruForm.push(libFunctions.getBasicWordElements(word))
                            return false
                        }
                        return true
                    })
                }
            })
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