(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const UPDATED = '2026-10-30';
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
  const S = new Map(SOURCES.map(s => [s.k, s]));
  const CAT = new Map(CATS.map(c => [c.k, c]));
  const ME = window.ME, MEMO = window.MEMO, A = window.ANSWERS || {};
  const EXP = new Map((ME.exps || []).map(e => [e.k, e]));

  /* ───── 질문 목록 ───── */
  const Q = QUESTIONS.map(q => {
    const srcs = [...new Set((q.v || []).map(v => v[0]))];
    const iv = q.pred ? '예상' : CAT.get(q.cat).iv;
    return Object.assign({}, q, { srcs, n: srcs.length, iv, group: q.grp || (q.pred ? '시사·경북' : (iv === '직무' ? '직무' : '경험·공통')) });
  });
  Object.entries(window.ESSAY_FOLLOWUPS || {}).forEach(([no, list]) => list.forEach((t, i) => Q.push({ id: `ef${no}_${i}`, cat: '자소서 꼬리', q: `[자소서 ${no}번] ${t}`, v: [], srcs: [], n: 0, iv: '경험', group: '자소서', essay: true })));
  const grade = q => q.essay ? '자소서' : q.pred ? '예상' : q.n >= 10 ? 'S' : q.n >= 5 ? 'A' : q.n >= 2 ? 'B' : 'C';
  const gcls = g => ({ S: 'tS', A: 'tA', B: 'tB', C: 'tC' }[g] || 'tP');
  const ORDER = { '경험·공통': 0, '직무': 1, '시사·경북': 2, '자소서': 3 };
  const RECENT = new Set(window.RECENT_SRC || []);
  Q.forEach(q => { q.rec = q.srcs.filter(k => RECENT.has(k)); });
  const srcLabel = k => { const s = S.get(k) || {}; return `${s.yr || ''} ${s.type || ''}${s.track === '기술' ? '(기술직)' : s.track === '불명' ? '(직군 불명)' : ''}`.trim(); };
  const eix = q => q.essay ? +q.id.slice(2, q.id.indexOf('_')) * 100 + +q.id.split('_')[1] : 0;
  const SORT = (a, b) => ORDER[a.group] - ORDER[b.group] || eix(a) - eix(b) || b.n - a.n || a.q.localeCompare(b.q, 'ko');
  [...Q].sort(SORT).forEach((q, i) => { q.no = i + 1; });
  const lines = (n, cls) => `<div class="lines${cls ? ' ' + cls : ''}" aria-hidden="true">${'<i></i>'.repeat(n)}</div>`;

  /* ───── 헤더 ───── */
  const AX = window.AIX || { now: [], ideas: { internal: [], public: [] } };
  $('#lead').textContent = `질문 ${Q.length}개(기출 ${Q.filter(q => !q.pred && !q.essay).length} · 예상 ${Q.filter(q => q.pred).length} · 자소서 꼬리 ${Q.filter(q => q.essay).length})마다 소리 내어 말할 답변, 한전 연결, 내 경험, 꼬리질문 대비를 달았다. 이슈는 한 곳에 ${MEMO.basics.length + MEMO.doing.length + MEMO.news.length}줄, 상식 사전 ${(MEMO.dict || []).length}줄, 한전 영상 정리 ${(MEMO.video || []).length + (MEMO.video2 || []).length}줄, 숫자 카드 ${MEMO.cards.length}장, 한전 AI 현황 ${AX.now.length}줄과 내 AI 아이디어 ${AX.ideas.internal.length + AX.ideas.public.length}개. 8번에서 골라 인쇄하면 손으로 쓸 줄이 붙는다.`;
  const TL = [
    { d: '2026-10-27', t: '필기 합격 발표', s: '발표일 포함 3일 안에 자소서·증빙 제출' },
    { d: '2026-10-29', t: '자소서·증빙 제출 마감', s: '3문항 × 700자 · 원문과 꼬리질문은 2번 섹션' },
    { d: '2026-11-09', e: '2026-11-27', t: '면접 (직무 + 경험)', s: '하루 통합' },
    { d: '2026-12-03', t: '최종 합격 발표', s: '' },
    { d: '2027-01-18', t: '사무 입사', s: '수습 3개월' },
  ];
  const P = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const dday = s => Math.round((P(s) - TODAY) / 864e5);
  const fmt = s => { const d = P(s); return `${d.getMonth() + 1}/${d.getDate()}`; };
  $('#timeline').innerHTML = TL.map(x => { const end = x.e ? P(x.e) : P(x.d); const dd = dday(x.d); const cls = end < TODAY ? 'past' : (P(x.d) <= TODAY ? 'now' : ''); const lab = end < TODAY ? '지남' : P(x.d) <= TODAY ? '진행 중' : `D-${dd}`; return `<li class="${cls}"><div class="dt">${fmt(x.d)}${x.e ? ' ~ ' + fmt(x.e) : ''}</div><div class="tt">${x.t}</div>${x.s ? `<div class="ss">${x.s}</div>` : ''}<span class="dd">${lab}</span></li>`; }).join('');
  (function alert() { const el = $('#alert'); const sub = dday('2026-10-29'), iv = dday('2026-11-09'), ivEnd = dday('2026-11-27'); if (sub >= 0) el.innerHTML = `<b>자소서·증빙 제출 D-${sub}</b> · 자소서 3문항이 경험면접 질문지다. 제출한 원문과 문장별 꼬리질문은 2번 “제출한 자소서”에. 면접에서는 자소서와 같은 단어·같은 숫자로.`; else if (iv > 0) { el.className = 'alert calm'; el.innerHTML = `<b>면접 시작 D-${iv}</b> · 질문·답변 모음의 S·A 질문부터 소리 내어 연습. 숫자 카드는 매일 한 바퀴.`; } else if (ivEnd >= 0) { el.className = 'alert calm'; el.innerHTML = `<b>면접 기간</b> · 수험표·신분증. 이름·학교는 말하지 않는다.`; } else { el.className = 'alert calm'; el.textContent = '면접 기간이 끝났다. 최종 발표 12월 3일.'; } })();

  /* ───── 내 경험 ───── */
  $('#intro30').textContent = ME.intro30; $('#intro60').textContent = ME.intro60; $('#spec').textContent = ME.spec.join(' · ');
  $('#exps').innerHTML = ME.exps.map(e => `<article class="exp" id="exp-${e.k}"><div class="ehead"><h3>${esc(e.t)}</h3><span>${esc(e.r)} · ${esc(e.when)}</span>${e.essay ? `<em class="ebadge">${esc(e.essay)}</em>` : ''}</div><div class="enum">${esc(e.n)}</div><p>${esc(e.s)}</p><p class="elearn"><b>배운 점</b>${esc(e.l)}</p><div class="etags">${e.tags.map(t => `<i>${esc(t)}</i>`).join('')}</div></article>`).join('');
  const expLink = txt => esc(txt).replace(/\b([a-z_]+)\b/g, (m, k) => EXP.has(k) ? `<a class="elink" href="#exp-${k}">${esc(EXP.get(k).t)}</a>` : m);
  const meText = txt => String(txt == null ? '' : txt).replace(/ME\.(intro30|intro60|gbMotive30|gbMotive60)/g, (m, k) => ME[k]);

  /* ───── 제출한 자소서 ───── */
  (function essay() {
    const E = window.ESSAY, el = $('#essayBlock'); if (!E || !el) return;
    const QB = new Map(Q.map(q => [q.id, q]));
    const qid = (no, i) => typeof i === 'string' ? i : `ef${no}_${i}`;
    const qa = (no, i) => { const q = QB.get(qid(no, i)); return q ? `<a class="eqn" href="#q-${q.id}">Q${q.no}</a>` : ''; };
    const para = (no, t, hooks) => { let h = esc(t); hooks.forEach(([p, i]) => { const ep = esc(p), at = h.indexOf(ep); if (at >= 0) h = h.slice(0, at) + `<mark class="eh">${ep}${qa(no, i)}</mark>` + h.slice(at + ep.length); }); return `<p>${h}</p>`; };
    const qlist = x => x.qs.map((t, i) => { const q = QB.get(`ef${x.no}_${i}`); return q ? `<a href="#q-${q.id}"><b>Q${q.no}</b> ${esc(t)}</a>` : ''; }).join('')
      + x.hooks.filter(h => typeof h[1] === 'string').map(h => QB.get(h[1])).filter(Boolean).map(q => `<a class="eqg" href="#q-${q.id}"><b>Q${q.no}</b> ${esc(q.q)} <small>같은 기출</small></a>`).join('');
    el.innerHTML = `<p class="subp">${esc(E.rule)}</p><div class="essay">`
      + E.items.map(x => `<article class="ccard eitem" id="essay-${x.no}"><span class="lbl">자소서 ${x.no}번 · ${esc(x.title)} · ${esc(E.date)}</span><p class="eprompt">${esc(x.prompt)}</p><div class="etext">${x.text.map(t => para(x.no, t, x.hooks)).join('')}</div><p class="eaxis"><b>줄기</b>${esc(x.axis)}</p><p class="eaxis"><b>쓴 경험</b>${expLink(x.exps)}</p><div class="eqs"><b>꼬리질문 ${x.qs.length + x.hooks.filter(h => typeof h[1] === 'string').length}</b><div class="jdq">${qlist(x)}</div></div>${lines(3, 'mlines')}</article>`).join('')
      + `</div><div class="ccard enums"><span class="lbl">숫자 맞추기 · 자소서 표현과 원자료</span><table><thead><tr><th>자소서</th><th>원자료</th><th>면접에서</th></tr></thead><tbody>${E.nums.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
      + `<div class="ccard echecks"><span class="lbl">자소서대로 말할 때 지킬 것</span><ul class="plain">${E.checks.map(([t, u]) => `<li><b>${esc(t)}</b> ${esc(u)}</li>`).join('')}</ul></div>`;
  })();

  /* ───── 이슈 암기 ───── */
  const memoRow = x => `<div class="mrow"><div class="mt"><b>${esc(x.t)}</b><span class="mn">${esc(x.n)}</span></div><div class="mf">${esc(x.f)}</div>${x.a ? `<div class="ma"><b>답변</b>${esc(x.a)}</div>` : ''}${x.e && EXP.has(x.e) ? `<div class="mex"><b>내 경험</b><a class="elink" href="#exp-${x.e}">${esc(EXP.get(x.e).t)}</a> · ${esc(EXP.get(x.e).n)}</div>` : ''}${lines(2, 'mlines')}</div>`;
  $('#memoBasics').innerHTML = MEMO.basics.map(memoRow).join('');
  $('#memoDoing').innerHTML = MEMO.doing.map(memoRow).join('');
  $('#memoNews').innerHTML = MEMO.news.map(memoRow).join('');
  $('#memoDict').innerHTML = (MEMO.dict || []).map(memoRow).join('');
  $('#memoVideo').innerHTML = (MEMO.video || []).map(memoRow).join('');
  $('#memoVideo2').innerHTML = (MEMO.video2 || []).map(memoRow).join('');
  $('#cardList').innerHTML = MEMO.cards.map(([q, a]) => `<li><b>${esc(q)}</b><span>${esc(a)}</span></li>`).join('');

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
  function answerBody(a) {
    if (!a.s) return '<p class="empty">답변 없음</p>';
    return `<div class="ans4"><div class="say"><b>말할 답변</b><p>${esc(meText(a.s))}</p></div><div class="two"><div class="kk"><b>한전 연결</b><p>${esc(meText(a.k))}</p></div><div class="ee"><b>내 경험</b><p>${expLink(a.e)}</p></div></div>${a.f ? `<div class="ff"><b>꼬리질문 대비</b><p>${expLink(meText(a.f))}</p></div>` : ''}</div>`;
  }
  const metaOf = q => (q.essay ? '자소서 기반' : q.pred ? '기출 없음 · 예상' : `${q.iv} · 후기 ${q.n}곳`) + (q.rec && q.rec.length ? ` · 2025 하반기 이후 ${q.rec.length}곳` : '') + (q.star ? ` · ${q.star}` : '');
  function card(q, prefix) {
    const g = grade(q); const a = A[q.id] || {};
    const raw = (q.v && q.v.length) ? `<details class="raw"><summary>실제 질문 문장 ${q.v.length}개 · 정의 · 참고</summary><ul class="vlist">${q.v.map(([k, t]) => `<li>${srcBadge(k)}<span>${esc(t)}</span></li>`).join('')}</ul>${q.def ? `<div class="defbox"><b>정의</b>${esc(q.def)}</div>` : ''}${q.tip ? `<div class="tipbox">${esc(q.tip)}</div>` : ''}</details>` : (q.tip || q.basis ? `<details class="raw"><summary>참고</summary>${q.basis ? `<div class="defbox"><b>예상 근거</b>${esc(q.basis)}</div>` : ''}${q.tip ? `<div class="tipbox">${esc(q.tip)}</div>` : ''}</details>` : '');
    return `<details class="qa" id="${prefix || 'q'}-${q.id}"><summary><i class="t ${gcls(g)}">${g}</i><span class="qt"><em class="qno">Q${q.no}</em>${esc(q.q)}</span><span class="qm">${metaOf(q)} · ${esc(q.cat)}</span></summary><div class="qa-body">${answerBody(a)}${raw}</div></details>`;
  }
  /* 인쇄용: 접히지 않는 블록 */
  function printItem(q) {
    const g = grade(q); const a = A[q.id] || {};
    const vs = (q.v && q.v.length) ? `<ul class="pvlist">${q.v.map(([k, t]) => `<li>${esc((S.get(k) || {}).yr || '')} ${esc((S.get(k) || {}).type || '')} · ${esc(t)}</li>`).join('')}</ul>` : '';
    const def = q.def ? `<div class="pdef"><b>정의</b>${esc(q.def)}</div>` : '';
    const ref = [q.fix && `대책 · ${q.fix}`, q.link && `한전 연결 메모 · ${q.link}`, q.tip && `팁 · ${q.tip}`].filter(Boolean);
    const refs = ref.length ? `<div class="pref">${ref.map(t => `<p>${esc(t)}</p>`).join('')}</div>` : '';
    return `<article class="pitem"><div class="phead"><span class="pno">Q${q.no}</span><i class="t ${gcls(g)}">${g}</i><h4>${esc(q.q)}</h4><span class="pm">${metaOf(q)} · ${esc(q.cat)}</span></div>${vs}${def}${answerBody(a)}${refs}<div class="pwrite"><b>내 답변 메모</b>${lines(10)}</div></article>`;
  }
  const state = { group: '전체', q: '' };
  const GROUPS = ['전체', '2025 하반기 이후', '경험·공통', '직무', '시사·경북', '자소서'];
  const inGroup = (q, g) => g === '전체' || (g === '2025 하반기 이후' ? q.rec.length > 0 : q.group === g);
  $('#qaChips').innerHTML = GROUPS.map(g => `<button class="chip${g === '전체' ? ' on' : ''}" data-g="${g}">${g} ${Q.filter(q => inGroup(q, g)).length}</button>`).join('');
  function renderQa() {
    const kw = state.q.trim().toLowerCase();
    const list = Q.filter(q => inGroup(q, state.group))
      .filter(q => !kw || [q.q, q.cat, ...(q.v || []).map(v => v[1]), (A[q.id] || {}).s, (A[q.id] || {}).k, (A[q.id] || {}).e, (A[q.id] || {}).f, 'q' + q.no].join(' ').toLowerCase().includes(kw))
      .sort(state.group === '2025 하반기 이후' ? ((a, b) => b.rec.length - a.rec.length || a.no - b.no) : SORT);
    $('#qaList').innerHTML = list.map(q => card(q)).join('') || '<p class="empty">결과 없음</p>';
    $('#qaCount').textContent = `${list.length}개`;
  }
  renderQa();
  $('#qaChips').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b) return; state.group = b.dataset.g; $$('#qaChips .chip').forEach(c => c.classList.toggle('on', c === b)); renderQa(); });
  let t; $('#qaq').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value; renderQa(); }, 120); });

  const RECENT_Q = Q.filter(q => q.rec.length).sort((a, b) => b.rec.length - a.rec.length || a.no - b.no);
  $('#recentNote').textContent = `최근 후기에서 나온 질문 ${RECENT_Q.length}개 중 많이 나온 30개. 나머지는 5번 질문 모음의 “2025 하반기 이후” 칩에서 본다.`;
  $('#recentList').innerHTML = RECENT_Q.slice(0, 30).map(q => `<li><a href="#q-${q.id}"><b>Q${q.no}</b> ${esc(q.q)}</a><small>${q.rec.length}곳 · ${[...new Set(q.rec.map(srcLabel))].join(', ')}</small></li>`).join('');

  /* ───── 직무기술서 ───── */
  (function jobdesc() {
    const J = window.JOBDESC, el = $('#jdBlock'); if (!J || !el) return;
    const QB = new Map(Q.map(q => [q.id, q]));
    const ql = ids => ids.map(id => QB.get(id)).filter(Boolean).map(q => `<a href="#q-${q.id}"><b>Q${q.no}</b> ${esc(q.q.replace(/\s*\([^)]*\)/g, '').split(' · ')[0])}</a>`).join('');
    const row = (t, w, u, ids) => `<li><div class="jdt"><b>${esc(t)}</b>${w ? `<span>${esc(w)}</span>` : ''}</div><p>${expLink(u)}</p><p class="jdq">${ql(ids)}</p></li>`;
    const pair = ([t, u]) => `<li><b>${esc(t)}</b><span>${expLink(u)}</span></li>`;
    el.innerHTML = `<p class="subp">${esc(J.where)}</p>`
      + `<div class="ccard"><span class="lbl">직무수행내용 12 · 원문 → 어디서 → 말할 거리 → 관련 질문</span><ol class="jdlist">${J.work.map(r => row(...r)).join('')}</ol></div>`
      + `<div class="ccard"><span class="lbl">필요지식 4분야</span><ul class="jdlist">${J.know.map(([a, t, u, ids]) => row(`(${a}) ${t}`, '', u, ids)).join('')}</ul></div>`
      + `<div class="gbgrid"><div class="ccard"><span class="lbl">필요기술 → 내 증거</span><ul class="plain jdpair">${J.skill.map(pair).join('')}</ul></div>`
      + `<div class="ccard"><span class="lbl">직무수행태도 10 → 내 증거</span><ul class="plain jdpair">${J.attitude.map(pair).join('')}</ul></div></div>`
      + `<div class="ccard"><span class="lbl">직업기초능력 · 필요자격</span><ul class="plain"><li><b>직업기초능력</b> ${esc(J.basic)}</li><li><b>필요자격</b> ${esc(J.qual)}</li></ul></div>`;
  })();

  /* ───── AI 한 곳 ───── */
  (function aix() {
    const X = window.AIX, elN = $('#aixNow'), elI = $('#aixIdeas'); if (!X || !elN || !elI) return;
    const QB = new Map(Q.map(q => [q.id, q]));
    const ql = ids => (ids || []).map(id => QB.get(id)).filter(Boolean).map(q => `<a href="#q-${q.id}"><b>Q${q.no}</b> ${esc(q.q.replace(/\s*\([^)]*\)/g, '').split(' · ')[0])}</a>`).join('');
    const exp = k => k && EXP.has(k) ? `<div class="mex"><b>내 경험</b><a class="elink" href="#exp-${k}">${esc(EXP.get(k).t)}</a> · ${esc(EXP.get(k).n)}</div>` : '';
    elN.innerHTML = `<p class="subp">${esc(X.intro)}</p><div class="memo">` + X.now.map(x => `<div class="mrow arow"><div class="mt"><b>${esc(x.t)}</b><span class="mn">${esc(x.n)}</span><small class="aw">${esc(x.w)}</small></div><div class="mf">${esc(x.f)}</div><div class="ma"><b>사무직</b>${expLink(x.a)}</div>${exp(x.e)}<div class="mex aq jdq">${ql(x.ids)}</div>${lines(2, 'mlines')}</div>`).join('') + `</div>`;
    const idea = pfx => (x, i) => `<div class="ccard idea"><span class="lbl">${pfx} ${i + 1}</span><h4>${esc(x.t)}</h4><p><b>불편</b>${esc(x.p)}</p><p><b>어떻게</b>${esc(x.h)}</p><p><b>한전 위에</b>${esc(x.l)}</p><p><b>내 경험</b>${expLink(x.e)}</p><p><b>꼬리</b>${esc(x.f)}</p></div>`;
    elI.innerHTML = `<p class="subp">${esc(X.frame)}</p>`
      + `<h4 class="ideah">안에서 효율 ${X.ideas.internal.length} · 지사 사무직의 시간을 줄이는 것</h4><div class="ideas">${X.ideas.internal.map(idea('안에서 효율')).join('')}</div>`
      + `<h4 class="ideah">국민 편의 ${X.ideas.public.length} · 고객이 먼저 느끼는 것</h4><div class="ideas">${X.ideas.public.map(idea('국민 편의')).join('')}</div>`
      + `<div class="ccard aicav"><span class="lbl">AI를 말할 때 같이 준비할 것 · 꼬리질문 6</span><ul class="plain">${X.caveats.map(([t, u]) => `<li><b>${esc(t)}</b> ${expLink(u)}</li>`).join('')}</ul></div>`;
  })();

  /* ───── 경북 ───── */
  $('#gb30').textContent = ME.gbMotive30; $('#gb60').textContent = ME.gbMotive60;
  const GBQ = ['p_why', 'relocate', 'p_local', 'p_elder', 'merge'].map(id => Q.find(q => q.id === id)).filter(Boolean);
  $('#gbQa').innerHTML = GBQ.filter(q => q.id !== 'p_why').map(q => card(q, 'gbq')).join('');
  $('#gbNote').textContent = `경북 관련 질문은 5번 질문 모음에 답변과 함께 있다: ${GBQ.map(q => `Q${q.no} ${q.q}`).join(' / ')}`;

  /* ───── 연습 ───── */
  (function practice() {
    let cur = null, timer = null, left = 60, total = 60;
    const pools = { sa: () => Q.filter(q => !q.pred && !q.essay && q.n >= 5), e: () => Q.filter(q => q.group === '경험·공통' || q.essay), j: () => Q.filter(q => q.group === '직무'), p: () => Q.filter(q => q.pred), all: () => Q };
    const reset = () => { total = left = +$('#sec').value; $('#ptime').textContent = left; $('#pbar').style.width = '100%'; $('#pbar').classList.remove('warn'); };
    const stop = () => { clearInterval(timer); timer = null; $('#pstart').textContent = '타이머 시작'; };
    const pick = () => { const pool = pools[$('#pool').value](); if (!pool.length) return; let q; do { q = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && cur && q.id === cur.id); cur = q; $('#pq').textContent = `Q${q.no}. ${q.q}`; $('#pmeta').innerHTML = `<span>${esc(q.cat)}</span>${q.pred ? '<span>예상</span>' : q.essay ? '<span>자소서</span>' : `<span>후기 ${q.n}곳</span>`}`; $('#ptipbox').hidden = true; stop(); reset(); };
    $('#pnext').addEventListener('click', pick);
    $('#pstart').addEventListener('click', () => { if (!cur) pick(); if (timer) { stop(); return; } $('#pstart').textContent = '멈춤'; timer = setInterval(() => { left--; $('#ptime').textContent = Math.max(0, left); $('#pbar').style.width = (left / total * 100) + '%'; if (left <= 10) $('#pbar').classList.add('warn'); if (left <= 0) { stop(); $('#ptime').textContent = '끝'; } }, 1000); });
    $('#sec').addEventListener('change', () => { stop(); reset(); });
    $('#ptip').addEventListener('click', () => { if (!cur) return; const b = $('#ptipbox'); b.hidden = !b.hidden; if (b.hidden) return; const a = A[cur.id] || {}; b.innerHTML = a.s ? `${answerBody(a)}<a href="#q-${cur.id}">Q${cur.no} 카드로 가기</a>` : '답변 없음'; });
    reset();
  })();

  /* ───── 출처 ───── */
  (function sources() {
    const cnt = {}; Q.forEach(q => q.srcs.forEach(k => cnt[k] = (cnt[k] || 0) + 1));
    const order = { '공채': 0, '모음': 1, '인턴': 2, '계약직': 3, '기타': 4 };
    const rows = [...SOURCES].sort((a, b) => order[a.type] - order[b.type] || (parseInt(b.yr) || 0) - (parseInt(a.yr) || 0));
    $('#srctable').innerHTML = `<thead><tr><th>시기</th><th>전형</th><th>출처</th><th class="n">유형</th></tr></thead><tbody>${rows.map(s => `<tr><td>${esc(s.yr)}</td><td>${esc(s.type)}</td><td><a href="${s.url}" target="_blank" rel="noopener">${esc(s.site)} · ${esc(s.title)}</a></td><td class="n">${cnt[s.k] || 0}</td></tr>`).join('')}</tbody>`;
    $('#refs').innerHTML = (window.REFS || []).map(r => `<li><a href="${r.url}" target="_blank" rel="noopener">${esc(r.t)}</a></li>`).join('');
  })();

  /* ───── 인쇄 ───── */
  (function printer() {
    const GL = ['경험·공통', '직무', '시사·경북', '자소서'];
    const GH = { '경험·공통': '경험면접 · 공통 질문', '직무': '직무면접 · 전공·직무 질문', '시사·경북': '시사 · 경북 · 민원 상황 (예상)', '자소서': '자소서 꼬리질문' };
    $('#printQa').innerHTML = GL.map(g => { const list = Q.filter(q => q.group === g).sort(SORT); return `<div class="pgrp" data-g="${g}"><h3 class="pgh">${GH[g]} <small>${list.length}개 · Q${list[0].no}~Q${list[list.length - 1].no}</small></h3>${list.map(printItem).join('')}</div>`; }).join('');
    const SECS = [['struct', '1. 면접 한눈에'], ['me', '2. 내 경험 · 자기소개 · 자소서'], ['memo', '3. 이슈 암기'], ['gb', '4. 경북 지역전문사원']];
    const DEF = { secs: ['struct', 'me', 'memo', 'gb'], groups: GL.slice(), mode: 'note', ln: 4, vs: false };
    let st = DEF;
    try { st = Object.assign({}, DEF, JSON.parse(localStorage.getItem('kepco.print') || '{}')); } catch (e) { }
    const qs = new URLSearchParams(location.search);
    if (qs.has('p')) { const p = qs.get('p').split(',').filter(Boolean); st = Object.assign({}, st, { secs: p.filter(x => SECS.some(s => s[0] === x)), groups: p.filter(x => GL.includes(x)) }); }
    if (qs.has('mode')) st.mode = qs.get('mode') === 'blank' ? 'blank' : 'note';
    if (qs.has('ln')) st.ln = +qs.get('ln') || 0;
    if (qs.has('vs')) st.vs = qs.get('vs') === '1';
    const cnt = g => Q.filter(q => q.group === g).length;
    $('#prSecs').innerHTML = SECS.map(([k, t]) => `<label><input type="checkbox" data-sec="${k}"> ${t}</label>`).join('') + GL.map(g => `<label><input type="checkbox" data-grp="${g}"> 5. 질문 · ${g} <small>${cnt(g)}개</small></label>`).join('');
    const apply = () => {
      SECS.forEach(([k]) => $('#' + k).classList.toggle('noprint', !st.secs.includes(k)));
      $$('#printQa .pgrp').forEach(el => el.classList.toggle('noprint', !st.groups.includes(el.dataset.g)));
      $('#qa').classList.toggle('noprint', !st.groups.length);
      document.body.classList.toggle('pm-blank', st.mode === 'blank');
      document.body.classList.toggle('pv-on', !!st.vs);
      document.body.dataset.ln = st.mode === 'blank' ? Math.max(st.ln, 8) : st.ln;
      $$('#prSecs [data-sec]').forEach(i => i.checked = st.secs.includes(i.dataset.sec));
      $$('#prSecs [data-grp]').forEach(i => i.checked = st.groups.includes(i.dataset.grp));
      $$('input[name=prMode]').forEach(i => i.checked = i.value === st.mode);
      $('#prLn').value = String(st.ln); $('#prVs').checked = !!st.vs;
      const nq = Q.filter(q => st.groups.includes(q.group)).length;
      $('#prSum').textContent = `질문 ${nq}개${st.secs.length ? ` + 정리 ${st.secs.length}개 섹션` : ''} · ${st.mode === 'blank' ? '답을 가리고 쓰는 줄을 크게' : `답변 전부 + 메모 ${st.ln}줄`}`;
      try { localStorage.setItem('kepco.print', JSON.stringify(st)); } catch (e) { }
    };
    $('#print').addEventListener('change', e => {
      const i = e.target;
      if (i.dataset.sec) st.secs = SECS.map(s => s[0]).filter(k => k === i.dataset.sec ? i.checked : st.secs.includes(k));
      else if (i.dataset.grp) st.groups = GL.filter(g => g === i.dataset.grp ? i.checked : st.groups.includes(g));
      else if (i.name === 'prMode') st.mode = i.value;
      else if (i.id === 'prLn') st.ln = +i.value;
      else if (i.id === 'prVs') st.vs = i.checked;
      apply();
    });
    $('#prAll').addEventListener('click', () => { st = Object.assign({}, st, { secs: SECS.map(s => s[0]), groups: GL.slice() }); apply(); });
    $('#prQaOnly').addEventListener('click', () => { st = Object.assign({}, st, { secs: [], groups: GL.slice() }); apply(); });
    $('#prGo').addEventListener('click', () => window.print());
    apply();
  })();

  const NUM = { exps: ME.exps.length, cards: MEMO.cards.length, aixNow: AX.now.length, aixIdeas: `${AX.ideas.internal.length + AX.ideas.public.length} · 안에서 효율 ${AX.ideas.internal.length} · 국민 편의 ${AX.ideas.public.length}` };
  $$('[data-n]').forEach(el => { const k = el.dataset.n; el.textContent = k in NUM ? NUM[k] : (MEMO[k] || []).length; });
  $('#upd').textContent = `자료 기준일 ${UPDATED}.`;
})();
