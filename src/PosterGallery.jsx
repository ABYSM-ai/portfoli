import React, {useEffect, useRef, useState} from 'react';
import posters from './posters.json';
import './PosterGallery.css';

const categories = ['全部', '真假中国风', '动物', '风景', '邮票'];
const categoryName = {'自然观察':'动物', '旅行片刻':'风景', '城市印记':'邮票'};
const categoryOf = p => categoryName[p.category] || p.category;

export default function PosterGallery({open, onClose}) {
  const dialog = useRef(null), stage = useRef(null), tracks = useRef([]);
  const motion = useRef({target:0, current:0}), gesture = useRef(null), ignoreClick = useRef(0);
  const detailRef = useRef(null), origin = useRef(null), image = useRef(null);
  const [category, setCategory] = useState('全部');
  const [detail, setDetail] = useState(null);
  const [columns, setColumns] = useState(() => window.innerWidth < 700 ? 2 : 4);
  const filtered = posters.filter(p => category === '全部' || categoryOf(p) === category);
  const groups = Array.from({length:columns}, (_,i) => filtered.filter((_,j) => j % columns === i));
  detailRef.current = detail;

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setDetail(null);
    dialog.current.showModal();
    const resize = () => setColumns(window.innerWidth < 700 ? 2 : 4);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      dialog.current?.close();
      document.body.style.overflow = oldOverflow;
      previousFocus?.focus({preventScroll:true});
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    motion.current = {target:0,current:0};
    const element = stage.current;
    const wheel = e => {
      if (detailRef.current) return;
      e.preventDefault();
      motion.current.target += (e.deltaY || e.deltaX) * (e.deltaMode === 1 ? 20 : 1);
    };
    element.addEventListener('wheel', wheel, {passive:false});
    let frame;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      if (!detailRef.current) {
        const m = motion.current;
        m.current += (m.target - m.current) * (reduced ? 1 : .085);
        tracks.current.forEach((track,i) => {
          if (!track) return;
          const height = track.firstElementChild?.getBoundingClientRect().height || 1;
          const speed = [1,.72,1.15,.86][i];
          const offset = ((m.current * speed + i * 153) % height + height) % height;
          track.style.transform = `translate3d(0,${-height - offset}px,0)`;
        });
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {cancelAnimationFrame(frame); element.removeEventListener('wheel', wheel);};
  }, [open, category, columns]);

  useEffect(() => {
    if (!detail || !image.current) return;
    const el = image.current, start = origin.current;
    if (!start || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const end = el.getBoundingClientRect();
    el.animate([
      {transform:`translate(${start.x-end.x}px, ${start.y-end.y}px) scale(${start.width/end.width}, ${start.height/end.height})`, opacity:.65},
      {transform:'translate(0,0) scale(1)', opacity:1}
    ], {duration:650,easing:'cubic-bezier(.22,1,.36,1)'});
  }, [detail]);

  const view = (p, event) => {
    if (performance.now() < ignoreClick.current) return;
    origin.current = event.currentTarget.querySelector('img').getBoundingClientRect();
    setDetail(p);
  };
  const endDrag = e => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    if (g.moved) ignoreClick.current = performance.now() + 400;
    gesture.current = null;
    stage.current?.classList.remove('is-dragging');
    if (stage.current?.hasPointerCapture(e.pointerId)) stage.current.releasePointerCapture(e.pointerId);
  };
  return <dialog ref={dialog} className="poster-gallery" aria-label="海报设计作品集" onCancel={e=>{e.preventDefault(); if(detail) setDetail(null); else onClose();}}>
    <header className="poster-gallery-header" inert={detail ? true : undefined}>
      <div><span className="poster-eyebrow">LIU NIAN / SELECTED POSTERS</span><h2>Poster Design<span>海报设计</span></h2></div>
      <button className="poster-close" aria-label="关闭海报作品集" onClick={onClose}>×</button>
    </header>
    <nav className="poster-filters" aria-label="海报分类" inert={detail ? true : undefined}>{categories.map(c=><button key={c} aria-pressed={category===c} onClick={()=>{setCategory(c); setDetail(null);}}>{c}<sup>{c==='全部'?posters.length:posters.filter(p=>categoryOf(p)===c).length}</sup></button>)}</nav>
    <div ref={stage} className="poster-stage" inert={detail ? true : undefined} tabIndex={0} aria-label="无限海报画廊，可滚动、上下拖动或使用方向键浏览"
      onKeyDown={e=>{if(detail) return; if(['ArrowDown','ArrowRight','PageDown','ArrowUp','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault(); motion.current.target += ['ArrowUp','ArrowLeft','PageUp'].includes(e.key)?-300:300;}}}
      onPointerDown={e=>{if(e.pointerType==='mouse'&&e.button!==0) return; gesture.current={id:e.pointerId,y:e.clientY,moved:false,last:e.clientY};}}
      onPointerMove={e=>{const g=gesture.current; if(!g||g.id!==e.pointerId) return; if(Math.abs(e.clientY-g.y)>7) {g.moved=true; stage.current.setPointerCapture(e.pointerId); stage.current.classList.add('is-dragging');} if(g.moved) motion.current.target += (g.last-e.clientY)*1.3; g.last=e.clientY;}}
      onPointerUp={endDrag} onPointerCancel={endDrag}>
      {groups.map((group,i)=><div className="poster-column" key={i}><div ref={el=>{tracks.current[i]=el;}} className="poster-track">{[0,1,2].map(copy=><div className="poster-set" key={copy} aria-hidden={copy!==1?true:undefined}>{Array.from({length:Math.max(1,Math.ceil(3/group.length))},()=>group).flat().map((p,repeat)=><button className="poster-item" key={`${p.id}-${repeat}`} tabIndex={copy===1?0:-1} onClick={e=>view(p,e)} aria-label={`查看${p.title}`}><img src={p.src} alt={p.title} width={p.width} height={p.height} draggable="false"/><span><b>{p.title}</b><small>{categoryOf(p)} <i>↗</i></small></span></button>)}</div>)}</div></div>)}
    </div>
    <footer className="poster-gallery-footer" inert={detail ? true : undefined}><span>{String(filtered.length).padStart(2,'0')} POSTERS / {category}</span><span>滚动或上下拖动浏览 · 点击放大 <span className="poster-key-hint">· ESC 返回</span></span><span aria-hidden="true">↓</span></footer>
    {detail&&<section className="poster-detail" role="dialog" aria-modal="true" aria-label={detail.title}>
      <button className="poster-detail-back" autoFocus onClick={()=>setDetail(null)}>← 返回画廊</button>
      <div className="poster-detail-image"><img ref={image} src={detail.original} alt={detail.title} style={{aspectRatio:`${detail.width}/${detail.height}`}}/></div>
      <aside><span className="poster-eyebrow">{String(detail.id).padStart(2,'0')} / {categoryOf(detail)}</span><h3>{detail.title}</h3><p>{detail.width} × {detail.height} PX</p><a href={detail.original} target="_blank" rel="noreferrer">查看高清原图 ↗</a><div className="poster-detail-nav"><button aria-label="上一张海报" onClick={()=>{origin.current=null; setDetail(filtered[(filtered.findIndex(p=>p.id===detail.id)-1+filtered.length)%filtered.length]);}}>←</button><span>{filtered.findIndex(p=>p.id===detail.id)+1} / {filtered.length}</span><button aria-label="下一张海报" onClick={()=>{origin.current=null; setDetail(filtered[(filtered.findIndex(p=>p.id===detail.id)+1)%filtered.length]);}}>→</button></div></aside>
    </section>}
  </dialog>;
}
