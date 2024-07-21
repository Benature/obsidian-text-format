const EN = {
    command: {
        "uppercase": "Uppercase",
        "lowercase": "Lowercase",
        "capitalize-word": "Capitalize all words",
        "capitalize-sentence": "Capitalize only first word of sentence",
        "title-case": "Title-case",
        "cycle-case": "Cycle-case",
        "slugify": "Slugify",
        "snakify": "Snakify",
        "decodeURI": "Decode URL",
        "remove-trailing-spaces": "Remove trailing spaces",
        "remove-blank-line": "Remove blank line(s)",
        "add-line-break": "Add extra line break between paragraphs",
        "split-lines-by-blank": "Split line(s) by blanks",
        "heading-upper": "Upper heading level (more #)",
        "heading-lower": "Lower heading level (less #)",
        "open-settings": "Open preference settings tab",
    },
    setting: {
        "more-details": "More details in Github: ",
        "others": "Others",
        "remove-spaces-when-converting": "Remove spaces when converting Chinese punctuation marks",
        "remove-spaces-when-converting-desc": "for OCR case",
        "debug-logging": "Debug logging",
        "debug-logging-desc": "verbose logging in the console",
        "word-cases": "Word cases",
        "word-cases-desc": "lowercase / uppercase / title case / capitalize case / cycle case",
        "lowercase-before-capitalize": "Lowercase before capitalize/title case",
        "lowercase-before-capitalize-desc": "When running the capitalize or title case command, the plugin will lowercase the selection at first.",
        "cycle-case-sequence": "Cycle case sequence (one case per line)",
        "cycle-case-sequence-desc": 
            "Support cases: `lowerCase`, `upperCase`, `capitalizeWord`, `capitalizeSentence`, `titleCase`. \n" +
            "Note that the result of `capitalizeWord` and `titleCase` could be the same in some cases, " +
            "the two cases are not recommended to be used in the same time.",
        "proper-noun": "Proper noun",
        "proper-noun-desc": "The words will be ignore to format in title case. Separated by comma, e.g. `USA, UFO`.",
        paragraph: {
            header: "Merge broken paragraphs behavior",
            "remove-redundant-blank-lines": "Remove redundant blank lines",
            "remove-redundant-blank-lines-desc": 'change blank lines into single blank lines, e.g. "\\n\\n\\n" will be changed to "\\n\\n"',
        },
        "remove-redundant-blank-spaces": "Remove redundant blank spaces",
        "remove-redundant-blank-spaces-desc": "ensure only one space between words",
        "link-format": "Link format",
        "link-format-desc": "Markdown links (`[]()`), Wiki links (`[[ ]]`)",
        "Wikilink2mdPathMode-relative-obsidian": "Relative to Obsidian Vault",
        "Wikilink2mdPathModerelative-file": "Relative to current file",
        "Wikilink2mdPathMode-absolute": "Absolute",
        "path-mode": "Path mode when covering wikilinks to plain markdown links.",
        "result-format": "The format of result when calling `Remove URL links format in selection`",
        "result-format-desc": "Matching with `[{text}]({url})`, use `{text}` if you want to maintain the text, or use `{url}` if you want to maintain the url.",
        "remove-wikilink-url": "Remove WikiLink as well when calling `Remove URL links format in selection`",
        "wiki-link-format-heading": "WikiLink with heading",
        "wiki-link-format-heading-desc": "e.g. [[title#heading]]",
        "wiki-link-format-alias": "WikiLink with alias",
        "wiki-link-format-alias-desc": "e.g. [[title|alias]]",
        "wiki-link-format-both": "WikiLink with both heading and alias",
        "wiki-link-format-both-desc": "e.g. [[title#heading|alias]]",
        "list-format": "List format",
        "list-format-desc": "Detect and convert bullet list / ordered list",
        "bullet-point-characters": "Possible bullet point characters",
        "bullet-point-characters-desc": "The characters that will be regarded as bullet points.",
        "ordered-list-custom-separator": "Format ordered list custom separator RegExp",
        "ordered-list-custom-separator-desc": "Separated by `|`. e.g.: `\sand\s|\s?AND\s?`. Default as empty.",
        wrapper: {
            "header": "Wrapper",
            "desc": "Wrap the selection with prefix and suffix",
            "rule-desc1": "<Wrapper Name> <Prefix Template> <Suffix Template>",
            "rule-desc2": "Template for metadata (file properties) is supported with Handlebars syntax. For example, `{{link}}` will be replaced with the value of current file's property `link`.",
            "add-new-wrapper": "Add new wrapper",
            "new-wrapper-rule-tooltip": "Add new rule",
            "name-placeholder": "Wrapper Name (command name)",
            "prefix-placeholder": "Prefix",
            "suffix-placeholder": "Suffix",
        },
        "delete-tooltip": "Delete",
        "api-request": "API Request",
        "api-request-desc": "Send a request to an API and replace the selection with the return",
        "api-request-url": "API Request URL",
        "api-request-url-desc": 
            "The URL that plugin will send a POST and replace with return.\n" +
            "The return json should have two attribution: `text` and `notification`.\n" +
            "If `text` exist then `text` will replace the selection, or do nothing.\n" +
            "If `notification` exist then Send a notice if this string, or do nothing.",
        "new-request-tooltip": "Add new request",
        "request-name-placeholder": "Request Name (command name)",
        "request-url-placeholder": "Request URL",
        "custom-replacement": "Custom replacement",
        "custom-replacement-desc": "Replace specific pattern with custom string",
        "add-custom-replacement": "Add custom replacement",
        "add-custom-replacement-desc": "The plugin will replace the `search` string with the `replace` string in the selection. RegExp is supported.",
        "add-new-replacement-tooltip": "Add new replacement",
        "replacement-command-name-placeholder":"Command name",
        "replacement-search-placeholder": "Search",
        "replacement-replace-placeholder": "Replace (empty is fine)",
        "zotero-pdf-note-format": "Zotero pdf note format",
        "zotero-input-regexp": "Zotero pdf note (input) RegExp",
        "zotero-output-format": "Zotero note pasted in Obsidian (output) format",
        "zotero-output-format-desc": 
            "Variables: \n" +
            "{text}: <text>,\n" +
            "{pdf_url}: <pdf_url>,\n" +
            "{item}: <item>.",
        "markdown-quicker": "Markdown quicker",
        "markdown-quicker-desc": "Quickly format the selection with common markdown syntax",
        "heading-lower-to-plain": "Heading lower to plain text",
        "heading-lower-to-plain-desc": "If disabled, heading level 1 cannot be lowered to plain text.",
        "method-decide-callout-type": "Method to decide callout type",
        "method-decide-callout-type-desc": "How to decide the type of new callout block for command `Callout format`? `Fix callout type` use the default callout type always, other methods only use the default type when it fails to find previous callout block.",
        "default-callout-type": "Default callout type",
        "default-callout-type-desc": "Set the default callout type for command `Callout format`. ",
        "format-on-paste": {
            "name": "Format on paste",
            "desc": "Format the pasted content automatically. One command per line.",
        }
    }
}

