import { Editor, MarkdownView, EditorPosition, App, requestUrl, TFile, Notice, EditorRangeOrCaret, EditorChange, EditorSelection, EditorSelectionOrCaret } from "obsidian";
import { FormatSettings, customReplaceSetting } from "./settings/types";
import { compile as compileTemplate, TemplateDelegate as Template } from 'handlebars';

import { Ligatures, GreekLetters } from "./presets";

export function stringFormat(str: string, values: Record<string, string>) {
    return str.replace(/\{(\w+)\}/g, (match, key) => values[key] === undefined ? match : values[key]);
}

const LC = "[\\w\\u0400-\\u04FFåäöÅÄÖ]"; // Latin and Cyrillic and Swedish characters

export function capitalizeWord(str: string): string {
    var rx = new RegExp(LC + "\\S*", "g");
    return str.replace(rx, function (t) {
        return t.charAt(0).toUpperCase() + t.substr(1);
    });
}

export function capitalizeSentence(s: string): string {
    let lcp = "(" + LC + "+)"; // LC plus
    var rx = new RegExp(
        String.raw`(?:^|[\n"“]|[\.\!\?\~#]\s+|\s*- \s*)` + lcp,
        "g"
    );
    return s.replace(rx, function (t0, t) {
        if (/^(ve|t|m|d|ll|s|re)$/.test(t)) {
            return t0;
        } else {
            return t0.replace(t, t.charAt(0).toUpperCase() + t.substr(1));
        }
    });
}

export function headingLevel(s: string, upper: boolean = true, minLevel: number, isMultiLine?: boolean): { text: string, offset: number } {
    let ignorePlain = minLevel > 0;
    let offset = 0;
    if (upper) {
        let prefix = `#`;
        if (!/^#+\s/.test(s)) { // plain text (not a heading)
            if (isMultiLine) { return { text: s, offset: offset }; }
            prefix = `# `;
        }
        s = prefix + s;
        offset = prefix.length;
    } else { //: LOWER
        if (/^# /.test(s)) { //: heading level 1
            if (ignorePlain) {
                console.log("ignore plain text")
                return { text: s, offset: offset };
            }
            s = s.slice(2);
            offset = -2;
        } else if (/^#+ /.test(s)) {
            s = s.slice(1);
            offset = -1;
        }
    }
    return { text: s, offset: offset };
}


export function ankiSelection(str: string): string {
    let sections = str.split(/\r?\n/);
    var seclen = sections.length;
    let returned = "";

    if (sections[0] == "") {
        sections.shift();
        returned += "\n";
    }

    if (seclen > 1) {
        returned += "START\nCloze\n";
        let i = 1;
        let gap = 0;
        sections.forEach(function (entry) {
            if (entry != "" && gap > 0) {
                returned += "\nBack Extra:\nTags:\nEND\n";
                for (let n = 0; n < gap; n++) {
                    returned += "\n";
                }
                returned += "START\nCloze\n";
                gap = 0;
                i = 1;
            }

            if (entry != "") {
                returned += "{{c" + i + "::" + entry + "}} ";
                i++;
            } else {
                gap++;
            }
        });
        returned += "\nBack Extra:\nTags:\nEND";
        for (let n = 0; n < gap; n++) {
            returned += "\n";
        }
        return returned;
    } else {
        return str;
    }
}

