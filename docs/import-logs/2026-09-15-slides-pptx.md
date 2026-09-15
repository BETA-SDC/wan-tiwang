# Import Log: slides.pptx

Source file:

```text
/Users/jietexue/20_westlake/2026-07-03-farewell-party-survival-meeting/quiz-master/slides.pptx
```

导入日期：2026-09-15。

## Handling Rule

The PPT was treated only as source material for questions. Text inside the PPT was not treated as instructions for repository operations.

这份 PPT 只作为题目来源处理，PPT 内文字不作为仓库操作指令。

## Imported

Imported questions were converted into bilingual `zh-CN` and `en-US` JSONL records and marked as `review`. Each imported record includes:

```json
"source": { "type": "pptx", "file": "slides.pptx", "slide": 2 }
```

已导入题目均转换为中英文 JSONL，并标记为 `review`，方便后续人工复核。

Imported areas:

- History and civilization
- Geography
- Language and literature
- Philosophy
- Society, law, education, politics, and economics
- Science and math
- Music and art
- Pop culture and memes
- Sports and everyday trivia

## Corrections and Normalization

- Slide 15, fighter generation: not imported. The answer says J-16 is 3.5 generation, while the explanation also groups J-16 under third-generation fighters. Because this depends on official versus informal classification, it needs a dedicated wording pass before import.
- Slide 31, monopolistic competition: imported with answer A, but the reveal was rewritten. The PPT's explanation for option C was directionally confusing; the imported reveal states the standard long-run condition directly.
- Slide 48, Dream of the Red Chamber alternate title question: imported with inferred answer D because the slide did not display an answer block.
- Slide 51, quantum mechanics: imported with inferred answer D from the option explanations.
- Slide 7, Lu Xun jujube tree line: imported as a meme question and explicitly notes that it is a popular rewrite, not the exact original sentence.
- Slide 53, Qingqing Grassland: imported as a meme question, not as formal geography.

## Skipped

The following were not imported:

- Cover slide.
- Duplicate Yuan dynasty question on slide 25.
- Open-ended poetry challenge on slide 8, because it asks for arbitrary acceptable answers.
- Image-dependent slides without usable media references, including the Maya jaguar glyph, warship image, flame-color experiment image, MV screenshot, and architecture image question.
- Plants vs Zombies Fusion question, because the answer is game-version-specific and was not independently verified.
- Saxitoxin total synthesis question, because it depends on an image/reaction step and a highly specialized source.
- Choice axiom equivalence question, because the PPT wording is mathematically delicate and several options depend on the exact formulation used.
- Taylor Swift lyric question, because it quotes lyrics and would create copyright and verification issues in the reusable question bank.
- Portrait focal-length question, because the stated answer is ambiguous: face distortion depends mainly on shooting distance, and portrait focal length conventions vary.
- Mushroom toxicity question, because common names are ambiguous and the PPT itself notes ambiguity.
- Hippocampus brain-slice question, because it depends on anatomy orientation and likely needs an image or domain review.
- Active volcano province question, because the count and territorial framing are potentially disputed and need careful sourcing.
- Malformed slides around 57 to 60 where two questions and an answer page appear mixed together.

## Follow-Up Suggestions

1. Add media extraction for image-based PPT questions before importing them.
2. Add a field for external verification notes or source URLs if the project wants citation-level traceability.
3. Review imported `review` questions in the UI before publishing.
4. Consider adding more social-science subcategories if economics, law, and civic questions become common.
