module.exports = (app) => {
    app.get('/', (req, res) => res.send(`
        :: Tetsudai API ::

        Available endpoints:
            - /kanjiList/:offset/:level/:grammar/:collection/:search?
            - /vocabularyList/:offset/:level/:grammar/:collection/:search?
            - /kanji/:id
            - /word/:id

    `))

    app.get('/kanjiList', (req, res) => res.send(`
        :: Kanji list request ::

        URL structure: /kanjiList/:offset/:level/:grammar/:collection/:search?

            :offset:
                - any number

            :level: 
                - 0: All levels
                - 1: JLPT N5
                - 2: JLPT N4
                - 3: JLPT N3
                - 4: JLPT N2
                - 5: JLPT N1
                - 6: Without JLPT level

            :grammar:
                - 0: All grammar classes
                - 1: Common noun
                - 2: Proper noun
                - 3: Verb
                - 4: Adjective
                - 5: Adverb
                - 6: Conjunction
                - 7: Demonstrative adjective
                - 8: Pronoun
                - 9: Particle
                - 10: Expression
                - 11: Copule
                - 12: Number
                - 13: Suffix

            :collection: 
                - 0: All collections
                - 1: 150 essential kanji
                - 2: Jukujikun
                - 3: Julien Fontanier Sensei
                
            :search:
                - any string [optional]

    `))

    app.get('/vocabularyList', (req, res) => res.send(`
        :: Vocabulary list request ::

        URL structure: /vocabularyList/:offset/:level/:grammar/:collection/:search?

        :offset:
            - any number

        :level: 
            - 0: All levels
            - 1: JLPT N5
            - 2: JLPT N4
            - 3: JLPT N3
            - 4: JLPT N2
            - 5: JLPT N1
            - 6: Without JLPT level

        :grammar:
            - 0: All grammar classes
            - 1: Common noun
            - 2: Proper noun
            - 3: Verb
            - 4: Adjective
            - 5: Adverb
            - 6: Conjunction
            - 7: Demonstrative adjective
            - 8: Pronoun
            - 9: Particle
            - 10: Expression
            - 11: Copule
            - 12: Number
            - 13: Suffix

        :collection: 
            - 0: All collections
            - 1: 150 essential kanji
            - 2: Jukujikun
            - 3: Julien Fontanier Sensei
            
        :search:
            - any string [optional]

    `))
}