# Wan Ti Wang AI Question Brief

Give this single document to any AI that needs to draft Wan Ti Wang questions. It is self-contained. The AI should not need repository access.

把这一份文档直接给其他 AI 即可。它不需要读取仓库，也不需要知道项目其他文件。

## How a Human Should Use This Brief

Give this entire document to the other AI as an attachment or pasted context. Do not give it only `README.md`, `docs/ai-assisted-authoring.md`, or the question schema; this brief is the standalone version.

把整份文档作为附件或上下文提供给其他 AI。不要只给它 `README.md`、`docs/ai-assisted-authoring.md` 或 schema；本文件才是可以单独使用的版本。

After giving the document, send a short task message with:

```text
Topic:
Target categories:
Question count:
Difficulty mix:
Mood:
Occasions:
Need media: yes/no
```

提供文档后，再发送一段任务消息，至少填写：

```text
主题：
目标分类：
题目数量：
难度比例：
氛围：
使用场景：
是否需要媒体：是/否
```

For example:

例如：

```text
Read the attached Wan Ti Wang AI Question Brief and follow it exactly.

Create 10 fun bilingual questions about astronomy.
Target categories: science.astronomy.
Difficulty mix: 3 easy, 5 medium, 2 hard.
Mood: surprising, easygoing.
Occasions: daily, party.
Need media: no.
Return only one valid JSON array. Do not include Markdown or explanations.
```

If media is needed, also give the real media information. The AI must not guess local files:

如果需要媒体，还要提供真实媒体信息。AI 不应该猜本地文件：

```text
Need media: yes.

Real files:
- moon-surface.webp | image | media/images/science/astronomy/moon-surface.webp | source: NASA | license: verify
- eclipse.mp3 | audio | media/audio/science/astronomy/eclipse.mp3 | source: local recording | license: owned

Return one media question pack with media_files_to_place_locally,
media_metadata_jsonl, and question_drafts.
```

The human still needs to review facts, source/license information, and answers before importing.

人仍然需要在导入前审核事实、媒体来源/许可和答案。

## Goal

Create fun bilingual trivia questions for Wan Ti Wang. This is for playful quizzes, party games, daily challenges, livestream interaction, and light knowledge games. It is not a formal exam bank.

生成“万题王”趣味双语题目。定位是聚会、每日一题、直播互动、轻量知识娱乐，不是正式考试题库。

## Output Rule

Return exactly one valid JSON value:

- For normal text-only questions: return a JSON array of question objects.
- For media-backed questions: return one JSON object with `media_files_to_place_locally`, `media_metadata_jsonl`, and `question_drafts`.

Do not use Markdown fences. Do not include comments. Do not include explanation outside JSON.

输出必须是一个合法 JSON：

- 普通无媒体题：输出题目对象数组。
- 有媒体题：输出一个对象，包含 `media_files_to_place_locally`、`media_metadata_jsonl`、`question_drafts`。

不要使用 Markdown 代码块，不要写注释，不要在 JSON 外写解释。

## Universal Rules

- Do not include `id`; the import script will generate IDs.
- Every player-facing text must include both `zh-CN` and `en-US`.
- Use `status: "draft"`.
- Keep wording fun, concise, and playable.
- Avoid exam-style wording unless the topic genuinely needs precision.
- Avoid current affairs unless exact dates and stable sources are provided.
- Make every question have one unambiguous best answer.
- Do not invent media paths, media IDs, sources, or licenses.
- Tags should be lowercase English slugs, for example `solar-system`, `movie-trivia`, `image-guess`.
- `topic` should be a short English slug. It decides the target file name, such as `movie-trivia`, `ai-trivia`, `space-trivia`.

通用规则：

- 不要写 `id`，导入脚本会生成。
- 所有玩家可见文本必须同时有 `zh-CN` 和 `en-US`。
- `status` 使用 `"draft"`。
- 文字要轻松、清楚、可游玩。
- 避免严肃考试腔，除非题目本身需要精确表达。
- 不要生成未核实的时事题。
- 每题必须有明确最佳答案。
- 不要编造媒体路径、媒体 ID、来源或许可。
- 标签使用英文小写 slug，例如 `solar-system`、`movie-trivia`、`image-guess`。
- `topic` 使用简短英文 slug，它会决定目标文件名，例如 `movie-trivia`、`ai-trivia`、`space-trivia`。

## Allowed Values

Question `type`:

```text
single_choice
multiple_choice
true_false
fill_blank
numeric
short_answer
ordering
matching
hotspot
```

Prefer `single_choice`, `multiple_choice`, or `true_false` unless another type is clearly better.

