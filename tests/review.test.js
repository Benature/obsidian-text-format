const assert = require("node:assert/strict");
const test = require("node:test");

const { format, createPlugin } = require("./helpers/load-ts");

test("review cleanup: RegExp constructor preserves whitespace matching", async () => {
  const plugin = createPlugin();
  const result = await plugin.formatSelection("• first • second", "convert-bullet-list");
  assert.equal(result.editorChange.text, "- first \n- second");
});

test("review cleanup: punctuation character classes keep their behavior", async () => {
  const plugin = createPlugin();
  const result = await plugin.formatSelection("（english）", "English-punctuation");
  assert.equal(result.editorChange.text, "(english)");
});

test("review cleanup: title separators remain valid after escape cleanup", () => {
  const plugin = createPlugin();
  assert.equal(
    format.toTitleCase("the lord of the rings: the fellowship–part one", plugin.settings),
    "The Lord of the Rings: The Fellowship–Part One",
  );
});
