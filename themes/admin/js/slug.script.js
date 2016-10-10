
function convertVn (str) {
	return str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/gi, 'a')
			.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/gi, 'e')
			.replace(/ì|í|ị|ỉ|ĩ/gi, 'i')
			.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/gi, 'o')
			.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/gi, 'u')
			.replace(/ỳ|ý|ỵ|ỷ|ỹ/gi, 'y')
			.replace(/đ/gi, 'd');
}

(function($){
	App.Func.handleSlug = function(selector) {
		var settings = {
		    path: '',
		    ext: '',
		    slugClass:'slug',
			slug: '.slug', // Class used for slug destination input and span. The span is created on $(document).ready() 
			hide: true	 // Boolean - By default the slug input field is hidden, set to false to show the input field and hide the span. 
		};
		
		settings = $.extend(settings, selector.data());						
		var $slug =  $(settings.slug);
		if($slug.val().indexOf('/')==-1){
		    settings.path = settings.path ? settings.path.replace(/(\/)?$/,'/') : '';			    		    							
		} else {
		    var temp = $slug.val().split('/');
		    settings.path = temp[0] + '/';
		    $slug.val(temp[1]);
		}
		
		var $span = $('<span/>').addClass(settings.slugClass).insertAfter($slug).click(function(){			    
		    $span.hide();
		    $slug.show();
		});
			
		if (settings.hide) {
			$slug.blur(function(){
			    var slugText = $.trim($slug.val());
			    slugText = settings.path + (slugText.length ? (slugText + settings.ext) : "");
			    $slug.hide();
			    $span.show().html(slugText);
			}).trigger('blur');
		}
								
		selector.keyup(function(){
			var slugcontent = convertVn($.trim(selector.val()));
			var slugcontent_hyphens = slugcontent.replace(/\s/g,'-');
			var finishedslug = slugcontent_hyphens.replace(/[^a-zA-Z0-9\-]/g,'');
			$slug.val(settings.path + finishedslug.toLowerCase())
				.next().text(settings.path + finishedslug.toLowerCase() + settings.ext);
		});
	};
})(jQuery);