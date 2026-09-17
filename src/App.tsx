import { useMemo, useState, type ReactNode } from 'react';
import { Check, ChevronDown, ClipboardPaste, Copy, ExternalLink, FileText, Lightbulb, Sparkles, Wand2 } from 'lucide-react';
import { IMAGE_STYLES, KNOWLEDGE_BASE } from './constants';

type FormData = {
  reader: string;
  subject: string;
  product: string;
  topic: string;
  region: string;
  postType: string;
  imageStyle: string;
  directorRequest: string;
};

const readers = ['영유아(3~4세)', '유아(5,6세)', '예비초(7세)', '초1', '초2', '초3', '초4', '초5', '초6', '중1', '중2', '중3', '고1', '시니어'];
const subjects = ['수학', '국어', '영어', '창의독서·문해력', '한자', '사회', '과학', '어휘력', '학습습관', '기타'];
const postTypes = ['정보형', '문제해결형', '체크리스트형', '학부모 공감형', '학습법·실천형', '지역·센터 소개형'];
const styles = Object.keys(IMAGE_STYLES);

const SUBJECT_HINTS: Record<string, string[]> = {
  수학: ['연산 정확도와 속도', '개념 이해와 오개념', '문제해결력', '문장제와 서술형', '수학 학습습관', '학년 전환기 준비'],
  국어: ['문해력', '어휘력', '읽기 유창성', '중심 내용 파악', '글쓰기와 표현력', '독해 습관'],
  영어: ['파닉스와 기초 읽기', '어휘력', '듣기와 말하기', '문장 이해', '영어 학습습관', '학교 영어 대비'],
  '창의독서·문해력': ['배경지식', '비판적 사고', '요약하기', '질문하는 독서', '독서 습관', '교과 연계 독서'],
  한자: ['교과 어휘', '한자어 이해', '어휘 확장', '학습 격차 예방', '문해력과 한자', '중등 대비'],
  사회: ['사회 개념 이해', '자료해석력', '시사 이해', '교과 어휘', '탐구·정리 습관', '중등 사회 대비'],
  과학: ['과학 개념', '실험과 탐구', '관찰·추론', '과학 어휘', '설명하는 힘', '중등 과학 대비'],
  어휘력: ['교과 어휘', '메타인지', '어휘 확장', '문맥 속 의미', '전과목 학습어휘', '어휘 학습습관'],
  학습습관: ['공부 루틴', '자기주도성', '집중력', '오답 관리', '복습 습관', '학습 동기'],
  기타: ['학부모 고민', '학습 격차', '학습 습관', '교과 연계', '신학기 준비', '가정 학습'],
};

function currentSeason() {
  const month = new Date().getMonth() + 1;
  if (month <= 2) return '겨울방학·신학기 준비';
  if (month <= 4) return '신학기 적응·1학기 초반';
  if (month <= 6) return '1학기 학습 점검·여름방학 준비';
  if (month <= 8) return '여름방학·2학기 준비';
  if (month <= 10) return '2학기 학습 점검·다음 학년 준비';
  return '연말 학습 점검·겨울방학 준비';
}

const DEFAULT_FORM: FormData = {
  reader: '초3',
  subject: '수학',
  product: '눈높이수학',
  topic: '',
  region: '',
  postType: '정보형',
  imageStyle: styles[0] || '',
  directorRequest: '',
};

