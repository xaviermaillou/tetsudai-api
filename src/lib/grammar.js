const masu = 'ます'
const masen = 'ません'
const nai = 'ない'
const desu = 'です'
const deshita = 'でした'
const katta = 'かった'
const de = 'で'
const da = 'だ'

const verbConjugationStructure = (base, inflexions, exceptionBases) => {
    return {
        nonPast: {
            affirmative: {
                neutral: {
                    main: exceptionBases?.nonPastAffNeutral ?? base,
                    ending: inflexions.okurigana,
                },
                polite: {
                    main: exceptionBases?.nonPastAffPolite ?? base,
                    ending: inflexions.stem + masu,
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.nonPastNegNeutral ?? base,
                    ending: inflexions.connective + nai,
                },
                polite: {
                    main: exceptionBases?.nonPastNegPolite ?? base,
                    ending: inflexions.stem + masen,
                }
            }
        },
        past: {
            affirmative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.past,
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.stem + 'ました',
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.pastNegNeutral ?? base,
                    ending: inflexions.connective + 'な' + katta,
                },
                polite: {
                    main: exceptionBases?.pastNegPolite ?? base,
                    ending: inflexions.stem + masen + deshita,
                }
            }
        },
        nonPastProgressive: {
            affirmative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.teForm + 'いる',
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.teForm + 'い' + masu,
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.teForm + 'い' + nai,
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.teForm + 'い' + masen,
                }
            }
        },
        pastProgressive: {
            affirmative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.teForm + 'いた',
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.teForm + 'い' + 'ました',
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.teForm + 'いな' + katta,
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.teForm + 'い' + masen + deshita,
                }
            }
        },
        nonPastDesiderative: {
            affirmative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.stem + 'たい',
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.stem + 'たい' + desu,
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.stem + 'たく' + nai,
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.stem + 'たく' + nai + desu,
                }
            }
        },
        pastDesiderative: {
            affirmative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.stem + 'た' + katta,
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.stem + 'た' + katta + desu,
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.stem + 'たくな' + katta,
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.stem + 'たくな' + katta + desu,
                }
            }
        },
        volitional: {
            affirmative: {
                neutral: {
                    main: exceptionBases?.volitionalNeutral ?? base,
                    ending: inflexions.volitional,
                },
                polite: {
                    main: exceptionBases?.volitionalPolite ?? base,
                    ending: inflexions.stem + 'ましょう',
                }
            }
        },
    }
}
const copuleConjugationStructure = () => {
    return {
        nonPast: {
            affirmative: {
                neutral: {
                    main: da,
                    ending: '',
                },
                polite: {
                    main: de,
                    ending: 'す',
                }
            },
            negative: {
                neutral: {
                    main: de + 'は',
                    ending: 'ない',
                },
                polite: {
                    main: de + 'は',
                    ending: 'ありません',
                }
            }
        },
        past: {
            affirmative: {
                neutral: {
                    main: da,
                    ending: 'った',
                },
                polite: {
                    main: de,
                    ending: 'した',
                }
            },
            negative: {
                neutral: {
                    main: de + 'は',
                    ending: 'なかった',
                },
                polite: {
                    main: de + 'は',
                    ending: 'ありませんでした',
                }
            }
        },
        nonPastDesiderative: verbConjugationStructure('な', {
            stem: 'り'
        }).nonPastDesiderative,
        pastDesiderative: verbConjugationStructure('な', {
            stem: 'り',
        }).pastDesiderative
    }
}
const getVerbConjugation = (word, precisions) => {
    let base = word.slice(0, -1);

    if (precisions.type === 'ichidan') {
        return verbConjugationStructure(base, {
            okurigana: 'る',
            stem: '',
            connective: '',
            past: 'た',
            teForm: 'て',
            volitional: 'よう',
        });
    }
    if (precisions.type === 'godan') {
        if (precisions.ending === 'u') {
            return verbConjugationStructure(base, {
                okurigana: 'う',
                stem: 'い',
                connective: 'わ',
                past: 'った',
                teForm: 'って',
                volitional: 'おう',
            });
        }
        if (precisions.ending === 'ku') {
            return verbConjugationStructure(base, {
                okurigana: 'く',
                stem: 'き',
                connective: 'か',
                past: 'いた',
                teForm: 'いて',
                volitional: 'こう',
            });
        }
        if (precisions.ending === 'gu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぐ',
                stem: 'ぎ',
                connective: 'が',
                past: 'いだ',
                teForm: 'いで',
                volitional: 'ごう',
            });
        }
        if (precisions.ending === 'su') {
            return verbConjugationStructure(base, {
                okurigana: 'す',
                stem: 'し',
                connective: 'さ',
                past: 'した',
                teForm: 'して',
                volitional: 'そう',
            });
        }
        if (precisions.ending === 'mu') {
            return verbConjugationStructure(base, {
                okurigana: 'む',
                stem: 'み',
                connective: 'ま',
                past: 'んだ',
                teForm: 'んで',
                volitional: 'もう',
            });
        }
        if (precisions.ending === 'bu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぶ',
                stem: 'び',
                connective: 'ば',
                past: 'んだ',
                teForm: 'んで',
                volitional: 'ぼう',
            });
        }
        if (precisions.ending === 'nu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぬ',
                stem: 'に',
                connective: 'な',
                past: 'んだ',
                teForm: 'んで',
                volitional: 'のう',
            });
        }
        if (precisions.ending === 'ru') {
            return verbConjugationStructure(base, {
                okurigana: 'る',
                stem: 'り',
                connective: 'ら',
                past: 'った',
                teForm: 'って',
                volitional: 'ろう',
            });
        }
        if (precisions.ending === 'tsu') {
            return verbConjugationStructure(base, {
                okurigana: 'つ',
                stem: 'ち',
                connective: 'た',
                past: 'った',
                teForm: 'って',
                volitional: 'とう',
            });
        }
    }
    if (precisions.type === 'suru') {
        const noun = base.slice(0, -1);

        return verbConjugationStructure(base, {
            okurigana: 'る',
            stem: '',
            connective: '',
            past: 'た',
            teForm: 'て',
            volitional: 'よう',
        }, {
            nonPastAffNeutral: noun + 'す',
            nonPastAffPolite: noun + 'し',
            nonPastNegNeutral: noun + 'し',
            nonPastNegPolite: noun + 'し',
            pastAffNeutral: noun + 'し',
            pastAffPolite: noun + 'し',
            pastNegNeutral: noun + 'し',
            pastNegPolite: noun + 'し',
            volitionalNeutral: noun + 'し',
            volitionalPolite: noun + 'し',
        });
    }
    if (precisions.type === 'kuru') {
        return verbConjugationStructure(base, {
            okurigana: 'る',
            stem: '',
            connective: '',
            past: 'た',
            teForm: 'て',
            volitional: 'よう',
        }, {
            nonPastAffNeutral: 'く',
            nonPastAffPolite: 'き',
            nonPastNegNeutral: 'こ',
            nonPastNegPolite: 'き',
            pastAffNeutral: 'き',
            pastAffPolite: 'き',
            pastNegNeutral: 'こ',
            pastNegPolite: 'き',
            volitionalNeutral: 'こ',
            volitionalPolite: 'き'
        });
    }
    if (precisions.type === 'iku') {
        return verbConjugationStructure(base, {
            okurigana: 'く',
            stem: 'き',
            connective: 'か',
            past: 'った',
            teForm: 'って',
            volitional: 'こう',
        });
    }
    if (precisions.type === 'aru') {
        return verbConjugationStructure(base, {
            okurigana: 'る',
            stem: 'り',
            connective: '',
            past: 'った',
            teForm: 'って',
            volitional: 'ろう',
        }, {
            nonPastNegNeutral: '',
            pastNegNeutral: '',
        });
    }
    if (precisions.type === 'desu') {
        return {
            ...verbConjugationStructure('で', {
                okurigana: '',
                stem: '',
                connective: '',
                past: '',
                teForm: '',
                volitional: '',
            }),
            ...copuleConjugationStructure()
        };
    }
}

