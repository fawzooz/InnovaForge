// Builds the InnovaForge Toolkit as self-contained 6 × 9 in HTML editions,
// one per language, in the white paper's design, then prints each to PDF.
//
//   node project/toolkit/innovaforge/build.mjs [--html-only]
//
// Out: out/innovaforge-toolkit-{en,ar}.html and .pdf, and content.json for workbook.py.
// Fonts (Manrope, Noto Kufi Arabic, Cormorant Garamond, Material Symbols Rounded)
// come from Google Fonts through curl, are cached in .cache/ and inlined.
// Needs Playwright's Chromium for the PDFs (PLAYWRIGHT_PATH or the global install).

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import * as C from './content.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'out');
const CACHE = path.join(DIR, '.cache');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

let L = 'en';
const T = o => (o == null ? '' : typeof o === 'string' ? o : o[L]);
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const num = x => (L === 'ar' ? String(x).replace(/[0-9]/g, d => AR_DIGITS[d]).replace(/\./g, '٫') : String(x));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const bi = (en, ar) => ({ en, ar });
const ic = (name, cls = '') => `<i class="ms ${cls}">${name}</i>`;
const stageOf = key => C.stages.find(s => s.key === key);

// ─── Building blocks ────────────────────────────────────────────────────────

/** A labelled writing box. h: height in px; dots: a sketch grid instead of lines. */
const box = (label, { icon, h = 80, hint, dots, cls = '', style = '', grow } = {}) => `
  <div class="box ${cls} ${grow ? 'grow' : ''}" style="${style}${grow ? `;flex-grow:${grow}` : ''}">
    <div class="bl">${icon ? ic(icon) : ''}<span>${esc(T(label))}</span></div>
    ${hint ? `<div class="hint">${esc(T(hint))}</div>` : ''}
    <div class="${dots ? 'dots' : 'lines'}" style="height:${h}px"></div>
  </div>`;

/** A table with a header row and empty ruled rows. cols: [{ l, w, pre? }]; pre: prefilled first cells. */
const table = (cols, rows, { rh = 26, pre = [], numbered = false, cls = '', grow } = {}) => {
  const tpl = cols.map(c => c.w || '1fr').join(' ');
  const head = cols.map(c => `<div class="th">${esc(T(c.l))}</div>`).join('');
  let body = '';
  for (let r = 0; r < rows; r++) {
    body += cols.map((c, i) => {
      let v = '';
      if (i === 0 && pre[r]) v = `<span class="pre">${esc(T(pre[r]))}</span>`;
      else if (i === 0 && numbered) v = `<span class="rn">${num(r + 1)}</span>`;
      return `<div class="td">${v}</div>`;
    }).join('');
  }
  const gs = grow ? `;grid-template-rows:auto repeat(${rows},minmax(${rh}px,1fr));flex:${grow} 1 0` : '';
  return `<div class="tbl ${cls}" style="grid-template-columns:${tpl};--rh:${rh}px${gs}">${head}${body}</div>`;
};

const checks = (items, { gap = 7 } = {}) => `<ul class="checks" style="gap:${gap}px">${items.map(i => `<li><span class="cb"></span><span>${esc(T(i))}</span></li>`).join('')}</ul>`;
const note = (text, icon = 'info') => `<div class="note">${ic(icon)}<span>${esc(T(text))}</span></div>`;
const row = (...cells) => `<div class="row">${cells.join('')}</div>`;
const growRow = (g, ...cells) => `<div class="row grow" style="flex:${g} 1 0">${cells.join('')}</div>`;
const rowT = (tpl, ...cells) => `<div class="row" style="grid-template-columns:${tpl}">${cells.join('')}</div>`;
const line = (label, w = '1fr') => `<div class="fl" style="flex:${w === '1fr' ? 1 : `0 0 ${w}`}"><span>${esc(T(label))}</span><b></b></div>`;
const lines = (...items) => `<div class="fls">${items.join('')}</div>`;
const tick = (...opts) => `<div class="ticks">${opts.map(o => `<span><span class="cb"></span>${esc(T(o))}</span>`).join('')}</div>`;

// ─── Pages ─────────────────────────────────────────────────────────────────

const pages = []; // { html, kind, toc? }
const toc = []; // { level, code, title, page }

function push(html, { kind = 'sheet', runner = '', tocEntry } = {}) {
  const n = pages.length + 1;
  if (tocEntry) toc.push({ ...tocEntry, page: n });
  pages.push({ html, kind, runner, n });
}

/** A worksheet page with its header. */
function sheet(code, stageKey, title, instr, body, { tocTitle } = {}) {
  const st = stageKey ? stageOf(stageKey) : null;
  const runner = `${T(C.meta.runner)} · ${st ? `${T(w.stage)} ${num(st.n)} · ${T(st.name)}` : T(title)}`;
  const chip = `<span class="code">${st ? ic(st.icon) : ''}${num(code)}</span>`;
  push(`
    <div class="sh">
      <div class="sh-top">${chip}${lines(line(w.project), line(w.date, '110px'))}</div>
      <h2>${esc(T(title))}</h2>
      ${instr ? `<p class="instr">${esc(T(instr))}</p>` : ''}
    </div>
    <div class="body">${body}</div>`, { runner, tocEntry: { level: 2, code, title: T(tocTitle || title) } });
}
const w = C.w;

// ─── Front matter ──────────────────────────────────────────────────────────

function cover() {
  const arc = (r, o) => `<circle cx="80" cy="408" r="${r}" fill="none" stroke="#f5a623" stroke-opacity="${o}" stroke-width="1"/>`;
  const rays = Array.from({ length: 22 }, (_, i) => {
    const a = (-38 + i * 3.6) * Math.PI / 180;
    return `<line x1="80" y1="408" x2="${80 + Math.cos(a) * 640}" y2="${408 + Math.sin(a) * 640}" stroke="${i % 5 === 2 ? '#f5a623' : '#8e8b85'}" stroke-opacity="${i % 5 === 2 ? 0.7 : 0.18}" stroke-width="${i % 5 === 2 ? 1.2 : 0.7}"/>`;
  }).join('');
  const nodes = C.stages.map((s, i) => `<circle cx="${205 + i * 79}" cy="408" r="${3 + i * 1.6}" fill="${i === 4 ? '#f5a623' : '#111418'}" stroke="#f5a623" stroke-width="1.3"/>`).join('');
  const cards = C.stages.map(s => `<div class="cv-st">${ic(s.icon)}<span>${esc(T(s.name))}</span></div>`).join('');
  push(`
    <div class="cover">
      <svg class="cv-art" viewBox="0 0 576 864" width="576" height="864" aria-hidden="true">
        <defs><radialGradient id="glow"><stop offset="0" stop-color="#f5a623" stop-opacity=".55"/><stop offset="1" stop-color="#f5a623" stop-opacity="0"/></radialGradient></defs>
        <circle cx="80" cy="408" r="70" fill="url(#glow)"/>${rays}${arc(130, .25)}${arc(210, .18)}${arc(300, .14)}${arc(400, .1)}${nodes}
        <circle cx="80" cy="408" r="4" fill="#f5a623"/>
      </svg>
      <div class="cv-top">
        <div class="cv-title">${L === 'ar' ? 'إنوفا فورج' : 'InnovaForge'}</div>
        <div class="cv-rule"><span></span><i></i><span></span></div>
        <div class="cv-kind">${esc(T(C.meta.edition))}</div>
      </div>
      <div class="cv-bottom">
        <div class="cv-sub">${esc(T(C.meta.subtitle))}</div>
        <div class="cv-sts">${cards}</div>
        <div class="cv-author">${esc(T(C.meta.author))}</div>
        <div class="cv-site"><span></span>${C.meta.site}<span></span></div>
      </div>
    </div>`, { kind: 'dark' });
}

function licence() {
  push(`
    <div class="front">
      <p class="eyebrow">${L === 'ar' ? 'حقوق الطبع والترخيص' : 'Copyright and licence'}</p>
      <h1>${esc(T(C.meta.title))}</h1>
      <p class="lead">${esc(T(bi(
        'The templates and worksheets of “InnovaForge: From Spark to Scale” (2026), the white paper on a five-stage framework for innovation by Prof. Dr. Mohamed Fawzi Elgendi. This toolkit replaces the worksheets first published with InnovaForge Framework V1.0.',
        'قوالب «إنوفا فورج: من الشرارة إلى التوسّع» (٢٠٢٦) وأوراق عملها، وهي الورقة البيضاء حول إطار عمل للابتكار من خمس مراحل، إعداد أ.د. محمد فوزى الجندى. وتحلّ هذه الحقيبة محلّ أوراق العمل التي نُشرت أول مرة مع الإصدار ١٫٠ من إطار إنوفا فورج.')))}</p>
      <div class="lic">
        ${ic('copyright')}
        <div>
          <b>${L === 'ar' ? 'مفتوح بالكامل' : 'Open, all of it'}</b>
          <p>${esc(T(bi(
            'The InnovaForge Framework and its templates are licensed under Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0). Every page of this toolkit is a template: you may copy, print, adapt and share it, including commercially, provided you credit the source and share adaptations under the same licence.',
            'إطار «إنوفا فورج» وقوالبه مرخّصة بموجب رخصة المشاع الإبداعي: نسب المصنَّف - الترخيص بالمثل (CC BY-SA 4.0). وكل صفحة في هذه الحقيبة قالب: يحق لك نسخها وطباعتها وتعديلها ومشاركتها، ولو لأغراض تجارية، بشرط نسبتها إلى مصدرها ومشاركة أي تعديل بالرخصة نفسها.')))}</p>
        </div>
      </div>
      <div class="cite">
        <span class="label">${L === 'ar' ? 'الاستشهاد المقترح' : 'Suggested citation'}</span>
        <p>${esc(T(bi(
          'Elgendi, M. F. (2026). InnovaForge Toolkit: Templates and worksheets for the five stages. www.fawzooz.ai',
          'الجندى، م. ف. (٢٠٢٦). حقيبة أدوات إنوفا فورج: قوالب وأوراق عمل للمراحل الخمس. www.fawzooz.ai')))}</p>
      </div>
      <div class="cite">
        <span class="label">${L === 'ar' ? 'معها' : 'Companion files'}</span>
        <p>${esc(T(bi(
          'A fillable workbook with the same sheets, in English and Arabic, accompanies this edition. The white paper itself, with the cases and the evidence, is on www.fawzooz.ai.',
          'يرافق هذه النسخة مصنَّف قابل للتعبئة بالأوراق نفسها، بالعربية والإنجليزية. أما الورقة البيضاء نفسها، بحالاتها وشواهدها، فعلى www.fawzooz.ai.')))}</p>
      </div>
      <p class="small muted">${esc(T(bi(
        'The cases and techniques referred to are summarized from the published sources listed at the end. Trademarks belong to their respective owners.',
        'الحالات والتقنيات المشار إليها ملخّصة من المصادر المنشورة المذكورة في النهاية. والعلامات التجارية مملوكة لأصحابها.')))}</p>
    </div>`, { runner: `${T(C.meta.runner)} · ${L === 'ar' ? 'حقوق الطبع والترخيص' : 'Copyright'}` });
}

let tocPage = 0;
function contentsPlaceholder() {
  tocPage = pages.length;
  push('<!--TOC-->', { runner: `${T(C.meta.runner)} · ${T(w.contents)}` });
  push('<!--TOC-->', { runner: `${T(C.meta.runner)} · ${T(w.contents)}` });
}

