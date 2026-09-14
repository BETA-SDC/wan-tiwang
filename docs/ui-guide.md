# Admin UI Guide

Wan Ti Wang keeps the CLI for AI and automation, and adds a local web interface for human-friendly management.

万题王保留 CLI 给 AI 和自动化使用，同时提供本地 Web 管理界面，方便人工浏览和维护。

## Start

Run:

```bash
npm run ui
```

Open the local URL printed by the command, usually:

```text
http://127.0.0.1:5177
```

## Main Views

- `Browse`: search and filter questions.
- `Editor`: create a new draft or edit an existing question with either a form or raw JSON.
- `Media`: inspect media metadata.
- `Check`: run the same maintenance checks used by the CLI.

中文说明：

- `Browse`：搜索和筛选题目。
- `Editor`：用表单或原始 JSON 新建、编辑题目。
- `Media`：查看媒体元数据。
- `Check`：运行和 CLI 相同的维护检查。

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

## Form and JSON Modes

Use `Form` mode for common questions. It covers answer type, category, bilingual title, bilingual prompt, options, answer, reveal, fun fact, optional image/audio/video links, tags, moods, occasions, play time, status, and topic file name.

Use `JSON` mode for uncommon fields that the form does not expose yet.

表单模式适合常见题目，覆盖答题类型、分类、中英文标题、中英文题干、选项、答案、解析、趣味补充、可选图片/音频/视频关联、标签、氛围、场景、时间、状态和 topic 文件名。

JSON 模式适合处理表单暂时没有暴露的高级字段。

When editing an existing question in Form mode, unexposed fields are preserved where possible.

用表单编辑已有题目时，表单没有展示的字段会尽量保留。

## Answer Types and Media

`Answer type` describes how the player answers: single choice, multiple choice, true/false, fill in the blank, or short answer. Guess-the-image, listen-and-guess, and watch-and-answer are handled by media references plus tags, not by separate answer types.

`Answer type` 表示玩家怎么作答：单选、多选、判断、填空或简答。猜图、听音频猜、看视频回答属于媒体玩法，通过媒体引用和标签表达，不再单独作为题型。

When `Image`, `Audio`, or `Video` is checked, the form shows a media section for that kind. You can choose an existing media item or upload a new local file. Uploaded files are written under `media/`, which is ignored by Git, and metadata is appended to `data/media-meta/*.jsonl`.

勾选 `Image`、`Audio` 或 `Video` 后，表单会显示对应的媒体区域。你可以选择已有媒体，也可以上传新的本地文件。上传文件会写入被 Git 忽略的 `media/`，同时自动追加一条 `data/media-meta/*.jsonl` 元数据。

Changing fields, switching between `Form` and `JSON`, and selecting local media files do not write data. The UI only writes question data, uploaded media files, and media metadata after `Save` is clicked.

修改字段、切换 `Form` / `JSON`、选择本地媒体文件都不会写入数据。只有点击 `Save` 后，UI 才会写入题目、上传媒体文件和媒体元数据。

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
