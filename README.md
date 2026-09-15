# Wan Ti Wang

Wan Ti Wang is a repository framework for a fun trivia question bank. It is designed for casual quiz games, party rounds, daily challenges, live-stream interaction, and themed knowledge play.

万题王是一个“趣味答题”题库框架，不是严肃考试系统。它适合朋友聚会、每日一题、直播互动、主题挑战、小游戏和轻量知识娱乐。

This repository stores question data, taxonomy definitions, media metadata, generated indexes, and maintenance scripts. Actual media files are intentionally kept local and ignored by Git for now; questions and media metadata should reference them with relative paths.

本仓库存放题目数据、分类体系、媒体元数据、自动生成索引和维护脚本。媒体文件本体暂时只保存在本地并被 Git 忽略；题目和媒体元数据中统一使用相对路径引用。

## AI Question Creation

For AI-assisted question creation, start with [AI One-File Question Brief](docs/ai-one-file-question-brief.md). Give this file to another AI when you want it to draft questions for this repository. It is self-contained and explains the required JSON shape, bilingual rules, categories, answer types, media references, and output format.

AI 辅助出题请优先从 [AI One-File Question Brief](docs/ai-one-file-question-brief.md) 开始。如果要让其他 AI 给本仓库生成题目，先把这份文档给它读。它是自包含说明，已经包含 JSON 结构、中英双语规则、分类、题型、媒体引用和输出格式。

Recommended contribution flow:

1. Ask AI to draft questions using [AI One-File Question Brief](docs/ai-one-file-question-brief.md).
2. Review facts, wording, category, answer, difficulty, tags, and media references.
3. Import or paste reviewed questions through the UI.
4. Run the maintenance check in the UI before submitting changes.

推荐贡献流程：

1. 让 AI 按 [AI One-File Question Brief](docs/ai-one-file-question-brief.md) 生成题目草稿。
2. 人工审核事实、措辞、分类、答案、难度、标签和媒体引用。
3. 通过 UI 导入或粘贴审核后的题目。
4. 提交前在 UI 里运行维护检查。

When asking AI to generate a batch, add a short task message with the topic, category IDs, question count, difficulty mix, mood, occasion, whether media is needed, and any real media file information.

让 AI 批量出题时，补充一段简短任务消息，说明主题、分类 ID、题目数量、难度比例、氛围、使用场景、是否需要媒体，以及真实媒体文件信息。

For deeper authoring details, see [AI-Assisted Authoring](docs/ai-assisted-authoring.md).

更完整的 AI 出题说明见 [AI-Assisted Authoring](docs/ai-assisted-authoring.md)。

## Repository Layout

```text
admin/         Local browser-based management UI
  index.html   Home dashboard
  shared/      Shared app shell, API, i18n, media, and question rendering
  questions/   Question library
  editor/      Question editor
  media/       Media library
  settings/    Taxonomy reference
  maintenance/Repository checks
  slides/      Standalone slide generator page and app
  question/    Standalone single-question preview page and app
data/          Versioned question-bank data and definitions
  questions/   Question JSONL files, organized by topic
  media-meta/  Versioned metadata for local media
  taxonomy/    Controlled categories, formats, moods, and occasions
  indexes/     Generated lookup indexes
  schema/      JSON Schema files for validation
  templates/   Copyable question draft templates
docs/          Design notes and contribution guides
media/         Local media files ignored by Git
scripts/       Validation, indexing, sampling, UI server, and export utilities
  slides/      Standalone HTML deck generation
skills/        AI assistant instructions for this repository
```

```text
admin/         本地浏览器管理界面
  index.html   首页任务总览
  shared/      共享应用壳层、API、中英文、媒体和题目渲染逻辑
  questions/   题库浏览和筛选
  editor/      题目编辑器
  media/       媒体库
  settings/    分类和受控词表
  maintenance/仓库检查
  slides/      独立题目可视化生成器页面和逻辑
  question/    独立单题预览页面和逻辑
data/          进入 Git 的题库数据和定义
  questions/   按主题整理的题目 JSONL 文件
  media-meta/  媒体元数据，会提交到 Git
  taxonomy/    分类、题型、氛围、使用场景等受控词表
  indexes/     自动生成的快速查询索引
  schema/      用于校验的 JSON Schema
  templates/   可复制的题目草稿模板
docs/          设计说明和贡献指南
media/         本地媒体文件，暂时不提交到 Git
scripts/       校验、索引、随机抽题、UI 服务和导出脚本
  slides/      独立 HTML 演示文件生成逻辑
skills/        面向 AI 助手的仓库操作说明
```

## Design Principles

- Keep questions fun, lightweight, and replayable.
- Provide Chinese and English versions for every question.
- Use categories for stable topic placement.
- Use tags, moods, and occasions for flexible reuse.
- Store media metadata in Git, but keep large media files local or in external storage.
- Reference media with stable `media_id` values and relative paths.
- Generate indexes from source data instead of editing them by hand.

## 中文设计原则

- 题目优先追求好玩、轻量、可重复游玩。
- 每道题都必须有中文和英文两个版本。
- 分类用于稳定地放置主题，标签用于跨主题复用。
- 用 `mood` 表示题目的氛围，比如搞笑、反直觉、硬核。
- 用 `occasion` 表示适合的场景，比如每日一题、聚会、直播。
- 媒体文件本体可以先只存在本地，仓库只记录媒体元数据。
- 题目引用媒体时使用稳定的 `media_id`，不要直接依赖物理路径。
- 索引文件由脚本生成，不建议手动编辑。

## First-Time Setup

Install Node.js before using the visual tools. Node.js includes npm, which this project uses to start the local management UI.