function howTo() {
  const cyc = C.stages.map((s, i) => `
    <div class="hw-st">
      <div class="hw-ic">${ic(s.icon)}</div>
      <b>${esc(T(s.name))}</b>
      <span>${esc(T(s.action))}</span>
    </div>${i < 4 ? `<div class="hw-ar">${ic(L === 'ar' ? 'arrow_back' : 'arrow_forward')}</div>` : ''}`).join('');
  const steps = [
    bi('Open a project with the kick-off charter (0.1) and the canvas (0.2). Fill in Ignite together at kick-off.', 'افتتح المشروع بميثاق الانطلاق (٠٫١) واللوحة (٠٫٢)، واملأ قسم «الإشعال» معاً عند الانطلاق.'),
    bi('Work through the stage’s sheets. Use the ones the project needs; each sheet says what it feeds on the canvas.', 'اعمل على أوراق المرحلة، واستخدم منها ما يحتاجه المشروع؛ فكل ورقة تذكر الخانة التي تُغذّيها في اللوحة.'),
    bi('Close each stage at its exit gate. If a criterion is not met, loop back: iteration is the method, not a failure.', 'أغلق كل مرحلة عند بوابة خروجها؛ فإن لم يتحقق معيار، فعُد إلى الوراء: التكرار هو المنهج لا الإخفاق.'),
    bi('Revisit the canvas at every milestone, and use it to report progress to stakeholders.', 'عُد إلى اللوحة عند كل محطة، واستخدمها لعرض التقدّم على أصحاب المصلحة.'),
    bi('After the launch, hold the retrospective and carry its findings into the next Ignite.', 'بعد الإطلاق، اعقد المراجعة اللاحقة، وانقل نتائجها إلى الإشعال التالي.'),
  ];
  const principles = [
    ['groups', bi('Collaborate with purpose', 'تعاوَن بهدف'), bi('Psychological safety and diverse perspectives produce stronger ideas.', 'الأمان النفسي وتنوّع وجهات النظر يصنعان أفكاراً أمتن.')],
    ['autorenew', bi('Embrace iteration', 'احتضِن التكرار'), bi('Failure is data, not an endpoint.', 'الفشل بيانات وليس نهاية.')],
    ['tune', bi('Adapt and evolve', 'تكيَّف وتطوَّر'), bi('A guide, not a rigid process: scale the sheets to the project.', 'دليل وليس إجراءً جامداً: كيّف الأوراق مع حجم المشروع.')],
  ];
  push(`
    <div class="front">
      <p class="eyebrow">${L === 'ar' ? 'قبل أن تبدأ' : 'Before you start'}</p>
      <h1>${L === 'ar' ? 'كيف تستخدم الحقيبة' : 'How to use the toolkit'}</h1>
      <p class="lead">${esc(T(bi(
        'InnovaForge is five iterative stages that form a continuous cycle. This toolkit gives every stage its worksheets and closes each one with a gate built from its exit criteria. The canvas is the single source of truth that ties them together.',
        '«إنوفا فورج» خمس مراحل تكرارية تشكّل دورة مستمرة. وتمنح هذه الحقيبة كل مرحلة أوراق عملها، وتختم كلاً منها ببوابة مبنية على معايير خروجها. واللوحة هي المرجع الموحّد الذي يربط بينها.')))}</p>
      <div class="hw">${cyc}</div>
      <p class="hw-loop">${ic('replay')}${esc(T(bi('Learnings from Polish feed the next Ignite.', 'تُغذّي دروسُ الصقل الإشعالَ التالي.')))}</p>
      <ol class="steps">${steps.map(s => `<li>${esc(T(s))}</li>`).join('')}</ol>
      <div class="pr3">${principles.map(([i, n, t]) => `<div>${ic(i)}<b>${esc(T(n))}</b><span>${esc(T(t))}</span></div>`).join('')}</div>
    </div>`, { runner: `${T(C.meta.runner)} · ${L === 'ar' ? 'كيف تستخدم الحقيبة' : 'How to use'}`, tocEntry: { level: 1, title: L === 'ar' ? 'كيف تستخدم الحقيبة' : 'How to use the toolkit' } });
}

// ─── Part and stage dividers ───────────────────────────────────────────────

function partPage(roman, icon, title, items) {
  push(`
    <div class="part">
      <div class="pt-n">${roman}</div>
      <div class="pt-ic">${ic(icon)}</div>
      <h1>${esc(T(title))}</h1>
      <div class="pt-rule"></div>
      <ul>${items.map(i => `<li>${esc(T(i))}</li>`).join('')}</ul>
    </div>`, { kind: 'dark', tocEntry: { level: 1, title: T(title) } });
}

function stagePage(st, sheetList) {
  const bars = C.stages.map(s => `<i class="${s.n <= st.n ? 'on' : ''}"></i>`).join('');
  const li = (icon, label, text) => `<div class="sp-li">${ic(icon)}<div><b>${esc(T(label))}</b> ${esc(T(text))}</div></div>`;
  push(`
    <div class="sp-card">
      <div class="sp-k">${T(w.stage)} ${num(st.n)} ${T(w.of5)}</div>
      <div class="sp-badge">${ic(st.icon)}</div>
      <h1>${esc(T(st.name))}</h1>
      <div class="sp-tag">${esc(T(st.tagline))}</div>
      <div class="sp-bars">${bars}</div>
    </div>
    <div class="sp-obj">
      <div class="sp-row">${ic('target')}<div><span class="label">${T(w.objective)}</span><p>${esc(T(st.objective))}</p></div></div>
      <div class="sp-row">${ic('bolt')}<div><span class="label">${T(w.action)}</span><p class="strong">${esc(T(st.action))}</p></div></div>
    </div>
    ${li('checklist', bi('Activities:', 'الأنشطة:'), st.activities)}
    ${st.techniques ? li('construction', bi('Techniques:', 'التقنيات:'), st.techniques) : ''}
    ${li('flag', bi('Exit criteria:', 'معايير الخروج:'), st.exit)}
    <div class="sp-sheets">
      <span class="label">${T(w.sheetsHere)}</span>
      ${sheetList.map(([code, title]) => `<div><span class="code sm">${num(code)}</span>${esc(T(title))}</div>`).join('')}
    </div>`, { runner: `${T(C.meta.runner)} · ${T(w.stage)} ${num(st.n)} · ${T(st.name)}`, tocEntry: { level: 1, title: `${T(w.stage)} ${num(st.n)} · ${T(st.name)}`, sub: T(st.tagline) } });
}

function gatePage(st, extra = '') {
  const next = C.stages[st.n % 5];
  push(`
    <div class="sh">
      <div class="sh-top"><span class="code gate">${ic('flag')}${T(w.gate)} ${num(st.n)}</span>${lines(line(w.project), line(w.date, '110px'))}</div>
      <h2>${esc(T(bi(`Close ${st.name.en}`, `إغلاق ${st.name.ar}`)))}</h2>
      <p class="instr">${esc(T(st.exit))}</p>
    </div>
    <div class="body">
      <div class="gate-box">
        <span class="label">${L === 'ar' ? 'هل تحقق كل معيار؟' : 'Is every criterion met?'}</span>
        <ul class="gate-list">${st.gate.map(g => `<li><span>${esc(T(g))}</span><span class="yn"><span class="cb"></span>${L === 'ar' ? 'نعم' : 'Yes'}<span class="cb"></span>${L === 'ar' ? 'ليس بعد' : 'Not yet'}</span></li>`).join('')}</ul>
      </div>
      ${box(bi('Evidence: where each criterion is shown', 'الدليل: أين يظهر كل معيار'), { icon: 'fact_check', h: 66, grow: 1 })}
      <div class="decide">
        <span class="label">${L === 'ar' ? 'القرار' : 'Decision'}</span>
        ${tick(
          st.n === 5 ? bi('Iterate', 'التكرار') : bi(`Go to ${next.name.en}`, `الانتقال إلى ${next.name.ar}`),
          st.n === 5 ? bi('Scale', 'التوسّع') : bi('Loop back within this stage', 'العودة داخل هذه المرحلة'),
          st.n === 5 ? bi('Sunset', 'الإيقاف') : bi(`Return to ${C.stages[Math.max(0, st.n - 2)].name.en}`, `الرجوع إلى ${C.stages[Math.max(0, st.n - 2)].name.ar}`),
        )}
      </div>
      ${box(bi('What we still need, and by when', 'ما ينقصنا، وموعده'), { icon: 'pending_actions', h: 44 })}
      ${extra}
      ${note(bi(`Copy the stage’s results into the ${st.name.en} row of the canvas (0.2) before you move on.`, `انقل نتائج المرحلة إلى صف «${st.name.ar}» في اللوحة (٠٫٢) قبل أن تنتقل.`), 'dashboard')}
    </div>`, { runner: `${T(C.meta.runner)} · ${T(w.stage)} ${num(st.n)} · ${T(st.name)}`, tocEntry: { level: 2, code: '✓', title: `${T(w.gate)}: ${T(st.name)}` } });
}

const feeds = (...labels) => `<div class="feeds">${ic('dashboard')}<span>${T(w.feedsCanvas)}:</span> ${labels.map(l => `<b>${esc(T(l))}</b>`).join(' · ')}</div>`;
const cv = (r, c) => C.canvas[r][c];

// ─── Stage 0: kick-off and canvas ──────────────────────────────────────────

function kickoff() {
  sheet('0.1', null, bi('Kick-off charter', 'ميثاق الانطلاق'), bi(
    'One page to open the project: who is in the room, what the challenge is, and when each stage should close.',
    'صفحة واحدة لافتتاح المشروع: مَن في الغرفة، وما التحدي، ومتى يُفترض أن تُغلق كل مرحلة.'), `
    ${box(bi('The challenge, as a question: “How might we…?”', 'التحدي في صيغة سؤال: «كيف يمكننا…؟»'), { icon: 'help', h: 44 })}
    ${row(box(bi('Who it is for', 'لمن'), { icon: 'person', h: 44 }), box(bi('Why now', 'لماذا الآن'), { icon: 'schedule', h: 44 }))}
    <div class="lbl">${ic('groups')}${L === 'ar' ? 'الفريق: نوّع وجهات النظر، من الهندسة إلى التسويق إلى دعم العملاء' : 'The team: mix perspectives, from engineering to marketing to customer support'}</div>
    ${table([{ l: bi('Name', 'الاسم'), w: '1.2fr' }, { l: bi('Role in the project', 'الدور في المشروع'), w: '1fr' }, { l: bi('Perspective they bring', 'المنظور الذي يقدّمه'), w: '1.2fr' }], 5, { rh: 22, grow: 1 })}
    <div class="lbl">${ic('event')}${L === 'ar' ? 'المحطات: موعد إغلاق كل مرحلة ومراجعة اللوحة' : 'Milestones: when each stage closes and the canvas is reviewed'}</div>
    ${table([{ l: bi('Stage', 'المرحلة'), w: '1fr' }, { l: bi('Gate date', 'موعد البوابة'), w: '0.8fr' }, { l: bi('Canvas review with', 'مراجعة اللوحة مع'), w: '1.4fr' }], 5, { rh: 21, pre: C.stages.map(s => bi(`${s.n} · ${s.name.en}`, `${num(s.n)} · ${s.name.ar}`)) })}
    <div class="lbl">${ic('handshake')}${L === 'ar' ? 'قواعدنا' : 'Our ground rules'}</div>
    ${checks([
      bi('Anyone can speak up, and no idea is laughed at.', 'لكلٍّ أن يتكلم، ولا يُسخَر من فكرة.'),
      bi('Failure is data: we write down what each failed test taught us.', 'الفشل بيانات: ندوّن ما علّمنا إياه كل اختبار فاشل.'),
      bi('We adapt the sheets to the project, not the project to the sheets.', 'نكيّف الأوراق مع المشروع، لا المشروع مع الأوراق.'),
    ], { gap: 5 })}`);
}

function canvasSheet() {
  const rows = C.stages.map((s, i) => `
    <div class="cv-row">
      <div class="cv-stage">${ic(s.icon, 'b')}<span class="k">${T(w.stage)} ${num(s.n)}</span><b>${esc(T(s.name))}</b></div>
      ${C.canvas[i].map(f => `<div class="cv-cell"><div class="bl">${ic(f.icon)}<span>${esc(f[L])}</span></div><div class="lines"></div></div>`).join('')}
    </div>`).join('');
  sheet('0.2', null, bi('The InnovaForge Canvas', 'لوحة إنوفا فورج'), bi(
    'The single source of truth: fill in Ignite together at kick-off, revisit it at every milestone, and use it to report progress.',
    'المرجع الموحّد: املأ قسم «الإشعال» معاً عند الانطلاق، وعُد إليها عند كل محطة، واستخدمها لعرض التقدّم.'), `<div class="canvas">${rows}</div>`);
}

