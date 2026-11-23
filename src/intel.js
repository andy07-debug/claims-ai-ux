/* ======================= Claims Anomaly Intelligence (portfolio view) =======================
   From the success story (2:10): leaders track claim volume, cost and litigation over time, compare states and
   plants, see where incidents are rising; AI surfaces repeated incidents, emerging risks, high-cost claim types and
   recurring claimant patterns, each linked to the claims and locations driving it. All numbers are sample data. */
const IQ='Where are incidents rising?';
const SV=(d,s=16,extra='')=>`<svg viewBox="0 0 24 24" style="width:${s}px;height:${s}px;flex:none" ${extra}>${d}</svg>`;
const ST='fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
const IC={
 back:`<path d="M19 12H6M11 6l-6 6 6 6" ${ST}/>`, home:`<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" ${ST}/>`, expand:`<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" ${ST}/>`,
 filter:`<path d="M4 6h16M7 12h10M10 18h4" ${ST}/>`, line:`<path d="M4 19V5M4 19h16M7 15l4-4 3 3 5-6" ${ST}/>`, chev:`<path d="M6 9l6 6 6-6" ${ST}/>`,
 dollar:`<path d="M12 3v18M16.5 7.5c-.8-1.3-2.4-2-4.5-2-2.7 0-4.3 1.3-4.3 3.1 0 4.3 9.1 2.2 9.1 6.6 0 1.9-1.8 3.3-4.8 3.3-2.3 0-4-.8-4.8-2.3" ${ST}/>`,
 up:`<path d="M3 17l6-6 4 4 8-8M15 7h6v6" ${ST}/>`, down:`<path d="M3 7l6 6 4-4 8 8M15 17h6v-6" ${ST}/>`,
 warn:`<path d="M12 4l9 16H3zM12 10v4M12 17v.5" ${ST}/>`, flag:`<path d="M5 21V4M5 4h11l-2 4 2 4H5" ${ST}/>`,
 globe:`<circle cx="12" cy="12" r="8.5" ${ST}/><path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17" ${ST}/>`,
 cash:`<rect x="3" y="6" width="18" height="12" rx="2" ${ST}/><circle cx="12" cy="12" r="2.6" ${ST}/><path d="M6.5 9.5v5M17.5 9.5v5" ${ST}/>`,
 repeat:`<path d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4" ${ST}/>`,
 team:`<circle cx="9" cy="8" r="3" ${ST}/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6M16 5.5a3 3 0 0 1 0 5.4M17.5 14.6c1.6.6 2.6 2 3 4.4" ${ST}/>`,
 x:`<path d="M6 6l12 12M18 6L6 18" ${ST}/>`, ext:`<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" ${ST}/>`,
 spark:`<path d="M10 4.5l1.6 5.4 5.4 1.6-5.4 1.6L10 18.5l-1.6-5.4L3 11.5l5.4-1.6zM18 3l.7 2.3L21 6l-2.3.7L18 9l-.7-2.3L15 6l2.3-.7z" fill="currentColor"/>`,
 ok:`<path d="M5 12.5l4.2 4.2L19 7" ${ST}/>`, fwd:`<path d="M5 12h13M13 6l6 6-6 6" ${ST}/>`, pin:`<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" ${ST}/><circle cx="12" cy="10" r="2.3" ${ST}/>`,
};
const ic=(k,s)=>SV(IC[k],s);

/* ---------- sample data ---------- */
const RANGES=[
 {k:'today',lab:'Today',per:'today',f:.14,pp:.2,n:9,x:i=>`${(8+i)%12||12} ${8+i<12?'AM':'PM'}`},
 {k:'yday',lab:'Yesterday',per:'yesterday',f:.15,pp:.2,n:9,x:i=>`${(8+i)%12||12} ${8+i<12?'AM':'PM'}`},
 {k:'7d',lab:'7 days',per:'in 7 days',f:1,pp:1,dates:['2026-11-15','2026-11-21',7]},
 {k:'30d',lab:'30 days',per:'in 30 days',f:4.3,pp:3,dates:['2026-10-23','2026-11-21',11]},
 {k:'tm',lab:'This month',per:'this month',f:3,pp:3,dates:['2026-11-01','2026-11-21',8]},
 {k:'lm',lab:'Last month',per:'last month',f:4.4,pp:4,dates:['2026-10-01','2026-10-31',8]},
 {k:'3m',lab:'Last 3 months',per:'in 3 months',f:13,pp:7,dates:['2026-08-22','2026-11-21',13]},
];
const PLOTS={count:{lab:'Claims Count',y:'Claim count',sub:'Tracks the total number of claims across the selected date range.'},
             cost:{lab:'Total Cost',y:'Incurred cost',sub:'Tracks the incurred cost of claims across the selected date range.'},
             lit:{lab:'Litigation Count',y:'Litigated claims',sub:'Tracks claims in litigation across the selected date range.'}};
