import {
  Editor, MarkdownView, Plugin, Notice, debounce, normalizePath,
  EditorSelectionOrCaret, EditorRangeOrCaret, EditorChange, EditorPosition, MarkdownFileInfo
} from "obsidian";
import { removeWikiLink, removeUrlLink, url2WikiLink, convertWikiLinkToMarkdown } from "./link";
import { TextFormatSettingTab } from "./settings/settingTab";
import { FormatSettings, DEFAULT_SETTINGS, CalloutTypeDecider, CustomReplaceBuiltIn } from "./settings/types";
import { array2markdown, table2bullet, capitalizeWord, capitalizeSentence, removeAllSpaces, zoteroNote, textWrapper, replaceLigature, ankiSelection, sortTodo, requestAPI, headingLevel, slugify, snakify, extraDoubleSpaces, toTitleCase, customReplace, convertLatex, camelCase } from "./format";
import { CustomReplacementBuiltInCommands, GlobalCommands } from "./commands";
import { getString } from "./langs/langs";
import { selectionBehavior, FormatSelectionReturn } from "./types";
import { v4 as uuidv4 } from "uuid";
import { renew } from "./util";

function getLang() {
  let lang = window.localStorage.getItem('language');
  if (["en", "zh", "zh-TW"].indexOf(lang) == -1) { lang = "en"; }
  return lang;
}


export default class TextFormat extends Plugin {
  settings: FormatSettings;
  debounceUpdateCommandWrapper = debounce(this.updateCommandWrapper, 1000, true);
  debounceUpdateCommandRequest = debounce(this.updateCommandRequest, 1000, true);
  // memory: TextFormatMemory;

  executeCommandById(cmd: string) {
    // @ts-ignore
    this.app.commands.executeCommandById(cmd);
  }

  async quickFormat(text: string, cmd: string) {
    let formatRes = await this.formatSelection(text, cmd);
    let res = formatRes.editorChange.text
    if (res)
      return res;
    return text;
  }

  async formatGlobal(cmd: string) {
    let activeElement = document.activeElement;
    const activeClasses = activeElement.classList;

    let where = "editor";
    if (activeClasses.contains("inline-title") || activeClasses.contains("view-header-title")) {
      where = "title";
    } else if (activeClasses.contains("metadata-input-longtext")) {
      where = "metadata-long-text"
    } else if (activeClasses.contains("metadata-property")) {
      let longtext = activeElement.querySelector(".metadata-input-longtext");
      if (longtext) {
        activeElement = longtext;
        where = "metadata-long-text"
      }
    }
    const file = this.app.workspace.getActiveFile();

    switch (where) {
      case "editor":
        this.executeCommandById(`obsidian-text-format::private:${cmd}`);
        break;
      case "title":
        const formatResult = await this.formatSelection(file.basename, cmd);
        const newName = formatResult.editorChange.text;
        const newPath = normalizePath(file.parent.path + "/" + newName + "." + file.extension)
        this.app.vault.adapter.rename(file.path, newPath);
        break;
      case "metadata-long-text":
        const activePPElement = activeElement.parentElement.parentElement;
        let metadataKey = activePPElement.getAttribute("data-property-key");
        // focus on parent element, so that the new frontmatter can be updated
        activePPElement.focus();
        if (!file)
          break;
        const text = activeElement.textContent;
        const replacedText = await this.quickFormat(text, cmd);
        await this.app.fileManager.processFrontMatter(file, (fm) => {
          fm[metadataKey] = replacedText;
        });
        // let keyboardEvent = new KeyboardEvent('keydown', {
        //   keyCode: 13, code: 'KeyEnter', key: 'Enter'
        // })
        //  document.activeElement.dispatchEvent(keyboardEvent);
        break;
    }
  }

