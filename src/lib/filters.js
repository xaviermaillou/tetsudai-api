const searchRegularization = (string) => {
    return string.split(' ').join('').split('\'').join('').split('é').join('e').split('è').join('e').split('ê').join('e')
        .split('à').join('a').split('â').join('a').split('î').join('i').split('ô').join('o').split('û').join('u').split('-').join('')
}
const romajiRegularization = (string) => {
    return string.split('ou').join('o').split('ei').join('e').split('aa').join('a').split('ii').join('i').split('uu').join('u')
}

module.exports = {
    searchThroughKanji: (vocabulary, romaji, translation, string) => {
        let includes = false
        romaji?.forEach((word) => {
            if (romajiRegularization(word.toLowerCase())
                .includes(romajiRegularization(string.toLowerCase()))) includes = true
        })
        translation?.forEach((word) => {
            if (searchRegularization(word.toLowerCase())
                .includes(searchRegularization(string.toLowerCase()))) includes = true
        })
        vocabulary.forEach((word) => {
            if (searchRegularization(word.translation.toLowerCase())
                .includes(searchRegularization(string.toLowerCase()))) includes = true
            if (romajiRegularization(word.romaji.toLowerCase())
                .includes(romajiRegularization(string.toLowerCase()))) includes = true
        })
        return includes
    },
    getKanjiImportance: (vocabulary, romaji, translation, string) => {
        let matchingScore = 0
        romaji?.forEach((word) => {
            if (romajiRegularization(word.toLowerCase())
                === romajiRegularization(string.toLowerCase())) matchingScore ++
        })
        translation?.forEach((word) => {
            if (searchRegularization(word.toLowerCase())
                === searchRegularization(string.toLowerCase())) matchingScore ++
        })
        /* vocabulary.forEach((word) => {
            if (word.translation.toLowerCase() === string.toLowerCase()) matchingScore ++
            if (word.romaji.toLowerCase() === string.toLowerCase()) matchingScore ++
        }) */
        return matchingScore
    },
    searchThroughWord: (romaji, translation, string) => {
        let includes = false
        translation?.forEach((word) => {
            if (searchRegularization(word.toLowerCase())
                .includes(searchRegularization(string.toLowerCase()))) includes = true
        })
        if (romajiRegularization(romaji.toLowerCase())
            .includes(romajiRegularization(string.toLowerCase()))) includes = true

        return includes
    },
    getWordImportance: (romaji, translation, variants, string) => {
        let matchingScore = 0
        if (romajiRegularization(romaji.toLowerCase())
            === romajiRegularization(string.toLowerCase())) matchingScore ++
        translation?.forEach((word) => {
            if (searchRegularization(word.toLowerCase())
                === searchRegularization(string.toLowerCase())) matchingScore ++
        })
        return matchingScore
    }
}