const LC = "[\\w\\u0400-\\u04FF]"; // Latin and Cyrillic

export function capitalizeWord(str: string): string {
  var rx = new RegExp(LC + "\\S*", "g");
  return str.replace(rx, function (t) {
    return t.charAt(0).toUpperCase() + t.substr(1);
  });
}

export function capitalizeSentence(s: string): string {
  var rx = new RegExp(
    "(^|\\n|[\"'])" + LC + "|(?<=[\\.!?~]\\s+)" + LC + "",
    "g"
  );

  // return s.replace(/^\S|(?<=[\.!?\n~]\s+)\S/g, function (t) {
  return s.replace(rx, function (t) {
    return t.toUpperCase();
  });
}

export function removeAllSpaces(s: string): string {
  return s.replace(/(?<![\)\]:#-]) | $/g, "");
}

export function array2markdown(content: string): string {
  let volume = content.match(/(?<=\{)[clr]+(?=\})/)[0].length;

  content = content
    .replace(/\$|\n/g, ``)
    .replace(/\\text *\{.*?\}/g, (t) =>
      t.match(/(?<=\{).*?(?=\})/g)[0].replace(/^ +| +$/g, ``)
    );

  // single line
  content = content.replace(
    /\\begin\{array\}\{[clr]\}.*?\\end\{array\}/g,
    (t) =>
      t
        .replace(/\\\\begin\{array\}\{[clr]\}/g, "")
        .replace("\\end{array}", "")
        .replace(/\\\\ /g, "")
  );

  // \n
  content = content.replace(/\\\\ \\hline|\\\\ */g, (t) => t + `\n`);

  // convert to table
  let markdown = (
    "|" +
    content
      .replace(/\\begin\{array\}\{[clr]+\}|\\end\{array\}|\\hline/g, "")
      .replace(/&/g, "|")
      .replace(/\n[ ]*$/, "")
      .replace(/\\\\[ ]*?\n/g, "|\n|")
      .replace("\\\\", "|")
  ).replace("\n", "\n" + "|:-:".repeat(volume) + "|\n");

  let beautify_markdown = markdown
    .replace(/\[[\d,]+?\]/g, "")
    .replace(/\\[\w\{\}\d]+/g, (t) => `$${t}$`);

  return beautify_markdown;
}

/* To Title Case © 2018 David Gouch | https://github.com/gouch/to-title-case */
// eslint-disable-next-line no-extend-native
// @ts-ignore
String.prototype.toTitleCase = function () {
  "use strict";
  var smallWords =
    /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
  var alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/;
  var wordSeparators = /([ :–—-])/;

  return this.split(wordSeparators)
    .map(function (current: string, index: number, array: string) {
      if (
        /* Check for small words */
        current.search(smallWords) > -1 &&
        /* Skip first and last word */
        index !== 0 &&
        index !== array.length - 1 &&
        /* Ignore title end and subtitle start */
        array[index - 3] !== ":" &&
        array[index + 1] !== ":" &&
        /* Ignore small words that start a hyphenated phrase */
        (array[index + 1] !== "-" ||
          (array[index - 1] === "-" && array[index + 1] === "-"))
      ) {
        return current.toLowerCase();
      }

      /* Ignore intentional capitalization */
      if (current.substr(1).search(/[A-Z]|\../) > -1) {
        return current;
      }

      /* Ignore URLs */
      if (array[index + 1] === ":" && array[index + 2] !== "") {
        return current;
      }

      /* Capitalize the first letter */
      return current.replace(alphanumericPattern, function (match) {
        return match.toUpperCase();
      });
    })
    .join("");
};
