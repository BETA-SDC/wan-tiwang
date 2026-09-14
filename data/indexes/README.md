# Indexes

Indexes are generated from `data/questions/` and `data/media-meta/`.

索引文件由 `data/questions/` 和 `data/media-meta/` 自动生成，用于快速查找、筛选和随机抽题。

Run:

```bash
npm run build:index
```

Do not edit generated index files by hand.

不要手动修改索引文件。新增或修改题目后，运行 `npm run build:index` 重新生成。

Generated indexes include `by-media.json`, which maps each media ID to the question IDs that reference it.

生成的索引包括 `by-media.json`，用于从媒体 ID 反查引用它的题目 ID。
