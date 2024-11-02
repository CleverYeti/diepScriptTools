const profanityFilter = {
    swapList: [
        ["1", "i"],
        ["4", "a"],
        ["7", "t"],
        ["q", "g"],
        ["0", "o"],
        ["z", "s"],
        ["!", "i"],
        ["+", "t"],
        ["@", "a"],
        [" ", ""],
        [".", "*"],
    ],

    blockList: [
        "fag",
        "f*g",
        "bast",
        "bitc",
        "b*tc",
        "biatc",
        "blowjob",
        "cock",
        "c*ck",
        "clit",
        "suckr",
        "sucker",
        "s*ck",
        "cum",
        "c*m",
        "cunt",
        "c*nt",
        "dick",
        "d*ck",
        "dildo",
        "fuck",
        "fuc",
        "f*c",
        "f*k",
        "fuk",
        "hore",
        "hoar",
        "whore",
        "jerkof",
        "jizz",
        "tit",
        "t*t",
        "m*st",
        "masterba",
        "masturba",
        "masterba",
        "masturba",
        "nig",
        "ngg",
        "n*g",
        "niig",
        "orgasm",
        "peen",
        "penis",
        "p*n",
        "penus",
        "puss",
        "p*ss",
        "rectu",
        "semen",
        "sex",
        "s*x",
        "shit",
        "slut",
        "sl*t",
        "vagina",
        "vulva",
        // we cannot have ass since it will censor 455. a specific fix could be implemented"ass",
        "cawk",
        "c*ck",
        "ejac",
        "fatass",
        "cawk",
        "nazi",
        "nutsac",
        "scrot",
        "boob",
        "testic",
        "arse",
        "feces",
        "foreskin",
        "porn",
        "p*rn"
    ],
    checkedStrings: {},

    maxBufferLength: 1000,

    treatInput: function(str) {
        str = str.toLowerCase()
        for (let swap of this.swapList) {
            str = str.replaceAll(swap[0], swap[1])
        }
        return str
    },
    treatList: function() {
        for (let i = 0; i < this.list.length; i++) {
            this.list[i] = this.treatInput(this.list[i])
        }
    },
    filter: function(input) {
        if (this.checkedStrings[input] !== undefined) {
            return this.checkedStrings[input]
        }

        const keys = Object.keys(this.checkedStrings)
        if (keys.length > this.maxBufferLength) delete this.checkedStrings[keys[0]]

        const swapped = this.treatInput(input)
        for (let filterWord of this.blockList) {
            if (swapped.includes(filterWord)) {
                const result = Array(input.length).fill("*").join("")
                this.checkedStrings[input] = result
                return result
            }
        }
        this.checkedStrings[input] = input
        return input
    }
}
profanityFilter.treatList()