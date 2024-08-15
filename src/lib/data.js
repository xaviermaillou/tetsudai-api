const { getKanjiFullList, getVocabularyFullList, getSentencesFullList } = require('../request')
const grammar = require('../lib/grammar')
const { kanasDictionnary, dictionnary, types, validation } = require('tetsudai-common')
const libFunctions = require('./common')

module.exports = {
    buildData: async () => {
        const rawKanjiList = await getKanjiFullList()
        // Type validation
        validation.validateDataObjectsArray(rawKanjiList, types.RawKanji, [])

        const kanjiList = libFunctions
            .sortByObjectKey(rawKanjiList, dictionnary.fr.levels)
            .sort((a, b) => a.frequency - b.frequency)

        const rawVocabularyList = await getVocabularyFullList()
        // Type validation
        validation.validateDataObjectsArray(rawVocabularyList, types.RawWord, [361, 956, 1011])

        const vocabularyList = libFunctions
            .sortByObjectKey(rawVocabularyList, dictionnary.fr.levels)
            .sort((a, b) => a.frequency - b.frequency)

        const sentencesList = await getSentencesFullList()
        // Type validation
        validation.validateDataObjectsArray(sentencesList, types.RawSentence, [])

        // Loop 1: kanjiList -> enriching kanji (readings, relatedJukujikun, grammar)
        kanjiList.forEach((kanji) => {
            kanji.id = Number(kanji.id)
            kanji.relatedJukujikun = []
            kanji.grammar = []
            if (kanji.kanji.includes(' ')) console.log('- Blank space in', kanji.kanji, 'kanji')
            kanji.readings.kunyomi.forEach((yomi) => {
                if (yomi.kana.includes(' ')) console.log('- Blank space in', kanji.kanji, 'reading', yomi)
                yomi.examples = []
            })
            kanji.readings.onyomi.forEach((yomi) => {
                if (yomi.kana.includes(' ')) console.log('- Blank space in', kanji.kanji, 'reading', yomi)
                yomi.examples = []
            })
            kanji.kanjiParts.forEach((part) => {
                if (part.includes(' ')) console.log('- Blank space in', kanji.kanji, 'part', part)
            })
            if (!kanji.origin.sameMeaning && !!!kanji.origin.otherMeaning.fr) console.log("! Missing meaning for", kanji.kanji)
            if (!kanji.origin.pinyin) console.log("文 Missing Middle Chinese origin for", kanji.kanji)
            vocabularyList.forEach((word) => {
                word.id = Number(word.id)
                word.elements.every((element) => {
                    if (kanji.kanji === element.kanji) {
                        element.kana ?
                            kanasDictionnary.isKatakana(element.kana) ?
                            kanji.readings.onyomi.forEach((yomi) => {
                                if (yomi.kana === element.kana) yomi.examples.push(libFunctions.getBasicWordElements(word))
                            })
                            :
                            kanji.readings.kunyomi.forEach((yomi) => {
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

        // Loop 2: kanjiList -> relating kanji with each other as kanji's components
        kanjiList.forEach((kanji) => {
            kanji.kanjiParts?.forEach((part) => {
                if (part.includes(' ')) console.log('- Blank space in', kanji, 'part:', part)
                let partKanjiFound = false
                kanjiList.forEach((kanji2) => {
                    if (kanji2.kanji === part || kanji2.kanjiVariations?.includes(part)) {
                        kanji2.kanjiUsedAsPartIn.push(libFunctions.getBasicKanjiElements(kanji))
                        kanji.kanjiTakenAsPartFrom.push(libFunctions.getBasicKanjiElements(kanji2))
                        partKanjiFound = true
                    }
                })
                if (!partKanjiFound) console.log('- Undefined part:', part, 'in', kanji.kanji, ': this part is not registered as a kanji in the database.')
                if (kanji.kanjiTakenAsPartFrom.length > kanji.kanjiParts.length) console.log('- Duplicate parts in', kanji.kanji, ': open the kanji and check parts of the kanji, there might be a duplicate.')
            })
        })

        // Loop 3: vocabularyList -> enriching words (primaryWord, secondaryWord, inflexions, transforming onyomi to hiragana if needed)
        vocabularyList.forEach((word) => {

            // Here we transform katakana words into hiragana when it's used this way in Japanese language
            word.elements.forEach((element) => {
                if (element.kanji.includes(' ')) console.log('- Blank space in', word, 'element:', element.kanji)
                if (element.kana.includes(' ')) console.log('- Blank space in', word, 'element:', element.kana)
                if (word.forceHiragana) {
                    const katakana = element.kana
                    element.kana = kanasDictionnary.translateToHiragana(katakana)
                }
            })

            // Here we define primaryWord, which is the word as normally used
            word.primaryWord = libFunctions.katakanaRegularization(
                word.jukujikunAsMain ?
                    (word.jukujikun)
                    :
                    word.elements.map((element) => element.options.rareKanji ? element.kana : element.kanji || element.kana).join('')
            )

            // Here we define secondaryWord, which is the opposite version of the nornally used word (in kanas if used in kanji, in kanji if used in kanas)
            word.secondaryWord = libFunctions.katakanaRegularization(
                word.jukujikunAsMain ?
                    word.elements.map((element) => element.kanji || element.kana).join('')
                    :
                    word.elements.map((element) => element.options.rareKanji ? element.kanji || element.kana : element.kana || element.kanji).join('')
            )

            // here we inject the inflexions for verbs and adjectives
            word.inflexions = grammar.dispatchInflexion(word.primaryWord, word.verbPrecisions, word.adjectivePrecisions)
            word.alternativeInflexions = grammar.dispatchInflexion(word.secondaryWord, word.verbPrecisions, word.adjectivePrecisions)

            // Here we create the empty arrays for related words, that will be filled in the next loop
            word.relatedWords = {
                synonyms: [],
                stem: [],
                verbForm: [],
                wordUsedIn: [],
                wordTakenFrom: [],
                baseWord: [],
                suruForm: [],
            }
        })

        // Loop 4: vocabularyList -> injecting the related words
        vocabularyList.forEach((word) => {
            if ((word.grammar?.includes("vb") || word.grammar?.includes("adj")) && !!!word.inflexions) console.log('! Missing inflexions for', word.primaryWord)

            const base = word.primaryWord

            if (([ ...base ].filter(element => kanasDictionnary.isKatakana(element)).length === base.length) && !word.collections.includes("mok")) console.log("! Possible katakanized word missing from collection", base)
            if (!!word.jukujikun && !word.collections.includes("jkjk")) console.log("! Possible jukujikun missing from collection", base)
            if (libFunctions.wordsToIgnoreForComposingWords.includes(base)) return

            const kanjiOnly = word.elements.map((element) => element.kanji).join('')
            const kanjiReadings = word.elements.map((element) => {if (element.kanji) return element.kana}).join('')
            const baseWrittenInKana = word.elements.map((element) => element.kana).join('')
            const stem = grammar.dispatchBaseWord(word.primaryWord, word.verbPrecisions)

            const foundWords = {}
            
            // Stem and general included words
            vocabularyList.forEach((word2) => {
                if (word.id === word2.id) return
                
                const base2 = word2.primaryWord
                const kanjiOnly2 = word2.elements.map((element) => element.kanji).join('')
                const kanjiReadings2 = word2.elements.map((element) => {if (element.kanji) return element.kana}).join('')
                const baseWrittenInKana2 = word2.elements.map((element) => element.kana).join('')

                if (!!kanjiOnly && kanjiOnly === kanjiOnly2 && base === base2) {
                    const meanings = [ ...word.translation.fr.join(", ").split(", "), ...word.alternatives.fr.join(", ").split(", ") ]
                    const meanings2 = [ ...word2.translation.fr.join(", ").split(", "), ...word2.alternatives.fr.join(", ").split(", ") ]
                    for (const meaning of meanings) {
                        if (!meaning) continue
                        if (meanings2.includes(meaning)) {
                            word.relatedWords.synonyms.push(libFunctions.getBasicWordElements(word2))
                            break
                        }
                    }
                    if (word.relatedWords.synonyms.length === 0) console.log("- Possible synonyms:", base, `(${word.translation.fr})`, "&", base2, `(${word2.translation.fr})`)
                }
                else if (kanjiOnly.includes(kanjiOnly2)) {
                    if (!!stem
                        && base2 === stem
                    ) {
                        word.relatedWords.stem.push(libFunctions.getBasicWordElements(word2))
                        word2.relatedWords.verbForm.push(libFunctions.getBasicWordElements(word))
                    }
                    else if (base.includes(base2)
                        && (!word2.grammar?.includes("ptc") || word.includesParticle)
                        && baseWrittenInKana.includes(baseWrittenInKana2)
                        && kanjiReadings.includes(kanjiReadings2)
                        && !base.includes("する")
                    ) {
                        foundWords[base2] = libFunctions.getBasicWordElements(word2)
                        word2.relatedWords.wordUsedIn.push(libFunctions.getBasicWordElements(word))
                    }
                }
                // Here we check for possible related words that are missing the kanji that could confirm their bound
                // As instance フランス had its kanji (仏蘭西) but フランス語 was missing it
                else if (
                    (!!stem
                        && base2 === stem
                    )
                    ||
                    (base.includes(base2)
                        && (!word2.grammar?.includes("ptc") || word.includesParticle)
                        && baseWrittenInKana.includes(baseWrittenInKana2)
                        && kanjiReadings.includes(kanjiReadings2)
                        && !base.includes("する")
                    )
                ) console.log("- Possible related words:", base, `(${word.id})`, "&", base2, `(${word2.id})`)
            })

            const filteredWordsStrings = libFunctions.findComposingWords(Object.keys(foundWords), base)
            word.relatedWords.wordTakenFrom = filteredWordsStrings.map((word) => foundWords[word])

            // Suru form
            word.elements.forEach((element) => {
                if (element.kana === "する") {
                    const wordWithoutSuru = base.slice(0, -2)
                    vocabularyList.every((word2) => {
                        const base2 = word2.primaryWord
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

        // Type validation
        validation.validateDataObjectsArray(kanjiList, types.EnrichedKanji, [246, 14])
        // Type validation
        validation.validateDataObjectsArray(vocabularyList, types.EnrichedWord, [252, 361, 447, 956, 1011, 1037])

        return {
            kanjiList: kanjiList,
            vocabularyList: vocabularyList,
            sentencesList: sentencesList
        }
    }
}