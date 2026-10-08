/* 쿠팡 파트너스 상자 — 페이지 주제와 바로 이어지는 물건만, 검색 결과로 보내는 간편 링크.
 * 링크는 파트너스 '간편 링크 만들기'에서 https://www.coupang.com/np/search?component=&q=<검색어>&channel=user 꼴로 만든다.
 * 2026-10-08 생성(채널 기본값). sajucheop.com 은 파트너스 '내 정보'에 사이트로 등록함.
 * 같은 날 사진을 넣으며 '상품 링크'로 상품 하나씩 골라 바꿈(img 는 쿠팡 썸네일). 품절·단종되면 사진이 깨지니 석 달에 한 번 확인. href 가 빈 칸이면 상자를 내지 않는다.
 * 상자에는 공정위 지침에 따른 대가성 문구(DISCLOSURE)를 반드시 같이 보인다. */

export const DISCLOSURE = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';

const L = {
  diary: { href: 'https://link.coupang.com/a/hGd3erKlLU', img: 'https://thumbnail2.coupangcdn.com/thumbnails/remote/212x212ex/image/retail/images/835946383818492-f83abfb0-f0d5-4756-9f19-0c1fde3f9976.png', label: '아이코닉 2027 위클리 다이어리', note: '새해 계획과 좋은 달을 적어 둘 때' },
  calendar: { href: 'https://link.coupang.com/a/hGd4idJ5RA', img: 'https://thumbnail4.coupangcdn.com/thumbnails/remote/212x212ex/image/vendor_inventory/6a57/f1cac283cdc5d45b1e55cb8b3edad6897b6cc4c203d3c3b86557720649c4.jpg', label: '인디고 2027 음력·절기 탁상달력', note: '길일·손없는날을 표시해 둘 때' },
  box: { href: 'https://link.coupang.com/a/hGd44cDwGW', img: 'https://thumbnail9.coupangcdn.com/thumbnails/remote/212x212ex/image/retail/images/3804150279642044-4b47f37f-e2bc-47a3-9534-1dee5e76fb55.jpg', label: '코멧 두꺼운 이사박스 5개입', note: '이삿날을 잡았다면 짐 싸기 전에' },
  aircap: { href: 'https://link.coupang.com/a/hGd5Ztey6K', img: 'https://thumbnail2.coupangcdn.com/thumbnails/remote/212x212ex/image/retail/images/7030551841613962-3bc0b742-c543-4c48-9a04-9419126e4b7a.jpg', label: '코멧 뽁뽁이 에어캡 50m', note: '그릇·액자를 쌀 때' },
};

const KIND = {
  2027: ['diary', 'calendar'],
  son: ['box', 'aircap'],
};
const HEAD = { 2027: '2027년 준비물', son: '이사 준비물' };

export function coupangBox(kind) {
  const items = (KIND[kind] || []).map((k) => L[k]).filter((x) => x.href);
  if (!items.length) return '';
  return `<aside class="cp-box"><p class="cp-h">${HEAD[kind] || '함께 쓰면 좋은 물건'}</p><div class="cp-list">${items.map((x) => `<a class="cp-item" href="${x.href}" target="_blank" rel="sponsored noopener">${x.img ? `<img class="cp-img" src="${x.img}" alt="" width="80" height="80" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ''}<span class="cp-t"><b>${x.label}</b><small>${x.note}</small></span><span class="cp-go">쿠팡에서 보기</span></a>`).join('')}</div><p class="cp-note">${DISCLOSURE}</p></aside>\n    `;
}
