import { MarkdownView, Plugin, Setting, PluginSettingTab, App } from "obsidian";
import { decode } from "querystring";

export default class TextFormat extends Plugin {
  settings: FormatSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TextFormatSettingTab(this.app, this));

    this.addCommand({
      id: "text-format-lower",
      name: "Lowercase selected text",
      callback: () => this.textFormat("lowercase"),
    });
    this.addCommand({
      id: "text-format-upper",
      name: "Uppercase selected text",
      callback: () => this.textFormat("uppercase"),
    });
    this.addCommand({
      id: "text-format-capitalize-word",
      name: "Capitalize all words in selected text",
      callback: () => this.textFormat("capitalize-word"),
    });
    this.addCommand({
      id: "text-format-capitalize-sentence",
      name: "Capitalize only first word of sentence in selected text",
      callback: () => this.textFormat("capitalize-sentence"),
    });
    this.addCommand({
      id: "text-format-titlecase",
      name: "Title case selected text",
      callback: () => this.textFormat("titlecase"),
    });
    this.addCommand({
      id: "text-format-remove-spaces",
      name: "Remove redundant spaces in selection",
      callback: () => this.textFormat("spaces"),
    });
    this.addCommand({
      id: "text-format-remove-spaces-all",
      name: "Remove all spaces in selection",
      callback: () => this.textFormat("spaces-all"),
    });
    this.addCommand({
      id: "text-format-remove-blank-line",
      name: "Remove blank line(s)",
      callback: () => this.textFormat("remove-blank-line"),
    });
    this.addCommand({
      id: "text-format-merge-line",
      name: "Merge broken paragraph(s) in selection",
      callback: () => this.textFormat("merge"),
    });
    this.addCommand({
      id: "text-format-bullet-list",
      name: "Format bullet list",
      callback: () => this.textFormat("bullet"),
    });
    this.addCommand({
      id: "text-format-convert-ordered-list",
      name: "Format ordered list",
      callback: () => this.textFormat("convert-ordered"),
    });
    // this.addCommand({
    //   id: "text-format-toggle-ordered-list",
    //   name: "Toggle ordered list",
    //   callback: () => this.textFormat("toggle-ordered"),
    // });
    this.addCommand({
      id: "text-format-split-blank",
      name: "Split line(s) by blanks",
      callback: () => this.textFormat("split-blank"),
    });
    this.addCommand({
      id: "text-format-chinese-character",
      name: "Convert to Chinese character (,;:!?)",
      callback: () => this.textFormat("Chinese"),
    });
    this.addCommand({
      id: "text-format-latex-single-letter",
      name: "Convert single letter into math mode",
      callback: () => this.textFormat("latex-letter"),
    });
    this.addCommand({
      id: "text-format-decodeURI",
      name: "Decode URL",
      callback: () => this.textFormat("decodeURI"),
    });
    this.addCommand({
      id: "text-format-paragraph-double-spaces",
      name: "Add extra double spaces per paragraph for whole file (beta)",
      callback: () => this.extraDoubleSpaces(),
    });
    this.addCommand({
      id: "text-format-add-line-break",
      name: "Add extra line break to paragraph",
      callback: () => this.textFormat("add-line-break"),
    });
  }

  extraDoubleSpaces(): void {
    let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return;
    }
    let editor = markdownView.editor;
    let content = editor.getValue();
    content = content.replace(
      /(?<=(^---\n[\s\S]*?\n---\n|^))[\s\S]+$/g,
      function (match) {
        return match.replace(/(?<=\n).*[^-\n]+.*(?=\n)/g, function (t) {
          return `${t}  `;
        });
      }
    );
    editor.setValue(content);
  }

  textFormat(cmd: string): void {
    let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return;
    }
    let editor = markdownView.editor;

    var selectedText: string, replacedText;

    // if nothing is selected, select the whole line.
    if (!editor.somethingSelected()) {
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

    // adjust selection
    switch (cmd) {
      case "capitalize-word":
      case "capitalize-sentence":
      case "titlecase":
        // lower case text if setting is true
        if (this.settings.LowercaseFirst) {
          selectedText = selectedText.toLowerCase();
        } else {
          selectedText = selectedText;
        }
        break;
      case "split-blank":
      case "bullet":
      case "ordered":
        let from = editor.getCursor("from");
        let to = editor.getCursor("to");
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
      default:
        break;
    }

    // modify selection text
    switch (cmd) {
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
      case "spaces":
        replacedText = selectedText.replace(/ +/g, " ");
        // replacedText = replacedText.replace(/\n /g, "\n"); // when a single space left at the head of the line
        break;
      case "spaces-all":
        replacedText = removeAllSpaces(selectedText);
        break;
      case "merge":
        replacedText = selectedText.replace(/(?<!\n)\n(?!\n)/g, " ");
        // console.log(this.settings);
        if (this.settings.MergeParagraph_Newlines) {
          replacedText = replacedText.replace(/\n\n+/g, "\n\n");
        }
        if (this.settings.MergeParagraph_Spaces) {
          replacedText = replacedText.replace(/ +/g, " ");
        }
        break;
      case "remove-blank-line":
        replacedText = selectedText.replace(/\n+/g, "\n");
        break;
      case "add-line-break":
        replacedText = selectedText.replace(/\n/g, "\n\n");
        break;
      case "bullet":
        replacedText = selectedText
          .replace(/(^|(?<=[\s])) *• */g, "\n- ")
          .replace(/\n+/g, "\n")
          .replace(/^\n/, "");
        break;
      // case "toggle-ordered":
      //   break;
      case "convert-ordered":
        let orderedCount = 0;
        var rx = new RegExp(
          "(^|\\s)[^\\s\\(\\[\\]]+\\)" +
            "|" +
            /* (?<=^|\s)
              (
                [0-9]\.
                |
                [:;]?\w+[）\)]
              ) */
            "(?<=^|[\\s，。])([:;]?(\\w|i{1,4})[）\\)]|[0-9]\\.)",
          "g"
        );

        replacedText = selectedText.replace(
          rx,
          // /(^|\s)[^\s\[\(\]]+\)|[:;]?\w+[）\)]|(?<=^|\s)[0-9]\./g,
          function (t) {
            orderedCount++;
            // console.log(orderedCount, t);
            let head = "\n"; // if single line, then add newline character.
            if (selectedText.indexOf("\n") > -1) {
              head = "";
            }
            return head + String(orderedCount) + ". ";
          }
        );
        replacedText = replacedText.replace(/\n+/g, "\n").replace(/^\n/, "");
        break;
      case "split-blank":
        replacedText = selectedText.replace(/ /g, "\n");
        break;
      case "Chinese":
        if (this.settings.RemoveBlanksWhenChinese) {
          selectedText = removeAllSpaces(selectedText);
        }
        replacedText = selectedText
          .replace(/ ?, ?/g, "，")
          .replace(/ ?\. ?/g, "。")
          .replace(/ ?、 ?/g, "、")
          .replace(/;/g, "；")
          .replace(/(?<=[^a-zA-Z0-9]):/g, "：")
          .replace(/\!(?=[^\[])/g, "！")
          .replace(/\?/g, "？")
          .replace(/\([^\)]*?[\u4e00-\u9fa5]+?[^\)]*?\)/g, function (t) {
            return `（${t.slice(1, t.length - 1)}）`;
          });
        break;
      case "latex-letter":
        replacedText = selectedText.replace(
          /(?<= )[b-zA-Z](?=[ ,\.?!，。、])/g,
          function (t) {
            return `$${t}$`;
          }
        );
        break;
      case "decodeURI":
        replacedText = selectedText.replace(
          /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g,
          function (t) {
            return decodeURI(t);
          }
        );

        break;
      default:
        return;
    }

    const fos = editor.posToOffset(editor.getCursor("from"));
    // change text only when two viable is different
    if (replacedText != selectedText) {
      editor.replaceSelection(replacedText);
    }

    if (cmd != "merge") {
      const tos = editor.posToOffset(editor.getCursor("to")); // to offset
      editor.setSelection(
        editor.offsetToPos(tos - replacedText.length),
        editor.offsetToPos(tos)
      );
    } else {
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

/* ----------------------------------------------------------------
   --------------------------Settings------------------------------
   ---------------------------------------------------------------- */

interface FormatSettings {
  MergeParagraph_Newlines: boolean;
  MergeParagraph_Spaces: boolean;
  LowercaseFirst: boolean;
  RemoveBlanksWhenChinese: boolean;
}

const DEFAULT_SETTINGS: FormatSettings = {
  MergeParagraph_Newlines: true,
  MergeParagraph_Spaces: true,
  LowercaseFirst: false,
  RemoveBlanksWhenChinese: false,
};
class TextFormatSettingTab extends PluginSettingTab {
  plugin: TextFormat;

  constructor(app: App, plugin: TextFormat) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h3", { text: "Lowercase" });

    new Setting(containerEl)
      .setName("Lowercase before capitalize/title case")
      .setDesc(
        "When running the capitalize or title case command, the plugin will lowercase the selection at first."
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.LowercaseFirst)
          .onChange(async (value) => {
            this.plugin.settings.LowercaseFirst = value;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("h3", { text: "Merge broken paragraphs behavior" });

    new Setting(containerEl)
      .setName("Remove redundant blank lines")
      .setDesc(
        'change blank lines into single blank lines, e.g. "\\n\\n\\n" will be changed to "\\n\\n"'
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.MergeParagraph_Newlines)
          .onChange(async (value) => {
            this.plugin.settings.MergeParagraph_Newlines = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Remove redundant blank spaces")
      .setDesc("ensure only one space between words")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.MergeParagraph_Spaces)
          .onChange(async (value) => {
            this.plugin.settings.MergeParagraph_Spaces = value;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("h3", { text: "When converting Chinese characters" });

    new Setting(containerEl)
      .setName("Remove all spaces")
      .setDesc("for OCR case")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.RemoveBlanksWhenChinese)
          .onChange(async (value) => {
            this.plugin.settings.RemoveBlanksWhenChinese = value;
            await this.plugin.saveSettings();
          });
      });
  }
}

/* ----------------------------------------------------------------
   --------------------------Function------------------------------
   ---------------------------------------------------------------- */

const LC = "[\\w\\u0400-\\u04FF]"; // Latin and Cyrillic

function capitalizeWord(str: string): string {
  var rx = new RegExp(LC + "\\S*", "g");
  return str.replace(rx, function (t) {
    return t.charAt(0).toUpperCase() + t.substr(1);
  });
}

function capitalizeSentence(s: string): string {
  var rx = new RegExp(
    "(^|\\n|[\"'])" + LC + "|(?<=[\\.!?~]\\s+)" + LC + "",
    "g"
  );

  // return s.replace(/^\S|(?<=[\.!?\n~]\s+)\S/g, function (t) {
  return s.replace(rx, function (t) {
    return t.toUpperCase();
  });
}

function removeAllSpaces(s: string): string {
  return s.replace(/(?<![\)\]:#-]) | $/g, "");
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
