/*!
 * Ninenine core
 *
 * Copyright 2013, tubackkhoa@gmail.com
 * Released under the MIT License.
 */

function errorMessage(e) {
    // show stack trace of error :v
    var msg = e instanceof TypeError ? '<pre>' + e.stack + '</pre>' : '<p>' + e + '</p>';
    $('#main-message').html('<div class="alert alert-block alert-error fade in">'
            + '<button data-dismiss="alert" class="close" type="button">×</button>' + msg + '</div>');
    App.scrollTo();
//    if (console.log)
//        console.log(e.stack);
}

function handleIntro() {
    // show help intro
}

var App;

(function ($) {
    // this script must have run after bootstrap is loaded
    // fixed for ui type CKeditor then save status
    // you can use Modal.prototype but should use extension of jQuery for better understanding
    $.fn.modal.Constructor.prototype.enforceFocus = function () {
        var modal_this = this;
        $(document).on('focusin.modal', function (e) {
            if (modal_this.$element[0] !== e.target && !modal_this.$element.has(e.target).length
                    && !$(e.target.parentNode).hasClass('cke_dialog_ui_input_select')
                    && !$(e.target.parentNode).hasClass('cke_dialog_ui_input_text')) {
                modal_this.$element.focus();
            }
        });
    };

    // fix deprecated
    if ($.ui && !$.ui.isOverAxis)
        $.ui.isOverAxis = function (x, reference, size) {
            return (x > reference) && (x < (reference + size));
        };

    if (!$.browser) {
        var matched = (function (ua) {
            ua = ua.toLowerCase();

            var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                    /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                    /(msie) ([\w.]+)/.exec(ua) ||
                    ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                    [];

            return {
                browser: match[ 1 ] || "",
                version: match[ 2 ] || "0"
            };
        })(navigator.userAgent), browser = {};

        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
        }

        // Chrome is Webkit, but Webkit is also Safari.
        if (browser.chrome) {
            browser.webkit = true;
        } else if (browser.webkit) {
            browser.safari = true;
        }

        $.browser = browser;
    }

    // support for lazy loading gmap
    var gmapCallbacks = $.Callbacks();

    $.gmapReady = function (callback) {
        if (window.google && window.google.maps) {
            // gmap is ready
            callback();
        } else {
            // add to callback and wait
            gmapCallbacks.add(callback);
        }
    };

    // any one can fire this
    window.gmapReadyFire = function () {
        // fire then release all objects
        // don't try to call two times
        gmapCallbacks.fire();
        gmapCallbacks.empty();
    };

    App = function () {

        var isMainPage = false;
        //var isMapPage = false;
        var isIE8 = false;

        // this is handle object, you can extend it to add more ui
        var Func = {
            // can be plugin="truncate", or handle all item when init page
            handleTruncate: function (selector) {

                var defaults = {
                    size: 240,
                    omission: '...',
                    ignore: true
                },
                options = $.extend(defaults, selector.data());

                var textDefault = selector.text(),
                        textTruncated,
                        regex = /[!-\/:-@\[-`{-~]$/;

                if (textDefault.length > options.size) {
                    textTruncated = $.trim(textDefault).
                            substring(0, options.size).
                            split(' ').
                            slice(0, -1).
                            join(' ');
                    if (options.ignore) {
                        textTruncated = textTruncated.replace(regex, '');
                    }

                    selector.text(textTruncated + options.omission);
                }

            },
            handleKnob: function (selector) {
                if (!$().knob) {
                    return;
                }

                selector.knob(selector.data());
            },
            handleCalendar: function (selector) {

                App.loadCss($('<link rel="stylesheet" type="text/css" href="themes/admin/assets/fullcalendar/fullcalendar.css" />'));
                App.loadJs($('<script src="themes/admin/assets/fullcalendar/lib/moment.min.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/fullcalendar/fullcalendar.min.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/fullcalendar/lang/' + App.lang + '.js"></script>'));

                if (!$().fullCalendar) {
                    return;
                }

                var h = {};

                if ($(window).width() <= 320) {
                    h = {
                        left: 'title, prev,next',
                        center: '',
                        right: 'today,month,agendaWeek,agendaDay'
                    };
                } else {
                    h = {
                        left: 'title',
                        center: '',
                        right: 'prev,next,today,month,agendaWeek,agendaDay'
                    };
                }

                var data = selector.data();


                selector.bind('beforeDestroy', function () {
                    selector.fullCalendar('destroy');
                });

                $.get(data.url, function (events) {
                    selector.fullCalendar($.extend({
                        header: h,
                        editable: true,
                        events: events,
                        selectable: true,
                        select: function () {
                            //console.log(arguments);
                            selector.triggerHandler('calendarEventSelect', arguments);
                        },
                        eventClick: function (event, element) {
                            selector.triggerHandler('calendarEventClick', [event, element]);
                        },
                        eventRender: function (event, element) {
                            selector.triggerHandler('calendarEventRender', [event, element]);
                        },
                        eventAfterRender: function (event, element) {
                            selector.triggerHandler('calendarEventAfterRender', [event, element]);
                        },
                        eventDrop: function (event, revertFunc, jsEvent, ui, view) {
                            selector.triggerHandler('calendarEventChanged', [event, revertFunc, jsEvent, ui, view]);
                        },
                        eventResize: function (event, revertFunc, jsEvent, ui, view) {
                            selector.triggerHandler('calendarEventChanged', [event, revertFunc, jsEvent, ui, view]);
                        }
                    }, data));
                });
            },
            handleSlider: function (selector) {

                App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/jslider/css/jslider.css" type="text/css" />'));
                App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/jslider/css/jslider.blue.css" type="text/css" />'));
                App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/jslider/css/jslider.plastic.css" type="text/css" />'));
                App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/jslider/css/jslider.round.css" type="text/css" />'));
                App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/jslider/css/jslider.round.plastic.css" type="text/css" />'));

                App.loadJs($('<script src="themes/admin/js/jshashtable-2.1_src.js"></script>'));
                App.loadJs($('<script src="themes/admin/js/jquery.numberformatter-1.2.3.js"></script>'));
                App.loadJs($('<script src="themes/admin/js/jquery.pulsate.min.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/jslider/js/draggable-0.1.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/jslider/js/jquery.dependClass-0.1.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/jslider/js/jquery.slider.js?v=1.0.2"></script>'));

                if (!$().slider) {
                    return;
                }

                var data = selector.data();


                // remember that triggerHandler doesn't return jQuery
                selector.slider($.extend({
                    onstatechange: function (value) {
                        selector.triggerHandler('onStateChange', [value]);
                    },
                    callback: function (value) {
                        selector.triggerHandler('callback', [value]);
                    },
                    timelineremove: function (value, el) {
                        selector.triggerHandler('timelineRemove', [value, el]);
                    }
                }, data));

                // this control use event attach only, so destroy html is enough
                selector.bind('windowResize', function () {
                    // update slider size
                    selector.slider().onresize();
                });
            },
            handleClockfaceTimePicker: function (selector) {

                if (!$().clockface) {
                    return;
                }

                var clockface = selector.clockface({
                    format: 'HH:mm',
                    trigger: 'manual'
                }).find('.toggle-btn').click(function (e) {
                    e.stopPropagation();
                    clockface.clockface('toggle');
                });

            },
            handleSortable: function (selector) {
                if (!$().sortable) {
                    return;
                }
                selector.find(".sortable").sortable($.extend({
                    connectWith: '.sortable',
                    iframeFix: false,
                    items: 'div.widget',
                    opacity: 0.8,
                    helper: 'original',
                    revert: true,
                    forceHelperSize: true,
                    placeholder: 'sortable-box-placeholder round-all',
                    forcePlaceholderSize: true,
                    tolerance: 'pointer'
                }, selector.data()));

            },
            handleMainMenu: function (selector) {
                $('#sidebar .has-sub > a').click(function () {
                    var last = $('#sidebar').find('.has-sub.open');
                    last.removeClass("open");
                    last.find('.arrow').removeClass("open");
                    last.find('.sub').slideUp(200);
                    var sub = $(this).next();
                    if (sub.is(":visible")) {
                        $(this).find('.arrow').removeClass("open").end()
                                .parent().removeClass("open");
                        sub.slideUp(200);
                    } else {
                        $(this).find('.arrow').addClass("open").end()
                                .parent().addClass("open");
                        sub.slideDown(200);
                    }
                }).eq(0).click();
            },
            handleWidgetTool: function (selector) {

                var opt = selector.data();
                opt.timeout = opt.timeout || 2000;

                selector.find('.tools .icon-remove').click(function () {
                    selector.fadeOut();
                });

                selector.find('.tools .icon-refresh').click(function () {
                    App.blockUI(selector);
                    selector.addClass('refreshing');
                    var elapsed = 0;
                    var t = setInterval(function () {
                        elapsed += 100;
                        // when elapsed is exceed 2 seconds, or refreshing done - no class refreshing
                        // we stop blockui, then clear interval
                        if (elapsed >= opt.timeout || !selector.hasClass('refreshing')) {
                            selector.removeClass('refreshing');
                            App.unblockUI(selector);
                            clearInterval(t);
                        }
                    }, 100);
                });
                // slide body content of widget
                selector.find('.tools .icon-chevron-down, .tools .icon-chevron-up').click(function () {
                    var el = selector.children(".widget-body");
                    if ($(this).hasClass("icon-chevron-down")) {
                        $(this).removeClass("icon-chevron-down").addClass("icon-chevron-up");
                        el.slideUp(200);
                    } else {
                        $(this).removeClass("icon-chevron-up").addClass("icon-chevron-down");
                        el.slideDown(200);
                    }
                });
            },
            handleChart: function (selector) {

                // load lib for this ui, these elements will be appened to head, then destroy later
                App.loadJs($('<script src="themes/admin/assets/jquery-knob/js/jquery.knob.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/flot/jquery.flot.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/flot/jquery.flot.resize.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/flot/jquery.flot.pie.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/flot/jquery.flot.stack.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/flot/jquery.flot.crosshair.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/flot/jquery.flot.tooltip_0.4.3.min.js"></script>'));

                // always update to newest
                if (!$().plot) {
                    return;
                }

                // style chart with no border for flat design
                var options = $.extend({
                    series: {
                        shadowSize: 1/*,
                         lines: { 
                         show: true,
                         },
                         points: { 
                         show: true 
                         },
                         pie: {
                         show: true
                         }*/
                    },
                    grid: {
                        borderWidth: 0
                    }
                }, selector.data());

                // also access: selector.data("plot")
                // update like this
                //plot.setData(data);
                //plot.draw();
                if (options.url) {
                    //server load
                    $.get(options.url, function (data) {
                        selector.plot(data, options);
                    });
                } else if (options.value) {
                    selector.plot(options.value, options);
                }

                //selector.bind("plothover", function (event, pos, item) {});
            },
            handleFancyBox: function (selector) {


                App.loadCss($('<link rel="stylesheet" type="text/css" href="themes/admin/assets/fancybox/source/jquery.fancybox.css" />'));
                App.loadJs($('<script src="themes/admin/assets/fancybox/source/jquery.fancybox.pack.js"></script>'));

                if (!$().fancybox) {
                    return;
                }

                selector.find('.fancybox-button').fancybox({
                    groupAttr: 'data-rel',
                    prevEffect: 'none',
                    nextEffect: 'none',
                    closeBtn: true,
                    helpers: {
                        title: {
                            type: 'inside'
                        }
                    }
                });

            },
            handleLoginForm: function (selector) {
                $('#forget-password').click(function () {
                    $('#loginform').hide();
                    $('#forgotform').show(200);
                });

                $('#forget-btn').click(function () {
                    var data = $('#forgotform').serialize();
                    $.post('admin/account/forget', data, function () {
                        $('#loginform').slideDown(200);
                        $('#forgotform').slideUp(200);
                    });
                });
            },
            handleFixInputPlaceholderForIE: function (selector) {
                //fix html5 placeholder attribute for ie7 & ie8
                if ($.browser.msie && $.browser.version.substr(0, 1) <= 9) { // ie7&ie8
                    $('input[placeholder], textarea[placeholder]', selector).each(function () {

                        var input = $(this);

                        input.val(input.attr('placeholder'));

                        input.focus(function () {
                            if (input.val() === input.attr('placeholder')) {
                                input.val('');
                            }
                        }).blur(function () {
                            if (input.val() === '' || input.val() === input.attr('placeholder')) {
                                input.val(input.attr('placeholder'));
                            }
                        });
                    });
                }
            },
            handleColorChooser: function () {
                var scrollHeight = '25px';
                jQuery('#color-chooser').click(function () {
                    if ($(this).attr("opened") && !$(this).attr("opening") && !$(this).attr("closing")) {
                        $(this).removeAttr("opened");
                        $(this).attr("closing", "1");

                        $("#color-chooser").css("overflow", "hidden").animate({
                            width: '20px',
                            height: '22px',
                            'padding-top': '3px'
                        }, {
                            complete: function () {
                                $(this).removeAttr("closing");
                                $("#color-chooser .settings").hide();
                            }
                        });
                    } else if (!$(this).attr("closing") && !$(this).attr("opening")) {
                        $(this).attr("opening", "1");
                        $("#color-chooser").css("overflow", "visible").animate({
                            width: '125px',
                            height: scrollHeight,
                            'padding-top': '3px'
                        }, {
                            complete: function () {
                                $(this).removeAttr("opening");
                                $(this).attr("opened", 1);
                            }
                        });
                        $("#color-chooser .settings").show();
                    }
                });

                var setColor = function (color) {
                    var href = $('#style_color').attr('href');
                    // need synchronous ?
                    $.post('admin/account/updateprofile', {theme: color}, function () {
                        $('#style_color').attr('href', href.replace(/style_.*$/, 'style_' + color + '.css'));
                    });
                };

                $('#color-chooser .colors span').click(function () {
                    var color = $(this).attr("data-style");
                    setColor(color);
                });
                // no need to bind event on document for slower, unless too many item :D
                $('#color-chooser .layout input').change(function () {
                    setLayout();
                });



            },
            handlePulsate: function (selector) {

                App.loadJs($('<script src="themes/admin/js/jquery.pulsate.min.js"></script>'));

                if (!$().pulsate) {
                    return;
                }

                if (isIE8 === true) {
                    return; // pulsate plugin does not support IE8 and below
                }

                var opt = $.extend({
                    color: "#fdbe41"//,
                            //reach: 50,
                            //repeat: 10,
                            //speed: 100,
                            //glow: true,
                            //onHover: true
                }, selector.data());

                if (opt.onHover === false) {
                    selector.click(function () {
                        selector.pulsate(opt);
                    });
                } else {
                    selector.pulsate(opt);
                }

            },
            handlePeity: function (selector) {

                App.loadJs($('<script src="themes/admin/js/jquery.peity.min.js"></script>'));

                if (!$().peity) {
                    return;
                }

                if ($.browser.msie && $.browser.version.substr(0, 2) <= 8) { // ie7&ie8
                    return;
                }
                var opt = selector.data();
                selector.peity((opt.shape || "line"), $.extend({
                    height: 20,
                    width: 50,
                    colour: "#d12610",
                    strokeColour: "#666"
                }, opt)).show();
            },
            handleDeviceWidth: function (selector) {
                function fixWidth(e, update) {
                    if (e && e.isTrigger && update !== true) {
                        // this is trigger by other ui to force update layout
                        return;
                    }

                    var winHeight = $(window).height();
                    var winWidth = $(window).width();
                    // 2 for tablet and small desktops, 1 for desktop and 3 for mobiles
                    var device = App.deviceType = (winWidth < 1125 && winWidth > 767) ? 2 : (winWidth < 767 ? 3 : 1);


                    $(".responsive").each(function () {
                        var item = $(this);
                        var forPhone = item.attr('data-phone');
                        var forDesktop = item.attr('data-desktop');
                        var forTablet = item.attr('data-tablet');

                        if (device === 2) {
                            item.removeClass(forDesktop)
                                    .removeClass(forPhone)
                                    .addClass(forTablet);
                        } else if (device === 3) {
                            item.removeClass(forDesktop)
                                    .removeClass(forTablet)
                                    .addClass(forPhone);
                        } else {
                            item.removeClass(forTablet)
                                    .removeClass(forPhone)
                                    .addClass(forDesktop);
                        }
                    });


                    // change main message padding left for correct position
                    if ($(App.selector).length)
                        $('#main-message').css('padding-left', $(App.selector).offset().left + 10).show();

                    // if mainpage? for all sidebar
                    var sidebarMenu = $('#sidebar ul.sidebar-menu ');
                    var sidebarMarginTop = 50;
                    // padding toggle
                    var sidebarHeight = winHeight - $('#header').outerHeight() - $('#footer').outerHeight()
                            - sidebarMarginTop;
                    // calculate height like a boss :D
                    //sidebarHeight = (Math.floor(sidebarHeight / sidebarItemHeight)-1) * sidebarItemHeight;
                    // assign height
                    sidebarMenu.height(sidebarHeight);
                    var sidebarMenuParent = sidebarMenu.parent('.slimScrollDiv');
                    if (sidebarMenuParent.length) {
                        sidebarMenuParent.height(sidebarHeight);
                    } else {
                        App.Func.handleScroller(sidebarMenu);
                        // wrap for parent with margin-top equal a sidebar Item Height
                        sidebarMenu.parent('.slimScrollDiv').css('margin-top', sidebarMarginTop);
                    }
                }

                fixWidth();

                var running = false;
                $(window).resize(function (evt, update) {
                    // trigger resize for all ui type
                    App._uiList.forEach(function (item) {
                        item.triggerHandler('windowResize', evt);
                    });

                    // update for other things consume more time
                    if (running === false) {
                        running = true;

                        setTimeout(function () {

                            // fix layout width
                            fixWidth(evt, update);

                            //finish
                            running = false;
                        }, 200); // wait for 200ms on resize event, reduce cpu processing          
                    }
                });
            },
            // these things are too simple to be widgets
            handleTooltip: function (selector) {
                selector.tooltip();
            },
            handlePopover: function (selector) {
                selector.popover();
            },
            handleChosenSelect: function (selector) {

                App.loadCss($('<link rel="stylesheet" type="text/css" href="themes/admin/assets/chosen-bootstrap/chosen/chosen.css?v=1.3.8" />'));
                App.loadJs($('<script src="themes/admin/assets/chosen-bootstrap/chosen/chosen.jquery.js?v=1.4.6"></script>'));

                if (!$().chosen) {
                    return;
                }
                var opt = $.extend({
                    allow_single_deselect: selector.attr('deselect') === '1', //? true : false//,
                    disable_search_threshold: 10 // more than 10 to show search
                            //width: '100%'
                }, selector.data());

                // some ui require html to be fully rendered
                //setTimeout(function() {
                selector.chosen(opt);
                var chosen = selector.data('chosen');

                // update chosen select, with 100% will not be affected
                selector.bind('windowResize', function () {
                    // update chosen select size
                    chosen.update_dropdown_position();
                    //selector.trigger("liszt:updated");
                }).bind('beforeDestroy', function () {
                    chosen.destroy();
                    delete chosen;
                });

                // ajax based
                if (opt.url) {
                    App.loadJs($('<script src="themes/admin/assets/chosen-bootstrap/chosen/extend/ajax-chosen.js?v=1.0.2"></script>'));
                    // data is {key:key,value:value} or items[{key,value},]
                    selector.ajaxChosen(opt, function (data) {
                        // make some modifications here
                        return data;
                    });
                }


                // check it it is sortable
                if (selector.attr('multiple') && selector.attr('data-sortable')) {
                    App.loadJs($('<script src="themes/admin/assets/chosen-bootstrap/chosen/extend/sortable-chosen.js?v=1.0.2"></script>'));
                    // data is {key:key,value:value} or items[{key,value},]
                    selector.sortableChosen(opt);

                }

                //});
            },
            handleUniform: function (selector) {
                if (!$().uniform) {
                    return;
                }
                var test = $("input[type=checkbox]:not(.toggle), input[type=radio]:not(.toggle)", selector);
                if (test) {
                    test.uniform({radioClass: 'radio radio-fix'});
                }
            },
            /* FILEUPLOAD DATA-API
             * ================== */

            handleFileupload: function (selector) {

                App.loadCss($('<link href="themes/admin/assets/bootstrap/css/bootstrap-fileupload.css" rel="stylesheet" />'));

                //App.loadJs($('<script src="themes/admin/js/jquery.filereader.js" ></script>'));
                App.loadJs($('<script src="themes/admin/assets/bootstrap/js/bootstrap-fileupload.js?v=1.2.6" ></script>'));
                App.loadJs($('<script src="themes/admin/js/jquery.html5_upload.js?v=1.2.3"></script>'));

                if (!$().singlefileupload) {
                    return;
                }

                selector.singlefileupload(selector.data());

                selector.bind('beforeDestroy', function () {
                    selector.triggerHandler('html5_upload.destroy');
                });
            },
            handleFilesupload: function (selector) {

                App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/jquery.fileupload/css/jquery.fileupload-ui.css" />'));
                App.loadCss($('<link rel="stylesheet" type="text/css" href="themes/admin/css/custom-fileupload.css" />'));

                // The Load Image plugin is included for the preview images and image resizing functionality
                App.loadJs($('<script src="themes/admin/js/load-image.min.js"></script>'));
                // The Canvas to Blob plugin is included for image resizing functionality 
                App.loadJs($('<script src="themes/admin/js/canvas-to-blob.min.js"></script>'));
                // The Iframe Transport is required for browsers without support for XHR file uploads
                App.loadJs($('<script src="themes/admin/assets/jquery.fileupload/js/jquery.iframe-transport.js"></script>'));
                //too complex to be a control :D
                // The basic File Upload plugin
                App.loadJs($('<script src="themes/admin/assets/jquery.fileupload/js/jquery.fileupload.js"></script>'));
                // The File Upload processing plugin 
                App.loadJs($('<script src="themes/admin/assets/jquery.fileupload/js/jquery.fileupload-process.js"></script>'));
                // The File Upload image preview & resize plugin 
                App.loadJs($('<script src="themes/admin/assets/jquery.fileupload/js/jquery.fileupload-image.js"></script>'));
                // The File Upload validation plugin 
                App.loadJs($('<script src="themes/admin/assets/jquery.fileupload/js/jquery.fileupload-validate.js"></script>'));
                // The File Upload user interface plugin 
                App.loadJs($('<script src="themes/admin/assets/jquery.fileupload/js/jquery.fileupload-ui.js"></script>'));
                // for IE
                App.loadJs($('<script browser="msie" ver=">8" src="themes/admin/assets/jquery.fileupload/js/cors/jquery.xdr-transport.js"></script>'));

                if (!$().fileupload) {
                    return;
                }

                // Initialize the jQuery File Upload widget:
                var form = selector.closest('form');
                if (form.length) {
                    // no need to re-assign
                    var opt = $.extend({
                        uploadTemplateId: 'template-upload',
                        downloadTemplateId: 'template-download',
                        fileInput: form.find('input:file[multiple]').first(),
                        formData: false // don't send data
                    }, selector.data());


                    // assign note
                    if (!opt.note) {
                        opt.note = '<span class="label label-important">NOTE!</span>' +
                                '<span> ' + t('Image size must larger than 200px and less than 800px.') + '</span>';
                    }
                    selector.find('.note').html(opt.note);

                    var inputId = form.find('input[name=id]');
                    var addModal = form.closest('[ui-type="admin-add-form"]');

                    if (!opt.url) {
                        return; // do nothing
                    } else {
                        opt.url = $.trim(opt.url).replace(/\/?$/, '/'); // remove last /
                    }

                    if (opt.sortUrl) {
                        opt.sortUrl = $.trim(opt.sortUrl).replace(/\/?$/, '/');
                    }

                    var url = opt.url, sortUrl = opt.sortUrl, id = inputId.val();
                    // this is for swapping data to template :D
                    var name = opt.fileInput.attr('name').replace('[]', '');

                    // modify
                    form.attr('enctype', 'multipart/form-data');

                    // there is fileuploaddone for this, don't rebind
                    selector.fileupload(opt)
                            .bind('fileuploaddone', function (e, data) {
                                // use default template with key access is files
                                // need to delete ?

                                if (opt.uploadTemplateId) {
                                    data._response.result.files = data._response.result[name];
                                    delete data._response.result[name];
                                }
                            });

                    // assign it to function, first time is nothing
                    var hasInit = false;
                    var init = function () {

                        if (hasInit)
                            return;
                        // force run only one
                        hasInit = true;
                        selector.addClass('fileupload-processing');

                        // update option url
                        selector.fileupload('option', 'url', url);

                        $.ajax({
                            // Uncomment the following to send cross-domain cookies:
                            //xhrFields: {withCredentials: true},
                            url: url, //selector.fileupload('option', 'url'),
                            dataType: 'json',
                            context: selector[0] // not that form, maybe 2 control in a form
                        }).always(function () {
                            $(this).removeClass('fileupload-processing');
                        }).done(function (result) {
                            // for rendering template
                            if (opt.downloadTemplateId) {
                                result.files = result[name];
                                delete result[name];
                            }
                            $(this).fileupload('option', 'done')
                                    .call(this, null, {result: result});

                            if (sortUrl) {
                                var itemsSelector = opt.itemsSelector || '> .span2';
                                $(this).find(opt.filesSelector || '.files').sortable({
                                    items: itemsSelector,
                                    update: function (event, ui) {
                                        var data = [];
                                        $(itemsSelector + ' > .thumbnail', this).each(function () {
                                            data.push($.trim($(this).attr('data-name')));
                                        });
                                        $.post(sortUrl, {imgs: data});
                                    }
                                });
                            }
                        });

                    };

                    if (!id) {
                        selector.fileupload('disable');
                    } else {
                        url = opt.url + id;
                        if (opt.sortUrl) {
                            sortUrl = opt.sortUrl + id;
                        }
                        init();
                    }

                    // try with handle form, other you have to bind your self
                    addModal.bind('afterSubmitAll', function (e, success, ret) {
                        // if form is mark as closing, we should do nothing
                        if (!addModal.hasClass('closing')) {
                            if (success) {
                                //selector.fileupload('option', 'url', opt.url + ret.id);
                                url = opt.url + ret.id;
                                if (opt.sortUrl) {
                                    sortUrl = opt.sortUrl + ret.id;
                                }
                                if (!hasInit) {
                                    try {
                                        selector.fileupload('enable');
                                        init();
                                    } catch (ex) {
                                        // may be element is removed
                                        //errorMessage(ex);
                                    }
                                }
                            }
                        }
                    });

                }

            },
            handleWysihtml5: function (selector) {
                if (!$().wysihtml5) {
                    return;
                }

                selector.wysihtml5();

            },
            handleCkeditor: function (selector) {
                App.loadJs($('<script src="themes/admin/assets/ckeditor/ckeditor.js"></script>'));
                App.loadJs($('<script src="themes/admin/js/ckeditor.plugins.js?v=1.0.1"></script>'));
                App.loadJs($('<script src="themes/admin/assets/ckeditor/adapters/jquery.js"></script>'));

                if (!$().ckeditor) {
                    return;
                }

                if (!App.fixedForCkeditor) {

                    CKEDITOR.nnUntil = {
                        replaceText: function (html) {
                            if (!html)
                                return '';

                            return html.replace(/\[widget([^\]\/]*)(?:\/\]|\]([\s\S]*?)\[\/widget\])/g, function (m, g1, g2) {
                                return '<widget' + g1.replace(/&quot;/g, '"').replace(/&#39;/g, "'") + '>' + $.trim(g2 || '') + '</widget>';
                            });
                        },
                        replaceTag: function (html) {
                            if (!html)
                                return '';

                            return html.replace(/<widget([^>\/]*)(?:\/>|>([\s\S]*?)<\/widget>)/g, function (m, g1, g2) {
                                return '[widget' + g1 + ((g2 = $.trim(g2)) ? ']' + g2 + '[/widget]' : '/]');
                            });
                        }
                    };

                    App.fixedForCkeditor = true;
                }

                // fix url for ckeditor, if you want to change function, you change url also
                CKEDITOR.basePath = App.siteUrl + 'themes/admin/assets/ckeditor/';
                // init value fore rendering
                selector.val(CKEDITOR.nnUntil.replaceTag(selector.val()));

                if (selector.attr('custom-config') !== undefined) {
                    // hack, make sure it will all be load	        
                    selector.ckeditor({
                        customConfig: CKEDITOR.basePath + (selector.attr('custom-config') || 'config') + '.js'
                    });

                } else {

                    var opt = $.extend({
                        customConfig: false, // disable load js config
                        toolbarGroups: [
                            {name: 'clipboard', groups: ['clipboard', 'undo']},
                            {name: 'editing', groups: ['find', 'selection', 'spellchecker']},
                            {name: 'links'},
                            {name: 'insert'},
                            {name: 'forms'},
                            {name: 'tools'},
                            {name: 'document', groups: ['mode', 'document', 'doctools']},
                            {name: 'others'},
                            '/',
                            {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
                            {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align']},
                            {name: 'styles'},
                            {name: 'colors'},
                            {name: 'about'}
                        ],
                        // Remove some buttons, provided by the standard plugins, which we don't
                        // need to have in the Standard(s) toolbar.
                        removeButtons: 'Underline,Subscript,Superscript',
                        extraAllowedContent: 'widget[*]',
                        language: App.lang,
                        filebrowserBrowseUrl: CKEDITOR.basePath + '..' + '/kcfinder/browse.php?type=files',
                        filebrowserImageBrowseUrl: CKEDITOR.basePath + '..' + '/kcfinder/browse.php?type=images',
                        filebrowserFlashBrowseUrl: CKEDITOR.basePath + '..' + '/kcfinder/browse.php?type=flash',
                        filebrowserUploadUrl: CKEDITOR.basePath + '..' + '/kcfinder/upload.php?type=files',
                        filebrowserImageUploadUrl: CKEDITOR.basePath + '..' + '/kcfinder/upload.php?type=images',
                        filebrowserFlashUploadUrl: CKEDITOR.basePath + '..' + '/kcfinder/upload.php?type=flash'
                    }, selector.data());
                    selector.ckeditor(opt);
                }

                selector.on('getData.ckeditor', function (event, editor, data) {
                    data.dataValue = CKEDITOR.nnUntil.replaceText(data.dataValue);
                }).on('setData.ckeditor', function (event, editor, data) {
                    data.dataValue = CKEDITOR.nnUntil.replaceTag(data.dataValue);
                });

                // add these attribute to override config value for ckeditor
                // data-allowed-content="true" data-extra-allowed-content="span[class]"

                // destroy to release memory
                // ckeditor will manage this item for us, so don't destroy it your self
                selector.bind('beforeDestroy', function () {
                    var editor = selector.ckeditorGet();
                    editor.destroy();
                });
            },
            handleToggleButton: function (selector) {

                App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/bootstrap-toggle-buttons/static/stylesheets/bootstrap-toggle-buttons.css" />'));

                App.loadJs($('<script src="themes/admin/assets/bootstrap-toggle-buttons/static/js/jquery.toggle.buttons.js"></script>'));

                if (!$().toggleButtons) {
                    return;
                }

                // switch data-post config from checkbox to hidden 
                var hidden = selector.after('<input type="hidden"/>').next();
                var checkbox = selector.find('input:checkbox');
                hidden.val(+checkbox.prop('checked')).attr('name', checkbox.attr('name'));
                checkbox.removeAttr('name');

                var opt = {
                    style: {
                        //enabled: "success",
                        //disabled: "danger"
                    },
                    label: {
                        //enabled: "On",
                        //disabled: "Off"
                    },
                    onChange: function (el, active) {
                        // if we have hidden value, we bind state to it, so event dont check,
                        // we still can send to server false field, and send 1-0 is easier for update
                        hidden.val(+active);
                    }
                    //animated: false
                    //transitionspeed: 1
                };

                // no need to destroy this, because we don't have to get back input before empty all

                // default value, just a few so no need to config via data
                opt.style.enabled = selector.attr('style-enabled') || 'success';
                opt.style.disabled = selector.attr('style-disabled') || 'danger';
                opt.label.enabled = selector.attr('label-enabled') || 'On';
                opt.label.disabled = selector.attr('label-disabled') || 'Off';
                opt.animated = +selector.attr('animated') || 0;
                opt.transitionspeed = selector.attr('transitionspeed') || 1;
                opt.width = +selector.attr('width') || 100;
                selector.toggleButtons(opt);
            },
            handleScrollToFixed: function (selector) {

                App.loadJs($('<script src="themes/admin/js/jquery-scrolltofixed.min.js"></script>'));

                if (!$().scrollToFixed) {
                    return;
                }
                // defaul is below header
                selector.scrollToFixed($.extend({
                    zIndex: 999,
                    marginTop: $('#header').height() - parseInt(selector.css('padding-top')) - 1,
                    dontSetWidth: true
                }, selector.data()));
            },
            handleTable: function (selector) {

                App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/data-tables/DT_bootstrap.css"/>'));
                App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/data-tables/datatables.responsive.css?v=1.0.1"/> '));

                App.loadJs($('<script src="themes/admin/assets/data-tables/datatables.responsive.js?v=1.0.1"></script>'));
                App.loadJs($('<script src="themes/admin/assets/data-tables/lodash/lodash.min.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/data-tables/jquery.dataTables.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/data-tables/DT_bootstrap.js"></script>'));

                if (!$().dataTable) {
                    return;
                }

                var tableElement = selector;

                var ajaxUrl = tableElement.attr('data-url');
                var datatype = tableElement.attr('data-type') === 'json' ? 'json' : 'xml';
                var responsiveHelper = undefined;
                var breakpointDefinition = {
                    desktop: 1504,
                    tablet: 1024,
                    phone: 480
                };
                //var destroyingDataTable = false;

                // This next part helps to clean things up so we can recreate a data
                // table on the same table element.
                // if there is no id is set, it will automatically generate an id auto-increment



                // may be we call it second time before page re-load
                //if ($.fn.DataTable.fnIsDataTable(tableElement[0])) {
                //tableElement.triggerHandler('beforeDestroy');
                //}

                var checkboxAll = tableElement.find('.group-checkable');
                if (checkboxAll.length) {
                    var set = checkboxAll.attr("data-set");
                    checkboxAll.change(function () {
                        var checked = checkboxAll.prop('checked');
                        var checkboxSet = tableElement.find(set).each(function () {
                            if (checked) {
                                this.checked = true;
                                //checkboxAll.closest('span').addClass('checked');
                            } else {
                                this.checked = false;
                                //checkboxAll.closest('span').removeClass('checked');
                            }
                        });
                        $.uniform.update(checkboxSet);
                    });
                }

                // cache once
                // for access sub key, call t('key1','key2')
                if (!App._translation.dataTable) {
                    $.ajax({
                        dataType: "json",
                        async: false,
                        url: 'themes/admin/assets/data-tables/locale/' + (tableElement.attr('data-lang') || 'en') + '.json',
                        success: function (ret) {
                            App._translation.dataTable = ret;
                        }
                    });
                }

                var opt = {
                    sDom: "<'row-fluid'<'span6'l><'span6'f>r><'row-fluid'<'span4'i><'span8'p>>t<'row-fluid'<'span4'i><'span8'p>>", //'<"row-fluid"<"span8"p><"span4"f>r>t<"row-fluid">',//"<'row-fluid'<'span6'i><'span6'f>r>",
                    sPaginationType: 'bootstrap',
                    oLanguage: App._translation.dataTable,
                    bAutoWidth: false,
                    // disable sorting on the checkbox column, develop gradually
                    bSort: (tableElement.attr('b-sort') === 'false' || tableElement.attr('b-sort') === '0') ? false : true,
                    aoColumnDefs: [],
                    bProcessing: false,
                    bServerSide: true,
                    bDestroy: true,
                    //bStateSave : true,
                    //bRemove	   : true,
                    sAjaxSource: ajaxUrl,
                    fnServerParams: function (aoData) {
                        tableElement.triggerHandler('serverParams', [aoData]);
                    },
                    fnServerData: function (sSource, aoData, fnCallback, oSettings) {
                        oSettings.jqXHR = $.ajax({
                            dataType: datatype,
                            type: 'GET',
                            url: sSource,
                            data: aoData,
                            success: function (xml) {
                                if (datatype === 'xml') {
                                    //tableElement.find('tbody').html(ret);
                                    var $xml = $(xml);
                                    var ret = $($xml.find('aaData').text());
                                    var message = $.trim($xml.find('message').text());
                                    var content = $xml.find('content').text();
                                    if (content) {
                                        $(App.selector).html(content);
                                    }
                                    if (message) {
                                        // we only show the newest one, 'cos
                                        // we will solve them all one by one
                                        // don't hide message when there's nothing
                                        $('#main-message').html(message);
                                        App.scrollTo();
                                    }

                                    var json = {
                                        sEcho: +$xml.find('sEcho').text(),
                                        iTotalRecords: +$xml.find('iTotalRecords').text(),
                                        iTotalDisplayRecords: +$xml.find('iTotalDisplayRecords').text(),
                                        aaData: []
                                    };

                                    //<data>		        		
                                    ret.each(function () {
                                        // we ignore other tag if may occur accidently
                                        if (this.tagName === 'TR') {
                                            var row = [];
                                            $('td', this).each(function () {
                                                row.push(this.innerHTML);
                                            });
                                            json.aaData.push(row);
                                        }
                                    });


                                    // release memory right now
                                    // release memory
                                    $xml.empty().remove();
                                    delete $xml;
                                    delete ret;
                                    // run on another thread
                                    setTimeout(function () {
                                        fnCallback(json);
                                        // without tbody markup, it sill works fine 'cos it is generated auto
                                        var tbody = tableElement.find('tbody');
                                        App.init(tbody);// as soon as possible :D
                                        checkboxAll.change();
                                        // reset instead of remain checked
                                        // checkboxAll.prop('checked', false); $.uniform.update(checkboxAll);
                                        // callback?
                                        tbody.find('tr').hover(function () {
                                            $('.row-action', this).css('visibility', 'visible');
                                        }, function () {
                                            $('.row-action', this).css('visibility', 'hidden');
                                        });
                                        // callback?
                                    }, 10);


                                } else
                                    fnCallback(ret);

                                // trigger success function
                            }
                        });
                    },
                    fnPreDrawCallback: function () {
                        // Initialize the responsive datatables helper once.
                        if (!responsiveHelper) {
                            responsiveHelper = new ResponsiveDatatablesHelper(tableElement, breakpointDefinition);

                            // some format configuration
                            if (tableElement.attr('responsive-icon-tpl')) {
                                //'<span class="responsiveExpander"></span>'
                                responsiveHelper.expandIconTemplate = tableElement.attr('responsive-icon-tpl')
                            }
                            if (tableElement.attr('responsive-row-tpl')) {
                                //'<tr class="row-detail"><td><ul><!--column item--></ul></td></tr>'
                                responsiveHelper.rowTemplate = tableElement.attr('responsive-row-tpl')
                            }
                            if (tableElement.attr('responsive-subrow-tpl')) {
                                //'<li><span class="columnTitle"><!--column title--></span>: <!--column value--></li>'
                                responsiveHelper.rowLiTemplate = tableElement.attr('responsive-subrow-tpl')
                            }
                            // save it to data of table
                            tableElement.data('responsiveHelper', responsiveHelper);
                        }
                    },
                    fnRowCallback: function (nRow) {
                        responsiveHelper.createExpandIcon(nRow);
                    },
                    fnDrawCallback: function (oSettings) {
                        responsiveHelper.respond();
                    },
                    fnInitComplete: function (oTable) {
                        // we change the way search field work
                        // aanFeatures.B => check to see export buttons, f for filter, t for table
                        if (tableElement.fnSettings().aanFeatures.f) {
                            var oTimerId = null,
                                    sPreviousSearch = null,
                                    anControl = $('input', tableElement.fnSettings().aanFeatures.f);

                            //var searchable, filterInput = $('#' + tableElement.attr('id') + '_filter input');
                            // use id to get a faster access to filter input(bind change ?)
                            anControl.off('keyup search input').on('keyup search input', function (e) {
                                if (sPreviousSearch === null || sPreviousSearch !== anControl.val()) {
                                    clearTimeout(oTimerId);
                                    sPreviousSearch = anControl.val();
                                    // after keyup for 1/2 second, then call filter to reduce ajax call	            
                                    oTimerId = setTimeout(function () {
                                        tableElement.fnFilter($.trim(anControl.val()));
                                    }, 500);
                                }
                            });
                        }

                        var wrapper = tableElement.closest('.dataTables_wrapper');
                        if (selector.attr('length-class'))
                            wrapper.find('.dataTables_length select').addClass(selector.attr('length-class'));
                        // search use to be small text
                        if (selector.attr('filter-class'))
                            wrapper.find('.dataTables_filter input').addClass(selector.attr('filter-class'));


                        // by default, always have input filter
                        // other filter, this custome filter can apply to all control like select, input.v.v.
                        var otherFilterSelector = selector.attr('other-filter');
                        if (otherFilterSelector) {
                            // don't worry, not too many filter controls
                            $(otherFilterSelector).each(function () {
                                var item = $(this);
                                tableElement.bind('serverParams', function (e, aoData) {
                                    if (e.isTrigger === 2) {
                                        // not the first time loading, so we add custome name filter
                                        var value = item.val();
                                        if (value instanceof Array) {
                                            // value is array, we push it as array parameter collection
                                            // unless you specify it as json string or object
                                            // but basic filter is multiple like select only :D
                                            value.forEach(function (subVal) {
                                                aoData.push({
                                                    name: item.attr('name') + '[]',
                                                    value: subVal
                                                });
                                            });
                                        } else {
                                            // not an array
                                            aoData.push({
                                                name: item.attr('name'),
                                                value: value
                                            });
                                        }

                                    }
                                });
                                // may be other function, or we can use other function to trigger change...
                                var changeFn = item.attr('data-change') || 'change';
                                item.bind(changeFn, function () {
                                    // render is not immediately, wait in this function
                                    tableElement.dataTable({bRetrieve: true}).fnFilter('');
                                });
                            });
                        }
                    }
                };

                if (tableElement.attr('s-dom')) {
                    opt.sDom = tableElement.attr('s-dom');
                }



                tableElement.find('thead th').each(function (i) {
                    opt.aoColumnDefs.push({
                        aTargets: [i],
                        bSortable: +$(this).attr('b-sortable') ? true : false,
                        sClass: $(this).attr('s-class')
                    });
                });
                if (!ajaxUrl) {
                    opt.bServerSide = false;
                    opt.sAjaxSource = null;
                }
                // we use custom attribute for common param with shorter name, instead of using table data
                if (tableElement.attr('i-display-length')) {
                    opt.iDisplayLength = +tableElement.attr('i-display-length') || 10;
                }

                // we should only init table after check for tool
                if (tableElement.attr('table-tools')) {

                    // split into small pieces so we can use before include these
                    App.loadJs($('<script src="themes/admin/assets/data-tables/extras/TableTools/media/js/ZeroClipboard.js" ></script>'));
                    App.loadJs($('<script src="themes/admin/assets/data-tables/extras/TableTools/media/js/TableTools.js" ></script>'));


                    if (!App.fixedForTableTools) {

                        // fix for older version using datatableTools, newer should be buttons
                        if (!$.fn.dataTable.TableTools) {
                            App.loadJs($('<script src="themes/admin/assets/data-tables/dataTables.tableTools.js"></script>'));
                        }

                        $.extend(true, $.fn.DataTable.TableTools.classes, {
                            "container": "dataTables_tools pull-right btn-group",
                            "buttons": {
                                "normal": "btn btn-default",
                                "disabled": "btn disabled"
                            },
                            "collection": {
                                "container": "DTTT_dropdown dropdown-menu",
                                "buttons": {
                                    "normal": "",
                                    "disabled": "disabled"
                                }
                            }
                        });

                        $.fn.DataTable.TableTools.DEFAULTS.sSwfPath = "themes/admin/assets/data-tables/extras/TableTools/media/swf/copy_csv_xls_pdf.swf";

                        // Have the collection use a bootstrap compatible dropdown
                        $.extend(true, $.fn.DataTable.TableTools.DEFAULTS.oTags, {
                            "collection": {
                                "container": "ul",
                                "button": "li",
                                "liner": "a"
                            }
                        });

                        App.fixedForTableTools = true;
                    }

                    var buttonTools = tableElement.attr('table-tools').split(',');

                    // init now
                    var table = tableElement.dataTable(opt);
                    var tableTools = new $.fn.dataTable.TableTools(table, {
                        aButtons: buttonTools
                    });

                    tableElement.closest('div.dataTables_wrapper').before(tableTools.dom.container);

                } else if (tableElement.attr('table-buttons')) {
                    App.loadJs($('<script src="themes/admin/assets/data-tables/buttons/js/dataTables.buttons.min.js"></script>'));
                    // when we use table-buttons, we should use html5 instead of flash fallback for legacy browsers
                    App.loadJs($('<script src="themes/admin/assets/data-tables/buttons/js/buttons.html5.min.js">'));
                    // should not override this, instead using css to style each button
                    App.loadJs($('<script src="themes/admin/assets/data-tables/buttons/js/buttons.bootstrap.min.js">'));
                    var buttonTools = tableElement.attr('table-buttons').split(',');
                    var customButtonTools = [];
                    buttonTools.forEach(function (button) {
                        var extendAndText = button.split(':');
                        var extend = extendAndText[0];
                        var text = extendAndText[1];
                        var customOpt = {
                            extend: extend,
                            customize: function (doc) {
                                // so we can modify the content
                                tableElement.triggerHandler('buttonToolsCustomize', [extend, doc]);
                            }
                        };
                        if (text) {
                            customOpt.text = text;
                        }
                        // append to custom button
                        customButtonTools.push(customOpt);

                        switch (extend) {
                            case 'copyHtml5':
                                // do nothing :D
                                break;
                            case 'excelHtml5':
                                // xlsx requires jzip
                                App.loadJs($('<script src="themes/admin/assets/excel-zone/xlsx/jszip.min.js"></script>'));
                                break;
                            case 'csvHtml5':
                                break;
                            case 'pdfHtml5':
                                App.loadJs($('<script src="themes/admin/assets/data-tables/buttons/media/pdfmake.min.js"></script>'));
                                App.loadJs($('<script src="themes/admin/assets/data-tables/buttons/media/vfs_fonts.js"></script>'));

                                break;
                            case 'print':
                                App.loadJs($('<script src="themes/admin/assets/data-tables/buttons/js/buttons.print.min.js"></script>'));
                                break;
                        }
                    });

                    // init tool
                    // this make the init faster, without re-init again
                    opt.buttons = customButtonTools;
                    tableElement.dataTable(opt);

                } else {
                    tableElement.dataTable(opt);
                }

                // assign destroy event
                tableElement.bind('beforeDestroy', function () {

                    if (tableTools) {
                        // force clear
                        $(tableTools.dom.container).empty().remove();
                    }

                    // Set the destroying flag to prevent the responsive table from
                    // being initialized during this phase.
                    //destroyingDataTable = true;

                    // Get data table instance
                    // tableElement.dataTable();

                    // Since we are destroying the table, let's clear it to speed things
                    // up.
                    tableElement.fnClearTable(false);

                    // Disabling the helper will reset the the responsive changes to the
                    // DOM.
                    responsiveHelper = tableElement.data('responsiveHelper');

                    if (responsiveHelper) {
                        responsiveHelper.disable(true);
                        // Remove the responsive helper.
                        responsiveHelper = undefined;
                    }

                    // in ajax mode, no need to destroy table, html will be rebind correctly

                    // Now that all things have been restored, let's destroy the table
                    //tableElement.fnDestroy();

                    // Clear flag
                    //destroyingDataTable = false;

                    //isFirst = false; // has been call

                });
            },
            handleExcel: function (selector) {

                App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/excel/jquery.handsontable.full.css">'));
                App.loadJs($('<script src="themes/admin/assets/excel/jquery.handsontable.full.js?v=1.0.1"></script>'));

                if (!$().handsontable)
                    return;

                var checkInterval;

                // this is for updating content to post on server
                var input = selector.next('input:hidden');
                var opt = selector.data();
                opt.data = opt.data || []; // default is empty array
                opt = $.extend({
                    rowHeaders: true,
                    minSpareRows: 1,
                    contextMenu: false,
                    stretchH: 'all',
                    // default nowrap, so we remain row width, if we use wordwrap, must provide column width
                    wordWrap: true,
                    afterChange: function (changes, source) {
                        if (input.length) {
                            input.val(JSON.stringify(selector.handsontable('getData')));
                        }
                    },
                    observeDOMVisibility: true,
                    rowHeight: function () {
                        return 23;
                    },
                    afterRender: function () {
                        // run only one
                        clearTimeout(checkInterval);
                        // fullscreen will not have window resize event
                        //if(App.isFullScreen){
                        var newWidth = selector.width();
                        // repeat until finish :D
                        if (oldWidth !== newWidth) {
                            // only render when width is changed, 
                            // and prevent flood trigger so save performance
                            // others don't care, 'cos this control is so heavy
                            checkInterval = setTimeout(function () {
                                // run success then update width
                                oldWidth = newWidth;
                                selector.handsontable('render');
                            }, 200);
                        }
                        //}
                    }
                }, opt);
                // release memory for showing data on div's attribute      
                selector.removeAttr('data-data');
                selector.handsontable(opt);

                if (typeof opt.rowHeight === 'function') {
                    // faster render, default height is 23 for all, don't stretch
                    selector.data('handsontable').view.wt.wtSettings.rowHeight = opt.rowHeight;
                }
                if (!opt.nativeScrollbars) {
                    // not depend on css class :D
                    selector.css('overflow', 'hidden');
                }
                var oldWidth = selector.width();

                // destroy 
                selector.bind('beforeDestroy', function () {
                    selector.handsontable('destroy');
                }).bind('windowResize', function (e, we) {
                    // update by custome event or custom call
                    if (!we || we.isTrigger) {
                        setTimeout(function () {
                            var newWidth = selector.width();
                            // still visible then render, faster cond is checked first
                            // full screen no need for vertical scrollbar
                            if (oldWidth !== newWidth && selector.is(':visible')) {
                                // only render when width is changed, so save performance
                                oldWidth = newWidth;
                                selector.handsontable('render');
                            }
                        });
                    }
                });


            },
            handleDatePicker: function (selector) {
                App.loadCss($('<link rel="stylesheet" type="text/css" href="themes/admin/assets/bootstrap-datepicker/css/datepicker.css" />'));
                App.loadJs($('<script src="themes/admin/assets/bootstrap-datepicker/js/bootstrap-datepicker.js?v=1.0.9"></script>'));
                if (App.lang !== 'en') {
                    App.loadJs($('<script src="themes/admin/assets/bootstrap-datepicker/js/locales/' + App.lang + '.js"></script>'));
                }

                // position is for parent, offset is for document, should use position when in container

                if (!$().datepicker) {
                    return;
                }
                selector.datepicker(selector.data());
            },
            handleTimePicker: function (selector) {

                App.loadCss($('<link rel="stylesheet" type="text/css" href="themes/admin/assets/bootstrap-timepicker/css/timepicker.css" />'));
                App.loadJs($('<script src="themes/admin/assets/bootstrap-timepicker/js/bootstrap-timepicker.js?v=1.0.9"></script>'));


                if (!$().timepicker) {
                    return;
                }
                var opt = $.extend({
                    minuteStep: 1,
                    showSeconds: false,
                    showMeridian: false
                }, selector.data());

                selector.timepicker(opt);
            },
            // special ui, don't use data attribute, may be need to be rewritten
            handleDateRangePicker: function (selector) {

                App.loadCss($('<link rel="stylesheet" type="text/css" href="themes/admin/assets/bootstrap-daterangepicker/daterangepicker.css" />'));
                App.loadJs($('<script src="themes/admin/assets/bootstrap-daterangepicker/date.js"></script>'));
                App.loadJs($('<script src="themes/admin/assets/bootstrap-daterangepicker/daterangepicker.js"></script>'));

                if (!$().daterangepicker) {
                    return;
                }


                var opt = $.extend({
                    ranges: {
                        'Last 7 Days': [Date.today().add({
                                days: -6
                            }), 'today'],
                        'Last 30 Days': [Date.today().add({
                                days: -29
                            }), 'today'],
                        'This Month': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
                        'Last Month': [Date.today().moveToFirstDayOfMonth().add({
                                months: -1
                            }), Date.today().moveToFirstDayOfMonth().add({
                                days: -1
                            })]
                    },
                    parentEl: selector.attr('parent-el') || 'body', // short-cut to data-parent-el
                    opens: 'right',
                    format: 'dd/MM/yyyy',
                    separator: ' to ',
                    locale: {
                        applyLabel: 'Submit',
                        fromLabel: 'From',
                        toLabel: 'To',
                        customRangeLabel: 'Custom Range',
                        daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        firstDay: 1
                    },
                    showWeekNumbers: selector.attr('show-week-numbers') === '1' /*? true : false*/,
                    buttonClasses: ['btn-danger']
                }, selector.data());

                // this attr effect to data not simple as just changing value, so modify it the normal way
                if (selector.attr('show-today') === '1') {
                    opt.ranges['Today'] = ['today', 'today'];
                }
                if (selector.attr('show-yesterday') === '1') {
                    opt.ranges['Yesterday'] = ['yesterday', 'yesterday'];
                }
                var returnTimeStamp = selector.attr('time-stamp') === '1' /*? true : false*/;
                if (selector.attr('start-date-el')) {
                    var startDateEl = selector.find(selector.attr('start-date-el'));
                    opt.startDate = Date.parseExact(startDateEl.val(), opt.format);
                    if (returnTimeStamp) {
                        startDateEl.val(opt.startDate.getTime());
                    }

                } else {
                    opt.startDate = selector.attr('start-date') !== undefined
                            ? Date.parseExact(selector.attr('start-date'), opt.format)
                            : Date.today().add({days: -29});
                }

                if (selector.attr('end-date-el')) {
                    var endDateEl = selector.find(selector.attr('end-date-el'));
                    opt.endDate = Date.parseExact(endDateEl.val(), opt.format);
                    if (returnTimeStamp) {
                        endDateEl.val(opt.endDate.getTime());
                    }
                } else {
                    opt.endDate = selector.attr('end-date') !== undefined
                            ? Date.parseExact(selector.attr('end-date'), opt.format)
                            : Date.today();
                }

                var boundYear = selector.attr('bound-year') || 1;

                opt.startDate = opt.startDate || Date.today().add({days: -29});
                opt.endDate = opt.endDate || Date.today();

                opt.minDate = selector.attr('min-date') || opt.startDate.clone().add({
                    years: -boundYear
                });

                opt.maxDate = selector.attr('max-date') || opt.endDate.clone().add({
                    years: boundYear
                });

                selector.daterangepicker(opt, function (start, end) {
                    if (selector.attr('start-date-el')) {
                        selector.find(selector.attr('start-date-el'))
                                .val(returnTimeStamp ? start.getTime() : start.toString(opt.format));
                    }
                    if (selector.attr('end-date-el')) {
                        selector.find(selector.attr('end-date-el'))
                                .val(returnTimeStamp ? end.getTime() : end.toString(opt.format));
                    }

                    var displayFormat = selector.attr('display-format') || 'MMMM d, yyyy';
                    selector.find('span').html(start.toString(displayFormat) + ' - ' + end.toString(displayFormat));

                    // has picked daterange
                    selector.trigger('dateRangePicked');

                });

                // initilaize
                var displayFormat = selector.attr('display-format') || 'MMMM d, yyyy';
                selector.find('span').html(
                        (typeof opt.startDate === 'string' ? opt.startDate : opt.startDate.toString(displayFormat))
                        + ' - ' +
                        (typeof opt.endDate === 'string' ? opt.endDate : opt.endDate.toString(displayFormat))
                        );
            },
            handleColorPicker: function (selector) {

                App.loadCss($('<link rel="stylesheet" type="text/css" href="themes/admin/assets/bootstrap-colorpicker/css/colorpicker.css" />'));
                App.loadJs($('<script src="themes/admin/assets/bootstrap-colorpicker/js/bootstrap-colorpicker.js?v=1.0.10"></script>'));


                if (!$().colorpicker) {
                    return;
                }

                // the plugin will override on demand by data-attribute, not by options 
                selector.colorpicker({
                    format: 'hex'
                });
            },
            handleAccordion: function (selector) {
                selector.collapse().height('auto');
            },
            handleRating: function (selector) {
                // hidden input will never trigger on animation, so we have to use input with hidden class instead
                // you should wrap this rating in a wrap to style it
                var stars = $('<span class="rating"/>').insertAfter(selector);
                var opt = selector.hide().data();
                opt.max = opt.max || 5; // default five stars
                for (var i = 0; i < opt.max; i++) {
                    stars.append('<span class="star"/>');
                }
                // we use ~ with float right to style for nextall
                stars.on('click', '.star', function () {
                    var item = $(this).addClass('active');
                    // for sure, sometimes rating is a small collection, so it is really fast
                    item.siblings().removeClass('active');
                    selector.val(opt.max - item.index());
                }).find('.star:eq(' + (opt.max - selector.val()) + ')').click();
            },
            handleScroller: function (selector) {

                App.loadJs($('<script src="themes/admin/assets/jquery-slimscroll/jquery.slimscroll.min.js"></script>'));

                if (!$().slimScroll) {
                    return;
                }
                var el = selector, opt = el.data();
                el.slimScroll($.extend({
                    //start: $('.blah:eq(1)'),
                    height: el.height(),
                    width: el.width(),
                    alwaysVisible: false,
                    railVisible: false,
                    disableFadeOut: true
                }, opt));
            },
            handleGroupButton: function (selector) {

                var select = selector.find('select');
                if (select.length === 0) {
                    var name = select.attr('data-name');
                    // other may want to show, so don't hide it unless they want so
                    var select = $('<select name="' + name + '"></select>').hide()
                            .appendTo(selector);
                }
                // init with group of buttons is more strait and flexibility
                if (select.attr('name')) {
                    if (selector.attr('data-toggle') === 'buttons-checkbox') {
                        // prop is attribute that no need to set value, existed is equal to true
                        select.prop('multiple', true);
                    } else {
                        // default is radio
                        select.prop('multiple', false);
                        selector.attr('data-toggle', 'buttons-radio');
                    }
                    selector.find('button').each(function (i) {
                        var item = $(this).attr('rel', i);
                        // just for test when assign text
                        var option = $('<option/>').val(item.val()).text(item.text());
                        if (item.hasClass('active')) {
                            option.prop('selected', true);
                        }
                        select.append(option);
                    });
                    selector.on('click', 'button', function () {
                        var item = $(this);
                        var ind = +item.attr('rel');
                        var option = select.find('option:eq(' + ind + ')');
                        // toggle, then trigger select, instead of rebind it value
                        // mulitple mean checkbox, can select more and remove if needed
                        if (select.prop('multiple')) {
                            option.prop('selected', item.hasClass('active') ? false : true);
                        } else {
                            // radio must always has one choice 
                            option.prop('selected', true);
                        }
                        select.change();
                    });
                }
            },
            handleFormWizard: function (selector) {
                if (!$().bootstrapWizard) {
                    return;
                }
                // custom options should be custom attribute like facebook
                var stepTitle = selector.attr('step-title') || '.step-title'
                        , pageTitle = selector.attr('page-title') || '.page-title'
                        , nextSelector = selector.attr('button-next') || '.button-next'
                        , previousSelector = selector.attr('button-previous') || '.button-previous'
                        , submitSelector = selector.attr('button-submit') || '.button-submit';
                var opt = {
                    nextSelector: nextSelector,
                    previousSelector: previousSelector,
                    onTabClick: function (tab, navigation, index) {
                        //alert('on tab click disabled');
                        if (!selector.attr('tab-click'))
                            return false;
                    },
                    onNext: function (tab, navigation, index) {
                        var total = navigation.find('li').length;
                        var current = index + 1;
                        // set wizard title
                        selector.find(stepTitle).text('Step ' + (index + 1) + ' of ' + total);
                        // set done steps
                        selector.find('li').removeClass("done");
                        var li_list = navigation.find('li');
                        for (var i = 0; i < index; i++) {
                            $(li_list[i]).addClass("done");
                        }

                        if (current === 1) {
                            selector.find(previousSelector).hide();
                        } else {
                            selector.find(previousSelector).show();
                        }

                        if (current >= total) {
                            selector.find(nextSelector).hide();
                            selector.find(submitSelector).show();
                        } else {
                            selector.find(nextSelector).show();
                            selector.find(submitSelector).hide();
                        }
                        App.scrollTo($(pageTitle));
                    },
                    onPrevious: function (tab, navigation, index) {
                        var total = navigation.find('li').length;
                        var current = index + 1;
                        // set wizard title
                        selector.find(stepTitle).text('Step ' + (index + 1) + ' of ' + total);
                        // set done steps
                        selector.find('li').removeClass("done");
                        var li_list = navigation.find('li');
                        for (var i = 0; i < index; i++) {
                            $(li_list[i]).addClass("done");
                        }

                        if (current === 1) {
                            selector.find(previousSelector).hide();
                        } else {
                            selector.find(previousSelector).show();
                        }

                        if (current >= total) {
                            selector.find(nextSelector).hide();
                            selector.find(submitSelector).show();
                        } else {
                            selector.find(nextSelector).show();
                            selector.find(submitSelector).hide();
                        }

                        App.scrollTo($(pageTitle));
                    },
                    onTabShow: function (tab, navigation, index) {
                        var total = navigation.find('li').length;
                        var current = index + 1;
                        var percent = (current / total) * 100;
                        selector.find('.bar').css({
                            width: percent + '%'
                        });
                        selector.trigger('onTabShow', arguments);
                    }
                };
                // modified opt ?
                selector.bootstrapWizard(opt);
                // always hide previous button
                selector.find(previousSelector).hide();

                selector.find(submitSelector).click(function () {
                    // submit all form in this ?
                    // submit one, if you want to submit more, trigger it in submit method
                    if ($(this).attr('disabled') === undefined)
                        selector.find('form:first').submit();
                }).hide();
            },
            handleTagsInput: function (selector) {

                App.loadCss($('<link rel="stylesheet" type="text/css" href="themes/admin/assets/jquery-tags-input/jquery.tagsinput.css" />'));
                App.loadJs($('<script src="themes/admin/assets/jquery-tags-input/jquery.tagsinput.js"></script>'));

                if (!$().tagsInput) {
                    return;
                }
                var tagsInput;
                var opt = $.extend({
                    width: '100%', //100% to stretch to fit parent width from style, should override
                    clear: true,
                    minInputWidth: 100,
                    defaultText: 'Add a tag',
                    onAddTag: function (tag) {
                        selector.triggerHandler('onAddTag', [tag, tagsInput]);
                        tagsInput.sortable("refresh");
                    },
                    onRemoveTag: function (tag) {
                        selector.triggerHandler('onRemoveTag', [oldvalue, tag, tagsInput]);
                    },
                    onChange: function (elem, elem_tags) {
                        selector.triggerHandler('onChange', [elem, elem_tags, tagsInput]);
                    }
                }, selector.data());

                if (!opt.hideNode) {
                    selector.after('<br/>' + (opt.note || ('<span class="label label-important">NOTE!</span>' +
                            '<span> Press enter to add tag, drag to reorder !!!</span>')));
                }

                selector.tagsInput(opt);

                selector.bind('beforeDestroy', function () {
                    var tester = $('#' + selector.attr('id') + '_tag_autosize_tester');
                    tester.remove();
                });


                // by default, tags-input is sortable
                // but for select, sometime we don't want to reorder it, cos it may lead to wrong display
                // for tags-input it doesnt matter the order is
                var selectorId = selector.attr('id'), input = $('#' + selectorId + '_input'), tag,
                        tagsInput = $('#' + selectorId + '_tagsinput'),
                        // container default is scrollParent;
                        container = App.getContainer(selector, opt.container);
                if (input.length === 0) {
                    input = $('<input type="text" id="' + selectorId + '_input" style="display:none;position:absolute;padding:2px 5px"/>');
                    input.appendTo(container);
                }
                input.keyup(function () {
                    tag.find('>span').text(input.val() + ' ');
                    input.css({
                        width: tag.width(),
                        height: tag.height()
                    });
                }).blur(function () {
                    onfocus = false;
                }).change(function () {
                    input.hide();
                    value = $.trim(input.val());
                    if (oldvalue && oldvalue !== value) {
                        selector.triggerHandler('onUpdate', [oldvalue, value]);
                        onfocus = false;
                    }
                });
                var ondrag = false, onfocus = false, oldvalue;
                tagsInput.sortable({
                    items: '.tag',
                    //helper : 'clone',
                    start: function (event, ui) {
                        ondrag = true;
                        input.blur().hide();
                    },
                    update: function (event, ui) {
                        var data = [];
                        $('.tag > span', this).each(function () {
                            data.push($.trim($(this).text()));
                        });
                        selector.triggerHandler('onUpdateOrder', [data]);
                    },
                    stop: function (event, ui) {
                        setTimeout(function () {
                            ondrag = false;
                        }, 100);
                    }
                }).on('click', '.tag', function () {
                    tag = $(this);
                    if (ondrag || onfocus)
                        return;
                    onfocus = true;
                    input.val(oldvalue = $.trim(tag.find('>span').text())).css({
                        width: tag.width(),
                        height: tag.height(),
                        top: container.scrollTop() + tag.position().top,
                        left: tag.position().left
                    }).show();

                });

            },
            handleGoTop: function (selector) {
                /* set variables locally for increased performance */
                $('#go_top').click(function () {
                    App.scrollTo();
                });

            },
            handleAutogrow: function (selector) {
                var $this = selector.css({'overflow': 'hidden', 'resize': 'none'}),
                        minHeight = $this.height(),
                        lineHeight = $this.css('lineHeight');

                var shadow = $('<div></div>').css({
                    position: 'absolute',
                    top: -10000,
                    left: -10000,
                    width: $this.width(),
                    fontSize: $this.css('fontSize'),
                    fontFamily: $this.css('fontFamily'),
                    lineHeight: lineHeight,
                    resize: 'none'
                }).appendTo(App.selector);

                // after new html binding, this element is released also

                var update = function () {
                    var val = $this.val().replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/&/g, '&amp;')
                            .replace(/\n/g, '<br/>');
                    shadow.html(val);
                    $this.height(Math.max(shadow.height() + 20, minHeight));
                };

                $this.change(update).keyup(update).keydown(update);
                update();

                // destroy 
                selector.bind('beforeDestroy', function () {
                    shadow.remove();
                });
            },
            // by default used simple show/hide without animation due to the issue with handleSidebarTogglerAnimated.
            handleSidebarToggler: function (selector) {

                $('#sidebar-toggler').click(function () {
                    var ulMenu = $('#sidebar ul.sidebar-menu');
                    if (ulMenu.is(":visible") === true) {
                        $(App.selector).css({
                            'margin-left': '25px'
                        });
                        $('#sidebar').css({
                            'margin-left': '-190px'
                        });
                        ulMenu.hide();
                        $("#container").addClass("sidebar-closed");
                    } else {
                        $(App.selector).css({
                            'margin-left': '215px'
                        });
                        ulMenu.show();
                        $('#sidebar').css({
                            'margin-left': '0'
                        });
                        $("#container").removeClass("sidebar-closed");
                    }
                    // force update layout                    
                    $(window).trigger('resize');
                });
            }
        };

        // this event is not specific for an element or container
        // so you shouldn't write it as $.event extension
        // Track is collection of methods that help tracking things load on demand
        // Maybe support Evt, but should not because of performance
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
                if (listenCallbackDict[selector]) {
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

                destroyCallbackDict[selector] = function () {
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

            function stopListen(selector, callback) {
                if (listenCallbackDict[selector]) {
                    // remove or empty callback, work like unbind
                    callback
                            ? listenCallbackDict[selector].remove(callback)
                            : listenCallbackDict[selector].empty();


                    // check empty, whether all callback has been removed
                    if (!listenCallbackDict[selector].has()) {
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
                return /*options.strictlyNew && */(el.insNn === true);
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
                $(function () {
                    tagAll(document.body); //prevents from catching things on show
                });
                //}

                return {
                    options: options,
                    listenNewNode: function (selector, callback) {
                        if (selector.match(/[^{}]/)) {
                            return listen(selector, callback);
                        }
                        // showing that selector is not allowed
                        return false;
                    },
                    stopListenNewNode: function (selector, callback) {
                        if (selector.match(/[^{}]/)) {
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

        return {
            siteUrl: location.href,
            checkUiVisibleInterval: 200,
            liveUpdate: true,
            scopeUpdate: 'body',
            checkScope: false, // update every where instead of scopeUpdate
            isFullScreen: false,
            Func: Func,
            Track: Track,
            _uiList: [],
            _loadedJs: {},
            _loadedCss: {},
            _translation: {}, // translation, not recommend use it, just extend, use t() instead
            _checkBrowserForResource: function (selector) {
                var browser = selector.attr('browser');
                if (browser !== undefined) {
                    if ($.browser[browser]) {
                        var ver = parseFloat($.browser.version);
                        var values = selector.attr('ver').split(',');
                        for (var i in values) {
                            var value = values[i];
                            var op = value[0];
                            // simply operartor to <,> and =
                            if (op === '>') {
                                if (ver <= parseFloat(value.substr(1)))
                                    return false;
                            } else if (op === '<') {
                                if (ver >= parseFloat(value.substr(1)))
                                    return false;
                            } else {
                                if (ver !== parseFloat(value))
                                    return false;
                            }
                        }
                    } else
                        return false;
                }
                return true;
            },
            loadCss: function (selector) {
                if (App._checkBrowserForResource(selector)) {
                    var link = selector[0].href;
                    if (!App._loadedCss[link]) {
                        $('head').append(selector);
                        App._loadedCss[link] = true;
                    } else
                        delete selector;
                } else
                    delete selector;
            },
            loadJs: function (selector) {
                if (App._checkBrowserForResource(selector)) {
                    // jquery will automatically load all js files based on queue
                    // absolute src, if use attr it just relative src
                    var link = selector[0].src;
                    if (!App._loadedJs[link]) {
                        $('body').append(selector);
                        App._loadedJs[link] = true;
                    } else
                        delete selector;
                } else
                    delete selector;
            },
            tmpl: function (id, data) {
                return tmpl(id)(data);
            },
            setCache: function (cache) {
                // turn on turn off caching anytime ^^
                $.ajaxSetup({cache: cache});
            },
            // put element into queue and remove it on the fly, so we can apply action to it
            track: function (selector) {
                if (App.liveUpdate) {
                    // event when element is removed
                    selector.on('remove', function (e) {
                        selector.triggerHandler('beforeDestroy');
                        // remove selector form list
                        App._uiList = $.grep(App._uiList, function (item) {
                            return item[0] !== selector[0];
                        });
                        // release memory as soon as possible
                        // but empty parent can 'cos event occur on child
                        setTimeout(function () {
                            // this is smallest ui
                            if (selector.find('[ui-type]').length === 0) {
                                selector.remove();
                                // delete from memory, its content is empty already
                                delete selector;
                            }
                        });

                    });
                }

                // add to ui list
                App._uiList.push(selector);
            },
            // try catch in every control initialization
            // so we can continue after error and know which is the last error to see
            handle: function (selector) {

                var uiType = selector.attr('ui-type');
                if (uiType) {

                    // check for an elem has beend initialized
                    for (var i in App._uiList) {
                        if (App._uiList[i][0] === selector[0]) {
                            // check again in rebind mode :D
                            return;
                        }
                    }

                    var funcName = 'handle' + uiType.replace(/(?:^\w|-\w)/g, function (match) {
                        return match[match.length - 1].toUpperCase();
                    });

                    if (!Func[funcName]) {
                        // try load js from handle folder
                        // this js should load more css and js later
                        App.loadJs($('<script src="themes/admin/js/handle/' + uiType + '/scripts.js"></script>'));

                    }

                    // if you call directly App.Func.hanlde, we can't check
                    if (Func[funcName] && !selector.attr('ui-init')) {
                        // mark right away before any changes applied to this element
                        selector.attr('ui-init', true);
                        // just several ui require visible, so it's not a performance problems :D
                        if (selector.attr('require-visible') !== undefined) {
                            var t = setInterval(function () {
                                // wait until element is visible
                                if (selector.is(':visible')) {
                                    try {
                                        Func[funcName](selector);
                                    } catch (e) {
                                        errorMessage(e);
                                    }
                                    clearInterval(t);
                                    t = null;
                                }
                                // this clousure function will point to local vars of parent function
                                // until clear interval is call, then all vars will be released
                            }, App.checkUiVisibleInterval);

                            selector.bind('beforeDestroy', function () {
                                // even we don't render handsontable, we still have to clear interval
                                if (t) {
                                    clearInterval(t);
                                    // errorMessage("control is not rendered");
                                }
                            });


                        } else {
                            // this will wait until html is rendered
                            // don't call settimeout again in plugin, 'cos it will not run
                            //setTimeout(function(){
                            try {
                                Func[funcName](selector);
                            } catch (e) {
                                errorMessage(e);
                            }
                            //});
                        }

                        App.track(selector);
                    }
                }
            },
            setup: function (selector, siteUrl, cache) {
                // base site url
                App.siteUrl = siteUrl || App.siteUrl;

                // change lang must reload page
                App.lang = $('html').attr('lang');

                // selector for App container
                App.selector = selector;

                // default set cache is true to speed up loading	    		
                if (cache === undefined)
                    cache = true;
                App.setCache(cache);


                App.loadJs($('<script src="themes/admin/js/locale/' + App.lang + '.js"></script>'));
                // short cut function translate
                window.t = function () {
                    var pointer = App._translation, key = '';
                    for (var i in arguments) {
                        pointer = pointer[key = arguments[i]];
                        if (pointer === undefined)
                            break;
                    }
                    return pointer || key;
                };


                $('head>link').each(function () {
                    var link = this.href;
                    if (!App._loadedCss[link]) {
                        App._loadedCss[link] = true;
                    }
                });

                $('head>script,body>script').each(function () {
                    var link = this.src;
                    if (link && !App._loadedJs[link]) {
                        App._loadedJs[link] = true;
                    }
                });

                // for checking with browser version and caching
                $($('#css-preload').val()).each(function () {
                    App.loadCss($(this));
                });
                $($('#js-preload').val()).each(function () {
                    App.loadJs($(this));
                });

                App.init($('body'), true);

                if (App.liveUpdate) {


                    // using animation to track new dom inserted
                    if (Track.options.isAnimationSupported) {

                        Track.listenNewNode('[ui-type]', function () {
                            var target = $(this);
                            // process in App.selector only, for other section, do manually action
                            if (!App.checkScope || target.closest(App.scopeUpdate || selector).length) {
                                // wait till html rendered
                                //setTimeout(function(){
                                // for every element already
                                App.handle(target);

                                //},100);
                            }
                        });
                    } else {

                        // tracking new dom inserted, don't use it unless slowdown browser
                        document.addEventListener('DOMNodeInserted', function (e) {
                            var target = $(e.target);
                            // process in App.selector only, for other section, do manually action
                            if (!App.checkScope || target.closest(App.scopeUpdate || selector).length) {
                                // wait till html rendered
                                //setTimeout(function(){
                                App.init(target);
                                //},100);
                            }
                        }, false);
                    }
                }

                // setup timeout for ajax call
                $.ajaxSetup({
                    timeout: App.ajaxTimeout || 10000, // in milliseconds 
                    error: function (xhr) {
                        var match = (xhr && xhr.responseText) ? xhr.responseText.match(/<script>(.*?)<\/script>/) : null;
                        if (match && match[1]) {
                            // javascript from ajax response
                            eval(match[1]);
                        } else {
                            // show message
                            $.gritter.add({
                                title: t("Can not get data this moment, please try again later"),
                                text: xhr.responseText || 'Connection Error'
                            });
                        }
                    }
                });

                $(document).ajaxStart(function () {
                    $('#preloader').show();

                    if (!App.liveUpdate) {

                        var temp = [];
                        // before call ajax, we check _uiList to know which has been die
                        App._uiList.forEach(function (item) {
                            if (!item.closest(selector).length) {
                                // remove from memory
                                item.triggerHandler('beforeDestroy');
                                // no need to delete
                                // delete item
                            } else {
                                temp.push(item);
                            }
                        });
                        App._uiList = temp;
                    }

                }).ajaxStop(function () {
                    $('#preloader').hide();
                }).ajaxError(function () {
                    $('#preloader').hide();
                });


                // clear previous resources
                $(selector).bind('beforeDestroy', function () {
                    if ($().gritter) {
                        $.gritter.removeAll();
                    }
                    $('body>.modal-backdrop').remove();
                });

                // may be we won't need pushstate
                if ($().pushState) {
                    $('body').pushState({
                        debug: true,
                        load: selector,
                        onBeforePageLoad: function (plugin, href) {
                            $('body').addClass('loading');
                            var mainTop = $(selector).offset().top;
                            if ($(document).scrollTop() > mainTop) {
                                $('body,html').animate({scrollTop: mainTop - 20});
                            }

                            // trigger destroy for container :v
                            $(selector).triggerHandler('beforeDestroy');
                            // trigger window unload event
                            $(window).unload();
                        },
                        onAfterPageLoad: function (plugin, href) {
                            App.init($(selector));
                            $('body').removeClass('loading');
                            // trigger window load event
                            // because after init, some ui need load event to run
                            $(window).load();
                        },
                        ignore: function (link, elem) {
                            return (elem.attr('no-push') !== undefined
                                    || elem.attr('onclick') !== undefined
                                    || link === undefined
                                    // short code for testing, if not match return null
                                    || link.match(/^javascript|http/) !== null
                                    || link.charAt(0) === "#");
                        }
                    });
                }
            },
            //main function to initiate template pages
            init: function (selector, no_push) {

                if (selector.is('[ui-type]')) {
                    // init for this first
                    App.handle(selector);
                }

                if ($.browser.msie && $.browser.version.substr(0, 1) === '8') {
                    isIE8 = true; // checkes for IE8 browser version
                    $('.visible-ie8', selector).show();
                }

                if (no_push) {
                    Func.handleDeviceWidth(selector); // handles proper responsive features of the page
                    Func.handleMainMenu(selector); // handles main menu
                    Func.handleGoTop(selector); //handles scroll to top functionality in the footer            	
                    Func.handleSidebarToggler(selector);

                    Func.handleColorChooser();
                }


                // for all
                Func.handleUniform(selector); // handles uniform elements            
                Func.handleFixInputPlaceholderForIE(selector);

                // improvement:
                // each item has class ui-item
                // check if it's render type is abc => render abc up to that

                $('[ui-type]', selector).each(function () {
                    App.handle($(this));
                });
                // must delay until all widgets have been created


                if (isMainPage) { // this is for demo purpose. you may remove handleIntro function for your project
                    handleIntro(selector);
                }
            },
            // login page setup
            initLogin: function () {
                Func.handleLoginForm();
            },
            // wrapper function to scroll to an element
            scrollTo: function (el) {
                var pos = (el && el.length) ? el.offset().top : 0;
                $('html,body').animate({
                    scrollTop: pos
                }, 'slow');
            },
            fullScreen: function (mode) {
                if (mode === undefined) {
                    mode = !App.isFullScreen; // default is toggle mode
                }
                App.isFullScreen = mode === true;
                var docElement = mode ? document.documentElement : document;
                var request = mode
                        ? (docElement.requestFullScreen || docElement.mozRequestFullScreen || docElement.webkitRequestFullScreen || docElement.msRequestFullScreen)
                        : (docElement.exitFullscreen || docElement.mozCancelFullScreen || docElement.webkitExitFullscreen || docElement.msCancelFullScreen);

                if (typeof request !== "undefined" && request) {
                    request.call(docElement);
                }

            },
            // wrapper function to  block element(indicate loading)
            blockUI: function (el, loaderOnTop) {
                App.lastBlockedUI = el;
                $(el).block({
                    message: '<img src="themes/admin/img/loading.gif" align="abs'
                            + (loaderOnTop ? "top" : "middle") + '">',
                    css: {
                        border: 'none',
                        padding: '2px',
                        backgroundColor: 'none'
                    },
                    overlayCSS: {
                        backgroundColor: '#000',
                        opacity: 0.05,
                        cursor: 'wait'
                    }
                });
            },
            // wrapper function to  un-block element(finish loading)
            unblockUI: function (el) {
                $(el).unblock({
                    onUnblock: function () {
                        $(el).removeAttr("style");
                    }
                });
            },
            // set main page
            setMainPage: function (flag) {
                isMainPage = flag;
            },
            // set map page
            load: function (href, push) {
                var plugin = $('body').data('plugin_pushState');
                plugin._load(href, push);
            },
            getContainer: function (selector, parentEl) {
                var container;

                parentEl = parentEl || selector.attr('parent-el');
                if (parentEl)
                    container = $(parentEl);

                // get the closest parent that is scrollable, or body if not support this function
                if (!$().scrollParent) {
                    container = $('body');
                } else {
                    if (!container || !container.length)
                        container = selector.scrollParent();

                    // last try width body, the last element that can be scroll is document
                    if (container[0] === document || !container.length)
                        container = $('body');
                }
                return container;
            },
            getOffset: function (selector, parent) {
                if (parent && parent[0] === document.body) { // cos parent scroll is document
                    return selector.offset(); // offset is position with parent
                }
                var offset = selector.position();
                offset.top += parent.scrollTop();
                offset.left += parent.scrollLeft();
                return offset;
            }
        };


    }();

    // util function
    App.url = {
        add: function (url, key, value) {
            var opt = {};
            typeof key === 'string' ? opt[key] = value : opt = key;
            var query = [];
            $.each(opt, function (k) {
                var keyPair = k + '=' + this;
                if (url.indexOf(k) !== -1) {
                    url = url.replace(new RegExp('(' + k + ')\s*=\s*(.*?)(?=&|$)', 'g'), keyPair);
                } else {
                    query.push(keyPair);
                }
            });
            return query.length ? url + (url.indexOf('?') === -1 ? '?' : '&') + query.join('&') : url;
        },
        get: function (url, key) {
            return url.match(new RegExp(key + '=(.*?)(?=&|$)'))[1];
        },
        rename: function (url, file) { // rename file
            return url.replace(/([^\/]+\.\w+)(?=\?|$)/, file);
        }
    };

})(jQuery);
