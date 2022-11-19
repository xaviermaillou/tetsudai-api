const firebase = require('../Firebase')
require( "firebase/firestore")
const libFunctions = require('./common')
const grammar = require('../lib/grammar')
const { kanasDictionnary } = require('tetsudai-common')

const localKanji = require('../localDatabase/kanji.json')
const localVocabulary = require('../localDatabase/vocabulary.json')
const localAlternatives = require('../localDatabase/alternatives.json')
const localSentences = require('../localDatabase/sentences.json')
const { dispatchFunctionInSentence } = require('../lib/grammar')

module.exports = {
    buildData: async () => {

        let kanjiList = []
        if (process.env.NODE_ENV === 'production') {
            const kanjiSnapshot = await firebase.firestore().collection('Kanjis').get()
            kanjiSnapshot.forEach((doc) => {
                kanjiList.push({
                    ...doc.data(),
                    doc,
                })
            })
        } else kanjiList = localKanji

        let vocabularyList = []
        if (process.env.NODE_ENV === 'production') {
            const vocabularySnapshot = await firebase.firestore().collection('Vocabulary').get()
            vocabularySnapshot.forEach((doc) => {
                vocabularyList.push({
                    ...doc.data(),
                    doc,
                })
            })
        } else vocabularyList = localVocabulary

        let alternativesList = []
        if (process.env.NODE_ENV === 'production') {
            const alternativesSnapshot = await firebase.firestore().collection('Alternatives').get()
            alternativesSnapshot.forEach((doc) => {
                alternativesList.push({
                    ...doc.data(),
                    doc,
                })
            })
        } else alternativesList = localAlternatives

        let sentencesList = []
        if (process.env.NODE_ENV === 'production') {
            const sentencesSnapshot = await firebase.firestore().collection('Sentences').get()
            sentencesSnapshot.forEach((doc) => {
                sentencesList.push({
                    ...doc.data(),
                    doc,
                })
            })
        } else sentencesList = localSentences

        kanjiList.forEach((kanji) => {
            kanji.translationArray = libFunctions.cutStringToArray(kanji.translation)
            kanji.relatedJukujikun = []
            kanji.grammar = []
            kanji.readings.kunyomi.forEach((yomi) => yomi.examples = [])
            kanji.readings.onyomi.forEach((yomi) => yomi.examples = [])
            vocabularyList.forEach((word) => {
                word.sentences = []
                word.translationArray = libFunctions.cutStringToArray(word.translation)
                word.elements.every((element) => {
                    if (kanji.kanji === element.kanji) {
                        element.kana ?
                            kanasDictionnary.isKatakana(element.kana) ?
                            kanji.readings.onyomi.forEach((yomi) => {
                                if (kanji.id === 52) console.log('onyomi', element.kana)
                                if (yomi.kana === element.kana) yomi.examples.push(libFunctions.getBasicWordElements(word))
                            })
                            :
                            kanji.readings.kunyomi.forEach((yomi) => {
                                if (kanji.id === 52) console.log('kunyomi', element.kana)
                                if (yomi.kana === element.kana) yomi.examples.push(libFunctions.getBasicWordElements(word))
                            })
                        :
                        kanji.relatedJukujikun.push(libFunctions.getBasicWordElements(word))
                        kanji.grammar.push(...word.grammar)
                        element.details = {
                            id: kanji.id,
                            kanji: kanji.kanji,
                            readings: {
                                kunyomi: kanji.readings.kunyomi.map((reading) => {
                                    return {
                                        kana: reading.kana
                                    }
                                }),
                                onyomi: kanji.readings.onyomi.map((reading) => {
                                    return {
                                        kana: reading.kana
                                    }
                                })
                            },
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
            kanji.kanjiParts?.forEach((part) => {
                let partKanjiFound = false
                kanjiList.forEach((kanji2) => {
                    if (kanji2.kanji === part || kanji2.kanjiVariations?.includes(part)) {
                        kanji2.kanjiUsedAsPartIn.push(libFunctions.getBasicKanjiElements(kanji))
                        kanji.kanjiTakenAsPartFrom.push(libFunctions.getBasicKanjiElements(kanji2))
                        partKanjiFound = true
                    }
                })
                if (!partKanjiFound) console.log('Undefined part:', part, 'in', kanji.kanji)
            })
        })

        vocabularyList.forEach((word) => {
            word.elements.forEach((element) => {
                if (word.forceHiragana) {
                    const katakana = element.kana
                    element.kana = kanasDictionnary.translateToHiragana(katakana)
                }
            })
            word.completeWord = word.jukujikunAsMain ?
                (word.jukujikun || word.elements.map((element) => element.kana).join(''))
                :
                word.elements.map((element) => element.option === "rareKanji" ? element.kana : element.kanji || element.kana).join('')

            word.inflexions = grammar.dispatchInflexion(word)

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
            const stem = grammar.dispatchBaseWord(word)
            
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
                        && (!word.grammar.includes(9) || word2.includesParticle)
                        && baseWrittenInKana2.includes(baseWrittenInKana)
                        && word.id !== word2.id
                        && !base2.includes("する")
                    ) {
                        word.relatedWords.wordUsedIn.push(libFunctions.getBasicWordElements(word2))
                        word2.relatedWords.wordTakenFrom.push(libFunctions.getBasicWordElements(word))
                    }
                }
            })

            word.elements.forEach((element) => {
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

        // TO REMOVE
        const manyFunctionsCases = {
            "1and4": {
                number: 0,
                elements: []
            },
            "1and4and5": {
                number: 0,
                elements: []
            },
            "1and5": {
                number: 0,
                elements: []
            },
            "1and5and8": {
                number: 0,
                elements: []
            },
            "1and5and13": {
                number: 0,
                elements: []
            },
            "1and8": {
                number: 0,
                elements: []
            },
            "1and13": {
                number: 0,
                elements: []
            },
            "4and5": {
                number: 0,
                elements: []
            },
            "4and10": {
                number: 0,
                elements: []
            },
            "5and6": {
                number: 0,
                elements: []
            },
            "5and10": {
                number: 0,
                elements: []
            },
            "6and9": {
                number: 0,
                elements: []
            },
            "6and10": {
                number: 0,
                elements: []
            },
        }

        vocabularyList.forEach((word) => {
            const manyFunctionsCase = word.grammar.length > 1 ? word.grammar : undefined
            if (manyFunctionsCase) {
                const keyString = manyFunctionsCase.map((key, i) => {
                    let result = ""
                    if (i > 0) result += "and"
                    result += String(key)
                    return result
                }).join("")
                if (manyFunctionsCases[keyString] !== undefined) {
                    manyFunctionsCases[keyString].number++
                    manyFunctionsCases[keyString].elements.push(word.completeWord)
                }
            }
        })

        console.log(manyFunctionsCases)
        //

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