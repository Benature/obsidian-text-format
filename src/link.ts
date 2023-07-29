export function removeWikiLink(s: string): string {
  return s.replace(/\[\[.*?\]\]/g, function (t) {
    let wiki_exec = /\[\[(?<title>[^\[#|]+)(?<heading>#[^|\]]+)?(?<alias>\|[^|\]]+)?\]\]/g.exec(t);
    let G = wiki_exec.groups;
    if (G.heading === undefined && G.alias === undefined) {
      return G.title;
    } else if (G.alias !== undefined) {
      let heading;
      if (G.heading !== undefined) { heading = ` > ${G.heading.slice(1)}`; } else { heading = ""; }
      return `${G.alias.slice(1)} (${G.title}${heading})`;
    } else {
      return `${G.title} (> ${G.heading.slice(1)})`;
    }
  });
}

export function removeUrlLink(s: string): string {
  const rx = /\[([^\]]*?)\]\(\S+?\)/g;
  return s.replace(rx, function (t) {
    const regex = /\[(.*?)\]\((https?:\/\/\S+)\)/;
    const match = t.match(regex);
    if (match && match.length === 3) {
      return match[2];
    } else {
      return s;
    }
  });
}

export function url2WikiLink(s: string): string {
  let rx = /\[.*?\]\(.+?\)/g;
  return s.replace(rx, function (t) {
    return `[[${t.match(/\[(.*?)\]/)[1]}]]`;
  });
}
