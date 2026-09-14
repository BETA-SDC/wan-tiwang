# Questions

Question files use JSON Lines format. Each line is one question object.

题目文件使用 JSON Lines 格式，每一行是一道题。这样便于批量追加、代码校验和 Git 审阅。

Questions should normally live under a second-level category directory:

```text
questions/<primary-category>/<secondary-category>/<topic>.jsonl
```

Examples:

```text
questions/science/astronomy/solar-system.jsonl
questions/history/ancient-china/qin-han.jsonl
questions/games/specific-titles/minecraft.jsonl
questions/language/wordplay/puns.jsonl
```

Keep files small enough for comfortable review. When a file grows too large, split it by narrower topic, series, era, or gameplay format.

中文约定：

- 默认放到二级分类目录下。
- 文件名用英文小写和连字符。
- 文件内题目可以是中文内容。
- 一个文件不要太大，后续可以按具体主题、作品、时代、玩法继续拆分。
