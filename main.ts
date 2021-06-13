import { MarkdownView, Plugin } from "obsidian";

import "node_modules/@gouch/to-title-case/to-title-case";

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
        case "titlecase":
          // @ts-ignore
          replacedText = selectedText.toTitleCase();
          break;
        case "spaces":
          replacedText = selectedText.replace(/ +/g, " ");
          // replacedText = replacedText.replace(/\n /g, "\n"); // when a single space left at the head of the line
          break;
        case "newline":
          replacedText = selectedText.replace(/(?<!\n)\n(?!\n)/g, " ");
          // replacedText = selectedText.replace(/ +/g, " ");
          break;
        default:
          return;
      }

      if (replacedText != selectedText) {
        editor.replaceSelection(replacedText);
      }

      if (cmd != "newline") {
        const tos = editor.posToOffset(editor.getCursor("to")); // to offset
        editor.setSelection(
          editor.offsetToPos(tos - replacedText.length),
          editor.offsetToPos(tos)
        );
      } else {
        let anchor = editor.getCursor("anchor");
        let head = editor.getCursor("head");
        anchor.ch = 0;
        editor.setSelection(anchor, head);
      }
    }
  }
}

function toTitleCase(s: string): string {
  return s.replace(/\w\S*/g, function (t) {
    return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase();
  });
}
