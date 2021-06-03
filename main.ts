import { MarkdownView, Plugin } from "obsidian";

export default class Underline extends Plugin {
  async onload() {
    this.addCommand({
      id: "text-format-lower",
      name: "Lower text",
      callback: () => this.textLower("lower"),
    });
    this.addCommand({
      id: "text-format-upper",
      name: "Upper text",
      callback: () => this.textLower("upper"),
    });
    this.addCommand({
      id: "text-format-capitalize",
      name: "Capitalize text",
      callback: () => this.textLower("capitalize"),
    });
  }

  textLower(cmd: string): void {
    let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return;
    }
    let editor = markdownView.editor;

    if (editor.somethingSelected()) {
      let selectedText = editor.getSelection();
      switch (cmd) {
        case "lower":
          editor.replaceSelection(selectedText.toLowerCase());
          break;
        case "upper":
          editor.replaceSelection(selectedText.toUpperCase());
          break;
        case "capitalize":
          editor.replaceSelection(toTitleCase(selectedText));
          break;
        default:
          break;
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
