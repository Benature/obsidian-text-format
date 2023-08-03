# Text Format

[![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?color=7e6ad6&labelColor=34208c&label=Obsidian%20Downloads&query=$['obsidian-text-format'].downloads&url=https://raw.githubusercontent.com/obsidianmd/obsidian-releases/master/community-plugin-stats.json&)](obsidian://show-plugin?id=obsidian-text-format) ![GitHub stars](https://img.shields.io/github/stars/Benature/obsidian-text-format?style=flat)

Sometimes I encounter some issues like  
1. I copy some text from pdf or some other source, but the copied content is out of format. For example, there are more than one space between words or one paragraph brokes into several lines.  
2. I want to lowercase the letters when they are all uppercase, etc.

Therefore, I wrote this plugin to format selected text lowercase/uppercase/capitalize/titlecase or remove redundant spaces/newline characters, and other features listed below.

Install this plugin right now: <u><obsidian://show-plugin?id=obsidian-text-format></u>
## Features

Press <kbd>cmd/ctrl+P</kbd> to enter the command. 👇

Or you can consider to bind custom hotkeys to those commands according to [#29](https://github.com/Benature/obsidian-text-format/issues/29#issuecomment-1279246640).

---

⚙️: There is setting of this command.

### Basic

| Command                                                            | Description                                                                                                                                                                        |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lowercase** selected text                                        | Lowercase all letters in selection                                                                                                                                                 |
| **Uppercase** selected text                                        | Uppercase all letters in selection                                                                                                                                                 |
| **Capitalize** all **words** in selected text ⚙️                   | Capitalize all words in selection                                                                                                                                                  |
| **Capitalize** only first word of **sentence** in selected text ⚙️ | Capitalize only first word of sentence(s) in selection                                                                                                                             |
| **Title case** selected text ⚙️                                    | Capitalize words but leave certain words in lower case in selection *(Note: not support Cyrillic strings for now)* [#1](https://github.com/Benature/obsidian-text-format/issues/1) |
| **Tooglecase**selected text ⚙️                                     | A custom loop to format the selection                                                                                                                                              |
|  **Slugify**selected text ⚙️                                     | convert any input text into a URL-friendly slug                                                                                                                                              |


### List
| Command                                  | Description                                                                                                                                           |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Format **bullet** list ⚙️                 | Change `•` into bullet list, i.e. `- `; split every bullet point into single line; and remove blank lines.                                            |
| Format **ordered** list                  | Change `*)`(star could be any letter) into ordered list (e.g. `1. `, `2. `); split every ordered point into single line; and remove blank lines. (#4) |
| Convert table to bullet list             | The first volume is 1st list, other volumes are sub-list                                                                                              |
| Convert table to bullet list with header | Sub-list begins with `${header}: `                                                                                                                    |
| **Sort to-do** list                      | [#37](https://github.com/Benature/obsidian-text-format/issues/37)                                                                                     |
### Links

| Command                                     | Description                                        |
| ------------------------------------------- | -------------------------------------------------- |
| Remove WikiLinks format in selection        | Convert `[[WikiLinks]]` to `WikiLinks` (#28)       |
| Remove URL links format in selection        | Convert `[Google](www.google.com)` to `Google`     |
| Convert URL links to WikiLinks in selection | Convert `[Google](www.google.com)` to `[[Google]]` |

### PDF copy / OCR

| Command                                      | Description                                                                                                                                                                                                                                        |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Remove redundant **spaces** in selection     | Ensure only one space between words                                                                                                                                                                                                                |
| Remove **blank line(s)**                     | replace `\n\n` with `\n`                                                                                                                                                                                                                           |
| Merge **broken paragraph(s)** in selection ⚙️ | Change selected lines into single-line, except lines are separated by blank line(s). *At the same time, blank lines will be merged into one blank line(optional, default enable), and redundant spaces will be removed(optional, default enable).* |
| Remove **hyphens**                           | Remove hyphens (like when pasting text from pdf) [#15](https://github.com/Benature/obsidian-text-format/issues/15)                                                                                                                                 |
| **Split** line(s) by **blanks**              | Replace ` ` with `\n` for OCR use case.                                                                                                                                                                                                            |
| Convert to **Chinese character** (,;:!?) ⚙️   | For OCR use case. (For who require more custom setting, I would recommend <https://p.gantrol.com/>)                                                                                                                                                |
| Replace **ligature**                         | Replace [ligature](https://en.wikipedia.org/wiki/Ligature_(writing)) to Non-ligature [#24](https://github.com/Benature/obsidian-text-format/issues/24)                                                                                             |


### Academic/Study

| Command                                     | Description                                                     |
| ------------------------------------------- | --------------------------------------------------------------- |
| Convert selection into **Anki** card format | [#32](https://github.com/Benature/obsidian-text-format/pull/32) |
| Remove citation index                       | e.g., `A research [12] about notes` => `A research about notes` |
| **Zotero** note format and paste ⚙️          | See [below ⬇️](#zotero-format)                                   |

#### Zotero format
The format template can refer to https://www.zotero.org/support/note_templates
- default
  - zotero: `<p>{{highlight quotes='true'}} {{citation}} {{comment}}</p>`
  - plugin config: `“(?<text>.*)” \((?<item>.*?)\) \(\[pdf\]\((?<pdf_url>.*?)\)\)`
  - result: `{text} [🔖]({pdf_url})`

#### Convert citation index to the file name of paper note
With [bib-cacher](https://github.com/Benature/bib-catcher), I can connect to Zotero database by python, building a simple Flask server.

Example of command `Custom API Request`:

```diff
- A survey concludes that obsidian is a good app [12]. Furthermore, The note taking...
+ A survey concludes that obsidian is a good app ([[File Name of the Reference]]). Furthermore, The note taking...
```

### Others
| Command                                              | Description                                                                                                                                                                                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Custom **Wrapper** ⚙️                                 | Add any arbitrary wrapping element in Setting. (https://github.com/Benature/obsidian-underline/issues/5) See below for more examples [⬇️](#wrapper)                                                                                                     |
| Decode **URL**                                       | Decode URL for better reading and shorter url.                                                                                                                                                                                                         |
| Convert single letter into **math** mode             | e.g. convert `P` into `$P$` (latex), apply for all single letter except `a`.                                                                                                                                                                           |
| Convert **Mathpix** array to markdown table          | Convert latex array generated by Mathpix to markdown table format                                                                                                                                                                                      |
| Add extra double spaces per paragraph for whole file | Add double spaces at the end of every paragraph [#8](https://github.com/Benature/obsidian-text-format/issues/8)                                                                                                                                        |
| Custom **API** Request ⚙️                             | Replace Selection with the return of custom API request. The selection will be sent to custom API URL with `POST` method. (No user data is collected!) *There is an [example](#convert-citation-index-to-the-file-name-of-paper-note) of my use case.* |


#### Wrapper
e.g.
- Underline: prefix=`<u>`, suffix=`</u>`, then selected text will turn into `<u>text</u>`
- Font color: [#30](https://github.com/Benature/obsidian-text-format/issues/30#issuecomment-1229835540)


## Support

If you find this plugin useful and would like to support its development, you can sponsor me via [Buy Me a Coffee ☕️](https://www.buymeacoffee.com/benature), WeChat or Alipay, thank you!

<p align="center">
<img src="https://github.com/p4lang/behavioral-model/assets/35028647/d8471ebe-a9fb-471e-a312-0d93b8ca9a12" width="500px">
</p>


## Some Example


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
![demo](https://user-images.githubusercontent.com/35028647/121776728-149ea500-cbc1-11eb-89ee-f4afcb0816ed.gif)
