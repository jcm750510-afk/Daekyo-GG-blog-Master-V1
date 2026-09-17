import { useMemo, useState } from 'react';
import { Copy, Check, Wand2, FileText, Sparkles, Lightbulb } from 'lucide-react';
import { IMAGE_STYLES } from './constants';

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

const SUBJECT_TOPICS: Record<string, string[]> = {
  수학: ['초등 수학, 연산보다 먼저 잡아야 할 핵심 학습습관', '학년이 올라갈수록 수학 격차가 벌어지는 이유와 예방법', '우리 아이 수학 오답이 반복되는 이유와 해결 방법', '초등 수학 개념을 오래 기억하게 만드는 공부법', '연산 실수를 줄이고 정확도를 높이는 5가지 습관', '예비초·초등 저학년이 수학을 어려워하기 전에 준비할 것'],
  국어: ['초등 국어 실력을 좌우하는 읽기 습관, 어떻게 만들어야 할까요?', '문장을 읽고도 내용을 설명하지 못한다면 확인할 5가지', '초등 저학년부터 문장력과 표현력을 키우는 방법', '학년이 올라갈수록 중요해지는 국어 어휘와 문해력', '교과서 내용을 잘 이해하는 아이들의 공통된 읽기 습관', '초등 국어, 문제집보다 먼저 점검해야 할 기초 역량'],
  영어: ['초등 영어, 단어 암기보다 먼저 만들어야 할 학습습관', '파닉스 이후 영어 읽기를 자연스럽게 이어가는 방법', '초등 영어 듣기와 읽기 실력을 함께 키우는 공부법', '영어를 어려워하기 시작한 아이에게 먼저 확인할 것', '학년별로 달라지는 초등 영어 공부의 핵심 포인트', '초등 영어 어휘력을 효과적으로 쌓는 일상 속 방법'],
  '창의독서·문해력': ['초등 문해력, 책을 많이 읽는 것만으로 충분할까요?', '읽고도 기억하지 못하는 아이에게 필요한 독서 습관', '초등 학년별 문해력을 키우는 질문과 대화법', '문해력이 수학·사회·과학 학습에도 중요한 이유', '아이의 생각하는 힘을 키우는 독서 후 질문 5가지', '초등 독서습관, 재미와 학습을 함께 잡는 방법'],
  한자: ['초등 한자 공부가 교과 어휘력에 도움이 되는 이유', '한자를 활용해 초등 어휘력을 넓히는 효과적인 방법', '어려운 교과어휘를 쉽게 이해하게 만드는 한자 학습', '초등학생이 자주 만나는 한자어, 어떻게 공부해야 할까요?', '한자 학습으로 국어 어휘와 문해력을 함께 키우는 방법', '학년이 올라갈수록 어휘력이 중요한 이유와 한자 공부법'],
  사회: ['초등 사회, 단순 암기보다 개념 이해가 중요한 이유', '사회 과목의 자료해석력을 키우는 공부습관', '초등 사회 교과서 내용을 오래 기억하는 정리법', '뉴스와 일상 속에서 사회 개념을 익히는 방법', '초등 사회가 어려워지기 전에 준비해야 할 핵심 역량', '사회 공부에서 질문하고 탐구하는 습관이 중요한 이유'],
  과학: ['초등 과학, 외우기보다 원리를 이해하게 만드는 방법', '과학을 어려워하는 아이에게 필요한 관찰과 질문 습관', '초등 과학 실험 내용을 오래 기억하는 학습법', '과학 교과의 개념과 탐구력을 함께 키우는 방법', '초등 학년별 과학 공부에서 놓치기 쉬운 핵심 포인트', '생활 속 과학 질문으로 아이의 탐구력을 키우는 방법'],
  어휘력: ['초등 어휘력이 전 과목 학습에 중요한 이유', '아이의 어휘력을 자연스럽게 늘리는 하루 10분 습관', '교과서를 읽다가 모르는 단어가 많다면 점검할 것', '어휘력이 부족한 아이에게 필요한 단계별 학습법', '초등 어휘력과 문해력을 함께 키우는 방법', '수학·사회·과학까지 연결되는 교과어휘 공부법'],
  학습습관: ['초등 공부습관, 학년이 올라가기 전에 꼭 만들어야 할 것', '스스로 공부하는 아이들의 작은 습관 5가지', '숙제는 하는데 학습효과가 낮다면 점검할 부분', '초등 저학년 공부습관을 무리 없이 만드는 방법', '학년별로 달라져야 하는 자기주도 학습습관', '아이에게 맞는 공부 루틴을 찾는 방법'],
  기타: ['우리 아이에게 맞는 학습 주제를 찾기 위해 먼저 확인할 것', '학년별 학습 격차를 줄이기 위해 점검해야 할 핵심 역량', '학부모가 알아두면 좋은 초등 학습의 기본 원칙', '아이의 현재 학습 상태를 점검하는 간단한 체크포인트', '공부에 대한 자신감을 키우는 일상 속 학습습관', '학년이 바뀌기 전 우리 아이 학습을 점검하는 방법'],
};

