# Data Directory

Versioned question-bank content lives here.

进入 Git 的题库内容集中放在这里。

```text
questions/     Source question JSONL files
media-meta/    Metadata for local media files
taxonomy/      Categories, answer types, moods, and occasions
indexes/       Generated lookup indexes
schema/        JSON Schema files
templates/     Copyable starter questions
```

Local media files stay in the repository-level `media/` directory because they are ignored by Git.

本地图片、音频、视频文件仍然放在仓库根目录的 `media/`，因为这些文件暂时不进入 Git。
