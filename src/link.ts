import { stringFormat } from "./format";
import { WikiLinkFormatGroup } from "./setting";
import TextFormat from "../main";

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

const markdown_link_regex = /\[(.+?)\]\((?:[^)]+\([^)]+\)[^)]*|[^)]+)\)/g;

export function removeUrlLink(s: string, UrlLinkFormat: string): string {
  const rx = markdown_link_regex;
  return s.replace(rx, function (t) {
    const regex = /\[(?<text>.*?)\]\((?<url>https?:\/\/[\S\s]+)\)/;
    const match = t.match(regex);
    if (match && match.length === 3) {
      return stringFormat(UrlLinkFormat, match.groups);
    } else {
      return s;
    }
  });
}

export function url2WikiLink(s: string): string {
  let rx = markdown_link_regex;
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
    if (note) {
      linkTarget = note.path.replace(/\s/g, "%20");
      if (!plugin.settings.isWikiLink2mdRelativePath) {
        // @ts-ignore
        linkTarget = plugin.app.vault.adapter.basePath + "/" + linkTarget;
      }
    } else {
      // return wikiLink;
    }
    return `[${linkText}](${linkTarget})`;
  });

  return markdown;
}