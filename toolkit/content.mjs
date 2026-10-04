// The InnovaForge Toolkit: every template and worksheet for the five stages of
// "InnovaForge: From Spark to Scale" (2026), in English and Arabic.
//
// Content only. build.mjs lays it out as 6 × 9 in pages, matching the white
// paper's edition; workbook.py turns the tabular sheets into a fillable workbook.
// Stage names, objectives, core actions, techniques and exit criteria are the
// paper's own words; the sheets turn each activity into something to fill in.

export const meta = {
  title: { en: 'InnovaForge Toolkit', ar: 'حقيبة أدوات إنوفا فورج' },
  subtitle: {
    en: 'Templates and worksheets for the five stages, from spark to scale',
    ar: 'قوالب وأوراق عمل للمراحل الخمس، من الشرارة إلى التوسّع',
  },
  edition: { en: 'Toolkit — 2026', ar: 'حقيبة الأدوات — ٢٠٢٦' },
  author: { en: 'Prof. Dr. Mohamed Fawzi Elgendi', ar: 'أ.د. محمد فوزى الجندى' },
  copyright: { en: '© 2026 Prof. Dr. Mohamed Fawzi Elgendi · CC BY-SA 4.0', ar: '© ٢٠٢٦ أ.د. محمد فوزى الجندى · CC BY-SA 4.0' },
  runner: { en: 'InnovaForge Toolkit', ar: 'حقيبة أدوات إنوفا فورج' },
  site: 'WWW.FAWZOOZ.AI',
};

// Shared words.
export const w = {
  stage: { en: 'Stage', ar: 'المرحلة' },
  of5: { en: 'of 5', ar: 'من ٥' },
  sheet: { en: 'Sheet', ar: 'ورقة' },
  project: { en: 'Project', ar: 'المشروع' },
  date: { en: 'Date', ar: 'التاريخ' },
  team: { en: 'Team', ar: 'الفريق' },
  owner: { en: 'Owner', ar: 'المسؤول' },
  objective: { en: 'Objective', ar: 'الهدف' },
  action: { en: 'Core action', ar: 'الإجراء الجوهري' },
  activities: { en: 'Activities', ar: 'الأنشطة' },
  techniques: { en: 'Techniques', ar: 'التقنيات' },
  exit: { en: 'Exit criteria', ar: 'معايير الخروج' },
  sheetsHere: { en: 'Sheets in this stage', ar: 'أوراق هذه المرحلة' },
  gate: { en: 'Exit gate', ar: 'بوابة الخروج' },
  output: { en: 'Output', ar: 'المُخرَج' },
  when: { en: 'When', ar: 'متى' },
  steps: { en: 'How', ar: 'الطريقة' },
  case: { en: 'Case or origin', ar: 'الحالة أو المصدر' },
  example: { en: 'Example', ar: 'مثال' },
  contents: { en: 'Contents', ar: 'المحتويات' },
  feedsCanvas: { en: 'Feeds the canvas', ar: 'يُغذّي اللوحة' },
  page: { en: 'Page', ar: 'الصفحة' },
};

