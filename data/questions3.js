/* 2025 하반기 이후 면접 후기 반영 (2026-10-28 조사).
 * 2025 하반기 공채 사무 정규직의 질문 원문은 공개 웹에서 찾지 못했다(잡플래닛 403, 캐치 로그인 필요).
 * 그래서 2026 상반기 공채 사무 1건 + 기술직 공채 2건(공통·인성 질문만) + 계약직 1건을 더한다.
 * 이미 있던 2025 하반기 인턴(lk25i1·lk25i2)·계약직(sr25·ct26) 후기는 questions.js에 있다. */
(function () {
  window.SOURCES.push(
    { k: 'wp26', yr: '2026 상반기', type: '공채', track: '사무', site: '위포트', title: '사무직 최종합격 후기 (전국권)', url: 'https://community.weport.co.kr/passFinal/135792760', note: '면접 형식은 적지 않음. 자기소개 변형(30초·해 온 일), 자소서·이력서 위주, 면접 이틀 전 본 한전 기사로 비전 답해 좋은 반응, 판매 기출은 도움 적음, 스터디 도움' },
    { k: 'jb26', yr: '2026 상반기(추정)', type: '공채', track: '기술', site: '취업파트너 제이버', title: '합격후기 (송변전, 공통·인성 질문만 채택)', url: 'https://with-jayber.com/%ED%95%9C%EA%B5%AD%EC%A0%84%EB%A0%A5%EA%B3%B5%EC%82%AC-%ED%95%A9%EA%B2%A9%ED%9B%84%EA%B8%B02026-%EC%8A%A4%ED%8E%99/', note: '직무 4:4·1인 10분·자기소개 없음·공통 2 + 전공 4~5 / 경험 4:1 약 10분·1분 자기소개. 압박 없음. 기술직이라 직무면접 문항은 빼고 경험면접 문항만 씀' },
    { k: 'dc26', yr: '2026 상반기', type: '공채', track: '기술', site: '디시 공기업갤', title: '면접 후기 (ICT, 인성 질문만 채택)', url: 'https://gall.dcinside.com/mgallery/board/view/?id=rhdrldjq&no=1322786', note: '직무·경험 모두 1분 자기소개 후 시작, 면접관 4명. 직무면접은 이론·용어 설명 위주' },
    { k: 'bl26', yr: '2026 상반기(추정)', type: '계약직', track: '사무', site: '블라인드', title: '계약직 면접 후기', url: 'https://www.teamblind.com/kr/post/%ED%95%9C%EA%B5%AD%EC%A0%84%EB%A0%A5%EA%B3%B5%EC%82%AC-%EB%8C%80%EC%84%B8%EC%B6%A9-%EA%B3%84%EC%95%BD%EC%A7%81-%EB%A9%B4%EC%A0%91-%ED%9B%84%EA%B8%B0-ythacolb', note: '작성일 02.24(연도 표시 없음). 직무 확인 못 함' }
  );
  /* 2025 하반기 이후 면접으로 확인된 출처 */
  window.RECENT_SRC = ['lk25i1', 'lk25i2', 'sr25', 'ct26', 'wp26', 'jb26', 'dc26', 'bl26'];

  const byId = Object.fromEntries(window.QUESTIONS.map(q => [q.id, q]));
  const add = (id, src, texts) => { const q = byId[id]; if (!q) { console.warn('no cluster', id); return; } q.v = q.v || []; texts.forEach(t => q.v.push([src, t])); };

  add('self', 'wp26', ['“30초만 해 봐라”, “자기소개 말고 그동안 해 온 일을 말해 봐라” 같은 변형']);
  add('self', 'dc26', ['(직무·경험 면접 모두) 1분 자기소개 후 시작']);
  add('whyhow', 'wp26', ['자소서·이력서 위주 질문, “그거 말고 또 다른 거 없나요?”']);
  add('whyhow', 'dc26', ['자소서 기반 경험 또는 경력 관련 실무']);
  add('issue', 'wp26', ['(질문 원문 미기재) 회사의 비전·미래 관련 질문 → 면접 이틀 전 본 한전 기사로 답해 좋은 반응']);
  add('hardship', 'jb26', ['가장 힘들었던 경험']);
  add('hardship', 'dc26', ['위기 극복']);
  add('conflict', 'dc26', ['팀원과 갈등이 생겼을 때 어떻게 해결했는지']);
  add('strength', 'dc26', ['성격 장단점']);
  add('unjust', 'dc26', ['부당한 상사 명령']);
  add('dept', 'bl26', ['상사·내부 직원과 갈등이 있을 때 어떻게 할 것인지']);

  window.QUESTIONS.push(
    { id: 'harass', cat: '조직 상황 대처', q: '직장 내 괴롭힘·따돌림을 당한다면 · 상사가 괴롭힌다면',
      v: [['jb26', '직장 상사가 괴롭힌다면 어떻게 할 것인가?'], ['jb26', '(꼬리) 직장 상사와 거리를 두는 것이 낫지 않나?'], ['bl26', '왕따 당해 본 경험이 있는지 · 조직 내에서 그런 일을 당하면 어떻게 할 것인지']],
      tip: '참거나 피하기만 하는 답, 감정적으로 맞서는 답 모두 감점. “사실 기록 → 정중한 1차 대화 → 개선 없으면 상급자·고충·신고 채널” 순서로, 업무는 끝까지 책임진다는 말을 붙인다. 2025 하반기 이후 상사 관련 상황 질문이 후기 5건에서 나온 1순위 유형.' },
    { id: 'persuade', cat: '성향·가치관', q: '설득하기 위해 가장 중요한 것',
      v: [['dc26', '설득하기 위해 가장 중요한 것']],
      tip: '한 단어로 답한 뒤(예: 상대의 걱정을 먼저 듣는 것) 내 설득 경험 하나와 한전 업무(요금·송전망 수용성·창구 민원)로 연결.' }
  );
})();
