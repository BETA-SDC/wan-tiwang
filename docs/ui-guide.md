# Admin UI Guide

Wan Ti Wang keeps the CLI for AI and automation, and adds a local web interface for human-friendly management.

万题王保留 CLI 给 AI 和自动化使用，同时提供本地 Web 管理界面，方便人工浏览和维护。

## Start

Run:

```bash
npm run ui
```

Without npm, run:

```bash
node scripts/server.mjs
```

Open the local URL printed by the command, usually:

```text
http://127.0.0.1:5177
```

Keep the terminal open while using the UI. Stop it with `Ctrl+C`.

中文启动方式：

```bash
npm run ui
```

如果没有 npm：

```bash
node scripts/server.mjs
```

打开终端输出的本地地址，通常是 `http://127.0.0.1:5177`。使用 UI 时保持终端运行；停止服务按 `Ctrl+C`。

For a full step-by-step operations manual, see [Operations Guide](operations-guide.md).

完整分级操作手册见 [Operations Guide](operations-guide.md)。

## Main Views

- `Home`: task shortcuts for the most common workflows.
- `Question Library`: search, filter, preview, edit, and select questions for a deck.
- `Question Editor`: create a new draft or edit an existing question with either a form or raw JSON.
- `Import Questions`: validate and import reviewed JSON drafts from AI or manual batch authoring.
- `Slide Generator`: open the separate deck-building page at `/slides/`.
- `Media Library`: inspect media metadata.
- `Settings`: review the controlled category, answer type, mood, and occasion vocabularies.
- `Maintenance`: run the same checks used by the CLI.

中文说明：

- `Home`：通过快捷入口进入常用任务。
- `Question Library`：搜索、筛选、预览、编辑和选择题目。
- `Question Editor`：用表单或原始 JSON 新建、编辑题目。
- `Import Questions`：检查并导入 AI 或人工批量整理后的 JSON 草稿。
- `Slide Generator`：打开 `/slides/` 独立题目可视化生成器页面。
- `Media Library`：查看媒体元数据。
- `Settings`：查看受控的分类、答题类型、氛围和场景词表。
- `Maintenance`：运行和 CLI 相同的维护检查。

The navigation is intentionally task-based. Filtering belongs to `Question Library`; category and answer-type definitions belong to `Settings`; deck assembly belongs to `Slide Generator`.

导航按任务划分：筛选只放在 `Question Library`，分类和答题类型定义放在 `Settings`，演示稿组装放在 `Slide Generator`。

Every feature is a separate page with the same navigation shell. Use the left navigation to move between major areas, `Back to Library` on a question preview/editor when returning to the question list, and `Back to Home` on standalone areas. The browser URL is also a stable entry point:

每个功能都是独立页面，并共享同一套导航壳层。单题预览和编辑器使用 `Back to Library` 返回题库，其他独立功能使用 `Back to Home`；浏览器地址本身也是稳定入口：

```text
/                 Home
/questions/       Question Library
/editor/          Question Editor
/import/          Import Questions
/question/?id=   Single question preview
/slides/          Slide Generator
/media/            Media Library
/settings/         Settings
/maintenance/     Maintenance
```

## Save Flow

1. Create or edit a question in `Editor`.
2. Save it.
3. Run `Run Check`.
4. Review validation output.
5. Commit and push when ready.

中文流程：

1. 在 `Editor` 中新建或编辑题目。
2. 保存。
3. 点击 `Run Check`。
4. 查看校验输出。
5. 确认无误后提交并推送。

## Feedback Import

Feedback comes from exported slide decks. In an exported deck, players click options, use `1-9`, or use `W/A/S/D` plus `Enter`, confirm with `Confirm Answer` or another `Enter`, then click `Download Feedback`.

To import it:

1. Open `Maintenance`.
2. Choose the downloaded `*-answer-feedback.json` file in `Answer Feedback Import`.
3. Click `Import Feedback`.
4. Review the result.
5. Click `Run Check`.

反馈来自导出的演示。玩家在演示中点击选项、使用 `1-9`，或用 `W/A/S/D` 加 `Enter` 选择选项，再点击 `Confirm Answer` 或再次按 `Enter` 确认，最后点击 `Download Feedback` 下载反馈 JSON。

导入方式：

1. 打开 `Maintenance`。
2. 在 `Answer Feedback Import` 里选择下载的 `*-answer-feedback.json`。
3. 点击 `Import Feedback`。
4. 查看结果。
5. 点击 `Run Check`。