// ─── Stage 1: Ignite ───────────────────────────────────────────────────────

function ignite() {
  const st = stageOf('ignite');
  const list = [['1.1', bi('Five Whys: find the root cause', 'اللماذات الخمس: ابحث عن السبب الجذري')], ['1.2', bi('Inspiration mining', 'التنقيب عن الإلهام')], ['1.3', bi('Brainstorm and provocation', 'العصف الذهني والاستفزاز')], ['1.4', bi('Prioritize problems and opportunities', 'ترتيب المشكلات والفرص بالأولوية')]];
  stagePage(st, list);

  const whys = Array.from({ length: 5 }, (_, i) => `
    <div class="why"><span class="why-n">${L === 'ar' ? 'لماذا؟' : 'Why?'} ${num(i + 1)}</span><div class="lines" style="height:22px"></div></div>`).join('');
  sheet('1.1', 'ignite', list[0][1], bi(
    'Start from a fact you have seen. Ask “why?” of each answer until you reach something you can act on and prevent.',
    'ابدأ من حقيقة رأيتها، واسأل «لماذا؟» عن كل جواب حتى تبلغ شيئاً يمكنك العمل عليه ومنعه.'), `
    ${box(bi('The problem we observed', 'المشكلة التي لاحظناها'), { icon: 'visibility', h: 44 })}
    <div class="whys grow-g">${whys}</div>
    ${box(bi('Root cause, in one sentence', 'السبب الجذري، في جملة واحدة'), { icon: 'park', h: 44, cls: 'accent' })}
    ${tick(bi('We can act on it', 'يمكننا العمل عليه'), bi('We can prevent it', 'يمكننا منعه'), bi('Each “because” leads to the next', 'كل «لأن» تؤدي إلى ما بعدها'))}
    <div class="eg">${ic('precision_manufacturing')}<span><b>${T(w.example)} · Toyota:</b> ${esc(T(bi(
      'the machine stopped → the fuse blew → a bearing was not lubricated → the pump was not pumping → its shaft was worn → scrap got in: there was no strainer. The fix was a strainer, not a new fuse (Ohno, 1988).',
      'توقّفت الآلة ← احترق المصهر ← لم يُشحَّم محمل ← المضخة لا تضخ ← تآكل عمودها ← دخلتها برادة لعدم وجود مصفاة. فكان الحل مصفاة لا مصهراً جديداً (أونو، ١٩٨٨).')))}</span></div>
    ${feeds(cv(0, 0))}`);

  sheet('1.2', 'ignite', list[1][1], bi(
    'Look across reports, competitors, customers and fields nobody here reads. Write what you saw, then what it suggests for your problem.',
    'انظر في التقارير والمنافسين والعملاء ومجالات لا يقرؤها أحد هنا. دوّن ما رأيت، ثم ما يوحي به لمشكلتك.'), `
    ${table([{ l: bi('Source', 'المصدر'), w: '0.9fr' }, { l: bi('What we saw', 'ما رأيناه'), w: '1.3fr' }, { l: bi('What it suggests', 'ما يوحي به'), w: '1.3fr' }], 8, {
      rh: 43, grow: 1, pre: [bi('Reports and research', 'التقارير والأبحاث'), bi('Competitors', 'المنافسون'), bi('Customers', 'العملاء'), bi('Customers', 'العملاء'), bi('An unrelated field', 'مجال بعيد'), bi('An unrelated field', 'مجال بعيد')] })}
    ${box(bi('The pattern across sources', 'النمط المشترك بين المصادر'), { icon: 'hub', h: 44, cls: 'accent' })}
    ${feeds(cv(0, 1))}`);

  const cells = Array.from({ length: 16 }, (_, i) => `<div class="idea"><span>${num(i + 1)}</span></div>`).join('');
  sheet('1.3', 'ignite', list[2][1], bi(
    'Brainstorm first, with judgment switched off; then use a provocation to reach ideas brainstorming will not. Judge only at the end.',
    'اعصف ذهنياً أولاً والحكم مُطفأ، ثم استخدم استفزازاً ذهنياً لتبلغ أفكاراً لا يبلغها العصف. ولا تحكم إلا في النهاية.'), `
    ${box(bi('How might we…?', 'كيف يمكننا…؟'), { icon: 'help', h: 22 })}
    <div class="rules">${[bi('Defer judgment', 'أرجئ الحكم'), bi('Build on others’ ideas', 'ابنِ على أفكار الآخرين'), bi('Go for quantity', 'اطلب الكمّ')].map(r => `<span>${ic('check_circle')}${esc(T(r))}</span>`).join('')}</div>
    <div class="ideas grow-g">${cells}</div>
    <div class="po">
      <div class="po-h">${ic('bolt')}<b>${L === 'ar' ? 'الاستفزاز الذهني' : 'Provocation'}</b><span>${esc(T(bi('de Bono (1970)', 'دي بونو (١٩٧٠)')))}</span></div>
      ${row(box(bi('What everyone takes for granted', 'ما يعدّه الجميع مسلّماً به'), { h: 33 }), box(bi('Po: reverse, remove or exaggerate it', 'بو: اعكسه أو احذفه أو بالغ فيه'), { h: 33 }), box(bi('What would follow from it', 'ما الذي يترتّب عليه'), { h: 33 }))}
    </div>
    ${feeds(cv(0, 2))}`);

  sheet('1.4', 'ignite', list[3][1], bi(
    'Score each candidate from 1 (low) to 5 (high) on each criterion, add the scores, and keep the top one to three.',
    'قيّم كل مرشّح من ١ (منخفض) إلى ٥ (مرتفع) في كل معيار، واجمع الدرجات، واحتفظ بالأعلى من واحد إلى ثلاثة.'), `
    ${table([{ l: bi('Problem or opportunity', 'المشكلة أو الفرصة'), w: '2.2fr' }, { l: bi('Impact', 'الأثر'), w: '.62fr' }, { l: bi('Urgency', 'الإلحاح'), w: '.62fr' }, { l: bi('Evidence', 'الدليل'), w: '.62fr' }, { l: bi('Fit', 'المواءمة'), w: '.62fr' }, { l: bi('Total', 'المجموع'), w: '.62fr' }], 7, { rh: 32, numbered: true, grow: 1 })}
    <div class="crit">${[
      [bi('Impact', 'الأثر'), bi('How much it matters to the people affected.', 'مدى أهميته للمتأثرين به.')],
      [bi('Urgency', 'الإلحاح'), bi('What it costs to wait.', 'كلفة الانتظار.')],
      [bi('Evidence', 'الدليل'), bi('How sure we are it is real.', 'مدى يقيننا بأنه حقيقي.')],
      [bi('Fit', 'المواءمة'), bi('How well it fits our mission and means.', 'مدى انسجامه مع رسالتنا وإمكاناتنا.')],
    ].map(([a, b]) => `<span><b>${esc(T(a))}:</b> ${esc(T(b))}</span>`).join('')}</div>
    <div class="lbl">${ic('format_list_numbered')}${L === 'ar' ? 'أولوياتنا، من واحدة إلى ثلاث' : 'Our priorities, one to three'}</div>
    <div class="ranked">${[1, 2, 3].map(n => `<div><span class="rk">${num(n)}</span><div class="lines" style="height:22px"></div></div>`).join('')}</div>
    ${feeds(cv(0, 0), cv(0, 2))}`);

  gatePage(st);
}

// ─── Stage 2: Forge ────────────────────────────────────────────────────────

