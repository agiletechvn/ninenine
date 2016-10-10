


(function($){
    
    App.loadJs($('<script src="themes/admin/assets/jquery-inputmask/jquery.inputmask.bundle.js"></script>'));
    
	App.Func.handleInputMask = function(selector) {
		selector.inputmask();
	};
        
})(jQuery);