module.exports = {
    sortByObjectKey: (array, object) => {
        return array?.sort((a, b) => (
            Object.keys(object).find(key => object[key] === a.level) - Object.keys(object).find(key => object[key] === b.level)
        ))
    },
    cutStringToArray: (string) => {
        return string.toLowerCase().split(', ')
    },
    getBasicKanjiElements: (kanji) => {
        return {
            id: kanji.id,
            kanji: kanji.kanji,
            readings: kanji.readings,
            translation: kanji.translation
        }
    },
    getBasicWordElements: (word) => {
        return {
            id: word.id,
            elements: word.elements,
            romaji: word.romaji,
            translation: word.translation,
            jukujikunAsMain: word.jukujikunAsMain,
            jukujikun: word.jukujikun
        }
    },
    getImportanceWithinSentence: (grammar) => {
        const importance = {
            1: 0,
            2: 0,
            3: 1,
            4: 1,
            5: 0,
            6: 1,
            7: 0,
            8: 0,
            9: 2,
            10: 0,
            11: 1,
            12: 0,
            13: 0,
        }
        return importance[grammar]
    },
    sentenceExceptionCharacters: [
        "。",
        "、",
        "？",
    ]
}