function forge() {
  const st = stageOf('forge');
  const list = [['2.1', bi('Concept statement', 'بيان المفهوم')], ['2.2', bi('SCAMPER', 'سكامبر')], ['2.3', bi('TRIZ: resolve the contradiction', 'تريز: حلّ التناقض')], ['2.4', bi('Mind map', 'الخريطة الذهنية')], ['2.5', bi('Lean Canvas in thirty minutes', 'اللوحة الرشيقة في ثلاثين دقيقة')], ['2.6', bi('Low-fi prototype and future press release', 'النموذج المبسّط والبيان الصحفي المستقبلي')]];
  stagePage(st, list);

  const blank = t => `<span class="blank">${esc(T(t))}</span>`;
  sheet('2.1', 'forge', list[0][1], bi(
    'Define the concept’s purpose, audience and features, then say its value in one sentence somebody outside the team can hold.',
    'حدّد غاية المفهوم وجمهوره وخصائصه، ثم قل قيمته في جملة واحدة يفهمها من هو خارج الفريق.'), `
    ${row(box(bi('Purpose: what it is for', 'الغاية: لأيّ شيء هو'), { icon: 'flag', h: 55 }), box(bi('Audience: who it is for', 'الجمهور: لمن هو'), { icon: 'person', h: 55 }))}
    ${box(bi('Features: what it does', 'الخصائص: ما الذي يفعله'), { icon: 'list', h: 66, grow: 1 })}
    <div class="tpl">
      <span class="label">${L === 'ar' ? 'صيغة البيان' : 'The statement'}</span>
      <p>${L === 'ar'
        ? `لـ${blank('الجمهور')} الذين ${blank('الحاجة')}، فإن ${blank('اسم المفهوم')} هو ${blank('نوع الشيء')} الذي ${blank('الفائدة الأساسية')}. وبخلاف ${blank('البديل الحالي')}، فإنه ${blank('الفرق')}.`
        : `For ${blank('audience')} who ${blank('need')}, ${blank('concept name')} is a ${blank('kind of thing')} that ${blank('key benefit')}. Unlike ${blank('current alternative')}, it ${blank('the difference')}.`}</p>
      <div class="lines" style="height:66px"></div>
    </div>
    ${box(bi('The value proposition, in one sentence', 'عرض القيمة، في جملة واحدة'), { icon: 'diamond', h: 44, cls: 'accent' })}
    ${feeds(cv(1, 0), cv(1, 1))}`);

  const scamper = [
    ['S', bi('Substitute', 'استبدل'), bi('What part, material or person could be swapped?', 'أيّ جزء أو مادة أو شخص يمكن استبداله؟')],
    ['C', bi('Combine', 'ادمج'), bi('What could it be merged with?', 'بماذا يمكن دمجه؟')],
    ['A', bi('Adapt', 'كيّف'), bi('What else is like this, elsewhere?', 'ما الذي يشبهه في مكان آخر؟')],
    ['M', bi('Modify', 'عدّل'), bi('What could be bigger, smaller, faster, other?', 'ما الذي يمكن تكبيره أو تصغيره أو تسريعه أو تغييره؟')],
    ['P', bi('Put to another use', 'استخدم لغرض آخر'), bi('Who else could use it, and how?', 'مَن غيرنا يمكنه استخدامه، وكيف؟')],
    ['E', bi('Eliminate', 'احذف'), bi('What could be removed or simplified?', 'ما الذي يمكن حذفه أو تبسيطه؟')],
    ['R', bi('Reverse', 'اعكس'), bi('What if the order, roles or direction were flipped?', 'ماذا لو انقلب الترتيب أو الأدوار أو الاتجاه؟')],
  ];
  sheet('2.2', 'forge', list[1][1], bi(
    'Put one idea through the seven prompts. Write at least one answer for each, even a weak one, then star the two or three that change the value most.',
    'مرّر فكرة واحدة على المحفّزات السبعة. اكتب جواباً واحداً على الأقل لكلٍّ منها ولو كان ضعيفاً، ثم ضع نجمة على الاثنين أو الثلاثة الأكثر تغييراً للقيمة.'), `
    ${box(bi('The idea we are working on', 'الفكرة التي نعمل عليها'), { icon: 'lightbulb', h: 22 })}
    <div class="scamper grow-g">${scamper.map(([k, n, q]) => `
      <div class="sc"><span class="sc-k">${k}</span><div class="sc-q"><b>${esc(T(n))}</b><span>${esc(T(q))}</span></div><div class="lines" style="height:44px"></div><span class="star">${ic('star')}</span></div>`).join('')}</div>
    ${feeds(cv(1, 0))}`);

  const triz = [
    [1, bi('Segmentation', 'التجزئة'), bi('Divide it into independent parts.', 'قسّمه إلى أجزاء مستقلة.')],
    [2, bi('Taking out', 'الاستخلاص'), bi('Separate the part that causes trouble.', 'افصل الجزء الذي يسبّب المشكلة.')],
    [3, bi('Local quality', 'الجودة الموضعية'), bi('Make each part fit its own job.', 'اجعل كل جزء ملائماً لمهمته.')],
    [5, bi('Merging', 'الدمج'), bi('Bring similar operations together.', 'اجمع العمليات المتشابهة معاً.')],
    [6, bi('Universality', 'الشمولية'), bi('Let one part do several jobs.', 'اجعل جزءاً واحداً يؤدي عدة مهام.')],
    [10, bi('Prior action', 'الإجراء المسبق'), bi('Do the work, or part of it, in advance.', 'أنجز العمل، أو جزءاً منه، مسبقاً.')],
    [13, bi('The other way round', 'العكس'), bi('Invert the action or the order.', 'اعكس الفعل أو الترتيب.')],
    [15, bi('Dynamics', 'الديناميكية'), bi('Let it adapt or change as it is used.', 'اجعله يتكيّف أو يتغيّر أثناء الاستخدام.')],
  ];
  sheet('2.3', 'forge', list[2][1], bi(
    'When improving one thing makes another worse, write the contradiction, then try inventive principles that remove it rather than balance it.',
    'حين يؤدي تحسين أمر إلى إفساد آخر، اكتب التناقض، ثم جرّب مبادئ ابتكارية تُزيله بدل أن توازن بين طرفيه.'), `
    ${row(box(bi('We want to improve…', 'نريد تحسين…'), { icon: 'trending_up', h: 33 }), box(bi('…but then this gets worse', '…لكن عندئذٍ يسوء هذا'), { icon: 'trending_down', h: 33 }))}
    ${box(bi('The contradiction: “We want X, but then Y.”', 'التناقض: «نريد س، لكن عندئذٍ يحدث ص».'), { icon: 'join_inner', h: 22, cls: 'accent' })}
    <div class="triz grow-g hd">
      <div class="th">${L === 'ar' ? 'المبدأ (من مبادئ ألتشولر الأربعين)' : 'Principle (of Altshuller’s forty)'}</div><div class="th">${L === 'ar' ? 'فكرتنا به' : 'Our idea with it'}</div>
      ${triz.map(([n, a, b]) => `<div class="td tp"><span class="rn">${num(n)}</span><div><b>${esc(T(a))}</b><span>${esc(T(b))}</span></div></div><div class="td"></div>`).join('')}
    </div>
    ${box(bi('The solution that removes the contradiction', 'الحل الذي يُزيل التناقض'), { icon: 'task_alt', h: 33 })}
    ${feeds(cv(1, 0), cv(1, 1))}`);

  const br = [bi('Who', 'مَن'), bi('What', 'ماذا'), bi('Why', 'لماذا'), bi('How', 'كيف'), bi('Where', 'أين'), bi('How much', 'كم')];
  const cx = 242, cy = 236;
  const svg = br.map((b, i) => {
    const a = (-90 + i * 60) * Math.PI / 180;
    const x = cx + Math.cos(a) * 158, y = cy + Math.sin(a) * 158;
    const mx = cx + Math.cos(a) * 92, my = cy + Math.sin(a) * 92;
    return `<path d="M${cx + Math.cos(a) * 54} ${cy + Math.sin(a) * 54} Q ${mx + Math.cos(a + 0.5) * 18} ${my + Math.sin(a + 0.5) * 18} ${x} ${y}" fill="none" stroke="#f5a623" stroke-width="2.2"/>
      <circle cx="${x}" cy="${y}" r="27" fill="#fff" stroke="#e8d3ad"/><text x="${x}" y="${y + 4}" text-anchor="middle" class="mm-t">${esc(T(b))}</text>
      ${[-0.42, 0.42].map(d => { const a2 = a + d; return `<line x1="${x + Math.cos(a2) * 27}" y1="${y + Math.sin(a2) * 27}" x2="${x + Math.cos(a2) * 62}" y2="${y + Math.sin(a2) * 62}" stroke="#d9d4ca" stroke-width="1.2" stroke-dasharray="3 3"/>`; }).join('')}`;
  }).join('');
  sheet('2.4', 'forge', list[3][1], bi(
    'Write the concept in the centre. Grow one-word branches from the six questions, then link the branches that touch: those links are often the concept.',
    'اكتب المفهوم في الوسط، وأنبت من الأسئلة الستة فروعاً بكلمة واحدة، ثم اربط الفروع المتلامسة؛ فتلك الروابط كثيراً ما تكون هي المفهوم.'), `
    <div class="mm grow-g"><svg viewBox="0 0 484 472" width="484" height="472">${svg}
      <circle cx="${cx}" cy="${cy}" r="54" fill="#111418"/><circle cx="${cx}" cy="${cy}" r="54" fill="none" stroke="#f5a623" stroke-width="2"/>
      <text x="${cx}" y="${cy + 4}" text-anchor="middle" class="mm-c">${L === 'ar' ? 'المفهوم' : 'The concept'}</text></svg></div>
    ${feeds(cv(1, 0))}`);

  const lc = (n, l, hint, h, cls = '') => `<div class="lc ${cls}"><div class="bl"><span class="lc-n">${num(n)}</span><span>${esc(T(l))}</span><i class="ms risk">priority_high</i></div><div class="hint">${esc(T(hint))}</div><div class="lines" style="height:${h}px"></div></div>`;
  sheet('2.5', 'forge', list[4][1], bi(
    'Break the idea into its key assumptions in half an hour, in the numbered order. Circle the “!” on the boxes you are least sure of: they go to Temper.',
    'فكّك الفكرة إلى افتراضاتها الرئيسية في نصف ساعة، بالترتيب المرقّم. ضع دائرة حول «!» في الخانات الأقل يقيناً؛ فهي تنتقل إلى التطويع.'), `
    <div class="lcg grow-g">
      ${lc(1, bi('Customer segments', 'شرائح العملاء'), bi('Who has the problem? Who are the early adopters?', 'مَن يعاني المشكلة؟ ومَن المتبنّون الأوائل؟'), 44)}
      ${lc(2, bi('Problem', 'المشكلة'), bi('Top one to three problems, and today’s alternatives.', 'أهم مشكلة إلى ثلاث، والبدائل الحالية.'), 44)}
      ${lc(3, bi('Unique value proposition', 'عرض القيمة الفريد'), bi('One clear message: why it is different and worth attention.', 'رسالة واحدة واضحة: لماذا هو مختلف ويستحق الانتباه.'), 33, 'wide accent')}
      ${lc(4, bi('Solution', 'الحل'), bi('The top features, one per problem.', 'أهم الخصائص، خاصية لكل مشكلة.'), 44)}
      ${lc(5, bi('Channels', 'القنوات'), bi('How you reach the customers.', 'كيف تصل إلى العملاء.'), 44)}
      ${lc(6, bi('Revenue streams', 'مصادر الإيراد'), bi('How it pays, or who funds it.', 'كيف يدرّ دخلاً، أو مَن يموّله.'), 33)}
      ${lc(7, bi('Cost structure', 'هيكل التكاليف'), bi('What it costs to build and run.', 'كلفة بنائه وتشغيله.'), 33)}
      ${lc(8, bi('Key metrics', 'المقاييس الرئيسية'), bi('The numbers that show it is working.', 'الأرقام التي تُظهر أنه يعمل.'), 33)}
      ${lc(9, bi('Unfair advantage', 'الميزة التي لا تُنسخ'), bi('What cannot easily be copied or bought.', 'ما لا يمكن نسخه أو شراؤه بسهولة.'), 33)}
    </div>
    ${note(bi('After Maurya, Running Lean (2012). Ten minutes for 1–3, ten for 4–6, ten for 7–9.', 'عن موريا، «إدارة رشيقة» (٢٠١٢). عشر دقائق للخانات ١–٣، وعشر للخانات ٤–٦، وعشر للخانات ٧–٩.'), 'timer')}
    ${feeds(cv(1, 1), cv(2, 0))}`);

  sheet('2.6', 'forge', list[5][1], bi(
    'Make something people can react to: sketch it, or write the press release for a day that has not come yet.',
    'اصنع شيئاً يتفاعل معه الناس: ارسمه، أو اكتب البيان الصحفي ليومٍ لم يأتِ بعد.'), `
    ${box(bi('Sketch or wireframe', 'رسم أو مخطط هيكلي'), { icon: 'draw', h: 196, dots: true, grow: 1 })}
    <div class="pr">
      <div class="pr-h">${ic('newspaper')}<b>${L === 'ar' ? 'البيان الصحفي المستقبلي' : 'Future press release'}</b>${lines(line(bi('Dated', 'بتاريخ'), '150px'))}</div>
      ${box(bi('Headline', 'العنوان'), { h: 22 })}
      ${row(box(bi('Who gets what', 'مَن يحصل على ماذا'), { h: 33 }), box(bi('The problem it ends', 'المشكلة التي يُنهيها'), { h: 33 }))}
      ${row(box(bi('A user’s words', 'كلمات مستخدم'), { icon: 'format_quote', h: 33 }), box(bi('How to start using it', 'كيف تبدأ استخدامه'), { h: 33 }))}
    </div>
    ${feeds(cv(1, 2))}`);

  gatePage(st);
}

// ─── Stage 3: Temper ───────────────────────────────────────────────────────

