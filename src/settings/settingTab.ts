import {
  App,
  PluginSettingTab,
  Setting,
  SettingDefinition,
  SettingDefinitionGroup,
  SettingDefinitionItem,
  SettingDefinitionList,
} from "obsidian";
import TextFormat from "../main";
import { CalloutTypeDecider, Wikilink2mdPathMode } from "./types";
import { getString } from "../langs/langs";
import { addDonationElement } from "./donation";
import { v4 as uuidv4 } from "uuid";

function toggleSetting(name: string, key: string, desc?: string): SettingDefinition {
  return { name, desc, control: { type: "toggle", key } };
}

function textSetting(name: string, key: string, desc?: string, placeholder?: string): SettingDefinition {
  return { name, desc, control: { type: "text", key, placeholder } };
}

function textAreaSetting(name: string, key: string, desc?: string | DocumentFragment, placeholder?: string, rows = 3): SettingDefinition {
  return { name, desc, control: { type: "textarea", key, placeholder, rows } };
}

function searchValueToString(value: unknown): string {
  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
      return String(value);
    default:
      return "";
  }
}

export class TextFormatSettingTab extends PluginSettingTab {
  plugin: TextFormat;
  settingsQuery = "";

  constructor(app: App, plugin: TextFormat) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    this.containerEl.addClass("plugin-text-format");
    return [
      {
        name: getString(["setting", "more-details"]),
        render: (setting) => {
          setting.infoEl.empty();
          setting.controlEl.empty();
          setting.infoEl.appendText(getString(["setting", "more-details"]));
          setting.infoEl.createEl("a", {
            text: "text-format",
            href: "https://github.com/Benature/obsidian-text-format",
          });
        },
      },
      this.getSettingsSearchDefinition(),
      ...[
        this.getWordCaseDefinitions(),
        this.getLinkDefinitions(),
        this.getListDefinitions(),
        this.getMarkdownQuickerDefinitions(),
        this.getWrapperDefinitions(),
        this.getApiRequestDefinitions(),
        this.getReplacementDefinitions(),
        this.getOtherDefinitions(),
        this.getParagraphDefinitions(),
        this.getZoteroDefinitions(),
      ].map((group) => this.withSettingsSearch(group)),
      {
        name: "Support Text Format",
        render: (setting) => {
          setting.settingEl.empty();
          addDonationElement(setting.settingEl);
        },
      },
    ];
  }

  private refreshSettings(): void {
    this.update();
  }

  private getSettingsSearchDefinition(): SettingDefinition {
    return {
      name: getString(["setting", "search-settings"]),
      render: (setting) => {
        setting.addSearch((search) => {
          search.setPlaceholder(getString(["setting", "search-settings"])).setValue(this.settingsQuery).onChange((value) => {
            this.settingsQuery = value;
            this.refreshDomState();
          });
        });
      },
    };
  }

  private withSettingsSearch<T extends SettingDefinitionGroup>(group: T): T {
    group.visible = () => this.matchesSettingsQuery(group);
    return group;
  }

  private matchesSettingsQuery(group: SettingDefinitionGroup): boolean {
    const query = this.settingsQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }
    const texts = [group.heading || ""];
    for (const item of group.items || []) {
      texts.push(item.name);
      if ("aliases" in item && item.aliases) {
        texts.push(...item.aliases);
      }
      if (typeof item.desc === "string") {
        texts.push(item.desc);
      }
      if ("control" in item && item.control) {
        texts.push(item.control.key, searchValueToString(this.getControlValue(item.control.key)));
      }
    }
    return texts.join(" ").toLowerCase().includes(query);
  }

  getControlValue(key: string): unknown {
    if (key === "headingLowerToPlain") {
      return this.plugin.settings.headingLevelMin === 0;
    }
    let value: unknown = this.plugin.settings;
    for (const part of key.split(".")) {
      if (typeof value !== "object" || value === null || !(part in value)) {
        return undefined;
      }
      value = (value as Record<string, unknown>)[part];
    }
    return value;
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    if (key === "headingLowerToPlain") {
      this.plugin.settings.headingLevelMin = value ? 0 : 1;
    } else {
      this.setValueAtPath(key, value);
    }
    if (key.startsWith("customReplaceList.")) {
      this.updateBuiltInModifiedState(key);
    }
    await this.plugin.saveSettings();
    this.refreshDynamicCommands(key);
  }

  private setValueAtPath(key: string, value: unknown): void {
    const parts = key.split(".");
    let target = this.plugin.settings as unknown as Record<string, unknown>;
    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];
      if (index === parts.length - 1) {
        target[part] = value;
        return;
      }
      const next = target[part];
      if (typeof next !== "object" || next === null) {
        return;
      }
      target = next as Record<string, unknown>;
    }
  }

  private refreshDynamicCommands(key: string): void {
    if (key.startsWith("WrapperList")) {
      this.plugin.debounceUpdateCommandWrapper();
    } else if (key.startsWith("RequestList")) {
      this.plugin.debounceUpdateCommandRequest();
    } else if (key.startsWith("customReplaceList")) {
      this.plugin.debounceUpdateCommandCustomReplace();
    }
  }

  private getWordCaseDefinitions(): SettingDefinitionGroup {
    return {
      type: "group",
      heading: getString(["setting", "word-cases"]),
      items: [
        toggleSetting(
          getString(["setting", "lowercase-before-capitalize"]),
          "LowercaseFirst",
          getString(["setting", "lowercase-before-capitalize-desc"]),
        ),
        textAreaSetting(
          getString(["setting", "cycle-case-sequence"]),
          "ToggleSequence",
          getString(["setting", "cycle-case-sequence-desc"]),
          "lowerCase\nupperCase",
        ),
        textAreaSetting(
          getString(["setting", "proper-noun"]),
          "ProperNoun",
          getString(["setting", "proper-noun-desc"]),
          "USA, UFO",
        ),
      ],
    };
  }

  private getLinkDefinitions(): SettingDefinitionGroup {
    return {
      type: "group",
      heading: getString(["setting", "link-format"]),
      items: [
        {
          name: getString(["setting", "path-mode"]),
          control: {
            type: "dropdown",
            key: "Wikilink2mdRelativePath",
            options: {
              [Wikilink2mdPathMode.relativeObsidian]: getString(["setting", "Wikilink2mdPathMode-relative-obsidian"]),
              [Wikilink2mdPathMode.relativeFile]: getString(["setting", "Wikilink2mdPathModerelative-file"]),
              [Wikilink2mdPathMode.absolute]: getString(["setting", "Wikilink2mdPathMode-absolute"]),
            },
          },
        },
        textAreaSetting(
          getString(["setting", "result-format"]),
          "UrlLinkFormat",
          getString(["setting", "result-format-desc"]),
          "{url}",
        ),
        toggleSetting(getString(["setting", "remove-wikilink-url"]), "RemoveWikiURL2"),
        textAreaSetting(
          getString(["setting", "wiki-link-format-heading"]),
          "WikiLinkFormat.headingOnly",
          getString(["setting", "wiki-link-format-heading-desc"]),
          "{title} (> {heading})",
        ),
        textAreaSetting(
          getString(["setting", "wiki-link-format-alias"]),
          "WikiLinkFormat.aliasOnly",
          getString(["setting", "wiki-link-format-alias-desc"]),
          "{alias} ({title})",
        ),
        textAreaSetting(
          getString(["setting", "wiki-link-format-both"]),
          "WikiLinkFormat.both",
          getString(["setting", "wiki-link-format-both-desc"]),
          "{alias} ({title} > {heading})",
        ),
      ],
    };
  }

  private getListDefinitions(): SettingDefinitionGroup {
    return {
      type: "group",
      heading: getString(["setting", "list-format"]),
      items: [
        textAreaSetting(
          getString(["setting", "bullet-point-characters"]),
          "BulletPoints",
          getString(["setting", "bullet-point-characters-desc"]),
          "•–",
          2,
        ),
        textAreaSetting(
          getString(["setting", "ordered-list-custom-separator"]),
          "OrderedListOtherSeparator",
          getString(["setting", "ordered-list-custom-separator-desc"]),
          "",
          2,
        ),
      ],
    };
  }

  private getMarkdownQuickerDefinitions(): SettingDefinitionGroup {
    return {
      type: "group",
      heading: getString(["setting", "markdown-quicker"]),
      items: [
        toggleSetting(
          getString(["setting", "heading-lower-to-plain"]),
          "headingLowerToPlain",
          getString(["setting", "heading-lower-to-plain-desc"]),
        ),
        {
          name: getString(["setting", "method-decide-callout-type"]),
          desc: getString(["setting", "method-decide-callout-type-desc"]),
          control: {
            type: "dropdown",
            key: "calloutTypeDecider",
            options: {
              [CalloutTypeDecider.preContent]: "Last callout type before the cursor",
              [CalloutTypeDecider.wholeFile]: "Last callout type in the whole file",
              [CalloutTypeDecider.fix]: "Fixed callout type",
            },
          },
        },
        textSetting(
          getString(["setting", "default-callout-type"]),
          "calloutType",
          getString(["setting", "default-callout-type-desc"]),
          "Callout type",
        ),
      ],
    };
  }

  private getOtherDefinitions(): SettingDefinitionGroup {
    return {
      type: "group",
      heading: getString(["setting", "others"]),
      items: [
        toggleSetting(
          getString(["setting", "format-on-paste", "name"]),
          "formatOnSaveSettings.enabled",
          getString(["setting", "format-on-paste", "desc"]),
        ),
        textAreaSetting(
          getString(["setting", "format-on-paste", "name"]),
          "formatOnSaveSettings.commandsString",
          getString(["setting", "format-on-paste", "desc"]),
          "",
          4,
        ),
        toggleSetting(
          getString(["setting", "remove-spaces-when-converting"]),
          "RemoveBlanksWhenChinese",
          getString(["setting", "remove-spaces-when-converting-desc"]),
        ),
        toggleSetting(
          getString(["setting", "multiline-bullet-paste"]),
          "MultilineBulletPaste",
          getString(["setting", "multiline-bullet-paste-desc"]),
        ),
        toggleSetting(
          getString(["setting", "debug-logging"]),
          "debugMode",
          getString(["setting", "debug-logging-desc"]),
        ),
      ],
    };
  }

  private getParagraphDefinitions(): SettingDefinitionGroup {
    return {
      type: "group",
      heading: getString(["setting", "paragraph", "header"]),
      items: [
        toggleSetting(
          getString(["setting", "paragraph", "remove-redundant-blank-lines"]),
          "MergeParagraph_Newlines",
          getString(["setting", "paragraph", "remove-redundant-blank-lines-desc"]),
        ),
        toggleSetting(
          getString(["setting", "remove-redundant-blank-spaces"]),
          "MergeParagraph_Spaces",
          getString(["setting", "remove-redundant-blank-spaces-desc"]),
        ),
      ],
    };
  }

  private getZoteroDefinitions(): SettingDefinitionGroup {
    return {
      type: "group",
      heading: getString(["setting", "zotero-pdf-note-format"]),
      items: [
        textAreaSetting(
          getString(["setting", "zotero-input-regexp"]),
          "ZoteroNoteRegExp",
          this.getZoteroDescription(),
          String.raw`“(?<text>.*)” \((?<item>.*?)\) \(\[pdf\]\((?<pdf_url>.*?)\)\)`,
          5,
        ),
        textAreaSetting(
          getString(["setting", "zotero-output-format"]),
          "ZoteroNoteTemplate",
          getString(["setting", "zotero-output-format-desc"]),
          "{text} [🔖]({pdf_url})",
        ),
      ],
    };
  }

  private getZoteroDescription(): DocumentFragment {
    const fragment = createFragment();
    const doc = fragment.createDiv();
    doc.appendText("The format of note template can be configured with reference to the ");
    doc.createEl("a", {
      text: "document",
      href: "https://github.com/Benature/obsidian-text-format?tab=readme-ov-file#zotero-format",
    });
    doc.appendText(".");
    const fields = fragment.createEl("ul");
    for (const [field, description] of [["text", "highlight"], ["pdf_url", "comment"], ["item", "citation"]]) {
      const item = fields.createEl("li");
      item.createEl("code", { text: field });
      item.appendText(`: ${description}`);
    }
    return fragment;
  }

  private getWrapperDefinitions(): SettingDefinitionList {
    return {
      type: "list",
      heading: getString(["setting", "wrapper", "header"]),
      cls: "wrapper",
      addItem: {
        name: getString(["setting", "wrapper", "new-wrapper-rule-tooltip"]),
        action: () => { void this.addWrapper(); },
      },
      onDelete: (index) => { void this.deleteDynamicItem("WrapperList", index); },
      items: this.plugin.settings.WrapperList.map((wrapper, index) => ({
        name: wrapper.name || `Wrapper ${index + 1}`,
        render: (setting) => this.renderWrapper(setting, index),
      })),
    };
  }

  private renderWrapper(setting: Setting, index: number): void {
    setting.settingEl.addClass("wrapper");
    setting.infoEl.remove();
    setting
      .addText((text) => text
        .setPlaceholder(getString(["setting", "wrapper", "name-placeholder"]))
        .setValue(this.plugin.settings.WrapperList[index].name)
        .onChange((value) => { void this.setControlValue(`WrapperList.${index}.name`, value); }))
      .addText((text) => text
        .setPlaceholder(getString(["setting", "wrapper", "prefix-placeholder"]))
        .setValue(this.plugin.settings.WrapperList[index].prefix)
        .onChange((value) => { void this.setControlValue(`WrapperList.${index}.prefix`, value); }))
      .addText((text) => text
        .setPlaceholder(getString(["setting", "wrapper", "suffix-placeholder"]))
        .setValue(this.plugin.settings.WrapperList[index].suffix)
        .onChange((value) => { void this.setControlValue(`WrapperList.${index}.suffix`, value); }));
  }

  private async addWrapper(): Promise<void> {
    this.plugin.settings.WrapperList.push({ id: uuidv4(), name: "", prefix: "", suffix: "" });
    await this.plugin.saveSettings();
    this.refreshDynamicCommands("WrapperList");
    this.refreshSettings();
  }

  private getApiRequestDefinitions(): SettingDefinitionList {
    return {
      type: "list",
      heading: getString(["setting", "api-request"]),
      cls: "api-request",
      addItem: {
        name: getString(["setting", "new-request-tooltip"]),
        action: () => { void this.addApiRequest(); },
      },
      onDelete: (index) => { void this.deleteDynamicItem("RequestList", index); },
      items: this.plugin.settings.RequestList.map((request, index) => ({
        name: request.name || `API request ${index + 1}`,
        render: (setting) => this.renderApiRequest(setting, index),
      })),
    };
  }

  private renderApiRequest(setting: Setting, index: number): void {
    setting.settingEl.addClass("api-request");
    setting.infoEl.remove();
    setting
      .addText((text) => text
        .setPlaceholder(getString(["setting", "request-name-placeholder"]))
        .setValue(this.plugin.settings.RequestList[index].name)
        .onChange((value) => { void this.setControlValue(`RequestList.${index}.name`, value); }))
      .addText((text) => text
        .setPlaceholder(getString(["setting", "request-url-placeholder"]))
        .setValue(this.plugin.settings.RequestList[index].url)
        .onChange((value) => { void this.setControlValue(`RequestList.${index}.url`, value); }));
  }

  private async addApiRequest(): Promise<void> {
    this.plugin.settings.RequestList.push({ id: uuidv4(), name: "", url: "" });
    await this.plugin.saveSettings();
    this.refreshDynamicCommands("RequestList");
    this.refreshSettings();
  }

  private getReplacementDefinitions(): SettingDefinitionList {
    return {
      type: "list",
      heading: getString(["setting", "custom-replacement"]),
      cls: "custom-replace",
      addItem: {
        name: getString(["setting", "add-new-replacement-tooltip"]),
        action: () => { void this.addReplacement(); },
      },
      onDelete: (index) => { void this.deleteDynamicItem("customReplaceList", index); },
      items: this.plugin.settings.customReplaceList.map((replacement, index) => ({
        name: replacement.name || `Custom replacement ${index + 1}`,
        render: (setting) => this.renderReplacement(setting, index),
      })),
    };
  }

  private renderReplacement(setting: Setting, index: number): void {
    setting.settingEl.addClass("custom-replace");
    setting.infoEl.remove();
    setting
      .addText((text) => text
        .setPlaceholder(getString(["setting", "replacement-command-name-placeholder"]))
        .setValue(this.plugin.settings.customReplaceList[index].name)
        .onChange((value) => { void this.setControlValue(`customReplaceList.${index}.name`, value); }))
      .addText((text) => text
        .setPlaceholder(getString(["setting", "replacement-search-placeholder"]))
        .setValue(this.plugin.settings.customReplaceList[index].data[0].search)
        .onChange((value) => { void this.setControlValue(`customReplaceList.${index}.data.0.search`, value); }))
      .addText((text) => text
        .setPlaceholder(getString(["setting", "replacement-replace-placeholder"]))
        .setValue(this.plugin.settings.customReplaceList[index].data[0].replace)
        .onChange((value) => { void this.setControlValue(`customReplaceList.${index}.data.0.replace`, value); }));
  }

  private async addReplacement(): Promise<void> {
    this.plugin.settings.customReplaceList.push({
      id: uuidv4(),
      name: "",
      data: [{ search: "", replace: "" }],
    });
    await this.plugin.saveSettings();
    this.refreshDynamicCommands("customReplaceList");
    this.refreshSettings();
  }

  private async deleteDynamicItem(key: "WrapperList" | "RequestList" | "customReplaceList", index: number): Promise<void> {
    const list = this.plugin.settings[key] as unknown[];
    list.splice(index, 1);
    await this.plugin.saveSettings();
    this.refreshDynamicCommands(key);
    this.refreshSettings();
  }

  private updateBuiltInModifiedState(key: string): void {
    const index = Number(key.split(".")[1]);
    const replacement = this.plugin.settings.customReplaceList[index];
    const log = this.plugin.settings.customReplaceBuiltInLog[replacement.id];
    if (!log) {
      return;
    }
    const isModified = log.data.length !== replacement.data.length
      || log.data.some((item, itemIndex) => {
        const current = replacement.data[itemIndex];
        return item.search !== current.search || item.replace !== current.replace;
      });
    log.modified = isModified;
  }
}
