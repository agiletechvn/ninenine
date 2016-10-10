var page = require('webpage').create(),system = require('system');
phantom.cookiesEnabled = true;
page.settings.loadImages = true;
page.settings.resourceTimeout = system.args[3] || 10000;
var pageUrl = system.args[1];
var selectorObj = JSON.parse(decodeURIComponent(system.args[2]).replace(/&nbsp;/g, ' '));

// spoof user-agent
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:12.0) Gecko/20100101 Firefox/12.0';


// ready function
var readyFunc = decodeURIComponent(system.args[6]).replace(/&nbsp;/g, ' ');

if (readyFunc) {
    readyFunc = eval('(' + readyFunc + ')');
} else {
    readyFunc = function() {
        return true;
    };
}


// add waitFor method
page.waitFor = function(readyFunc, callback) {
    // check for short-circuit
    if (page.evaluate(readyFunc)) {
            callback(page);
    } else {
        // poll until timeout or success
        var elapsed = 0,
                maxtimeOutMillis = page.settings.resourceTimeout, //< Default Max Timout is 3s
                timeoutId = window.setInterval(function() {
                    if (page.evaluate(readyFunc) || elapsed > maxtimeOutMillis) {
                        window.clearInterval(timeoutId);
                        callback(page);
                    } else {
                        elapsed += 100;
                    }
                }, 100);
    }
};

page.getCookie=function(){
    var ret = '';
    phantom.cookies.forEach(function(cookie){
       if(cookie.domain.indexOf('sixmonth.com') !== -1){
            if(ret){
                ret += ';';
            } 
            ret += cookie.name + '=' + cookie.value;
        }
    });
    return ret;
};

// just for debug
page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg);
};

page.onResourceError = function(resourceError) {
    page.reason = resourceError.errorString;
    page.reason_url = resourceError.url;
};

// these thing should be logged on file, now just for testing only
page.onUrlChanged = function onUrlChanged(url) {
    phantom.crawlerUrl = url;
    console.log('url changed to: ' + url);
};

page.open(pageUrl,function(status){
    if (status !== 'success') {
        console.log(
            "Error opening url \"" + page.reason_url
            + "\": " + page.reason
        );
        phantom.exit(1);
//        console.log('Load status :' + status);
//        phantom.exit();
    } else {
        // eventually, we can't wait more than resourceTimeout when something recursive here 
        // like looping forever
        // this core, will never stay in js too long, it has to jump out here and tell php script
        // what happened!!!
        setTimeout(function(){
            console.log('Too long!!!');
            phantom.exit();     
        },page.settings.resourceTimeout+3000);
    }
});

// error in javascript can cause it to stop loading
page.onLoadFinished = function() {
  
    // for the process to be correct, we don't include jquery by default
    // but you can include jquery in your process anytime, because you can access page
    //page.injectJs('lib/jquery.min.js');
    // for captcha detector, don't worry, we don't run this many times

    //console.log(page.getCookie());
    var logged_func = eval('(' + selectorObj.logged + ')');
    var user = page.evaluate(function(func, phantom, page){
        return func(phantom, page);
    },logged_func, phantom, page);

    if (!user) {
        page.injectJs('lib/neural.js');
        page.injectJs('lib/recognize.js');
        console.log('wait for login ...');
        page.waitFor(readyFunc,function(page){

          var login_func = eval('(' + selectorObj.login + ')');
          console.log('forcing login...');
          // after this action, the whole page will be reload
          // it is like we run argument.callee once more time
          var ret = page.evaluate(function(func, phantom, page){
              return func(phantom, page);
          }, login_func, phantom, page);
          if(ret === false){
                phantom.exit();        
          }

        });
    } else {  
      console.log('already logged in...');
      //console.log(phantom.crawlerUrl);
      var ret = {crawlerUrl:phantom.crawlerUrl,cookies:phantom.cookies};
      // if you store the cookie into file, you don't have to use this cookie too
      // but we still want to return to you so you can update into database
      // it will be better to store in file, to run faster and easier to maintain by filetime
      console.log(JSON.stringify(ret));
      phantom.exit();
    }

};

