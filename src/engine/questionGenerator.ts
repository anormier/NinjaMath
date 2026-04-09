import type {
  QuestionState,
  QuestionStyle,
  QuestionDisplay,
  InputMode,
} from '../types/index.ts';

const WORD_PLAYFUL_TEMPLATES: Array<(a: number, b: number, answer: number) => { displayText: string; displaySubtext?: string }> = [
  (a, b) => ({
    displayText: `Si un ninja lance ${a} shurikens ${b} fois, combien en a-t-il lanc\u00e9 ?`,
  }),
  (a, b) => ({
    displayText: `${a} pirates ont chacun ${b} perroquets. Combien de perroquets au total ?`,
  }),
  (a, b) => ({
    displayText: `${a} dragons crachent chacun ${b} flammes. Combien de flammes ?`,
  }),
  (a, b) => ({
    displayText: `Il y a ${a} paniers avec ${b} pommes dans chacun. Combien de pommes ?`,
  }),
  (a, b) => ({
    displayText: `${a} robots ont chacun ${b} bras. Combien de bras en tout ?`,
  }),
  (a, b) => ({
    displayText: `${a} extra-terrestres ont chacun ${b} yeux. Combien d'yeux au total ?`,
  }),
  (a, b) => ({
    displayText: `${a} sorci\u00e8res pr\u00e9parent chacune ${b} potions. Combien de potions ?`,
  }),
  (a, b) => ({
    displayText: `${a} astronautes visitent chacun ${b} plan\u00e8tes. Combien de plan\u00e8tes visit\u00e9es ?`,
  }),
  (a, b) => ({
    displayText: `${a} \u00e9quipes de ${b} joueurs. Combien de joueurs au total ?`,
  }),
  (a, b) => ({
    displayText: `${a} monstres mangent chacun ${b} bonbons. Combien de bonbons d\u00e9vor\u00e9s ?`,
  }),
  (a, b) => ({
    displayText: `${a} licornes font chacune ${b} sauts arc-en-ciel. Combien de sauts ?`,
  }),
  (a, b) => ({
    displayText: `Un magicien r\u00e9p\u00e8te son sort ${a} fois et chaque sort cr\u00e9e ${b} \u00e9toiles. Combien d'\u00e9toiles ?`,
  }),
  (a, b) => ({
    displayText: `${a} trains ont chacun ${b} wagons. Combien de wagons en tout ?`,
  }),
  (a, b) => ({
    displayText: `${a} chats attrapent chacun ${b} souris. Combien de souris attrap\u00e9es ?`,
  }),
  (a, b) => ({
    displayText: `${a} super-h\u00e9ros sauvent chacun ${b} personnes. Combien de personnes sauv\u00e9es ?`,
  }),
  (a, b) => ({
    displayText: `${a} f\u00e9es distribuent chacune ${b} voeux. Combien de voeux distribu\u00e9s ?`,
  }),
];

const EMOJI_SETS = [
  '\u{1F31F}', '\u{1F525}', '\u{1F680}', '\u{1F47E}', '\u{1F984}',
  '\u{1F98A}', '\u{1F409}', '\u{26A1}', '\u{1F48E}', '\u{1F3AF}',
];

export function getAvailableStyles(inputMode: InputMode): QuestionStyle[] {
  const baseStyles: QuestionStyle[] = [
    'classic',
    'word_fr',
    'word_playful',
    'emoji',
    'big_font',
    'upside_text',
    'color_pop',
    'handwritten',
  ];

  if (inputMode === 'keypad') {
    return [...baseStyles, 'reverse', 'fill_blank'];
  }

  return baseStyles;
}

