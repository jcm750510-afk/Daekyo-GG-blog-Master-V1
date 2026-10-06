import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

type Props = { vertical: boolean };
const NAVY = '#123B66';
const BLUE = '#2377C9';
const ORANGE = '#F58220';
const SKY = '#EAF5FF';
const WHITE = '#FFFFFF';
const W = 'Noto Sans KR, Arial, sans-serif';

const Card = ({children, style={}}: any) => <div style={{background:'#fff', borderRadius:28, boxShadow:'0 24px 70px rgba(18,59,102,.14)', ...style}}>{children}</div>;
const Badge = ({children}: any) => <div style={{display:'inline-flex', padding:'10px 18px', borderRadius:999, background:SKY, color:BLUE, fontSize:24, fontWeight:800}}>{children}</div>;
const Title = ({children, size=64}: any) => <div style={{fontFamily:W, color:NAVY, fontSize:size, fontWeight:900, lineHeight:1.16, letterSpacing:-2}}>{children}</div>;

function Books({count=6}: {count?: number}) {
  return <div style={{position:'relative', width:520, height:360}}>{Array.from({length:count}).map((_,i)=><div key={i} style={{position:'absolute', left:55+i*28, bottom:35+i*7, width:380, height:58, borderRadius:12, background:i%2?BLUE:ORANGE, transform:`rotate(${i%2? -4: 3}deg)`, boxShadow:'0 10px 18px rgba(0,0,0,.12)'}}><div style={{height:7, width:120, margin:'25px 0 0 28px', borderRadius:8, background:'rgba(255,255,255,.75)'}}/></div>)}</div>;
}
function Wheel() {
  const colors=['#5BA7E8','#72C6B2','#F6C65B','#F28B82','#9C83D7','#64B5F6','#FF9E68','#6BCB77'];
  return <div style={{position:'relative', width:410, height:410, borderRadius:'50%', background:`conic-gradient(${colors.join(',')})`, boxShadow:'0 25px 55px rgba(35,119,201,.2)'}}><div style={{position:'absolute', inset:74, borderRadius:'50%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', fontFamily:W, fontWeight:900, fontSize:34, color:NAVY}}>KReaD<br/>8개 영역</div></div>;
}
function Scene1({vertical}: Props) {
  const f=useCurrentFrame(); const q=interpolate(f,[0,35,90,150],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}); const y=interpolate(f,[0,40],[80,0],{extrapolateRight:'clamp'});
  return <AbsoluteFill style={{background:'linear-gradient(135deg,#F7FBFF,#EAF5FF)',fontFamily:W,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:vertical?'88%':'80%', display:'flex', flexDirection:vertical?'column':'row', alignItems:'center', justifyContent:'space-between', gap:70}}><div style={{transform:`translateY(${y}px)`, opacity:q}}><Books/></div><div style={{maxWidth:vertical?850:900, textAlign:vertical?'center':'left'}}><Badge>HOOK · 0—5s</Badge><div style={{height:24}}/><Title size={vertical?76:70}>우리 아이 책 읽기,<br/><span style={{color:ORANGE}}>읽기만 하면 끝일까요?</span></Title><div style={{marginTop:35,fontSize:30,color:'#58708A',fontWeight:700}}>책은 읽는데… 제대로 이해한 걸까?</div></div></div><div style={{position:'absolute', right:vertical?'8%':'6%', top:'18%', fontSize:120, fontWeight:900, color:ORANGE, opacity:.18, transform:`rotate(${Math.sin(f/8)*8}deg)`}}>?</div><Audio src={staticFile('audio/page.wav')} volume={f<150?0.7:0}/></AbsoluteFill>;
}
function Scene2({vertical}: Props) {
  const f=useCurrentFrame(); const p=spring({frame:f,fps:30,config:{damping:12,stiffness:90}}); const s=interpolate(p,[0,1],[.7,1]);
  return <AbsoluteFill style={{background:'#fff',fontFamily:W,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:vertical?'86%':'82%', display:'flex', flexDirection:vertical?'column':'row', alignItems:'center', justifyContent:'center', gap:70}}><div style={{transform:`scale(${s})`}}><Wheel/></div><div style={{textAlign:vertical?'center':'left',maxWidth:850}}><Badge>SOLUTION 1 · 5—11s</Badge><div style={{height:22}}/><Title size={vertical?72:66}>과학적 KReaD 지수로<br/><span style={{color:BLUE}}>8개 영역 균형 독서!</span></Title><div style={{marginTop:30,fontSize:28,lineHeight:1.5,color:'#536B83'}}>KReaD 기반 맞춤 도서와<br/>8개 영역 큐레이션으로 독서 편식 끝!</div></div></div><Audio src={staticFile('audio/snap.wav')} volume={f<100?0.55:0}/></AbsoluteFill>;
}
function Scene3({vertical}: Props) {
  const f=useCurrentFrame(); const p=spring({frame:f,fps:30,config:{damping:14,stiffness:100}}); const bars=Array.from({length:12});
  return <AbsoluteFill style={{background:'linear-gradient(135deg,#F8FCFF,#EEF7FF)',fontFamily:W,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:vertical?'86%':'82%',display:'flex',flexDirection:vertical?'column':'row',alignItems:'center',gap:70}}><Card style={{width:vertical?'100%':620,padding:45}}><div style={{fontSize:24,color:BLUE,fontWeight:900}}>READING FLUENCY</div><div style={{display:'flex',alignItems:'end',gap:12,height:170,marginTop:35}}>{bars.map((_,i)=><div key={i} style={{width:22,height:40+(i%4)*28,background:i>8?ORANGE:BLUE,borderRadius:10,transform:`scaleY(${p})`,transformOrigin:'bottom'}}/>)}</div><div style={{marginTop:30,display:'flex',justifyContent:'space-between',fontWeight:900,color:NAVY}}><span>유창성</span><span style={{color:ORANGE}}>LEVEL UP ▲</span></div></Card><div style={{maxWidth:850,textAlign:vertical?'center':'left'}}><Badge>SOLUTION 2 · 11—17s</Badge><div style={{height:22}}/><Title size={vertical?70:64}>유창성 훈련부터<br/><span style={{color:ORANGE}}>독서 퀴즈까지 한눈에!</span></Title><div style={{marginTop:30,fontSize:28,lineHeight:1.5,color:'#536B83'}}>읽기 유창성 훈련과 독서 퀴즈로<br/>어휘력과 생각의 깊이를 키웁니다.</div></div></div><Audio src={staticFile('audio/pop.wav')} volume={f<120?0.55:0}/></AbsoluteFill>;
}
function Scene4({vertical}: Props) {
  const f=useCurrentFrame(); const p=spring({frame:f,fps:30,config:{damping:13,stiffness:85}}); const line=interpolate(f,[0,90],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <AbsoluteFill style={{background:'#fff',fontFamily:W,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:vertical?'86%':'84%',display:'flex',flexDirection:vertical?'column':'row',alignItems:'center',gap:60}}><div style={{width:vertical?'100%':700,height:430,position:'relative'}}><div style={{position:'absolute',left:40,top:130,width:170,height:170,borderRadius:'50%',background:SKY,border:`8px solid ${BLUE}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:42}}>👦</div><div style={{position:'absolute',left:260,top:80,width:190,height:190,borderRadius:32,background:NAVY,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:35,fontWeight:900}}>1:1<br/>선생님</div><div style={{position:'absolute',left:210,top:250,width:360,height:8,background:ORANGE,borderRadius:8,transform:`scaleX(${line})`,transformOrigin:'left'}}/><div style={{position:'absolute',right:20,top:190,width:160,height:160,borderRadius:28,background:'#FFF4EA',border:`6px solid ${ORANGE}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,fontWeight:900,color:NAVY,transform:`scale(${p})`}}>중등<br/>서술형·논술</div></div><div style={{maxWidth:820,textAlign:vertical?'center':'left'}}><Badge>SOLUTION 3·4 · 17—24s</Badge><div style={{height:22}}/><Title size={vertical?68:62}>1:1 밀착 케어 ➜<br/><span style={{color:BLUE}}>초등 독서가 중등 논술로!</span></Title><div style={{marginTop:30,fontSize:28,lineHeight:1.5,color:'#536B83'}}>전문 선생님의 1:1 밀착 관리로<br/>초등 독서가 중등 논술의 힘이 됩니다.</div></div></div><Audio src={staticFile('audio/rise.wav')} volume={f<180?0.5:0}/></AbsoluteFill>;
}
function Scene5({vertical}: Props) {
  const f=useCurrentFrame(); const p=spring({frame:f,fps:30,config:{damping:11,stiffness:90}}); const glow=0.7+Math.sin(f/10)*0.2;
  return <AbsoluteFill style={{background:`linear-gradient(135deg,${NAVY},#0B2B4C)`,fontFamily:W,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:vertical?'86%':'80%',textAlign:'center',color:'#fff'}}><div style={{fontSize:30,fontWeight:800,letterSpacing:2,opacity:.8}}>SOLUNI · MILCHAK DOKSEO</div><div style={{height:35}}/><div style={{fontSize:vertical?74:68,fontWeight:900,lineHeight:1.18}}>독서 습관부터<br/><span style={{color:'#FFB36D'}}>표현력까지</span></div><div style={{height:40}}/><div style={{display:'inline-flex',alignItems:'center',gap:18,padding:'24px 42px',borderRadius:999,background:ORANGE,boxShadow:`0 0 50px rgba(245,130,32,${glow})`,transform:`scale(${interpolate(p,[0,1],[.75,1])})`,fontSize:32,fontWeight:900}}>솔루니 밀착독서</div><div style={{marginTop:42,fontSize:28,opacity:.9}}>지금, 우리 아이 독서 성장을 시작하세요!</div><div style={{margin:'48px auto 0',width:vertical?'78%':520,padding:'20px 26px',borderRadius:18,background:'#fff',color:NAVY,fontSize:26,fontWeight:900}}>독서 진단 신청하기  ↗</div></div><div style={{position:'absolute',top:'10%',left:'8%',width:18,height:18,borderRadius:'50%',background:ORANGE,boxShadow:'0 0 25px #F58220'}}/><div style={{position:'absolute',bottom:'12%',right:'9%',width:12,height:12,borderRadius:'50%',background:'#fff',opacity:.8}}/><Audio src={staticFile('audio/click.wav')} volume={f>120?0.6:0}/></AbsoluteFill>;
}

export const SolruniMotion = ({vertical}: Props) => {
  const f=useCurrentFrame();
  const scene=(start:number,end:number,Comp:React.FC<Props>)=><Sequence from={start} durationInFrames={end-start}><Comp vertical={vertical}/></Sequence>;
  return <AbsoluteFill style={{fontFamily:W,overflow:'hidden'}}>{scene(0,150,Scene1)}{scene(150,330,Scene2)}{scene(330,510,Scene3)}{scene(510,720,Scene4)}{scene(720,900,Scene5)}<div style={{position:'absolute',left:0,right:0,bottom:24,textAlign:'center',fontFamily:W,fontSize:18,fontWeight:700,color:'rgba(255,255,255,.35)',zIndex:20}}>SOLUNI MILCHAK DOKSEO · 2026</div></AbsoluteFill>;
};
