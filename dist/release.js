(function(root){
'use strict';
const CURRENT={version:'1.3.0',versionCode:8,channel:'testing'};
const MANIFEST_URL='https://raw.githubusercontent.com/nicolenkoe/fragment-logo-editor/gh-pages/versions.json';
function compare(a,b){const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++){const d=(x[i]||0)-(y[i]||0);if(d)return Math.sign(d)}return 0}
function trustedDownload(value,extension){try{const u=new URL(value);return u.protocol==='https:'&&u.hostname==='raw.githubusercontent.com'&&!u.username&&!u.password&&!u.port&&/^\/nicolenkoe\/fragment-logo-editor\/(gh-pages|[a-f0-9]{7,40})\/downloads\/[a-zA-Z0-9_./-]+$/.test(u.pathname)&&u.pathname.endsWith(extension)?u.href:null}catch{return null}}
function validate(data){if(data?.schema!==1||!Array.isArray(data.releases)||data.releases.length>100)throw Error('Не удалось прочитать список версий.');const codes=new Set();const releases=data.releases.map(r=>{if(!/^\d+\.\d+(\.\d+)?$/.test(r.version)||!Number.isSafeInteger(r.versionCode)||r.versionCode<1||codes.has(r.versionCode)||!['stable','testing'].includes(r.channel)||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||!Array.isArray(r.notes)||!r.notes.every(n=>typeof n==='string'&&n.length<=500))throw Error('Некорректная запись версии.');codes.add(r.versionCode);const apk=trustedDownload(r.apk,'.apk'),source=trustedDownload(r.source,'.zip');if(!apk||!source)throw Error('Некорректная ссылка на скачивание.');return{...r,apk,source}});return{schema:1,releases:releases.sort((a,b)=>compare(b.version,a.version)||b.versionCode-a.versionCode)}}
function choose(data,current=CURRENT,testing=false){return validate(data).releases.find(r=>(testing||r.channel==='stable')&&(compare(r.version,current.version)>0||compare(r.version,current.version)===0&&r.versionCode>current.versionCode))||null}
const api={CURRENT,MANIFEST_URL,compare,validate,choose,trustedDownload};if(typeof module!=='undefined')module.exports=api;else root.FragmentRelease=api;
})(globalThis);
