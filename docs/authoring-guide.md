# Authoring Guide

Adding trivia by hand can become repetitive because every question needs IDs, categories, bilingual text, answers, tags, moods, and occasions. The recommended workflow is to use the helper script first, then polish the generated JSONL line if needed.

手动新增题目很容易累，因为每道题都要维护 ID、分类、中英文文本、答案、标签、氛围和场景。推荐先用辅助脚本生成，再按需要微调 JSONL。

## Interactive Workflow

Recommended entry:

```bash
npm run wtw
```

推荐入口：

```bash
npm run wtw
```

Run:

```bash
npm run new:question
```

To test the flow without writing a file:

```bash
npm run new:question -- --dry-run
```

如果只是想试一遍流程、不写入文件，可以运行：

```bash
npm run new:question -- --dry-run
```

## JSON Draft Workflow

You can also prepare one question as a normal JSON object, then let the helper append it to the right JSONL file.

也可以先写一个普通 JSON 对象，再交给脚本追加到正确的 JSONL 文件中。

Start from one of the files in `templates/`:

可以从 `templates/` 里的模板开始：

```text
templates/single-choice-question.json
templates/true-false-question.json
```

```bash
npm run new:question -- --from-json draft-question.json
```

For quick checks without writing:

```bash
printf '{ "type": "true_false", "category": "science.astronomy", "topic": "space-trivia", "title": { "zh-CN": "测试", "en-US": "Test" }, "prompt": { "zh-CN": "这是测试吗？", "en-US": "Is this a test?" }, "options": [{ "id": "T", "text": { "zh-CN": "真的", "en-US": "True" } }, { "id": "F", "text": { "zh-CN": "假的", "en-US": "False" } }], "answer": ["T"], "reveal": { "zh-CN": "这是测试。", "en-US": "This is a test." }, "tags": ["test"], "mood": ["easygoing"], "occasion": ["daily"], "play_time_sec": 10, "status": "draft" }' | npm run new:question -- --from-json - --dry-run
```

If `id` is omitted, the script generates the next ID for the category. If `topic` is provided, it is used to choose the default file name and then removed from the stored question.

如果省略 `id`，脚本会根据分类自动生成下一个 ID。如果提供 `topic`，脚本会用它决定默认文件名，然后从最终题目对象中移除该字段。

The script will ask for category, question type, bilingual title, bilingual prompt, options, answer, reveal text, optional fun fact, tags, moods, occasions, and target JSONL file.

脚本会一步步询问分类、题型、中英文标题、中英文题干、选项、答案、解析、标签、氛围、使用场景和目标文件。

## Manual JSONL Workflow

You can also add a question by editing JSONL directly. Create or open a topic file under the matching second-level category:

也可以完全手写 JSONL。先在对应二级分类目录下创建或打开主题文件：

```text
questions/<primary-category>/<secondary-category>/<topic>.jsonl
```

Example:

```text
questions/science/astronomy/moon.jsonl
```

Append one complete question object as one line:

每一行是一道完整题目：

```json
{"id":"science-astronomy-000003","type":"single_choice","title":{"zh-CN":"月亮其实在干嘛","en-US":"What Is the Moon Doing?"},"prompt":{"zh-CN":"月亮绕着哪个天体运行？","en-US":"What object does the Moon orbit?"},"options":[{"id":"A","text":{"zh-CN":"地球","en-US":"Earth"}},{"id":"B","text":{"zh-CN":"太阳","en-US":"The Sun"}}],"answer":["A"],"reveal":{"zh-CN":"答案是地球。月亮是地球的天然卫星。","en-US":"The answer is Earth. The Moon is Earth's natural satellite."},"category":"science.astronomy","tags":["moon","space"],"mood":["easygoing"],"occasion":["daily"],"play_time_sec":20,"status":"draft"}
```

After manual editing, run:

手写完成后运行：

```bash
npm run wtw -- check
```

This validates the source files and rebuilds generated indexes.

这个命令会校验源文件，并重新生成索引。

## Recommended Habits

- Use the script for first drafts.
- Keep generated IDs stable after creation.
- Store one topic per JSONL file when possible.
- Run `npm run validate` after editing.
- Run `npm run build:index` before committing.

中文建议：

- 先用脚本生成草稿，之后再人工润色。
- ID 生成后尽量不要修改。
- 一个 JSONL 文件尽量只放一个具体主题。
- 修改后运行 `npm run validate`。
- 提交前运行 `npm run build:index`。

## Non-Media First

For the early stage, prefer text-only questions. Media questions can be added later once the media metadata workflow is stable.

早期建议优先写纯文本题。等媒体元数据流程稳定后，再逐步加入图片、音频和视频题。

For media questions, register metadata in `media-meta/` first, then reference the media ID from the question.

如果是媒体题，先在 `media-meta/` 登记媒体元数据，再在题目中引用媒体 ID。
