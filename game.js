/* MAZE CLASH / SHADOW PROTOCOL — SysOne Academy
   Browser-hosted multiplayer: host is authoritative for movement, bullets, loot and visibility.
   No tracking, accounts or real-money purchases. PeerJS public signaling: best for small private rooms.
*/
'use strict';
const $ = id => document.getElementById(id);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const rand=(a,b)=>a+Math.random()*(b-a);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const safeName=v=>String(v||'OPERATIVE').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,18)||'OPERATIVE';
const fmtTime=s=>`${String(Math.max(0,Math.floor(s/60))).padStart(2,'0')}:${String(Math.max(0,Math.floor(s%60))).padStart(2,'0')}`;
const uid=()=>Math.random().toString(36).slice(2,10);
const MODES={
  team:{name:'TEAM CLASH',summary:'Qizillar vs Ko‘klar. Raqiblarni yenging va data-core qurilmasini himoya qiling yoki faollashtiring.',type:'tactical'},
  ffa:{name:'FREE FOR ALL',summary:'Barcha o‘yinchilar mustaqil. Eng ko‘p raqibni yenggan va omon qolgan g‘olib.',type:'survival'},
  impostor:{name:'SECRET AGENT',summary:'Agentlar topshiriqlarni bajaradi. Xoin yashirin hujum qiladi; yig‘ilishda kimga ishonishni hal qiling.',type:'social'},
  escape:{name:'MAZE ESCAPE',summary:'Uchta kod-parchani toping, jumboq yeching va chiqish portaliga birinchi yetib boring.',type:'puzzle'},
  double:{name:'DOUBLE AGENT',summary:'Ikki jamoa, lekin har biri orasida o‘z tomoniga sabotaj qiladigan sirli xoin bor.',type:'betrayal'}
};
const TEAMS=[{name:'QIZILLAR',color:'#f0806e'},{name:'KO‘KLAR',color:'#82b9d6'}];
const WEAPONS={
  pistol:{name:'MK1 PISTOL',class:'SIDEARM',price:0,mag:12,reserve:36,damage:19,speed:18,delay:310,load:1350,spread:.045,pellets:1,range:13,icon:'⌐'},
  smg:{name:'VECTOR SMG',class:'SMG',price:550,mag:24,reserve:72,damage:11,speed:19,delay:105,load:1750,spread:.17,pellets:1,range:10,icon:'≡'},
  rifle:{name:'AR-7 RIFLE',class:'ASSAULT',price:850,mag:30,reserve:90,damage:23,speed:24,delay:165,load:2150,spread:.07,pellets:1,range:16,icon:'⌁'},
  shotgun:{name:'BREACH-8',class:'SHOTGUN',price:700,mag:6,reserve:24,damage:11,speed:17,delay:850,load:2350,spread:.22,pellets:6,range:6,icon:'≋'},
  sniper:{name:'LONGSHOT',class:'MARKSMAN',price:1200,mag:5,reserve:15,damage:68,speed:36,delay:1100,load:2600,spread:.01,pellets:1,range:23,icon:'⟜'}
};
const SHOP=[
  {id:'pistol',name:'MK1 PISTOL',info:'12 / 36 · 19 DMG',cost:180,icon:'⌐',kind:'gun'},
  {id:'smg',name:'VECTOR SMG',info:'24 / 72 · TEZKOR',cost:550,icon:'≡',kind:'gun'},
  {id:'rifle',name:'AR-7 RIFLE',info:'30 / 90 · ANIQLIK',cost:850,icon:'⌁',kind:'gun'},
  {id:'shotgun',name:'BREACH-8',info:'6 / 24 · YAQINDAN',cost:700,icon:'≋',kind:'gun'},
  {id:'sniper',name:'LONGSHOT',info:'5 / 15 · UZOQDAN',cost:1200,icon:'⟜',kind:'gun'},
  {id:'ammo',name:'AMMO BOX',info:'+2 MAGAZIN / TANLANGAN',cost:170,icon:'▤',kind:'supply'},
  {id:'medkit',name:'MEDKIT',info:'+60 HP / MAX 100',cost:230,icon:'✚',kind:'supply'},
  {id:'armor',name:'ARMOR PLATE',info:'+50 ZIRH / MAX 100',cost:320,icon:'⬡',kind:'supply'},
  {id:'scanner',name:'RECON PULSE',info:'8 S RADAR / YAQIN RAQIBLAR',cost:280,icon:'◉',kind:'supply'},
  {id:'smoke',name:'SMOKE CANISTER',info:'10 S TUMAN / YASHIRINISH',cost:260,icon:'☷',kind:'supply'},
  {id:'energy',name:'ENERGY CELL',info:'TO‘LIQ STAMINA',cost:95,icon:'ϟ',kind:'supply'},
  {id:'key',name:'MASTER KEY',info:'BIR ESHIK / 1 KOD-BO‘LAK',cost:750,icon:'⟡',kind:'supply'}
];
const QUIZZES = window.MAZE_QUIZ_BANK || [];
if(QUIZZES.length!==1000) console.error('IT savollar bazasi yuklanmagan:',QUIZZES.length);
const app={screen:'home',mode:'team',room:'',isHost:false,hostPlays:true,peer:null,conn:null,clients:new Map(),connectionReady:false,localId:null,localName:'',config:null,world:null,view:null,map:null,discovered:new Set(),eventsSeen:new Set(),lastSnapshotAt:0,controls:{dx:0,dy:0,aim:0,fire:false,run:false},keys:new Set(),mouse:{x:0,y:0},usingPointer:false,mobileAim:0,joystickPointer:null,shopOpen:false,scoreOpen:false,puzzleOpen:null,meetingOpen:false,audio:false,audioCtx:null,lastTick:0,lastNet:0,lastHud:0,particles:[],screenShake:0,feed:[],heroTime:0,renderStarted:false,connectionTimeout:null};
const randomRoom=()=>{const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',arr=new Uint8Array(6);crypto.getRandomValues(arr);return [...arr].map(n=>chars[n%chars.length]).join('')};
const roomPeerId=code=>'mazeclash-sysone-'+code.toLowerCase();
const shareUrl=()=>`${location.origin}${location.pathname}?room=${encodeURIComponent(app.room)}`;
const setStatus=(s,error=false)=>{$('statusText').textContent=s;$('statusLight').classList.toggle('error',error)};
const toast=(s,bad=false)=>{const n=document.createElement('div');n.className='toast '+(bad?'bad':'ok');n.textContent=s;$('toastArea').append(n);setTimeout(()=>n.remove(),4200)};
const showScreen=name=>{app.screen=name;for(const id of ['homeScreen','configScreen','joinScreen','lobbyScreen','gameScreen'])$(id).classList.toggle('hidden',id!==name+'Screen');if(name==='game')$('gameCanvas').focus({preventScroll:true});window.scrollTo(0,0)};
const getConfig=()=>({mode:app.mode,duration:Number($('cfgDuration').value)*60,lives:app.mode==='impostor'?1:Number($('cfgLives').value),rounds:Number($('cfgRounds').value),mapSize:$('cfgMap').value,ammo:$('cfgAmmo').value,friendly:$('cfgFriendly').checked,puzzles:app.mode==='impostor'||app.mode==='escape'?true:$('cfgPuzzles').checked,radar:$('cfgRadar').checked,monsters:$('cfgMonsters').value,hostPlays:$('cfgHostPlays').checked});
const colorFor=(i)=>`hsl(${(i*137.508+32)%360} 72% 65%)`;
const playTone=(kind)=>{if(!app.audio)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;app.audioCtx??=new C();if(app.audioCtx.state==='suspended')app.audioCtx.resume();const ctx=app.audioCtx,osc=ctx.createOscillator(),gain=ctx.createGain(),now=ctx.currentTime;osc.type=kind==='hit'?'sawtooth':'triangle';osc.frequency.setValueAtTime(kind==='shot'?125:kind==='pickup'?580:kind==='death'?60:340,now);osc.frequency.exponentialRampToValueAtTime(kind==='shot'?55:kind==='death'?20:kind==='pickup'?930:180,now+.12);gain.gain.setValueAtTime(kind==='shot'?.07:.045,now);gain.gain.exponentialRampToValueAtTime(.001,now+.14);osc.connect(gain).connect(ctx.destination);osc.start(now);osc.stop(now+.15)}catch{}};
function extractCode(text){try{if(String(text).includes('room='))return (new URL(String(text),location.href)).searchParams.get('room')?.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,9)||''}catch{}return String(text||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,9)}
function initHero(){const c=$('heroCanvas'),ctx=c.getContext('2d');const n=25,grid=generateMaze(n,13659);let frame=0;function draw(){if(app.screen!=='home'){setTimeout(()=>requestAnimationFrame(draw),250);return}frame++;const w=c.width,h=c.height,t=w/n;ctx.fillStyle='#121a15';ctx.fillRect(0,0,w,h);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const wall=grid[y][x]===1,off=x*t;ctx.fillStyle=wall?(x+y)%3===0?'#344337':'#2d3c32':'#1d2b23';ctx.fillRect(off+1,y*t+1,t-2,t-2);if(wall){ctx.fillStyle='#54624d';ctx.fillRect(off,y*t,t,2);ctx.fillStyle='#151e18';ctx.fillRect(off+t-3,y*t,3,t)}else{ctx.fillStyle='#253a2b';ctx.fillRect(off+7,y*t+8,2,2)}}const px=13.5*t,py=12.3*t;const g=ctx.createRadialGradient(px,py,10,px,py,270);g.addColorStop(0,'#e4b75f20');g.addColorStop(.5,'#10181380');g.addColorStop(1,'#080e0af9');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.strokeStyle='#e3b75f55';ctx.lineWidth=1;ctx.beginPath();ctx.arc(px,py,82+Math.sin(frame*.014)*5,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#e4b75f';ctx.beginPath();ctx.arc(px,py,6,0,7);ctx.fill();ctx.strokeStyle='#e3b75f';ctx.beginPath();ctx.moveTo(px-13,py);ctx.lineTo(px+13,py);ctx.moveTo(px,py-13);ctx.lineTo(px,py+13);ctx.stroke();if(frame%8===0){ctx.fillStyle='#ff8065';ctx.fillRect(430+Math.sin(frame*.01)*5,160,7,7)}requestAnimationFrame(draw)}draw()}
function generateMaze(n,seed){n=n|1;const grid=Array.from({length:n},()=>Array(n).fill(1));let s=seed||Math.floor(Math.random()*2147483647);const next=()=>((s=(s*1664525+1013904223)>>>0)/4294967296);const stack=[[1,1]];grid[1][1]=0;while(stack.length){const [x,y]=stack[stack.length-1],dirs=[[0,-2],[2,0],[0,2],[-2,0]].sort(()=>next()-.5);let found=false;for(const [dx,dy]of dirs){const nx=x+dx,ny=y+dy;if(nx>0&&ny>0&&nx<n-1&&ny<n-1&&grid[ny][nx]){grid[y+dy/2][x+dx/2]=0;grid[ny][nx]=0;stack.push([nx,ny]);found=true;break}}if(!found)stack.pop()}
// Shortcuts and loops preserve navigability while reducing dead ends.
for(let y=2;y<n-2;y++)for(let x=2;x<n-2;x++)if(grid[y][x]&&next()<.105&&((!grid[y-1][x]&&!grid[y+1][x])||(!grid[y][x-1]&&!grid[y][x+1])))grid[y][x]=0;
const rooms=[[3,3],[n-4,3],[3,n-4],[n-4,n-4],[Math.floor(n/2)|1,Math.floor(n/2)|1]];for(const [cx,cy]of rooms)for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)if(y>0&&x>0&&y<n-1&&x<n-1)grid[y][x]=0;return grid}
const isWall=(grid,x,y)=>!grid||y<0||x<0||y>=grid.length||x>=grid.length||grid[Math.floor(y)][Math.floor(x)]===1;
function lineClear(grid,ax,ay,bx,by){const steps=Math.ceil(Math.hypot(bx-ax,by-ay)*7);for(let i=1;i<steps;i++){const t=i/steps;if(isWall(grid,ax+(bx-ax)*t,ay+(by-ay)*t))return false}return true}
function spawnCells(map){const cells=[];for(let y=2;y<map.length-2;y++)for(let x=2;x<map.length-2;x++)if(!map[y][x])cells.push({x:x+.5,y:y+.5});return cells}
const randomCell=(cells)=>cells[Math.floor(Math.random()*cells.length)]||{x:1.5,y:1.5};
function validMove(map,x,y,r=.28){return !isWall(map,x-r,y-r)&&!isWall(map,x+r,y-r)&&!isWall(map,x-r,y+r)&&!isWall(map,x+r,y+r)}
class World{
 constructor(config,players,matchWins,round=1,seed=Math.floor(Math.random()*1e8)){
  this.config=config;this.mode=config.mode;this.round=round;this.seed=seed;this.map=generateMaze(config.mapSize==='large'?51:config.mapSize==='small'?29:39,seed);this.size=this.map.length;this.cells=spawnCells(this.map);this.started=Date.now();this.endsAt=this.started+config.duration*1000;this.phase='playing';this.paused=false;this.pauseStarted=0;this.last=Date.now();this.players=new Map();this.bullets=[];this.drops=[];this.terminals=[];this.gates=[];this.smokes=[];this.monsters=[];this.lamps=[];this.pathCache=new Map();this.pathCacheAt=0;this.events=[];this.eventNum=0;this.nextBullet=0;this.matchWins=matchWins||[0,0];this.bomb={planted:false,expiresAt:0,site:this.near({x:this.size/2,y:this.size/2}),carrier:null};this.exit=this.near({x:this.size-3.5,y:this.size-3.5});this.meeting=null;this.sabotageEndsAt=0;this.sabotageTeam=-1;this.roundWinner=null;this.roundReason='';this.roundEndAt=0;this.lastSignal=0;this.lastDropAt=Date.now();
  this.placeObjects();this.addPlayers(players);this.createLights();this.spawnMonsters();
 }
 near(pos){let b=this.cells[0],d=Infinity;for(const cell of this.cells){const v=distance(pos,cell);if(v<d){b=cell;d=v}}return{x:b.x,y:b.y}}
 placeObjects(){const candidates=[...this.cells].sort(()=>Math.random()-.5);const isFar=(x,y)=>distance({x,y},this.bomb.site)>3&&distance({x,y},this.exit)>2.8;
  for(const c of candidates){if(this.config.puzzles&&this.terminals.length<Math.min(9,Math.max(5,Math.floor(this.size/5)))&&isFar(c.x,c.y)&&this.terminals.every(t=>distance(t,c)>5)){this.terminals.push({id:'term'+this.terminals.length,x:c.x,y:c.y,quiz:this.nextQuiz(),solved:false,by:null})}
  if(this.drops.length<Math.floor(this.size*.45)&&isFar(c.x,c.y)&&this.drops.every(d=>distance(d,c)>2.4))this.drops.push({id:uid(),x:c.x,y:c.y,kind:['cash','cash','ammo','medkit','armor','weapon','scanner','energy'][Math.floor(Math.random()*8)],amount:90+Math.floor(rand(0,5))*30});
  if(this.terminals.length>=8&&this.drops.length>=Math.floor(this.size*.45))break}
  for(const c of candidates){if(this.gates.length>=4)break;if(isFar(c.x,c.y)&&this.gates.every(g=>distance(g,c)>6)&&this.terminals.every(t=>distance(t,c)>2.2)){this.gates.push({id:'gate'+this.gates.length,x:c.x,y:c.y,locked:true})}}
 }

 nextQuiz(){
  app.quizSeen ||= new Set();
  if(app.quizSeen.size>=QUIZZES.length)app.quizSeen.clear();
  if(!this.quizDeck?.length){this.quizDeck=Array.from({length:QUIZZES.length},(_,i)=>i).filter(id=>!app.quizSeen.has(id));for(let i=this.quizDeck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[this.quizDeck[i],this.quizDeck[j]]=[this.quizDeck[j],this.quizDeck[i]]}}
  const id=this.quizDeck.pop();app.quizSeen.add(id);return id;
 }
 createLights(){
  let seq=0;
  for(let y=3;y<this.size-3;y+=4)for(let x=3;x<this.size-3;x+=4){
   const cx=x+hash(x,y,this.seed)%4,cy=y+hash(y,x,this.seed)%4;
   if(!this.map[cy]?.[cx]&&(hash(cx,cy,this.seed)%3!==0))this.lamps.push({x:cx+.5,y:cy+.5,r:2.7+(hash(cy,cx,this.seed)%5)*.14,color:(seq++%5===0)?'amber':'mint'});
  }
 }
 spawnMonsters(){
  const total={none:0,few:4,normal:8,horde:15}[this.config.monsters]||0;
  const occupants=[...this.players.values()];
  const cells=[...this.cells].sort(()=>Math.random()-.5);
  for(const c of cells){if(this.monsters.length>=total)break;
   if(occupants.some(p=>distance(p,c)<7)||this.monsters.some(m=>distance(m,c)<4)||distance(c,this.exit)<2)continue;
   const kind=this.monsters.length%4===0?'brute':'stalker';
   this.monsters.push({id:'creature-'+this.monsters.length,x:c.x,y:c.y,a:0,hp:kind==='brute'?145:70,maxHp:kind==='brute'?145:70,alive:true,kind,attackAt:0,pathAt:0,stepDir:null});
  }
 }
 flowTo(target){
  const tx=Math.floor(target.x),ty=Math.floor(target.y),n=this.size,key=tx+','+ty;
  if(Date.now()-this.pathCacheAt>800){this.pathCache.clear();this.pathCacheAt=Date.now()}
  if(this.pathCache.has(key))return this.pathCache.get(key);
  const dist=new Int16Array(n*n).fill(-1),queue=new Int32Array(n*n),start=ty*n+tx;dist[start]=0;queue[0]=start;
  let head=0,tail=1;while(head<tail){const i=queue[head++],x=i%n,y=Math.floor(i/n);for(const k of [1,-1,n,-n]){const v=i+k;const nx=v%n,ny=Math.floor(v/n);if(v<0||v>=n*n||Math.abs(nx-x)+Math.abs(ny-y)!==1||this.map[ny][nx]||dist[v]>=0)continue;dist[v]=dist[i]+1;queue[tail++]=v}}
  this.pathCache.set(key,dist);return dist;
 }
 moveMonsters(dt,now){
  for(const m of this.monsters){if(!m.alive)continue;
   const targets=[...this.players.values()].filter(p=>p.alive).sort((a,b)=>distance(m,a)-distance(m,b));
   const t=targets[0];if(!t)continue;
   const d=distance(m,t);
   if(d<.78){if(now>m.attackAt){m.attackAt=now+(m.kind==='brute'?1650:1200);this.damage(t,m.kind==='brute'?20:12,m.id);this.event('monster_hit',{x:t.x,y:t.y,target:t.id})}continue}
   if(d>18)continue;
   const x=Math.floor(m.x),y=Math.floor(m.y),field=this.flowTo(t),neighbors=[[1,0],[-1,0],[0,1],[0,-1]];
   let best=null,score=9999;for(const [dx,dy] of neighbors){const xx=x+dx,yy=y+dy;if(isWall(this.map,xx+.5,yy+.5))continue;const v=field[yy*this.size+xx];if(v>=0&&v<score){score=v;best={x:xx+.5,y:yy+.5}}}
   if(best){const vx=best.x-m.x,vy=best.y-m.y,magnitude=Math.hypot(vx,vy);if(magnitude>.07){m.a=Math.atan2(vy,vx);const speed=(m.kind==='brute'?1.15:1.62)*dt,mx=vx/magnitude*speed,my=vy/magnitude*speed;if(this.collide(m.x+mx,m.y,.20))m.x+=mx;if(this.collide(m.x,m.y+my,.20))m.y+=my}}
  }
 }
 hitMonster(m,damage,owner){if(!m.alive)return;m.hp=Math.max(0,m.hp-damage);this.event('monster_hit',{x:m.x,y:m.y});if(m.hp>0)return;
  m.alive=false;const p=this.getPlayer(owner);if(p){p.credits=clamp(p.credits+(m.kind==='brute'?160:80),0,9999);p.score+=m.kind==='brute'?110:60}
  const rewards=['ammo','cash','medkit','armor','weapon','energy'];this.drops.push({id:uid(),x:m.x,y:m.y,kind:rewards[Math.floor(Math.random()*rewards.length)],amount:90+Math.floor(rand(0,5))*30});this.event('monster_death',{x:m.x,y:m.y,team:2,kindType:m.kind});
 }
 rollChest(){const rewards=['cash','cash','ammo','ammo','medkit','armor','energy','scanner','weapon','weapon','key'];return rewards[Math.floor(Math.random()*rewards.length)]}
 addPlayers(raw){const order=[...raw].filter(p=>p.participates).sort((a,b)=>a.joined-b.joined||a.id.localeCompare(b.id));const occupied=[];
  for(let i=0;i<order.length;i++){
   const u=order[i];let team=this.mode==='team'||this.mode==='double'?i%2:-1;const target=team===0?{x:3,y:3}:team===1?{x:this.size-4,y:this.size-4}:{x:rand(4,this.size-4),y:rand(4,this.size-4)};let pool=this.cells.filter(c=>distance(c,target)<(this.mode==='team'||this.mode==='double'?8:this.size)&&occupied.every(o=>distance(o,c)>3.2));if(!pool.length)pool=this.cells.filter(c=>occupied.every(o=>distance(o,c)>2));const cell=randomCell(pool.length?pool:this.cells);occupied.push(cell);
   const previous=u.stats||{};const p={id:u.id,name:u.name,team,role:'operative',color:team<0?colorFor(i):TEAMS[team].color,x:cell.x,y:cell.y,a:0,hp:100,armor:0,lives:this.config.lives,alive:true,respawnAt:0,kills:previous.kills||0,deaths:previous.deaths||0,assists:previous.assists||0,score:previous.score||0,credits:clamp(previous.credits??700,0,9999),inventory:{pistol:{mag:12,reserve:this.config.ammo==='scarce'?12:36}},weapon:'pistol',items:{scanner:0,smoke:0,key:0,medkit:0},pieces:previous.pieces||0,meetingsLeft:1,stamina:100,input:{dx:0,dy:0,aim:0,fire:false,run:false},lastFire:0,reloadAt:0,lastSpecial:0,scannerEndsAt:0,lastAttacker:null,lastDamageAt:0,taskCount:0,joined:u.joined,active:true};
   if(this.mode==='impostor'){p.inventory={pistol:{mag:0,reserve:0}};p.credits=0}
   this.players.set(p.id,p)
  }
  const active=[...this.players.values()];if(this.mode==='impostor'&&active.length>=2){const n=Math.max(1,Math.floor(active.length/5));const arr=[...active].sort(()=>Math.random()-.5);arr.slice(0,n).forEach(p=>p.role='traitor');active.filter(p=>p.role!=='traitor').forEach(p=>p.role='crew')}
  if(this.mode==='double'&&active.length>=4)for(const team of [0,1]){const group=active.filter(p=>p.team===team);if(group.length>1){group[Math.floor(Math.random()*group.length)].role='double'}}
 }
 event(kind,more={}){const e={id:++this.eventNum,kind,time:Date.now(),...more};this.events.push(e);if(this.events.length>100)this.events.shift();return e}
 collide(x,y,r=.26){return validMove(this.map,x,y,r)&&!this.gates.some(g=>g.locked&&Math.abs(x-g.x)<(.43+r)&&Math.abs(y-g.y)<(.43+r))}
 getPlayer(id){return this.players.get(id)}
 setInput(id,d){const p=this.getPlayer(id);if(!p||!p.alive)return;p.input={dx:clamp(Number(d.dx)||0,-1,1),dy:clamp(Number(d.dy)||0,-1,1),aim:Number.isFinite(d.aim)?d.aim:0,fire:!!d.fire,run:!!d.run};}
 step(dt){if(this.paused||this.phase==='round_end'||this.phase==='match_end')return;const now=Date.now();this.smokes=this.smokes.filter(s=>s.until>now);if(this.phase==='meeting'){if(now>this.meeting.endsAt)this.resolveMeeting();return}
  for(const p of this.players.values()){
   if(!p.alive){if(p.lives>0&&p.respawnAt&&now>p.respawnAt&&this.phase==='playing'){const cell=this.near({x:p.team===0?2:this.size-3,y:p.team===1?this.size-3:3});p.x=cell.x;p.y=cell.y;p.hp=100;p.armor=0;p.alive=true;p.respawnAt=0;p.input.fire=false;this.event('respawn',{player:p.name,x:p.x,y:p.y})}continue}
   if(p.reloadAt&&now>=p.reloadAt){const gun=p.inventory[p.weapon];if(gun){const w=WEAPONS[p.weapon],taken=Math.min(w.mag-gun.mag,gun.reserve);gun.mag+=taken;gun.reserve-=taken}p.reloadAt=0}
   const ix=p.input.dx,iy=p.input.dy,mag=Math.hypot(ix,iy),run=p.input.run&&p.stamina>3,spd=(run?4.8:3.25)*dt,nx=ix/mag||0,ny=iy/mag||0;
   if(mag>.01){if(this.collide(p.x+nx*spd,p.y))p.x+=nx*spd;if(this.collide(p.x,p.y+ny*spd))p.y+=ny*spd}
   p.stamina=clamp(p.stamina+(run&&mag>.01?-35:20)*dt,0,100);p.a=p.input.aim;
   if(p.input.fire&&this.mode!=='impostor')this.fire(p,now);
   // Health is never regenerated automatically: the medkit economy matters.
  }
   this.moveMonsters(dt,now);
   for(let i=this.bullets.length-1;i>=0;i--){const b=this.bullets[i];let removed=false,steps=Math.max(2,Math.ceil(b.speed*dt*4));for(let j=0;j<steps;j++){
   b.x+=b.dx*b.speed*dt/steps;b.y+=b.dy*b.speed*dt/steps;b.life-=dt/steps;
   if(this.map[Math.floor(b.y)]?.[Math.floor(b.x)]!==0||b.life<=0){removed=true;this.event('impact',{x:b.x,y:b.y});break}
   for(const p of this.players.values()){if(!p.alive||p.id===b.owner||this.mode==='impostor')continue;if(p.team!==-1&&p.team===b.team&&!this.config.friendly&&!(this.mode==='double'&&b.betrayal))continue;if((p.x-b.x)**2+(p.y-b.y)**2<.38**2){removed=true;this.damage(p,b.damage,b.owner);this.event('impact',{x:b.x,y:b.y});break}}
   if(!removed)for(const m of this.monsters){if(!m.alive)continue;if((m.x-b.x)**2+(m.y-b.y)**2<.4**2){removed=true;this.hitMonster(m,b.damage,b.owner);this.event('impact',{x:b.x,y:b.y});break}}
    if(removed)break
   }if(removed)this.bullets.splice(i,1)}
  if(this.bomb.planted&&now>=this.bomb.expiresAt){this.event('bomb',{x:this.bomb.site.x,y:this.bomb.site.y,msg:'DATA CORE PORTLADI'});this.endRound('QIZILLAR','DATA CORE faollashtirildi');return}
  if(now>=this.endsAt){this.expireRound();return}
  this.checkVictory();
 }
 fire(p,now){const w=WEAPONS[p.weapon],g=p.inventory[p.weapon];if(!g||p.reloadAt||now-p.lastFire<w.delay)return;if(g.mag<=0){this.reload(p);return}g.mag--;p.lastFire=now;let angle=p.a;for(let k=0;k<w.pellets;k++){const a=angle+rand(-w.spread,w.spread);this.bullets.push({id:++this.nextBullet,owner:p.id,team:p.team,betrayal:p.role==='double',x:p.x+Math.cos(a)*.36,y:p.y+Math.sin(a)*.36,dx:Math.cos(a),dy:Math.sin(a),speed:w.speed,damage:w.damage,life:w.range/w.speed,weapon:p.weapon})}this.event('shot',{x:p.x,y:p.y,a:angle,player:p.id});if(this.bullets.length>350)this.bullets.splice(0,40)}
 reload(p){const g=p.inventory[p.weapon],w=WEAPONS[p.weapon];if(!g||g.mag>=w.mag||g.reserve<1||p.reloadAt)return false;p.reloadAt=Date.now()+w.load;return true}
 damage(p,damage,from){if(!p.alive)return;const absorbed=Math.min(p.armor,damage*.55);p.armor-=absorbed;p.hp=Math.max(0,Math.round(p.hp-(damage-absorbed)));p.lastAttacker=from;p.lastDamageAt=Date.now();this.event('hit',{x:p.x,y:p.y,target:p.id,damage});if(p.hp<=0)this.kill(p,from)}
 kill(p,attacker,reason='shot'){if(!p.alive)return;p.alive=false;p.hp=0;p.deaths++;p.lives=Math.max(0,p.lives-1);p.respawnAt=p.lives>0?Date.now()+3200:0;p.input.fire=false;const a=this.getPlayer(attacker);if(a&&a.id!==p.id){a.kills++;a.score+=125;a.credits=clamp(a.credits+220,0,9999)}
   if(this.mode!=='impostor'){this.drops.push({id:uid(),x:p.x,y:p.y,kind:'corpse',amount:Math.floor(p.credits*.42),from:p.id,weapon:p.weapon,ammo:p.inventory[p.weapon]?{...p.inventory[p.weapon]}:null,armor:p.armor,items:{...p.items}});p.credits=Math.floor(p.credits*.58)}
   this.event('death',{x:p.x,y:p.y,player:p.name,killer:a?.name||'LABIRINT',target:p.id,reason,team:p.team});this.checkVictory()
 }
 command(id,msg){const p=this.getPlayer(id);if(!p)return;const type=msg.action;const now=Date.now();if(type==='vote'){if(this.meeting&&p.alive&&!this.meeting.votes[id]){const target=msg.target;if(target!=='skip'&&!this.players.has(target))return;this.meeting.votes[id]=target;this.event('vote',{player:p.name});if(Object.keys(this.meeting.votes).length >= [...this.players.values()].filter(v=>v.alive).length)this.resolveMeeting()}return}
  if(type==='chat'){if(this.meeting&&p.alive){const message=String(msg.text||'').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,100);if(message&&this.meeting.messages.length<75)this.meeting.messages.push({id:uid(),name:p.name,text:message})}return}
  if(!p.alive||this.phase!=='playing'||this.paused)return;
  if(type==='reload'){this.reload(p);return}
  if(type==='equip'){const weapon=String(msg.weapon);if(WEAPONS[weapon]&&p.inventory[weapon]){p.weapon=weapon;p.reloadAt=0}return}
  if(type==='buy'){this.buy(p,String(msg.item));return}
  if(type==='interact'){this.interact(p);return}
  if(type==='solve'){this.solve(p,msg);return}
  if(type==='special'){this.special(p);return}
  if(type==='meeting'&&this.mode==='impostor'&&p.meetingsLeft>0){this.startMeeting(p);return}
  if(type==='useMed'&&p.items.medkit>0){p.items.medkit--;p.hp=clamp(p.hp+60,0,100);this.event('heal',{x:p.x,y:p.y});return}
 }
 buy(p,id){const item=SHOP.find(a=>a.id===id);if(!item||p.credits<item.cost||this.mode==='impostor')return;p.credits-=item.cost;
  if(item.kind==='gun'){const w=WEAPONS[id];if(p.inventory[id]){p.inventory[id].reserve=clamp(p.inventory[id].reserve+w.mag,0,250)}else p.inventory[id]={mag:w.mag,reserve:this.config.ammo==='scarce'?w.mag:w.reserve};p.weapon=id;p.reloadAt=0}
  else if(id==='ammo'){const w=WEAPONS[p.weapon],g=p.inventory[p.weapon];g.reserve=clamp(g.reserve+w.mag*2,0,250)}
  else if(id==='medkit')p.items.medkit=(p.items.medkit||0)+1;
  else if(id==='armor')p.armor=clamp(p.armor+50,0,100);
  else if(id==='scanner'){p.items.scanner++;p.scannerEndsAt=Date.now()+8000;p.items.scanner--}
  else if(id==='smoke'){this.smokes.push({x:p.x+Math.cos(p.a)*1.1,y:p.y+Math.sin(p.a)*1.1,until:Date.now()+10000});this.event('smoke',{x:p.x,y:p.y})}
  else if(id==='energy')p.stamina=100;
  else if(id==='key'){p.items.key++;p.pieces++;}
  this.event('purchase',{x:p.x,y:p.y,player:p.name,item:item.name});
 }
 interact(p){if(this.mode==='team'||this.mode==='double'){
   if(distance(p,this.bomb.site)<1.9){if(p.team===0&&!this.bomb.planted){this.bomb.planted=true;this.bomb.expiresAt=Date.now()+35000;this.event('bomb',{x:this.bomb.site.x,y:this.bomb.site.y,msg:'DATA CORE FAOLLASHTIRILDI'});return}if(p.team===1&&this.bomb.planted){this.bomb.planted=false;this.event('bomb',{x:this.bomb.site.x,y:this.bomb.site.y,msg:'DATA CORE ZARARSIZLANTIRILDI'});this.endRound('KO‘KLAR','Data core zararsizlantirildi');return}}
  }
  if(this.mode==='escape'&&distance(p,this.exit)<1.7){if(p.pieces>=3)this.endRound(p.name,'Labirintdan muvaffaqiyatli chiqdi');else this.event('hint',{target:p.id,msg:`Chiqish uchun ${Math.max(0,3-p.pieces)} ta kod-parcha kerak`});return}
  const gate=this.gates.find(g=>g.locked&&distance(g,p)<1.65);if(gate){if(p.items.key>0){p.items.key--;gate.locked=false;this.event('gate',{x:gate.x,y:gate.y,msg:'YASHIRIN ESHIK OCHILDI',player:p.name})}else this.event('hint',{target:p.id,msg:'ESHIKNI OCHISH UCHUN KALIT KERAK'});return}
  const loot=this.drops.find(d=>distance(d,p)<1.25);if(loot){this.pickup(p,loot);return}
  const task=this.terminals.find(t=>!t.solved&&distance(t,p)<1.5);if(task){this.event('puzzle_open',{target:p.id,terminal:task.id,quiz:task.quiz});return}
  this.event('hint',{target:p.id,msg:'Yaqiningizda olinadigan resurs yo‘q'});
 }
 pickup(p,d){this.drops=this.drops.filter(a=>a.id!==d.id);if(d.kind==='chest'){const reward=d.reward||'cash';if(reward==='cash')p.credits=clamp(p.credits+(d.amount||240),0,9999);else if(reward==='ammo')p.inventory[p.weapon].reserve=clamp(p.inventory[p.weapon].reserve+WEAPONS[p.weapon].mag*3,0,250);else if(reward==='medkit')p.items.medkit=(p.items.medkit||0)+2;else if(reward==='armor')p.armor=clamp(p.armor+70,0,100);else if(reward==='energy')p.stamina=100;else if(reward==='scanner')p.scannerEndsAt=Date.now()+12000;else if(reward==='key')p.items.key=(p.items.key||0)+2;else if(reward==='weapon'){const id=['smg','rifle','shotgun','sniper'][Math.floor(Math.random()*4)];p.inventory[id]={mag:WEAPONS[id].mag,reserve:WEAPONS[id].reserve};p.weapon=id}this.event('chest_open',{target:p.id,x:d.x,y:d.y,msg:'SANDIQ: '+reward.toUpperCase(),reward})}else if(d.kind==='corpse'){p.credits=clamp(p.credits+(d.amount||0),0,9999);p.armor=clamp(p.armor+Math.round((d.armor||0)*.5),0,100);if(d.weapon&&d.weapon!=='pistol'&&d.ammo){p.inventory[d.weapon]={mag:d.ammo.mag,reserve:d.ammo.reserve};p.weapon=d.weapon}else if(d.ammo){p.inventory[p.weapon].reserve=clamp(p.inventory[p.weapon].reserve+d.ammo.reserve,0,250)}p.items.key=(p.items.key||0)+Math.min(2,d.items?.key||0);p.items.medkit=(p.items.medkit||0)+Math.min(2,d.items?.medkit||0);}
  else if(d.kind==='cash')p.credits=clamp(p.credits+d.amount,0,9999);
  else if(d.kind==='ammo')p.inventory[p.weapon].reserve=clamp(p.inventory[p.weapon].reserve+WEAPONS[p.weapon].mag*2,0,250);
  else if(d.kind==='medkit')p.items.medkit=(p.items.medkit||0)+1;
  else if(d.kind==='armor')p.armor=clamp(p.armor+40,0,100);
  else if(d.kind==='energy')p.stamina=100;
  else if(d.kind==='scanner')p.scannerEndsAt=Date.now()+7000;
  else if(d.kind==='weapon'){const w=['smg','rifle','shotgun'][Math.floor(rand(0,3))];p.inventory[w]={mag:WEAPONS[w].mag,reserve:WEAPONS[w].mag};p.weapon=w}
  this.event('pickup',{x:d.x,y:d.y,player:p.name,kind:d.kind,target:p.id});
 }
 solve(p,msg){const t=this.terminals.find(q=>q.id===msg.terminal);if(!t||t.solved||distance(t,p)>1.7||!this.config.puzzles||!Number.isInteger(msg.answer))return;
   const q=QUIZZES[t.quiz];if(!q)return;
   if(msg.answer===q.correct){t.solved=true;t.by=p.name;p.pieces++;p.taskCount++;p.score+=160;
    const reward=this.rollChest();this.drops.push({id:uid(),x:t.x,y:t.y,kind:'chest',reward,amount:200+Math.floor(rand(0,5))*60});
    this.event('solved',{x:t.x,y:t.y,player:p.name,target:p.id,reward:'SANDIQ OCHILDI'});this.checkVictory();
   }else{
    p.credits=Math.max(0,p.credits-20);t.quiz=this.nextQuiz();
    this.event('hint',{target:p.id,msg:'NOTO‘G‘RI · BOSHQA SAVOL BERILDI'});
    this.event('puzzle_open',{target:p.id,terminal:t.id,quiz:t.quiz});
   }
 }
 special(p){const now=Date.now();if(now-p.lastSpecial<14000)return;if((this.mode==='impostor'&&p.role==='traitor')){const victims=[...this.players.values()].filter(e=>e.alive&&e.id!==p.id&&e.role!=='traitor'&&distance(e,p)<1.55&&lineClear(this.map,p.x,p.y,e.x,e.y));victims.sort((a,b)=>distance(a,p)-distance(b,p));if(victims[0]){p.lastSpecial=now;this.kill(victims[0],p.id,'silent')}else{p.lastSpecial=now;this.sabotageEndsAt=now+11000;this.event('sabotage',{x:p.x,y:p.y,msg:'ELEKTR O‘CHDI'})}return}
  if(this.mode==='double'&&p.role==='double'){p.lastSpecial=now;this.sabotageEndsAt=now+12000;this.sabotageTeam=p.team;p.credits=clamp(p.credits+150,0,9999);this.event('sabotage',{x:p.x,y:p.y,msg:'COMMS JAMMED'});return}
  if(p.items.key>0){p.items.key--;p.armor=clamp(p.armor+15,0,100);this.event('shield',{x:p.x,y:p.y})}
 }
 startMeeting(p){if(this.meeting||p.meetingsLeft<1)return;p.meetingsLeft--;this.phase='meeting';this.meeting={calledBy:p.name,startedAt:Date.now(),endsAt:Date.now()+32000,votes:{},messages:[{id:uid(),name:'SYSTEM',text:p.name+' yig‘ilish chaqirdi. Kimdan shubhalanasiz?'}]};this.event('meeting',{msg:p.name+' emergency meeting chaqirdi'})}
 resolveMeeting(){if(!this.meeting)return;const votes=Object.values(this.meeting.votes).filter(v=>v!=='skip');const count={};for(const v of votes)count[v]=(count[v]||0)+1;const ranks=Object.entries(count).sort((a,b)=>b[1]-a[1]);const tied=ranks.length>1&&ranks[0][1]===ranks[1][1];const target=!tied?ranks[0]?.[0]:null;const p=target?this.getPlayer(target):null;if(p&&ranks[0][1]>=Math.ceil([...this.players.values()].filter(v=>v.alive).length/2)){p.lives=1;this.kill(p,null,'voted');this.event('meeting_result',{msg:p.name+' chiqarildi'})}else this.event('meeting_result',{msg:'Hech kim chiqarilmadi'});this.endsAt+=Date.now()-this.meeting.startedAt;this.meeting=null;this.phase='playing';this.checkVictory()}
 checkVictory(){if(this.phase!=='playing')return;const list=[...this.players.values()];if(!list.length)return;
  if(this.mode==='impostor'){const alive=list.filter(p=>p.alive||p.lives>0),traitors=alive.filter(p=>p.role==='traitor').length,crew=alive.length-traitors;if(traitors===0){this.endRound('AGENTLAR','Barcha xoinlar aniqlandi');return}if(traitors>=crew){this.endRound('XOINLAR','Xoinlar ustunlikka erishdi');return}if(this.config.puzzles&&this.terminals.every(t=>t.solved)){this.endRound('AGENTLAR','Barcha vazifalar yakunlandi');return}return}
  if(this.mode==='escape')return;
  if(this.mode==='ffa'){const possible=list.filter(p=>p.alive||p.lives>0);if(possible.length===1&&list.length>1)this.endRound(possible[0].name,'Yagona omon qolgan o‘yinchi');return}
  const a=[0,1].map(team=>list.filter(p=>p.team===team&&(p.alive||p.lives>0)).length);if(a[0]===0&&a[1]>0)this.endRound('KO‘KLAR','Barcha qizil o‘yinchilar mag‘lub bo‘ldi');else if(a[1]===0&&a[0]>0)this.endRound('QIZILLAR','Barcha ko‘k o‘yinchilar mag‘lub bo‘ldi')
 }
 expireRound(){const list=[...this.players.values()];if(this.mode==='impostor'){this.endRound('XOINLAR','Vaqt tugadi');return}if(this.mode==='escape'){const sorted=list.sort((a,b)=>b.pieces-a.pieces||b.score-a.score);this.endRound(sorted[0]?.name||'HECH KIM','Vaqt tugadi, eng ko‘p kod topgan g‘olib');return}if(this.mode==='ffa'){list.sort((a,b)=>b.kills-a.kills||b.lives-a.lives||b.score-a.score);this.endRound(list[0]?.name||'HECH KIM','Vaqt tugadi');return}if(this.bomb.planted){this.endsAt=Date.now()+1000;return}const tally=[0,1].map(team=>list.filter(p=>p.team===team).reduce((n,p)=>n+p.kills*3+p.lives,0));this.endRound(tally[0]>tally[1]?'QIZILLAR':tally[1]>tally[0]?'KO‘KLAR':'DURANG','Vaqt tugadi · jamoaviy ochkolar hisoblandi')}
 endRound(winner,reason){if(this.phase==='round_end'||this.phase==='match_end')return;this.phase='round_end';this.roundWinner=winner;this.roundReason=reason;this.roundEndAt=Date.now();if(winner==='QIZILLAR')this.matchWins[0]++;if(winner==='KO‘KLAR')this.matchWins[1]++;this.event('round_end',{winner,reason});}
 snapshotFor(id){const self=this.getPlayer(id),spectator=!self,now=Date.now(),all=[...this.players.values()],eyes=spectator?{x:this.size/2,y:this.size/2}:self;
 const radius=self?.scannerEndsAt>now?14:((this.sabotageEndsAt>now&&(this.sabotageTeam===-1||(self&&this.sabotageTeam===self.team)))?3:9.8);
 const visible=v=>{if(spectator)return true;if(!self)return false;const d=distance(self,v);if(d>radius+1)return false;
  if(!lineClear(this.map,self.x,self.y,v.x,v.y))return false;
  const scanner=self.scannerEndsAt>now,flash=d<7.3&&Math.cos(Math.atan2(v.y-self.y,v.x-self.x)-self.a)>.63;
  const lit=this.lamps.some(l=>distance(l,v)<l.r*1.2&&distance(l,self)<11&&lineClear(this.map,l.x,l.y,v.x,v.y));
  const close=d<1.45;return scanner||close||flash||lit;
 };
 const radarActive=this.config.radar&&(this.endsAt-now)<60000&&this.phase==='playing';const radarPings=radarActive&&self?all.filter(p=>p.alive&&p.id!==id&&(p.team!==self.team||p.team<0)).map(p=>({x:Math.round(p.x/4)*4,y:Math.round(p.y/4)*4})):[];
 const pview=all.filter(v=>v.id===id||visible(v)).map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,a:p.a,team:p.team,color:p.color,hp:p.hp,alive:p.alive,weapon:p.weapon,lives:p.lives,role:p.id===id?p.role:undefined}));
 const bullets=this.bullets.filter(b=>spectator||(distance(eyes,b)<radius+1.5&&lineClear(this.map,eyes.x,eyes.y,b.x,b.y))).map(b=>({x:b.x,y:b.y,dx:b.dx,dy:b.dy,weapon:b.weapon}));
 const drops=this.drops.filter(visible).map(d=>({id:d.id,x:d.x,y:d.y,kind:d.kind}));const monsters=this.monsters.filter(m=>m.alive&&visible(m)).map(m=>({id:m.id,x:m.x,y:m.y,a:m.a,hp:m.hp,maxHp:m.maxHp,kind:m.kind}));
 const terminals=this.terminals.filter(t=>visible(t)||t.solved).map(t=>({id:t.id,x:t.x,y:t.y,solved:t.solved}));const gates=this.gates.filter(visible).map(g=>({...g}));const smokes=this.smokes.filter(s=>spectator||distance(s,eyes)<radius+2).map(s=>({...s}));
 const ev=this.events.filter(e=>e.time>now-3500&&(e.target===id||!('x'in e)||spectator||(distance(e,eyes)<radius+1.5&&lineClear(this.map,eyes.x,eyes.y,e.x,e.y)))).map(e=>({...e}));
 const roster=all.map(p=>({id:p.id,name:p.name,team:p.team,color:p.color,alive:p.alive,lives:p.lives,kills:p.kills,deaths:p.deaths,score:p.score,credits:p.credits}));
 const me=self?{...pview.find(v=>v.id===id),armor:self.armor,credits:self.credits,inventory:self.inventory,weapon:self.weapon,reloadAt:self.reloadAt,stamina:self.stamina,items:self.items,pieces:self.pieces,taskCount:self.taskCount,role:self.role,meetingsLeft:self.meetingsLeft,scannerEndsAt:self.scannerEndsAt}:null;
 return {t:'snapshot',now,lamps:this.lamps,monsters,phase:this.phase,round:this.round,rounds:this.config.rounds,endsAt:this.endsAt,config:this.config,mode:this.mode,players:pview,roster,me,bullets,drops,terminals,gates,smokes,radarPings,bomb:{planted:this.bomb.planted,expiresAt:this.bomb.expiresAt,site:this.bomb.site},exit:this.exit,events:ev,roundWinner:this.roundWinner,roundReason:this.roundReason,matchWins:this.matchWins,meeting:this.meeting?{endsAt:this.meeting.endsAt,votes:this.meeting.votes,messages:this.meeting.messages,calledBy:this.meeting.calledBy}:null,sabotageEndsAt:this.sabotageEndsAt,taskTotal:this.terminals.length,taskSolved:this.terminals.filter(t=>t.solved).length,visibility:radius,paused:this.paused,remaining:Math.max(0,(this.endsAt-(this.paused?this.pauseStarted:this.meeting?.startedAt||now))/1000)};
 }
}

