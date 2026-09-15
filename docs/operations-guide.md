# Operations Guide

This guide is the user-facing operating manual for Wan Ti Wang. It starts with the simplest UI workflow, then moves into maintenance and AI/CLI workflows.

这份文档是万题王的日常操作手册。先从最简单的可视化界面开始，再逐步说明维护、导出、反馈导入和 AI/CLI 操作。

## Level 0: Requirements

Wan Ti Wang is a local repository app. It does not need a database server and currently has no third-party npm dependencies.

万题王是本地仓库应用，不需要数据库服务；当前也没有第三方 npm 依赖。

You need:

- Node.js 18 or newer.
- A browser.
- This repository folder.

需要：

- Node.js 18 或更新版本。
- 一个浏览器。
- 本仓库文件夹。

Check Node:

```bash
node --version
```

If this command is missing, install Node.js first. Installing Node.js normally also installs `npm`, but this project can still be started directly with `node`.

如果没有 `node` 命令，需要先安装 Node.js。通常安装 Node.js 会同时安装 `npm`，但本项目也可以直接用 `node` 启动。

## Level 1: Start the UI

Recommended command:

```bash
npm run ui
```

推荐启动方式：

```bash
npm run ui
```

If the user does not have npm available, or does not want to use npm scripts, run the server directly:

```bash
node scripts/server.mjs
```

如果用户没有 npm，或者不想使用 npm 脚本，可以直接启动服务：

```bash
node scripts/server.mjs
```

The terminal prints a local URL, usually:

```text
http://127.0.0.1:5177
```

Open that URL in a browser. Keep the terminal window open while using the UI. Stop the server with `Ctrl+C`.

终端会输出一个本地地址，通常是 `http://127.0.0.1:5177`。在浏览器打开它。使用 UI 时不要关闭终端；需要停止服务时按 `Ctrl+C`。

If port `5177` is already occupied:

```bash
PORT=5180 node scripts/server.mjs
```

如果 `5177` 端口被占用，可以换端口：

```bash
PORT=5180 node scripts/server.mjs
```

The npm equivalent is:

```bash
PORT=5180 npm run ui
```

对应的 npm 启动方式是：

```bash
PORT=5180 npm run ui
```

## Level 2: Use the UI for Daily Work

Use the left navigation:

- `Home`: start from common tasks.
- `Question Library`: search, filter, preview, edit, and select questions.
- `Question Editor`: create or edit questions.
- `Slide Generator`: assemble and export one-question-per-slide decks.
- `Media Library`: inspect registered media metadata.
- `Settings`: check categories, answer types, moods, and occasions.
- `Maintenance`: run checks and import answer feedback.

左侧导航的分工：

- `Home`：常用任务入口。
- `Question Library`：搜索、筛选、预览、编辑、选择题目。
- `Question Editor`：新建或编辑题目。
- `Slide Generator`：组装并导出一题一页的演示。
- `Media Library`：查看媒体元数据。
- `Settings`：查看分类、题型、氛围、场景词表。
- `Maintenance`：运行检查，导入答题反馈。

## Level 3: Create or Edit Questions

For most users, use `Question Editor`.

多数用户建议从 `Question Editor` 开始。

Basic flow:

1. Open `Question Editor`.
2. Choose `Form` mode for normal questions.
3. Fill bilingual `zh-CN` and `en-US` fields.
4. Choose category, answer type, difficulty, tags, moods, and occasions.
5. Add options and answers when the question is choice-based.
6. Add media only if needed.
7. Click `Save`.
8. Go to `Maintenance` and click `Run Check`.

基本流程：

1. 打开 `Question Editor`。
2. 普通题目使用 `Form` 模式。
3. 填写 `zh-CN` 和 `en-US` 双语内容。
4. 选择分类、题型、难度、标签、氛围和场景。
5. 选择题需要填写选项和答案。
6. 需要图片、音频、视频时再添加媒体。
7. 点击 `Save`。
8. 去 `Maintenance` 点击 `Run Check`。

Use `JSON` mode only for advanced fields or question shapes that the form does not expose yet.

只有在表单暂未覆盖的高级字段或特殊题型结构中，才建议使用 `JSON` 模式。

## Level 4: Work With Media

Media files are local and ignored by Git. Media metadata is versioned in Git.

媒体文件本体保存在本地并被 Git 忽略；媒体元数据会进入 Git。

When uploading or linking media in the editor:

- The actual file is placed under `media/`.
- Metadata is appended under `data/media-meta/`.
- Questions reference media by media `id`, not by hard-coded absolute paths.
- All paths stored in metadata are relative paths.

在编辑器上传或关联媒体时：

- 文件本体放在 `media/`。
- 元数据写入 `data/media-meta/`。
- 题目通过媒体 `id` 引用媒体，不写绝对路径。
- 元数据中的路径必须是相对路径。

For media-backed questions, keep a short bilingual `hint` on the question reference so the question remains searchable even without opening the media file.

媒体题建议在题目的媒体引用里保留简短双语 `hint`，这样不打开媒体文件也能搜索和理解题目。