export const stages = [
  {
    key: 'ignite', n: 1, icon: 'local_fire_department',
    name: { en: 'Ignite', ar: 'الإشعال' },
    tagline: { en: 'The Spark of Insight', ar: 'شرارة البصيرة' },
    objective: {
      en: 'Move from broad curiosity to a specific, well-defined problem or opportunity worth exploring.',
      ar: 'الانتقال من الفضول العام إلى مشكلة أو فرصة محددة وواضحة تستحق الاستكشاف.',
    },
    action: { en: 'Identify opportunities', ar: 'تحديد الفرص' },
    activities: {
      en: 'Problem finding beneath surface issues; inspiration mining across reports, competitors, customers and unrelated fields; and open, judgment-free brainstorming.',
      ar: 'اكتشاف المشكلات تحت القضايا السطحية، والتنقيب عن الإلهام في التقارير والمنافسين والعملاء والمجالات البعيدة، والعصف الذهني المفتوح دون أحكام.',
    },
    techniques: { en: 'Brainstorming, the 5 Whys, Provocation.', ar: 'العصف الذهني، واللماذات الخمس، والاستفزاز الذهني.' },
    exit: {
      en: 'One to three prioritized problems or opportunities and a bank of initial ideas, recorded on the canvas.',
      ar: 'من مشكلة إلى ثلاث مشكلات أو فرص مرتّبة بالأولوية، ورصيد من الأفكار الأولية موثّق في اللوحة.',
    },
    gate: [
      { en: 'We looked beneath the surface issue and wrote down a root cause, not a symptom.', ar: 'نظرنا تحت القضية السطحية ودوّنّا سبباً جذرياً لا عَرَضاً.' },
      { en: 'Inspiration came from at least three kinds of source, one of them an unrelated field.', ar: 'جاء الإلهام من ثلاثة أنواع من المصادر على الأقل، أحدها مجال بعيد.' },
      { en: 'We brainstormed with judgment switched off, and kept every idea in the bank.', ar: 'عصفنا ذهنياً دون أحكام، واحتفظنا بكل فكرة في الرصيد.' },
      { en: 'One to three problems or opportunities are ranked by priority.', ar: 'رُتّبت مشكلة إلى ثلاث مشكلات أو فرص بحسب الأولوية.' },
      { en: 'The three Ignite boxes on the canvas are filled in.', ar: 'مُلئت خانات الإشعال الثلاث في اللوحة.' },
    ],
  },
  {
    key: 'forge', n: 2, icon: 'hardware',
    name: { en: 'Forge', ar: 'التشكيل' },
    tagline: { en: 'Shaping the Concept', ar: 'صياغة المفهوم' },
    objective: {
      en: 'Transform raw ideas into structured, testable concepts with a clear value proposition.',
      ar: 'تحويل الأفكار الخام إلى مفاهيم منظّمة قابلة للاختبار ذات عرض قيمة واضح.',
    },
    action: { en: 'Define the value proposition', ar: 'تحديد عرض القيمة' },
    activities: {
      en: 'Concept statements that define purpose, audience and features; a thirty-minute Lean Canvas; and low-fidelity prototypes such as sketches, wireframes or a “future press release”.',
      ar: 'بيانات مفاهيمية تحدد الغاية والجمهور والخصائص، ولوحة رشيقة في ثلاثين دقيقة، ونماذج أولية مبسّطة كالرسومات والمخططات الهيكلية أو «البيان الصحفي المستقبلي».',
    },
    techniques: { en: 'SCAMPER, TRIZ, Mind mapping.', ar: 'سكامبر، وتريز، والخرائط الذهنية.' },
    exit: {
      en: 'A clear value proposition and a low-fidelity prototype ready for first feedback.',
      ar: 'عرض قيمة واضح ونموذج أولي مبسّط جاهز لتلقّي الملاحظات الأولى.',
    },
    gate: [
      { en: 'The concept statement names its purpose, its audience and its features.', ar: 'يسمّي بيان المفهوم غايته وجمهوره وخصائصه.' },
      { en: 'The value proposition fits in one sentence that someone outside the team understands.', ar: 'يتّسع عرض القيمة لجملة واحدة يفهمها من هو خارج الفريق.' },
      { en: 'The Lean Canvas is complete, and its riskiest boxes are marked.', ar: 'اكتملت اللوحة الرشيقة، ووُسمت أخطر خاناتها.' },
      { en: 'A low-fidelity prototype exists: a sketch, a wireframe or a future press release.', ar: 'يوجد نموذج أولي مبسّط: رسم، أو مخطط هيكلي، أو بيان صحفي مستقبلي.' },
      { en: 'The three Forge boxes on the canvas are filled in.', ar: 'مُلئت خانات التشكيل الثلاث في اللوحة.' },
    ],
  },
  {
    key: 'temper', n: 3, icon: 'science',
    name: { en: 'Temper', ar: 'التطويع' },
    tagline: { en: 'Testing and Iteration', ar: 'الاختبار والتكرار' },
    objective: {
      en: 'Expose the concept to real-world feedback and data, strengthening it through rapid cycles of learning.',
      ar: 'تعريض المفهوم لملاحظات الواقع وبياناته، وتقويته عبر دورات سريعة من التعلّم.',
    },
    action: { en: 'Validate with users', ar: 'التحقق مع المستخدمين' },
    activities: {
      en: 'Build a minimum viable product; run interviews, analytics, A/B and usability tests with five to ten users per cycle; iterate or pivot on evidence through Build–Measure–Learn.',
      ar: 'بناء منتج أولي قابل للتطبيق، وإجراء مقابلات وتحليلات واختبارات مقارنة واختبارات سهولة استخدام مع خمسة إلى عشرة مستخدمين في كل دورة، ثم التحسين أو تغيير الاتجاه بناءً على الأدلة وفق «ابنِ ثم قِس ثم تعلّم».',
    },
    techniques: { en: 'Design Thinking, Storyboarding.', ar: 'التفكير التصميمي، واللوحات القصصية.' },
    exit: {
      en: 'Core assumptions validated or invalidated with real user data; learnings and pivots recorded.',
      ar: 'التحقق من الافتراضات الجوهرية أو دحضها ببيانات مستخدمين حقيقية، وتوثيق الدروس والتحوّلات.',
    },
    gate: [
      { en: 'The riskiest assumptions were named before anything was built.', ar: 'سُمّيت أخطر الافتراضات قبل بناء أي شيء.' },
      { en: 'Each test had a success signal written down before it ran.', ar: 'كُتبت لكل اختبار علامة نجاح قبل إجرائه.' },
      { en: 'Five to ten real users took part in each cycle.', ar: 'شارك خمسة إلى عشرة مستخدمين حقيقيين في كل دورة.' },
      { en: 'Every core assumption is marked validated or invalidated, with its evidence.', ar: 'وُسم كل افتراض جوهري بأنه مُتحقَّق منه أو مدحوض، مع دليله.' },
      { en: 'Learnings and pivots are recorded, and the three Temper boxes on the canvas are filled in.', ar: 'وُثّقت الدروس والتحوّلات، ومُلئت خانات التطويع الثلاث في اللوحة.' },
    ],
  },
  {
    key: 'sculpt', n: 4, icon: 'architecture',
    name: { en: 'Sculpt', ar: 'النحت' },
    tagline: { en: 'Planning for Impact', ar: 'التخطيط للأثر' },
    objective: {
      en: 'Create a clear, actionable, strategic roadmap for developing and launching the validated solution.',
      ar: 'وضع خارطة طريق استراتيجية واضحة وقابلة للتنفيذ لتطوير الحل المُتحقَّق منه وإطلاقه.',
    },
    action: { en: 'Create an actionable roadmap', ar: 'إعداد خارطة طريق قابلة للتنفيذ' },
    activities: {
      en: 'Strategic alignment with the mission; agile planning in user stories and sprints with OKRs and a three-to-six-month roadmap; resources, budget and a simple risk matrix.',
      ar: 'المواءمة الاستراتيجية مع الرسالة، والتخطيط الرشيق بقصص المستخدم ودورات العمل القصيرة مع الأهداف والنتائج الرئيسية وخارطة طريق لثلاثة إلى ستة أشهر، والموارد والميزانية ومصفوفة مخاطر بسيطة.',
    },
    techniques: { en: 'SWOT analysis, Six Thinking Hats.', ar: 'التحليل الرباعي، والقبعات الست للتفكير.' },
    exit: {
      en: 'A roadmap with objectives and success metrics agreed by the team and stakeholders.',
      ar: 'خارطة طريق بأهداف ومقاييس نجاح متفق عليها بين الفريق وأصحاب المصلحة.',
    },
    gate: [
      { en: 'The solution is tied to a line of the mission or strategy, in writing.', ar: 'رُبط الحل كتابةً بسطر من الرسالة أو الاستراتيجية.' },
      { en: 'Each objective has measurable key results, with a baseline and a target.', ar: 'لكل هدف نتائج رئيسية قابلة للقياس، بخط أساس وقيمة مستهدفة.' },
      { en: 'The roadmap covers three to six months, broken into sprints and user stories.', ar: 'تغطي خارطة الطريق من ثلاثة إلى ستة أشهر، مقسّمة إلى دورات عمل وقصص مستخدم.' },
      { en: 'Resources, budget and the top risks are on paper, each risk with an owner.', ar: 'الموارد والميزانية وأهم المخاطر مكتوبة، ولكل خطر مسؤول.' },
      { en: 'The team and the stakeholders have agreed the roadmap and its success metrics.', ar: 'اتفق الفريق وأصحاب المصلحة على خارطة الطريق ومقاييس نجاحها.' },
    ],
  },
  {
    key: 'polish', n: 5, icon: 'rocket_launch',
    name: { en: 'Polish', ar: 'الصقل' },
    tagline: { en: 'Launch, Learn, and Scale', ar: 'الإطلاق والتعلّم والتوسّع' },
    objective: {
      en: 'Execute the plan, measure real-world impact, and embed the learnings back into the organization.',
      ar: 'تنفيذ الخطة، وقياس الأثر الفعلي، وترسيخ الدروس المستفادة في المؤسسة.',
    },
    action: { en: 'Deliver, measure, and learn', ar: 'التسليم والقياس والتعلّم' },
    activities: {
      en: 'A full or phased launch guided by a checklist; tracking the OKRs and KPIs set in Sculpt; and a retrospective two to four weeks after launch: what worked, what did not, what we learned.',
      ar: 'إطلاق كامل أو تدريجي وفق قائمة تحقق، ومتابعة الأهداف ومؤشرات الأداء المحددة في النحت، ومراجعة لاحقة بعد أسبوعين إلى أربعة أسابيع: ما الذي نجح؟ وما الذي لم ينجح؟ وماذا تعلّمنا؟',
    },
    techniques: null,
    exit: {
      en: 'Initial performance data analyzed and a decision taken: iterate, scale or sunset. The cycle begins anew.',
      ar: 'تحليل بيانات الأداء الأولية واتخاذ قرار: التكرار أو التوسّع أو الإيقاف، ثم تبدأ الدورة من جديد.',
    },
    gate: [
      { en: 'The launch followed its checklist, full or phased as planned.', ar: 'سار الإطلاق وفق قائمة التحقق، كاملاً أو تدريجياً كما خُطّط.' },
      { en: 'The OKRs and KPIs set in Sculpt were tracked from day one.', ar: 'تُوبعت الأهداف ومؤشرات الأداء المحددة في النحت منذ اليوم الأول.' },
      { en: 'A retrospective was held two to four weeks after launch.', ar: 'عُقدت مراجعة لاحقة بعد أسبوعين إلى أربعة أسابيع من الإطلاق.' },
      { en: 'A decision was taken on the data: iterate, scale or sunset.', ar: 'اتُّخذ قرار بناءً على البيانات: التكرار أو التوسّع أو الإيقاف.' },
      { en: 'The lessons are written into the next Ignite, and the cycle begins anew.', ar: 'كُتبت الدروس في الإشعال التالي، وبدأت الدورة من جديد.' },
    ],
  },
];

