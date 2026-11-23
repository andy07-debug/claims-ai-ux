/* ======================= helpers ======================= */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const msgs=$('#msgs'), scroller=$('#msgscroll'), cursor=$('#cursor');
const P=new URLSearchParams(location.search);
/* fit like Chrome at 90%: on a laptop screen the whole page is scaled down a little (the same as Cmd -), never up */
let Z=1; function fitZoom(){ const q=parseFloat(P.get('zoom')); Z=q>0?q:Math.min(1,Math.max(.75,innerWidth/1680)); document.documentElement.style.zoom=Z; document.documentElement.style.setProperty('--z',Z); }
fitZoom(); addEventListener('resize',fitZoom);
if(P.has('clean')) document.body.classList.add('clean');
const ico=(id,cls)=>`<svg class="${cls||''}"><use href="#${id}"/></svg>`;
const icoS=(id,px,color)=>`<svg style="width:${px}px;height:${px}px;${color?'color:'+color:''}"><use href="#${id}"/></svg>`;
const tick=`<span class="chk">${ico('i-check')}</span>`;
let ANIM=false, TOKEN=0;
const realSleep=ms=>new Promise(r=>setTimeout(r,ms));
const sleep=ms=>ANIM?realSleep(ms):Promise.resolve();
function guard(t){if(t!==TOKEN) throw 'stale';}
const TPL={bot:$('#tpl [data-tpl=bot]'),user:$('#tpl [data-tpl=user]'),work:$('#tpl [data-tpl=work]')};
let seq=40;
function stamp(el,t){ const ts=[...el.querySelectorAll('div')].reverse().find(d=>/\d+:\d+\s?(AM|PM)/.test(d.textContent)&&d.children.length<=1); if(ts) ts.innerHTML=`${t} <span class="text-[8px]">(${seq++})</span>`; }
function addEl(el){ document.body.classList.remove('chat-min'); if(ANIM) el.classList.add('rise'); msgs.appendChild(el); return el; }
function bot(html,t){ const el=TPL.bot.cloneNode(true); el.removeAttribute('data-tpl'); el.querySelector('span.w-full.bg-transparent').innerHTML=`<div class="cxm">${html}</div>`; stamp(el,t||clock()); return addEl(el); }
function user(text,t){ const el=TPL.user.cloneNode(true); el.removeAttribute('data-tpl'); el.querySelector('.user-message').innerHTML=`<p>${String(text).replace(/</g,'&lt;')}</p>`; stamp(el,t||clock()); return addEl(el); }
function raw(html){ const d=document.createElement('div'); d.innerHTML=html.trim(); return addEl(d.firstElementChild); }
const pill=(text,attrs)=>`<div class="answer-example-item" style="display:block;width:100%"><span class="flex flex-col space-y-1"><div class="inline-flex items-center gap-2"><span ${attrs} class="rounded-[8px] inline-flex max-w-[36rem] items-start gap-1.5 px-3 py-1 my-1 shadow-sm transition-colors duration-200 ease-in-out cursor-pointer bg-[#f0f5ff] text-black border border-[#60A5FA] hover:bg-[#f0f5ff] hover:text-black hover:shadow-md hover:scale-[1.02]" data-pill="true" style="min-width:170px"><span class="flex items-center justify-center text-xl transition-colors">+</span><span class="text-sm leading-7"><span style="margin:0;display:inline">${text}</span></span></span></div></span></div>`;
const pills=list=>`<div style="display:flex;flex-direction:column;align-items:flex-start">${list.map(([t,a])=>pill(t,a)).join('')}</div>`;
const opts=list=>list.map(([t,a])=>opt(t,a)).join('');
let lastAim=-1e9;
function scrollChat(el,mode){
  if(!el) return Promise.resolve(); lastAim=performance.now();
  const er=el.getBoundingClientRect(), mr=scroller.getBoundingClientRect();
  const top=scroller.scrollTop+(er.top-mr.top)/Z, h=er.height/Z;
  const target=mode==='top'?Math.max(0,top-24):Math.max(0,top+h-scroller.clientHeight+24);
  return smoothScroll(scroller,target);
}
function smoothScroll(box,target,dur=600){ if(!ANIM){box.scrollTop=target;return Promise.resolve();}
  const from=box.scrollTop, d=target-from, t0=performance.now();
  return new Promise(r=>{const f=now=>{const k=Math.min(1,(now-t0)/dur), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2; box.scrollTop=from+d*e; k<1?requestAnimationFrame(f):r();};requestAnimationFrame(f);}); }
let cx=900, cy=700, AUTOPLAY=false;
async function point(el){ if(!ANIM||!AUTOPLAY||P.has('nocursor')||!el) return; cursor.classList.add('on');
  const r=el.getBoundingClientRect(), px=(r.left+r.width/2)/Z, py=(r.top+r.height/2)/Z, fx=cx, fy=cy, dur=700, t0=performance.now();
  await new Promise(res=>{const f=now=>{const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3);cx=fx+(px-fx)*e;cy=fy+(py-fy)*e;cursor.style.transform=`translate(${cx-4}px,${cy-2}px)`;k<1?requestAnimationFrame(f):res();};requestAnimationFrame(f);});
  await sleep(220); }
