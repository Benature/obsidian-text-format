# Basic 
## Lowercase

```diff
- I love using Obsidian.
+ i love using obsidian.
```

## Uppercase

```diff
- I love using Obsidian.
+ I LOVE USING OBSIDIAN.
```

## capitalize word
```diff
- Hello, I am using Obsidian.
+ Hello, I Am Using Obsidian.
```

## capitalize sentence
```diff
- hello, I am using Obsidian.
+ Hello, I am using Obsidian.
  ^
```
## title case
```diff
- Obsidian is a good app.
+ Obsidian Is a Good App.
           ^    ^    ^
```

## Slugify

```diff
- I love using Obsidian.
+ i-love-using-obsidian
```

## Snakify

```diff
- I love using Obsidian.
+ i_love_using_obsidian.
```

# List

## Convert table to bullet list with header

Select: 

| key | value |
| --- | ----- |
| a   | b     |
| c   | d     |

Result:

- a
    - value: b
- c
    - value: d

## Convert table to bullet list without header

Select: 

| key | value |
| --- | ----- |
| a   | b     |
| c   | d     |

Result: 

- a
    - b
- c
    - d

## Sort to-do list

Select: 

- [ ] Task a
- [x] Task b
- [ ] Task c

Result:

- [ ] Task a
- [ ] Task c
- [x] Task b

# Links
## Remove WikiLinks format

```diff
- It is a [[WikiLink]]. It is a [[WikiLink|link]] with alias. Link to a [[WikiLink#Heading]]. Link to a [[WikiLink#Heading|head alias]] with alias.
+ It is a WikiLink. It is a link (WikiLink) with alias. Link to a WikiLink (>>> Heading). Link to a head alias (WikiLink > Heading) with alias.
```

When the settings are
- WikiLink with heading: `{title} (>>> {heading})`
- WikiLink with alias: `{alias} ({title})`
- WikiLink with both heading and alias: `{alias} ({title} > {heading})`

## Remove URL links format

```diff
- A link like [Google](www.google.com).
+ A link like Google.
```

## Convert URL links to WikiLinks

```diff
- A link like [Google](www.google.com).
+ A link like [[Google]].
```

## Convert WikiLinks to plain markdown links

```diff
- It is a [[WikiLink]]. It is a [[WikiLink|link]] with alias. Link to a [[WikiLink#Heading]]. Link to a [[WikiLink#Heading|head alias]] with alias.
+ It is a [WikiLink](WikiLink.md). It is a [link](WikiLink.md) with alias. Link to a [WikiLink#Heading](WikiLink.md#Heading). Link to a [head alias](WikiLink.md) with alias.
```

# Copy / OCR
## Remove redundant spaces

```diff
- The   text appears to have been copied from another source, and the OCR result may also be out of format.
      ^
+ The text appears to have been copied from another source, and the OCR result may also be out of format.
```

## Remove all spaces

```diff
- The text appears to have been copied from another source, and the OCR result may also be out of format.
+ Thtextappearstohavebeencopiedfromanothersource,andtheOCRresultmayalsobeoutofformat.
```

## Convert to Chinese punctuation marks

```diff
- 中文标点异常.比如是复制的文本,或者是 OCR 的结果.
+ 中文标点异常。比如是复制的文本，或者是 OCR 的结果。
```

# Academic / Study

## Math mode

```diff
- Suppose variable x1 add x2 equals to variable Y.
+ Suppose variable $x_1$ add $x_2$ equals to variable $Y$.


...

> Note: The document is still under development.