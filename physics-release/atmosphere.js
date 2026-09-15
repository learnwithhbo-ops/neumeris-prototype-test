// A quiet field of mathematical symbols behind the practice wheel.
export function createAtmosphere(isEnabled){
 const canvas=document.createElement('canvas');canvas.className='practice-atmosphere';canvas.setAttribute('aria-hidden','true');document.body.prepend(canvas);
 const ctx=canvas.getContext('2d');if(!ctx)return {refresh(){}};
 const glyphs=['π','λ','ε','Σ','θ','Φ','∞','ℏ','Δ','ψ','0','1','2','8','13','21'];
 const points=Array.from({length:34},(_,i)=>({x:Math.random(),y:Math.random(),phase:Math.random()*6.28,size:18+Math.random()*22,text:glyphs[i%glyphs.length],speed:5+Math.random()*9}));
 let width=0,height=0,frame=0,last=0,time=0;
 const visible=()=>document.body.dataset.experience==='practice'&&!document.hidden;
 function draw(now){frame=0;if(!visible())return;const dt=Math.min(.04,(now-last)/1000||.016);last=now;if(isEnabled())time+=dt;ctx.clearRect(0,0,width,height);
  for(const p of points){const x=p.x*width+Math.sin(time*.16+p.phase)*24,y=((p.y*height-time*p.speed)%(height+80)+height+80)%(height+80)-40;ctx.font=`${p.size}px Georgia,serif`;ctx.fillStyle='rgba(45,91,166,.16)';ctx.fillText(p.text,x,y);}
  if(isEnabled())frame=requestAnimationFrame(draw);
 }
 function refresh(){cancelAnimationFrame(frame);canvas.hidden=!visible();last=performance.now();if(visible())draw(last);}
 function resize(){width=innerWidth;height=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);refresh();}
 addEventListener('resize',resize);document.addEventListener('visibilitychange',refresh);resize();return {refresh};
}
