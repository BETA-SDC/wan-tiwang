# Media Guide

Media files are local-first and ignored by Git for now. Store stable metadata in `media-meta/`, and reference media from questions by `media_id`.

Recommended file layout:

```text
media/images/<category>/<topic>/<name>.webp
media/audio/<category>/<topic>/<name>.mp3
media/video/<category>/<topic>/<name>.mp4
media/thumbnails/<media-id>.webp
```

Use relative paths from the repository root:

```json
{
  "id": "img-games-minecraft-creeper-001",
  "type": "image",
  "path": "media/images/games/minecraft/creeper-001.webp",
  "thumbnail": "media/thumbnails/img-games-minecraft-creeper-001.webp"
}
```

Questions should not depend on physical paths directly. They should reference media by ID:

```json
{
  "media": [
    { "id": "img-games-minecraft-creeper-001", "role": "question" }
  ]
}
```
