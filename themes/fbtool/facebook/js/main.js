!function (f, b, e, v, n, t, s) {
    if (f.fbq)
        return;
    n = f.fbq = function () {
        n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq)
        f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
}(window,
        document, 'script', '//connect.facebook.net/en_US/fbevents.js');

fbq('init', '734644073302924');
fbq('track', "PageView");


(function (d, s, id) {
    var z = d.createElement(s);
    z.type = "text/javascript";
    z.id = id;
    z.async = true;
    z.src = "//static.zotabox.com/0/f/0fce81ed588f8b6bf9404f9d49e19d1b/widgets.js";
    var sz = d.getElementsByTagName(s)[0];
    sz.parentNode.insertBefore(z, sz)
}(document, "script", "zb-embed-code"));

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-69155076-10', 'auto');
ga('send', 'pageview');

(function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
    });
    var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src =
            '//www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-WZF2KB');

// 视频流的地址信息
var streamInfo = null;
var popUpList = new Array();
var isPopUp = false;

$.modal({
    onClose: popUpClosed
});

function showPopUp(url) {
    if (isPopUp) {
        popUpList.push(url);
        return;
    }
    if (popUpList.length == 0) {
        isPopUp = true;
        $.modal().open({
            onOpen: function (el, options) {
                $.get(url, function (data) {
                    el.html(data);
                });
            }
        });
        return;
    }
}

function popUpClosed() {
    isPopUp = false;
    if (popUpList.length > 0) {
        showPopUp(popUpList.shift());
    }
}

function ClosePopup() {
//    $.modal().close();
    return false;
}

// 修复背景色
function resize() {

    var wHeight = $(window).height();
    var dHeight = $(document).height();
    var logoHeight = $(".logo").height();
    var menuHeight = $(".menulist").height();
    var loginHeight = $(".bg_login").height();
    var mainCntHeight = $(".mainContentBg").height();

    dHeight = Math.min(dHeight, mainCntHeight);
    $(".sidebar").css("min-height", Math.max(wHeight, dHeight));
    $(".categoryBg").css("min-height", Math.max(wHeight, dHeight));
    $(".categoryBg").css("background-position-y", (logoHeight + menuHeight + loginHeight) + "px");
}

$(document).ready(function () {
    resize();
});
$(window).resize(function () {
    setTimeout(resize, 50);
});


$(".search span").on("click", function () {
    var roomid = document.getElementById("searchinput").value;
    $.ajax({
        url: '/index.php/Api/getRoom?roomid=' + roomid,
        success: function (data) {
            if (data == 1) {
                window.location.href = "/" + roomid;
            } else {
                alert("Phòng bạn đang tìm không tồn tại");
            }
        }
    });
});

$(".search input").keydown(function (event) {
    if (event.keyCode == 13) {
        var roomid = document.getElementById("searchinput").value;
        $.ajax({
            url: '/index.php/Api/getRoom?roomid=' + roomid,
            success: function (data) {
                if (data == 1) {
                    window.location.href = "/" + roomid;
                } else {
                    alert("Phòng bạn đang tìm không tồn tại");
                }
            }
        });
    }
});

// 菜单选择事件
$(".menulist li").on("click", function () {

    // 移除无效选择
    $(".menulist li").each(
            function () {
                $(this).removeClass("select");
            }
    );

    // 添加选择样式
    var element = $(this);
    element.addClass("select");

    // 根据情况判断
    switch (element.attr("id")) {

        case "m1":
            changeVideoState(true);
            changeCategory($(this).attr("name"), $(this).attr("key"));
            break;
        case "m2":
            changeVideoState(false);
            $(".box_idol_home").load('/index.php/order/', function (responseText, textStatus, XMLHttpRequest) {
                setTimeout(resize, 500);
            });
            break;
        case "m3":
            changeVideoState(false);
            $(".box_idol_home").load('/index.php/User/toolItem', function (responseText, textStatus, XMLHttpRequest) {
                setTimeout(resize, 500);
            });
            break;
        case "m4":
            gotoEditInfo();
            break;
        case "m5":
            gotoNap();
            break;
        case "m6":
            changeVideoState(false);
            $(".box_idol_home").load('/index.php/Guide/faq', function (responseText, textStatus, XMLHttpRequest) {
                setTimeout(resize, 500);
            });
            break;
        case "m7":
            changeVideoState(false);
            $(".box_idol_home").load('/index.php/Guide/news_list', function (responseText, textStatus, XMLHttpRequest) {
                setTimeout(resize, 500);
            });
            break;
    }
});

