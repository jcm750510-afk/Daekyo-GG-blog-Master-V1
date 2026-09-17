import { useMemo, useState } from 'react';
import { Check, ChevronDown, Copy, FileText, KeyRound, Lightbulb, Loader2, Sparkles, Wand2 } from 'lucide-react';
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

const FALLBACK_TOPICS: Record<string, string[]> = {
  수학: ['개념은 아는데 문제를 틀리는 아이, 무엇을 점검해야 할까요?', '초등 수학 실수를 줄이는 가장 먼저 잡아야 할 학습습관', '학년이 올라갈수록 수학 격차가 벌어지는 이유와 준비 방법', '문장제 수학이 어려운 아이에게 필요한 읽기와 풀이 습관', '연산만 반복하기 전에 확인해야 할 초등 수학의 기본기', '수학 오답이 반복되는 아이, 틀린 문제보다 먼저 볼 것', '초등 수학 개념을 오래 기억하게 만드는 복습 방법', '수학을 어려워하기 전에 부모가 확인할 5가지 신호', '새 학년 수학을 편하게 시작하기 위한 방학 학습 체크리스트', '우리 아이에게 맞는 수학 학습량은 어떻게 정해야 할까요?'],
  국어: ['초등 문해력은 왜 학년이 올라갈수록 중요해질까요?', '책은 읽는데 내용을 설명하지 못하는 아이에게 필요한 연습', '초등 저학년 읽기 습관이 학습 전반에 미치는 영향', '어휘력이 부족한 아이, 문제집보다 먼저 확인할 것', '글의 중심 내용을 찾기 어려운 아이를 위한 5가지 연습', '읽은 내용을 자기 말로 설명하는 힘을 키우는 방법', '초등 국어 성적보다 먼저 봐야 할 읽기 습관', '학년별로 달라지는 국어 공부, 무엇을 준비해야 할까요?', '문해력 격차를 줄이는 가정의 짧은 독서 루틴', '새 학년 교과서를 잘 이해하기 위한 국어 기본기'],
};

const defaultFallback = ['우리 아이에게 필요한 학습 습관, 학년별로 무엇이 다를까요?', '학부모가 자주 놓치는 초등 학습의 핵심 포인트 5가지', '학년이 올라가기 전에 점검해야 할 우리 아이의 학습 기본기', '공부를 시키기 전에 먼저 확인해야 할 학습 신호', '아이의 학습 격차를 줄이기 위해 가정에서 할 수 있는 작은 실천', '새 학년을 편하게 시작하는 효과적인 학습 준비법', '학부모가 궁금해하는 우리 아이 맞춤 학습의 기준', '공부량보다 중요한 초등 학습 습관은 무엇일까요?', '아이의 현재 학습 수준을 점검하는 부모 체크리스트', '꾸준히 공부하는 힘을 만드는 일상 속 학습 루틴'];

async function generateWithGemini(apiKey: string, form: FormData): Promise<string[]> {
  const season = currentSeason();
  const hints = SUBJECT_HINTS[form.subject] || SUBJECT_HINTS.기타;
  const prompt = `당신은 대교 눈높이 교육 콘텐츠 전략가입니다. 네이버 블로그용 교육 콘텐츠 주제를 기획하세요.

[입력]
- 학습자: ${form.reader}
- 과목/학습영역: ${form.subject}
- 추천 제품: ${form.product || '미정'}
- 지역/센터: ${form.region || '미정'}
- 포스팅 유형: ${form.postType}
- 계절/시기: ${season}
- 원장 요청사항: ${form.directorRequest || '없음'}

[주제 방향 힌트]
${hints.join(', ')}

[대교 지식 기준]
${KNOWLEDGE_BASE}

[생성 규칙]
1. 서로 겹치지 않는 블로그 주제 10개를 생성하세요.
2. 단순히 단어만 바꾼 유사 주제를 만들지 마세요.
3. 학부모가 실제 검색하거나 궁금해할 질문·문제에서 출발하세요.
4. 교육 정보성이 중심이 되어야 하며 광고성 표현은 최소화하세요.
5. 학년, 과목, 계절/시기를 자연스럽게 반영하세요.
6. 제품명을 모든 주제에 억지로 넣지 마세요.
7. 너무 일반적인 '공부 잘하는 법' 같은 주제는 피하세요.
8. 제목처럼 바로 사용할 수 있는 자연스러운 한국어 문장으로 작성하세요.
9. 결과는 반드시 JSON 배열 하나만 반환하세요. 설명, 마크다운, 번호를 붙이지 마세요.
예: ["주제1","주제2","주제3","주제4","주제5","주제6","주제7","주제8","주제9","주제10"]`;

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey.trim(),
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 1.05, responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini API 오류 (${response.status}): ${body.slice(0, 240)}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || '').join('') || '';
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error('AI 응답 형식이 올바르지 않습니다.');
  const topics = parsed.map((x) => String(x).trim()).filter(Boolean).slice(0, 10);
  if (topics.length < 10) throw new Error('AI가 10개의 주제를 완성하지 못했습니다. 다시 시도해주세요.');
  return topics;
}

