# 한전 사무 면접 노트

한국전력공사 사무직(경북 지역전문사원) 직무면접·경험면접 준비 사이트.
정적 사이트이고 빌드 없이 `index.html`을 열면 동작한다.

배포: https://ayun-jeong.github.io/kepco-interview/

## 구조

| 파일 | 역할 |
|---|---|
| `index.html` | 섹션 뼈대와 고정 본문(면접 구조, 이슈, 회사 기본, 경북, 하는 일, 자소서, 조언) |
| `styles.css` | 스타일. 라이트·다크 자동 |
| `app.js` | 집계·렌더링. 빈출 순위, 필터, 준비 체크(localStorage), 연습 타이머, 홈페이지 지도 |
| `data/sources.js` | `SOURCES`(질문을 가져온 후기 목록), `REFS`(구조·이슈 근거 자료) |
| `data/questions.js` | `CATS`(질문 유형), `QUESTIONS`(질문 묶음), `EXTRA`(보충 개념) |
| `data/site.js` | 한전 홈페이지 페이지별 정리(`SITE`). 크롤링 결과를 합쳐 생성 |
| `data/site-points.js` | 메뉴별 면접 포인트(`SITE_POINTS`) |
| `data/me.js` | 경험 카드 13개(`ME.exps`, 자소서에 쓴 경험은 `essay: '자소서 n번'`), 30초·1분 자기소개, 경북 지원동기 |
| `data/essay.js` | 제출한 자소서(2026.10.29) 원문 `ESSAY.items[].text`, 화면에 표시할 구절 `hooks`, 꼬리질문 `qs`(→ `ESSAY_FOLLOWUPS`, id `ef{문항}_{순서}`), 숫자 대조표 `nums` |
| `data/answers_1~7.js` | 질문별 답변 `{s 말할 답변, k 한전 연결, e 내 경험 키, f 꼬리질문 대비}`. 자소서 꼬리질문 30개는 `answers_7.js` |

## 데이터 규칙

- 질문 묶음 하나 = `{ id, cat, q, v: [[출처키, 실제 질문 문장], ...], tip, def?, fix?, link?, star? }`.
- **빈출 횟수는 서로 다른 출처 수**다. 같은 후기 안에서 여러 번 나와도 1로 센다. 등급은 S(5곳 이상)·A(3~4)·B(2)·C(1).
- 예상 질문은 `pred: true`, `basis`(근거), `as`(직무/경험 중 어디서 나올지)를 둔다. 순위표 맨 아래에 붙고 빈출 집계에서 빠진다.
- `cat`은 `CATS`의 `k`와 정확히 같아야 한다. `concept: true`인 유형만 "전공 개념" 섹션에 카드로 나온다.
- 출처 추가는 `SOURCES`에 `{k, yr, type(공채|인턴|계약직|모음), track(사무|기술), site, title, url, note}` 한 줄.

## 홈페이지 지도 갱신

1. 한전 사이트 페이지를 내려받아 텍스트로 추출한다(nav의 `/home/**/*.do` 전부).
2. 메뉴별 JSON(`{menu, pages:[{url, path, title, what, facts, fine, links}]}`)으로 정리한다.
3. 합쳐서 `data/site.js`에 `window.SITE={fetched, menus:[{name, pages}]}`로 쓴다. `path[0]`이 메뉴 이름이 된다.

## 검증

```sh
node --check app.js
```
질문 데이터 참조 무결성(출처키·유형명)은 `app.js`가 로드 시 `Map` 조회로 쓰므로, 새 항목을 넣은 뒤 브라우저 콘솔에 오류가 없는지 본다.
