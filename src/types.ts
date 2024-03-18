import { EditorSelectionOrCaret, EditorChange } from "obsidian";

export enum selectionBehavior {
    default = "do-nothing",
    wholeLine = "select-whole-line",
}

export interface FormatSelectionReturn {
    editorChange: EditorChange,
    resetSelection?: EditorSelectionOrCaret
}