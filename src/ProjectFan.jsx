import {useRef,useState} from 'react';
import './ProjectFan.css';

export default function ProjectFan({projects,Artwork,onSelect}){
 const [active,setActive]=useState(null);
 const [offset,setOffset]=useState(0);
 const [dragging,setDragging]=useState(false);
 const gesture=useRef(null),suppressClick=useRef(false),hoverPoint=useRef(null);
 const middle=(projects.length-1)/2;
 const select=step=>{setActive(i=>((i??Math.floor(middle))+step+projects.length)%projects.length);setOffset(0);};
 const hoverCard=(e,index)=>{
  if(e.pointerType!=='mouse'||gesture.current)return;
  const previous=hoverPoint.current;
  if(previous&&Math.hypot(e.clientX-previous.x,e.clientY-previous.y)<12)return;
  hoverPoint.current={x:e.clientX,y:e.clientY};setActive(index);
 };
 const begin=e=>{
  if(!e.isPrimary||e.button!==0)return;
  suppressClick.current=false;
  const target=e.target.closest('button')||e.currentTarget;
  target.setPointerCapture(e.pointerId);
  gesture.current={pointerId:e.pointerId,x:e.clientX,y:e.clientY,startOffset:offset,dragged:false};
 };
 const move=e=>{
  const g=gesture.current;if(!g||e.pointerId!==g.pointerId)return;
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.dragged&&Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){gesture.current=null;return;}
  if(!g.dragged&&Math.abs(dx)>6){g.dragged=true;suppressClick.current=true;setDragging(true);}
  if(g.dragged)setOffset(Math.max(-260,Math.min(260,g.startOffset+dx)));
 };
 const finish=()=>{gesture.current=null;setDragging(false);};
 return <div className="project-directory"><div className={'project-fan project-fan-reference'+(dragging?' is-dragging':'')} onPointerLeave={()=>{if(!gesture.current){setActive(null);hoverPoint.current=null;}}} onPointerDown={begin} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} onClickCapture={e=>{if(e.detail!==0&&suppressClick.current){e.preventDefault();e.stopPropagation();suppressClick.current=false;}}} onDragStart={e=>e.preventDefault()} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();select(-1);}if(e.key==='ArrowRight'){e.preventDefault();select(1);}}}>
 {projects.map((p,i)=>{const distance=i-(active??middle),depth=Math.abs(distance),raised=active!==null&&distance===0;const scale=distance===0?(raised?1.1:1):(active!==null?1.1:1)-(depth<=1?depth*.08:.08+(depth-1)*.18);return <button type="button" key={p.id} className={'fan-card fan-card-'+p.id+(raised?' is-active':'')} style={{'--distance':distance,'--drop':depth*14+'px','--angle':distance===0?'0deg':Math.sign(distance)*(6+depth*10)+'deg','--lift':raised?'-84px':'0px','--offset':offset+'px','--fan-scale':scale,zIndex:100-depth}} onPointerEnter={e=>hoverCard(e,i)} onPointerMove={e=>hoverCard(e,i)} onFocus={()=>setActive(i)} onBlur={()=>setActive(current=>current===i?null:current)} onClick={()=>onSelect(p)} aria-label={`查看项目 ${p.name}`}><div className="fan-card-top"><span>LIU NIAN / SELECTED WORK</span><b>{p.id}</b></div><div className="fan-art"><Artwork kind={p.kind}/></div><div className="fan-card-copy"><span>{p.type} / {p.year}</span><h3>{p.name}</h3><p>{p.desc}</p></div><div className="fan-card-foot"><span>EXPLORE PROJECT</span><span>↗</span></div></button>})}
 </div><div className="fan-controls" aria-label="切换作品"><button type="button" aria-label="上一组作品" onClick={()=>select(-1)}>←</button>{projects.map((p,i)=><button type="button" key={p.id} className={active===i?'is-active':''} aria-label={`切换到 ${p.name}`} aria-pressed={active===i} onClick={()=>{setActive(i);setOffset(0);}}>{p.id}</button>)}<button type="button" aria-label="下一组作品" onClick={()=>select(1)}>→</button></div><p className="fan-hint">按住左右拖动 · 悬停弹出摆正 · 点击查看作品集</p></div>;
}