const getVerbStem = (word, precisions) => {
    let base = word.slice(0, -1);

    if (precisions.type === 'ichidan') {
        return base;
    }
    if (precisions.type === 'godan') {
        if (precisions.ending === 'u') {
            return base + 'い';
        }
        if (precisions.ending === 'ku') {
            return base + 'き';
        }
        if (precisions.ending === 'gu') {
            return base + 'ぎ';
        }
        if (precisions.ending === 'su') {
            return base + 'し';
        }
        if (precisions.ending === 'mu') {
            return base + 'み';
        }
        if (precisions.ending === 'bu') {
            return base + 'び';
        }
        if (precisions.ending === 'nu') {
            return base + 'に';
        }
        if (precisions.ending === 'ru') {
            return base + 'り';
        }
        if (precisions.ending === 'tsu') {
            return base + 'ち';
        }
    }
    if (precisions.type === 'suru') {
        const noun = base.slice(0, -1);
        return noun + 'し';
    }
    if (precisions.type === 'kuru') {
        return '来';
    }
    if (precisions.type === 'iku') {
        return '行き';
    }
    if (precisions.type === 'aru') {
        return 'あり';
    }
    if (precisions.type === 'desu') {
        return;
    }
}

const getVerbTeForm = (word, precisions) => {
    let base = word.slice(0, -1);

    if (precisions.type === 'ichidan') {
        return base + 'て';
    }
    if (precisions.type === 'godan') {
        if (precisions.ending === 'u') {
            return base + 'って';
        }
        if (precisions.ending === 'ku') {
            return base + 'いて';
        }
        if (precisions.ending === 'gu') {
            return base + 'いで';
        }
        if (precisions.ending === 'su') {
            return base + 'して';
        }
        if (precisions.ending === 'mu') {
            return base + 'んで';
        }
        if (precisions.ending === 'bu') {
            return base + 'んで';
        }
        if (precisions.ending === 'nu') {
            return base + 'んで';
        }
        if (precisions.ending === 'ru') {
            return base + 'って';
        }
        if (precisions.ending === 'tsu') {
            return base + 'って';
        }
    }
    if (precisions.type === 'suru') {
        const noun = base.slice(0, -1);
        return noun + 'して';
    }
    if (precisions.type === 'kuru') {
        return '来て';
    }
    if (precisions.type === 'iku') {
        return '行って';
    }
    if (precisions.type === 'aru') {
        return 'あって';
    }
    if (precisions.type === 'desu') {
        return;
    }
}