导入只会累加题目的 `feedback.answered_count` 和 `feedback.correct_count`，不会自动修改难度。

## Form and JSON Modes

Use `Form` mode for common questions. It covers answer type, category, bilingual title, bilingual prompt, options, answer, reveal, fun fact, optional image/audio/video links, tags, moods, occasions, play time, status, and topic file name.

Use `JSON` mode for uncommon fields that the form does not expose yet.

表单模式适合常见题目，覆盖答题类型、分类、中英文标题、中英文题干、选项、答案、解析、趣味补充、可选图片/音频/视频关联、标签、氛围、场景、时间、状态和 topic 文件名。

JSON 模式适合处理表单暂时没有暴露的高级字段。

When editing an existing question in Form mode, unexposed fields are preserved where possible.

用表单编辑已有题目时，表单没有展示的字段会尽量保留。

## Question Draft Import

Use `Import Questions` for reviewed AI drafts or other batch JSON. It accepts one question object, an array of question objects, or an object shaped like `{"questions":[...]}`.

Flow:

1. Give [AI One-File Question Brief](ai-one-file-question-brief.md) to the AI that drafts questions.
2. Review the facts, answer, category, difficulty, tags, bilingual text, and media references.
3. Open `Import Questions`.
4. Paste JSON or choose a `.json` file.
5. Click `Validate Draft`.
6. If the generated IDs and target files look right, click `Import Draft`.
7. Open `Maintenance` and run `Run Check`.

`Validate Draft` does not write files. `Import Draft` writes JSONL question records only after the current pasted draft has passed validation.

题目草稿导入：

1. 把 [AI One-File Question Brief](ai-one-file-question-brief.md) 给负责出题的 AI。
2. 人工审核事实、答案、分类、难度、标签、中英文文本和媒体引用。
3. 打开 `Import Questions`。
4. 粘贴 JSON，或选择 `.json` 文件。
5. 点击 `Validate Draft`。
6. 确认生成 ID 和目标文件无误后，点击 `Import Draft`。
7. 打开 `Maintenance`，运行 `Run Check`。

`Validate Draft` 不写文件。只有当前草稿通过检查后，`Import Draft` 才会写入 JSONL 题目记录。

## Answer Types and Media

`Answer type` describes how the player answers: single choice, multiple choice, true/false, fill in the blank, or short answer. Guess-the-image, listen-and-guess, and watch-and-answer are handled by media references plus tags, not by separate answer types.

Advanced answer types such as `ordering`, `matching`, `numeric`, and `hotspot` are supported by the data model. The form editor directly supports common option-based types; use `JSON` mode for matching and hotspot structures until dedicated form controls are added.

高级题型如 `ordering`、`matching`、`numeric`、`hotspot` 已被数据结构支持。表单编辑器直接覆盖常见选项型题目；配对题和热点题在专用表单控件完成前，建议使用 `JSON` 模式维护。

`Answer type` 表示玩家怎么作答：单选、多选、判断、填空或简答。猜图、听音频猜、看视频回答属于媒体玩法，通过媒体引用和标签表达，不再单独作为题型。

When `Image`, `Audio`, or `Video` is checked, the form shows a media section for that kind. You can choose an existing media item or upload a new local file. Uploaded files are written under `media/`, which is ignored by Git, and metadata is appended to `data/media-meta/*.jsonl`.

勾选 `Image`、`Audio` 或 `Video` 后，表单会显示对应的媒体区域。你可以选择已有媒体，也可以上传新的本地文件。上传文件会写入被 Git 忽略的 `media/`，同时自动追加一条 `data/media-meta/*.jsonl` 元数据。

Changing fields, switching between `Form` and `JSON`, and selecting local media files do not write data. The UI only writes question data, uploaded media files, and media metadata after `Save` is clicked.

修改字段、切换 `Form` / `JSON`、选择本地媒体文件都不会写入数据。只有点击 `Save` 后，UI 才会写入题目、上传媒体文件和媒体元数据。

Question cards in `Browse` have a `Preview` link that opens `/question/?id=<question-id>` for a single-question slide preview.

`Browse` 里的题目卡片有 `Preview` 链接，会打开 `/question/?id=<题目ID>` 单题幻灯片预览。

## CLI Remains Available

The UI uses the same repository files as the CLI. AI agents can continue using:

```bash
npm run wtw
npm run wtw -- check
npm run new:question
npm run validate
npm run build:index
```

UI 和 CLI 操作的是同一份仓库文件。AI 仍然可以继续使用 CLI。
