const { createPlugin } = require("./helpers/load-ts");

// cycle-case 的回归形式是同步死循环；独立子进程让测试可以通过 timeout 强制终止它。
(async () => {
  const plugin = createPlugin();
  const input = process.argv[2] || "";
  const result = await plugin.formatSelection(input, "cycle-case");
  process.stdout.write(JSON.stringify({
    changed: result.editorChange.text !== undefined,
    text: result.editorChange.text ?? null,
  }));
})();
