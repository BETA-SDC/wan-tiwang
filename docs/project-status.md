# Project Status

项目状态记录，最后更新：2026-09-15。

## Current Position

Wan Ti Wang is currently a local-first repository framework for a bilingual fun-trivia question bank. It is designed for casual play, parties, live interaction, daily questions, and themed quiz rounds. It is not positioned as an examination system.

万题王目前是一个本地优先的双语趣味题库框架，面向轻松答题、聚会、直播互动、每日一题和主题玩法，不定位为考试系统。

The repository uses JSONL as the source of truth. Generated indexes support lookup, filtering, random sampling, duplicate detection, and media lookup.

仓库使用 JSONL 作为源数据，自动生成索引，用于查询、筛选、随机抽题、重复题检测和媒体查找。

## Implemented

### Question Data

- Every question stores both `zh-CN` and `en-US` text.
- Supported answer types are `single_choice`, `multiple_choice`, `true_false`, `fill_blank`, and `short_answer`.
- Categories use hierarchical IDs such as `science.astronomy`.
- Tags, moods, and occasions are separate from the answer type so one question can be reused in different game contexts.
- Sample content currently covers general trivia, history, language, life, science, technology, and brain teasers.

### Repository Maintenance

- `npm run wtw -- check` runs validation, tag linting, duplicate detection, and index rebuilding.
- Generated indexes include category, format, tag, mood, occasion, media, ID, and statistics indexes.
- Media files are ignored by Git for now; media metadata remains versioned.
- Question and media references use repository-relative paths or stable IDs.

### Web Management UI

The local UI is split into independent feature pages:

```text
/                  Home
/questions/        Question Library
/editor/           Question Editor
/question/?id=     Single-question preview
/slides/           Slide Generator
/media/            Media Library
/settings/         Taxonomy reference
/maintenance/      Repository checks
```

所有页面共享同一套应用壳层、左侧导航、顶部页面标题、面包屑和返回入口。题库浏览、编辑、单题预览、媒体、设置、维护和 Slides 均为独立页面。

### Slide Generator

- Select questions from the library or search within the generator.
- Build a one-question-per-slide preview.
- Switch Chinese, English, or bilingual display.
- Show answers interactively or inline.
- Present with keyboard navigation.
- Export a standalone HTML file to the ignored `exports/slides/` directory.
- Preserve relative media paths in exported HTML.

## Current Snapshot

- Baseline implementation commit: `d6d9323 Split admin into feature pages`
- Questions: 14
- Media metadata items: 0
- Local media files: none tracked by Git
- UI server: local-only Node HTTP server
- Default UI URL: `http://127.0.0.1:5177/`
- Repository checks: passing on 2026-09-15

## Known Limitations

### Priority 1: Reliability

- The browser UI currently relies on a lightweight custom Node server rather than a production web framework.
- API write operations need stronger validation, transactional behavior, and clearer user-facing error handling.
- Media upload and question save are separate filesystem operations; a failed question write could leave an unused uploaded file or metadata record.
- Existing media metadata has not yet been exercised with real image, audio, and video files.
- There is no automated browser regression test suite for the main workflows.

### Priority 2: Editing Experience

- The editor is still a long form. It should be split into clear steps or collapsible sections without hiding important validation.
- Form validation should show field-level errors before upload or save.
- Option editing should support answer selection controls instead of requiring comma-separated answer IDs.
- Multi-select mood and occasion controls should become more discoverable than native multi-select boxes.
- Unsaved changes should be detected and confirmed before leaving the editor.
- Save feedback should distinguish saved, failed, and partially completed media operations.

### Priority 3: Question Library Scale

- The library currently loads a large question set into the browser. At 10,000+ questions it should use server-side pagination or cursor-based loading.
- Search, category, type, status, tag, mood, occasion, and media filters should be queryable through a stable filter model.
- The current category selector is hierarchical, but category counts and recently used categories would improve navigation.
- Selection for Slides is stored in `localStorage`; a named selection set or temporary deck workspace would be easier to understand and safer for multiple decks.
- Question cards could support compact, comfortable, and preview-oriented density modes.

### Priority 4: Content Quality

- Add stronger schema rules for bilingual completeness, answer/options consistency, valid media references, and normalized tags.
- Add configurable duplicate thresholds and a review queue for near-duplicate candidates.
- Add question provenance fields such as author, source note, confidence, review date, and license where appropriate.
- Add explicit lifecycle transitions for draft, review, published, and deprecated.
- Add a small test fixture set for every answer type and for media-backed questions.

### Priority 5: Media Workflow

- Add media preview thumbnails and playable audio/video rows to the Media Library.
- Add media search by type, tag, title, and usage count.
- Show which questions reference each media item.
- Validate file existence, extension, MIME type, and relative path consistency.
- Consider an optional external object-storage adapter later, while keeping local files as the default.

### Priority 6: Export and Play

- Add named deck drafts and the ability to reorder selected questions before export.
- Add deck themes, title pages, optional score breaks, and configurable reveal layouts.
- Add export options for PDF or presentation formats only after the HTML workflow is stable.
- Add a separate player mode for actual game sessions, keeping authoring and presentation concerns separate.

## Recommended Next Iteration

The next practical iteration should focus on workflow reliability rather than adding more visual features:

1. Add browser tests for Home, Library, Editor, Question Preview, Slides, and Export.
2. Add field-level validation and unsaved-change protection to the editor.
3. Add real media fixtures and verify local media paths in preview and exported HTML.
4. Replace browser-side loading of the full question bank with paginated API queries.
5. Introduce named deck selections instead of one global `localStorage` selection.

下一阶段建议优先保证维护可靠性：先补浏览器测试、表单级校验、未保存提示和媒体测试，再优化万题规模下的分页查询与命名题组选集。

## Development Rule

After every code or documentation change:

```bash
npm run wtw -- check
git diff --check
git status --short
```

Then commit the completed change and push it when the repository credentials are available.

每次代码或文档修改后，都应运行检查、提交并推送，避免仓库状态和文档记录脱节。
