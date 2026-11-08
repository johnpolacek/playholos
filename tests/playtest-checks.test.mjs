import test from 'node:test';
import assert from 'node:assert/strict';
import { runChecks } from '../scripts/playtest-checks.mjs';

const fails=(log,scores={build:'abc1234'})=>Object.fromEntries(runChecks(log,scores).map(c=>[c.name,c.fails&&c.fails.length]));

test('a clean log passes every check it can run',()=>{
  const f=fails([
    {t:'next',year:7.9,from:7.1,news:true,what:'Warm glow 1 ranged, 14,000 to 28,000 ly'},
    {t:'mind',year:8,q:'What is it?',a:'THE MIND\nWarm glow 1 lies 14,000 to 28,000 light-years out. Dust is likelier, and it could be a mind.\n↑',secs:9},
  ]);
  for(const [k,v] of Object.entries(f))assert.ok(v===0||v===null,`${k} failed`);
});
test('each rule catches its own break',()=>{
  const f=fails([
    {t:'next',year:5,from:6,news:false,what:'Nothing new'},
    {t:'error',year:5,text:'TypeError: x is undefined'},
    {t:'mind',year:6,q:'Where?',a:'I think Warm glow 2 is about 900 light-years away.',secs:41},
    {t:'mind',year:6,q:'Is it?',a:'',secs:3},
    {t:'mind',year:7,q:'What is it?',a:'Warm glow 2 is a mind; we are sure.',secs:5},
  ],{});
  assert.equal(f['build named'],1);
  assert.equal(f['no console errors'],1);
  assert.equal(f['Next goes forward'],1);
  assert.equal(f['Mind answers'],2);
  assert.equal(f['Mind: says I'],1);
  assert.equal(f['Mind: semicolon'],1);
  assert.equal(f['warm glows ranged'],1);
  assert.equal(f['no claimed mind'],1);
});
test('a harness note in an answer is not the Mind’s words',()=>{
  const f=fails([{t:'mind',year:1,q:'Send?',a:'We can send it now. [card: TO Prometheus; LANDS in 11,000 Years]',secs:5}]);
  assert.equal(f['Mind: semicolon'],0);
});
test('a run with no log runs only the checks it can',()=>{
  const r=runChecks([],{build:'abc'});
  assert.deepEqual(r.filter(c=>c.fails).map(c=>c.name),['build named']);
});
test('the regime page lists the same checks the code runs',async()=>{
  const {regime}=await import('../scripts/regime.mjs');
  const {RUN_CHECKS}=await import('../scripts/playtest-checks.mjs');
  assert.deepEqual(regime().checks.map(c=>c.name),RUN_CHECKS.map(c=>c.name));
});