function hideCursor(){cursor.classList.remove('on');}
function expand(el,dur=560){ if(!ANIM||!el) return; el.style.overflow='hidden'; el.style.maxHeight='0px'; el.style.transition=`max-height ${dur}ms cubic-bezier(.2,.7,.2,1)`; void el.offsetHeight; el.style.maxHeight=el.scrollHeight+'px'; setTimeout(()=>{el.style.maxHeight='';el.style.overflow='';el.style.transition='';},dur+60); }
let toastTimer; function toast(t){ $('#toast-t').textContent=t; $('#toast').classList.add('on'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('#toast').classList.remove('on'),2600); }

/* ======================= state ======================= */
const S0=()=>({t:0,stars:0,org:'All organisations',recollect:false,ping:false,tab:'OV',updated:false,pop:false});
let st=S0();
function clock(){ st.t++; const base=cur>=7?50:cur>=3?42:39; return `9:${String(Math.min(59,base+st.t)).padStart(2,'0')} AM`; }

/* ======================= screens ======================= */
let screen='home';
function show(name){ screen=name; $$('#screens > .scr').forEach(s=>s.classList.toggle('on',s.id==='scr-'+name)); closeOv();
  if(name==='projects') renderProjects(); updateHint(); }
function greet(){ return bot(`<p class="cxp">Hey 👋,</p><p class="cxp"><b>Welcome to Claims Mode!</b></p><p class="cxp">I can help you review claims, find information faster, and take actions right from this chat.</p><p class="cxp"><b>Suggested Actions:</b></p>${opt('Search an existing claim','id="sg-main" data-act="sugg" data-k="main"')}${opt('Show me claims that are in critical priority','data-act="free" data-q="critical"')}${opt('Where are incidents rising?','data-act="ai-open"')}${opt('Create a new claim','data-act="new-claim"')}${opt('Or, type your answer below','data-act="focus"')}`,'9:38 AM'); }
function renderSugg(){}
function closeOv(){ ['#ov-menu','#ov-modes','#ov-filter','#ov-hamb'].forEach(s=>{const e=$(s); if(e) e.style.display='none';}); $$('.org-list').forEach(x=>x.classList.remove('on')); }
const PROJECTS=[['Workers’ comp · open claims','Claims · 412 claims','Active'],['Transitional duty follow-ups','Claims · 38 claims','In review'],['Auto liability · fleet','Risk · 96 claims','Active'],['Litigation review','Legal · 14 claims','In review'],['General liability · facilities','Risk · 22 claims','Active']];
function renderProjects(){ const q=($('#pj-search').value||'').toLowerCase();
  $('#pj-grid').innerHTML=PROJECTS.filter(p=>!q||p.join(' ').toLowerCase().includes(q)).map(p=>`<div class="pj" data-act="pj-open" data-p="${p[0]}"><b>${p[0]}</b><small>${p[1]}</small><div class="pjm"><span class="pc ${p[2]==='In review'?'blue':'ok'}">${p[2]}</span><span class="pc grey">Sample</span></div></div>`).join('')||'<p style="color:#6B7280;font-size:14px">No projects match.</p>'; }
function modal(html,wide){ $('#modal').className='modal'+(wide?' cert':''); $('#modal').innerHTML=html; $('#modal-bg').classList.add('on'); }
function closeModal(){ $('#modal-bg').classList.remove('on'); }
function chatClaim(r){ return `<div class="lm-ci"><div class="lm-cih"><b>${r.n}. ${r.name}</b><span class="lm-up">${ico('i-chev')}</span></div>
   <div class="lm-kv"><span>Claim Number:</span> ${r.no}</div><div class="lm-kv"><span>Incident Type:</span> ${r.type}</div><div class="lm-kv"><span>Incident Date:</span> ${r.date.toUpperCase()}</div><div class="lm-kv"><span>Claim Analyst:</span> ${r.analyst}</div>
   <p class="lm-cis">${r.sum.split('.')[0]}.</p>
   <div class="lm-cif"><span class="lm-cw" data-act="cm-goto" data-n="${r.n}">Why this claim is the ${ord(r.n)} Match <span class="lm-pct hi">${HAND}${r.score}%</span></span><span class="lm-open" data-act="cm-goto" data-n="${r.n}">Open ${ico('i-ext')}</span></div></div>`; }

