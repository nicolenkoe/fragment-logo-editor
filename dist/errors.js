/* Keep browser/Android diagnostics in the console, not in narrow UI panels. */
(function(root){
 const fallback='Не удалось выполнить действие.';
 function message(error,otherwise=fallback){
  let t=String(error?.message??error??'').replace(/\s+/g,' ').trim();
  if(/taint|cross.origin|cors|getImageData|SecurityError/i.test(t))return 'Нет доступа к фото. Загрузите его заново.';
  if(/quota|no space|мест[ао]/i.test(t))return 'Недостаточно места для сохранения.';
  if(/storage|хранилищ/i.test(t))return 'Хранилище недоступно. Проверьте настройки.';
  if(/шрифт/i.test(t)&&/не удалось|не найден|не загруз|интернет/i.test(t))return 'Шрифт не загрузился. Выберите другой.';
  if(/однотонный фон|неоднородн/i.test(t))return 'Фон неоднородный. Выделите область.';
  if(/Фон и объекты слишком похожи/i.test(t))return 'Фон похож на рисунок. Выделите область.';
  if(/Слишком много мелких деталей/i.test(t))return 'Слишком много деталей. Уменьшите разделение.';
  if(/Выберите один объект/i.test(t))return 'Выберите один объект.';
  if(/Найден один связный объект/i.test(t))return 'Найден один объект. Измените разделение.';
  if(/failed to fetch|network|load failed|abort|timeout|timed out/i.test(t))return 'Нет соединения. Попробуйте ещё раз.';
  if(/failed|exception|TypeError|ReferenceError|SyntaxError|Cannot |undefined|\.java:|at https?:|https?:\/\//i.test(t)||!/[А-Яа-яЁё]/.test(t)||t.length>84)return otherwise;
  return t||otherwise;
 }
 function report(error,otherwise){console.warn('[Фрагмент]',error);return message(error,otherwise)}
 function display(value){const t=String(value?.message??value??'');return typeof value==='object'||/failed|exception|error|taint|cross.origin|getImageData|не удалось|слишком много|фон и объекты/i.test(t)?message(value):t}
 root.FragmentErrors={message,report,display};
 if(typeof module==='object'&&module.exports)module.exports=root.FragmentErrors;
 if(typeof document!=='undefined')document.addEventListener('DOMContentLoaded',()=>{
  for(const id of ['export','save','removeBg','fill','cut','groupSelection','groupLayers','duplicate']){
   const el=document.getElementById(id),fn=el?.onclick;if(!fn)continue;
   el.onclick=function(e){
    try{const result=fn.call(this,e);if(result&&typeof result.catch==='function')result.catch(error=>toast(report(error)));return result}
    catch(error){toast(report(error))}
   };
  }
 });
})(typeof globalThis!=='undefined'?globalThis:this);
