import { MarkdownView, Plugin } from "obsidian";

export default class Underline extends Plugin {
  async onload() {
    this.addCommand({
      id: "text-format-lower",
      name: "Lower text",
      callback: () => this.textFormat("lower"),
    });
    this.addCommand({
      id: "text-format-upper",
      name: "Upper text",
      callback: () => this.textFormat("upper"),
    });
    this.addCommand({
      id: "text-format-capitalize",
      name: "Capitalize text",
      callback: () => this.textFormat("capitalize"),
    });
    this.addCommand({
      id: "text-format-remove-blanks",
      name: "Remove redundant blanks",
      callback: () => this.textFormat("blanks"),
    });
    this.addCommand({
      id: "text-format-remove-enter",
      name: "Remove all enters in selection",
      callback: () => this.textFormat("enters"),
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
        case "lower":
          replacedText = selectedText.toLowerCase();
          break;
        case "upper":
          replacedText = selectedText.toUpperCase();
          break;
        case "capitalize":
          replacedText = toTitleCase(selectedText);
          break;
        case "blanks":
          replacedText = selectedText.replace(/    /g, "\t");
          while (replacedText.indexOf(`  `) > -1) {
            replacedText = replacedText.replace(/  /g, " ");
          }
          replacedText = replacedText.replace(/\n /g, "\n");
          break;
        case "enters":
          replacedText = selectedText.replace(/\n/g, " ");
          while (replacedText.indexOf(`  `) > -1) {
            replacedText = replacedText.replace(/  /g, " ");
          }
          break;
        default:
          break;
      }
      editor.replaceSelection(replacedText);
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