// The canvas: Figure 3 of the paper.
export const canvas = [
  [{ icon: 'search', en: 'Problems & opportunities', ar: 'المشكلات والفرص' }, { icon: 'auto_awesome', en: 'Inspiration sources', ar: 'مصادر الإلهام' }, { icon: 'inventory_2', en: 'Idea bank', ar: 'رصيد الأفكار' }],
  [{ icon: 'edit_note', en: 'Concept statement', ar: 'بيان المفهوم' }, { icon: 'diamond', en: 'Value proposition', ar: 'عرض القيمة' }, { icon: 'draw', en: 'Low-fi prototype', ar: 'النموذج المبسّط' }],
  [{ icon: 'priority_high', en: 'Riskiest assumptions', ar: 'أخطر الافتراضات' }, { icon: 'forum', en: 'User feedback', ar: 'ملاحظات المستخدمين' }, { icon: 'alt_route', en: 'Learnings & pivots', ar: 'الدروس والتحوّلات' }],
  [{ icon: 'flag', en: 'Goals & OKRs', ar: 'الأهداف والنتائج' }, { icon: 'map', en: 'Roadmap & sprints', ar: 'خارطة الطريق' }, { icon: 'savings', en: 'Resources & risks', ar: 'الموارد والمخاطر' }],
  [{ icon: 'campaign', en: 'Launch plan', ar: 'خطة الإطلاق' }, { icon: 'monitoring', en: 'Impact metrics', ar: 'مقاييس الأثر' }, { icon: 'arrow_forward', en: 'Next step', ar: 'الخطوة التالية' }],
];

