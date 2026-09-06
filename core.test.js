import test from 'node:test';
import assert from 'node:assert/strict';
import {WORDS,scoreRecall,recallDetails,recordMathAnswer,nextList,validateRecords,digits} from './core.js';
test('pontuação ignora acentos, caixa e duplicatas, sem aceitar fragmentos',()=>{assert.equal(scoreRecall('LIMAO, limão\nJANELA! cav',WORDS[0]),2);assert.equal(scoreRecall('',WORDS[0]),0);assert.equal(scoreRecall(WORDS[0].join('\n'),WORDS[0]),8);});
test('listas alternam e têm oito palavras únicas',()=>{for(const list of WORDS)assert.equal(new Set(list).size,8);assert.equal(nextList([{version:'1.0',list:7}]),0);assert.equal(nextList([{version:'1.0',list:2}]),3);assert.equal(digits(5,()=>0),'11111');});
const record={id:'test',version:'1.0',date:'2026-09-06T12:00:00Z',list:0,digits:4,immediate:5,delayed:3,delaySeconds:300,context:{sleep:7,stress:'Baixo',notes:''}};
test('backup valida limites, versão, ids e contexto',()=>{assert.equal(validateRecords([record]).length,1);for(const patch of [{delayed:9},{digits:-1},{list:8},{version:'2.0'},{date:'invalid'},{delaySeconds:299},{context:{sleep:90}}])assert.throws(()=>validateRecords([{...record,...patch}]));assert.throws(()=>validateRecords([record,record]));assert.throws(()=>validateRecords({}));});
test('gabarito identifica exatamente a palavra ausente em uma resposta de 7/8',()=>{
 const words=WORDS[0];
 const answer=words.slice(0,7).join('\n')+'\nLIMAO';
 assert.deepEqual(recallDetails(answer,words),{remembered:words.slice(0,7),missing:['nuvem']});
 assert.deepEqual(recallDetails('',words).missing,words);
 assert.deepEqual(recallDetails(words.join(' '),words).missing,[]);
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