/* ======================= main storyline ======================= */
const STEPS=[
 {id:'home',label:'Claims Mode home',run:async t=>{ show('home'); if(!msgs.children.length) greet(); }},
 {id:'ask',label:'Question typed',run:async t=>{
    const box=$('#cin'); const typed=box.value.trim(); const q=(typed&&/john/i.test(typed))?typed:QUESTION;
    if(ANIM && !typed){ await point(box); hideCursor(); box.focus();
      for(let i=1;i<=QUESTION.length;i++){guard(t); box.value=QUESTION.slice(0,i); await sleep(34+(QUESTION[i-1]===' '?24:0));}
      await sleep(300); await point($('#send')); await sleep(120); guard(t); }
    if(ANIM) pulseSend(); box.value=''; box.blur(); hideCursor();
    const u=user(q,'9:41 AM'); await scrollChat(u);
 }},
 {id:'working',label:'Searching every claim',run:async t=>{ await analyzing(t,'Claim Search',[
      ['Read every claim you can access · <b>4,352 claims</b>'],['Matched the claimant name · <b>49 claims for “John”</b>'],['Read the notes, documents and follow-up dates · <b>1,284 records</b>'],['Ranked by relevance · <b>top 10</b>'],['Checked each claim for gaps · <b>1 gap</b>']],'6'); }},
 {id:'results',label:'Ranked claims',run:async t=>{
    show('search'); renderSearch();
    const a=bot(`<p>I found <b>49</b> claims.</p><p style="margin-top:6px">Here are the <b>top 10 claims</b> as per your request for “Claims of John.”</p>
      <div class="lm-coll" data-act="lm-coll">Claims of John${ico('i-chev')}</div><div id="lm-ci">${CL.slice(0,3).map(chatClaim).join('')}<p style="font-size:14px;color:#6B7280;margin:4px 0 0">7 more are in the results on the right.</p></div>`,'9:41 AM');
    const b=bot(`<p><b>1 claim needs attention:</b> John Whitaker’s 90-day transitional-duty follow-up is overdue.</p>${opt('Show me the gap','id="show-gap" data-act="show-gap"')}
      <p style="margin-top:10px">If you would like to explore more such claims, you can load additional results below:</p>${opt('Show more of such claims','data-act="free" data-q="more"')}
      <p class="lm-lbl">Or you can search for:</p>${opt('Show me claims for John Maddox','data-act="cm-goto" data-n="1"')}${opt('Show me claims for John Reyes','data-act="cm-goto" data-n="3"')}
      <p class="lm-lbl">None of the above, just:</p>${opt('Please enter your request so that I can refine and filter the claim list accordingly','data-act="focus"')}`,'9:41 AM');
    await scrollChat(a,'top');
 }},
 {id:'reasoning',label:'Why it ranked first',run:async t=>{
    const w=$('#why-1'); if(ANIM){await point(w); await sleep(120); guard(t);} hideCursor();
    const lis=[...$('#cw-1').querySelectorAll('.cm-box ol li')]; if(ANIM) lis.forEach(l=>l.classList.add('wait'));
    openWhy(1,true); await scrollList($('#cw-1'),'bottom');
    if(ANIM){ for(const l of lis){ await sleep(380); guard(t); l.classList.remove('wait'); } }
 }},
 {id:'evidence',label:'The evidence',run:async t=>{
    const g=$('#tag-1-ev'); if(ANIM&&g){await point(g); await sleep(120); guard(t);} hideCursor();
    openEv(1,'ev',true); await sleep(ANIM?150:0); await scrollList($('#ev-1'),'bottom');
 }},
 {id:'gap',label:'Names the gap',run:async t=>{
    const g=$('#show-gap'); if(ANIM&&g){await point(g); await sleep(120); guard(t);} hideCursor();
    openEv(1,'ev',false); openWhy(1,false); show('search');
    const c=$('#cc-'+GAPN); await scrollList(c); c.classList.add('flash'); setTimeout(()=>c.classList.remove('flash'),1600); await sleep(ANIM?300:0); openWhy(GAPN,true); await scrollList($('#gapbox-'+GAPN),'bottom');
    const n=bot(`<div class="lm-gapbox"><div class="h">${ico('i-alert')}Gaps in decision · 4th match</div><p><b>WC-2025-009214 · John Whitaker</b>: the 90-day transitional-duty follow-up was due <b>November 17</b> and has no note and no owner. The last work-status report is from October 27.</p></div>
      <p style="margin-top:10px">Suggested next steps:</p>${opt('See today’s follow-ups on the dashboard','id="go-dash" data-act="go-dash"')}${opt('Open John Whitaker’s claim','data-act="cm-view" data-n="4"')}`,'9:43 AM');
    await scrollChat(n,'top');
 }},
 {id:'dashboard',label:'Dashboard',run:async t=>{
    const g=$('#go-dash'); if(ANIM&&g){await point(g); await sleep(120); guard(t);} hideCursor();
    openWhy(GAPN,false); show('dash'); renderDash(); $('#ds-scroll').scrollTop=0;
    raw(`<div class="divider">Opened the dashboard</div>`);
    const m=bot(`<p>Here is every open claim: <b>586 open</b>, <b>118 critical</b>, and <b>6 follow-ups due today</b>.</p><p style="margin-top:6px">John Whitaker’s claim is at the top: its transitional-duty follow-up is <b>4 days overdue</b>.</p>`,'9:44 AM');
    await scrollChat(m);
    if(ANIM){ await sleep(500); guard(t); await smoothScroll($('#ds-scroll'),$('#ds-scroll').scrollHeight,1100); }
    else $('#ds-scroll').scrollTop=$('#ds-scroll').scrollHeight;
 }},
 {id:'claim',label:'Claim opens',run:async t=>{
    const v=$('#dview-4'); if(ANIM&&v){await point(v); await sleep(120); guard(t);} hideCursor();
    show('claim'); setTab('OV'); st.pop=false; renderAlerts(); $('#cl-scroll').scrollTop=0;
    if(ANIM){ await sleep(700); guard(t); } st.pop=true; renderAlerts();
    raw(`<div class="divider">Opened WC-2025-009214</div>`);
    const m=bot(`<p><b>John Whitaker</b> · workers’ comp, right shoulder, on transitional duty since August.</p><p style="margin-top:6px">The 90-day transitional-duty follow-up is <b>overdue</b>. I can complete it: set the 120-day follow-up to today, schedule the next one, add a note and assign the owner.</p>
      <div class="nchips"><span class="nchip go" data-act="upd-date">${ico('i-check')}Update the follow-up</span></div>`,'9:45 AM');
    await scrollChat(m);
 }},
 {id:'updated',label:'Follow-up updated',run:async t=>{
    const b=$('#upd-date'); if(ANIM&&b){await point(b); await sleep(150); guard(t);} hideCursor();
    st.updated=true; st.pop=false; renderAlerts(); if(ANIM) toast('Follow-up updated · note added · owner Marcus Bell');
    const m=bot(`<div class="allok"><div class="gh">${icoS('i-check',18)}Follow-up completed</div><p>120-day follow-up set to <b>Nov 21, 2026</b>; next follow-up <b>Dec 21, 2026</b>. I added a note to the claim and assigned it to <b>Marcus Bell</b>.</p></div>
      <div class="nchips"><span class="nchip" id="see-note" data-act="see-note">See the note</span><span class="nchip" data-act="go-dash">Back to the dashboard</span></div>
      <p style="margin-top:10px">Want to see where claims are rising across every location?</p>${opt(IQ,'id="ask-intel" data-act="ai-open"')}`,'9:46 AM');
    await scrollChat(m);
 }},
 {id:'intel',label:'Where incidents are rising',run:async t=>{
    const c=$('#ask-intel'); if(ANIM&&c){await point(c); await sleep(120); guard(t);} hideCursor();
    const u=user(IQ,'9:47 AM'); await scrollChat(u);
    await analyzing(t,'Portfolio Insights',[['Read every claim in the last 7 days · <b>412 claims</b>'],['Compared 19 locations week over week'],['Looked for repeated incidents and claimant patterns · <b>4 risks</b>']],'4','9:47 AM');
    guard(t); ist.drawer=null; show('intel'); renderIntel(); const sc=$('#ai-scroll'); sc.scrollTop=0;
    raw(`<div class="divider">Opened Claims Anomaly Intelligence</div>`);
    const m=bot(`<p>Claims are rising at <b>5 locations</b> this week. <b>Yard 4 · Newark</b> is up the most: <b>9 slip-and-fall claims</b> in two weeks, 3× its usual rate.</p><p style="margin-top:6px">I flagged <b>4 risks</b>. Each one links to the claims and the location behind it.</p>`,'9:47 AM');
    await scrollChat(m);
    const risk=$('#ai-risk'), to=()=>Math.max(0,risk.offsetTop-sc.offsetTop-18);
    if(ANIM){ await sleep(1200); guard(t); await smoothScroll(sc,to(),1600); } else sc.scrollTop=to();
 }},
 {id:'insight',label:'The claims behind it',run:async t=>{
    const g=$('#ins-go-1'); if(ANIM&&g){await point(g); await sleep(120); guard(t);} hideCursor();
    $('#ins-1').classList.add('hl'); openDrawer(INS[0]);
    const m=bot(`<p>Here are the <b>9 claims</b> behind it: all slips, 7 near the wash bay, since <b>Nov 8</b>.</p><p style="margin-top:6px">A safety review now can stop the next one.</p>`,'9:48 AM');
    await scrollChat(m);
 }},
 {id:'acted',label:'Act before losses grow',run:async t=>{
    const b=$('#ai-act'); if(ANIM&&b){await point(b); await sleep(150); guard(t);} hideCursor();
    ist.done[1]=true; renderDrawer(); const it=$('#ins-go-1'); if(it){ it.innerHTML=ic('ok',14)+'Action taken'; it.parentElement.classList.add('done'); }
    if(ANIM) toast(INS[0].done);
    const m=bot(`<div class="allok"><div class="gh">${icoS('i-check',18)}Safety review assigned</div><p>The Yard 4 supervisor owns it, due <b>Nov 28</b>. I’ll flag it if another slip claim comes in.</p></div>`,'9:48 AM');
    await scrollChat(m);
 }},
];

