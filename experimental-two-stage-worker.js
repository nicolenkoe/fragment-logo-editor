importScripts('experimental-two-stage-segment.js?v=two-2');
onmessage=e=>{try{const {token,image,options}=e.data,result=segmentObjects(image,options);postMessage({token,result},[result.labels.buffer])}catch(error){postMessage({token:e.data.token,error:error.message})}};
