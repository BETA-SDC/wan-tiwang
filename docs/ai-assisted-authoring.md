# AI-Assisted Authoring

AI can reduce the repetitive parts of maintaining Wan Ti Wang, but it should not replace review. Use AI for drafting, translation, normalization, and batch cleanup; use human judgment for taste, factual accuracy, copyright, and final publishing.

AI 可以显著降低维护万题王的重复劳动，但不应该完全代替审核。适合交给 AI 的部分包括草稿生成、双语改写、格式整理、批量清理；事实准确性、趣味风格、版权判断和最终发布仍然需要人工把关。

If another AI can only read one instruction file, give it [AI One-File Question Brief](ai-one-file-question-brief.md). That file includes allowed categories, values, normal question format, media question format, and final checks in one place.

如果其他 AI 只能读一份说明，请直接给它 [AI One-File Question Brief](ai-one-file-question-brief.md)。那份文档把可用分类、字段取值、普通题格式、媒体题格式和最终检查都放在一处。

## What AI Should Help With

- turn rough ideas into bilingual question drafts
- translate and localize `zh-CN` and `en-US` player-facing text
- suggest categories, tags, moods, occasions, and topic file names
- rewrite formal facts into lighter trivia prompts
- detect missing fields or inconsistent metadata before validation
- prepare media metadata when local media paths are known
- choose the smallest stable answer type instead of inventing new type names

AI 适合辅助：

- 把零散想法整理成中英文题目草稿
- 翻译和本地化玩家可见文本
- 建议分类、标签、氛围、使用场景和题目文件名
- 把严肃知识改写成轻松的趣味答题
- 在正式校验前发现缺字段或格式不一致
- 已知本地媒体路径时，辅助生成媒体元数据

## Recommended Workflow

1. Describe the topic, audience, and desired mood.
2. Ask AI to produce JSON draft objects or one JSON array of draft objects, not final JSONL edits.
3. Review the facts, wording, category, answer, and bilingual quality.
4. Import accepted drafts with `npm run new:question -- --from-json <file>`.
5. Run `npm run wtw -- check`.
6. Commit source data and generated indexes together.

中文流程：

1. 先说明主题、受众和希望的题目氛围。
2. 让 AI 输出普通 JSON 草稿，或一个包含多道题的 JSON 数组，不直接批量改 JSONL。
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
- Category IDs may be hierarchical, such as science.astronomy. Use the most useful stable category available in taxonomy.
- Use answer option IDs for choice questions, such as ["A"].
- Use status: "draft" unless the facts and wording have been reviewed.
- Do not include media unless I provide a local media path and source information.
- Do not create new `type` values. Use one of `single_choice`, `multiple_choice`, `true_false`, `fill_blank`, `numeric`, `short_answer`, `ordering`, `matching`, or `hotspot`.
- Do not use `type` for play style. Use tags such as `image-guess`, `listen-and-guess`, `speed-round`, or `meme`.

Topic:
<describe the topic>

Target category:
<category id from data/taxonomy/categories.json>

Tone:
<funny / surprising / easygoing / hardcore / nostalgic / weird>

Count:
<number>
```

For batch drafting, the easiest format to review and import is a JSON array. Copy [data/templates/ai-batch-questions.json](../data/templates/ai-batch-questions.json), then ask the other AI to replace the placeholder objects.

批量出题最方便审核和导入的格式是 JSON 数组。可以复制 [data/templates/ai-batch-questions.json](../data/templates/ai-batch-questions.json)，让其他 AI 替换里面的示例对象。

Important batch rules:

- Output exactly one valid JSON array.
- Do not wrap it in Markdown fences when saving to a `.json` file.
- Do not include `id`; the import script will generate IDs.
- Keep `topic` as a short English slug, because it decides the target JSONL file name.
- Use `status: "draft"` until human review.
- Use only category IDs from `data/taxonomy/categories.json`.
- Use only mood and occasion IDs from taxonomy.
- Use lowercase English slug tags, such as `solar-system`, `movie-trivia`, or `wordplay`.

批量生成规则：

- 只输出一个合法 JSON 数组。
- 保存成 `.json` 文件时不要包含 Markdown 代码块标记。
- 不要写 `id`，导入脚本会自动生成。
- `topic` 使用简短英文 slug，因为它会决定目标 JSONL 文件名。
- 人工审核前保持 `status: "draft"`。
- `category` 只能使用 `data/taxonomy/categories.json` 中已有分类。
- `mood` 和 `occasion` 只能使用 taxonomy 中已有 ID。
- 标签尽量使用英文小写 slug，例如 `solar-system`、`movie-trivia`、`wordplay`。

中文提示词版本：

```text
请生成万题王双语趣味题目草稿。

