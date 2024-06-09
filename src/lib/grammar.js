const verbConjugationStructure = (base, inflexions, exceptionBases) => {
    const masu = 'ます'
    const masen = 'ません'
    const nai = 'ない'

    return {
        nonPast: {
            affirmative: {
                neutral: {
                    main: exceptionBases?.nonPastAffNeutral ?? base,
                    ending: inflexions.okurigana,
                },
                polite: {
                    main: exceptionBases?.nonPastAffPolite ?? base,
                    ending: inflexions.politeInterm + masu,
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.nonPastNegNeutral ?? base,
                    ending: inflexions.connective + nai,
                },
                polite: {
                    main: exceptionBases?.nonPastNegPolite ?? base,
                    ending: inflexions.politeInterm + masen,
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
                    ending: inflexions.politeInterm + 'ました',
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.pastNegNeutral ?? base,
                    ending: inflexions.connective + 'なかった',
                },
                polite: {
                    main: exceptionBases?.pastNegPolite ?? base,
                    ending: inflexions.politeInterm + masen + 'でした',
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
        volitional: {
            affirmative: {
                neutral: {
                    main: exceptionBases?.volitionalNeutral ?? base,
                    ending: inflexions.volitional,
                },
                polite: {
                    main: exceptionBases?.volitionalPolite ?? base,
                    ending: inflexions.politeInterm + 'ましょう',
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
                    main: 'だ',
                    ending: '',
                },
                polite: {
                    main: 'で',
                    ending: 'す',
                }
            },
            negative: {
                neutral: {
                    main: 'では',
                    ending: 'ない',
                },
                polite: {
                    main: 'では',
                    ending: 'ありません',
                }
            }
        },
        past: {
            affirmative: {
                neutral: {
                    main: 'だ',
                    ending: 'った',
                },
                polite: {
                    main: 'で',
                    ending: 'した',
                }
            },
            negative: {
                neutral: {
                    main: 'では',
                    ending: 'なかった',
                },
                polite: {
                    main: 'では',
                    ending: 'ありませんでした',
                }
            }
        }
    }
}
const getVerbConjugation = (word) => {
    let base = word.completeWord.slice(0, -1);

    const info = word.verbPrecisions;

    if (info.type === 'ichidan') {
        return verbConjugationStructure(base, {
            okurigana: 'る',
            politeInterm: '',
            connective: '',
            past: 'た',
            teForm: 'て',
            volitional: 'よう',
        });
    }
    if (info.type === 'godan') {
        if (info.ending === 'u') {
            return verbConjugationStructure(base, {
                okurigana: 'う',
                politeInterm: 'い',
                connective: 'わ',
                past: 'った',
                teForm: 'って',
                volitional: 'おう',
            });
        }
        if (info.ending === 'ku') {
            return verbConjugationStructure(base, {
                okurigana: 'く',
                politeInterm: 'き',
                connective: 'か',
                past: 'いた',
                teForm: 'いて',
                volitional: 'こう',
            });
        }
        if (info.ending === 'gu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぐ',
                politeInterm: 'ぎ',
                connective: 'が',
                past: 'いだ',
                teForm: 'いで',
                volitional: 'ごう',
            });
        }
        if (info.ending === 'su') {
            return verbConjugationStructure(base, {
                okurigana: 'す',
                politeInterm: 'し',
                connective: 'さ',
                past: 'した',
                teForm: 'して',
                volitional: 'そう',
            });
        }
        if (info.ending === 'mu') {
            return verbConjugationStructure(base, {
                okurigana: 'む',
                politeInterm: 'み',
                connective: 'ま',
                past: 'んだ',
                teForm: 'んで',
                volitional: 'もう',
            });
        }
        if (info.ending === 'bu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぶ',
                politeInterm: 'び',
                connective: 'ば',
                past: 'んだ',
                teForm: 'んで',
                volitional: 'ぼう',
            });
        }
        if (info.ending === 'nu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぬ',
                politeInterm: 'に',
                connective: 'な',
                past: 'んだ',
                teForm: 'んで',
                volitional: 'のう',
            });
        }
        if (info.ending === 'ru') {
            return verbConjugationStructure(base, {
                okurigana: 'る',
                politeInterm: 'り',
                connective: 'ら',
                past: 'った',
                teForm: 'って',
                volitional: 'ろう',
            });
        }
        if (info.ending === 'tsu') {
            return verbConjugationStructure(base, {
                okurigana: 'つ',
                politeInterm: 'ち',
                connective: 'た',
                past: 'った',
                teForm: 'って',
                volitional: 'とう',
            });
        }
    }
    if (info.type === 'suru') {
        const noun = base.slice(0, -1);

        return verbConjugationStructure(base, {
            okurigana: 'る',
            politeInterm: '',
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
    if (info.type === 'kuru') {
        return verbConjugationStructure(base, {
            okurigana: 'る',
            politeInterm: '',
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
    if (info.type === 'iku') {
        return verbConjugationStructure(base, {
            okurigana: 'く',
            politeInterm: 'き',
            connective: 'か',
            past: 'った',
            teForm: 'って',
            volitional: 'こう',
        });
    }
    if (info.type === 'aru') {
        return verbConjugationStructure(base, {
            okurigana: 'る',
            politeInterm: 'り',
            connective: '',
            past: 'った',
            teForm: 'って',
            volitional: 'ろう',
        }, {
            nonPastNegNeutral: '',
            pastNegNeutral: '',
        });
    }
    if (info.type === 'desu') {
        return copuleConjugationStructure();
    }
}

const getVerbStem = (word) => {
    let base = word.completeWord.slice(0, -1);

    const info = word.verbPrecisions;

    if (info.type === 'ichidan') {
        return base;
    }
    if (info.type === 'godan') {
        if (info.ending === 'u') {
            return base + 'い';
        }
        if (info.ending === 'ku') {
            return base + 'き';
        }
        if (info.ending === 'gu') {
            return base + 'ぎ';
        }
        if (info.ending === 'su') {
            return base + 'し';
        }
        if (info.ending === 'mu') {
            return base + 'み';
        }
        if (info.ending === 'bu') {
            return base + 'び';
        }
        if (info.ending === 'nu') {
            return base + 'に';
        }
        if (info.ending === 'ru') {
            return base + 'り';
        }
        if (info.ending === 'tsu') {
            return base + 'ち';
        }
    }
    if (info.type === 'suru') {
        return 'し';
    }
    if (info.type === 'kuru') {
        return '来';
    }
    if (info.type === 'iku') {
        return '行き';
    }
    if (info.type === 'aru') {
        return 'あり';
    }
    if (info.type === 'desu') {
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
const getAdjectiveConjugation = (word) => {
    let base = word.completeWord;
    const info = word.adjectivePrecisions;

    if (info.type === 'na') {
        return naAdjectiveConjugationStructure(base);
    }
    if (info.type === 'i') {
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
    if (!foundTense && word.adjectivePrecisions?.type === "na") {
        foundTense = {
            tense: "nonPast",
            form: "neutral",
            sign: "affirmative"
        }
    }
    return foundTense
}

module.exports = {
    dispatchInflexion: (word) => {
        if (word.verbPrecisions) {
            return getVerbConjugation(word);
        }
        if (word.adjectivePrecisions) {
            return getAdjectiveConjugation(word);
        }
    },
    dispatchBaseWord: (word) => {
        if (word.verbPrecisions) {
            return getVerbStem(word);
        }
    },
    dispatchFunctionInSentence: (word, foundString, previousWord, nextWord) => {
        if (word.grammar) {
            let grammarFunction
            let tense
            if (word.grammar.length > 1) {
                grammarFunction = getUniqueFunction(word, foundString, previousWord, nextWord)
            }
            else grammarFunction = word.grammar[0]
            if (grammarFunction === "vb" || grammarFunction === "adj") {
                tense = getTense(word, foundString)
            }
    
            return {
                function: grammarFunction,
                tense
            }
        }
    }
}
