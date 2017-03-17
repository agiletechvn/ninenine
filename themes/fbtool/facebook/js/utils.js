window.utils = {

    rootUrl: function () {
        var rooturl = '';
        if (location.host.toString().indexOf('localhost') >= 0) { rooturl = 'http://localhost:57881/'; }
        if (location.host.toString().indexOf('vtcgame.vn') >= 0) { rooturl = 'http://vtcgame.vn/accountsoauth/minigate.idoltv/'; }        
        return 'https://vtcgame.vn/accountsoauth/minigate.idoltv/';
    },

    mediaUrl: function () {
        var mediaUrl = '';
        if (location.host.toString().indexOf('sandbox') >= 0) { mediaUrl = 'http://sandbox1.vtcebank.vn/Paygate3/Media/'; }
        if (location.host.toString().indexOf('paygate') >= 0) { mediaUrl = 'http://beta.365.vtc.vn/'; }
        mediaUrl = 'http://localhost:13791/Content/images/';
        return mediaUrl;
    },

	AUTHEN_OPENID_URL: function () {
        var rooturl = 'https://vtcgame.vn/accountsoauth/v1.0/api/openid/login';
        if (location.host.toString().indexOf('sandbox') >= 0) { rooturl = 'http://sandbox.vtcgame.vn/accountapi/api/openid/login'; }
        if (location.host.toString().indexOf('beta.pay') >= 0) { rooturl = 'http://beta.pay.vtc.vn/'; }
        return rooturl;
    },
	
	SERVER_LOGIN_URL: function () {
       var rooturl = 'https://vtcgame.vn/accountsoauth/v1.0/api/account/authorize';
        if (location.host.toString().indexOf('sandbox') >= 0) { rooturl = 'http://sandbox.vtcgame.vn/accounts.oauth/v1.0/api/account/authorize'; }
        if (location.host.toString().indexOf('vtcgame.vn') >= 0) { rooturl = 'http://sandbox.vtcgame.vn/accounts.oauth/v1.0/api/account/authorize'; }
        return rooturl;
    },
	
    /* Asynchronously load templates located in separate .html files*/
    loadTemplate: function (views, callback) {
        var deferreds = [];
        $.each(views, function (index, view) {
            if (window[view]) {
                deferreds.push($.get(utils.rootUrl() + 'template/' + view + '.html?' + new Date().getTime(), function (data) {
                    window[view].prototype.template = _.template(data);
                }));
            } else {
                console.log(view + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    },

    loadSubTemplate: function (views, url, callback) {
        var deferreds = [];
        $.each(views, function (index, view) {
            if (window[view]) {
                deferreds.push($.get(utils.rootUrl()+url + view + '.html?' + new Date().getTime(), function (data) {
                    window[view].prototype.template = _.template(data);
                }));
            } else {
                console.log(utils.rootUrl() + url + view + '.html?' + new Date().getTime() + " not found");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    },
    
    loadListTemplate: function (views, callback) {
        //['template/Policy/CheckQuantityView', 'template/Common/PopupView', 'template/MainMenuView'];
        var deferreds = [];
        $.each(views, function (index, view) {
            var arr = view.split('/');
            if (arr.length < 2) {
                console.log(view + " not found");
            } else {
                var viewloaded = arr[arr.length - 1];
                if (window[viewloaded]) {
                    deferreds.push($.get(utils.rootUrl() + view + '.html?' + new Date().getHours(), function (data) {
                        window[viewloaded].prototype.template = _.template(data);
                    }));
                } else {
                    console.log(view + " not found");
                }
            }

        });

        $.when.apply(null, deferreds).done(callback);
    },
    
    convertUTFStr: function (str) {
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'| |\"|\&|\#|\[|\]|~|$|_/g, "-");
        str = str.replace(/-+-/g, "-");
        str = str.replace(/^\-+|\-+$/g, "");
        return str;
    },

    showTooltip: function (clientid, text) {
        if ($('.tooltip').length <= 0) {
            $('#tooltip').html('<div class="tooltip"><div class="tool_cont">' + text + '</div></div>');
            //$('#tooltip').html('<div class="tooltip"><div class="quote"><img src="' + this.rootUrl() + 'content/images/tooltip_quote.png"></div>' + text + '</div>');
            var top = $('#' + clientid).offset().top;
            var left = $('#' + clientid).offset().left;
            $('#tooltip').css('top', (top + 20) + 'px');
            $('#tooltip').css('left', (left + 98) + 'px');
            $('#tooltip').css('position', 'absolute');
            $('#tooltip').css('z-index', '11');
            $('#tooltip').css('display', 'block');
        }
    },

    hideTooltip: function () {
        $('.tooltip').remove();
    },

    documentHeight: function () {
        return $(document).height();
    },
    documentWidth: function () {
        return $(document).width();
    },
    windowHeight: function () {
        return $(window).height();
    },
    windowWidth: function () {
        return $(window).width();
    },

    loading: function () {
        this.unLoading();
        var html = '<div id="LoadingContainer"><div  id="Loading" style="display: none; text-align: center; overflow-y: none; vertical-align: middle;"><img src="' + this.rootUrl() + 'content/images/loading.gif" alt="Loading" /></div>';
        html += '<div  id="LoadingOverlay"></div>';
        html += '<style> #Loading{	width: 300px;	height: 300px;	z-index: 1400;	position: fixed;	padding: 5px;}#LoadingOverlay{	-moz-opacity: 0.8;	opacity: .80;	filter: alpha(opacity=80);	position: absolute;	z-index: 1200;	top: 0;	left: 0;	width: 100%;	height: 100%;	display: none;	background-color: #eee;}</style></div>';
        $('body').append(html);
        $('#Loading');
        $('#LoadingOverlay').show();
        var leftOffset = (this.windowWidth() - 300) / 2;
        var topOffset = (this.windowHeight() - 300) / 2;
        $('#Loading').css('width', 300);
        $('#Loading').css('height', 300);
        $('#Loading').css('left', leftOffset);
        $('#Loading').css('top', '47%');
        $('#Loading').show();
        $('#LoadingOverlay').css('height', this.windowHeight());
		$('#LoadingOverlay').css('width', this.windowWidth());
    },
    unLoading: function () {
        $('#LoadingContainer').remove();
    },

    // Hàm lấy xâu định dạng theo kiểu tiền tệ: 1234123 --> 1.234.123
    formatMoney: function (argValue) {
        var comma = (1 / 2 + '').charAt(1);
        var digit = ',';
        if (comma == '.') {
            digit = '.';
        }

        var sSign = "";
        if (argValue < 0) {
            sSign = "-";
            argValue = -argValue;
        }

        var sTemp = "" + argValue;
        var index = sTemp.indexOf(comma);
        var digitExt = "";
        if (index != -1) {
            digitExt = sTemp.substring(index + 1);
            sTemp = sTemp.substring(0, index);
        }

        var sReturn = "";
        while (sTemp.length > 3) {
            sReturn = digit + sTemp.substring(sTemp.length - 3) + sReturn;
            sTemp = sTemp.substring(0, sTemp.length - 3);
        }
        sReturn = sSign + sTemp + sReturn;
        if (digitExt.length > 0) {
            sReturn += comma + digitExt;
        }
        return sReturn;
    },
    // Hàm convert chuỗi json Datetime sang Date
    // value: chuỗi jSon datetime
    jSonToDate: function (value) { value = value.replace('/Date(', ''); value = value.replace(')/', ''); var expDate = new Date(parseInt(value)); return expDate; },

    // Hàm convert chuỗi json Datetime sang chuối ngày tháng
    // value: chuỗi jSon datetime
    // option:
    //      0: dd/MM/yyyy hh:mm:ss
    //      1: dd/MM/yyyy
    //      2: hh:mm:ss dd/MM/yyyy
    //      3: yyyy/MM/dd hh:mm:ss
    //      5: hhmm
    jSonDateToString: function (value, option) {
        if (typeof (option) == 'undefined') {
            option = 0;
        }
        var expDate = this.jSonToDate(value);
        var day = expDate.getDate();
        var month = expDate.getMonth() + 1;
        var year = expDate.getFullYear();
        var hour = expDate.getHours();
        var minute = expDate.getMinutes();
        var second = expDate.getSeconds();
        if (day < 10) day = "0" + day;
        if (month < 10) month = "0" + month;
        if (hour < 10) hour = "0" + hour;
        if (minute < 10) minute = "0" + minute;
        if (second < 10) second = "0" + second;
        switch (option) {
            case 0:
                return day + '/' + month + '/' + year + ' ' + hour + ':' + minute + ':' + second;
                break;
            case 1:
                return day + '/' + month + '/' + year;
                break;
            case 2:
                return hour + ':' + minute + ':' + second + ' ' + day + '/' + month + '/' + year;
                break;
            case 3:
                return year + '/' + month + '/' + day + ' ' + hour + ':' + minute + ':' + second;
                break;
            case 4:
                return year + '/' + month + '/' + day;
                break;
            case 5:
                return day + 'h' + minute;
                break;
            default:
                return expDate.toString();
                break;
        }
    },

    //Kéo thanh crollbar lên đầu
    scrollTop: function () { $("html:not(:animated),body:not(:animated)").animate({ scrollTop: 0 }, 'slow'); },
    scrollBottom: function () { $("html:not(:animated),body:not(:animated)").animate({ scrollTop: utils.documentHeight() }, 'slow'); },

    validateDate: function (dtValue) {
        try {
            var dtRegex = new RegExp(/\b\d{1,2}[\/-]\d{1,2}[\/-]\d{4}\b/);
            var status = dtRegex.test(dtValue);
            if (!status) return status;
            var arr = dtValue.toString().split('/');
            if (arr.length != 3) return false;
            var day = parseInt(arr[0]);
            var month = parseInt(arr[1]);
            var year = parseInt(arr[2]);
            if (day < 0 || day > 31) return false;
            if (month > 12) return false;
            return true;
        } catch (e) {
            return false;
        }
    },
    // Check format email xem có chính xác hay không
    validateEmail: function (email) { var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; return filter.test(email); },
    //Check chuỗi ký tự gồm ký tự chuẩn và số ._ 
    validateOnlyLetter: function (text) { var filter = /^[a-zA-Z]+$/; return filter.test(text); },
    //Check chuỗi ký tự gồm ký tự chuẩn và số ._ 
    validateLetter: function (text) { var filter = /^[a-zA-Z0-9]+$/; return filter.test(text); },
    //Check Password
    validateLetterPassword: function (text) { var filter = /^[a-zA-Z0-9\.\_~!@#$%^&*(:)-+=]+$/; return filter.test(text); },
    validateNumberOnly: function (text) { var filter = /^[0-9]+$/; return filter.test(text); },
    checkOnlyNumber: function (obj, event) {
        var whichCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;// ? event.which : whichCode;
        // Allow: backspace, delete, tab, escape, and enter
        if (whichCode == 46 || whichCode == 8 || whichCode == 9 || whichCode == 27 || whichCode == 13 ||
            // Allow: Ctrl+A
            (whichCode == 65 && event.ctrlKey === true) ||
            // Allow: home, end, left, right
            (whichCode >= 35 && whichCode <= 39)) {
            // let it happen, don't do anything
            return true;
        }
        else {
            // Ensure that it is a number and stop the keypress
            if (!event.shiftKey && whichCode >= 48 && whichCode <= 57) {
                return true;
            }

            //Ký tự #
            if (event.shiftKey && whichCode == 51)
                return false;

            //event.preventDefault();
            return false;
        }
    },

    // type=0:letter, 1 : number, 2:only letter, 3: password, 4 UserName
    inputExtender: function (id, type) {
        try {
            var val = $('#' + id).val();
            if (val == '' || val == 'undefined') {
                return;
            }

            var str = '';
            switch (type) {
                case 0:
                    for (var index = 0; index < val.length; index++) {
                        if (utils.validateLetter(val.charAt(index))) {
                            str += val.charAt(index);
                        }
                        $('#' + id).val(str);
                    }

                    break;
                case 1:
                    for (var index = 0; index < val.length; index++) {
                        if (utils.validateNumberOnly(val.charAt(index))) {

                            str += val.charAt(index);
                        }
                    }

                    $('#' + id).val(str);

                    break;
                case 2:
                    for (var index = 0; index < val.length; index++) {
                        if (utils.validateOnlyLetter(val.charAt(index))) {
                            str += val.charAt(index);
                        }
                        $('#' + id).val(str);
                    }

                    break;
                case 3:
                    for (var index = 0; index < val.length; index++) {
                        if (utils.validateLetterPassword(val.charAt(index))) {
                            str += val.charAt(index);
                        }
                        $('#' + id).val(str);
                    }
                    break;
                case 4:
                    for (var index = 0; index < val.length; index++) {
                        if (!utils.validateNumberOnly(val.charAt(index))) {
                            $('#' + id).val(val.replace(val.charAt(index), ''));
                        }
                    }
                    break;
            }
        }
        catch (err) { }
    },

    formDateTime: function (date) {
        var d = new Date(date);
        var currDate = d.getDate();
        var currMonth = d.getMonth();
        var currYear = d.getFullYear();
        return currDate + "-" + currMonth
            + "-" + currYear;
    },

    showPopup: function (text) {
        $('#divPopup').html(new PopupView({ description: text }).render().el);
        var width = $('.popup_mini').width();
        var height = $('.popup_mini').height();
        var topOffset = (((utils.windowHeight() - height) / 2) * 100) / utils.windowHeight();
        var leftOffset = (((utils.windowWidth() - width) / 2) * 100) / utils.windowWidth();
        $('#popupwrap').css('width', width + 'px');
        $('#popupwrap').css('left', leftOffset + "%");
        $('#popupwrap').css("top", topOffset + "%");
        $('#popupwrap').css('z-index', 1300);
        $('#popupwrap').css('position', 'fixed');
        $('#overlayPopup').css('height', utils.documentHeight());
    },

    errorMessage: function (fieldid, text) {
        this.clearErrorMessage(fieldid);
        $('#' + fieldid).html(text);
    },

    successMessage: function (fieldid, text) {
        this.clearErrorMessage(fieldid);
        var html = '<img class="fl" src="' + utils.rootUrl() + 'Content/images/ic5.gif" width="27" height="27"><p style="font: normal 16px Arial, Helvetica, sans-serif;color: #00628B;padding: 6px 10px 0 35px">' + text + '</p>';
        $('#' + fieldid).html(html);
    },

    clearErrorMessage: function (fieldid) {
        $('#' + fieldid).empty();
    },
    
    showImageProcess: function (fieldid, text) {
        this.clearErrorMessage(fieldid);
        var html = '<img class="fl" src="' + utils.rootUrl() + 'Content/images/ProgressCircle.gif" width="27" height="27"><p style="font: normal 16px Arial, Helvetica, sans-serif;color: #0060AF;padding: 6px 10px 0 35px">' + text + '</p>';
        $('#' + fieldid).html(html);
    },

    hideImageProcess: function (fieldid) {
        $('#' + fieldid).empty();
    },
    
    showInfoIcon: function (fieldid, text) {
        this.clearErrorMessage(fieldid);
        var html = '<img class="fl" src="' + utils.rootUrl() + 'Content/images/info_icon.gif" width="27" height="27"><p style="font: normal 16px Arial, Helvetica, sans-serif;color: #0060AF;padding: 6px 10px 0 35px">' + text + '</p>';
        $('#' + fieldid).html(html);
    },

    FormatNumber: function (pSStringNumber) {
        pSStringNumber += '';
        var x = pSStringNumber.split(',');
        var x1 = x[0];
        var x2 = x.length > 1 ? ',' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1))
            x1 = x1.replace(rgx, '$1' + '.' + '$2');

        return x1 + x2;
    },

    showDetail: function (name) {
        var current = 'divRechargePaygate';
        $('.about').hide();
        if (current != name && current != '') {
            $('#' + current).hide();
        }
        if (
            !$('#' + name).is(':visible')) {
            $('#' + name).show();
            current = name;
        } else {
            $('#' + name).hide();
            current = '';
        }
    },

    hideAll: function () { $('.about').hide(); },

    refreshCaptcha: function (imgId, verifyId, oldverify) {
        var captchaModel = new CaptchaModel();
        captchaModel.urlRoot += ('Get?oldVerify=' + oldverify);
        captchaModel.fetch({
            success: function () {

                //Bind catpcha
                $('#' + verifyId).val(captchaModel.get('verify'));
                $('#' + imgId).attr('src', 'data:image/jpeg;base64,' + captchaModel.get('imageData'));
                //End bind catpcha
            },
            error: function () {
                utils.showPopupCloseRedrirect('Hệ thống đang bận, vui lòng quay lại sau', '#');
            }
        });
    },


    //Hàm chuyển số thành chữ
    DocSo3ChuSo: function (baso) {
        var ChuSo = new Array(" không ", " một ", " hai ", " ba ", " bốn ", " năm ", " sáu ", " bảy ", " tám ", " chín ");
        var Tien = new Array("", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ");
        var tram;
        var chuc;
        var donvi;
        var KetQua = "";
        tram = parseInt(baso / 100);
        chuc = parseInt((baso % 100) / 10);
        donvi = baso % 10;
        if (tram == 0 && chuc == 0 && donvi == 0) return "";
        if (tram != 0) {
            KetQua += ChuSo[tram] + " trăm ";
            if ((chuc == 0) && (donvi != 0)) KetQua += " linh ";
        }
        if ((chuc != 0) && (chuc != 1)) {
            KetQua += ChuSo[chuc] + " mươi";
            if ((chuc == 0) && (donvi != 0)) KetQua = KetQua + " linh ";
        }
        if (chuc == 1) KetQua += " mười ";
        switch (donvi) {
            case 1:
                if ((chuc != 0) && (chuc != 1)) {
                    KetQua += " mốt ";
                }
                else {
                    KetQua += ChuSo[donvi];
                }
                break;
            case 5:
                if (chuc == 0) {
                    KetQua += ChuSo[donvi];
                }
                else {
                    KetQua += " lăm ";
                }
                break;
            default:
                if (donvi != 0) {
                    KetQua += ChuSo[donvi];
                }
                break;
        }
        return KetQua;
    },

    DocTienBangChu: function (SoTien) {
        var ChuSo = new Array(" không ", " một ", " hai ", " ba ", " bốn ", " năm ", " sáu ", " bảy ", " tám ", " chín ");
        var Tien = new Array("", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ");
        var lan = 0;
        var i = 0;
        var so = 0;
        var KetQua = "";
        var tmp = "";
        var ViTri = new Array();
        if (SoTien < 0) return "Số tiền âm !";
        if (SoTien == 0) return "Không đồng !";
        if (SoTien > 0) {
            so = SoTien;
        }
        else {
            so = -SoTien;
        }
        if (SoTien > 8999999999999999) {
            //SoTien = 0;
            return "Số quá lớn!";
        }
        ViTri[5] = Math.floor(so / 1000000000000000);
        if (isNaN(ViTri[5]))
            ViTri[5] = "0";
        so = so - parseFloat(ViTri[5].toString()) * 1000000000000000;
        ViTri[4] = Math.floor(so / 1000000000000);
        if (isNaN(ViTri[4]))
            ViTri[4] = "0";
        so = so - parseFloat(ViTri[4].toString()) * 1000000000000;
        ViTri[3] = Math.floor(so / 1000000000);
        if (isNaN(ViTri[3]))
            ViTri[3] = "0";
        so = so - parseFloat(ViTri[3].toString()) * 1000000000;
        ViTri[2] = parseInt(so / 1000000);
        if (isNaN(ViTri[2]))
            ViTri[2] = "0";
        ViTri[1] = parseInt((so % 1000000) / 1000);
        if (isNaN(ViTri[1]))
            ViTri[1] = "0";
        ViTri[0] = parseInt(so % 1000);
        if (isNaN(ViTri[0]))
            ViTri[0] = "0";
        if (ViTri[5] > 0) {
            lan = 5;
        }
        else if (ViTri[4] > 0) {
            lan = 4;
        }
        else if (ViTri[3] > 0) {
            lan = 3;
        }
        else if (ViTri[2] > 0) {
            lan = 2;
        }
        else if (ViTri[1] > 0) {
            lan = 1;
        }
        else {
            lan = 0;
        }
        for (i = lan; i >= 0; i--) {
            tmp = this.DocSo3ChuSo(ViTri[i]);
            KetQua += tmp;
            if (ViTri[i] > 0) KetQua += Tien[i];
            if ((i > 0) && (tmp.length > 0)) KetQua += ',';//&& (!string.IsNullOrEmpty(tmp))
        }
        if (KetQua.substring(KetQua.length - 1) == ',') {
            KetQua = KetQua.substring(0, KetQua.length - 1);
        }
        KetQua = KetQua.substring(1, 2).toUpperCase() + KetQua.substring(2);
        KetQua += " đồng";
        return KetQua;//.substring(0, 1);//.toUpperCase();// + KetQua.substring(1);
    },


    //Mở popup gọi từ CodeBehide
    showPopupCS: function (text) {
        var html = '<div id="popupwrap" class="popup_mini"><div class="c2_naptien_title"><p style="cursor: default;">THÔNG BÁO</p><a href="javascript:void(0);" onclick="utils.hidePopupCS()" id="divClose" class="c2_naptien_link">Đóng</a><div class="clear"></div></div>' +
            '<div style="padding: 10px 10px 20px 10px; line-height: 20px; text-align: center;">' + text + '</div></div>' +
            '<div id="overlayPopup"></div>' +
            '<style id="styleoverlayPopup" type="text/css">#overlayPopup{position: absolute;z-index: 1200;top: 0;left: 0;width: 100%;display: block;opacity: .80;background: #ccc;filter: alpha(opacity=60);-moz-opacity: 0.8;}</style>';

        $('#divPopup').html(html);
        var width = $('.popup_mini').width();
        var height = $('.popup_mini').height();
        var topOffset = (((utils.windowHeight() - height) / 2) * 100) / utils.windowHeight();
        var leftOffset = (((utils.windowWidth() - width) / 2) * 100) / utils.windowWidth();
        $('#popupwrap').css('width', width + 'px');
        $('#popupwrap').css('left', leftOffset + "%");
        $('#popupwrap').css("top", topOffset + "%");
        $('#popupwrap').css('z-index', 1300);
        $('#popupwrap').css('position', 'fixed');
        $('#overlayPopup').css('height', utils.documentHeight());
    },

    //Đóng popup gọi từ CodeBehide
    hidePopupCS: function () {
        $('#divPopup').empty();
    },
	hidePopup: function () {
        $('#overlayPopup').remove();
        $('#popupwrap').remove();
        $('#imghidepopup').remove();
        
    },

    replaceAll: function (sources, strTarget, strSubString) {
        var strText = sources;
        var intIndexOfMatch = strText.indexOf(strTarget);

        // Keep looping while an instance of the target string
        // still exists in the string.
        while (intIndexOfMatch != -1) {
            // Relace out the current instance.
            strText = strText.replace(strTarget, strSubString)

            // Get the index of any next matching substring.
            intIndexOfMatch = strText.indexOf(strTarget);
        }

        return (strText);
    },

    formatString: function (str, param) {

        var args = param.toString().split(',');
        for (var i = 0; i < args.length; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "");
            str = utils.replaceAll(str, '{' + i + '}', args[i].toString());
        }
        return str;
    },
    //Bind hot new
    TickerArticle: function (aticle) {
        try {
            $('#hotNews').empty();
            var href = '#tin-tuc-473/tin-tu-vtcpay-28/' + aticle.targetUrl + '-' + aticle.id;
            var title = aticle.title.length > 50 ? (aticle.title.substring(0, 50) + '...') : aticle.title;
            $('#hotNews').html('<a href="' + href + '">' + title + '</a>&nbsp;&nbsp;&nbsp;<img src="Content/images/gif-0236.gif" width="18" height="7">');

        } catch (err) { }
    },
    
    StartTicker: function () {

        index++;
        if (index == 5) {
            index = 0;

            utils.TickerArticle(list[currentArticle]);
            if (count > currentArticle + 1)
                currentArticle = currentArticle + 1;
            else
                currentArticle = 0;
        }
        window.setTimeout('utils.StartTicker()', 1000);
    },

    currentDate: function () {
        var date = new Date();
        var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var month = date.getMonth()+1 < 10 ? "0" + date.getMonth()+1 : date.getMonth()+1;
        var year = date.getFullYear();
        date = day + "/" + month + "/" + year;
        return date;
    },
    
    postMessageTitle: function (message) {
        var origin;
        if (localStorage['referrer'] == null || localStorage['referrer'] == undefined) {
            origin = document.referrer; //store the url in localStorage 
            localStorage['referrer'] = origin;
        }

        var pass_data = {
            'key': 'changeTitle',
            'id': 1,
            'html': message
        };
        window.parent.postMessage(pass_data, '*');
       
    },

    postMessage_CrossDomain: function (pass_data) {
        var origin;
        if (localStorage['referrer'] == null || localStorage['referrer'] == undefined) {
            origin = document.referrer; //store the url in localStorage 
            localStorage['referrer'] = origin;
        }
        window.parent.postMessage(pass_data, '*');

    },

    getParameterByName: function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    tracking: function (category, action, label, value) {
        //tracking
        var userAgent = navigator.userAgent;
        var referUrl = document.referrer;
        var serviceId = utils.getParameterByName('service_id');
        var utm_source = utils.getParameterByName('utm_source');
        var utm_medium = utils.getParameterByName('utm_medium');
        var utm_term = utils.getParameterByName('utm_term');
        var utm_content = utils.getParameterByName('utm_content');
        var utm_campaign = utils.getParameterByName('utm_campaign');
        var accountName = utils.getParameterByName('accountName');
        var gacode = utils.getParameterByName('gacode')
        var ip = $('#inputClientIp').val();
        var data = {
            GACode: gacode,
            Url: "vtcgame.vn/launcher_napvcoin",
            category: category,
            action: action,
            label: label,
            service_id: serviceId,
            headers: userAgent,
            value: value,
            accountName: accountName,
            referUrl: referUrl,
            utm_source: utm_source,
            utm_medium: utm_medium,
            utm_term: utm_term,
            utm_content: utm_content,
            utm_campaign: utm_campaign,
            ip: ip
        }

        $.post("http://sandbox.vtcgame.vn/tracking/api/Analytics/trackingEventByPost", data);
    },

    trackingGoogleAnalystic: function () {
        var GA_UA = utils.getParameterByName('gacode');
        ga('create', GA_UA, 'vtcgame.vn/kiem-vcoin');
    },
    SetCookie: function (name, value, days) { if (days) { var date = new Date(); date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); var expires = "; expires=" + date.toGMTString(); } else var expires = ""; document.cookie = name + "=" + value + expires + "; path=/"; },
    GetCookie: function (name) { var nameEQ = name + "="; var ca = document.cookie.split(';'); for (var i = 0; i < ca.length; i++) { var c = ca[i]; while (c.charAt(0) == ' ') c = c.substring(1, c.length); if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length); } return null; },
    DeleteCookie: function (name) { utils.SetCookie(name, "", -1); }
};