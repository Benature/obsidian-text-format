import { Setting, PluginSettingTab, App, ButtonComponent, setIcon } from "obsidian";
import TextFormat from "../../main";
import { Wikilink2mdPathMode } from './types';
import { CustomReplacementBuiltInCommands } from "../commands"
import { getString } from "../langs/langs";
import { addDonationElement } from "./donation"

export class TextFormatSettingTab extends PluginSettingTab {
  plugin: TextFormat;
  contentEl: HTMLElement;
  collapseMemory: { [key: string]: boolean };

  constructor(app: App, plugin: TextFormat) {
    super(app, plugin);
    this.plugin = plugin;
    this.collapseMemory = {}
    this.builtInCustomReplacement();
  }

  builtInCustomReplacement() {
    for (let command of CustomReplacementBuiltInCommands) {
      if (!this.plugin.settings.customReplaceBuiltIn.includes(command.id)) {
        this.plugin.settings.customReplaceList.push({ name: getString(["command", command.id]), data: command.data });
        this.plugin.settings.customReplaceBuiltIn.push(command.id);
        this.plugin.saveSettings();
      }
    }
  }

  display(): void {
    let { containerEl } = this;

    let headerEl;

    containerEl.empty();
    containerEl
      .createEl("p", { text: "More details in Github: " })
      .createEl("a", {
        text: "text-format",
        href: "https://github.com/Benature/obsidian-text-format",
      });

    headerEl = containerEl.createEl("h3", { text: "Words lower/title/toggle/capitalize case" })
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
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
    new Setting(this.contentEl)
      .setName("Toggle case sequence (one case in a line)")
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
    new Setting(this.contentEl)
      .setName("Proper noun")
      .setDesc("The words will be ignore to format in title case. Separated by comma, e.g. `USA, UFO`.")
      .addTextArea((text) =>
        text
          .setPlaceholder("USA, UFO")
          .setValue(this.plugin.settings.ProperNoun)
          .onChange(async (value) => {
            this.plugin.settings.ProperNoun = value;
            await this.plugin.saveSettings();
          })
      );

    headerEl = containerEl.createEl("h3", { text: "Merge broken paragraphs behavior" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
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

    new Setting(this.contentEl)
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



    headerEl = containerEl.createEl("h3", { text: "Link formatting" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
      .setName("Path mode when covering wikilinks to plain markdown links.")
      // .setDesc("Or will use absolute path instead.")
      .addDropdown(dropDown =>
        dropDown
          .addOption(Wikilink2mdPathMode.relativeObsidian, 'Relative to Obsidian Vault')
          .addOption(Wikilink2mdPathMode.relativeFile, 'Relative to current file')
          .addOption(Wikilink2mdPathMode.absolute, 'Absolute')
          .setValue(this.plugin.settings.Wikilink2mdRelativePath || Wikilink2mdPathMode.relativeObsidian)
          .onChange(async (value) => {
            this.plugin.settings.Wikilink2mdRelativePath = value as Wikilink2mdPathMode;
            await this.plugin.saveSettings();
          }));
    new Setting(this.contentEl)
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
    new Setting(this.contentEl)
      .setName("Remove WikiLink as well when calling `Remove URL links format in selection`")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.RemoveWikiURL2)
          .onChange(async (value) => {
            this.plugin.settings.RemoveWikiURL2 = value;
            await this.plugin.saveSettings();
          });
      });
    this.contentEl.createEl("h4", { text: "Format when removing wikiLink" });
    // containerEl.createEl("p", { text: "Define the result of calling `Remove WikiLink format in selection`" });
    new Setting(this.contentEl)
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
    new Setting(this.contentEl)
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
    new Setting(this.contentEl)
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

    headerEl = containerEl.createEl("h3", { text: "Format bullet/ordered list" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
      .setName("Possible bullet point characters")
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
    new Setting(this.contentEl)
      .setName("Format ordered list custom separator RegExp")
      .setDesc(
        "Separated by `|`. e.g.: `\sand\s|\s?AND\s?`. Default as empty."
      )
      .addTextArea((text) =>
        text
          .setPlaceholder(
            String.raw``
          )
          .setValue(this.plugin.settings.OrderedListOtherSeparator)
          .onChange(async (value) => {
            this.plugin.settings.OrderedListOtherSeparator = value;
            await this.plugin.saveSettings();
          })
      );

    headerEl = containerEl.createEl("h3", { text: "Wrapper" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    const wrapperRuleDesc = document.createDocumentFragment();
    wrapperRuleDesc.append(
      "<Wrapper Name> <Prefix Template> <Suffix Template>",
      document.createDocumentFragment().createEl("br"),
      "Template for metadata (file properties) is supported with Handlebars syntax. For example, `{{link}}` will be replaced with the value of current file's property `link`.",
    );
    new Setting(this.contentEl)
      .setName("Add new wrapper")
      .setDesc(wrapperRuleDesc)
      .addButton((button: ButtonComponent) => {
        button
          .setTooltip("Add new rule")
          .setButtonText("+")
          .setCta()
          .onClick(async () => {
            this.plugin.settings.WrapperList.push({
              name: "",
              prefix: "",
              suffix: "",
            });
            await this.plugin.saveSettings();
            this.display();
          });
      });
    this.plugin.settings.WrapperList.forEach((wrapperSetting, index) => {
      const s = new Setting(this.contentEl)
        .addText((cb) => {
          cb.setPlaceholder("Wrapper Name (command name)")
            .setValue(wrapperSetting.name)
            .onChange(async (newValue) => {
              this.plugin.settings.WrapperList[index].name = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandWrapper();
            });
        })
        .addText((cb) => {
          cb.setPlaceholder("Prefix")
            .setValue(wrapperSetting.prefix)
            .onChange(async (newValue) => {
              this.plugin.settings.WrapperList[index].prefix = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandWrapper();
            });
        })
        .addText((cb) => {
          cb.setPlaceholder("Suffix")
            .setValue(wrapperSetting.suffix)
            .onChange(async (newValue) => {
              this.plugin.settings.WrapperList[index].suffix = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandWrapper();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip("Delete")
            .onClick(async () => {
              this.plugin.settings.WrapperList.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            });
        });
    });


    headerEl = containerEl.createEl("h3", { text: "API Request" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
      .setName("API Request URL")
      .setDesc(
        "The URL that plugin will send a POST and replace with return.\n" +
        "The return json should have two attribution: `text` and `notification`. " +
        "If `text` exist then `text` will replace the selection, or do nothing.\n" +
        "If `notification` exist then Send a notice if this string, or do nothing."
      )
      .addButton((button: ButtonComponent) => {
        button.setTooltip("Add new request")
          .setButtonText("+")
          .setCta().onClick(async () => {
            this.plugin.settings.RequestList.push({
              name: "",
              url: "",
            });
            await this.plugin.saveSettings();
            this.display();
          });
      })
    this.plugin.settings.RequestList.forEach((requestSetting, index) => {
      const s = new Setting(this.contentEl)
        .addText((cb) => {
          cb.setPlaceholder("Request Name (command name)")
            .setValue(requestSetting.name)
            .onChange(async (newValue) => {
              this.plugin.settings.RequestList[index].name = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandRequest();
            });
        })
        .addText((cb) => {
          cb.setPlaceholder("Request URL")
            .setValue(requestSetting.url)
            .onChange(async (newValue) => {
              this.plugin.settings.RequestList[index].url = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandRequest();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip("Delete")
            .onClick(async () => {
              this.plugin.settings.RequestList.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            });
        });
    });

    headerEl = containerEl.createEl("h3", { text: "Custom replacement" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
      .setName("Add custom replacement")
      .setDesc("The plugin will replace the `search` string with the `replace` string in the selection. RegExp is supported.")
      .addButton((button: ButtonComponent) => {
        button.setTooltip("Add new replacement")
          .setButtonText("+")
          .setCta().onClick(async () => {
            this.plugin.settings.customReplaceList.push({
              name: "",
              data: [{
                search: "",
                replace: "",
              }]
            });
            await this.plugin.saveSettings();
            this.display();
          });
      })
    this.plugin.settings.customReplaceList.forEach((replaceSetting, index) => {
      const s = new Setting(this.contentEl)
        .addText((cb) => {
          cb.setPlaceholder("Command name")
            .setValue(replaceSetting.name)
            .onChange(async (newValue) => {
              this.plugin.settings.customReplaceList[index].name = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandCustomReplace();
            });
        })
        .addText((cb) => {
          cb.setPlaceholder("Search")
            .setValue(replaceSetting.data[0].search)
            .onChange(async (newValue) => {
              this.plugin.settings.customReplaceList[index].data[0].search = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandCustomReplace();
            });
        })
        .addText((cb) => {
          cb.setPlaceholder("Replace (empty is fine)")
            .setValue(replaceSetting.data[0].replace)
            .onChange(async (newValue) => {
              this.plugin.settings.customReplaceList[index].data[0].replace = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandCustomReplace();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip("Delete")
            .onClick(async () => {
              this.plugin.settings.customReplaceList.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            });
        });
    });


    headerEl = containerEl.createEl("h3", { text: "Zotero pdf note format" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
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
    new Setting(this.contentEl)
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


    headerEl = containerEl.createEl("h3", { text: "Others" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl, true);

    new Setting(this.contentEl)
      .setName("Callout type")
      .setDesc(["Set the callout type for command `Callout format`. ",
        "New callout block will use the last callout type in the current file by default. ",
        "To disable this continuity, make the type begins with `!`, e.g. `!NOTE`."].join(""))
      .addText((text) =>
        text
          .setPlaceholder("Callout type")
          .setValue(this.plugin.settings.calloutType)
          .onChange(async (value) => {
            this.plugin.settings.calloutType = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(this.contentEl)
      .setName("Remove spaces when converting Chinese punctuation marks")
      .setDesc("for OCR case")
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.RemoveBlanksWhenChinese)
          .onChange(async (value) => {
            this.plugin.settings.RemoveBlanksWhenChinese = value;
            await this.plugin.saveSettings();
          });
      });

    addDonationElement(containerEl);
  }

  // refer from https://github.com/Mocca101/obsidian-plugin-groups/tree/main
  makeCollapsible(foldClickElement: HTMLElement, content: HTMLElement, startOpened?: boolean) {
    if (!content.hasClass('tf-collapsible-content')) {
      content.addClass('tf-collapsible-content');
    }

    if (!foldClickElement.hasClass('tf-collapsible-header')) {
      foldClickElement.addClass('tf-collapsible-header');
    }

    toggleCollapsibleIcon(foldClickElement);

    let text = "<unknown>";
    // settings headers are H3
    if (foldClickElement.tagName === "H3") {
      text = foldClickElement.textContent;
      if (!(text in this.collapseMemory)) {
        this.collapseMemory[text] = false;
      }
      startOpened = this.collapseMemory[text];
    }

    if (startOpened) {
      content.addClass('is-active');
      toggleCollapsibleIcon(foldClickElement);
    }

    foldClickElement.onclick = () => {
      if (content.hasClass('is-active')) {
        content.removeClass('is-active');
        this.collapseMemory[text] = false;
      } else {
        content.addClass('is-active');
        this.collapseMemory[text] = true;
      }

      toggleCollapsibleIcon(foldClickElement);
    };
  }
}



function toggleCollapsibleIcon(parentEl: HTMLElement) {
  let foldable: HTMLElement | null = parentEl.querySelector(
    ':scope > .tf-collapsible-icon'
  );
  if (!foldable) {
    foldable = parentEl.createSpan({ cls: 'tf-collapsible-icon' });
  }
  if (foldable.dataset.togglestate === 'up') {
    setIcon(foldable, 'chevron-down');
    foldable.dataset.togglestate = 'down';
  } else {
    setIcon(foldable, 'chevron-up');
    foldable.dataset.togglestate = 'up';
  }
}