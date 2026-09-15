export function createUniverse(canvas,{isEnabled,isVisible,isEntering}){
 const ctx=canvas.getContext('2d');if(!ctx)return {start(){},stop(){}};
 let width=0,height=0,frame=0,last=0,speed=.38;
 const symbols=['0','1','2','3','5','8','13','21','34','89','144','π','λ','ε','Σ','Δ','θ','ω','Φ','ψ','∞','ℏ','E = hf','F = ma','v = fλ','E = mc²','∫','√2'];
 const makePoint=()=>{const angle=Math.random()*Math.PI*2,r=.3+Math.random()*.95;return {x:Math.cos(angle)*r,y:Math.sin(angle)*r,z:.2+Math.random()*2.3};};
 const stars=Array.from({length:200},()=>({...makePoint(),r:.3+Math.random()}));
 const glyphs=Array.from({length:52},(_,i)=>({...makePoint(),text:symbols[i%symbols.length],size:21+Math.random()*9}));
 const reset=p=>{Object.assign(p,makePoint());p.z=2.5;};
 const project=(p,z)=>({x:width/2+p.x*width*.62/z,y:height/2+p.y*height*.8/z});
 function render(now){frame=0;if(!isVisible()||document.hidden)return;const dt=Math.min((now-last)/1000||.016,.04);last=now;const moving=isEnabled();const target=isEntering()?3.8:.38;speed+=(target-speed)*Math.min(1,dt*6);ctx.clearRect(0,0,width,height);
  for(const p of stars){const before=project(p,p.z);if(moving)p.z-=dt*speed;if(p.z<.11){reset(p);continue;}const at=project(p,p.z);if(at.x<-20||at.x>width+20||at.y<-20||at.y>height+20){reset(p);continue;}const alpha=Math.min(.85,.17+.2/p.z);ctx.fillStyle=`rgba(174,210,255,${alpha})`;ctx.beginPath();ctx.arc(at.x,at.y,Math.min(2.2,p.r/p.z),0,Math.PI*2);ctx.fill();if(moving){ctx.strokeStyle=`rgba(146,193,255,${alpha*.65})`;ctx.lineWidth=Math.min(1.5,.7/p.z);ctx.beginPath();ctx.moveTo(before.x,before.y);ctx.lineTo(at.x,at.y);ctx.stroke();}}
  for(const p of glyphs){if(moving)p.z-=dt*speed*.86;if(p.z<.18){reset(p);continue;}const at=project(p,p.z),size=Math.min(77,p.size/p.z);if(at.x<-100||at.x>width+100||at.y<-100||at.y>height+100){reset(p);continue;}ctx.font=`${p.text.length>3?'italic ':''}${size}px Georgia, serif`;ctx.textAlign='center';ctx.fillStyle=`rgba(145,192,255,${Math.min(.64,.17+.17/p.z)})`;ctx.fillText(p.text,at.x,at.y);}
  if(moving)frame=requestAnimationFrame(render);
 }
 function stop(){cancelAnimationFrame(frame);frame=0;}
 function start(){stop();last=performance.now();render(last);}
 function resize(){width=canvas.clientWidth||innerWidth;height=canvas.clientHeight||innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=width*d;canvas.height=height*d;ctx.setTransform(d,0,0,d,0,0);start();}
 window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>document.hidden?stop():start());resize();
 return {start,stop};
}
