export const GlobalCommands = [
    {
        id: "lowercase",
        icon: "case-sensitive",
    }, {
        id: "uppercase",
        icon: "case-sensitive",
    }, {
        id: "capitalize-word",
        icon: "case-sensitive",
    }, {
        id: "capitalize-sentence",
        icon: "case-sensitive",
    }, {
        id: "title-case",
        icon: "case-sensitive",
    }, {
        id: "cycle-case",
        icon: "case-sensitive",
    }, {
        id: "decodeURI",
        icon: "link",
    }
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