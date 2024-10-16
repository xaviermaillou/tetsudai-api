// Characters that are not words, thus should be sent as simple string without any word object attached
const sentenceExceptionCharacters = [
    "。",
    "、",
    "？",
    "「",
    "」",
    "　",
]

// Words whose main form should be prioritized over any other's alternative
const sentencePriorityFindings = [
    "は",
    "を",
    "が",
    "か",
    "に",
    "で",
    "と",
    "て",
    "何",
    "彼",
    "家"
]

// Words whose alternative form can be confused with many different words, we decide to skip them
const sentenceIgnoreFindings = {
    "した": "下"
}

// This is for the finding words phase (before building the sentence)
// When these alternatives are found, they override, in the next phase, more probable words whose main form is shorter
// (since we prioritize longer words in the finding parts algorithm)
// So we decide to assume this alternative form is not the one intended in the sentence
const sentenceIgnoreAlternatives = [
    "今日は",
    "彼の"
]

// Words whose composing smaller words are misleading
const wordsToIgnoreForComposingWords = [
    "日本"
]

const katakanaRegularization = (string) => {
    return string
        .split('アア').join('アー').split('エイ').join('エー').split('イイ').join('イー').split('オウ').join('オー').split('ウウ').join('ウー')
        .split('カア').join('カー').split('ケイ').join('ケー').split('キイ').join('キー').split('コウ').join('コー').split('クウ').join('クー')
        .split('ガア').join('ガー').split('ゲイ').join('ゲー').split('ギイ').join('ギー').split('ゴウ').join('ゴー').split('グウ').join('グー')
        .split('サア').join('サー').split('セイ').join('セー').split('シイ').join('シー').split('ソウ').join('ソー').split('スウ').join('スー')
        .split('ザア').join('ザー').split('ゼイ').join('ゼー').split('ジイ').join('ジー').split('ゾウ').join('ゾー').split('ズウ').join('ズー')
        .split('タア').join('ター').split('テイ').join('テー').split('チイ').join('チー').split('トウ').join('トー').split('ツウ').join('ツー')
        .split('ダア').join('ダー').split('デイ').join('デー').split('ヂイ').join('ヂー').split('ドウ').join('ドー').split('ヅウ').join('ヅー')
        .split('ナア').join('ナー').split('ネイ').join('ネー').split('ニイ').join('ニー').split('ノウ').join('ノー').split('ヌウ').join('ヌー')
        .split('ハア').join('ハー').split('ヘイ').join('ヘー').split('ヒイ').join('ヒー').split('ホウ').join('ホー').split('フウ').join('フー')
        .split('バア').join('バー').split('ベイ').join('ベー').split('ビイ').join('ビー').split('ボウ').join('ボー').split('ブウ').join('ブー')
        .split('パア').join('パー').split('ペイ').join('ペー').split('ピイ').join('ピー').split('ポウ').join('ポー').split('プウ').join('プー')
        .split('マア').join('マー').split('メイ').join('メー').split('ミイ').join('ミー').split('モウ').join('モー').split('ムウ').join('ムー')
        .split('ヤア').join('ヤー').split('ヨウ').join('ヨー').split('ユウ').join('ユー')
        .split('ラア').join('ラー').split('レイ').join('レー').split('リイ').join('リー').split('ロウ').join('ロー').split('ルウ').join('ルー')
        .split('ワア').join('ワー').split('ヲウ').join('ヲー')
        .split('ャア').join('ャー').split('ョウ').join('ョー').split('ュウ').join('ュー')
}
const numberRegularization = (string) => {
    return string
        .split('５０').join('五十').split('50').join('五十')
        .split('４９').join('四十九').split('49').join('四十九')
        .split('４８').join('四十八').split('48').join('四十八')
        .split('４７').join('四十七').split('47').join('四十七')
        .split('４６').join('四十六').split('46').join('四十六')
        .split('４５').join('四十五').split('45').join('四十五')
        .split('４４').join('四十四').split('44').join('四十四')
        .split('４３').join('四十三').split('43').join('四十三')
        .split('４２').join('四十二').split('42').join('四十二')
        .split('４１').join('四十一').split('41').join('四十一')
        .split('４０').join('四十').split('40').join('四十')
        .split('３９').join('三十九').split('39').join('三十九')
        .split('３８').join('三十八').split('38').join('三十八')
        .split('３７').join('三十七').split('37').join('三十七')
        .split('３６').join('三十六').split('36').join('三十六')
        .split('３５').join('三十五').split('35').join('三十五')
        .split('３４').join('三十四').split('34').join('三十四')
        .split('３３').join('三十三').split('33').join('三十三')
        .split('３２').join('三十二').split('32').join('三十二')
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
            translation: word.translation,
            romaji: word.romaji,
            grammar: word.grammar,
            verbPrecisions: word.verbPrecisions,
            adjectivePrecisions: word.adjectivePrecisions,
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
            "pre": 0,
            "suf": 0,
        }
        return importance[grammar]
    },
    sentenceExceptionCharacters,
    sentencePriorityFindings,
    sentenceIgnoreFindings,
    sentenceIgnoreAlternatives,
    wordsToIgnoreForComposingWords,
    katakanaRegularization,
    numberRegularization,
    shuffle: (array) => { 
        return array.sort(() => Math.random() - 0.5)
    },
    findByInflexion: (word, string, score) => {
        let includes
        const foundWords = []
        let matches = false

        const inflexionsArray = []
        Object.values(word.inflexions).map((tense) => {
            if (tense?.affirmative?.neutral) inflexionsArray.push(tense.affirmative.neutral.main + tense.affirmative.neutral.ending)
            if (tense?.affirmative?.polite) inflexionsArray.push(tense.affirmative.polite.main + tense.affirmative.polite.ending) 
            if (tense?.negative?.neutral) inflexionsArray.push(tense.negative.neutral.main + tense.negative.neutral.ending) 
            if (tense?.negative?.polite) inflexionsArray.push(tense.negative.polite.main + tense.negative.polite.ending)
        })
        Object.values(word.alternativeInflexions).map((tense) => {
            if (tense?.affirmative?.neutral) inflexionsArray.push(tense.affirmative.neutral.main + tense.affirmative.neutral.ending)
            if (tense?.affirmative?.polite) inflexionsArray.push(tense.affirmative.polite.main + tense.affirmative.polite.ending) 
            if (tense?.negative?.neutral) inflexionsArray.push(tense.negative.neutral.main + tense.negative.neutral.ending) 
            if (tense?.negative?.polite) inflexionsArray.push(tense.negative.polite.main + tense.negative.polite.ending)
        })
        inflexionsArray.forEach((inflexion) => {
            if (inflexion.includes(string) || string.includes(inflexion)) {
                includes = true
                if (string.includes(inflexion)) foundWords.push(inflexion)
            }
            if (inflexion === string) matches = true
        })

        return { includes, foundWords, score: (matches ? score : 0 )}
    },
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