const sentenceExceptionCharacters = [
    "。",
    "、",
    "？",
    "「",
    "」",
    " ",
]

const katakanaRegularization = (string) => {
    return string.split('アー').join('アア').split('エー').join('エイ').split('イー').join('イイ').split('オー').join('オウ').split('ウー').join('ウウ')
        .split('カー').join('カア').split('ケー').join('ケイ').split('キー').join('キイ').split('コー').join('コウ').split('クー').join('クウ')
        .split('ガー').join('ガア').split('ゲー').join('ゲイ').split('ギー').join('ギイ').split('ゴー').join('ゴウ').split('グー').join('グウ')
        .split('サー').join('サア').split('セー').join('セイ').split('シー').join('シイ').split('ソー').join('ソウ').split('スー').join('スウ')
        .split('ザー').join('ザア').split('ゼー').join('ゼイ').split('ジー').join('ジイ').split('ゾー').join('ゾウ').split('ズー').join('ズウ')
        .split('ター').join('タア').split('テー').join('テイ').split('チー').join('チイ').split('トー').join('トウ').split('ツー').join('ツウ')
        .split('ダー').join('ダア').split('デー').join('デイ').split('ヂー').join('ヂイ').split('ドー').join('ドウ').split('ヅー').join('ヅウ')
        .split('ナー').join('ナア').split('ネー').join('ネイ').split('ニー').join('ニイ').split('ノー').join('ノウ').split('ヌー').join('ヌウ')
        .split('ハー').join('ハア').split('ヘー').join('ヘイ').split('ヒー').join('ヒイ').split('ホー').join('ホウ').split('フー').join('フウ')
        .split('バー').join('バア').split('ベー').join('ベイ').split('ビー').join('ビイ').split('ボー').join('ボウ').split('ブー').join('ブウ')
        .split('パー').join('パア').split('ペー').join('ペイ').split('ピー').join('ピイ').split('ポー').join('ポウ').split('プー').join('プウ')
        .split('マー').join('マア').split('メー').join('メイ').split('ミー').join('ミイ').split('モー').join('モウ').split('ムー').join('ムウ')
        .split('ヤー').join('ヤア').split('ヨー').join('ヨウ').split('ユー').join('ユウ')
        .split('ラー').join('ラア').split('レー').join('レイ').split('リー').join('リイ').split('ロー').join('ロウ').split('ルー').join('ルウ')
        .split('ワー').join('ワア').split('ヲー').join('ヲウ')
        .split('ャー').join('ャア').split('ョー').join('ョウ').split('ュー').join('ュウ')
}
const numberRegularization = (string) => {
    return string
        .split('３１').join('三十一').split('31').join('三十一')
        .split('３０').join('三十').split('30').join('三十')
        .split('２９').join('二十九').split('29').join('二十九')
        .split('２８').join('二十八').split('28').join('二十八')
        .split('２７').join('二十七').split('27').join('二十七')
        .split('２６').join('二十六').split('26').join('二十六')
        .split('２５').join('二十五').split('25').join('二十五')
        .split('２４').join('二十四').split('24').join('二十四')
        .split('２３').join('二十三').split('23').join('二十三')
        .split('２２').join('二十二').split('22').join('二十二')
        .split('２１').join('二十一').split('21').join('二十一')
        .split('２０').join('二十').split('20').join('二十')
        .split('１９').join('十九').split('19').join('十九')
        .split('１８').join('十八').split('18').join('十八')
        .split('１７').join('十七').split('17').join('十七')
        .split('１６').join('十六').split('16').join('十六')
        .split('１５').join('十五').split('15').join('十五')
        .split('１４').join('十四').split('14').join('十四')
        .split('１３').join('十三').split('13').join('十三')
        .split('１２').join('十二').split('12').join('十二')
        .split('１１').join('十一').split('11').join('十一')
        .split('１０').join('十').split('10').join('十')
        .split('９').join('九').split('9').join('九')
        .split('８').join('八').split('8').join('八')
        .split('７').join('七').split('7').join('七')
        .split('６').join('六').split('6').join('六')
        .split('５').join('五').split('5').join('五')
        .split('４').join('四').split('4').join('四')
        .split('３').join('三').split('3').join('三')
        .split('２').join('二').split('2').join('二')
        .split('１').join('一').split('1').join('一')
}

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
    katakanaRegularization,
    numberRegularization,
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
            if (stringsArray.includes(katakanaRegularization(numberRegularization(stringToCompare)))) {
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
                searchCopy = searchCopy.slice(1)
                if (searchCopy === stringToCompare) break
                // Loop is reset
                else i = -1
            }
        }
        // If an element has been skipped, we redo the loop in reverse
        if (foundWords.join("").length < string.length) {
            for (let i = 0; i < alternativeSearchCopy.length; i++) {
                const stringToCompare = i === 0 ? alternativeSearchCopy : alternativeSearchCopy.slice(i)
                if (stringsArray.includes(katakanaRegularization(numberRegularization(stringToCompare)))) {
                    alternativeFoundWords.unshift(stringToCompare)
                    alternativeSearchCopy = alternativeSearchCopy.slice(0, i)
                    if (alternativeSearchCopy === stringToCompare) break
                    else i = -1
                }
                else if (i === (alternativeSearchCopy.length - 1)) {
                    if (sentenceExceptionCharacters.includes(stringToCompare)) {
                        alternativeFoundWords.unshift(stringToCompare)
                    }
                    alternativeSearchCopy = alternativeSearchCopy.slice(0, -1)
                    if (alternativeSearchCopy === stringToCompare) break
                    else i = -1
                }
            }
        }
        return foundWords.join("").length > alternativeFoundWords.join("").length ? foundWords : alternativeFoundWords
    }
}