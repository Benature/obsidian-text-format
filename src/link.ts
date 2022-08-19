export function removeWikiLink(s: string): string {
  let rx = /\[\[.*?\]\]/g;
  return s.replace(rx, function (t) {
    return t.substring(2, t.length - 2);
  });
}

export function removeUrlLink(s: string): string {
  let rx = /\[.*?\]\(.+?\)/g;
  return s.replace(rx, function (t) {
    return t.match(/\[(.*?)\]/)[1];
  });
}

export function url2WikiLink(s: string): string {
  let rx = /\[.*?\]\(.+?\)/g;
  return s.replace(rx, function (t) {
    return `[[${t.match(/\[(.*?)\]/)[1]}]]`;
  });
}