function temper() {
  const st = stageOf('temper');
  const list = [['3.1', bi('Assumption map', 'خريطة الافتراضات')], ['3.2', bi('Test cards', 'بطاقات الاختبار')], ['3.3', bi('User feedback log', 'سجل ملاحظات المستخدمين')], ['3.4', bi('Storyboard', 'اللوحة القصصية')], ['3.5', bi('Build–Measure–Learn and pivots', 'ابنِ ثم قِس ثم تعلّم، والتحوّلات')]];
  stagePage(st, list);

  sheet('3.1', 'temper', list[0][1], bi(
    'List what must be true for the concept to work. Place each one on the map: important and with little evidence means test it first.',
    'اذكر ما يجب أن يكون صحيحاً لينجح المفهوم، وضع كلاً منه على الخريطة: المهمّ القليل الدليل يُختبر أولاً.'), `
    ${table([{ l: '#', w: '28px' }, { l: bi('We believe that…', 'نعتقد أن…'), w: '3fr' }, { l: bi('Desirable · feasible · viable', 'مرغوب · ممكن · مُجدٍ'), w: '1.3fr' }], 7, { rh: 25, numbered: true, grow: 1 })}
    <div class="am grow-g">
      <div class="am-y">${L === 'ar' ? 'الأهمية' : 'Importance'} ${ic(L === 'ar' ? 'north' : 'north')}</div>
      <div class="am-g">
        <div class="q hot"><b>${L === 'ar' ? 'اختبر أولاً' : 'Test first'}</b><span>${L === 'ar' ? 'مهمّ · دليل ضعيف' : 'Important · weak evidence'}</span></div>
        <div class="q"><b>${L === 'ar' ? 'راقب' : 'Watch'}</b><span>${L === 'ar' ? 'مهمّ · دليل قوي' : 'Important · strong evidence'}</span></div>
        <div class="q"><b>${L === 'ar' ? 'لاحقاً' : 'Later'}</b><span>${L === 'ar' ? 'أقل أهمية · دليل ضعيف' : 'Less important · weak evidence'}</span></div>
        <div class="q"><b>${L === 'ar' ? 'تجاهل الآن' : 'Park it'}</b><span>${L === 'ar' ? 'أقل أهمية · دليل قوي' : 'Less important · strong evidence'}</span></div>
      </div>
      <div class="am-x">${L === 'ar' ? 'الدليل: ضعيف ← قوي' : 'Evidence: weak → strong'}</div>
    </div>
    ${feeds(cv(2, 0))}`);

  const card = n => `
    <div class="tc">
      <div class="tc-h"><span class="code sm">${L === 'ar' ? 'اختبار' : 'Test'} ${num(n)}</span>${lines(line(bi('Assumption #', 'الافتراض رقم'), '130px'), line(w.owner))}</div>
      ${box(bi('We believe that…', 'نعتقد أن…'), { h: 22 })}
      <div class="lbl sm">${L === 'ar' ? 'للتحقق، سنجري' : 'To verify, we will run'}</div>
      ${tick(bi('Interviews', 'مقابلات'), bi('Analytics', 'تحليلات'), bi('A/B test', 'اختبار مقارنة'), bi('Usability test', 'اختبار سهولة الاستخدام'))}
      ${row(box(bi('With (five to ten users)', 'مع (خمسة إلى عشرة مستخدمين)'), { h: 22 }), box(bi('We measure', 'نقيس'), { h: 22 }))}
      ${box(bi('We are right if… (written before the test)', 'نكون على حق إذا… (يُكتب قبل الاختبار)'), { h: 22, cls: 'accent' })}
      ${rowT('2fr 1fr', box(bi('What happened', 'ما حدث'), { h: 22 }), `<div class="verdict">${tick(bi('Validated', 'مُتحقَّق منه'), bi('Invalidated', 'مدحوض'))}</div>`)}
    </div>`;
  sheet('3.2', 'temper', list[1][1], bi(
    'One card per riskiest assumption. Write the success signal before the test runs, so the result cannot move the goalposts.',
    'بطاقة لكل افتراض خطِر. واكتب علامة النجاح قبل إجراء الاختبار، كي لا تُحرّك النتيجةُ المرمى.'), `${card(1)}${card(2)}`);

  sheet('3.3', 'temper', list[2][1], bi(
    'One row per user, five to ten per cycle. Write what they did before what they said: behavior is the stronger evidence.',
    'صفّ لكل مستخدم، من خمسة إلى عشرة في كل دورة. واكتب ما فعلوه قبل ما قالوه؛ فالسلوك أقوى دليلاً.'), `
    ${lines(line(bi('Cycle', 'الدورة'), '120px'), line(bi('Method', 'الطريقة')), line(bi('Version tested', 'النسخة المختبَرة')))}
    ${table([{ l: '#', w: '24px' }, { l: bi('User', 'المستخدم'), w: '.8fr' }, { l: bi('What they did', 'ما فعلوه'), w: '1.4fr' }, { l: bi('What they said', 'ما قالوه'), w: '1.4fr' }, { l: bi('Surprise', 'المفاجأة'), w: '1fr' }, { l: bi('Assumption ±', 'الافتراض ±'), w: '.75fr' }], 10, { rh: 39, numbered: true, cls: 'tight', grow: 1 })}
    ${feeds(cv(2, 1))}`);

  const frames = [bi('Before', 'قبل'), bi('The trigger', 'الدافع'), bi('First use', 'أول استخدام'), bi('The key moment', 'اللحظة الحاسمة'), bi('The result', 'النتيجة'), bi('After', 'بعد')];
  sheet('3.4', 'temper', list[3][1], bi(
    'One user, one moment of need, six frames. Show it to users before anything is built, and mark the frames where they hesitate.',
    'مستخدم واحد، ولحظة حاجة واحدة، وست لقطات. اعرضها على المستخدمين قبل بناء أي شيء، وعلّم اللقطات التي يترددون عندها.'), `
    ${row(box(bi('The user', 'المستخدم'), { icon: 'person', h: 22 }), box(bi('Their moment of need', 'لحظة حاجته'), { icon: 'bolt', h: 22 }))}
    <div class="sb grow-g">${frames.map((f, i) => `
      <div class="fr"><div class="fr-h"><span>${num(i + 1)}</span>${esc(T(f))}<i class="ms hes">front_hand</i></div><div class="fr-d"></div><div class="lines" style="height:33px"></div></div>`).join('')}</div>
    ${note(bi('Under each frame: what they do, and what they feel. The hand marks a frame where users hesitated.', 'تحت كل لقطة: ماذا يفعل، وبماذا يشعر. وتُعلِّم اليدُ اللقطةَ التي تردّد عندها المستخدمون.'), 'front_hand')}
    ${feeds(cv(2, 1))}`);

  sheet('3.5', 'temper', list[4][1], bi(
    'Record every cycle. Each ends in a decision taken on evidence: persevere with the concept, or pivot to a new hypothesis.',
    'دوّن كل دورة. وتنتهي كل دورة بقرار مبنيّ على الدليل: المضيّ في المفهوم، أو التحوّل إلى فرضية جديدة.'), `
    <div class="bml">${[['build', bi('Build', 'ابنِ')], ['monitoring', bi('Measure', 'قِس')], ['school', bi('Learn', 'تعلّم')]].map(([i, l], k) => `<span>${ic(i)}${esc(T(l))}</span>${k < 2 ? ic(L === 'ar' ? 'arrow_back' : 'arrow_forward', 'ar') : ic('replay', 'ar')}`).join('')}</div>
    ${table([{ l: bi('Cycle', 'الدورة'), w: '.5fr' }, { l: bi('What we built', 'ما بنيناه'), w: '1.2fr' }, { l: bi('What we measured', 'ما قسناه'), w: '1.2fr' }, { l: bi('What we learned', 'ما تعلّمناه'), w: '1.3fr' }, { l: bi('Persevere · pivot', 'نمضي · نتحوّل'), w: '.8fr' }], 4, { rh: 50, numbered: true, grow: 1.6 })}
    <div class="lbl">${ic('alt_route')}${L === 'ar' ? 'سجل التحوّلات' : 'Pivot record'}</div>
    ${table([{ l: bi('From', 'من'), w: '1fr' }, { l: bi('To', 'إلى'), w: '1fr' }, { l: bi('The evidence that made us turn', 'الدليل الذي جعلنا نتحوّل'), w: '1.5fr' }], 3, { rh: 33, grow: 1 })}
    ${feeds(cv(2, 2))}`);

  gatePage(st);
}

// ─── Stage 4: Sculpt ───────────────────────────────────────────────────────

function sculpt() {
  const st = stageOf('sculpt');
  const list = [['4.1', bi('Strategic alignment and SWOT', 'المواءمة الاستراتيجية والتحليل الرباعي')], ['4.2', bi('Six Thinking Hats review', 'مراجعة القبعات الست')], ['4.3', bi('Objectives and key results', 'الأهداف والنتائج الرئيسية')], ['4.4', bi('Roadmap and sprints', 'خارطة الطريق ودورات العمل')], ['4.5', bi('Resources, budget and risks', 'الموارد والميزانية والمخاطر')]];
  stagePage(st, list);

  const sw = (k, l, sub, cls) => `<div class="sw ${cls}"><div class="bl"><span class="sw-k">${k}</span><span>${esc(T(l))}</span><em>${esc(T(sub))}</em></div><div class="lines"></div></div>`;
  sheet('4.1', 'sculpt', list[0][1], bi(
    'Tie the validated solution to the mission first. Then see it against its context, and pair the quadrants into roadmap items and risks.',
    'اربط الحل المُتحقَّق منه بالرسالة أولاً، ثم انظر إليه في سياقه، وزاوج بين الأرباع لتخرج ببنود لخارطة الطريق وبالمخاطر.'), `
    ${row(box(bi('The line of our mission or strategy it serves', 'سطر الرسالة أو الاستراتيجية الذي يخدمه'), { icon: 'flag', h: 33 }), box(bi('How it serves it', 'كيف يخدمه'), { icon: 'link', h: 33 }))}
    <div class="swot grow-g">
      ${sw(L === 'ar' ? 'ق' : 'S', bi('Strengths', 'نقاط القوة'), bi('inside', 'داخلية'), 's')}
      ${sw(L === 'ar' ? 'ض' : 'W', bi('Weaknesses', 'نقاط الضعف'), bi('inside', 'داخلية'), 'w')}
      ${sw(L === 'ar' ? 'ف' : 'O', bi('Opportunities', 'الفرص'), bi('outside', 'خارجية'), 'o')}
      ${sw(L === 'ar' ? 'ت' : 'T', bi('Threats', 'التهديدات'), bi('outside', 'خارجية'), 't')}
    </div>
    ${row(box(bi('Strength × opportunity → roadmap item', 'قوة × فرصة ← بند في خارطة الطريق'), { icon: 'add_road', h: 44 }), box(bi('Weakness × threat → risk', 'ضعف × تهديد ← خطر'), { icon: 'warning', h: 44 }))}
    ${feeds(cv(3, 0), cv(3, 2))}`);

  const hats = [
    ['#2d6cdf', bi('Blue · process', 'الأزرق · العملية'), bi('What are we deciding?', 'ماذا نقرّر؟')],
    ['#ffffff', bi('White · facts', 'الأبيض · الحقائق'), bi('What do we know, and what is missing?', 'ماذا نعرف، وما الذي ينقصنا؟')],
    ['#d64545', bi('Red · feelings', 'الأحمر · المشاعر'), bi('What is our gut telling us?', 'ماذا يقول لنا حدسنا؟')],
    ['#23272c', bi('Black · risks', 'الأسود · المخاطر'), bi('What could go wrong?', 'ما الذي قد يسوء؟')],
    ['#f5c518', bi('Yellow · benefits', 'الأصفر · المنافع'), bi('What is the best case, and why?', 'ما أفضل الاحتمالات، ولماذا؟')],
    ['#3a9d5d', bi('Green · alternatives', 'الأخضر · البدائل'), bi('What else could we do?', 'ماذا يمكننا أن نفعل غير ذلك؟')],
  ];
  sheet('4.2', 'sculpt', list[1][1], bi(
    'Review the plan with everyone wearing the same hat at the same time. Blue opens and closes the session.',
    'راجع الخطة والجميع يرتدون القبعة نفسها في الوقت نفسه. والأزرق يفتتح الجلسة ويختمها.'), `
    <div class="hats grow-g">${hats.map(([c, l, q]) => `
      <div class="hat"><div class="bl"><span class="dot" style="background:${c}"></span><span>${esc(T(l))}</span></div><div class="hint">${esc(T(q))}</div><div class="lines" style="height:66px"></div></div>`).join('')}</div>
    ${box(bi('Blue, to close: what we decided, and what changes in the plan', 'الأزرق ختاماً: ماذا قرّرنا، وما الذي يتغيّر في الخطة'), { icon: 'gavel', h: 44, cls: 'accent' })}
    ${feeds(cv(3, 1), cv(3, 2))}`);

  const okr = n => `
    <div class="okr">
      <div class="okr-h"><span class="code sm">${L === 'ar' ? 'الهدف' : 'Objective'} ${num(n)}</span><div class="lines" style="height:22px;flex:1"></div></div>
      ${table([{ l: bi('Key result: a number that shows the objective is met', 'النتيجة الرئيسية: رقم يُظهر تحقق الهدف'), w: '2.6fr' }, { l: bi('Baseline', 'خط الأساس'), w: '.7fr' }, { l: bi('Target', 'المستهدف'), w: '.7fr' }, { l: w.owner, w: '.7fr' }, { l: bi('By', 'بحلول'), w: '.6fr' }], 3, { rh: 30, numbered: true, grow: 1 })}
    </div>`;
  sheet('4.3', 'sculpt', list[2][1], bi(
    'An objective says where you are going; its key results say, in numbers, how you will know you got there. These are the metrics Polish will track.',
    'يقول الهدف إلى أين تتجه، وتقول نتائجه الرئيسية بالأرقام كيف تعرف أنك بلغته. وهذه هي المقاييس التي يتابعها الصقل.'), `
    ${okr(1)}${okr(2)}${okr(3)}
    ${note(bi('Two to three key results per objective is enough (Doerr, 2018). Each needs a baseline today, or it cannot show change.', 'تكفي نتيجتان إلى ثلاث لكل هدف (دوير، ٢٠١٨). ولكل منها خط أساس اليوم، وإلا لم تُظهر التغيّر.'))}
    ${feeds(cv(3, 0))}`);

  const months = Array.from({ length: 6 }, (_, i) => `<div class="th c">${L === 'ar' ? 'الشهر' : 'Month'} ${num(i + 1)}</div>`).join('');
  const streams = [bi('Product', 'المنتج'), bi('People and skills', 'الأفراد والمهارات'), bi('Users and market', 'المستخدمون والسوق'), bi('Operations', 'التشغيل'), bi('Milestones', 'المحطات')];
  sheet('4.4', 'sculpt', list[3][1], bi(
    'Lay out three to six months by workstream, then break the first months into sprints of user stories, each with what “done” means.',
    'ارسم من ثلاثة إلى ستة أشهر بحسب مسارات العمل، ثم قسّم الأشهر الأولى إلى دورات عمل من قصص المستخدم، ولكلٍّ منها معنى «الإنجاز».'), `
    <div class="rm"><div class="th">${L === 'ar' ? 'المسار' : 'Workstream'}</div>${months}
      ${streams.map((s, i) => `<div class="td pre ${i === 4 ? 'ms-row' : ''}">${esc(T(s))}</div>${'<div class="td"></div>'.repeat(6)}`).join('')}
    </div>
    <div class="lbl">${ic('sprint')}${L === 'ar' ? 'دورات العمل وقصص المستخدم' : 'Sprints and user stories'}</div>
    ${table([{ l: bi('Sprint', 'الدورة'), w: '.5fr' }, { l: bi('As a…, I want…, so that…', 'بصفتي…، أريد…، كي…'), w: '2.4fr' }, { l: bi('Done when', 'تُنجَز حين'), w: '1.3fr' }], 7, { rh: 31, numbered: true, grow: 1 })}
    ${feeds(cv(3, 1))}`);

  const rmx = [3, 2, 1].map(l => [1, 2, 3].map(i => `<div class="rc s${l * i}"></div>`).join('')).join('');
  sheet('4.5', 'sculpt', list[4][1], bi(
    'Write down what the roadmap needs and what could sink it. Score each risk as likelihood × impact, from 1 to 3 each, and give it an owner.',
    'دوّن ما تحتاجه خارطة الطريق وما قد يُغرقها. وقيّم كل خطر بحاصل الاحتمال × الأثر، من ١ إلى ٣ لكلٍّ منهما، واجعل له مسؤولاً.'), `
    ${table([{ l: bi('Resource: people, tools, space', 'المورد: أفراد، وأدوات، ومكان'), w: '2fr' }, { l: bi('How much', 'الكمية'), w: '.7fr' }, { l: bi('Cost', 'الكلفة'), w: '.7fr' }], 5, { rh: 22 })}
    ${lines(line(bi('Total budget', 'إجمالي الميزانية')), line(bi('Approved by', 'اعتمده')))}
    <div class="risk">
      <div class="rmx">
        <div class="rmx-y">${L === 'ar' ? 'الاحتمال' : 'Likelihood'}</div>
        <div class="rmx-g">${rmx}</div>
        <div class="rmx-x">${L === 'ar' ? 'الأثر' : 'Impact'}</div>
      </div>
      <div class="rkey">${[[bi('6–9 act now', '٦–٩ تصرّف الآن'), 'hi'], [bi('3–4 plan a response', '٣–٤ خطّط للاستجابة'), 'md'], [bi('1–2 watch', '١–٢ راقب'), 'lo']].map(([t, c]) => `<span><i class="${c}"></i>${esc(T(t))}</span>`).join('')}</div>
    </div>
    ${table([{ l: bi('Risk', 'الخطر'), w: '2fr' }, { l: bi('L', 'ح'), w: '.35fr' }, { l: bi('I', 'أ'), w: '.35fr' }, { l: bi('Score', 'الدرجة'), w: '.5fr' }, { l: bi('Response', 'الاستجابة'), w: '1.5fr' }, { l: w.owner, w: '.8fr' }], 5, { rh: 26, numbered: true, grow: 1 })}
    ${feeds(cv(3, 2))}`);

  gatePage(st, `
    <div class="sign">${[bi('Team lead', 'قائد الفريق'), bi('Stakeholder', 'صاحب المصلحة'), bi('Stakeholder', 'صاحب المصلحة')].map(s => `<div><b></b><span>${esc(T(s))}</span></div>`).join('')}</div>`);
}

