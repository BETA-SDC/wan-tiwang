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
- `Editor`: create a new draft or edit an existing question JSON object.
- `Media`: inspect media metadata.
- `Check`: run the same maintenance checks used by the CLI.

中文说明：

- `Browse`：搜索和筛选题目。
- `Editor`：新建草稿或编辑已有题目 JSON 对象。
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
