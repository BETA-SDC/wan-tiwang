# Slide Generator Guide

The Slide Generator is a separate page at `/slides/` for turning selected questions into a lightweight presentation deck. It can export a standalone HTML file under `exports/slides/`. It does not edit question data.

题目可视化生成器是 `/slides/` 独立页面，用来把选中的题目组装成轻量展示稿，并可以导出独立 HTML 文件到 `exports/slides/`。它不会修改题目数据。

## Workflow

1. Use `Browse` filters to narrow the question pool, or tick specific questions in the list.
2. Open `/slides/` from `Open Slides`.
3. Choose a source:
   - `Current filtered questions`: use the current Browse result.
   - `Selected questions`: use only ticked questions.
   - `All questions`: use the full bank.
4. Set count, language, and reveal mode.
5. Click `Build Preview` or `Shuffle Preview`.
6. Use `Previous`, `Next`, and `Show Reveal`.
7. Use `Present` for a slide-like full-stage view, or `Print` for one question per printed page.
8. Click `Export HTML` to write a standalone deck file under `exports/slides/`, then use the generated `Download HTML` or `Open` link.

中文流程：

1. 先用 `Browse` 筛选题目，或者在题目列表里勾选具体题目。
2. 通过 `Open Slides` 打开 `/slides/`。
3. 选择来源：
   - `Current filtered questions`：使用当前筛选结果。
   - `Selected questions`：只使用勾选的题目。
   - `All questions`：使用全部题目。
4. 设置数量、语言和答案显示方式。
5. 点击 `Build Preview` 或 `Shuffle Preview`。
6. 使用 `Previous`、`Next` 和 `Show Reveal` 控制展示。
7. 使用 `Present` 进入类似幻灯片的展示模式，或用 `Print` 按“一题一页”打印。
8. 点击 `Export HTML`，把独立演示文件写到 `exports/slides/`，然后使用生成的 `Download HTML` 或 `Open` 链接。

## Notes

- One slide displays one question.
- A single question can be previewed directly at `/question/?id=<question-id>`.
- Preview and Present do not write files. Only `Export HTML` creates a file under `exports/slides/`.
- `Hidden until show` keeps answers hidden until `Show Reveal` is clicked.
- `Inline on each slide` is useful for review decks.
- Arrow keys move between slides in the Slides view.
- `R` toggles reveal, and `Esc` exits Present mode.

说明：

- 一页只显示一道题。
- 单题可以通过 `/question/?id=<题目ID>` 直接预览。
- 预览和演示模式不会写入文件，只有点击 `Export HTML` 才会在 `exports/slides/` 下生成文件。
- `Hidden until show` 会默认隐藏答案，点击 `Show Reveal` 才显示。
- `Inline on each slide` 适合审题或复习场景。
- 在 Slides 视图中可以用左右方向键翻页。
- `R` 切换答案显示，`Esc` 退出 Present 模式。
