const assert = require("node:assert/strict");
const test = require("node:test");

const { format, createPlugin } = require("./helpers/load-ts");

test("#114: title case handles Vietnamese Unicode letters", () => {
  const plugin = createPlugin();
  assert.equal(
    format.toTitleCase("ĐÂY LÀ MỘT DÒNG ĐƯỢC VIẾT BẰNG TIẾNG VIỆT", plugin.settings),
    "Đây Là Một Dòng Được Viết Bằng Tiếng Việt",
  );
});

test("#114: intentional all-caps text is preserved when lowercase-first is disabled", () => {
  const plugin = createPlugin();
  plugin.settings.LowercaseFirst = false;
  const input = "ĐÂY LÀ MỘT DÒNG";
  assert.equal(format.toTitleCase(input, plugin.settings), input);
});

test("#118: Turkish title case maps capital I to dotless ı", () => {
  const plugin = createPlugin();
  assert.equal(
    format.toTitleCase("IŞIK IŞILTISI.", plugin.settings),
    "Işık Işıltısı.",
  );
});

test("#118: lowercase and capitalize-word share Turkish locale handling", async () => {
  const plugin = createPlugin();
  const lower = await plugin.formatSelection("IŞIK IŞILTISI.", "lowercase");
  assert.equal(lower.editorChange.text, "ışık ışıltısı.");

  const capitalized = await plugin.formatSelection("IŞIK IŞILTISI.", "capitalize-word");
  assert.equal(capitalized.editorChange.text, "Işık Işıltısı.");
});

test("locale-aware casing preserves dotted Turkish İ and English I", async () => {
  const plugin = createPlugin();
  assert.equal(format.toTitleCase("İSTANBUL", plugin.settings), "Istanbul");

  const english = await plugin.formatSelection("I AM HERE", "lowercase");
  assert.equal(english.editorChange.text, "i am here");
});