/* ————— NETWORK / ROOM LIFECYCLE ————— */
function lobbyParticipants(){return [...(app.lobbyPlayers?.values()||[])];}
function broadcastLobby(){if(!app.isHost)return;const players=lobbyParticipants();const data={t:'lobby',players:players.map((p,i)=>({...p,team:app.config.mode==='team'||app.config.mode==='double'?i%2:-1,color:app.config.mode==='team'||app.config.mode==='double'?TEAMS[i%2].color:colorFor(i)})),config:app.config,room:app.room};app.lobbyView=data;for(const con of app.clients.values())send(con,data);renderLobby()}
function send(conn,data){try{if(conn?.open)conn.send(data)}catch(e){console.warn('Peer send failed',e)}}
function closePeer(){if(app.peer)try{app.peer.destroy()}catch{};app.peer=null;app.conn=null;app.clients.clear();app.connectionReady=false;app.world=null;app.view=null;app.lobbyPlayers=null;app.lobbyView=null;app.map=null;app.discovered.clear();app.eventsSeen.clear();app.particles=[];app.room='';app.isHost=false;app.localId=null;app.shopOpen=false;app.meetingOpen=false;app.puzzleOpen=null;closeAllModals()}
function showLobby(){showScreen('lobby');$('lobbyRoomCode').textContent=app.room;$('shareUrl').value=shareUrl();$('hostLobbyControls').classList.toggle('hidden',!app.isHost);$('waitHostNotice').classList.toggle('hidden',app.isHost);renderLobby()}
function renderLobby(){const data=app.isHost?app.lobbyView:app.lobbyView;if(!data||app.screen!=='lobby')return;const players=data.players||[];const cfg=data.config;$('lobbyCount').textContent=`${players.length} O‘YINCHI / 30 MAX`;$('lobbySettings').textContent=`${Math.floor(cfg.duration/60)} DAQ · ${cfg.lives} JON · ${cfg.rounds} RAUND`;$('lobbyConnection').textContent=app.connectionReady?'● ULANISH FAOL':'○ ULANYAPTI';$('lobbyModeLabel').textContent=MODES[cfg.mode].name+' / LOBBY';$('lobbyModeTitle').textContent=MODES[cfg.mode].name;$('lobbyModeDesc').textContent=MODES[cfg.mode].summary;const list=$('roster');list.replaceChildren();if(!players.length){const el=document.createElement('div');el.className='roster-empty';el.textContent='O‘yinchilar kutilmoqda ...';list.append(el)}for(let i=0;i<players.length;i++){const p=players[i],el=document.createElement('div');el.className='roster-member';const av=document.createElement('span');av.className='roster-avatar';av.style.background=p.color;av.textContent=p.name.slice(0,1).toUpperCase();const inf=document.createElement('div'),nm=document.createElement('strong'),tag=document.createElement('small');nm.textContent=p.name;tag.textContent=(p.id==='host'?'HOST / ':'OPERATIVE / ')+(cfg.mode==='team'||cfg.mode==='double'?TEAMS[p.team].name:'SOLO');inf.append(nm,tag);el.append(av,inf);list.append(el)}if(app.isHost)$('startBtn').disabled=players.length<(cfg.mode==='impostor'?4:2)}
function createRoom(){if(!window.Peer){toast('PeerJS yuklanmadi. Internetni yoki brauzer bloklovchilarni tekshiring.',true);return}closePeer();app.isHost=true;app.room=randomRoom();app.config=getConfig();app.hostPlays=app.config.hostPlays;app.localName=safeName($('hostNick').value);app.localId='host';app.lobbyPlayers=new Map();if(app.hostPlays)app.lobbyPlayers.set('host',{id:'host',name:app.localName,participates:true,joined:Date.now()});setStatus('XONA YARATILMOQDA');$('createBtn').disabled=true;let peer;
 try{peer=new Peer(roomPeerId(app.room),{debug:0})}catch(e){toast('Xona yaratib bo‘lmadi: '+e.message,true);$('createBtn').disabled=false;return}app.peer=peer;
 peer.on('open',()=>{app.connectionReady=true;setStatus('HOST / '+app.room);$('createBtn').disabled=false;broadcastLobby();showLobby();toast('Xona tayyor: '+app.room)});
 peer.on('connection',conn=>{app.clients.set(conn.peer,conn);conn.on('open',()=>{});conn.on('data',msg=>receiveFromClient(conn,msg));conn.on('close',()=>disconnectClient(conn));conn.on('error',()=>disconnectClient(conn))});
 peer.on('error',e=>{console.error('Peer host error',e);$('createBtn').disabled=false;setStatus('ALOQA XATOSI',true);toast(e.type==='unavailable-id'?'Xona kodi band, qayta yarating.':'Peer server xatosi: '+(e.type||'unknown'),true)});
 peer.on('disconnected',()=>{setStatus('SERVER BILAN ALOQA UZILDI',true);try{peer.reconnect()}catch{}});
}
function disconnectClient(conn){app.clients.delete(conn.peer);const u=app.lobbyPlayers?.get(conn.peer);if(u){if(app.world){const p=app.world.getPlayer(conn.peer);if(p){p.active=false;p.input={dx:0,dy:0,fire:false,run:false,aim:0};if(p.alive&&p.lives>0){p.lives=1;app.world.kill(p,null,'disconnected')}}}else{app.lobbyPlayers.delete(conn.peer);broadcastLobby()}}}
function receiveFromClient(conn,msg){if(!msg||typeof msg!=='object')return;const id=conn.peer;if(msg.t==='hello'){
  if(app.world){send(conn,{t:'reject',text:'Match boshlangan. Keyingi matchda qo‘shiling.'});return}
  if(!app.lobbyPlayers.has(id)&&app.lobbyPlayers.size>=30){send(conn,{t:'reject',text:'Xona to‘lgan.'});return}
  app.lobbyPlayers.set(id,{id,name:safeName(msg.name),participates:true,joined:Date.now()});send(conn,{t:'welcome',id,room:app.room,config:app.config});broadcastLobby();return
 }
 if(!app.lobbyPlayers?.has(id))return;
 if(msg.t==='input'&&app.world){app.world.setInput(id,msg.input||{});return}
 if(msg.t==='cmd'&&app.world){app.world.command(id,msg);return}
}
function joinRoom(){const code=extractCode($('joinCode').value),name=safeName($('joinNick').value);if(code.length<5){toast('Xona kodini to‘g‘ri kiriting.',true);return}if(!window.Peer){toast('PeerJS kutubxonasi yuklanmadi. Internetni tekshiring.',true);return}closePeer();app.room=code;app.localName=name;app.isHost=false;setStatus('XONAGA ULANISH');$('joinBtn').disabled=true;const peer=new Peer({debug:0});app.peer=peer;
 const timeout=setTimeout(()=>{if(!app.connectionReady){toast('Host topilmadi. Xona kodi va host internetini tekshiring.',true);setStatus('XONA TOPILMADI',true);$('joinBtn').disabled=false}},13000);app.connectionTimeout=timeout;
 peer.on('open',()=>{app.localId=peer.id;const conn=peer.connect(roomPeerId(code),{reliable:true,serialization:'json'});app.conn=conn;conn.on('open',()=>{send(conn,{t:'hello',name});setStatus('HOSTGA ULANMOQDA')});conn.on('data',receiveFromHost);conn.on('close',()=>{app.connectionReady=false;setStatus('HOST ALOQASI UZILDI',true);toast('Xona bilan aloqa uzildi. Qayta kiring.',true);$('joinBtn').disabled=false});conn.on('error',e=>{console.error('Conn error',e);toast('Ulanish xatosi.',true);$('joinBtn').disabled=false})});
 peer.on('error',e=>{clearTimeout(timeout);setStatus('ULANISH XATOSI',true);toast('Peer xatosi: '+(e.type||e.message),true);$('joinBtn').disabled=false});
 peer.on('disconnected',()=>{try{peer.reconnect()}catch{}})
}
function receiveFromHost(msg){if(!msg||typeof msg!=='object')return;
 if(msg.t==='welcome'){clearTimeout(app.connectionTimeout);app.connectionReady=true;app.localId=msg.id;app.config=msg.config;setStatus('ULANDI / '+app.room);$('joinBtn').disabled=false;showLobby();toast('Siz '+app.room+' xonasidasiz');return}
 if(msg.t==='reject'){clearTimeout(app.connectionTimeout);$('joinBtn').disabled=false;toast(msg.text||'Xona sizni qabul qilmadi.',true);setStatus('XONA RAD ETDI',true);return}
 if(msg.t==='lobby'){app.lobbyView=msg;if(app.screen==='game'&&app.view?.phase==='match_end'){app.view=null;app.map=null;showLobby()}if(app.screen==='lobby')renderLobby();return}
 if(msg.t==='map'){app.map=msg.map;app.config=msg.config;app.mode=msg.mode;app.discovered.clear();app.eventsSeen.clear();app.particles=[];app.lastSnapshotAt=0;showScreen('game');return}
 if(msg.t==='snapshot'){if(app.screen!=='game')showScreen('game');updateView(msg);return}
 if(msg.t==='ended'){toast('Host xonani yopdi.',true);closePeer();showScreen('home');return}
}
function startMatch(){if(!app.isHost)return;app.quizSeen=new Set();const players=lobbyParticipants();const minimum=app.config.mode==='impostor'?4:2;if(players.length<minimum){toast(`Kamida ${minimum} o‘yinchi kerak.`,true);return}app.world=new World(app.config,players,[0,0]);sendMapToAll();app.view=null;app.discovered.clear();app.eventsSeen.clear();app.lastSnapshotAt=0;showScreen('game');setStatus('MATCH / LIVE');sendSnapshots(true);toast('ROUND 01 / MATCH BOSHLANDI')}
function sendMapToAll(){if(!app.world)return;const w=app.world,msg={t:'map',map:w.map,config:w.config,mode:w.mode,round:w.round};app.map=w.map;app.mode=w.mode;for(const c of app.clients.values())send(c,msg)}
function sendSnapshots(force=false){if(!app.world)return;const w=app.world;const now=Date.now();if(!force&&now-app.lastNet<110)return;app.lastNet=now;app.view=w.snapshotFor('host');updateView(app.view);for(const [id,conn] of app.clients.entries())send(conn,w.snapshotFor(id))}
function advanceRound(){const w=app.world;if(!w)return;if(w.round>=app.config.rounds){w.phase='match_end';sendSnapshots(true);return}const persisted=[...w.players.values()].map(p=>({id:p.id,name:p.name,participates:true,joined:p.joined,stats:{kills:p.kills,deaths:p.deaths,assists:p.assists,score:p.score,credits:clamp(p.credits+300,0,9999),pieces:0}}));const next=new World(app.config,persisted,w.matchWins,w.round+1);app.world=next;sendMapToAll();sendSnapshots(true);toast(`ROUND ${next.round} / YANGI LABIRINT`)}
function leaveGame(){if(app.isHost)for(const conn of app.clients.values())send(conn,{t:'ended'});closePeer();setStatus('TIZIM TAYYOR');history.replaceState({},'',location.pathname);showScreen('home')}
function command(action,other={}){if(app.isHost){app.world?.command('host',{action,...other});sendSnapshots(true)}else if(app.connectionReady)send(app.conn,{t:'cmd',action,...other})}
function updateView(v){if(!v)return;const isNewRound=app.view&&v.round!==app.view.round;
 if(!app.isHost){const old=app.view;app.remoteTween={from:new Map((old?.players||[]).map(p=>[p.id,p])),receivedAt:performance.now()};app.view=v;}
 if(isNewRound){app.discovered.clear();app.eventsSeen.clear();app.particles=[]}
 app.lastSnapshotAt=Date.now();for(const ev of v.events||[]){if(!app.eventsSeen.has(ev.id)){app.eventsSeen.add(ev.id);processEvent(ev,v)}if(app.eventsSeen.size>450)app.eventsSeen.clear()}
 if(app.screen==='game')refreshHud(v);
}
function processEvent(ev,v){if(ev.kind==='death'){spawnCubes(ev.x,ev.y,ev.team);app.screenShake=Math.max(6,app.screenShake);pushFeed(`${ev.killer}  ⌖  ${ev.player}`);playTone('death')}
 if(ev.kind==='shot'&&ev.player===app.localId)playTone('shot');
 if(ev.kind==='hit'&&ev.target===app.localId)playTone('hit');
 if(ev.kind==='pickup'&&ev.target===app.localId){toast('LOOT OLINDI');playTone('pickup')}
  if(ev.kind==='chest_open'&&ev.target===app.localId){toast('🎁 '+ev.msg);playTone('pickup')}
  if(ev.kind==='monster_death'){spawnCubes(ev.x,ev.y,2);pushFeed('MAXLUQ MAG‘LUB · LOOT QOLDI')}
  if(ev.kind==='monster_hit'&&ev.target===app.localId)playTone('hit');
 if(ev.kind==='purchase'&&ev.player===app.localName){toast('SOTIB OLINDI · '+ev.item);playTone('pickup')}
 if(ev.kind==='puzzle_open'&&ev.target===app.localId)openPuzzle(ev.terminal,ev.quiz);
 if(ev.kind==='hint'&&ev.target===app.localId)toast(ev.msg,true);
 if(ev.kind==='solved'){pushFeed(ev.player+' / KOD YECHILDI');if(ev.target===app.localId){closeModal('puzzle');toast('TO‘G‘RI! SANDIQ TUSHDI · [E] OCHING');playTone('pickup')}}
 if(ev.kind==='sabotage'||ev.kind==='bomb'||ev.kind==='meeting_result'){pushFeed(ev.msg||'SIGNAL LOST');if(ev.kind==='bomb')app.screenShake=6}
 if(ev.kind==='round_end'){pushFeed(ev.winner+' / RAUND G‘OLIBI')}
}
function pushFeed(text){app.feed.unshift({text,time:Date.now()});app.feed=app.feed.slice(0,5);const root=$('killFeed');root.replaceChildren();for(const item of app.feed){const e=document.createElement('div');e.className='kill-entry';e.textContent=item.text;root.append(e)}}
function closeAllModals(){for(const id of ['shopModal','scoreModal','puzzleModal','meetingModal','confirmModal'])$(id).classList.add('hidden');app.shopOpen=false;app.scoreOpen=false;app.puzzleOpen=null;app.meetingOpen=false}
function closeModal(kind){const names={shop:'shopModal',score:'scoreModal',puzzle:'puzzleModal',meeting:'meetingModal',confirm:'confirmModal'};if(!names[kind])return;$(names[kind]).classList.add('hidden');if(kind==='shop')app.shopOpen=false;if(kind==='score')app.scoreOpen=false;if(kind==='puzzle')app.puzzleOpen=null;if(kind==='meeting')app.meetingOpen=false}
function openShop(){if(app.screen!=='game'||app.mode==='impostor')return;app.shopOpen=!app.shopOpen;$('shopModal').classList.toggle('hidden',!app.shopOpen);if(app.shopOpen){app.scoreOpen=false;$('scoreModal').classList.add('hidden');renderShop()}}
function renderShop(){const me=app.view?.me,root=$('shopGrid');$('shopCredits').textContent='◈ '+String(me?.credits||0).padStart(4,'0');root.replaceChildren();for(const item of SHOP){const b=document.createElement('button');b.className='shop-item';b.disabled=!me||!me.alive||me.credits<item.cost;const icon=document.createElement('span');icon.className='shop-item-icon';if(item.kind==='gun')icon.append(makeGunIcon(item.id));else icon.textContent=item.icon;const name=document.createElement('b');name.textContent=item.name;const desc=document.createElement('small');desc.textContent=item.info;const price=document.createElement('strong');price.textContent=`◈ ${item.cost} CR`;b.append(icon,name,desc,price);b.addEventListener('click',()=>{command('buy',{item:item.id});setTimeout(renderShop,110)});root.append(b)}}
function openScores(){app.scoreOpen=!app.scoreOpen;$('scoreModal').classList.toggle('hidden',!app.scoreOpen);if(app.scoreOpen)renderScores()}
function renderScores(){const root=$('scoreTable');root.replaceChildren();const row=document.createElement('div');row.className='score-row heading';for(const label of ['OPERATIVE','TEAM','K','D','SCORE']){const s=document.createElement('span');s.textContent=label;row.append(s)}root.append(row);const players=[...(app.view?.roster||[])].sort((a,b)=>b.score-a.score||b.kills-a.kills);for(const p of players){const el=document.createElement('div');el.className='score-row'+(p.id===app.localId?' me':'')+(p.lives===0&&!p.alive?' dead':'');const values=[p.name,p.team<0?'SOLO':TEAMS[p.team].name,p.kills,p.deaths,p.score];for(let i=0;i<values.length;i++){const c=document.createElement('span');c.textContent=values[i];if(i===0)c.style.color=p.color;el.append(c)}root.append(el)}}
function openPuzzle(terminal,quiz){const q=QUIZZES[quiz];if(!q)return;app.puzzleOpen=terminal;$('puzzleModal').classList.remove('hidden');$('puzzleTitle').textContent='TERMINAL '+(Number(terminal.replace('term',''))+1);$('puzzleQuestion').textContent=q.q;const root=$('puzzleOptions');root.replaceChildren();for(let i=0;i<q.a.length;i++){const b=document.createElement('button');b.className='puzzle-choice';b.textContent=`${'ABCD'[i]} / ${q.a[i]}`;b.addEventListener('click',()=>{command('solve',{terminal,answer:i});closeModal('puzzle')});root.append(b)}}
function updateMeeting(v){if(v.meeting){if(!app.meetingOpen){app.meetingOpen=true;$('meetingModal').classList.remove('hidden')}const myVote=v.meeting.votes?.[app.localId];$('meetingTime').textContent=fmtTime((v.meeting.endsAt-Date.now())/1000);const root=$('meetingOptions');root.replaceChildren();for(const p of v.roster.filter(p=>p.alive)){const b=document.createElement('button');b.className='meeting-option'+(myVote===p.id?' selected':'');b.textContent=`${p.name}   /   ${p.kills} K`;b.disabled=!!myVote||!v.me?.alive;b.addEventListener('click',()=>command('vote',{target:p.id}));root.append(b)}const skip=document.createElement('button');skip.className='meeting-option'+(myVote==='skip'?' selected':'');skip.textContent='— OVOZ BERMASLIK';skip.disabled=!!myVote||!v.me?.alive;skip.onclick=()=>command('vote',{target:'skip'});root.append(skip);const list=$('meetingMessages');list.replaceChildren();for(const m of v.meeting.messages){const e=document.createElement('div');e.className='chat-msg';const name=document.createElement('b');name.textContent=m.name+': ';e.append(name,document.createTextNode(m.text));list.append(e)}list.scrollTop=list.scrollHeight}
 else if(app.meetingOpen){closeModal('meeting')}
}
function refreshHud(v){if(!v)return;const me=v.me||{name:'HOST / SPECTATOR',color:'#e4b85f',lives:0,hp:0,armor:0,credits:0,weapon:'pistol',inventory:{},role:'spectator',team:-1,pieces:0,taskCount:0};
 const w=WEAPONS[me.weapon]||WEAPONS.pistol,g=me.inventory?.[me.weapon]||{mag:0,reserve:0};$('hudMode').textContent=MODES[v.mode].name;const weaponVisual=$('hudWeaponVisual');if(weaponVisual&&weaponVisual.dataset.weapon!==me.weapon){weaponVisual.replaceChildren(makeGunIcon(me.weapon));weaponVisual.dataset.weapon=me.weapon;}$('gameRoom').textContent=app.room;$('hudRound').textContent=`ROUND ${String(v.round).padStart(2,'0')} / ${String(v.rounds).padStart(2,'0')}`;$('hudTime').textContent=fmtTime(v.paused||v.phase==='meeting'?v.remaining:(v.endsAt-Date.now())/1000);$('hudAlive').textContent=`${v.roster.filter(p=>p.alive).length} ALIVE`;$('hudName').textContent=me.name;$('hudTeam').textContent=me.team===-1?'SOLO / UNAFFILIATED':TEAMS[me.team].name;$('hudRole').textContent=me.role==='traitor'?'XOIN / MAXFIY':me.role==='double'?'DOUBLE AGENT':me.role==='crew'?'CREWMATE':me.role==='spectator'?'SPECTATOR':'OPERATIVE';$('hudRole').style.color=me.role==='traitor'||me.role==='double'?'#f0806e':'#92bd9f';$('hudAvatar').textContent=me.name?.slice(0,1).toUpperCase()||'✦';$('hudAvatar').style.background=me.color||'#e4b85f';$('hudLives').textContent=me.lives>0?'◆ '.repeat(me.lives).trim():'ELIMINATED';$('hudHpText').textContent=Math.round(me.hp);$('hudHpBar').style.width=me.hp+'%';$('hudArmorText').textContent=Math.round(me.armor);$('hudArmorBar').style.width=me.armor+'%';$('hudWeapon').textContent=w.name;$('hudWeaponClass').textContent=w.class;$('hudAmmo').textContent=String(g.mag).padStart(2,'0');$('hudReserve').textContent=String(g.reserve).padStart(2,'0');$('hudReload').textContent=me.reloadAt>Date.now()?'↻ RELOADING...':'R / QAYTA O‘QLASH';$('hudCredits').textContent='◈ '+me.credits.toLocaleString('en-US');$('hudInventory').textContent=`[H] MEDKIT ×${me.items?.medkit||0} · KEY ×${me.items?.key||0}`;$('hudObjectiveCount').textContent=`${v.taskSolved} / ${v.taskTotal}`;$('hudTaskProgress').style.width=(v.taskTotal?v.taskSolved/v.taskTotal*100:0)+'%';
 let objective='Labirint ichida dushmanlarni qidiring, o‘q va kredit to‘plang.',title='RAQIBLARNI YENGING';
 if(v.mode==='team'||v.mode==='double'){title=me.team===0?'DATA CORE / FAOLLASHTIRISH':'DATA CORE / HIMOYA';objective=v.bomb.planted?`Data core faol! ${fmtTime((v.bomb.expiresAt-Date.now())/1000)} qoldi. ${me.team===1?'E orqali o‘chiring.':'Uni himoya qiling.'}`:me.team===0?'Xaritadagi markaziy data core qurilmasiga E tugmasi bilan yaqinlashing.':'Raqiblarning data core faollashtirishiga yo‘l qo‘ymang.'}
 if(v.mode==='ffa'){title='OXIRGI OMONGA QOLGAN';objective='Raqiblarni toping, ularning lootini oling va tirik qoling.'}
 if(v.mode==='impostor'){title=me.role==='traitor'?'MAXFIY VAZIFA':'AGENTLAR VAZIFASI';objective=me.role==='traitor'?'Q: yaqin agentni yashirincha yo‘qotish yoki elektrni o‘chirish. Shubha uyg‘otmang.':'Terminallardagi savollarni yeching. Xoinni aniqlash uchun M orqali yig‘ilish chaqiring.'}
 if(v.mode==='escape'){title='PORTAL KODLARI';objective=`${me.pieces||0}/3 kod-parcha topildi. Terminallarda E orqali savollarni yeching, so‘ng chiqish portaliga boring.`}
 if(v.mode==='double'&&me.role==='double')objective+=' Siz yashirin ikki tomonlama agentsiz: Q tugmasi bilan jamoangiz aloqasini uzishingiz mumkin.';
 $('hudObjectiveTitle').textContent=title;$('hudObjective').textContent=objective;
 $('shopBtn').classList.toggle('hidden',v.mode==='impostor');$('mobileUtility').classList.toggle('hidden',!(v.mode==='impostor'||v.mode==='double'));$('mobileMeeting').classList.toggle('hidden',v.mode!=='impostor');$('gameHostControls').classList.toggle('hidden',!app.isHost);$('pauseBtn').textContent=v.paused?'▶ RESUME':'Ⅱ PAUSE';
 if(app.shopOpen)renderShop();if(app.scoreOpen)renderScores();updateMeeting(v);updateEndOverlay(v);
}
function updateEndOverlay(v){const overlay=$('centerOverlay');if(v.phase==='playing'||v.phase==='meeting'){overlay.classList.add('hidden');return}overlay.classList.remove('hidden');let title=v.phase==='match_end'?'MATCH YAKUNLANDI':'RAUND TUGADI',wins=v.matchWins||[0,0];if(v.phase==='match_end'&&(v.mode==='team'||v.mode==='double'))title=wins[0]>wins[1]?'QIZILLAR G‘OLIB':wins[1]>wins[0]?'KO‘KLAR G‘OLIB':'DURANG';overlay.replaceChildren();const card=document.createElement('div');card.className='end-card';const icon=document.createElement('div');icon.className='end-symbol';icon.textContent='✳';const h=document.createElement('h2');h.textContent=title;const p=document.createElement('p');p.textContent=(v.roundWinner||'')+' / '+(v.roundReason||'');const details=document.createElement('div');details.className='end-detail';details.textContent=`RAUND ${v.round}/${v.rounds}   •   QIZIL ${wins[0]} : ${wins[1]} KO‘K`;card.append(icon,h,p,details);
 if(app.isHost&&v.phase==='round_end'){const b=document.createElement('button');b.className='btn btn-accent';b.textContent=v.round>=v.rounds?'MATCH NATIJALARINI KO‘RISH →':'KEYINGI RAUND →';b.onclick=advanceRound;card.append(b)}
 if(v.phase==='match_end'){const b=document.createElement('button');b.className='btn btn-accent';b.textContent=app.isHost?'YANGI MATCH / LOBBY':'NATIJALARNI KO‘RISH';b.onclick=()=>{if(app.isHost){app.world=null;broadcastLobby();showLobby()}else openScores()};card.append(b)}
 if(!app.isHost&&v.phase==='round_end'){const note=document.createElement('small');note.textContent='HOST KEYINGI RAUNDNI BOSHLASHINI KUTING';note.style.color='#a8b6a7';card.append(note)}overlay.append(card)
}
function setupUI(){initHero();document.querySelectorAll('[data-back="home"]').forEach(b=>b.addEventListener('click',()=>showScreen('home')));
 $('hostOpenBtn').addEventListener('click',()=>showScreen('config'));$('joinOpenBtn').addEventListener('click',()=>showScreen('join'));
 $('modeGrid').querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{app.mode=b.dataset.mode;$('modeGrid').querySelectorAll('[data-mode]').forEach(el=>el.classList.toggle('selected',el===b))}));
 $('createBtn').addEventListener('click',createRoom);$('joinBtn').addEventListener('click',joinRoom);$('joinCode').addEventListener('keydown',e=>{if(e.key==='Enter')$('joinNick').focus()});$('joinNick').addEventListener('keydown',e=>{if(e.key==='Enter')joinRoom()});
 $('copyLinkBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(shareUrl());toast('Havola nusxalandi!')}catch{window.prompt('Havolani nusxalash:',shareUrl())}});
 $('startBtn').addEventListener('click',startMatch);$('shuffleBtn').addEventListener('click',()=>{if(!app.isHost||!app.lobbyPlayers)return;const list=lobbyParticipants().sort(()=>Math.random()-.5);app.lobbyPlayers=new Map(list.map((p,i)=>[p.id,{...p,joined:Date.now()+i}]));broadcastLobby();toast('Jamoalar aralashtirildi')});
 $('lobbyExitBtn').addEventListener('click',leaveGame);$('gameExitBtn').addEventListener('click',()=>{$('confirmModal').classList.remove('hidden')});$('cancelExitBtn').onclick=()=>closeModal('confirm');$('confirmExitBtn').onclick=leaveGame;
 $('shopBtn').addEventListener('click',openShop);$('scoreBtn').addEventListener('click',openScores);document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeModal(b.dataset.close)));
 $('pauseBtn').addEventListener('click',()=>{if(app.world){if(!app.world.paused){app.world.paused=true;app.world.pauseStarted=Date.now()}else{app.world.paused=false;const d=Date.now()-app.world.pauseStarted;app.world.endsAt+=d;if(app.world.bomb.planted)app.world.bomb.expiresAt+=d;if(app.world.meeting)app.world.meeting.endsAt+=d}sendSnapshots(true)}});
 $('endRoundBtn').addEventListener('click',()=>{if(app.isHost&&app.world?.phase==='playing')app.world.endRound('HOST YAKUNLADI','Raund host tomonidan tugatildi')});
 $('soundBtn').addEventListener('click',()=>{app.audio=!app.audio;$('soundText').textContent=app.audio?'ON':'OFF';if(app.audio)playTone('pickup')});
 $('chatSendBtn').addEventListener('click',sendChat);$('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendChat()});
 window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);window.addEventListener('blur',()=>{app.keys.clear();app.controls.fire=false;app.pointerFiring=false});
 const c=$('gameCanvas');c.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){app.usingPointer=true;const r=c.getBoundingClientRect();app.controls.aim=Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)}});
 c.addEventListener('pointerdown',e=>{if(app.screen!=='game'||e.pointerType!=='mouse'||e.button!==0||isModalOpen())return;const r=c.getBoundingClientRect();app.controls.aim=Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2);app.pointerFiring=true;app.controls.fire=true;app.usingPointer=true;try{c.setPointerCapture(e.pointerId)}catch{}});const releaseFire=()=>{app.pointerFiring=false;app.controls.fire=false};c.addEventListener('pointerup',releaseFire);c.addEventListener('pointercancel',releaseFire);c.addEventListener('lostpointercapture',releaseFire);window.addEventListener('pointerup',releaseFire);c.addEventListener('contextmenu',e=>e.preventDefault());
 setupMobileControls();
 const room=extractCode(new URLSearchParams(location.search).get('room'));if(room){$('joinCode').value=room;showScreen('join')}
 setStatus('TIZIM TAYYOR');app.renderStarted=true;requestAnimationFrame(loop)
}
function sendChat(){const input=$('chatInput');const text=input.value.trim();if(text){command('chat',{text});input.value=''}}
function isModalOpen(){return ['shopModal','scoreModal','puzzleModal','meetingModal','confirmModal'].some(id=>!$(id).classList.contains('hidden'))}
function onKeyDown(e){if(app.screen!=='game')return;const tag=document.activeElement?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();app.keys.add(k);
 if(e.repeat)return;
 if(k==='r')command('reload');if(k==='e')command('interact');if(k==='q')command('special');if(k==='h')command('useMed');if(k==='m'&&app.mode==='impostor')command('meeting');if(k==='b')openShop();if(k==='tab'){e.preventDefault();openScores()}if(k==='escape'){closeAllModals()}if(k==='f')app.controls.fire=true;
 if('12345'.includes(k)&&WEAPONS[Object.keys(WEAPONS)[+k-1]])command('equip',{weapon:Object.keys(WEAPONS)[+k-1]})
}
function onKeyUp(e){app.keys.delete(e.key.toLowerCase());if(e.key.toLowerCase()==='f')app.controls.fire=false}
function updateInput(){const k=app.keys;let dx=0,dy=0;if(k.has('w')||k.has('arrowup'))dy--;if(k.has('s')||k.has('arrowdown'))dy++;if(k.has('a')||k.has('arrowleft'))dx--;if(k.has('d')||k.has('arrowright'))dx++;if(app.joystickPointer&&Math.hypot(app.joystickPointer.dx,app.joystickPointer.dy)>.2){dx=app.joystickPointer.dx;dy=app.joystickPointer.dy}if(isModalOpen()){dx=0;dy=0;app.controls.fire=false}app.controls.dx=dx;app.controls.dy=dy;app.controls.run=k.has('shift');if(app.mobileFiring&&app.view?.me){const me=app.view.me;const enemies=(app.view.players||[]).filter(p=>p.id!==me.id&&p.alive&&(p.team!==me.team||p.team===-1));enemies.sort((a,b)=>distance(me,a)-distance(me,b));if(enemies[0])app.controls.aim=Math.atan2(enemies[0].y-me.y,enemies[0].x-me.x);app.controls.fire=true}else if(!app.mobileFiring&&!k.has('f')&&!app.pointerFiring){app.controls.fire=false}if(app.isHost)app.world?.setInput('host',app.controls);else if(app.screen==='game'&&app.connectionReady&&app.conn?.open&&Date.now()-app.lastNet>55){send(app.conn,{t:'input',input:app.controls});app.lastNet=Date.now()}}
function setupMobileControls(){const stick=$('moveStick'),knob=$('moveKnob');const update=e=>{const r=stick.getBoundingClientRect(),ox=e.clientX-(r.left+r.width/2),oy=e.clientY-(r.top+r.height/2),l=Math.hypot(ox,oy)||1,k=Math.min(1,l/(r.width*.38));app.joystickPointer={dx:ox/l*k,dy:oy/l*k};knob.style.transform=`translate(calc(-50% + ${ox/l*35*k}px),calc(-50% + ${oy/l*35*k}px))`};stick.addEventListener('pointerdown',e=>{e.preventDefault();stick.setPointerCapture(e.pointerId);update(e)});stick.addEventListener('pointermove',e=>{if(stick.hasPointerCapture(e.pointerId))update(e)});const stop=()=>{app.joystickPointer=null;knob.style.transform='translate(-50%,-50%)'};stick.addEventListener('pointerup',stop);stick.addEventListener('pointercancel',stop);const fire=$('mobileFire');fire.addEventListener('pointerdown',e=>{e.preventDefault();fire.setPointerCapture(e.pointerId);app.mobileFiring=true});const release=()=>{app.mobileFiring=false;app.controls.fire=false};fire.addEventListener('pointerup',release);fire.addEventListener('pointercancel',release);$('mobileReload').onclick=()=>command('reload');$('mobileInteract').onclick=()=>command('interact');$('mobileSpecial').onclick=()=>command('special');$('mobileMeeting').onclick=()=>command('meeting')}

