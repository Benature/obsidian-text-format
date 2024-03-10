import { Editor, MarkdownView, Plugin, Notice, debounce, normalizePath } from "obsidian";
import { removeWikiLink, removeUrlLink, url2WikiLink, convertWikiLinkToMarkdown } from "src/link";
import { TextFormatSettingTab } from "src/settings/settingTab";
import { FormatSettings, DEFAULT_SETTINGS } from "src/settings/types";
import { array2markdown, table2bullet, capitalizeWord, capitalizeSentence, removeAllSpaces, zoteroNote, textWrapper, replaceLigature, ankiSelection, sortTodo, requestAPI, headingLevel, slugify, snakify, extraDoubleSpaces, toTitleCase, customReplace, convertLatex } from "src/format";
import { LetterCaseCommands } from "src/commands";
import { getString } from "src/langs/langs";

function getLang() {
  let lang = window.localStorage.getItem('language');
  if (["en", "zh", "zh-TW"].indexOf(lang) == -1) { lang = "en"; }
  return lang;
}

function isActiveTitle(): boolean {
  const activeClasses = document.activeElement.classList;
  return activeClasses.contains("inline-title") || activeClasses.contains("view-header-title");
}


export default class TextFormat extends Plugin {
  settings: FormatSettings;
  debounceUpdateCommandWrapper = debounce(this.updateCommandWrapper, 1000, true);
  debounceUpdateCommandRequest = debounce(this.updateCommandRequest, 1000, true);

