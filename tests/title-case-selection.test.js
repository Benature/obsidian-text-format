const assert = require("node:assert/strict");
const test = require("node:test");

const { createPlugin } = require("./helpers/load-ts");

class MockEditor {
  constructor(text, selections) {
    this.text = text;
    this.selections = selections;
    this.transactionCount = 0;
    this.changeCount = 0;
  }

  listSelections() {
    return this.selections;
  }

  setSelections(selections) {
    this.selections = selections;
  }

  getLine(line) {
    return this.text.split("\n")[line] ?? "";
  }

  posToOffset(pos) {
    const lines = this.text.split("\n");
    let offset = 0;
    for (let index = 0; index < pos.line; index++) {
      offset += lines[index].length + 1;
    }
    return offset + pos.ch;
  }

  offsetToPos(offset) {
    const lines = this.text.split("\n");
    let remaining = offset;
    for (let line = 0; line < lines.length; line++) {
      if (remaining <= lines[line].length) {
        return { line, ch: remaining };
      }
      remaining -= lines[line].length + 1;
    }
    const line = lines.length - 1;
    return { line, ch: lines[line].length };
  }

  getRange(from, to) {
    return this.text.slice(this.posToOffset(from), this.posToOffset(to));
  }

  transaction({ changes, selections }) {
    this.transactionCount++;
    this.changeCount += changes.length;
    const numericChanges = changes.map((change) => ({
      from: this.posToOffset(change.from),
      to: this.posToOffset(change.to),
      text: change.text,
    })).sort((a, b) => a.from - b.from);

    const mapOffset = (offset) => {
      let delta = 0;
      for (const change of numericChanges) {
        if (change.to <= offset) {
          delta += change.text.length - (change.to - change.from);
        } else if (change.from < offset && offset < change.to) {
          return change.from + delta + change.text.length;
        } else {
          break;
        }
      }
      return offset + delta;
    };

    const mappedOffsets = selections.map((range) => ({
      anchor: mapOffset(this.posToOffset(range.from)),
      head: mapOffset(this.posToOffset(range.to)),
    }));

    for (const change of [...numericChanges].sort((a, b) => b.from - a.from)) {
      this.text = this.text.slice(0, change.from) + change.text + this.text.slice(change.to);
    }
    this.selections = mappedOffsets.map((range) => ({
      anchor: this.offsetToPos(range.anchor),
      head: this.offsetToPos(range.head),
    }));
  }
}

function caret(ch, line = 0) {
  return { anchor: { line, ch }, head: { line, ch } };
}

function selection(from, to, line = 0) {
  return { anchor: { line, ch: from }, head: { line, ch: to } };
}

test("#106: title case formats the word at the caret instead of the whole line", async () => {
  const plugin = createPlugin();
  const editor = new MockEditor("The text that is selected.", [caret(6)]);

  await plugin.editorTextFormat(editor, {}, "title-case");

  assert.equal(editor.text, "The Text that is selected.");
  assert.deepEqual(editor.selections, [selection(4, 8)]);
  assert.equal(editor.transactionCount, 1);
});

test("#106: multiple carets are formatted in one transaction", async () => {
  const plugin = createPlugin();
  const editor = new MockEditor("alpha beta gamma", [caret(2), caret(8), caret(13)]);

  await plugin.editorTextFormat(editor, {}, "title-case");

  assert.equal(editor.text, "Alpha Beta Gamma");
  assert.equal(editor.transactionCount, 1);
  assert.equal(editor.changeCount, 3);
  assert.deepEqual(editor.selections, [selection(0, 5), selection(6, 10), selection(11, 16)]);
});

test("#106: selection mapping survives replacement length changes", async () => {
  const plugin = createPlugin();
  const editor = new MockEditor("alpha ßeta gamma", [caret(2), caret(8), caret(13)]);

  await plugin.editorTextFormat(editor, {}, "title-case");

  assert.equal(editor.text, "Alpha SSeta Gamma");
  assert.equal(editor.changeCount, 3);
  assert.deepEqual(editor.selections, [selection(0, 5), selection(6, 11), selection(12, 17)]);
});

test("#106: optional expansion includes hyphenated words", async () => {
  const plugin = createPlugin();
  plugin.settings.TitleCaseExpandSelection = true;
  const editor = new MockEditor("This title has a use-case", [selection(6, 10), selection(18, 22)]);

  await plugin.editorTextFormat(editor, {}, "title-case");

  assert.equal(editor.text, "This Title has a Use-Case");
  assert.deepEqual(editor.selections, [selection(5, 10), selection(17, 25)]);
});

test("#106: partial selections are preserved when expansion is disabled", async () => {
  const plugin = createPlugin();
  const editor = new MockEditor("This title", [selection(6, 10)]);

  await plugin.editorTextFormat(editor, {}, "title-case");

  assert.equal(editor.text, "This tItle");
  assert.deepEqual(editor.selections, [selection(6, 10)]);
});

test("#106: overlapping expanded cursors produce one change", async () => {
  const plugin = createPlugin();
  const editor = new MockEditor("alpha beta", [caret(1), caret(3)]);

  await plugin.editorTextFormat(editor, {}, "title-case");

  assert.equal(editor.text, "Alpha beta");
  assert.equal(editor.changeCount, 1);
  assert.deepEqual(editor.selections, [selection(0, 5)]);
});

test("#106: camelCase, possessives, and hyphens are single word targets", async () => {
  const plugin = createPlugin();
  plugin.settings.LowercaseFirst = false;
  const editor = new MockEditor("thisIsAFunction USA's use-case", [caret(4), caret(18), caret(25)]);

  await plugin.editorTextFormat(editor, {}, "title-case");

  assert.equal(editor.text, "thisIsAFunction USA's Use-Case");
  assert.equal(editor.changeCount, 1);
  assert.deepEqual(editor.selections, [selection(0, 15), selection(16, 21), selection(22, 30)]);
});

test("#106: a caret outside a word remains unchanged", async () => {
  const plugin = createPlugin();
  const original = [caret(4)];
  const editor = new MockEditor("one  two", original);

  await plugin.editorTextFormat(editor, {}, "title-case");

  assert.equal(editor.text, "one  two");
  assert.equal(editor.transactionCount, 0);
  assert.deepEqual(editor.selections, original);
});