// 分类选择事件
$(".category li ul li").on("click", function () {
    changeVideoState(false);
    changeCategory($(this).attr("name"), $(this).attr("key"));
});

$(".activeIcon ul li").on("click", function (e) {
    switch ($(this).attr("name")) {
        case "1":
            showCDkey();
            break;
        case "2":
            showPopUp("/index.php/Active/event1");
            break;
        case "3":
            showPopUp("/index.php/Active/event4");
            break;
        case "4":
            showPopUp("/index.php/Active/event2");
            break;
        case "5":
            break;
    }
});

function showCDkey() {
//    var html = '<head><link type="text/css" rel="stylesheet" href="Public/vtc/css/style.css%3Fv=9.css"></head><body><div class="event-giftcode"><a class="btn-close" href="javascript:ClosePopup();"><img src="Public/vtc/images/btn-close.png"></a><h3>Event giftcode</h3><span></span><p>Nhập Giftcode để nhận trang phục lộng lẫy.</p><input id="inputText" name="seri" type="text" placeholder="Nhập giftcode tại đây"/><p class="thong-bao"></p><a class="bt-hoantat" href="index.html#" onclick="Popup1Ok()" >HOÀN TẤT</a></div></body>';
//    $.modal().open({
//        onOpen: function (el, options) {
//            el.html(html);
//        }
//    });
}
;

function Popup1Ok(cdKey) {
    // 判断是否登录
    $.ajax({
        type: "get",
        url: "/index.php/login/vtcIsLogin",
        cache: false,
        success: function (data) {
            var obj = JSON.parse(data);
            if (obj.data == false) {
                // 未登录
                setCookie("backUrl", "http://fbtool.dev", 3600000);
                var rootUrl = 'https://vtcgame.vn/accountsoauth/minigate.idoltv/';
                ShowPopupLogin(550, 460, 'BtnLogin', rootUrl + '#dang-nhap', "đăng nhập");
                return;
            } else {
                // 已登录
                cdKey = $("#inputText").val();
                $.ajax({
                    url: "/index.php/CDKey/CheckCDKey?cdKey=" + cdKey,
                    success: function (data) {
                        var obj = JSON.parse(data);
                        if (obj.data == false) {
                            if (obj.info == -1)
                                $(".thong-bao").html("Giftcode đã được sử dung");
                            else if (obj.info == -2)
                                $(".thong-bao").html("Giftcode không chính xác");
                            else if (obj.info == -3)
                                $(".thong-bao").html("Loại giftcode này chỉ được phép sử dụng 1 lần");
                            else if (obj.info == -4)
                                $(".thong-bao").html("Giftcode này đã hết hạn sử dung");
                        } else {
                            OpenPopup1Step2(obj.status);
                        }
                    }
                });
            }
        }
    });
}

function OpenPopup1Step2(html) {
    var head = '<head><link type="text/css" rel="stylesheet" href="Public/vtc/css/style.css%3Fv=9.css"></head><body><div class="popup-nho"><a href="javascript:ClosePopup();" class="btn-close"><img src="Public/vtc/images/btn-close.png"></a><span class="title-giftcode">Event giftcode</span><div class="infor-giftcode"><p>Nhập Giftcode để nhận trang phục lộng lẫy.</p><p>Chúc mừng bạn đã nhận được những vật phẩm dưới đây. Vật phẩm sẽ được gửi vào tủ đồ của bạn. Hãy đăng nhập, vào phòng và xem tủ đồ để mặc thử ngay nhé.</p></div>';

    var end = '</div>';

    var result = head + html + end;

    var html2 = '      <script src="Public/vtc/js/owl.carousel.js%3Fv=5" type="text/javascript"></' + 'script><script src="Public/vtc/js/app.js%3Fv=5" type="text/javascript"></' + 'script></body>';

    ClosePopup();

    $.modal().open({
        onOpen: function (el, options) {
            el.html(result + html2);
        }
    });

}

