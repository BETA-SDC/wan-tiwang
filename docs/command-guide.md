# Command Guide

Wan Ti Wang uses one friendly entry point for everyday work:

```bash
npm run wtw
```

万题王日常使用统一从一个入口开始：

```bash
npm run wtw
```

For most human users, start with the visual local interface:

```bash
npm run ui
```

多数人工操作建议先用可视化本地界面：

```bash
npm run ui
```

If npm is not available, run the same UI server directly:

```bash
node scripts/server.mjs
```

如果没有 npm，可以直接启动同一个 UI 服务：

```bash
node scripts/server.mjs
```

Open the printed local URL, usually `http://127.0.0.1:5177`.

打开终端输出的本地地址，通常是 `http://127.0.0.1:5177`。

The UI includes a form editor for common question fields and a JSON editor for advanced edits.

UI 内置表单编辑器处理常见题目字段，也保留 JSON 编辑器处理高级修改。

For a UI-first, step-by-step operating manual, see [Operations Guide](operations-guide.md).

如果需要从启动 UI 到导出、导入反馈的完整分级手册，见 [Operations Guide](operations-guide.md)。

## Menu Levels

The console groups tasks by how people actually work:

- content creation: add questions or import JSON drafts
- maintenance: validate data and rebuild indexes
- play testing: sample questions
- overview: show stats and help

控制台按实际工作方式分层：

- 内容创作：新增题目、导入 JSON 草稿
- 维护发布：校验数据、重建索引
- 试玩检查：随机抽题
- 总览信息：查看统计和帮助

## Direct Commands

For faster use, commands can be called directly:

```bash
npm run wtw -- new
npm run wtw -- import
npm run wtw -- check
npm run wtw -- sample
npm run wtw -- stats
npm run wtw -- help
```

也可以直接调用子命令，适合熟悉流程之后快速操作。

## Import Question Drafts

The convenient CLI entry for reviewed JSON drafts is:

```bash
npm run import:questions -- draft-batch.json --dry-run
npm run import:questions -- draft-batch.json --yes --check
```

这是一条更清晰的命令行导入入口：

```bash
npm run import:questions -- draft-batch.json --dry-run
npm run import:questions -- draft-batch.json --yes --check
```

Use `--dry-run` to validate the draft, generate IDs, and show target files without writing data. Use `--yes --check` after human review to import and then run validation, tag lint, duplicate detection, and index rebuild.

`--dry-run` 只检查草稿、生成 ID、显示目标文件，不写入题库。人工审核后使用 `--yes --check`，会正式导入并自动运行校验、标签检查、重复题检查和索引重建。

The same command is also available through the main entry:

```bash
npm run wtw -- import draft-batch.json --dry-run
npm run wtw -- import draft-batch.json --yes --check
```

It accepts one JSON object, a JSON array, or the same batch shape used by the authoring docs. If you need to force a target file:

```bash
npm run import:questions -- draft-batch.json --target data/questions/science/physics/mixed.jsonl --yes --check
```

也可以通过主入口使用同样功能。它支持单个 JSON 对象或 JSON 数组。如果需要强制写入某个目标文件，可以加 `--target`。

## Check Command

Use this after adding or editing questions or media metadata:

新增或修改题目、媒体元数据后，运行：

```bash
npm run wtw -- check
```

It runs:

它会依次运行：

```bash
node scripts/validate.mjs
node scripts/lint-tags.mjs
node scripts/dedupe.mjs
node scripts/build-index.mjs
```

It handles:

- validating JSONL syntax
- checking duplicate question IDs
- checking known categories, question types, moods, and occasions
- checking bilingual `zh-CN` and `en-US` player-facing fields
- checking that question media references exist in `data/media-meta/`
- checking that media paths are relative
- checking tag naming and duplicate tags inside one question
- reporting exact and near-duplicate question candidates
- rebuilding generated indexes under `data/indexes/`

它会处理：

- 校验 JSONL 语法
- 检查题目 ID 是否重复
- 检查分类、题型、氛围、场景是否合法
- 检查玩家可见文本是否包含 `zh-CN` 和 `en-US`
- 检查题目引用的媒体 ID 是否已登记在 `data/media-meta/`
- 检查媒体路径是否为相对路径
- 检查标签命名，以及同一道题里的重复标签
- 报告精确重复和相似题候选
- 重新生成 `data/indexes/` 下的索引

It does not handle:

- automatic translation
- fact checking
- Git commit or push
- media compression
- verifying that ignored local media files exist on disk

它不会处理：

- 自动翻译
- 事实核查
- Git 提交或推送
- 媒体压缩
- 检查被 Git 忽略的本地媒体文件是否真实存在

## Lower-Level Scripts

The original scripts are still available for automation, CI, or advanced use:

```bash
npm run new:question
npm run validate
npm run lint:tags
npm run dedupe
npm run build:index
npm run sample
npm run stats
```

底层脚本仍然保留，适合自动化、CI 或更细的工程操作。

Without npm, call the Node scripts directly:

```bash
node scripts/server.mjs
node scripts/wtw.mjs
node scripts/validate.mjs
node scripts/lint-tags.mjs
node scripts/dedupe.mjs
node scripts/build-index.mjs
node scripts/sample.mjs
node scripts/stats.mjs
```

没有 npm 时，可以直接调用 Node 脚本。