const naAdjectiveConjugationStructure = (adjective) => {
    return {
        nonPast: {
            affirmative: {
                neutral: {
                    main: adjective,
                    ending: 'だ',
                },
                polite: {
                    main: adjective,
                    ending: 'です',
                }
            },
            negative: {
                neutral: {
                    main: adjective,
                    ending: 'ではない',
                },
                polite: {
                    main: adjective,
                    ending: 'ではないです',
                }
            }
        },
        past: {
            affirmative: {
                neutral: {
                    main: adjective,
                    ending: 'だった',
                },
                polite: {
                    main: adjective,
                    ending: 'でした',
                }
            },
            negative: {
                neutral: {
                    main: adjective,
                    ending: 'ではなかった',
                },
                polite: {
                    main: adjective ,
                    ending: 'ではなかったです',
                }
            }
        },
        adverb: {
            affirmative: {
                neutral: {
                    main: adjective,
                    ending: 'に',
                }
            }
        }
    }
}

const iAdjectiveConjugationStructure = (base) => {
    return {
        nonPast: {
            affirmative: {
                neutral: {
                    main: base,
                    ending: 'い',
                },
                polite: {
                    main: base,
                    ending: 'いです',
                }
            },
            negative: {
                neutral: {
                    main: base,
                    ending: 'くない',
                },
                polite: {
                    main: base,
                    ending: 'くないです',
                }
            } 
        },
        past: {
            affirmative: {
                neutral: {
                    main: base,
                    ending: 'かった',
                },
                polite: {
                    main: base,
                    ending: 'かったです',
                }
            },
            negative: {
                neutral: {
                    main: base,
                    ending: 'くなかった',
                },
                polite: {
                    main: base,
                    ending: 'くなかったです',
                }
            } 
        },
        adverb: {
            affirmative: {
                neutral: {
                    main: base,
                    ending: 'く',
                }
            },
            /* negative: {
                neutral: {
                    main: base,
                    ending: 'くなく',
                }
            } */
        }
    }
}
const getAdjectiveConjugation = (word, precisions) => {
    let base = word;

    if (precisions.type === 'na') {
        return naAdjectiveConjugationStructure(base);
    }
    if (precisions.type === 'i') {
        base = base.slice(0, -1);
        return iAdjectiveConjugationStructure(base);
    }
}

