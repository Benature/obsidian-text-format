# Changelog

## 2.6.0

- [feature] Convert wikiLinks to plain markdown links in selection ([#40](https://github.com/Benature/obsidian-text-format/issues/40))
- [feature] remove trailing spaces ([#61](https://github.com/Benature/obsidian-text-format/issues/61))
- [updated] decodeURI
  - `%2F` -> `/`
  - support more schemes, not only http, https, ftp, etc.
- [fix] `Chinese-punctuation`: remove blanks beside punctuation marks

## 2.5.1
- [updated] Wrapper & Request API commands not need to re-enable plugin
- [updated] Custom separator RegExp for "Detect and format ordered list"
- [fix] #79

## 2.5.0
- [feature] Wrapper: support template for metadata (file properties).
- [feature] New Setting: Proper nouns, which are ignored in title case. e.g., USA, UFO.
- [updated] paste Zotero note: if regex fail to match, return original text in clipboard.
- [updated] General: commands support Chinese language. 命令支持中文显示
- [add] Chinese README

## 2.4.1
- [fix] support canvas

## 2.4.0
- [feature] Heading upper/lower
- [updated] Request API support multi API setting

## 2.3.0
- [fix] merge PR #70 : fix typo
- [feature] merge PR #69 : snakify command
- [feature] merge PR #57 : slugify command

## 2.2.10
- [updated] latex-letter convert

## 2.2.9
- lowercase first default as TRUE (#65)
- fix #66
- support #67
- [feature] convert to English punctuation marks
- case: url contains () pair (#72)
- Swedish characters #74
- [updated] update url regex

## 2.2.8
- [fix] decode URI
- [fix] #55
- [fix] #64
- [fix] #60
- [fix] #63

## 2.2.7
- [fix] convert table to bullet list

## 2.2.6
- [updated] #56

## 2.2.5
- [updated] #45

## 2.2.4
- [feature] #24
- [updated] #45

## 2.2.3
- [feature] #45
- [feature] #51

## 2.2.2
- [updated] #54
- [fix] #53
- [fix] #50
- [fix] #49
- [merged] #42
- [updated] #41

## 2.2.1
- [fix] #38

## 2.2.0
- [feature] merge: toggle-case

## 2.1.0
- [feature] API request

## 2.0.0
- [fix] support mobile
- [updated] sort todo