/* ————— CANVAS RENDERING / FOG OF WAR / CUBE-DEATH EFFECTS ————— */
function resizeCanvas(c){const dpr=Math.min(1.5,devicePixelRatio||1),r=c.getBoundingClientRect(),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(c.width!==w||c.height!==h){c.width=w;c.height=h}const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w:r.width,h:r.height}}
function hash(x,y,seed=0){let n=(Math.imul(x+13,374761393)+Math.imul(y+17,668265263)+seed)|0;n=Math.imul(n^(n>>>13),1274126177);return(n^(n>>>16))>>>0}
function visibleSet(map,me,radius,lamps=[]){const set=new Set(),n=map.length,max=Math.min(12,radius+1),cx=Math.floor(me.x),cy=Math.floor(me.y);
 for(let y=Math.max(0,cy-Math.ceil(max));y<=Math.min(n-1,cy+Math.ceil(max));y++)for(let x=Math.max(0,cx-Math.ceil(max));x<=Math.min(n-1,cx+Math.ceil(max));x++){
 const p={x:x+.5,y:y+.5},d=distance(me,p);if(d>max)continue;
 const scanner=me.scannerEndsAt>Date.now(),flash=d<7.3&&Math.cos(Math.atan2(p.y-me.y,p.x-me.x)-me.a)>.63,lit=lamps.some(l=>distance(l,p)<l.r*1.2&&distance(l,me)<11&&lineClear(map,l.x,l.y,p.x,p.y));
 if((d<1.45||scanner||flash||lit)&&lineClear(map,me.x,me.y,p.x,p.y))set.add(y*n+x)
 }return set;
}
function drawTile(ctx,x,y,px,py,s,wall,seen,seed){if(!seen)return;const h=hash(x,y,seed),v=h%7;
 if(wall){ctx.fillStyle='#080f12';ctx.fillRect(px+s*.11,py+s*.14,s,s);
 ctx.fillStyle=['#243832','#233a34','#2a413a','#243c36','#263f37','#28443d','#233832'][v];ctx.fillRect(px,py,s*.98,s*.94);
 ctx.fillStyle='#415b4b';ctx.fillRect(px+1,py+1,s*.95,s*.11);ctx.fillStyle='#314f40';ctx.fillRect(px+1,py+1,s*.13,s*.93);
 ctx.fillStyle='#0d1f1c';ctx.fillRect(px+s*.88,py+s*.1,s*.1,s*.86);ctx.fillRect(px+s*.12,py+s*.83,s*.77,s*.11);
 ctx.strokeStyle='#435f5080';ctx.lineWidth=.75;ctx.beginPath();ctx.moveTo(px+s*.08,py+s*.48);ctx.lineTo(px+s*.92,py+s*.48);ctx.moveTo(px+s*.43,py+s*.08);ctx.lineTo(px+s*.43,py+s*.48);ctx.moveTo(px+s*.69,py+s*.48);ctx.lineTo(px+s*.69,py+s*.85);ctx.stroke();
 if(h%9===0){ctx.fillStyle='#657a544b';ctx.fillRect(px+s*.22,py+s*.28,s*.18,s*.07)}
 }else{ctx.fillStyle=['#1e2b29','#202d2a','#1c2927','#202f2b','#23322e','#1d302c','#202d2c'][v];ctx.fillRect(px,py,s+1,s+1);
 ctx.strokeStyle='#4b625035';ctx.lineWidth=1;ctx.strokeRect(px+.5,py+.5,s-1,s-1);
 for(let i=0;i<4;i++){const n=hash(x*13+i,y*19-i,seed),ix=(n&255)/255,iy=((n>>>8)&255)/255;ctx.fillStyle=i%2?'#58776129':'#091b172a';ctx.fillRect(px+ix*s,py+iy*s,Math.max(1,s*.027),Math.max(1,s*.027))}
 if(h%17===0){ctx.strokeStyle='#5c7d5a70';ctx.beginPath();ctx.moveTo(px+s*.13,py+s*.42);ctx.lineTo(px+s*.47,py+s*.51);ctx.lineTo(px+s*.58,py+s*.75);ctx.stroke()}
 if(h%23===0){ctx.fillStyle='#7fa67240';ctx.fillRect(px+s*.22,py+s*.22,s*.14,s*.09)}
 }
}
function drawDrop(ctx,d,toScreen,t){const{x,y}=toScreen(d),size=t*.2,pulse=.8+Math.sin(performance.now()/240+d.x)*.13;ctx.save();ctx.translate(x,y);ctx.shadowBlur=15;ctx.shadowColor='#e5b65b';ctx.strokeStyle=d.kind==='chest'?'#f1c76e':d.kind==='corpse'?'#fb8873':d.kind==='cash'?'#e3b65f':'#a0c6a9';ctx.fillStyle=d.kind==='corpse'?'#563d35':'#2f422f';ctx.lineWidth=2;ctx.rotate(performance.now()/2400);ctx.fillRect(-size*pulse,-size*pulse,size*2*pulse,size*2*pulse);ctx.strokeRect(-size*pulse,-size*pulse,size*2*pulse,size*2*pulse);ctx.rotate(-performance.now()/2400);ctx.fillStyle='#f3e1ab';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${Math.max(11,t*.30)}px monospace`;ctx.fillText(d.kind==='chest'?'▣':d.kind==='cash'?'◈':d.kind==='corpse'?'▣':d.kind==='ammo'?'▤':d.kind==='weapon'?'⌁':d.kind==='medkit'?'✚':d.kind==='armor'?'⬡':'✦',0,1);ctx.restore()}
function drawTerminal(ctx,t,screen,sz){const p=screen(t),s=sz*.67;ctx.fillStyle=t.solved?'#2e453a':'#263e3b';ctx.strokeStyle=t.solved?'#73937e':'#84c7d0';ctx.lineWidth=2;ctx.fillRect(p.x-s*.5,p.y-s*.5,s,s);ctx.strokeRect(p.x-s*.5,p.y-s*.5,s,s);ctx.fillStyle=t.solved?'#80af8b':'#b1e4e6';ctx.fillRect(p.x-s*.28,p.y-s*.28,s*.56,s*.33);ctx.fillStyle='#111b17';ctx.font=`700 ${Math.max(10,sz*.23)}px monospace`;ctx.textAlign='center';ctx.fillText(t.solved?'✓':'?',p.x,p.y+s*.26)}
function drawActor(ctx,p,toScreen,sz,isSelf){const q=toScreen(p),color=p.color||'#d6a959';if(!p.alive)return;
 const t=sz/32;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(p.a||0);ctx.shadowColor='#050a0a';ctx.shadowBlur=6;ctx.fillStyle='#080e10';ctx.fillRect(-12*t,-8*t,24*t,21*t);
 // Two boots, legs, vest, helmet and two arms, directional weapon.
 ctx.fillStyle='#242c2d';ctx.fillRect(-8*t,-10*t,5*t,8*t);ctx.fillRect(-8*t,3*t,5*t,8*t);
 ctx.fillStyle='#54625b';ctx.fillRect(-7*t,-8*t,15*t,16*t);ctx.fillStyle='#34443e';ctx.fillRect(-3*t,-6*t,11*t,12*t);
 ctx.fillStyle=color;ctx.fillRect(-9*t,-10*t,5*t,6*t);ctx.fillRect(-9*t,4*t,5*t,6*t);ctx.fillRect(-4*t,-9*t,13*t,4*t);ctx.fillRect(-4*t,5*t,13*t,4*t);
 ctx.fillStyle='#c3aa8c';ctx.fillRect(0,-5*t,7*t,10*t);ctx.fillStyle='#6e857b';ctx.fillRect(4*t,-6*t,7*t,12*t);ctx.fillStyle='#263d36';ctx.fillRect(6*t,-3*t,3*t,6*t);
 ctx.fillStyle='#11181b';ctx.fillRect(7*t,-3*t,14*t,6*t);ctx.fillStyle='#afc7bc';ctx.fillRect(9*t,-2*t,12*t,3*t);ctx.fillStyle='#8fa095';ctx.fillRect(12*t,0,4*t,5*t);
 if(isSelf){ctx.strokeStyle='#f9e4aa';ctx.lineWidth=1.5;ctx.strokeRect(-12*t,-12*t,24*t,24*t)}ctx.restore();
 ctx.textAlign='center';ctx.font=`700 ${Math.max(9,sz*.22)}px 'IBM Plex Mono',monospace`;ctx.strokeStyle='#070d0b';ctx.lineWidth=3;ctx.strokeText(String(p.name||'').slice(0,12),q.x,q.y-sz*.53);ctx.fillStyle=isSelf?'#fae0a1':'#ccdfd7';ctx.fillText(String(p.name||'').slice(0,12),q.x,q.y-sz*.53);
 if(p.hp<100){ctx.fillStyle='#4e302c';ctx.fillRect(q.x-sz*.27,q.y+sz*.36,sz*.55,3);ctx.fillStyle='#a5c7a9';ctx.fillRect(q.x-sz*.27,q.y+sz*.36,sz*.55*(p.hp/100),3)}
}
function drawParticles(ctx,toScreen,sz,dt){for(let i=app.particles.length-1;i>=0;i--){const p=app.particles[i];p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.2,dt);p.vy*=Math.pow(.2,dt);p.rotation+=p.spin*dt;const alpha=clamp(p.life/p.max,0,1);if(p.life<=0){app.particles.splice(i,1);continue}const s=toScreen(p);ctx.save();ctx.globalAlpha=alpha;ctx.translate(s.x,s.y);ctx.rotate(p.rotation);ctx.fillStyle=p.color;ctx.fillRect(-p.size*sz/2,-p.size*sz/2,p.size*sz,p.size*sz);ctx.fillStyle='#ffffff44';ctx.fillRect(-p.size*sz/2,-p.size*sz/2,p.size*sz,Math.max(1,p.size*sz*.18));ctx.restore()}}
function spawnCubes(x,y,team){const colors=[['#ed907a','#903c37','#efc7a0'],['#86bcd4','#386d82','#bdd7e4'],['#e1b75f','#92783c','#dfd9ad']][team===0?0:team===1?1:2];for(let i=0;i<35;i++){const a=rand(0,Math.PI*2),speed=rand(1.2,6);app.particles.push({x:x+rand(-.12,.12),y:y+rand(-.12,.12),vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,size:rand(.08,.24),rotation:rand(0,6),spin:rand(-18,18),life:1.1,max:1.1,color:colors[i%3]})}if(app.particles.length>450)app.particles.splice(0,80)}

function makeGunIcon(id){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 180 64');svg.setAttribute('aria-hidden','true');svg.classList.add('gun-silhouette');
 const defs={pistol:[12,58,31,14],smg:[7,94,25,17],rifle:[3,130,27,18],shotgun:[3,133,29,13],sniper:[2,151,26,10]},data=defs[id]||defs.pistol;
 const el=(tag,attrs)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));svg.append(e);return e};
 const [x,w,y,h]=data;el('rect',{x,y,width:w,height:h,rx:2,fill:'#84958d',stroke:'#c2d0ba','stroke-width':1});
 el('rect',{x:x+w*.46,y:y+3,width:w*.53,height:4,fill:'#263e36'});el('rect',{x:x+5,y:y-4,width:w*.15,height:4,fill:'#d0d6c1'});
 if(id==='sniper'){el('rect',{x:x+38,y:y-9,width:44,height:6,rx:2,fill:'#b8c9bd'});el('rect',{x:x+56,y:y-3,width:6,height:5,fill:'#485a52'})}
 if(id==='rifle'||id==='smg'){el('polygon',{points:`${x+5},${y+h} ${x+19},${y+h} ${x+7},${y+h+15} ${x-2},${y+h+15}`,fill:'#657168'})}
 if(id!=='sniper'){el('polygon',{points:`${x+w*.48},${y+h} ${x+w*.59},${y+h} ${x+w*.55},${y+h+18} ${x+w*.45},${y+h+18}`,fill:'#72877d'})}
 el('rect',{x:x+w-2,y:y+3,width:id==='pistol'?7:16,height:5,fill:'#a9c0ac'});
 if(id!=='pistol'){el('path',{d:`M ${x+10} ${y+h} l -14 7 l 4 8 l 17 -8`,fill:'#5d7464'});}
 return svg;
}
function drawMonster(ctx,m,toScreen,sz){const p=toScreen(m),size=sz*(m.kind==='brute'?.43:.31);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(m.a);ctx.fillStyle='#07120e';ctx.fillRect(-size*.9,-size*.9,size*1.8,size*1.8);ctx.fillStyle=m.kind==='brute'?'#51716c':'#3b5c46';ctx.fillRect(-size*.7,-size*.7,size*1.25,size*1.4);ctx.fillStyle='#b5e3a4';ctx.fillRect(size*.08,-size*.42,size*.32,size*.18);ctx.fillRect(size*.08,size*.25,size*.32,size*.18);ctx.fillStyle='#92a798';ctx.fillRect(-size,-size*.95,size*.32,size*.4);ctx.fillRect(-size,size*.55,size*.32,size*.4);ctx.restore();ctx.fillStyle='#12211a';ctx.fillRect(p.x-sz*.29,p.y-sz*.52,sz*.58,3);ctx.fillStyle='#99c69a';ctx.fillRect(p.x-sz*.29,p.y-sz*.52,sz*.58*m.hp/m.maxHp,3)}
function drawLamppost(ctx,light,toScreen,sz){const p=toScreen(light),radius=sz*.24;ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='#080e0e';ctx.fillRect(-radius*.75,-radius*.65,radius*1.5,radius*1.35);ctx.fillStyle='#374942';ctx.fillRect(-radius*.6,-radius*.85,radius*1.2,radius*1.3);ctx.fillStyle=light.color==='amber'?'#ffdda2':'#b1f8dc';ctx.shadowColor=light.color==='amber'?'#e9bc78':'#a6fbd4';ctx.shadowBlur=13;ctx.fillRect(-radius*.3,-radius*.45,radius*.6,radius*.62);ctx.restore()}
let lightLayer=null;
function drawDarkLighting(ctx,w,h,me,toScreen,sz,lamps,grid,isSpectator,v){
 if(isSpectator)return;
 if(!lightLayer)lightLayer=document.createElement('canvas');if(lightLayer.width!==Math.ceil(w)||lightLayer.height!==Math.ceil(h)){lightLayer.width=Math.ceil(w);lightLayer.height=Math.ceil(h)}
 const lx=lightLayer.getContext('2d');lx.globalCompositeOperation='source-over';lx.clearRect(0,0,w,h);lx.fillStyle='rgba(0,5,8,.93)';lx.fillRect(0,0,w,h);lx.globalCompositeOperation='destination-out';
 const cut=(x,y,r,strength=1)=>{const g=lx.createRadialGradient(x,y,sz*.1,x,y,r);g.addColorStop(0,`rgba(0,0,0,${strength})`);g.addColorStop(.55,`rgba(0,0,0,${strength*.87})`);g.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=g;lx.beginPath();lx.arc(x,y,r,0,Math.PI*2);lx.fill()};
 const center=toScreen(me);cut(center.x,center.y,sz*1.55,.94);
 const flicker=.97+Math.sin(performance.now()/800)*.025;
 lx.save();lx.beginPath();lx.moveTo(center.x,center.y);lx.arc(center.x,center.y,sz*7.2,me.a-.9,me.a+.9);lx.closePath();lx.clip();cut(center.x,center.y,sz*7.4,.95*flicker);lx.restore();
 for(const l of lamps){if(distance(l,me)>11||!lineClear(grid,me.x,me.y,l.x,l.y))continue;const p=toScreen(l);cut(p.x,p.y,sz*l.r*.95,.88)}
 if(v.me?.scannerEndsAt>Date.now())cut(center.x,center.y,sz*9.0,.6);
 lx.globalCompositeOperation='source-over';ctx.drawImage(lightLayer,0,0,w,h)
}
function renderGame(dt){const v=app.view,grid=app.map;if(app.screen!=='game'||!v||!grid)return;const {ctx,w,h}=resizeCanvas($('gameCanvas'));const me=v.me||{x:grid.length/2,y:grid.length/2,a:0,alive:false};const sz=clamp(Math.min(w/15,h/12),31,57),cameraX=me.x-w/(2*sz),cameraY=me.y-h/(2*sz),toScreen=p=>({x:(p.x-cameraX)*sz,y:(p.y-cameraY)*sz});
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#0b130f';ctx.fillRect(0,0,w,h);ctx.save();const shake=app.screenShake>0?app.screenShake:0;if(shake>0){ctx.translate(rand(-shake,shake),rand(-shake,shake));app.screenShake*=.78;if(app.screenShake<.4)app.screenShake=0}
 const isSpectator=!v.me,vis=isSpectator?null:visibleSet(grid,me,v.visibility||7,v.lamps||[]);if(vis)for(const key of vis)app.discovered.add(key);
 const x0=Math.max(0,Math.floor(cameraX)-1),x1=Math.min(grid.length-1,Math.ceil(cameraX+w/sz)+1),y0=Math.max(0,Math.floor(cameraY)-1),y1=Math.min(grid.length-1,Math.ceil(cameraY+h/sz)+1);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const idx=y*grid.length+x,visible=isSpectator||vis?.has(idx),old=isSpectator||app.discovered.has(idx);if(!old)continue;const px=(x-cameraX)*sz,py=(y-cameraY)*sz;drawTile(ctx,x,y,px,py,sz,grid[y][x],old,grid.length);if(!visible){ctx.fillStyle='#070d0bcb';ctx.fillRect(px,py,sz+1,sz+1)}}
 const shouldDraw=obj=>isSpectator||vis?.has(Math.floor(obj.y)*grid.length+Math.floor(obj.x));
 if(shouldDraw(v.bomb.site)&&(v.mode==='team'||v.mode==='double')){const b=toScreen(v.bomb.site);ctx.save();ctx.strokeStyle=v.bomb.planted?'#f0806e':'#d8ae66';ctx.lineWidth=3;ctx.strokeRect(b.x-sz*.5,b.y-sz*.5,sz,sz);ctx.fillStyle=v.bomb.planted?'#ed867450':'#e4b75f33';ctx.fillRect(b.x-sz*.5,b.y-sz*.5,sz,sz);ctx.fillStyle='#f6e4b8';ctx.font=`700 ${Math.max(10,sz*.27)}px monospace`;ctx.textAlign='center';ctx.fillText(v.bomb.planted?'!':'B',b.x,b.y+sz*.1);ctx.restore()}
 if(shouldDraw(v.exit)&&v.mode==='escape'){const e=toScreen(v.exit);ctx.save();ctx.translate(e.x,e.y);ctx.rotate(performance.now()/1700);ctx.strokeStyle='#d5c477';ctx.lineWidth=4;ctx.strokeRect(-sz*.33,-sz*.33,sz*.66,sz*.66);ctx.restore();ctx.fillStyle='#fff3b8';ctx.font=`800 ${sz*.32}px monospace`;ctx.textAlign='center';ctx.fillText('EXIT',e.x,e.y+sz*.09)}
 for(const l of v.lamps||[])if(shouldDraw(l))drawLamppost(ctx,l,toScreen,sz);
 for(const t of v.terminals)if(shouldDraw(t))drawTerminal(ctx,t,toScreen,sz);
 for(const g of v.gates||[])if(g.locked&&shouldDraw(g)){const q=toScreen(g);ctx.fillStyle='#c3a75550';ctx.fillRect(q.x-sz*.37,q.y-sz*.37,sz*.74,sz*.74);ctx.strokeStyle='#e5ca7a';ctx.lineWidth=3;ctx.strokeRect(q.x-sz*.37,q.y-sz*.37,sz*.74,sz*.74);ctx.fillStyle='#f9e8b2';ctx.font=`700 ${sz*.36}px monospace`;ctx.textAlign='center';ctx.fillText('⌑',q.x,q.y+sz*.14)};
 for(const d of v.drops)if(shouldDraw(d))drawDrop(ctx,d,toScreen,sz);
 for(const s of v.smokes||[]){const q=toScreen(s);const rad=sz*1.5,cloud=ctx.createRadialGradient(q.x,q.y,sz*.18,q.x,q.y,rad);cloud.addColorStop(0,'#96b8aab8');cloud.addColorStop(.7,'#718c7e92');cloud.addColorStop(1,'#506b5a00');ctx.fillStyle=cloud;ctx.beginPath();ctx.arc(q.x,q.y,rad,0,Math.PI*2);ctx.fill()}
 for(const b of v.bullets){const p=toScreen(b);ctx.strokeStyle='#fbe2aa';ctx.shadowBlur=8;ctx.shadowColor='#ffe9a3';ctx.lineWidth=2.7;ctx.beginPath();ctx.moveTo(p.x-b.dx*sz*.26,p.y-b.dy*sz*.26);ctx.lineTo(p.x+b.dx*sz*.12,p.y+b.dy*sz*.12);ctx.stroke();ctx.shadowBlur=0}
 for(const m of v.monsters||[])if(shouldDraw(m))drawMonster(ctx,m,toScreen,sz);
 for(const p of v.players.filter(p=>p.alive)){let ip=p;if(!app.isHost&&p.id!==app.localId&&app.remoteTween){const prev=app.remoteTween.from.get(p.id);if(prev){const k=clamp((performance.now()-app.remoteTween.receivedAt)/115,0,1);ip={...p,x:prev.x+(p.x-prev.x)*k,y:prev.y+(p.y-prev.y)*k}}}drawActor(ctx,ip,toScreen,sz,p.id===app.localId)};
 for(const e of v.events||[])if((e.kind==='impact'||e.kind==='hit'||e.kind==='shot')&&Date.now()-e.time<220&&e.x!=null){const q=toScreen(e),age=clamp((Date.now()-e.time)/220,0,1);ctx.strokeStyle=e.kind==='hit'?`rgba(250,112,98,${1-age})`:`rgba(244,207,127,${1-age})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,(age*.45+.08)*sz,0,Math.PI*2);ctx.stroke()}
 drawParticles(ctx,toScreen,sz,dt);
 drawDarkLighting(ctx,w,h,me,toScreen,sz,v.lamps||[],grid,isSpectator,v);
 if(!isSpectator&&!me.alive){ctx.fillStyle='#110e0e8c';ctx.fillRect(0,0,w,h);ctx.textAlign='center';ctx.font=`800 ${Math.min(48,w/12)}px 'Barlow Condensed',Impact,sans-serif`;ctx.fillStyle='#f5b2a3';ctx.fillText(me.lives>0?'RESPAWN KUTILMOQDA':'ELIMINATED / SPECTATOR',w/2,h/2);ctx.font='600 11px monospace';ctx.fillStyle='#d8c5be';ctx.fillText(me.lives>0?'Qolgan hayotlar: '+me.lives:'Qolgan o‘yinchilarni kuzating',w/2,h/2+27)}
 if(v.paused){ctx.fillStyle='#111914d0';ctx.fillRect(0,0,w,h);ctx.fillStyle='#e0bd72';ctx.font=`900 53px 'Barlow Condensed',sans-serif`;ctx.textAlign='center';ctx.fillText('PAUSE / HOST',w/2,h/2)}
 ctx.restore();if(!app.renderFrames||app.renderFrames%5===0)renderMiniMap(v,grid,vis);renderNearbyHint(v);
}
function renderMiniMap(v,grid,vis){const {ctx,w,h}=resizeCanvas($('miniMap'));const n=grid.length,scale=Math.min(w/n,h/n),ox=(w-n*scale)/2,oy=(h-n*scale)/2;ctx.fillStyle='#101813';ctx.fillRect(0,0,w,h);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const key=y*n+x;if(!app.discovered.has(key)&&v.me)continue;ctx.fillStyle=grid[y][x]?'#607562':'#2f4235';ctx.fillRect(ox+x*scale,oy+y*scale,Math.ceil(scale),Math.ceil(scale));if(vis?.has(key)){ctx.fillStyle='#8eb39429';ctx.fillRect(ox+x*scale,oy+y*scale,Math.ceil(scale),Math.ceil(scale))}}
 for(const p of v.players.filter(p=>p.alive)){if(v.me&&p.id!==v.me.id&&!(v.me.scannerEndsAt>Date.now())&&!(vis?.has(Math.floor(p.y)*n+Math.floor(p.x))))continue;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(ox+p.x*scale,oy+p.y*scale,Math.max(2,scale*.65),0,Math.PI*2);ctx.fill()}
 for(const signal of v.radarPings||[]){const rx=ox+signal.x*scale,ry=oy+signal.y*scale;ctx.strokeStyle='#f28f78';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(rx,ry,Math.max(4,scale*2.3),0,Math.PI*2);ctx.stroke()}
 if(v.mode==='escape'&&v.me&&app.discovered.has(Math.floor(v.exit.y)*n+Math.floor(v.exit.x))){ctx.fillStyle='#f9d37d';ctx.fillRect(ox+v.exit.x*scale-2,oy+v.exit.y*scale-2,4,4)}}
