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

export interface FormatSettings {
  MergeParagraph_Newlines: boolean;
  MergeParagraph_Spaces: boolean;
  LowercaseFirst: boolean;
  RemoveBlanksWhenChinese: boolean;
  ZoteroNoteRegExp: string;
  ZoteroNoteTemplate: string;
  wrapperList: Array<WrapperSetting>;
}

export const DEFAULT_SETTINGS: FormatSettings = {
  MergeParagraph_Newlines: true,
  MergeParagraph_Spaces: true,
  LowercaseFirst: false,
  RemoveBlanksWhenChinese: false,
  ZoteroNoteRegExp: String.raw`“(?<text>.*)” \((?<item>.*?)\) \(\[pdf\]\((?<pdf_url>.*?)\)\)`,
  ZoteroNoteTemplate: "{text} [🔖]({pdf_url})",
  wrapperList: [{ name: "", prefix: "", suffix: "" }],
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

    containerEl.createEl("h3", { text: "Merge broken paragraphs behavior" });

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

    containerEl.createEl("h3", { text: "Wrapper" });
    const descEl = document.createDocumentFragment();
    const ruleDesc = document.createDocumentFragment();
    ruleDesc.append(
      "<Wrapper Name> <Prefix> <Suffix>",
      descEl.createEl("br"),
      "Note: To make sure the command is valid in Command Palette, you need to reload/reopen Obsidian."
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
  }
}
