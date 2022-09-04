module.exports = {
    sortByObjectKey: (array, object) => {
        return array?.sort((a, b) => (
            Object.keys(object).find(key => object[key] === a.level) - Object.keys(object).find(key => object[key] === b.level)
        ))
    },
    cutStringToArray: (string) => {
        return string.toLowerCase().split(', ')
    },
    getBasicWordElements: (word) => {
        return {
            id: word.id,
            elements: word.elements,
            romaji: word.romaji,
            translation: word.translation,
            rareKanji: word.rareKanji,
            jukujikun: word.jukujikun
        }
    }
}