// Iwant按钮事件
$("#beIdol").on("click", function (e) {
    $.ajax({
        type: "get",
        url: "/index.php/login/vtcIsLogin",
        cache: false,
        success: function (data) {
            var obj = JSON.parse(data);
            if (obj.data == false) //未登录
            {
                setCookie("backUrl", "http://fbtool.dev", 3600000);
                var rootUrl = 'https://vtcgame.vn/accountsoauth/minigate.idoltv/';
                ShowPopupLogin(550, 460, 'BtnLogin', rootUrl + '#dang-nhap', "đăng nhập");
                return;
            } else //已登录
            {
                $.ajax({
                    type: "get",
                    url: "/index.php/login/isVtcStar",
                    cache: false,
                    success: function (data) {
                        var obj = JSON.parse(data);
                        if (obj.data == false) //不是主播
                        {
                            changeVideoState(false);
                            $(".box_idol_home").load('/index.php/User/sign_view', function (responseText, textStatus, XMLHttpRequest) {
                                this;
                            });
                            return;
                        } else //已登录
                        {
                            window.location.href = "/";
                            return;
                        }
                    }
                });
            }
        }
    });
});

function gotoNap() {
    $.ajax({
        type: "get",
        url: "/index.php/login/vtcIsLogin",
        cache: false,
        success: function (data) {
            var obj = JSON.parse(data);
            var windowHeight = $(window).height();
            var windowWidth = $(window).width();
            var rootUrl = 'https://vtcgame.vn/accountsoauth/minigate.idoltv/';
            if (obj.data == false) {
                setCookie("backUrl", "http://fbtool.dev", 3600000);
                ShowPopupLogin(550, 460, 'BtnLogin', rootUrl + '#dang-nhap', "đăng nhập");
            } else {
                ShowPopup(windowWidth, windowHeight, 'minigate_popup', rootUrl + '#nap-bang-the-cao', 'NẠP VCOIN');
            }
        }
    });
}

function gotoEditInfo() {
    $.ajax({
        type: "get",
        url: "/index.php/login/vtcIsLogin",
        cache: false,
        success: function (data) {
            var obj = JSON.parse(data);
            var windowHeight = $(window).height();
            var windowWidth = $(window).width();
            var rootUrl = 'https://vtcgame.vn/accountsoauth/minigate.idoltv/';
            if (obj.data == false) {
                setCookie("backUrl", "http://fbtool.dev", 3600000);
                ShowPopupLogin(550, 460, 'BtnLogin', rootUrl + '#dang-nhap', "đăng nhập");
            } else {
                changeVideoState(false);
                $(".box_idol_home").load('/index.php/User/info_edit/', function (responseText, textStatus, XMLHttpRequest) {
                    setTimeout(resize, 500);
                });
            }
        }
    });
}

function getVideoInfo() {
    var obj = {
        nickname: "Hằng Moon",
        online: "6748",
        intro: "Moon bị dở hơi, nên phải cố gắng ",
        num: "31199730",
        ucuid: "409954",
        rtmpInfo: {
            streamId: "SUcRQdQPQWTQXUcQURSbXTRXTRQeQeaQSV",
            app: "5showcam",
            streamIp: [
                "117.103.206.15:1935",
                "117.103.206.16:1935"
            ]
        }
    };
    indexVideoInfo(obj);
}

function indexVideoInfo(idolInfo) {
    streamInfo = idolInfo.rtmpInfo;
    if (streamInfo == null) {
        changeVideoOffline();
    } else {
        changeVideoOnline(idolInfo);
    }
}

function getIdolStream() {
    return streamInfo;
}

function changeVideoOffline() {
//    var h = '<iframe width="600" height="320" src="https://www.youtube.com/embed/r4cXemGIig0?list=PLdBGr-wfeHDgOtYJlHuwkeeKgTR3D6wG0" frameborder="0" allowfullscreen></iframe>';
    var h = '<div data-type="youtube" data-video-id="bTqVqk7FSmY"></div>';
    $(".videoplace").css("width", 600);
    $(".avata-video").css("background-image", "url('/Public/idol/images/avata-video.png')");
    $(".videoplace").html(h);
    $(".text-video h4").html("Quà tặng âm nhạc");
    $(".text-video p").html("Vào phòng để tặng quà và giao lưu cùng em anh ơi");
    $(".userCount").html(9999 + Math.ceil(Math.random() * 10000));
    $(".icon-btn-vaoluon a").attr("href", "https://www.youtube.com/channel/UC69jE6HMJpa2gQkoeqbaDRg");

}

