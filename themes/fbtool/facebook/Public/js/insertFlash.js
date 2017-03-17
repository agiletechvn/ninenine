// 嵌入变量
var params = {};
var flashvars = {};
var attributes = {};

// Flash参数
params['menu'] = false;
params['wmode'] = "direct";
params['allownetworking'] = "all";
params['seamlesstabbing'] = false;
params['allowscriptaccess'] = "always";

// 获取外部参数
var token = getQueryString("access_token");
var devID = getQueryString("devID");
var langID = getQueryString("langID");
var invokeID = getQueryString("invokeID");
var serverID = getQueryString("serverID");
var partnerID = getQueryString("partnerID");
var loginInfo = getQueryString("loginInfo");
var resourcePath = getQueryString("resourcePath");

// 设置参数默认值
if (devID == null) { devID = 255; }
if (langID == null) { langID = 5; }
if (invokeID == null) { invokeID = 1; }
if (serverID == null) { serverID = 17; }
if (partnerID == null) { partnerID = 5; }
if (resourcePath == null) { resourcePath = 18; }

// 设置基础参数
flashvars["langID"] = langID;
flashvars["invokeID"] = invokeID;
flashvars["partnerID"] = partnerID;

if (loginInfo == null) {
	loginInfo = token == null ?
		"ACCESS_TOKEN||10003" :
		loginInfo = "|" + token + "|10003";
}
if (loginInfo != null) { flashvars["loginInfo"] = loginInfo; }

// 根据配置设置账户参数
var type = "R1";
if (devID == 1) { type = "1"; }
else if (devID == 2) { type = "2"; }
else if (devID == 3) { type = "3"; }
else if (devID == 4) { type = "4"; }
else if (devID == 5) { type = "5"; }
else if (devID == 6) { type = "6"; }
else if (devID == 7) { type = "7"; }
else if (devID == 8) { type = "8"; }
else if (devID == 254) { type = "D1"; }
else if (devID == 255) { type = "R1"; }

// 设置服务器参数
flashvars["devID"] = devID;
flashvars["serverInfoID"] = serverID;

// 根据配置设置资源参数
var resServer = ["res.idoltv.vn"];
var selectServer = resServer[parseInt(resServer.length * Math.random())] + "/FlashResource";

// 资源参数配置
flashvars["srvCfgTag"] = selectServer + "/" + "resource_s/";
flashvars["gameCfgTag"] = selectServer + "/" + "resource_s/";
flashvars["libCfgTag"] = selectServer + "/" + "resource_" + type + "/";
flashvars["resourceTag"] = buildUrlPath("FlashResource/resource/");
flashvars["swfPathTag"] = buildUrlPath("FlashResource/resource_" + type + "/");

// 统计服务器地址
flashvars["serverStatLog"] = "http://117.103.194.131";

function buildUrlPath(extendStr) {
	if (resServer.length == 0) { return ""; }
	var result = resServer[0] + "/" + extendStr;
	for (var i = 1; i < resServer.length; i++) { result += "####" + resServer[i] + "/" + extendStr; } return result;
}

// 嵌入SWF到页面
swfobject.embedSWF("http://" + selectServer + "/Entry.swf?rnd=" + Math.random(), "AlternativaLoader", "100%", "100%", "10.0.22.87", "expressInstall.swf", flashvars, params, attributes);
