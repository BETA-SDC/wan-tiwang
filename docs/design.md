# Design

Wan Ti Wang is a content-first trivia bank. The main entities are:

万题王是内容优先的趣味答题题库。它的重点不是测评分数，而是让题目适合被抽取、组合、传播和反复游玩。

- `question`: a playable trivia item.
- `media`: an image, audio clip, video clip, or thumbnail referenced by questions.
- `category`: a stable topic location.
- `tag`: a flexible reuse marker.
- `mood`: the feeling of the question.
- `occasion`: where the question works well.
- `pack`: a reusable game round or themed collection.
- `playlist`: an app-facing feed or recommendation list.

中文说明：

- `question`：一道可以直接游玩的题目。
- `media`：题目引用的图片、音频、视频或缩略图。
- `category`：稳定的主题分类，比如 `science.astronomy`。
- `tag`：灵活标签，用来跨分类复用题目。
- `mood`：题目气质，比如搞笑、反直觉、怀旧、硬核。
- `occasion`：适用场景，比如聚会、每日一题、直播互动。
- `pack`：可复用的题包、专题局或玩法组合。
- `playlist`：面向应用首页、推荐流或运营活动的内容列表。

The repository should remain useful before any database exists. JSONL files are the source of truth, and indexes are generated from them for fast lookup and random sampling.

在接入数据库之前，仓库本身也应该可用。JSONL 文件是题库源数据，索引文件由脚本自动生成，用于快速查询和随机抽取。
