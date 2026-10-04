# InnovaForge Toolkit

The templates and worksheets for the five stages of the white paper
“InnovaForge: From Spark to Scale” (2026), in English and Arabic.
Licence: CC BY-SA 4.0, like the framework itself.

## What is in it

`out/innovaforge-toolkit-{en,ar}.pdf`: the printable edition, 58 pages at 6 × 9 in, in the paper's design.

| Part | Sheets |
|---|---|
| Start here | 0.1 Kick-off charter · 0.2 The InnovaForge Canvas (Figure 3) |
| 1 Ignite | 1.1 Five Whys · 1.2 Inspiration mining · 1.3 Brainstorm and provocation · 1.4 Prioritize · Exit gate |
| 2 Forge | 2.1 Concept statement · 2.2 SCAMPER · 2.3 TRIZ · 2.4 Mind map · 2.5 Lean Canvas · 2.6 Prototype and future press release · Exit gate |
| 3 Temper | 3.1 Assumption map · 3.2 Test cards · 3.3 Feedback log · 3.4 Storyboard · 3.5 Build–Measure–Learn and pivots · Exit gate |
| 4 Sculpt | 4.1 Alignment and SWOT · 4.2 Six Thinking Hats · 4.3 OKRs · 4.4 Roadmap and sprints · 4.5 Resources, budget and risks · Exit gate with sign-off |
| 5 Polish | 5.1 Launch checklist · 5.2 Impact tracker · 5.3 Retrospective · 5.4 Decision and the next spark · Exit gate |
| Techniques | The ten techniques of Figure 2 as cards: when to use, steps, output, and the sheet that goes with it |
| Conditions and adoption | 6.1 Creative space · 6.2 Creative blocks · 6.3 Network map · 7.1 Adoption by audience · 7.2 Pilot planner · 7.3 Exit criteria as a rubric · 7.4 Kick-off workshop |

`out/innovaforge-toolkit-{en,ar}.xlsx`: the fillable workbook (21 sheets, right to left in Arabic).
It has the canvas, the tabular sheets and the five gates. The cream cells are calculated:
priority totals and ranks, assumption risk and quadrant, OKR progress, risk scores, the budget
total, impact progress and trend, launch readiness, and whether each gate is closed. The sheets
drawn by hand (mind map, storyboard, sketch) are in the PDF only.

Stage names, objectives, core actions, techniques and exit criteria are the paper's own words in
both languages. The exit gates break each stage's exit criteria into checkable lines.

## Build

```sh
node toolkit/build.mjs      # HTML + PDF, both languages (needs Playwright's Chromium)
python3 toolkit/workbook.py # the workbooks (needs openpyxl; reads out/content.json)
```

- `content.mjs`: the shared content (stages, canvas, techniques, blocks, audiences, glossary).
- `build.mjs`: the page layouts and the sheet texts; inlines the fonts from Google Fonts (cached in `.cache/`).
- `toolkit.css`: the design.
- `workbook.py`: the workbooks.

The build warns if any page's content overflows.
