# Slide Generator Guide

The Slide Generator is a separate page at `/slides/` for turning selected questions into a lightweight presentation deck. It exports a folder deck under `exports/slides/`. It does not edit question data.

题目可视化生成器是 `/slides/` 独立页面，用来把选中的题目组装成轻量展示稿，并可以导出文件夹形式的演示包到 `exports/slides/`。它不会修改题目数据。

## Workflow

1. Use `Browse` filters to narrow the question pool, or tick specific questions in the list.
2. Open `/slides/` from `Open Slides`.
3. Choose a source:
   - `Search results`: use the questions currently matching the generator search.
   - `Selected from Library`: use only questions selected in the Question Library.
   - `All questions`: use the full bank.
4. Set count, language, and reveal mode.
5. Click `Build Preview` or `Shuffle Preview`.
6. Use `Previous`, `Next`, and `Show Reveal`.
7. Use `Present` for a slide-like full-stage view.
8. In exported decks, players can click choice options and confirm an answer, then use `Download Feedback` to export answer counts.
9. Click `Export Folder` to write a deck folder under `exports/slides/`. The app shows a success popup and provides `Open Deck` and `Open in New Tab` actions.

中文流程：

1. 先用 `Browse` 筛选题目，或者在题目列表里勾选具体题目。
2. 通过 `Open Slides` 打开 `/slides/`。
3. 选择来源：
   - `Search results`：使用生成器搜索当前匹配的题目。
   - `Selected from Library`：只使用在 Question Library 中勾选的题目。
   - `All questions`：使用全部题目。
4. 设置数量、语言和答案显示方式。
5. 点击 `Build Preview` 或 `Shuffle Preview`。
6. 使用 `Previous`、`Next` 和 `Show Reveal` 控制展示。
7. 使用 `Present` 进入类似幻灯片的展示模式。
8. 在导出的演示中，玩家可以点击选择题选项并确认答案，再用 `Download Feedback` 导出作答统计。
9. 点击 `Export Folder`，把演示文件夹写到 `exports/slides/`。管理台会弹出成功提示，并提供 `Open Deck` 和 `Open in New Tab` 操作。

## Export Folder

Each export is a self-contained folder, not a single packed HTML file:

```text
exports/slides/<deck-name>/
  index.html
  assets/
    deck.css
    deck.js
  data/
    manifest.json
    questions.json
    media.json
    deck-data.js
  media/
    images/...
    audio/...
    video/...
```

每次导出都是一个清晰的文件夹，而不是把所有题目和样式塞进一个 HTML：

```text
exports/slides/<deck-name>/
  index.html              # 页面结构
  assets/deck.css         # 演示样式
  assets/deck.js          # 翻页、显示答案、渲染逻辑
  data/questions.json     # 题目数据，接近题库原始结构
  data/media.json         # 本次演示用到的媒体元数据
  data/deck-data.js       # 让双击 HTML 也能读取数据的轻量数据入口
  media/...               # 本次演示用到的本地媒体副本
```

`questions.json` and `media.json` are intended for reading, auditing, and reuse. `deck-data.js` mirrors the same data so the deck can load without a local web server in stricter browsers.

`questions.json` 和 `media.json` 方便检查和复用；`deck-data.js` 只是为了让一些浏览器在没有本地服务器时也能加载同一份数据。

## Notes

- One slide displays one question.
- A single question can be previewed directly at `/question/?id=<question-id>`.
- Preview and Present do not write files. Only `Export Folder` creates a folder under `exports/slides/`.
- Exported decks copy the referenced media into the export folder. If media is missing locally, the export result reports the missing count and those items will show broken media.
- Exported decks can record local answer feedback for choice questions. `Download Feedback` saves a JSON file with answered and correct counts; import it from `Maintenance` to add those counts back to question `feedback`.
- `Hidden until show` keeps answers hidden until `Show Reveal` is clicked, and automatically hides the answer again when you move to another question.
- `Inline on each slide` is useful for review decks.
- Arrow keys move between slides in the Slides view.
- `R` toggles reveal, and `Esc` exits Present mode.

说明：

- 一页只显示一道题。
- 单题可以通过 `/question/?id=<题目ID>` 直接预览。
- 预览和演示模式不会写入文件，只有点击 `Export Folder` 才会在 `exports/slides/` 下生成文件夹。
- 导出演示会复制本次使用到的媒体文件。如果本地媒体缺失，导出结果会显示缺失数量，对应位置会显示断开的媒体。
- 导出演示可以在本地记录选择题作答反馈。`Download Feedback` 会保存包含回答次数和答对次数的 JSON；在 `Maintenance` 页面导入后，会把这些计数累加回题目的 `feedback` 字段。
- `Hidden until show` 会默认隐藏答案，点击 `Show Reveal` 才显示，并且每次切换题目都会重新收起答案。
- `Inline on each slide` 适合审题或复习场景。
- 在 Slides 视图中可以用左右方向键翻页。
- `R` 切换答案显示，`Esc` 退出 Present 模式。
