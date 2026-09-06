import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as core from './core.js';
const source=readFileSync(new URL('./app.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/,'');
function harness(initial=[]){
 let now=Date.parse('2026-09-06T12:00:00Z'),nextId=0;const intervals=new Map(),nodes=new Map(),data=new Map([['memoria-em-dia-v1',JSON.stringify(initial)]]);
 const root={_html:'',get innerHTML(){return this._html;},set innerHTML(value){this._html=value;nodes.clear();}};
 const node=selector=>{if(selector==='#app')return root;if(!nodes.has(selector))nodes.set(selector,{value:'',textContent:'',innerHTML:'',focus(){}});return nodes.get(selector);};
 const document={hidden:false,querySelector:node,querySelectorAll(selector){if(selector!=='[data-cell]')return [];return [...node('#visual').innerHTML.matchAll(/data-cell="(\d+)"/g)].map(match=>{const button=node(`[data-cell="${match[1]}"]`);button.dataset={cell:match[1]};return button;});},addEventListener(){}};
 class Clock extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const context=vm.createContext({...core,canFollowup:(r,time=now)=>core.canFollowup(r,time),document,window:{scrollTo(){},addEventListener(){}},navigator:{},Date:Clock,performance:{now:()=>now},crypto:{randomUUID:()=>`session-${++nextId}`},localStorage:{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)},setInterval:fn=>{const id=++nextId;intervals.set(id,fn);return id;},clearInterval:id=>intervals.delete(id),setTimeout(){},confirm:()=>true,alert:message=>{throw Error(message);},FormData:class{constructor(target){this.values=target.values;}get(key){return this.values[key]??'';}has(key){return Boolean(this.values[key]);}}});
 vm.runInContext(source,context);
 const run=code=>vm.runInContext(code,context);
 async function step(ms=50){now+=ms;for(const fn of [...intervals.values()])fn();for(let i=0;i<8;i++)await Promise.resolve();}
 async function until(predicate,max=15000){for(let i=0;i<max&&!predicate();i++)await step();assert.ok(predicate(),'Expected app state was not reached');}
 const submit=(selector,values={})=>node(selector).onsubmit({preventDefault(){},target:{values}});
 return {node,root,run,step,until,submit,data,setTime:value=>{now=value;},saved:()=>JSON.parse(data.get('memoria-em-dia-v1'))};
}
test('sessão completa, recarga, bloqueio do gabarito e revisão de sete dias',async()=>{
 const h=harness();h.run('setup()');h.submit('#setup',{sleep:7,stress:'Baixo',notes:''});
 await h.until(()=>h.root.innerHTML.includes('id="recall"'));
 const words=h.run('wordsFor(session).join(" ")');h.node('#recall').value=words;
 await h.until(()=>h.root.innerHTML.includes('id="visual"'));
 assert.equal(h.run('session.immediate'),12);
 const changed=()=>{const html=h.node('#visual').innerHTML;const left=[...html.matchAll(/<span[^>]*>(.*?)<\/span>/g)].map(m=>m[1]);const right=[...html.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map(m=>m[1]);return left.findIndex((symbol,i)=>symbol!==right[i]);};
 h.node(`[data-cell="${changed()}"]`).onclick();
 h.node(`[data-cell="${(changed()+1)%9}"]`).onclick();
 assert.equal(h.run('session.visual.attempted'),2);assert.equal(h.run('session.visual.correct'),1);
 await h.until(()=>h.root.innerHTML.includes('id="recall"'));
 h.node('#recall').value=words.split(' ').slice(0,11).join(' ');
 await h.until(()=>h.root.innerHTML.includes('Sessão concluída'));
 const baseline=h.saved()[0];assert.equal(baseline.delayed,11);assert.equal(baseline.followup.status,'pending');
 assert.deepEqual(baseline.visual,{attempted:2,correct:1});
 assert.ok(!h.root.innerHTML.includes(words.split(' ')[0]));
 const reload=harness([baseline]);reload.run('setup()');assert.ok(!reload.root.innerHTML.includes('id="setup"'));
 reload.run(`prepareFollowup('${baseline.id}')`);assert.ok(!reload.root.innerHTML.includes('id="followup-setup"'));
 reload.setTime(Date.parse(baseline.encodedAt)+core.WEEK_MS+3600000);
 reload.run(`prepareFollowup('${baseline.id}')`);reload.submit('#followup-setup',{rehearsed:true,notes:'teste'});
 assert.equal(reload.saved()[0].followup.status,'started');
 reload.node('#followup-answer').value=words.split(' ').slice(0,7).join(' ');
 await reload.until(()=>reload.root.innerHTML.includes('Revisão concluída'));
 const final=reload.saved()[0];assert.equal(final.followup.score,7);assert.equal(final.followup.elapsedSeconds,core.WEEK_MS/1000+3600);assert.equal(final.followup.context.rehearsed,true);
 assert.ok(reload.root.innerHTML.includes(words.split(' ')[11]));
 assert.equal(core.canFollowup(final,Infinity),false);
});
test('interrupção após início persistido não oferece segunda tentativa',()=>{
 const r={id:'late',version:'2.0',date:'2026-08-01T12:00:00Z',encodedAt:'2026-08-01T12:03:00Z',list:0,digits:0,immediate:0,delayed:0,delaySeconds:300,answers:{immediate:'',delayed:''},visual:{attempted:0,correct:0},context:{sleep:7,stress:'Baixo',notes:''},followup:{status:'started',startedAt:'2026-08-08T12:03:00Z',elapsedSeconds:604800,context:{consulted:false,noted:false,rehearsed:false,notes:''}}};
 const h=harness([r]);assert.equal(h.saved()[0].followup.status,'interrupted');h.run("prepareFollowup('late')");assert.ok(!h.root.innerHTML.includes('id="followup-setup"'));
});