要求：
- 定位是趣味答题，不是正式考试。
- 所有玩家可见文本都必须包含 zh-CN 和 en-US。
- 输出普通 JSON 对象，每道题一个对象。除非我明确要求，不要输出 JSONL。
- 不要编写 id，留空让导入脚本自动生成。
- 包含 category、topic、type、title、prompt、options、answer、reveal、fun_fact、tags、mood、occasion、play_time_sec、status。
- 分类 ID 可以是层级式的，例如 science.astronomy。请使用 taxonomy 中最合适、稳定的分类。
- 选择题答案使用选项 ID，例如 ["A"]。
- 除非事实和措辞已经审核，否则 status 使用 "draft"。
- 除非我提供本地媒体路径和来源信息，否则不要加入媒体。

主题：
<描述主题>

目标分类：
<data/taxonomy/categories.json 中的分类 ID>

语气：
<funny / surprising / easygoing / hardcore / nostalgic / weird>

数量：
<题目数量>
```

## Copyable Batch Prompt

When asking another AI system to write questions, this prompt is usually the easiest to use:

让其他 AI 出题时，可以直接使用这个提示词：

```text
You are drafting questions for Wan Ti Wang, a fun bilingual trivia bank.

Return exactly one valid JSON array. Do not use Markdown. Do not include comments.

For each question object:
- Do not include id.
- Include: type, category, topic, difficulty, title, prompt, options, answer, reveal, fun_fact, tags, mood, occasion, play_time_sec, status.
- Every player-facing text must have both zh-CN and en-US.
- status must be "draft".
- type must be one of: single_choice, multiple_choice, true_false, fill_blank, numeric, short_answer, ordering, matching, hotspot.
- Prefer single_choice, multiple_choice, or true_false unless another type is clearly better.
- For choice questions, use option ids in answer, such as ["A"] or ["A","C"].
- For true_false questions, use options T/F and answer ["T"] or ["F"].
- category must be one of the existing taxonomy category ids I provide.
- difficulty must be easy, medium, or hard.
- mood must use only: funny, surprising, easygoing, hardcore, nostalgic, weird, beautiful, debate.
- occasion must use only: daily, party, stream, family, classroom-warmup, challenge, icebreaker.
- tags should be lowercase English slugs.
- topic should be a short English slug for the output file, such as "movie-trivia" or "ai-trivia".
- Do not invent media paths or media ids.
- Keep the tone fun, clear, and playable, not exam-like.
- Avoid current affairs unless exact dates and stable sources are provided.
- Make every question have one unambiguous best answer.

Target categories:
<paste category ids here>

Topic scope:
<describe topic scope>

Question count:
<number>
```

中文使用时，把 `Target categories`、`Topic scope` 和 `Question count` 换成你的需求即可。

## Importing AI Drafts

For one JSON object:

单个 JSON 对象导入：

```bash
npm run new:question -- --from-json draft-question.json
```

For a JSON array of draft objects:

批量 JSON 数组导入：

```bash
npm run new:question -- --from-json draft-batch.json
```

For a dry run:

只试运行、不写文件：

```bash
npm run new:question -- --from-json draft-question.json --dry-run
```

Dry run also works with batch files:

批量文件也可以先试运行：

```bash
npm run new:question -- --from-json draft-batch.json --dry-run
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
- Does the category exist in `data/taxonomy/categories.json`?
- Are tags lowercase English slugs when possible?
- Is `status` still `draft` until reviewed?

审核清单：

