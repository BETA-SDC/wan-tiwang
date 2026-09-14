# Command Guide

Wan Ti Wang uses one friendly entry point for everyday work:

```bash
npm run wtw
```

万题王日常使用统一从一个入口开始：

```bash
npm run wtw
```

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

## Lower-Level Scripts

The original scripts are still available for automation, CI, or advanced use:

```bash
npm run new:question
npm run validate
npm run build:index
npm run sample
npm run stats
```

底层脚本仍然保留，适合自动化、CI 或更细的工程操作。
