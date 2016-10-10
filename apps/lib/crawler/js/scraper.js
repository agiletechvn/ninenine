var page = require('webpage').create(), system = require('system');
page.settings.resourceTimeout = system.args[3] || 10000;
// cookie is fast to send, so we do not allow disable this
phantom.cookiesEnabled = true;
var pageUrl = system.args[1];

// spoof user-agent, without this, may be you are conceived as a bot :D
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36';

var selectorObj = JSON.parse(decodeURIComponent(system.args[2]).replace(/&nbsp;/g, ' '));

console.log(pageUrl);

// ignore other_domain_script
if (system.args[4] === 'true') {
    page.onResourceRequested = function(requestData, request) {
        if (requestData['url'] !== pageUrl) {
            if (!(/http:\/\/.+?\.js$/gi).test(requestData['url'])) {
                try {
                    request.abort();
                } catch (e) {

                }
            }
        }
    };
}

page.onError = function(msg, trace) {
                        
    var msgStack = ['ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
        });
    }
    // uncomment to log into the console 
    if(!page.msgStack){
        page.msgStack = [];
    }
    page.msgStack.push(msgStack.join('\n'));
};


page.onResourceError = function(resourceError) {
    page.reason = resourceError.errorString;
    page.reason_url = resourceError.url;
};

// add custom cookie
var cookies = JSON.parse(decodeURIComponent(system.args[5]).replace(/&nbsp;/g, ' '))
if (cookies) {
    if (cookies.length) {
        cookies.forEach(function(cookie) {
            phantom.addCookie(cookie);
        });
    } else {
        // single cookies
        phantom.addCookie(cookies);
    }
}

// ready function
var readyFunc = decodeURIComponent(system.args[6]).replace(/&nbsp;/g, ' ');

if (readyFunc) {
    readyFunc = eval('(' + readyFunc + ')');
} else {
    readyFunc = function() {
        return true;
    };
}


// js to include
var jsList = (system.args[7]||'').split(',');
// add waitFor method
page.waitFor = function(readyFunc, callback) {
    // check for short-circuit
    if (page.evaluate(readyFunc)) {
            callback(page, false);
    } else {
        // poll until timeout or success
        var elapsed = 0,
                maxtimeOutMillis = page.settings.resourceTimeout, //< Default Max Timout is 3s
                timeoutId = window.setInterval(function() {
                    if (page.evaluate(readyFunc) || elapsed > maxtimeOutMillis) {
                        var timeout = elapsed > maxtimeOutMillis;
                        window.clearInterval(timeoutId);
                        callback(page, timeout);
                    } else {
                        elapsed += 100;
                    }
                }, 100);
    }
};

var sentType = system.args[8]||'GET';
var sentData = decodeURIComponent(system.args[9]||'');

page.open(pageUrl, sentType, sentData, function(status) {
    if (status === 'success') {
        // javascript only run on this clousure to manipulate html document
        // use current jquery
        page.injectJs('lib/jquery.min.js');
        jsList.forEach(function(js){
            page.injectJs(js);
        });

        // remember page.evaluate is clousure
        // wait for ready :D
        page.waitFor(readyFunc, function(page, timeout) {
            
            // now ready :D
             var ret = page.evaluate(function(config, phantom, page, page_timeout) {
                // make clousure
                var jQuery_2_1_0 = jQuery.noConflict(true);
                
                return (function($) {
                    
                    var result = {};
                    
                    // define extract function
                    var extractFunc = function($this, extractItem) {

                        var ret = null;
                        try {
                            if (extractItem.method) {
                                var method = $.trim(extractItem.method);
                                if (method.substr(0, 'function'.length) === 'function') {
                                    // fast check instead of indexOf function... ?
                                    var func = eval('(' + method + ')');
                                    // for better access without need to use $() again
                                    ret = func.call($this[0], $this, phantom, page);

                                } else {
                                    ret = $this[method]();
                                }
                            } else if (extractItem.attr) {
                                var attr = $.trim(extractItem.attr);
                                if (attr === 'src') {
                                    ret = $this[0].src;
                                } else if (attr === 'href') {
                                    ret = $this[0].href;
                                } else {
                                    ret = $this.attr(attr);
                                }
                            }
                            if (typeof ret === 'string') {
                                ret = $.trim(ret);
                            }
                        } catch (e) {
                            if (!result.errors) {
                                result.errors = {};
                            }
                            // we only collect the last error, and some key
                            // that's enough for use :D
                            result.errors[extractItem.selector] = {msg: e.message, stack: e.stack};
                        }

                        // even null we don't return empty string for php to process better :D
                        return ret;
                    };
                    if (config.length) {
                        // master scrape
                        result.articles = [];
                        result.categories = [];
            
                        config.forEach(function(item) {
                            var itemEl = item.item || document;
                            $(itemEl).each(function() {
                                var el = $(this);
                                var retObj = null;
                                $.each(item.extract, function(key) {
                                    if(this.selector === undefined){
                                        if(!this.method && !this.attr){
                                            this.method = this;
                                        }
                                        this.selector = document;
                                    }
                                    var $this = el.find(this.selector);
                                    // get from current item
                                    if($this.length === 0){
                                        $this = el;
                                    }
                                    
                                    var ret = extractFunc($this, this);

                                    if (this.require && !ret) {
                                        retObj = null;
                                        return false;
                                    } else {
                                        if (!retObj) {
                                            retObj = {};
                                        }
                                        retObj[key] = ret;
                                    }
                                });

                                if (retObj) {
                                    result.articles.push(retObj);
                                }
                            });

                            $(item.category).each(function() {
                                var item = this;
                                if (item.tagName !== 'A') {
                                    item = $(this).find('a').first()[0];
                                }
                                if (item) {
                                    var link = $.trim(item.href || '');
                                    if (link
                                            && /^(?:javascript|mailto)/.test(link) === false
                                            && link.charAt(0) !== "#") {
                                        result.categories.push(link);
                                    }
                                }
                            });
                        });
                    } else {
                        result.article = {};
                        $.each(config.extract, function(key) {
                            if(typeof this === 'string'){
                                this = {method: this};
                            }
                            if(this.selector === undefined){
                                this.selector = document;
                            }
                            var $this = config.item ? $(config.item).find(this.selector) : $(this.selector);
                            var ret = extractFunc($this, this);
                            result.article[key] = ret;
                        });
                    }
                    // show error timeout, even we get data in the end, but may be it is not correct :D 
                    if(page_timeout){
                        if (!result.errors) {
                            result.errors = {};
                        }
                        result.errors.timeout = 'Timeout exceeds ' + page.settings.resourceTimeout;
                    }
                    
                    if(page.msgStack){
                        if (!result.errors){
                            result.errors = {};                            
                        }
                        result.errors.pageError = page.msgStack;
                    }
                    
                    return result;
                })(jQuery_2_1_0);

            }, selectorObj, phantom, page, timeout);
  
            // print to console
            console.log(JSON.stringify(ret));
            phantom.exit(0);
            
        });

    } else {
        console.log(
            "Error opening url \"" + page.reason_url
            + "\": " + page.reason
        );
        phantom.exit(1);
    }


});

