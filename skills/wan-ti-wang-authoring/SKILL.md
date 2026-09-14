---
name: wan-ti-wang-authoring
description: Assist with creating, reviewing, importing, and maintaining bilingual Wan Ti Wang fun trivia questions in this repository.
---

# Wan Ti Wang Authoring

Use this skill when working on the Wan Ti Wang repository, especially for AI-assisted question drafting, bilingual cleanup, media-reference setup, validation, indexing, and content workflow documentation.

## Repository Assumptions

- This is a fun trivia bank, not a formal testing system.
- Every question must have Chinese and English player-facing text.
- Player-facing localized text uses `{ "zh-CN": "...", "en-US": "..." }`.
- Question source data lives under `questions/<primary>/<secondary>/<topic>.jsonl`.
- Media files under `media/` are ignored by Git; versioned media metadata lives under `media-meta/`.
- Generated indexes under `indexes/` are rebuilt by script and should not be edited by hand.

## Before Editing

Read the relevant local files instead of guessing:

- `taxonomy/categories.json` for category IDs
- `taxonomy/formats.json` for question types
- `taxonomy/moods.json` for moods
- `taxonomy/occasions.json` for occasions
- `docs/question-format.md` for question shape
- `docs/media-guide.md` for media references
- `docs/ai-assisted-authoring.md` for AI workflow expectations

## Question Drafting Rules

- Keep questions playful, clear, and quick to answer.
- Use `status: "draft"` for new AI-generated questions unless the user explicitly asks for reviewed/published content and review has actually happened.
- Do not invent IDs when using the import script; omit `id` and let `scripts/new-question.mjs` generate it.
- For choice questions, use option IDs in `answer`, such as `["A"]`.
- Ensure `title`, `prompt`, `options.text`, `reveal`, and `fun_fact` include both `zh-CN` and `en-US`.
- Prefer lowercase English tags suitable for search and reuse.
- Match the JSONL file path to the question's category whenever practical.

## Media Rules

- Do not invent local media paths.
- If adding a media question, create or update the appropriate `media-meta/*.jsonl` entry first.
- Questions should reference media by ID with `media: [{ "id": "...", "role": "question" }]`.
- Media paths in metadata must be relative to the repository root.
- Treat media source and license as required review items.

## Maintenance Commands

After code, documentation, question, taxonomy, media metadata, pack, or playlist changes, run:

```bash
npm run wtw -- check
```

This validates source files and rebuilds indexes. For command entry help, use:

```bash
npm run wtw -- help
```

For dry-run importing from a JSON draft:

```bash
npm run new:question -- --from-json draft-question.json --dry-run
```

## AI Collaboration Pattern

When the user asks for AI-assisted question creation:

1. Clarify the target topic, count, category, and mood only if missing information would materially change the output.
2. Draft a small reviewable batch rather than a huge one.
3. Keep generated questions in draft status.
4. Import or edit source files.
5. Run `npm run wtw -- check`.
6. Summarize changed files, validation result, and any items that still need human review.

For modern facts, current events, prices, schedules, people, companies, laws, or anything likely to change, verify with reliable sources before writing questions.
