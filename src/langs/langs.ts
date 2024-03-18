const EN = {
    command: {
        "uppercase": "Uppercase",
        "lowercase": "Lowercase",
        "capitalize-word": "Capitalize all words",
        "capitalize-sentence": "Capitalize only first word of sentence",
        "titlecase": "Titlecase",
        "togglecase": "Togglecase",
        "slugify": "Slugify",
        "snakify": "Snakify",
        "remove-trailing-spaces": "Remove trailing spaces",
        "remove-blank-line": "Remove blank line(s)",
        "add-line-break": "Add extra line break between paragraphs",
        "split-lines-by-blank": "Split line(s) by blanks",
    },
    setting: {

    }
}

const ZH = {
    command: {
        "uppercase": "全部大写",
        "lowercase": "全部小写",
        "capitalize-word": "首字母大写（所有单词）",
        "capitalize-sentence": "首字母大写（句首单词）",
        "titlecase": "标题格式大小写",
        "togglecase": "切换大小写格式",
        "slugify": "使用 Slugify 格式化（`-`连字符）",
        "snakify": "使用 Snakify 格式化（`_`连字符）",
        "remove-trailing-spaces": "移除所有行末空格",
        "remove-blank-line": "移除空行",
        "add-line-break": "在段落间添加额外换行",
        "split-lines-by-blank": "按空格分行",
    },
    setting: {

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