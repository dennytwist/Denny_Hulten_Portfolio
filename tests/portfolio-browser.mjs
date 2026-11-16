// Run with the portfolio served on 8769 and Chrome remote debugging on 9248.
// PORTFOLIO_URL and CDP_URL can point at another preview/browser.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.PORTFOLIO_URL || 'http://127.0.0.1:8769/';
const cdp=process.env.CDP_URL || 'http://127.0.0.1:9248';
const target=await fetch(`${cdp}/json/new?about:blank`,{method:'PUT'}).then(r=>r.json());
const ws=new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0;const pending=new Map(),errors=[],failures=[];
ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(d.id){const p=pending.get(d.id);pending.delete(d.id);d.error?p?.reject(d.error):p?.resolve(d.result);}if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.text);});
const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>{const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function navigate(hash=''){
 await cmd('Page.navigate',{url:base+hash});
 for(let n=0;n<50;n++){
  await wait(100);
  if(await ev(`location.href===${JSON.stringify(base+hash)} && document.readyState==='complete'`))break;
 }
 await ev('document.fonts.ready.then(()=>true)');
 await wait(1000); // Let the existing entrance animations settle before screenshots.
}
async function check(name,fn){try{await fn();console.log('PASS',name);}catch(e){failures.push(name);console.error('FAIL',name,e.message);}}
async function key(key,modifiers=0){await cmd('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,modifiers});}
await cmd('Page.enable');await cmd('Runtime.enable');await cmd('Network.enable');
await cmd('Network.setCacheDisabled',{cacheDisabled:true});
await cmd('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await check('shared case URL opens the intended case and survives reload',async()=>{
 await navigate('#case/playngo');
 assert.equal(await ev('document.querySelector("#modal").classList.contains("open")'),true);
 assert.match(await ev('document.querySelector("#m-title").textContent'),/Play.n GO/);
 await cmd('Page.reload');await wait(500);
 assert.match(await ev('document.querySelector("#m-title").textContent'),/Play.n GO/);
 await key('Escape');await wait(200);
 assert.equal(await ev('document.querySelector("#modal").classList.contains("open")'),false);
 assert.equal(await ev('document.querySelector("nav").inert'),false);
});
await check('case links support Back, Forward, Close and focus restoration',async()=>{
 await navigate('#work');
 assert.equal(await ev(`!!document.querySelector('a.row[href="#case/playngo"]')`),true);
 await ev(`document.querySelector('a.row[href="#case/playngo"]').focus();document.activeElement.click()`);await wait(200);
 assert.equal(await ev('location.hash'),'#case/playngo');
 await ev('history.back()');await wait(250);
 assert.equal(await ev('document.querySelector("#modal").classList.contains("open")'),false);
 assert.equal(await ev('document.activeElement.getAttribute("href")'),'#case/playngo');
 await ev('history.forward()');await wait(250);
 assert.match(await ev('document.querySelector("#m-title").textContent'),/Play.n GO/);
 await key('ArrowRight');await wait(150);
 assert.match(await ev('document.querySelector("#m-title").textContent'),/Volvo/);
 assert.equal(await ev('location.hash'),'#case/volvo');
 await ev('document.querySelector(".m-btn.close").click()');await wait(250);
 assert.equal(await ev('location.hash'),'#work');
 assert.equal(await ev('document.activeElement.getAttribute("href")'),'#case/playngo');
});
await check('unknown case URLs leave the page usable',async()=>{
 await navigate('#case/not-a-case');
 assert.equal(await ev('document.querySelector("#modal").classList.contains("open")'),false);
 assert.equal(await ev('document.querySelector("nav").inert'),false);
});
await check('every shared case URL keeps its title and accessible keyboard controls',async()=>{
 const expected=[['playngo','Play\'n GO'],['volvo','Volvo Cars'],['p3-guld','P3 Guld'],['level2030','Level 2030'],['gothenburg-dance-festival','Gothenburg Dance Festival'],['health-journey','Health Journey'],['5-degrees','5 Degrees'],['stars','STARS']];
 await navigate();
 for(const [slug,title] of expected){
  await ev(`location.hash=${JSON.stringify('#case/'+slug)}`);await wait(120);
  assert.ok((await ev('document.querySelector("#m-title").textContent')).includes(title));
  assert.equal(await ev('document.querySelector("nav").inert'),true);
  await key('Tab',8);
  assert.equal(await ev('document.activeElement.classList.contains("m-next")'),true);
  await key('Tab');
  assert.equal(await ev('document.activeElement.getAttribute("aria-label")'),'Previous case');
 }
});
await check('CV link serves a PDF',async()=>{
 await navigate();
 const href=await ev('document.querySelector("a[download]").href');
 const response=await fetch(href);
 assert.equal(response.status,200);
 assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0,5).toString(),'%PDF-');
});
await check('intro film moves focus into dialog and restores it on Escape',async()=>{
 await navigate();await ev('document.querySelector(".hero-photo").focus();document.activeElement.click()');await wait(100);
 assert.equal(await ev('document.querySelector("#video-modal").getAttribute("role")'),'dialog');
 assert.equal(await ev('document.activeElement.classList.contains("video-close")'),true);
 assert.ok(await ev('document.querySelector("#video-box iframe").title'));
 assert.equal(await ev('document.querySelector("nav").inert'),true);
 await key('Escape');await wait(100);
 assert.equal(await ev('document.activeElement.classList.contains("hero-photo")'),true);
 assert.equal(await ev('document.querySelector("nav").inert'),false);
});
if(!failures.length){
 const output=new URL('../.impeccable/qa/',import.meta.url);fs.mkdirSync(output,{recursive:true});
 for(const width of [1440,768,390,320]){
  await cmd('Emulation.setDeviceMetricsOverride',{width,height:width===1440?900:844,deviceScaleFactor:1,mobile:width<860});await navigate();
  await check(`layout and media at ${width}px`,async()=>{
   assert.equal(await ev('document.documentElement.scrollWidth'),width);
   for(const selector of ['#top','#work','#approach']){
    await ev(`document.documentElement.style.scrollBehavior='auto';document.querySelector('${selector}').scrollIntoView()`);await wait(200);
    const shot=await cmd('Page.captureScreenshot',{format:'png'});fs.writeFileSync(new URL(`${width}-${selector.slice(1)}.png`,output),Buffer.from(shot.data,'base64'));
   }
   await ev('document.querySelector("a.row").click()');await wait(200);
   assert.equal(await ev('document.querySelector("#modal").scrollWidth'),width);
   for(const [name,selector] of [['case','#m-title'],['evidence','.m-evidence']]){
    await ev(`document.querySelector('${selector}').scrollIntoView({block:'start'})`);await wait(200);
    const shot=await cmd('Page.captureScreenshot',{format:'png'});fs.writeFileSync(new URL(`${width}-${name}.png`,output),Buffer.from(shot.data,'base64'));
   }
   assert.deepEqual(await ev('[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)'),[]);
   console.log('LAYOUT',width,await ev('({workTop:document.querySelector("#work").offsetTop,height:document.documentElement.scrollHeight})'));
  });
 }
}
await check('no page exceptions',async()=>assert.deepEqual(errors,[]));
await cmd('Page.close');ws.close();
if(failures.length){console.error(`${failures.length} failed`);process.exitCode=1;}