async function analyzing(t,type,steps,secs,tm){
  const el=bot(`<div class="lm-qt">Question Type: <span class="ty">${type}</span> — <span class="stt">${ANIM?'Analyzing...':'Done in '+secs+' s'}</span></div><div class="lm-gen" data-act="lm-gen">Generating your summary ${ico('i-chev')}</div><div class="lm-steps">${steps.map((s,i)=>`<div class="lm-st"><span class="d ${ANIM?(i===0?'pend':''):'done'}"></span><span>${s[0]}</span></div>`).join('')}</div>`,tm);
  await scrollChat(el);
  if(ANIM){ const ds=[...el.querySelectorAll('.lm-st .d')]; for(let i=0;i<ds.length;i++){ ds[i].className='d pend'; await sleep(800); guard(t); ds[i].className='d done'; } el.querySelector('.stt').textContent='Done in '+secs+' s'; }
}
async function work(t,steps,secs){
  const el=TPL.work.cloneNode(true); el.removeAttribute('data-tpl');
  const title=el.querySelector('.gpt-color'); title.innerHTML=ANIM?'Working…':`What I did for ${secs} seconds`;
  title.insertAdjacentHTML('afterend','<span class="cd-tag">Cognitive Decisioning</span>');
  const panel=el.querySelector('.max-h-0'); panel.classList.remove('max-h-0','opacity-0'); panel.style.maxHeight='none'; panel.style.opacity='1';
  panel.querySelector('.no-scrollbar').innerHTML=`<div class="wd-steps">${steps.map((s,i)=>`<div class="wd-st" data-act="wstep"><span class="dot ${ANIM?(i===0?'pend':''):'done'}">${ANIM?'':ico('i-check')}</span><div class="tx">${s[0]}<span class="tm">(${s[2]} secs)</span><div class="det">${s[1]}</div></div></div>`).join('')}</div>`;
  const tr=panel.querySelector('[data-testid=showTrace]'); if(tr) tr.setAttribute('data-act','trace');
  el.querySelectorAll('p.max-w-full').forEach(p=>p.remove()); stamp(el,clock());
  addEl(el); await scrollChat(el);
  if(ANIM){ const ds=[...el.querySelectorAll('.wd-st .dot')]; for(let i=0;i<ds.length;i++){ ds[i].className='dot pend'; await sleep(850); guard(t); ds[i].className='dot done'; ds[i].innerHTML=ico('i-check'); } title.textContent=`What I did for ${secs} seconds`; }
}

