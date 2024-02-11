# 文本格式

<div align="center">

![Obsidian Downloads](https://img.shields.io/badge/dynamic/json?logo=obsidian&color=%23483699&label=downloads&query=%24%5B%22obsidian-text-format%22%5D.downloads&url=https%3A%2F%2Fraw.githubusercontent.com%2Fobsidianmd%2Fobsidian-releases%2Fmaster%2Fcommunity-plugin-stats.json) ![GitHub stars](https://img.shields.io/github/stars/Benature/obsidian-text-format?style=flat) ![latest download](https://img.shields.io/github/downloads/Benature/obsidian-text-format/latest/total?style=plastic) 
[中文 | [English](https://github.com/Benature/obsidian-text-format)]


</div>


>当我做笔记时，有时会遇到一些问题，比如  
>1. 我从PDF或其他来源复制了一些文本，但复制的内容格式不正确。例如，单词之间有超过一个空格，或者一个段落分成了几行。  
>2. 需要小写字母，但它们都是大写的等等。
>3. 等等......

此插件用于将所选文本格式化为小写字母/大写字母/首字母大写/标题大小写或删除多余的空格/换行字符，以及下面列出的其他功能。

[点击立即安装此插件](https://obsidian.md/plugins?id=obsidian-text-format)

## 功能

按 <kbd>cmd/ctrl+P</kbd> 进入命令。👇

或者您可以考虑根据 [#29](https://github.com/Benature/obsidian-text-format/issues/29#issuecomment-1279246640) 绑定自定义热键。

---

- [文本格式](#文本格式)
  - [功能](#功能)
    - [基本](#基本)
    - [Markdown 语法](#markdown-语法)
      - [列表](#列表)
      - [链接](#链接)
    - [PDF 复制 / OCR](#pdf-复制--ocr)
    - [学术 / 学习](#学术--学习)
      - [Zotero 格式](#zotero-格式)
      - [将引用索引转换为论文笔记的文件名](#将引用索引转换为论文笔记的文件名)
    - [其他](#其他)
      - [包装](#包装)
  - [支持](#支持)
  - [一些示例](#一些示例)


⚙️: 此命令有设置。（<kbd>cmd/ctrl+,</kbd>打开首选项设置）

### 基本

| 命令                                     | 描述                                                                                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 将选中文本转换为**小写**                 | 将选择中的所有字母转为小写                                                                                                                                  |
| 将选中文本转换为**大写**                 | 将选择中的所有字母转为大写                                                                                                                                  |
| 将选中文本中的所有单词**首字母大写** ⚙️   | 将选择中的所有单词的首字母大写                                                                                                                              |
| 将选中文本中的**句子**的**首字母大写** ⚙️ | 仅将选择中的句子的第一个单词的首字母大写                                                                                                                    |
| 将选中文本转换为**标题格式大小写** ⚙️     | 将选择中的单词首字母大写，但保留选择中的某些单词的小写 *(注意：目前不支持 Cyrillic 字符串)* [#1](https://github.com/Benature/obsidian-text-format/issues/1) |
| 触发选中文本**大小写切换** ⚙️             | 一个自定义循环，用于格式化选择                                                                                                                              |
| **Slugify** 所选文本                     | 将任何输入文本转换为 URL-friendly Slug                                                                                                                      |
| **Snakify** 所选文本                     | 将选择中的所有字母转为小写 *并* 用下划线替换空格                                                                                                            |

### Markdown 语法

| 命令         | 描述                                                      |
| ------------ | --------------------------------------------------------- |
| 标题上升一级 | 例如：`# 标题` -> `## 标题`（默认快捷键：`Ctrl+Shift+]`） |
| 标题下降一级 | 例如：`## 标题` -> `# 标题`（默认快捷键：`Ctrl+Shift+[`） |


#### 列表
| 命令                             | 描述                                                                                                                 |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 识别并格式化**无序列表** ⚙️       | 将 `•` 更改为圆点列表，即 `- `；将每个圆点之间拆分为单独的行；并删除空行。                                           |
| 识别并格式化**有序列表**         | 将 `*)`（星号可以是任何字母）更改为有序列表（例如 `1. `， `2. `）；将每个有序点之间拆分为单独的行；并删除空行。 (#4) |
| 将表格转换为无序列表（不含标题） | 第一个卷是第1个列表，其他卷是子列表                                                                                  |
| 将表格转换为无序列表（含标题）   | 子列表以 `${header}: ` 开始                                                                                          |
| 将待办事项列表排序               | [#37](https://github.com/Benature/obsidian-text-format/issues/37)                                                    |

#### 链接

| 命令                                         | 描述                                              |
| -------------------------------------------- | ------------------------------------------------- |
| 移除选中文本中的 WikiLinks 格式              | 将 `[[WikiLinks]]` 转换为 `WikiLinks` (#28)       |
| 移除选中文本中的 URL 链接格式                | 将 `[Google](www.google.com)` 转换为 `Google`     |
| 将选中文本中的 URL 链接转换为 WikiLinks 格式 | 将 `[Google](www.google.com)` 转换为 `[[Google]]` |

### PDF 复制 / OCR

| 命令                             | 描述                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 将选中文本中的**多余空格**移除   | 确保单词之间只有一个空格                                                                                                                   |
| 将选中文本中的**所有空格**移除   | 删除所有空格                                                                                                                               |
| 将选中文本中的**空行移除**       | 将 `\n\n` 替换为 `\n`                                                                                                                      |
| 将选中文本中的**断行合并** ⚙️     | 将选定的行更改为单行，除非行之间用空行分隔。*同时，空行将合并为一个空行（可选，默认启用），并且多余的空格将被删除（可选，默认启用）。*     |
| 将选中文本**按空格分行**         | 将 ` ` 替换为 `\n` 以用于 OCR 使用情况。                                                                                                   |
| 转换为**中文标点符号**（,;:!?）⚙️ | 用于 OCR 情况。 （对于需要更多自定义设置的人，我建议使用 <https://p.gantrol.com/>）                                                        |
| 转换为**英文标点符号**           | 类似于 `转换为中文标点符号 (,;:!?)`                                                                                                        |
| 移除**连字符**                   | 移除连字符（例如，从 PDF 中粘贴文本时）[#15](https://github.com/Benature/obsidian-text-format/issues/15)                                   |
| 替换**连字**                     | 将 [连字](https://en.wikipedia.org/wiki/Ligature_(writing)) 替换为非连字 [#24](https://github.com/Benature/obsidian-text-format/issues/24) |

注：`\n`为换行符

### 学术 / 学习

| 命令                                         | 描述                                                              |
| -------------------------------------------- | ----------------------------------------------------------------- |
| 将选中内容转换为 **Anki** 卡片格式           | [#32](https://github.com/Benature/obsidian-text-format/pull/32)   |
| 移除引用索引编号                             | 例如，`一项关于笔记的研究 [12]` => `一项关于笔记的研究`           |
| 从剪贴板获取 **Zotero** 笔记并粘贴 ⚙️         | 请参阅下面 [⬇️](#zotero格式)                                       |
| 将单个字母转换为数学模式（LaTeX）            | 例如将 `P` 转换为 `$P$`（LaTeX），适用于除 `a` 之外的所有单个字母 |
| 将 Mathpix 的 LaTeX 数组转换为 Markdown 表格 | 将 Mathpix 生成的 LaTeX 数组转换为 markdown 表格格式              |

#### Zotero 格式
格式模板可参考 https://www.zotero.org/support/note_templates
- 默认
  - Zotero: `<p>{{highlight quotes='true'}} {{citation}} {{comment}}</p>`
  - 插件配置: `“(?<text>.*)” \((?<item>.*?)\) \(\[pdf\]\((?<pdf_url>.*?)\)\)`
  - 结果: `{text} [🔖]({pdf_url})`

#### 将引用索引转换为论文笔记的文件名
使用 [bib-cacher](https://github.com/Benature/bib-catcher)，我可以通过 Python 连接到 Zotero 数据库，构建一个简单的 Flask 服务器。

`自定义 API 请求` 的示例命令：

```diff
- 一项调查总结认为 Obsidian 是一个好应用 [12]。此外，笔记...
+ 一项调查总结认为 Obsidian 是一个好应用（[[Reference 文件名]]）。此外，笔记...
```

### 其他
| 命令                       | 描述                                                                                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 自定义**包装器** ⚙️         | 在设置中添加任何任意的包装元素。(https://github.com/Benature/obsidian-underline/issues/5) 有关更多示例，请参见下面 [⬇️](#包装)                                     |
| 自定义 **API** 请求 ⚙️      | 用自定义 API 请求的返回替换选择。将选择发送到带有 `POST` 方法的自定义 API URL。（不会收集用户数据！） *这是我的用例的 [示例](#将引用索引转换为论文笔记的文件名)。 |
| 解码 **URL**               | 解码 URL 以便阅读更清晰且 URL 更短                                                                                                                                |
| 全文为每段段末添加双空格   | 在每个段落的末尾添加双空格 [#8](https://github.com/Benature/obsidian-text-format/issues/8)                                                                        |
| 在段落末添加额外换行       | 将 `\n` 替换为 `\n\n`                                                                                                                                             |
| 格式化单词与符号之间的空格 | 保证字母与`(`之间的空格                                                                                                                                           |

#### 包装
例如
- 下划线: 前缀=`<u>`，后缀=`</u>`，然后选择的文本将变为 `<u>text</u>`
- 字体颜色: [#30](https://github.com/Benature/obsidian-text-format/issues/30#issuecomment-1229835540)


## 支持

如果您发现此插件有用并想要支持其开发，您可以通过 [Buy Me a Coffee ☕️](https://www.buymeacoffee.com/benature)、微信、支付宝或[爱发电](https://afdian.net/a/Benature-K)支持我，谢谢！

<p align="center">
<img src="https://s2.loli.net/2024/01/30/jQ9fTSyBxvXRoOM.png" width="500px">
</p>


## 一些示例


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
![demo](https://user-images.githubusercontent.com/35028647/121776728-149ea500-cbc1-11eb-89ee-f4afcb0816ed.gif)
