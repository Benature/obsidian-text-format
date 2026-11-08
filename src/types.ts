import { Editor, EditorSelectionOrCaret, EditorChange, EditorRangeOrCaret, MarkdownFileInfo } from "obsidian";
import { customReplaceSetting } from "./settings/types";

export enum selectionBehavior {
    default = "do-nothing",
    wholeLine = "select-whole-line",
}

export interface FormatContext {
    editor?: Editor;
    view?: MarkdownFileInfo & {
        metadataEditor?: {
            properties?: Array<{ key: string; value: string }>;
        };
    };
    adjustRange?: EditorRangeOrCaret;
    originRange?: EditorRangeOrCaret;
    prefix?: string;
    suffix?: string;
    settings?: customReplaceSetting;
    upper?: boolean;
    lowerFirst?: boolean;
    url?: string;
}

export interface FormatSelectionReturn {
    editorChange: EditorChange,
    resetSelection?: EditorSelectionOrCaret,
    resetSelectionOffset?: { anchor: number, head: number },
}

// export interface TextFormatMemory {
//     lastCallout: string;
// }