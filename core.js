export const VERSION = '2.0';
export const WEEK_MS = 7*24*60*60*1000;
export const WORDS = [
 ['janela','cavalo','moeda','camisa','limão','ponte','tambor','nuvem'],
 ['cadeira','coelho','chave','sapato','banana','praça','violão','chuva'],
 ['armário','girafa','anel','casaco','laranja','estrada','flauta','vento'],
 ['cortina','macaco','pente','vestido','morango','castelo','sino','neve'],
 ['tapete','ovelha','garfo','bermuda','abacate','túnel','piano','sol'],
 ['espelho','raposa','balde','chapéu','mamão','igreja','guitarra','lua'],
 ['sofá','zebra','copo','saia','melancia','escola','corneta','raio'],
 ['gaveta','tigre','prato','meia','goiaba','mercado','apito','estrela']
];
export const WORDS_V2 = [
 ['abajur','baleia','tesoura','cachecol','pêssego','farol','violino','montanha','caderno','panela','borboleta','cadeado'],
 ['almofada','golfinho','martelo','gravata','ameixa','museu','trompete','floresta','envelope','frigideira','formiga','bússola'],
 ['estante','tartaruga','alicate','cinto','cereja','teatro','sanfona','deserto','revista','chaleira','abelha','lanterna'],
 ['colchão','pinguim','serrote','luva','jabuticaba','aeroporto','harpa','oceano','cartaz','travessa','besouro','relógio'],
 ['banqueta','camelo','agulha','avental','maracujá','hospital','clarinete','vulcão','jornal','concha','grilo','binóculo'],
 ['prateleira','esquilo','pá','sandália','pitanga','fábrica','pandeiro','cachoeira','calendário','assadeira','libélula','termômetro'],
 ['poltrona','veado','enxada','pijama','abacaxi','biblioteca','bateria','penhasco','mapa','escorredor','joaninha','apontador'],
 ['berço','lontra','parafuso','bota','framboesa','estádio','triângulo','riacho','álbum','bule','mariposa','fechadura']
];
export function wordsFor(record){return (record.version==='1.0'?WORDS:WORDS_V2)[record.list];}
export function isPending(record){return record.version===VERSION && ['pending','started'].includes(record.followup?.status);}
export function canFollowup(record,now=Date.now()){return record.version===VERSION && record.followup?.status==='pending' && now>=Date.parse(record.encodedAt)+WEEK_MS;}
export function canReveal(record,records=[]){return !isPending(record) && !records.some(r=>r.version===record.version && r.list===record.list && isPending(r));}
export function visualRound(random=Math.random){const left=Array.from({length:9},()=>Math.floor(random()*4));const changed=Math.floor(random()*9);const right=[...left];right[changed]=(right[changed]+1+Math.floor(random()*3))%4;return {left,right,changed};}
export const normalize = value => value.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
export function scoreRecall(answer, words) {
 return recallDetails(answer, words).remembered.length;
}
export function recallDetails(answer, words) {
 const tokens = new Set(normalize(answer).split(/[^a-z]+/).filter(Boolean));
 return {remembered:words.filter(w => tokens.has(normalize(w))),missing:words.filter(w => !tokens.has(normalize(w)))};
}
export function recordMathAnswer(stats, answer, expected) {
 if(!/^\d+$/.test(answer.trim())) return false;
 stats.attempted++;
 if(Number(answer)===expected) stats.correct++;
 return true;
}
export function nextList(records) { const current=records.filter(r=>r.version===VERSION);const last=current.at(-1);const start=last?(last.list+1)%WORDS_V2.length:Math.floor(Math.random()*WORDS_V2.length);for(let i=0;i<WORDS_V2.length;i++){const list=(start+i)%WORDS_V2.length;if(!current.some(r=>r.list===list&&isPending(r)))return list;}return null; }
export function digits(length, random=Math.random) { return Array.from({length},()=>Math.floor(random()*9)+1).join(''); }
export function validateRecords(data) {
 if(!Array.isArray(data)||data.length>10000) throw Error('Arquivo de histórico inválido.');
 const ids=new Set();
 for(const r of data) {
  if(!r || typeof r.id!=='string' || r.id.length>100 || ids.has(r.id) || !['1.0',VERSION].includes(r.version) || !Number.isFinite(Date.parse(r.date)) || !Number.isInteger(r.list) || r.list<0 || r.list>=WORDS.length || !['digits','immediate','delayed'].every(k=>Number.isInteger(r[k])&&r[k]>=0&&r[k]<=(k==='digits'?6:r.version==='1.0'?8:12)) || !Number.isFinite(r.delaySeconds)||r.delaySeconds<300||r.delaySeconds>315 || !r.context || !Number.isFinite(r.context.sleep) || r.context.sleep<0 || r.context.sleep>24 || !['Baixo','Médio','Alto'].includes(r.context.stress) || typeof r.context.notes!=='string' || r.context.notes.length>500) throw Error('Arquivo incompatível ou dados inválidos.');
  if(r.answers!==undefined && (!r.answers || !['immediate','delayed'].every(k=>typeof r.answers[k]==='string' && r.answers[k].length<=1000 && scoreRecall(r.answers[k],wordsFor(r))===r[k]))) throw Error('Respostas de palavras inválidas.');
  if(r.math!==undefined && (!r.math || !Number.isSafeInteger(r.math.attempted) || !Number.isSafeInteger(r.math.correct) || r.math.correct<0 || r.math.attempted<r.math.correct)) throw Error('Contagem de contas inválida.');
  if(r.version==='1.0' && r.followup!==undefined)throw Error('Sessões antigas não têm revisão tardia.');
  if(r.version===VERSION){
   const f=r.followup,v=r.visual,encoded=Date.parse(r.encodedAt);
   if(!r.answers||!Number.isFinite(encoded)||encoded<Date.parse(r.date)||!v||!Number.isSafeInteger(v.attempted)||!Number.isSafeInteger(v.correct)||v.correct<0||v.attempted<v.correct||!f||!['pending','started','completed','interrupted'].includes(f.status))throw Error('Protocolo 2.0 incompleto.');
   if(f.status!=='pending'){
    const elapsed=(Date.parse(f.startedAt)-encoded)/1000;
    if(!Number.isFinite(elapsed)||elapsed<WEEK_MS/1000||f.elapsedSeconds!==Math.round(elapsed)||!f.context||!['consulted','noted','rehearsed'].every(k=>typeof f.context[k]==='boolean')||typeof f.context.notes!=='string'||f.context.notes.length>500)throw Error('Revisão tardia inválida.');
   }
   if(f.status==='completed' && (typeof f.answer!=='string'||f.answer.length>1000||f.score!==scoreRecall(f.answer,wordsFor(r))||!Number.isFinite(Date.parse(f.completedAt))||Date.parse(f.completedAt)<Date.parse(f.startedAt)+60000))throw Error('Resultado tardio inválido.');
  }
  ids.add(r.id);
 }
 return data;
}
export function mergeRecords(local,incoming){
 validateRecords(local);validateRecords(incoming);
 const rank={pending:0,started:1,interrupted:2,completed:3};
 const merged=new Map(incoming.map(r=>[r.id,r]));
 for(const r of local){const other=merged.get(r.id);if(other && JSON.stringify({...r,followup:null})!==JSON.stringify({...other,followup:null}))throw Error('Sessões com mesmo ID e dados diferentes.');if(!other || (rank[r.followup?.status]??0)>=(rank[other.followup?.status]??0))merged.set(r.id,r);}
 return validateRecords([...merged.values()].map(r=>r.followup?.status==='started'?{...r,followup:{...r.followup,status:'interrupted'}}:r).sort((a,b)=>Date.parse(a.date)-Date.parse(b.date)));
}
