import {
  MarkdownView,
  Plugin,
  Setting,
  PluginSettingTab,
  App,
  Menu,
  ButtonComponent,
} from "obsidian";
import TextFormat from "../main";

export interface WrapperSetting {
  name: string;
  prefix: string;
  suffix: string;
}

export interface WikiLinkFormatGroup {
  headingOnly: string;
  aliasOnly: string;
  both: string;
}

export interface FormatSettings {
  MergeParagraph_Newlines: boolean;
  MergeParagraph_Spaces: boolean;
  LowercaseFirst: boolean;
  RemoveBlanksWhenChinese: boolean;
  ZoteroNoteRegExp: string;
  ZoteroNoteTemplate: string;
  BulletPoints: string;
  wrapperList: Array<WrapperSetting>;
  RequestURL: string;
  ToggleSequence: string;
  RemoveWikiURL2: boolean;
  WikiLinkFormat: WikiLinkFormatGroup;
  UrlLinkFormat: string;
}

export const DEFAULT_SETTINGS: FormatSettings = {
  MergeParagraph_Newlines: true,
  MergeParagraph_Spaces: true,
  LowercaseFirst: false,
  RemoveBlanksWhenChinese: false,
  ZoteroNoteRegExp: String.raw`“(?<text>.*)” \((?<item>.*?)\) \(\[pdf\]\((?<pdf_url>.*?)\)\)`,
  ZoteroNoteTemplate: "{text} [🔖]({pdf_url})",
  BulletPoints: "•–§",
  wrapperList: [{ name: "", prefix: "", suffix: "" }],
  RequestURL: "",
  ToggleSequence: "lowerCase\nupperCase\ncapitalizeSentence\ntitleCase",
  RemoveWikiURL2: false,
  WikiLinkFormat: { headingOnly: "{title} (> {heading})", aliasOnly: "{alias} ({title})", both: "{alias} ({title} > {heading})" },
  UrlLinkFormat: "{text}",
};

export class TextFormatSettingTab extends PluginSettingTab {
  plugin: TextFormat;

  constructor(app: App, plugin: TextFormat) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h3", { text: "Lowercase" });

