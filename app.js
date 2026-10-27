(function () {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const S = new Map(SOURCES.map(s => [s.k, s]));
  const CAT = new Map(CATS.map(c => [c.k, c]));
  const UPDATED = '2026-10-27';
  const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);

  /* ───── 집계 ───── */
  const Q = QUESTIONS.map(q => {
    const srcs = [...new Set((q.v || []).map(v => v[0]))];
    const gong = srcs.filter(k => S.get(k).type === '공채');
    const iv = q.pred ? '예상' : CAT.get(q.cat).iv;
    const yrs = srcs.map(k => parseInt(S.get(k).yr)).filter(Boolean);
    return Object.assign({}, q, { srcs, n: srcs.length, g: gong.length, iv, as: q.as || iv,
      minYr: yrs.length ? Math.min(...yrs) : 0, maxYr: yrs.length ? Math.max(...yrs) : 0 });
  });
  const grade = n => n >= 5 ? 'S' : n >= 3 ? 'A' : n === 2 ? 'B' : 'C';
  const nOf = (q, mode) => mode === 'gong' ? q.g : q.n;

  /* ───── 준비 체크 (localStorage) ───── */
  let done = new Set();
  try { done = new Set(JSON.parse(localStorage.getItem('kepco.done') || '[]')); } catch (e) { }
  const saveDone = () => { try { localStorage.setItem('kepco.done', JSON.stringify([...done])); } catch (e) { } };

  /* ───── 헤더 ───── */
  const nVar = QUESTIONS.reduce((a, q) => a + (q.v || []).length, 0);
  const nPred = Q.filter(q => q.pred).length;
  const nReal = Q.length - nPred;
  $('#lead').textContent = `후기 ${SOURCES.length}건에서 실제 질문 ${nVar}개를 모아 ${nReal}개 유형으로 묶고, 몇 개의 후기에서 나왔는지로 순위를 매겼다. 공고 원문의 면접 설명, 전공 개념 정리, 2026년 10월 기준 이슈, 경북 지역 정보를 한 페이지에 두었다.`;
  $('#stats').innerHTML = [
    [SOURCES.length, '참고한 후기'], [nVar, '실제 질문 문장'], [nReal, '기출 유형'], [nPred, '예상 질문'],
    [Q.filter(q => !q.pred && grade(q.n) === 'S').length, 'S등급 (후기 5곳+)'],
  ].map(([b, s]) => `<div class="stat"><b>${b}</b><span>${s}</span></div>`).join('');

  const TL = [
    { d: '2026-10-27', t: '필기 합격 발표', s: '발표일 포함 3일 안에 자소서·증빙 제출' },
    { d: '2026-10-29', t: '자소서·증빙 제출 마감', s: '3문항 × 700자. 제출 전 따로 저장' },
    { d: '2026-11-09', e: '2026-11-27', t: '면접 (직무 + 경험)', s: '하루 통합. 2025 하반기는 서울에서 진행' },
    { d: '2026-12-03', t: '최종 합격 발표', s: '' },
    { d: '2026-12-07', e: '2026-12-11', t: '건강검진', s: '전국, 별도 안내' },
    { d: '2027-01-18', t: '사무 입사', s: '수습 3개월' },
  ];
  const P = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const dday = s => Math.round((P(s) - TODAY) / 864e5);
  const fmt = s => { const d = P(s); return `${d.getMonth() + 1}/${d.getDate()}`; };
  $('#timeline').innerHTML = TL.map(x => {
    const end = x.e ? P(x.e) : P(x.d); const dd = dday(x.d);
    const cls = end < TODAY ? 'past' : (P(x.d) <= TODAY ? 'now' : '');
    const lab = end < TODAY ? '지남' : P(x.d) <= TODAY ? '진행 중' : `D-${dd}`;
    return `<li class="${cls}"><div class="dt">${fmt(x.d)}${x.e ? ' ~ ' + fmt(x.e) : ''}</div><div class="tt">${x.t}</div>${x.s ? `<div class="ss">${x.s}</div>` : ''}<span class="dd">${lab}</span></li>`;
  }).join('');

  (function alert() {
    const el = $('#alert'); const sub = dday('2026-10-29'), iv = dday('2026-11-09'), ivEnd = dday('2026-11-27');
    if (sub >= 0) el.innerHTML = `<b>자소서·증빙 제출 D-${sub}</b> · 필기 합격자는 발표일 포함 3일 안에 자기소개서(3문항 × 700자)와 어학·자격증 증빙을 채용홈페이지에 올려야 한다. 경험면접 질문이 여기서 나온다. 제출 전에 꼭 복사해 보관할 것.`;
    else if (iv > 0) { el.className = 'alert calm'; el.innerHTML = `<b>면접 시작 D-${iv}</b> · 11월 9일부터 27일 사이에 직무면접과 경험면접을 하루에 본다. 자소서 3문항의 꼬리질문과 아래 S·A등급 질문부터 소리 내어 연습.`; }
    else if (ivEnd >= 0) { el.className = 'alert calm'; el.innerHTML = `<b>면접 기간</b> · 수험표와 신분증. 이름·수험번호·학교는 말하지 않는다. 최종 발표는 12월 3일.`; }
    else { el.className = 'alert calm'; el.innerHTML = `면접 기간이 끝났다. 최종 발표 12월 3일, 건강검진 12월 7~11일, 사무 입사 2027년 1월 18일.`; }
  })();

  $('#compFact').innerHTML = `<span>참고 경쟁률</span><b>면접 약 2 : 1</b><p>2026 상반기 사무(일반): 필기 합격 224명, 면접 응시 201명, 최종 98명. 서류부터는 79 : 1.</p>`;

  const top = Q.filter(q => !q.pred).sort((a, b) => b.n - a.n || b.v.length - a.v.length).slice(0, 6);
  $('#topS').innerHTML = top.map((q, i) => `<li><i class="rk">${i + 1}</i><a href="#q-${q.id}" data-open="${q.id}">${esc(q.q)}</a><b>후기 ${q.n}곳</b></li>`).join('');
  $('#topNote').textContent = `후기 ${SOURCES.length}건 중 몇 곳에서 나왔는지`;

  /* ───── 인사이트 ───── */
  (function insight() {
    const real = Q.filter(q => !q.pred);
    const sa = real.filter(q => q.n >= 3);
    const saE = sa.filter(q => q.iv !== '직무').length;
    const concepts = real.filter(q => CAT.get(q.cat).concept);
    const conceptMax = Math.max(...concepts.map(q => q.n));
    const issue = real.find(q => q.id === 'issue');
    const unjust = real.find(q => q.id === 'unjust');
    $('#insight').innerHTML = `<h3>순위표에서 읽히는 것</h3><ul>
      <li><b>후기 3곳 이상에서 나온 ${sa.length}개 유형 중 ${saE}개가 경험·공통 질문</b>이다. 경험면접은 질문이 거의 정해져 있으니 답을 확정해 두면 점수가 안정된다.</li>
      <li><b>직무면접 전공 개념 ${concepts.length}개는 전부 후기 ${conceptMax}곳씩</b>이다. 같은 개념이 반복되지 않는다는 뜻이라, 개념 하나를 깊게보다 경영·경제 기초를 넓게 잡는 게 맞다. 예외는 합격자가 단골로 꼽은 도덕적 해이·역선택, 매슬로우, BCG, 포터.</li>
      <li><b>“한전 최근 이슈”는 후기 ${issue.n}곳</b>에서 나왔고 공채·인턴을 가리지 않는다. 2025 하반기 인턴 면접에서는 흑자를 말한 지원자에게 “그럼 요금 안 올려도 되겠네요” 함정 질문이 이어졌다.</li>
      <li><b>“상사의 부당한 지시”는 후기 ${unjust.n}곳</b>으로 상황 질문 중 1위다. 규정 우선 + 소통 방식까지 한 번에 답하는 틀을 외워 둔다.</li>
      <li>자기소개·지원동기·마지막 말은 거의 모든 후기에 있다. 셋을 30초 안에 끝내는 연습이 가장 싸고 확실한 점수다.</li>
    </ul>`;
  })();

  /* ───── 분포 ───── */
  (function distr() {
    const rows = CATS.filter(c => Q.some(q => q.cat === c.k)).map(c => {
      const qs = Q.filter(q => q.cat === c.k);
      return { k: c.k, iv: c.iv, clusters: qs.length, hits: qs.reduce((a, q) => a + q.n, 0), pred: qs.every(q => q.pred) };
    }).sort((a, b) => b.hits - a.hits || b.clusters - a.clusters);
    const max = Math.max(...rows.map(r => r.hits), 1);
    const col = { '공통': 'var(--c)', '경험': 'var(--e)', '직무': 'var(--j)', '예상': 'var(--p)' };
    $('#distr').innerHTML = rows.map(r => `<div class="bar"><div class="nm">${r.k}</div><div class="tr"><div class="fl" style="width:${r.pred ? 0 : Math.max(2, r.hits / max * 100)}%;background:${col[r.iv]}"></div></div><div class="vl">${r.pred ? `예상 ${r.clusters}개` : `${r.clusters}유형 · ${r.hits}회`}</div></div>`).join('');
  })();

  /* ───── 순위표 ───── */
  const state = { iv: '전체', mode: 'all', q: '', cat: '' };
  const IVS = ['전체', '공통', '경험', '직무', '예상'];
  $('#ivchips').innerHTML = IVS.map(v => `<button class="chip${v === '전체' ? ' on' : ''}" data-iv="${v}">${v}${v === '전체' ? '' : ' ' + Q.filter(q => q.iv === v).length}</button>`).join('');
  $('#catsel').innerHTML = `<option value="">모든 유형</option>` + CATS.map(c => `<option value="${c.k}">${c.k}</option>`).join('');

  const srcBadge = k => { const s = S.get(k); const cls = s.type === '공채' ? 'g' : s.type === '인턴' ? 'i' : 'c'; return `<a class="src ${cls}" href="${s.url}" target="_blank" rel="noopener" title="${esc(s.site)} · ${esc(s.title)}">${esc(s.yr)} ${esc(s.type)}${s.track === '기술' ? '·기술' : ''}</a>`; };

  function rowHTML(q, i, mode) {
    const n = nOf(q, mode); const g = q.pred ? 'P' : grade(n);
    const cnt = q.pred ? '기출 0 · 예상' : mode === 'gong' ? `공채 후기 ${n}곳` : `후기 ${n}곳${q.g ? ` <small style="font-weight:600">(공채 ${q.g})</small>` : ''}`;
    const yrs = q.minYr ? (q.minYr === q.maxYr ? `${q.minYr}` : `${q.minYr}~${q.maxYr}`) : '';
    const body = q.pred
      ? `<h4>예상 근거</h4><div class="tipbox">${esc(q.basis)}</div><h4>답변 포인트</h4><div class="tipbox">${esc(q.tip)}</div>`
      : `<h4>실제로 나온 질문 ${q.v.length}개${yrs ? ` · ${yrs}` : ''}</h4><ul class="vlist">${q.v.map(([k, t]) => `<li>${srcBadge(k)}<span>${esc(t)}</span></li>`).join('')}</ul>`
        + (q.star ? `<div class="star-note">★ ${esc(q.star)}</div>` : '')
        + (q.def ? `<div class="defbox"><b>정의 (30초)</b>${esc(q.def)}</div>` : '')
        + (q.fix ? `<div class="defbox fix"><b>해법·보완</b>${esc(q.fix)}</div>` : '')
        + (q.link ? `<div class="defbox link"><b>한전과 연결</b>${esc(q.link)}</div>` : '')
        + (q.tip ? `<h4>답변 포인트</h4><div class="tipbox">${esc(q.tip)}</div>` : '');
    return `<li class="qrow g-${g}${done.has(q.id) ? ' isdone' : ''}" id="q-${q.id}" data-id="${q.id}">
      <button class="qhead" aria-expanded="false">
        <span class="rk">${q.pred ? '' : i}</span><i class="t t${g}">${g === 'P' ? '예상' : g}</i>
        <span class="qt">${esc(q.q)}</span>
        <span class="meta"><em class="iv iv-${q.iv}">${q.iv}${q.pred && q.as ? '·' + q.as : ''}</em><em class="cat">${esc(q.cat)}</em><b>${cnt}</b></span>
        <label class="done" title="준비 완료 표시"><input type="checkbox" ${done.has(q.id) ? 'checked' : ''}> 준비</label>
      </button>
      <div class="qbody" hidden>${body}</div></li>`;
  }

  function render() {
    const mode = state.mode; const kw = state.q.trim().toLowerCase();
    let list = Q.filter(q => state.iv === '전체' || q.iv === state.iv)
      .filter(q => !state.cat || q.cat === state.cat)
      .filter(q => mode !== 'gong' || q.pred || q.g > 0)
      .filter(q => !kw || [q.q, q.cat, q.tip, q.def, q.basis, ...(q.v || []).map(v => v[1])].join(' ').toLowerCase().includes(kw));
    const real = list.filter(q => !q.pred).sort((a, b) => nOf(b, mode) - nOf(a, mode) || b.v.length - a.v.length || a.q.localeCompare(b.q));
    const pred = list.filter(q => q.pred);
    const ranked = real.map((q, i) => rowHTML(q, i + 1, mode)).concat(pred.map(q => rowHTML(q, 0, mode)));
    $('#qlist').innerHTML = ranked.length ? ranked.join('') : `<li class="empty">조건에 맞는 질문이 없다.</li>`;
    const vis = list.length, d = list.filter(q => done.has(q.id)).length;
    $('#donecnt').textContent = `${vis}개 표시 · 준비 완료 ${d}개 (전체 ${done.size}/${Q.length})`;
  }
  render();

  $('#ivchips').addEventListener('click', e => { const b = e.target.closest('[data-iv]'); if (!b) return; state.iv = b.dataset.iv; $$('#ivchips .chip').forEach(c => c.classList.toggle('on', c === b)); render(); });
  $('#modeseg').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (!b) return; state.mode = b.dataset.mode; $$('#modeseg button').forEach(c => c.classList.toggle('on', c === b)); render(); });
  $('#q').addEventListener('input', e => { state.q = e.target.value; render(); });
  $('#catsel').addEventListener('change', e => { state.cat = e.target.value; render(); });
  $('#qlist').addEventListener('click', e => {
    const chk = e.target.closest('input[type=checkbox]');
    const row = e.target.closest('.qrow'); if (!row) return;
    if (chk) { e.stopPropagation(); const id = row.dataset.id; chk.checked ? done.add(id) : done.delete(id); saveDone(); row.classList.toggle('isdone', chk.checked); $('#donecnt').textContent = `준비 완료 ${done.size}/${Q.length}`; return; }
    if (e.target.closest('.done')) return;
    if (e.target.closest('a')) return;
    const head = e.target.closest('.qhead'); if (!head) return;
    const open = row.classList.toggle('open'); row.querySelector('.qbody').hidden = !open; head.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-open]'); if (!a) return;
    state.iv = '전체'; state.cat = ''; state.q = ''; $('#q').value = ''; $('#catsel').value = ''; $$('#ivchips .chip').forEach(c => c.classList.toggle('on', c.dataset.iv === '전체')); render();
    const row = document.getElementById('q-' + a.dataset.open); if (row) { row.classList.add('open'); row.querySelector('.qbody').hidden = false; }
  });
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => { state.iv = b.dataset.jump; $$('#ivchips .chip').forEach(c => c.classList.toggle('on', c.dataset.iv === state.iv)); render(); document.getElementById('rank').scrollIntoView({ behavior: 'smooth' }); }));

  /* ───── 전공 개념 ───── */
  (function concepts() {
    const groups = CATS.filter(c => c.concept);
    $('#conceptGroups').innerHTML = groups.map(c => {
      const qs = Q.filter(q => q.cat === c.k && !q.pred);
      return `<div class="cgroup"><h3>${c.k} <small>${qs.length}개</small></h3><div class="cgrid2">${qs.map(q => `<article class="concept" id="c-${q.id}"><h4>${esc(q.q)}<a href="#q-${q.id}" data-open="${q.id}">기출 ${q.n}곳</a></h4>${q.star ? `<div class="star-note">★ ${esc(q.star)}</div>` : ''}${q.def ? `<p><b>정의</b>${esc(q.def)}</p>` : ''}${q.fix ? `<p><b>해법</b>${esc(q.fix)}</p>` : ''}${q.link ? `<p class="lk"><b>한전 연결</b>${esc(q.link)}</p>` : ''}</article>`).join('')}</div></div>`;
    }).join('');
    $('#extra').innerHTML = EXTRA.map(x => `<div><span>${esc(x.g)}</span><b>${esc(x.n)}</b><p>${esc(x.d)}</p></div>`).join('');
  })();

  /* ───── 출처 ───── */
  (function sources() {
    const cnt = {}; Q.forEach(q => q.srcs.forEach(k => cnt[k] = (cnt[k] || 0) + 1));
    const order = { '공채': 0, '모음': 1, '인턴': 2, '계약직': 3 };
    const rows = [...SOURCES].sort((a, b) => order[a.type] - order[b.type] || (parseInt(b.yr) || 0) - (parseInt(a.yr) || 0));
    $('#srctable').innerHTML = `<thead><tr><th>시기</th><th>전형</th><th>직군</th><th>출처</th><th>메모</th><th class="n">가져온 유형</th></tr></thead><tbody>${rows.map(s => `<tr><td>${esc(s.yr)}</td><td>${esc(s.type)}</td><td>${esc(s.track)}</td><td><a href="${s.url}" target="_blank" rel="noopener">${esc(s.site)} · ${esc(s.title)}</a></td><td>${esc(s.note)}</td><td class="n">${cnt[s.k] || 0}</td></tr>`).join('')}</tbody>`;
    $('#refs').innerHTML = REFS.map(r => `<li><a href="${r.url}" target="_blank" rel="noopener">${esc(r.t)}</a></li>`).join('');
  })();

  /* ───── 연습 ───── */
  (function practice() {
    let cur = null, timer = null, left = 60, total = 60;
    const pools = {
      sa: () => Q.filter(q => !q.pred && q.n >= 3),
      all: () => Q.filter(q => !q.pred),
      e: () => Q.filter(q => !q.pred && q.iv !== '직무'),
      j: () => Q.filter(q => q.iv === '직무' || (q.pred && q.as === '직무')),
      pred: () => Q.filter(q => q.pred),
      undone: () => Q.filter(q => !done.has(q.id)),
    };
    const pick = () => {
      const pool = pools[$('#pool').value]();
      if (!pool.length) { $('#pq').textContent = '이 조건에는 질문이 없다.'; $('#pmeta').textContent = ''; return; }
      let q; do { q = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && cur && q.id === cur.id);
      cur = q;
      const vs = (q.v || []); const sample = vs.length ? vs[Math.floor(Math.random() * vs.length)][1] : '';
      $('#pq').textContent = q.q;
      $('#pmeta').innerHTML = `<em class="iv iv-${q.iv}">${q.iv}</em><span>${esc(q.cat)}</span>${q.pred ? '<span>예상 질문</span>' : `<span>후기 ${q.n}곳</span>`}${sample && sample !== q.q ? `<span>· 실제 문장: “${esc(sample)}”</span>` : ''}`;
      $('#ptipbox').hidden = true; stop(); reset();
    };
    const reset = () => { total = left = +$('#sec').value; $('#ptime').textContent = left; $('#pbar').style.width = '100%'; $('#pbar').classList.remove('warn'); };
    const stop = () => { clearInterval(timer); timer = null; $('#pstart').textContent = '타이머 시작'; };
    const start = () => {
      if (!cur) pick(); if (timer) { stop(); return; }
      $('#pstart').textContent = '멈춤';
      timer = setInterval(() => { left--; $('#ptime').textContent = Math.max(0, left); $('#pbar').style.width = (left / total * 100) + '%'; if (left <= 10) $('#pbar').classList.add('warn'); if (left <= 0) { stop(); $('#ptime').textContent = '끝'; } }, 1000);
    };
    $('#pnext').addEventListener('click', pick);
    $('#pstart').addEventListener('click', start);
    $('#sec').addEventListener('change', () => { stop(); reset(); });
    $('#ptip').addEventListener('click', () => {
      if (!cur) return; const b = $('#ptipbox'); b.hidden = !b.hidden; if (b.hidden) return;
      b.innerHTML = (cur.def ? `<div class="defbox"><b>정의</b>${esc(cur.def)}</div>` : '') + (cur.link ? `<div class="defbox link"><b>한전 연결</b>${esc(cur.link)}</div>` : '') + (cur.basis ? `<div><b>예상 근거</b> ${esc(cur.basis)}</div>` : '') + (cur.tip ? `<div style="margin-top:8px"><b>답변 포인트</b> ${esc(cur.tip)}</div>` : '') + `<div style="margin-top:10px"><a href="#q-${cur.id}" data-open="${cur.id}">순위표에서 보기 →</a></div>`;
    });
    reset();
  })();

  /* ───── 홈페이지 지도 ───── */
  (function sitemap() {
    const SITE = window.SITE, PTS = window.SITE_POINTS || {};
    const box = $('#sitemenus'); if (!SITE || !SITE.menus || !box) return;
    const nPages = SITE.menus.reduce((a, m) => a + m.pages.length, 0);
    const nFacts = SITE.menus.reduce((a, m) => a + m.pages.reduce((b, p) => b + (p.facts || []).length + (p.fine || []).length, 0), 0);
    $('#siteLead').textContent = `kepco.co.kr의 메뉴 페이지 ${nPages}개를 내려받아 정리했다(${SITE.fetched} 기준). 사실·수치·각주 ${nFacts}줄을 담았고, 메뉴마다 면접에서 쓸 포인트를 위에 두었다. 면접관은 "홈페이지 봤나"를 자주 확인한다.`;
    const hl = (t, kw) => { t = esc(t); if (!kw) return t; const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); return t.replace(re, m => `<mark>${m}</mark>`); };
    function render(kw) {
      kw = (kw || '').trim(); const k = kw.toLowerCase(); let shown = 0;
      box.innerHTML = SITE.menus.map(m => {
        const pages = m.pages.filter(p => !k || [p.title, p.what, ...(p.path || []), ...(p.facts || []), ...(p.fine || []), ...(p.links || [])].join(' ').toLowerCase().includes(k));
        if (!pages.length) return '';
        shown += pages.length;
        const pts = PTS[m.name];
        return `<details class="smenu"${k ? ' open' : ''}><summary>${esc(m.name)}<small>페이지 ${pages.length}${k ? ` / ${m.pages.length}` : ''}</small></summary>
          ${pts ? `<div class="spoints"><b>면접에서 쓸 포인트</b><ul>${pts.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
          ${pages.map(p => `<details class="spage"${k ? ' open' : ''}><summary><span class="crumb">${esc((p.path || []).slice(1).join(' › '))}</span><span class="ttl">${hl(p.title, kw)}</span><span class="nf">${(p.facts || []).length}줄</span></summary>
            <div class="sbody"><p class="what">${hl(p.what || '', kw)}</p>
            ${(p.facts || []).length ? `<h5>내용</h5><ul>${p.facts.map(f => `<li>${hl(f, kw)}</li>`).join('')}</ul>` : ''}
            ${(p.fine || []).length ? `<h5>작은 글씨 · 유의사항</h5><ul class="fine">${p.fine.map(f => `<li>${hl(f, kw)}</li>`).join('')}</ul>` : ''}
            ${(p.links || []).length ? `<h5>연결 사이트</h5><ul class="links">${p.links.map(f => `<li>${hl(f, kw)}</li>`).join('')}</ul>` : ''}
            <a class="url" href="https://www.kepco.co.kr${esc(p.url)}" target="_blank" rel="noopener">kepco.co.kr${esc(p.url)}</a></div></details>`).join('')}
        </details>`;
      }).join('') || `<p class="empty">검색 결과가 없다.</p>`;
      $('#scount').textContent = k ? `${shown}개 페이지에서 발견` : `${nPages}개 페이지`;
    }
    render('');
    let t; $('#sq').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => render(e.target.value), 120); });
  })();

  $('#upd').textContent = `자료 기준일 ${UPDATED}. 공고·일정은 2026 하반기 4직급 대졸수준 채용공고(요약 사이트)와 2025 하반기 공고 원문을 따랐다.`;
})();
