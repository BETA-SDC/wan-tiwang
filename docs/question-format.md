# Question Format

Questions are stored as JSON Lines files under `data/questions/`. Each line is one JSON object.

题目保存在 `data/questions/` 目录下，采用 JSON Lines 格式。每一行是一道完整题目，方便追加、审阅和 Git diff。

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
  "difficulty": "medium",
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
  "feedback": {
    "answered_count": 12,
    "correct_count": 8
  },
  "status": "draft"
}
```

Use `status: "published"` only when the question is ready for random sampling.

字段说明：

- `id`：全局唯一 ID，创建后尽量不要修改。
- `type`：答题交互类型，例如 `single_choice`、`multiple_choice`、`true_false`、`fill_blank`、`numeric`、`short_answer`、`ordering`、`matching`、`hotspot`。图片题、听音频猜题、视频题不要作为 type，而是通过 `media` 引用和 `tags` 表达。
- `title`：卡片标题，可以比题干更有趣。
- `prompt`：正式题干，玩家看到的主要问题。
- `options`：选项，选择题类题型使用。
- `answer`：答案数组，方便兼容多选和多空题。选择题建议存选项 ID，比如 `["A"]`，避免中英文答案重复。
- `answer_rules`：可选答案判定规则，主要用于文本和数值题，例如大小写、别名、数值容差和单位。
- `reveal`：揭晓答案时展示的解释。
- `fun_fact`：可选的额外趣味补充。
- `category`：题目分类，只放一个稳定分类；支持 `science.astronomy` 这样的点分层级，管理界面会按层级筛选。
- `difficulty`：可选但推荐，用于区分难度；当前稳定值为 `easy`、`medium`、`hard`。
- `tags`：灵活标签，用于复用、检索和专题组合。
- `mood`：题目氛围，比如 `funny`、`surprising`、`hardcore`。
- `occasion`：适合场景，比如 `daily`、`party`、`stream`。
- `media`：媒体引用，至少写媒体 ID 和角色；推荐补充 `kind` 和双语 `hint`，方便搜索和维护。
- `options[].media`：当选项本身是图片、音频或视频时，把媒体引用放在对应选项内，而不是放在题干 `media` 里。
- `pairs`：配对题使用，包含 `left` 和 `right` 两组可配对项目。
- `hotspots`：热点题使用，描述图片上的可选区域，坐标统一使用 0 到 1 的相对比例。
- `play_time_sec`：预估游玩时长。
- `feedback`：可选作答反馈统计，只记录被导出演示收集到的回答次数和答对次数；它是难度训练参考，不会自动代表或覆盖 `difficulty`。
- `status`：题目状态，`published` 的题目才适合进入随机抽题。

`title`、`prompt`、`options.text`、`reveal` 和 `fun_fact` 需要同时提供 `zh-CN` 和 `en-US`。字段名、分类 ID、题型 ID、标签 ID 建议保持英文。

## Answer Types

Use `type` only for how the player answers. Use tags for play style such as `image-guess`, `listen-and-guess`, `speed-round`, or `meme`.

`type` 只表达玩家如何作答；`image-guess`、`listen-and-guess`、`speed-round`、`meme` 这类玩法用标签表达。

| Type | Use For | Main Fields |
| --- | --- | --- |
| `single_choice` | Choose one option | `options`, `answer: ["A"]` |
| `multiple_choice` | Choose multiple options | `options`, `answer: ["A", "C"]` |
| `true_false` | True/false judgement | `options` with `T` and `F`, `answer: ["T"]` |
| `fill_blank` | Short exact answer or aliases | `answer`, optional `answer_rules` |
| `numeric` | Number, estimate, tolerance | `answer`, `answer_rules.numeric` |
| `short_answer` | Short free-text response | `answer`, optional `answer_rules` |
| `ordering` | Put items in order | `options`, ordered `answer` |
| `matching` | Match left and right groups | `pairs`, object `answer` |
| `hotspot` | Select a region on media | `media`, `hotspots`, `answer` |

## Advanced Examples

Ordering:

```json
{
  "type": "ordering",
  "options": [
    { "id": "A", "text": { "zh-CN": "第一步", "en-US": "Step one" } },
    { "id": "B", "text": { "zh-CN": "第二步", "en-US": "Step two" } }
  ],
  "answer": ["A", "B"]
}
```

Matching:

```json
{
  "type": "matching",
  "pairs": {
    "left": [
      { "id": "L1", "text": { "zh-CN": "莫扎特", "en-US": "Mozart" } }
    ],
    "right": [
      { "id": "R1", "text": { "zh-CN": "奥地利", "en-US": "Austria" } }
    ]
  },
  "answer": [{ "left": "L1", "right": "R1" }]
}
```

Numeric:

```json
{
  "type": "numeric",
  "answer": [3.14],
  "answer_rules": {
    "numeric": {
      "value": 3.14,
      "tolerance": 0.01,
      "unit": ""
    }
  }
}
```

Hotspot:

```json
{
  "type": "hotspot",
  "media": [{ "id": "img-example-map-001", "role": "question", "kind": "image" }],
  "hotspots": [
    { "id": "H1", "shape": "rect", "x": 0.25, "y": 0.3, "width": 0.2, "height": 0.15 }
  ],
  "answer": ["H1"]
}
```
