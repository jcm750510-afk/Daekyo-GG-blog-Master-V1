import { useEffect, useMemo, useState, type ReactNode } from 'react';
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
  reader: '초3', subject: '수학', product: '눈높이수학', topic: '', region: '', postType: '정보형', imageStyle: styles[0] || '', directorRequest: '',
};

function makeTopicPrompt(f: FormData) {
  const hints = SUBJECT_HINTS[f.subject] || SUBJECT_HINTS.기타;
  return `# GPT용 눈높이 블로그 마스터 V3 · 5가지 추천주제 생성\n\n당신은 대교 눈높이 교육 콘텐츠 전략가이자 네이버 블로그 기획자입니다. 입력 조건을 분석해 학부모가 실제로 검색하고 클릭할 가능성이 높은 '블로그 주제' 5개만 추천하세요.\n\n## 입력 조건\n- 타겟 독자: ${f.reader}\n- 과목/학습영역: ${f.subject}\n- 추천 제품: ${f.product || '미정'}\n- 지역/러닝센터명: ${f.region || '미정'}\n- 포스팅 유형: ${f.postType}\n- 현재 시기: ${currentSeason()}\n- 원장님 요청사항: ${f.directorRequest || '특별 요청 없음'}\n- 주제 방향 힌트: ${hints.join(', ')}\n\n## 눈높이 콘텐츠 기준\n${KNOWLEDGE_BASE}\n\n## 주제 생성 규칙\n1. 정확히 5개만 제안하세요.\n2. 단어만 바꾼 유사 주제는 금지하고 서로 관점이 달라야 합니다.\n3. '공부 잘하는 법'처럼 넓고 추상적인 주제는 제외하세요.\n4. 학부모가 실제 생활에서 겪는 구체적인 장면·질문·실수에서 출발하세요.\n5. ${f.reader}의 발달 특성과 ${f.subject}의 핵심 학습요소를 자연스럽게 반영하세요.\n6. 제품명이나 센터명을 모든 주제에 억지로 넣지 마세요. 교육 정보가 중심이어야 합니다.\n7. 계절성과 학교 학습 흐름을 반영하세요.\n8. 확인되지 않은 통계, 과장된 효과, 자극적인 공포 표현을 만들지 마세요.\n9. 검색 키워드 나열보다 '왜 읽어야 하는지'가 드러나는 구체적인 주제로 만드세요.\n10. 주제는 이후 후킹 제목을 만들기 좋은 형태로 작성하세요.\n\n## 출력 형식\n번호를 포함한 5줄만 출력하세요. 각 줄에는 주제 하나만 작성하세요. 설명·서론·결론은 쓰지 마세요.`;
}

function makeTitlePrompt(f: FormData, topic: string) {
  return `# GPT용 눈높이 블로그 마스터 V3 · 후킹 제목 5가지 생성\n\n당신은 네이버 블로그 SEO와 학부모 커뮤니케이션을 전문으로 하는 교육 콘텐츠 기획자입니다. 아래 '확정 주제'를 바탕으로 정보성이 먼저 느껴지면서도 클릭 이유가 분명한 제목 5개를 만들어 주세요.\n\n## 조건\n- 타겟: ${f.reader}\n- 과목: ${f.subject}\n- 포스팅 유형: ${f.postType}\n- 지역/센터: ${f.region || '미정'}\n- 확정 주제: ${topic}\n- 원장님 요청사항: ${f.directorRequest || '특별 요청 없음'}\n\n## 제목 규칙\n1. 정확히 5개만 만드세요.\n2. 제목마다 접근 각도를 다르게 하세요.\n3. 네이버 검색어를 자연스럽게 포함하되 키워드를 나열하지 마세요.\n4. 학부모의 실제 고민과 궁금증이 제목에서 느껴지게 하세요.\n5. 과장, 공포, 낚시성 표현, 확인되지 않은 수치를 사용하지 마세요.\n6. 지역명·센터명은 필요할 때만 자연스럽게 뒤쪽에 넣고 광고처럼 시작하지 마세요.\n7. 90% 교육 정보, 10% 홍보 원칙이 제목에도 느껴져야 합니다.\n\n## 출력 형식\n번호를 포함한 5줄만 출력하세요. 설명 없이 제목만 작성하세요.`;
}

