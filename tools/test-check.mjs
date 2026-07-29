// Быстрый тест логики проверки ответов (те же функции, что в index.html).
const TONE = {"ā":"a","á":"a","ǎ":"a","à":"a","ē":"e","é":"e","ě":"e","è":"e","ī":"i","í":"i","ǐ":"i","ì":"i","ō":"o","ó":"o","ǒ":"o","ò":"o","ū":"u","ú":"u","ǔ":"u","ù":"u","ǖ":"u","ǘ":"u","ǚ":"u","ǜ":"u","ü":"u","ń":"n","ň":"n"};
function norm(s){ s=(s||"").toLowerCase().trim(); let out=""; for(const ch of s){out+=(TONE[ch]!==undefined?TONE[ch]:ch);} out=out.replace(/v/g,"u"); out=out.replace(/[^a-z0-9]/g,""); return out; }
function lev(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let prev=Array.from({length:n+1},(_,i)=>i),cur=new Array(n+1);for(let i=1;i<=m;i++){cur[0]=i;for(let j=1;j<=n;j++){const c=a[i-1]===b[j-1]?0:1;cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+c);}[prev,cur]=[cur,prev];}return prev[n];}
function check(user,accepts){const u=norm(user);if(u.length<2)return false;for(const a of accepts){const na=norm(a);if(!na)continue;if(u===na)return true;if(u.includes(na)||na.includes(u))return true;const d=lev(u,na);const tol=Math.max(1,Math.floor(Math.max(u.length,na.length)*0.22));if(d<=tol)return true;}return false;}

const T = [
  // [ввод пользователя, принимаемые, ожидание]
  ["Nihao, wo jiao Dima", ["hao de","gei ni","ni hao wo jiao dima"], true],   // с запятой и заглавными
  ["wo lai luyou", ["luyou","wo lai luyou"], true],
  ["wo lai lvyou", ["luyou","wo lai luyou"], true],                            // v вместо ü
  ["wo lai lü you", ["luyou"], true],                                           // тон + пробел
  ["liang ge xingqi", ["liang ge xingqi"], true],
  ["liang ge xinqi", ["liang ge xingqi"], true],                               // опечатка
  ["mai dan", ["maidan","mai dan"], true],
  ["completely wrong answer here", ["hao de","gei ni"], false],                 // мимо
  ["", ["hao de"], false],                                                       // пусто
  ["x", ["hao de"], false],                                                       // слишком коротко
  ["Wēi là jiù hǎo", ["wei la jiu hao"], true],                                 // полные тона
];
let pass=0, fail=0;
for(const [u,a,exp] of T){
  const got=check(u,a);
  const ok=got===exp;
  console.log((ok?"✓":"✗ FAIL")+`  check(${JSON.stringify(u)}) -> ${got} (ожид. ${exp})`);
  ok?pass++:fail++;
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