// The ten techniques: Figure 2 of the paper, each turned into a card.
export const techniques = [
  {
    stage: 'ignite', icon: 'tips_and_updates', en: 'Brainstorming', ar: 'العصف الذهني',
    origin: { en: 'IDEO shopping cart (1999); Osborn (1953)', ar: 'عربة تسوّق آيديو (١٩٩٩)؛ أوزبورن (١٩٥٣)' },
    when: { en: 'You need many ideas fast, before anyone starts judging them.', ar: 'حين تحتاج إلى أفكار كثيرة بسرعة، قبل أن يبدأ أحد بالحكم عليها.' },
    steps: [
      { en: 'Write the challenge as a question: “How might we…?”', ar: 'اكتب التحدي سؤالاً: «كيف يمكننا…؟»' },
      { en: 'Set the rules aloud: defer judgment, build on others’ ideas, go for quantity.', ar: 'أعلن القواعد: أرجئ الحكم، وابنِ على أفكار الآخرين، واطلب الكمّ.' },
      { en: 'Timebox it: fifteen to twenty minutes, one idea per note.', ar: 'حدّد الوقت: من خمس عشرة إلى عشرين دقيقة، وفكرة واحدة في كل ورقة.' },
      { en: 'Cluster the notes, then vote; only now is judgment allowed.', ar: 'جمّع الأوراق في مجموعات ثم صوّتوا؛ الآن فقط يُسمح بالحكم.' },
    ],
    output: { en: 'A bank of ideas and a short list chosen by vote.', ar: 'رصيد من الأفكار وقائمة قصيرة مختارة بالتصويت.' },
    sheet: '1.3',
  },
  {
    stage: 'ignite', icon: 'quiz', en: 'The 5 Whys', ar: 'اللماذات الخمس',
    origin: { en: 'Toyota Production System; Ohno (1988)', ar: 'نظام تويوتا للإنتاج؛ أونو (١٩٨٨)' },
    when: { en: 'A problem keeps coming back, or the team is about to fund a fix for a symptom.', ar: 'حين تتكرّر مشكلة، أو يوشك الفريق أن يموّل علاجاً لعَرَض.' },
    steps: [
      { en: 'State the problem as a fact you have seen, not a guess.', ar: 'صُغ المشكلة حقيقةً رأيتها، لا تخميناً.' },
      { en: 'Ask “why?” and write the answer; ask again of that answer.', ar: 'اسأل «لماذا؟» ودوّن الجواب، ثم اسأل السؤال نفسه عن الجواب.' },
      { en: 'Stop when the answer is something you can act on and prevent.', ar: 'توقّف حين يصبح الجواب شيئاً يمكنك العمل عليه ومنعه.' },
      { en: 'Check the chain backwards: does each cause really lead to the next?', ar: 'تحقّق من السلسلة عكسياً: هل يؤدي كل سبب حقاً إلى ما بعده؟' },
    ],
    output: { en: 'A root cause worth solving, in one sentence.', ar: 'سبب جذري يستحق الحل، في جملة واحدة.' },
    sheet: '1.1',
  },
  {
    stage: 'ignite', icon: 'bolt', en: 'Provocation', ar: 'الاستفزاز الذهني',
    origin: { en: 'de Bono, Lateral Thinking (1970)', ar: 'دي بونو، التفكير الجانبي (١٩٧٠)' },
    when: { en: 'Ideas have dried up, or every idea looks like last year’s.', ar: 'حين تنضب الأفكار، أو تبدو كل فكرة كأفكار العام الماضي.' },
    steps: [
      { en: 'Write down something everyone takes for granted about the situation.', ar: 'دوّن أمراً يعدّه الجميع مسلّماً به في الموقف.' },
      { en: 'Turn it into a deliberately unreasonable statement, marked “Po”: reverse it, remove it, exaggerate it.', ar: 'حوّله إلى عبارة غير معقولة عمداً، وعلّمها بكلمة «بو»: اعكسه، أو احذفه، أو بالغ فيه.' },
      { en: 'Do not judge the provocation; ask what would follow from it.', ar: 'لا تحكم على الاستفزاز؛ بل اسأل ماذا يترتّب عليه.' },
      { en: 'Carry any useful principle back to a practical idea.', ar: 'انقل أي مبدأ مفيد إلى فكرة عملية.' },
    ],
    output: { en: 'Ideas that ordinary brainstorming would not reach.', ar: 'أفكار لا يبلغها العصف الذهني المعتاد.' },
    sheet: '1.3',
  },
  {
    stage: 'forge', icon: 'shuffle', en: 'SCAMPER', ar: 'سكامبر',
    origin: { en: 'Osborn → Eberle (1971)', ar: 'أوزبورن ← إيبرل (١٩٧١)' },
    when: { en: 'You have a raw idea or an existing product and want variations of it.', ar: 'حين تكون لديك فكرة خام أو منتج قائم وتريد صيغاً بديلة منه.' },
    steps: [
      { en: 'Put the idea in the centre of the sheet.', ar: 'ضع الفكرة في وسط الورقة.' },
      { en: 'Run the seven prompts in order: Substitute, Combine, Adapt, Modify, Put to another use, Eliminate, Reverse.', ar: 'مُرّ على المحفّزات السبعة بالترتيب: استبدل، ادمج، كيّف، عدّل، استخدم لغرض آخر، احذف، اعكس.' },
      { en: 'Write at least one answer per prompt, even a weak one.', ar: 'اكتب جواباً واحداً على الأقل لكل محفّز، ولو كان ضعيفاً.' },
      { en: 'Star the two or three that change the value most.', ar: 'ضع نجمة على الاثنين أو الثلاثة الأكثر تغييراً للقيمة.' },
    ],
    output: { en: 'Concept variations to shape into a concept statement.', ar: 'صيغ بديلة للمفهوم تُصاغ في بيان المفهوم.' },
    sheet: '2.2',
  },
  {
    stage: 'forge', icon: 'join_inner', en: 'TRIZ', ar: 'تريز',
    origin: { en: 'Altshuller (1984); Samsung (1998–2004)', ar: 'ألتشولر (١٩٨٤)؛ سامسونج (١٩٩٨–٢٠٠٤)' },
    when: { en: 'Improving one thing makes another worse: a contradiction.', ar: 'حين يؤدي تحسين أمر إلى إفساد أمر آخر: أي تناقض.' },
    steps: [
      { en: 'Name what you want to improve, and what gets worse when you do.', ar: 'سمِّ ما تريد تحسينه، وما يسوء حين تفعل.' },
      { en: 'Write the contradiction as one sentence: “We want X, but then Y.”', ar: 'اكتب التناقض جملةً واحدة: «نريد س، لكن عندئذٍ يحدث ص».' },
      { en: 'Try the inventive principles on the sheet, one at a time.', ar: 'جرّب مبادئ الابتكار المدرجة في الورقة، واحداً تلو الآخر.' },
      { en: 'Keep the solutions that remove the contradiction rather than balance it.', ar: 'احتفظ بالحلول التي تُزيل التناقض بدل أن توازن بين طرفيه.' },
    ],
    output: { en: 'A concept that resolves its own trade-off.', ar: 'مفهوم يحلّ المفاضلة الكامنة فيه.' },
    sheet: '2.3',
  },
  {
    stage: 'forge', icon: 'account_tree', en: 'Mind mapping', ar: 'الخرائط الذهنية',
    origin: { en: 'Buzan, Use Your Head (1974)', ar: 'بوزان، استخدم رأسك (١٩٧٤)' },
    when: { en: 'The idea has many parts and you need to see how they connect.', ar: 'حين تكون للفكرة أجزاء كثيرة وتحتاج إلى رؤية ترابطها.' },
    steps: [
      { en: 'Write the concept in the centre, in a word or an image.', ar: 'اكتب المفهوم في الوسط، بكلمة أو صورة.' },
      { en: 'Draw main branches: who, what, why, how, where, how much.', ar: 'ارسم الفروع الرئيسية: مَن، وماذا، ولماذا، وكيف، وأين، وكم.' },
      { en: 'Add sub-branches with one word each; let them multiply.', ar: 'أضف فروعاً فرعية بكلمة واحدة لكل منها، ودعها تتكاثر.' },
      { en: 'Link branches that touch; those links are often the concept.', ar: 'اربط الفروع المتلامسة؛ فتلك الروابط كثيراً ما تكون هي المفهوم.' },
    ],
    output: { en: 'The structure of the concept on one page.', ar: 'بنية المفهوم في صفحة واحدة.' },
    sheet: '2.4',
  },
  {
    stage: 'temper', icon: 'favorite', en: 'Design Thinking', ar: 'التفكير التصميمي',
    origin: { en: 'Brown (2009); GE Healthcare Adventure Series', ar: 'براون (٢٠٠٩)؛ سلسلة المغامرات من جنرال إلكتريك' },
    when: { en: 'You need to learn what real users feel and do, not what the team assumes.', ar: 'حين تحتاج إلى معرفة ما يشعر به المستخدمون الحقيقيون وما يفعلونه، لا ما يفترضه الفريق.' },
    steps: [
      { en: 'Empathize: watch and interview the people you are building for.', ar: 'تعاطف: راقب الأشخاص الذين تبني لهم وحاورهم.' },
      { en: 'Define: restate the problem in their words.', ar: 'حدّد: أعد صياغة المشكلة بكلماتهم.' },
      { en: 'Ideate and prototype: make the cheapest thing they can react to.', ar: 'ولّد الأفكار وانمذج: اصنع أرخص شيء يمكنهم التفاعل معه.' },
      { en: 'Test with five to ten users, then go back to whichever step the evidence points to.', ar: 'اختبر مع خمسة إلى عشرة مستخدمين، ثم عُد إلى الخطوة التي يشير إليها الدليل.' },
    ],
    output: { en: 'User evidence for or against each core assumption.', ar: 'أدلة من المستخدمين تؤيد كل افتراض جوهري أو تنقضه.' },
    sheet: '3.3',
  },
  {
    stage: 'temper', icon: 'view_carousel', en: 'Storyboarding', ar: 'اللوحات القصصية',
    origin: { en: 'Walt Disney Studios (1930s)', ar: 'استوديوهات والت ديزني (الثلاثينيات)' },
    when: { en: 'You want users to react to the whole experience before it is built.', ar: 'حين تريد أن يتفاعل المستخدمون مع التجربة كاملة قبل بنائها.' },
    steps: [
      { en: 'Pick one user and one moment of need.', ar: 'اختر مستخدماً واحداً ولحظة حاجة واحدة.' },
      { en: 'Sketch six frames: before, trigger, first use, key moment, result, after.', ar: 'ارسم ست لقطات: قبل، والدافع، وأول استخدام، واللحظة الحاسمة، والنتيجة، وبعد.' },
      { en: 'Write one line under each frame: what they do and feel.', ar: 'اكتب سطراً تحت كل لقطة: ماذا يفعل وبماذا يشعر.' },
      { en: 'Show it to users and mark where they hesitate.', ar: 'اعرضها على المستخدمين وعلّم مواضع ترددهم.' },
    ],
    output: { en: 'The weak frames, found before they cost anything.', ar: 'اللقطات الضعيفة، مكتشفة قبل أن تكلّف شيئاً.' },
    sheet: '3.4',
  },
  {
    stage: 'sculpt', icon: 'grid_view', en: 'SWOT analysis', ar: 'التحليل الرباعي',
    origin: { en: 'Stanford Research Institute (1960s)', ar: 'معهد ستانفورد للأبحاث (الستينيات)' },
    when: { en: 'Before committing a roadmap, to see the solution against its context.', ar: 'قبل اعتماد خارطة الطريق، لرؤية الحل في سياقه.' },
    steps: [
      { en: 'Inside the team: list strengths and weaknesses.', ar: 'داخل الفريق: اذكر نقاط القوة ونقاط الضعف.' },
      { en: 'Outside: list opportunities and threats in the market or the institution.', ar: 'خارجه: اذكر الفرص والتهديدات في السوق أو المؤسسة.' },
      { en: 'Pair them: use a strength on an opportunity; cover a weakness facing a threat.', ar: 'زاوج بينها: وظّف قوة لاغتنام فرصة، وعالج ضعفاً يواجه تهديداً.' },
      { en: 'Turn each pairing into a roadmap item or a risk.', ar: 'حوّل كل مزاوجة إلى بند في خارطة الطريق أو إلى خطر.' },
    ],
    output: { en: 'Roadmap priorities and the first entries of the risk register.', ar: 'أولويات خارطة الطريق وأول بنود سجل المخاطر.' },
    sheet: '4.1',
  },
  {
    stage: 'sculpt', icon: 'palette', en: 'Six Thinking Hats', ar: 'القبعات الست',
    origin: { en: 'de Bono (1985)', ar: 'دي بونو (١٩٨٥)' },
    when: { en: 'The plan needs a full review without the meeting becoming a debate.', ar: 'حين تحتاج الخطة إلى مراجعة شاملة دون أن يتحوّل الاجتماع إلى جدال.' },
    steps: [
      { en: 'Everyone wears the same hat at the same time.', ar: 'يرتدي الجميع القبعة نفسها في الوقت نفسه.' },
      { en: 'White: facts. Red: feelings. Black: risks. Yellow: benefits. Green: alternatives.', ar: 'الأبيض: الحقائق. الأحمر: المشاعر. الأسود: المخاطر. الأصفر: المنافع. الأخضر: البدائل.' },
      { en: 'Blue opens and closes the session: what are we deciding, and what did we decide?', ar: 'الأزرق يفتتح الجلسة ويختمها: ماذا نقرّر؟ وماذا قرّرنا؟' },
      { en: 'Give each hat a few minutes and write its points on the sheet.', ar: 'امنح كل قبعة بضع دقائق، ودوّن نقاطها في الورقة.' },
    ],
    output: { en: 'A plan reviewed from six sides, and the changes it needs.', ar: 'خطة رُوجعت من ست زوايا، والتعديلات التي تحتاجها.' },
    sheet: '4.2',
  },
];

