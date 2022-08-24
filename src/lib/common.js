const { kanasDictionnary } = require('tetsudai-common')

module.exports = {
    sortByObjectKey: (array, object) => {
        return array?.sort((a, b) => (
            Object.keys(object).find(key => object[key] === a.level) - Object.keys(object).find(key => object[key] === b.level)
        ))
    },
    cutStringToArray: (string) => {
        return string.toLowerCase().split(', ')
    },
    katakanaToHiraganaForWords: (array) => {
        array.forEach((word) => {
            if (word.rareKanji) {
                word.elements.forEach((element) => {
                    element.kana = kanasDictionnary[element.kana]
                })
            }
        })
        return array
    }
}