  async onload() {
    await this.loadSettings();
    await this.initCustomSettings();
    this.addSettingTab(new TextFormatSettingTab(this.app, this));

    const lang = getLang();

    this.registerEvent(this.app.workspace.on('editor-paste', async (evt: ClipboardEvent, editor: Editor, info: MarkdownView | MarkdownFileInfo) => {
      this.log(evt, editor, info)
      // refer: https://github.com/kxxt/obsidian-advanced-paste/blob/cfb04918298f14ffa7f04aefa49beaef9a2e8a76/src/main.ts#L220
      const isManuallyTriggered = evt == null; // Not triggered by Ctrl+V
      if (!isManuallyTriggered && (evt.clipboardData?.getData("application/x-textformat-tag") == "tag")) {
        //: Event was triggered by this plugin, don't handle it again
        return;
      }
      // @ts-ignore
      let formatOnPasteCmdList = info.metadataEditor.properties.find(m => m.key === "tfFormatOnPaste")?.value;
      // console.log(formatOnPasteCmdList)
      if (formatOnPasteCmdList === undefined) {
        if (this.settings.formatOnSaveSettings.enabled) {
          formatOnPasteCmdList = this.settings.formatOnSaveSettings.commandsString.split("\n").map((c) => c.trim().replace(/^[ -]*/g, ""));
        } else return;
      }
      if (formatOnPasteCmdList?.length == 0) return;

      let clipboard = evt.clipboardData.getData('text/html') || evt.clipboardData.getData('text/plain');
      if (!clipboard) { return; }

      evt?.preventDefault();

      for (let cmd of formatOnPasteCmdList) {
        const formatText = (await this.formatSelection(clipboard, cmd)).editorChange.text;
        if (formatText) { clipboard = formatText; }
      }
      // await navigator.clipboard.writeText('Some text to paste');

      const dat = new DataTransfer();
      dat.setData('text/html', `<pre>${clipboard}</pre>`);
      // dat.setData('text/html', clipboard);
      dat.setData("application/x-textformat-tag", "tag");
      const e = new ClipboardEvent("paste", {
        clipboardData: dat,
      });
      // @ts-ignore
      await info.currentMode.clipboardManager.handlePaste(e, editor, info);

      if (formatOnPasteCmdList.includes("easy-typing-format")) {
        // @ts-ignore
        const activePlugins = this.app.plugins.plugins;
        if (activePlugins["easy-typing-obsidian"]) {
          try {
            const pluginEasyTyping = activePlugins["easy-typing-obsidian"]
            // console.log(.formatSelectionOrCurLine);
            const cursorTo = editor.getCursor("to");
            editor.setSelection(editor.offsetToPos(editor.posToOffset(cursorTo) - clipboard.length), cursorTo);
            pluginEasyTyping.formatSelectionOrCurLine(editor, info);
            editor.setCursor(editor.getCursor("to"));
          } catch (e) { console.error(e) }
        }
      }
    }))

    this.addCommand({
      id: "open-settings",
      name: getString(["command", "open-settings"]),
      icon: "bolt",
      callback: () => {
        // @ts-ignore
        const settings = this.app.setting;
        settings.open();
        settings.openTabById(`obsidian-text-format`);
      },
    });

    GlobalCommands.forEach(command => {
      this.addCommand({
        id: command.id,
        name: getString(["command", command.id]),
        icon: "case-sensitive",
        callback: async () => {
          await this.formatGlobal(command.id);
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
    this.addCommand({
      id: "slugify",
      name: { en: "Slugify selected text (`-` for space)", zh: "使用 Slugify 格式化选中文本（`-`连字符）", "zh-TW": "使用 Slugify 格式化選取文字（`-`連字符）" }[lang],
      icon: "case-sensitive",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "slugify");
      },
    });
    this.addCommand({
      id: "snakify",
      name: { en: "Snakify selected text (`_` for space)", zh: "使用 Snakify 格式化选中文本（`_`连字符）", "zh-TW": "使用 Snakify 格式化選取文字（`_`連字符）" }[lang],
      icon: "case-sensitive",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "snakify");
      },
    });
    this.addCommand({
      id: "camel-case-lower",
      name: { en: "camelCase selected text", zh: "使用小驼峰格式化选中文本", "zh-TW": "使用小駝峰格式化選取文字" }[lang],
      icon: "case-sensitive",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "camel-case", { lowerFirst: true });
      },
    });
    this.addCommand({
      id: "camel-case-upper",
      name: { en: "CamelCase selected text", zh: "使用大驼峰格式化选中文本", "zh-TW": "使用大駝峰格式化選取文字" }[lang],
      icon: "case-sensitive",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "camel-case", { lowerFirst: false });
      },
    });

    this.addCommand({
      id: "heading-upper",
      name: getString(["command", "heading-upper"]),
      icon: "indent-increase",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "heading", { upper: true });
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
      name: getString(["command", "heading-lower"]),
      icon: "indent-decrease",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "heading", { upper: false });
      },
      repeatable: false,
      hotkeys: [
        {
          modifiers: ["Ctrl", "Shift"],
          key: "[",
        }],
    });

    this.addCommand({
      id: "convert-bullet-list",
      name: { en: "Detect and format bullet list", zh: "识别并格式化无序列表", "zh-TW": "識別並格式化無序清單" }[lang],
      icon: "list",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "convert-bullet-list");
      },
    });
    this.addCommand({
      id: "convert-ordered-list",
      name: { en: "Detect and format ordered list", zh: "识别并格式化有序列表", "zh-TW": "識別並格式化有序清單" }[lang],
      icon: "list-ordered",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "convert-ordered-list");
      },
    });
    this.addCommand({
      id: "table2bullet",
      name: { en: "Convert table to bullet list without header", zh: "将表格转换为无序列表（不含标题）", "zh-TW": "將表格轉換為無序清單（不含標題）" }[lang],
      icon: "list",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "table2bullet");
      },
    });
    this.addCommand({
      id: "table2bullet-head",
      name: { en: "Convert table to bullet list with header", zh: "将表格转换为无序列表（含标题）", "zh-TW": "將表格轉換為無序清單（含標題）" }[lang],
      icon: "list",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "table2bullet-header");
      },
    });
    this.addCommand({
      id: "sort-todo",
      name: { en: "Sort to-do list", zh: "将待办事项列表排序", "zh-TW": "將待辦事項列表排序" }[lang],
      icon: "arrow-down-narrow-wide",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "sort-todo");
      },
    });

    this.addCommand({
      id: "remove-wiki-link",
      name: { "en": "Remove WikiLinks format in selection", "zh": "移除选中文本中的 WikiLinks 格式", "zh-TW": "移除選取文字中的 WikiLinks 格式" }[lang],
      icon: "link-2-off",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "remove-wiki-link");
      },
    });
    this.addCommand({
      id: "remove-url-link",
      name: { "en": "Remove URL links format in selection", "zh": "移除选中文本中的 URL 链接格式", "zh-TW": "移除選取文字中的 URL 鏈接格式" }[lang],
      icon: "link-2-off",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "remove-url-link");
      },
    });
    this.addCommand({
      id: "link-url2wiki",
      name: { en: "Convert URL links to WikiLinks in selection", zh: "将选中文本中的 URL 链接转换为 WikiLinks 格式", "zh-TW": "將選取文字中的 URL 鏈接轉換為 WikiLinks 格式" }[lang],
      icon: "link-2",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "link-url2wiki");
      },
    });
    this.addCommand({
      id: "link-wiki2md",
      name: { en: "Convert wikiLinks to plain markdown links in selection", zh: "将选中文本中的 WikiLinks 转换为普通 Markdown 链接格式", "zh-TW": "將選取文字中的 WikiLinks 轉換為普通 Markdown 鏈接格式" }[lang],
      icon: "link-2",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "link-wiki2md");
      },
    });


    this.addCommand({
      id: "remove-redundant-spaces",
      name: { en: "Remove redundant spaces in selection", zh: "将选中文本中的多余空格移除", "zh-TW": "將選取文字中的多餘空格移除" }[lang],
      icon: "space",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "remove-redundant-spaces");
      },
    });
    this.addCommand({
      id: "remove-spaces-all",
      name: { en: "Remove all spaces in selection", zh: "将选中文本中的所有空格移除", "zh-TW": "將選取文字中的所有空格移除" }[lang],
      icon: "space",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "spaces-all");
      },
    });
    // this.addCommand({
    //   id: "remove-trailing-all",
    //   name: { en: "Remove trailing spaces in selection", zh: "将选中文本中的所有行末空格移除", "zh-TW": "將選取文字中的所有行尾空格移除" }[lang],
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     this.editorTextFormat(editor, view, "trailing-spaces");
    //   },
    // });
    // this.addCommand({
    //   id: "remove-blank-line",
    //   name: { en: "Remove blank line(s)", zh: "将选中文本中的空行移除", "zh-TW": "將選取文字中的空行移除" }[lang],
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     this.editorTextFormat(editor, view, "remove-blank-line");
    //   },
    // });
    this.addCommand({
      id: "merge-line",
      name: { en: "Merge broken paragraph(s) in selection", zh: "将选中文本中的断行合并", "zh-TW": "將選取文字中的斷行合併" }[lang],
      icon: "wrap-text",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "merge-line");
      },
    });
    // this.addCommand({
    //   id: "split-blank",
    //   name: { en: "Split line(s) by blanks", zh: "将选中文本按空格分行", "zh-TW": "將選取文字按空格分行" }[lang],
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     this.editorTextFormat(editor, view, "split-blank");
    //   },
    // });
    this.addCommand({
      id: "chinese-punctuation",
      name: { en: "Convert to Chinese punctuation marks (,;:!?)", zh: "转换为中文标点符号（,;:!?）", "zh-TW": "轉換為中文標點符號（,;:!?）" }[lang],
      icon: "a-large-small",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "Chinese-punctuation");
      },
    });
    this.addCommand({
      id: "english-punctuation",
      name: { en: "Convert to English punctuation marks", zh: "转换为英文标点符号", "zh-TW": "轉換為英文標點符號" }[lang],
      icon: "a-large-small",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "English-punctuation");
      },
    });
    this.addCommand({
      id: "hyphen",
      name: { en: "Remove hyphens", zh: "移除连字符", "zh-TW": "移除連字符" }[lang],
      icon: "a-large-small",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "hyphen");
      },
    });
    this.addCommand({
      id: "ligature",
      name: { "en": "Replace ligature", "zh": "替换连字", "zh-TW": "取代連字" }[lang],
      icon: "a-large-small",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "ligature");
      },
    });


    this.addCommand({
      id: "anki-card",
      name: { "en": "Convert selection into Anki card format", "zh": "将选中内容转换为 Anki 卡片格式", "zh-TW": "將選取內容轉換為 Anki 卡片格式" }[lang],
      icon: "a-large-small",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "anki");
      },
    });
    this.addCommand({
      id: "remove-citation-index",
      name: { en: "Remove citation index", zh: "移除引用索引编号", "zh-TW": "移除引用索引編號" }[lang],
      icon: "a-large-small",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "remove-citation");
      },
    });
    this.addCommand({
      id: "zotero-note",
      name: { en: "Get Zotero note from clipboard and paste", zh: "从剪贴板获取 Zotero 笔记并粘贴", "zh-TW": "從剪貼板獲取 Zotero 筆記並粘貼" }[lang],
      icon: "clipboard-type",
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
      icon: "square-sigma",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "latex-letter");
      },
    });
    this.addCommand({
      id: "mathpix-array2table",
      name: {
        en: "Convert Mathpix's LaTeX array to markdown table", zh: "将 Mathpix 的 LaTeX 数组转换为 Markdown 表格", "zh-TW": "將 Mathpix 的 LaTeX 陣列轉換為 Markdown 表格"
      }[lang],
      icon: "square-sigma",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "array2table");
      },
    });
    this.addCommand({
      id: "callout",
      name: { en: "Callout format", zh: "Callout 格式", "zh-TW": "Callout 格式" }[lang],
      icon: "a-large-small",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "callout");
      },
    });


    this.debounceUpdateCommandWrapper();
    this.debounceUpdateCommandRequest();
    this.debounceUpdateCommandCustomReplace();

    // this.addCommand({
    //   id: "decodeURI",
    //   name: { en: "Decode URL", zh: "解码 URL", "zh-TW": "解碼 URL" }[lang],
    //   icon: "link",
    //   callback: async () => {
    //     const activeElement = document.activeElement;
    //     if (activeElement.classList.contains("metadata-input-longtext")) {
    //       let metadataKey = activeElement.parentElement.parentElement.getAttribute("data-property-key");
    //       // focus on parent element, so that the new frontmatter can be updated
    //       activeElement.parentElement.parentElement.focus();
    //       const file = this.app.workspace.getActiveFile();
    //       const frontmatter = this.app.metadataCache.getCache(file?.path as string)?.frontmatter;
    //       let formatRes = await this.formatSelection(frontmatter[metadataKey], "decodeURI");
    //       if (file) {
    //         await this.app.fileManager.processFrontMatter(file, (fm) => {
    //           fm[metadataKey] = formatRes.editorChange.text;
    //         });
    //         // activeElement.parentElement.focus();
    //       }
    //     } else {
    //       this.executeCommandById(`obsidian-text-format::editor:decodeURI`);
    //     }
    //   },
    // });
    // this.addCommand({
    //   id: ":editor:decodeURI",
    //   name: { en: "Decode URL", zh: "解码 URL", "zh-TW": "解碼 URL" }[lang] + " (Editor)",
    //   icon: "link",
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     this.editorTextFormat(editor, view, "decodeURI");
    //   },
    // });

    this.addCommand({
      id: "space-word-symbol",
      name: { en: "Format space between words and symbols", zh: "格式化单词与符号之间的空格", "zh-TW": "格式化單詞與符號之間的空格" }[lang],
      icon: "space",
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editorTextFormat(editor, view, "space-word-symbol");
      },
    });
  }

  updateCommandWrapper() {
    const lang = getLang();
    this.settings.WrapperList.forEach((wrapper, index) => {
      this.addCommand({
        id: `wrapper:${wrapper.id}`,
        name: { "en": "Wrapper", "zh": "包装器", "zh-TW": "包裝器" }[lang] + " - " + wrapper.name,
        icon: "a-large-small",
        editorCallback: (editor: Editor, view: MarkdownView) => {
          this.editorTextFormat(editor, view, "wrapper", wrapper);
        },
      });
    });
  }
  updateCommandRequest() {
    const lang = getLang();
    this.settings.RequestList.forEach((request, index) => {
      this.addCommand({
        id: `request:${request.id}`,
        name: { "en": "API Request", "zh": "API 请求", "zh-TW": "API 請求" }[lang] + " - " + request.name,
        icon: "a-large-small",
        editorCallback: (editor: Editor, view: MarkdownView) => {
          this.editorTextFormat(editor, view, "api-request", { url: request.url });
        },
      });
    });
  }
  debounceUpdateCommandCustomReplace() {
    const lang = getLang();
    this.settings.customReplaceList.forEach((customReplace, index) => {
      this.addCommand({
        id: `custom-replace:${customReplace.id}`,
        name: { "en": "Custom Replace", "zh": "自定义替换", "zh-TW": "自定義取代" }[lang] + " - " + customReplace.name,
        icon: "a-large-small",
        editorCallback: (editor: Editor, view: MarkdownView) => {
          this.editorTextFormat(editor, view, "custom-replace", { settings: customReplace });
        },
      });
    });
  }

  async formatSelection(selectedText: string, cmd: string, context: any = {}): Promise<FormatSelectionReturn> {
    this.log("formatSelection", selectedText, cmd, context)
    let replacedText: string = selectedText;
    let ret: FormatSelectionReturn = { editorChange: {} as EditorChange };
    try {
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
          replacedText = capitalizeWord(this.settings.LowercaseFirst ? selectedText.toLowerCase() : selectedText);
          break;
        case "capitalize-sentence":
          replacedText = capitalizeSentence(this.settings.LowercaseFirst ? selectedText.toLowerCase() : selectedText);
          break;
        case "title-case":
          replacedText = toTitleCase(selectedText, this.settings);
          break;
        case "cycle-case":
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
            // console.log(resText, toggleSeq[i])
            for (let j = 0; j < textHistory.length; j++) {
              if (textHistory[j] == resText) {
                duplicated = true;
                break;
              }
            }
            if (!duplicated) { //: if the converted text is the same as before cycle case, ignore it
              if (selectedText == resText) { break; }
            }
            textHistory.push(resText);
          }
          //: find the cycle case that is different from the original text
          for (i++; i < i + L; i++) {
            let resText = getNewString(toggleSeq[i % L]);
            if (selectedText != resText) {
              // console.log("!", toggleSeq[i % L])
              replacedText = resText;
              break;
            }
          }
          if (!(replacedText)) { return; }
          break;
        case "remove-redundant-spaces":
          replacedText = selectedText
            .replace(/(\S) {2,}/g, "$1 ")
            .replace(/ $| (?=\n)/g, "");
          // replacedText = replacedText.replace(/\n /g, "\n"); // when a single space left at the head of the line
          break;
        case "spaces-all":
          replacedText = removeAllSpaces(selectedText);
          break;
        case "merge-line":
          replacedText = selectedText.replace(/(?:[^\n])(\n)(?!\n)/g, (t, t1) => t.replace(t1, " "));
          if (this.settings.MergeParagraph_Newlines) {
            replacedText = replacedText.replace(/\n\n+/g, "\n\n");
          }
          if (this.settings.MergeParagraph_Spaces) {
            replacedText = replacedText.replace(/ +/g, " ");
          }
          break;
        case "space-word-symbol":
          replacedText = selectedText
            .replace(/([\u4e00-\u9fa5]+)([\(\[\{])/g, "$1 $2")
            .replace(/([\)\]\}])([a-zA-Z0-9\u4e00-\u9fa5]+)/g, "$1 $2")
            .replace(/([\u4e00-\u9fa5])([a-zA-Z])/g, "$1 $2")
            .replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, "$1 $2");
          break;
        case "remove-citation":
          replacedText = selectedText.replace(/\[\d+\]|【\d+】/g, "").replace(/ +/g, " ");
          break;
        case "convert-ordered-list":
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
            rx, function (t, t1) {
              orderedCount++;
              let head = "\n"; // if single line, then add newline character.
              return t.replace(t1, `${head}${orderedCount}. `);
            }
          );
          replacedText = replacedText.replace(/\n+/g, "\n").replace(/^\n/, "");
          break;
        case "convert-bullet-list":
          let r = this.settings.BulletPoints;//.replace("-", "");
          let bulletSymbolFound = false;
          replacedText = selectedText
            .replace(RegExp(`\s*([${r}] *)|(\n[~\/Vv-] +)`, "g"), (t, t1, t2) => {
              // console.log(t, t1, t2)
              bulletSymbolFound = true;
              return t.replace(t1 || t2, "\n- ")
            })
            .replace(/\n+/g, "\n")
            .replace(/^\n/, "");
          // if "-" in this.settings.BulletPoints
          // if (this.settings.BulletPoints.indexOf("-") > -1) {
          //   replacedText = replacedText.replace(/^- /g, "\n- ");
          // }
          // if select multi-paragraphs, add `- ` to the beginning
          if (bulletSymbolFound && selectedText.indexOf("\n") > -1 && replacedText.slice(0, 2) != "- ") {
            replacedText = "- " + replacedText;
          }
          replacedText = replacedText.replace(/^\n*/, "");
          break;
        // case "split-blank":
        //   replacedText = selectedText.replace(/ /g, "\n");
        //   break;
        case "Chinese-punctuation":
          replacedText = selectedText;
          replacedText = replacedText
            .replace(/(?:[\u4e00-\u9fa5])( ?, ?)(?:[\u4e00-\u9fa5])/g, (t, t1) => t.replace(t1, "，"))
            .replace(/(?:[^\d])( ?\. ?)/g, (t, t1) => t.replace(t1, "。"))
            .replace(/ ?、 ?/g, "、")
            .replace(/;/g, "；")
            .replace(/--/g, "——")
            .replace(/[^a-zA-Z0-9](: ?)/g, (t, t1) => t.replace(t1, "："))
            .replace(/\!(?=[^\[])/g, "！")
            .replace(/\?/g, "？")
            .replace(/[\(（][^\)]*?[\u4e00-\u9fa5]+?[^\)]*?[\)）]/g, (t) => `（${t.slice(1, t.length - 1)}）`);
          // TODO: ignore `!` that is `[!note]`
          if (this.settings.RemoveBlanksWhenChinese) {
            replacedText = replacedText.replace(
              /([\u4e00-\u9fa5【】（）「」《》：“？‘、；])( +)([\u4e00-\u9fa5【】（）「」《》：“？‘、；])/g, "$1$3");
          }
          break;
        case "English-punctuation":
          replacedText = selectedText
            .replace(/[（\(]([\w !\"#$%&'()*+,-./:;<=>?@\[\\\]^_`{\|}~]+)[）\)]/g, "($1)")
            .replace(/(?:[a-zA-Z])(， ?)(?:[a-zA-Z])/g, (t, t1) => t.replace(t1, ", "));
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
          console.log(replacedText);
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
        case "sort-todo":
          // const blocks = selectedText.split(/\n\s*\n/g);
          // const results: string[] = [];
          // for (const block of blocks) {
          //   results.push(sortTodo(block));
          // }
          // replacedText = results.join("\n\n");
          let fromLine = context.adjustRange.from.line;
          if ((context.originRange.from.line === context.originRange.to.line) && (!context.editor.getLine(context.originRange.from.line).match(/\s*- \[[ \w\?\!\-]\] /))) {
            fromLine = null;
          }
          replacedText = sortTodo(selectedText, context, fromLine);
          break;
        case "slugify":
          replacedText = slugify(selectedText);
          break;
        case "snakify":
          replacedText = snakify(selectedText);
          break;
        case "camel-case":
          replacedText = camelCase(selectedText, context.lowerFirst);
          break;
        case "custom-replace":
          replacedText = customReplace(selectedText, context.settings);
          break;
        case "heading":
          const adjustRange = context.adjustRange;
          if (adjustRange.from.line === adjustRange.to.line) {
            const headingRes = headingLevel(selectedText, context.upper, this.settings.headingLevelMin);
            replacedText = headingRes.text;
          } else {
            replacedText = "";
            selectedText.split("\n").forEach((line, index) => {
              const headingRes = headingLevel(line, context.upper, this.settings.headingLevelMin, true);
              replacedText += headingRes.text + "\n";
            });
            replacedText = replacedText.slice(0, -1); // remove the last `\n`
          }
          break;
        case "api-request":
          replacedText = await requestAPI(selectedText, context.view.file, context.url);
          break;
        case "wrapper":
          const wrapperResult = textWrapper(selectedText, context);
          selectedText = wrapperResult.selectedText;
          replacedText = wrapperResult.editorChange.text;
          context.adjustRange = { from: wrapperResult.editorChange.from, to: wrapperResult.editorChange.to };
          // ret.resetSelection = wrapperResult.resetSelection;
          ret.resetSelectionOffset = wrapperResult.resetSelectionOffset;
          break;
        case "callout":
          const reCalloutType = /(?:(^|\n)\>\s*\[\!)(\w+)(?:\])/gm;
          const lines = selectedText.replace(/^\n|\n$/g, "").split("\n");
          if (lines[0].match(reCalloutType)) { //: detect callout grammar, delete callout prefix
            replacedText = lines[0].replace(reCalloutType, "").replace(/^\s*/g, "");
            let i = 1;
            for (; i < lines.length; i++) {
              if (lines[i].match(/^>/g)) {
                replacedText += "\n" + lines[i].replace(/^>\s*/, "");
              } else { break; }
            }
            //: add rest part of lines in original format
            replacedText = (replacedText + "\n" + lines.slice(i, lines.length).join("\n")).replace(/\n$/g, "")
          } else { //: To add callout prefix
            //: Get the previous callout types at first
            let wholeContent, type;
            switch (this.settings.calloutTypeDecider) {
              // case CalloutTypeDecider.lastUsed:
              //   type = this.memory.lastCallout;
              //   break;
              case CalloutTypeDecider.fix:
                type = this.settings.calloutType;
                break;
              case CalloutTypeDecider.wholeFile:
                wholeContent = context.editor.getValue();
                break;
              case CalloutTypeDecider.preContent:
                wholeContent = context.editor.getRange({ line: 0, ch: 0 }, context.adjustRange.from);
                break;
            }
            const preCalloutList = wholeContent.match(reCalloutType);
            if (preCalloutList) {
              type = reCalloutType.exec(preCalloutList[preCalloutList.length - 1])[2];
            } else {
              type = this.settings.calloutType;
            }
            if (type.startsWith("!")) { type = type.substring(1, type.length); }


            replacedText = `> [!${type}] ${lines[0]}`
            if (lines.length > 1) {
              for (let idx = 1; idx < lines.length; idx++) {
                replacedText += `\n> ` + lines[idx];
              }
            }
            // this.memory.lastCallout = type;
          }
          break;
        case "latex-letter":
          replacedText = convertLatex(context.editor, selectedText);
          break;
        default:
          Error("Unknown command");
      }
    } catch (e) {
      new Notice(e);
      console.error(e);
    }

    if (replacedText != selectedText) {
      ret.editorChange = { text: replacedText, ...context?.adjustRange };
    }
    return ret;
  }

  log(...args: any[]): void {
    // TODO: add verbose log setting
    if (this.settings.debugMode) {
      console.log(...args);
    }
  }

  async editorTextFormat(editor: Editor, view: MarkdownView, cmd: string, context: any = {}): Promise<void> {

    const originSelectionList: EditorSelectionOrCaret[] = editor.listSelections();
    const resetSelectionList: EditorSelectionOrCaret[] = [];

    for (let originSelection of originSelectionList) {
      const originRange = selection2range(editor, originSelection);
      const somethingSelected = !(originRange.from.ch == originRange.to.ch && originRange.from.line == originRange.to.line)
      let adjustRange: EditorRangeOrCaret = originRange;

      this.log(originSelection)
      this.log(originRange)

      //： Adjust Selection
      let adjustSelectionCmd: selectionBehavior;
      switch (cmd) {
        case "wrapper":
          //: Keep the selection as it is
          break;
        case "heading":
          adjustSelectionCmd = selectionBehavior.wholeLine;
          break;
        case "split-blank":
        case "convert-bullet-list":
        case "convert-ordered-list":
        case "callout":
          //: Force to select whole paragraph(s)
          adjustSelectionCmd = selectionBehavior.wholeLine;
          break;
        case "sort-todo":
          //: Select whole file if nothing selected
          if (originRange.from.line == originRange.to.line) {
            adjustRange = {
              from: { line: 0, ch: 0 },
              // to: { line: editor.lastLine(), ch: editor.getLine(editor.lastLine()).length }
              to: { line: editor.lastLine() + 1, ch: 0 }
            };
          } else {
            adjustSelectionCmd = selectionBehavior.wholeLine;
          }
          context.originRange = originRange;
          break;
        default:
          if (!somethingSelected) {
            // if nothing is selected, select the whole line.
            adjustSelectionCmd = selectionBehavior.wholeLine;
          }
          //: Except special process of adjusting selection, get all selected text (for now)
          break;
      }

      switch (adjustSelectionCmd) {
        case selectionBehavior.wholeLine: //: Force to select whole paragraph(s)
          adjustRange = {
            from: { line: originRange.from.line, ch: 0 },
            to: { line: originRange.to.line, ch: editor.getLine(originRange.to.line).length }
          };
          break;
        default:
          break;
      }

      const selectedText = editor.getRange(adjustRange.from, adjustRange.to);
      this.log("adjustRange", adjustRange)
      this.log("selectedText", selectedText)

      //: MODIFY SELECTION
      context.editor = editor;
      context.view = view;
      context.adjustRange = adjustRange;
      const formatResult = await this.formatSelection(selectedText, cmd, context);
      this.log("formatResult", formatResult)
      //: Make change immediately

      if (formatResult.editorChange.text == undefined) {
        this.log("nothing changed.")
        editor.setSelections(originSelectionList);
        return;
      }
      editor.transaction({ changes: [formatResult.editorChange] });

      //: Set cursor selection
      let resetSelection: EditorSelectionOrCaret = { anchor: adjustRange.from, head: adjustRange.to };
      const fos = editor.posToOffset(adjustRange.from);
      const replacedText = formatResult.editorChange?.text || selectedText;
      const textOffset = replacedText.length - selectedText.length;
      const cursorLast = editor.offsetToPos(fos + replacedText.length);
      const selections = {
        keepOriginSelection: {
          anchor: editor.offsetToPos(editor.posToOffset(originRange.from) + textOffset),
          head: editor.offsetToPos(editor.posToOffset(originRange.to) + textOffset)
        },
        wholeReplacedText: {
          anchor: adjustRange.from,
          head: cursorLast
        }
      }
      switch (cmd) {
        case "sort-todo":
          resetSelection = originSelection;
          break;
        case "wrapper":
          // resetSelection = formatResult.resetSelection;
          resetSelection = {
            anchor: editor.offsetToPos(formatResult.resetSelectionOffset.anchor),
            head: editor.offsetToPos(formatResult.resetSelectionOffset.head)
          }
          // console.log(resetSelection)
          break;
        case "callout":
        case "heading":
          if (originRange.from.line === originRange.to.line) {
            resetSelection = selections.keepOriginSelection;
          } else {
            resetSelection = selections.wholeReplacedText;
          }
          break;
        default:
          resetSelection = selections.wholeReplacedText;
      }
      this.log("resetSelection", resetSelection)
      resetSelectionList.push(resetSelection);
    }

    this.log("resetSelectionList", resetSelectionList)
    editor.setSelections(resetSelectionList);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.compatibleSettingsUpgrade();
  }

  async saveSettings() {
    await this.saveData(this.settings);

  }

  async initCustomSettings() {
    if (this.manifest.version === this.settings.manifest.version) { return; } // no need to upgrade

    this.compatibleSettingsUpgrade();
    for (let command of CustomReplacementBuiltInCommands) {
      if (!this.settings.customReplaceBuiltInLog[command.id]) {
        this.settings.customReplaceList.push({
          id: command.id,
          name: getString(["command", command.id]),
          data: renew(command.data)
        });
        this.settings.customReplaceBuiltInLog[command.id] = {
          id: command.id,
          modified: false,
          data: renew(command.data)
        };
      } else { // build in command is loaded in older version, then check if modified
        if (!this.settings.customReplaceBuiltInLog[command.id].modified) {
          // upgrade replacement data
          const index = this.settings.customReplaceList.findIndex(item => item.id === command.id);
          // console.log(index);
          if (index > -1) {
            this.settings.customReplaceList[index].data = renew(command.data);
          }
          // this.settings.customReplaceBuiltInLog[command.id].data = command.data;
        }
      }
    }

    await this.backupDataJson();

    // update version AFTER backup data.json
    this.settings.manifest.version = this.manifest.version; // update version
    await this.saveSettings();
  }

  async backupDataJson() {
    // save a backup data.json before overwriting data.json
    const vault = this.app.vault;
    // @ts-ignore
    const originDataPath = normalizePath(this.manifest.dir + "/data.json");
    const newDataPath = normalizePath(this.manifest.dir + `/data-backup-v${this.settings.manifest.version}-to-v${this.manifest.version}.json`);
    if (await vault.adapter.exists(originDataPath)) {
      // exist data.json of old version
      new Notice(`[INFO] Updated ${this.manifest.name} from ${this.settings.manifest.version} to v${this.manifest.version}, backup ongoing...`)
      await vault.adapter.copy(originDataPath, newDataPath);
    }
  }

  compatibleSettingsUpgrade() {
    // uuid init
    for (let i in this.settings.customReplaceList)
      if (!this.settings.customReplaceList[i].id)
        this.settings.customReplaceList[i].id = uuidv4();
    for (let i in this.settings.WrapperList)
      if (!this.settings.WrapperList[i].id)
        this.settings.WrapperList[i].id = uuidv4();
    for (let i in this.settings.RequestList)
      if (!this.settings.RequestList[i].id)
        this.settings.RequestList[i].id = uuidv4();

    // @ts-ignore
    const oldCustomReplaceBuiltIn = this.settings.customReplaceBuiltIn;
    if (oldCustomReplaceBuiltIn &&
      (!this.settings.customReplaceBuiltInLog || Object.keys(this.settings.customReplaceBuiltInLog).length == 0)) {
      console.log("upgrade customReplaceBuiltInLog")
      let newBuiltIn: { [id: string]: CustomReplaceBuiltIn } = {};
      for (const i in oldCustomReplaceBuiltIn) {
        const id: string = oldCustomReplaceBuiltIn[i]; // string
        newBuiltIn[id] = { id: id, modified: false, data: CustomReplacementBuiltInCommands.find(x => x.id === id).data };
      }
      this.settings.customReplaceBuiltInLog = newBuiltIn;
    }
  }
}



function selection2range(editor: Editor, selection: EditorSelectionOrCaret): { readonly from: EditorPosition, readonly to: EditorPosition } {
  let anchorOffset = editor.posToOffset(selection.anchor),
    headOffset = editor.posToOffset(selection.head);
  const from = editor.offsetToPos(Math.min(anchorOffset, headOffset));
  const to = editor.offsetToPos(Math.max(anchorOffset, headOffset));
  return { from: from, to: to };
}