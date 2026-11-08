const assert = require("node:assert/strict");
const test = require("node:test");

const { createPlugin, TextFormatSettingTab } = require("./helpers/load-ts");

function createSettingTab() {
  const plugin = createPlugin();
  const tab = new TextFormatSettingTab({}, plugin);
  tab.containerEl = { addClass: () => {} };
  tab.refreshCount = 0;
  tab.update = () => { tab.refreshCount++; };
  return { plugin, tab };
}

function fakeElement() {
  return {
    appendText: () => {},
    createEl: () => fakeElement(),
  };
}

globalThis.createFragment = () => ({
  createDiv: () => fakeElement(),
  createEl: () => fakeElement(),
});

test("settings: declarative definitions are non-empty and use native rendering", () => {
  const { tab } = createSettingTab();
  const definitions = tab.getSettingDefinitions();
  assert.ok(definitions.length >= 10);
  assert.ok(JSON.stringify(definitions).includes("MultilineBulletPaste"));
  assert.equal(Object.hasOwn(TextFormatSettingTab.prototype, "display"), false);
  assert.equal(typeof tab.display, "undefined");

  const wrapper = definitions.find((item) => item.type === "list" && item.cls === "wrapper");
  assert.ok(wrapper);
  assert.equal(wrapper.items.length, 1);
  assert.equal(typeof wrapper.addItem.action, "function");
  assert.equal(typeof wrapper.onDelete, "function");
});

test("settings: plugin-local search filters groups by names, descriptions, and values", () => {
  const { tab } = createSettingTab();
  const definitions = tab.getSettingDefinitions();
  assert.ok(definitions.some((item) => item.name === "Search settings"));

  const wordCases = definitions.find((item) => item.heading === "Word cases");
  const others = definitions.find((item) => item.heading === "Others");
  tab.settingsQuery = "multi";
  assert.equal(wordCases.visible(), false);
  assert.equal(others.visible(), true);

  tab.settingsQuery = "lowerCase";
  assert.equal(wordCases.visible(), true);
  tab.settingsQuery = "";
  assert.equal(others.visible(), true);
});

test("settings: GitHub guide text and link are both rendered", () => {
  const { tab } = createSettingTab();
  const rendered = [];
  const setting = {
    infoEl: {
      empty: () => {},
      appendText: (text) => rendered.push(text),
      createEl: (_tag, options) => { rendered.push(options.text); },
    },
    controlEl: { empty: () => {} },
  };
  tab.getSettingDefinitions()[0].render(setting);
  assert.ok(rendered.includes("More details in Github: "));
  assert.ok(rendered.includes("text-format"));
});

test("settings: control values support nested paths and save changes", async () => {
  const { plugin, tab } = createSettingTab();
  assert.equal(tab.getControlValue("LowercaseFirst"), true);
  await tab.setControlValue("LowercaseFirst", false);
  assert.equal(plugin.settings.LowercaseFirst, false);

  await tab.setControlValue("WikiLinkFormat.headingOnly", "{heading}");
  assert.equal(tab.getControlValue("WikiLinkFormat.headingOnly"), "{heading}");

  await tab.setControlValue("WrapperList.0.name", "Quote");
  assert.equal(plugin.settings.WrapperList[0].name, "Quote");
});

test("settings: heading toggle remains compatible with numeric stored value", async () => {
  const { plugin, tab } = createSettingTab();
  await tab.setControlValue("headingLowerToPlain", false);
  assert.equal(plugin.settings.headingLevelMin, 1);
  assert.equal(tab.getControlValue("headingLowerToPlain"), false);

  await tab.setControlValue("headingLowerToPlain", true);
  assert.equal(plugin.settings.headingLevelMin, 0);
  assert.equal(tab.getControlValue("headingLowerToPlain"), true);
});

test("settings: dynamic list mutations save and refresh definitions", async () => {
  const { plugin, tab } = createSettingTab();
  const originalLength = plugin.settings.WrapperList.length;
  await tab.addWrapper();
  assert.equal(plugin.settings.WrapperList.length, originalLength + 1);
  assert.equal(tab.refreshCount, 1);
  assert.equal(tab.getSettingDefinitions().find((item) => item.cls === "wrapper").items.length, originalLength + 1);

  await tab.deleteDynamicItem("WrapperList", originalLength);
  assert.equal(plugin.settings.WrapperList.length, originalLength);
  assert.equal(tab.refreshCount, 2);
});
