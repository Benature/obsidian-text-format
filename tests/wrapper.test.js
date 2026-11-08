const assert = require("node:assert/strict");
const test = require("node:test");

const { format } = require("./helpers/load-ts");

test("#111: Anki cloze prefix and suffix remain literal", () => {
  assert.equal(format.formatWrapperTemplate("{{c1::", {}), "{{c1::");
  assert.equal(format.formatWrapperTemplate("}}", {}), "}}");
  assert.equal(format.formatWrapperTemplate("{{c12::answer}}", {}), "{{c12::answer}}");
});

test("#111: metadata templates still work alongside Anki cloze markers", () => {
  assert.equal(
    format.formatWrapperTemplate("{{c1::{{reference}}", { reference: "Paper title" }),
    "{{c1::Paper title",
  );
  assert.equal(
    format.formatWrapperTemplate("{{c1::{{reference}}}}", { reference: "Paper title" }),
    "{{c1::Paper title}}",
  );
  assert.equal(format.formatWrapperTemplate("{{reference}}", { reference: "Paper title" }), "Paper title");
});