const SERIES=[['All Claims','#5B4BD8'],['Open','#3FA34D'],['Closed','#E8862E'],['Reopen','#C026D3']];
// city sites on the map: [site, city key, claims raised this week]
const SITES=[['Yard 4 · Newark','Newark',31],['Fleet Garage · Dallas','Dallas',26],['Plant 7 · Houston','Houston',22],['Service Center · Denver','Denver',19],['Depot 3 · Phoenix','Phoenix',17],
 ['Depot 12 · Chicago','Chicago',15],['Yard 2 · Los Angeles','Los Angeles',14],['Plant 2 · Wichita','Wichita',12],['Depot 5 · Austin','Austin',11],['Yard 6 · Minneapolis','Minneapolis',9],
 ['Plant 9 · Nashville','Nashville',8],['Depot 4 · Charlotte','Charlotte',7],['Plant 5 · Columbus','Columbus',6],['Yard 3 · Memphis','Memphis',6],['Yard 9 · Atlanta','Atlanta',5],
 ['Depot 10 · Omaha','Omaha',5],['Plant 4 · Salt Lake City','Salt Lake City',4],['Depot 8 · Seattle','Seattle',3],['Plant 11 · Sacramento','Sacramento',2]];
const FIN=[['Yard 4 · Newark','$14.2K',9,'12.4'],['Fleet Garage · Dallas','$11.8K',7,'8.1'],['Plant 7 · Houston','$9.6K',6,'5.2'],['Depot 12 · Chicago','$7.9K',5,'3.6'],['Plant 2 · Wichita','$5.1K',4,'1.9']];
const TUP=[['Yard 4 · Newark',31,'18.2'],['Fleet Garage · Dallas',26,'6.4'],['Plant 7 · Houston',22,'3.9'],['Service Center · Denver',19,'2.1'],['Depot 3 · Phoenix',17,'0.8']];
const TDN=[['Plant 5 · Columbus',6,'5.1'],['Yard 9 · Atlanta',5,'3.8'],['Depot 8 · Seattle',3,'2.7'],['Plant 11 · Sacramento',2,'1.2'],['Depot 6 · Boston',0,null]];
const REP=[['Yard 4 · Newark',12,'Slips and falls'],['Fleet Garage · Dallas',9,'Lifting · back strain'],['Plant 7 · Houston',7,'Vehicle collision'],['Depot 12 · Chicago',6,'General liability'],['Depot 3 · Phoenix',5,'Heat stress']];
const COSTS=[['Auto Liability',8.4],['General Liability',11.2],['Workers’ Comp',34.1],['Collision',15.3],['Property Damage',19.6]];
const LOAD=[['Marcus Bell',34,12,4],['Dana Ruiz',28,35,2],['Priya Shah',19,18,1],['Tom Okafor',13,14,0],['Lena Park',6,21,0]];
// AI insights, each tied to the claims and the place behind it
const INS=[
 {id:1,kind:'Emerging risk',loc:'Yard 4 · Newark',text:'Slip-and-fall claims at <b>Yard 4 · Newark</b> tripled in the past two weeks: <b>9 claims</b>, 7 of them near the wash bay.',n:9,cta:'Assign a safety review',done:'Safety review assigned to the Yard 4 supervisor · due Nov 28',
  stats:[['9','claims in 14 days'],['3×','the usual rate'],['$14.2K','incurred']],
  claims:[['Rosa Delgado','WC-2026-011482','Slip · wash bay','Nov 20','Open'],['Jamal Rivers','WC-2026-011455','Slip · wash bay','Nov 19','Open'],['Hannah Cole','WC-2026-011431','Slip · wash bay','Nov 18','Pending'],['Victor Ruiz','WC-2026-011402','Slip · ramp','Nov 17','Open'],['Aisha Grant','WC-2026-011377','Slip · wash bay','Nov 15','Open'],['Leo Brennan','WC-2026-011350','Slip · wash bay','Nov 13','Pending'],['Nina Patel','WC-2026-011318','Slip · wash bay','Nov 11','Open'],['Owen Fisk','WC-2026-011296','Slip · loading dock','Nov 9','Closed'],['Marcus Tate','WC-2026-011271','Slip · wash bay','Nov 8','Open']]},
 {id:2,kind:'Recurring claimant',loc:'Fleet Garage · Dallas',text:'<b>Kevin Brandt</b> has filed a claim about once a year, each a lower-back strain from unloading trucks at <b>Fleet Garage · Dallas</b>.',n:3,cta:'Flag for a return-to-work review',done:'Return-to-work review flagged for Kevin Brandt · owner Dana Ruiz',
  stats:[['3','claims in 26 months'],['Same','injury and task'],['$21.6K','total incurred']],
  claims:[['Kevin Brandt','WC-2026-010944','Lower back · unloading','Oct 30','Open'],['Kevin Brandt','WC-2025-008120','Lower back · unloading','Nov 4, 2025','Closed'],['Kevin Brandt','WC-2024-005377','Lower back · unloading','Sep 12, 2024','Closed']]},
 {id:3,kind:'High-cost type',loc:'Fleet Garage · Dallas',text:'<b>Workers’ comp</b> is 39% of this week’s incurred cost ($34.1K), led by lifting injuries at <b>Fleet Garage · Dallas</b>.',n:7,cta:'Send to the risk team',done:'Sent to the risk team · Fleet Garage lifting review',
  stats:[['$34.1K','incurred this week'],['39%','of all claim cost'],['7','lifting claims']],
  claims:[['Kevin Brandt','WC-2026-010944','Lower back · unloading','Oct 30','Open'],['Ana Lopes','WC-2026-011390','Shoulder · lifting','Nov 16','Open'],['Ben Carter','WC-2026-011366','Back · lifting','Nov 15','Pending'],['Ivy Chen','WC-2026-011329','Wrist · lifting','Nov 12','Open'],['Raj Mehta','WC-2026-011301','Back · lifting','Nov 10','Open'],['Sam Ortiz','WC-2026-011287','Knee · lifting','Nov 9','Closed'],['Tara Webb','WC-2026-011260','Back · lifting','Nov 8','Open']]},
 {id:4,kind:'Litigation',loc:'Plant 7 · Houston',text:'<b>2 collision claims</b> at <b>Plant 7 · Houston</b> now have attorney letters and no reserve review since September.',n:2,cta:'Request a reserve review',done:'Reserve review requested for 2 claims · owner Priya Shah',
  stats:[['2','attorney letters'],['61 days','since reserve review'],['$9.6K','incurred']],
  claims:[['Darnell Hayes','AL-2026-004418','Collision · forklift','Sep 22','Pending'],['Carla Ng','AL-2026-004391','Collision · yard truck','Sep 18','Pending']]},
];
const ist={range:'7d',plot:'count',drawer:null,done:{},plotOpen:false};

