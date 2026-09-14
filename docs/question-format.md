# Question Format

Questions are stored as JSON Lines files under `questions/`. Each line is one JSON object.

题目保存在 `questions/` 目录下，采用 JSON Lines 格式。每一行是一道完整题目，方便追加、审阅和 Git diff。

Recommended fields:

```json
{
  "id": "science-astronomy-000001",
  "type": "single_choice",
  "title": "A short card title",
  "prompt": "The playable question text.",
  "options": [
    { "id": "A", "text": "Option A" },
    { "id": "B", "text": "Option B" }
  ],
  "answer": ["A"],
  "reveal": "Shown after the answer is revealed.",
  "fun_fact": "Optional extra context.",
  "category": "science.astronomy",
  "tags": ["space", "surprising"],
  "mood": ["surprising", "easygoing"],
  "occasion": ["daily", "party"],
  "media": [
    { "id": "img-example-001", "role": "question" }
  ],
  "play_time_sec": 20,
  "status": "draft"
}
```

Use `status: "published"` only when the question is ready for random sampling.

字段说明：

- `id`：全局唯一 ID，创建后尽量不要修改。
- `type`：题型，例如 `single_choice`、`image_guess`、`audio_guess`。
- `title`：卡片标题，可以比题干更有趣。
- `prompt`：正式题干，玩家看到的主要问题。
- `options`：选项，选择题类题型使用。
- `answer`：答案数组，方便兼容多选和多空题。
- `reveal`：揭晓答案时展示的解释。
- `fun_fact`：可选的额外趣味补充。
- `category`：主分类，只放一个稳定分类。
- `tags`：灵活标签，用于复用、检索和专题组合。
- `mood`：题目氛围，比如 `funny`、`surprising`、`hardcore`。
- `occasion`：适合场景，比如 `daily`、`party`、`stream`。
- `media`：媒体引用，只写媒体 ID 和角色。
- `play_time_sec`：预估游玩时长。
- `status`：题目状态，`published` 的题目才适合进入随机抽题。

中文内容可以直接写在 `title`、`prompt`、`options.text`、`reveal` 和 `fun_fact` 中。字段名、分类 ID、题型 ID 建议保持英文。
