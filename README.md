# Wan Ti Wang

Wan Ti Wang is a repository framework for a fun trivia question bank. It is designed for casual quiz games, party rounds, daily challenges, live-stream interaction, and themed knowledge play.

万题王是一个“趣味答题”题库框架，不是严肃考试系统。它适合朋友聚会、每日一题、直播互动、主题挑战、小游戏和轻量知识娱乐。

This repository stores question data, taxonomy definitions, media metadata, packs, playlists, generated indexes, and maintenance scripts. Actual media files are intentionally kept local and ignored by Git for now; questions and media metadata should reference them with relative paths.

本仓库存放题目数据、分类体系、媒体元数据、题包、推荐列表、自动生成索引和维护脚本。媒体文件本体暂时只保存在本地并被 Git 忽略；题目和媒体元数据中统一使用相对路径引用。

## Repository Layout

```text
docs/          Design notes and contribution guides
schema/        JSON Schema files for validation
taxonomy/      Controlled categories, formats, moods, and occasions
questions/     Question data, organized by broad topic
media/         Local media files ignored by Git
media-meta/    Versioned metadata for local media
packs/         Reusable quiz packs and themed rounds
playlists/     Feed-like content lists for apps
indexes/       Generated lookup indexes
scripts/       Validation, indexing, and sampling utilities
templates/     Copyable question draft templates
skills/        AI assistant instructions for this repository
```

```text
docs/          设计说明和贡献指南
schema/        用于校验的 JSON Schema
taxonomy/      分类、题型、氛围、使用场景等受控词表
questions/     按主题整理的题目数据
media/         本地媒体文件，暂时不提交到 Git
media-meta/    媒体元数据，会提交到 Git
packs/         可复用题包和主题局
playlists/     面向应用首页或推荐流的列表
indexes/       自动生成的快速查询索引
scripts/       校验、索引构建和随机抽题脚本
templates/     可复制的题目草稿模板
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

## Quick Start

For everyday work, start here:

```bash
npm run wtw
```

日常操作只需要先记住这个入口：

```bash
npm run wtw
```

The console groups common tasks into content creation, maintenance, play testing, and overview.

控制台会把常用操作分成内容创作、维护发布、试玩检查和总览信息几类。

This repository already includes a small bilingual sample set for trying the workflow.

仓库里已经有少量双语样题，可以先用来测试流程。

See [Command Guide](docs/command-guide.md) for the organized command structure.

命令入口和分级说明见 [Command Guide](docs/command-guide.md)。

For AI-assisted question drafting and review, see [AI-Assisted Authoring](docs/ai-assisted-authoring.md).

AI 辅助生成、翻译、审核和导入流程见 [AI-Assisted Authoring](docs/ai-assisted-authoring.md)。

For long-term readability, tag standards, duplicate checks, and generated media indexes, see [Maintenance Guide](docs/maintenance-guide.md).

长期可读性、标签规范、重复题检测和媒体索引说明见 [Maintenance Guide](docs/maintenance-guide.md)。

For tag naming specifically, see [Tag Guide](docs/tag-guide.md).

标签命名规范见 [Tag Guide](docs/tag-guide.md)。
