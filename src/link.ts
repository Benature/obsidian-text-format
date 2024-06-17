import { stringFormat } from "./format";
import { WikiLinkFormatGroup, Wikilink2mdPathMode } from "./settings/types";
import TextFormat from "./main";

export function removeWikiLink(s: string, formatGroup: WikiLinkFormatGroup): string {
  return s.replace(/\[\[.*?\]\]/g, function (t) {
    let wiki_exec = /\[\[(?<title>[^\[#|]+)?(?<heading>#[^|\]]+)?(?<alias>\|[^|\]]+)?\]\]/g.exec(t);
    let G = wiki_exec.groups;
    console.log(G)
    let groupArgs = {
      title: G.title === undefined ? '' : G.title,
      heading: G.heading?.slice(1),
      alias: G.alias?.slice(1)
    };
    console.log(groupArgs);
    if (G.heading === undefined && G.alias === undefined) {
      return G.title;
    } else if (G.alias !== undefined && G.heading === undefined) {
      return stringFormat(formatGroup.aliasOnly, groupArgs);
    } else if (G.alias === undefined && G.heading !== undefined) {
      return stringFormat(formatGroup.headingOnly, groupArgs);
    } else {
      console.log(groupArgs);
      return stringFormat(formatGroup.both, groupArgs);
    }
  });
}

const RegexMarkdownLink = /\[(.+?)\]\((?:[^)]+\([^)]+\)[^)]*|[^)]+)\)/g;

export function removeUrlLink(s: string, UrlLinkFormat: string): string {
  console.log(s)
  const rx = RegexMarkdownLink;
  return s.replace(rx, function (t) {
    // TODO: add a setting to decide whether remove url link (starts with http) only or all kinds of links
    // const regex = /\[(?<text>.*?)\]\((?<url>https?:\/\/[\S\s]+)\)/;
    const regex = /\[(?<text>.*?)\]\((?<url>[\S\s]+?)\)/;
    const match = t.match(regex);
    console.log(match)
    if (match && match.length === 3) {
      return stringFormat(UrlLinkFormat, match.groups);
    } else {
      return t;
    }
  });
}

export function url2WikiLink(s: string): string {
  let rx = RegexMarkdownLink;
  return s.replace(rx, function (t) {
    return `[[${t.match(/\[(.*?)\]/)[1]}]]`;
  });
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
        case Wikilink2mdPathMode.relativeFile:
          const currentFilePath = plugin.app.workspace.getActiveFile().path;
          linkURL = relativePath(linkURL, currentFilePath)
          break;
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