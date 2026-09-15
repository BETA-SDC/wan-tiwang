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
| `PUT` | `/api/questions/:id` | Replace one existing question record. |
| `GET` | `/api/media` | List media metadata. |
| `POST` | `/api/media` | Upload/register one local media item from a browser data URL. |
| `POST` | `/api/slides/export` | Export a folder deck under `exports/slides/`. |
| `POST` | `/api/feedback/import` | Import answer feedback JSON from exported decks. |
| `POST` | `/api/check` | Run validation, tag lint, duplicate check, and index rebuild. |

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
curl -X POST "http://127.0.0.1:5177/api/check"
```

Question creation accepts the same JSON shape described in [Question Format](question-format.md). For AI-generated batches, prefer reviewing them in the UI or importing them with the documented authoring workflow instead of sending unreviewed AI output straight to the API.

新建题目使用 [Question Format](question-format.md) 中说明的 JSON 结构。对于 AI 批量生成的题目，建议先在 UI 中审核，或按文档中的出题流程导入，不要把未经审核的 AI 输出直接写入 API。
