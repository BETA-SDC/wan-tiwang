# Media Metadata

Store metadata for local media files here. Each `.jsonl` file contains one media object per line.

这里存放本地媒体文件的元数据。每个 `.jsonl` 文件中，每一行代表一个媒体对象。

Media metadata is versioned in Git. The actual files under `media/` are ignored for now.

媒体元数据会进入 Git，实际图片、音频、视频文件暂时不会进入 Git。题目应引用媒体 ID，而不是直接写媒体文件路径。
