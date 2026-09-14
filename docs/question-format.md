# Question Format

Questions are stored as JSON Lines files under `questions/`. Each line is one JSON object.

题目保存在 `questions/` 目录下，采用 JSON Lines 格式。每一行是一道完整题目，方便追加、审阅和 Git diff。

Use `npm run new:question` for most new entries. It generates the bilingual structure, question ID, and target JSONL line automatically.

大多数新增题目建议使用 `npm run new:question`。脚本会自动生成双语结构、题目 ID 和目标 JSONL 行。

Every question must provide both Chinese and English text for player-facing fields.

每道题都必须提供中文和英文版本。玩家可见文本统一使用 `{ "zh-CN": "...", "en-US": "..." }`。

Recommended fields:

```json
{
  "id": "science-astronomy-000001",
  "type": "single_choice",
  "title": {
    "zh-CN": "一个简短的卡片标题",
    "en-US": "A short card title"
  },
  "prompt": {
    "zh-CN": "玩家看到的题干。",
    "en-US": "The playable question text."
  },
  "options": [
    {
      "id": "A",
      "text": {
        "zh-CN": "选项 A",
        "en-US": "Option A"
      }
    },
    {
      "id": "B",
      "text": {
        "zh-CN": "选项 B",
        "en-US": "Option B"
      }
    }
  ],
  "answer": ["A"],
  "reveal": {
    "zh-CN": "答案揭晓后展示的说明。",
    "en-US": "Shown after the answer is revealed."
  },
  "fun_fact": {
    "zh-CN": "可选的额外趣味补充。",
    "en-US": "Optional extra context."
  },
  "category": "science.astronomy",
  "tags": ["space", "surprising"],
  "mood": ["surprising", "easygoing"],
  "occasion": ["daily", "party"],
  "media": [
    {
      "id": "img-example-001",
      "role": "question",
      "kind": "image",
      "hint": {
        "zh-CN": "示例图片",
        "en-US": "example image"
      }
    }
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
- `answer`：答案数组，方便兼容多选和多空题。选择题建议存选项 ID，比如 `["A"]`，避免中英文答案重复。
- `reveal`：揭晓答案时展示的解释。
- `fun_fact`：可选的额外趣味补充。
- `category`：题目分类，只放一个稳定分类；必须至少二级，例如 `science.astronomy`，不要只写 `science`。
- `tags`：灵活标签，用于复用、检索和专题组合。
- `mood`：题目氛围，比如 `funny`、`surprising`、`hardcore`。
- `occasion`：适合场景，比如 `daily`、`party`、`stream`。
- `media`：媒体引用，至少写媒体 ID 和角色；推荐补充 `kind` 和双语 `hint`，方便搜索和维护。
- `play_time_sec`：预估游玩时长。
- `status`：题目状态，`published` 的题目才适合进入随机抽题。

`title`、`prompt`、`options.text`、`reveal` 和 `fun_fact` 需要同时提供 `zh-CN` 和 `en-US`。字段名、分类 ID、题型 ID、标签 ID 建议保持英文。