function changeVideoOnline(idolInfo) {
    $(".videoplace img").remove();
    $(".videoplace").append('<div id="videoplace"></div>');

//    insertVideo();

    $(".avata-video").css("background-image", "url('/uc/uc_server/avatar.php?uid=" + idolInfo.ucuid + "&size=middle')");
    $(".text-video h4").html(idolInfo.nickname);
    $(".text-video p").html(idolInfo.announce);
    $(".userCount").html(idolInfo.online);
    $(".icon-btn-vaoluon a").attr("href", "/" + idolInfo.num);
}

function insertVideo() {
    var params = {};
    var flashvars = {};
    var attributes = {};

    // Flash参数
    params['menu'] = false;
    params['wmode'] = "direct";
    params['allownetworking'] = "all";
    params['seamlesstabbing'] = false;
    params['allowscriptaccess'] = "always";

    swfobject.embedSWF("/Public/idol/UserVideo.swf", "videoplace", "480", "320", "10.0.22.87", "expressInstall.swf", flashvars, params, attributes);
}

function changeCategory(name, key) {
    var html = '';
    var url = "facebook/ajax/starListbyId?sid=" + key;

    html += '<div class="box_idol_home">';
    html += '<div class="border-title"><div class="title">' + name + '</div></div>';
    html += '<div id="idolList" class="idol-list"><div class="loading">Idol is coming !!!</div></div>';

    $(".box_idol_home").html(html);
    resize();

    $('#idolList').on('click', '.idol-info>a', function () {
//        fromFlashChoosePopup();
        var yid = $(this).attr('data-yid');//.attr('href').match(/\d+/)[0];
        playVideo(yid);
        return false;
    });

    // 加载分类主播
    $.post(url, {}, categoryFun);
}


function playVideo(yid) {
    var html = '<div style="height:0;padding-bottom:75%"><iframe src="http://www.youtube.com/embed/'
            + yid + '?autoplay=1&showinfo=0&controls=0" frameborder="0" style="height:360px!important;width:100%!important;" width="100%" height="100%"/></div>';
    $('#videoplace').html(html);
}

function categoryFun(text, status) {
    var starList = JSON.parse(text);

    // play random video
    var randomYid = starList[Math.floor(Math.random() * starList.length)].yid;
    playVideo(randomYid);

//    plyr.setup();

    var h = "";
    for (var i = 0; i < starList.length; i++) {
        h += buildIdol(starList[i]);
    }
    $("#idolList").html(h);
    setTimeout(resize, 500);
}

function loginCallbackJS(url) {
    $.ajax({
        type: "get",
        url: url,
        cache: false,
        success: function (data) {
            alert(data);
            var dataObj = JSON.parse(data);
            if (dataObj.code == 1)
                loginInfoToHtml(dataObj.info);
            else
                alert("login error.");
        }
    });
}

function gotoSelfRoom(roomId) {
    if (roomId == null) {
        return;
    }
    window.location.href = "/" + roomId;
}