// ─── Stage 5: Polish ───────────────────────────────────────────────────────

function polish() {
  const st = stageOf('polish');
  const list = [['5.1', bi('Launch checklist', 'قائمة تحقق الإطلاق')], ['5.2', bi('Impact tracker', 'متابعة الأثر')], ['5.3', bi('Retrospective', 'المراجعة اللاحقة')], ['5.4', bi('Decision and the next spark', 'القرار والشرارة التالية')]];
  stagePage(st, list);

  sheet('5.1', 'polish', list[0][1], bi(
    'Choose a full or a phased launch, then work down the checklist. Nothing ships until every box is ticked or consciously waived.',
    'اختر إطلاقاً كاملاً أو تدريجياً، ثم امضِ في قائمة التحقق. ولا يُطلَق شيء حتى تُعلَّم كل خانة أو يُتنازل عنها عن وعي.'), `
    <div class="lbl">${ic('campaign')}${L === 'ar' ? 'نوع الإطلاق' : 'Kind of launch'}</div>
    ${tick(bi('Full: everyone at once', 'كامل: للجميع دفعة واحدة'), bi('Phased: one group at a time', 'تدريجي: مجموعة تلو أخرى'))}
    ${table([{ l: bi('Phase', 'المرحلة'), w: '.5fr' }, { l: bi('Who gets it', 'مَن يحصل عليه'), w: '1.6fr' }, { l: bi('From', 'من'), w: '.7fr' }, { l: bi('Go on if…', 'نستمر إذا…'), w: '1.6fr' }], 3, { rh: 24, numbered: true })}
    <div class="lbl">${ic('checklist')}${L === 'ar' ? 'قبل الإطلاق' : 'Before launch'}</div>
    <div class="cl2">${checks([
      bi('The key results from Sculpt (4.3) have a baseline.', 'للنتائج الرئيسية من النحت (٤٫٣) خط أساس.'),
      bi('Tracking is live, and someone owns the dashboard.', 'المتابعة تعمل، وللوحة المؤشرات مسؤول.'),
      bi('Users have a channel for feedback, and someone reads it.', 'للمستخدمين قناة للملاحظات، وثمة من يقرؤها.'),
      bi('Support knows what is coming and how to answer.', 'يعرف فريق الدعم ما القادم وكيف يجيب.'),
      bi('There is a way back if something breaks.', 'ثمة طريق للرجوع إن تعطّل شيء.'),
      bi('Someone is on call for the first days.', 'ثمة مناوب في الأيام الأولى.'),
      bi('Legal, privacy and security have signed off.', 'وافقت الجهات القانونية والخصوصية والأمن.'),
      bi('Stakeholders and users have been told.', 'أُبلغ أصحاب المصلحة والمستخدمون.'),
      bi('The retrospective is booked, two to four weeks out.', 'حُجز موعد المراجعة اللاحقة بعد أسبوعين إلى أربعة.'),
      bi('The canvas is up to date.', 'اللوحة محدّثة.'),
    ], { gap: 6 })}</div>
    ${box(bi('Also needed for this launch', 'وتحتاجه هذه الإطلاقة أيضاً'), { h: 44, grow: 1 })}
    ${feeds(cv(4, 0))}`);

  sheet('5.2', 'polish', list[1][1], bi(
    'Track the OKRs and KPIs set in Sculpt from day one. Read the trend, not a single number.',
    'تابع الأهداف ومؤشرات الأداء المحددة في النحت منذ اليوم الأول. واقرأ الاتجاه، لا رقماً منفرداً.'), `
    ${lines(line(bi('Launch date', 'تاريخ الإطلاق'), '200px'), line(bi('Dashboard owner', 'مسؤول لوحة المؤشرات')))}
    ${table([{ l: bi('Key result or KPI', 'النتيجة الرئيسية أو المؤشر'), w: '1.9fr' }, { l: bi('Baseline', 'الأساس'), w: '.65fr' }, { l: bi('Target', 'المستهدف'), w: '.65fr' }, { l: bi('Week 1', 'الأسبوع ١'), w: '.65fr' }, { l: bi('Week 2', 'الأسبوع ٢'), w: '.65fr' }, { l: bi('Week 4', 'الأسبوع ٤'), w: '.65fr' }, { l: bi('Trend', 'الاتجاه'), w: '.55fr' }], 8, { rh: 33, cls: 'tight', grow: 1 })}
    <div class="trend">${[['trending_up', bi('on track', 'على المسار')], ['trending_flat', bi('flat', 'ثابت')], ['trending_down', bi('off track', 'خارج المسار')]].map(([i, t]) => `<span>${ic(i)}${esc(T(t))}</span>`).join('')}</div>
    ${box(bi('What the numbers say', 'ما تقوله الأرقام'), { icon: 'insights', h: 66, cls: 'accent' })}
    ${feeds(cv(4, 1))}`);

  sheet('5.3', 'polish', list[2][1], bi(
    'Two to four weeks after launch, with the whole team: what worked, what did not, and what we learned. End with actions that have owners.',
    'بعد أسبوعين إلى أربعة أسابيع من الإطلاق، مع الفريق كله: ما الذي نجح؟ وما الذي لم ينجح؟ وماذا تعلّمنا؟ واختم بإجراءات لها مسؤولون.'), `
    ${lines(line(bi('Held on', 'عُقدت في'), '190px'), line(bi('Weeks since launch', 'أسابيع منذ الإطلاق'), '200px'), line(bi('Present', 'الحضور')))}
    <div class="retro grow-g">
      ${box(bi('What worked', 'ما الذي نجح'), { icon: 'thumb_up', h: 176 })}
      ${box(bi('What did not', 'ما الذي لم ينجح'), { icon: 'thumb_down', h: 176 })}
      ${box(bi('What we learned', 'ماذا تعلّمنا'), { icon: 'school', h: 176, cls: 'accent' })}
    </div>
    ${table([{ l: bi('Action', 'الإجراء'), w: '2.5fr' }, { l: w.owner, w: '.9fr' }, { l: bi('By when', 'الموعد'), w: '.7fr' }], 4, { rh: 26, numbered: true })}
    ${feeds(cv(2, 2), cv(4, 2))}`);

  const opt = (icon, l, when) => `<div class="opt"><div class="opt-h"><span class="cb"></span>${ic(icon)}<b>${esc(T(l))}</b></div><span>${esc(T(when))}</span></div>`;
  sheet('5.4', 'polish', list[3][1], bi(
    'Take the decision on the data: iterate, scale or sunset. Then write what this cycle hands to the next Ignite. The cycle begins anew.',
    'اتّخذ القرار بناءً على البيانات: التكرار أو التوسّع أو الإيقاف. ثم اكتب ما تسلّمه هذه الدورة إلى الإشعال التالي؛ فالدورة تبدأ من جديد.'), `
    <div class="opts">
      ${opt('autorenew', bi('Iterate', 'التكرار'), bi('It works in part: improve it and measure again.', 'ينجح جزئياً: حسّنه وقِس من جديد.'))}
      ${opt('open_in_full', bi('Scale', 'التوسّع'), bi('Key results are met: take it to more people or places.', 'تحققت النتائج الرئيسية: انقله إلى مزيد من الناس أو الأماكن.'))}
      ${opt('do_not_disturb_on', bi('Sunset', 'الإيقاف'), bi('The evidence says stop: close it well, and keep the lessons.', 'يقول الدليل توقّف: أغلقه جيداً واحتفظ بالدروس.'))}
    </div>
    ${box(bi('The evidence behind the decision', 'الدليل وراء القرار'), { icon: 'fact_check', h: 66, grow: 1 })}
    ${box(bi('What scaling, iterating or closing will need', 'ما يحتاجه التوسّع أو التكرار أو الإغلاق'), { icon: 'inventory', h: 44 })}
    <div class="seeds">
      <div class="seeds-h">${ic('local_fire_department')}<b>${L === 'ar' ? 'بذور الإشعال التالي' : 'Seeds for the next Ignite'}</b></div>
      ${row(box(bi('Problems this cycle uncovered', 'مشكلات كشفتها هذه الدورة'), { h: 55 }), box(bi('Ideas we parked', 'أفكار أرجأناها'), { h: 55 }), box(bi('What we will do differently', 'ما سنفعله على نحو مختلف'), { h: 55 }))}
    </div>
    ${feeds(cv(4, 2))}`);

  gatePage(st);
}

