import { MarkdownView, Plugin } from "obsidian";

export default class Underline extends Plugin {
  async onload() {
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
      id: "text-format-remove-spaces",
      name: "Remove redundant spaces in selection",
      callback: () => this.textFormat("spaces"),
    });
    this.addCommand({
      id: "text-format-remove-newline",
      name: "Remove all newline characters in selection",
      callback: () => this.textFormat("newline"),
    });
  }

  textFormat(cmd: string): void {
    let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return;
    }
    let editor = markdownView.editor;

    if (editor.somethingSelected()) {
      let selectedText = editor.getSelection();
      let replacedText;
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
        case "spaces":
          replacedText = selectedText.replace(/    /g, "\t"); // four spaces to be a tab
          while (replacedText.indexOf(`  `) > -1) {
            replacedText = replacedText.replace(/  /g, " ");
          }
          replacedText = replacedText.replace(/\n /g, "\n"); // when a single space left at the head of the line
          break;
        case "newline":
          replacedText = selectedText.replace(/\n/g, " ");
          while (replacedText.indexOf(`  `) > -1) {
            replacedText = replacedText.replace(/  /g, " ");
          }
          break;
        default:
          return;
          break;
      }
      if (replacedText != selectedText) {
        editor.replaceSelection(replacedText);
      }
    }
  }
}

function toTitleCase(phrase: string): string {
  return phrase
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