function loginInfoToHtml(info)
{
    var height = 215;
    var htmlStr =
            '<div class="account">' +
            '<span class="avatar"><img src="' + info.ucApi + '/avatar.php?uid=' + info.ucUid + '&size=middle" height="75" width="75"/></span>' +
            '<div class="name">' +
            '<a href="javascript:gotoSelfRoom(' + info.roomId + ');">' + info.nickName + '</a><br/>(' + info.userName + ')' +
            '<p><a onclick = "javascript:logoutToPhp(); return false;" style="cursor: pointer;">Đăng xuất</a></p>' +
            '</div>' +
            '<div class="clear"></div>' +
            '<div class="describe">' +
            '<div class="text_left">Độ HOT:</div>' +
            '<div class="level_right">' +
            '<img src="/Public/vtc/images/icon_level_45×45/IDOL/idol' + info.idolId + '.png" height="20" class="fl" />' +
            '<div class="levelup"><span style="width:' + info.idolWidth + '%;"></span></div>' +
            '<img src="Public/vtc/images/icon_level_45×45/IDOL/idol' + info.nextIdolId + '.png" height="20" class="fl" />' +
            '</div>' +
            '<div class="clear"></div>' +
            '<div class="text_left">Độ giàu có:</div>' +
            '<div class="level_right">' +
            '<img src="/Public/vtc/images/icon_level_45×45/VIP/rich' + info.richId + '.png" height="20" class="fl" />' +
            '<div class="levelup"><span style="width:' + info.richWidth + '%;"></span></div>' +
            '<img src="/Public/vtc/images/icon_level_45×45/VIP/rich' + info.nextRichId + '.png" height="20" class="fl" />' +
            '</div>' +
            '<div class="clear"></div>' +
            '<div class="text_left">Số Vcoin:</div>' +
            '<div class="level_right">' + info.coin + '<img src="/Public/vtc/images/Vcoin.png" /><a id="btnCharge" class="recharge" style="cursor: pointer;">NẠP</a></div>' +
            '<div class="clear"></div>' +
            '<div class="text_left">Số MiC:</div>' +
            '<div class="level_right">' + info.earnbean + ' <img src="/Public/vtc/images/bean.png" /></div>' +
            '<div class="clear"></div>';
    if (info.sign == 'y') {
        htmlStr += '<div class="text_left">Mic tháng:</div>';
        htmlStr += ' <div class="level_right">' + info.nowEarnbean + '<img src="/Public/vtc/images/bean.png" /></div>' +
                '<div class="clear"></div>';
        height = 240;
    }
    htmlStr +=
            '</div>' +
            '</div>' +
            '<div class="clear"></div>';

    $(".bg_login").html(htmlStr);
    $(".bg_login").css("height", height);
}


function logout() {
    var html = "";
    html += '<div class="left"><a href="javascript:void(0);" class="hvr-pop"><span class="imgEl sign"></span></a></div>';
    html += '<div class="right"><a href="javascript:void(0);" class="hvr-pop"><span class="imgEl login"></span></a></div>';

    $(".bg_login").html(html);
    $(".bg_login").css("height", 56);

    // 用户登录事件
    $(".bg_login .left a").on("click", function () {

        $(this).blur(); // 失去焦点[修复IE虚框]
        setCookie("backUrl", "http://fbtool.dev", 3600000);
        ShowPopupLogin(550, 460, 'BtnLogin', Config_GlobalHeader.rootUrl + '#dang-nhap', "đăng nhập");
    });

    // 用户注册事件
    $(".bg_login .right a").on("click", function () {

        $(this).blur(); // 失去焦点[修复IE虚框]
        setCookie("backUrl", "http://fbtool.dev", 3600000);
        ShowPopupLogin(550, 460, 'BtnRegister', Config_GlobalHeader.rootUrl + '#dang-ky', "đăng ký");
    });
}

function logoutToPhp() {
    var toUrl = '/index.php/login/vtcLogout';
    $.ajax({
        type: "get",
        url: toUrl,
        cache: false,
        success: function (data) {
            logout();
        }
    });
}

//loginCallbackJS("http://localhost/index.php/login/vtcCallback");

new jQueryCollapse($("#cat1"), {
    open: function () {
        this.slideDown(150);
    },
    close: function () {
        this.slideUp(150);
    }
});
new jQueryCollapse($("#cat2"), {
    open: function () {
        this.slideDown(150);
    },
    close: function () {
        this.slideUp(150);
    }
}); // 构建主播数据
function buildIdol(userinfo) {

    var html = '';
    var idolLevel = userinfo.level;
    var idolRoomNum = userinfo.roomnum;
    var userViewCount = userinfo.online;
    var idolLiveTime = userinfo.starttime;

    var idolName = userinfo.nickname;
    var idolQuote = userinfo.announce;
    var idolNotes = userinfo.intro;

    var isLive = userinfo.broadcasting == 'y';
//    var idolPic = userinfo.snap;
    var idolPic = 'https://i.ytimg.com/vi/' + userinfo.yid + '/hqdefault.jpg';

    if (!idolPic) {
        idolPic = "";
    }

    html += '<div class="idol-info">';
    html += '	<a href="/' + idolRoomNum + '" data-yid="'+userinfo.yid+'">';
    html += '		<div class="img_idol" style="background-image: url(\'' + idolPic + '\');"><div class="black-frame"></div></div>';
    html += '		<div class="icon-room-id idol-level' + idolLevel + '"></div>';
    html += '		<div class="name-room-id">' + idolName + '</div>';
    html += '		<div class="room-live' + (isLive ? ' islive' : '') + '"></div>';
    html += '		<div class="note-idol">' + idolNotes + '</div>';
    html += '		<div class="room-id-update">Room ID: ' + idolRoomNum + '</div>';
    html += '		<div class="user-icon"></div><div class="user-view">' + userViewCount + '</div>';
    html += '		<div class="time-idol"><div class="time-icon"></div>' + idolLiveTime + '</div>';
    html += '		<div class="quote">' + idolQuote + '</div><div class="play"></div>';
    html += '	</a>';
    html += '</div>';


    return html;
}