const getUniqueFunction = (word, foundString, previousWord, nextWord) => {
    switch (word.grammar.join("+")) {
        // Common noun + adjective
        case "nc+adj":
            if (nextWord?.grammar?.includes("vb")) return "adj"
            if (!nextWord?.id) return "adj"
            if (foundString.slice(-1) === "な") return "adj"
            if (nextWord?.word === "て" || nextWord?.word === "で") return "adj"
            return "nc"
        // Common noun + adjective + adverb
        case "nc+adj+adv":
            if (!nextWord?.id) return "adj"
            if (foundString.slice(-1) === "な") return "adj"
            if (nextWord?.word === "て" || nextWord?.word === "で") return "adj"
            return "nc"
        // Common noun + adverb
        case "nc+adv":
            if (nextWord?.grammar?.includes("vb")) return "adv"
            return "nc"
        // Common noun + adverb + suffix
        case "nc+adv+suf":
            if (nextWord?.grammar?.includes("vb")) return "adv"
            if (previousWord?.grammar?.includes("nc") || previousWord?.grammar?.includes("np")) return "suf"
            return "nc"
        // Common noun + adjective + pronoun
        case "nc+adj+pn":
            if (previousWord?.grammar?.includes("ptc") && previousWord?.word !== "と") return "nc"
            if (nextWord?.grammar?.includes("vb")) return "adj"
            if (!nextWord?.id) return "adj"
            if (foundString.slice(-1) === "な") return "adj"
            if (nextWord?.word === "て" || nextWord?.word === "で") return "adj"
            if (nextWord?.grammar?.includes("vb")) return "adv"
            return "pn"
        // Common noun + adjective + suffix
        case "nc+adj+suf":
            if (nextWord?.grammar?.includes("vb")) return "adj"
            if (!nextWord?.id) return "adj"
            if (foundString.slice(-1) === "な") return "adj"
            if (nextWord?.word === "て" || nextWord?.word === "で") return "adj"
            if (previousWord?.grammar?.includes("nc")) return "suf"
            return "nc"
        // Common noun + pronoun
        case "nc+pn":
            if (previousWord?.grammar?.includes("ptc") && previousWord?.word !== "と") return "nc"
            return "pn"
        // Common noun + suffix
        case "nc+suf":
            if (previousWord?.grammar?.includes("nc")) return 13
            return "nc"
        // Adjective + adverb
        case "adj+adv":
            if (!nextWord?.id) return "adj"
            if (foundString.slice(-1) === "な") return "adj"
            if (nextWord?.word === "て" || nextWord?.word === "で") return "adj"
            return "adv"
        // Adjective + expression
        case "adj+exp":
            return "adj"
        // Adverb + conjunction
        case "adv+cj":
            return "adv"
        // Adverb + expression
        case "adv+exp":
            return "adv"
        // Conjunction + particle
        case "cj+ptc":
            if (previousWord?.grammar?.includes("nc") && nextWord?.grammar?.includes("nc")) return "cj"
            return "ptc"
        // Conjunction + expression
        case "cj+exp":
            return "cj"
        default:
            console.log("- Multiple grammar functions not taken in account for: ", word.word, word.grammar)
    }
}
const getTense = (word, foundString) => {
    let foundTense
    Object.entries(word.inflexions).forEach(([tense, tenseValues]) => {
        Object.entries(tenseValues).forEach(([sign, signValues]) => {
            Object.entries(signValues).forEach(([form, formValues]) => {
                if ((formValues.main + formValues.ending) === foundString) {
                    foundTense = {
                        tense,
                        form,
                        sign
                    }
                }
            })
        })
    })
    if (!!!foundTense) {
        Object.entries(word.alternativeInflexions).forEach(([tense, tenseValues]) => {
            Object.entries(tenseValues).forEach(([sign, signValues]) => {
                Object.entries(signValues).forEach(([form, formValues]) => {
                    if ((formValues.main + formValues.ending) === foundString) {
                        foundTense = {
                            tense,
                            form,
                            sign
                        }
                    }
                })
            })
        })
    }
    if (!!!foundTense && word.adjectivePrecisions?.type === "na") {
        foundTense = {
            tense: "nonPast",
            form: "neutral",
            sign: "affirmative"
        }
    }
    return foundTense
}
const getForm = (word, foundString) => {
    let foundForm
    if (
        getVerbStem(word.primaryWord, word.verbPrecisions) === foundString ||
        getVerbStem(word.secondaryWord, word.verbPrecisions) === foundString
    ) foundForm = "stem"
    else if (
        getVerbTeForm(word.primaryWord, word.verbPrecisions) === foundString ||
        getVerbTeForm(word.secondaryWord, word.verbPrecisions) === foundString
    ) foundForm = "teForm"
    return foundForm
}