function renderNearbyHint(v){const el=$('gamePrompt');const me=v.me;if(!me||!me.alive||v.phase!=='playing'){el.classList.add('hidden');return}const closest=(v.drops||[]).filter(d=>distance(d,me)<1.4)[0],term=(v.terminals||[]).find(t=>!t.solved&&distance(t,me)<1.7),site=(v.mode==='team'||v.mode==='double')&&distance(v.bomb.site,me)<2,exit=v.mode==='escape'&&distance(v.exit,me)<1.7;let msg='';if(closest)msg=`[E] ${closest.kind==='corpse'?'RAQIB INVENTARINI OLISH':closest.kind==='chest'?'MUKOFOT SANDIG‘INI OCHISH':closest.kind.toUpperCase()+' OLISH'}`;else if(term)msg='[E] TERMINAL / JUMBOQNI OCHISH';else if((v.gates||[]).some(g=>g.locked&&distance(g,me)<1.7))msg='[E] QULFLANGAN ESHIK / KALIT KERAK';else if(site)msg=`[E] ${v.bomb.planted?'DATA CORE ZARARSIZLANTIRISH':'DATA CORE FAOLLASHTIRISH'}`;else if(exit)msg=`[E] PORTALDAN CHIQISH · ${me.pieces||0}/3 KOD`;else if(v.mode==='impostor'&&me.role==='traitor')msg='[Q] YASHIRIN HUJUM / SABOTAJ';if(msg){el.classList.remove('hidden');el.textContent=msg}else el.classList.add('hidden')}
let previousFrame=performance.now();function loop(ts){app.renderFrames=(app.renderFrames||0)+1;if(!app.fpsStart)app.fpsStart=ts;if(ts-app.fpsStart>=1000){const fps=Math.round((app.renderFrames-app.fpsLastCount||0)*1000/(ts-app.fpsStart));const counter=$('fpsCounter');if(counter)counter.textContent=fps+' FPS';app.fpsLastCount=app.renderFrames;app.fpsStart=ts;}const dt=Math.min(.06,Math.max(.001,(ts-previousFrame)/1000));previousFrame=ts;
 if(app.screen==='game'){
  if(app.world&&app.isHost){updateInput();app.world.step(dt);if(app.world.phase==='round_end'&&Date.now()-app.world.roundEndAt>8500)advanceRound();sendSnapshots()}
  else if(app.conn){updateInput()}
  renderGame(dt);
  if(app.view){$('hudTime').textContent=fmtTime(app.view.paused||app.view.phase==='meeting'?app.view.remaining:(app.view.endsAt-Date.now())/1000);if(app.meetingOpen&&app.view.meeting)$('meetingTime').textContent=fmtTime((app.view.meeting.endsAt-Date.now())/1000)}
 }
 requestAnimationFrame(loop)
}
// The DOM is constructed before deferred game.js executes. No top-level query can run too early.
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupUI,{once:true});else setupUI();