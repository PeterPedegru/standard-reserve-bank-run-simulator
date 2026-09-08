'use client';
import {useEffect,type RefObject} from 'react';

/** Decorative pointer feedback only. No simulation state or global cursor changes. */
export function usePointerLight(rootRef:RefObject<HTMLDivElement|null>){
  useEffect(()=>{
    const root=rootRef.current;
    if(!root)return;
    const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    let active:HTMLElement|null=null,frame=0,x=0,y=0;
    function reset(){
      if(frame)cancelAnimationFrame(frame);
      frame=0;
      if(active){delete active.dataset.pointer;active.style.removeProperty('--pointer-x');active.style.removeProperty('--pointer-y');}
      active=null;
    }
    function move(event:PointerEvent){
      if(event.pointerType!=='mouse'||!fine.matches||reduced.matches){reset();return;}
      const card=event.target instanceof Element?event.target.closest<HTMLElement>('.metric,.flow-card,.chart-panel,.policy-panel,.bank-panel'):null;
      if(!card||!root?.contains(card)){reset();return;}
      if(active!==card){reset();active=card;}
      x=event.clientX;y=event.clientY;
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;if(!active)return;
        const rect=active.getBoundingClientRect();
        active.style.setProperty('--pointer-x',`${x-rect.left}px`);
        active.style.setProperty('--pointer-y',`${y-rect.top}px`);
        active.dataset.pointer='true';
      });
    }
    root.addEventListener('pointermove',move,{passive:true});
    root.addEventListener('pointerleave',reset);
    fine.addEventListener('change',reset);reduced.addEventListener('change',reset);
    window.addEventListener('blur',reset);
    return()=>{reset();root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',reset);fine.removeEventListener('change',reset);reduced.removeEventListener('change',reset);window.removeEventListener('blur',reset);};
  },[rootRef]);
}