function makeTopicPrompt(f: FormData) {
  const hints = SUBJECT_HINTS[f.subject] || SUBJECT_HINTS.기타;
  return `# GPT용 눈높이 블로그 주제 추천 프롬프트 V2

당신은 대교 눈높이의 교육 콘텐츠 전략가이자 네이버 블로그 SEO 기획자입니다. 아래 조건을 분석하여 학부모가 실제로 검색하거나 궁금해할 만한 블로그 주제 10개를 제안하세요.

## 입력 정보
- 타겟 독자: ${f.reader}
- 과목/학습영역: ${f.subject}
- 추천 제품: ${f.product || '미정'}
- 지역/러닝센터명: ${f.region || '미정'}
- 포스팅 유형: ${f.postType}
- 현재 시기: ${currentSeason()}
- 원장님 요청사항: ${f.directorRequest || '특별 요청 없음'}
- 주제 방향 힌트: ${hints.join(', ')}

## 눈높이 콘텐츠 기준
${KNOWLEDGE_BASE}

## 반드시 지킬 규칙
1. 서로 명확히 다른 주제 10개를 만드세요. 단어만 바꾼 유사 주제는 제외합니다.
2. '공부 잘하는 법', '수학 잘하는 법'처럼 지나치게 일반적인 주제는 제외합니다.
3. 학부모의 실제 고민·검색 의도·아이에게 나타나는 구체적인 상황에서 출발합니다.
4. 교육 정보 90%, 제품/센터 소개 10%의 방향을 고려하되 모든 주제에 제품명을 억지로 넣지 않습니다.
5. ${f.reader}의 발달·학습 특성과 ${f.subject}의 핵심 학습요소를 자연스럽게 반영합니다.
6. ${currentSeason()}이라는 시기성을 적절히 반영합니다.
7. 네이버 블로그 제목으로 바로 사용할 수 있는 자연스러운 한국어로 작성합니다.
8. 검색 키워드만 나열하지 말고 '부모가 클릭할 이유'가 드러나게 만듭니다.
9. 서로 다른 관점(문제 원인, 체크리스트, 실천법, 오개념, 학습습관, 학년 전환 등)을 섞어 다양하게 구성합니다.
10. 확인되지 않은 통계나 과장된 교육 효과를 전제로 한 주제는 만들지 않습니다.

## 출력 형식
아래 형식으로 정확히 10줄만 출력하세요. 번호는 붙여도 됩니다.
1. 주제
2. 주제
...
10. 주제

설명이나 서론·결론은 쓰지 마세요.`;
}

