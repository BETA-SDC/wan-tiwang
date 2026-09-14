# Slide Generator Guide

The Slide Generator is a separate Admin UI view for turning selected questions into a lightweight presentation deck. It does not edit question data.

题目可视化生成器是管理界面里的独立视图，用来把选中的题目组装成轻量展示稿。它不会修改题目数据。

## Workflow

1. Use `Browse` filters to narrow the question pool, or tick specific questions in the list.
2. Open `Slides`.
3. Choose a source:
   - `Current filtered questions`: use the current Browse result.
   - `Selected questions`: use only ticked questions.
   - `All questions`: use the full bank.
4. Set count, language, and reveal mode.
5. Click `Build Slides` or `Shuffle`.
6. Use `Previous`, `Next`, and `Show Reveal`.
7. Use `Present` for a slide-like full-stage view, or `Print` for one question per printed page.

中文流程：

1. 先用 `Browse` 筛选题目，或者在题目列表里勾选具体题目。
2. 打开 `Slides`。
3. 选择来源：
   - `Current filtered questions`：使用当前筛选结果。
   - `Selected questions`：只使用勾选的题目。
   - `All questions`：使用全部题目。
4. 设置数量、语言和答案显示方式。
5. 点击 `Build Slides` 或 `Shuffle`。
6. 使用 `Previous`、`Next` 和 `Show Reveal` 控制展示。
7. 使用 `Present` 进入类似幻灯片的展示模式，或用 `Print` 按“一题一页”打印。

## Notes

- One slide displays one question.
- `Hidden until show` keeps answers hidden until `Show Reveal` is clicked.
- `Inline on each slide` is useful for review decks.
- Arrow keys move between slides in the Slides view.
- `R` toggles reveal, and `Esc` exits Present mode.

说明：

- 一页只显示一道题。
- `Hidden until show` 会默认隐藏答案，点击 `Show Reveal` 才显示。
- `Inline on each slide` 适合审题或复习场景。
- 在 Slides 视图中可以用左右方向键翻页。
- `R` 切换答案显示，`Esc` 退出 Present 模式。