/* ======================= side questions ======================= */
const FREE={
 critical:{q:'Show me claims that are in critical priority',a:()=>`<p><b>118 claims</b> are critical. The three oldest:</p><table class="mini"><tr><th>Claimant</th><th>Type</th><th class="r">Open</th></tr>${[['Gloria Pierce','Workers’ comp','418 days'],['Darnell Hayes','Auto liability','377 days'],['Marisol Vega','General liability','352 days']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="r num">${r[2]}</td></tr>`).join('')}</table>`},
 more:{q:'Show more of such claims',a:()=>`<p>Here are the next 5 of the 10:</p><table class="mini"><tr><th>Claimant</th><th>Type</th><th class="r">Score</th></tr>${[['John Delgado','Workers’ comp','84%'],['John Pryor','Auto liability','80%'],['John Ames','General liability','77%'],['John Feld','Workers’ comp','71%'],['John Lutz','Collision','66%']].map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="r num">${r[2]}</td></tr>`).join('')}</table>`},
 summary:{q:'Summarise this claim',a:()=>`<p><b>John Whitaker</b> · workers’ comp, right shoulder strain from moving a park bench (July 22, 2025). Compensable. On transitional duty since August 12, 2026.</p><ul class="bl"><li>${st.updated?'The 90-day follow-up is done; next follow-up <b>Dec 21, 2026</b>, owner Marcus Bell.':'The 90-day transitional-duty follow-up is <b>4 days overdue</b>, with no note and no owner.'}</li><li>Reserves: $18,400.</li></ul>`},
 newc:{q:'Create a new claim',a:()=>`<p>Creating claims is turned off in this sample demo. In Claims AI it walks you through the claim type, details, notes and documents, and sets the alerts before the claims system syncs.</p>`},
};
let freeBusy=false;
async function freeQA(key,custom){
  if(freeBusy||busy) return; freeBusy=true; const save=ANIM; ANIM=true;
  try{
    const f=FREE[key]||{q:custom,a:()=>`<p>In this demo I answer questions about these sample claims. Try “${QUESTION}”</p>${opts([[QUESTION,'data-act="ask-main"']])}`};
    const u=user(custom||f.q); await scrollChat(u);
    const ty=raw(`<div class="group/user-msg flex flex-col items-start gap-1 mb-2"><div class="w-full flex flex-row justify-start items-start gap-3"><div style="max-height:32px;max-width:32px"><img alt="" src="assets/askmod-icon.svg" style="width:32px"></div><span class="typing"><i></i><i></i><i></i></span></div></div>`); await scrollChat(ty); await realSleep(850); ty.remove();
    const a=bot(f.a()); await scrollChat(a);
  } finally { ANIM=save; freeBusy=false; updateHint(); }
}

/* ======================= step engine ======================= */
let cur=-1, busy=false, playing=false, advancing=false;
const idx=id=>STEPS.findIndex(s=>s.id===id);
function label(){ $('#lbl').textContent=`${cur+1} / ${STEPS.length} · ${STEPS[cur].label}`; history.replaceState(null,'',location.pathname+location.search+'#'+STEPS[cur].id); updateHint(); }
function reset(){
  st=S0(); msgs.innerHTML=''; scroller.scrollTop=0; hideCursor(); closeModal(); closeOv(); $('#toast').classList.remove('on');
  renderSearch(); renderDash(); $('#donut').innerHTML=donut(); Object.assign(ist,{range:'7d',plot:'count',drawer:null,done:{},plotOpen:false}); renderIntel(); setTab('OV'); notesReset(); renderAlerts(); renderNotes();
  $('#cin').value=''; document.body.classList.remove('chat-min','wide'); paintStars();
}
async function goTo(i){ const t=++TOKEN; ANIM=false; busy=false; advancing=false; freeBusy=false; document.body.classList.add('instant'); reset();
  for(let j=0;j<=i;j++) await STEPS[j].run(t);
  document.body.classList.remove('instant'); cur=i; label(); }
