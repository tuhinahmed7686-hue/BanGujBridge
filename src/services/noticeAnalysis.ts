
import { detectNoticeScript } from './noticeLanguage';

export type FactKind = 'date' | 'time' | 'number' | 'location' | 'severity' | 'negation' | 'instruction';

export interface NoticeFact {
  kind: FactKind;
  value: string;
  evidence: string;
}

export interface NoticeAnalysis {
  script: string;
  facts: NoticeFact[];
  wordCount: number;
}

export interface NoticeDifference {
  kind: FactKind;
  left: string;
  right: string;
  leftEvidence: string;
  rightEvidence: string;
  message: string;
}

const PATTERNS: { kind: FactKind; regex: RegExp }[] = [
  {
    kind: 'date',
    regex: /\b(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b/g,
  },
  {
    kind: 'time',
    regex: /\b(?:[01]?\d|2[0-3])[:.][0-5]\d(?:\s?(?:am|pm))?\b/gi,
  },
  {
    kind: 'number',
    regex: /(?<![\p{L}\p{N}])\d+(?:[.,]\d+)?(?:\s?(?:km|m|mm|cm|%|people|persons|hours?|minutes?))?(?![\p{L}\p{N}])/giu,
  },
    {
    kind: 'location',
    regex: /\b(?:in|near|at|from|to|around|within)\s+[A-Z][\p{L}'-]*(?:\s+[A-Z][\p{L}'-]*){0,2}/gu,
  },
];

const SEVERITY_TERMS = [
  'warning', 'watch', 'alert', 'emergency', 'severe', 'extreme', 'critical',
  'evacuate', 'evacuation', 'danger', 'safe', 'caution',
  'সতর্কতা', 'সতর্ক', 'জরুরি', 'বিপদ', 'বিপজ্জনক', 'নিরাপদ', 'উচ্ছেদ',
  'ચેતવણી', 'સાવચેત', 'તાકીદ', 'કટોકટી', 'જોખમ', 'ખતરનાક', 'સુરક્ષિત', 'ખાલી કરો',
];

const NEGATION_TERMS = [
  'not', 'no', 'never', '不要', 'do not', "don't", 'must not', 'cannot',
  'নয়', 'না', 'নিষেধ', 'করবেন না', 'যাবেন না',
  'નહીં', 'ના', 'ન કરશો', 'જશો નહીં',
];

const INSTRUCTION_TERMS = [
  'evacuate', 'move to', 'stay indoors', 'shelter', 'avoid', 'call',
  'evacuation', 'do not enter', 'remain calm',
  'সরে যান', 'আশ্রয় নিন', 'ঘরে থাকুন', 'এড়িয়ে চলুন', 'প্রবেশ করবেন না',
  'ખસી જાઓ', 'આશ્રય લો', 'ઘરમાં રહો', 'ટાળો', 'પ્રવેશ કરશો નહીં',
];

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function collectMatches(text: string, regex: RegExp): string[] {
  return unique(Array.from(text.matchAll(regex), (match) => match[0]));
}

function collectTerms(text: string, terms: string[]): string[] {
  const lower = text.toLocaleLowerCase();
  return unique(terms.filter((term) => lower.includes(term.toLocaleLowerCase())));
}

function evidenceFor(text: string, value: string): string {
  const index = text.toLocaleLowerCase().indexOf(value.toLocaleLowerCase());
  if (index < 0) return value;
  const start = Math.max(0, index - 65);
  const end = Math.min(text.length, index + value.length + 65);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

export function analyzeNotice(text: string): NoticeAnalysis {
  const facts: NoticeFact[] = [];

  for (const { kind, regex } of PATTERNS) {
    for (const value of collectMatches(text, regex)) {
      facts.push({ kind, value, evidence: evidenceFor(text, value) });
    }
  }

  for (const kind of ['severity', 'negation', 'instruction'] as const) {
    const terms =
      kind === 'severity' ? SEVERITY_TERMS :
      kind === 'negation' ? NEGATION_TERMS :
      INSTRUCTION_TERMS;

    for (const value of collectTerms(text, terms)) {
      facts.push({ kind, value, evidence: evidenceFor(text, value) });
    }
  }

  return {
    script: detectNoticeScript(text),
    facts,
    wordCount: text.trim() ? text.trim().split(/\s+/u).length : 0,
  };
}

const KIND_LABEL: Record<FactKind, string> = {
  date: 'Date',
  time: 'Time',
  number: 'Number / quantity',
  location: 'Location',
  severity: 'Severity / hazard term',
  negation: 'Negation / prohibition',
  instruction: 'Instruction',
};

export function compareNotices(leftText: string, rightText: string): NoticeDifference[] {
  const left = analyzeNotice(leftText);
  const right = analyzeNotice(rightText);
  const differences: NoticeDifference[] = [];
  const kinds: FactKind[] = [
  'date', 'time', 'number', 'location',
  'severity', 'negation', 'instruction'
];

  for (const kind of kinds) {
    const leftFacts = left.facts.filter((fact) => fact.kind === kind);
    const rightFacts = right.facts.filter((fact) => fact.kind === kind);

    const leftValues = unique(leftFacts.map((fact) => fact.value.toLocaleLowerCase()));
    const rightValues = unique(rightFacts.map((fact) => fact.value.toLocaleLowerCase()));

    const missingRight = leftFacts.filter(
      (fact) => !rightValues.includes(fact.value.toLocaleLowerCase()),
    );
    const missingLeft = rightFacts.filter(
      (fact) => !leftValues.includes(fact.value.toLocaleLowerCase()),
    );

    if (missingRight.length || missingLeft.length) {
      differences.push({
        kind,
        left: missingRight.map((fact) => fact.value).join(', ') || '—',
        right: missingLeft.map((fact) => fact.value).join(', ') || '—',
        leftEvidence: missingRight.map((fact) => fact.evidence).join(' | ') || 'No unmatched evidence',
        rightEvidence: missingLeft.map((fact) => fact.evidence).join(' | ') || 'No unmatched evidence',
        message: `${KIND_LABEL[kind]} differs or appears in only one notice.`,
      });
    }
  }
  const leftLower = leftText.toLocaleLowerCase();
  const rightLower = rightText.toLocaleLowerCase();

  const conflicts = [
    {
      a: ['evacuate', 'leave the area', 'move out'],
      b: ['stay indoors', 'remain inside', 'shelter in place'],
    },
    {
      a: ['stay indoors', 'remain inside'],
      b: ['evacuate', 'leave the area', 'move out'],
    },
  ];

  for (const conflict of conflicts) {
    const leftMatch = conflict.a.find(term => leftLower.includes(term));
    const rightMatch = conflict.b.find(term => rightLower.includes(term));

    if (leftMatch && rightMatch) {
      differences.push({
        kind: 'instruction',
        left: leftMatch,
        right: rightMatch,
        leftEvidence: evidenceFor(leftText, leftMatch),
        rightEvidence: evidenceFor(rightText, rightMatch),
        message: 'Potentially conflicting emergency instructions. Human review required.',
      });
    }
  }
  return differences;
}
