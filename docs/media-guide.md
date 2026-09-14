# Media Guide

Media files are local-first and ignored by Git for now. Store stable metadata in `media-meta/`, and reference media from questions by `media_id`.

媒体文件暂时采用本地优先策略，并被 Git 忽略。仓库只保存媒体元数据，题目通过 `media_id` 引用媒体。

Recommended file layout:

```text
media/images/<category>/<topic>/<name>.webp
media/audio/<category>/<topic>/<name>.mp3
media/video/<category>/<topic>/<name>.mp4
media/thumbnails/<media-id>.webp
```

推荐按“媒体类型 / 大分类 / 具体主题 / 文件名”整理，这样人能看懂，程序也方便索引。

Use relative paths from the repository root:

```json
{
  "id": "img-games-minecraft-creeper-001",
  "type": "image",
  "path": "media/images/games/minecraft/creeper-001.webp",
  "thumbnail": "media/thumbnails/img-games-minecraft-creeper-001.webp"
}
```

路径必须是相对于仓库根目录的相对路径，不要写绝对路径。这样不同电脑、不同部署环境都能复用同一份元数据。

Questions should not depend on physical paths directly. They should reference media by ID:

```json
{
  "media": [
    { "id": "img-games-minecraft-creeper-001", "role": "question" }
  ]
}
```

推荐规则：

- 图片优先使用 `.webp`，必要时使用 `.png` 或 `.jpg`。
- 音频优先使用 `.mp3` 或 `.m4a`。
- 视频优先使用 `.mp4`。
- 视频和大图最好额外准备缩略图。
- 本地文件可以先放在 `media/` 中，但不会进入 Git。
- 后续如果接 CDN，可以在媒体元数据里追加 `url` 字段，不需要修改题目本身。