// The paper's three enabling conditions, the four sources of creative blocks and their remedies.
export const blocks = [
  { icon: 'sentiment_stressed', source: { en: 'Fear of failure', ar: 'الخوف من الفشل' }, remedy: { en: 'Self-compassion: treat the failed test as data, as the principles say.', ar: 'الرفق بالذات: عامل الاختبار الفاشل بوصفه بيانات، كما تقول المبادئ.' } },
  { icon: 'battery_alert', source: { en: 'Fatigue', ar: 'الإجهاد' }, remedy: { en: 'Structured breaks: stop on purpose, before you are forced to.', ar: 'فترات راحة منظّمة: توقّف عمداً قبل أن تُجبَر على التوقف.' } },
  { icon: 'repeat', source: { en: 'Stagnant routine', ar: 'الروتين الراكد' }, remedy: { en: 'A change of scene: another room, another route, other people.', ar: 'تغيير المكان: غرفة أخرى، وطريق آخر، وأناس آخرون.' } },
  { icon: 'stacks', source: { en: 'Information overload', ar: 'فيض المعلومات' }, remedy: { en: 'Time for deep work: protected hours with the inputs switched off.', ar: 'وقت للعمل العميق: ساعات محمية والمدخلات مُطفأة.' } },
];

export const audiences = [
  { icon: 'school', name: { en: 'Students', ar: 'الطلاب' }, text: { en: 'Use a single semester project to move through all five stages; the canvas becomes the assessed deliverable.', ar: 'استخدام مشروع فصل دراسي واحد للمرور بالمراحل الخمس، لتصبح اللوحة هي المُخرَج الخاضع للتقييم.' },
    plan: [{ en: 'Weeks 1–2', ar: 'الأسبوعان ١–٢' }, { en: 'Weeks 3–5', ar: 'الأسابيع ٣–٥' }, { en: 'Weeks 6–9', ar: 'الأسابيع ٦–٩' }, { en: 'Weeks 10–12', ar: 'الأسابيع ١٠–١٢' }, { en: 'Weeks 13–14', ar: 'الأسبوعان ١٣–١٤' }] },
  { icon: 'co_present', name: { en: 'Educators and trainers', ar: 'المعلمون والمدرّبون' }, text: { en: 'Teach each technique inside the stage it serves, and use exit criteria as rubrics.', ar: 'تدريس كل تقنية داخل المرحلة التي تخدمها، واستخدام معايير الخروج كسلالم تقدير.' },
    plan: [{ en: 'Session 1', ar: 'الجلسة ١' }, { en: 'Session 2', ar: 'الجلسة ٢' }, { en: 'Session 3', ar: 'الجلسة ٣' }, { en: 'Session 4', ar: 'الجلسة ٤' }, { en: 'Session 5', ar: 'الجلسة ٥' }] },
  { icon: 'apartment', name: { en: 'Corporate teams', ar: 'فرق الشركات' }, text: { en: 'Pilot on one cross-functional initiative for one quarter, with the canvas reviewed at each milestone.', ar: 'التجربة على مبادرة واحدة متعددة التخصصات لمدة ربع سنة، مع مراجعة اللوحة عند كل محطة.' },
    plan: [{ en: 'Weeks 1–2', ar: 'الأسبوعان ١–٢' }, { en: 'Weeks 3–4', ar: 'الأسبوعان ٣–٤' }, { en: 'Weeks 5–8', ar: 'الأسابيع ٥–٨' }, { en: 'Weeks 9–10', ar: 'الأسبوعان ٩–١٠' }, { en: 'Weeks 11–13', ar: 'الأسابيع ١١–١٣' }] },
  { icon: 'rocket', name: { en: 'Entrepreneurs', ar: 'روّاد الأعمال' }, text: { en: 'Compress Ignite to Temper into weeks, not months, and treat Polish metrics as investor evidence.', ar: 'ضغط المراحل من الإشعال إلى التطويع في أسابيع لا أشهر، واعتبار مقاييس الصقل دليلاً يُقدَّم للمستثمرين.' },
    plan: [{ en: 'Week 1', ar: 'الأسبوع ١' }, { en: 'Week 2', ar: 'الأسبوع ٢' }, { en: 'Weeks 3–5', ar: 'الأسابيع ٣–٥' }, { en: 'Month 2', ar: 'الشهر ٢' }, { en: 'Month 3 on', ar: 'من الشهر ٣' }] },
  { icon: 'account_balance', name: { en: 'Academic institutions', ar: 'المؤسسات الأكاديمية' }, text: { en: 'Adopt the stages as a common vocabulary for innovation programmes, and study the framework’s outcomes empirically.', ar: 'اعتماد المراحل لغةً مشتركة لبرامج الابتكار، ودراسة نتائج الإطار دراسةً تجريبية.' },
    plan: [{ en: 'Term 1', ar: 'الفصل ١' }, { en: 'Term 1', ar: 'الفصل ١' }, { en: 'Term 2', ar: 'الفصل ٢' }, { en: 'Term 2', ar: 'الفصل ٢' }, { en: 'Year end', ar: 'نهاية العام' }] },
];

