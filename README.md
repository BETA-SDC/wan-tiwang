# Wan Ti Wang

Wan Ti Wang is a repository framework for a fun trivia question bank. It is designed for casual quiz games, party rounds, daily challenges, live-stream interaction, and themed knowledge play.

万题王是一个“趣味答题”题库框架，不是严肃考试系统。它适合朋友聚会、每日一题、直播互动、主题挑战、小游戏和轻量知识娱乐。

This repository stores question data, taxonomy definitions, media metadata, generated indexes, and maintenance scripts. Actual media files are intentionally kept local and ignored by Git for now; questions and media metadata should reference them with relative paths.

本仓库存放题目数据、分类体系、媒体元数据、自动生成索引和维护脚本。媒体文件本体暂时只保存在本地并被 Git 忽略；题目和媒体元数据中统一使用相对路径引用。

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

If this is the first time using the project on a computer, install Node.js first. Node.js normally includes npm, so installing Node.js is enough for both `node` and `npm` commands.

第一次在一台电脑上使用本项目时，先安装 Node.js。通常 Node.js 会自带 npm，所以装好 Node.js 后就同时有 `node` 和 `npm` 命令。

Recommended beginner path:

1. Open [nodejs.org](https://nodejs.org/).
2. Download the LTS version for your system.
3. Install it with the default options.
4. Close and reopen Terminal on macOS, or PowerShell / Command Prompt on Windows.
5. Check the installation:

```bash
node --version
npm --version
```

新手推荐步骤：

1. 打开 [nodejs.org](https://nodejs.org/)。
2. 下载适合自己系统的 LTS 版本。
3. 按默认选项安装。
4. macOS 关闭并重新打开 Terminal；Windows 关闭并重新打开 PowerShell 或命令提示符。
5. 检查是否安装成功：

```bash
node --version
npm --version
```

If both commands print version numbers, setup is ready. This project requires Node.js 18 or newer.

如果两个命令都能输出版本号，就可以继续使用。本项目需要 Node.js 18 或更新版本。

If `node` works but `npm` does not, you can still start the UI with direct Node commands shown below.

如果 `node` 可用但 `npm` 不可用，也可以使用下面的直接 Node 命令启动 UI。

## Quick Start

Most commands are the same on macOS and Windows. The main difference is how to set an environment variable such as `PORT`.

大多数命令在 macOS 和 Windows 上一样。主要差异是设置环境变量，例如 `PORT`。

For everyday visual work, start the local UI:

```bash
npm run ui
```

If npm is not available, start the same UI server directly:

```bash
node scripts/server.mjs
```

Open the local URL printed in the terminal, usually `http://127.0.0.1:5177`. Keep the terminal running while using the UI, and stop it with `Ctrl+C`.

If port `5177` is already occupied, choose another port:

macOS / Linux:

```bash
PORT=5180 npm run ui
PORT=5180 node scripts/server.mjs
```

Windows PowerShell:

```powershell
$env:PORT=5180; npm run ui
$env:PORT=5180; node scripts/server.mjs
```

Windows Command Prompt:

```bat
set PORT=5180 && npm run ui
set PORT=5180 && node scripts\server.mjs
```

日常可视化操作，先启动本地 UI：

```bash
npm run ui
```

如果没有 npm，也可以直接启动同一个 UI 服务：

```bash
node scripts/server.mjs
```

然后打开终端输出的本地地址，通常是 `http://127.0.0.1:5177`。使用 UI 时保持终端运行，需要停止时按 `Ctrl+C`。

如果 `5177` 端口被占用，可以换端口：

macOS / Linux:

```bash
PORT=5180 npm run ui
PORT=5180 node scripts/server.mjs
```

Windows PowerShell:

```powershell
$env:PORT=5180; npm run ui
$env:PORT=5180; node scripts/server.mjs
```

Windows 命令提示符：

```bat
set PORT=5180 && npm run ui
set PORT=5180 && node scripts\server.mjs
```

### If You See `Not found`

如果浏览器只显示 `Not found`：

- Make sure you opened the URL printed by the server, such as `http://127.0.0.1:5177/`.
- Do not open a random file path in the browser; start the local server first.
- Make sure the command is running inside the Wan Ti Wang repository folder.
- If you are on Windows, pull the latest version of this repository. Older versions had a Windows path bug that could make the server unable to find `admin/index.html`.

检查：

- 确认打开的是服务输出的地址，例如 `http://127.0.0.1:5177/`。
- 不要直接在浏览器打开某个文件路径；要先启动本地服务。
- 确认命令是在 Wan Ti Wang 仓库目录里运行的。
- Windows 用户请先更新到最新版仓库。旧版本存在 Windows 路径兼容问题，可能导致服务找不到 `admin/index.html`。

The UI includes a form editor for common question creation, optional local media upload/linking, slide export, feedback import, and raw JSON editing for advanced cases.

管理界面提供常见题目的表单录入、可选本地媒体上传/关联、演示导出、反馈导入，也保留原始 JSON 编辑用于高级场景。

For everyday CLI work, start here:

```bash
npm run wtw
```

日常 CLI 操作可以使用：

```bash
npm run wtw
```

The console groups common tasks into content creation, maintenance, play testing, and overview.

控制台会把常用操作分成内容创作、维护发布、试玩检查和总览信息几类。

This repository already includes a small bilingual sample set for trying the workflow.

仓库里已经有少量双语样题，可以先用来测试流程。

See [Operations Guide](docs/operations-guide.md) for the step-by-step UI-first workflow.

分级操作手册见 [Operations Guide](docs/operations-guide.md)。

See [Command Guide](docs/command-guide.md) for the organized command structure.

命令入口和分级说明见 [Command Guide](docs/command-guide.md)。

For AI-assisted question drafting and review, see [AI-Assisted Authoring](docs/ai-assisted-authoring.md).

AI 辅助生成、翻译、审核和导入流程见 [AI-Assisted Authoring](docs/ai-assisted-authoring.md)。

If you need to give another AI only one self-contained instruction file, use [AI One-File Question Brief](docs/ai-one-file-question-brief.md).

如果要给其他 AI 只读一份自包含说明，请使用 [AI One-File Question Brief](docs/ai-one-file-question-brief.md)。

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
