const fs = require('fs')
const kanjiList = require('./src/dataBackUp/kanji.json')
const vocabularyList = require('./src/dataBackUp/vocabulary.json')
const sentencesList = require('./src/dataBackUp/sentences.json')

const cleanedKanjiList = kanjiList?.map((kanji) => ({
    id: Number(kanji.id),
    kanji: kanji.kanji,
    strokes: Number(kanji.strokes),
    level: kanji.level,
    frequency: Number(kanji.frequency),
    readings: kanji.readings,
    collections: kanji.collections || [],
    kanjiVariations: kanji.kanjiVariations || [],
    kanjiParts: kanji.kanjiParts || [],
    translation: kanji.translation || [],
    romaji: kanji.romaji || [],
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
    collections: word.collections,
    level: word.level,
    originLanguage: word.originLanguage,
    originLanguageWord: word.originLanguageWord,
    precisions: word.precisions,
    frequency: Number(word.frequency),
    romaji: word.romaji || [],
    translation: word.translation || [],
    alternatives: word.alternatives || [],
    grammar: word.grammar,
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