 var Track = (function () {
                var sequence = 100,
                isAnimationSupported = false,
                animationstring = 'animationName',
                keyframeprefix = '',
                domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
                pfx = '',
                elm = document.createElement('div'),
                options = {
                    timeout: 20
                };

            var listenCallbackDict = {};
            var destroyCallbackDict = {};

            if (elm.style.animationName) {
                isAnimationSupported = true;
            }

            if (isAnimationSupported === false) {
                for (var i = 0; i < domPrefixes.length; i++) {
                    if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
                        pfx = domPrefixes[i];
                        animationstring = pfx + 'AnimationName';
                        keyframeprefix = '-' + pfx.toLowerCase() + '-';
                        isAnimationSupported = true;
                        break;
                    }
                }
            }

            // these functions are namespace functions, use for all instance
            function listen(selector, callback) {
                // when destroy, there's no listen too
                // if already create a callbackList, then just add it
                if(listenCallbackDict[selector]){
                    listenCallbackDict[selector].add(callback);
                    return true;
                }
                // create new callback list
                listenCallbackDict[selector] = $.Callbacks();
                listenCallbackDict[selector].add(callback);

                var styleAnimation, animationName = 'insNn' + (sequence++);
                var eventHandler = function (event) {

                    if (event.animationName === animationName || event[animationstring] === animationName) {
                        if (!isTagged(event.target)) {
                            // trigger as if it was an event
                            listenCallbackDict[selector].fire.call(event.target, event);
                        }
                    }
                };

                styleAnimation = document.createElement('style');
                styleAnimation.innerHTML = '@' + keyframeprefix + 'keyframes ' + animationName + ' {  from {  outline: 1px solid transparent  } to {  outline: 0px solid transparent }  }' +
                    "\n" + selector + ' { animation-duration: 0.001s; animation-name: ' + animationName + '; ' +
                    keyframeprefix + 'animation-duration: 0.001s; ' + keyframeprefix + 'animation-name: ' + animationName + '; ' +
                    ' } ';

                document.head.appendChild(styleAnimation);

                var bindAnimationLater = setTimeout(function () {
                    document.addEventListener('animationstart', eventHandler, false);
                    document.addEventListener('MSAnimationStart', eventHandler, false);
                    document.addEventListener('webkitAnimationStart', eventHandler, false);
                    //event support is not consistent with DOM prefixes
                }, options.timeout); //starts listening later to skip elements found on startup. this might need tweaking

                destroyCallbackDict[selector] =  function () {
                    clearTimeout(bindAnimationLater);
                    if (styleAnimation) {
                        document.head.removeChild(styleAnimation);
                        styleAnimation = null;
                    }
                    document.removeEventListener('animationstart', eventHandler);
                    document.removeEventListener('MSAnimationStart', eventHandler);
                    document.removeEventListener('webkitAnimationStart', eventHandler);
                };

                return true;

            }

            function stopListen(selector, callback){
                if(listenCallbackDict[selector]){
                    // remove or empty callback, work like unbind
                    callback 
                        ? listenCallbackDict[selector].remove(callback)
                        : listenCallbackDict[selector].empty();


                    // check empty, whether all callback has been removed
                    if(!listenCallbackDict[selector].has()){
                        // or assign null to it
                        delete listenCallbackDict[selector];
                        // trigger destroy
                        destroyCallbackDict[selector]();
                        delete destroyCallbackDict[selector];
                    }
                }
            }


            function tag(el) {
                el.insNn = true; //bug in V8 causes memory leaks when weird characters are used as field names. I don't want to risk leaking DOM trees so the key is not '-+-' anymore
            }

            function isTagged(el) {
                return (/*options.strictlyNew && */(el.insNn === true));
            }



            function tagAll(e) {
                tag(e);
                e = e.firstChild;
                for (; e; e = e.nextSibling) {
                    if (e !== undefined && e.nodeType === 1) {
                        tagAll(e);
                    }
                }
            }
            
            // this is important for other usage based on animation event
            options.isAnimationSupported = isAnimationSupported;

                if (isAnimationSupported) {

                    //if (options.strictlyNew) {
                    $(function(){
                        tagAll(document.body); //prevents from catching things on show
                    });
                    //}

                    return {
                        options: options,
                        listenNewNode: function (selector, callback) {
                            if(selector.match(/[^{}]/)){ 
                                return listen(selector, callback);
                            }
                            // showing that selector is not allowed
                            return false;
                        },
                        stopListenNewNode: function(selector, callback){
                            if(selector.match(/[^{}]/)){
                                return stopListen(selector, callback);
                            }
                            return false;
                        }
                    };
                } else {
                    //return false;
                    // return fake function, showing that we have nothing to do
                    return {
                        options: options,
                        listenNewNode: $.noop,
                        stopListenNewNode: $.noop
                    };
                }
        })();