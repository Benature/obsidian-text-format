export const LetterCaseCommands = [
    {
        id: "lowercase",
    }, {
        id: "uppercase",
    }, {
        id: "capitalize-word",
    }, {
        id: "capitalize-sentence",
    }, {
        id: "titlecase",
    }, {
        id: "togglecase",
    },
]

export const CustomReplacementBuiltInCommands = [
    {
        id: "remove-trailing-spaces",
        data: [{
            search: String.raw`(\s*)(?=\n)|(\s*)$`,
            replace: "",
        }]
    },
    {
        id: "remove-blank-line",
        data: [{
            search: String.raw`\n\s*\n`,
            replace: String.raw`\n`,
        }]
    },
    {
        id: "add-line-break",
        data: [{
            search: String.raw`\n`,
            replace: String.raw`\n\n`,
        }]
    },
    {
        id: "split-lines-by-blank",
        data: [{
            search: String.raw` `,
            replace: String.raw`\n`,
        }]
    },
]