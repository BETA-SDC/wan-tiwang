# Wan Ti Wang

Wan Ti Wang is a repository framework for a fun trivia question bank. It is designed for casual quiz games, party rounds, daily challenges, live-stream interaction, and themed knowledge play.

This repository stores question data, taxonomy definitions, media metadata, packs, playlists, generated indexes, and maintenance scripts. Actual media files are intentionally kept local and ignored by Git for now; questions and media metadata should reference them with relative paths.

## Repository Layout

```text
docs/          Design notes and contribution guides
schema/        JSON Schema files for validation
taxonomy/      Controlled categories, formats, moods, and occasions
questions/     Question data, organized by broad topic
media/         Local media files ignored by Git
media-meta/    Versioned metadata for local media
packs/         Reusable quiz packs and themed rounds
playlists/     Feed-like content lists for apps
indexes/       Generated lookup indexes
scripts/       Validation, indexing, and sampling utilities
```

## Design Principles

- Keep questions fun, lightweight, and replayable.
- Use categories for stable topic placement.
- Use tags, moods, and occasions for flexible reuse.
- Store media metadata in Git, but keep large media files local or in external storage.
- Reference media with stable `media_id` values and relative paths.
- Generate indexes from source data instead of editing them by hand.

## Quick Start

```bash
npm run validate
npm run build:index
npm run sample -- --count 10
```

The initial framework does not include concrete questions yet.
