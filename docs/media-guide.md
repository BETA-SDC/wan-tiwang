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
    {
      "id": "img-games-minecraft-creeper-001",
      "role": "question",
      "kind": "image",
      "hint": {
        "zh-CN": "Minecraft 苦力怕图片",
        "en-US": "Minecraft creeper image"
      }
    }
  ]
}
```

## Media Question Workflow

1. Put the local media file under `media/`.
2. Add one metadata line under `media-meta/images.jsonl`, `media-meta/audio.jsonl`, or `media-meta/video.jsonl`.
3. Reference the media ID from the question.
4. Run `npm run wtw -- check`.

中文流程：

1. 把本地媒体文件放到 `media/`。
2. 在 `media-meta/images.jsonl`、`media-meta/audio.jsonl` 或 `media-meta/video.jsonl` 里新增一行元数据。
3. 在题目里引用这个媒体 ID。
4. 运行 `npm run wtw -- check`。

Media metadata example:

媒体元数据示例：

```json
{"id":"img-science-astronomy-moon-surface-001","type":"image","path":"media/images/science/astronomy/moon-surface-001.webp","thumbnail":"media/thumbnails/img-science-astronomy-moon-surface-001.webp","title":"Moon Surface","alt":"月球表面照片","source":{"type":"local","url":"","license":"unknown"},"tags":["moon","space","astronomy"],"status":"published"}
```

Question reference example:

题目引用示例：

```json
"media":[{"id":"img-science-astronomy-moon-surface-001","role":"question","kind":"image","hint":{"zh-CN":"月球表面照片","en-US":"moon surface photo"}}]
```

Complete text-only part of an image question:

图片题的题目主体示例：

```json
{"id":"science-astronomy-000004","type":"image_guess","title":{"zh-CN":"这是谁家的表面","en-US":"Whose Surface Is This?"},"prompt":{"zh-CN":"这张图片最可能展示的是哪个天体的表面？","en-US":"Which celestial body's surface is most likely shown in this image?"},"media":[{"id":"img-science-astronomy-moon-surface-001","role":"question","kind":"image","hint":{"zh-CN":"月球表面照片","en-US":"moon surface photo"}}],"options":[{"id":"A","text":{"zh-CN":"月球","en-US":"The Moon"}},{"id":"B","text":{"zh-CN":"火星","en-US":"Mars"}},{"id":"C","text":{"zh-CN":"金星","en-US":"Venus"}},{"id":"D","text":{"zh-CN":"木星","en-US":"Jupiter"}}],"answer":["A"],"reveal":{"zh-CN":"答案是月球。月球表面有大量撞击坑。","en-US":"The answer is the Moon. Its surface has many impact craters."},"category":"science.astronomy","tags":["moon","space","image-guess"],"mood":["easygoing","surprising"],"occasion":["daily","party"],"play_time_sec":25,"status":"draft"}
```

`npm run wtw -- check` validates that the referenced media ID exists, optional `kind` matches the media metadata type, optional `hint` is bilingual, and media paths are relative. It does not currently verify that ignored local media files physically exist on disk.

`npm run wtw -- check` 会校验题目引用的媒体 ID 是否存在、可选的 `kind` 是否和媒体元数据类型一致、可选的 `hint` 是否双语，以及媒体路径是否为相对路径。它目前不会检查被 Git 忽略的本地媒体文件是否真实存在。

`indexes/by-media.json` is generated automatically and maps media IDs back to question IDs.

`indexes/by-media.json` 会自动生成，用于从媒体 ID 反查引用它的题目 ID。

推荐规则：

- 图片优先使用 `.webp`，必要时使用 `.png` 或 `.jpg`。
- 音频优先使用 `.mp3` 或 `.m4a`。
- 视频优先使用 `.mp4`。
- 视频和大图最好额外准备缩略图。
- 本地文件可以先放在 `media/` 中，但不会进入 Git。
- 后续如果接 CDN，可以在媒体元数据里追加 `url` 字段，不需要修改题目本身。
