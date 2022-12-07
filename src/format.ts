import { MarkdownView, EditorPosition, App } from "obsidian";

const LC = "[\\w\\u0400-\\u04FF]"; // Latin and Cyrillic

export function capitalizeWord(str: string): string {
    var rx = new RegExp(LC + "\\S*", "g");
    return str.replace(rx, function (t) {
        return t.charAt(0).toUpperCase() + t.substr(1);
    });
}

export function capitalizeSentence(s: string): string {
    let lcp = "(" + LC + "+)"; // LC plus
    var rx = new RegExp(
        String.raw`(?:^|[\n"“]|[\.\!\?\~]\s+|\s*- \s*)` + lcp,
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
        console.log(template);
        // @ts-ignore
        return template.format({
            text: text,
            item: z.item,
            pdf_url: z.pdf_url,
        });
    } else {
        return ``;
    }
}

export function table2bullet(content: string, header: boolean = false): string {
    let header_str = "";
    let output = "";
    content = content.replace(/[\S ]+\n[:\-\| ]+[:\-]+\|\n/g, (t) => {
        header_str = t
            .match(/^[\S ]+/)[0]
            .replace(/ *\| *$|^ *\| */g, "")
            .replace(/ *\| */g, "|");
        return "";
    });
    let headers = header_str.split("|");
    for (let i = 0; i < headers.length; i++) {
        headers[i] = header ? `${headers[i]}: ` : "";
    }
    content.split("\n").forEach((line) => {
        let items = line.replace(/\| *$|^ *\|/g, "").split("|");
        output += `- ${items[0].trim()}\n`;
        for (let i = 1; i < items.length; i++) {
            output += `    - ${headers[i]}${items[i].trim()}\n`;
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
            console.log(t)
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

/* To Title Case © 2018 David Gouch | https://github.com/gouch/to-title-case */
// eslint-disable-next-line no-extend-native
// @ts-ignore
String.prototype.toTitleCase = function () {
    "use strict";
    var smallWords =
        /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
    var alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/;
    var wordSeparators = /([ :–—-])/;

    return this.split(wordSeparators)
        .map(function (current: string, index: number, array: string) {
            if (
                /* Check for small words */
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

export function textWrapper(prefix: string, suffix: string, app: App): void {
    prefix = prefix.replace(/\\n/g, "\n");
    suffix = suffix.replace(/\\n/g, "\n");
    const PL = prefix.length; // Prefix Length
    const SL = suffix.length; // Suffix Length

    let markdownView = app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
        return;
    }
    let editor = markdownView.editor;

    let selectedText = editor.somethingSelected() ? editor.getSelection() : "";

    let last_cursor = editor.getCursor(); // the cursor that at the last position of doc
    last_cursor.line = editor.lastLine();
    last_cursor.ch = editor.getLine(last_cursor.line).length;
    const last_offset = editor.posToOffset(last_cursor);

    function Cursor(offset: number): EditorPosition {
        if (offset > last_offset) {
            return last_cursor;
        }
        offset = offset < 0 ? 0 : offset;
        return editor.offsetToPos(offset);
    }

    /* Detect whether the selected text is packed by <u></u>.
         If true, unpack it, else pack with <u></u>. */

    const fos = editor.posToOffset(editor.getCursor("from")); // from offset
    const tos = editor.posToOffset(editor.getCursor("to")); // to offset
    const len = selectedText.length;

    var beforeText = editor.getRange(Cursor(fos - PL), Cursor(tos - len));
    var afterText = editor.getRange(Cursor(fos + len), Cursor(tos + SL));
    var startText = editor.getRange(Cursor(fos), Cursor(fos + PL));
    var endText = editor.getRange(Cursor(tos - SL), Cursor(tos));

    if (beforeText === prefix && afterText === suffix) {
        //=> undo underline (inside selection)
        editor.setSelection(Cursor(fos - PL), Cursor(tos + SL));
        editor.replaceSelection(`${selectedText}`);
        // re-select
        editor.setSelection(Cursor(fos - PL), Cursor(tos - PL));
    } else if (startText === prefix && endText === suffix) {
        //=> undo underline (outside selection)
        editor.replaceSelection(
            editor.getRange(Cursor(fos + PL), Cursor(tos - SL))
        );
        // re-select
        editor.setSelection(Cursor(fos), Cursor(tos - PL - SL));
    } else {
        //=> do underline

        if (selectedText) {
            // console.log("selected");
            editor.replaceSelection(`${prefix}${selectedText}${suffix}`);
            // re-select
            editor.setSelection(
                editor.offsetToPos(fos + PL),
                editor.offsetToPos(tos + PL)
            );
        } else {
            // console.log("not selected");
            editor.replaceSelection(`${prefix}${suffix}`);
            let cursor = editor.getCursor();
            cursor.ch -= SL;
            editor.setCursor(cursor);
        }
    }
}

export function replaceLigature(s: string): string {
    let ligatures = {
        Ꜳ: "AA",
        Æ: "AE",
        Ꜵ: "AO",
        Ꜷ: "AU",
        Ꜹ: "AV",
        Ꜻ: "AV",
        Ꜽ: "AY",
        ꜳ: "aa",
        æ: "ae",
        ꜵ: "ao",
        ꜷ: "au",
        ꜹ: "av",
        ꜻ: "av",
        ꜽ: "ay",
        "🙰": "et",
        ﬀ: "ff",
        ﬃ: "ffi",
        ﬄ: "ffl",
        ﬁ: "fi",
        ﬂ: "fl",
        "℔": "lb",
        Ƕ: "Hv",
        Ỻ: "lL",
        Œ: "OE",
        Ꝏ: "OO",
        ƕ: "hv",
        ỻ: "ll",
        œ: "oe",
        ꝏ: "oo",
        ꭢ: "ɔe",
        ﬆ: "st",
        ﬅ: "ſt",
        ᵫ: "ue",
        ꭣ: "uo",
        ẞ: "ſs",
        Ꜩ: "TZ",
        W: "VV",
        Ꝡ: "VY",
        ß: "ſz",
        ꜩ: "tz",
        w: "vv",
        ꝡ: "vy",
        ꬱ: "aə",
        ꭁ: "əø",
        ȸ: "db",
        ʣ: "dz",
        "ꭦ": "dʐ",
        ʥ: "dʑ",
        ʤ: "dʒ",
        ʩ: "fŋ",
        ʪ: "ls",
        ʫ: "lz",
        ɮ: "lʒ",
        ꭀ: "oə",
        ȹ: "qp[c]",
        ʨ: "tɕ",
        ʦ: "ts",
        "ꭧ": "tʂ",
        ʧ: "tʃ",
        ꭐ: "ui",
        ꭑ: "ui",
        ɯ: "uu",
    };

    Object.entries(ligatures).forEach(([key, value]) => {
        s = s.replace(key, value);
    });
    return s;
}

export function sortTodo(s: string): string {
    let lines = s.split("\n");

    let prefix_text_line = -1,
        suffix_text_line = -1;
    let todos: { [key: string]: any[] } = {};
    let todo_detected = false, sort_prefix = false;
    let indent = 0;
    let last_flag: string, // flag of last line that count in as a new todo of level `indent`
        flag: string;
    for (const [i, line] of lines.entries()) {
        let flags = /- \[([ \w])\]/g.exec(line);
        if (flags) {
            let head = line.match(/^[ \t]*/g)[0];
            if (!todo_detected) {
                // first time to detect todo checkbox
                indent = head.length;
                todo_detected = true;
            } else {
                if (head.length < indent) {
                    // the level of this line is higher than before, 
                    // reset the index and consider above lines as prefix text
                    prefix_text_line = i - 1;
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
            if (todo_detected) {
                suffix_text_line = i;
                break;
            } else {
                prefix_text_line = i;
            }
        }
    }
    let body = "";
    for (const [i, flag] of Object.keys(todos).sort().entries()) {
        todos[flag].forEach((line, j) => {
            if (line.match(/\n/g)) {
                let sub_lines = line.split("\n");
                line = sub_lines[0] + "\n" + sortTodo(sub_lines.slice(1, sub_lines.length).join("\n"));
            }
            body += line + "\n";
        })
    }
    body = body.slice(0, body.length - 1); // remove the last "\n"

    let prefix_text = lines.slice(0, prefix_text_line + 1).join('\n');
    let suffix_text = suffix_text_line == -1 ? "" : lines.slice(suffix_text_line, lines.length).join('\n');
    if (sort_prefix) {
        prefix_text = sortTodo(prefix_text);
    }
    if (!(suffix_text_line == -1 || suffix_text_line == lines.length - 1)) {
        suffix_text = sortTodo(suffix_text);
    }
    let whole = [prefix_text, body, suffix_text];
    whole = whole.filter(item => item != "")
    // console.log(whole.join('\n'));
    return whole.join('\n');
}