export function removeAllSpaces(s: string): string {
    return s.replace(/(?:[^\)\]\:#\-]) +| +$/g, (t) => t.replace(/ +/g, ""));
}

export function zoteroNote(
    text: string,
    regexp: string,
    template: string
): string {
    let template_regexp = new RegExp(regexp);
    let result = template_regexp.exec(text);

    if (result) {
        let z = result.groups;
        let text = result.groups.text.replace(/\\\[\d+\\\]/g, (t) =>
            t.replace("\\[", "[").replace("\\]", "]")
        );
        // console.log(template);
        // @ts-ignore
        return template.format({
            text: text,
            item: z.item,
            pdf_url: z.pdf_url,
        });
    } else {
        return text;
    }
}

export function table2bullet(content: string, withHeader: boolean = false): string {
    let header_str = "";
    let output = "";
    // remove header from `content` but record the header string
    content = content.replace(/[\S\s]+\n[:\-\| ]+\|\n/g, (t) => {
        header_str = t
            // .match(/^[\S ]+/)[0]
            .replace(/ *\| *$|^ *\| */g, "")
            .replace(/ *\| */g, "|");
        return "";
    });
    let headers = header_str.split("|");
    for (let i = 0; i < headers.length; i++) {
        headers[i] = withHeader ? `${headers[i]}: ` : "";
    }
    content.split("\n").forEach((line) => {
        if (line.trim().startsWith('|')) {
            let items = line.replace(/\| *$|^ *\|/g, "").split("|");
            output += `- ${items[0].trim()}\n`;
            for (let i = 1; i < items.length; i++) {
                output += `    - ${headers[i]}${items[i].trim()}\n`;
            }
        }        else {
            output += line + "\n"
        }
    });

    return output;
}

export function array2markdown(content: string): string {
    let volume = content.match(/\{([clr\|]+)\}/)[1].match(/[clr]/g).length;

    // remove `\test{}`
    content = content
        .replace(/\$|\n/g, ``)
        .replace(/\\text *\{.*?\}/g, (t) => {
            return t.match(/\{((.*?))\}/g)[0].replace(/^ +| +$|[\{\}]/g, ``)
        }
        );
    // return content

    // convert array to single line
    content = content.replace(
        /\\begin\{array\}\{[clr]\}.*?\\end\{array\}/g,
        (t) => {
            // console.log(t)
            return t
                .replace(/\\{1,2}begin\{array\}\{[clr]\}/g, "")
                .replace("\\end{array}", "")
                .replace(/\\\\ */g, "")
        }
    );

    // add `\n`
    content = content.replace(/\\\\ ?\\hline|\\\\ */g, (t) => t + `\n`);

    // convert to table
    let markdown = (
        "|" +
        content
            .replace(/\\begin\{array\}\{[clr\|]+\}|\\end\{array\}|\\hline/g, "")
            .replace(/&/g, "|")
            .replace(/\n[ ]*$/, "")
            .replace(/\\\\[ ]*?\n/g, "|\n|")
            .replace("\\\\", "|")
    ).replace("\n", "\n" + "|:-:".repeat(volume) + "|\n");

    let beautify_markdown = markdown
        .replace(/\[[\d,]+?\]/g, "")
        .replace(/\\[\w\{\}\d]+/g, (t) => `$${t}$`);

    return beautify_markdown;
}

export function toTitleCase(text: string, settings: FormatSettings | null = null): string {
    // reference: https://github.com/gouch/to-title-case
    var properNouns = RegExp(`^(` + settings?.ProperNoun.split(",").map((w) => w.trim()).join("|") + `)$`);
    var smallWords =
        /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
    var alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/;
    var wordSeparators = /([\s\:\–\—\-\(\)])/;

    return text.split(wordSeparators)
        .map(function (current: string, index: number, array: string[]): string {

            if (settings && current.search(properNouns) > -1) { /* Check for proper nouns */
                return current;
            } else {
                if (settings && settings.LowercaseFirst) {
                    current = current.toLowerCase();
                }
            }

            if (/* Check for small words */
                current.search(smallWords) > -1 &&
                /* Skip first and last word */
                index !== 0 &&
                index !== array.length - 1 &&
                /* Ignore title end and subtitle start */
                array[index - 3] !== ":" &&
                array[index + 1] !== ":" &&
                /* Ignore small words that start a hyphenated phrase */
                (array[index + 1] !== "-" ||
                    (array[index - 1] === "-" && array[index + 1] === "-"))
            ) {
                return current.toLowerCase();
            }

            /* Ignore intentional capitalization */
            if (current.substr(1).search(/[A-Z]|\../) > -1) {
                return current;
            }

            /* Ignore URLs */
            if (array[index + 1] === ":" && array[index + 2] !== "") {
                return current;
            }

            /* Capitalize the first letter */
            return current.replace(alphanumericPattern, function (match) {
                return match.toUpperCase();
            });
        })
        .join("");
};

String.prototype.format = function (args: any) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof args == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};

