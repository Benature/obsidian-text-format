# Text Format

Sometimes I encounter some issues like  
1. I copy some text from pdf or some other source, but the copied content is out of format. For example, there are more than one space between words or one paragraph brokes into several lines.  
2. I want to lowercase the letters when they are all uppercase, etc.

Therefore, I wrote this plugin to format selected text lowercase/uppercase/capitalize or remove redundant spaces/newline characters.

## Features

Press <kbd>cmd/ctrl+P</kbd> to enter the command. 👇

Or you can consider to bind custom hotkeys to those commands.

| Command                                    | Description                                       |
| :----------------------------------------- | ------------------------------------------------- |
| Lowercase selected text                    | Lowercase all letters in selection                |
| Uppercase selected text                    | Uppercase all letters in selection                |
| Capitalize selected text                   | Capitalize all words in selection                 |
| Remove redundant spaces in selection       | Ensure only one space between words               |
| Remove all newline characters in selection | Change multi-line selection into single-line text |
## Example


- `lowercase`: "Hello, I am using Obsidian." -> "hello, i am using obsidian."
- `uppercase`: "Hello, I am using Obsidian." -> "HELLO, I AM USING OBSIDIAN."
- `capitalize`: "Hello, I am using Obsidian." -> "Hello, I Am Using Obsidian."
- `remove blanks`: "There  are so   many redundant      blanks" -> "There are so many redundant blanks"

![demo](demo.gif)