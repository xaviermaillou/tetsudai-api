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
                    ending: inflexions.connective + 'な' + katta,
                },
                polite: {
                    main: exceptionBases?.pastNegPolite ?? base,
                    ending: inflexions.politeInterm + masen + deshita,
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
                    ending: inflexions.politeInterm + 'たい',
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.politeInterm + 'たい' + desu,
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.politeInterm + 'たく' + nai,
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.politeInterm + 'たく' + nai + desu,
                }
            }
        },
        pastDesiderative: {
            affirmative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.politeInterm + 'た' + katta,
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.politeInterm + 'た' + katta + desu,
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.pastAffNeutral ?? base,
                    ending: inflexions.politeInterm + 'たくな' + katta,
                },
                polite: {
                    main: exceptionBases?.pastAffPolite ?? base,
                    ending: inflexions.politeInterm + 'たくな' + katta + desu,
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
            okurigana: 'る',
            politeInterm: 'り'
        }).nonPastDesiderative,
        pastDesiderative: verbConjugationStructure('な', {
            okurigana: 'る',
            politeInterm: 'り',
        }).pastDesiderative
    }
}
const getVerbConjugation = (word, precisions) => {
    let base = word.slice(0, -1);

    if (precisions.type === 'ichidan') {
        return verbConjugationStructure(base, {
            okurigana: 'る',
            politeInterm: '',
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
                politeInterm: 'い',
                connective: 'わ',
                past: 'った',
                teForm: 'って',
                volitional: 'おう',
            });
        }
        if (precisions.ending === 'ku') {
            return verbConjugationStructure(base, {
                okurigana: 'く',
                politeInterm: 'き',
                connective: 'か',
                past: 'いた',
                teForm: 'いて',
                volitional: 'こう',
            });
        }
        if (precisions.ending === 'gu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぐ',
                politeInterm: 'ぎ',
                connective: 'が',
                past: 'いだ',
                teForm: 'いで',
                volitional: 'ごう',
            });
        }
        if (precisions.ending === 'su') {
            return verbConjugationStructure(base, {
                okurigana: 'す',
                politeInterm: 'し',
                connective: 'さ',
                past: 'した',
                teForm: 'して',
                volitional: 'そう',
            });
        }
        if (precisions.ending === 'mu') {
            return verbConjugationStructure(base, {
                okurigana: 'む',
                politeInterm: 'み',
                connective: 'ま',
                past: 'んだ',
                teForm: 'んで',
                volitional: 'もう',
            });
        }
        if (precisions.ending === 'bu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぶ',
                politeInterm: 'び',
                connective: 'ば',
                past: 'んだ',
                teForm: 'んで',
                volitional: 'ぼう',
            });
        }
        if (precisions.ending === 'nu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぬ',
                politeInterm: 'に',
                connective: 'な',
                past: 'んだ',
                teForm: 'んで',
                volitional: 'のう',
            });
        }
        if (precisions.ending === 'ru') {
            return verbConjugationStructure(base, {
                okurigana: 'る',
                politeInterm: 'り',
                connective: 'ら',
                past: 'った',
                teForm: 'って',
                volitional: 'ろう',
            });
        }
        if (precisions.ending === 'tsu') {
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
    if (precisions.type === 'suru') {
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
    if (precisions.type === 'kuru') {
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
    if (precisions.type === 'iku') {
        return verbConjugationStructure(base, {
            okurigana: 'く',
            politeInterm: 'き',
            connective: 'か',
            past: 'った',
            teForm: 'って',
            volitional: 'こう',
        });
    }
    if (precisions.type === 'aru') {
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
    if (precisions.type === 'desu') {
        return {
            ...verbConjugationStructure('で', {
                okurigana: '',
                politeInterm: '',
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
        return 'し';
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
            return getVerbStem(word, verbPrecisions);
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
    },
    grammarProbableCombinations: [
        "nc+ptc",
        "pre+nc",
        "nc+suf",
        "np+ptc",
        "dtm+nc",
        "pn+ptc",
        "ptc+vb",
        "ptc+adj",
        "cpl+ptc",
    ],
    grammarPriorityCombinations: [
        "pre+nc",
        "nb+suf",
    ]
}
