# Maintenance Guide

This guide focuses on keeping Wan Ti Wang readable and maintainable at around 10,000 questions.

这份文档关注万题王在一万题规模左右时的可读性和维护性。

## One-Command Health Check

After editing questions, taxonomy, media metadata, packs, playlists, docs, or scripts, run:

修改题目、分类、媒体元数据、题包、推荐列表、文档或脚本后，运行：

```bash
npm run wtw -- check
```

This currently runs:

它目前会依次执行：

```bash
node scripts/validate.mjs
node scripts/lint-tags.mjs
node scripts/dedupe.mjs
node scripts/build-index.mjs
```

## Readability Rules

- Store questions under `questions/<primary>/<secondary>/<topic>.jsonl`.
- Keep one complete question per line.
- Keep files topic-focused; split files when they become hard to review.
- Keep player-facing text bilingual with `zh-CN` and `en-US`.
- Keep IDs stable after creation.
- Use option IDs in answers for choice questions.

中文规则：

- 题目放在 `questions/<一级分类>/<二级分类>/<具体主题>.jsonl`。
- 每一行是一道完整题目。
- 文件尽量聚焦一个主题；太长或太杂时拆分。
- 玩家可见文本必须有 `zh-CN` 和 `en-US`。
- ID 创建后尽量不要修改。
- 选择题答案使用选项 ID。

## Media Searchability

For media questions, keep enough context in the question while keeping paths centralized in media metadata.

媒体题建议让题目本身保留足够上下文，但路径仍集中放在媒体元数据里。

Recommended question reference:

```json
"media":[{"id":"img-science-astronomy-moon-surface-001","role":"question","kind":"image","hint":{"zh-CN":"月球表面照片","en-US":"moon surface photo"}}]
```

Recommended metadata:

```json
{"id":"img-science-astronomy-moon-surface-001","type":"image","path":"media/images/science/astronomy/moon-surface-001.webp","thumbnail":"media/thumbnails/img-science-astronomy-moon-surface-001.webp","title":"Moon Surface","alt":"月球表面照片","source":{"type":"local","url":"","license":"unknown"},"tags":["moon","space","astronomy"],"status":"published"}
```

This makes questions searchable by `media.id`, `kind`, and bilingual `hint`, while `media-meta/` remains the source of paths, thumbnails, source, and license.

这样题目可以通过 `media.id`、`kind` 和双语 `hint` 搜索；`media-meta/` 仍然负责路径、缩略图、来源和许可。

## Generated Indexes

`npm run build:index` generates:

- `indexes/by-id.json`
- `indexes/by-category.json`
- `indexes/by-tag.json`
- `indexes/by-mood.json`
- `indexes/by-occasion.json`
- `indexes/by-format.json`
- `indexes/by-media.json`
- `indexes/stats.json`

`by-media.json` maps each media ID to the questions that reference it.

`by-media.json` 用来反查某个媒体被哪些题目引用。

Do not edit generated indexes by hand.

不要手动编辑自动生成的索引。

## Tag Standards

See [Tag Guide](tag-guide.md) for the full convention.

完整标签规范见 [Tag Guide](tag-guide.md)。

Tags should be lowercase English slugs:

标签建议使用英文小写 slug：

```text
moon
solar-system
ancient-china
wordplay
image-guess
```

Avoid:

```text
Moon
solar system
月球
ancient_china
```

Run:

```bash
npm run lint:tags
```

or:

```bash
npm run wtw -- lint-tags
```

The tag linter checks invalid characters, duplicate tags inside one question, and case variants.

标签检查会发现非法字符、同一道题内重复标签，以及大小写不一致的标签。

## Duplicate Checks

Run:

```bash
npm run dedupe
```

or:

```bash
npm run wtw -- dedupe
```

The duplicate checker reports exact duplicate candidates and near-duplicate candidates in the same category.

重复题检测会报告精确重复候选，以及同分类下的相似题候选。

Exact duplicate candidates fail the command. Near-duplicate candidates are reported for human review.

精确重复会让命令失败；相似题只作为人工审核提示。

You can tune the near-duplicate threshold:

可以调节相似题阈值：

```bash
WTW_SIMILARITY_THRESHOLD=0.9 npm run dedupe
```
