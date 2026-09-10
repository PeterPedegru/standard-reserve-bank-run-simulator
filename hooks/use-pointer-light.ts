'use client';
import {useEffect,type RefObject} from 'react';

/** Decorative pointer feedback only. No simulation state or global cursor changes. */
export function usePointerLight(rootRef:RefObject<HTMLDivElement|null>){
  useEffect(()=>{
    const root=rootRef.current;
    if(!root)return;
    const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,x=0,y=0,tracking=false;
    function reset(){
      if(frame)cancelAnimationFrame(frame);
      frame=0;
      tracking=false;
      if(root){delete root.dataset.pointer;root.style.removeProperty('--pointer-x');root.style.removeProperty('--pointer-y');root.style.removeProperty('--pointer-clip');}
    }
    function update(){
      if(frame||!tracking)return;
      frame=requestAnimationFrame(()=>{
        frame=0;if(!root)return;
        const target=document.elementFromPoint(x,y);
        const chart=root.querySelector('.chart-panel')?.getBoundingClientRect();
        // Cut a hole out of the viewport overlay, including when the pointer is nearby.
        const outer='0px 0px, 100% 0px, 100% 100%, 0px 100%, 0px 0px';
        root.style.setProperty('--pointer-clip',chart?`polygon(evenodd, ${outer}, ${chart.left}px ${chart.top}px, ${chart.right}px ${chart.top}px, ${chart.right}px ${chart.bottom}px, ${chart.left}px ${chart.bottom}px, ${chart.left}px ${chart.top}px, 0px 0px)`:'none');
        root.style.setProperty('--pointer-x',`${x}px`);
        root.style.setProperty('--pointer-y',`${y}px`);
        if(!target||!root.contains(target)||target.closest('.chart-panel'))delete root.dataset.pointer;
        else root.dataset.pointer='true';
      });
    }
    function move(event:PointerEvent){
      if(event.pointerType!=='mouse'||!fine.matches||reduced.matches){reset();return;}
      x=event.clientX;y=event.clientY;tracking=true;update();
    }
    root.addEventListener('pointermove',move,{passive:true});
    root.addEventListener('pointerleave',reset);
    fine.addEventListener('change',reset);reduced.addEventListener('change',reset);
    window.addEventListener('blur',reset);
    window.addEventListener('scroll',update,{passive:true,capture:true});
    window.addEventListener('resize',update);
    const observer=new ResizeObserver(update);observer.observe(root);
    const chart=root.querySelector('.chart-panel');if(chart)observer.observe(chart);
    return()=>{reset();observer.disconnect();root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',reset);fine.removeEventListener('change',reset);reduced.removeEventListener('change',reset);window.removeEventListener('blur',reset);window.removeEventListener('scroll',update,true);window.removeEventListener('resize',update);};
  },[rootRef]);
}
