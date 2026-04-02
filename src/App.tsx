import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChartLine, 
  Brain, 
  Lightbulb, 
  Edit3, 
  Wand2, 
  Copy, 
  Check, 
  Loader2, 
  ChevronRight,
  Info
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TITLES_SYSTEM_INSTRUCTION, POST_SYSTEM_INSTRUCTION, IMAGE_STYLES } from './constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FormData {
  reader: string;
  product: string;
  topic: string;
  region: string;
  postType: string;
  imageStyle: string;
  directorRequest: string;
}

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    reader: '초1',
    product: '',
    topic: '',
    region: '',
    postType: '정보전달형',
    imageStyle: '에듀케이션 일러스트',
    directorRequest: ''
  });

  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [blogContent, setBlogContent] = useState<string>('');
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [copied, setCopied] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('input', '').charAt(0).toLowerCase() + id.replace('input', '').slice(1)]: value }));
  };

  const generateTitles = async () => {
    if (!formData.product || !formData.topic || !formData.region) {
      alert("추천 제품, 주제, 지역/러닝센터명은 필수 입력 항목입니다.");
      return;
    }

    setIsGeneratingTitles(true);
    setTitles([]);
    setSelectedTitle('');
    setBlogContent('');

    try {
      const userPrompt = `
        타겟 독자: ${formData.reader}
        제품: ${formData.product}
        주제: ${formData.topic}
        지역/센터명: ${formData.region}
        포스팅 유형: ${formData.postType}
        원장님 요청사항: ${formData.directorRequest}
        
        위 정보를 바탕으로 클릭을 유도하는 5개의 블로그 제목을 JSON 배열 포맷으로 출력해줘.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: TITLES_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });

      const result = JSON.parse(response.text || '[]');
      setTitles(result);
    } catch (error) {
      console.error("Error generating titles:", error);
      alert("제목 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const selectTitleAndGeneratePost = async (title: string) => {
    setSelectedTitle(title);
    setIsGeneratingPost(true);
    setBlogContent('');

    try {
      const userPrompt = `
        다음 정보를 바탕으로 SEO에 최적화된 블로그 본문을 작성해 주세요:
        
        - 확정된 제목: ${title}
        - 타겟 독자: ${formData.reader}
        - 홍보할 제품: ${formData.product}
        - 지역/센터명: ${formData.region}
        - 핵심 주제: ${formData.topic}
        - 포스팅 유형: ${formData.postType}
        - 이미지 스타일: ${formData.imageStyle} (가이드라인: ${IMAGE_STYLES[formData.imageStyle as keyof typeof IMAGE_STYLES]})
        - 원장님 강조사항: ${formData.directorRequest}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: POST_SYSTEM_INSTRUCTION,
        }
      });

      const generatedContent = response.text || '';
      // Prepend the title with the specific format if it's not already there
      const titlePrefix = `[블로그 제목 : ${title}]`;
      const finalContent = generatedContent.includes(titlePrefix) 
        ? generatedContent 
        : `# ${titlePrefix}\n\n${generatedContent}`;

      setBlogContent(finalContent);
      
      // Scroll to result after a short delay to allow rendering
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error("Error generating post:", error);
      alert("본문 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const copyToClipboard = async () => {
    const container = resultRef.current?.querySelector('.markdown-body');
    if (!container) return;

    // To preserve the yellow highlight in blog editors (Naver, Tistory, etc.),
    // we copy as both HTML and plain text.
    const htmlContent = container.innerHTML;
    
    try {
      const data = [
        new ClipboardItem({
          "text/plain": new Blob([blogContent], { type: "text/plain" }),
          "text/html": new Blob([htmlContent], { type: "text/html" }),
        }),
      ];
      await navigator.clipboard.write(data);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Advanced copy failed, falling back to plain text", err);
      navigator.clipboard.writeText(blogContent).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Custom renderer for infographic blocks
  const components = {
    p: ({ children }: any) => {
      const content = children?.toString() || '';
      const infographicMatch = content.match(/\[인포그래픽 프롬프트: (.*?)\]/);
      
      if (infographicMatch) {
        return (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 my-6 rounded-r-lg text-sm">
            <div className="flex items-center gap-2 mb-1 font-bold text-emerald-800">
              <Info className="w-4 h-4" />
              <span>[이미지 생성 프롬프트]</span>
            </div>
            <p className="text-emerald-700 italic m-0">{infographicMatch[1]}</p>
          </div>
        );
      }
      return <p>{children}</p>;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
          <ChartLine className="text-teal-600 w-8 h-8" />
          AI 눈높이 블로그 프롬프트 마스터
        </h1>
        <p className="text-slate-500 mt-2">
          최고의 학부모 상담/유입 전환을 이끌어내는 전문가 수준의 블로그를 클릭 몇 번으로 자동 완성하세요.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-6">
          {/* Master Frame Card */}
          <section className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden">
            <div className="bg-pink-50 px-5 py-4 border-b border-pink-100 flex items-center gap-2">
              <Brain className="text-pink-600 w-5 h-5" />
              <h2 className="font-bold text-pink-800">마스터 프레임 (탑재됨)</h2>
            </div>
            <div className="p-5 text-sm text-slate-600 leading-relaxed">
              <p className="mb-3">이 애플리케이션은 앙리님의 <strong>'대교 눈높이 러닝센터 블로그 글쓰기 마스터 프레임'</strong>을 코어 프롬프트로 내장하고 있습니다.</p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <ul className="list-disc pl-4 space-y-2">
                  <li><strong>비율:</strong> 교육 정보(9) : 홍보/센터 소개(1)</li>
                  <li><strong>구조:</strong> A.E.A 3층 구조 (권위-근거-행동)</li>
                  <li><strong>특징:</strong> 공감 도입부, 학부모 의심 사전 차단, 로컬 센터 자연스런 연결, 진단평가 CTA 삽입</li>
                  <li><strong>시각화:</strong> 본문 내 최적의 위치에 시각화(인포그래픽) 생성용 프롬프트 자동 삽입</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Guide Card */}
          <section className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="bg-emerald-50 px-5 py-4 border-b border-emerald-100 flex items-center gap-2">
              <Lightbulb className="text-emerald-600 w-5 h-5" />
              <h2 className="font-bold text-emerald-800">사용 가이드</h2>
            </div>
            <div className="p-5 text-sm text-slate-600 leading-relaxed">
              <ol className="list-decimal pl-4 space-y-3 font-medium">
                <li>우측 패널에 <span className="text-teal-600">타겟 독자와 주요 정보</span>를 입력합니다.</li>
                <li><span className="text-teal-600">후킹 제목 5개 생성하기</span> 버튼을 누릅니다.</li>
                <li>AI가 생성한 5개의 제목 중 가장 마음에 드는 제목을 클릭합니다.</li>
                <li>선택한 제목을 바탕으로 <strong>인포그래픽 프롬프트가 포함된 전체 블로그 본문</strong>이 자동 작성됩니다.</li>
              </ol>
            </div>
          </section>
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex border-b border-slate-200">
            <div className="px-6 py-4 font-bold text-teal-700 border-b-2 border-teal-600 flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              블로그 원스톱 생성기
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Step 1: Inputs */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="text-xl font-bold text-slate-800">타겟 정보 입력</h3>
              </div>
              <p className="text-sm text-slate-500">관심 있는 지역과 과목, 학부모의 진짜 고민을 해부하기 위한 템플릿입니다.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">글의 독자 <span className="text-red-500">*</span></label>
                  <select 
                    id="inputReader" 
                    value={formData.reader}
                    onChange={handleInputChange}
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                  >
                    <option value="영유아(3~4세)">영유아(3~4세)</option>
                    <option value="유아(5,6세)">유아(5,6세)</option>
                    <option value="예비초(7세)">예비초(7세)</option>
                    <option value="초1">초1</option>
                    <option value="초2">초2</option>
                    <option value="초3">초3</option>
                    <option value="초4">초4</option>
                    <option value="초5">초5</option>
                    <option value="초6">초6</option>
                    <option value="중1">중1</option>
                    <option value="중2">중2</option>
                    <option value="중3">중3</option>
                    <option value="고1">고1</option>
                    <option value="시니어">시니어</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">추천 제품 <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id="inputProduct" 
                    value={formData.product}
                    onChange={handleInputChange}
                    placeholder="예: 눈높이 사고력수학, 써밋 국어 등" 
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">포스팅 주제 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  id="inputTopic" 
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="예: 초등 문해력의 중요성, 예비초등 수학 준비" 
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">지역 / 러닝센터명 <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  id="inputRegion" 
                  value={formData.region}
                  onChange={handleInputChange}
                  placeholder="예: 광교동 신풍러닝센터" 
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">포스팅 유형 <span className="text-red-500">*</span></label>
                <select 
                  id="inputPostType" 
                  value={formData.postType}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                >
                  <option value="정보전달형">정보전달형 (교육 정보 및 팁 제공 위주)</option>
                  <option value="학원 홍보형">학원 홍보형 (센터 장점 및 관리 시스템 강조)</option>
                  <option value="학습 후기형">학습 후기형 (실제 성과 및 비포/애프터 사례)</option>
                  <option value="제품소개형">제품소개형 (눈높이/써밋 등 특정 제품 기능 강조)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">이미지/인포그래픽 프롬프트 스타일 선택 <span className="text-red-500">*</span></label>
                <select 
                  id="inputImageStyle" 
                  value={formData.imageStyle}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
                >
                  <option value="에듀케이션 일러스트">에듀케이션 일러스트 (Soft Storytelling)</option>
                  <option value="플랫 디자인">플랫 디자인 (Clean & Modern Flat)</option>
                  <option value="라인 아트 / 아이콘형">라인 아트 / 아이콘형 (Minimalist Line Art)</option>
                  <option value="2.5D 이소메트릭">2.5D 이소메트릭 (3D Isometric Perspective)</option>
                  <option value="인포그래픽 차트형">인포그래픽 차트형 (Data-Centric Design)</option>
                  <option value="핸드 스케치 / 낙서풍">핸드 스케치 / 낙서풍 (Creative Doodle)</option>
                  <option value="3D 클레이 스타일">3D 클레이 스타일 (Trendy 3D Claymorphism)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">원장님 요청사항 (강조할 내용)</label>
                <textarea 
                  id="inputDirectorRequest" 
                  value={formData.directorRequest}
                  onChange={handleInputChange}
                  rows={3} 
                  placeholder="예: 겨울방학 특강을 강조해주세요 / 연산 실수가 많은 아이들이 써밋 드릴다운으로 어떻게 바뀌었는지 사례를 넣어주세요" 
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 resize-none"
                />
              </div>

              <button 
                onClick={generateTitles}
                disabled={isGeneratingTitles}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold py-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-lg"
              >
                {isGeneratingTitles ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Wand2 className="w-6 h-6" />
                )}
                후킹 제목 5개 생성하기
              </button>
              
              {isGeneratingTitles && (
                <div className="text-center py-2 text-teal-600 font-semibold text-sm animate-pulse">
                  앙리님의 마케팅 노하우를 분석하여 후킹 제목을 뽑아내는 중입니다...
                </div>
              )}
            </section>

            {/* Step 2: Titles Selection */}
            <AnimatePresence>
              {(titles.length > 0 || isGeneratingPost) && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-8 border-t border-slate-200 space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                    <h3 className="text-xl font-bold text-slate-800">블로그 제목 선택</h3>
                  </div>
                  <p className="text-sm text-slate-500">가장 마음에 드는 제목을 클릭하면, <strong>본문과 인포그래픽 생성 프롬프트</strong>가 자동으로 작성됩니다.</p>
                  
                  <div className="flex flex-col gap-3">
                    {titles.map((title, index) => (
                      <button
                        key={index}
                        onClick={() => selectTitleAndGeneratePost(title)}
                        disabled={isGeneratingPost}
                        className={cn(
                          "w-full text-left p-4 rounded-lg text-slate-700 font-medium transition-all shadow-sm border flex items-start gap-3 group",
                          selectedTitle === title 
                            ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500" 
                            : "bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50"
                        )}
                      >
                        <span className="text-amber-500 font-bold shrink-0">{index + 1}.</span>
                        <span className="flex-1">{title}</span>
                        <ChevronRight className={cn(
                          "w-5 h-5 shrink-0 transition-transform",
                          selectedTitle === title ? "text-amber-500 translate-x-1" : "text-slate-300 group-hover:text-amber-400"
                        )} />
                      </button>
                    ))}
                  </div>

                  {isGeneratingPost && (
                    <div className="text-center py-6 text-amber-600 font-semibold bg-amber-50 rounded-lg border border-amber-100">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      블로그 본문과 인포그래픽 프롬프트를 구성하고 있습니다...<br />
                      <span className="text-sm text-slate-500 font-normal mt-2 inline-block">(최대 20~30초 소요)</span>
                    </div>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            {/* Step 3: Result */}
            <AnimatePresence>
              {blogContent && (
                <motion.section 
                  ref={resultRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-8 border-t border-slate-200 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <h3 className="text-xl font-bold text-slate-800">완성된 블로그 본문</h3>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className={cn(
                        "text-sm px-4 py-2 rounded-md transition-all flex items-center gap-2 font-semibold border",
                        copied 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
                      )}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "복사 완료!" : "전체 복사"}
                    </button>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 markdown-body text-sm overflow-x-auto min-h-[400px]">
                    <ReactMarkdown components={components}>
                      {blogContent}
                    </ReactMarkdown>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