function parseLines(raw: string, limit: number): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map(String).map((x) => x.trim()).filter(Boolean).slice(0, limit);
  } catch { /* line parsing */ }
  return trimmed.split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:\d+\s*[.)]|[-*•])\s*/, '').replace(/^['"“”]+|['"“”]+$/g, '').trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
    .slice(0, limit);
}

function makePrompt(f: FormData, title: string) {
  const guide = IMAGE_STYLES[f.imageStyle as keyof typeof IMAGE_STYLES] || '';
  return `# GPT용 눈높이 블로그 프롬프트 마스터 V3\n\n당신은 교육 현장을 이해하는 네이버 블로그 콘텐츠 작가입니다. 아래 조건을 바탕으로 '사람이 직접 쓴 것처럼 자연스럽고 구체적인' 네이버 블로그 글을 작성하세요.\n\n## 입력 정보\n- 타겟 독자: ${f.reader}\n- 과목/학습영역: ${f.subject}\n- 추천 제품: ${f.product || '미정'}\n- 핵심 주제: ${f.topic || '선택한 주제'}\n- 지역/러닝센터명: ${f.region || '미정'}\n- 포스팅 유형: ${f.postType}\n- 이미지 스타일: ${f.imageStyle}\n- 원장님 요청사항: ${f.directorRequest || '특별 요청 없음'}\n- 계절/시기: ${currentSeason()}\n- 확정 제목: ${title}\n\n## 가장 중요한 글자 수 규칙\n- 네이버 블로그 '본문 텍스트'는 반드시 공백 포함 1,200~1,500자 사이로 작성하세요.\n- 제목, 이미지 프롬프트, 해시태그, CTA 안내 문구는 본문 글자 수 계산에서 제외합니다.\n- 1,200자 미만이면 사례·설명·실천 팁을 보강하고, 1,500자를 넘으면 반복 설명과 수식어를 줄이세요.\n\n## AI 느낌을 줄이는 자연스러운 문체 규칙\n1. 문장을 지나치게 반듯하게 만들지 말고 실제 교육 현장에서 설명하듯 씁니다.\n2. 같은 문장 구조와 접속어를 반복하지 마세요. '첫째, 둘째, 마지막으로', '결론적으로', '도움이 됩니다' 같은 AI식 상투 표현을 남발하지 마세요.\n3. 짧은 문장과 조금 긴 문장을 섞고, 소제목 사이에 자연스러운 호흡을 만드세요.\n4. 학부모가 실제로 할 법한 질문이나 아이의 구체적인 학습 장면을 1~2곳 넣으세요. 허구의 실제 상담 사례처럼 꾸미지는 마세요.\n5. 지나치게 완벽한 광고 문구, 추상적인 칭찬, 감탄사를 줄이고 구체적인 설명을 우선하세요.\n6. 같은 핵심어를 계속 반복하지 말고 자연스러운 표현을 사용하세요.\n7. 사실처럼 보이는 통계·연구 결과·성공 사례를 임의로 만들지 마세요.\n8. AI가 쓴 티를 없애기 위해 일부러 어색한 오탈자를 넣지는 마세요.\n9. 문체는 친근한 '~해요'와 신뢰감 있는 '~습니다'를 상황에 맞게 자연스럽게 섞습니다.\n\n## 콘텐츠 구성\n- A.E.A 흐름: 학부모의 상황 공감 → 왜 그런지 교육적으로 설명 → 집에서 해볼 수 있는 구체적인 방법과 다음 행동.\n- 교육 정보 약 90%, 제품/센터 소개 약 10%.\n- 소제목은 3~4개 정도로 제한하고, 각 문단은 모바일에서 읽기 좋게 짧게 구성하세요.\n- 제품이나 센터는 글의 핵심 문제를 설명한 뒤 자연스럽게 연결하세요. 홍보 문장을 반복하지 마세요.\n\n## 이미지 프롬프트 배치 규칙 — 반드시 준수\n- 이미지 프롬프트를 글 마지막에 몰아서 나열하지 마세요.\n- 본문의 2~3개 핵심 구간을 골라 '바로 앞 문단의 내용'을 시각적으로 설명할 수 있도록 이미지 프롬프트를 해당 문단 다음 줄에 삽입하세요.\n- 반드시 [본문 문단] → [해당 문단과 직접 연결된 이미지 프롬프트] → [다음 본문] 순서로 작성하세요.\n- 이미지마다 서로 다른 장면을 만들고, 앞 문단의 핵심 개념·학습 상황·비교·실천법을 프롬프트에 명확히 반영하세요.\n- 이미지 속 한글 문구가 필요하다면 1~2개의 짧은 문구만 지정하세요.\n- 이미지 프롬프트는 영문으로 작성하고, 앞 문단과의 연결 이유가 드러나도록 구체적으로 묘사하세요.\n- 형식: [이미지 프롬프트 1 | 연결 문단: '앞 문단 핵심 요약' | ${guide}]\n- 이미지 프롬프트는 2~3개만 넣으세요.\n\n## 눈높이 콘텐츠 기준\n${KNOWLEDGE_BASE}\n\n## 최종 출력 순서\n1. # ${title}\n2. 바로 본문 시작\n3. 본문 중간중간 관련 문단 직후에 이미지 프롬프트 2~3개 삽입\n4. 본문 마지막에 자연스러운 지역 상담 CTA 1개\n5. 마지막에 해시태그 10~15개\n\n중요: 본문을 먼저 충분히 자연스럽게 완성한 뒤 글자 수를 스스로 점검하세요. 본문은 반드시 공백 포함 1,200~1,500자입니다.`;
}

async function copyText(text: string) { await navigator.clipboard.writeText(text); }

export default function App() {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [step, setStep] = useState(1);
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [titleInput, setTitleInput] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [openGuide, setOpenGuide] = useState(false);
  const [busy, setBusy] = useState<'topics' | 'titles' | null>(null);

  const topicPrompt = useMemo(() => makeTopicPrompt(form), [form]);
  const titlePrompt = useMemo(() => makeTitlePrompt(form, form.topic || '선택한 주제'), [form]);
  const finalPrompt = useMemo(() => makePrompt(form, selectedTitle || form.topic || '선택한 주제'), [form, selectedTitle]);

  const update = (key: keyof FormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleCopy = async (text: string, key: string) => {
    await copyText(text); setCopied(key); window.setTimeout(() => setCopied(null), 1600);
  };

  const openPromptInChatGPT = async (prompt: string, kind: 'topics' | 'titles' | 'final') => {
    try { await copyText(prompt); } catch { /* clipboard permission may be unavailable */ }
    setBusy(kind);
    const chatUrl = `https://chatgpt.com/?prompt=${encodeURIComponent(prompt)}`;
    window.open(chatUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => setBusy(null), 1800);
  };

  const importClipboard = async (kind: 'topics' | 'titles') => {
    try {
      const raw = await navigator.clipboard.readText();
      if (!raw.trim()) return;
      if (kind === 'topics') { setTopicInput(raw); setTopics(parseLines(raw, 5)); }
      else { setTitleInput(raw); setTitles(parseLines(raw, 5)); }
    } catch { /* permission denied: manual field remains available */ }
  };

  useEffect(() => {
    const onFocus = () => {
      if (step === 2 && topics.length === 0) void importClipboard('topics');
      if (step === 3 && titles.length === 0) void importClipboard('titles');
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [step, topics.length, titles.length]);

  const chooseTopic = (topic: string) => { update('topic', topic); setStep(3); };

  const chooseTitle = (title: string) => { setSelectedTitle(title); setStep(4); };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white"><div className="mx-auto max-w-6xl px-5 py-6"><div className="flex items-center gap-3"><div className="rounded-2xl bg-slate-900 p-3 text-white"><Sparkles size={22} /></div><div><h1 className="text-xl font-bold">GPT용 눈높이 블로그 프롬프트 마스터 V3</h1><p className="mt-1 text-sm text-slate-500">조건 입력 → GPT 5가지 주제 → 후킹 제목 5가지 → 1,200~1,500자 블로그</p></div></div></div></header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-7 grid gap-3 md:grid-cols-4">{[['01','콘텐츠 조건 입력','과목·학년·요청사항'],['02','GPT 5가지 추천주제','버튼으로 GPT 실행'],['03','후킹 제목 5가지','선택 주제로 제목 생성'],['04','완성 프롬프트','1,200~1,500자 글 작성']].map(([num,title,desc],index)=><button key={num} onClick={()=>setStep(index+1)} className={`rounded-2xl border p-4 text-left transition ${step===index+1?'border-slate-900 bg-white shadow-sm':'border-slate-200 bg-white/70'}`}><div className="text-xs font-bold text-slate-400">{num}</div><div className="mt-1 font-semibold">{title}</div><div className="mt-1 text-xs text-slate-500">{desc}</div></button>)}</div>

        {step === 1 && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-3"><Wand2 className="text-slate-700" size={22}/><div><h2 className="text-lg font-bold">STEP 1. 블로그 기본 조건</h2><p className="text-sm text-slate-500">과목과 원장님 요청사항을 중심으로 입력하면 GPT가 주제를 기획합니다.</p></div></div><div className="grid gap-5 md:grid-cols-2"><Field label="타겟 독자"><select value={form.reader} onChange={(e)=>update('reader',e.target.value)}>{readers.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="과목 / 학습영역"><select value={form.subject} onChange={(e)=>update('subject',e.target.value)}>{subjects.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="추천 제품"><input value={form.product} onChange={(e)=>update('product',e.target.value)} placeholder="예: 눈높이수학"/></Field><Field label="지역 / 러닝센터명"><input value={form.region} onChange={(e)=>update('region',e.target.value)} placeholder="예: 수원 매탄러닝센터"/></Field><Field label="포스팅 유형"><select value={form.postType} onChange={(e)=>update('postType',e.target.value)}>{postTypes.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="이미지 스타일"><select value={form.imageStyle} onChange={(e)=>update('imageStyle',e.target.value)}>{styles.map(x=><option key={x}>{x}</option>)}</select></Field><div className="md:col-span-2"><Field label="원장님 요청사항"><textarea value={form.directorRequest} onChange={(e)=>update('directorRequest',e.target.value)} placeholder="예: 초3 학부모가 바로 공감할 수 있게, 연산이 부족한 아이의 지도 방법을 구체적으로" rows={4}/></Field></div></div><div className="mt-7 flex justify-end"><button onClick={()=>setStep(2)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">GPT 5가지 추천주제로 이동 <Wand2 size={17}/></button></div></section>}

        {step === 2 && <section className="space-y-5"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-start justify-between gap-4"><div className="flex gap-3"><Lightbulb className="mt-1" size={22}/><div><h2 className="text-lg font-bold">STEP 2. GPT 5가지 추천주제</h2><p className="mt-1 text-sm text-slate-500">기존 10개 복사·붙여넣기 방식을 없애고, 입력 조건으로 GPT가 5개만 기획합니다.</p></div></div><button onClick={()=>setOpenGuide(v=>!v)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><ChevronDown size={15} className={openGuide?'rotate-180':''}/> 사용방법</button></div>{openGuide&&<div className="mb-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">① <b>GPT 5가지 추천주제</b> 버튼을 누릅니다. → ② GPT가 5개를 제안합니다. → ③ GPT 결과를 복사하고 이 화면으로 돌아오면 자동으로 클립보드를 읽어 표시하도록 시도합니다. → ④ 주제를 클릭하면 후킹 제목 단계로 이동합니다.</div>}<div className="flex flex-wrap gap-2"><button onClick={()=>void openPromptInChatGPT(topicPrompt,'topics')} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">{busy==='topics'?<Check size={16}/>:<Sparkles size={16}/>} GPT 5가지 추천주제</button><button onClick={()=>void handleCopy(topicPrompt,'topicPrompt')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">{copied==='topicPrompt'?<Check size={16}/>:<Copy size={16}/>} 프롬프트 복사</button><button onClick={()=>void importClipboard('topics')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold"><ClipboardPaste size={16}/> 결과 불러오기</button></div></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><div><h3 className="font-bold">추천 주제 5개</h3><p className="mt-1 text-sm text-slate-500">GPT 결과는 5개로만 정리됩니다.</p></div><span className="text-xs text-slate-400">현재 {topics.length}개</span></div><textarea value={topicInput} onChange={(e)=>{setTopicInput(e.target.value);setTopics(parseLines(e.target.value,5));}} rows={5} placeholder="GPT 결과를 붙여넣으면 5개 주제로 자동 정리됩니다."/>{topics.length>0&&<div className="mt-4 grid gap-3">{topics.map((topic,index)=><button key={`${topic}-${index}`} onClick={()=>chooseTopic(topic)} className="flex gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-900 hover:bg-slate-50"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{index+1}</span><span className="text-sm font-medium leading-6">{topic}</span></button>)}</div>}</div><div className="flex justify-between"><button onClick={()=>setStep(1)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">이전</button><button disabled={!form.topic} onClick={()=>setStep(3)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">선택 주제로 후킹 제목 만들기</button></div></section>}

        {step === 3 && <section className="space-y-5"><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-start justify-between gap-4"><div className="flex gap-3"><Lightbulb className="mt-1" size={22}/><div><h2 className="text-lg font-bold">STEP 3. 후킹 제목 5가지</h2><p className="mt-1 text-sm text-slate-500">선택한 주제 하나를 바탕으로 서로 다른 각도의 제목 5개를 생성합니다.</p></div></div><div className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold">{form.topic||'주제를 먼저 선택하세요'}</div></div><div className="flex flex-wrap gap-2"><button disabled={!form.topic} onClick={()=>void openPromptInChatGPT(titlePrompt,'titles')} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy==='titles'?<Check size={16}/>:<Sparkles size={16}/>} 후킹 제목 5가지 생성</button><button onClick={()=>void handleCopy(titlePrompt,'titlePrompt')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">{copied==='titlePrompt'?<Check size={16}/>:<Copy size={16}/>} 프롬프트 복사</button><button onClick={()=>void importClipboard('titles')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold"><ClipboardPaste size={16}/> 결과 불러오기</button></div></div><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h3 className="font-bold">후킹 제목 5개</h3><p className="mt-1 text-sm text-slate-500">제목을 클릭하면 최종 블로그 프롬프트에 반영됩니다.</p></div><span className="text-xs text-slate-400">현재 {titles.length}개</span></div><textarea value={titleInput} onChange={(e)=>{setTitleInput(e.target.value);setTitles(parseLines(e.target.value,5));}} rows={5} placeholder="GPT가 만든 제목 5개를 붙여넣으면 자동 정리됩니다."/>{titles.length>0&&<div className="mt-4 grid gap-3">{titles.map((title,index)=><button key={`${title}-${index}`} onClick={()=>chooseTitle(title)} className="flex gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-slate-900 hover:bg-slate-50"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold">{index+1}</span><span className="text-sm font-medium leading-6">{title}</span></button>)}</div>}</div><div className="flex justify-between"><button onClick={()=>setStep(2)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">주제 다시 선택</button><button disabled={titles.length===0} onClick={()=>setStep(4)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">최종 블로그 프롬프트 만들기</button></div></section>}

        {step === 4 && <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center justify-between gap-4"><div className="flex gap-3"><FileText className="mt-1" size={22}/><div><h2 className="text-lg font-bold">STEP 4. 1,200~1,500자 블로그 작성 프롬프트</h2><p className="mt-1 text-sm text-slate-500">AI 느낌을 줄이고, 글 단락과 직접 연결되는 이미지 프롬프트를 본문 사이에 배치하도록 설계했습니다.</p></div></div><button onClick={()=>void handleCopy(finalPrompt,'final')} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">{copied==='final'?<Check size={16}/>:<Copy size={16}/>} {copied==='final'?'복사 완료':'최종 프롬프트 복사'}</button></div><div className="mb-5 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">선택한 주제</div><div className="mt-1 font-semibold">{form.topic||'미선택'}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">확정 제목</div><div className="mt-1 font-semibold">{selectedTitle||'주제명을 제목으로 사용'}</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">본문 기준</div><div className="mt-1 font-semibold">1,200~1,500자 · 이미지 2~3개 · 교육 90:홍보 10</div></div></div><pre className="max-h-[680px] overflow-auto whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7">{finalPrompt}</pre><div className="mt-5 flex flex-wrap justify-between gap-3"><button onClick={()=>setStep(3)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">제목 다시 선택</button><button onClick={()=>void openPromptInChatGPT(finalPrompt,'final')} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">{busy==='final'?<Check size={16}/>:<ExternalLink size={16}/>} GPT에 붙여넣기</button></div></section>}
      </main>
      <footer className="border-t bg-white py-7 text-center text-xs text-slate-400">GPT용 눈높이 블로그 프롬프트 마스터 V3 · GitHub Pages 정적 웹앱 · AI API 키 미사용</footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>; }