function pickRandomStyle(
  available: QuestionStyle[],
  lastStyle: QuestionStyle | null
): QuestionStyle {
  const filtered = lastStyle !== null
    ? available.filter((s) => s !== lastStyle)
    : available;
  const pool = filtered.length > 0 ? filtered : available;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function buildQuestionDisplay(
  a: number,
  b: number,
  answer: number,
  style: QuestionStyle,
  inputMode: InputMode,
  choices: number[] | undefined
): QuestionDisplay {
  const base: QuestionDisplay = {
    a,
    b,
    answer,
    style,
    inputMode,
    displayText: '',
    choices,
  };

  switch (style) {
    case 'classic':
      return {
        ...base,
        displayText: `${a} \u00d7 ${b} = ?`,
      };

    case 'reverse':
      return {
        ...base,
        displayText: `? \u00d7 ${b} = ${answer}`,
        displaySubtext: `Quel nombre multipli\u00e9 par ${b} donne ${answer} ?`,
      };

    case 'fill_blank':
      return {
        ...base,
        displayText: `${a} \u00d7 ___ = ${answer}`,
        displaySubtext: 'Remplis le trou !',
      };

    case 'word_fr':
      return {
        ...base,
        displayText: `Combien font ${a} fois ${b} ?`,
      };

    case 'word_playful': {
      const templateIndex = Math.floor(Math.random() * WORD_PLAYFUL_TEMPLATES.length);
      const template = WORD_PLAYFUL_TEMPLATES[templateIndex];
      const result = template(a, b, answer);
      return {
        ...base,
        displayText: result.displayText,
        displaySubtext: result.displaySubtext,
      };
    }

    case 'emoji': {
      const emojiIndex = Math.floor(Math.random() * EMOJI_SETS.length);
      const emoji = EMOJI_SETS[emojiIndex];
      const rows: string[] = [];
      for (let i = 0; i < a; i++) {
        rows.push(emoji.repeat(b));
      }
      return {
        ...base,
        displayText: `${a} \u00d7 ${b} = ?`,
        displaySubtext: rows.join('\n'),
        emoji,
      };
    }

    case 'big_font':
      return {
        ...base,
        displayText: `${a} \u00d7 ${b}`,
        fontClass: 'text-6xl font-black',
      };

    case 'upside_text':
      return {
        ...base,
        displayText: `${a} \u00d7 ${b} = ?`,
        cssTransform: 'rotate(180deg)',
      };

    case 'color_pop':
      return {
        ...base,
        displayText: `${a} \u00d7 ${b} = ?`,
        colorMap: [
          `hsl(${(a * 37) % 360}, 80%, 60%)`,
          `hsl(${(b * 53) % 360}, 80%, 60%)`,
        ],
      };

    case 'handwritten':
      return {
        ...base,
        displayText: `${a} \u00d7 ${b} = ?`,
        fontClass: 'font-handwritten text-4xl',
      };

    default:
      return {
        ...base,
        displayText: `${a} \u00d7 ${b} = ?`,
      };
  }
}

export function generateDistractors(
  a: number,
  b: number,
  count: 1 | 2 | 3
): number[] {
  const answer = a * b;
  const candidates = new Set<number>();

  // Same table results (a * other)
  for (let i = 1; i <= 10; i++) {
    if (i !== b) candidates.add(a * i);
  }

  // Neighbor table results ((a-1) * b, (a+1) * b)
  if (a > 1) candidates.add((a - 1) * b);
  candidates.add((a + 1) * b);

  // +/-1, +/-2 from answer
  candidates.add(answer + 1);
  candidates.add(answer - 1);
  candidates.add(answer + 2);
  candidates.add(answer - 2);

  // a+b trap (common mistake: adding instead of multiplying)
  candidates.add(a + b);

  // +/-10 from answer
  candidates.add(answer + 10);
  if (answer - 10 > 0) candidates.add(answer - 10);

  // Remove the correct answer and any negatives/zeros
  candidates.delete(answer);
  const validCandidates = Array.from(candidates).filter((c) => c > 0);

  // Shuffle and pick
  const shuffled = validCandidates.sort(() => Math.random() - 0.5);
  const distractors: number[] = [];

  for (const candidate of shuffled) {
    if (distractors.length >= count) break;
    distractors.push(candidate);
  }

  // If we don't have enough, generate more with random offsets
  let offset = 3;
  while (distractors.length < count) {
    const candidate = answer + offset;
    if (candidate > 0 && candidate !== answer && !distractors.includes(candidate)) {
      distractors.push(candidate);
    }
    offset = offset > 0 ? -offset : -offset + 1;
  }

  return distractors;
}

function buildChoices(a: number, b: number, inputMode: InputMode): number[] | undefined {
  const answer = a * b;

  switch (inputMode) {
    case 'qcm4': {
      const distractors = generateDistractors(a, b, 3);
      const choices = [answer, ...distractors];
      return choices.sort(() => Math.random() - 0.5);
    }
    case 'qcm3': {
      const distractors = generateDistractors(a, b, 2);
      const choices = [answer, ...distractors];
      return choices.sort(() => Math.random() - 0.5);
    }
    case 'qcm2': {
      const distractors = generateDistractors(a, b, 1);
      const choices = [answer, ...distractors];
      return choices.sort(() => Math.random() - 0.5);
    }
    case 'keypad':
      return undefined;
  }
}

export function generateQuestion(
  fact: QuestionState,
  lastStyle: QuestionStyle | null
): QuestionDisplay {
  const availableStyles = getAvailableStyles(fact.inputMode);
  const style = pickRandomStyle(availableStyles, lastStyle);

  const choices = buildChoices(fact.a, fact.b, fact.inputMode);

  // For reverse and fill_blank, the answer to enter is different
  let displayAnswer = fact.answer;
  if (style === 'reverse') {
    displayAnswer = fact.a; // user must find `a` given `? x b = answer`
  } else if (style === 'fill_blank') {
    displayAnswer = fact.b; // user must find `b` given `a x ___ = answer`
  }

  const display = buildQuestionDisplay(
    fact.a,
    fact.b,
    displayAnswer,
    style,
    fact.inputMode,
    choices
  );

  return display;
}
