/** Map the pointer onto the existing 0–14 day timeline, independent of SVG scaling. */
export function pointerDay(clientX:number,rectLeft:number,rectWidth:number,viewWidth:number,left=65,right=15){
  if(![clientX,rectLeft,rectWidth,viewWidth].every(Number.isFinite)||rectWidth<=0||viewWidth<=left+right)return 0;
  const plotX=(clientX-rectLeft)/rectWidth*viewWidth-left;
  return Math.max(0,Math.min(14,Math.round(plotX/(viewWidth-left-right)*14)));
}

export function keyboardDay(key:string,day:number):number|null{
  if(key==='Home')return 0;
  if(key==='End')return 14;
  if(key==='ArrowLeft'||key==='ArrowDown')return Math.max(0,day-1);
  if(key==='ArrowRight'||key==='ArrowUp')return Math.min(14,day+1);
  return null;
}