function fallbackTopics(form: FormData): string[] {
  const base = FALLBACK_TOPICS[form.subject] || defaultFallback;
  const hints = SUBJECT_HINTS[form.subject] || SUBJECT_HINTS.기타;
  const seed = `${form.reader}|${form.subject}|${form.product}|${currentSeason()}|${Date.now()}`;
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const rotated = [...base, ...hints.map((h) => `${form.reader} ${form.subject}에서 ${h}를 키우는 현실적인 학습 방법`), ...defaultFallback];
  return rotated.map((_, i) => rotated[(i + (hash % rotated.length)) % rotated.length]).filter((v, i, a) => a.indexOf(v) === i).slice(0, 10);
}

function makePrompt(f: FormData, title: string) {
  const guide = IMAGE_STYLES[f.imageStyle as keyof typeof IMAGE_STYLES] || '';
  return `# GPT용 눈높이 블로그 프롬프트 마스터 V2\n\n당신은 20년 경력의 교육 콘텐츠·학부모 커뮤니케이션·블로그 SEO 전문가입니다. 아래 정보를 바탕으로 네이버 블로그에 바로 활용할 수 있는 완성도 높은 글을 작성하세요.\n\n## 입력 정보\n- 타겟 독자: ${f.reader}\n- 과목/학습영역: ${f.subject}\n- 추천 제품: ${f.product}\n- 핵심 주제: ${f.topic}\n- 지역/러닝센터명: ${f.region}\n- 포스팅 유형: ${f.postType}\n- 이미지 스타일: ${f.imageStyle}\n- 원장님 요청사항: ${f.directorRequest || '특별 요청 없음'}\n- 계절/시기: ${currentSeason()}\n- 확정 제목/주제: ${title}\n\n## 작성 원칙\n1. 교육 정보 90%, 센터/제품 소개 10%의 비율을 지킵니다.\n2. A.E.A 구조(공감·권위 → 근거·설명 → 행동·실천)로 구성합니다.\n3. 학부모가 실제로 검색할 만한 질문과 고민에서 시작합니다.\n4. 과장·허위 성과·확인되지 않은 수치·교육학적 단정은 만들지 않습니다.\n5. 제품 홍보가 본문을 압도하지 않도록 자연스럽게 연결합니다.\n6. 소제목과 **굵은 핵심문장**, 짧은 문단을 사용합니다.\n7. 마지막에는 ${f.region} 학부모가 부담 없이 상담을 생각해 볼 수 있는 자연스러운 CTA를 넣습니다.\n\n## 이미지 프롬프트\n본문 흐름상 필요한 위치에 1~2개의 [인포그래픽 프롬프트: ...]를 삽입하세요. 스타일 가이드: ${guide}\n\n## 출력 형식\n# [블로그 제목 : ${title}]\n\n도입부 → 핵심 교육정보 → 실천방법/체크포인트 → 제품과의 자연스러운 연결 → 지역센터 CTA → 해시태그 순서로 작성합니다. 마지막 줄에는 검색용 해시태그 8~12개를 제안하세요.`;
}

