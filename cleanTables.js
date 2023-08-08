const fs = require('fs')
const kanjiList = require('./src/localDatabase/kanji.json')
const vocabularyList = require('./src/localDatabase/vocabulary.json')
const alternativesList = require('./src/localDatabase/alternatives.json')
const sentencesList = require('./src/localDatabase/sentences.json')

const cleanedKanjiList = kanjiList?.map((kanji) => ({
    id: Number(kanji.id),
    kanji: kanji.kanji,
    strokes: Number(kanji.strokes),
    level: kanji.level,
    frequency: Number(kanji.frequency),
    readings: kanji.readings,
    collections: kanji.collections?.map((collection) => {
        if (collection === 1 || collection === '1') return 'lplk1'
        if (collection === 2 || collection === '2') return 'mok'
        if (collection === 3 || collection === '3') return 'jkjk'
        if (collection === 4 || collection === '4') return 'jfs'
        else return collection
    }) || [],
    kanjiVariations: kanji.kanjiVariations || [],
    kanjiParts: kanji.kanjiParts || [],
    translation: [kanji.translation],
    romaji: kanji.romaji,
    alternatives: [],
}))

fs.writeFile(process.cwd() + '/src/data/kanji.json', JSON.stringify(cleanedKanjiList), (err) => {
    if (err) {
        console.log("An error has occurred ", err)
        return
    }
    console.log("Data written successfully to the file: Kanji JSON")
})

const cleanedVocabularyList = vocabularyList?.map((word) => ({
    id: Number(word.id),
    elements: word.elements,
    common: !!word.common,
    jukujikun: word.jukujikun,
    jukujikunAsMain: !!word.jukujikunAsMain,
    forceHiragana: !!word.forceHiragana,
    includesParticle: !!word.includesParticle,
    gender: word.gender,
    formality: word.formality,
    collections: word.collections?.map((collection) => {
        if (collection === 1 || collection === '1') return 'lplk1'
        if (collection === 2 || collection === '2') return 'mok'
        if (collection === 3 || collection === '3') return 'jkjk'
        if (collection === 4 || collection === '4') return 'jfs'
        else return collection
    }) || [],
    level: word.level,
    originLanguage: word.originLanguage,
    originLanguageWord: word.originLanguageWord,
    precisions: word.precisions,
    frequency: Number(word.frequency),
    romaji: word.romaji,
    translation: [word.translation],
    alternatives: alternativesList?.find((alternative) => Number(alternative.id) === Number(word.id))?.alternatives,
    grammar: word.grammar?.map((grammarClass) => {
        if (grammarClass === 1 || grammarClass === "1") return "nc"
        if (grammarClass === 2 || grammarClass === "2") return "np"
        if (grammarClass === 3 || grammarClass === "3") return "vb"
        if (grammarClass === 4 || grammarClass === "4") return "adj"
        if (grammarClass === 5 || grammarClass === "5") return "adv"
        if (grammarClass === 6 || grammarClass === "6") return "cj"
        if (grammarClass === 7 || grammarClass === "7") return "dtm"
        if (grammarClass === 8 || grammarClass === "8") return "pn"
        if (grammarClass === 9 || grammarClass === "9") return "ptc"
        if (grammarClass === 10 || grammarClass === "10") return "exp"
        if (grammarClass === 11 || grammarClass === "11") return "cpl"
        if (grammarClass === 12 || grammarClass === "12") return "nb"
        if (grammarClass === 13 || grammarClass === "13") return "suf"
        else return grammarClass
    }),
    verbPrecisions: word.verbPrecisions,
    adjectivePrecisions: word.adjectivePrecisions,
    kosoado: word.kosoado,
}))

fs.writeFile(process.cwd() + '/src/data/vocabulary.json', JSON.stringify(cleanedVocabularyList), (err) => {
    if (err) {
        console.log("An error has occurred ", err)
        return
    }
    console.log("Data written successfully to the file: Vocabulary JSON")
})

const cleanedSentencesList = sentencesList.map((sentence) => ({
    id: Number(sentence.id),
    elements: sentence.elements,
    translation: sentence.translation
}))

fs.writeFile(process.cwd() + '/src/data/sentences.json', JSON.stringify(cleanedSentencesList), (err) => {
    if (err) {
        console.log("An error has occurred ", err)
        return
    }
    console.log("Data written successfully to the file: Sentences JSON")
})