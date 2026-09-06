import test from 'node:test';
import assert from 'node:assert/strict';
import {VERSION,WEEK_MS,WORDS,WORDS_V2,wordsFor,canFollowup,canReveal,visualRound,mergeRecords,scoreRecall,recallDetails,recordMathAnswer,nextList,validateRecords,digits} from './core.js';
test('pontuação ignora acentos, caixa e duplicatas, sem aceitar fragmentos',()=>{assert.equal(scoreRecall('LIMAO, limão\nJANELA! cav',WORDS[0]),2);assert.equal(scoreRecall('',WORDS[0]),0);assert.equal(scoreRecall(WORDS[0].join('\n'),WORDS[0]),8);});
test('listas antigas preservadas e rotação nova separada',()=>{for(const list of WORDS)assert.equal(new Set(list).size,8);assert.equal(nextList([{version:VERSION,list:7}]),0);assert.equal(nextList([{version:VERSION,list:2}]),3);assert.equal(digits(5,()=>0),'11111');});
const record={id:'test',version:'1.0',date:'2026-09-06T12:00:00Z',list:0,digits:4,immediate:5,delayed:3,delaySeconds:300,context:{sleep:7,stress:'Baixo',notes:''}};
test('backup valida limites, versão, ids e contexto',()=>{assert.equal(validateRecords([record]).length,1);for(const patch of [{delayed:9},{digits:-1},{list:8},{version:'2.0'},{date:'invalid'},{delaySeconds:299},{context:{sleep:90}}])assert.throws(()=>validateRecords([{...record,...patch}]));assert.throws(()=>validateRecords([record,record]));assert.throws(()=>validateRecords({}));});
test('gabarito identifica exatamente a palavra ausente em uma resposta de 7/8',()=>{
 const words=WORDS[0];
 const answer=words.slice(0,7).join('\n')+'\nLIMAO';
 assert.deepEqual(recallDetails(answer,words),{remembered:words.slice(0,7),missing:['nuvem']});
 assert.deepEqual(recallDetails('',words).missing,words);
 assert.deepEqual(recallDetails(words.join(' '),words).missing,[]);
});
const v2={...record,id:'v2',version:VERSION,immediate:0,delayed:0,encodedAt:'2026-09-06T12:03:00Z',answers:{immediate:'',delayed:''},visual:{attempted:20,correct:18},followup:{status:'pending'}};
const startedAt='2026-09-13T12:03:00Z';
const completed={...v2,followup:{status:'completed',startedAt,elapsedSeconds:WEEK_MS/1000,context:{consulted:false,noted:false,rehearsed:true,notes:''},answer:WORDS_V2[0][0],score:1,completedAt:'2026-09-13T12:04:00Z'}};
test('12 palavras únicas por lista, sem sobreposição entre listas ou protocolo antigo',()=>{
 assert.equal(new Set(WORDS_V2.flat()).size,96);
 for(const list of WORDS_V2){assert.equal(list.length,12);assert.ok(list.every(word=>!WORDS.flat().includes(word)));}
 assert.equal(wordsFor(record).length,8);assert.equal(wordsFor(v2).length,12);
});
test('liberação em sete dias exatos, atrasos permitidos e tentativa única',()=>{
 const due=Date.parse(v2.encodedAt)+WEEK_MS;
 assert.equal(canFollowup(v2,due-1),false);assert.equal(canFollowup(v2,due),true);assert.equal(canFollowup(v2,due+86400000),true);
 assert.equal(canFollowup(completed,due),false);assert.equal(canReveal(v2),false);assert.equal(canReveal(completed),true);
 assert.equal(canReveal(completed,[{...v2,id:'new'}]),false);
});
test('listas pendentes nunca são reutilizadas',()=>{
 const all=WORDS_V2.map((_,list)=>({...v2,id:String(list),list}));assert.equal(nextList(all),null);
 all[3]={...all[3],followup:completed.followup};assert.equal(nextList(all),3);
});
test('cada quadro visual tem exatamente uma diferença',()=>{for(let i=0;i<100;i++){const round=visualRound();assert.equal(round.left.length,9);assert.deepEqual(round.left.flatMap((value,index)=>value!==round.right[index]?[index]:[]),[round.changed]);assert.ok(round.right.every(value=>value>=0&&value<4));}});
test('backup misto valida cronologia e revisão sem perder o protocolo antigo',()=>{
 assert.equal(validateRecords([record,v2]).length,2);assert.equal(validateRecords([completed]).length,1);
 for(const patch of [{encodedAt:'invalid'},{visual:{attempted:1,correct:2}},{followup:{...completed.followup,elapsedSeconds:1}},{followup:{...completed.followup,score:12}},{followup:{...completed.followup,completedAt:startedAt}}])assert.throws(()=>validateRecords([{...v2,...patch}]));
 assert.equal(mergeRecords([v2],[completed])[0].followup.status,'completed');assert.equal(mergeRecords([completed],[v2])[0].followup.status,'completed');
 assert.throws(()=>mergeRecords([v2],[{...completed,list:1,followup:{...completed.followup,answer:WORDS_V2[1][0]}}]));
});
test('contas contam apenas respostas numéricas enviadas e distinguem acertos',()=>{
 const stats={attempted:0,correct:0};
 for(const input of ['', ' ', 'abc', '1e2', '2.5'])assert.equal(recordMathAnswer(stats,input,30),false);
 assert.deepEqual(stats,{attempted:0,correct:0});
 assert.equal(recordMathAnswer(stats,' 30 ',30),true);
 assert.equal(recordMathAnswer(stats,'31',30),true);
 assert.deepEqual(stats,{attempted:2,correct:1});
});
test('backups novos preservam respostas e contas e históricos antigos continuam válidos',()=>{
 const full={...record,immediate:7,delayed:0,answers:{immediate:WORDS[0].slice(0,7).join(' '),delayed:''},math:{attempted:12,correct:10}};
 assert.deepEqual(validateRecords(JSON.parse(JSON.stringify([full]))),[full]);
 assert.equal(validateRecords([record]).length,1);
 for(const math of [null,{attempted:-1,correct:0},{attempted:2,correct:3},{attempted:1.5,correct:1}])assert.throws(()=>validateRecords([{...full,math}]));
 for(const answers of [null,{immediate:'',delayed:''},{immediate:7,delayed:''}])assert.throws(()=>validateRecords([{...full,answers}]));
});
