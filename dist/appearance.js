'use strict';
(function(){
const choices=['lime','graphite','sapphire','sand','violet'],select=document.getElementById('appearanceTheme');let current='lime';try{const saved=localStorage.getItem('fragment-theme');if(choices.includes(saved))current=saved}catch{}
function apply(theme){if(!choices.includes(theme))return;document.documentElement.dataset.theme=theme;if(select)select.value=theme;try{localStorage.setItem('fragment-theme',theme)}catch{}requestAnimationFrame(()=>{window.FragmentFloatingControls?.layout();if(typeof scheduleLayout==='function')scheduleLayout()})}
if(select)select.onchange=()=>apply(select.value);apply(current);
})();
