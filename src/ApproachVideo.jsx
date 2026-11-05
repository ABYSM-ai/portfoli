import {useEffect,useRef,useState} from 'react';
const videoUrl='https://stream.mux.com/PkFsoKeakRLgL01gjf02CRcSbsJ600Z00NvLr9eRZ92pLbA.m3u8';
export default function ApproachVideo(){
 const ref=useRef(null);
 const [failed,setFailed]=useState(false);
 const [playing,setPlaying]=useState(false);
 useEffect(()=>{
  const video=ref.current;
  let disposed=false,hls;
  import('hls.js').then(({default:Hls})=>{
   if(disposed)return;
   if(Hls.isSupported()){
    hls=new Hls({capLevelToPlayerSize:false,startLevel:0});
    hls.on(Hls.Events.MANIFEST_PARSED,()=>{
     const best=hls.levels.reduce((highest,level,i)=>level.height>hls.levels[highest].height?i:highest,0);
     hls.currentLevel=best;
     video.play().catch(()=>{});
    });
    hls.on(Hls.Events.ERROR,(_,data)=>{if(data.fatal)setFailed(true);});
    hls.loadSource(videoUrl);
    hls.attachMedia(video);
   }else if(video.canPlayType('application/vnd.apple.mpegurl')){
    video.src=videoUrl;
    video.play().catch(()=>{});
   }else setFailed(true);
  }).catch(()=>{if(!disposed)setFailed(true);});
  return()=>{disposed=true;hls?.destroy();video.removeAttribute('src');video.load();};
 },[]);
 return <div className="approach-video-frame"><video ref={ref} className="approach-showcase-video" autoPlay muted loop playsInline preload="metadata" aria-label="设计展示视频" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>setFailed(true)}/><button className="showcase-play-toggle" type="button" aria-label={playing?"暂停视频":"播放视频"} onClick={()=>{const video=ref.current;if(video.paused)video.play().catch(()=>setFailed(true));else video.pause();}}>{playing?"暂停 Ⅱ":"播放 ▷"}</button>{failed&&<a href={videoUrl} target="_blank" rel="noreferrer">打开原视频 ↗</a>}</div>;
}
