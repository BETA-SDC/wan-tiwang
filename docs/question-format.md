# Question Format

Questions are stored as JSON Lines files under `questions/`. Each line is one JSON object.

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
