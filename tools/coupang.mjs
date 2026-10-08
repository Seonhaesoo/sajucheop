/* 쿠팡 파트너스 상자 — 페이지 주제와 바로 이어지는 물건만, 검색 결과로 보내는 간편 링크.
 * 링크는 파트너스 '간편 링크 만들기'에서 https://www.coupang.com/np/search?component=&q=<검색어>&channel=user 꼴로 만든다.
 * sajucheop.com 은 파트너스 '내 정보'에 사이트로 등록해야 한다. href 가 빈 칸이면 상자를 내지 않는다.
 * 상자에는 공정위 지침에 따른 대가성 문구(DISCLOSURE)를 반드시 같이 보인다. */

export const DISCLOSURE = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';

const L = {
  diary: { href: '', label: '2027 다이어리', note: '새해 계획과 좋은 달을 적어 둘 때' },
  calendar: { href: '', label: '2027 탁상달력', note: '길일·손없는날을 표시해 둘 때' },
  box: { href: '', label: '이사박스', note: '이삿날을 잡았다면 짐 싸기 전에' },
  aircap: { href: '', label: '에어캡(뽁뽁이)', note: '그릇·액자를 쌀 때' },
};

const KIND = {
  2027: ['diary', 'calendar'],
  son: ['box', 'aircap'],
};

export function coupangBox(kind) {
  const items = (KIND[kind] || []).map((k) => L[k]).filter((x) => x.href);
  if (!items.length) return '';
  return `<aside class="cp-box"><p class="cp-h">쿠팡에서 함께 보기</p><ul>${items.map((x) => `<li><a href="${x.href}" target="_blank" rel="sponsored noopener">${x.label} 보러 가기</a><small>${x.note}</small></li>`).join('')}</ul><p class="cp-note">${DISCLOSURE}</p></aside>\n    `;
}
