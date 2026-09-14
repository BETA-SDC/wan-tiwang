# Category Guide

Categories describe the main topic of a question. Keep them stable and broad enough that a player can understand them quickly.

分类表示题目的主要内容领域。它应该稳定、直观，不要太碎。细粒度主题交给 `tags` 处理。

Question categories must be at least second-level. Use `science.astronomy`, not `science`.

题目的 `category` 必须至少是二级分类。使用 `science.astronomy`，不要只写 `science`。

Use one second-level or deeper category per question:

```json
"category": "science.astronomy"
```

每道题建议只设置一个二级或更深的分类，例如：

```json
"category": "games.specific-titles"
```

Use tags for cross-cutting reuse:

```json
"tags": ["space", "planet", "surprising"]
```

标签用于跨分类复用。例如一道关于《三国演义》的题，可以主分类放在 `humanities.classics`，同时添加 `history`、`three-kingdoms`、`chinese-literature` 等标签。

Question files should normally follow the category tree:

```text
questions/<primary-category>/<secondary-category>/<topic>.jsonl
```

题目文件建议跟随分类树存放：

```text
questions/<一级分类>/<二级分类>/<具体主题>.jsonl
```
