const firebase = require('../Firebase')
require( "firebase/firestore")
const libFunctions = require('./common')
const grammar = require('../lib/grammar')
const { kanasDictionnary } = require('tetsudai-common')

const localKanji = require('../localDatabase/kanji.json')
const localVocabulary = require('../localDatabase/vocabulary.json')
const localAlternatives = require('../localDatabase/alternatives.json')
const localSentences = require('../localDatabase/sentences.json')

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
            kanji.id = Number(kanji.id)
            kanji.translationArray = libFunctions.cutStringToArray(kanji.translation)
            kanji.relatedJukujikun = []
            kanji.grammar = []
            kanji.readings.kunyomi.forEach((yomi) => yomi.examples = [])
            kanji.readings.onyomi.forEach((yomi) => yomi.examples = [])
            vocabularyList.forEach((word) => {
                word.id = Number(word.id)
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

        // Here we relate kanji with each other as kanji's components
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
                if (!partKanjiFound) console.log('Undefined part:', part, 'in', kanji.kanji, ': this part is not registered as a kanji in the database.')
                if (kanji.kanjiTakenAsPartFrom.length > kanji.kanjiParts.length) console.log('Duplicate parts in', kanji.kanji, ': open the kanji and check parts of the kanji, there might be a duplicate.')
            })
        })

        vocabularyList.forEach((word) => {

            // Here we transform katakana words into hiragana when it's used this way in Japanese language
            word.elements.forEach((element) => {
                if (word.forceHiragana) {
                    const katakana = element.kana
                    element.kana = kanasDictionnary.translateToHiragana(katakana)
                }
            })

            // Here we define completeWord, which is the word as normally used
            word.completeWord = word.jukujikunAsMain ?
                (word.jukujikun || word.elements.map((element) => element.kana).join(''))
                :
                word.elements.map((element) => element.option === "rareKanji" ? element.kana : element.kanji || element.kana).join('')

            // here we inject the inflexions for verbs and adjectives
            word.inflexions = grammar.dispatchInflexion(word)

            // Here we inject the alternatives (different possible translations of the word)
            // The last part (conjugation...) is related to an older structure of the alternatives objects
            word.alternatives = []
            alternativesList.forEach((alternative) => {
                if (alternative.id === word.id) word.alternatives = alternative.alternatives || [ ...alternative.conjugation.nonPast, ...alternative.conjugation.past ]
            })

            // Here we create the empty arrays for related words, that will be filled in the next loop
            word.relatedWords = {
                stem: [],
                verbForm: [],
                wordUsedIn: [],
                wordTakenFrom: [],
                baseWord: [],
                suruForm: [],
            }
        })
        
        // Here we inject the related words
        vocabularyList.forEach((word) => {
            if ((word.grammar.includes(3) || word.grammar.includes(4)) && !!!word.inflexions) console.log('Missing inflexions for', word.completeWord)
            const base = word.completeWord
            const kanjiOnly = word.elements.map((element) => element.kanji).join('')
            const baseWrittenInKana = word.elements.map((element) => element.kana).join('')
            const stem = grammar.dispatchBaseWord(word)
            
            // Stem and generic included words
            vocabularyList.forEach((word2) => {
                const base2 = word2.completeWord
                const kanjiOnly2 = word2.elements.map((element) => element.kanji).join('')
                const baseWrittenInKana2 = word2.elements.map((element) => element.kana).join('')

                if (kanjiOnly.includes(kanjiOnly2)) {
                    if (!!stem
                        && base2 === stem
                    ) {
                        word.relatedWords.stem.push(libFunctions.getBasicWordElements(word2))
                        word2.relatedWords.verbForm.push(libFunctions.getBasicWordElements(word))
                    }
                    else if (base.includes(base2)
                        && (!word2.grammar.includes(9) || word.includesParticle)
                        && baseWrittenInKana.includes(baseWrittenInKana2)
                        && word.id !== word2.id
                        && !base.includes("する")
                    ) {
                        word.relatedWords.wordTakenFrom.push(libFunctions.getBasicWordElements(word2))
                        word2.relatedWords.wordUsedIn.push(libFunctions.getBasicWordElements(word))
                    }
                }
            })

            // Suru form
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