const ZH = {
    command: {
        "uppercase": "全部大写",
        "lowercase": "全部小写",
        "capitalize-word": "首字母大写（所有单词）",
        "capitalize-sentence": "首字母大写（句首单词）",
        "title-case": "标题格式大小写",
        "cycle-case": "循环切换大小写格式",
        "slugify": "使用 Slugify 格式化（`-`连字符）",
        "snakify": "使用 Snakify 格式化（`_`连字符）",
        "remove-trailing-spaces": "移除所有行末空格",
        "remove-blank-line": "移除空行",
        "add-line-break": "在段落间添加额外换行",
        "split-lines-by-blank": "按空格分行",
        "heading-upper": "降级标题（加 #）",
        "heading-lower": "升级标题（减 #）",
        "open-settings": "打开插件设置选项卡",
        "decodeURI": "解码 URL",
    },
    setting: {
        "more-details": "在 Github 查看更多详情：",
        "others": "其他设置",
        "remove-spaces-when-converting": "转换中文标点时去除空格",
        "remove-spaces-when-converting-desc": "适用于 OCR 场景",
        "debug-logging": "Debug 日志",
        "debug-logging-desc": "在控制台中显示 Debug 详细日志",
        "word-cases": "文字大小写转换",
        "word-cases-desc": "转换为小写 / 转换为大写 / 标题式大小写 / 单词首字母大写 / 大小写循环切换",
        "lowercase-before-capitalize": "在首字母大写之前转换为小写",
        "lowercase-before-capitalize-desc": "执行首字母大写或标题式大小写命令前，先将选中文本转换为小写。",
        "cycle-case-sequence": "大小写循环变换（单行）",
        "cycle-case-sequence-desc": 
            "支持以下大小写格式：`lowerCase`、`upperCase`、`capitalizeWord`、`capitalizeSentence`、`titleCase`。\n" +
            "注意，在某些情况下，`capitalizeWord`与`titleCase`的效果可能相同，" +
            "不推荐同时使用。",
        "proper-noun": "专有名词例外",
        "proper-noun-desc": "在执行标题式大小写时，会忽略以下指定的专有名词。例如：`USA, UFO`。",
        paragraph: {
            header: "合并段落",
            "remove-redundant-blank-lines": "删除多余的空白行",
            "remove-redundant-blank-lines-desc": "将多余的空白行转换为单一空白行，例如：`\\n\\n\\n`会被转换为单一的`\\n\\n`。",
        },
        "remove-redundant-blank-spaces": "删除多余的空格",
        "remove-redundant-blank-spaces-desc": "确保单词之间只有一个空格。",
        "link-format": "链接格式化",
        "link-format-desc": "Markdown 链接 (`[]()`)，Wiki 链接 (`[[ ]]`)",
        "Wikilink2mdPathMode-relative-obsidian": "相对于Obsidian库",
        "Wikilink2mdPathMode-relative-file": "相对于当前文件",
        "Wikilink2mdPathMode-absolute": "绝对路径",
        "path-mode": "转换 Wikilink 为 Markdown 链接时的路径模式",
        "result-format": "移除选中链接格式的结果",
        "result-format-desc": "与 `[{text}]({url})` 匹配，使用 `{text}` 维持文本或 `{url}` 维持链接。",
        "remove-wikilink-url": "移除 WikiLink 时也移除 URL",
        "wiki-link-format-heading": "带标题的 WikiLink 格式化",
        "wiki-link-format-heading-desc": "如：[[title#heading]]",
        "wiki-link-format-alias": "带别名的 WikiLink 格式化",
        "wiki-link-format-alias-desc": "如：[[title|alias]]",
        "wiki-link-format-both": "同时带标题和别名的 WikiLink 格式化",
        "wiki-link-format-both-desc": "如：[[title#heading|alias]]",
        "list-format": "列表格式化",
        "list-format-desc": "检测并转换无序列表和有序列表。",
        "bullet-point-characters": "项目符号字符",
        "bullet-point-characters-desc": "被视为项目符号的字符。",
        "ordered-list-custom-separator": "有序列表自定义分隔符正则表达式",
        "ordered-list-custom-separator-desc": "使用`|`分隔，例如：`\sand\s|\s?AND\s?`。默认为空。",
        wrapper: {
            "header": "包装器",
            "desc": "在选中的文本前后添加前缀和后缀。",
            "rule-desc1": "包装器名称、前缀模板、后缀模板",
            "rule-desc2": "支持使用 Handlebars 语法的文件元数据属性模板。例如，`{{link}}` 将替换为当前文件的 `link` 属性值。",
            "add-new-wrapper": "添加新的包装器",
            "new-wrapper-rule-tooltip": "添加新规则",
            "name-placeholder": "包装器名称（命令名）",
            "prefix-placeholder": "前缀",
            "suffix-placeholder": "后缀",
        },
        "delete-tooltip": "删除",
        "api-request": "API 请求",
        "api-request-desc": "向 API 发送请求，并用返回值替换选择文本",
        "api-request-url": "API 请求 URL",
        "api-request-url-desc": 
            "插件将发送POST请求并用返回值替换选择文本。\n" +
            "返回的JSON应包含两个属性：`text` 和 `notification`。\n" +
            "如果存在 `text`，则用 `text` 替换选择文本，否则不做任何操作。\n" +
            "如果存在 `notification`，则发送此字符串作为通知，否则不做任何操作。",
        "new-request-tooltip": "添加新请求",
        "request-name-placeholder": "请求名称（命令名称）",
        "request-url-placeholder": "请求 URL",
        "custom-replacement": "自定义替换",
        "custom-replacement-desc": "使用自定义字符串替换特定模式",
        "add-custom-replacement": "添加自定义替换",
        "add-custom-replacement-desc": "插件将使用 `replace` 字符串替换 `search` 字符串。支持正则表达式。",
        "add-new-replacement-tooltip": "添加新替换",
        "replacement-command-name-placeholder": "命令名称",
        "replacement-search-placeholder": "搜索",
        "replacement-replace-placeholder": "替换（可为空）",
        "zotero-pdf-note-format": "Zotero PDF 注释格式",
        "zotero-input-regexp": "Zotero PDF 注释（输入）正则表达式",
        "zotero-output-format": "Zotero 注释粘贴到 Obsidian 中的（输出）格式",
        "zotero-output-format-desc": 
            "变量: \n" +
            "{text}: <文本>,\n" +
            "{pdf_url}: <PDF链接>,\n" +
            "{item}: <条目>。",
        "markdown-quicker": "Markdown 快速格式化",
        "markdown-quicker-desc": "使用常见 Markdown 语法快速格式化选中文本",
        "heading-lower-to-plain": "标题降级为普通文本",
        "heading-lower-to-plain-desc": "如果禁用，一级标题不能降为普通文本。",
        "method-decide-callout-type": "决定标注类型的方法",
        "method-decide-callout-type-desc": "选择用于命令 `Callout format` 的新标注块的类型的方法。如果选择固定标注类型，则总是使用默认的标注类型。在无法找到前一个标注块时，其它方法也将使用默认类型。",
        "default-callout-type": "默认callout类型",
        "default-callout-type-desc": "设置命令 `Callout format` 的默认标注类型。",
        "format-on-paste": {
            "name": "粘贴自动格式化",
            "desc": "自动格式化粘贴内容。每行一条命令。",
        }
    }
}

interface Languages {
    [lang: string]: any
}

const languages: Languages = {
    en: EN,
    zh: ZH
};

function setLanguage(lang: string): string {
    let currentLanguage = 'en';
    if (lang === "zh-TW") {
        return "zh";
    }
    if (lang in languages) {
        currentLanguage = lang;
    }
    return currentLanguage
}

// 获取多级内容的字符串
export function getString(keys: string[], useDefault: boolean = false): string {
    let currentLanguage = "en";
    if (!useDefault) {
        currentLanguage = setLanguage(window.localStorage.getItem("language"));
    }
    let obj = languages[currentLanguage];
    let fail = false;
    for (let key of keys) {
        if (!(key in obj)) {
            fail = true;
            break
        }
        obj = obj[key];
    }
    if (fail) {
        return getString(keys, true);
    } else {
        return obj;
    }
}