const grammarProbableCombinations = [
    "nc+ptc",
    "pre+nc",
    "nc+suf",
    "np+ptc",
    "dtm+nc",
    "pn+ptc",
    "ptc+vb",
    "ptc+adj",
    "cpl+ptc",
]
const grammarPriorityCombinations = [
    "pre+nc",
    "nb+suf",
]

module.exports = {
    dispatchInflexion: (word, verbPrecisions, adjectivePrecisions) => {
        if (verbPrecisions) {
            return getVerbConjugation(word, verbPrecisions);
        }
        else if (adjectivePrecisions) {
            return getAdjectiveConjugation(word, adjectivePrecisions);
        }
        else return null
    },
    dispatchBaseWord: (word, verbPrecisions) => {
        if (verbPrecisions) {
            return {
                stem: getVerbStem(word, verbPrecisions),
                teForm: getVerbTeForm(word, verbPrecisions)
            }
        }
    },
    dispatchFunctionInSentence: (word, foundString, previousWord, nextWord) => {
        if (word.grammar) {
            let grammarFunction
            let tense
            let form
            if (word.grammar.length > 1) {
                grammarFunction = getUniqueFunction(word, foundString, previousWord, nextWord)
            }
            else grammarFunction = word.grammar[0]
            if (grammarFunction === "vb" || grammarFunction === "adj") {
                tense = getTense(word, foundString)
                if (grammarFunction === "vb" ) {
                    form = getForm(word, foundString)
                }
            }
    
            return {
                function: grammarFunction,
                tense,
                form
            }
        }
    },
    disambiguateMultipleMatchings: (foundElements, sentenceElements, index) => {
        let overridingWords = []

        for (let j = 0; j < foundElements.length; j++) {
            let found = false
            let skip = false

            const primaryWordMatchings = foundElements.filter(foundElement => foundElement.matching === foundElement.primaryWord)
            if (primaryWordMatchings.length === 1) {
                overridingWords = [ ...primaryWordMatchings ]
                break
            }

            sentenceElements[index - 1]?.foundElements.forEach((previousElement) => {
                if (!!!previousElement.grammar) return
                grammarPriorityCombinations.forEach(combination => {
                    if (previousElement.grammar[0] + "+" + foundElements[j].grammar[0] === combination) {
                        overridingWords = [ foundElements[j] ]
                        skip = true
                        return
                    }
                })
                if (skip) return
                grammarProbableCombinations.forEach(combination => {
                    if (previousElement.grammar[0] + "+" + foundElements[j].grammar[0] === combination) {
                        overridingWords.push(foundElements[j])
                        found = true
                        return
                    }
                })
            })

            if (skip) break

            if (found) continue

            sentenceElements[index + 1]?.foundElements.forEach((nextElement) => {
                if (!!!nextElement.grammar) return
                grammarPriorityCombinations.forEach(combination => {
                    if (foundElements[j].grammar[0] + "+" + nextElement.grammar[0] === combination) {
                        overridingWords = [ foundElements[j] ]
                        skip = true
                        return
                    }
                })
                if (skip) return
                grammarProbableCombinations.forEach(combination => {
                    if (foundElements[j].grammar[0] + "+" + nextElement.grammar[0] === combination) {
                        overridingWords.push(foundElements[j])
                        return
                    }
                })
            })
            if (skip) break
        }

        return overridingWords
    }
}