function parseTopics(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((x) => x.trim()).filter(Boolean).slice(0, 10);
    }
  } catch {
    // Continue with line-based parsing.
  }
  return trimmed
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+\s*[.)]|[-*•])\s*/, '').replace(/^['"“”]+|['"“”]+$/g, '').trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, 10);
}

function makePrompt(f: FormData, title: string) {
  const guide = IMAGE_STYLES[f.imageStyle as keyof typeof IMAGE_STYLES] || '';
  return `# GPT용 눈높이 블로그 프롬프트 마스터 V2

당신은 20년 경력의 교육 콘텐츠·학부모 커뮤니케이션·네이버 블로그 SEO 전문가입니다. 아래 정보를 바탕으로 네이버 블로그에 바로 활용할 수 있는 완성도 높은 글을 작성하세요.

## 입력 정보
- 타겟 독자: ${f.reader}
- 과목/학습영역: ${f.subject}
- 추천 제품: ${f.product || '미정'}
- 핵심 주제: ${f.topic || title}
- 지역/러닝센터명: ${f.region || '미정'}
- 포스팅 유형: ${f.postType}
- 이미지 스타일: ${f.imageStyle}
- 원장님 요청사항: ${f.directorRequest || '특별 요청 없음'}
- 계절/시기: ${currentSeason()}
- 확정 제목/주제: ${title}

## 작성 원칙
1. 교육 정보 90%, 센터/제품 소개 10%의 비율을 지킵니다.
2. A.E.A 구조(공감·권위 → 근거·설명 → 행동·실천)로 구성합니다.
3. 학부모가 실제로 검색할 만한 질문과 고민에서 시작합니다.
4. 과장·허위 성과·확인되지 않은 수치·교육학적 단정은 만들지 않습니다.
5. 제품 홍보가 본문을 압도하지 않도록 자연스럽게 연결합니다.
6. 소제목과 굵은 핵심문장, 짧은 문단을 사용합니다.
7. 마지막에는 ${f.region || '해당 지역'} 학부모가 부담 없이 상담을 생각해 볼 수 있는 자연스러운 CTA를 넣습니다.

## 이미지 제작 가이드
${guide}
본문의 주요 소제목에 맞춰 필요한 이미지 콘셉트와 이미지 생성 프롬프트도 함께 제안하세요.

## 결과물
1. SEO를 고려한 제목 후보 3개
2. 선택한 핵심 주제로 완성된 블로그 본문
3. 소제목별 핵심 포인트
4. 이미지 생성 프롬프트
5. 자연스러운 상담 CTA
6. 네이버 블로그용 해시태그 10~15개

문체는 전문적이지만 학부모가 편하게 읽을 수 있도록 쉽고 따뜻하게 작성하세요.`;
}

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export default function App() {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [step, setStep] = useState(1);
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [openGuide, setOpenGuide] = useState(false);

  const topicPrompt = useMemo(() => makeTopicPrompt(form), [form]);
  const finalPrompt = useMemo(() => makePrompt(form, form.topic || '선택한 주제'), [form]);

  const update = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleCopy = async (text: string, key: string) => {
    await copyText(text);
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1600);
  };

  const handleParse = () => {
    const parsed = parseTopics(topicInput);
    setTopics(parsed);
    if (parsed[0] && !form.topic) update('topic', parsed[0]);
  };

  const openChatGPT = () => {
    window.open(`https://chatgpt.com/?q=${encodeURIComponent(topicPrompt)}`, '_blank', 'noopener,noreferrer');
  };

  const chooseTopic = (topic: string) => {
    update('topic', topic);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white"><Sparkles size={22} /></div>
            <div>
              <h1 className="text-xl font-bold">GPT용 눈높이 블로그 프롬프트 마스터 V2</h1>
              <p className="mt-1 text-sm text-slate-500">GitHub Pages에서 입력 → GPT 주제 추천 → 최종 블로그 프롬프트 생성</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-7 grid gap-3 md:grid-cols-3">
          {[
            ['01', '콘텐츠 조건 입력', '학년·과목·제품·지역 등'],
            ['02', 'GPT로 주제 10개 추천', '프롬프트를 GPT에 전달'],
            ['03', '완성 프롬프트 생성', '선택 주제로 글 작성'],
          ].map(([num, title, desc], index) => (
            <button key={num} onClick={() => setStep(index + 1)} className={`rounded-2xl border p-4 text-left transition ${step === index + 1 ? 'border-slate-900 bg-white shadow-sm' : 'border-slate-200 bg-white/70'}`}>
              <div className="text-xs font-bold text-slate-400">{num}</div>
              <div className="mt-1 font-semibold">{title}</div>
              <div className="mt-1 text-xs text-slate-500">{desc}</div>
            </button>
          ))}
        </div>

        {step === 1 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <Wand2 className="text-slate-700" size={22} />
              <div><h2 className="text-lg font-bold">STEP 1. 블로그 기본 조건</h2><p className="text-sm text-slate-500">입력값이 GPT 주제 추천과 최종 글쓰기 프롬프트에 함께 반영됩니다.</p></div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="타겟 독자"><select value={form.reader} onChange={(e) => update('reader', e.target.value)}>{readers.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="과목 / 학습영역"><select value={form.subject} onChange={(e) => update('subject', e.target.value)}>{subjects.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="추천 제품"><input value={form.product} onChange={(e) => update('product', e.target.value)} placeholder="예: 눈높이수학" /></Field>
              <Field label="지역 / 러닝센터명"><input value={form.region} onChange={(e) => update('region', e.target.value)} placeholder="예: 수원 영통 러닝센터" /></Field>
              <Field label="포스팅 유형"><select value={form.postType} onChange={(e) => update('postType', e.target.value)}>{postTypes.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="이미지 스타일"><select value={form.imageStyle} onChange={(e) => update('imageStyle', e.target.value)}>{styles.map((x) => <option key={x}>{x}</option>)}</select></Field>
              <div className="md:col-span-2"><Field label="원장님 요청사항"><textarea value={form.directorRequest} onChange={(e) => update('directorRequest', e.target.value)} placeholder="예: 초3 학부모가 바로 공감할 수 있게, 상담 유도는 과하지 않게" rows={4} /></Field></div>
            </div>
            <div className="mt-7 flex justify-end"><button onClick={() => setStep(2)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">GPT 주제 추천으로 이동 <Wand2 size={17} /></button></div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex gap-3"><Lightbulb className="mt-1" size={22} /><div><h2 className="text-lg font-bold">STEP 2. GPT로 주제 10개 추천받기</h2><p className="mt-1 text-sm text-slate-500">Gemini API 키나 별도 AI 서버 없이, GPT가 주제 기획을 담당하도록 설계했습니다.</p></div></div>
                <button onClick={() => setOpenGuide((v) => !v)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><ChevronDown size={15} className={openGuide ? 'rotate-180' : ''} /> 사용방법</button>
              </div>
              {openGuide && <div className="mb-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">① 아래 프롬프트를 복사하거나 ChatGPT를 엽니다. → ② GPT가 10개 주제를 생성합니다. → ③ 결과 10줄을 아래 입력창에 붙여넣습니다. → ④ 주제를 클릭하면 STEP 3에서 최종 글쓰기 프롬프트가 완성됩니다.</div>}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 text-xs font-bold text-slate-500">GPT 주제 추천 프롬프트 미리보기</div>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-sm leading-6 text-slate-700">{topicPrompt}</pre>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => handleCopy(topicPrompt, 'topic')} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">{copied === 'topic' ? <Check size={16} /> : <Copy size={16} />} {copied === 'topic' ? '복사 완료' : 'GPT 프롬프트 복사'}</button>
                <button onClick={openChatGPT} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"><ExternalLink size={16} /> ChatGPT 열기</button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3"><ClipboardPaste size={21} /><div><h3 className="font-bold">GPT가 만든 주제 10개 붙여넣기</h3><p className="text-sm text-slate-500">번호가 붙은 10줄 또는 JSON 배열을 그대로 붙여넣어도 됩니다.</p></div></div>
              <textarea value={topicInput} onChange={(e) => setTopicInput(e.target.value)} rows={9} placeholder={'예)\n1. 초3 수학, 개념은 아는데 자꾸 틀리는 아이가 놓치기 쉬운 것\n2. ...\n10. ...'} />
              <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-slate-400">현재 {parseTopics(topicInput).length}개 인식</span><button onClick={handleParse} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">주제 목록 만들기</button></div>
            </div>

            {topics.length > 0 && <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><h3 className="font-bold">추천 주제 {topics.length}개</h3><span className="text-xs text-slate-400">클릭하면 선택됩니다</span></div><div className="grid gap-3">{topics.map((topic, index) => <button key={`${topic}-${index}`} onClick={() => chooseTopic(topic)} className="flex gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-900 hover:bg-slate-50"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{index + 1}</span><span className="text-sm font-medium leading-6">{topic}</span></button>)}</div></div>}
            <div className="flex justify-between"><button onClick={() => setStep(1)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">이전</button><button disabled={!form.topic} onClick={() => setStep(3)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">선택 주제로 최종 프롬프트 만들기</button></div>
          </section>
        )}

        {step === 3 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4"><div className="flex gap-3"><FileText className="mt-1" size={22} /><div><h2 className="text-lg font-bold">STEP 3. GPT 블로그 작성 프롬프트</h2><p className="mt-1 text-sm text-slate-500">선택한 주제와 입력 조건을 반영한 최종 프롬프트입니다.</p></div></div><button onClick={() => handleCopy(finalPrompt, 'final')} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">{copied === 'final' ? <Check size={16} /> : <Copy size={16} />} {copied === 'final' ? '복사 완료' : '프롬프트 복사'}</button></div>
            <div className="mb-5 rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">선택한 주제</div><div className="mt-1 font-semibold">{form.topic || '아직 주제를 선택하지 않았습니다.'}</div></div>
            <pre className="max-h-[620px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7">{finalPrompt}</pre>
            <div className="mt-5 flex flex-wrap justify-between gap-3"><button onClick={() => setStep(2)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">주제 다시 선택</button><button onClick={() => handleCopy(finalPrompt, 'final2')} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">{copied === 'final2' ? <Check size={16} /> : <Copy size={16} />} GPT에 붙여넣기</button></div>
          </section>
        )}
      </main>

      <footer className="border-t bg-white py-7 text-center text-xs text-slate-400">GPT용 눈높이 블로그 프롬프트 마스터 V2 · GitHub Pages 정적 웹앱 · AI API 키 미사용</footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>;
}
