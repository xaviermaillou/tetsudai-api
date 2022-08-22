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
                    ending: inflexions.politeInterm + 'ます',
                }
            },
            negative: {
                neutral: {
                    main: exceptionBases?.nonPastNegNeutral ?? base,
                    ending: inflexions.connective + 'ない',
                },
                polite: {
                    main: exceptionBases?.nonPastNegPolite ?? base,
                    ending: inflexions.politeInterm + 'ません',
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
                    ending: inflexions.politeInterm + 'ませんでした',
                }
            }
        }
    }
}
const copuleConjugationStructure = (adjective) => {
    return {
        nonPast: {
            affirmative: {
                neutral: {
                    main: (adjective ?? '') + 'だ',
                    ending: '',
                },
                polite: {
                    main: (adjective ?? '') + 'で',
                    ending: 'す',
                }
            },
            negative: {
                neutral: {
                    main: (adjective ?? '') + 'では',
                    ending: 'ない',
                },
                polite: {
                    main: (adjective ?? '') + 'では',
                    ending: 'ありません',
                }
            }
        },
        past: {
            affirmative: {
                neutral: {
                    main: (adjective ?? '') + 'だ',
                    ending: 'った',
                },
                polite: {
                    main: (adjective ?? '') + 'で',
                    ending: 'した',
                }
            },
            negative: {
                neutral: {
                    main: (adjective ?? '') + 'では',
                    ending: 'なかった',
                },
                polite: {
                    main: (adjective ?? '') + 'では',
                    ending: 'ありませんでした',
                }
            }
        }
    }
}
const getVerbConjugation = (word) => {
    let base = word.rareKanji ?
        (word.jukujikun || word.elements.map((element) => element.kana).join('')).slice(0, -1)
        :
        word.elements.map((element) => element.kanji || element.kana).join('').slice(0, -1);

    const info = word.verbPrecisions;

    if (info.type === 'ichidan') {
        return verbConjugationStructure(base, {
            okurigana: 'る',
            politeInterm: '',
            connective: '',
            past: 'た',
        });
    }
    if (info.type === 'godan') {
        if (info.ending === 'u') {
            return verbConjugationStructure(base, {
                okurigana: 'う',
                politeInterm: 'い',
                connective: 'わ',
                past: 'った',
            });
        }
        if (info.ending === 'ku') {
            return verbConjugationStructure(base, {
                okurigana: 'く',
                politeInterm: 'き',
                connective: 'か',
                past: 'いた',
            });
        }
        if (info.ending === 'gu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぐ',
                politeInterm: 'ぎ',
                connective: 'が',
                past: 'いだ',
            });
        }
        if (info.ending === 'su') {
            return verbConjugationStructure(base, {
                okurigana: 'す',
                politeInterm: 'し',
                connective: 'さ',
                past: 'した',
            });
        }
        if (info.ending === 'mu') {
            return verbConjugationStructure(base, {
                okurigana: 'む',
                politeInterm: 'み',
                connective: 'ま',
                past: 'んだ',
            });
        }
        if (info.ending === 'bu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぶ',
                politeInterm: 'び',
                connective: 'ば',
                past: 'んだ',
            });
        }
        if (info.ending === 'nu') {
            return verbConjugationStructure(base, {
                okurigana: 'ぬ',
                politeInterm: 'に',
                connective: 'な',
                past: 'んだ',
            });
        }
        if (info.ending === 'ru') {
            return verbConjugationStructure(base, {
                okurigana: 'る',
                politeInterm: 'り',
                connective: 'ら',
                past: 'った',
            });
        }
        if (info.ending === 'tsu') {
            return verbConjugationStructure(base, {
                okurigana: 'つ',
                politeInterm: 'ち',
                connective: 'た',
                past: 'った',
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
        }, {
            nonPastAffNeutral: noun + 'す',
            nonPastAffPolite: noun + 'し',
            nonPastNegNeutral: noun + 'し',
            nonPastNegPolite: noun + 'し',
            pastAffNeutral: noun + 'し',
            pastAffPolite: noun + 'し',
            pastNegNeutral: noun + 'し',
            pastNegPolite: noun + 'し'
        });
    }
    if (info.type === 'kuru') {
        return verbConjugationStructure(base, {
            okurigana: 'る',
            politeInterm: '',
            connective: '',
            past: 'た',
        }, {
            nonPastAffNeutral: 'く',
            nonPastAffPolite: 'き',
            nonPastNegNeutral: 'こ',
            nonPastNegPolite: 'き',
            pastAffNeutral: 'き',
            pastAffPolite: 'き',
            pastNegNeutral: 'こ',
            pastNegPolite: 'き'
        });
    }
    if (info.type === 'iku') {
        return verbConjugationStructure(base, {
            okurigana: 'く',
            politeInterm: 'き',
            connective: 'か',
            past: 'った',
        });
    }
    if (info.type === 'aru') {
        return verbConjugationStructure(base, {
            okurigana: 'る',
            politeInterm: 'り',
            connective: '',
            past: 'った',
        }, {
            nonPastNegNeutral: '',
            pastNegNeutral: '',
        });
    }
    if (info.type === 'desu') {
        return copuleConjugationStructure();
    }
}

const naAdjectiveConjugationStructure = (adjective) => {
    return {
        nonPast: {
            affirmative: {
                neutral: {
                    main: adjective,
                    ending: ' だ',
                },
                polite: {
                    main: adjective,
                    ending: ' です',
                }
            },
            negative: {
                neutral: {
                    main: adjective,
                    ending: ' ではない',
                },
                polite: {
                    main: adjective,
                    ending: ' ではないです',
                }
            }
        },
        past: {
            affirmative: {
                neutral: {
                    main: adjective,
                    ending: ' だった',
                },
                polite: {
                    main: adjective,
                    ending: ' でした',
                }
            },
            negative: {
                neutral: {
                    main: adjective,
                    ending: ' ではなかった',
                },
                polite: {
                    main: adjective ,
                    ending: ' ではなかったです',
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
    let base = word.rareKanji ?
        (word.jukujikun || word.elements.map((element) => element.kana).join(''))
        :
        word.elements.map((element) => element.kanji || element.kana).join('');
    const info = word.adjectivePrecisions;

    if (info.type === 'na') {
        return copuleConjugationStructure(base);
    }
    if (info.type === 'i') {
        base = base.slice(0, -1);
        return iAdjectiveConjugationStructure(base);
    }
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
}
