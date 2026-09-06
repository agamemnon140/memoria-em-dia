import test from 'node:test';
import assert from 'node:assert/strict';
import {WORDS,scoreRecall,nextList,validateRecords,digits} from './core.js';
test('pontuação ignora acentos, caixa e duplicatas, sem aceitar fragmentos',()=>{assert.equal(scoreRecall('LIMAO, limão\nJANELA! cav',WORDS[0]),2);assert.equal(scoreRecall('',WORDS[0]),0);assert.equal(scoreRecall(WORDS[0].join('\n'),WORDS[0]),8);});
test('listas alternam e têm oito palavras únicas',()=>{for(const list of WORDS)assert.equal(new Set(list).size,8);assert.equal(nextList([{version:'1.0',list:7}]),0);assert.equal(nextList([{version:'1.0',list:2}]),3);assert.equal(digits(5,()=>0),'11111');});
const record={id:'test',version:'1.0',date:'2026-09-06T12:00:00Z',list:0,digits:4,immediate:5,delayed:3,delaySeconds:300,context:{sleep:7,stress:'Baixo',notes:''}};
test('backup valida limites, versão, ids e contexto',()=>{assert.equal(validateRecords([record]).length,1);for(const patch of [{delayed:9},{digits:-1},{list:8},{version:'2.0'},{date:'invalid'},{delaySeconds:299},{context:{sleep:90}}])assert.throws(()=>validateRecords([{...record,...patch}]));assert.throws(()=>validateRecords([record,record]));assert.throws(()=>validateRecords({}));});
