// 系统报错回调[主站]
function toWebsite() {
    window.location.href = "http://fbtool.dev/";
}
// 系统报错回调[刷新]
function toRefresh() {
	window.location.reload();
    // location.href = "login.html?type=" + type;
}

// Flash回调修改金币数量
function jschangeCoin() {
	try
	{
		if (document.getElementById("userVcoinCount")) 
		{
			$.ajax({
				type : "get",
				url : "/index.php/Pay/VtcGetUserCoinReal",
				success : function(data) 
				{
					var obj = JSON.parse(data);
					document.getElementById("userVcoinCount").innerHTML = obj.data + " Vcoin";
				}
			});
		}
	}
	catch (e)
	{}
}
// Flash回调修改房间名称
function jsGetTitleName(jsTitleName) {
    // Just make flash happy !!!
}

// GetDomain
function getDomain() {
	return "http://" + document.domain;
}

// GetRoomId
function getRoomId() {
	return window.location.pathname.replace("/", "");
}

// 创建前置空格
function getBlank(count) {
    var result = "";
    for (var i = 0; i < count; i++) {
        result += "&nbsp; &nbsp; &nbsp; ";
    }
    return result;
}

// 遍历显示数据
function allPrpos(obj, count) {
    var props = "";
    var blank = getBlank(count);
    for (var p in obj) {
        if (typeof(obj[p]) != "function") {
            if (typeof(obj[p]) != "object") {
                props += blank + p + "=" + obj[p] + ";<br />";
            }
            else {
                props += blank + p + "=<br />" + allPrpos(obj[p], count + 1) + ";<br />";
            }
        }
    }
    return props;
}

// 添加到调试控制台[DEBUG]
function addToConsole(content, color) {
    if (document.getElementById("debugFrame")) {
        var p = document.createElement("p");
        p.innerHTML = content; p.style.color = color;
        document.getElementById("debugFrame").appendChild(p);
    }
}

// 获取URL链接指定参数[系统用]
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var regKeyValue = window.location.search.substr(1).match(reg);
    if (regKeyValue != null) return unescape(regKeyValue[2]); return null;
}

// 获取工具条高度
function getTValue() {
    return 36;
}

// 获取宽度函数[自适应]
function getWValue(w) {
    var width = w > 1400 ? 1400 : w < 1000 ? 1000 : w;
	if (renderLevel == 2) { if (width > 1200) { width = 1200; } }
	if (renderLevel == 1) { if (width > 1120) { width = 1120; } }
	if (renderLevel == 0) { if (width > 1024) { width = 1024; } } return width;
}
// 获取高度函数[自适应]
function getHValue(h) {
    var height = h > 900 ? 900 : h < 500 ? 500 : h;
	if (renderLevel == 2) { if (height > 800) { height = 800; } }
	if (renderLevel == 1) { if (height > 760) { height = 760; } }
	if (renderLevel == 0) { if (height > 720) { height = 720; } } return height;
}

// 设置Flash页面大小[自适应]
function setDimensions() {

    var winWidth = 0;
    var winHeight = 0;

    var isIE6 = (!!window.ActiveXObject) && (!window.XMLHttpRequest);

    if (window.innerWidth) {
        winWidth = window.innerWidth;
    }
    else if ((document.body) && (document.body.clientWidth)) {
        winWidth = document.body.clientWidth;
    }

    if (window.innerHeight) {
        winHeight = window.innerHeight;
    }
    else if ((document.body) && (document.body.clientHeight)) {
        winHeight = document.body.clientHeight;
    }

    if (document.documentElement &&
        document.documentElement.clientWidth &&
        document.documentElement.clientHeight) {

        if (winWidth == 0) {
            winWidth = document.documentElement.clientWidth;
        }
        if (winHeight == 0) {
            winHeight = document.documentElement.clientHeight;
        }
    }

    if (document.getElementById("joytipId")) {
        document.getElementById("joytipId").style.width = (getWValue(winWidth) - getTValue()) + "px";
        document.getElementById("joytipId").style.height = (getHValue(winHeight) - getTValue()) + "px";
    }
	
    if (document.getElementById("container")) {
        document.getElementById("container").style.width = getWValue(winWidth) + "px";
        document.getElementById("container").style.height = (getHValue(winHeight) - getTValue()) + "px";
    }
	
    if (document.getElementById("warp")) {
        document.getElementById("warp").style.width = getWValue(winWidth) + "px";
        document.getElementById("warp").style.height = (getHValue(winHeight) - getTValue()) + "px";
    }
	
    if (document.getElementById("gameUI")) {
        document.getElementById("gameUI").style.width = getWValue(winWidth) + "px";
        document.getElementById("gameUI").style.height = (getHValue(winHeight) - getTValue()) + "px";
    }
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1);
		if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
	}
	return "";
}