使用可视化工具前，先安装 Node.js。Node.js 会自带 npm，本项目用 npm 启动本地管理界面。

Recommended beginner path:

1. Open [nodejs.org](https://nodejs.org/).
2. Download the LTS version for your system.
3. Install it with the default options.
4. Close and reopen Terminal on macOS, or PowerShell / Command Prompt on Windows.
5. Check that both commands print version numbers:

```bash
node --version
npm --version
```

新手推荐步骤：

1. 打开 [nodejs.org](https://nodejs.org/)。
2. 下载适合自己系统的 LTS 版本。
3. 按默认选项安装。
4. macOS 关闭并重新打开 Terminal；Windows 关闭并重新打开 PowerShell 或命令提示符。
5. 确认下面两个命令都能输出版本号：

```bash
node --version
npm --version
```

This project requires Node.js 18 or newer.

本项目需要 Node.js 18 或更新版本。

## Start the UI

Start the local visual management UI:

```bash
npm run ui
```

启动本地可视化管理界面：

```bash
npm run ui
```

Open the local URL printed in the terminal, usually `http://127.0.0.1:5177/`. Keep the terminal running while using the UI, and stop it with `Ctrl+C`.

打开终端输出的本地地址，通常是 `http://127.0.0.1:5177/`。使用 UI 时保持终端运行，需要停止时按 `Ctrl+C`。

The UI includes a question library, form editor, optional media upload/linking, slide export, answer feedback import, repository checks, and raw JSON editing for advanced cases.

管理界面提供题库浏览、表单录入、可选媒体上传/关联、演示导出、作答反馈导入、仓库检查，以及高级场景下的原始 JSON 编辑。

## Local API

The visual UI runs on a local HTTP server. The API is meant for the admin UI, AI agents, and small local scripts. It reads and writes repository files directly, so review changes before committing.

可视化界面运行在本地 HTTP 服务上。API 面向管理 UI、AI agent 和本地小脚本，会直接读写仓库文件，所以提交前需要审核变更。

Default base URL:

```text
http://127.0.0.1:5177
```

默认基础地址：

```text
http://127.0.0.1:5177
```

Main endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/bootstrap` | Load taxonomy, formats, moods, occasions, difficulties, and stats for the UI. |
| `GET` | `/api/questions` | List questions. Supports filters listed below. |
| `GET` | `/api/questions/:id` | Load one question by ID. |
| `POST` | `/api/questions` | Create one question. If `id` is omitted, the server generates the next ID from `category`. |
| `PUT` | `/api/questions/:id` | Replace one existing question record. |
| `GET` | `/api/media` | List media metadata. |
| `POST` | `/api/media` | Upload/register one local media item from a browser data URL. |
| `POST` | `/api/slides/export` | Export a folder deck under `exports/slides/`. |
| `POST` | `/api/feedback/import` | Import answer feedback JSON from exported decks. |
| `POST` | `/api/check` | Run validation, tag lint, duplicate check, and index rebuild. |

`GET /api/questions` query parameters:

| Parameter | Meaning |
| --- | --- |
| `q` | Full-text search over ID, category, type, title, prompt, reveal, and tags. |
| `category` | Exact category ID, such as `science.physics`. |
| `categoryPrefix` | Parent or subtree category filter, such as `science`. |
| `type` | Answer type, such as `single_choice` or `multiple_choice`. |
| `difficulty` | `easy`, `medium`, or `hard`. |
| `status` | `draft`, `review`, `published`, or `deprecated`. |
| `tag` | Exact tag ID. |
| `limit` | Maximum returned questions. Defaults to `500`. |

Example API calls:

```bash
curl "http://127.0.0.1:5177/api/questions?categoryPrefix=science&difficulty=hard&limit=20"
curl "http://127.0.0.1:5177/api/questions/science-physics-000020"
curl -X POST "http://127.0.0.1:5177/api/check"
```

常用 API 示例：

```bash
curl "http://127.0.0.1:5177/api/questions?categoryPrefix=science&difficulty=hard&limit=20"
curl "http://127.0.0.1:5177/api/questions/science-physics-000020"
curl -X POST "http://127.0.0.1:5177/api/check"
```

Question creation accepts the same JSON shape described in [Question Format](docs/question-format.md). For AI-generated batches, prefer reviewing them in the UI or importing them with the documented authoring workflow instead of sending unreviewed AI output straight to the API.

新建题目使用 [Question Format](docs/question-format.md) 中说明的 JSON 结构。对于 AI 批量生成的题目，建议先在 UI 中审核，或按文档中的出题流程导入，不要把未经审核的 AI 输出直接写入 API。

For long-term readability, tag standards, duplicate checks, and generated media indexes, see [Maintenance Guide](docs/maintenance-guide.md).

长期可读性、标签规范、重复题检测和媒体索引说明见 [Maintenance Guide](docs/maintenance-guide.md)。

For tag naming specifically, see [Tag Guide](docs/tag-guide.md).

标签命名规范见 [Tag Guide](docs/tag-guide.md)。

For the visual management interface, see [Admin UI Guide](docs/ui-guide.md).

可视化管理界面说明见 [Admin UI Guide](docs/ui-guide.md)。

For the separate slide-style question generator and standalone HTML export, see [Slide Generator Guide](docs/slide-generator-guide.md).

独立题目可视化生成器和 HTML 演示文件导出说明见 [Slide Generator Guide](docs/slide-generator-guide.md)。

For the current implementation status and planned improvements, see [Project Status](docs/project-status.md).

当前实现状态和后续改进方向见 [Project Status](docs/project-status.md)。

For versioned data layout, see [Data Directory](data/README.md).

题库数据目录说明见 [Data Directory](data/README.md)。
