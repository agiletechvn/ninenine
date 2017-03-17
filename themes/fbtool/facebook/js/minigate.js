var Config_GlobalHeader = {
    rootUrl: 'https://vtcgame.vn/accountsoauth/minigate.idoltv/'
}

MiniGateInit = function (data) {
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    var rootUrl = Config_GlobalHeader.rootUrl;

    $('#' + data.BtnTopup).click(function () {
        //ShowPopup(windowWidth, windowHeight, 'minigate_popup', '//vtcgame.vn/accountsoauth/minigate.idoltv/#nap-bang-the-cao', 'NẠP VCOIN');
		ShowPopup(windowWidth, windowHeight, 'minigate_popup', rootUrl+ '#nap-bang-the-cao', 'NẠP VCOIN');
    });

    $('#' + data.BtnCharge).click(function () {
        ShowPopup(windowWidth, windowHeight, 'minigate_popup', rootUrl+ '#nap-bang-the-cao', 'NẠP VCOIN');
    });

    $('#' + data.BtnRegister).click(function () {
        ShowPopupLogin(550, 460, 'BtnRegister', rootUrl+ '#dang-ky', "đăng ký")
    });
    $('#' + data.BtnLogin).click(function () {
        ShowPopupLogin(550, 460, 'BtnLogin',  rootUrl+ '#dang-nhap', "đăng nhập")
    });
	
    respondToSizingMessage = function (e) {
        switch (e.data.key) {
            case 'changeTitle':
                $('#popuptitle').html(e.data.html);
                break;
            case 'changeaccTotal':
                $('#accTotal').html(e.data.html);
                break;   
        }
       
    }
    window.addEventListener('message', respondToSizingMessage, false);

};

ShowPopup = function (width, height, popupclass, embedLink, title) {
    Minigate_ClosePopup();
    var html = '<div id="overlayPopup" onclick="Minigate_ClosePopup();" style="height:' + utils.documentHeight() + 'px; width:' + utils.documentWidth() + 'px; position: absolute;z-index: 1200;top: 0;left: 0;width: 100%;display: block;opacity: .90;background: #222;filter: alpha(opacity=90);-moz-opacity: 0.9;"></div><div id="minigate_popupContainer" class="ud_pop1" onclick="Minigate_ClosePopup();" >' +
                    '<div class="ud_dong"><a href="javascript:;" onclick="Minigate_ClosePopup();">' +
                        '<img src="' + Config_GlobalHeader.rootUrl + 'Content/images/cuahang-btn-close.png" width="39" height="39" style="margin-top: -25px; margin-left: 0px;"/></a></div>' +
                    '<div class="clear"></div>' +
                    '<iframe src="' + embedLink + '" width="' + width + '" height="' + height + '" scrolling="auto" style="border: none" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation" id="testID"> </iframe>' +
                     '</div>' +
                     '</div>' +
                    //'<div  id="overlay1"></div>' +
                    '<style id="styleOverlay1">' +
                    '#overlay1{position: absolute; z-index: 1200;	top: 0;	left: 0; width: 100%; height: 100%;	display: block; opacity: .90; background:#000; filter: alpha(opacity=90);-moz-opacity: 0.9; }' +
                        '.ud_dong {cursor: pointer;position: absolute;width: 20px;height: 20px;top: 100px;right: 170px;;-webkit-border-radius: 50%;-moz-border-radius: 50%;border-radius: 50%;padding: 10px 5px 5px 10px; }' +
                        '.ud_pop1 {cursor: pointer;padding: 2px 8px 8px 0px;position: relative;font-family: Arial, Helvetica, sans-serif;font-size: 12px;color: #333;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px;margin: 30px auto;}' +
                        '.ud_title_bank {margin: 0 0 15px 0;float: left;font-size: 22px;color: #028fc9;border-bottom: 2px #028fc9 dotted;width: 690px;padding: 0 0 5px 0;text-transform: uppercase;}' +
                    '</style>';
    $('BODY').append(html);

    var topOffset = ((($(window).height() - height) / 2) * 100) / $(window).height();
    var leftOffset = ((($(window).width() - width) / 2) * 100) / $(window).width();
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    var topOffset = 0;
    var leftOffset = 0;
    $('.ud_pop1').css('left', leftOffset + "%");
    $('.ud_pop1').css('z-index', 1300);
    $('.ud_pop1').css("top", topOffset - 5 + "%");
    $('.ud_pop1').css('position', 'fixed');
    $('#overlay1').css('height', windowHeight + 'px');
    $('#overlay1').css('width', windowWidth + 'px');
};

