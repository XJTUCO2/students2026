(()=>{
const host=document.getElementById('city-map');if(!host||typeof students==='undefined')return;
const wrapper=document.createElement('div');wrapper.className='map-messages-visual';host.before(wrapper);wrapper.append(host);
const stage=document.createElement('div');stage.className='map-messages-stage';stage.setAttribute('aria-hidden','true');wrapper.append(stage);
const controls=document.createElement('div');controls.className='map-messages-controls';const hint=document.createElement('p'),toggle=document.createElement('button');hint.setAttribute('aria-live','polite');toggle.type='button';controls.append(hint,toggle);wrapper.before(controls);

const motion=matchMedia('(prefers-reduced-motion: reduce)');let enabled=!motion.matches;try{const saved=localStorage.getItem('team-map-messages');if(saved!==null)enabled=saved==='on'}catch{}
let items=[],cursor=0,lanes=[],onScreen=true,signature='';
function clear(){stage.replaceChildren();lanes=[]}
function paint(){stage.hidden=!enabled||motion.matches||!items.length;toggle.textContent=enabled?'隐藏弹幕':'显示弹幕';toggle.setAttribute('aria-pressed',String(enabled));toggle.disabled=items.length===0;hint.textContent=items.length?`共有 ${items.length} 条成员寄语 · 循环展示`:'暂无成员寄语';if(motion.matches&&items.length)hint.textContent+=' · 已按系统设置暂停动画';if(stage.hidden)clear()}
function show(){if(!enabled||motion.matches||!onScreen||document.hidden||!items.length||!host.clientWidth)return;
 const count=Math.max(1,Math.min(3,Math.floor((stage.clientHeight-16)/48))),now=Date.now();let lane=-1;for(let i=0;i<count;i++)if(!lanes[i]||lanes[i]<=now){lane=i;break}if(lane<0)return;
 const entry=items[cursor++%items.length],tag=document.createElement('span'),author=document.createElement('strong');tag.className='map-message-item';author.textContent=entry.name;const date=document.createElement('span');date.className='map-message-date';date.textContent=entry.date?' · '+entry.date+'：':'：';tag.append(author,date,document.createTextNode(entry.message));tag.style.top=(8+lane*48)+'px';stage.append(tag);
 const duration=(host.clientWidth+tag.offsetWidth+24)/70;tag.style.setProperty('--map-message-start',(host.clientWidth+10)+'px');tag.style.setProperty('--map-message-end',(-tag.offsetWidth-10)+'px');tag.style.setProperty('--map-message-duration',duration+'s');lanes[lane]=now+duration*1000+1200;tag.addEventListener('animationend',()=>{tag.remove()},{once:true});
}
function seed(){show()}
function update(rows){const next=rows.filter(s=>typeof s.message==='string'&&s.message.trim()).map(s=>({name:s.name,message:s.message.trim(),date:/^\d{4}-\d{2}-\d{2}$/.test(s.messageDate||'')?s.messageDate:''}));const key=JSON.stringify(next);if(key!==signature){signature=key;items=next;cursor=0;clear();paint();seed()}}
toggle.onclick=()=>{enabled=!enabled;try{localStorage.setItem('team-map-messages',enabled?'on':'off')}catch{}paint();seed()};
motion.addEventListener('change',()=>{clear();paint();seed()});document.addEventListener('visibilitychange',()=>{clear();if(!document.hidden)seed()});
if(window.IntersectionObserver)new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;if(!onScreen)clear();else seed()},{threshold:.05}).observe(wrapper);
if(window.ResizeObserver)new ResizeObserver(()=>{clear();seed()}).observe(host);
const original=window.updateCityMap;if(typeof original==='function')window.updateCityMap=function(rows,statRows){const result=original.call(this,rows,statRows);update(students);return result};
update(students);paint();setInterval(show,4500);
})();
