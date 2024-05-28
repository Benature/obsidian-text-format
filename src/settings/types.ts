
export interface WrapperSetting {
    id: string;
    name: string;
    prefix: string;
    suffix: string;
}

export interface APIRequestSetting {
    id: string;
    name: string;
    url: string;
}

export interface WikiLinkFormatGroup {
    headingOnly: string;
    aliasOnly: string;
    both: string;
}

export interface customReplaceSettingPair {
    search: string;
    replace: string;
}

export interface customReplaceSetting {
    id: string;
    name: string;
    data: Array<customReplaceSettingPair>;
}

export enum Wikilink2mdPathMode {
    relativeObsidian = "relative-obsidian",
    relativeFile = "relative-file",
    absolute = "absolute",
}

export enum CalloutTypeDecider {
    wholeFile = "whole-file",
    preContent = "previous-content",
    // lastUsed = "last-used",
    fix = "fix",
}

export interface CustomReplaceBuiltIn {
    id: string;
    modified: boolean;
    data: Array<customReplaceSettingPair>;
}

export interface FormatSettings {
    manifest: {
        version: string;
    }
    MergeParagraph_Newlines: boolean;
    MergeParagraph_Spaces: boolean;
    LowercaseFirst: boolean;
    RemoveBlanksWhenChinese: boolean;
    ZoteroNoteRegExp: string;
    ZoteroNoteTemplate: string;
    BulletPoints: string;
    WrapperList: Array<WrapperSetting>;
    RequestList: Array<APIRequestSetting>;
    customReplaceList: Array<customReplaceSetting>;
    customReplaceBuiltInLog: { [id: string]: CustomReplaceBuiltIn };
    ToggleSequence: string;
    RemoveWikiURL2: boolean;
    WikiLinkFormat: WikiLinkFormatGroup;
    UrlLinkFormat: string;
    ProperNoun: string;
    OrderedListOtherSeparator: string;
    Wikilink2mdRelativePath: Wikilink2mdPathMode;
    calloutType: string;
    debugMode: boolean;
    headingLevelMin: number;
    calloutTypeDecider: CalloutTypeDecider;
    formatOnSaveSettings: {
        enabled: boolean;
        commandsString: string;
    }
}

export const DEFAULT_SETTINGS: FormatSettings = {
    manifest: {
        version: "0.0.0",
    },
    MergeParagraph_Newlines: true,
    MergeParagraph_Spaces: true,
    LowercaseFirst: true,
    RemoveBlanksWhenChinese: false,
    ZoteroNoteRegExp: String.raw`“(?<text>.*)” \((?<item>.*?)\) \(\[pdf\]\((?<pdf_url>.*?)\)\)`,
    ZoteroNoteTemplate: "{text} [🔖]({pdf_url})",
    BulletPoints: "•–§",
    WrapperList: [{ name: "underline", prefix: "<u>", suffix: "</u>", id: "underline" }],
    RequestList: [],
    customReplaceList: [],
    customReplaceBuiltInLog: {},
    ToggleSequence: "titleCase\nlowerCase\nupperCase",
    RemoveWikiURL2: false,
    WikiLinkFormat: { headingOnly: "{title} (> {heading})", aliasOnly: "{alias} ({title})", both: "{alias} ({title} > {heading})" },
    UrlLinkFormat: "{text}",
    ProperNoun: "",
    OrderedListOtherSeparator: String.raw``,
    Wikilink2mdRelativePath: Wikilink2mdPathMode.relativeObsidian,
    calloutType: "NOTE",
    debugMode: false,
    headingLevelMin: 0,
    calloutTypeDecider: CalloutTypeDecider.preContent,
    formatOnSaveSettings: {
        enabled: false,
        commandsString: "",
    }
};