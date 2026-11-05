import {useEffect, useRef, useState} from 'react';
import './Honors.css';

const awards = [
  {title:'未来设计师大赛',date:'2025.08',level:'国赛一等奖',featured:true,files:[['ncda-national.png','三星堆—神谕千年 · 全国总决赛一等奖获奖证明']]},
  {title:'中国好创意设计大赛',date:'2025.08',level:'国赛二等奖',featured:true,files:[['creative-national.png','基于设计心理学的无线耳机设计 · 国赛二等奖']]},
  {title:'《元梦之星》设计马拉松',date:'2024',level:'金奖',featured:true,files:[["dream-star-gold-1.png", "《元梦之星》设计马拉松 · 金奖证书", "dream-star-gold.pdf"]]},
  {title:'未来设计师大赛',date:'2025.08',level:'省级一等奖',files:[['ncda-sanxingdui-provincial.jpg','三星堆—神谕千年 · 云南赛区一等奖'],['ncda-tea-provincial.png','茶马古道滇藏道南端-缘起 · 云南赛区一等奖']]},
  {title:'华灿奖',date:'2025.12',level:'赛区二等奖',files:[['huacan-lotus.jpg','步步为莲 · 赛区二等奖','huacan-lotus.pdf'],['huacan-dog.jpg','宠物狗助行器外观造型设计 · 赛区二等奖','huacan-dog.pdf']]},
  {title:'中国好创意设计大赛',date:'2025.08',level:'省级二等奖',files:[['creative-provincial.png','RESCUE 森林火灾智能探测设备 · 云南赛区二等奖']]},
  {title:'未来设计师大赛',date:'2025.08',level:'省级二等奖',files:[['ncda-provincial-second.jpg','未来探月旅行胶囊概念设计 · 云南赛区二等奖']]},
];

export default function Honors(){
  const [active,setActive]=useState(null);
  const [index,setIndex]=useState(0);
  const [zoom,setZoom]=useState(false);
  const dialog=useRef(null);
  useEffect(()=>{
    if(!active)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow='hidden';
    dialog.current.showModal();
    return ()=>{document.body.style.overflow=previous;};
  },[active]);
  const close=()=>{dialog.current?.close();setActive(null);setZoom(false);};
  const change=(next)=>{setIndex(next);setZoom(false);};
  const file=active?.files[index];
  return <div className="honors" id="honors"><div className="career-label"><span>RECOGNITION / 荣誉与竞赛</span><h3>让探索，留下回响。</h3></div><div className="honors-grid">{awards.map(award=><button type="button" className={'honor-card honor-button'+(award.featured?' honor-featured':'')} key={award.title+award.level} disabled={!award.files.length} onClick={()=>{setIndex(0);setZoom(false);setActive(award);}} aria-label={`${award.title} · ${award.level}${award.files.length?'，查看证书':'，证书待补充'}`}><div><time>{award.date}</time><h4>{award.title}</h4><small className="certificate-hint">{award.files.length?`查看证书${award.files.length>1?` · ${award.files.length} 份`:''} ↗`:'证书待补充'}</small></div><span>{award.level}</span></button>)}</div>
  {active&&<dialog ref={dialog} className="award-dialog" aria-labelledby="award-title" onCancel={event=>{event.preventDefault();close();}} onClick={event=>{if(event.target===dialog.current)close();}} onKeyDown={event=>{if(event.key==='ArrowRight'&&index<active.files.length-1)change(index+1);if(event.key==='ArrowLeft'&&index>0)change(index-1);}}><div className="award-dialog-inner"><header><div><span>{active.level} / {active.date}</span><h2 id="award-title">{active.title}</h2></div><button type="button" autoFocus onClick={close} aria-label="关闭证书">×</button></header><div className={'certificate-stage'+(zoom?' is-zoomed':'')}><button className="certificate-image" type="button" onClick={()=>setZoom(!zoom)} aria-label={zoom?'缩小证书':'放大证书'}><img src={'/awards/'+file[0]} alt={file[1]}/></button></div><div className="certificate-toolbar"><button disabled={index===0} onClick={()=>change(index-1)} aria-label="上一份证书">←</button><p>{file[1]}<small>{index+1} / {active.files.length} · 点击图片{zoom?'缩小':'放大'}</small></p><button disabled={index===active.files.length-1} onClick={()=>change(index+1)} aria-label="下一份证书">→</button></div><a className="certificate-original" href={'/awards/'+(file[2]||file[0])} target="_blank" rel="noreferrer">{file[2]?'打开原始 PDF':'打开原图'} ↗</a></div></dialog>}
  </div>;
}

