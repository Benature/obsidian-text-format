import { stringFormat } from "./format";
import { WikiLinkFormatGroup, Wikilink2mdPathMode } from "./settings/types";
import TextFormat from "./main";

export function removeWikiLink(s: string, formatGroup: WikiLinkFormatGroup): string {
  return s.replace(/\[\[.*?\]\]/g, function (t) {
    // #103: heading 使用 * 以允许 [[#]]；完整匹配失败时保留原文，避免读取 null.groups。
    const wikiExec = /^\[\[(?<title>[^[#|]+)?(?<heading>#[^|\]]*)?(?<alias>\|[^|\]]+)?\]\]$/.exec(t);
    if (!wikiExec) {
      return t;
    }
    const G = wikiExec.groups;
    const groupArgs = {
      title: G.title || "",
      heading: G.heading?.slice(1),
      alias: G.alias?.slice(1)
    };
    if (G.heading === undefined && G.alias === undefined) {
      return groupArgs.title;
    } else if (G.alias !== undefined && G.heading === undefined) {
      return stringFormat(formatGroup.aliasOnly, groupArgs);
    } else if (G.alias === undefined && G.heading !== undefined) {
      // [[#]] 没有可套用的标题模板，按用户预期保留其字面文本 #。
      if (!groupArgs.title && G.heading === "#") {
        return "#";
      }
      return stringFormat(formatGroup.headingOnly, groupArgs);
    } else {
      return stringFormat(formatGroup.both, groupArgs);
    }
  });
}

interface MarkdownLink {
  text: string;
  url: string;
  end: number;
}

// #115: 正则难以区分 URL、转义字符和可选标题中的括号；逐字符追踪深度以找到真正的链接边界。
function parseMarkdownLink(s: string, openBracket: number): MarkdownLink | null {
  let bracketDepth = 1;
  let cursor = openBracket + 1;
  let closeBracket = -1;

  for (; cursor < s.length; cursor++) {
    if (s[cursor] === "\\") {
      cursor++;
    } else if (s[cursor] === "[") {
      bracketDepth++;
    } else if (s[cursor] === "]" && --bracketDepth === 0) {
      closeBracket = cursor;
      break;
    }
  }
  if (closeBracket === -1 || s[closeBracket + 1] !== "(") {
    return null;
  }

  // 反斜杠后的括号按字面处理；引号标题里的括号不参与链接深度计算。
  let parenthesisDepth = 1;
  let quote = "";
  for (cursor = closeBracket + 2; cursor < s.length; cursor++) {
    const char = s[cursor];
    if (char === "\\") {
      cursor++;
      continue;
    }
    if (quote) {
      if (char === quote) {
        quote = "";
      }
      continue;
    }
    if ((char === '"' || char === "'") && /\s/.test(s[cursor - 1])) {
      quote = char;
    } else if (char === "(") {
      parenthesisDepth++;
    } else if (char === ")" && --parenthesisDepth === 0) {
      return {
        text: s.slice(openBracket + 1, closeBracket),
        url: s.slice(closeBracket + 2, cursor),
        end: cursor,
      };
    }
  }
  return null;
}

// 只替换完整解析成功的链接；普通方括号和 malformed link 均原样保留。
function replaceMarkdownLinks(s: string, replacer: (link: MarkdownLink) => string): string {
  let output = "";
  let cursor = 0;
  while (cursor < s.length) {
    const openBracket = s.indexOf("[", cursor);
    if (openBracket === -1) {
      break;
    }
    const link = parseMarkdownLink(s, openBracket);
    if (!link) {
      output += s.slice(cursor, openBracket + 1);
      cursor = openBracket + 1;
      continue;
    }
    output += s.slice(cursor, openBracket) + replacer(link);
    cursor = link.end + 1;
  }
  return output + s.slice(cursor);
}

export function removeUrlLink(s: string, UrlLinkFormat: string): string {
  return replaceMarkdownLinks(s, (link) => stringFormat(UrlLinkFormat, { text: link.text, url: link.url }));
}

export function url2WikiLink(s: string): string {
  // 与 removeUrlLink 共用解析器，避免复杂 URL 在转换 WikiLink 时同样被截断。
  return replaceMarkdownLinks(s, (link) => `[[${link.text}]]`);
}

export function convertWikiLinkToMarkdown(wikiLink: string, plugin: TextFormat): string {
  const regex = /\[\[([^|\]]+)\|?([^\]]+)?\]\]/g;

  const markdown = wikiLink.replace(regex, (match, p1, p2) => {
    const linkText = p2 ? p2.trim() : p1.trim();
    let linkTarget = p1.trim().replace(/#.*$/g, "") + ".md";

    const note = plugin.app.vault.getAllLoadedFiles().find(file => file.name === linkTarget);
    let linkURL = linkTarget;
    if (note) {
      linkURL = note.path;
      switch (plugin.settings.Wikilink2mdRelativePath) {
        case Wikilink2mdPathMode.absolute:
          // @ts-ignore
          linkURL = plugin.app.vault.adapter.basePath + "/" + linkURL;
          break;
        case Wikilink2mdPathMode.relativeFile: {
          const currentFilePath = plugin.app.workspace.getActiveFile().path;
          linkURL = relativePath(linkURL, currentFilePath)
          break;
        }
      }
      linkURL = linkURL.replace(/\s/g, "%20");
    }
    const matchAlias = linkText.match(/#(.*)$/);
    let aliasLink = "";
    if (matchAlias) {
      aliasLink = "#" + matchAlias[1].replace(/\s/g, "%20");
    }
    return `[${linkText}](${linkURL}${aliasLink})`;
  });

  return markdown;
}

function relativePath(pathA: string, pathB: string): string {
  const splitPathA = pathA.split('/');
  const splitPathB = pathB.split('/');

  // 找到共同根路径
  let commonRootIndex = 0;
  while (commonRootIndex < Math.min(splitPathA.length - 1, splitPathB.length - 1)
    && splitPathA[commonRootIndex] === splitPathB[commonRootIndex]) {
    commonRootIndex++;
  }

  // 构建相对路径
  let relativePath = '';
  for (let i = commonRootIndex; i < splitPathB.length - 1; i++) {
    relativePath += '../';
  }

  // 将路径 A 的剩余部分添加到相对路径中
  for (let i = commonRootIndex; i < splitPathA.length; i++) {
    relativePath += splitPathA[i] + '/';
  }

  return relativePath.slice(0, -1); // 去除末尾的斜杠
}