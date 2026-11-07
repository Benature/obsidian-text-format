const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "../..");

// 测试直接执行 TypeScript 源码，无需先产出 main.js，确保验证的是当前修改。
require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const originalLoad = Module._load;
// Obsidian API 仅在真实宿主中提供；运行时使用最小 stub 隔离 Electron 依赖。
Module._load = function (request, parent, isMain) {
  if (request === "obsidian") {
    return {
      Plugin: class Plugin {},
      PluginSettingTab: class PluginSettingTab {},
      Setting: class Setting {},
      Notice: class Notice {},
      debounce: (fn) => fn,
      getLanguage: () => "en",
      normalizePath: (value) => value,
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const format = require(path.join(root, "src/format.ts"));
const link = require(path.join(root, "src/link.ts"));
const { DEFAULT_SETTINGS } = require(path.join(root, "src/settings/types.ts"));
const TextFormat = require(path.join(root, "src/main.ts")).default;
const { TextFormatSettingTab } = require(path.join(root, "src/settings/settingTab.ts"));

function createPlugin() {
  const plugin = Object.create(TextFormat.prototype);
  plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  plugin.log = () => {};
  plugin.saveData = async () => {};
  plugin.debounceUpdateCommandWrapper = () => {};
  plugin.debounceUpdateCommandRequest = () => {};
  plugin.debounceUpdateCommandCustomReplace = () => {};
  return plugin;
}

module.exports = { format, link, DEFAULT_SETTINGS, createPlugin, TextFormatSettingTab };