async function next(){ if(busy||freeBusy||cur>=STEPS.length-1) return false; busy=true; updateHint(); const t=++TOKEN; ANIM=true;
  try{ await STEPS[cur+1].run(t); cur++; label(); }catch(e){ if(e!=='stale') console.error(e); }
  busy=false; updateHint(); return true; }
async function advanceTo(id){ if(advancing) return; advancing=true; try{ const target=idx(id); while(cur<target){ const before=cur; busy=false; await next(); if(cur===before) break; if(cur<target) await realSleep(450); } } finally { advancing=false; updateHint(); } }
async function play(){ if(playing) return; playing=true; AUTOPLAY=true; $('#b-play').textContent='Playing…'; updateHint();
  if(cur>=STEPS.length-1) await goTo(0);
  while(playing&&cur<STEPS.length-1){ await next(); await realSleep(1400); }
  playing=false; AUTOPLAY=false; hideCursor(); $('#b-play').textContent='Play'; updateHint(); }
const HINTS={0:'#sg-main',3:'#why-1',4:'#tag-1-ev',5:'#show-gap',6:'#go-dash',7:'#dview-4',8:'#upd-date',9:'#ask-intel',10:'#ins-go-1',11:'#ai-act'};
function updateHint(){ $$('.hint').forEach(e=>e.classList.remove('hint')); if(busy||playing||advancing) return; const sel=HINTS[cur]; const el=sel&&$(sel); if(el&&el.offsetParent) el.classList.add('hint'); }

/* ======================= header bits ======================= */
const starSvgs=()=>[...document.querySelectorAll('#feedback svg')].filter(s=>!s.closest('[class*="flame"]')).slice(0,5);
function paintStars(){ starSvgs().forEach((s,i)=>s.classList.toggle('star-on',i<st.stars)); }
starSvgs().forEach((s,i)=>{ s.style.cursor='pointer'; s.addEventListener('click',e=>{ e.stopPropagation(); st.stars=i+1; paintStars(); toast(`Thanks for rating Claims AI ${i+1} of 5`); }); });
function placeModes(){ const p=$('#ov-modes'), r=$('#mode-dd').getBoundingClientRect(); p.style.top=(r.bottom/Z+6)+'px'; p.style.left=Math.max(12,r.left/Z-20)+'px'; p.style.position='fixed'; }
function filterModes(q){ q=(q||'').toLowerCase(); $$('#ov-modes li').forEach(li=>li.style.display=!q||li.textContent.toLowerCase().includes(q)?'':'none'); }

