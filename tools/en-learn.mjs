/* English library articles — one list for the article pages (build-en-learn.mjs),
 * the /en/guide/ hub (build-en-guide.mjs) and the "Learn" box on /en/. */
import { ARTICLES as A } from './en-learn-a.mjs';
import { ARTICLES as B } from './en-learn-b.mjs';
import { ARTICLES as C } from './en-learn-c.mjs';
import { ARTICLES as D } from './en-learn-d.mjs';

export const CATS = [
  { key: 'basics', label: 'Start here: saju basics', short: 'Saju basics',
    note: 'What saju is, how it differs from Chinese BaZi, how to read the eight characters, and why the saju year starts in February.' },
  { key: 'chart', label: 'Reading your chart', short: 'Reading a chart',
    note: 'The tools a reader actually uses: the Ten Gods, hidden stems, ten-year luck pillars, Day Master strength and the useful god.' },
  { key: 'culture', label: 'Saju in Korean life', short: 'Korean life',
    note: 'Where saju shows up in Korea today, from couples checking their gunghap to saju cafés in Seoul, and how it sits beside MBTI.' },
];

export const ARTICLES = [...A, ...B, ...C, ...D];
