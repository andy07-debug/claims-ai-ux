/* ======================= Claims Mode (from the Claims Mode demo; every name, number and place is sample data) ======================= */
const QUESTION='Show me John’s claims';
const ord=n=>n+({1:'st',2:'nd',3:'rd'}[n]||'th');
const HAND='<svg viewBox="0 0 24 24" class="lm-hand"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0v4.5a6 6 0 0 1-6 6h-.6a5 5 0 0 1-4-2L4.6 15a1.5 1.5 0 0 1 2.3-1.9L9 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SPK='<svg viewBox="0 0 24 24" class="lm-spk"><path d="M10 4.5l1.6 5.4 5.4 1.6-5.4 1.6L10 18.5l-1.6-5.4L3 11.5l5.4-1.6zM18 3l.7 2.3L21 6l-2.3.7L18 9l-.7-2.3L15 6l2.3-.7z" fill="currentColor"/></svg>';
const opt=(text,attrs)=>`<div class="lm-opt" ${attrs||''}><span class="lm-arr">${ico('i-arrow')}</span><span>${text}</span></div>`;

/* the claimant the story follows (the gap, the dashboard, the follow-up) */
const GAPN=4;
const CL=[
 {n:1,name:'John Maddox',no:'WC-2026-004812',type:'Workers’ Comp',analyst:'Dana Ruiz',loc:'Central Fleet Garage',date:'14 January, 2026',alert:'Transitional Duty Follow Up',due:'2 December, 2026',score:100,status:'Open',tags:['tpa','sync'],
  sum:'A workers’ comp claim was filed for John Maddox. He strained his lower back lifting a tire at the Central Fleet Garage and returned on transitional duty on February 9. The TPA’s latest note confirms light duty through December 2…',
  why:[['The claimant is',{t:'John Maddox',k:'name'},', matching your search.'],['Latest work status is transitional duty, from the',{t:'Work status report · Nov 18, 2026',k:'ev'},'.'],['The next follow-up is set and owned, confirmed by the',{t:'TPA note · Nov 18, 2026',k:'tpa'},'.']],ds:100},
 {n:2,name:'John Okafor',no:'GL-2025-001907',type:'General Liability',analyst:'Priya Shah',loc:'Eastside Community Center',date:'3 October, 2025',alert:'',due:'',score:100,status:'Closed',tags:['sync'],
  sum:'A general liability claim was filed for John Okafor after a slip on a wet floor at the Eastside Community Center. Medical bills were paid and the claim closed on April 30, 2026…',
  why:[['The claimant is',{t:'John Okafor',k:'name'},', matching your search.'],['Closed on April 30, 2026, with the release on file.']],ds:100},
 {n:3,name:'John Reyes',no:'AL-2026-000388',type:'Auto Liability',analyst:'Marcus Bell',loc:'Northside Depot',date:'27 March, 2026',alert:'Litigation Review',due:'9 December, 2026',score:96,status:'Open',tags:['tpa'],
  sum:'An auto liability claim was filed for John Reyes. A city utility truck backing out of the Northside Depot struck his parked car; liability is accepted and the property damage is being settled…',
  why:[['The claimant is',{t:'John Reyes',k:'name'},', matching your search.'],['The repair estimate and the police report are both on file.']],ds:96},
 {n:4,name:'John Whitaker',no:'WC-2025-009214',type:'Workers’ Comp',analyst:'Marcus Bell',loc:'Parks Maintenance Yard 4',date:'22 July, 2025',alert:'Transitional Duty Follow Up',due:'17 November, 2026',score:92,status:'Pending',tags:['high','sync'],overdue:'Overdue 4D',
  sum:'A workers’ comp claim was filed for John Whitaker. He injured his right shoulder moving a park bench at Maintenance Yard 4 and has been on transitional duty since August. The 90-day follow-up is now overdue…',
  why:[['The claimant is',{t:'John Whitaker',k:'name'},', matching your search.'],['Current work status is transitional duty, last updated in the',{t:'Work status report · Oct 27, 2026',k:'ev2'},'.']],ds:92,
  gap:'<b>The 90-day transitional-duty follow-up was due November 17 and has no note and no owner.</b> No work-status update since October 27; the last analyst note says “full duty next week”, three weeks ago.'},
 {n:5,name:'John Castellano',no:'WC-2024-006630',type:'Workers’ Comp',analyst:'Dana Ruiz',loc:'Sanitation Garage 12',date:'11 June, 2024',alert:'',due:'',score:88,status:'Closed',tags:['sync'],
  sum:'A workers’ comp claim was filed for John Castellano for a knee injury on his route. He returned to full duty on September 2, 2024 and the claim is closed…',
  why:[['The claimant is',{t:'John Castellano',k:'name'},', matching your search.'],['Returned to full duty on September 2, 2024.']],ds:88},
];
const TAG={tpa:['amber','Notes Updated By TPA'],sync:['amber','Synced Claims'],high:['high','High']};
const STC=s=>({Open:'s-open',Closed:'s-closed',Pending:'s-pend'}[s]);
function factor(f,i,r){ return `<li>${f.map(x=>typeof x==='string'?x:`<span class="cm-tag${x.k==='name'?' nm':''}" ${x.k!=='name'?`data-act="cm-ev" data-n="${r.n}" data-k="${x.k}" id="tag-${r.n}-${x.k}"`:''}>${x.t}${x.k==='name'?ico('i-chev'):ico('i-doc')}</span>`).join(' ')}</li>`; }
function cmCard(r,where){ const g=!!r.gap, id=where==='dash'?'dc':'cc';
  return `<div class="cm-card ${g&&where!=='dash'?'warn':''} ${where==='dash'&&r.overdue?'warn':''}" id="${id}-${r.n}">
   <div class="cm-ch"><div><h3>${r.name}</h3><small>Claim no: ${r.no}</small></div><div class="cm-tags">${r.overdue&&where==='dash'?`<span class="cm-pill over">${r.overdue}</span>`:''}${r.tags.map(t=>`<span class="cm-pill ${TAG[t][0]}">${t==='high'?ico('i-alert'):''}${TAG[t][1]}</span>`).join('')}${where!=='dash'?`<span class="cm-pill score">${SPK}${r.score}%</span>`:''}<span class="cm-pill st ${STC(r.status)}">${r.status}</span></div></div>
   <div class="cm-meta"><div><small>Incident Type</small><b>${r.type}</b></div><div><small>Claim Analyst</small><b>${r.analyst}</b></div><div><small>Location</small><b>${r.loc}</b></div><div><small>Incident Date</small><b>${r.date}</b></div><div><small>Alert Type</small><b>${r.alert||''}</b></div><div><small>Follow Up Due Date</small><b class="${r.overdue?'bad':''}">${r.due||''}</b></div></div>
   <div class="cm-ais"><div class="cm-aih">${SPK}AI Summary</div><p>${r.sum}<span class="cm-vm" data-act="cm-more">View More</span> ${HAND}${ico('i-chev')}</p></div>
   ${where==='dash'?'':`<div class="cm-why" id="cw-${r.n}"><div class="cm-wh" id="why-${r.n}" data-act="cm-why" data-n="${r.n}">Why this claim is the ${ord(r.n)} Match ${HAND}<span class="car">${ico('i-chev')}</span></div>
     <div class="cm-wb"><div class="cm-box"><div class="cm-bh"><b>Supporting Factors</b><span class="cm-ds">${SPK}Decision Strength ${r.ds}%</span></div><ol>${r.why.map((f,i)=>factor(f,i,r)).join('')}</ol></div>
       <div class="cm-box ${g?'bad':''}" id="gapbox-${r.n}"><div class="cm-bh"><b>Gaps in Decision</b>${g?`<span class="cm-gtag">${ico('i-alert')}1 gap</span>`:''}</div>${g?`<p class="cm-gap">${r.gap}</p><div class="cm-fix"><span data-act="cm-view" data-n="${r.n}">Open the claim</span><span data-act="go-dash">See today’s follow-ups</span></div>`:'<ol><li>No gaps found!</li></ol>'}</div></div></div>
   <div class="cm-ev" id="ev-${r.n}"></div>`}
   <div class="cm-cf"><span class="cm-qa" data-act="cm-qa">Quick Action ${ico('i-chev')}</span><span class="cm-vc" id="${where==='dash'?'dview':'view'}-${r.n}" data-act="cm-view" data-n="${r.n}">View Claim ${ico('i-arrow')}</span></div>
  </div>`; }