- 事实是否正确？
- 是否只有一个最合理答案？
- 英文版本和中文版本意思是否一致？
- `reveal` 是否有趣，而不是像课本解释？
- 分类是否存在于 `data/taxonomy/categories.json`？
- 标签是否尽量使用英文小写 slug？
- 未审核前是否保持 `status: "draft"`？

## Media Questions

AI should not invent media paths. For media questions, provide the local relative path, media type, source, and license first.

AI 不应该凭空编造媒体路径。媒体题需要先提供本地相对路径、媒体类型、来源和许可信息。

Use [data/templates/ai-media-question-pack.json](../data/templates/ai-media-question-pack.json) when asking another AI to draft media-backed questions. It shows three separate parts:

- `media_files_to_place_locally`: where the real ignored media files should be placed under `media/`.
- `media_metadata_jsonl`: metadata lines to review and append to `data/media-meta/images.jsonl`, `audio.jsonl`, or `video.jsonl`.
- `question_drafts`: question JSON objects that reference the registered media IDs.

让其他 AI 生成媒体题时，建议使用 [data/templates/ai-media-question-pack.json](../data/templates/ai-media-question-pack.json)。它分成三部分：

- `media_files_to_place_locally`：真实媒体文件应该放到 `media/` 下哪里。
- `media_metadata_jsonl`：审核后追加到 `data/media-meta/images.jsonl`、`audio.jsonl` 或 `video.jsonl` 的元数据。
- `question_drafts`：引用这些媒体 ID 的题目草稿。

Do not import the whole media pack JSON directly with `--from-json`. The importer expects question objects only. First register media metadata, then import only the `question_drafts` array as a separate JSON file.

不要把整个 media pack JSON 直接用 `--from-json` 导入。导入器只接收题目对象。请先登记媒体元数据，再把 `question_drafts` 单独保存成 JSON 数组导入。

Recommended order:

1. Put the file under `media/`.
2. Ask AI to draft the `data/media-meta/*.jsonl` line.
3. Review source and license.
4. Append reviewed metadata to the correct `data/media-meta/*.jsonl` file.
5. Ask AI to add the question referencing the `media_id`, or save `question_drafts` as a question batch JSON.
6. Run `npm run new:question -- --from-json <question-batch>.json --dry-run`.
7. If the dry run is correct, import it without `--dry-run`.
8. Run `npm run wtw -- check`.

推荐顺序：

1. 将文件放入 `media/`。
2. 让 AI 生成 `data/media-meta/*.jsonl` 元数据行。
3. 人工检查来源和许可。
4. 把审核后的元数据追加到对应的 `data/media-meta/*.jsonl`。
5. 让 AI 生成引用该 `media_id` 的题目，或把 `question_drafts` 单独保存成题目批量 JSON。
6. 先运行 `npm run new:question -- --from-json <question-batch>.json --dry-run`。
7. 试运行无误后，去掉 `--dry-run` 正式导入。
8. 运行 `npm run wtw -- check`。

Use question-level `media` when the media is shared prompt material, such as “listen to this audio and answer.” Use `options[].media` when the media belongs to a specific answer option, such as “which image is correct?”

题干共用材料使用题目级 `media`，例如“听这段音频回答”。如果媒体属于某个选项本身，例如“哪张图片正确”，则使用 `options[].media`。

Copyable media prompt:

可复制媒体题提示词：

```text
You are drafting media-backed questions for Wan Ti Wang.

Return exactly one valid JSON object with:
- media_files_to_place_locally
- media_metadata_jsonl
- question_drafts

Rules:
- Do not invent real source/license details. Use license "unknown" if not provided.
- All media paths must be relative paths under media/.
- Media IDs must be stable English slugs, prefixed by img-, aud-, vid-, or thumb-.
- Question drafts must not include id.
- Every player-facing text must have zh-CN and en-US.
- If media is part of the prompt, put it in question.media with role "question".
- If media is an answer option, put it in options[].media with role "option".
- Use tags such as image-guess, image-option, listen-and-guess, watch-and-answer.
- Keep status "draft".

Media files I will provide:
<list file names, media kind, rough topic, source/license if known>

Question count:
<number>
```

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
