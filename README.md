# Text Format

Sometimes encounter some issues like
1. I copy some text from pdf or some other source, but the copied content is out of format like more than one blanks between words or one paragraph broke into several lines.
2. I want to lower the letters when they are all upper, etc.

Therefore, I wrote this plugin to format selected text with lower/upper/capitalize or remove redundant blanks/enters.

## Features

Press <kbd>cmd/ctrl+P</kbd> to enter the command. 👇

| Command                        | Description                                       |
| :----------------------------- | ------------------------------------------------- |
| Lower text                     | Lower all letters in selection                    |
| Upper text                     | Upper all letters in selection                    |
| Capitalize text                | Capitalize all words in selection                 |
| Remove redundant blanks        | Ensure only one blank between words               |
| Remove all enters in selection | Change multi-line selection into single-line text |
## Example


- `lower`: "Hello, I am using Obsidian." -> "hello, i am using obsidian."
- `upper`: "Hello, I am using Obsidian." -> "HELLO, I AM USING OBSIDIAN."
- `capitalize`: "Hello, I am using Obsidian." -> "Hello, I Am Using Obsidian."
- `remove blanks`: "There  are so   many redundant      blanks" -> "There are so many redundant blanks"

![demo](demo.gif)