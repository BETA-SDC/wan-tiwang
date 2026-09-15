# Slide Generator Guide

The Slide Generator is a separate page at `/slides/` for turning selected questions into a lightweight presentation deck. It exports a folder deck under `exports/slides/`. It does not edit question data.

题目可视化生成器是 `/slides/` 独立页面，用来把选中的题目组装成轻量展示稿，并可以导出文件夹形式的演示包到 `exports/slides/`。它不会修改题目数据。

Start the admin UI first:

```bash
npm run ui
```

Without npm:

```bash
node scripts/server.mjs
```

Open the printed local URL, then go to `/slides/`.

先启动管理 UI：

```bash
npm run ui
```

没有 npm 时：

```bash
node scripts/server.mjs
```

打开终端输出的本地地址，然后进入 `/slides/`。

## Workflow

1. Use `Browse` filters to narrow the question pool, or tick specific questions in the list.
2. Open `/slides/` from `Open Slides`.
3. Choose a source:
   - `Search results`: use the questions currently matching the generator search.
   - `Selected from Library`: use only questions selected in the Question Library.
   - `All questions`: use the full bank.
4. Set count, language, and reveal mode.
5. Optionally enable `Guess the question from options` for a playful round where choice questions initially show only their options. Press `H` or use `Show Question` to reveal the question; moving to another slide hides it again.
6. Click `Build Preview` or `Shuffle Preview`.
7. Use `Previous`, `Next`, and `Show Reveal`, or the keyboard shortcuts listed below.
8. Use `Present` for a slide-like full-stage view.
9. In exported decks, players can click or keyboard-select choice options and confirm an answer, then use `Download Feedback` to export answer counts.
10. Click `Export Folder` to write a deck folder under `exports/slides/`. The app shows a success popup and provides `Open Deck` and `Open in New Tab` actions.

中文流程：

1. 先用 `Browse` 筛选题目，或者在题目列表里勾选具体题目。
2. 通过 `Open Slides` 打开 `/slides/`。
3. 选择来源：
   - `Search results`：使用生成器搜索当前匹配的题目。
   - `Selected from Library`：只使用在 Question Library 中勾选的题目。
   - `All questions`：使用全部题目。
4. 设置数量、语言和答案显示方式。
5. 如果想玩“根据选项猜题”，勾选 `Guess the question from options`。选择题会先只显示选项；按 `H` 或点击 `Show Question` 显示题目，切换到下一题时会自动隐藏。
6. 点击 `Build Preview` 或 `Shuffle Preview`。
7. 使用 `Previous`、`Next` 和 `Show Reveal` 控制展示，也可以使用下面列出的快捷键。
8. 使用 `Present` 进入类似幻灯片的展示模式。
9. 在导出的演示中，玩家可以点击或用键盘选择选项并确认答案，再用 `Download Feedback` 导出作答统计。
10. 点击 `Export Folder`，把演示文件夹写到 `exports/slides/`。管理台会弹出成功提示，并提供 `Open Deck` 和 `Open in New Tab` 操作。

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

## Answer Feedback

Exported decks can collect simple answer feedback for choice questions.

导出的演示可以为选择题收集简单作答反馈。

In the exported deck:

1. Click one or more options.
2. Click `Confirm Answer`, or press `Enter` again after selecting. The answer reveal opens automatically after confirmation.
3. Continue through the deck.
4. Click `Download Feedback`.
5. Save the downloaded `*-answer-feedback.json` file.

在导出演示中：

1. 点击一个或多个选项。
2. 点击 `Confirm Answer`，或者选择后再次按 `Enter`。确认后答案会自动显示。
3. 继续完成演示。
4. 点击 `Download Feedback`。
5. 保存下载的 `*-answer-feedback.json` 文件。

Back in the admin UI:

1. Open `Maintenance`.
2. Choose the downloaded feedback JSON under `Answer Feedback Import`.
3. Click `Import Feedback`.
4. Click `Run Check`.

回到管理 UI：

1. 打开 `Maintenance`。
2. 在 `Answer Feedback Import` 里选择下载的反馈 JSON。
3. 点击 `Import Feedback`。
4. 点击 `Run Check`。

The import adds to each question's `feedback.answered_count` and `feedback.correct_count`. It does not automatically change `difficulty`.

导入会累加每道题的 `feedback.answered_count` 和 `feedback.correct_count`，不会自动修改 `difficulty`。

## Notes

- One slide displays one question.
- A single question can be previewed directly at `/question/?id=<question-id>`.
- Preview and Present do not write files. Only `Export Folder` creates a folder under `exports/slides/`.
- Exported decks copy the referenced media into the export folder. If media is missing locally, the export result reports the missing count and those items will show broken media.
- Exported decks can record local answer feedback for choice questions. `Download Feedback` saves a JSON file with answered and correct counts; import it from `Maintenance` to add those counts back to question `feedback`.
- `Hidden until show` keeps answers hidden until `Show Reveal` is clicked, and automatically hides the answer again when you move to another question.
- `Inline on each slide` is useful for review decks.
- `Guess the question from options` applies to `single_choice`, `multiple_choice`, `true_false`, and `ordering` questions. It hides the question title, prompt, and question-level media while keeping option text and option media visible.
- Keyboard shortcuts work in preview, Present mode, and exported decks:
  - `Right`, `PageDown`, `Space`, or `N`: next slide.
  - `Left`, `PageUp`, `P`, or `Backspace`: previous slide.
  - `F` or `R`: show or hide the answer.
  - `H`: show or hide the question in Guess the question from options mode.
  - `Esc`: hide the answer; in Present mode, exits Present when the answer is already hidden.
  - `W/A/S/D`: move option focus by the on-screen layout.
  - `1-9`: select an option by its on-screen order.
  - `Enter`: select the focused option; press again or use `Confirm Answer` to submit in exported decks.
  - `?`: show the shortcut help in exported decks.

说明：

- 一页只显示一道题。
- 单题可以通过 `/question/?id=<题目ID>` 直接预览。
- 预览和演示模式不会写入文件，只有点击 `Export Folder` 才会在 `exports/slides/` 下生成文件夹。
- 导出演示会复制本次使用到的媒体文件。如果本地媒体缺失，导出结果会显示缺失数量，对应位置会显示断开的媒体。
- 导出演示可以在本地记录选择题作答反馈。`Download Feedback` 会保存包含回答次数和答对次数的 JSON；在 `Maintenance` 页面导入后，会把这些计数累加回题目的 `feedback` 字段。
- `Hidden until show` 会默认隐藏答案，点击 `Show Reveal` 才显示，并且每次切换题目都会重新收起答案。
- `Inline on each slide` 适合审题或复习场景。
- `Guess the question from options` 适用于 `single_choice`、`multiple_choice`、`true_false` 和 `ordering` 题型。它会隐藏题目标题、题干和题目级媒体，但保留选项文字和选项媒体。
- 预览、Present 模式和导出演示都支持键盘快捷键：
  - `Right`、`PageDown`、`Space` 或 `N`：下一题。
  - `Left`、`PageUp`、`P` 或 `Backspace`：上一题。
  - `F` 或 `R`：显示/隐藏答案。
  - `H`：在“根据选项猜题”模式中显示/隐藏题目。
  - `Esc`：隐藏答案；在 Present 模式中，如果答案已隐藏则退出 Present。
  - `W/A/S/D`：按界面布局移动选项焦点。
  - `1-9`：按界面选项顺序选择。
  - `Enter`：选择当前焦点选项；在导出演示中再次按下或点击 `Confirm Answer` 提交答案。
  - `?`：在导出演示中显示快捷键帮助。
