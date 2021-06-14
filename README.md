# Text Format

Sometimes I encounter some issues like  
1. I copy some text from pdf or some other source, but the copied content is out of format. For example, there are more than one space between words or one paragraph brokes into several lines.  
2. I want to lowercase the letters when they are all uppercase, etc.

Therefore, I wrote this plugin to format selected text lowercase/uppercase/capitalize/titlecase or remove redundant spaces/newline characters.

## Features

Press <kbd>cmd/ctrl+P</kbd> to enter the command. 👇

Or you can consider to bind custom hotkeys to those commands.

| Command                                    | Description                                                                                                                                                                                                                                        |
| :----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Lowercase** selected text                | Lowercase all letters in selection                                                                                                                                                                                                                 |
| **Uppercase** selected text                | Uppercase all letters in selection                                                                                                                                                                                                                 |
| **Capitalize** selected text               | Capitalize all words in selection                                                                                                                                                                                                                  |
| **Title case** selected text               | Capitalize words but leave certain words in lower case in selection                                                                                                                                                                                |
| Remove redundant **spaces** in selection   | Ensure only one space between words                                                                                                                                                                                                                |
| Merge **broken paragraph(s)** in selection | Change selected lines into single-line, except lines are separated by blank line(s). *At the same time, blank lines will be merged into one blank line(optional, default enable), and redundant spaces will be removed(optional, default enable).* |


## Example


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
- capitalize
  ```diff
  - Hello, I am using Obsidian.
  + Hello, I Am Using Obsidian.
  ```
- titlecase
  ```diff
  - Obsidian is a good app.
  + Obsidian Is a Good App.
  ```
- redundant spaces
  ```diff
  - There  are so   many redundant      blanks
  + There are so many redundant blanks"
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
  + And this is second paragraph. There is a blank line between two paragraph, indicating that they should not be merged into One paragraph!
  ```

![demo](https://user-images.githubusercontent.com/35028647/121776728-149ea500-cbc1-11eb-89ee-f4afcb0816ed.gif)
