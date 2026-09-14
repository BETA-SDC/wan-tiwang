# Contributing

Wan Ti Wang is optimized for fun trivia, not formal testing. Contributions should feel playful, clear, and easy to answer in a casual setting.

万题王面向趣味答题，不是标准化考试。贡献内容应该轻松、清楚、有趣，适合在日常聊天、聚会、直播或小游戏中快速游玩。

## Question Guidelines

- Prefer short prompts with one clear answer.
- Provide both `zh-CN` and `en-US` for every player-facing text field.
- Add a reveal that is interesting even when the player guessed correctly.
- Avoid overly obscure facts unless the mood is intentionally `wild` or `hardcore`.
- Use tags generously for reuse across packs and playlists.
- Do not include copyrighted media unless the license allows reuse.
- Keep source and license information for every media item.

## 中文题目规范

- 题干尽量短，一眼能看懂。
- 每道题必须有中英文两个版本，玩家可见文本都要包含 `zh-CN` 和 `en-US`。
- 答案要明确，避免产生多个合理答案。
- 选择题答案优先使用选项 ID，例如 `["A"]`，不要把中文答案和英文答案重复写两遍。
- `reveal` 不只是解释对错，也应该有一点可读性和趣味。
- 冷门知识可以有，但要用 `mood` 或 `tags` 标清楚。
- 不要把正式考试题原样搬进来，优先改写成轻松的趣味问法。
- 图片、音频、视频要记录来源和许可信息；不清楚授权时先标为 `unknown` 或不要使用。

## Data Workflow

1. Run `npm run new:question` or add question JSONL files under `questions/`.
2. Add media metadata under `media-meta/` when a question references local media.
3. Run `npm run validate`.
4. Run `npm run build:index`.
5. Commit source data and generated indexes together.

## 中文数据流程

1. 运行 `npm run new:question`，或在 `questions/` 下新增、修改 JSONL 题目文件。
2. 如果题目引用本地媒体，在 `media-meta/` 中添加对应媒体元数据。
3. 运行 `npm run validate` 检查格式和引用关系。
4. 运行 `npm run build:index` 重新生成索引。
5. 将题目、媒体元数据和生成的索引一起提交。
