var page = require('webpage').create(),
    system = require('system');


page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36';
page.settings.resourceTimeout = system.args[2] || 10000;
page.settings.loadImages = false;
var address = "http://how-dude.me/";


page.onResourceRequested = function(requestData, request) {
    if (requestData['url'].indexOf('facebook.com') !== -1 || (/http:\/\/.+?\.css/gi).test(requestData['url']) || requestData['Content-Type'] == 'text/css') {
        //console.log('The url of the request is matching. Aborting: ' + requestData['url']);
        request.abort();
    }
};

page.onResourceError = function(){
    
};


page.onError = function(){
    
};

function captureAjaxResponsesToConsole() {
  page.evaluate(function() {
    (function(open) {
      XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        this.addEventListener("readystatechange", function() {
          //if (this.readyState === 4) {             
            var res={'response':this.responseText, 'url':url};
            console.log(JSON.stringify(res));           
          //}
        }, false);
        open.call(this, method, url, async, user, pass);
      };
    })(XMLHttpRequest.prototype.open);
    return 1;
  });
}

page.onConsoleMessage = function (msg) {

      console.log(msg);

};
 

page.open(address, function(status) {
    if (status === 'success') {

	//page.render('howold.png');
	//
        //captureAjaxResponsesToConsole();

        
        page.uploadFile('input[id=imageFormInput]', '/Users/thanhtu/Dropbox/ninenine/apps/lib/crawler/bin/tam.jpg');
        page.evaluate(function() {
            $('#imageFormInput').change();
        });
        setTimeout(function(){
            console.log('done');
            page.render('howdude.png');
             phantom.exit();
        }, 10000);

    } else {
        console.log('Unable to load the address!');
        phantom.exit();
    }
});
