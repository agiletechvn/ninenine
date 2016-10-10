var page = require('webpage').create(),
    system = require('system');
   
//var image = system.args[1];
//page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36';
//page.settings.resourceTimeout = system.args[2] || 10000;
//page.settings.loadImages = false;


//var address = "http://how-old.net/#results";

//page.onResourceRequested = function(requestData, request) {
//    if ((/http:\/\/.+?\.(?:cs|j)s/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/css'
//            || requestData['Content-Type'] == 'application/x-javascript; charset=utf-8') {
//        //console.log('The url of the request is matching. Aborting: ' + requestData['url']);
//        request.abort();
//    }
//};
//
//page.onResourceError = function(){
//    
//};
//
//
//page.onError = function(){
//    
//};

console.log("hehe");
phantom.exit();

//function captureAjaxResponsesToConsole() {
//  page.evaluate(function() {
//    (function(open) {
//      XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
//        this.addEventListener("readystatechange", function() {
//          if (this.readyState === 4) {             
//            var res={'response':this.responseText, 'url':url};
//            console.log(JSON.stringify(res));           
//          }
//        }, false);
//        open.call(this, method, url, async, user, pass);
//      };
//    })(XMLHttpRequest.prototype.open);
//    return 1;
//  });
//}
//
//page.onConsoleMessage = function (msg) {
//  try{  
//    var res=JSON.parse(msg);
//    if(res.url.indexOf('Analyze?isTest=False') !== -1){
//      console.log(JSON.parse(res.response));
//      phantom.exit();
//    }
//  } catch(e){}
//};
// 
//
//page.open(address, function(status) {
//    if (status === 'success') {
//	//page.render('howold.png');
//	page.uploadFile('input[id=uploadBtn]', image);
//        captureAjaxResponsesToConsole();
//    } else {
//        console.log('Unable to load the address!');
//        phantom.exit();
//    }
//});
