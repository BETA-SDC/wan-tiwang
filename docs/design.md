# Design

Wan Ti Wang is a content-first trivia bank. The main entities are:

- `question`: a playable trivia item.
- `media`: an image, audio clip, video clip, or thumbnail referenced by questions.
- `category`: a stable topic location.
- `tag`: a flexible reuse marker.
- `mood`: the feeling of the question.
- `occasion`: where the question works well.
- `pack`: a reusable game round or themed collection.
- `playlist`: an app-facing feed or recommendation list.

The repository should remain useful before any database exists. JSONL files are the source of truth, and indexes are generated from them for fast lookup and random sampling.
