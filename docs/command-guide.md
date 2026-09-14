# Command Guide

Wan Ti Wang uses one friendly entry point for everyday work:

```bash
npm run wtw
```

万题王日常使用统一从一个入口开始：

```bash
npm run wtw
```

For a visual local interface, use:

```bash
npm run ui
```

如果想用可视化本地界面，运行：

```bash
npm run ui
```

The UI includes a form editor for common question fields and a JSON editor for advanced edits.

UI 内置表单编辑器处理常见题目字段，也保留 JSON 编辑器处理高级修改。

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
- checking that question media references exist in `media-meta/`
- checking that media paths are relative
- checking tag naming and duplicate tags inside one question
- reporting exact and near-duplicate question candidates
- rebuilding generated indexes under `indexes/`

它会处理：

- 校验 JSONL 语法
- 检查题目 ID 是否重复
- 检查分类、题型、氛围、场景是否合法
- 检查玩家可见文本是否包含 `zh-CN` 和 `en-US`
- 检查题目引用的媒体 ID 是否已登记在 `media-meta/`
- 检查媒体路径是否为相对路径
- 检查标签命名，以及同一道题里的重复标签
- 报告精确重复和相似题候选
- 重新生成 `indexes/` 下的索引

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