export const glossary = [
  { en: ['MVP', 'The version of a new product that yields the most validated learning about customers with the least effort.'], ar: ['المنتج الأولي القابل للتطبيق (MVP)', 'نسخة المنتج الجديد التي تحقق أكبر قدر من التعلّم المُتحقَّق منه عن العملاء بأقل جهد.'] },
  { en: ['Lean Canvas', 'A one-page business plan that breaks an idea into its key assumptions.'], ar: ['اللوحة الرشيقة (Lean Canvas)', 'خطة عمل في صفحة واحدة تفكّك الفكرة إلى افتراضاتها الرئيسية.'] },
  { en: ['OKR', 'Objectives and Key Results: a framework for setting goals and tracking outcomes.'], ar: ['الأهداف والنتائج الرئيسية (OKR)', 'إطار لتحديد الأهداف ومتابعة النتائج.'] },
  { en: ['KPI', 'Key performance indicator: a number tracked over time to show whether the work is having its effect.'], ar: ['مؤشر الأداء الرئيسي (KPI)', 'رقم يُتابَع عبر الزمن ليُظهر هل يُحدث العمل أثره.'] },
  { en: ['Pivot', 'A structured course correction that tests a new fundamental hypothesis.'], ar: ['التحوّل (Pivot)', 'تصحيح منظّم للمسار يختبر فرضية أساسية جديدة.'] },
  { en: ['Exit criteria', 'What has to be true before a stage is closed; in this toolkit, the gate at the end of each stage.'], ar: ['معايير الخروج', 'ما يجب أن يتحقق قبل إغلاق المرحلة؛ وهي في هذه الحقيبة البوابة في نهاية كل مرحلة.'] },
];

export const references = [
  'Altshuller, G. (1984). Creativity as an Exact Science. Gordon & Breach.',
  'Brown, T. (2009). Change by Design. HarperBusiness.',
  'Buzan, T. (1974). Use Your Head. BBC Books.',
  'de Bono, E. (1970). Lateral Thinking. Harper & Row.',
  'de Bono, E. (1985). Six Thinking Hats. Little, Brown.',
  'Doerr, J. (2018). Measure What Matters. Portfolio.',
  'Eberle, B. (1971). SCAMPER. D.O.K. Publishers.',
  'Edmondson, A. (1999). Psychological safety and learning behavior in work teams. Administrative Science Quarterly, 44(2).',
  'Kelley, T. (2001). The Art of Innovation. Currency/Doubleday.',
  'Kelley, T., & Kelley, D. (2013). Creative Confidence. Crown Business.',
  'Maurya, A. (2012). Running Lean. O’Reilly.',
  'Ohno, T. (1988). Toyota Production System. Productivity Press.',
  'Osborn, A. F. (1953). Applied Imagination. Scribner.',
  'Ries, E. (2011). The Lean Startup. Crown Business.',
];
