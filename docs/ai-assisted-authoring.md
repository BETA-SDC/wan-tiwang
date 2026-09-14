# AI-Assisted Authoring

AI can reduce the repetitive parts of maintaining Wan Ti Wang, but it should not replace review. Use AI for drafting, translation, normalization, and batch cleanup; use human judgment for taste, factual accuracy, copyright, and final publishing.

AI 可以显著降低维护万题王的重复劳动，但不应该完全代替审核。适合交给 AI 的部分包括草稿生成、双语改写、格式整理、批量清理；事实准确性、趣味风格、版权判断和最终发布仍然需要人工把关。

## What AI Should Help With

- turn rough ideas into bilingual question drafts
- translate and localize `zh-CN` and `en-US` player-facing text
- suggest categories, tags, moods, occasions, and topic file names
- rewrite formal facts into lighter trivia prompts
- detect missing fields or inconsistent metadata before validation
- prepare media metadata when local media paths are known

AI 适合辅助：

- 把零散想法整理成中英文题目草稿
- 翻译和本地化玩家可见文本
- 建议分类、标签、氛围、使用场景和题目文件名
- 把严肃知识改写成轻松的趣味答题
- 在正式校验前发现缺字段或格式不一致
- 已知本地媒体路径时，辅助生成媒体元数据

## Recommended Workflow

1. Describe the topic, audience, and desired mood.
2. Ask AI to produce JSON draft objects, not final JSONL edits.
3. Review the facts, wording, category, answer, and bilingual quality.
4. Import accepted drafts with `npm run new:question -- --from-json <file>`.
5. Run `npm run wtw -- check`.
6. Commit source data and generated indexes together.

中文流程：

1. 先说明主题、受众和希望的题目氛围。
2. 让 AI 输出普通 JSON 草稿，不直接批量改 JSONL。
3. 人工检查事实、措辞、分类、答案和双语质量。
4. 用 `npm run new:question -- --from-json <file>` 导入确认后的草稿。
5. 运行 `npm run wtw -- check`。
6. 将题目源数据和生成的索引一起提交。

## Prompt Template

Use this when asking AI to draft one or more questions:

可以用下面的提示词让 AI 生成题目草稿：

```text
Create bilingual Wan Ti Wang trivia question drafts.

Requirements:
- Positioning: fun trivia, not formal testing.
- Languages: every player-facing text must include zh-CN and en-US.
- Output: normal JSON objects, one object per question. Do not output JSONL unless asked.
- Do not invent an id; leave id omitted so the import script can generate it.
- Include category, topic, type, title, prompt, options, answer, reveal, fun_fact, tags, mood, occasion, play_time_sec, and status.
- Use at least a second-level category, such as science.astronomy. Do not use top-level-only categories such as science.
- Use answer option IDs for choice questions, such as ["A"].
- Use status: "draft" unless the facts and wording have been reviewed.
- Do not include media unless I provide a local media path and source information.

Topic:
<describe the topic>

Target category:
<category id from taxonomy/categories.json>

Tone:
<funny / surprising / easygoing / hardcore / nostalgic / weird>

Count:
<number>
```

中文提示词版本：

```text
请生成万题王双语趣味题目草稿。

要求：
- 定位是趣味答题，不是正式考试。
- 所有玩家可见文本都必须包含 zh-CN 和 en-US。
- 输出普通 JSON 对象，每道题一个对象。除非我明确要求，不要输出 JSONL。
- 不要编写 id，留空让导入脚本自动生成。
- 包含 category、topic、type、title、prompt、options、answer、reveal、fun_fact、tags、mood、occasion、play_time_sec、status。
- 至少使用二级分类，例如 science.astronomy。不要只使用 science 这类一级分类。
- 选择题答案使用选项 ID，例如 ["A"]。
- 除非事实和措辞已经审核，否则 status 使用 "draft"。
- 除非我提供本地媒体路径和来源信息，否则不要加入媒体。

主题：
<描述主题>

目标分类：
<taxonomy/categories.json 中的分类 ID>

语气：
<funny / surprising / easygoing / hardcore / nostalgic / weird>

数量：
<题目数量>
```

## Importing AI Drafts

For one JSON object:

单个 JSON 对象导入：

```bash
npm run new:question -- --from-json draft-question.json
```

For a dry run:

只试运行、不写文件：

```bash
npm run new:question -- --from-json draft-question.json --dry-run
```

After importing:

导入后运行：

```bash
npm run wtw -- check
```

## Batch Authoring Advice

For batch work, keep AI output small enough to review comfortably. Batches of 5 to 20 questions are usually easier to check than one large generated file.

批量生成时，不要一次生成太多。每批 5 到 20 道题通常更容易人工审核。

Suggested review checklist:

- Is the fact correct?
- Is there exactly one best answer?
- Does the English version preserve the same meaning as the Chinese version?
- Does the reveal feel fun rather than textbook-like?
- Does the category exist in `taxonomy/categories.json`?
- Are tags lowercase English slugs when possible?
- Is `status` still `draft` until reviewed?

审核清单：

- 事实是否正确？
- 是否只有一个最合理答案？
- 英文版本和中文版本意思是否一致？
- `reveal` 是否有趣，而不是像课本解释？
- 分类是否存在于 `taxonomy/categories.json`？
- 标签是否尽量使用英文小写 slug？
- 未审核前是否保持 `status: "draft"`？

## Media Questions

AI should not invent media paths. For media questions, provide the local relative path, media type, source, and license first.

AI 不应该凭空编造媒体路径。媒体题需要先提供本地相对路径、媒体类型、来源和许可信息。

Recommended order:

1. Put the file under `media/`.
2. Ask AI to draft the `media-meta/*.jsonl` line.
3. Review source and license.
4. Ask AI to add the question referencing the `media_id`.
5. Run `npm run wtw -- check`.

推荐顺序：

1. 将文件放入 `media/`。
2. 让 AI 生成 `media-meta/*.jsonl` 元数据行。
3. 人工检查来源和许可。
4. 让 AI 生成引用该 `media_id` 的题目。
5. 运行 `npm run wtw -- check`。

## Guardrails

- Do not mark AI-generated questions as `published` until reviewed.
- Do not use copyrighted media without a compatible license or permission.
- Do not add current-affairs questions without checking dates and sources.
- Do not let AI choose categories from memory; read taxonomy first.
- Do not edit generated indexes by hand.

注意事项：

- AI 生成的题目未审核前不要标记为 `published`。
- 没有兼容许可或授权时，不要使用受版权保护的媒体。
- 时事题必须检查日期和来源。
- 不要让 AI 凭记忆选择分类，先读取 taxonomy。
- 不要手动编辑自动生成的索引。
