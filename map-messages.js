(()=>{
const host=document.getElementById('city-map');if(!host||typeof students==='undefined')return;
const wrapper=document.createElement('div');wrapper.className='map-messages-visual';host.before(wrapper);wrapper.append(host);
const stage=document.createElement('div');stage.className='map-messages-stage';stage.setAttribute('aria-hidden','true');wrapper.append(stage);
const controls=document.createElement('div');controls.className='map-messages-controls';const hint=document.createElement('p'),toggle=document.createElement('button');hint.setAttribute('aria-live','polite');toggle.type='button';controls.append(hint,toggle);wrapper.before(controls);
const details=document.createElement('details');details.className='map-messages-text';const summary=document.createElement('summary'),list=document.createElement('ul');summary.textContent='查看寄语文字';details.append(summary,list);wrapper.after(details);
const motion=matchMedia('(prefers-reduced-motion: reduce)');let enabled=!motion.matches;try{const saved=localStorage.getItem('team-map-messages');if(saved!==null)enabled=saved==='on'}catch{}
let items=[],cursor=0,lanes=[],onScreen=true,signature='';
function clear(){stage.replaceChildren();lanes=[]}
function paint(){stage.hidden=!enabled||motion.matches||!items.length;toggle.textContent=enabled?'隐藏弹幕':'显示弹幕';toggle.setAttribute('aria-pressed',String(enabled));toggle.disabled=items.length===0;hint.textContent=items.length?`当前筛选有 ${items.length} 条成员寄语`:'当前筛选暂无成员寄语';if(motion.matches&&items.length)hint.textContent+=' · 已按系统设置暂停动画，可展开查看文字';if(stage.hidden)clear()}
function show(){if(!enabled||motion.matches||!onScreen||document.hidden||!items.length||!host.clientWidth)return;
 const count=Math.max(1,Math.min(6,Math.floor(host.clientHeight/48))),now=Date.now();let lane=-1;for(let i=0;i<count;i++)if(!lanes[i]||lanes[i]<=now){lane=i;break}if(lane<0)return;
 const entry=items[cursor++%items.length],tag=document.createElement('span'),author=document.createElement('strong');tag.className='map-message-item';author.textContent=entry.name+'：';tag.append(author,document.createTextNode(entry.message));tag.style.top=(12+lane*Math.max(40,(host.clientHeight-60)/count))+'px';stage.append(tag);
 const duration=Math.max(14,(host.clientWidth+tag.offsetWidth+24)/80);tag.style.setProperty('--map-message-start',(host.clientWidth+10)+'px');tag.style.setProperty('--map-message-end',(-tag.offsetWidth-10)+'px');tag.style.setProperty('--map-message-duration',duration+'s');lanes[lane]=now+duration*1000;tag.addEventListener('animationend',()=>{tag.remove();lanes[lane]=0},{once:true});
}
function update(rows){const next=rows.filter(s=>typeof s.message==='string'&&s.message.trim()).map(s=>({name:s.name,message:s.message.trim()}));const key=JSON.stringify(next);if(key!==signature){signature=key;items=next;cursor=0;clear();list.replaceChildren();for(const item of items){const li=document.createElement('li');li.textContent=item.name+'：'+item.message;list.append(li)}details.hidden=!items.length;paint();show()}}
toggle.onclick=()=>{enabled=!enabled;try{localStorage.setItem('team-map-messages',enabled?'on':'off')}catch{}paint();show()};
motion.addEventListener('change',()=>{clear();paint();show()});document.addEventListener('visibilitychange',()=>{clear();if(!document.hidden)show()});
if(window.IntersectionObserver)new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;if(!onScreen)clear();else show()},{threshold:.05}).observe(wrapper);
if(window.ResizeObserver)new ResizeObserver(()=>{clear();show()}).observe(host);
const original=window.updateCityMap;if(typeof original==='function')window.updateCityMap=function(rows){const result=original.call(this,rows);update(rows);return result};
update(students);paint();setInterval(show,2800);
})();