function makePrompt(f: FormData, title: string) {
  const guide = IMAGE_STYLES[f.imageStyle as keyof typeof IMAGE_STYLES] || '';
  return `# GPT용 눈높이 블로그 프롬프트 마스터 V2\n\n당신은 20년 경력의 교육 콘텐츠·학부모 커뮤니케이션·블로그 SEO 전문가입니다. 아래 정보를 바탕으로 네이버 블로그에 바로 활용할 수 있는 완성도 높은 글을 작성하세요.\n\n## 입력 정보\n- 타겟 독자: ${f.reader}\n- 과목/학습영역: ${f.subject}\n- 추천 제품: ${f.product}\n- 핵심 주제: ${f.topic}\n- 지역/러닝센터명: ${f.region}\n- 포스팅 유형: ${f.postType}\n- 이미지 스타일: ${f.imageStyle}\n- 원장님 요청사항: ${f.directorRequest || '특별 요청 없음'}\n- 확정 제목: ${title}\n\n## 작성 원칙\n1. 교육 정보 90%, 센터/제품 소개 10%의 비율을 지킵니다.\n2. A.E.A 구조(공감·권위 → 근거·설명 → 행동·실천)로 구성합니다.\n3. 학부모가 실제로 검색할 만한 질문과 고민에서 시작합니다.\n4. 과장·허위 성과·확인되지 않은 수치·교육학적 단정은 만들지 않습니다.\n5. 제품 홍보가 본문을 압도하지 않도록 자연스럽게 연결합니다.\n6. 소제목과 **굵은 핵심문장**, 짧은 문단을 사용합니다.\n7. 마지막에는 ${f.region} 학부모가 부담 없이 상담을 생각해 볼 수 있는 자연스러운 CTA를 넣습니다.\n\n## 이미지 프롬프트\n본문 흐름상 필요한 위치에 1~2개의 [인포그래픽 프롬프트: ...]를 삽입하세요. 스타일 가이드: ${guide}\n\n## 출력 형식\n# [블로그 제목 : ${title}]\n\n도입부 → 핵심 교육정보 → 실천방법/체크포인트 → 제품과의 자연스러운 연결 → 지역센터 CTA → 해시태그 순서로 작성합니다. 마지막 줄에는 검색용 해시태그 8~12개를 제안하세요.`;
}

