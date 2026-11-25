const assert = require("node:assert/strict");
const test = require("node:test");

const { format, createPlugin } = require("./helpers/load-ts");

test("#108: multiline bullet paste is disabled by default", () => {
  const plugin = createPlugin();
  assert.equal(plugin.settings.MultilineBulletPaste, false);
});

test("#108: pasting plain lines into an empty bullet creates a flat list", () => {
  assert.equal(
    format.formatMultilineBulletPaste("first line\nsecond line\nthird line", "- "),
    "- first line\n- second line\n- third line",
  );
});

test("#108: paste preserves the current indentation and bullet marker", () => {
  assert.equal(
    format.formatMultilineBulletPaste("first\nsecond", "  * "),
    "  * first\n  * second",
  );
  assert.equal(
    format.formatMultilineBulletPaste("first\nsecond", "\t+ "),
    "\t+ first\n\t+ second",
  );
});

test("#108: blank lines are skipped and existing markers are normalized", () => {
  assert.equal(
    format.formatMultilineBulletPaste("- first\n\n  * second\n+ third", "- "),
    "- first\n- second\n- third",
  );
});

test("#108: paste conversion only applies to multiple non-empty lines", () => {
  assert.equal(format.formatMultilineBulletPaste("one line", "- "), null);
  assert.equal(format.formatMultilineBulletPaste("\n \n", "- "), null);
  assert.equal(format.formatMultilineBulletPaste("first\nsecond", "- existing"), null);
  assert.equal(format.formatMultilineBulletPaste("first\nsecond", "plain text"), null);
});

test("reverse-lines: reverses line order", () => {
  assert.equal(format.reverseLines("1\n2\n3"), "3\n2\n1");
});

test("reverse-lines: blank lines move with the reversal", () => {
  assert.equal(format.reverseLines("a\n\nb\nc"), "c\nb\n\na");
});

test("reverse-lines: a single line is unchanged", () => {
  assert.equal(format.reverseLines("only line"), "only line");
});

test("reverse-lines: command is wired through formatSelection", async () => {
  const plugin = createPlugin();
  const result = await plugin.formatSelection("first\nsecond\nthird", "reverse-lines");
  assert.equal(result.editorChange.text, "third\nsecond\nfirst");
});
