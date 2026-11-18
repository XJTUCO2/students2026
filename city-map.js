(()=>{
const coords={'杭州':[120.16,30.27],'新乡':[113.93,35.30],'佛山':[113.12,23.02],'长沙':[112.94,28.23],'深圳':[114.06,22.54],'天津':[117.2,39.13],'厦门':[118.09,24.48],'长春':[125.32,43.82],'烟台':[121.45,37.46],'西安':[108.94,34.34],'北京':[116.4,39.9],'上海':[121.47,31.23],'福清':[119.38,25.72],'无锡':[120.31,31.49],'重庆':[106.55,29.56],'郑州':[113.63,34.75],'南京':[118.8,32.06],'成都':[104.07,30.67],'宁波':[121.55,29.87],'青岛':[120.38,36.07],'合肥':[117.23,31.82]};
const host=document.getElementById('city-map'),summary=document.getElementById('map-summary'),list=document.getElementById('map-names');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const graduated=s=>s.status==='graduated'||(!!s.end&&s.end!=='其他'),current=s=>!graduated(s)&&s.status!=='unknown';
const kinds=[{label:'在读',color:'#247b9e',symbol:'circle',test:current},{label:'已毕业',color:'#b47738',symbol:'diamond',test:graduated}];
const provinceCodes={"北京":11,"天津":12,"长春":22,"上海":31,"南京":32,"无锡":32,"杭州":33,"宁波":33,"合肥":34,"福清":35,"厦门":35,"青岛":37,"烟台":37,"郑州":41,"新乡":41,"长沙":43,"广州佛山":44,"佛山":44,"深圳":44,"重庆":50,"成都":51,"西安":61};const cityCollator=new Intl.Collator('zh-CN-u-co-pinyin');
let chart,selected='',groups=[];
const clearCity=document.createElement('button');clearCity.type='button';clearCity.className='clear-city-filter';clearCity.hidden=true;clearCity.textContent='取消城市筛选';list.before(clearCity);
function selectCity(name){selected=selected===name?'':name;window.memberCityFilter=selected;if(typeof window.onMemberCityChange==='function')window.onMemberCityChange();else showNames()}
clearCity.onclick=()=>selectCity('');
const stats=document.createElement('div');stats.className='map-member-stats';stats.setAttribute('aria-live','polite');summary.before(stats);
function lines(people){return kinds.map((c,i)=>{const members=people.filter(c.test);return members.length?`<div class="city-status-group kind-${i}"><span class="city-status-label">${c.label} · ${members.length}人</span><p>${members.map(s=>esc(s.name)).join('、')}</p></div>`:''}).join('')}
function showNames(){
 const active=groups.find(g=>g.name===selected);
 list.innerHTML=groups.length?'<div class="city-selector-grid">'+groups.map(g=>`<button class="city-chip" type="button" data-city="${esc(g.name)}" aria-pressed="${selected===g.name}"><span>${esc(g.name)}</span><span class="city-chip-count">${g.people.length}人</span></button>`).join('')+'</div>'+(active?`<section class="selected-city-members"><h3>${esc(active.name)} · ${active.people.length}人</h3>${lines(active.people)}</section>`:''):'<p>当前条件下没有成员。</p>';
 list.querySelectorAll('button[data-city]').forEach(b=>b.onclick=()=>selectCity(b.dataset.city));
}


function resizeMap(){if(!chart)return;chart.resize();chart.setOption({geo:{layoutSize:Math.min(host.clientWidth-32,(host.clientHeight-86)*1.35)}})}

window.updateCityMap=function(rows,statRows=rows){selected=window.memberCityFilter||'';clearCity.hidden=!selected;
 const buckets=new Map();for(const s of rows){const city=s.city||'城市待填写';if(!buckets.has(city))buckets.set(city,[]);buckets.get(city).push(s)}
 groups=[...buckets].map(([name,people])=>({name,people})).sort((a,b)=>Number(!provinceCodes[a.name])-Number(!provinceCodes[b.name])||b.people.length-a.people.length||(provinceCodes[a.name]||999)-(provinceCodes[b.name]||999)||cityCollator.compare(a.name,b.name));
 stats.innerHTML=kinds.map((c,i)=>{const n=statRows.filter(c.test).length;return i===2&&!n?'':`<div class="map-stat kind-${i}"><span class="map-stat-label">${c.label}</span><strong>${n}<small> 人</small></strong></div>`}).join('');
 summary.textContent=`当前筛选共 ${rows.length} 位成员 · ${groups.filter(g=>coords[g.name]).length} 个已定位城市。蓝色圆点为在读，金色菱形为已毕业；点击城市筛选下方成员，再次点击取消。`;showNames();
 if(!window.echarts||!echarts.getMap('china')){host.textContent='地图组件未加载，仍可在下方查看各城市成员。';return}
 if(!chart){chart=echarts.init(host);chart.on('click',p=>{if(p.seriesType==='scatter')selectCity(p.name)});if(window.ResizeObserver)new ResizeObserver(resizeMap).observe(host);else window.addEventListener('resize',resizeMap)}
 chart.setOption({legend:{data:kinds.map(c=>({name:c.label,icon:c.symbol})),itemWidth:14,itemHeight:14,selectedMode:false,top:4,textStyle:{fontSize:14,color:'#486078'},itemGap:24},tooltip:{trigger:'item',confine:true,extraCssText:'max-width:420px;white-space:normal;max-height:320px;overflow:auto;',formatter:p=>{const g=groups.find(g=>g.name===p.name);return g?`<b>${esc(g.name)} · ${g.people.length} 人</b>`+kinds.map(c=>{const people=g.people.filter(c.test);return people.length?`<div style="margin-top:9px;color:${c.color}"><b>${c.label} · ${people.length}人</b></div><div>${people.map(s=>esc(s.name)).join('、')}</div>`:''}).join(''):esc(p.name)}},geo:{map:'china',roam:true,zoom:1,aspectScale:0.75,layoutCenter:["50%","55%"],layoutSize:Math.min(host.clientWidth-32,(host.clientHeight-86)*1.35),label:{show:false},itemStyle:{areaColor:'#e8eff5',borderColor:'#a6bbcd'},emphasis:{itemStyle:{areaColor:'#d4e3ef'}}},series:kinds.map((c,i)=>({name:c.label,type:'scatter',coordinateSystem:'geo',symbol:c.symbol,z:3+i,data:groups.filter(g=>coords[g.name]).map(g=>({name:g.name,value:[...coords[g.name],g.people.filter(c.test).length],symbolOffset:g.name==="西安"?[0,0]:i===0?[-10,0]:[10,0],symbolSize:g.name==="西安"?(i===0?26:12):undefined})).filter(g=>g.value[2]>0),symbolSize:v=>Math.min(32,10+Math.sqrt(v[2])*3),itemStyle:{color:c.color,opacity:.95,borderColor:'#fff',borderWidth:1.5},label:{show:true,formatter:item=>i===0||!groups.find(g=>g.name===item.name)?.people.some(current)?item.name:'',position:'right',color:'#37556d',fontSize:12} }))},true);
};
})();
