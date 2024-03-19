
export interface WrapperSetting {
    name: string;
    prefix: string;
    suffix: string;
}

export interface APIRequestSetting {
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

export interface FormatSettings {
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
    customReplaceBuiltIn: Array<string>;
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
}

export const DEFAULT_SETTINGS: FormatSettings = {
    MergeParagraph_Newlines: true,
    MergeParagraph_Spaces: true,
    LowercaseFirst: true,
    RemoveBlanksWhenChinese: false,
    ZoteroNoteRegExp: String.raw`“(?<text>.*)” \((?<item>.*?)\) \(\[pdf\]\((?<pdf_url>.*?)\)\)`,
    ZoteroNoteTemplate: "{text} [🔖]({pdf_url})",
    BulletPoints: "•–§",
    WrapperList: [{ name: "underline", prefix: "<u>", suffix: "</u>" }],
    RequestList: [],
    customReplaceList: [],
    customReplaceBuiltIn: [],
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
};