// ─── Techniques ────────────────────────────────────────────────────────────

function techniqueCards() {
  partPage('V', 'construction', bi('The ten techniques', 'التقنيات العشر'), C.techniques.map(t => bi(`${t.en} · ${stageOf(t.stage).name.en}`, `${t.ar} · ${stageOf(t.stage).name.ar}`)));
  for (let i = 0; i < C.techniques.length; i += 2) {
    const cards = C.techniques.slice(i, i + 2).map((t, k) => {
      const s = stageOf(t.stage);
      return `
      <div class="tq">
        <div class="tq-h">
          <div class="tq-ic">${ic(t.icon)}</div>
          <div class="tq-t"><span class="k">${num(i + k + 1)} / ${num(10)}</span><b>${esc(t[L])}</b>${L === 'ar' ? `<em>${esc(t.en)}</em>` : ''}</div>
          <span class="tq-st">${ic(s.icon)}${esc(T(s.name))}</span>
        </div>
        <div class="tq-m"><span class="label">${T(w.case)}</span> ${esc(T(t.origin))}</div>
        <div class="tq-m"><span class="label">${T(w.when)}</span> ${esc(T(t.when))}</div>
        <ol>${t.steps.map(x => `<li>${esc(T(x))}</li>`).join('')}</ol>
        <div class="tq-f"><span>${ic('output')}<b>${T(w.output)}:</b> ${esc(T(t.output))}</span><span class="code sm">${T(w.sheet)} ${num(t.sheet)}</span></div>
      </div>`;
    }).join('');
    push(`<div class="body">${cards}</div>`, { runner: `${T(C.meta.runner)} · ${L === 'ar' ? 'التقنيات العشر' : 'The ten techniques'}` });
  }
}

// ─── Enabling conditions and adoption ──────────────────────────────────────

function conditions() {
  partPage('VI', 'spa', bi('Conditions and adoption', 'الظروف والتبنّي'), [
    bi('6.1 Creative space check', '٦٫١ فحص المساحة الإبداعية'), bi('6.2 Creative blocks', '٦٫٢ العوائق الإبداعية'), bi('6.3 Network map', '٦٫٣ خريطة الشبكة'),
    bi('7.1 Adoption by audience', '٧٫١ التبنّي حسب الفئة'), bi('7.2 Pilot planner', '٧٫٢ مخطِّط التجربة'), bi('7.3 Exit criteria as a rubric', '٧٫٣ معايير الخروج سلّماً للتقدير'), bi('7.4 Kick-off workshop', '٧٫٤ ورشة الانطلاق'),
  ]);

  const spaces = [
    ['light_mode', bi('Physical space', 'المساحة المادية'), [bi('There is light, and the tools are at hand.', 'فيها ضوء، والأدوات في المتناول.'), bi('Work can stay up on the walls between sessions.', 'يمكن أن يبقى العمل معلّقاً على الجدران بين الجلسات.'), bi('There is a quiet place and a place to meet.', 'فيها مكان هادئ ومكان للاجتماع.')]],
    ['self_improvement', bi('Mental space', 'المساحة الذهنية'), [bi('Pauses are protected, not squeezed out.', 'فترات التوقّف محمية، لا تُعتصَر.'), bi('There is time to be curious, with no deliverable attached.', 'ثمة وقت للفضول بلا مُخرَج مطلوب.'), bi('Deep work is not interrupted by messages.', 'لا تقطع الرسائلُ العملَ العميق.')]],
    ['diversity_3', bi('Collaborative space', 'المساحة التعاونية'), [bi('People speak up without fear of being made small.', 'يتكلم الناس دون خوف من الاستصغار.'), bi('Different disciplines are in the room.', 'في الغرفة تخصصات مختلفة.'), bi('Ideas are built on, not shot down.', 'يُبنى على الأفكار، ولا تُسقَط.')]],
  ];
  sheet('6.1', null, bi('Creative space check', 'فحص المساحة الإبداعية'), bi(
    'A framework is only as effective as the environment it runs in. Rate each statement from 1 (not at all) to 5 (fully), then pick one change.',
    'لا تزيد فاعلية أي إطار على فاعلية البيئة التي يعمل فيها. قيّم كل عبارة من ١ (إطلاقاً) إلى ٥ (تماماً)، ثم اختر تغييراً واحداً.'), `
    ${spaces.map(([i, n, items]) => `
      <div class="space grow-s">
        <div class="bl">${ic(i)}<span>${esc(T(n))}</span></div>
        ${items.map(s => `<div class="rate"><span>${esc(T(s))}</span><span class="dots5">${[1, 2, 3, 4, 5].map(d => `<i>${num(d)}</i>`).join('')}</span></div>`).join('')}
        <div class="fl"><span>${L === 'ar' ? 'تغيير واحد' : 'One change'}</span><b></b></div>
      </div>`).join('')}`, {});

  sheet('6.2', null, bi('Creative blocks', 'العوائق الإبداعية'), bi(
    'Blocks have sources, and each source has a remedy. Name the signs you notice, then commit to one remedy this week.',
    'للعوائق مصادر، ولكل مصدر علاج. سمِّ العلامات التي تلاحظها، ثم التزم بعلاج واحد هذا الأسبوع.'), `
    <div class="blk grow-g hd"><div class="th">${L === 'ar' ? 'المصدر' : 'Source'}</div><div class="th">${L === 'ar' ? 'العلامات التي ألاحظها' : 'Signs I notice'}</div><div class="th">${L === 'ar' ? 'العلاج' : 'Remedy'}</div><div class="th">${L === 'ar' ? 'ما سأفعله هذا الأسبوع' : 'What I will do this week'}</div>
      ${C.blocks.map(b => `<div class="td src">${ic(b.icon)}<b>${esc(T(b.source))}</b></div><div class="td"></div><div class="td rem">${esc(T(b.remedy))}</div><div class="td"></div>`).join('')}
    </div>
    ${box(bi('When the block lifted, what helped', 'حين زال العائق، ما الذي ساعد'), { icon: 'emoji_objects', h: 66, cls: 'accent' })}`);

  const ring = (r, label, y) => `<circle cx="240" cy="190" r="${r}" fill="none" stroke="#e8d3ad" stroke-dasharray="4 4"/><text x="240" y="${y}" text-anchor="middle" class="nw-t">${esc(T(label))}</text>`;
  sheet('6.3', null, bi('Network map', 'خريطة الشبكة'), bi(
    'The lone genius is a myth. Map the people and communities who share opportunities, feedback and support, and what you give back.',
    'العبقري المنعزل أسطورة. ارسم الأشخاص والمجتمعات الذين يتبادلون معك الفرص والملاحظات والدعم، وما تقدّمه لهم في المقابل.'), `
    <div class="nw"><svg viewBox="0 0 480 380" width="480" height="300">
      ${ring(178, bi('Communities', 'المجتمعات'), 26)}${ring(124, bi('Mentors and partners', 'المرشدون والشركاء'), 80)}${ring(70, bi('Close collaborators', 'المتعاونون المقرّبون'), 134)}
      <circle cx="240" cy="190" r="30" fill="#111418"/><text x="240" y="195" text-anchor="middle" class="nw-c">${L === 'ar' ? 'نحن' : 'Us'}</text></svg></div>
    ${table([{ l: bi('Person or community', 'الشخص أو المجتمع'), w: '1.4fr' }, { l: bi('Opportunities · feedback · support', 'فرص · ملاحظات · دعم'), w: '1.3fr' }, { l: bi('What we give back', 'ما نقدّمه في المقابل'), w: '1.3fr' }], 7, { rh: 27, grow: 1 })}`);

  sheet('7.1', null, bi('Adoption by audience', 'التبنّي حسب الفئة'), bi(
    'Each audience moves through the same five stages at its own pace. Find your row; the times are a starting point, not a rule.',
    'تمرّ كل فئة بالمراحل الخمس نفسها بإيقاعها الخاص. ابحث عن صفّك؛ فالمدد نقطة بداية لا قاعدة.'), `
    <div class="ad">
      <div class="th"></div>${C.stages.map(s => `<div class="th c">${ic(s.icon)}${esc(T(s.name))}</div>`).join('')}
      ${C.audiences.map(a => `<div class="td who">${ic(a.icon)}<b>${esc(T(a.name))}</b></div>${a.plan.map(p => `<div class="td c">${esc(T(p))}</div>`).join('')}`).join('')}
    </div>
    <div class="adt">${C.audiences.map(a => `<div>${ic(a.icon)}<span><b>${esc(T(a.name))}:</b> ${esc(T(a.text))}</span></div>`).join('')}</div>`);

  sheet('7.2', null, bi('Pilot planner', 'مخطِّط التجربة'), bi(
    'Pilot the framework on one initiative before adopting it widely. Decide in advance how you will judge the pilot itself.',
    'جرّب الإطار على مبادرة واحدة قبل تعميمه، وقرّر مسبقاً كيف ستحكم على التجربة نفسها.'), `
    ${row(box(bi('The initiative', 'المبادرة'), { icon: 'rocket_launch', h: 33 }), box(bi('Sponsor', 'الراعي'), { icon: 'person', h: 33 }))}
    <div class="lbl">${ic('category')}${L === 'ar' ? 'المسار' : 'Track'}</div>
    ${tick(...C.audiences.map(a => a.name))}
    ${table([{ l: bi('Stage', 'المرحلة'), w: '1fr' }, { l: bi('Starts', 'يبدأ'), w: '.7fr' }, { l: bi('Gate', 'البوابة'), w: '.7fr' }, { l: bi('Sheets we will use', 'الأوراق التي سنستخدمها'), w: '1.6fr' }], 5, { rh: 30, grow: 1, pre: C.stages.map(s => bi(`${s.n} · ${s.name.en}`, `${num(s.n)} · ${s.name.ar}`)) })}
    ${row(box(bi('The pilot succeeds if…', 'تنجح التجربة إذا…'), { icon: 'flag', h: 55, cls: 'accent' }), box(bi('What we will change for the next round', 'ما سنغيّره في الجولة التالية'), { icon: 'autorenew', h: 55 }))}`);

  sheet('7.3', null, bi('Exit criteria as a rubric', 'معايير الخروج سلّماً للتقدير'), bi(
    'For educators and reviewers: each stage’s exit criteria become the rubric. Mark the level the work reaches, and say what would raise it.',
    'للمعلمين والمراجعين: تصبح معايير خروج كل مرحلة سلّماً للتقدير. علّم المستوى الذي يبلغه العمل، وقل ما الذي يرفعه.'), `
    <div class="rb grow-g hd"><div class="th">${L === 'ar' ? 'المرحلة ومعيار خروجها' : 'Stage and its exit criteria'}</div><div class="th c">${L === 'ar' ? 'لم يتحقق' : 'Not yet'}</div><div class="th c">${L === 'ar' ? 'جزئياً' : 'Partly'}</div><div class="th c">${L === 'ar' ? 'تحقق' : 'Met'}</div><div class="th">${L === 'ar' ? 'ما يرفعه' : 'To raise it'}</div>
      ${C.stages.map(s => `<div class="td crit">${ic(s.icon)}<div><b>${esc(T(s.name))}</b><span>${esc(T(s.exit))}</span></div></div><div class="td c"><span class="cb"></span></div><div class="td c"><span class="cb"></span></div><div class="td c"><span class="cb"></span></div><div class="td"></div>`).join('')}
    </div>
    ${lines(line(bi('Student or team', 'الطالب أو الفريق')), line(bi('Reviewer', 'المُراجِع')))}`);

  const agenda = [
    ['0:00', '15', bi('Welcome and the three principles; the ground rules of the charter (0.1)', 'الترحيب والمبادئ الثلاثة، وقواعد الميثاق (٠٫١)')],
    ['0:15', '15', bi('Frame the challenge as “How might we…?”', 'صياغة التحدي في سؤال «كيف يمكننا…؟»')],
    ['0:30', '30', bi('Five Whys on the problem as people see it today (1.1)', 'اللماذات الخمس على المشكلة كما يراها الناس اليوم (١٫١)')],
    ['1:00', '30', bi('Inspiration mining, in pairs, then shared (1.2)', 'التنقيب عن الإلهام في أزواج، ثم المشاركة (١٫٢)')],
    ['1:30', '15', bi('Break', 'استراحة')],
    ['1:45', '40', bi('Brainstorm, then one provocation round (1.3)', 'العصف الذهني، ثم جولة استفزاز ذهني (١٫٣)')],
    ['2:25', '25', bi('Score and rank: keep one to three (1.4)', 'التقييم والترتيب: الإبقاء على واحدة إلى ثلاث (١٫٤)')],
    ['2:50', '25', bi('Fill in Ignite on the canvas together (0.2)', 'ملء قسم الإشعال في اللوحة معاً (٠٫٢)')],
    ['3:15', '15', bi('Ignite gate, owners and the date of the next session', 'بوابة الإشعال، والمسؤولون، وموعد الجلسة التالية')],
  ];
  sheet('7.4', null, bi('Kick-off workshop', 'ورشة الانطلاق'), bi(
    'A half-day session that opens a project and closes Ignite together, as the paper recommends. Three and a half hours, four to ten people.',
    'جلسة نصف يوم تفتتح المشروع وتُغلق الإشعال معاً، كما توصي الورقة. ثلاث ساعات ونصف، ومن أربعة إلى عشرة أشخاص.'), `
    <div class="ag"><div class="th">${L === 'ar' ? 'الوقت' : 'Time'}</div><div class="th">${L === 'ar' ? 'دقائق' : 'Min'}</div><div class="th">${L === 'ar' ? 'النشاط' : 'Activity'}</div>
      ${agenda.map(([t, m, a]) => `<div class="td c">${num(t)}</div><div class="td c">${num(m)}</div><div class="td">${esc(T(a))}</div>`).join('')}
    </div>
    <div class="lbl">${ic('inventory_2')}${L === 'ar' ? 'ما تحضره' : 'What to bring'}</div>
    ${checks([
      bi('Printed sheets 0.1, 0.2 and 1.1–1.4, one set per group, plus the canvas at A3.', 'الأوراق المطبوعة ٠٫١ و٠٫٢ و١٫١–١٫٤، مجموعة لكل فريق، واللوحة بمقاس A3.'),
      bi('Sticky notes, thick pens, a wall, and a timer.', 'أوراق لاصقة، وأقلام عريضة، وجدار، ومؤقّت.'),
      bi('Three to five inspiration sources, gathered before the day.', 'من ثلاثة إلى خمسة مصادر إلهام، تُجمع قبل اليوم.'),
    ], { gap: 5 })}
    ${box(bi('Facilitator’s notes', 'ملاحظات الميسّر'), { icon: 'edit_note', h: 44, grow: 1 })}`);
}

