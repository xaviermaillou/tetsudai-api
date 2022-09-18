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
            kanji.relatedJukujikun = []
            kanji.grammar = []
            vocabularyList.forEach((word) => {
                word.sentences = []
                word.translationArray = libFunctions.cutStringToArray(word.translation)
                word.elements.every((element) => {
                    if (kanji.kanji === element.kanji) {
                        element.kana ?
                        kanji.vocabulary.push(libFunctions.getBasicWordElements(word))
                        :
                        kanji.relatedJukujikun.push(libFunctions.getBasicWordElements(word))
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
            kanji.kanjiUsedAsPartIn = []
            kanji.kanjiTakenAsPartFrom = []
        })

        kanjiList.forEach((kanji) => {
            kanjiList.forEach((kanji2) => {
                kanji2.kanjiParts?.forEach((part) => {
                    if (kanji.kanji === part || kanji.kanjiVariations?.includes(part)) {
                        kanji.kanjiUsedAsPartIn.push(libFunctions.getBasicKanjiElements(kanji2))
                        kanji2.kanjiTakenAsPartFrom.push(libFunctions.getBasicKanjiElements(kanji))
                    }
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
            const kanjiOnly = word.elements.map((element) => element.kanji).join('')
            const baseWrittenInKana = word.elements.map((element) => element.kana).join('')
            const stem = inflexions.dispatchBaseWord(word)
            
            vocabularyList.forEach((word2) => {
                const base2 = word2.completeWord
                const kanjiOnly2 = word2.elements.map((element) => element.kanji).join('')
                const baseWrittenInKana2 = word2.elements.map((element) => element.kana).join('')

                if (kanjiOnly2.includes(kanjiOnly)) {
                    if (!!stem
                        && base2 === stem
                    ) {
                        word.relatedWords.stem.push(libFunctions.getBasicWordElements(word2))
                        word2.relatedWords.verbForm.push(libFunctions.getBasicWordElements(word))
                    }
                    else if (!!stem
                        && stem.length > 1
                        && base2.includes(stem)
                        && word.id !== word2.id
                    ) {
                        word.relatedWords.stemUsedIn.push(libFunctions.getBasicWordElements(word2))
                        word2.relatedWords.stemTakenFrom.push(libFunctions.getBasicWordElements(word))
                    }
                    else if (base2.includes(base)
                        && baseWrittenInKana2.includes(baseWrittenInKana)
                        && base.length > 1
                        && word.id !== word2.id
                        && !base2.includes("する")
                    ) {
                        word.relatedWords.wordUsedIn.push(libFunctions.getBasicWordElements(word2))
                        word2.relatedWords.wordTakenFrom.push(libFunctions.getBasicWordElements(word))
                    }
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
                        const base2 = word2.completeWord
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