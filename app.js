(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const UPDATED = '2026-11-12';
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
  const eix = q => q.essay ? +q.id.slice(2, q.id.indexOf('_')) * 100 + +q.id.split('_')[1] : 0;
  const SORT = (a, b) => ORDER[a.group] - ORDER[b.group] || eix(a) - eix(b) || b.n - a.n || a.q.localeCompare(b.q, 'ko');
  [...Q].sort(SORT).forEach((q, i) => { q.no = i + 1; });
  const lines = (n, cls) => `<div class="lines${cls ? ' ' + cls : ''}" aria-hidden="true">${'<i></i>'.repeat(n)}</div>`;

  /* ───── 헤더 ───── */
  const LT = window.LATEST || { themes: [], items: [] };
  const qaTypes = [['기출', Q.filter(q => !q.pred && !q.essay)], ['예상', Q.filter(q => q.pred)], ['자소서', Q.filter(q => q.essay)]];
  $('#qaTotals').innerHTML = qaTypes.map(([label, qs]) => `<div><dt>${label}</dt><dd>${qs.length}</dd></div>`).join('');
  const TL = [
    { d: '2026-10-27', t: '필기 합격 발표', s: '발표일 포함 3일 안에 자소서·증빙 제출' },
    { d: '2026-10-29', t: '자소서·증빙 제출 마감', s: '3문항 × 700자 · 원문과 꼬리질문은 내 경험·자소서에서 확인' },
    { d: '2026-11-09', e: '2026-11-27', t: '면접 (직무 + 경험)', s: '하루 통합' },
    { d: '2026-12-03', t: '최종 합격 발표', s: '' },
    { d: '2027-01-18', t: '사무 입사', s: '수습 3개월' },
  ];
  const P = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const dday = s => Math.round((P(s) - TODAY) / 864e5);
  const fmt = s => { const d = P(s); return `${d.getMonth() + 1}/${d.getDate()}`; };
  $('#timeline').innerHTML = TL.map(x => { const end = x.e ? P(x.e) : P(x.d); const dd = dday(x.d); const cls = end < TODAY ? 'past' : (P(x.d) <= TODAY ? 'now' : ''); const lab = end < TODAY ? '지남' : P(x.d) <= TODAY ? '진행 중' : `D-${dd}`; return `<li class="${cls}"><div class="dt">${fmt(x.d)}${x.e ? ' ~ ' + fmt(x.e) : ''}</div><div class="tt">${x.t}</div>${x.s ? `<div class="ss">${x.s}</div>` : ''}<span class="dd">${lab}</span></li>`; }).join('');
  (function alert() { const el = $('#alert'); const sub = dday('2026-10-29'), iv = dday('2026-11-09'), ivEnd = dday('2026-11-27'); if (sub >= 0) el.innerHTML = `<b>자소서·증빙 제출 D-${sub}</b> · 자소서 3문항이 경험면접 질문지다. 제출한 원문과 문장별 꼬리질문은 “내 경험·자소서”에. 면접에서는 자소서와 같은 단어·같은 숫자로.`; else if (iv > 0) { el.className = 'alert calm'; el.innerHTML = `<b>면접 시작 D-${iv}</b> · 질문·답변의 빈출 질문부터 소리 내어 연습. 숫자 카드는 매일 한 바퀴.`; } else if (ivEnd >= 0) { el.className = 'alert calm'; el.innerHTML = `<b>면접 기간</b> · 수험표·신분증. 이름·학교는 말하지 않는다.`; } else { el.className = 'alert calm'; el.textContent = '면접 기간이 끝났다. 최종 발표 12월 3일.'; } })();

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
  const sourceLink = ([title, url]) => `<a class="source-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(title)} ↗</a>`;
  const memoRow = x => `<div class="mrow"><div class="mt"><b>${esc(x.t)}</b><span class="mn">${esc(x.n)}</span></div><div class="mf">${esc(x.f)}</div>${x.a ? `<div class="ma"><b>답변</b>${esc(x.a)}</div>` : ''}${x.e && EXP.has(x.e) ? `<div class="mex"><b>내 경험</b><a class="elink" href="#exp-${x.e}">${esc(EXP.get(x.e).t)}</a> · ${esc(EXP.get(x.e).n)}</div>` : ''}${x.ref ? `<div class="mex">${sourceLink(x.ref)}</div>` : ''}${lines(2, 'mlines')}</div>`;
  $('#sectorIssues').innerHTML = MEMO.industry.map(memoRow).join('');
  $('#workNotes').innerHTML = MEMO.job.map(memoRow).join('');
  $('#localNotes').innerHTML = MEMO.local.map(memoRow).join('');
  $('#memoVideo').innerHTML = MEMO.video.map(memoRow).join('');
  /* ───── 최신 이슈 · 2026.8 이후 ───── */
  (function latest() {
    const L = window.LATEST, el = $('#latestBlock'); if (!L || !el) return;
    const QB = new Map(Q.map(q => [q.id, q]));
    const SL = { pr: '보도', ex: '해명', mag: '사보', yt: '영상' };
    const TH = new Map(L.themes.map(t => [t.k, t]));
    const short = t => t.t.split(' · ')[0];
    const items = [...L.items].sort((a, b) => b.d.localeCompare(a.d) || (b.no || 0) - (a.no || 0));
    const url = x => x.s === 'yt' ? `https://www.youtube.com/watch?v=${x.v}` : x.s === 'mag' ? `https://www.kepco.co.kr/KEPCO_FILE/html/${x.p}.html` : `https://www.kepco.co.kr/home/media/newsroom/pr/boardView.do?boardMngNo=15&boardNo=${x.no}`;
    const md = x => x.d.length === 7 ? `${+x.d.slice(5, 7)}월호` : `${+x.d.slice(5, 7)}.${+x.d.slice(8, 10)}`;
    const ql = ids => (ids || []).map(id => QB.get(id)).filter(Boolean).map(q => `<a href="#q-${q.id}"><b>Q${q.no}</b> ${esc(q.q.replace(/\s*\([^)]*\)/g, '').split(' · ')[0])}</a>`).join('');
    const me = k => k && EXP.has(k) ? `<p class="lme"><b>내 경험</b><a class="elink" href="#exp-${k}">${esc(EXP.get(k).t)}</a> · ${esc(EXP.get(k).n)}</p>` : '';
    const of = k => items.filter(x => x.th === k);
    const isStar = x => TH.get(x.th).star || x.s === 'ex';
    const tag = x => esc(short(TH.get(x.th)));

    const companyRef = {
      cs: ['company-business', '한전의 사업'], grid: ['company-strategy', '전력망 확충 전략'],
      mega: ['company-strategy', '전력 인프라 전략'], ai: ['company-ai', 'AI 사업 현황'],
      fin: ['company-finance', '재무제표와 기준일'], dsm: ['company-business', '수요관리의 역할'],
      safe: ['company-esg', '현장 안전'], tech: ['company-strategy', '연구개발과 기술 사업화'],
      esg: ['company-esg', 'ESG 활동'], hr: ['company-talent', '인재상'],
      pr: ['company-values', '고객감동과 상생소통'], eco: ['company-esg', '협력사 안전']
    };
    const topic = (t, index) => {
      const list = of(t.k);
      const representative = list.find(x => (x.no || x.p || x.v) === t.source) || list[0];
      const background = companyRef[t.k];
      const datedBrief = window.AIX?.now.find(x => x.issue === t.k);
      const citation = x => sourceLink([`${md(x)} ${SL[x.s]} · ${x.t}`, url(x)]);
      return `<details class="topic" id="lt-${t.k}" ${index === 0 ? 'open' : ''}>
        <summary><span>${esc(t.t)}</span><span class="topic-count">${list.length}건</span></summary>
        <div class="topic-text"><dl><dt>어떤 이슈인가요?</dt><dd>${esc(t.f)}</dd><dt>왜 중요한가요?</dt><dd>${esc(t.why)}</dd></dl>
        <div class="issue-answer"><b>면접 답변 예시</b><p>${esc(t.a)}</p></div>
        ${representative ? `<p class="topic-source">${citation(representative)}</p>` : ''}
        ${background ? `<p class="screenonly"><a href="#${background[0]}">기업 설명 · ${esc(background[1])}</a></p>` : ''}
        <details class="topic-extra print-appendix"><summary>관련 질문과 경험</summary>${me(t.e)}
          <div class="jdq">${ql(t.ids)}</div><p class="mn">${esc(t.n)}</p>${datedBrief ? `<p>${esc(datedBrief.w)}</p>` : ''}
        </details></div></details>`;
    };
    const FILT = [['all', '전체', () => true], ['star', '★ 반복·중요', isStar], ['pr', '보도', x => x.s === 'pr'], ['ex', '해명', x => x.s === 'ex'], ['mag', '사보', x => x.s === 'mag'], ['yt', '영상', x => x.s === 'yt']];
    const months = [...new Set(items.map(x => x.d.slice(0, 7)))];
    const row = x => `<li class="lrow${isStar(x) ? ' st' : ''}"><span class="ld">${md(x)}</span><span class="lb s-${x.s}">${SL[x.s]}</span><div class="lbody"><a class="lt" href="${url(x)}" target="_blank" rel="noopener">${esc(x.t)}</a><span class="lth">${tag(x)}</span><p>${esc(x.f)}</p></div></li>`;
    const list = f => { const fn = FILT.find(z => z[0] === f)[2]; return months.map(m => { const xs = items.filter(x => x.d.slice(0, 7) === m && fn(x)); return xs.length ? `<h5 class="lmonth">${+m.slice(5, 7)}월 <small>${xs.length}건</small></h5><ol class="llist">${xs.map(row).join('')}</ol>` : ''; }).join(''); };
    el.innerHTML = `<p class="topic-period">한전 보도·설명자료, 사보, 공식 영상 · ${esc(L.range)}</p>
      <div class="topic-list">${L.themes.map(topic).join('')}</div>
      <details id="issue-archive" class="chapter archive screenonly"><summary>날짜순 원문 목록 · ${items.length}건</summary>
        <div class="chips lfilter">${FILT.map(([k, t], i) => `<button class="chip${i ? '' : ' on'}" aria-pressed="${!i}" type="button" data-lf="${k}">${t}</button>`).join('')}</div>
        <div id="latestList">${list('all')}</div></details>
      <div id="sourceDigest" class="printonly"><h4 class="sub">날짜별 이슈 해설 · ${items.length}건</h4><ol class="lprint">${items.map(x => `<li><b>${md(x)} ${SL[x.s]}</b> <a href="${url(x)}">${esc(x.t)}</a><span class="digest-detail"> · ${tag(x)}<br>${esc(x.f)}</span></li>`).join('')}</ol></div>`;
    el.addEventListener('click', e => { const b = e.target.closest('[data-lf]'); if (!b) return; $$('[data-lf]', el).forEach(z => { z.classList.toggle('on', z === b); z.setAttribute('aria-pressed', z === b); }); $('#latestList').innerHTML = list(b.dataset.lf); });
  })();

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
    rebuild();
  })();

  /* ───── 질문 카드 ───── */
  const srcBadge = k => { const s = S.get(k); if (!s) return ''; const cls = s.type === '공채' ? 'g' : s.type === '인턴' ? 'i' : 'c'; return `<a class="src ${cls}" href="${s.url}" target="_blank" rel="noopener">${esc(s.yr)} ${esc(s.type)}</a>`; };
  function answerBody(a, compact = false) {
    if (!a.s) return '<p class="empty">준비 중인 답변입니다.</p>';
    const references = (a.refs || []).map(sourceLink).join(' ');
    const extras = `<div class="two"><div class="kk"><b>한전 업무와 연결</b><p>${esc(meText(a.k))}</p>${references}</div>
      <div class="ee"><b>연결할 경험</b><p>${expLink(a.e)}</p></div></div>
      ${a.f ? `<div class="ff"><b>꼬리질문 대비</b><p>${expLink(meText(a.f))}</p></div>` : ''}`;
    return `<div class="ans4"><div class="say"><b>답변 예시</b><p>${esc(meText(a.s))}</p></div>
      ${compact ? `<details class="answer-extra"><summary>꼬리질문과 답변 근거</summary>${extras}</details>` : extras}</div>`;
  }
  const metaOf = q => q.essay ? '제출한 자소서' : q.pred ? '예상 질문' : `후기 ${q.n}곳`;
  function card(q, prefix = 'q') {
    const notes = [[q.def, '개념'], [q.basis, '예상 근거'], [q.fix, '대응 방법'], [q.link, '한전과 연결'], [q.tip, '연습 메모']].filter(([v]) => v);
    const variants = (q.v || []).map(([k, t]) => `<li>${srcBadge(k)}<span>${esc(t)}</span></li>`).join('');
    const raw = variants || notes.length ? `<details class="raw"><summary>${variants ? '실제 질문 문장과 출처' : '질문 배경과 참고 자료'}</summary>
      <ul class="vlist">${variants}</ul>${notes.map(([v, label]) => `<div class="defbox"><b>${label}</b>${esc(v)}</div>`).join('')}</details>` : '';
    return `<details class="qa" id="${prefix}-${q.id}"><summary><span class="qno">Q${String(q.no).padStart(2, '0')}</span>
      <span class="qt">${esc(q.q)}</span><span class="qm">${esc(q.cat)} · ${metaOf(q)}</span></summary>
      <div class="qa-body">${answerBody(A[q.id] || {}, true)}${raw}</div></details>`;
  }
  /* 인쇄용: 접히지 않는 블록 */
  function printItem(q) {
    const g = grade(q); const a = A[q.id] || {};
    const def = q.def ? `<div class="pdef"><b>정의</b>${esc(q.def)}</div>` : '';
    const ref = [q.basis && `예상 근거 · ${q.basis}`, q.fix && `대책 · ${q.fix}`, q.link && `한전 연결 메모 · ${q.link}`, q.tip && `팁 · ${q.tip}`].filter(Boolean);
    const refs = ref.length ? `<div class="pref">${ref.map(t => `<p>${esc(t)}</p>`).join('')}</div>` : '';
    return `<article class="pitem"><div class="phead"><span class="pno">Q${q.no}</span><i class="t ${gcls(g)}">${g}</i><h4>${esc(q.q)}</h4><span class="pm">${metaOf(q)} · ${esc(q.cat)}</span></div>${def}${answerBody(a)}${refs}<div class="pwrite"><b>내 답변 메모</b>${lines(10)}</div></article>`;
  }
  const state = { group: '전체', q: '', page: 0 };
  const pageSize = 12;
  const frequent = q => !q.pred && !q.essay && q.n >= 5;
  const groups = ['전체', '빈출', '최근 기출', '경험·공통', '직무', '시사·경북', '자소서'];
  const inGroup = (q, g) => g === '전체' || (g === '빈출' ? frequent(q) : g === '최근 기출' ? q.rec.length > 0 : q.group === g);
  const searchIndex = new Map(Q.map(q => {
    const a = A[q.id] || {};
    return [q.id, [q.q, q.cat, ...(q.v || []).map(v => v[1]), meText(a.s), a.k, a.e, a.f].join(' ').toLowerCase()];
  }));
  function matches() {
    const term = state.q.trim().toLowerCase();
    const no = /^q\s*0*(\d+)$/.exec(term);
    return Q.filter(q => inGroup(q, state.group) && (no ? q.no === Number(no[1]) : searchIndex.get(q.id).includes(term)))
      .sort(state.group === '최근 기출' ? (a, b) => b.rec.length - a.rec.length || a.no - b.no : SORT);
  }
  $('#qaChips').innerHTML = groups.map(g => `<button type="button" class="chip" data-g="${g}"${g === '빈출' ? ' title="서로 다른 후기 5곳 이상에 나온 질문"' : ''}>${g}</button>`).join('');
  function renderQa() {
    const list = matches();
    const pages = Math.ceil(list.length / pageSize);
    state.page = Math.min(state.page, Math.max(0, pages - 1));
    const start = state.page * pageSize;
    $('#qaList').innerHTML = list.slice(start, start + pageSize).map(q => card(q)).join('') ||
      '<div class="empty"><b>일치하는 질문이 없습니다.</b><p>다른 단어를 입력하거나 분류를 바꿔 보세요.</p><button type="button" class="btn ghost sm" id="clearQuery">검색 초기화</button></div>';
    $('#qaCount').textContent = `${state.group === '빈출' ? '후기 5곳 이상 · ' : ''}질문 ${list.length}개${pages > 1 ? ` · ${start + 1}–${Math.min(start + pageSize, list.length)}번째` : ''}`;
    $('#printResults').disabled = !list.length;
    $('#qaPages').innerHTML = pages > 1 ? `<button type="button" data-step="-1" ${!state.page ? 'disabled' : ''}>← 이전</button><span>${state.page + 1} / ${pages}</span><button type="button" data-step="1" ${state.page === pages - 1 ? 'disabled' : ''}>다음 →</button>` : '';
    $$('#qaChips .chip').forEach(b => { b.classList.toggle('on', b.dataset.g === state.group); b.setAttribute('aria-pressed', b.dataset.g === state.group); });
  }
  $('#qaChips').addEventListener('click', e => {
    const b = e.target.closest('[data-g]'); if (!b) return;
    state.group = b.dataset.g; state.page = 0; renderQa();
  });
  $('#qaq').addEventListener('input', e => { state.q = e.target.value; state.page = 0; renderQa(); });
  $('#qaList').addEventListener('click', e => {
    if (e.target.id !== 'clearQuery') return;
    state.group = '전체'; state.q = $('#qaq').value = ''; state.page = 0; renderQa(); $('#qaq').focus();
  });
  $('#qaPages').addEventListener('click', e => {
    const b = e.target.closest('[data-step]'); if (!b) return;
    state.page += Number(b.dataset.step); renderQa(); $('#qaList summary').focus();
  });
  renderQa();
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
    const updates = new Map(X.now.filter(x => x.project).map(x => [x.project, x]));

    const aiNote = (x, title, status) => `<div class="mrow arow"><div class="mt"><b>${esc(title)}</b><small class="aw">${esc(status)}${status ? ' · ' : ''}${esc(x.w)}</small></div><div class="mf">${esc(x.f)}</div><div class="mex jdq screenonly">${ql(x.ids)}</div></div>`;
    const inventory = X.inventory.map(g => `<h4 class="ideah">${esc(g.status)} · 2026년 6월 말 기준</h4><div class="memo">${g.cases.map(c => {
      const update = updates.get(c.project);
      if (update) return aiNote(update, c.t, `6월 자료 ${c.page}쪽`);
      return `<div class="mrow"><div class="mt"><b>${esc(c.t)}</b><small class="aw">6월 자료 ${c.page}쪽</small></div><div class="mf">${esc(c.f)}</div></div>`;
    }).join('')}</div>`).join('');
    const otherProjects = X.now.filter(x => !x.project && !x.issue);
    elN.innerHTML = '<p class="subp">추진 단계는 2026년 6월 30일 한전 자료 기준이다. 후속 발표가 있는 사업에는 발표 시점을 함께 적었다.</p>'
      + inventory + `<h4 class="ideah">그 밖의 추진 사업</h4><div class="memo">${otherProjects.map(x => aiNote(x, x.t, '')).join('')}</div>`;
    const idea = pfx => (x, i) => `<div class="ccard idea"${x.id ? ` id="idea-${esc(x.id)}"` : ''}><span class="lbl">${pfx} ${i + 1}</span><h4>${esc(x.t)}</h4><p><b>불편</b>${esc(x.p)}</p><p><b>어떻게</b>${esc(x.h)}</p><p><b>한전 업무</b>${esc(x.l)}</p><p><b>내 경험</b>${expLink(x.e)}</p><p><b>꼬리</b>${esc(x.f)}</p></div>`;
    elI.innerHTML = `<p class="subp">${esc(X.frame)} <a class="elink" href="#company-ai">한전이 실제로 추진하는 AI 사업 확인</a></p><p class="subp">${esc(MEMO.aiAdvice[0].a)}</p>`
      + '<h4 class="ideah">다른 공기업 사례의 한전 적용 가능성 · 2026.6.30 자료</h4><div class="memo">'
      + X.peers.map(p => `<div class="mrow"><div class="mt"><b>${p.idea ? `<a href="#idea-${esc(p.idea)}">${esc(p.t)}</a>` : esc(p.t)}</b></div><div class="mf">${esc(p.f)}</div></div>`).join('') + '</div>'
      + `<p class="ideanav">${X.ideas.map((g, i) => `<a href="#idea-${g.k}">${i + 1}. ${esc(g.t)} ${g.list.length}</a>`).join('')}</p>`
      + X.ideas.map((g, i) => `<h4 class="ideah" id="idea-${g.k}">${i + 1}. ${esc(g.t)} ${g.list.length} · ${esc(g.sub)}</h4><div class="ideas">${g.list.map(idea(g.lbl)).join('')}</div>`).join('')
      + `<div class="ccard aicav"><span class="lbl">AI를 말할 때 같이 준비할 것 ${X.caveats.length}</span><ul class="plain">${X.caveats.map(([t, u]) => `<li><b>${esc(t)}</b> ${expLink(u)}</li>`).join('')}</ul></div>`;
  })();

  /* ───── 경북 ───── */
  $('#gb30').textContent = ME.gbMotive30; $('#gb60').textContent = ME.gbMotive60;
  const GBQ = ['p_why', 'relocate', 'p_local', 'p_elder', 'merge'].map(id => Q.find(q => q.id === id)).filter(Boolean);
  $('#gbQa').innerHTML = GBQ.map(q => `<a href="#q-${q.id}"><b>Q${q.no}</b> ${esc(q.q)}</a>`).join('');
  $('#gbNote').textContent = `경북 관련 질문은 질문·답변에서 확인하세요. ${GBQ.map(q => `Q${q.no} ${q.q}`).join(' / ')}`;

  /* ───── 경북본부·지사가 하는 일 (업무별 전화번호) ───── */
  (function gbwork() {
    const G = window.GBWORK, el = $('#gbWork'); if (!G || !el) return;
    const QB = new Map(Q.map(q => [q.id, q]));
    const ql = ids => (ids || []).map(id => QB.get(id)).filter(Boolean).map(q => `<a href="#q-${q.id}"><b>Q${q.no}</b> ${esc(q.q.replace(/\s*\([^)]*\)/g, '').split(' · ')[0])}</a>`).join('');
    const O = G.offices, BR = O.filter(o => o.kind === '지사');
    const has = (o, t) => o.rows.some(r => t.kw.some(k => (r[0] + ' ' + r[1]).includes(k)));
    const link = o => `https://www.kepco.co.kr/home/about/locations/gyeongbuk/${o.kind === '본부' ? 'headquarters' : 'branch'}.do?branchNo=${o.no}`;
    const depts = o => { const m = new Map(); o.rows.forEach(r => m.set(r[0], (m.get(r[0]) || 0) + 1)); return [...m].map(([d, n]) => `${esc(d)}<span class="screenonly"> ${n}</span>`).join(' · '); };
    const xc = o => o.kind === '지사' ? '' : ' x';
    const sum = `<div class="tablewrap gbtw"><table class="gbtable"><thead><tr><th>사업소</th><th>관할</th><th>부서<span class="screenonly"> · 번호 줄 수</span></th><th class="screenonly">국번</th></tr></thead><tbody>${O.map(o => `<tr><td><a href="${link(o)}" target="_blank" rel="noopener">${esc(o.name)}</a><small class="screenonly">${esc(o.addr)}</small></td><td>${esc(o.prec)}</td><td>${depts(o)}</td><td class="gbtel screenonly">${esc(o.tel)}</td></tr>`).join('')}</tbody></table></div>`;
    const groups = [...new Set(G.tasks.map(t => t.g))];
    const mx = `<div class="tablewrap gbtw"><table class="gbmx"><thead><tr><th>업무</th>${O.map(o => `<th class="gbh${xc(o)}">${esc(o.short)}</th>`).join('')}<th class="gbh">지사</th></tr></thead><tbody>`
      + groups.map(g => `<tr class="gbg"><th colspan="${O.length + 2}">${esc(g)}</th></tr>` + G.tasks.filter(t => t.g === g).map(t => { const n = BR.filter(o => has(o, t)).length; return `<tr><td class="gbt"><b>${esc(t.t)}</b>${t.d ? `<small>${esc(t.d)}</small>` : ''}</td>${O.map(o => `<td class="gbc${xc(o)}">${has(o, t) ? '●' : ''}</td>`).join('')}<td class="gbn${n === BR.length ? ' all' : ''}">${n}/${BR.length}</td></tr>`; }).join('')).join('')
      + `</tbody></table></div>`;
    function officeNames(task) {
      const sites = O.filter(o => has(o, task));
      const branches = sites.filter(o => o.kind === '지사');
      const labels = sites.filter(o => o.kind !== '지사').map(o => o.name);
      return labels.concat(branches.length === BR.length ? [`일반 지사 ${BR.length}곳 모두`] : branches.map(o => o.name)).join(' · ') || '업무명 미표기';
    }
    const paperMap = `<div class="printonly"><h4 class="sub">업무별 담당 사업소</h4>
      <table class="office-list"><thead><tr><th>업무</th><th>업무별 전화번호에 표시된 사업소</th></tr></thead>
      ${groups.map(g => `<tbody><tr class="office-group"><th colspan="2">${esc(g)}</th></tr>${G.tasks.filter(t => t.g === g).map(t =>
        `<tr><th>${esc(t.t)}${t.d ? `<small>${esc(t.d)}</small>` : ''}</th><td>${esc(officeNames(t))}</td></tr>`).join('')}</tbody>`).join('')}</table></div>`;
    const pts = `<div class="ccard gbpts"><span class="lbl">번호표로 본 포인트 ${G.points.length}</span><ul class="plain">${G.points.map(([t, u]) => `<li><b>${esc(t)}</b> ${esc(u)}</li>`).join('')}</ul><div class="jdq">${ql(G.ids)}</div></div>`;
    const total = O.reduce((n, o) => n + o.rows.length, 0);
    const raw = `<details class="lfold gbfold screenonly"><summary>사업소별 업무별 전화번호 원문 ${total}줄</summary>${O.map(o => `<h5 class="lmonth">${esc(o.name)} <small>${o.rows.length}줄 · ${esc(o.tel)}</small></h5><div class="tablewrap gbtw"><table class="gbraw"><thead><tr><th>부서</th><th>담당 업무</th><th>전화번호</th></tr></thead><tbody>${o.rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td class="gbtel">${esc(r[2])}</td></tr>`).join('')}</tbody></table></div>`).join('')}</details>`;
    el.innerHTML = `<p class="subp">${esc(G.intro)}</p>`
      + `<h4 class="ideah">사업소 ${O.length}곳의 관할과 부서<span class="screenonly"> · 이름을 누르면 홈페이지</span></h4>${sum}`
      + `<div class="screenonly"><h4 class="ideah">사업소별 업무 · ●는 전화번호표에 표시된 업무</h4>${mx}</div>${paperMap}`
      + pts + raw;
  })();

  /* ───── 연습 ───── */
  (function practice() {
    let cur = null, timer = null, left = 60, total = 60;
    const pools = { sa: () => Q.filter(frequent), e: () => Q.filter(q => q.group === '경험·공통' || q.essay), j: () => Q.filter(q => q.group === '직무'), p: () => Q.filter(q => q.pred), all: () => Q };
    const reset = () => { total = left = +$('#sec').value; $('#ptime').textContent = left; $('#pbar').style.width = '100%'; $('#pbar').classList.remove('warn'); };
    const stop = () => { clearInterval(timer); timer = null; $('#pstart').textContent = '타이머 시작'; };
    const pick = () => { const pool = pools[$('#pool').value](); if (!pool.length) return; const options = pool.length > 1 ? pool.filter(q => q.id !== cur?.id) : pool; const q = options[Math.floor(Math.random() * options.length)]; cur = q; $('#pq').dataset.id = q.id; $('#pq').textContent = `Q${q.no}. ${q.q}`; $('#pmeta').innerHTML = `<span>${esc(q.cat)}</span>${q.pred ? '<span>예상</span>' : q.essay ? '<span>자소서</span>' : `<span>후기 ${q.n}곳</span>`}`; $('#ptipbox').hidden = true; stop(); reset(); };
    $('#pnext').addEventListener('click', pick);
    $('#pool').addEventListener('change', pick);
    $('#pstart').addEventListener('click', () => { if (!cur) pick(); if (left <= 0) reset(); if (timer) { stop(); return; } $('#pstart').textContent = '멈춤'; timer = setInterval(() => { left--; $('#ptime').textContent = Math.max(0, left); $('#pbar').style.width = (left / total * 100) + '%'; if (left <= 10) $('#pbar').classList.add('warn'); if (left <= 0) { stop(); $('#ptime').textContent = '끝'; } }, 1000); });
    $('#sec').addEventListener('change', () => { stop(); reset(); });
    $('#ptip').addEventListener('click', () => { if (!cur) pick(); const b = $('#ptipbox'); b.hidden = !b.hidden; if (b.hidden) return; const a = A[cur.id] || {}; b.innerHTML = a.s ? `${answerBody(a)}<a href="#q-${cur.id}">Q${cur.no} 카드로 가기</a>` : '답변 없음'; });
    reset();
  })();

  /* ───── 출처 ───── */
  (function sources() {
    const cnt = {}; Q.forEach(q => q.srcs.forEach(k => cnt[k] = (cnt[k] || 0) + 1));
    const order = { '공채': 0, '모음': 1, '인턴': 2, '계약직': 3, '기타': 4 };
    const rows = [...SOURCES].sort((a, b) => order[a.type] - order[b.type] || (parseInt(b.yr) || 0) - (parseInt(a.yr) || 0));
    $('#srctable').innerHTML = `<thead><tr><th>시기</th><th>전형</th><th>출처</th><th class="n">유형</th></tr></thead><tbody>${rows.map(s => `<tr><td>${esc(s.yr)}</td><td>${esc(s.type)}</td><td><a href="${s.url}" target="_blank" rel="noopener">${esc(s.site)} · ${esc(s.title)}</a></td><td class="n">${cnt[s.k] || 0}</td></tr>`).join('')}</tbody>`;
    $('#refs').innerHTML = (window.REFS || []).map(r => `<li>${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.t)}</a>` : esc(r.t)}</li>`).join('');
  })();

  /* 인쇄 화면과 브라우저 인쇄 단축키는 같은 자료 선택 함수를 쓴다. */
  (function printer() {
    const book = [
      ['company', '한국전력공사 기업 설명'],
      ['topics', '기업 이슈 · 주제별 해설'], ['memo', '기업 이슈 · 제도 변화와 발표 자료'], ['jobdesc', '사무직 직무'], ['gb', '경북지역 업무'], ['me', '나의 경험·자기소개서'], ['struct', '면접 안내·후기'],
      ['cards', '숫자 암기 카드'], ['practice', '말하기 연습 안내']
    ];
    const groupNames = Object.keys(ORDER);
    const sectionIds = book.map(([id]) => id);
    const defaults = { secs: [], groups: [], ids: Q.filter(frequent).map(q => q.id), mode: 'note', ln: 0, notes: false, appendix: false };
    const fullPacket = { secs: sectionIds, groups: groupNames, ids: null, mode: 'note', notes: true, appendix: true };
    const choices = (values, valid) => Array.isArray(values) ? valid.filter(v => values.includes(v)) : [];
    let st = { ...defaults };
    try {
      const saved = JSON.parse(localStorage.getItem('kepco.print') || 'null');
      if (saved && Array.isArray(saved.secs) && Array.isArray(saved.groups)) {
        st = { ...defaults, ids: null, ...saved };
        // 이전 설정에서 'memo'는 주제 해설과 참고 자료를 함께 뜻했다.
        if (!saved.version && st.secs.includes('memo')) st.secs.push('topics');
        if ((saved.version || 0) < 4 && st.secs.includes('memo')) st.secs.push('cards');
        if ((saved.version || 0) < 3 && st.secs.includes('struct')) st.secs.push('jobdesc');
      }
    } catch {}
    const qs = new URLSearchParams(location.search);
    if (qs.has('p')) {
      const parts = qs.get('p').split(',');
      if (parts.includes('all')) Object.assign(st, fullPacket);
      else {
        st.secs = [...parts];
        if (parts.includes('memo')) st.secs.push('topics');
        if (parts.includes('struct')) st.secs.push('jobdesc');
        st.groups = parts; st.ids = null;
      }
    }
    if (qs.has('mode')) st.mode = qs.get('mode');
    if (qs.has('ln')) st.ln = Number(qs.get('ln'));
    if (qs.has('nt')) st.notes = qs.get('nt') === '1';
    st.secs = choices(st.secs, sectionIds);
    st.groups = choices(st.groups, groupNames);
    st.ids = Array.isArray(st.ids) ? choices(st.ids, Q.map(q => q.id)) : null;
    st.mode = st.mode === 'blank' ? 'blank' : 'note';
    if (![0, 2, 4, 6, 10].includes(st.ln)) st.ln = 0;
    const selection = current => Q.filter(q => current.groups.includes(q.group) || (current.ids || []).includes(q.id) ||
      (current.secs.includes('practice') && q.id === $('#pq').dataset.id));
    const check = (key, value, label) => `<label><input type="checkbox" data-${key}="${value}"><span>${label}</span></label>`;
    $('#prSecs').innerHTML = book.map(([k, label]) => check('sec', k, label)).join('') +
      '<b class="pr-sub">질문 모음</b><div id="prSubset"></div>' +
      groupNames.map(g => check('grp', g, `${g} <small>${Q.filter(q => q.group === g).length}개</small>`)).join('');
    function apply() {
      const selected = selection(st);
      $$('#prSecs [data-sec]').forEach(i => { i.checked = st.secs.includes(i.dataset.sec); });
      $$('#prSecs [data-grp]').forEach(i => {
        i.checked = st.groups.includes(i.dataset.grp);
        i.indeterminate = !i.checked && selected.some(q => q.group === i.dataset.grp);
      });
      $('#prSubset').innerHTML = st.ids?.length ? `선택한 질문 ${st.ids.length}개 <button type="button" id="removeSubset">해제</button>` : '';
      $$('input[name=prMode]').forEach(i => { i.checked = i.value === st.mode; });
      $('#prLn').closest('label').hidden = st.mode === 'blank';
      $('#prLn').value = String(st.ln);
      $('#prAppendix').checked = st.appendix;
      $('#prNotes').checked = st.notes; $('#prNotes').disabled = st.mode === 'blank';
      $('#prSum').textContent = [st.secs.length && `자료 ${st.secs.length}종`, selected.length && `질문 ${selected.length}개`].filter(Boolean).join(' · ') || '인쇄할 자료를 선택하세요.';
      $('#prGo').disabled = !selected.length && !st.secs.length;
      try { localStorage.setItem('kepco.print', JSON.stringify({ ...st, version: 4 })); } catch {}
    }
    const choose = (secs, groups, ids = null) => { Object.assign(st, { secs, groups, ids }); apply(); };
    $('#print').addEventListener('change', e => {
      const i = e.target;
      if (i.dataset.sec) st.secs = sectionIds.filter(k => k === i.dataset.sec ? i.checked : st.secs.includes(k));
      else if (i.dataset.grp) {
        const group = i.dataset.grp;
        if (st.ids) st.ids = st.ids.filter(id => Q.find(q => q.id === id)?.group !== group);
        st.groups = groupNames.filter(g => g === group ? i.checked : st.groups.includes(g));
      } else if (i.name === 'prMode') st.mode = i.value;
      else if (i.id === 'prLn') st.ln = Number(i.value);
      else if (i.id === 'prNotes') st.notes = i.checked;
      else if (i.id === 'prAppendix') st.appendix = i.checked;
      apply();
    });
    $('#prSubset').addEventListener('click', e => { if (e.target.id === 'removeSubset') { st.ids = null; apply(); } });
    $('#prAll').addEventListener('click', () => { Object.assign(st, fullPacket); apply(); });
    $('#prQaOnly').addEventListener('click', () => choose([], groupNames));
    $('#prIssues').addEventListener('click', () => { st.appendix = false; choose(['topics'], []); });
    $('#prFrequent').addEventListener('click', () => choose([], [], Q.filter(frequent).map(q => q.id)));
    $('#printResults').addEventListener('click', () => { choose([], [], matches().map(q => q.id)); location.hash = 'print'; });
    window.addEventListener('hashchange', () => { if (location.hash === '#print') apply(); });
    $('#prGo').addEventListener('click', () => window.print());
    let openedForPrint = [];
    const pages = $$('#reading > section');
    function prepare() {
      const active = pages.find(s => s.classList.contains('active-view'))?.id || 'qa';
      let current = st;
      if (active !== 'print') {
        const cardView = active === 'qa' && $('#memory-cards').contains(document.getElementById(location.hash.slice(1)));
        const ids = active === 'qa' && !cardView ? matches().map(q => q.id) : [];
        let secs = sectionIds.includes(active) ? [active] : [];
        if (cardView) secs = ['cards'];
        if (active === 'memo') secs = ['topics', 'memo'];
        current = { ...st, secs, groups: [], ids };
      }
      const selected = selection(current).sort(SORT);
      const includes = id => current.secs.includes(id);
      const visiblePages = new Set(current.secs);
      if (includes('topics')) visiblePages.add('memo');
      if (selected.length || active === 'qa' || includes('practice') || includes('cards')) visiblePages.add('qa');
      // 말하기 연습은 질문지 첫머리에 안내하고, 뽑은 문항은 질문 목록에서 한 번만 싣는다.
      visiblePages.delete('practice');
      $('#paperEmpty').classList.toggle('omit-paper', visiblePages.size > 0);
      pages.forEach(s => {
        s.classList.toggle('paper-page', visiblePages.has(s.id));
        s.classList.remove('pfirst');
      });
      pages.find(s => s.classList.contains('paper-page'))?.classList.add('pfirst');
      const picked = selected.find(q => q.id === $('#pq').dataset.id);
      $('#paperPractice').classList.toggle('omit-paper', !includes('practice'));
      $('#paperPractice p').textContent = $('#practice .shead p').textContent +
        (picked ? ` 현재 연습 문항은 Q${picked.no}, 제한 시간은 ${$('#sec').value}초입니다.` : ' 30초, 60초, 90초 중 하나를 정해 연습하세요.');
      $('#topicPages').classList.toggle('omit-paper', !includes('topics') && !includes('memo'));
      $$('#latest, .topic-period, .topic-list').forEach(el => el.classList.toggle('omit-paper', !includes('topics')));
      $('#memoLibrary').classList.toggle('omit-paper', !includes('memo'));
      $('#memory-cards').classList.toggle('omit-paper', !includes('cards'));
      $('#sourceDigest').classList.toggle('omit-paper', !includes('memo') || !current.appendix);
      $('#printQa').innerHTML = groupNames.map(g => {
        const list = selected.filter(q => q.group === g);
        return list.length ? `<div class="pgrp"><h3 class="pgh">${g} <small>${list.length}문항</small></h3>${list.map(printItem).join('')}</div>` : '';
      }).join('') || (includes('practice') || includes('cards') ? '' : '<p>선택한 질문이 없습니다.</p>');
      document.body.classList.toggle('pm-blank', current.mode === 'blank');
      document.body.classList.toggle('pn-on', current.notes);
      document.body.classList.toggle('with-appendix', current.appendix);
      document.body.dataset.ln = current.mode === 'blank' ? 8 : current.ln;
      const folds = $$('.paper-page details.chapter:not(.screenonly), .paper-page details.topic');
      if (current.appendix) folds.push(...$$('.paper-page details.print-appendix'));
      for (const d of folds) {
        if (!d.open) { d.open = true; openedForPrint.push(d); }
      }
    }
    window.addEventListener('beforeprint', prepare);
    window.addEventListener('afterprint', () => { openedForPrint.forEach(d => { d.open = false; }); openedForPrint = []; });
    apply();
  })();

  const menu = $('#studyNav'), toggle = $('#menuToggle');
  function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('show'); }
  toggle.addEventListener('click', () => { const open = menu.classList.toggle('show'); toggle.setAttribute('aria-expanded', open); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('show')) { closeMenu(); toggle.focus(); } });
  function navigate() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ''; }
    if (id === 'reading' && $('.active-view')) { $('#reading').focus(); return; }
    const q = id.startsWith('q-') && Q.find(x => 'q-' + x.id === id);
    if (q && !document.getElementById(id)) {
      let i = matches().findIndex(x => x.id === q.id);
      if (i < 0) {
        state.group = '전체'; state.q = $('#qaq').value = '';
        i = matches().findIndex(x => x.id === q.id);
      }
      state.page = Math.floor(i / pageSize); renderQa();
    }
    if (id === 'recent-questions') {
      state.group = '최근 기출'; state.q = $('#qaq').value = ''; state.page = 0; renderQa();
    }
    const moved = { 'lt-ex': 'issue-archive', 'recent-questions': 'qa', memoBasics: 'company-business', memoDoing: 'company-strategy', memoDict: 'company-business', memoVideo2: 'lt-mega' };
    const target = document.getElementById(moved[id] || id);
    const initial = !id && new URLSearchParams(location.search).has('p') ? $('#print') : $('#company');
    const section = target?.closest('main > section') || initial;
    $$('#reading > section').forEach(s => s.classList.toggle('active-view', s === section));
    document.body.classList.add('reader-ready');
    const currentId = target?.closest('#jobdesc')?.id || section.id;
    $$('#studyNav a, .print-link').forEach(a => {
      if (a.hash === '#' + currentId) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const title = $('#studyNav [aria-current]')?.textContent.trim() || $('h2', section).textContent;
    $('#mobileView').textContent = title;
    document.title = title + ' · 한전 면접노트';
    closeMenu();
    if (target && section.contains(target) && target !== section) {
      for (let el = target; el && el !== section; el = el.parentElement) if (el.tagName === 'DETAILS') el.open = true;
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      if (id === 'lt-ex' || id === 'issue-archive') {
        const filter = id === 'lt-ex' ? 'ex' : 'all';
        $(`[data-lf="${filter}"]`, target).click();
      }
    } else window.scrollTo({ top: 0, behavior: 'instant' });
  }
  window.addEventListener('hashchange', navigate);
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a && a.hash && a.hash === location.hash && !e.metaKey && !e.ctrlKey) { e.preventDefault(); navigate(); }
  });
  navigate();

  const NUM = { themes: LT.themes.length, sources: SOURCES.length, exps: ME.exps.length, cards: MEMO.cards.length };
  $$('[data-n]').forEach(el => { el.textContent = NUM[el.dataset.n]; });
  $('#upd').textContent = `자료 기준일 ${UPDATED}.`;
})();
