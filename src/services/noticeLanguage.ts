export type NoticeScript = 'bn' | 'gu' | 'en' | 'mixed' | 'unknown';

export function detectNoticeScript(text: string): NoticeScript {
  let bn = false;
  let gu = false;
  let en = false;

  for (const char of text) {
    if (/\p{Script=Bengali}/u.test(char)) bn = true;
    else if (/\p{Script=Gujarati}/u.test(char)) gu = true;
    else if (/\p{Letter}/u.test(char) && /\p{Script=Latin}/u.test(char)) en = true;
  }

  if (bn && gu) return 'mixed';
  if (bn) return 'bn';
  if (gu) return 'gu';
  if (en) return 'en';
  return 'unknown';
}
