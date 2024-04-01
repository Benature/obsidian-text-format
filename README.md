# Text Format

<div align="center">

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22obsidian-text-format%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json) ![GitHub stars](https://img.shields.io/github/stars/Benature/obsidian-text-format?style=flat) ![latest download](https://img.shields.io/github/downloads/Benature/obsidian-text-format/latest/total?style=plastic) 
[![Github release](https://img.shields.io/github/manifest-json/v/Benature/obsidian-text-format?color=blue)](https://github.com/Benature/obsidian-text-format/releases/latest) ![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/Benature/obsidian-text-format?include_prereleases&label=BRAT%20beta)

[ [中文](https://github.com/Benature/obsidian-text-format/blob/master/README_ZH.md) | English ]

</div>


>When I'm taking notes, sometimes I encounter some issues like  
>1. I copied some text from pdf or some other source, but the copied content is out of format. For example, there are more than one space between words or one paragraph brokes into several lines.  
>2. Lowercase letters are required while they are all uppercase, etc.
>3. blahblahblah...

This plugin is created to format selected text lowercase/uppercase/capitalize/titlecase or remove redundant spaces/newline characters, and other features listed below.

[Click to install this plugin right now](https://obsidian.md/plugins?id=obsidian-text-format)

## Features

Experimental features:
- Format on paste: see [#86](https://github.com/Benature/obsidian-text-format/issues/86)

### Commands

Press <kbd>cmd/ctrl+P</kbd> to enter the command. 👇

Or you can consider to bind custom hotkeys to those commands according to [#29](https://github.com/Benature/obsidian-text-format/issues/29#issuecomment-1279246640).

---

- [Text Format](#text-format)
  - [Features](#features)
    - [Commands](#commands)
      - [Basic](#basic)
      - [Markdown Grammar](#markdown-grammar)
        - [List](#list)
        - [Links](#links)
      - [Copy / OCR issues](#copy--ocr-issues)
      - [Academic / Study](#academic--study)
      - [Advanced custom](#advanced-custom)
      - [Others](#others)
  - [Support](#support)
  - [Some Examples](#some-examples)
    - [Zotero format](#zotero-format)
    - [Replacements](#replacements)
    - [Wrapper](#wrapper)
    - [Convert citation index to the file name of paper note](#convert-citation-index-to-the-file-name-of-paper-note)
    - [Basic](#basic-1)


⚙️: There is setting of this command.

#### Basic

| Command                                           | Description                                                                                                                                                                             |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lowercase**                                     | Lowercase all letters in selection or the whole title (when cursor focus inline tile)                                                                                                   |
| **Uppercase**                                     | Uppercase all letters in selection  or the whole title (when cursor focus inline tile)                                                                                                  |
| **Capitalize** all **words**  ⚙️                   | Capitalize all words in selection  or the whole title (when cursor focus inline tile)                                                                                                   |
| **Capitalize** only first word of **sentence**  ⚙️ | Capitalize only first word of sentence(s) in selection  or the whole title (when cursor focus inline tile)                                                                              |
| **Title case**  ⚙️                                 | Capitalize words but leave certain words in lower case in selection  or the whole title (when cursor focus inline tile) [#1](https://github.com/Benature/obsidian-text-format/issues/1) |
| **Cycle case**  ⚙️                                 | A custom loop to format the selection or the whole title (when cursor focus inline tile)                                                                                                |
| **Slugify** selected text                         | convert any input text into a URL-friendly slug                                                                                                                                         |
| **Snakify** selected text                         | Lowercase all letters in selection *and* replace spaces with underscores                                                                                                                |

#### Markdown Grammar

| Command        | Description                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Heading upper  | e.g.: `# Heading` -> `## Heading` (default shortcut: `Ctrl+Shift+]`)                                                                             |
| Heading lower  | e.g.: `## Heading` -> `# Heading` (default shortcut: `Ctrl+Shift+[`) [[discussions](https://github.com/Benature/obsidian-text-format/issues/83)] |
| Callout format | [#80](https://github.com/Benature/obsidian-text-format/issues/80)                                                                                |


##### List
| Command                                  | Description                                                                                                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Detect and format **bullet** list ⚙️      | Change `•` into bullet list, i.e. `- `; split every bullet point into single line; and remove blank lines. ([test cases](https://github.com/Benature/obsidian-text-format/issues/66)) |
| Detect and format **ordered** list       | Change `*)`(star could be any letter) into ordered list (e.g. `1. `, `2. `); split every ordered point into single line; and remove blank lines. (#4)                                 |
| Convert table to bullet list             | The first volume is 1st list, other volumes are sub-list                                                                                                                              |
| Convert table to bullet list with header | Sub-list begins with `${header}: `                                                                                                                                                    |
| **Sort to-do** list                      | [#37](https://github.com/Benature/obsidian-text-format/issues/37), [#46](https://github.com/Benature/obsidian-text-format/issues/46)                                                  |

##### Links

| Command                                                  | Description                                                                                                            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Remove WikiLinks format in selection                     | e.g. Convert `[[WikiLinks]]` to `WikiLinks` ([#28](https://github.com/Benature/obsidian-text-format/issues/28))        |
| Remove URL links format in selection                     | e.g. Convert `[Google](www.google.com)` to `Google`                                                                    |
| Convert URL links to WikiLinks in selection              | e.g. Convert `[Google](www.google.com)` to `[[Google]]`                                                                |
| Convert WikiLinks to plain markdown links in selection ⚙️ | e.g. Convert `[[Google]]` to `[Google](Google.md)` ([#40](https://github.com/Benature/obsidian-text-format/issues/40)) |

#### Copy / OCR issues

| Command                                            | Description                                                                                                                                                                                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remove **redundant spaces** in selection           | Ensure only one space between words                                                                                                                                                                                                                |
| Remove **all spaces** in selection                 | Remove all spaces                                                                                                                                                                                                                                  |
| Remove **trailing spaces** in selection            | Remove trailing spaces ([#61](https://github.com/Benature/obsidian-text-format/issues/61))                                                                                                                                                         |
| Remove **blank line(s)**                           | replace `\n\n` with `\n`                                                                                                                                                                                                                           |
| Merge **broken paragraph(s)** in selection ⚙️       | Change selected lines into single-line, except lines are separated by blank line(s). *At the same time, blank lines will be merged into one blank line(optional, default enable), and redundant spaces will be removed(optional, default enable).* |
| **Split** line(s) by **blanks**                    | Replace ` ` with `\n` for OCR use case.                                                                                                                                                                                                            |
| Convert to **Chinese punctuation** marks (,;:!?) ⚙️ | For OCR use case. (For who require more custom setting, I would recommend <https://p.gantrol.com/>)                                                                                                                                                |
| Convert to **English punctuation** marks           | Similar to `Convert to Chinese punctuation marks (,;:!?)`                                                                                                                                                                                          |
| Remove **hyphens**                                 | Remove hyphens (like when pasting text from pdf) [#15](https://github.com/Benature/obsidian-text-format/issues/15)                                                                                                                                 |
| Replace **ligature**                               | Replace [ligature](https://en.wikipedia.org/wiki/Ligature_(writing)) to Non-ligature [#24](https://github.com/Benature/obsidian-text-format/issues/24)                                                                                             |


#### Academic / Study

| Command                                                | Description                                                                  |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Convert selection into **Anki** card format            | [#32](https://github.com/Benature/obsidian-text-format/pull/32)              |
| Remove citation index                                  | e.g., `A research [12] about notes` => `A research about notes`              |
| Get **Zotero** note from clipboard and paste ⚙️         | See [below ⬇️](#zotero-format)                                                |
| Detect and convert characters to **math mode** (LaTeX) | e.g. convert `P` into `$P$` (latex), apply for all single letter except `a`. |
| Convert **Mathpix** array to markdown table            | Convert latex array generated by Mathpix to markdown table format            |



#### Advanced custom

| Command                  | Description                                                                                                                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Custom **Replace** ⚙️     | Custom replace `<search>` to `<replace>`. See below for more examples [⬇️](#replacements)                                                                                                                                                               |
| Custom **Wrapper** ⚙️     | Add any arbitrary wrapping element in Setting. (https://github.com/Benature/obsidian-underline/issues/5) See below for more examples [⬇️](#wrapper)                                                                                                     |
| Custom **API** Request ⚙️ | Replace Selection with the return of custom API request. The selection will be sent to custom API URL with `POST` method. (No user data is collected!) *There is an [example](#convert-citation-index-to-the-file-name-of-paper-note) of my use case.* |



#### Others
| Command                                              | Description                                                                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Decode **URL**                                       | Decode URL for better reading and shorter url.                                                                  |
| Add extra double spaces per paragraph for whole file | Add double spaces at the end of every paragraph [#8](https://github.com/Benature/obsidian-text-format/issues/8) |
| Add extra line break to paragraph                    | replace `\n` with `\n\n`                                                                                        |
| Format space between word and symbol                 | add space between words and `(`                                                                                 |


## Support

If you find this plugin useful and would like to support its development, you can sponsor me via [Buy Me a Coffee ☕️](https://www.buymeacoffee.com/benature), WeChat, Alipay or [AiFaDian](https://afdian.net/a/Benature-K). Any amount is welcome, thank you!

<p align="center">
<img src="https://s2.loli.net/2024/04/01/VtX3vYLobdF6MBc.png" width="500px">
</p>


## Some Examples

### Zotero format
The format template can refer to https://www.zotero.org/support/note_templates
- default
  - zotero: `<p>{{highlight quotes='true'}} {{citation}} {{comment}}</p>`
  - plugin config: `“(?<text>.*)” \((?<item>.*?)\) \(\[pdf\]\((?<pdf_url>.*?)\)\)`
  - result: `{text} [🔖]({pdf_url})`


### Replacements
[use cases](https://github.com/Benature/obsidian-text-format/milestone/1?closed=1):
- Split paragraph into sentences: [#78](https://github.com/Benature/obsidian-text-format/issues/78#issuecomment-1999198698)

### Wrapper
[use cases](https://github.com/Benature/obsidian-text-format/milestone/2?closed=1):
- Underline: prefix=`<u>`, suffix=`</u>`, then selected text will turn into `<u>text</u>`
- Font color: [#30](https://github.com/Benature/obsidian-text-format/issues/30#issuecomment-1229835540)

### Convert citation index to the file name of paper note
With [bib-cacher](https://github.com/Benature/bib-catcher), I can connect to Zotero database by python, building a simple Flask server.

Example of command `Custom API Request`:

```diff
- A survey concludes that obsidian is a good app [12]. Furthermore, The note taking...
+ A survey concludes that obsidian is a good app ([[File Name of the Reference]]). Furthermore, The note taking...
```

### Basic

![demo](https://user-images.githubusercontent.com/35028647/121776728-149ea500-cbc1-11eb-89ee-f4afcb0816ed.gif)

- lowercase
  ```diff
  - Hello, I am using Obsidian.
  + hello, i am using obsidian.
  ```
- uppercase
  ```diff
  - Hello, I am using Obsidian.
  + HELLO, I AM USING OBSIDIAN.
  ```
- capitalize word
  ```diff
  - Hello, I am using Obsidian.
  + Hello, I Am Using Obsidian.
  ```
- capitalize sentence
  ```diff
  - hello, I am using Obsidian.
  + Hello, I am using Obsidian.
    ^
  ```
- title case
  ```diff
  - Obsidian is a good app.
  + Obsidian Is a Good App.
                ^
  ```
- slugify
  ```diff
  - Obsidian - a good app.
  + obsidian-a-good-app
  ```
- snakify
  ```diff
  - Obsidian is a good app
  + obsidian_is_a_good_app
  ```
- redundant spaces
  ```diff
  - There  are so   many redundant      blanks
  + There are so many redundant blanks
  ```
- merge broken paragraph
  ```diff
  - This paragraph is broken 
  - into several lines. I want 
  - those lines merged!
  - 
  - And this is second paragraph. There is a blank line between 
  - two paragraph, indicating that they should not be merged into 
  - one paragraph!

  + This paragraph is broken into several lines. I want those lines merged!
  +
  + And this is second paragraph. There is a blank line between two paragraph, indicating that they should not be merged into one paragraph!
  ```
- bullet list
  ```diff
  - • first, blahblah • second, blahblah • third, blahblah
  
  + - first, blahblah 
  + - second, blahblah 
  + - third, blahblah
  ```
- ordered list
  ```diff
  - a) first, blahblah b) second, blahblah c) third, blahblah
  - i) first, blahblah ii) second, blahblah iii) third, blahblah
  
  + 1. first, blahblah 
  + 2. second, blahblah 
  + 3. third, blahblah
  ```

