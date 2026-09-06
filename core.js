export const VERSION = '1.0';
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
export function nextList(records) { const last = records.filter(r=>r.version===VERSION).at(-1); return last ? (last.list+1)%WORDS.length : Math.floor(Math.random()*WORDS.length); }
export function digits(length, random=Math.random) { return Array.from({length},()=>Math.floor(random()*9)+1).join(''); }
export function validateRecords(data) {
 if(!Array.isArray(data)||data.length>10000) throw Error('Arquivo de histórico inválido.');
 const ids=new Set();
 for(const r of data) {
  if(!r || typeof r.id!=='string' || r.id.length>100 || ids.has(r.id) || r.version!==VERSION || !Number.isFinite(Date.parse(r.date)) || !Number.isInteger(r.list) || r.list<0 || r.list>=WORDS.length || !['digits','immediate','delayed'].every(k=>Number.isInteger(r[k])&&r[k]>=0&&r[k]<=(k==='digits'?6:8)) || !Number.isFinite(r.delaySeconds)||r.delaySeconds<300||r.delaySeconds>315 || !r.context || !Number.isFinite(r.context.sleep) || r.context.sleep<0 || r.context.sleep>24 || !['Baixo','Médio','Alto'].includes(r.context.stress) || typeof r.context.notes!=='string' || r.context.notes.length>500) throw Error('Arquivo incompatível ou dados inválidos.');
  if(r.answers!==undefined && (!r.answers || !['immediate','delayed'].every(k=>typeof r.answers[k]==='string' && r.answers[k].length<=1000 && scoreRecall(r.answers[k],WORDS[r.list])===r[k]))) throw Error('Respostas de palavras inválidas.');
  if(r.math!==undefined && (!r.math || !Number.isSafeInteger(r.math.attempted) || !Number.isSafeInteger(r.math.correct) || r.math.correct<0 || r.math.attempted<r.math.correct)) throw Error('Contagem de contas inválida.');
  ids.add(r.id);
 }
 return data;
}
