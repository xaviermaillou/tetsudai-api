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
    }
}
