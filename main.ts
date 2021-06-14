import { MarkdownView, Plugin, Setting, PluginSettingTab, App } from "obsidian";

import "node_modules/@gouch/to-title-case/to-title-case";

export default class TextFormat extends Plugin {
  settings: FormatSettings;

  async onload() {
    await this.loadSettings();

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
      id: "text-format-capitalize",
      name: "Capitalize selected text",
      callback: () => this.textFormat("capitalize"),
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
      id: "text-format-merge-line",
      name: "Merge broken paragraph(s) in selection",
      callback: () => this.textFormat("merge"),
    });
    this.addSettingTab(new TextFormatSettingTab(this.app, this));
  }

  textFormat(cmd: string): void {
    let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return;
    }
    let editor = markdownView.editor;

    var selectedText, replacedText;
    if (!editor.somethingSelected()) {
      let cursor = editor.getCursor();
      cursor.ch = 0;
      let aos = editor.posToOffset(cursor);
      cursor.line += 1;
      let hos = editor.posToOffset(cursor);
      editor.setSelection(editor.offsetToPos(aos), editor.offsetToPos(hos - 1));
    }
    selectedText = editor.getSelection();
    switch (cmd) {
      case "lowercase":
        replacedText = selectedText.toLowerCase();
        break;
      case "uppercase":
        replacedText = selectedText.toUpperCase();
        break;
      case "capitalize":
        replacedText = toTitleCase(selectedText);
        break;
      case "titlecase":
        // @ts-ignore
        replacedText = selectedText.toTitleCase();
        break;
      case "spaces":
        replacedText = selectedText.replace(/ +/g, " ");
        // replacedText = replacedText.replace(/\n /g, "\n"); // when a single space left at the head of the line
        break;
      case "merge":
        replacedText = selectedText.replace(/(?<!\n)\n(?!\n)/g, " ");
        console.log(this.settings);
        if (this.settings.MergeParagraph_Newlines) {
          replacedText = replacedText.replace(/\n\n+/g, "\n\n");
        }
        if (this.settings.MergeParagraph_Spaces) {
          replacedText = replacedText.replace(/ +/g, " ");
        }
        break;
      default:
        return;
    }

    const fos = editor.posToOffset(editor.getCursor("from"));
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

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, function (t) {
    return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
  });
}

/* ----------------------------------------------------------------
   --------------------------Settings------------------------------
   ---------------------------------------------------------------- */
interface FormatSettings {
  MergeParagraph_Newlines: boolean;
  MergeParagraph_Spaces: boolean;
}

const DEFAULT_SETTINGS: FormatSettings = {
  MergeParagraph_Newlines: true,
  MergeParagraph_Spaces: true,
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
  }
}
