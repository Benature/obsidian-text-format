export function removeWikiLink(s: string): string {
  let rx = /\[\[.*?\]\]/g;
  return s.replace(rx, function (t) {
    return t.substring(2, t.length - 2).split('|').slice(-1)[0];
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
