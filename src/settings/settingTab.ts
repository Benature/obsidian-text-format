import { Setting, PluginSettingTab, App, ButtonComponent, setIcon } from "obsidian";
import TextFormat from "../main";
import { Wikilink2mdPathMode, CalloutTypeDecider } from './types';
import { CustomReplacementBuiltInCommands } from "../commands"
import { getString } from "../langs/langs";
import { addDonationElement } from "./donation"
import { v4 as uuidv4 } from "uuid";

export class TextFormatSettingTab extends PluginSettingTab {
  plugin: TextFormat;
  contentEl: HTMLElement;
  collapseMemory: { [key: string]: boolean };

  constructor(app: App, plugin: TextFormat) {
    super(app, plugin);
    this.plugin = plugin;
    this.collapseMemory = {}
    // this.builtInCustomReplacement();
  }

  // async builtInCustomReplacement() {
  //   for (let command of CustomReplacementBuiltInCommands) {
  //     if (this.plugin.settings.customReplaceBuiltInLog[command.id] == null) {
  //       this.plugin.settings.customReplaceList.push({ name: getString(["command", command.id]), data: command.data });
  //       this.plugin.settings.customReplaceBuiltInLog[command.id] = { id: command.id, modified: false };
  //     }
  //   }
  //   await this.plugin.saveSettings();
  // }

  display(): void {
    let { containerEl } = this;

    let headerEl;

    containerEl.empty();
    containerEl.addClass("plugin-text-format");
    containerEl
      .createEl("p", { text: getString(["setting", "more-details"]) })
      .createEl("a", {
        text: "text-format",
        href: "https://github.com/Benature/obsidian-text-format",
      });

    this.addSettingsAboutWordCase(containerEl);
    this.addSettingsAboutLink(containerEl);
    this.addSettingsAboutList(containerEl);
    this.addSettingsAboutMarkdownQuicker(containerEl);
    this.addSettingsAboutWrapper(containerEl);
    this.addSettingsAboutApiRequest(containerEl);
    this.addSettingsAboutReplacement(containerEl);


    let headerDiv = containerEl.createDiv({ cls: "header-div" });
    headerEl = headerDiv.createEl("h3", { text: getString(["setting", "others"]) });

    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl, true);


