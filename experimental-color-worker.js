importScripts('experimental-color-segment.js?v=color-7');
onmessage=e=>{try{const {token,image,options}=e.data,result=segmentObjects(image,options);postMessage({token,result},[result.labels.buffer])}catch(error){postMessage({token:e.data.token,error:error.message})}};