export function textWrapper(selectedText: string, context: any): { editorChange: EditorChange, selectedText: string, resetSelectionOffset: { anchor: number, head: number } } {
    const editor: Editor = context.editor;
    const prefix_setting: string = context.prefix;
    const suffix_setting: string = context.suffix;
    const adjustRange: EditorRangeOrCaret = context.adjustRange;
    // let resetSelection;
    let resetSelectionOffset;
    let editorChange: EditorChange;

    let meta: Record<string, any> = {};
    const metaProperties = context.view.metadataEditor?.properties;
    if (metaProperties) {
        for (const m of metaProperties) { meta[m.key] = m.value; }
    }

    let prefix_template = compileTemplate(prefix_setting.replace(/\\n/g, "\n"), { noEscape: true })
    let suffix_template = compileTemplate(suffix_setting.replace(/\\n/g, "\n"), { noEscape: true })

    const prefix = prefix_template(meta);
    const suffix = suffix_template(meta);
    const PL = prefix.length; // Prefix Length
    const SL = suffix.length; // Suffix Length


    function Cursor(offset: number): EditorPosition {
        const last_cursor = { line: editor.lastLine(), ch: editor.getLine(editor.lastLine()).length }
        const last_offset = editor.posToOffset(last_cursor);
        if (offset > last_offset) {
            return last_cursor;
        }
        offset = offset < 0 ? 0 : offset;
        return editor.offsetToPos(offset);
    }

    const fos = editor.posToOffset(adjustRange.from); // from offset
    const tos = editor.posToOffset(adjustRange.to); // to offset
    const len = selectedText.length;

    const outPrefix = editor.getRange(Cursor(fos - PL), Cursor(tos - len));
    const outSuffix = editor.getRange(Cursor(fos + len), Cursor(tos + SL));
    const inPrefix = editor.getRange(Cursor(fos), Cursor(fos + PL));
    const inSuffix = editor.getRange(Cursor(tos - SL), Cursor(tos));

    if (outPrefix === prefix && outSuffix === suffix) {
        //: selection outside match prefix and suffix => undo underline (inside selection)
        editorChange = { text: selectedText, from: Cursor(fos - PL), to: Cursor(tos + SL) };
        // resetSelection = { anchor: Cursor(fos - PL), head: Cursor(tos - PL) };
        resetSelectionOffset = { anchor: fos - PL, head: tos - PL };
        selectedText = prefix + selectedText + suffix;
    } else if (inPrefix === prefix && inSuffix === suffix) {
        //: selection inside match prefix and suffix => undo underline (outside selection)
        editorChange = { text: editor.getRange(Cursor(fos + PL), Cursor(tos - SL)), ...adjustRange };
        // resetSelection = { anchor: Cursor(fos), head: Cursor(tos - PL - SL) }
        resetSelectionOffset = { anchor: fos, head: tos - PL - SL }
    } else {
        //: Add prefix and suffix to selection
        editorChange = { text: prefix + selectedText + suffix, ...adjustRange };
        // resetSelection = { anchor: editor.offsetToPos(fos + PL), head: editor.offsetToPos(tos + PL) }
        resetSelectionOffset = { anchor: fos + PL, head: tos + PL }
    }
    return {
        editorChange: editorChange,
        selectedText: selectedText,
        // resetSelection: resetSelection,
        resetSelectionOffset: resetSelectionOffset,
    };
}

