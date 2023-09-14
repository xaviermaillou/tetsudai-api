const sentenceExceptionCharacters = [
    "。",
    "、",
    "？",
    "「",
    "」",
]

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
    sentenceExceptionCharacters,
    findComposingWords: (stringsArray, string) => {
        // We create a copy of 'search' string, which will be sliced from the beginning at each found word
        let searchCopy = string
        let alternativeSearchCopy = string
        const foundWords = []
        const alternativeFoundWords = []
        for (let i = 0; i < searchCopy.length; i++) {
            // 'stringToCompare' value is equal to 'searchCopy' with an 'i' amount of letters removed from its ending
            const stringToCompare = i === 0 ? searchCopy : searchCopy.slice(0, -i)
            // The current word 'stringToCompare' (a slice of 'searchCopy') matches one of the found words
            if (stringsArray.includes(stringToCompare)) {
                foundWords.push(stringToCompare)
                searchCopy = searchCopy.slice(-i)
                if (searchCopy === stringToCompare) break
                // Loop is reset
                else i = -1
            }
            // No match has been found between any of the 'stringToCompare' variables (slices of 'searchCopy') and the found words
            // so we remove one letter from the beginning of 'searchCopy' and start a new loop with this new value of 'searchCopy'
            else if (i === (searchCopy.length - 1)) {
                if (sentenceExceptionCharacters.includes(stringToCompare)) {
                    foundWords.push(stringToCompare)
                }
                searchCopy = searchCopy.slice(-i)
                if (searchCopy === stringToCompare) break
                // Loop is reset
                else i = -1
            }
        }
        // If an element has been skipped, we redo the loop in reverse
        if (foundWords.join("").length < string.length) {
            for (let i = 0; i < alternativeSearchCopy.length; i++) {
                const stringToCompare = i === 0 ? alternativeSearchCopy : alternativeSearchCopy.slice(-i)
                if (stringsArray.includes(stringToCompare)) {
                    alternativeFoundWords.unshift(stringToCompare)
                    alternativeSearchCopy = alternativeSearchCopy.slice(0, -i)
                    if (alternativeSearchCopy === stringToCompare) break
                    else i = -1
                }
                else if (i === (alternativeSearchCopy.length - 1)) {
                    if (sentenceExceptionCharacters.includes(stringToCompare)) {
                        alternativeFoundWords.unshift(stringToCompare)
                    }
                    alternativeSearchCopy = alternativeSearchCopy.slice(0, -i)
                    if (alternativeSearchCopy === stringToCompare) break
                    else i = -1
                }
            }
        }
        return foundWords.join("").length > alternativeFoundWords.join("").length ? foundWords : alternativeFoundWords
    }
}