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

Use `Form` mode for common text-only questions. It covers type, category, bilingual title, bilingual prompt, options, answer, reveal, fun fact, tags, moods, occasions, play time, status, and topic file name.

Use `JSON` mode for advanced cases such as media references, uncommon question types, or fields that the form does not expose yet.

表单模式适合常见纯文本题，覆盖题型、分类、中英文标题、中英文题干、选项、答案、解析、趣味补充、标签、氛围、场景、时间、状态和 topic 文件名。

JSON 模式适合媒体引用、不常见题型，或表单暂时没有暴露的高级字段。

When editing an existing question in Form mode, unexposed fields are preserved where possible.

用表单编辑已有题目时，表单没有展示的字段会尽量保留。

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
