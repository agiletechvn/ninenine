/* xlsx.js (C) 2013-2014 SheetJS -- http://sheetjs.com */
/* uncomment the next line for encoding support */
//importScripts('dist/cpexcel.js');
importScripts('xlsx/jszip.js');
importScripts('xlsx/xlsx.js');
/* uncomment the next line for ODS support */
importScripts('xlsx/ods.js');
postMessage({t:"ready"});

onmessage = function (oEvent) {
  var v;
  try {
    v = XLSX.read(oEvent.data.d, {type: 'binary'});
  } catch(e) { postMessage({t:"e",d:e.stack||e}); }
  postMessage({t:"xlsx", d:JSON.stringify(v)});
};