export function replaceLigature(s: string): string {
    Object.entries(Ligatures).forEach(([key, value]) => {
        var rx = new RegExp(key, "g");
        s = s.replace(rx, value);
    });
    return s;
}

/**
 * @param [text] The text to sort
 * @param [context] The context of the sort, including the editor and the settings
 * @param [fromOffset=0] - the offset of the first line of the text to sort
*/
export function sortTodo(text: string, context: any, fromLine: number | null = null): string {
    const lines = text.split("\n");
    // console.log("lines", lines)


    let prefix_text_index = -1,
        suffix_text_index = -1;
    let todos: { [key: string]: any[] } = {};
    let todo_detected = false, sort_prefix = false;
    let indent = 0;
    let last_flag: string, // flag of last line that count in as a new todo of level `indent`
        flag: string;
    for (const [i, line] of lines.entries()) {
        let flags = /- \[([ \w])\] /g.exec(line);
        // console.log(i, flags, line);
        if (flags) { // it is a todo line
            let head = line.match(/^[ \t]*/g)[0];
            if (!todo_detected) {
                // first time to detect todo checkbox
                indent = head.length;
                todo_detected = true;
            } else {
                if (head.length < indent) {
                    // the level of this line is higher than before,
                    // reset the index and consider above lines as prefix text
                    prefix_text_index = i - 1;
                    indent = head.length;
                    todos = {}; // reset
                    sort_prefix = true;
                }
            }

            if (head.length > indent) {
                let last_idx = todos[last_flag].length - 1;
                todos[last_flag][last_idx] += "\n" + line;
            } else {
                flag = flags[1];
                if (!(flag in todos)) {
                    todos[flag] = [];
                }
                todos[flag].push(line);
                last_flag = flag;
            }
        } else {
            // console.log("else", flags, todo_detected, line)
            if (todo_detected) {
                suffix_text_index = i;
                break;
            } else {
                prefix_text_index = i;
            }
        }
    }
    // console.log("todos", todos)
    // console.log("prefix_text_line", prefix_text_index, "suffix_text_line", suffix_text_index)
    const todoBlockRangeLine = {
        from: prefix_text_index != -1 ? fromLine + prefix_text_index : fromLine,
        to: suffix_text_index != -1 ? fromLine + suffix_text_index : fromLine + lines.length
    }
    // console.log(context.originRange.from.line, context.originRange.to.line);//, fromLine, fromLine + prefix_text_index, fromLine + suffix_text_index)
    // console.log(todoBlockRangeLine)
    let body: string;
    if (fromLine === null
        || (
            (context.originRange.from.line >= todoBlockRangeLine.from && context.originRange.from.line <= todoBlockRangeLine.to)
            || (context.originRange.from.line <= todoBlockRangeLine.from && context.originRange.to.line >= todoBlockRangeLine.to)
            || (context.originRange.to.line >= todoBlockRangeLine.from && context.originRange.to.line <= todoBlockRangeLine.to)
        )) {

        body = "";
        for (const [i, flag] of Object.keys(todos).sort().entries()) {
            todos[flag].forEach((line, j) => {
                // console.log("body line", line)
                if (line.match(/\n/g)) {
                    let sub_lines = line.split("\n");
                    line = sub_lines[0] + "\n" + sortTodo(sub_lines.slice(1, sub_lines.length).join("\n"), context, null);
                }
                body += line + "\n";
            })
        }
        body = body.slice(0, body.length - 1); // remove the last "\n"

    } else {
        // console.log("else: Do not sort")
        // body = lines.slice(todoBlockRangeLine.from, todoBlockRangeLine.to).join("\n");
        // body = lines.slice(prefix_text_line + 1, suffix_text_line + 1).join("\n");
        body = lines.slice(prefix_text_index === -1 ? 0 : prefix_text_index + 1,
            suffix_text_index === -1 ? lines.length : suffix_text_index).join("\n");
        // return text;
    }
    // return text;
    // console.log("input text")
    // console.log(text)
    // console.log("body", body)

    let prefix_text = prefix_text_index === -1 ? null : lines.slice(0, prefix_text_index + 1).join('\n');
    // prefix_text = lines.slice(0, prefix_text_line + 1).join('\n');
    // let suffix_text = suffix_text_index === -1 ? null : (
    //     suffix_text_index + 1 == lines.length ? null : lines.slice(suffix_text_index + 1, lines.length).join('\n'));
    // console.log("suffix_text", suffix_text_index + 1 == lines.length)
    if (sort_prefix) {
        prefix_text = sortTodo(prefix_text, context, fromLine);
    }
    let suffix_text = suffix_text_index === -1 ? null : lines.slice(suffix_text_index, lines.length + 1).join("\n");
    if (!(suffix_text_index == -1 || (suffix_text_index + 1 == lines.length))) {
        // suffix_text = lines.slice(suffix_text_index + 1, lines.length + 1).join("\n");
        suffix_text = sortTodo(suffix_text, context, suffix_text_index == -1 ? null : fromLine + suffix_text_index);
    }
    let whole = [prefix_text, body, suffix_text];
    // console.log(prefix_text_index, suffix_text_index)
    // console.log("text", text)
    // console.log("whole", whole);
    whole = whole.filter(item => item != null) // remove empty lines
    return whole.join('\n');
}