    new Setting(containerEl)
      .setName("Lowercase before capitalize/title case")
      .setDesc(
        "When running the capitalize or title case command, the plugin will lowercase the selection at first."
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.LowercaseFirst)
          .onChange(async (value) => {
            this.plugin.settings.LowercaseFirst = value;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("h3", { text: "Toggle case sequence" });
    new Setting(containerEl)
      .setName("Sequence (one case in a line)")
      .setDesc("Support cases: `lowerCase`, `upperCase`, `capitalizeWord`, `capitalizeSentence`, `titleCase`. \n" +
        "Note that the result of `capitalizeWord` and `titleCase` could be the same in some cases, " +
        "the two cases are not recommended to be used in the same time.")
      .addTextArea((text) =>
        text
          .setPlaceholder("lowerCase\nupperCase")
          .setValue(this.plugin.settings.ToggleSequence)
          .onChange(async (value) => {
            this.plugin.settings.ToggleSequence = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Merge broken paragraphs behavior" });
    containerEl.createEl("div", { text: "...when calling `Merge broken paragraphs(s) in selection`" });

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

    containerEl.createEl("h3", { text: "When converting Chinese characters" });

    new Setting(containerEl)
      .setName("Remove all spaces")
      .setDesc("for OCR case")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.RemoveBlanksWhenChinese)
          .onChange(async (value) => {
            this.plugin.settings.RemoveBlanksWhenChinese = value;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("h3", { text: "URL formatting" });
    new Setting(containerEl)
      .setName("The format of result when calling `Remove URL links format in selection`")
      .setDesc("Matching with `[{text}]({url})`, use `{text}` if you want to maintain the text, or use `{url}` if you want to maintain the url.")
      .addTextArea((text) =>
        text
          .setPlaceholder("{url}")
          .setValue(this.plugin.settings.UrlLinkFormat)
          .onChange(async (value) => {
            this.plugin.settings.UrlLinkFormat = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("Remove WikiLink as wel when calling `Remove URL links format in selection`")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.RemoveWikiURL2)
          .onChange(async (value) => {
            this.plugin.settings.RemoveWikiURL2 = value;
            await this.plugin.saveSettings();
          });
      });
    containerEl.createEl("h6", { text: "WikiLink format while removing" });
    containerEl.createEl("p", { text: "Define the result of calling `Remove WikiLink format in selection`" });
    new Setting(containerEl)
      .setName("WikiLink with heading")
      .setDesc("e.g. [[title#heading]]")
      .addTextArea((text) =>
        text
          .setPlaceholder("{title} (> {heading})")
          .setValue(this.plugin.settings.WikiLinkFormat.headingOnly)
          .onChange(async (value) => {
            this.plugin.settings.WikiLinkFormat.headingOnly = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("WikiLink with alias")
      .setDesc("e.g. [[title|alias]]")
      .addTextArea((text) =>
        text
          .setPlaceholder("{alias} ({title})")
          .setValue(this.plugin.settings.WikiLinkFormat.aliasOnly)
          .onChange(async (value) => {
            this.plugin.settings.WikiLinkFormat.aliasOnly = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("WikiLink with both heading and alias")
      .setDesc("e.g. [[title#heading|alias]]")
      .addTextArea((text) =>
        text
          .setPlaceholder("{alias} ({title})")
          .setValue(this.plugin.settings.WikiLinkFormat.both)
          .onChange(async (value) => {
            this.plugin.settings.WikiLinkFormat.both = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Bullet points list" });
    new Setting(containerEl)
      .setName("Possible bullet points")
      .setDesc("The characters that will be regarded as bullet points.")
      .addTextArea((text) =>
        text
          .setPlaceholder("•–")
          .setValue(this.plugin.settings.BulletPoints)
          .onChange(async (value) => {
            this.plugin.settings.BulletPoints = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Wrapper" });
    const descEl = document.createDocumentFragment();
    const ruleDesc = document.createDocumentFragment();
    ruleDesc.append(
      "<Wrapper Name> <Prefix> <Suffix>",
      descEl.createEl("br"),
      "Note: To make sure the command is valid in Command Palette, you need to **reload/reopen** Obsidian App."
    );
    new Setting(this.containerEl)
      .setName("Add new wrapper")
      .setDesc(ruleDesc)
      .addButton((button: ButtonComponent) => {
        button
          .setTooltip("Add new rule")
          .setButtonText("+")
          .setCta()
          .onClick(async () => {
            this.plugin.settings.wrapperList.push({
              name: "",
              prefix: "",
              suffix: "",
            });
            await this.plugin.saveSettings();
            this.display();
          });
      });
    this.plugin.settings.wrapperList.forEach((wrapperSetting, index) => {
      const s = new Setting(this.containerEl)
        .addSearch((cb) => {
          cb.setPlaceholder("Wrapper Name")
            .setValue(wrapperSetting.name)
            .onChange(async (newValue) => {
              this.plugin.settings.wrapperList[index].name = newValue;
              await this.plugin.saveSettings();
            });
        })
        .addSearch((cb) => {
          cb.setPlaceholder("Prefix")
            .setValue(wrapperSetting.prefix)
            .onChange(async (newValue) => {
              this.plugin.settings.wrapperList[index].prefix = newValue;
              await this.plugin.saveSettings();
            });
        })
        .addSearch((cb) => {
          cb.setPlaceholder("Suffix")
            .setValue(wrapperSetting.suffix)
            .onChange(async (newValue) => {
              this.plugin.settings.wrapperList[index].suffix = newValue;
              await this.plugin.saveSettings();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip("Delete")
            .onClick(async () => {
              this.plugin.settings.wrapperList.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            });
        });
    });

    containerEl.createEl("h3", { text: "Zotero pdf note format" });

    new Setting(containerEl)
      .setName("Zotero pdf note (input) RegExp")
      .setDesc(
        "The format of note template can configured refer to https://www.zotero.org/support/note_templates. \n" +
        "Variables: \n" +
        "<text>: highlight,\n" +
        "<pdf_url>: comment,\n" +
        "<item>: citation."
      )
      .addTextArea((text) =>
        text
          .setPlaceholder(
            String.raw`“(?<text>.*)” \((?<item>.*?)\) \(\[pdf\]\((?<pdf_url>.*?)\)\)`
          )
          .setValue(this.plugin.settings.ZoteroNoteRegExp)
          .onChange(async (value) => {
            this.plugin.settings.ZoteroNoteRegExp = value;
            await this.plugin.saveSettings();
          })
      );
    new Setting(containerEl)
      .setName("Zotero note pasted in Obsidian (output) format")
      .setDesc(
        "Variables: \n" +
        "{text}: <text>,\n" +
        "{pdf_url}: <pdf_url>,\n" +
        "{item}: <item>."
      )
      .addTextArea((text) =>
        text
          .setPlaceholder("{text} [🔖]({pdf_url})")
          .setValue(this.plugin.settings.ZoteroNoteTemplate)
          .onChange(async (value) => {
            this.plugin.settings.ZoteroNoteTemplate = value;
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "API Request" });

    new Setting(containerEl)
      .setName("API Request URL")
      .setDesc(
        "The URL that plugin will send a POST and replace with return.\n" +
        "The return json should have two attribution: `text` and `notification`. " +
        "If `text` exist then `text` will replace the selection, or do nothing.\n" +
        "If `notification` exist then Send a notice if this string, or do nothing."
      )
      .addTextArea((text) =>
        text
          .setPlaceholder(
            "http://127.0.0.1:7070/obsidian"
          )
          .setValue(this.plugin.settings.RequestURL)
          .onChange(async (value) => {
            this.plugin.settings.RequestURL = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