ShowPopupLogin = function (width, height, popupclass, embedLink, title) {
    $("#popupwrap").remove(); $("#overlayPopup").remove();
    $('BODY').append('<div id="overlayPopup" onclick="Minigate_ClosePopup();" style="height:' + utils.documentHeight() + 'px; width:' + utils.documentWidth() + 'px; position: absolute;z-index: 1200;top: 0;left: 0;width: 100%;display: block;opacity: .99;background: #222;filter: alpha(opacity=99);-moz-opacity: 0.99;"></div><div id="popupwrap"><a class="close-reveal-modal" onclick="utils.hidePopup()"><img id="logoVTC" src="' + Config_GlobalHeader.rootUrl + 'Content/images/logo_vtc.png" alt="" style="margin-bottom: 45px;" /><img id="imghidepopup" style="display:block;position: relative; margin-top: -22%; z-index: 2147483647; right: -99%; cursor: pointer" src="https://vtcgame.vn/accountsoauth/minigate.idoltv/Content/images/close-button.png" alt=""></a></div>');
    var embedlink = '<iframe id="iframepopupLogin" src="' + embedLink + '" width="' + 375 + '" height="' + 650 + '" scrolling="no" style="border: none; background-image: none;" sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"> </iframe>';
    $("#popupwrap").append(embedlink);
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    var topOffset = (((windowHeight - height) / 2) * 100) / windowHeight;
    var leftOffset = (((windowWidth - width) / 2) * 100) / windowWidth;
    $('#popupwrap').css('left', "36%");
    $('#popupwrap').css("top", '5%');
    $('#popupwrap').css('z-index', 9999999);
    $('#popupwrap').css('position', 'fixed');
};

PopupRegisterLogin = function (type) {
    var appPath = 'https://vtcgame.vn/accountsoauth/minigate.idoltv_beta/'
    var input = {
        type: type
    };

    utils.loading();
    $.ajax({
        type: "GET",
        url: appPath + "api/popup/PopupRegisterLogin",
        data: input,
        contentType: "application/json; charset=utf-8",
        dataType: "html",
        success: function (data) {
            utils.unLoading();
            $("#popupwrap").remove(); $("#overlayPopup").remove();
            $('BODY').append('<div id="popupwrap" class="reveal-modal dangnhap-popup"></div><div id="overlayPopup" onclick="utils.hidePoup();" style="height:' + utils.documentHeight() + 'px; width:' + utils.documentWidth() + 'px; position: absolute;z-index: 1200;top: 0;left: 0;width: 100%;display: none;opacity: .80;background: #222;filter: alpha(opacity=60);-moz-opacity: 0.8;"></div>');
            $("#popupwrap").html(data);
            var width = 440;
            var height = 524;
            var topOffset = (((utils.windowHeight() - height) / 2) * 100) / utils.windowHeight();
            var leftOffset = (((utils.windowWidth() - width) / 2) * 100) / utils.windowWidth();
            $('#popupwrap').css('left', leftOffset + "%");
            $('#popupwrap').css("top", topOffset + '%');
            $('#popupwrap').css('z-index', 1201);
            $('#popupwrap').css('position', 'fixed');
        },
    });
};

Minigate_AddReference = function (url, type) {
    var fileref = "";
    if (type == "js") {
        fileref = document.createElement("script");
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", url);
    } else if (type == "css") {
        fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", url);
    }
    if (typeof fileref != "undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref);
};

Minigate_ClosePopup = function () {
    try {
        $('#popupwrap').remove();
        $('#overlay1').remove();
        $('#overlayPopup').remove();
        //
        $('#minigate_popupContainer').remove();
        $('#testID').remove();
        $('#overlay1').remove();
        $('#styleOverlay1').remove();    
    } catch (err) { }
};

(function ($) {
    $.QueryString = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));
})(jQuery);

SetCookie= function (name, value, days)   { if (days) { var date = new Date(); date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); var expires = "; expires=" + date.toGMTString(); } else var expires = ""; document.cookie = name + "=" + value + expires + "; path=/"; };
GetCookie= function (name) { var nameEQ = name + "="; var ca = document.cookie.split(';'); for (var i = 0; i < ca.length; i++) { var c = ca[i]; while (c.charAt(0) == ' ') c = c.substring(1, c.length); if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length); } return null; };
DeleteCookie=function (name) {SetCookie(name, "", -1); };