export default function App() {
  const [f, setF] = useState<FormData>({ reader: '초1', subject: '', product: '', topic: '', region: '', postType: '정보전달형', imageStyle: styles[0], directorRequest: '' });
  const [titles, setTitles] = useState<string[]>([]);
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [copied, setCopied] = useState(false);

  const subjectTopics = useMemo(() => {
    const base = SUBJECT_TOPICS[f.subject] || SUBJECT_TOPICS.기타;
    return base.map(topic => `${f.reader} ${topic.replace(/^초등\s*/g, '')}`);
  }, [f.reader, f.subject]);

  const seeds = useMemo(() => [
    `${f.reader} 학부모가 놓치기 쉬운 ${f.topic || '학습 습관'} 핵심 포인트 5가지`,
    `${f.topic || `${f.subject || '초등 학습'} 핵심`} 때문에 고민이라면? ${f.reader}에게 필요한 공부법`,
    `우리 아이 ${f.topic || f.subject || '학습'}이 달라지는 작은 습관, 지금 확인해보세요`,
    `${f.reader}부터 달라지는 ${f.topic || f.subject || '학습'}의 기준, 무엇을 봐야 할까요?`,
    `학부모가 궁금해하는 ${f.topic || f.subject || '학습'} 이야기｜실천하기 쉬운 방법부터 알아보기`
  ], [f.reader, f.subject, f.topic]);

  const recommendTopics = () => {
    if (!f.subject) {
      alert('먼저 과목/학습영역을 선택해주세요.');
      return;
    }
    setTopicSuggestions(subjectTopics);
  };

  const generate = () => {
    if (!f.product || !f.topic || !f.region) {
      alert('추천 제품, 포스팅 주제, 지역/러닝센터명을 입력해주세요.');
      return;
    }
    setTitles(seeds);
    setSelected('');
    setCopied(false);
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800">
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-3"><Sparkles className="text-teal-600"/><h1 className="text-3xl font-bold">GPT용 눈높이 블로그 프롬프트 마스터 V2</h1></div>
        <p className="mt-2 text-slate-500">입력 → 과목별 포스트 주제 추천 → 후킹 제목 5개 → GPT용 완성 프롬프트 생성까지 한 번에.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <section className="bg-white rounded-2xl border p-6 shadow-sm space-y-5">
          <h2 className="font-bold text-lg flex items-center gap-2"><Wand2 className="w-5 h-5 text-teal-600"/>STEP 1. 정보 입력</h2>

          <label className="block text-sm font-semibold">글의 독자
            <select value={f.reader} onChange={e => setF({...f, reader:e.target.value})} className="mt-2 w-full rounded-lg border p-3">{readers.map(x => <option key={x}>{x}</option>)}</select>
          </label>

          <label className="block text-sm font-semibold">과목 / 학습영역
            <select value={f.subject} onChange={e => { setF({...f, subject:e.target.value, topic:''}); setTopicSuggestions([]); }} className="mt-2 w-full rounded-lg border p-3">
              <option value="">과목을 선택하세요</option>{subjects.map(x => <option key={x}>{x}</option>)}
            </select>
          </label>

          <button onClick={recommendTopics} disabled={!f.subject} className="w-full rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 disabled:opacity-40 disabled:cursor-not-allowed text-teal-700 font-bold py-3 flex justify-center gap-2 items-center"><Lightbulb className="w-5 h-5"/>과목에 맞는 포스트 주제 추천받기</button>

          {topicSuggestions.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <div className="text-sm font-bold text-amber-800">추천 주제 6개 · 하나를 클릭하면 포스팅 주제에 자동 입력됩니다.</div>
            {topicSuggestions.map((topic, i) => <button key={topic} onClick={() => setF({...f, topic})} className="w-full text-left bg-white hover:bg-amber-100 border border-amber-100 rounded-lg p-3 text-sm leading-5"><b className="text-amber-700 mr-2">{i + 1}.</b>{topic}</button>)}
          </div>}

          <label className="block text-sm font-semibold">추천 제품<input value={f.product} onChange={e=>setF({...f,product:e.target.value})} placeholder="예: 눈높이 사고력수학, 써밋 국어" className="mt-2 w-full rounded-lg border p-3"/></label>
          <label className="block text-sm font-semibold">포스팅 주제<input value={f.topic} onChange={e=>setF({...f,topic:e.target.value})} placeholder="과목을 선택한 뒤 주제를 추천받거나 직접 입력" className="mt-2 w-full rounded-lg border p-3"/></label>
          <label className="block text-sm font-semibold">지역 / 러닝센터명<input value={f.region} onChange={e=>setF({...f,region:e.target.value})} placeholder="예: 광교동 신풍러닝센터" className="mt-2 w-full rounded-lg border p-3"/></label>
          <label className="block text-sm font-semibold">포스팅 유형<select value={f.postType} onChange={e=>setF({...f,postType:e.target.value})} className="mt-2 w-full rounded-lg border p-3"><option>정보전달형</option><option>학원 홍보형</option><option>학습 후기형</option><option>제품소개형</option></select></label>
          <label className="block text-sm font-semibold">이미지 스타일<select value={f.imageStyle} onChange={e=>setF({...f,imageStyle:e.target.value})} className="mt-2 w-full rounded-lg border p-3">{styles.map(x=><option key={x}>{x}</option>)}</select></label>
          <label className="block text-sm font-semibold">원장님 요청사항<textarea value={f.directorRequest} onChange={e=>setF({...f,directorRequest:e.target.value})} rows={3} placeholder="강조할 내용, 사례, 행사 등을 입력" className="mt-2 w-full rounded-lg border p-3 resize-none"/></label>
          <button onClick={generate} className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 flex justify-center gap-2"><Wand2/>후킹 제목 5개 생성하기</button>
        </section>

        <section className="lg:col-span-2 space-y-6">
          {titles.length===0 ? <div className="bg-white rounded-2xl border p-10 text-center text-slate-400 min-h-[500px] flex flex-col items-center justify-center"><FileText className="w-14 h-14 mb-4"/><h2 className="text-xl font-bold text-slate-600">여기에 제목과 GPT용 프롬프트가 생성됩니다</h2><p className="mt-2">과목을 선택해 포스트 주제를 추천받은 뒤 정보를 입력하고 버튼을 눌러주세요.</p></div> : <>
            <div className="bg-white rounded-2xl border p-6 shadow-sm"><h2 className="font-bold text-lg mb-4">STEP 2. 제목 선택</h2><div className="space-y-3">{titles.map((t,i)=><button key={t} onClick={()=>setSelected(t)} className={`w-full text-left p-4 rounded-xl border transition ${selected===t?'border-teal-500 bg-teal-50':'hover:border-teal-300'}`}><b className="text-teal-600 mr-2">{i+1}.</b>{t}</button>)}</div></div>
            {selected&&<div className="bg-white rounded-2xl border p-6 shadow-sm"><div className="flex justify-between items-center mb-4"><h2 className="font-bold text-lg">STEP 3. GPT용 완성 프롬프트</h2><button onClick={()=>copy(makePrompt(f,selected))} className="px-4 py-2 rounded-lg border text-sm font-bold flex gap-2 items-center">{copied?<Check className="w-4 h-4"/>:<Copy className="w-4 h-4"/>}{copied?'복사 완료':'프롬프트 복사'}</button></div><textarea readOnly value={makePrompt(f,selected)} className="w-full min-h-[520px] rounded-xl border bg-slate-50 p-5 text-sm leading-7 font-mono"/></div>}
          </>}
        </section>
      </div>
      <footer className="mt-8 text-center text-xs text-slate-400">V2 · 과목별 포스트 주제 추천 + GPT에 그대로 붙여넣어 사용하는 프롬프트 생성 웹앱 · API Key 불필요</footer>
    </div>
  </div>;
}