function renderSearch(){ $('#cs-list').innerHTML=CL.map(r=>cmCard(r,'search')).join('')+`<div class="cm-pager"><span class="pb">${ico('i-arrow')}</span><span class="pg on">1</span><span class="pg">2</span><span class="pb nx">${ico('i-arrow')}</span><span class="goto">Go to <i></i> Page</span></div>`; $('#cs-list').scrollTop=0; }
function openWhy(n,on){ const c=$('#cw-'+n); if(!c) return; const want=on===undefined?!c.classList.contains('on'):on; c.classList.toggle('on',want); }
function scrollList(el,mode){ const box=$('#cs-list'); if(!el||!box) return Promise.resolve(); const er=el.getBoundingClientRect(), br=box.getBoundingClientRect(); const top=box.scrollTop+(er.top-br.top)/Z; const target=mode==='bottom'?Math.max(0,top+er.height/Z-box.clientHeight+16):Math.max(0,top-12); return smoothScroll(box,target,700); }

/* the evidence behind a tag: the document opens under the card, on the exact line */
const EV={
 ev:{file:'Work_Status_Report_Maddox_2026-11-18.pdf',kind:'Work status report',by:'Dr. Priya Nair, Occupational Health Clinic',date:'November 18, 2026',
   body:[['Claimant','John Maddox · WC-2026-004812'],['Diagnosis','Lumbar strain, improving']],hl:'Work status: may continue <b>transitional (light) duty</b>. No lifting over 20 lb. Re-evaluate on <b>December 2, 2026</b>.',after:'Next appointment: December 2, 2026, 10:30 AM.'},
 tpa:{file:'TPA_Note_Maddox_2026-11-18',kind:'Third party administrator note',by:'Harbor Claims Services (TPA)',date:'November 18, 2026',
   body:[['Claim','WC-2026-004812'],['Topic','Transitional duty follow-up']],hl:'Light duty confirmed with the supervisor through <b>December 2</b>. Follow-up set for December 2; owner <b>Dana Ruiz</b>.',after:'Reserves unchanged.'},
 ev2:{file:'Work_Status_Report_Whitaker_2026-10-27.pdf',kind:'Work status report',by:'Dr. Alan Brooks, Orthopedics',date:'October 27, 2026',
   body:[['Claimant','John Whitaker · WC-2025-009214'],['Diagnosis','Right shoulder strain']],hl:'Continue <b>transitional duty</b>. Expected to return to full duty in about one week.',after:'No later report on file.'},
};
function openEv(n,k,on){ const box=$('#ev-'+n); if(!box) return; const want=on===undefined?!(box.classList.contains('on')&&box.dataset.k===k):on; box.classList.toggle('on',want); box.dataset.k=k;
  $$(`#cc-${n} .cm-tag`).forEach(t=>t.classList.toggle('open',want&&t.dataset.k===k));
  if(!want) return; const d=EV[k];
  box.innerHTML=`<div class="cm-evb"><span class="ic">${ico('i-doc')}</span><b>${d.file}</b><span class="sp"></span><span class="z">${ico('i-zoomout')}</span><span class="pc">100% ▾</span><span class="z">${ico('i-zoomin')}</span><span class="z" data-act="dl">${ico('i-download')}</span><span class="z" data-act="cm-ev-x" data-n="${n}">${ico('i-close')}</span></div>
   <div class="cm-evbody"><div class="cm-paper"><div class="hd"><b>${d.kind.toUpperCase()}</b><span>${d.date}</span></div><div class="by">${d.by}</div>
     ${d.body.map(([a,b])=>`<div class="kv"><span>${a}</span><b>${b}</b></div>`).join('')}<p class="hl">${d.hl}</p><p class="af">${d.after}</p></div></div>`; }

