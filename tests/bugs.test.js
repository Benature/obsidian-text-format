// 回归测试按 issue 编号命名；#121 当前无法复现，仅用于锁定已有的正确行为。
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const test = require("node:test");

const {
  format,
  link,
  DEFAULT_SETTINGS,
  createPlugin,
} = require("./helpers/load-ts");

test("#110: empty cycle-case input returns instead of freezing", () => {
  const child = path.join(__dirname, "cycle-case-child.js");
  const result = spawnSync(process.execPath, [child, ""], {
    encoding: "utf8",
    timeout: 2000,
  });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), { changed: false, text: null });
});

test("#110: cycle-case still advances through the configured sequence", async () => {
  const plugin = createPlugin();
  const result = await plugin.formatSelection("hello", "cycle-case");
  assert.equal(result.editorChange.text, "HELLO");
});

test("#99: table conversion uses only header cells as labels", () => {
  const input = "| Name | Role |\n| --- | --- |\n| Ada | Engineer |\n| Grace | Scientist |";
  assert.equal(
    format.table2bullet(input, true),
    "- Ada\n    - Role: Engineer\n- Grace\n    - Role: Scientist\n",
  );
  assert.equal(
    format.table2bullet(input, false),
    "- Ada\n    - Engineer\n- Grace\n    - Scientist\n",
  );
});

test("#99: rows with extra cells do not emit undefined or broken labels", () => {
  const input = "| A |\n| --- |\n| 1 | 2 |";
  const output = format.table2bullet(input, true);
  assert.equal(output, "- 1\n    - 2\n");
  assert.doesNotMatch(output, /undefined|---/);
});

test("#115: URL removal handles escaped parentheses and optional titles", () => {
  const input = '[Super-règne](https://fr.m.wikipedia.org/wiki/Super-r%C3%A8gne "Super-règne"), [Empire](https://fr.m.wikipedia.org/wiki/Empire_\\(biologie\\) "Empire (biologie)"), [Domaine](https://fr.m.wikipedia.org/wiki/Domaine_\\(biologie\\) "Domaine (biologie)")';
  assert.equal(
    link.removeUrlLink(input, "{text}"),
    "Super-règne, Empire, Domaine",
  );
});

test("#115: URL removal handles nested destination parentheses", () => {
  const input = "Before [label](https://example.com/a_(b) \"A (b)\") after";
  assert.equal(link.removeUrlLink(input, "{text}"), "Before label after");
});

test("#115: malformed and ordinary bracketed text remain unchanged", () => {
  assert.equal(
    link.removeUrlLink("plain [brackets] and [broken](https://example.com/a_(b)", "{text}"),
    "plain [brackets] and [broken](https://example.com/a_(b)",
  );
  assert.equal(
    link.removeUrlLink('[label](https://example.com "title )")', "{text}"),
    "label",
  );
  assert.equal(
    link.url2WikiLink('[Empire](https://fr.m.wikipedia.org/wiki/Empire_\\(biologie\\) "Empire (biologie)")'),
    "[[Empire]]",
  );
});

test("#103: removing an empty-heading WikiLink returns its literal text", () => {
  assert.equal(link.removeWikiLink("[[#]]", DEFAULT_SETTINGS.WikiLinkFormat), "#");
  assert.equal(link.removeWikiLink("before [[#]] after", DEFAULT_SETTINGS.WikiLinkFormat), "before # after");
});

test("#103: ordinary WikiLink formatting remains unchanged", () => {
  assert.equal(link.removeWikiLink("[[Note]]", DEFAULT_SETTINGS.WikiLinkFormat), "Note");
  assert.equal(link.removeWikiLink("[[Note|Alias]]", DEFAULT_SETTINGS.WikiLinkFormat), "Alias (Note)");
  assert.equal(link.removeWikiLink("[[Note#Section]]", DEFAULT_SETTINGS.WikiLinkFormat), "Note (> Section)");
});

test("#117: Chinese punctuation conversion includes commas", async () => {
  const plugin = createPlugin();
  const result = await plugin.formatSelection(",.;?", "Chinese-punctuation");
  assert.equal(result.editorChange.text, "，。；？");
  const spaced = await plugin.formatSelection("中文, 测试", "Chinese-punctuation");
  assert.equal(spaced.editorChange.text, "中文，测试");
});

test("#112: sentence capitalization supports checkbox lists", () => {
  const input = "- [ ] first item\n- [x] second item\n  - [X] third item\n- fourth item\n1. fifth item";
  const expected = "- [ ] First item\n- [x] Second item\n  - [X] Third item\n- Fourth item\n1. Fifth item";
  assert.equal(format.capitalizeSentence(input), expected);
});

test("#102: heading level does not increase beyond H6", () => {
  assert.deepEqual(format.headingLevel("###### title", true, 0), { text: "###### title", offset: 0 });
  assert.deepEqual(format.headingLevel("####### title", true, 0), { text: "####### title", offset: 0 });
  assert.deepEqual(format.headingLevel("###### title", false, 0), { text: "##### title", offset: -1 });
});

test("#121: title case capitalizes a leading small word", () => {
  assert.equal(
    format.toTitleCase("The Unbearable Lightness of Being", DEFAULT_SETTINGS),
    "The Unbearable Lightness of Being",
  );
});