/* ======================= one click handler ======================= */
document.addEventListener('click',async e=>{
  const el=e.target.closest('[data-act]');
  if(!e.target.closest('#ov-menu,#menu-btn,#ov-modes,#mode-dd')){ ['#ov-menu','#ov-modes'].forEach(s=>$(s).style.display='none'); }
  if(!e.target.closest('.org-list,#org-dd')) $$('.org-list').forEach(x=>x.classList.remove('on'));
  if(!el) return;
  const a=el.dataset.act;
  if(playing&&a!=='restart'&&a!=='logo') return;
  if((busy||advancing)&&!['dd-modes','menu','close-ov','close-modal','acc','cl-tab','note-x','wstep','fullscreen'].includes(a)) return;
  switch(a){
    case 'cm-why': { const n=+el.dataset.n; if(cur===3&&n===1) await advanceTo('reasoning'); else openWhy(n); break; }
    case 'cm-ev': { const n=+el.dataset.n, k=el.dataset.k; if(cur===4&&n===1&&k==='ev') await advanceTo('evidence'); else openEv(n,k); break; }
    case 'cm-ev-x': openEv(+el.dataset.n,null,false); break;
    case 'cm-more': toast('Full AI summary · sample claim'); break;
    case 'cm-qa': toast('Quick actions: add a note, set a follow-up, assign an owner'); break;
    case 'cm-goto': { const n=+el.dataset.n; show('search'); const c=$('#cc-'+n); await scrollList(c); c.classList.add('flash'); setTimeout(()=>c.classList.remove('flash'),1500); break; }
    case 'cm-view': { const n=+el.dataset.n; if(n===GAPN){ if(cur===7) await advanceTo('claim'); else { show('claim'); setTab('OV'); renderAlerts(); } } else { const r=CL.find(x=>x.n===n)||DASH.find(x=>x.n===n); toast(`${r.name} · ${r.no} · sample claim`); } break; }
    case 'cm-filter': toast('Filters: 0 applied'); break;
    case 'cm-sort': toast('Sorted by relevance, highest first'); break;
    case 'cm-edit': toast('Editing is turned off in this sample demo'); break;
    case 'show-gap': if(cur===5) await advanceTo('gap'); else { show('search'); const c=$('#cc-'+GAPN); await scrollList(c); openWhy(GAPN,true); } break;
    case 'go-dash': if(cur===6) await advanceTo('dashboard'); else { show('dash'); renderDash(); } break;
    case 'go-home': closeOv(); show(cur>=7?'dash':'home'); break;
    case 'home': closeOv(); closeModal(); document.body.classList.remove('chat-min','wide'); show('home'); break;
    case 'feat': { const f=el.dataset.f;
      if(f==='search'){ if(cur===0) await advanceTo('results'); else show('search'); }
      else if(f==='today'||f==='dash'){ if(cur===6) await advanceTo('dashboard'); else { show('dash'); renderDash(); } }
      else if(f==='synced') toast('1 new claim synced from the claims system today (sample)');
      else freeQA('newc');
      break; }
    case 'new-claim': freeQA('newc'); break;
    case 'bell': toast('6 follow-ups are due today'); break;
    case 'cl-tab': setTab(el.dataset.v); break;
    case 'cl-back': show(cur>=7?'dash':'search'); break;
    case 'acc': el.parentElement.classList.toggle('open'); break;
    case 'upd-date': if(cur===8) await advanceTo('updated'); else if(cur>8) toast('Already updated'); break;
    case 'pop-custom': toast('Pick a custom date (demo)'); break;
    case 'see-note': show('claim'); setTab('NOTES'); noteToggle('ai',true); break;
    case 'note-x': noteToggle(el.dataset.k); break;
    case 'ds-search': { const v=($('#ds-q').value||'').trim(); toast(v?`Searching for “${v}” (sample)`:'Enter a claimant name'); break; }
    case 'lm-coll': { const l=$('#lm-ci'); if(l){ const hid=l.style.display==='none'; l.style.display=hid?'':'none'; el.querySelector('svg').style.transform=hid?'rotate(180deg)':'rotate(0deg)'; } break; }
    case 'lm-gen': { const p=el.nextElementSibling; if(p) p.style.display=p.style.display==='none'?'':'none'; break; }
    case 'focus': $('#cin').focus(); break;
    case 'ingest': toast('Claims synced from the claims system · up to date'); break;
    case 'logo': playing=false; AUTOPLAY=false; closeOv(); closeModal(); await goTo(0); break;
    case 'restart': playing=false; AUTOPLAY=false; closeOv(); closeModal(); await goTo(0); toast('Demo restarted'); break;
    case 'send': { const v=$('#cin').value.trim(); if(v) pulseSend();
      if(cur===0&&(!v||/john|claim/i.test(v))){ await advanceTo('results'); }
      else if(v){ $('#cin').value=''; const key=/summar/i.test(v)?'summary':/critical/i.test(v)?'critical':/new claim|create/i.test(v)?'newc':null; freeQA(key,v); }
      else $('#cin').focus();
      break; }
    case 'free': freeQA(el.dataset.q); break;
    case 'sugg': { const k=el.dataset.k; if(k==='main'){ if(cur===0) await advanceTo('results'); else freeQA(null,QUESTION); } else freeQA(k); break; }
    case 'ask-main': if(cur===0) advanceTo('results'); else freeQA('more'); break;
    case 'wstep': el.classList.toggle('open'); break;
    case 'trace': toast('Trace: 5 steps · 4,352 claims · 1,284 records'); break;
    case 'dl': toast('Downloads are turned off in this demo'); break;
    case 'close-modal': closeModal(); updateHint(); break;

    /* --- the real AppMod.AI shell controls --- */
    case 'projects': show('projects'); break;
    case 'pj-open': toast('Opened project · '+el.dataset.p+' (sample)'); break;
    case 'pj-new': toast('New projects are turned off in this demo'); break;
    case 'filter': { closeOv(); $('#ov-filter').style.display='flex'; break; }
    case 'org-dd': { const host=el.parentElement; host.style.position='relative'; let l=host.querySelector('.org-list'); if(!l){ l=document.createElement('div'); l.className='org-list'; host.appendChild(l); } l.innerHTML=['All organisations','Risk management','Claims','Fleet','Parks'].map(o=>`<div data-act="org" data-o="${o}" class="${o===st.org?'sel':''}">${o===st.org?'✓ ':''}${o}</div>`).join(''); l.classList.toggle('on'); break; }
    case 'org': { e.stopPropagation(); st.org=el.dataset.o; const lab=$('#org-dd .p-multiselect-label'); if(lab){ lab.textContent=st.org; lab.classList.remove('p-placeholder'); } el.parentElement.classList.remove('on'); break; }
    case 'filter-apply': $('#ov-filter').style.display='none'; toast(`Filter applied · ${st.org}`); break;
    case 'close-ov': closeOv(); break;
    case 'newchat': { closeOv(); raw(`<div class="divider">New conversation</div>`); const w=greet(); scrollChat(w); break; }
    case 'chatmin': closeOv(); document.body.classList.add('chat-min'); break;
    case 'chatmax': document.body.classList.remove('chat-min'); updateHint(); break;
    case 'menu': { const m=$('#ov-menu'); m.style.display=m.style.display==='none'?'block':'none'; break; }
    case 'mi': { const m=el.dataset.m; $('#ov-menu').style.display='none';
      if(/Minimize/.test(m)) document.body.classList.add('chat-min');
      else if(/Recollect/.test(m)){ st.recollect=!st.recollect; const s=[...el.querySelectorAll('span')].find(x=>/Recollect/.test(x.textContent)); if(s) s.textContent=`Recollect Harder ${st.recollect?'On':'Off'}`; el.dataset.m=`Recollect Harder ${st.recollect?'On':'Off'}`; toast(`Recollect Harder ${st.recollect?'on':'off'}`); }
      else if(/History/.test(m)) $('#ov-hamb').style.display='flex';
      else if(/Export/.test(m)) toast('Conversation exported to Docs (demo)');
      else if(/Quality/.test(m)) toast('Pre-release quality checklist: 12 of 12 passed (demo)');
      else if(/Log/.test(m)) toast('Log controls are admin-only in this demo');
      else if(/Ping/.test(m)){ st.ping=!st.ping; const sw=el.querySelector('[class*="rounded-full"]'); if(sw) sw.style.background=st.ping?'#5928ED':''; toast(`Ping Pong Asst. ${st.ping?'on':'off'}`); }
      break; }
    case 'hamb': { closeOv(); $('#ov-hamb').style.display='flex'; break; }
    case 'hm-settings': toast('Settings are turned off in this demo'); break;
    case 'hm-sign': toast('Sign out is turned off in this demo'); break;
    case 'dd-modes': { const p=$('#ov-modes'); const open=p.style.display==='none'; closeOv(); if(open){ placeModes(); p.style.display='block'; const i=$('#mode-search'); if(i){ i.value=''; filterModes(''); setTimeout(()=>i.focus(),30);} } break; }
    case 'mode': { const m=el.dataset.mode; $('#ov-modes').style.display='none'; if(m==='Claims Mode'||m==='Claims AI Mode') show(cur>=7?'dash':'home'); else toast(`${m} isn’t part of this demo`); break; }
    case 'usage': toast('Used today: $0.00 of your $30 daily budget'); break;
    case 'attach': toast('Attach a document to a claim · turned off in this demo'); break;
    case 'guide': toast('Guidelines: claims handling policy v3 is attached'); break;
    case 'cart': toast('Context: 4,352 claims · notes, documents and follow-ups'); break;
    case 'add': { const w=bot(`<p>What would you like to do?</p>${opts([['Search an existing claim','data-act="sugg" data-k="main"'],['Show me claims that are in critical priority','data-act="free" data-q="critical"'],['Create a new claim','data-act="new-claim"']])}`); scrollChat(w); break; }
    case 'speaker': { const on=!el.classList.contains('cx-on'); el.classList.toggle('cx-on',on); el.style.color=on?'#5928ED':''; toast(on?'Voice replies on':'Voice replies off'); break; }
    case 'mic': { if(el.classList.contains('cx-rec')) break; el.classList.add('cx-rec'); el.style.color='#5928ED';
      const q=cur===0?QUESTION:'Summarise this claim', cin=$('#cin'); cin.value='';
      for(let i=1;i<=q.length;i++){ cin.value=q.slice(0,i); await realSleep(22); }
      el.classList.remove('cx-rec'); el.style.color=''; cin.focus(); toast('Got it. Press send to ask.'); break; }
    case 'fullscreen': if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); else document.documentElement.requestFullscreen?.().catch(()=>toast('Full screen isn’t available here')); break;
  }
});
$('#ov-filter').addEventListener('click',e=>{ if(e.target.id==='ov-filter') closeOv(); });
$('#ov-hamb').addEventListener('click',e=>{ if(e.target.id==='ov-hamb') closeOv(); });
$('#modal-bg').addEventListener('click',e=>{ if(e.target.id==='modal-bg'){ closeModal(); updateHint(); } });
$('#mode-search')?.addEventListener('input',e=>filterModes(e.target.value));
$('#pj-search').addEventListener('input',renderProjects);
$('#hist-search')?.addEventListener('input',e=>{ const q=e.target.value.toLowerCase(); $$('#ov-hamb .p-sidebar-content button, #ov-hamb .p-sidebar-content [class*="rounded"]').forEach(()=>{}); });
(function sendLoop(){ const v=!!$('#cin').value.trim(); $('#send').classList.toggle('ready',v); requestAnimationFrame(sendLoop); })();
function pulseSend(){ const b=$('#send'); b.classList.remove('sent'); void b.offsetWidth; b.classList.add('sent'); setTimeout(()=>b.classList.remove('sent'),700); }
$('#cin').addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); $('#send').click(); } });
$('#b-next').onclick=()=>{ if(!playing&&!advancing) next(); };
$('#b-prev').onclick=()=>{ playing=false; if(cur>0) goTo(cur-1); };
$('#b-play').onclick=()=>play();
addEventListener('keydown',e=>{ if(e.target.matches('input,textarea,[contenteditable=true]')) return;
  if(e.key==='ArrowRight'){ if(!playing) next(); } else if(e.key==='ArrowLeft'){ playing=false; if(cur>0) goTo(cur-1); } else if(e.key===' '){ e.preventDefault(); play(); } else if(e.key==='Escape'){ closeOv(); closeModal(); } });

const start=Math.max(0,idx(location.hash.slice(1)));
(document.fonts?document.fonts.ready:Promise.resolve()).then(async()=>{ await goTo(start); if(P.has('play')) play(); });
window.__goTo=goTo; window.__steps=STEPS.map(s=>s.id); window.__state=()=>({cur,screen,busy:busy||advancing,freeBusy});