/* ---------- chart ---------- */
function rdates(a,b,n){ const t0=new Date(a+'T12:00:00'), t1=new Date(b+'T12:00:00'); return Array.from({length:n},(_,i)=>{ const d=new Date(+t0+(t1-t0)*i/(n-1)); return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`; }); }
function series(){ const R=RANGES.find(r=>r.k===ist.range), n=R.dates?R.dates[2]:R.n, xs=R.dates?rdates(...R.dates):Array.from({length:n},(_,i)=>R.x(i));
  const s=RANGES.indexOf(R)*1.7+1, pp=R.pp, m=ist.plot==='cost'?1.62:ist.plot==='lit'?0.045:1, w=i=>i/(n-1);
  const all=xs.map((_,i)=>(56+5*Math.sin(i*1.1+s)+3*Math.sin(i*2.3+s*2)+7*w(i))*pp);
  const open=xs.map((_,i)=>(33+3*Math.sin(i*.9+s+1)+19*w(i)*w(i))*pp);
  const closed=xs.map((_,i)=>(19+5*Math.sin(i*1.6+s)+(i===Math.round(n*.45)?9:0))*pp);
  const re=xs.map((_,i)=>Math.max(0,(5+3*Math.sin(i*1.3+s*1.4))*pp));
  const f=v=>ist.plot==='lit'?Math.max(0,Math.round(v*m*10)/10):Math.round(v*m*10)/10;
  return {xs,ys:[all,open,closed,re].map(a=>a.map(f))}; }
function niceMax(v){ const steps=[1,2,4,5,8,10,20,25,40,50,80,100,200,250,400,500,800,1000,2000]; for(const st of steps) if(v<=st*4) return [st*4,st]; return [Math.ceil(v/500)*500,Math.ceil(v/2000)*500]; }
function chartSVG(){ const {xs,ys}=series(), W=1000, H=330, L=84, R=26, T=18, B=58, max=Math.max(...ys.flat())*1.08, [ym,stp]=niceMax(max);
  const X=i=>L+(W-L-R)*i/(xs.length-1), Y=v=>T+(H-T-B)*(1-v/ym);
  const curve=a=>{ const p=a.map((v,i)=>[X(i),Y(v)]); let d=`M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
    for(let i=0;i<p.length-1;i++){ const p0=p[i-1]||p[i], p1=p[i], p2=p[i+1], p3=p[i+2]||p2; d+=`C${(p1[0]+(p2[0]-p0[0])/6).toFixed(1)},${(p1[1]+(p2[1]-p0[1])/6).toFixed(1)} ${(p2[0]-(p3[0]-p1[0])/6).toFixed(1)},${(p2[1]-(p3[1]-p1[1])/6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`; } return d; };
  let g=''; for(let v=0;v<=ym+1e-6;v+=stp) g+=`<line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#EEF0F3"/><text x="${L-14}" y="${Y(v)+5}" text-anchor="end" class="ai-t">${ist.plot==='cost'&&v?(v>=1000?'$'+(v/1000)+'M':'$'+v+'K'):v}</text>`;
  const every=xs.length>9?2:1;
  g+=xs.map((x,i)=>i%every&&i!==xs.length-1?'':`<text x="${X(i)}" y="${H-B+28}" text-anchor="middle" class="ai-t">${x}</text>`).join('');
  g+=`<text x="${(L+W-R)/2}" y="${H-6}" text-anchor="middle" class="ai-t b">${RANGES.find(r=>r.k===ist.range).dates?'Date':'Time'}</text><text transform="translate(16 ${(T+H-B)/2}) rotate(-90)" text-anchor="middle" class="ai-t b">${PLOTS[ist.plot].y}</text>`;
  const lines=ys.map((a,k)=>`<path d="${curve(a)}" fill="none" stroke="${SERIES[k][1]}" stroke-width="${k?2.4:2.8}" stroke-linecap="round" class="ai-ln" style="--d:${k*90}ms"/>`).join('');
  const dots=ys[0].map((v,i)=>i%2?'':`<circle cx="${X(i)}" cy="${Y(v)}" r="5" fill="#fff" stroke="${SERIES[0][1]}" stroke-width="2.2"/>`).join('');
  const hov=xs.map((x,i)=>`<rect x="${X(i)-(W-L-R)/(xs.length-1)/2}" y="${T}" width="${(W-L-R)/(xs.length-1)}" height="${H-T-B}" fill="transparent" data-i="${i}" class="ai-hz"/>`).join('');
  return `<svg class="ai-plot" viewBox="0 0 ${W} ${H}">${g}${lines}${dots}<line id="ai-guide" x1="0" x2="0" y1="${T}" y2="${H-B}" stroke="#C7CBD3" stroke-dasharray="4 4" style="display:none"/>${hov}</svg>`; }
function chartTip(i){ const {xs,ys}=series(), t=$('#ai-tip'), g=$('#ai-guide'); if(i==null){ t.style.display='none'; g.style.display='none'; return; }
  const svg=$('#ai-chart .ai-plot'), L=84, R=26, x=L+(1000-L-R)*i/(xs.length-1); g.setAttribute('x1',x); g.setAttribute('x2',x); g.style.display='';
  const u=ist.plot==='cost'?v=>'$'+v+'K':v=>v; t.innerHTML=`<b>${xs[i]}</b>${SERIES.map((s,k)=>`<div><i style="background:${s[1]}"></i>${s[0]}<span>${u(ys[k][i])}</span></div>`).join('')}`;
  const sw=svg.getBoundingClientRect().width/Z; t.style.display='block'; t.style.left=Math.min(sw-190,Math.max(8,x/1000*sw+14))+'px'; }

/* ---------- map ---------- */
function mapSVG(){ const M=USMAP, mx=Math.max(...SITES.map(s=>s[2]));
  const b=SITES.slice().sort((a,c)=>a[2]-c[2]).map(s=>{ const p=M.pts[s[1]]; if(!p) return ''; const r=19+Math.sqrt(s[2]/mx)*17, hot=s[2]>=17;
    return `<g class="ai-pin${hot?' hot':''}" data-act="ai-loc" data-l="${s[0]}" transform="translate(${p[0]} ${p[1]})"><circle r="${r+6}" class="h"/><circle r="${r}" class="c"/><text y="6" text-anchor="middle">${s[2]}</text><title>${s[0]} · ${s[2]} claims this week</title></g>`; }).join('');
  return `<svg class="ai-map" viewBox="0 0 975 610"><path d="${M.states}" fill="#ECEAE6"/><path d="${M.borders}" fill="none" stroke="#fff" stroke-width="1.4"/>${b}</svg>`; }

/* ---------- screen ---------- */
const loc=(l)=>`<a class="ai-a" data-act="ai-loc" data-l="${l}">${l}</a>`;
const card=(icon,title,body,extra='')=>`<div class="ai-card"${extra}><div class="ai-ch"><span class="ai-ci">${ic(icon,18)}</span><b>${title}</b><span class="sp"></span><span class="ai-x" data-act="ai-expand" title="Expand">${ic('expand',15)}</span></div>${body}</div>`;
function kpis(){ const R=RANGES.find(r=>r.k===ist.range), f=R.f, cost=96.4*f, money=v=>v>=1000?'$'+(v/1000).toFixed(2)+'M':'$'+(v>=100?Math.round(v):v.toFixed(1))+'K';
  const avg=Math.round(2310*(1+.04*Math.sin(f*3))), lit=Math.max(f<.5?0:1,Math.round(3*f)), fl=Math.max(1,Math.round(4*Math.pow(f,.8)));
  return [['Total Incurred Cost',money(cost),'dollar'],['Avg Cost Per Claim','$'+avg.toLocaleString('en-US'),'up'],['Total Litigated Claims',lit,'warn'],['AI Flagged',fl,'flag']]
   .map(k=>`<div class="ai-kpi"><div><small>${k[0]}</small><b>${k[1]}</b><em>${R.per}</em></div><span class="ai-ki">${ic(k[2],22)}</span></div>`).join(''); }
function renderIntel(){ const h=$('#ai-body'); if(!h) return;
  h.innerHTML=`
  <div class="ai-range" id="ai-range">${RANGES.map(r=>`<span class="ai-rc${r.k===ist.range?' on':''}" data-act="ai-range" data-r="${r.k}">${r.lab}</span>`).join('')}<span class="ai-rc" data-act="ai-custom">Custom</span>
   <span class="ai-div"></span><span class="ai-live"><i></i>Live Data</span><span class="sp"></span><span class="ai-filt" data-act="ai-filter">${ic('filter',15)}Filters</span></div>
  <div class="ai-card ai-over" id="ai-over"><div class="ai-ch"><span class="ai-ci sq">${ic('line',18)}</span><div><b>Claims Over Time</b><small id="ai-sub">${PLOTS[ist.plot].sub}</small></div><span class="sp"></span>
    <div class="ai-dd"><span class="ai-ddb" id="ai-plotbtn" data-act="ai-plot">${ic('line',14)}Plot by : <span id="ai-plotlab">${PLOTS[ist.plot].lab}</span>${ic('chev',14)}</span>
     <div class="ai-ddm${ist.plotOpen?' on':''}" id="ai-plotm">${Object.entries(PLOTS).map(([k,p])=>`<span class="${k===ist.plot?'on':''}" data-act="ai-plotset" data-p="${k}" id="ai-p-${k}">${p.lab}</span>`).join('')}</div></div></div>
   <div class="ai-chart" id="ai-chart">${chartSVG()}<div class="ai-tip" id="ai-tip"></div></div>
   <div class="ai-leg">${SERIES.map(s=>`<span><i style="--c:${s[1]}"></i>${s[0]}</span>`).join('')}</div></div>
  <div class="ai-kpis" id="ai-kpis">${kpis()}</div>
  <div class="ai-g2">
   ${card('globe','Location Based Claims View',`<div class="ai-mapw">${mapSVG()}</div>`,' id="ai-mapcard"').replace('<span class="sp"></span>','<span class="sp"></span><span class="ai-sel">United States '+ic('chev',13)+'</span>')}
   ${card('cash','Highest Financial Impact Locations',`<table class="ai-tb"><tr><th>Location</th><th class="r">Total cost</th><th class="r">Claims</th><th class="r">Cost Δ%</th></tr>${FIN.map(r=>`<tr data-l="${r[0]}"><td>${loc(r[0])}</td><td class="r">${r[1]}</td><td class="r">${r[2]}</td><td class="r"><span class="ai-upv">↑${r[3]}%</span></td></tr>`).join('')}</table>`)}
  </div>
  <div class="ai-g2">
   ${card('up','Top Trending Up Locations',`<table class="ai-tb"><tr><th>Location</th><th>Claims raised</th></tr>${TUP.map(r=>`<tr data-l="${r[0]}"><td>${loc(r[0])}</td><td><b class="n">${r[1]}</b><span class="ai-upv">↑${r[2]}%</span> <small>in last week</small></td></tr>`).join('')}</table>`,' id="ai-tup"')}
   ${card('down','Top Trending Down Locations',`<table class="ai-tb"><tr><th>Location</th><th>Claims raised</th></tr>${TDN.map(r=>`<tr data-l="${r[0]}"><td>${loc(r[0])}</td><td><b class="n">${r[1]}</b>${r[2]?`<span class="ai-dnv">↓${r[2]}%</span> <small>in last week</small>`:'<small>No change in last week</small>'}</td></tr>`).join('')}</table>`)}
  </div>
  <div class="ai-g2">
   ${card('warn','Trending Risk',`<div class="ai-ins" id="ai-ins">${INS.map(i=>`<div class="ai-in${ist.done[i.id]?' done':''}" id="ins-${i.id}"><span class="ai-k">${ic('spark',12)}${i.kind}</span><p>${i.text}</p><span class="ai-go" id="ins-go-${i.id}" data-act="ai-ins" data-i="${i.id}">${ist.done[i.id]?ic('ok',14)+'Action taken':`See the ${i.n} claim${i.n>1?'s':''} ${ic('fwd',14)}`}</span></div>`).join('')}</div>`,' id="ai-risk"')}
   ${card('cash','Highest Cost Incident Types',costBars(),' id="ai-costs"')}
  </div>
  <div class="ai-g2">
   ${card('repeat','Repeated Incident Locations',`<table class="ai-tb"><tr><th>Location</th><th class="r">Claims</th><th>Incident type</th></tr>${REP.map(r=>`<tr data-l="${r[0]}"><td>${loc(r[0])}</td><td class="r">${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</table>`)}
   ${card('team','Analyst Workload Overview',`<table class="ai-tb ai-load"><tr><th colspan="4">Claim analyst</th></tr>${LOAD.map(r=>`<tr><td>${r[0]}</td><td><span class="ai-p b">${r[1]} assigned</span></td><td><span class="ai-p g">${r[2]} closed</span></td><td><span class="ai-p ${r[3]?'r':'n'}">${r[3]} overdue</span></td></tr>`).join('')}</table>`)}
  </div>`;
  bindChart(); renderDrawer(); }
function costBars(){ const W=440,H=372,L=50,B=58,T=16,mx=40, X=i=>L+14+i*((W-L-24)/5), bw=(W-L-24)/5-18, Y=v=>T+(H-T-B)*(1-v/mx), top=Math.max(...COSTS.map(c=>c[1]));
  let g=''; for(let v=0;v<=mx;v+=10) g+=`<line x1="${L}" x2="${W-8}" y1="${Y(v)}" y2="${Y(v)}" stroke="#EEF0F3" stroke-dasharray="${v?'4 4':''}"/><text x="${L-10}" y="${Y(v)+5}" text-anchor="end" class="ai-t">${v}</text>`;
  g+=COSTS.map((c,i)=>{ const a=.25+.75*c[1]/top; return `<rect x="${X(i)}" y="${Y(c[1])}" width="${bw}" height="${Y(0)-Y(c[1])}" rx="3" fill="${c[1]===top?'#5B4BD8':`rgba(91,75,216,${(a*.55).toFixed(2)})`}"><title>${c[0]} · $${c[1]}K</title></rect>${c[0].split(' ').map((w,k)=>`<text x="${X(i)+bw/2}" y="${H-B+24+k*17}" text-anchor="middle" class="ai-t">${w}</text>`).join('')}`; }).join('');
  g+=`<text transform="translate(14 ${(T+H-B)/2}) rotate(-90)" text-anchor="middle" class="ai-t b">Cost ($K)</text>`;
  return `<svg class="ai-plot" viewBox="0 0 ${W} ${H}">${g}</svg>`; }
function bindChart(){ $$('#ai-chart .ai-hz').forEach(r=>{ r.addEventListener('mouseenter',()=>chartTip(+r.dataset.i)); }); const c=$('#ai-chart'); if(c) c.addEventListener('mouseleave',()=>chartTip(null)); }
function redrawChart(){ $('#ai-chart').innerHTML=chartSVG()+'<div class="ai-tip" id="ai-tip"></div>'; $('#ai-sub').textContent=PLOTS[ist.plot].sub; $('#ai-plotlab').textContent=PLOTS[ist.plot].lab;
  $$('#ai-plotm span').forEach(s=>s.classList.toggle('on',s.dataset.p===ist.plot)); $('#ai-kpis').innerHTML=kpis(); $$('#ai-range .ai-rc').forEach(s=>s.classList.toggle('on',s.dataset.r===ist.range)); bindChart(); }

/* ---------- drawer: the claims behind an insight or a location ---------- */
function locClaims(l){ const s=SITES.find(x=>x[0]===l)||TDN.find(x=>x[0]===l)||[l,'',4]; const n=Math.min(6,Math.max(1,s[2]|0||1));
  const who=['Rosa Delgado','Ben Carter','Ivy Chen','Raj Mehta','Tara Webb','Sam Ortiz','Ana Lopes','Owen Fisk'], ty=['Slip · walkway','Back · lifting','Collision · yard','Hand · equipment','Knee · stairs','Shoulder · lifting'];
  return {id:'L:'+l,kind:'Location',loc:l,text:`Claims raised at <b>${l}</b> in the last 7 days.`,n,cta:'Open in claim search',done:`Opened ${l} in claim search (sample)`,
    stats:[[String(s[2]),'claims this week'],[(TUP.find(x=>x[0]===l)||[0,0,'0.0'])[2]==='0.0'?'—':'↑'+(TUP.find(x=>x[0]===l)||[0,0,'0'])[2]+'%','vs last week'],[(FIN.find(x=>x[0]===l)||[0,'$2.1K'])[1],'incurred']],
    claims:Array.from({length:n},(_,i)=>[who[i%who.length],`WC-2026-01${(1480-i*23)}`,ty[i%ty.length],`Nov ${20-i*2}`,i%3===2?'Pending':'Open'])}; }
function renderDrawer(){ const d=$('#ai-drawer'), v=$('#ai-veil'); if(!d) return; const x=ist.drawer;
  d.classList.toggle('on',!!x); v.classList.toggle('on',!!x); if(!x) return;
  { const host=d.parentElement, top=host.getBoundingClientRect().top/Z; d.style.height=Math.max(420,Math.min(host.clientHeight,innerHeight/Z-top-8))+'px'; } // fit the visible screen
  const done=ist.done[x.id];
  d.innerHTML=`<div class="ai-dh"><span class="ai-k">${ic('spark',12)}${x.kind}</span><span class="sp"></span><span class="ai-x" data-act="ai-close" title="Close">${ic('x',16)}</span></div>
   <h3>${x.loc}</h3><p class="ai-dt">${x.text}</p>
   <div class="ai-ds">${x.stats.map(s=>`<div><b>${s[0]}</b><small>${s[1]}</small></div>`).join('')}</div>
   <div class="ai-dl"><div class="ai-dlh">Claims driving this insight <i>(${x.claims.length})</i></div>
    ${x.claims.map(c=>`<div class="ai-dc"><div><b>${c[0]}</b><small>${c[1]} · ${c[2]}</small></div><span class="ai-dd8">${c[3]}</span><span class="cm-pill st ${c[4]==='Closed'?'s-closed':c[4]==='Pending'?'s-pend':'s-open'}">${c[4]}</span></div>`).join('')}</div>
   <div class="ai-df">${done?`<div class="ai-okb" id="ai-okb">${ic('ok',16)}${x.done}</div>`:`<button class="cm-new" id="ai-act" data-act="ai-act">${x.cta}</button><span class="ai-sec" data-act="ai-search">Open in claim search ${ic('ext',13)}</span>`}</div>`; }
function openDrawer(x){ ist.drawer=x; renderDrawer(); }

/* ---------- clicks ---------- */
document.addEventListener('click',async e=>{ const el=e.target.closest('[data-act^="ai-"]');
  if(!e.target.closest('.ai-dd')&&ist.plotOpen){ ist.plotOpen=false; const m=$('#ai-plotm'); if(m) m.classList.remove('on'); }
  if(!el||playing) return; const a=el.dataset.act;
  if((busy||advancing)&&a!=='ai-close') return;
  switch(a){
   case 'ai-range': ist.range=el.dataset.r; redrawChart(); break;
   case 'ai-custom': toast('Pick a custom date range (demo)'); break;
   case 'ai-filter': toast('Filters: state, location, claim type, analyst · 0 applied'); break;
   case 'ai-plot': ist.plotOpen=!ist.plotOpen; $('#ai-plotm').classList.toggle('on',ist.plotOpen); break;
   case 'ai-plotset': ist.plot=el.dataset.p; ist.plotOpen=false; $('#ai-plotm').classList.remove('on'); redrawChart(); break;
   case 'ai-loc': openDrawer(locClaims(el.dataset.l)); break;
   case 'ai-ins': { const id=+el.dataset.i; if(id===1&&cur===idx('intel')) await advanceTo('insight'); else openDrawer(INS.find(i=>i.id===id)); break; }
   case 'ai-close': ist.drawer=null; renderDrawer(); updateHint(); break;
   case 'ai-act': { const x=ist.drawer; if(!x) break; if(x.id===1&&cur===idx('insight')){ await advanceTo('acted'); break; } ist.done[x.id]=true; renderDrawer(); toast(x.done); const it=$('#ins-go-'+x.id); if(it){ it.innerHTML=ic('ok',14)+'Action taken'; it.parentElement.classList.add('done'); } break; }
   case 'ai-search': show('search'); toast('Showing these claims in claim search (sample)'); break;
   case 'ai-expand': { const c=el.closest('.ai-card'); modal(`<div class="ai-modal">${c.innerHTML.replace(/data-act="ai-expand"/g,'data-act="close-modal"')}</div>`,true); break; }
   case 'ai-back': show(cur>=idx('dashboard')?'dash':'home'); break;
   case 'ai-open': if(cur===idx('updated')) await advanceTo('intel'); else { show('intel'); renderIntel(); } break;
  }
});
