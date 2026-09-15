# Local API Guide

The visual UI runs on a local HTTP server. The API is meant for the admin UI, AI agents, and small local scripts. It reads and writes repository files directly, so review changes before committing.

可视化界面运行在本地 HTTP 服务上。API 面向管理 UI、AI agent 和本地小脚本，会直接读写仓库文件，所以提交前需要审核变更。

Default base URL:

```text
http://127.0.0.1:5177
```

默认基础地址：

```text
http://127.0.0.1:5177
```

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/bootstrap` | Load taxonomy, formats, moods, occasions, difficulties, and stats for the UI. |
| `GET` | `/api/questions` | List questions. Supports filters listed below. |
| `GET` | `/api/questions/:id` | Load one question by ID. |
| `POST` | `/api/questions` | Create one question. If `id` is omitted, the server generates the next ID from `category`. |
| `POST` | `/api/questions/import` | Validate or import one reviewed question draft, an array, or `{"questions":[...]}`. |
| `PUT` | `/api/questions/:id` | Replace one existing question record. |
| `GET` | `/api/media` | List media metadata. |
| `POST` | `/api/media` | Upload/register one local media item from a browser data URL. |
| `POST` | `/api/slides/export` | Export a folder deck under `exports/slides/`. |
| `POST` | `/api/feedback/import` | Import answer feedback JSON from exported decks. |
| `POST` | `/api/check` | Run validation, tag lint, duplicate check, and index rebuild. |

## Implementation Layout

API code is split by responsibility:

```text
scripts/server.mjs              Thin HTTP server entry point
scripts/server/http.mjs         Response helpers and request body parsing
scripts/server/static.mjs       Admin, docs, media, and export file serving
scripts/server/api/index.mjs    API route dispatch
scripts/server/api/questions.mjs
scripts/server/api/media.mjs
scripts/server/api/slides.mjs
scripts/server/api/feedback.mjs
scripts/server/api/bootstrap.mjs
scripts/server/maintenance.mjs
```

数据读写复用 `scripts/question-store.mjs` 和 `scripts/media-store.mjs`，不要在 API 文件里重新实现 ID 生成、JSONL 写入、媒体元数据读取等逻辑。

The admin UI also keeps shared browser helpers in one place:

```text
admin/shared/api.js       JSON requests
admin/shared/bootstrap.js Cached taxonomy/stats loader
admin/shared/dom.js       Required DOM lookup, options, page errors
admin/shared/files.js     Text and data-URL file reading
admin/shared/page.js      Page startup and error boundary
admin/shared/app-shell.js Shared navigation and page shell
admin/shared/question-view.js
```

管理端页面应优先复用 `admin/shared/` 中的请求、DOM、文件读取和页面错误处理，不要在每个页面重新复制一套工具函数。

## Question Filters

`GET /api/questions` query parameters:

| Parameter | Meaning |
| --- | --- |
| `q` | Full-text search over ID, category, type, title, prompt, reveal, and tags. |
| `category` | Exact category ID, such as `science.physics`. |
| `categoryPrefix` | Parent or subtree category filter, such as `science`. |
| `type` | Answer type, such as `single_choice` or `multiple_choice`. |
| `difficulty` | `easy`, `medium`, or `hard`. |
| `status` | `draft`, `review`, `published`, or `deprecated`. |
| `tag` | Exact tag ID. |
| `limit` | Maximum returned questions. Defaults to `500`. |

## Examples

```bash
curl "http://127.0.0.1:5177/api/questions?categoryPrefix=science&difficulty=hard&limit=20"
curl "http://127.0.0.1:5177/api/questions/science-physics-000020"
curl -X POST "http://127.0.0.1:5177/api/questions/import?dryRun=true" \
  -H "Content-Type: application/json" \
  --data @draft-batch.json
curl -X POST "http://127.0.0.1:5177/api/check"
```

Question creation accepts the same JSON shape described in [Question Format](question-format.md). For AI-generated batches, prefer `Import Questions` in the UI. The import API accepts `dryRun: true`, which validates and reports generated IDs and target files without writing data.

新建题目使用 [Question Format](question-format.md) 中说明的 JSON 结构。对于 AI 批量生成的题目，优先使用 UI 里的 `Import Questions`。导入 API 支持 `dryRun: true`，可以只检查并返回生成 ID 和目标文件，不写入数据。