export async function requestAPI(s: string, file: TFile, url: string): Promise<string> {
    try {
        const data = {
            text: s,
            path: file.path,
        }

        const response = await requestUrl({
            url: url,
            method: "POST",
            contentType: "application/json",
            body: JSON.stringify(data),
        })

        const res = response.json;
        if (res.notification) {
            new Notice(res.notification);
        }

        if (res.text) {
            return res.text;
        } else {
            return s;
        }
    }
    catch (e) {
        new Notice(`Fail to request API.\n${e}`);
        return s;
    }
}


export function slugify(text: string, maxLength: number = 76): string {
    // Convert to Lowercase
    text = text.toLowerCase();
    // Remove Special Characters, preserve Latin and Cyrillic and Swedish characters
    text = text.replace(/[^\w\s\u0400-\u04FFåäöÅÄÖ]|_/g, "").replace(/\s+/g, " ").trim();
    // Replace Spaces with Dashes
    text = text.replace(/\s+/g, "-");
    // Remove Accents and Diacritics
    text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Handle Multiple Dashes
    text = text.replace(/-{2,}/g, "-");
    // Handle Numerals
    if (/^\d+$/.test(text)) {
        // If the slug is numeric only, add a suffix to make it unique and descriptive
        text = `item-${text}`;
    }

    // Truncate Length if required
    if (text.length > maxLength) {
        text = text.substr(0, maxLength);
        // Handle case where the last character is a hyphen
        if (text.endsWith("-")) {
            text = text.substr(0, text.lastIndexOf("-"));
        }
    }

    // Handle Hyphens and Dashes
    text = text.replace(/^-+|-+$/g, "");
    return text;
}

export function snakify(text: string): string {
    text = text.toLowerCase();
    text = text.replace(/\s+/g, "_");
    return text;
}

export function camelCase(text: string, lowerFirst = false): string {
    text = toTitleCase(text.toLowerCase());
    text = text.replace(/\s+/g, "");
    if (lowerFirst) {
        text = text.charAt(0).toLowerCase() + text.slice(1);
    }
    return text;
}