/* dashboard */
const DASH=[CL[3],
 {n:21,name:'Alexis Moreno',no:'WC-2026-005130',type:'Workers’ Comp',analyst:'Dana Ruiz',loc:'Southside Water Plant',date:'4 November, 2026',alert:'Initial Contact',due:'24 November, 2026',status:'Open',tags:['tpa'],
  sum:'A workers’ comp claim was filed for Alexis Moreno after a fall from a ladder at the Southside Water Plant. The TPA made first contact on November 6; a medical report is expected this week…'},
 {n:22,name:'Kevin Brandt',no:'AL-2026-000512',type:'Auto Liability',analyst:'Marcus Bell',loc:'Central Fleet Garage',date:'12 October, 2026',alert:'Litigation Review',due:'1 December, 2026',status:'Open',tags:['sync'],
  sum:'An auto liability claim was filed for Kevin Brandt. A city van rear-ended his car at a light; his attorney has asked for the dash camera footage…'}];
function renderDash(){ $('#ds-list').innerHTML=DASH.map(r=>cmCard(r,'dash')).join(''); }
function donut(){ const seg=[['Workers’ Comp',3174,'#3B82F6'],['Auto Liability',843,'#FACC15'],['Collision',223,'#F59E0B'],['General Liability',111,'#84CC16'],['Workers’ Comp Employers Liability',1,'#2DD4BF']];
  const tot=seg.reduce((a,s)=>a+s[1],0), R=88, r=50, cx=110, cy=110; let a0=-Math.PI/2;
  const arcs=seg.map(([n,v,c])=>{ const a1=a0+2*Math.PI*v/tot, big=a1-a0>Math.PI?1:0, P=(rr,a)=>`${cx+rr*Math.cos(a)} ${cy+rr*Math.sin(a)}`;
    const d=`M ${P(R,a0)} A ${R} ${R} 0 ${big} 1 ${P(R,a1)} L ${P(r,a1)} A ${r} ${r} 0 ${big} 0 ${P(r,a0)} Z`, m=(a0+a1)/2; a0=a1;
    return `<path d="${d}" fill="${c}" stroke="#fff" stroke-width="1.5"/>${v>60?`<text x="${cx+(R+r)/2*Math.cos(m)}" y="${cy+(R+r)/2*Math.sin(m)+4}" text-anchor="middle">${v.toLocaleString()}</text>`:''}`; }).join('');
  return `<div class="cm-donut"><svg viewBox="0 0 220 220">${arcs}</svg><ul>${seg.map(([n,v,c])=>`<li><i style="border-color:${c}"></i>${n} (${v.toLocaleString()})</li>`).join('')}</ul></div>`; }

