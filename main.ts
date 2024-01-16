import { wrap } from "module";
import { Editor, MarkdownView, Plugin, Setting, PluginSettingTab, App, Menu, ButtonComponent, requestUrl, EditorPosition, Notice } from "obsidian";
import { decode } from "querystring";
import { array2markdown, table2bullet, capitalizeWord, capitalizeSentence, removeAllSpaces, zoteroNote, textWrapper, replaceLigature, ankiSelection, sortTodo, requestAPI, headingLevel, slugify, snakify, extraDoubleSpaces } from "src/format";
import { removeWikiLink, removeUrlLink, url2WikiLink } from "src/link";
import { FormatSettings, DEFAULT_SETTINGS, TextFormatSettingTab } from "src/setting";

export default class TextFormat extends Plugin {
  settings: FormatSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TextFormatSettingTab(this.app, this));

    this.addCommand({
      id: "text-format-heading-upper",
      name: "Heading upper",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "heading", true);
      },
      hotkeys: [
        {
          modifiers: ["Ctrl", "Shift"],
          key: "]",
        },
      ],
    });
    this.addCommand({
      id: "text-format-heading-lower",
      name: "Heading lower",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "heading", false);
      },
      hotkeys: [
        {
          modifiers: ["Ctrl", "Shift"],
          key: "[",
        },
      ],
    });
    this.settings.WrapperList.forEach((wrapper, index) => {
      this.addCommand({
        id: `text-format-wrapper-${index}`,
        name: "Wrapper - " + wrapper.name,
        editorCallback: (editor: Editor, view: MarkdownView) => {
          textWrapper(editor, view, wrapper.prefix, wrapper.suffix)
        },
      });
    });
    this.settings.RequestList.forEach((request, index) => {
      this.addCommand({
        id: `text-format-request-${index}`,
        name: "API Request - " + request.name,
        editorCallback: (editor: Editor, view: MarkdownView) => {
          this.textFormat(editor, view, "api-request", request.url);
        },
      });
    });
    this.addCommand({
      id: "text-format-anki-card",
      name: "Convert selection into Anki card format",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "anki");
      },
    });
    this.addCommand({
      id: "text-format-ligature",
      name: "Replace ligature",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "ligature");
      },
    });
    this.addCommand({
      id: "text-format-remove-wiki-link",
      name: "Remove WikiLinks format in selection",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "remove-wiki-link");
      },
    });
    this.addCommand({
      id: "text-format-remove-url-link",
      name: "Remove URL links format in selection",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "remove-url-link");
      },
    });
    this.addCommand({
      id: "text-format-link-url2wiki",
      name: "Convert URL links to WikiLinks in selection",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "link-url2wiki");
      },
    });
    this.addCommand({
      id: "text-format-lower",
      name: "Lowercase selected text",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "lowercase");
      },
    });
    this.addCommand({
      id: "text-format-upper",
      name: "Uppercase selected text",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "uppercase");
      },
    });
    this.addCommand({
      id: "text-format-togglecase",
      name: "Togglecase selected text",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "togglecase");
      },
    });
    this.addCommand({
      id: "text-format-capitalize-word",
      name: "Capitalize all words in selected text",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "capitalize-word");
      },
    });
    this.addCommand({
      id: "text-format-capitalize-sentence",
      name: "Capitalize only first word of sentence in selected text",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "capitalize-sentence");
      },
    });
    this.addCommand({
      id: "text-format-titlecase",
      name: "Title case selected text",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "titlecase");
      },
    });
    this.addCommand({
      id: "text-format-remove-spaces",
      name: "Remove redundant spaces in selection",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "remove-spaces");
      },
    });
    this.addCommand({
      id: "text-format-remove-spaces-all",
      name: "Remove all spaces in selection",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "spaces-all");
      },
    });
    this.addCommand({
      id: "text-format-remove-blank-line",
      name: "Remove blank line(s)",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "remove-blank-line");
      },
    });
    this.addCommand({
      id: "text-format-merge-line",
      name: "Merge broken paragraph(s) in selection",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "merge");
      },
    });
    this.addCommand({
      id: "text-format-bullet-list",
      name: "Format bullet list",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "bullet");
      },
    });
    this.addCommand({
      id: "text-format-convert-ordered-list",
      name: "Format ordered list",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "convert-ordered");
      },
    });
    this.addCommand({
      id: "text-format-split-blank",
      name: "Split line(s) by blanks",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "split-blank");
      },
    });
    this.addCommand({
      id: "text-format-chinese-punctuation",
      name: "Convert to Chinese punctuation marks (,;:!?)",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "Chinese-punctuation");
      },
    });
    this.addCommand({
      id: "text-format-english-punctuation",
      name: "Convert to English punctuation marks",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "English-punctuation");
      },
    });
    this.addCommand({
      id: "text-format-latex-single-letter",
      name: "Convert single letter into math mode (latex)",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "latex-letter");
      },
    });
    this.addCommand({
      id: "text-format-decodeURI",
      name: "Decode URL",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "decodeURI");
      },
    });
    this.addCommand({
      id: "text-format-paragraph-double-spaces",
      name: "Add extra double spaces per paragraph for whole file",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        extraDoubleSpaces(editor, view);
      },
    });
    this.addCommand({
      id: "text-format-add-line-break",
      name: "Add extra line break to paragraph",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "add-line-break");
      },
    });
    this.addCommand({
      id: "text-format-hyphen",
      name: "Remove hyphens",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "hyphen");
      },
    });
    this.addCommand({
      id: "text-format-remove-citation-index",
      name: "Remove citation index",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "remove-citation");
      },
    });
    this.addCommand({
      id: "text-format-mathpix-array2table",
      name: "Convert Mathpix array to markdown table",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "array2table");
      },
    });
    this.addCommand({
      id: "text-format-table2bullet",
      name: "Convert table to bullet list without header",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "table2bullet");
      },
    });
    this.addCommand({
      id: "text-format-table2bullet-head",
      name: "Convert table to bullet list with header",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "table2bullet-header");
      },
    });
    this.addCommand({
      id: "text-format-todo-sort",
      name: "Sort to-do list",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "todo-sort");
      },
    });
    this.addCommand({
      id: "text-format-slugify",
      name: "Slugify selected text",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "slugify");
      },
    })
    this.addCommand({
      id: "text-format-snakify",
      name: "Snakify selected text",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "snakify");
      },
    })
    this.addCommand({
      id: "text-format-space-word-symbol",
      name: "Format space between word and symbol",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.textFormat(editor, view, "space-word-symbol");
      },
    });
    this.addCommand({
      id: "text-format-zotero-note",
      name: "Zotero note format and paste",
      callback: async () => {
        const clipboardText = await navigator.clipboard.readText();
        let text = zoteroNote(
          clipboardText,
          this.settings.ZoteroNoteRegExp,
          this.settings.ZoteroNoteTemplate
        );
        let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!markdownView) {
          return;
        }
        let editor = markdownView.editor;
        editor.replaceSelection(text);
      },
    });
  }

  textFormat(editor: Editor, markdownView: MarkdownView, cmd: string, args: any = ""): void {
    // let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return;
    }
    // let editor = markdownView.editor;

    var selectedText: string, replacedText;

    // if nothing is selected, select the whole line.
    let somethingSelected = editor.somethingSelected()
    let origin_cursor_from = editor.getCursor("from"), origin_cursor_to = editor.getCursor("to");
    if (!somethingSelected) {
      let cursor = editor.getCursor();

      cursor.ch = 0;
      let aos = editor.posToOffset(cursor);

      cursor.line += 1;
      let hos = editor.posToOffset(cursor);
      if (cursor.line <= editor.lastLine()) {
        // don't select the next line which is not selected by user
        hos -= 1;
      }
      editor.setSelection(editor.offsetToPos(aos), editor.offsetToPos(hos));
    }

    selectedText = editor.getSelection();

    let from = editor.getCursor("from"),
      to = editor.getCursor("to");
    let cursorOffset = 0;

    // adjust selection
    switch (cmd) {
      case "capitalize-word":
      case "capitalize-sentence":
      case "titlecase":
        // lower case text if setting is true
        if (this.settings.LowercaseFirst) {
          selectedText = selectedText.toLowerCase();
        }
        break;
      case "split-blank":
      case "bullet":
      case "convert-ordered":
        // force to select whole paragraph(s)
        from.ch = 0;
        to.line += 1;
        to.ch = 0;
        if (to.line <= editor.lastLine()) {
          editor.setSelection(
            from,
            editor.offsetToPos(editor.posToOffset(to) - 1)
          );
        } else {
          editor.setSelection(from, to);
        }
        selectedText = editor.getSelection();
        break;
      case "todo-sort":
        // select whole file if nothing selected
        if (!somethingSelected) {
          from.line = 0;
          from.ch = 0;
          to.line = editor.lastLine() + 1;
          editor.setSelection(from, to);
          selectedText = editor.getSelection();
        }
        break;
      default:
        break;
    }

    // modify selection text
    switch (cmd) {
      case "heading":
        const headingRes = headingLevel(selectedText, args);
        replacedText = headingRes.text;
        cursorOffset = headingRes.offset
        break;
      case "anki":
        replacedText = ankiSelection(selectedText);
        break;
      case "lowercase":
        replacedText = selectedText.toLowerCase();
        break;
      case "uppercase":
        replacedText = selectedText.toUpperCase();
        break;
      case "capitalize-word":
        replacedText = capitalizeWord(selectedText);
        break;
      case "capitalize-sentence":
        replacedText = capitalizeSentence(selectedText);
        break;
      case "titlecase":
        // @ts-ignore
        replacedText = selectedText.toTitleCase();
        break;
      case "togglecase":
        let lowerString = selectedText.toLowerCase();
        function getNewString(caseCommand: string): string {
          switch (caseCommand) {
            // @ts-ignore
            case "titleCase": return lowerString.toTitleCase();
            case "lowerCase": return lowerString;
            case "upperCase": return selectedText.toUpperCase();
            case "capitalizeWord": return capitalizeWord(lowerString)
            case "capitalizeSentence": return capitalizeSentence(lowerString)
            default:
              new Notice(`Unknown case ${caseCommand}. \nOnly lowerCase, upperCase, capitalizeWord, capitalizeSentence, titleCase supported.`);
              return null;
          }
        }
        let toggleSeq = this.settings.ToggleSequence.replace(/ /g, "").replace(/\n+/g, "\n").split('\n');
        let textHistory = new Array<string>();
        let i;
        const L = toggleSeq.length;
        for (i = 0; i < L; i++) {
          let resText = getNewString(toggleSeq[i]), duplicated = false;
          for (let j = 0; j < textHistory.length; j++) {
            if (textHistory[j] == resText) {
              duplicated = true;
              break;
            }
          }
          // console.log(toggleSeq[i], selectedText, resText, selectedText == getNewString(toggleSeq[i]))
          if (!duplicated) { //: if the converted text is the same as before toggle case, ignore it
            if (selectedText == resText) { break; }
          }
          textHistory.push(resText);
        }
        //: find the toggle case that is different from the original text
        for (i++; i < i + L; i++) {
          let resText = getNewString(toggleSeq[i % L]);
          if (selectedText != resText) {
            replacedText = resText;
            break;
          }
        }
        if (!(replacedText)) { return; }
        break;
      case "remove-spaces":
        console.log(selectedText)
        replacedText = selectedText
          .replace(/(?<=\S) {2,}/g, " ")
          .replace(/ $| (?=\n)/g, "");
        // replacedText = replacedText.replace(/\n /g, "\n"); // when a single space left at the head of the line
        break;
      case "spaces-all":
        replacedText = removeAllSpaces(selectedText);
        break;
      case "merge":
        replacedText = selectedText.replace(/(?:[^\n])(\n)(?!\n)/g, (t, t1) => t.replace(t1, " "));
        if (this.settings.MergeParagraph_Newlines) {
          replacedText = replacedText.replace(/\n\n+/g, "\n\n");
        }
        if (this.settings.MergeParagraph_Spaces) {
          replacedText = replacedText.replace(/ +/g, " ");
        }
        break;
      case "remove-blank-line":
        replacedText = selectedText.replace(/\n\s*\n/g, "\n"); // issue #16
        break;
      case "add-line-break":
        replacedText = selectedText.replace(/\n/g, "\n\n");
        break;
      case "space-word-symbol":
        replacedText = selectedText.replace(/(\w+)\(/g, "$1 (");
        break;
      case "remove-citation":
        replacedText = selectedText.replace(/\[\d+\]|【\d+】/g, "").replace(/ +/g, " ");
        break;
      case "bullet":
        let r = this.settings.BulletPoints.replace("-", "");
        replacedText = selectedText
          .replace(RegExp(`\\s*[${r}] *`, "g"), (t) =>
            t.replace(RegExp(`[${r}] *`), "\n- ")
          )
          .replace(/\n+/g, "\n")
          .replace(/^\n/, "");
        // if "-" in this.settings.BulletPoints
        if (this.settings.BulletPoints.indexOf("-") > -1) {
          replacedText = replacedText.replace(/^- /g, "\n- ");
        }
        break;
      case "convert-ordered":
        let orderedCount = 0;
        // var rx = new RegExp(
        //   String.raw`(?:^|[\s，。])((?:[:;]?i{1,4}[）\)]|\d\.) *)` +
        //   "|" +
        //   String.raw`(?:^|\s| and )[^\s\(\[\]]\)`,
        //   "g"
        // );
        const rx = /([\(（]?(\b\d+|\b[a-zA-Z]|[ivx]{1,4})[.\)）](\s|(?=[\u4e00-\u9fa5]))|\sand\s|\s?(以及和)\s?)/g;
        replacedText = selectedText.replace(
          rx,
          function (t, t1) {
            orderedCount++;
            let head = "\n"; // if single line, then add newline character.
            // if (selectedText.indexOf("\n") > -1) {
            //   head = "";
            // }
            return t.replace(t1, `${head}${orderedCount}. `);
          }
        );
        replacedText = replacedText.replace(/\n+/g, "\n").replace(/^\n/, "");
        break;
      case "split-blank":
        replacedText = selectedText.replace(/ /g, "\n");
        break;
      case "Chinese-punctuation":
        replacedText = this.settings.RemoveBlanksWhenChinese ? removeAllSpaces(selectedText) : selectedText;
        replacedText = replacedText
          .replace(/ ?, ?/g, "，")
          .replace(/(?:[^\d])( ?\. ?)/g, (t, t1) => t.replace(t1, "。"))
          .replace(/ ?、 ?/g, "、")
          .replace(/;/g, "；")
          .replace(/--/g, "——")
          .replace(/[^a-zA-Z0-9](: ?)/g, (t, t1) => t.replace(t1, "："))
          .replace(/\!(?=[^\[])/g, "！")
          .replace(/\?/g, "？")
          .replace(/[\(（][^\)]*?[\u4e00-\u9fa5]+?[^\)]*?[\)）]/g, function (t) {
            return `（${t.slice(1, t.length - 1)}）`;
          });
        break;
      case "English-punctuation":
        replacedText = selectedText.replace(/[（\(]([\w !\"#$%&'()*+,-./:;<=>?@\[\\\]^_`{\|}~]+)[）\)]/g, "($1)");
        break;
      case "latex-letter":
        // const sep = String.raw`[\s\,\.\?\!\:，。、（）：]`;
        replacedText = selectedText.replace(
          // RegExp(String.raw`(?:` + sep + String.raw`|^)([a-zA-Z])(` + sep + `|$)`, "g"),
          /(?:[\s：（）。，、；]|^)([a-zA-Z])([\s\,\:\.\?\!，。、（）；]|$)/g,
          function (t, t1) {
            return t.replace(t1, `$${t1}$`);
          }
        );
        break;
      case "decodeURI":
        replacedText = selectedText.replace(
          /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g,
          function (t) { return decodeURI(t).replace(/\s/g, "%20"); }
        );
        break;
      case "hyphen":
        replacedText = selectedText.replace(/(\w)-[ ]/g, "$1");
        break;
      case "array2table":
        replacedText = array2markdown(selectedText);
        break;
      case "table2bullet":
        replacedText = table2bullet(selectedText, false);
        break;
      case "table2bullet-header":
        replacedText = table2bullet(selectedText, true);
        break;
      case "remove-wiki-link":
        replacedText = removeWikiLink(selectedText, this.settings.WikiLinkFormat)
        break;
      case "remove-url-link":
        replacedText = removeUrlLink(selectedText, this.settings.UrlLinkFormat);
        if (this.settings.RemoveWikiURL2) {
          replacedText = removeWikiLink(replacedText, this.settings.WikiLinkFormat);
        }
        break;
      case "link-url2wiki":
        replacedText = url2WikiLink(selectedText);
        break;
      case "ligature":
        replacedText = replaceLigature(selectedText);
        break;
      case "todo-sort":
        replacedText = sortTodo(selectedText);
        break;
      case "slugify":
        replacedText = slugify(selectedText);
        break;
      case "snakify":
        replacedText = snakify(selectedText);
        break;
      case "api-request":
        let p = requestAPI(selectedText, markdownView.file, args);
        p.then(result => {
          replacedText = result;
          editor.setSelection(from, to);
          if (replacedText != selectedText) { editor.replaceSelection(replacedText); }
          editor.setSelection(from, editor.getCursor("head"));
          return;
        })
        return;
      default:
        return;
    }
    // change text only when two viable is different
    if (replacedText != selectedText) {
      editor.replaceSelection(replacedText);
    }

    const fos = editor.posToOffset(editor.getCursor("from"));
    // cursor selection
    switch (cmd) {
      case "merge":
      case "remove-blank-line":
        const tos = editor.posToOffset(editor.getCursor("to")); // to offset
        editor.setSelection(
          editor.offsetToPos(tos - replacedText.length),
          editor.offsetToPos(tos)
        );
        break;
      case "heading":
        // put cursor back to the original position
        editor.setSelection(editor.offsetToPos(editor.posToOffset(origin_cursor_from) + cursorOffset),
          editor.offsetToPos(editor.posToOffset(origin_cursor_to) + cursorOffset));
        break;
      case "todo-sort":
        if (!somethingSelected) {
          editor.setSelection(origin_cursor_from, origin_cursor_to);
        } else {
          editor.setSelection(editor.offsetToPos(fos), editor.getCursor("head"));
        }
        break;
      default:
        // console.log(cmd)
        let head = editor.getCursor("head");
        editor.setSelection(editor.offsetToPos(fos), head);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