function buildNews(newsinfo) {

    var html = '';
    var pic = newsinfo.picpath;
    var link = newsinfo.linkurl;

    if (!pic) {
        pic = "";
    }

    html += '<div><a href = "' + link + '"><img src="' + pic + '"></a></div>';

    return html;
}


function changeVideoState(needShow) {
    if (needShow) {
        $(".video-frame").show();
        $(".banner-bottom").show();
    } else {
        $(".video-frame").hide();
        $(".banner-bottom").hide();
        $(".box_idol_home").html('<div id ="loading" style="font-size: 100px; text-align: center; color: #eeeeee; ">Loading...</div>');
        $("#loading").height($(window).height() - 300);
        $("#loading").css("line-height", $("#loading").height() + "px");
    }
}

function indexPageIsLogin(forceRefresh) {

    var dataObj = {
        code: 0,
        info: "Error"
    };
    if (dataObj.code == 1)
        loginInfoToHtml(dataObj.info);

}

function start(rollpics) {

    var h = "";

    for (var i = 0; i < rollpics.length; i++) {
        h += buildNews(rollpics[i]);
    }

    $("#newList").html(h);
    getVideoInfo();

    setTimeout(resize, 100);
}
;

function goNews(newsid) {
    changeVideoState(false);
    if (newsid == "intro") {
        $(".box_idol_home").load('/index.php/User/info_edit/', function (responseText, textStatus, XMLHttpRequest) {
            setTimeout(resize, 500);
        });
        return;
    }
    $(".box_idol_home").load('/index.php/Ann/view/annid/' + newsid, function (responseText, textStatus, XMLHttpRequest) {
        this;
    });
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(name) != -1)
            return c.substring(name.length, c.length);
    }
    return "";
}

function ShowPopupBoxAdv(html) {
    var height = 600;
    var width = 600;
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    var topOffset = (((windowHeight - height) / 2) * 100) / windowHeight;
    var leftOffset = (((windowWidth - width) / 2) * 100) / windowWidth;

//    $('BODY').append('<iframe id="popupFrame" width="' + width + '" height="' + height + '" scrolling="no" frameborder="0" marginheight="0" marginwidth="0" style="border: none;left:' + leftOffset + '%;top:' + topOffset + '%;position:absolute;z-index:120;" src="index.php/Show/show_adv.html"></iframe>');
}

function showAdv() {
    if (getCookie("_SESSION_event_adv") == "") {
        ShowPopupBoxAdv();
    }
}

function checkitempopup() {
    var height = 500;
    var width = 700;
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    var topOffset = (((windowHeight - height) / 2) * 100) / windowHeight;
    var leftOffset = (((windowWidth - width) / 2) * 100) / windowWidth;


//    $('BODY').append('<iframe id="popupFrameItemReward" width="' + width + '" height="' + height + '" scrolling="no" frameborder="0" marginheight="0" marginwidth="0" style="border: none;left:' + leftOffset + '%;top:' + topOffset + '%;position:absolute;z-index:120;" src="index.php/Check/checkFirstLoginItems.html"></iframe>');
}

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return unescape(r[2]);
    return null;
}