// ─── Back matter ───────────────────────────────────────────────────────────

function backMatter() {
  push(`
    <div class="front">
      <p class="eyebrow">${L === 'ar' ? 'ملحق' : 'Appendix'}</p>
      <h1>${L === 'ar' ? 'المسرد والمراجع' : 'Glossary and references'}</h1>
      <dl class="gl">${C.glossary.map(g => `<div><dt>${esc(g[L][0])}</dt><dd>${esc(g[L][1])}</dd></div>`).join('')}</dl>
      <span class="label">${L === 'ar' ? 'المراجع' : 'References'}</span>
      <ul class="refs" dir="ltr">${C.references.map(r => `<li>${esc(r)}</li>`).join('')}
        <li>Elgendi, M. F. (2026). InnovaForge: From Spark to Scale. A white paper. www.fawzooz.ai</li></ul>
    </div>`, { runner: `${T(C.meta.runner)} · ${L === 'ar' ? 'ملحق' : 'Appendix'}`, tocEntry: { level: 1, title: L === 'ar' ? 'ملحق: المسرد والمراجع' : 'Appendix: Glossary and references' } });

  push(`
    <div class="back">
      <div class="cv-title sm">${L === 'ar' ? 'إنوفا فورج' : 'InnovaForge'}</div>
      <div class="cv-rule"><span></span><i></i><span></span></div>
      <p>${esc(T(bi('Ideas are abundant. Scaled innovation is rare. These sheets carry an idea through definition, testing, planning and launch without losing its value or its momentum.', 'الأفكار وفيرة، أمّا الابتكار الذي يتوسّع فنادر. وتحمل هذه الأوراق الفكرة عبر التحديد والاختبار والتخطيط والإطلاق دون أن تفقد قيمتها أو زخمها.')))}</p>
      <div class="cv-sts">${C.stages.map(s => `<div class="cv-st">${ic(s.icon)}<span>${esc(T(s.name))}</span></div>`).join('')}</div>
      <div class="cv-author">${esc(T(C.meta.author))}</div>
      <div class="cv-site"><span></span>${C.meta.site}<span></span></div>
      <div class="bk-lic">CC BY-SA 4.0</div>
    </div>`, { kind: 'dark' });
}

// ─── Contents and assembly ─────────────────────────────────────────────────

function renderToc(entries, first) {
  return `
    <div class="front">
      <p class="eyebrow">${T(w.contents)}</p>
      ${first ? `<h1>${L === 'ar' ? 'محتويات الحقيبة' : 'In this toolkit'}</h1>` : ''}
      <div class="toc">${entries.map(e => e.level === 1
        ? `<div class="t1"><span>${esc(e.title)}${e.sub ? ` <em>${esc(e.sub)}</em>` : ''}</span><b>${num(e.page)}</b></div>`
        : `<div class="t2"><span class="code xs">${e.code === '✓' ? '✓' : num(e.code)}</span><span>${esc(e.title)}</span><i></i><b>${num(e.page)}</b></div>`).join('')}</div>
    </div>`;
}

function buildLang(lang) {
  L = lang;
  pages.length = 0; toc.length = 0;
  cover(); licence(); contentsPlaceholder(); howTo();
  partPage('0', 'flag_circle', bi('Start here', 'ابدأ من هنا'), [bi('0.1 Kick-off charter', '٠٫١ ميثاق الانطلاق'), bi('0.2 The InnovaForge Canvas', '٠٫٢ لوحة إنوفا فورج')]);
  kickoff(); canvasSheet();
  ignite(); forge(); temper(); sculpt(); polish();
  techniqueCards(); conditions(); backMatter();

    // Split the contents over its two pages at the stage nearest the middle.
  const l1 = toc.map((e, i) => (e.level === 1 ? i : -1)).filter(i => i > 0);
  const cut = l1.reduce((best, i) => (Math.abs(i - toc.length / 2) < Math.abs(best - toc.length / 2) ? i : best), l1[0]);
  pages[tocPage].html = renderToc(toc.slice(0, cut), true);
  pages[tocPage + 1].html = renderToc(toc.slice(cut), false);
  return pages.map(p => {
    const foot = p.kind === 'dark' ? '' : `<footer><span>${esc(T(C.meta.copyright))}</span><b>${num(p.n)}</b></footer>`;
    const head = p.kind === 'dark' ? '' : `<header>${esc(p.runner)}</header>`;
    return `<section class="page ${p.kind}">${head}<div class="inner">${p.html}</div>${foot}</section>`;
  }).join('\n');
}

// ─── Fonts ─────────────────────────────────────────────────────────────────

function curl(url, file, binary) {
  fs.mkdirSync(CACHE, { recursive: true });
  const f = path.join(CACHE, file);
  if (!fs.existsSync(f)) execFileSync('curl', ['-sSfL', '-A', UA, '-o', f, url]);
  return binary ? fs.readFileSync(f) : fs.readFileSync(f, 'utf8');
}

function inlineFonts(css, tag) {
  // Keep the latin, latin-ext and arabic subsets only.
  const blocks = css.split(/(?=\/\* )/).filter(b => /^\/\* (latin|latin-ext|arabic) \*\//.test(b) || !b.startsWith('/*'));
  return blocks.map(b => b.replace(/url\((https:[^)]+)\)/g, (_, u) => {
    const name = `${tag}-${Buffer.from(u).toString('base64url').slice(-24)}.woff2`;
    return `url(data:font/woff2;base64,${curl(u, name, true).toString('base64')})`;
  })).join('');
}

function fontsCss(icons) {
  const text = curl('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Kufi+Arabic:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600&display=block', 'text.css');
  const names = [...icons].sort().join(',');
  const key = Buffer.from(names).toString('base64url').slice(0, 40);
  const sym = curl(`https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..600,0..1,0&icon_names=${names}&display=block`, `sym-${key}.css`);
  return inlineFonts(text, 'txt') + inlineFonts(sym, 'sym');
}

// ─── Main ──────────────────────────────────────────────────────────────────

const css = fs.readFileSync(path.join(DIR, 'toolkit.css'), 'utf8');
fs.mkdirSync(OUT, { recursive: true });
const built = {};
for (const lang of ['en', 'ar']) built[lang] = buildLang(lang);
const icons = new Set();
for (const html of Object.values(built)) for (const m of html.matchAll(/<i class="ms[^"]*">([a-z0-9_]+)<\/i>/g)) icons.add(m[1]);
const fonts = fontsCss(icons);
for (const lang of ['en', 'ar']) {
  const title = C.meta.title[lang];
  const html = `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"><style>${fonts}</style><style>${css}</style></head><body>${built[lang]}</body></html>`;
  fs.writeFileSync(path.join(OUT, `innovaforge-toolkit-${lang}.html`), html);
  console.log(`out/innovaforge-toolkit-${lang}.html  ${built[lang].split('<section').length - 1} pages`);
}
fs.writeFileSync(path.join(OUT, 'content.json'), JSON.stringify({ meta: C.meta, stages: C.stages, canvas: C.canvas, techniques: C.techniques, blocks: C.blocks, audiences: C.audiences }, null, 1));

if (!process.argv.includes('--html-only')) {
  const require = createRequire(import.meta.url);
  const tries = [process.env.PLAYWRIGHT_PATH, 'playwright', '/opt/node22/lib/node_modules/playwright'].filter(Boolean);
  let pw; for (const t of tries) { try { pw = require(t); break; } catch {} }
  if (!pw) throw new Error('Playwright not found (set PLAYWRIGHT_PATH)');
  const browser = await pw.chromium.launch();
  const page = await browser.newPage();
  for (const lang of ['en', 'ar']) {
    await page.goto('file://' + path.join(OUT, `innovaforge-toolkit-${lang}.html`), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(() => [...document.querySelectorAll('.page')].map((p, i) => [i + 1, p.querySelector('.inner').scrollHeight - p.querySelector('.inner').clientHeight]).filter(([, d]) => d > 1));
    if (overflow.length) console.warn(`${lang}: content overflows on pages`, JSON.stringify(overflow));
    await page.pdf({ path: path.join(OUT, `innovaforge-toolkit-${lang}.pdf`), width: '6in', height: '9in', printBackground: true, preferCSSPageSize: true });
    console.log(`out/innovaforge-toolkit-${lang}.pdf`);
  }
  await browser.close();
}
