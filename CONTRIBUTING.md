# Contributing

This file explains how to contribute to Wan Ti Wang at the repository level: where files live, how to add questions, how to use AI safely, and what to check before submitting changes.

这份文档说明如何给万题王贡献内容：仓库结构、题目放在哪里、如何借助 AI、如何导入题目，以及提交前需要检查什么。

## What You Can Contribute

- New bilingual questions.
- Corrections to existing questions, answers, explanations, categories, tags, or difficulty.
- Media metadata for local image, audio, or video questions.
- Category, format, tag, and documentation improvements.
- UI, CLI, validation, export, and maintenance tooling.

可以贡献：

- 新的中英文双语题目。
- 对已有题目、答案、解析、分类、标签、难度的修正。
- 图片、音频、视频题目的媒体元数据。
- 分类、题型、标签和文档改进。
- UI、CLI、校验、导出和维护工具改进。

## Repository Structure

```text
admin/          Local browser UI
  import/       Paste/upload reviewed question JSON drafts
  editor/       Create or edit one question
  questions/    Browse, filter, preview, and select questions
  slides/       Build standalone slide-style HTML decks
data/           Versioned question-bank data
  questions/    Source question JSONL files
  media-meta/   Versioned metadata for local media
  taxonomy/     Categories, answer types, moods, occasions, difficulty values
  indexes/      Generated indexes; do not edit by hand
  templates/    Copyable question draft templates
docs/           Guides for humans and AI-assisted workflows
media/          Local media files; ignored by Git
scripts/        CLI, checks, index builders, UI server, exports
skills/         AI assistant operating instructions for this repository
```

题目源文件放在：

```text
data/questions/<primary-category>/<secondary-category>/<topic>.jsonl
```

Each line in a `.jsonl` file is one complete question object. Generated indexes under `data/indexes/` are rebuilt by tools and should be committed with source data changes.

每个 `.jsonl` 文件中一行是一道完整题目。`data/indexes/` 下的索引由工具生成，不手动编辑；题目源数据变化后，需要和索引一起提交。

## Recommended Question Contribution Flow

For most question contributions, use this path:

1. Read [AI One-File Question Brief](docs/ai-one-file-question-brief.md).
2. Ask AI to draft a small JSON batch, or write a JSON draft manually.
3. Review facts, answer, category IDs, difficulty, tags, bilingual text, and media references.
4. Import the reviewed draft through the UI or CLI.
5. Run the maintenance check.
6. Review the Git diff.
7. Commit and push.

推荐题目贡献流程：

1. 阅读 [AI One-File Question Brief](docs/ai-one-file-question-brief.md)。
2. 让 AI 生成一小批 JSON 草稿，或人工编写 JSON 草稿。
3. 人工审核事实、答案、分类 ID、难度、标签、中英文文本和媒体引用。
4. 用 UI 或 CLI 导入已审核草稿。
5. 运行维护检查。
6. 查看 Git diff。
7. 提交并推送。

## Using AI to Draft Questions

If another AI only reads one file, give it:

```text
docs/ai-one-file-question-brief.md
```

Then give it a short task message:

```text
Create <count> Wan Ti Wang questions.
Topic: <topic>
Categories: <category ids>
Difficulty mix: <easy/medium/hard ratio>
Media: none, unless I provide real media ids and file details.
Output only a JSON array. Do not include markdown.
```

如果让其他 AI 出题，只需要先给它读：

```text
docs/ai-one-file-question-brief.md
```

然后补充任务要求：

```text
请生成 <数量> 道万题王题目。
主题：<主题>
分类：<分类 id>
难度比例：<easy/medium/hard 比例>
媒体：默认不要使用媒体，除非我提供真实 media id 和文件信息。
只输出 JSON 数组，不要输出 Markdown。
```

AI output is a draft, not final data. Always review it before importing.

AI 输出只是草稿，不是最终数据。导入前必须人工审核。

## Import Through the UI

Start the local UI:

```bash
npm run ui
```

Open the printed local URL, then use:

```text
Import Questions
```

UI flow:

1. Paste the reviewed JSON draft or choose a `.json` file.
2. Click `Validate Draft`.
3. Confirm generated IDs and target JSONL files.
4. Click `Import Draft`.
5. Go to `Maintenance` and click `Run Check`.

可视化导入流程：

1. 粘贴已审核 JSON 草稿，或选择 `.json` 文件。
2. 点击 `Validate Draft`。
3. 确认生成的 ID 和目标 JSONL 文件。
4. 点击 `Import Draft`。
5. 到 `Maintenance` 点击 `Run Check`。

## Import Through the CLI

Use the friendly import command:

```bash
npm run import:questions -- draft-batch.json --dry-run
npm run import:questions -- draft-batch.json --yes --check
```

直接 CLI 导入使用：

```bash
npm run import:questions -- draft-batch.json --dry-run
npm run import:questions -- draft-batch.json --yes --check
```

Meaning:

- `--dry-run`: validate, generate IDs, and show target files without writing data.
- `--yes`: import without an interactive confirmation.
- `--check`: run validation, tag lint, duplicate detection, and index rebuild after import.

参数含义：

- `--dry-run`：只检查、生成 ID、显示目标文件，不写入题库。
- `--yes`：跳过交互确认，适合 AI agent 或脚本。
- `--check`：导入后自动运行校验、标签检查、重复题检查和索引重建。

The same workflow is also available through:

```bash
npm run wtw -- import draft-batch.json --dry-run
npm run wtw -- import draft-batch.json --yes --check
```

## Manual Single-Question Editing

For one-off manual work, use the UI editor:

```bash
npm run ui
```

Then open `Question Editor`.

For direct JSONL editing, keep each question as one JSON object on one line, then run:

```bash
npm run wtw -- check
```

单题人工修改建议使用 UI 的 `Question Editor`。如果直接编辑 JSONL，确保一行一个完整题目对象，修改后运行 `npm run wtw -- check`。

## Media Contributions

Media files currently stay local and are ignored by Git:

```text
media/images/
media/audio/
media/video/
```

Versioned media metadata lives in:

```text
data/media-meta/
```

Question records should reference media by stable media IDs, not absolute file paths. Media paths stored in metadata must be relative.

媒体文件本体目前只保存在本地，不进入 Git。进入 Git 的是 `data/media-meta/` 中的媒体元数据。题目通过稳定的 media ID 引用媒体，不写绝对路径；元数据里的路径必须是相对路径。

## Before Submitting

Run:

```bash
npm run wtw -- check
git diff --check
git status --short
```

提交前请运行：

```bash
npm run wtw -- check
git diff --check
git status --short
```

Check that your diff includes the intended source files and generated indexes, and does not include ignored local media files.

确认 diff 里包含应提交的题目源文件和生成索引，不包含被忽略的本地媒体文件。

## Useful References

- [AI One-File Question Brief](docs/ai-one-file-question-brief.md): one file to give another AI.
- [Question Format](docs/question-format.md): field-level data structure.
- [Category Guide](docs/category-guide.md): taxonomy rules.
- [Tag Guide](docs/tag-guide.md): tag naming.
- [Command Guide](docs/command-guide.md): CLI commands.
- [Admin UI Guide](docs/ui-guide.md): local visual interface.
