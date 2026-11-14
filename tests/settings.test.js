const assert = require("node:assert/strict");
const test = require("node:test");

const { createPlugin, TextFormatSettingTab } = require("./helpers/load-ts");

function createSettingTab() {
  const plugin = createPlugin();
  const tab = new TextFormatSettingTab({}, plugin);
  return { plugin, tab };
}

function classElement() {
  const classes = new Set();
  return {
    hasClass: (name) => classes.has(name),
    addClass: (name) => classes.add(name),
    removeClass: (name) => classes.delete(name),
  };
}

function collapsibleHeader(text) {
  let icon = null;
  const children = [];
  return {
    ...classElement(),
    tagName: "H3",
    textContent: text,
    children,
    querySelector: () => icon,
    createSpan: () => {
      icon = { dataset: {} };
      return icon;
    },
    prepend: (el) => children.unshift(el),
  };
}

test("#124: custom settings render into the row preserved by Obsidian 1.15", () => {
  const { tab } = createSettingTab();
  const setting = { settingEl: { id: "setting-row" } };
  const group = { listEl: { id: "host-managed-group-list" } };
  let renderedTo = null;
  tab.renderSettings = (containerEl) => {
    renderedTo = containerEl;
    containerEl.rendered = true;
  };

  const [definition] = tab.getSettingDefinitions();
  definition.render(setting, group);

  // Obsidian 1.15 reconciles group.listEl after render() returns, replacing
  // arbitrary children there. The row itself remains and keeps its children.
  assert.equal(renderedTo, setting.settingEl);
  assert.notEqual(renderedTo, group.listEl);
  assert.equal(setting.settingEl.rendered, true);
});

test("settings: collapse icon is inserted before the heading text", () => {
  const { tab } = createSettingTab();
  const header = collapsibleHeader("Custom replacement");
  const content = classElement();

  tab.makeCollapsible(header, content);

  assert.equal(header.children.length, 1);
  assert.equal(header.children[0].dataset.togglestate, "up");
});

test("settings: sections are collapsed by default", () => {
  const { tab } = createSettingTab();
  const header = collapsibleHeader("Custom replacement");
  const content = classElement();

  tab.makeCollapsible(header, content);

  assert.equal(content.hasClass("tf-collapsible-content"), true);
  assert.equal(content.hasClass("is-active"), false);
  assert.equal(tab.collapseMemory["Custom replacement"], false);
});

test("settings: collapse state is preserved across rendering", () => {
  const { tab } = createSettingTab();
  const header = collapsibleHeader("Custom replacement");
  const content = classElement();

  tab.makeCollapsible(header, content);
  header.onclick();
  assert.equal(content.hasClass("is-active"), true);

  tab.makeCollapsible(header, content);
  assert.equal(content.hasClass("is-active"), true);

  header.onclick();
  assert.equal(content.hasClass("is-active"), false);
});

test("settings: changing only flags marks a built-in replacement as modified", () => {
  const { plugin, tab } = createSettingTab();
  const replacement = {
    id: "built-in",
    name: "Built-in",
    data: [{ search: "a", replace: "b" }],
  };
  plugin.settings.customReplaceList.push(replacement);
  plugin.settings.customReplaceBuiltInLog["built-in"] = {
    id: "built-in",
    modified: false,
    data: [{ search: "a", replace: "b" }],
  };

  replacement.data[0].flags = "i";
  tab.updateBuiltInModifiedState(replacement);
  assert.equal(plugin.settings.customReplaceBuiltInLog["built-in"].modified, true);

  replacement.data[0].flags = "";
  tab.updateBuiltInModifiedState(replacement);
  assert.equal(plugin.settings.customReplaceBuiltInLog["built-in"].modified, false);
});