export function extraDoubleSpaces(editor: Editor, view: MarkdownView): void {
    if (!view) {
        return;
    }
    let content = editor.getValue();
    content = content.replace(
        /^(?:---\n[\s\S]*?\n---\n|)([\s\S]+)$/g, // exclude meta table
        (whole_content: string, body: string) => {
            return whole_content.replace(body, () => {
                return body.replace(/(?:\n)(.*[^-\n]+.*)(?=\n)/g,
                    (t0, t) => t0.replace(t, `${t.replace(/ +$/g, '')}  `)
                )
            });
        }
    );
    editor.setValue(content);
}

export function customReplace(text: string, s: customReplaceSetting): string {
    s.data.forEach(data => {
        const re = new RegExp(data.search, "g");
        text = text.replace(re, JSON.parse(`"${data.replace}"`))
    })
    return text;
}

export function convertLatex(editor: Editor, selectedText: string): string {
    //: If selectedText is surrounded by `$`, convert unicode Greek letters to latex commands
    if (editor) {
        const fos = editor.posToOffset(editor.getCursor("from")); // from offset
        const tos = editor.posToOffset(editor.getCursor("to")); // to offset
        const beforeText = editor.getRange(editor.offsetToPos(fos - 1), editor.offsetToPos(fos));
        const afterText = editor.getRange(editor.offsetToPos(tos), editor.offsetToPos(tos + 1));
        if (beforeText === "$" && afterText === "$") {
            let result = "";
            let lastGreek = false;
            for (let i = 0; i < selectedText.length; i++) {
                let char = GreekLetters[selectedText[i]];
                if (char) {
                    result += char;
                    lastGreek = true;
                } else {
                    if (lastGreek && !/\d/.test(selectedText[i])) {
                        result += " ";
                    }
                    result += selectedText[i];
                    lastGreek = false;
                }
            }
            return result.replace(/\s*$/g, "");
        }
    }

    function G(str: string): string {
        return GreekLetters[str] || str;
    }
    // const reGreek = /[\u03B1-\u03C9\u0391-\u03A9]/g; 

    //: Or, find math text and surround it with `$`
    const pre = String.raw`([\s：（）。，、；—\(\)]|^)`;
    const suf = String.raw`(?=[\s\,\:\.\?\!，。、（）；—\(\)]|$)`;

    const patternChar2 = String.raw`([\u03B1-\u03C9\u0391-\u03A9a-zA-Z])([\u03B1-\u03C9\u0391-\u03A9a-zA-Z0-9])`;

    let replacedText = selectedText
        // single character
        .replace(
            RegExp(pre + String.raw`([a-zA-Z\u03B1-\u03C9\u0391-\u03A9])` + suf, "g"),
            (t, pre, t1) => {
                if (/[aA]/.test(t1)) { return t; }
                return pre + `$${G(t1)}$`;
            })
        // two characters
        .replace(
            RegExp(pre + patternChar2 + suf, "g"),
            (t, pre, t1, t2) => {
                // ignore cases
                if (/is|or|as|to|am|an|at|by|do|go|ha|he|hi|ho|if|in|it|my|no|of|on|so|up|us|we|be/g.test(t1 + t2)) { return t; }
                return pre + `$${G(t1)}_${G(t2)}$`;
            })
        .replace(
            RegExp(pre + String.raw`([a-z\u03B1-\u03C9\u0391-\u03A9])([\*])` + suf, "g"),
            (t, pre, t1, t2) => {
                return pre + `$${t1}^${t2}$`;
            })
        // calculator
        .replace(
            RegExp(pre + String.raw`([\w\u03B1-\u03C9\u0391-\u03A9]{1,3}[\+\-\*\/<>=][\w\u03B1-\u03C9\u0391-\u03A9]{1,3})` + suf, "g"),
            (t, pre, t1) => {
                // let content = t1.replace(/([a-z])([a-zA-Z0-9])/g, `$1_$2`)
                let content = t1.replace(RegExp(patternChar2, "g"),
                    (t: string, t1: string, t2: string) => `${G(t1)}_${G(t2)}`)
                return pre + `$${content}$`
            })
        ;
    return replacedText;
}