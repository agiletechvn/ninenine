
App = {
    // process on header only
    selector: '#header'
};

function handleImageLoaded(selector, callbackItem, callback) {
    // image handle
    var t;
    var list = typeof selector === 'string' ? $(selector) : selector;
    list.find('img').each(function () {
        this.src = this.src;
        this.onerror = function () {
            var item = $(this);
            item.attr('no-image') !== undefined
                    ? item.attr('src', item.attr('no-image') || 'themes/admin/img/no-image.gif')
                    : callbackItem(item);
        };

        // resize, prevent overload
        this.onload = function () {
            clearTimeout(t);
            t = setTimeout(function () {
                $(selector).resize();
            }, 200);
        };

    });
    if (callback)
        callback();
}


App.oauthpopup = function (options) {
    options.windowName = options.windowName || 'ConnectWithOAuth';
    options.windowOptions = options.windowOptions || 'location=0,status=0,width=' + options.width + ',height=' + options.height + ',scrollbars=1';
    options.callback = options.callback || function () {
        window.location.reload();
    };
    var that = this;
    that._oauthWindow = window.open(options.path, options.windowName, options.windowOptions);
    that._oauthInterval = window.setInterval(function () {
        if (that._oauthWindow.closed) {
            window.clearInterval(that._oauthInterval);
            options.callback();
        }
    }, 1000);
};



$(function () {

    App.lang = $('html').attr('lang');

    //var width = Math.max(Math.floor($('#main').first().width()/4)-20, 200);
    // Prepare layout options.
    var options = {
        autoResize: true, // This will auto-update the layout when the browser window is resized.
        container: $('#content'), // Optional, used for some extra CSS styling
        offset: 10, // Optional, the distance between grid items
        itemWidth: 300 // Optional, the width of a grid item
    };

    var handler = $('#tiles li');

    handleImageLoaded('#tiles', function (item) {
        item.closest('.view').remove();
    }, function () {
        handler.wookmark(options);
    });


    $('#tiles').infinitescroll({
        navSelector: '#page-nav', // selector for the paged navigation
        nextSelector: '#page-nav a', // selector for the NEXT link (to page 2)
        itemSelector: 'li', // selector for all items you'll retrieve
        loading: {
            finishedMsg: '...',
            msgText: '',
            img: 'themes/admin/assets/pre-loader/Searching.gif'
        }
    },
    // trigger Masonry as a callback
    function (newElements) {
        // hide new items while they are loading
        var newElems = $(newElements).css({opacity: 0});
        // ensure that images load before adding to masonry layout

        newElems.appendTo('#tiles');
        // show elems now they're ready
        newElems.animate({opacity: 1});
        $('#footer').hide();
        handleImageLoaded(newElems, function (item) {
            item.closest('.view').remove();
        }, function () {
            $('#tiles li').wookmark(options);
            $('#footer').show();
        });

    });


    // for other
    handleImageLoaded('#header', function (item) {
        item.remove();
    });

    $('#facebook_login').click(function (e) {
        App.oauthpopup({
            path: 'account/facebooklogin',
            width: 600,
            height: 300,
            callback: function () {
                window.location.reload();
            }
        });
        e.preventDefault();
        return false;
    });

    $('#google_login').click(function (e) {
        App.oauthpopup({
            path: 'account/googlelogin',
            width: 600,
            height: 300,
            callback: function () {
                window.location.reload();
            }
        });
        e.preventDefault();
        return false;
    });

});

