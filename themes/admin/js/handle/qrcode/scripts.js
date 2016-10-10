/* 
 * Copyright 2015 tupt.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function ($) {

    App.loadJs($('<script src="themes/admin/js/handle/qrcode/qrcode.js"></script>'));


    App.Func.handleQrcode = function (selector) {
        var data = $.extend({
            width: selector.width(),
            height: selector.height(),
            //colorDark: '#f4913e',
            //colorLight: '#24256d',
            input: 'input:text',
            preview: '.qrcodes'
        }, selector.data());
        
        
        var preview = selector.find(data.preview).width(data.width).height(data.height);
        var input = selector.find(data.input);
        var qrcode = new QRCode(preview[0], data);
        
        input.on("blur keyup change", function (e) {
            qrcode.makeCode(this.value);
        }).keyup();
        
        
        // draw an image by position absolute on this image
        if(data.img){
            var imgPadding = data.imgPadding || Math.min(data.width,data.height)/30;
            var imgWidth = data.width / 5;
            var imgHeight = data.height /5;
            $('<img/>').attr('src', data.img).css({
                position:'relative',
                width: data.width / 5,
                height: data.height/ 5,
                float:'left',
                borderStyle:'solid',
                borderWidth:imgPadding,
                borderColor: '#fff',
                marginLeft: (data.width - imgWidth - imgPadding) / 2,
                marginTop: -(data.height + imgHeight + imgPadding) / 2,
            }).appendTo(preview);
        }

    };

})(jQuery);