  formatEditorOrTitle(cmd: string) {
    if (isActiveTitle()) {
      const file = this.app.workspace.getActiveFile();
      // let newName = file.basename;
      let newName = this.textFormat(file.basename, cmd);
      if (newName === null) {
        Error("Unknown command " + cmd);
        newName = file.basename;
      }
      // switch (cmd) {
      //   case "uppercase":
      //     newName = newName.toUpperCase();
      //     break;
      //   case "lowercase":
      //     newName = newName.toLowerCase();
      //     break;
      //   default:
      //     Error("Unknown command")
      // }
      const newPath = normalizePath(file.parent.path + "/" + newName + "." + file.extension)
      this.app.vault.adapter.rename(file.path, newPath);
    } else {
      // @ts-ignore
      this.app.commands.executeCommandById(`obsidian-text-format::private:${cmd}`);
    }
  }

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TextFormatSettingTab(this.app, this));

    const lang = getLang();

    LetterCaseCommands.forEach(command => {
      this.addCommand({
        id: command.id,
        name: getString(["command", command.id]),
        callback: () => {
          this.formatEditorOrTitle(command.id);
        },
      });
      this.addCommand({
        id: `:private:${command.id}`,
        name: getString(["command", command.id]) + " in editor",
        editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
          if (!checking) { this.editorTextFormat(editor, view, command.id); }
          return !checking;
        },
      });
    })

    // this.addCommand({
    //   id: "lowercase",
    //   name: { en: "Lowercase selected text", zh: "将选中文本转换为小写", "zh-TW": "將選取文字轉換為小寫" }[lang],
    //   callback: () => {
    //     this.formatEditorOrTitle("lowercase");
    //   },
    // });
    // this.addCommand({
    //   id: ":private:lowercase",
    //   name: "Lowercase in editor",
    //   editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
    //     if (!checking) { this.textFormat(editor, view, "lowercase"); }
    //     return !checking;
    //   },
    // });
    // this.addCommand({
    //   id: "uppercase",
    //   name: { en: "Uppercase selected text", zh: "将选中文本转换为大写", "zh-TW": "將選取文字轉換為大寫" }[lang],
    //   callback: () => {
    //     this.formatEditorOrTitle("uppercase");
    //   }
    // })
    // this.addCommand({
    //   id: ":private:uppercase",
    //   name: "Uppercase in editor",
    //   editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
    //     if (!checking) { this.textFormat(editor, view, "uppercase"); }
    //     return !checking;
    //   },
    // });
    // this.addCommand({
    //   id: "capitalize-word",
    //   name: { en: "Capitalize all words in selected text", zh: "将选中文本中的所有单词首字母大写", "zh-TW": "將選取文字中的所有單詞首字母大寫" }[lang],
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     this.editorTextFormat(editor, view, "capitalize-word");
    //   },
    // });
    // this.addCommand({
    //   id: "capitalize-sentence",
    //   name: { en: "Capitalize only first word of sentence in selected text", zh: "将选中文本中的句子的首字母大写", "zh-TW": "將選取文字中的句子的首字母大寫" }[lang],
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     this.editorTextFormat(editor, view, "capitalize-sentence");
    //   },
    // });
    // this.addCommand({
    //   id: "titlecase",
    //   name: { en: "Title case selected text", zh: "将选中文本转换为标题格式大小写", "zh-TW": "將選取文字轉換為標題格式大小寫" }[lang],
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     this.editorTextFormat(editor, view, "titlecase");
    //   },
    // });
    // this.addCommand({
    //   id: "togglecase",
    //   name: { en: "Togglecase selected text", zh: "触发选中文本大小写切换", "zh-TW": "觸發選取文字大小寫切換" }[lang],
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     this.editorTextFormat(editor, view, "togglecase");
    //   },
    // });
    this.addCommand({
      id: "slugify",
      name: { en: "Slugify selected text (`-` for space)", zh: "使用 Slugify 格式化选中文本（`-`连字符）", "zh-TW": "使用 Slugify 格式化選取文字（`-`連字符）" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "slugify");
      },
    });
    this.addCommand({
      id: "snakify",
      name: { en: "Snakify selected text (`_` for space)", zh: "使用 Snakify 格式化选中文本（`_`连字符）", "zh-TW": "使用 Snakify 格式化選取文字（`_`連字符）" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "snakify");
      },
    });

    this.addCommand({
      id: "heading-upper",
      name: { "en": "Heading upper", "zh": "标题上升一级", "zh-TW": "標題上升一級" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "heading", true);
      },
      repeatable: false,
      hotkeys: [
        {
          modifiers: ["Ctrl", "Shift"],
          key: "]",
        }],
    });
    this.addCommand({
      id: "heading-lower",
      name: { "en": "Heading lower", "zh": "标题下降一级", "zh-TW": "標題下降一級" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "heading", false);
      },
      repeatable: false,
      hotkeys: [
        {
          modifiers: ["Ctrl", "Shift"],
          key: "[",
        }],
    });

    this.addCommand({
      id: "bullet-list",
      name: { en: "Detect and format bullet list", zh: "识别并格式化无序列表", "zh-TW": "識別並格式化無序清單" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "bullet");
      },
    });
    this.addCommand({
      id: "convert-ordered-list",
      name: { en: "Detect and format ordered list", zh: "识别并格式化有序列表", "zh-TW": "識別並格式化有序清單" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "convert-ordered");
      },
    });
    this.addCommand({
      id: "table2bullet",
      name: { en: "Convert table to bullet list without header", zh: "将表格转换为无序列表（不含标题）", "zh-TW": "將表格轉換為無序清單（不含標題）" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "table2bullet");
      },
    });
    this.addCommand({
      id: "table2bullet-head",
      name: { en: "Convert table to bullet list with header", zh: "将表格转换为无序列表（含标题）", "zh-TW": "將表格轉換為無序清單（含標題）" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "table2bullet-header");
      },
    });
    this.addCommand({
      id: "todo-sort",
      name: { en: "Sort to-do list", zh: "将待办事项列表排序", "zh-TW": "將待辦事項列表排序" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "todo-sort");
      },
    });

    this.addCommand({
      id: "remove-wiki-link",
      name: { "en": "Remove WikiLinks format in selection", "zh": "移除选中文本中的 WikiLinks 格式", "zh-TW": "移除選取文字中的 WikiLinks 格式" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "remove-wiki-link");
      },
    });
    this.addCommand({
      id: "remove-url-link",
      name: { "en": "Remove URL links format in selection", "zh": "移除选中文本中的 URL 链接格式", "zh-TW": "移除選取文字中的 URL 鏈接格式" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "remove-url-link");
      },
    });
    this.addCommand({
      id: "link-url2wiki",
      name: { en: "Convert URL links to WikiLinks in selection", zh: "将选中文本中的 URL 链接转换为 WikiLinks 格式", "zh-TW": "將選取文字中的 URL 鏈接轉換為 WikiLinks 格式" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "link-url2wiki");
      },
    });
    this.addCommand({
      id: "link-wiki2md",
      name: { en: "Convert wikiLinks to plain markdown links in selection", zh: "将选中文本中的 WikiLinks 转换为普通 Markdown 链接格式", "zh-TW": "將選取文字中的 WikiLinks 轉換為普通 Markdown 鏈接格式" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "link-wiki2md");
      },
    });


    this.addCommand({
      id: "remove-spaces",
      name: { en: "Remove redundant spaces in selection", zh: "将选中文本中的多余空格移除", "zh-TW": "將選取文字中的多餘空格移除" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "remove-spaces");
      },
    });
    this.addCommand({
      id: "remove-spaces-all",
      name: { en: "Remove all spaces in selection", zh: "将选中文本中的所有空格移除", "zh-TW": "將選取文字中的所有空格移除" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "spaces-all");
      },
    });
    this.addCommand({
      id: "remove-trailing-all",
      name: { en: "Remove trailing spaces in selection", zh: "将选中文本中的所有行末空格移除", "zh-TW": "將選取文字中的所有行尾空格移除" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "trailing-spaces");
      },
    });
    this.addCommand({
      id: "remove-blank-line",
      name: { en: "Remove blank line(s)", zh: "将选中文本中的空行移除", "zh-TW": "將選取文字中的空行移除" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "remove-blank-line");
      },
    });
    this.addCommand({
      id: "merge-line",
      name: { en: "Merge broken paragraph(s) in selection", zh: "将选中文本中的断行合并", "zh-TW": "將選取文字中的斷行合併" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "merge");
      },
    });
    this.addCommand({
      id: "split-blank",
      name: { en: "Split line(s) by blanks", zh: "将选中文本按空格分行", "zh-TW": "將選取文字按空格分行" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "split-blank");
      },
    });
    this.addCommand({
      id: "chinese-punctuation",
      name: { en: "Convert to Chinese punctuation marks (,;:!?)", zh: "转换为中文标点符号（,;:!?）", "zh-TW": "轉換為中文標點符號（,;:!?）" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "Chinese-punctuation");
      },
    });
    this.addCommand({
      id: "english-punctuation",
      name: { en: "Convert to English punctuation marks", zh: "转换为英文标点符号", "zh-TW": "轉換為英文標點符號" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "English-punctuation");
      },
    });
    this.addCommand({
      id: "hyphen",
      name: { en: "Remove hyphens", zh: "移除连字符", "zh-TW": "移除連字符" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "hyphen");
      },
    });
    this.addCommand({
      id: "ligature",
      name: { "en": "Replace ligature", "zh": "替换连字", "zh-TW": "取代連字" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "ligature");
      },
    });


    this.addCommand({
      id: "anki-card",
      name: { "en": "Convert selection into Anki card format", "zh": "将选中内容转换为 Anki 卡片格式", "zh-TW": "將選取內容轉換為 Anki 卡片格式" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "anki");
      },
    });
    this.addCommand({
      id: "remove-citation-index",
      name: { en: "Remove citation index", zh: "移除引用索引编号", "zh-TW": "移除引用索引編號" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "remove-citation");
      },
    });
    this.addCommand({
      id: "zotero-note",
      name: { en: "Get Zotero note from clipboard and paste", zh: "从剪贴板获取 Zotero 笔记并粘贴", "zh-TW": "從剪貼板獲取 Zotero 筆記並粘貼" }[lang],
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        const clipboardText = await navigator.clipboard.readText();
        let text = zoteroNote(
          clipboardText,
          this.settings.ZoteroNoteRegExp,
          this.settings.ZoteroNoteTemplate
        );
        editor.replaceSelection(text);
      },
    });
    this.addCommand({
      id: "latex-letter",
      name: { en: "Detect and convert characters to math mode (LaTeX)", zh: "识别并转换字符为数学模式（LaTeX）", "zh-TW": "識別並轉換字符為數學模式（LaTeX）" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "latex-letter");
      },
    });
    this.addCommand({
      id: "mathpix-array2table",
      name: {
        en: "Convert Mathpix's LaTeX array to markdown table", zh: "将 Mathpix 的 LaTeX 数组转换为 Markdown 表格", "zh-TW": "將 Mathpix 的 LaTeX 陣列轉換為 Markdown 表格"
      }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "array2table");
      },
    });
    this.addCommand({
      id: "callout",
      name: { en: "Callout format", zh: "Callout 格式", "zh-TW": "Callout 格式" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "callout");
      },
    });


    this.debounceUpdateCommandWrapper();
    this.debounceUpdateCommandRequest();
    this.debounceUpdateCommandCustomReplace();
    this.addCommand({
      id: "decodeURI",
      name: { en: "Decode URL", zh: "解码 URL", "zh-TW": "解碼 URL" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "decodeURI");
      },
    });
    this.addCommand({
      id: "paragraph-double-spaces",
      name: { en: "Add extra double spaces per paragraph for whole file", zh: "全文为每段段末添加双空格", "zh-TW": "全文為每段段末添加雙空格" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        extraDoubleSpaces(editor, view);
      },
    });
    this.addCommand({
      id: "add-line-break",
      name: { en: "Add extra line break to paragraph", zh: "在段落末添加额外换行", "zh-TW": "在段落末添加額外換行" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "add-line-break");
      },
    });
    this.addCommand({
      id: "space-word-symbol",
      name: { en: "Format space between word and symbol", zh: "格式化单词与符号之间的空格", "zh-TW": "格式化單詞與符號之間的空格" }[lang],
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "space-word-symbol");
      },
    });
  }

  updateCommandWrapper() {
    const lang = getLang();
    this.settings.WrapperList.forEach((wrapper, index) => {
      this.addCommand({
        id: `wrapper-${index}`,
        name: { "en": "Wrapper", "zh": "包装器", "zh-TW": "包裝器" }[lang] + " - " + wrapper.name,
        editorCallback: (editor: Editor, view: MarkdownView) => {
          textWrapper(editor, view, wrapper.prefix, wrapper.suffix)
        },
      });
    });
  }
  updateCommandRequest() {
    const lang = getLang();
    this.settings.RequestList.forEach((request, index) => {
      this.addCommand({
        id: `request-${index}`,
        name: { "en": "API Request", "zh": "API 请求", "zh-TW": "API 請求" }[lang] + " - " + request.name,
        editorCallback: (editor: Editor, view: MarkdownView) => {
          this.editorTextFormat(editor, view, "api-request", request.url);
        },
      });
    });
  }
  debounceUpdateCommandCustomReplace() {
    const lang = getLang();
    this.settings.customReplaceList.forEach((customReplace, index) => {
      this.addCommand({
        id: `custom-replace-${index}`,
        name: { "en": "Custom Replace", "zh": "自定义替换", "zh-TW": "自定義取代" }[lang] + " - " + customReplace.name,
        editorCallback: (editor: Editor, view: MarkdownView) => {
          this.editorTextFormat(editor, view, "custom-replace", customReplace);
        },
      });
    });
  }

  textFormat(selectedText: string, cmd: string, args: any = ""): string | null {
    let replacedText;
    switch (cmd) {
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
        replacedText = toTitleCase(selectedText, this.settings);
        break;
      case "togglecase":
        let lowerString = selectedText.toLowerCase();
        const settings = this.settings;
        function getNewString(caseCommand: string): string {
          switch (caseCommand) {
            case "titleCase": return toTitleCase(selectedText, settings);
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
      case "trailing-spaces":
        replacedText = selectedText.replace(/(\s*)(?=\n)|(\s*)$/g, "")
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
          .replace(/\n[~\/Vv] /g, "\n- ")
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
        let sepCustom = "";
        if (this.settings.OrderedListOtherSeparator.length > 0) {
          sepCustom = "|" + this.settings.OrderedListOtherSeparator;
        }

        const rx = new RegExp(
          String.raw`([\(（]?(\b\d+|\b[a-zA-Z]|[ivx]{1,4})[.\)）](\s|(?=[\u4e00-\u9fa5]))` + sepCustom + `)`,
          "g");
        // const rx = /([\(（]?(\b\d+|\b[a-zA-Z]|[ivx]{1,4})[.\)）](\s|(?=[\u4e00-\u9fa5]))|\sand\s|\s?(以及和)\s?)/g;
        replacedText = selectedText.replace(
          rx,
          function (t, t1) {
            orderedCount++;
            let head = "\n"; // if single line, then add newline character.
            return t.replace(t1, `${head}${orderedCount}. `);
          }
        );
        replacedText = replacedText.replace(/\n+/g, "\n").replace(/^\n/, "");
        break;
      case "split-blank":
        replacedText = selectedText.replace(/ /g, "\n");
        break;
      case "Chinese-punctuation":
        replacedText = selectedText;
        if (this.settings.RemoveBlanksWhenChinese) {
          replacedText = removeAllSpaces(selectedText).replace(/[\u4e00-\u9fa5【】（）「」《》：“？‘、](\s+)[\u4e00-\u9fa5【】（）「」《》：“？‘、]/g, "");
        }
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
        replacedText = convertLatex(selectedText);
        break;
      case "decodeURI":
        replacedText = selectedText.replace(
          /(\w+):\/\/[-\w+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g,
          function (t) {
            return decodeURI(t)
              .replace(/\s/g, "%20")
              .replace(/%2F/g, "/");
          }
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
      case "link-wiki2md":
        replacedText = convertWikiLinkToMarkdown(selectedText, this);
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
      case "custom-replace":
        replacedText = customReplace(selectedText, args);
        break;
      default:
        replacedText = null;
    }
    return replacedText
  }

  editorTextFormat(editor: Editor, view: MarkdownView, cmd: string, args: any = ""): void {
    // if nothing is selected, select the whole line.
    const somethingSelected = editor.somethingSelected();
    const origin_cursor_from = editor.getCursor("from");
    const origin_cursor_to = editor.getCursor("to");
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

    let selectedText = editor.getSelection();

    let from = editor.getCursor("from"),
      to = editor.getCursor("to");
    let cursorOffset = 0;

    //： Adjust Selection
    switch (cmd) {
      case "capitalize-word":
      case "capitalize-sentence":
        //: Lower case text if setting is true
        if (this.settings.LowercaseFirst) {
          selectedText = selectedText.toLowerCase();
        }
        break;
      case "split-blank":
      case "bullet":
      case "convert-ordered":
      case "callout":
        //: Force to select whole paragraph(s)
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
        //: Select whole file if nothing selected
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

    //: Modify selected text
    let replacedText = this.textFormat(selectedText, cmd, args);
    if (replacedText === null) {
      switch (cmd) {
        case "heading":
          const headingRes = headingLevel(selectedText, args);
          replacedText = headingRes.text;
          cursorOffset = headingRes.offset
          break;
        case "api-request":
          let p = requestAPI(selectedText, view.file, args);
          p.then(result => {
            replacedText = result;
            editor.setSelection(from, to);
            if (replacedText != selectedText) { editor.replaceSelection(replacedText); }
            editor.setSelection(from, editor.getCursor("head"));
            return;
          })
          return;
        case "callout":
          const wholeContent = editor.getValue();
          let type = this.settings.calloutType;
          if (type.startsWith("!")) {
            type = type.substring(1, type.length);
          } else {
            const preCallouts = wholeContent.match(/(?<=\n\>\s*\[\!)\w+(?=\])/gm);
            if (preCallouts) {
              type = preCallouts[preCallouts.length - 1];
            }
          }
          const lines = selectedText.replace(/$\n>/g, "").split("\n");
          replacedText = `> [!${type}] ${lines[0]}`
          if (lines.length > 1) {
            for (let idx = 1; idx < lines.length; idx++) {
              replacedText += `\n> ` + lines[idx];
            }
          }
          break;
        default:
          Error("Unknown command")
          return;
      }
    }

    // change text only when two viable is different
    if (replacedText != selectedText) {
      editor.replaceSelection(replacedText);
    }

    //: Set cursor selection
    const fos = editor.posToOffset(editor.getCursor("from"));
    switch (cmd) {
      case "merge":
      case "remove-blank-line":
      case "bullet":
        //: Select whole modifications 
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
