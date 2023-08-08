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
            "nc": 0,
            "np": 0,
            "vb": 1,
            "adj": 1,
            "adv": 0,
            "cj": 1,
            "dtm": 0,
            "pn": 0,
            "ptc": 2,
            "exp": 0,
            "cpl": 1,
            "nb": 0,
            "suf": 0,
        }
        return importance[grammar]
    },
    sentenceExceptionCharacters: [
        "。",
        "、",
        "？",
    ]
}