// BaseInfo
var videoLazy = 0;
var totalFrame = 0;
var totalFrameLazy = 0;
var timeTotal = 0;
var downTimes = 0;

var lastUpdateTime = Date.now();
var enterFrameTime = Date.now();
var videoEnterFrameTime = Date.now();

// IsChrome
function isChrome() {
	return window.navigator.userAgent.indexOf("Chrome") !== -1;
}

function getCookie(name) {
	var arr; var reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg)) { return unescape(arr[2]); } else { return null; }
}

function setCookie(name, value) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + "; expires=" + exp.toGMTString();
}

var renderLevel = isChrome() ? 0 : 2;
var bufferVal = getCookie("SHOW_PAGE_renderLevel");

if (bufferVal != null) {
	renderLevel = parseInt(bufferVal);
}

function enterFrame() {
	totalFrame++;
	var time = Date.now();
    if (downTimes < 2) { downTimes = 2; }
	if (time - videoEnterFrameTime > 50) {
		totalFrameLazy++; timeTotal += (time - videoEnterFrameTime);
	}
	if ((lastUpdateTime - time > 900000) && timeTotal > 2000 && (totalFrameLazy / totalFrame) > 0.25) {
		totalFrame = 0; totalFrameLazy = 0; timeTotal = 0; lastUpdateTime = time;
		if (renderLevel > 0) { renderLevel--; downTimes++; setDimensions(); setCookie("SHOW_PAGE_renderLevel", renderLevel); }
	}
	else if ((lastUpdateTime - time > 900000) && totalFrame > 2400 && totalFrameLazy / totalFrame < (0.025 + 0.01 * (10 - downTimes))) {
		totalFrame = 0; totalFrameLazy = 0; timeTotal = 0; lastUpdateTime = time;
		if (renderLevel < 3) { renderLevel++; setDimensions(); setCookie("SHOW_PAGE_renderLevel", renderLevel); }
	}
	
	videoEnterFrameTime = time;
	
	var debug = document.getElementById("DEBUG");
	
	if (debug != null) {
		debug.innerHTML =
			"renderLevel:" + renderLevel + "<br\>" + 
			"videoLazy:" + videoLazy + "<br\>" + 
			"totalFrame:" + totalFrame + "<br\>" + 
			"totalFrameLazy:" + totalFrameLazy + "<br\>" + 
			"timeTotal:" + timeTotal + "<br\>" + 
			"downTimes:" + downTimes + "<br\>" + 
			"totalFrameLazy / totalFrame:" + (totalFrameLazy / totalFrame) + "<br\>";
			
	}
}

function videoEnterFrame() {
	var time = Date.now();
	if (time - videoEnterFrameTime > 200) {
		videoLazy++;
		if (videoLazy > 1) {
			// videoLazy = 0;
			// if (renderLevel > 0) { renderLevel--; setDimensions(); }
		}
	}
	videoEnterFrameTime = time;
}

// 重置尺寸
setDimensions();
// 绑定页面
window.onresize = setDimensions;
