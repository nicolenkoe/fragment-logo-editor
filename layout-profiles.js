'use strict';
(function(){
 const keys=['phone-portrait','phone-landscape','expanded-portrait','expanded-landscape'];
 let stable={w:innerWidth,h:innerHeight},current;
 function detect(){try{const native=globalThis.AndroidViewport?.layoutProfile?.();if(keys.includes(native))return native}catch{}
  const w=innerWidth,h=innerHeight,editing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName||'');
  // A software keyboard changes usable height, not the device's layout profile.
  if(!(editing&&Math.abs(w-stable.w)<2&&h<stable.h*.75))stable={w,h};
  return(Math.min(stable.w,stable.h)>=600?'expanded':'phone')+'-'+(stable.w>stable.h?'landscape':'portrait');
 }
 current=detect();
 function refresh(){const next=detect();if(next!==current){const previous=current;current=next;dispatchEvent(new CustomEvent('fragment-layout-profile',{detail:{previous,current}}))}return current}
 window.FragmentLayoutProfiles={keys,get:detect,refresh};window.addEventListener('resize',refresh);
})();
