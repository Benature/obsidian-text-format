const assert = require("node:assert/strict");
const test = require("node:test");

const { format } = require("./helpers/load-ts");

function replacement(search, replace, flags) {
  const data = { search, replace };
  if (flags !== undefined) {
    data.flags = flags;
  }
  return { id: "test", name: "Test", data: [data] };
}

test("custom replace: legacy rules remain global and case-sensitive", () => {
  const rule = replacement("a", "x");
  assert.equal(format.customReplace("a A a", rule), "x A x");
});

test("custom replace: case-insensitive flag supports backreferences", () => {
  const rule = replacement(
    String.raw`\[([^\]]+)\]\((\S+) "(\2)"\)`,
    "[$1]($2)",
    "i",
  );
  const input = '[Example](https://example.com/PATH "https://example.com/path")';
  assert.equal(format.customReplace(input, rule), "[Example](https://example.com/PATH)");
});

test("custom replace: case-insensitive rule keeps informative link titles", () => {
  const rule = replacement(
    String.raw`\[([^\]]+)\]\((\S+) "(\2)"\)`,
    "[$1]($2)",
    "i",
  );
  const input = '[Example](https://example.com/PATH "Project documentation")';
  assert.equal(format.customReplace(input, rule), input);
});

test("custom replace: global flag is preserved and duplicate flags are removed", () => {
  const rule = replacement("a", "x", "gii");
  assert.equal(format.customReplace("a A a A", rule), "x x x x");
});

test("custom replace: multiline and dotAll flags can be combined", () => {
  const rule = replacement("^a.b$", "x", "ms");
  assert.equal(format.customReplace("a\nb", rule), "x");
});

test("custom replace: invalid flags are rejected", () => {
  const rule = replacement("a", "x", "z");
  assert.throws(() => format.customReplace("a", rule), SyntaxError);
});
