# AI 눈높이 블로그 마스터

대교 눈높이·써밋 교육 블로그 제작을 위한 GPT 지식/운영 규칙과 React/Vite 웹 UI를 함께 제공합니다.

## ⭐ GPT로 사용하는 것이 기본

GitHub 연결이 가능한 GPT에 이 저장소를 연결하고 `GPT_INSTRUCTIONS.md`를 기준으로 사용하세요. 별도의 Gemini API 키를 입력하지 않고도 GPT의 생성 기능으로 주제·제목·본문·이미지 프롬프트를 만들 수 있습니다.

**핵심 파일**
- `GPT_INSTRUCTIONS.md` — GPT 운영 규칙
- `src/constants.ts` — 제품 지식·연령별 상담 포인트·작성 규칙·이미지 스타일
- `START_HERE.md` — 빠른 시작
- `USER_MANUAL.md` — 상세 사용 매뉴얼

## 🌐 웹 화면

GitHub Pages 배포 주소:
https://jcm750510-afk.github.io/Daekyo-GG-blog-Master-V1/

웹 화면은 기존 React/Vite 구현을 유지합니다. 다만 브라우저에서 Gemini API를 직접 호출하는 방식은 API 키가 필요하며, 키를 저장소에 커밋해서는 안 됩니다. **키 없이 사용하는 GPT 연결 방식이 권장됩니다.**

## 🛠 로컬 개발

```bash
npm install
npm run dev
```

레거시 웹 생성 기능을 사용하려면 `.env.local`에 `GEMINI_API_KEY`를 설정해야 합니다. 이 값은 절대로 GitHub에 커밋하지 마세요.

## 🚀 배포

`main`에 push되면 `.github/workflows/deploy-pages.yml`이 Vite 앱을 빌드하여 GitHub Pages에 배포합니다.

## 콘텐츠 원칙

- 교육 정보 90 : 홍보 10
- A.E.A 3층 구조
- 학부모 공감 → 근거 있는 교육 정보 → 실천/상담 CTA
- 확인되지 않은 통계·정책·실적 창작 금지
- 실제 센터 정보가 없으면 임의의 주소·전화번호 생성 금지

## 원본 구현

기존 React/Vite 화면은 `src/App.tsx`, 제품 지식과 프롬프트 원본은 `src/constants.ts`에 있습니다.
