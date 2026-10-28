(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const UPDATED = '2026-10-28';
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  const S = new Map(SOURCES.map(s => [s.k, s]));
  const CAT = new Map(CATS.map(c => [c.k, c]));
  const ME = window.ME, MEMO = window.MEMO, A = window.ANSWERS || {};
  const EXP = new Map((ME.exps || []).map(e => [e.k, e]));

  /* ───── 질문 목록 ───── */
  const Q = QUESTIONS.map(q => {
    const srcs = [...new Set((q.v || []).map(v => v[0]))];
    const iv = q.pred ? '예상' : CAT.get(q.cat).iv;
    return Object.assign({}, q, { srcs, n: srcs.length, iv, group: q.pred ? '시사·경북' : (iv === '직무' ? '직무' : '경험·공통') });
  });
  Object.entries(window.ESSAY_FOLLOWUPS || {}).forEach(([no, list]) => list.forEach((t, i) => Q.push({ id: `ef${no}_${i}`, cat: '자소서 꼬리', q: `[자소서 ${no}번] ${t}`, v: [], srcs: [], n: 0, iv: '경험', group: '자소서', essay: true })));
  const grade = q => q.essay ? '자소서' : q.pred ? '예상' : q.n >= 5 ? 'S' : q.n >= 3 ? 'A' : q.n === 2 ? 'B' : 'C';
  const gcls = g => ({ S: 'tS', A: 'tA', B: 'tB', C: 'tC' }[g] || 'tP');
  const ORDER = { '경험·공통': 0, '직무': 1, '시사·경북': 2, '자소서': 3 };

  /* ───── 헤더 ───── */
  $('#lead').textContent = `질문 ${Q.length}개(기출 ${Q.filter(q => !q.pred && !q.essay).length} · 예상 ${Q.filter(q => q.pred).length} · 자소서 꼬리 ${Q.filter(q => q.essay).length})마다 설명·한전 연결·내 경험 3줄을 달았다. 이슈는 한 곳에 ${MEMO.basics.length + MEMO.doing.length + MEMO.news.length}줄로 줄였고, 숫자 카드 ${MEMO.cards.length}장으로 외운다.`;
  const TL = [
    { d: '2026-10-27', t: '필기 합격 발표', s: '발표일 포함 3일 안에 자소서·증빙 제출' },
    { d: '2026-10-29', t: '자소서·증빙 제출 마감', s: '3문항 × 700자. 제출 전 따로 저장' },
    { d: '2026-11-09', e: '2026-11-27', t: '면접 (직무 + 경험)', s: '하루 통합' },
    { d: '2026-12-03', t: '최종 합격 발표', s: '' },
    { d: '2027-01-18', t: '사무 입사', s: '수습 3개월' },
  ];
  const P = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const dday = s => Math.round((P(s) - TODAY) / 864e5);
  const fmt = s => { const d = P(s); return `${d.getMonth() + 1}/${d.getDate()}`; };
  $('#timeline').innerHTML = TL.map(x => { const end = x.e ? P(x.e) : P(x.d); const dd = dday(x.d); const cls = end < TODAY ? 'past' : (P(x.d) <= TODAY ? 'now' : ''); const lab = end < TODAY ? '지남' : P(x.d) <= TODAY ? '진행 중' : `D-${dd}`; return `<li class="${cls}"><div class="dt">${fmt(x.d)}${x.e ? ' ~ ' + fmt(x.e) : ''}</div><div class="tt">${x.t}</div>${x.s ? `<div class="ss">${x.s}</div>` : ''}<span class="dd">${lab}</span></li>`; }).join('');
  (function alert() { const el = $('#alert'); const sub = dday('2026-10-29'), iv = dday('2026-11-09'), ivEnd = dday('2026-11-27'); if (sub >= 0) el.innerHTML = `<b>자소서·증빙 제출 D-${sub}</b> · 자소서 3문항이 경험면접 질문지다. 제출 전에 복사해 두고, 쓴 경험은 아래 “내 경험” 카드와 같아야 한다.`; else if (iv > 0) { el.className = 'alert calm'; el.innerHTML = `<b>면접 시작 D-${iv}</b> · 질문·답변 모음의 S·A 질문부터 소리 내어 연습. 숫자 카드는 매일 한 바퀴.`; } else if (ivEnd >= 0) { el.className = 'alert calm'; el.innerHTML = `<b>면접 기간</b> · 수험표·신분증. 이름·학교는 말하지 않는다.`; } else { el.className = 'alert calm'; el.textContent = '면접 기간이 끝났다. 최종 발표 12월 3일.'; } })();

  /* ───── 내 경험 ───── */
  $('#intro30').textContent = ME.intro30; $('#intro60').textContent = ME.intro60; $('#spec').textContent = ME.spec.join(' · ');
  $('#exps').innerHTML = ME.exps.map(e => `<article class="exp" id="exp-${e.k}"><div class="ehead"><h3>${esc(e.t)}</h3><span>${esc(e.r)} · ${esc(e.when)}</span></div><div class="enum">${esc(e.n)}</div><p>${esc(e.s)}</p><p class="elearn"><b>배운 점</b>${esc(e.l)}</p><div class="etags">${e.tags.map(t => `<i>${esc(t)}</i>`).join('')}</div></article>`).join('');
  const expLink = txt => esc(txt).replace(/\b([a-z_]+)\b/g, (m, k) => EXP.has(k) ? `<a class="elink" href="#exp-${k}">${esc(EXP.get(k).t)}</a>` : m);
  const meText = txt => String(txt == null ? '' : txt).replace(/ME\.(intro30|intro60|gbMotive30|gbMotive60)/g, (m, k) => ME[k]);

  /* ───── 이슈 암기 ───── */
  const memoRow = x => `<div class="mrow"><div class="mt"><b>${esc(x.t)}</b><span class="mn">${esc(x.n)}</span></div><div class="mf">${esc(x.f)}</div><div class="ma"><b>답변</b>${esc(x.a)}</div>${x.e && EXP.has(x.e) ? `<div class="mex"><b>내 경험</b><a class="elink" href="#exp-${x.e}">${esc(EXP.get(x.e).t)}</a> · ${esc(EXP.get(x.e).n)}</div>` : ''}</div>`;
  $('#memoBasics').innerHTML = MEMO.basics.map(memoRow).join('');
  $('#memoDoing').innerHTML = MEMO.doing.map(memoRow).join('');
  $('#memoNews').innerHTML = MEMO.news.map(memoRow).join('');

  (function cards() {
    const ALL = MEMO.cards.map(([q, a], i) => ({ id: 'c' + i, q, a }));
    let known = new Set(); try { known = new Set(JSON.parse(localStorage.getItem('kepco.cards2') || '[]')); } catch (e) { }
    const save = () => { try { localStorage.setItem('kepco.cards2', JSON.stringify([...known])); } catch (e) { } };
    let deck = [], pos = -1, flipped = false;
    const pool = () => ALL.filter(c => !$('#fcSkip').checked || !known.has(c.id));
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const prog = () => { $('#fcProg').textContent = `${pos >= 0 && deck.length ? pos + 1 : 0}/${deck.length} · 외운 카드 ${known.size}/${ALL.length}`; };
    const show = () => { const c = deck[pos]; flipped = false; $('#fcCard').classList.remove('flip'); if (!c) { $('#fcLbl').textContent = '끝'; $('#fcText').textContent = deck.length ? '마지막 카드. 섞기로 다시' : '남은 카드가 없다. 건너뛰기를 끄거나 기록을 지우세요.'; prog(); return; } $('#fcLbl').textContent = '질문'; $('#fcText').textContent = c.q; prog(); };
    const rebuild = () => { deck = shuffle(pool()); pos = deck.length ? 0 : -1; show(); };
    $('#fcCard').addEventListener('click', () => { const c = deck[pos]; if (!c) return; flipped = !flipped; $('#fcCard').classList.toggle('flip', flipped); $('#fcLbl').textContent = flipped ? '답' : '질문'; $('#fcText').textContent = flipped ? c.a : c.q; });
    $('#fcNext').addEventListener('click', () => { if (pos < 0) { rebuild(); return; } pos = Math.min(pos + 1, deck.length); show(); });
    $('#fcShuffle').addEventListener('click', rebuild);
    $('#fcKnow').addEventListener('click', () => { const c = deck[pos]; if (!c) return; known.add(c.id); save(); if ($('#fcSkip').checked) { deck.splice(pos, 1); if (pos >= deck.length) pos = deck.length; } else pos = Math.min(pos + 1, deck.length); show(); });
    $('#fcReset').addEventListener('click', () => { known = new Set(); save(); rebuild(); });
    $('#fcSkip').addEventListener('change', rebuild);
    prog();
  })();

  /* ───── 질문 카드 ───── */
  const srcBadge = k => { const s = S.get(k); if (!s) return ''; const cls = s.type === '공채' ? 'g' : s.type === '인턴' ? 'i' : 'c'; return `<a class="src ${cls}" href="${s.url}" target="_blank" rel="noopener">${esc(s.yr)} ${esc(s.type)}</a>`; };
  function card(q, prefix) {
    const g = grade(q); const a = A[q.id] || {};
    const meta = q.essay ? '자소서 기반' : q.pred ? '기출 없음 · 예상' : `${q.iv} · 후기 ${q.n}곳`;
    const body = a.s ? `<div class="a3"><div><b>설명 · 핵심</b><p>${esc(meText(a.s))}</p></div><div><b>한전 연결</b><p>${esc(meText(a.k))}</p></div><div><b>내 경험</b><p>${expLink(a.e)}</p></div></div>` : `<p class="empty">답변 방향 없음</p>`;
    const raw = (q.v && q.v.length) ? `<details class="raw"><summary>실제 질문 문장 ${q.v.length}개 · 참고</summary><ul class="vlist">${q.v.map(([k, t]) => `<li>${srcBadge(k)}<span>${esc(t)}</span></li>`).join('')}</ul>${q.def ? `<div class="defbox"><b>정의 (30초)</b>${esc(q.def)}</div>` : ''}${q.tip ? `<div class="tipbox">${esc(q.tip)}</div>` : ''}</details>` : (q.tip ? `<details class="raw"><summary>참고</summary><div class="tipbox">${esc(q.tip)}</div></details>` : '');
    return `<details class="qa" id="${prefix || 'q'}-${q.id}"><summary><i class="t ${gcls(g)}">${g}</i><span class="qt">${esc(q.q)}</span><span class="qm">${meta} · ${esc(q.cat)}</span></summary><div class="qa-body">${body}${raw}</div></details>`;
  }
  const state = { group: '전체', q: '' };
  const GROUPS = ['전체', '경험·공통', '직무', '시사·경북', '자소서'];
  $('#qaChips').innerHTML = GROUPS.map(g => `<button class="chip${g === '전체' ? ' on' : ''}" data-g="${g}">${g} ${g === '전체' ? Q.length : Q.filter(q => q.group === g).length}</button>`).join('');
  function renderQa() {
    const kw = state.q.trim().toLowerCase();
    const list = Q.filter(q => state.group === '전체' || q.group === state.group)
      .filter(q => !kw || [q.q, q.cat, ...(q.v || []).map(v => v[1]), (A[q.id] || {}).s, (A[q.id] || {}).k, (A[q.id] || {}).e].join(' ').toLowerCase().includes(kw))
      .sort((a, b) => ORDER[a.group] - ORDER[b.group] || b.n - a.n || a.q.localeCompare(b.q));
    $('#qaList').innerHTML = list.map(q => card(q)).join('') || '<p class="empty">결과 없음</p>';
    $('#qaCount').textContent = `${list.length}개`;
  }
  renderQa();
  $('#qaChips').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b) return; state.group = b.dataset.g; $$('#qaChips .chip').forEach(c => c.classList.toggle('on', c === b)); renderQa(); });
  let t; $('#qaq').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; renderQa(); }, 120); });

  /* ───── 경북 ───── */
  $('#gb30').textContent = ME.gbMotive30; $('#gb60').textContent = ME.gbMotive60;
  $('#gbQa').innerHTML = ['p_stay', 'relocate', 'p_local', 'p_elder', 'merge'].map(id => Q.find(q => q.id === id)).filter(Boolean).map(q => card(q, 'gbq')).join('');

  /* ───── 연습 ───── */
  (function practice() {
    let cur = null, timer = null, left = 60, total = 60;
    const pools = { sa: () => Q.filter(q => !q.pred && !q.essay && q.n >= 3), e: () => Q.filter(q => q.group === '경험·공통' || q.essay), j: () => Q.filter(q => q.group === '직무'), p: () => Q.filter(q => q.pred), all: () => Q };
    const reset = () => { total = left = +$('#sec').value; $('#ptime').textContent = left; $('#pbar').style.width = '100%'; $('#pbar').classList.remove('warn'); };
    const stop = () => { clearInterval(timer); timer = null; $('#pstart').textContent = '타이머 시작'; };
    const pick = () => { const pool = pools[$('#pool').value](); if (!pool.length) return; let q; do { q = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && cur && q.id === cur.id); cur = q; $('#pq').textContent = q.q; $('#pmeta').innerHTML = `<span>${esc(q.cat)}</span>${q.pred ? '<span>예상</span>' : q.essay ? '<span>자소서</span>' : `<span>후기 ${q.n}곳</span>`}`; $('#ptipbox').hidden = true; stop(); reset(); };
    $('#pnext').addEventListener('click', pick);
    $('#pstart').addEventListener('click', () => { if (!cur) pick(); if (timer) { stop(); return; } $('#pstart').textContent = '멈춤'; timer = setInterval(() => { left--; $('#ptime').textContent = Math.max(0, left); $('#pbar').style.width = (left / total * 100) + '%'; if (left <= 10) $('#pbar').classList.add('warn'); if (left <= 0) { stop(); $('#ptime').textContent = '끝'; } }, 1000); });
    $('#sec').addEventListener('change', () => { stop(); reset(); });
    $('#ptip').addEventListener('click', () => { if (!cur) return; const b = $('#ptipbox'); b.hidden = !b.hidden; if (b.hidden) return; const a = A[cur.id] || {}; b.innerHTML = a.s ? `<div class="a3"><div><b>설명</b><p>${esc(meText(a.s))}</p></div><div><b>한전 연결</b><p>${esc(meText(a.k))}</p></div><div><b>내 경험</b><p>${expLink(a.e)}</p></div></div><a href="#q-${cur.id}">카드로 가기 →</a>` : '답변 방향 없음'; });
    reset();
  })();

  /* ───── 출처 ───── */
  (function sources() {
    const cnt = {}; Q.forEach(q => q.srcs.forEach(k => cnt[k] = (cnt[k] || 0) + 1));
    const order = { '공채': 0, '모음': 1, '인턴': 2, '계약직': 3 };
    const rows = [...SOURCES].sort((a, b) => order[a.type] - order[b.type] || (parseInt(b.yr) || 0) - (parseInt(a.yr) || 0));
    $('#srctable').innerHTML = `<thead><tr><th>시기</th><th>전형</th><th>출처</th><th class="n">유형</th></tr></thead><tbody>${rows.map(s => `<tr><td>${esc(s.yr)}</td><td>${esc(s.type)}</td><td><a href="${s.url}" target="_blank" rel="noopener">${esc(s.site)} · ${esc(s.title)}</a></td><td class="n">${cnt[s.k] || 0}</td></tr>`).join('')}</tbody>`;
    $('#refs').innerHTML = (window.REFS || []).map(r => `<li><a href="${r.url}" target="_blank" rel="noopener">${esc(r.t)}</a></li>`).join('');
  })();

  $('#upd').textContent = `자료 기준일 ${UPDATED}.`;
})();