Difficulty:

```text
easy
medium
hard
```

Mood:

```text
funny
surprising
easygoing
hardcore
nostalgic
weird
beautiful
debate
```

Occasion:

```text
daily
party
stream
family
classroom-warmup
challenge
icebreaker
```

Category IDs:

```text
general.weird-facts
general.everyday-trivia
general.brain-teasers
history.ancient-china
history.modern-china
history.world-history
history.figures
history.oddities
geography.countries
geography.cities
geography.landmarks
geography.nature
science.physics
science.chemistry
science.biology
science.astronomy
science.earth-science
technology.computers
technology.internet
technology.ai
technology.gadgets
technology.inventions
humanities.literature
humanities.philosophy
humanities.mythology
humanities.religion
humanities.classics
society.politics
society.economics
society.law
society.education
arts.painting
arts.music
arts.architecture
arts.design
pop-culture.movies
pop-culture.tv
pop-culture.celebrities
pop-culture.memes
games.video-games
games.board-games
games.anime
games.esports
games.specific-titles
life.food
life.health
life.sports
life.animals
life.plants
life.travel
language.chinese
language.idioms
language.english
language.wordplay
language.dialects
brain.riddles
brain.logic
brain.lateral-thinking
brain.math-puzzles
brain.visual-puzzles
```

## Normal Question JSON Array

Use this format for ordinary questions without media:

```json
[
  {
    "type": "single_choice",
    "category": "science.astronomy",
    "topic": "space-trivia",
    "difficulty": "easy",
    "title": {
      "zh-CN": "中文短标题",
      "en-US": "Short English title"
    },
    "prompt": {
      "zh-CN": "中文题干？",
      "en-US": "English prompt?"
    },
    "options": [
      {
        "id": "A",
        "text": {
          "zh-CN": "中文选项 A",
          "en-US": "English option A"
        }
      },
      {
        "id": "B",
        "text": {
          "zh-CN": "中文选项 B",
          "en-US": "English option B"
        }
      },
      {
        "id": "C",
        "text": {
          "zh-CN": "中文选项 C",
          "en-US": "English option C"
        }
      },
      {
        "id": "D",
        "text": {
          "zh-CN": "中文选项 D",
          "en-US": "English option D"
        }
      }
    ],
    "answer": ["A"],
    "reveal": {
      "zh-CN": "中文答案解释，轻松但准确。",
      "en-US": "English reveal, light but accurate."
    },
    "fun_fact": {
      "zh-CN": "可选趣味补充。",
      "en-US": "Optional fun fact."
    },
    "tags": ["space", "example"],
    "mood": ["easygoing"],
    "occasion": ["daily", "party"],
    "play_time_sec": 25,
    "status": "draft"
  }
]
```

For `true_false`, use options `T` and `F`:

```json
[
  {
    "type": "true_false",
    "category": "general.weird-facts",
    "topic": "mixed",
    "difficulty": "medium",
    "title": {
      "zh-CN": "判断题中文短标题",
      "en-US": "True/false short title"
    },
    "prompt": {
      "zh-CN": "判断：这里写中文判断题干。",
      "en-US": "True or false: write the English statement here."
    },
    "options": [
      {
        "id": "T",
        "text": {
          "zh-CN": "正确",
          "en-US": "True"
        }
      },
      {
        "id": "F",
        "text": {
          "zh-CN": "错误",
          "en-US": "False"
        }
      }
    ],
    "answer": ["F"],
    "reveal": {
      "zh-CN": "说明为什么正确或错误。",
      "en-US": "Explain why it is true or false."
    },
    "fun_fact": {
      "zh-CN": "可选趣味补充。",
      "en-US": "Optional fun fact."
    },
    "tags": ["example"],
    "mood": ["surprising"],
    "occasion": ["daily"],
    "play_time_sec": 20,
    "status": "draft"
  }
]
```

For multiple choice, use several answer IDs, for example:

```json
"answer": ["A", "C"]
```

## Media Question Pack

Use this format when the question uses images, audio, or video. Return one object with three parts.

媒体题使用下面格式。输出一个对象，分三部分。