## Level 5: Generate and Export Slides

Open `Slide Generator`.

打开 `Slide Generator`。

Common flow:

1. Choose the question source:
   - `Search results`: use the current generator search.
   - `Selected from Library`: use selected questions from `Question Library`.
   - `All questions`: use the whole bank.
2. Set count, language, and reveal mode.
3. Click `Build Preview` or `Shuffle Preview`.
4. Use `Previous`, `Next`, and `Show Reveal` to preview.
5. Click `Export Folder`.
6. Use `Open Deck` or `Open in New Tab`.

常用流程：

1. 选择题目来源：
   - `Search results`：使用生成器当前搜索结果。
   - `Selected from Library`：使用题库页中选中的题目。
   - `All questions`：使用全题库。
2. 设置数量、语言和答案显示方式。
3. 点击 `Build Preview` 或 `Shuffle Preview`。
4. 用 `Previous`、`Next`、`Show Reveal` 预览。
5. 点击 `Export Folder`。
6. 使用 `Open Deck` 或 `Open in New Tab` 打开演示。

Exports are written under:

```text
exports/slides/<deck-name>/
```

导出文件夹会写入：

```text
exports/slides/<deck-name>/
```

The exported deck is a folder containing HTML, CSS, JavaScript, question data, media metadata, and copied local media used by that deck.

导出的演示是一个文件夹，里面包含 HTML、CSS、JavaScript、题目数据、媒体元数据，以及本次演示用到的本地媒体副本。

## Level 6: Collect and Import Answer Feedback

Exported slide decks can record local answer feedback for choice questions.

导出的演示可以记录选择题的本地作答反馈。

Feedback collection flow:

1. Open the exported deck.
2. Players click options.
3. Players click `Confirm Answer`.
4. Click `Download Feedback`.
5. A `*-answer-feedback.json` file is downloaded.

反馈收集流程：

1. 打开导出的演示。
2. 玩家点击选项。
3. 玩家点击 `Confirm Answer`。
4. 点击 `Download Feedback`。
5. 浏览器会下载一个 `*-answer-feedback.json` 文件。

Import flow:

1. Return to the admin UI.
2. Open `Maintenance`.
3. In `Answer Feedback Import`, choose the downloaded JSON file.
4. Click `Import Feedback`.
5. Review the result output.
6. Click `Run Check`.

导入流程：

1. 回到管理 UI。
2. 打开 `Maintenance`。
3. 在 `Answer Feedback Import` 里选择下载的 JSON 文件。
4. 点击 `Import Feedback`。
5. 查看导入结果。
6. 点击 `Run Check`。

Importing feedback adds counts to each question:

```json
"feedback": {
  "answered_count": 12,
  "correct_count": 7
}
```

导入后会把计数累加到题目：

```json
"feedback": {
  "answered_count": 12,
  "correct_count": 7
}
```

Feedback is only a reference for future difficulty tuning. It does not automatically change `difficulty`.

反馈只是未来调整难度的参考，不会自动修改 `difficulty`。

## Level 7: Maintenance Checks

After changing questions, taxonomy, media metadata, scripts, or imported feedback, run:

```bash
npm run wtw -- check
```

or, without npm:

```bash
node scripts/validate.mjs
node scripts/lint-tags.mjs
node scripts/dedupe.mjs
node scripts/build-index.mjs
```

修改题目、分类、媒体元数据、脚本，或导入反馈后，运行：

```bash
npm run wtw -- check
```

没有 npm 时，可以按顺序运行：

```bash
node scripts/validate.mjs
node scripts/lint-tags.mjs
node scripts/dedupe.mjs
node scripts/build-index.mjs
```

The UI `Maintenance` page runs the same check pipeline through the local server.

UI 的 `Maintenance` 页面也会通过本地服务运行同一套检查流程。

## Level 8: CLI and AI Workflows

The CLI is still useful for AI agents and advanced users.

CLI 仍然适合 AI 助手和高级用户。

Common npm commands:

```bash
npm run wtw
npm run wtw -- check
npm run wtw -- sample
npm run wtw -- stats
```

常用 npm 命令：

```bash
npm run wtw
npm run wtw -- check
npm run wtw -- sample
npm run wtw -- stats
```

Direct Node alternatives:

```bash
node scripts/wtw.mjs
node scripts/validate.mjs
node scripts/lint-tags.mjs
node scripts/dedupe.mjs
node scripts/build-index.mjs
node scripts/sample.mjs
node scripts/stats.mjs
```

对应的直接 Node 方式：

```bash
node scripts/wtw.mjs
node scripts/validate.mjs
node scripts/lint-tags.mjs
node scripts/dedupe.mjs
node scripts/build-index.mjs
node scripts/sample.mjs
node scripts/stats.mjs
```

For AI-assisted question drafting, use [AI-Assisted Authoring](ai-assisted-authoring.md). For detailed command explanations, use [Command Guide](command-guide.md).

AI 辅助出题见 [AI-Assisted Authoring](ai-assisted-authoring.md)。更细的命令说明见 [Command Guide](command-guide.md)。
