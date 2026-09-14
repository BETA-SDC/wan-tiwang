# Contributing

Wan Ti Wang is optimized for fun trivia, not formal testing. Contributions should feel playful, clear, and easy to answer in a casual setting.

## Question Guidelines

- Prefer short prompts with one clear answer.
- Add a reveal that is interesting even when the player guessed correctly.
- Avoid overly obscure facts unless the mood is intentionally `wild` or `hardcore`.
- Use tags generously for reuse across packs and playlists.
- Do not include copyrighted media unless the license allows reuse.
- Keep source and license information for every media item.

## Data Workflow

1. Add or update question JSONL files under `questions/`.
2. Add media metadata under `media-meta/` when a question references local media.
3. Run `npm run validate`.
4. Run `npm run build:index`.
5. Commit source data and generated indexes together.
