# Tag Guide

Tags are flexible reuse labels. Categories answer "where does this question primarily belong?" Tags answer "where else can this question be discovered or reused?"

标签是灵活复用标签。分类回答“这道题主要属于哪里？”，标签回答“这道题还可以被哪些主题发现或复用？”

## Format

Use lowercase English slugs:

```text
moon
solar-system
ancient-china
image-guess
party
```

标签使用英文小写 slug。

Avoid spaces, underscores, uppercase letters, and Chinese tag IDs:

```text
Moon
solar system
ancient_china
月球
```

避免空格、下划线、大写字母和中文标签 ID。中文说明可以出现在题目内容里，标签 ID 尽量保持英文，方便搜索、统计和程序处理。

## Good Tag Choices

Prefer tags that are reusable:

- topic: `moon`, `internet`, `qin-dynasty`
- franchise or work: `minecraft`, `pokemon`, `three-kingdoms`
- gameplay: `image-guess`, `wordplay`, `riddle`
- vibe or usage detail when useful: `party`, `classic`, `surprising`

优先选择能复用的标签：

- 主题：`moon`、`internet`、`qin-dynasty`
- 作品或系列：`minecraft`、`pokemon`、`three-kingdoms`
- 玩法：`image-guess`、`wordplay`、`riddle`
- 必要时补充氛围或使用方式：`party`、`classic`、`surprising`

## Avoid Over-Tagging

Do not add every word in the prompt as a tag. Three to seven useful tags are usually enough.

不要把题干里的每个词都变成标签。通常 3 到 7 个有复用价值的标签就够了。

## Check Tags

Run:

```bash
npm run lint:tags
```

or:

```bash
npm run wtw -- lint-tags
```

The full health check also runs tag linting:

完整健康检查也会运行标签检查：

```bash
npm run wtw -- check
```