    new Setting(this.contentEl)
      .setName(getString(["setting", "format-on-paste", "name"]))
      .setDesc(getString(["setting", "format-on-paste", "desc"]))
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.formatOnSaveSettings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.formatOnSaveSettings.enabled = value;
            await this.plugin.saveSettings();
          });
      })
      .addTextArea((text) =>
        text
          // .setPlaceholder(getString(["setting", "format-on-paste", "placeholder"]))
          .setValue(this.plugin.settings.formatOnSaveSettings.commandsString)
          .onChange(async (value) => {            
            this.plugin.settings.formatOnSaveSettings.commandsString = value;
            await this.plugin.saveSettings();
          })
      );


    new Setting(this.contentEl)
      .setName(getString(["setting", "remove-spaces-when-converting"]))
      .setDesc(getString(["setting", "remove-spaces-when-converting-desc"]))
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.RemoveBlanksWhenChinese)
          .onChange(async (value) => {
            this.plugin.settings.RemoveBlanksWhenChinese = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(this.contentEl)
      .setName(getString(["setting", "debug-logging"]))
      .setDesc(getString(["setting", "debug-logging-desc"]))
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.debugMode)
          .onChange(async (value) => {
            this.plugin.settings.debugMode = value;
            await this.plugin.saveSettings();
          });
      });
    this.addSettingsAboutParagraph(this.contentEl);

    this.addSettingsAboutZotero(this.contentEl);

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
    if (["H3", "H4"].includes(foldClickElement.tagName)) {
      text = foldClickElement.textContent;
      if (!(text in this.collapseMemory)) {
        this.collapseMemory[text] = false;
      }
      startOpened = startOpened ? true : this.collapseMemory[text];
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


  addSettingsAboutWordCase(containerEl: HTMLElement) {
    let headerDiv = containerEl.createDiv({ cls: "header-div" });
    let headerEl = headerDiv.createEl("h3", { text: getString(["setting", "word-cases"]) })
    headerDiv.createEl("div", { text: getString(["setting", "word-cases-desc"]), cls: "setting-item-description heading-description" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
      .setName(getString(["setting", "lowercase-before-capitalize"]))
      .setDesc(getString(["setting", "lowercase-before-capitalize-desc"]))
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.LowercaseFirst)
          .onChange(async (value) => {
            this.plugin.settings.LowercaseFirst = value;
            await this.plugin.saveSettings();
          });
      });
    new Setting(this.contentEl)
      .setName(getString(["setting", "cycle-case-sequence"]))
      .setDesc(getString(["setting", "cycle-case-sequence-desc"]))
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
      .setName(getString(["setting", "proper-noun"]))
      .setDesc(getString(["setting", "proper-noun-desc"]))
      .addTextArea((text) =>
        text
          .setPlaceholder("USA, UFO")
          .setValue(this.plugin.settings.ProperNoun)
          .onChange(async (value) => {
            this.plugin.settings.ProperNoun = value;
            await this.plugin.saveSettings();
          })
      );
  }
  addSettingsAboutParagraph(containerEl: HTMLElement) {
    let headerDiv = containerEl.createDiv({ cls: "header-div" });
    let headerEl = headerDiv.createEl("h4", { text: getString(["setting", "paragraph", "header"]) });

    let contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, contentEl);
    new Setting(contentEl)
      .setName(getString(["setting", "paragraph", "remove-redundant-blank-lines"]))
      .setDesc(getString(["setting", "paragraph", "remove-redundant-blank-lines-desc"]))
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.MergeParagraph_Newlines)
          .onChange(async (value) => {
            this.plugin.settings.MergeParagraph_Newlines = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(contentEl)
      .setName(getString(["setting", "remove-redundant-blank-spaces"]))
      .setDesc(getString(["setting", "remove-redundant-blank-spaces-desc"]))
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.MergeParagraph_Spaces)
          .onChange(async (value) => {
            this.plugin.settings.MergeParagraph_Spaces = value;
            await this.plugin.saveSettings();
          });
      });
  }

  addSettingsAboutLink(containerEl: HTMLElement) {
    let headerDiv = containerEl.createDiv({ cls: "header-div" });
    let headerEl = headerDiv.createEl("h3", { text: getString(["setting", "link-format"]) });
    headerDiv.createEl("div", { text: getString(["setting", "link-format-desc"]), cls: "setting-item-description heading-description" });

    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
      .setName(getString(["setting", "path-mode"]))
      // .setDesc("Or will use absolute path instead.")
      .addDropdown(dropDown =>
        dropDown
          .addOption(Wikilink2mdPathMode.relativeObsidian, getString(["setting", "Wikilink2mdPathMode-relative-obsidian"]))
          .addOption(Wikilink2mdPathMode.relativeFile, getString(["setting", "Wikilink2mdPathModerelative-file"]))
          .addOption(Wikilink2mdPathMode.absolute, getString(["setting", "Wikilink2mdPathMode-absolute"]))
          .setValue(this.plugin.settings.Wikilink2mdRelativePath || Wikilink2mdPathMode.relativeObsidian)
          .onChange(async (value) => {
            this.plugin.settings.Wikilink2mdRelativePath = value as Wikilink2mdPathMode;
            await this.plugin.saveSettings();
          }));
    new Setting(this.contentEl)
      .setName(getString(["setting", "result-format"]))
      .setDesc(getString(["setting", "result-format-desc"]))
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
      .setName(getString(["setting", "remove-wikilink-url"]))
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
      .setName(getString(["setting", "wiki-link-format-heading"]))
      .setDesc(getString(["setting", "wiki-link-format-heading-desc"]))
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
      .setName(getString(["setting", "wiki-link-format-alias"]))
      .setDesc(getString(["setting", "wiki-link-format-alias-desc"]))
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
      .setName(getString(["setting", "wiki-link-format-both"]))
      .setDesc(getString(["setting", "wiki-link-format-both-desc"]))
      .addTextArea((text) =>
        text
          .setPlaceholder("{alias} ({title})")
          .setValue(this.plugin.settings.WikiLinkFormat.both)
          .onChange(async (value) => {
            this.plugin.settings.WikiLinkFormat.both = value;
            await this.plugin.saveSettings();
          })
      );
  }
  addSettingsAboutList(containerEl: HTMLElement) {
    let headerDiv = containerEl.createDiv({ cls: "header-div" });
    let headerEl = headerDiv.createEl("h3", { text: getString(["setting", "list-format"]) });
    headerDiv.createEl("div", { text: getString(["setting", "list-format-desc"]), cls: "setting-item-description heading-description" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
      .setName(getString(["setting", "bullet-point-characters"]))
      .setDesc(getString(["setting", "bullet-point-characters-desc"]))
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
      .setName(getString(["setting", "ordered-list-custom-separator"]))
      .setDesc(getString(["setting", "ordered-list-custom-separator-desc"]))
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
  }
  addSettingsAboutWrapper(containerEl: HTMLElement) {
    let headerDiv = containerEl.createDiv({ cls: "header-div" });
    let headerEl = headerDiv.createEl("h3", { text: getString(["setting", "wrapper", "header"]) });
    headerDiv.createEl("div", { text: getString(["setting", "wrapper", "desc"]), cls: "setting-item-description heading-description" });

    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    const wrapperRuleDesc = document.createDocumentFragment();
    wrapperRuleDesc.append(
      getString(["setting", "wrapper", "rule-desc1"]),
      document.createDocumentFragment().createEl("br"),
      getString(["setting","wrapper",  "rule-desc2"])
    );
    new Setting(this.contentEl)
      .setName(getString(["setting", "wrapper", "add-new-wrapper"]))
      .setDesc(wrapperRuleDesc)
      .addButton((button: ButtonComponent) => {
        button
          .setTooltip(getString(["setting","wrapper",  "new-wrapper-rule-tooltip"]))
          .setButtonText("+")
          .setCta()
          .onClick(async () => {
            this.plugin.settings.WrapperList.push({
              id: uuidv4(),
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
          cb.setPlaceholder(getString(["setting", "wrapper", "name-placeholder"]))
            .setValue(wrapperSetting.name)
            .onChange(async (newValue) => {
              this.plugin.settings.WrapperList[index].name = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandWrapper();
            });
        })
        .addText((cb) => {
          cb.setPlaceholder(getString(["setting","wrapper",  "prefix-placeholder"]))
            .setValue(wrapperSetting.prefix)
            .onChange(async (newValue) => {
              this.plugin.settings.WrapperList[index].prefix = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandWrapper();
            });
        })
        .addText((cb) => {
          cb.setPlaceholder(getString(["setting","wrapper",  "suffix-placeholder"]))
            .setValue(wrapperSetting.suffix)
            .onChange(async (newValue) => {
              this.plugin.settings.WrapperList[index].suffix = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandWrapper();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip(getString(["setting", "delete-tooltip"]))
            .onClick(async () => {
              this.plugin.settings.WrapperList.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            });
        });
      s.infoEl.remove();
      s.settingEl.addClass("wrapper");
    });
  }
  addSettingsAboutApiRequest(containerEl: HTMLElement) {
    let headerDiv = containerEl.createDiv({ cls: "header-div" });
    let headerEl = headerDiv.createEl("h3", { text: getString(["setting", "api-request"]) });
    headerDiv.createEl("div", { text: getString(["setting", "api-request-desc"]), cls: "setting-item-description heading-description" });

    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
      .setName(getString(["setting", "api-request-url"]))
      .setDesc(getString(["setting", "api-request-url-desc"]))
      .addButton((button: ButtonComponent) => {
        button.setTooltip(getString(["setting", "new-request-tooltip"]))
          .setButtonText("+")
          .setCta().onClick(async () => {
            this.plugin.settings.RequestList.push({
              id: uuidv4(),
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
          cb.setPlaceholder(getString(["setting", "request-name-placeholder"]))
            .setValue(requestSetting.name)
            .onChange(async (newValue) => {
              this.plugin.settings.RequestList[index].name = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandRequest();
            });
        })
        .addText((cb) => {
          cb.setPlaceholder(getString(["setting", "request-url-placeholder"]))
            .setValue(requestSetting.url)
            .onChange(async (newValue) => {
              this.plugin.settings.RequestList[index].url = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandRequest();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip(getString(["setting", "delete-tooltip"]))
            .onClick(async () => {
              this.plugin.settings.RequestList.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            });
        });
      s.infoEl.remove();
      s.settingEl.addClass("api-request");
    });
  }
  addSettingsAboutReplacement(containerEl: HTMLElement) {
    let headerDiv = containerEl.createDiv({ cls: "header-div" });
    let headerEl = headerDiv.createEl("h3", { text: getString(["setting", "custom-replacement"]) });
    headerDiv.createEl("div", { text: getString(["setting", "custom-replacement-desc"]), cls: "setting-item-description heading-description" });


    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);
    new Setting(this.contentEl)
      .setName(getString(["setting", "add-custom-replacement"]))
      .setDesc(getString(["setting", "add-custom-replacement-desc"]))
      .addButton((button: ButtonComponent) => {
        button.setTooltip(getString(["setting", "add-new-replacement-tooltip"]))
          .setButtonText("+")
          .setCta().onClick(async () => {
            this.plugin.settings.customReplaceList.push({
              id: uuidv4(),
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
      const checkIsBuiltIn = () => {
        if (this.plugin.settings.customReplaceBuiltInLog[replaceSetting.id]) {
          let logData = this.plugin.settings.customReplaceBuiltInLog[replaceSetting.id].data;
          let nowData = replaceSetting.data;
          if (logData.length != nowData.length) {
            this.plugin.settings.customReplaceBuiltInLog[replaceSetting.id].modified = true;
            return;
          }
          for (let i = 0; i < logData.length; i++) {
            console.log(logData[i], nowData[i])
            if (logData[i].search !== nowData[i].search || logData[i].replace !== nowData[i].replace) {
              this.plugin.settings.customReplaceBuiltInLog[replaceSetting.id].modified = true;
              return;
            }
          }
          this.plugin.settings.customReplaceBuiltInLog[replaceSetting.id].modified = false;
        }
      };
      const s = new Setting(this.contentEl)
        .addText((cb) => {
          cb.setPlaceholder(getString(["setting", "replacement-command-name-placeholder"]))
            .setValue(replaceSetting.name)
            .onChange(async (newValue) => {
              this.plugin.settings.customReplaceList[index].name = newValue;
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandCustomReplace();
            });
        })
        .addText((cb) => {
          cb.setPlaceholder(getString(["setting", "replacement-search-placeholder"]))
            .setValue(replaceSetting.data[0].search)
            .onChange(async (newValue) => {
              this.plugin.settings.customReplaceList[index].data[0].search = newValue;
              checkIsBuiltIn();
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandCustomReplace();
            });
        })
        .addText((cb) => {
          cb.setPlaceholder(getString(["setting", "replacement-replace-placeholder"]))
            .setValue(replaceSetting.data[0].replace)
            .onChange(async (newValue) => {
              this.plugin.settings.customReplaceList[index].data[0].replace = newValue;
              checkIsBuiltIn();
              await this.plugin.saveSettings();
              this.plugin.debounceUpdateCommandCustomReplace();
            });
        })
        .addExtraButton((cb) => {
          cb.setIcon("cross")
            .setTooltip(getString(["setting", "delete-tooltip"]))
            .onClick(async () => {
              this.plugin.settings.customReplaceList.splice(index, 1);
              await this.plugin.saveSettings();
              this.display();
            });
        });
      s.settingEl.addClass("custom-replace");
      s.infoEl.remove();
    });
  }
  addSettingsAboutZotero(containerEl: HTMLElement) {
    let headerDiv = containerEl.createDiv({ cls: "header-div" });
    let headerEl = headerDiv.createEl("h4", { text: getString(["setting", "zotero-pdf-note-format"]) });

    let contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, contentEl);
    const zoteroEl = new Setting(contentEl)
      .setName(getString(["setting", "zotero-input-regexp"]))
      .addTextArea((text) => {
        text
          .setPlaceholder(
            String.raw`“(?<text>.*)” \((?<item>.*?)\) \(\[pdf\]\((?<pdf_url>.*?)\)\)`
          )
          .setValue(this.plugin.settings.ZoteroNoteRegExp)
          .onChange(async (value) => {
            this.plugin.settings.ZoteroNoteRegExp = value;
            await this.plugin.saveSettings();
          })
        text.inputEl.setCssProps({ "height": "5rem" });
      }
      );
    zoteroEl.descEl.innerHTML = `<div>The format of note template can configured refer to <a href="https://github.com/Benature/obsidian-text-format?tab=readme-ov-file#zotero-format">document</a>.</div>
    <ul>
    <li><code>text</code>: highlight</li>
    <li><code>pdf_url</code>: comment</li>
    <li><code>item</code>: citation</li>
    </ul>`;
    new Setting(contentEl)
      .setName(getString(["setting", "zotero-output-format"]))
      .setDesc(getString(["setting", "zotero-output-format-desc"])

      )
      .addTextArea((text) => {
        text
          .setPlaceholder("{text} [🔖]({pdf_url})")
          .setValue(this.plugin.settings.ZoteroNoteTemplate)
          .onChange(async (value) => {
            this.plugin.settings.ZoteroNoteTemplate = value;
            await this.plugin.saveSettings();
          });

      }
      );
  }
  addSettingsAboutMarkdownQuicker(containerEl: HTMLElement) {
    let headerDiv = containerEl.createDiv({ cls: "header-div" });
    let headerEl = headerDiv.createEl("h3", { text: getString(["setting", "markdown-quicker"]) });
    headerDiv.createEl("div", { text: getString(["setting", "markdown-quicker-desc"]), cls: "setting-item-description heading-description" });
    this.contentEl = containerEl.createDiv();
    this.makeCollapsible(headerEl, this.contentEl);

    new Setting(this.contentEl)
      .setName(getString(["setting", "heading-lower-to-plain"]))
      .setDesc(getString(["setting", "heading-lower-to-plain-desc"]))
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.headingLevelMin === 0)
          .onChange(async (value) => {
            this.plugin.settings.headingLevelMin = value ? 0 : 1;
            await this.plugin.saveSettings();
          });
      });
    new Setting(this.contentEl)
      .setName(getString(["setting", "method-decide-callout-type"]))
      .setDesc(getString(["setting", "method-decide-callout-type-desc"]))
      .addDropdown(dropDown =>
        dropDown
          .addOption(CalloutTypeDecider.preContent, 'Last callout type before the cursor')
          .addOption(CalloutTypeDecider.wholeFile, 'Last callout type in the whole file')
          .addOption(CalloutTypeDecider.fix, 'Fixed callout type')
          .setValue(this.plugin.settings.calloutTypeDecider || CalloutTypeDecider.preContent)
          .onChange(async (value) => {
            this.plugin.settings.calloutTypeDecider = value as CalloutTypeDecider;
            await this.plugin.saveSettings();
          }));
    new Setting(this.contentEl)
      .setName(getString(["setting", "default-callout-type"]))
      .setDesc(getString(["setting", "default-callout-type-desc"]))
      .addText((text) =>
        text
          .setPlaceholder("Callout type")
          .setValue(this.plugin.settings.calloutType)
          .onChange(async (value) => {
            this.plugin.settings.calloutType = value;
            await this.plugin.saveSettings();
          })
      );
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
