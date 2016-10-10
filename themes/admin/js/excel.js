/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


App.loadCss($('<link rel="stylesheet" href="themes/admin/assets/excel/jquery.handsontable.full.css">'));
App.loadJs($('<script src="themes/admin/assets/excel/jquery.handsontable.full.js"></script>'));


(function($){	
    
    App.Func.excel = function(selector){
        
        if(!$().handsontable)
            return;
        // this is for updating content to post on server
        var input = selector.next('input:hidden');
        var opt = $.extend({
                    rowHeaders: true,
                    minSpareRows: 1,
                    contextMenu: false,
                    afterChange: function(changes, source){
                        var detailInstance = selector.data('handsontable');
                        if(input.length && detailInstance){
                            input.val(JSON.stringify(detailInstance.getData()));
                        }
                    }
              },selector.data());
        
        selector.handsontable(opt);
        
    }
    
})(jQuery);