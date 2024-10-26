const { getKanjiFullList, getVocabularyFullList, getSentencesFullList } = require('../request')
const grammar = require('../lib/grammar')
const { kanasDictionnary, dictionnary, types, validation } = require('tetsudai-common')
const libFunctions = require('./common')
const { gatherReadings, hiraganaVariations, katakanaVariations } = require('tetsudai-common/lib/kanasDictionnary')

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
            // if (!kanji.origin.pinyin) console.log("文 Missing Middle Chinese origin for", kanji.kanji)
            vocabularyList.forEach((word) => {
                word.id = Number(word.id)
                word.elements.every((element) => {
                    if (kanji.kanji === element.kanji) {
                        // Word is injected in kanji's reading examples
                        if (element.kana) {
                            const found = kanji.readings[(kanasDictionnary.isKatakana(element.kana) ? "onyomi" : "kunyomi")].some((yomi) => {
                                if (yomi.kana === element.kana) {
                                    yomi.examples.push({
                                        ...libFunctions.getBasicWordElements(word),
                                        ateji: element.options.ateji
                                    })
                                    return true
                                }
                            })
                            if (!found) {
                                if (element.options.ateji) {
                                    kanji.readings.onyomi.forEach(reading => {
                                        if (element.kana.startsWith(reading.kana))
                                            if (!reading.extensions)
                                                reading.extensions = []
                                            if (!reading.extensions.find(reading => reading.kana === element.kana))
                                                reading.extensions.push({
                                                    kana: element.kana,
                                                    examples: [{
                                                        ...libFunctions.getBasicWordElements(word),
                                                        ateji: element.options.ateji
                                                    }]
                                                })
                                            else    
                                                reading.extensions.forEach(reading => {
                                                    if (reading.kana === element.kana)
                                                        reading.examples.push({
                                                            ...libFunctions.getBasicWordElements(word),
                                                            ateji: element.options.ateji
                                                        })
                                                })
                                    })
                                }
                                if (element.options.irregular) {
                                    if (!kanji.readings.irregular)
                                        kanji.readings.irregular = []
                                    if (!kanji.readings.irregular.find(reading => reading.kana === element.kana))
                                        kanji.readings.irregular.push({
                                            kana: element.kana,
                                            examples: [{
                                                ...libFunctions.getBasicWordElements(word),
                                                ateji: element.options.ateji
                                            }]
                                        })
                                    else    
                                        kanji.readings.irregular.forEach(reading => {
                                            if (reading.kana === element.kana)
                                                reading.examples.push({
                                                    ...libFunctions.getBasicWordElements(word),
                                                    ateji: element.options.ateji
                                                })
                                        })
                                }
                                else console.log("! Possible mismatch with", kanji.kanji, "and the reading", element.kana, "of word n°", word.id)
                            }
                        }
                        else kanji.relatedJukujikun.push(libFunctions.getBasicWordElements(word))
                        kanji.grammar.push(...word.grammar)
                        // Kanji is injected in word's element details
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

            kanji.readings.kunyomi = gatherReadings(kanji.readings.kunyomi, false)
            kanji.readings.onyomi = gatherReadings(kanji.readings.onyomi, true)
            if (!!kanji.readings.irregular) kanji.readings.irregular = gatherReadings(kanji.readings.irregular, true)
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
            word.primaryWord = word.jukujikunAsMain ?
                (word.jukujikun)
                :
                word.elements.map((element) => element.options.rareKanji ? element.kana : element.kanji || element.kana).join('')

            // Here we define secondaryWord, which is the opposite version of the nornally used word (in kanas if used in kanji, in kanji if used in kanas)
            word.secondaryWord = word.jukujikunAsMain ?
                word.elements.map((element) => element.kanji || element.kana).join('')
                :
                word.elements.map((element) => element.options.rareKanji ? element.kanji || element.kana : element.kana || element.kanji).join('')

            // here we inject the inflexions for verbs and adjectives
            word.inflexions = grammar.dispatchInflexion(word.primaryWord, word.verbPrecisions, word.adjectivePrecisions)
            word.alternativeInflexions = grammar.dispatchInflexion(word.secondaryWord, word.verbPrecisions, word.adjectivePrecisions)

            word.chineseLegacy = word.elements.every(element => element.options.chineseLegacy)

            // Here we create the empty arrays for related words, that will be filled in the next loop
            word.relatedWords = {
                synonyms: [],
                stemForm: [],
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

            const foundWords = {}
            
            // Stem and general included words
            vocabularyList.forEach((word2) => {
                if (word.id === word2.id) return

                const base2 = word2.primaryWord
                const kanjiOnly2 = word2.elements.map((element) => element.kanji).join('')
                const kanjiReadings2 = word2.elements.map((element) => {if (element.kanji) return element.kana}).join('')
                const baseWrittenInKana2 = word2.elements.map((element) => element.kana).join('')
                const stem2 = grammar.dispatchBaseWord(base2, word2.verbPrecisions)?.stem

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
                    if (!!stem2
                        && base === stem2
                    ) {
                        word.relatedWords.verbForm.push(libFunctions.getBasicWordElements(word2))
                        word2.relatedWords.stemForm.push(libFunctions.getBasicWordElements(word))
                    }
                    else if (!!stem2
                        && base.includes(stem2)
                        && kanjiReadings.includes(kanjiReadings2)
                    ) foundWords[stem2] = word2.id
                    else if (
                        base.includes(base2)
                        && (!word2.grammar?.includes("ptc") || word.includesParticle)
                        && (
                            baseWrittenInKana.includes(baseWrittenInKana2)
                            || (
                                !!hiraganaVariations[baseWrittenInKana2.split("")[0]]
                                && hiraganaVariations[baseWrittenInKana2.split("")[0]]
                                    .some(kanaVariation => baseWrittenInKana.includes(kanaVariation + baseWrittenInKana2.slice(1)))
                            )
                            || (
                                !!katakanaVariations[baseWrittenInKana2.split("")[0]]
                                && katakanaVariations[baseWrittenInKana2.split("")[0]]
                                    .some(kanaVariation => baseWrittenInKana.includes(kanaVariation + baseWrittenInKana2.slice(1)))
                            )
                        )
                        && (
                            kanjiReadings.includes(kanjiReadings2)
                            || (
                                !!hiraganaVariations[kanjiReadings2.split("")[0]]
                                && hiraganaVariations[kanjiReadings2.split("")[0]]
                                    .some(kanaVariation => kanjiReadings.includes(kanaVariation + kanjiReadings2.slice(1)))
                            )
                            || (
                                !!katakanaVariations[kanjiReadings2.split("")[0]]
                                && katakanaVariations[kanjiReadings2.split("")[0]]
                                    .some(kanaVariation => kanjiReadings.includes(kanaVariation + kanjiReadings2.slice(1)))
                            )
                        )
                        && !base.includes("する")
                    ) foundWords[base2] = word2.id
                }
                // Here we check for possible related words that are missing the kanji that could confirm their bound
                // As instance フランス had its kanji (仏蘭西) but フランス語 was missing it
                else if (
                    (!!stem2
                        && base === stem2
                    )
                    || (base.includes(base2)
                        && (!word2.grammar?.includes("ptc") || word.includesParticle)
                        && baseWrittenInKana.includes(baseWrittenInKana2)
                        && kanjiReadings.includes(kanjiReadings2)
                        && !base.includes("する")
                    )
                ) console.log("- Possible related words:", base, `(${word.id})`, "&", base2, `(${word2.id})`)
            })

            // Based on all the words that are included within the current word (foundWords) we find the composing words (as if the current word was a sentence)
            // It is done to ensure the included words don't overlap
            // As instance 国人 (country person) was considered as being included in 韓国人 (korean person), while that one was actually composed by 韓国 and 人
            const filteredWordsStrings = libFunctions.findComposingWords(Object.keys(foundWords), base)

            filteredWordsStrings.forEach(string => {
                vocabularyList.forEach(word2 => {
                    if (word2.id === foundWords[string]) {
                        word.relatedWords.wordTakenFrom.push(libFunctions.getBasicWordElements(word2))
                        word2.relatedWords.wordUsedIn.push(libFunctions.getBasicWordElements(word))
                    }
                })
            })

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