$(document).ready(function () {
    var paramNews = GetQueryString("news");
    if (paramNews != null) {
        goNews(paramNews);
        indexPageIsLogin(false);
    } else {
        changeCategory("danh sách idol", 0);
        start([{
                "picpath": "themes\/fbtool\/facebook\/Public\/rollpic\/2016-05\/5746f60a69787.jpg",
                "linkurl": "http:\/\/blog.fbtool.dev\/"
            }, {
                "picpath": "themes\/fbtool\/facebook\/Public\/rollpic\/2016-05\/575635019db0a.png",
                "linkurl": "http:\/\/fbtool.dev\/index.php?news=26"
            }, {
                "picpath": "themes\/fbtool\/facebook\/Public\/rollpic\/2016-05\/5763c3c63a3df.png",
                "linkurl": "http:\/\/fbtool.dev\/index.php?news=227"
            }]);
        checkitempopup();
        showAdv();
        indexPageIsLogin(true);
    }
    automaticPopupBoxFroHomePage();
});



// 用户登录事件
$(".bg_login .left a").on("click", function () {

    $(this).blur(); // 失去焦点[修复IE虚框]
    setCookie("backUrl", "http://fbtool.dev", 3600000);
    ShowPopupLogin(550, 460, 'BtnLogin', Config_GlobalHeader.rootUrl + '#dang-nhap', "đăng nhập");
});

// 用户注册事件
$(".bg_login .right a").on("click", function () {

    $(this).blur(); // 失去焦点[修复IE虚框]
    setCookie("backUrl", "http://fbtool.dev", 3600000);
    ShowPopupLogin(550, 460, 'BtnRegister', Config_GlobalHeader.rootUrl + '#dang-ky', "đăng ký");
});

// 自动弹窗
function automaticPopupBoxFroHomePage() {

    var obj = {
        status: 1,
        info: "",
        data: false
    };
    if (obj.data == false) //未登录
    {
        if (!isLogged) {
            fromFlashChoosePopup();
            setCookie("_FIRST_TIME_POPUP_FOR_HOME_PAGE", "enable", 60 * 60 * 24);
        }
    }

}

function fromFlashChoosePopup() {
    showPopUp("themes/fbtool/facebook/Home/Tpl/LoginPopupBox/Index/index.html?v=1.0.1");
}

function loginFromFlash() {
    setCookie("backUrl", "http://fbtool.dev", 3600000);
//    ShowPopupLogin(550, 460, 'BtnLogin', Config_GlobalHeader.rootUrl + '#dang-nhap', "đăng nhập");
//    ClosePopup();
    location.href = '/en/facebook/login';
    return false;
}

function registerFromFlash() {
    setCookie("backUrl", "http://fbtool.dev", 3600000);
    ShowPopupLogin(550, 460, 'BtnRegister', Config_GlobalHeader.rootUrl + '#dang-ky', "đăng ký");
    ClosePopup();
}

//设置cookie
function setCookie(cname, cvalue, time) {
    var d = new Date();
    d.setTime(d.getTime() + (time * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

//获取cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1);
        if (c.indexOf(name) != -1)
            return c.substring(name.length, c.length);
    }
    return "";
}

// 用户是否需要登出，因为获取余额失败，过期
function isNeedLogOutFromPHP() {
    logoutRequest();
    var data =
            '<div class="box_login">' +
            '<div class="log_acc">HẾT HẠN ĐĂNG NHẬP</div>' +
            '<div class="clear padding_top"></div>' +
            '<p style="font-size: 16px">Phiên đăng nhập của bạn đã hết hạn.</p>' +
            '<div class="clear padding_top"></div>' +
            '<p style="font-size: 16px">Hãy đăng nhập lại để tiếp tục giao lưu cùng Idol nhé!</p>' +
            '<div class="clear padding_top"></div>' +
            '<table width="90%" border="0" cellspacing="0" cellpadding="3" align="center">' +
            '<tr>' +
            '<td colspan="2" align="center" >&nbsp;&nbsp;&nbsp;<button onclick="javascript:reloadThisPage();">ĐĂNG NHẬP LẠI</button></td>' +
            '</tr>' +
            '</table>' +
            '</div>';
    //ShowPopupBox(530, 180, data);
    $.modal().open({
        onOpen: function (el, options) {
            el.html(data);
        }
    });
}

// 请求登出
function logoutRequest() {
    $.ajax({
        url: '/index.php/login/vtcLogout'
    });
}

// 重新加载当前页面
function reloadThisPage() {
    window.location.reload();
}