```json
{
  "media_files_to_place_locally": [
    {
      "kind": "image",
      "suggested_relative_path": "media/images/science/astronomy/moon-surface-001.webp",
      "note": "Put the actual local file here before importing the question. This file is ignored by Git."
    }
  ],
  "media_metadata_jsonl": [
    {
      "id": "img-science-astronomy-moon-surface-001",
      "type": "image",
      "path": "media/images/science/astronomy/moon-surface-001.webp",
      "thumbnail": "media/thumbnails/img-science-astronomy-moon-surface-001.webp",
      "title": "Moon Surface",
      "alt": "Moon surface photo with visible craters",
      "source": {
        "type": "local",
        "url": "",
        "license": "unknown",
        "note": "Replace with real source and license before review."
      },
      "tags": ["moon", "space", "astronomy", "image-guess"],
      "status": "draft"
    }
  ],
  "question_drafts": [
    {
      "type": "single_choice",
      "category": "science.astronomy",
      "topic": "space-trivia",
      "difficulty": "easy",
      "title": {
        "zh-CN": "这是谁家的表面",
        "en-US": "Whose Surface Is This?"
      },
      "prompt": {
        "zh-CN": "这张图片最可能展示的是哪个天体的表面？",
        "en-US": "Which celestial body's surface is most likely shown in this image?"
      },
      "media": [
        {
          "id": "img-science-astronomy-moon-surface-001",
          "role": "question",
          "kind": "image",
          "hint": {
            "zh-CN": "月球表面照片",
            "en-US": "moon surface photo"
          }
        }
      ],
      "options": [
        {
          "id": "A",
          "text": {
            "zh-CN": "月球",
            "en-US": "The Moon"
          }
        },
        {
          "id": "B",
          "text": {
            "zh-CN": "木星",
            "en-US": "Jupiter"
          }
        },
        {
          "id": "C",
          "text": {
            "zh-CN": "太阳",
            "en-US": "The Sun"
          }
        },
        {
          "id": "D",
          "text": {
            "zh-CN": "土星环",
            "en-US": "Saturn's rings"
          }
        }
      ],
      "answer": ["A"],
      "reveal": {
        "zh-CN": "图中可见大量撞击坑，最符合月球表面的典型特征。",
        "en-US": "The many visible impact craters best match the typical appearance of the Moon's surface."
      },
      "fun_fact": {
        "zh-CN": "月球没有像地球那样活跃的风雨侵蚀，所以许多撞击坑能保存很久。",
        "en-US": "The Moon lacks Earth's active wind and rain erosion, so many impact craters remain visible for a long time."
      },
      "tags": ["moon", "space", "image-guess"],
      "mood": ["surprising"],
      "occasion": ["daily", "party"],
      "play_time_sec": 25,
      "status": "draft"
    }
  ]
}
```

## Media Placement Rules

- If media is shared prompt material, put it in question-level `media` with `role: "question"`.
- If media is an answer option, put it in that option's `media` array with `role: "option"`.
- Use `kind: "image"`, `kind: "audio"`, or `kind: "video"`.
- Media metadata `path` must be a relative path under `media/`.
- Media IDs should be stable English slugs:
  - image: `img-...`
  - audio: `aud-...`
  - video: `vid-...`
  - thumbnail: `thumb-...`

媒体放置规则：

- 题干共用素材放在题目级 `media`，`role` 用 `"question"`。
- 某个选项自己的图片、音频或视频放在该选项的 `media` 数组里，`role` 用 `"option"`。
- `kind` 使用 `"image"`、`"audio"` 或 `"video"`。
- 媒体元数据里的 `path` 必须是 `media/` 下的相对路径。
- 媒体 ID 使用稳定英文 slug：图片 `img-...`，音频 `aud-...`，视频 `vid-...`，缩略图 `thumb-...`。

Example for image options:

```json
{
  "id": "A",
  "text": {
    "zh-CN": "选项 A",
    "en-US": "Option A"
  },
  "media": [
    {
      "id": "img-history-world-history-example-option-a-001",
      "role": "option",
      "kind": "image",
      "hint": {
        "zh-CN": "图片选项 A",
        "en-US": "image option A"
      }
    }
  ]
}
```

## Final Checklist

Before returning the JSON, verify:

- Valid JSON only.
- No Markdown.
- No comments.
- No `id` in question drafts.
- All `zh-CN` and `en-US` fields are filled.
- Category is from the allowed list.
- Type, difficulty, mood, and occasion use allowed values.
- Choice answers use option IDs.
- Media questions separate metadata and question drafts.
- Unknown media license is written as `"unknown"`, not invented.

返回前检查：

- 只输出合法 JSON。
- 不要 Markdown。
- 不要注释。
- 题目草稿不写 `id`。
- 所有 `zh-CN` 和 `en-US` 都已填写。
- 分类来自允许列表。
- 题型、难度、氛围、场景使用允许值。
- 选择题答案使用选项 ID。
- 媒体题分离媒体元数据和题目草稿。
- 不知道媒体许可时写 `"unknown"`，不要编造。