/* claim details */
function setTab(v){ st.tab=v; $$('#cl-tabs .t').forEach(t=>t.classList.toggle('on',t.dataset.v===v)); $$('#scr-claim .cv').forEach(x=>x.classList.toggle('on',x.id==='cv-'+v)); if(v==='NOTES') renderNotes(); }
function renderAlerts(){ const u=st.updated;
  $('#wc-alerts').innerHTML=`<div class="cm-fg">
    <div><small>Current Work Status (FD / TD / LT)</small><div class="cm-in sel">Transitional Duty${ico('i-chev')}</div></div>
    <div><small>Current Work Status (as of date)</small><div class="cm-in">27 Oct, 2026${ico('i-cal')}</div></div>
    <div><small>Current Work Status (FU Due Date)</small><div class="cm-in ${u?'':'bad'}">17 Nov, 2026${ico('i-cal')}</div>${u?'':'<span class="cm-od">Overdue 4 days</span>'}</div>
    <div><small>90-Day Transitional Duty Due Date</small><div class="cm-in dis">17 Nov, 2026</div></div>
    <div><small>Litigation</small><div class="cm-in sel">No${ico('i-chev')}</div></div>
    <div class="pop-host"><small>120 Day Follow Up (as of date)</small><div class="cm-in ${u?'set':'ph'}" id="fu-asof">${u?'21 Nov, 2026':'Select date'}${ico('i-cal')}</div>
      <div class="cm-pop ${st.pop&&!u?'on':''}" id="ai-pop"><div class="h">${SPK}Update 120 Day Follow Up Date</div><p>As part of completing the 90-day transitional-duty follow-up, shall I update this date to today and set the next follow-up?</p><div class="b"><button class="btn out sm" data-act="pop-custom">Custom</button><button class="btn pri sm" id="upd-date" data-act="upd-date">Update Date</button></div></div></div>
    <div><small>120 Day Follow Up (FU Due Date)</small><div class="cm-in ${u?'set':'ph'}" id="fu-due">${u?'21 Dec, 2026':'Select date'}${ico('i-cal')}</div></div>
    <div><small>Owner</small><div class="cm-in ${u?'set':'ph'}" id="fu-own">${u?'Marcus Bell':'Unassigned'}${ico('i-chev')}</div></div>
  </div>${u?`<div class="cm-done">${ico('i-check')}<b>Follow-up updated by Claims AI</b><span>120-day follow-up set to today · next on Dec 21, 2026 · note added · owner Marcus Bell</span></div>`:''}`;
  $('#notes-n').textContent=u?'(9)':'(8)'; }
const NOTES=[['ACTION PLAN / DIARY REVIEW','Marcus Bell','27 Oct 2026','Work status report received: continue transitional duty. Expected full duty next week. Follow up Friday.'],['MEDICAL UPDATE','Harbor Claims Services (TPA)','27 Oct 2026','Seen by Dr. Alan Brooks (orthopedics). Right shoulder strain improving; no lifting over the shoulder.'],['TRANSITIONAL DUTY','Harbor Claims Services (TPA)','12 Aug 2026','Transitional duty offer accepted. Light duty in the yard office, 8 hours a day.'],['INVESTIGATION','Harbor Claims Services (TPA)','25 Jul 2025','Injury in the scope of employment while moving a park bench; the claim is compensable for the right shoulder.']];
function renderNotes(){ const nw=st.updated?[['FOLLOW-UP UPDATED','Claims AI for Marcus Bell','21 Nov 2026','90-day transitional-duty follow-up completed. 120-day follow-up set to Nov 21, 2026; next follow-up Dec 21, 2026. Work status: transitional duty since Oct 27, no full-duty release on file. Owner: Marcus Bell.',true]]:[];
  $('#notes-list').innerHTML=[...nw,...NOTES].map(n=>`<div class="cm-note ${n[4]?'new':''}"><div class="h"><b>${n[0]}</b>${n[4]?`<span class="cm-pill score">${SPK}Added by Claims AI</span>`:''}</div><small>${n[1]}, ${n[2]}</small><p>${n[3]}</p></div>`).join(''); }
