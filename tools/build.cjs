const fs = require("node:fs"),
  path = require("node:path");
// The offline training worker runs the same physics, economy and quiz logic.
// It is explicitly a local practice mode, never a multiplayer authority.
let sim = fs.readFileSync("server/simulation.cjs", "utf8");
sim = sim.replace(
  /const \{\s*randomUUID\s*\}\s*=\s*require\(["']node:crypto["']\);/,
  "const randomUUID=()=>crypto.randomUUID();",
);
sim = sim.replace(
  /const QUIZZES\s*=\s*require\(["']\.\/quiz-bank\.json["']\);/,
  "const QUIZZES=" + fs.readFileSync("server/quiz-bank.json", "utf8") + ";",
);
sim = sim.replace(
  /const \{\s*WEAPONS,\s*SHOP\s*\}\s*=\s*require\(["']\.\.\/shared\/config\.json["']\);/,
  "const {WEAPONS,SHOP}=" + fs.readFileSync("shared/config.json", "utf8") + ";",
);
sim = sim.replace(/module\.exports\s*=\s*\{[\s\S]*?\};/, "");
const worker = `\nlet w,p,lastSeq=0,sendCount=0;const config={mode:'escape',duration:900,lives:5,rounds:1,mapSize:'small',monsters:'few',ammo:'limited',puzzles:true,practice:true};
onmessage=e=>{const m=e.data;if(m.t==='create'){p={id:'local',name:String(m.name||'Operativ'),participates:true,joined:Date.now()};postMessage({t:'welcome',id:p.id,host:p.id,room:'LOCAL'});postMessage({t:'lobby',room:'LOCAL',host:p.id,config,players:[p]});}
if(m.t==='start'){w=new World(config,[p],[0,0],1,145);w.preparePractice('local');postMessage({t:'map',map:w.map,config,room:'LOCAL'});postMessage(w.snapshotFor('local'));}
if(m.t==='input'&&w)w.setInput('local',m.input);
if(m.t==='command'&&w)w.command('local',m);
if(m.t==='pause'&&w){if(w.paused)w.endsAt+=Date.now()-w.pauseStarted;else w.pauseStarted=Date.now();w.paused=!w.paused;}
};setInterval(()=>{if(w){w.step(1/30);if(w.phase==='round_end')w.phase='match_end';if(++sendCount%2===0)postMessage(w.snapshotFor('local'));}},1000/30);`;
fs.writeFileSync("public/practice-worker.js", sim + worker);
if (process.argv.includes("--site")) {
  const out = "dist";
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out);
  for (const f of ["index.html", "styles.css", "client", "shared", "public"])
    fs.cpSync(f, path.join(out, f), { recursive: true });
  fs.writeFileSync(path.join(out, ".nojekyll"), "");
}
console.log("Built local practice worker and deployable static client.");
