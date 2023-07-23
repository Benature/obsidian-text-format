export function removeWikiLink(s: string): string {
  const pattern1 = /\[\[([^#|]+)#([^|\]]+)\|([^|\]]+)\]\]/g;
  const pattern2 = /\[\[([^#|\]]+)#([^|\]]+)\]\]/g;

  return s.replace(/\[\[.*?\]\]/g, function (t) {
    if (pattern1.test(t)) {
      return t.replace(pattern1, '$3 ($1 > $2)');
    }
    else if (pattern2.test(t)) {
      return t.replace(pattern2, '$1 ($2)');
    }
    else {
      return t.replace(/\[\[(.*?)\]\]/g, '$1');
    }
  });
}

export function removeUrlLink(s: string): string {
  const regex = /\[(.*?)\]\((https?:\/\/\S+)\)/;
  const match = s.match(regex);

  if (match && match.length === 3) {
    return match[2];
  } else {
    return s;
  }
}

export function url2WikiLink(s: string): string {
  let rx = /\[.*?\]\(.+?\)/g;
  return s.replace(rx, function (t) {
    return `[[${t.match(/\[(.*?)\]/)[1]}]]`;
  });
}