export default function App() {
  const [f, setF] = useState<FormData>({ reader: '초1', subject: '수학', product: '', topic: '', region: '', postType: '정보전달형', imageStyle: styles[0], directorRequest: '' });
  const [titles, setTitles] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const topicSeeds = useMemo(() => SUBJECT_HINTS[f.subject] || SUBJECT_HINTS.기타, [f.subject]);

  const generate = async () => {
    if (!f.subject) { alert('과목/학습영역을 선택해주세요.'); return; }
    setLoading(true);
    setMessage('');
    setSelected('');
    setCopied(false);
    try {
      let topics: string[];
      if (apiKey.trim()) {
        topics = await generateWithGemini(apiKey, f);
        setMessage('✨ Gemini AI가 입력 조건을 분석해 새로운 주제 10개를 생성했습니다.');
      } else {
        topics = fallbackTopics(f);
        setMessage('💡 API 키가 없어 기본 추천 모드로 생성했습니다. AI 모드를 사용하려면 아래 Gemini API 키를 입력하세요.');
      }
      setTitles(topics);
    } catch (error) {
      console.error(error);
      setTitles(fallbackTopics(f));
      setMessage(`AI 생성에 실패해 기본 추천 10개로 전환했습니다. ${error instanceof Error ? error.message : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const chooseTopic = (topic: string) => {
    setSelected(topic);
    setF((prev) => ({ ...prev, topic }));
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3"><Sparkles className="text-teal-600"/><h1 className="text-3xl font-bold">GPT용 눈높이 블로그 프롬프트 마스터 V2</h1></div>
          <p className="mt-2 text-slate-500">과목 선택 → AI 주제 10개 추천 → 주제 선택 → GPT용 완성 프롬프트 생성</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-5">
            <h2 className="font-bold text-lg flex items-center gap-2"><Wand2 className="w-5 h-5 text-teal-600"/>STEP 1. 정보 입력</h2>
            <label className="block text-sm font-semibold">글의 독자<select value={f.reader} onChange={e=>setF({...f,reader:e.target.value})} className="mt-2 w-full rounded-lg border p-3">{readers.map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="block text-sm font-semibold">과목 / 학습영역<select value={f.subject} onChange={e=>{setF({...f,subject:e.target.value,topic:''});setTitles([])}} className="mt-2 w-full rounded-lg border p-3">{subjects.map(x=><option key={x}>{x}</option>)}</select></label>
            <div className="rounded-xl bg-teal-50 border border-teal-100 p-4 text-sm"><div className="font-bold text-teal-800 mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4"/>추천 방향</div><div className="text-teal-700 leading-6">{topicSeeds.join(' · ')}</div></div>
            <label className="block text-sm font-semibold">추천 제품<input value={f.product} onChange={e=>setF({...f,product:e.target.value})} placeholder="예: 눈높이 사고력수학, 써밋 국어" className="mt-2 w-full rounded-lg border p-3"/></label>
            <label className="block text-sm font-semibold">포스팅 주제<input value={f.topic} onChange={e=>setF({...f,topic:e.target.value})} placeholder="AI 추천 주제를 선택하면 자동 입력됩니다" className="mt-2 w-full rounded-lg border p-3"/></label>
            <label className="block text-sm font-semibold">지역 / 러닝센터명<input value={f.region} onChange={e=>setF({...f,region:e.target.value})} placeholder="예: 광교동 신풍러닝센터" className="mt-2 w-full rounded-lg border p-3"/></label>
            <label className="block text-sm font-semibold">포스팅 유형<select value={f.postType} onChange={e=>setF({...f,postType:e.target.value})} className="mt-2 w-full rounded-lg border p-3"><option>정보전달형</option><option>학원 홍보형</option><option>학습 후기형</option><option>제품소개형</option></select></label>
            <label className="block text-sm font-semibold">이미지 스타일<select value={f.imageStyle} onChange={e=>setF({...f,imageStyle:e.target.value})} className="mt-2 w-full rounded-lg border p-3">{styles.map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="block text-sm font-semibold">원장님 요청사항<textarea value={f.directorRequest} onChange={e=>setF({...f,directorRequest:e.target.value})} rows={3} placeholder="강조할 내용, 사례, 행사 등을 입력" className="mt-2 w-full rounded-lg border p-3 resize-none"/></label>

            <div className="rounded-xl border bg-slate-50 p-4">
              <button type="button" onClick={()=>setShowApiKey(!showApiKey)} className="w-full flex items-center justify-between text-sm font-bold"><span className="flex items-center gap-2"><KeyRound className="w-4 h-4"/> Gemini AI 설정</span><ChevronDown className={`w-4 h-4 transition ${showApiKey?'rotate-180':''}`}/></button>
              {showApiKey && <div className="mt-3 space-y-2"><input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="Gemini API Key를 입력하세요" className="w-full rounded-lg border p-3 text-sm" autoComplete="off"/><p className="text-xs text-slate-500 leading-5">키는 이 화면에서만 사용하며 저장하지 않습니다. 공개 웹앱에 API 키를 코드로 넣으면 노출될 수 있으므로 키를 GitHub에 올리지 않습니다.</p></div>}
            </div>

            <button onClick={generate} disabled={loading} className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-4 flex justify-center gap-2 items-center">{loading?<><Loader2 className="animate-spin"/>AI 주제 10개 생성 중...</>:<><Wand2/>AI 주제 10개 추천하기</>}</button>
            {message && <p className="text-xs text-slate-500 leading-5 bg-slate-50 rounded-lg p-3">{message}</p>}
          </section>

          <section className="lg:col-span-2 space-y-6">
            {titles.length===0 ? <div className="bg-white rounded-2xl border p-10 text-center text-slate-400 min-h-[500px] flex flex-col items-center justify-center"><FileText className="w-14 h-14 mb-4"/><h2 className="text-xl font-bold text-slate-600">AI가 추천한 주제가 여기에 표시됩니다</h2><p className="mt-2">과목과 학년을 선택하고 버튼을 눌러주세요.</p></div> : <>
              <div className="bg-white rounded-2xl border p-6 shadow-sm"><div className="flex items-center justify-between mb-4"><h2 className="font-bold text-lg">STEP 2. 추천 주제 10개</h2><span className="text-xs text-slate-400">{apiKey.trim() ? 'Gemini AI 생성' : '기본 추천'}</span></div><div className="space-y-3">{titles.map((t,i)=><button key={`${t}-${i}`} onClick={()=>chooseTopic(t)} className={`w-full text-left p-4 rounded-xl border transition ${selected===t?'border-teal-500 bg-teal-50':'hover:border-teal-300'}`}><b className="text-teal-600 mr-2">{i+1}.</b>{t}</button>)}</div></div>
              {selected && <div className="bg-white rounded-2xl border p-6 shadow-sm"><div className="flex justify-between items-center mb-4"><div><h2 className="font-bold text-lg">STEP 3. GPT용 완성 프롬프트</h2><p className="text-xs text-slate-400 mt-1">선택한 주제가 자동으로 핵심 주제에 반영되었습니다.</p></div><button onClick={()=>copy(makePrompt(f,selected))} className="px-4 py-2 rounded-lg border text-sm font-bold flex gap-2 items-center">{copied?<Check className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}{copied?'복사 완료':'프롬프트 복사'}</button></div><textarea readOnly value={makePrompt(f,selected)} className="w-full min-h-[520px] rounded-xl border bg-slate-50 p-5 text-sm leading-7 font-mono"/></div>}
            </>}
          </section>
        </div>
        <footer className="mt-8 text-center text-xs text-slate-400">V2 · Gemini AI 주제 추천 + GPT용 프롬프트 생성 · AI 모드는 사용자의 Gemini API Key로 직접 호출</footer>
      </div>
    </div>
  );
}
