# Changelog

🧱 [Todo Project](https://github.com/Benature/obsidian-text-format/projects/1)

## 🏗️ developed
> to be update in the next version


## 3.2.1-b2
- [fix] Convert Table to Bullet List, may be related to #99
- [updated] latex math add: `'≠': '\\neq'`

## 3.2.0-b1
- [feature] Settings: global configuration for format on paste #97

## 3.1.0
- [feature] several commands (e.g. decode URI) support in front matter (metadata)
- [feature] command for open settings tab directly
- [fix] convert Latex has no editor when formatting on paste

## 3.0.5
- [updated] Chinese: command translation and description of Upper/Lower heading level

## 3.0.4
- [PR] #96
- [updated] Chinese description of Upper/Lower heading level

## 3.0.3
- [fix] wrapper did not work in canvas

## 3.0.2
- [update] #93
- [feature] #90
- [feature] #89

## 3.0.1
- [feature] Only sort the todo block where the caret is. more details at [#46](https://github.com/Benature/obsidian-text-format/issues/46#issuecomment-2008929183).
- [fix] `#` for capitalizeSentence
- [update] #81

## 3.0.0
- [feature] support multi-cursor for commands ([#48](https://github.com/Benature/obsidian-text-format/issues/48))
- [feature] heading upper/lower for multi-lines ([#83](https://github.com/Benature/obsidian-text-format/issues/83))
- [fix] remove all `(?<=)` for compatible issue ([#82](https://github.com/Benature/obsidian-text-format/issues/82))
- [renamed] rename ~~`toggle case`~~ to `cycle case` (id ~~`togglecase`~~ to `cycle-case`), rename ~~`titlecase`~~ to `title-case`. (Hotkeys on these commands need to be re-configured)
- [update] beautify settings ([#84](https://github.com/Benature/obsidian-text-format/issues/84))
- [feature] format on paste for plain text ([#86](https://github.com/Benature/obsidian-text-format/issues/86))

## 2.7.1
- [fix] `customReplace()`: error when search contains like `\.\!\?` 
- [update] `Chinese-punctuation`: select modification at last
- [update] `math mode`: 
  - calculation support `=` and Greek letters
  - if selectedText is surrounded by `$`, convert unicode Greek letters to latex commands

## 2.7.0
- [update] `Chinese-punctuation`: only remove spaces between Chinese characters and punctuations rather than all spaces
- [update] `Format bullet list`
  - Keep selecting whole paragraphs after formatting rather than set cursor at the end.
  - Ensure first line starts with `- ` if multiple lines are selected

### *2.7.0-b1*

- [notice] refactoring i18n, but zh-tw language will be deprecated later because of the limitation of developing time.
- [feature] support [#68](https://github.com/Benature/obsidian-text-format/issues/68)
- [update] `Convert wikiLinks to plain markdown links in selection`: Three path modes
  - absolute
  - relative to Obsidian
  - relative to file
- [feature] collapsible heading in settings
- [feature] custom replacement
- [update] callout format: auto select whole paragraph
- [feature] `math mode`:
  - rename: Detect and convert characters to math mode (LaTeX)
  - two characters (sub case): e.g. `a0` -> `$a_0$`
    - [ ] More ignore case should be considered. For now: `/is|or|as|to|am|an|at|by|do|go|ha|he|hi|ho|if|in|it|my|no|of|on|so|up|us|we/g`
  - simple calculation: e.g. `ab+cd` -> `$a_b+c_d$`
  - sup case for `*`: e.g. `a*` -> `$a^*$`

## 2.6.0
- [feature] Convert wikiLinks to plain markdown links in selection ([#40](https://github.com/Benature/obsidian-text-format/issues/40))
- [feature] remove trailing spaces ([#61](https://github.com/Benature/obsidian-text-format/issues/61))
- [update] decodeURI
  - `%2F` -> `/`
  - support more schemes, not only http, https, ftp, etc.
- [fix] `Chinese-punctuation`: remove blanks beside punctuation marks

## 2.5.1
- [update] Wrapper & Request API commands not need to re-enable plugin
- [update] Custom separator RegExp for "Detect and format ordered list"
- [fix] #79

## 2.5.0
- [feature] Wrapper: support template for metadata (file properties).
- [feature] New Setting: Proper nouns, which are ignored in title case. e.g., USA, UFO.
- [update] paste Zotero note: if regex fail to match, return original text in clipboard.
- [update] General: commands support Chinese language. 命令支持中文显示
- [add] Chinese README

## 2.4.1
- [fix] support canvas

## 2.4.0
- [feature] Heading upper/lower
- [update] Request API support multi API setting

## 2.3.0
- [fix] merge PR #70 : fix typo
- [feature] merge PR #69 : snakify command
- [feature] merge PR #57 : slugify command

## 2.2.10
- [update] latex-letter convert

## 2.2.9
- lowercase first default as TRUE (#65)
- fix #66
- support #67
- [feature] convert to English punctuation marks
- case: url contains () pair (#72)
- Swedish characters #74
- [update] update url regex

## 2.2.8
- [fix] decode URI
- [fix] #55
- [fix] #64
- [fix] #60
- [fix] #63

## 2.2.7
- [fix] convert table to bullet list

## 2.2.6
- [update] #56

## 2.2.5
- [update] #45

## 2.2.4
- [feature] #24
- [update] #45

## 2.2.3
- [feature] #45
- [feature] #51

## 2.2.2
- [update] #54
- [fix] #53
- [fix] #50
- [fix] #49
- [merged] #42
- [update] #41

## 2.2.1
- [fix] #38

## 2.2.0
- [feature] merge: toggle-case

## 2.1.0
- [feature] API request

## 2.0.0
- [fix] support mobile
- [update] sort todo