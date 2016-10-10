function errorMessage(e){
	console.log(e);
}

App = (function($){

	Func = {
		
		handleGoogleMap: function(selector) {
			
			/*var defaults = {
	                  //google_api: 'AIzaSyDs8JCxbOANzW9db8UG1LLNDmSq4DUNv4w',
	                  location: '',
					  zoom: 4,
					  size: '445x275'
	              };
			var o = $.extend(defaults, selector.data());
			
			selector.html('<img src="http://maps.googleapis.com/maps/api/staticmap?center='+o.location
					+'&zoom='+o.zoom+'&size='+o.size+'&maptype=roadmap&sensor=false" width="100%" />');
				*/
				 
              var defaults = {
                  //google_api: 'AIzaSyDs8JCxbOANzW9db8UG1LLNDmSq4DUNv4w',
                  location: '',
				  zoom: 4
              };

              var options = $.extend(defaults, selector.data());
         

			  var o = options;
			  var obj = selector; 
			  
	
			  var wait = setInterval(function() {
				  if( obj.is(":visible") ) {
					  clearInterval(wait);
					  // This piece of code will be executed
					  var obj_class = obj.attr("class");
					  var geocoder;
					  var map;
					  geocoder = new google.maps.Geocoder();
					  //alert("usao2")
					  var latlng = new google.maps.LatLng(40, 40); // starting default location
					  var myOptions = {
						zoom: o.zoom,
						center: latlng,
						mapTypeId: google.maps.MapTypeId.ROADMAP,
						zoomControl: true,
						zoomControlOptions: {
						  style: google.maps.ZoomControlStyle.DEFAULT
					  },
						scaleControl: true
					  }
					  map = new google.maps.Map(obj[0], myOptions);						
					  var address = o.location;
					  geocoder.geocode( { 'address': address}, function(results, status) {	  
								
						  if (status == google.maps.GeocoderStatus.OK) {
							  map.setCenter(results[0].geometry.location);
							  var marker = new google.maps.Marker({
								  map: map,
								  position: results[0].geometry.location
							  });
						  } else {
							  alert("Geocode was not successful for the following reason: " + status);
						  }
			
					  });		  
					  
				  }
			  }, 200);

 
        },
			
		handleLeftMenu: function(selector){
			
			var ul = $('#menu-item-'+ selector.data('id') + ' ul.sub-menu');			
			selector.html(ul.html()).find('li').each(function(){
				$(this).wrapInner('<span class="link_span"/>');
			});
		},	
			
		handlePager: function (selector) {
            var $this = selector;
            var o=$.extend({
                //itemTpl:'template',
                //numPerPage:$numperpage,
                //pageNum:$pagenum,
            	current:'id',
                list:'.news-list',
                paging:'.news-paging',
                callbackMethod:location.href,                
    			pageLoaded:function(){
    				$('body,html').animate({
        				scrollTop: 0
        			}, 500);
    			}
            }, selector.data());
            
            var isLoading = false;
            var currentPage = 0;
            var numPerPage = o.numPerPage;
            var numToGet = numPerPage * o.pageNum;
            var $list = $this.find(o.list);
            $list.bind('repaginate', function () {
                $list.find('li').hide()
                    .slice(currentPage * numPerPage, (currentPage + 1) * numPerPage)
                    .show();
            });
            var numRows = 0;
            var numPages = 0;
            var $pager = $this.find(o.paging);
            var $getNext = $pager.find('li:last');
            var makePager = function (rows, cur) {
                numRows += rows;
                var totalPage = numPages;
                numPages = Math.ceil(numRows / numPerPage);
                for (var page = totalPage; page < numPages; page++) {
                    $('<li></li>')
                    .text(page + 1)
                    .bind('click', { newPage: page }, function (event) {
                        currentPage = event.data['newPage'];
                        $list.trigger('repaginate');
                        $(this).addClass('current')
                        .siblings().removeClass('current');
                        if(o.pageLoaded) o.pageLoaded(currentPage);
                        fix_overlay();
                    }).insertBefore($getNext);
                }
                if (rows < numToGet) {
                    $getNext.remove();
                } else {
                    $getNext.attr('current', cur);
                }
            };
            
            var makeList = function (ret) {                
                var lis = $(App.tmpl(o.itemTpl, ret));
                // until append it will not trigger render
                $list.append(lis).trigger('repaginate');
                // make a selector
                App.init(lis);
                // handle admin for this new list, because admin support rehandle, 
                // and each lis item is ui-type already
                App.handleAdmin($list);
                
                if(o.dataLoaded) o.dataLoaded();
                var len = ret.length;
                len == 0 ? $pager.remove() : makePager(len, ret[len-1][o.current]);
            };
            var next = function (current) {
                if (!isLoading) {
                    $.get(o.callbackMethod,{current: current}, function (ret) {                    	
                        makeList(ret);
						if(current == 0)
							$pager.find('li:first').addClass('current');
                        isLoading = false;
                    },'msgpack');
                }
                isLoading = true;
            };
            next(0);
            $getNext.click(function () {
                next(+$getNext.attr('current'));
            });
        },	
			
		// can be plugin="truncate", or handle all item when init page
		handleTruncate : function(selector){

            var defaults = {
                    size: 240,
                    omission: '...',
                    ignore: true
            },
            options = $.extend(defaults, selector.data());

            var textDefault = selector.text(),
            	textTruncated,                
            	regex    = /[!-\/:-@\[-`{-~]$/;                

            if (textDefault.length > options.size) {
                    textTruncated = $.trim(textDefault).
                                                    substring(0, options.size).
                                                    split(' ').
                                                    slice(0, -1).
                                                    join(' ');
                    if (options.ignore) {
                            textTruncated = textTruncated.replace(regex , '');
                    }

                    selector.text(textTruncated + options.omission);
            }
                
        },
        
		handleJcarousel :	function(selector){
			
			if(!$().jcarousel)
				return;
			
			selector.jcarousel($.extend({		
			   	scroll: ($(window).width() > 767 ? 4 : 1),
			   	easing: "easeInOutExpo",
			   	animation: 700
			},selector.data()));
		},
		
		handleTags: function(selector){
			selector.find('li').each(function(){
				var a = $('a', this);
				if(a.text())
					a.css('font-size', 100 + Math.floor(Math.random()*9)*10 + '%');
				else
					a.remove();
			});
		},
		
		handleAppear: function(selector){
			selector.appear($.extend({
				forEachVisible: function (i, e) {
					$(e).data("delay", i);
				},
				appear: function () {
					var delay = 400;
	
					$(this).children(".counter").each(function (i, e) {
						$(e).trans(i * delay + "ms", "-delay");
	
						setTimeout(function(){
							var el = $(e).children(".counter_hidden:first");
							var end_nu = +el.attr("data-end-nu");
							var nu = +el.attr("data-start-nu");
							$(e).flipCounter("startAnimation", { number: nu, end_number: end_nu })
								.children(".counter_desc").addClass("shown");
						}, i * delay);									
				        
				    
					});
					$(this).removeClass("animationBegin");
				}
			},selector.data()));
		},
		
		handleIsotope: function(selector){						
			
			var data = selector.data();
			
	        var container = selector.find(data.elementList),
	        	filter = selector.find(data.filter),
	        	filterList = filter.find(data.filterList),
	            optionLinks = filterList.find(data.optionLink),
	            currentFilter = filter.find(data.currentFilter);
	        
	        $(window).load( function() {
		        container.isotope({
			        itemSelector : '.element'
			    });
		        
		        optionLinks.click(function(){
		        	var selector = $(this).attr('data-option-value');	
		        	container.isotope({ filter: selector });
		        	currentFilter.html($(this).html());
		        	filterList.stop(false, true).slideUp({
	                	duration:100,
	                	easing:"easeOutExpo"});
		        	return false;
		        });
		        
		        // trigger resize
		        if(!App.handleIsotopeHasRun){
			        setTimeout(function(){
			        	$(window).resize();
			        }, 100);
			        App.handleIsotopeHasRun = true;
		        }
		        //$(window).resize();
		        optionLinks.eq(0).click();
	        });
	        
			// Resize filter box
			var new_w = filterList.width() - 20;
			currentFilter.css('width',new_w);
			filter.hover(
	            function() {
	            	filterList.stop(false, true).slideDown({
	                	duration:500,
	                	easing:"easeOutExpo"});
	            },
	            function() {
	            	filterList.stop(false, true).slideUp({
	                	duration:200,
	                	easing:"easeOutExpo"});
	            }
			);

		},
    	
    	// Slider
    	handleFlexslider: function(selector){

    		$(window).load(function(){
    			var opt = $.extend({
	    		      animation: "slide",
	    		      controlNav: false,
	    		      start: function(slider){
	    		    	  $('body').removeClass('loading');
	    		      }
	    	    },selector.data());
    			
    			selector.flexslider(opt);
    			
    			if(opt.asNavFor){
    				var asNavFor = $(opt.asNavFor);
    				asNavFor.flexslider($.extend({
	    			    animation: "slide",
	    			    controlNav: false,
	    			    animationLoop: false,
	    			    slideshow: false,
	    			    sync: selector
	    			},asNavFor.data()));
    			}
    		});
    		
    		// update for this
  	    	//$(window).resize();
    	},
    	handleNivoSlider : function (selector){
    		
			if(!$().nivoSlider)
				return;
			selector.nivoSlider(selector.data());
    	},
    	
		handleRevolution : function (selector){
		
			if(!$().revolution)
				return;
		   
		   selector.show().revolution($.extend({
				delay:6000,
				startwidth:960,
				startheight:350,
				hideThumbs:200,
				
				thumbWidth:100,
				thumbHeight:50,
				thumbAmount:5,
				
				navigationType:"bullet",
				navigationArrows:"solo",
				navigationStyle:"round",
				
				touchenabled:"on",
				onHoverStop:"on",
				
				navigationHAlign:"center",
				navigationVAlign:"bottom",
				navigationHOffset:0,
				navigationVOffset:20,

				soloArrowLeftHalign:"left",
				soloArrowLeftValign:"center",
				soloArrowLeftHOffset:20,
				soloArrowLeftVOffset:0,

				soloArrowRightHalign:"right",
				soloArrowRightValign:"center",
				soloArrowRightHOffset:20,
				soloArrowRightVOffset:0,
						
				shadow:2,
				fullWidth:"on",
				fullScreen: 'off',

				stopLoop:"off",
				stopAfterLoops:-1,
				stopAtSlide:-1,

				shuffle:"off",
				
				hideThumbsOnMobile:"off",
				hideBulletsOnMobile:"on",
				hideArrowsOnMobile:"on",
				
				hideSliderAtLimit:0,
				hideCaptionAtLimit:0,
				hideAllCaptionAtLilmit:0,
				startWithSlide:0	
			},selector.data()));	
		}
	};
	
	return {
	    	siteUrl: location.href,
	    	Func: Func,
	    	_uiList:[],
	        _loadedJs: {},
	        _loadedCss: {},
	        _checkBrowserForResource: function(selector){
	        	var browser = selector.attr('browser');
        		if(browser !== undefined){        			
        			if($.browser[browser]){	            			
        				var ver = parseFloat($.browser.version);
        				var values = selector.attr('ver').split(',');
        				for(var i in values){
        					var value = values[i];
        					var op = value[0];	  
        					// simply operartor to <,> and =
        					if(op == '>'){	            						
        						if(ver <= parseFloat(value.substr(1)))
        							return false;
        					} else if(op == '<'){	            						
        						if(ver >= parseFloat(value.substr(1)))
        							return false;
        					} else{
        						if(ver != parseFloat(value))
        							return false;
        					}
        				}
        			} else
        				return false;
        		} 
        		return true;
	        },
	        handleAdmin: $.noop,
	        loadCss: function(selector){       
	        	if(App._checkBrowserForResource(selector)){
	        		var link = selector[0].href;
	        		if(!App._loadedCss[link]){
	        			$('head').append(selector);
	        			App._loadedCss[link] = true;
	        		}            	
	        	}
	        },
	        loadJs: function(selector){
	        	if(App._checkBrowserForResource(selector)){
	            	// jquery will automatically load all js files based on queue
	            	// absolute src, if use attr it just relative src
	        		var link = selector[0].src; 
	        		if(!App._loadedJs[link]){
	        			$('body').append(selector);
	        			App._loadedJs[link] = true;
	        		}
	        	}
	        },
	        tmpl: function(id, data){
	        	return tmpl(id)(data);
	        },
	        setCache: function(cache){
	        	// turn on turn off caching anytime ^^
	        	$.ajaxSetup({cache: cache});
	        }, 
	    	setup: function(selector, siteUrl, cache){    		
	    		// base site url
	    		App.siteUrl = siteUrl || App.siteUrl;
	    		App.selector = selector;
	    		// default set cache is true to speed up loading	    		
	    		if (cache === undefined)
	    			cache = true;
	    		App.setCache(cache);
	    		
	    		// msgpack instead of json
	    		$.ajaxSetup({
	    			beforeSend: function(xHr, opt) {
	    				if(opt.dataType === 'msgpack')
	    					xHr.overrideMimeType('text/plain; charset=x-user-defined');
	    			},
	                converters: {
	                    "text msgpack": function( packed ) {
	                        return msgpack.unpack(packed);                        
	                    }
	                }
	            });
	    		
	    		$('head>link').each(function(){
	        		var link = this.href;
	        		if(!App._loadedCss[link]){
	        			App._loadedCss[link] = true;
	        		}
	        	});
	        	
	        	$('head>script,body>script').each(function(){
	        		var link = this.src;
	        		if(link && !App._loadedJs[link]){
	        			App._loadedJs[link] = true;
	        		}
	        	});  
	        		        	
	        	// for checking with browser version and caching
	        	$($('#css-preload').val()).each(function(){
	        		App.loadCss($(this));
	        	});
	        	$($('#js-preload').val()).each(function(){
	        		App.loadJs($(this));
	        	});
	        	
	        	// back to top 
        		$(window).scroll(function () {
        			if ($(this).scrollTop() > 100) {
        				$('#back-top').fadeIn();
        			} else {
        				$('#back-top').fadeOut();
        			}
        		});

        		// scroll body to 0px on click
        		$('#back-top a').click(function () {
        			$('body,html').animate({
        				scrollTop: 0
        			}, 800);
        			return false;
        		});
	        	
        		var searchable,lang = $('html').attr('lang');
	        	$(document).on('keyup', '[name=newssearch]', function(e) {
		            clearTimeout(searchable);
		            $('#news_search .preloader').hide();
		            // after keyup for 1/2 second, then call filter to reduce ajax call
		            var search = convertVn($.trim($(this).val()));
			   		searchable = setTimeout(function(){
			   			$('#news_search .preloader').show();
			   			$.get(lang + '/news/search',{s:search}, function(ret){
			   				$('#news_search .preloader').hide();
			   				$('#news_search_list').html(ret);
			   			});  
			   		},500);
		        });
	        	
	        	// init page
	    		App.init('body', true);
	    		// if has admin function
	        	//App.handleAdmin();
	        	
	    		$(document).ajaxStart(function(){
	    			$('#preloader').show();
	    		}).ajaxStop(function(){
	    			$('#preloader').hide();
	    		}).ajaxError(function(){
	    			$('#preloader').hide();
	    		});
	    		
	    		// clear previous resources
	    		$(selector).bind('beforeDestroy', function(){
	    			if ($().gritter) {
	    				$.gritter.removeAll();
	    	        }
	    			$('body>.modal-backdrop').remove();
	    		});
	    		
	    		var render =function () {
	    			gapi.plusone.render('gplus-newshare-hk', {
	    				'href': location.href,
	    				'size': 'standard',
	    				'count': 'true' 
	    			});
	    		};
	    		var f = function(){		
	    			$('#gplus-newshare-hk').parent().removeClass('gplus');					
	    			if (typeof(gapi) != 'object') 
	    				$.getScript('http://apis.google.com/js/plusone.js', render);
	    			else 
	    				render();
	    		};
	    		//f();
	    		
	    		$('body').pushState({
	    			debug: true,
	    			load: selector,
	    			onBeforePageLoad: function(plugin, href) {
	    				$('body').addClass('loading');
	    				f();	    				
	    				// trigger destroy for container :v
	    				$(selector).triggerHandler('beforeDestroy');
	    			},
	    			onAfterPageLoad: function(plugin, href) {		    				
	    				App.init(selector);
	    				// if has admin function
	    	        	App.handleAdmin();
	    				$('body').removeClass('loading');	    				
	    				$(window).load();//.resize();	    				
	    				$('body,html').scrollTop(App.scrollTop);
	    			},
	    			ignore: function(link, elem) {
	    				return (elem.attr('no-push')!== undefined
	    						|| elem.attr('onclick') !== undefined
	        					|| link === undefined 
	    						|| link.match("^javascript")=="javascript" 
	    						|| link.match("^http")=="http" 
	    						|| link.charAt(0) == "#");
	    			}
	    		});
				
				
				/*// setup closure for action on all elements, 
		// remove load and unload because: load and unload can be hook by ui-type
		// and it will reduce time for checking all element before rendering
		$(document).bind("blur focus resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error", function(e){			
        	var el = $(e.target);
        	var actType = el.attr('act-type');
        	if(actType){
	            var uiActs = actType.split(' ');
	            for(var i in uiActs){		  
	            	var temp = uiActs[i].split(':'),eName = temp[0], fName = temp[1];
	            	if(e.type === eName){
			            var funcName = 'handle' + fName.replace(/(?:^\w|-\w)/g, function(match){
			            	// can access string as array with ie version <= 7
			            	return match.charAt(match.length-1).toUpperCase();
			            });	            	  
			            if(App.Act[funcName]){
			            	App.Act[funcName](el, e);
			            }
	            	}
	            }
	
	        	// add to action list
        	}
			
		});	    */
	    	},
	    	
	        //main function to initiate template pages
	        init: function (selector, no_push) {
	        	// delete wrong images
	        	$('img', selector).each(function(){	        		
	        		this.onerror = function() {
	        			var item = $(this);
	                    item.attr('no-image') !== undefined 
	                    	? item.attr('src','themes/admin/img/no-image.gif') 
	                    	: $(this).remove();     
	                };
	        		// hack
	                this.src = this.src;
	        	});
	        	
	        	$('.more-link', selector).before('<p></p>').wrap('<p/>');
	        	
	        	// Top Comment class
	        	//$('.single_comment:first').addClass('first_comment');
	        	
	        	// Tooltips
	        	//$('.tooltipsy').tipsy({fade: true, gravity: 's'});
	        	
	            // PrettyPhoto
	            $("a[rel^='prettyPhoto']", selector).prettyPhoto({
	        		animation_speed:'normal',
	        		overlay_gallery: false,
	        		deeplinking:false,
	        		social_tools: false
	        	});
	            
	        	$('[ui-type]', selector).each(function(){
	            	var el = $(this);
		            var uiType = el.attr('ui-type');	            
		            var funcName = 'handle' + uiType.replace(/(?:^\w|-\w)/g, function(match){	            	
		            	return match[match.length-1].toUpperCase();
		            });	            	  
	
		            if(Func[funcName]){
		            	Func[funcName](el);
		            	// add to ui list
		            	App._uiList.push(el);
		            }
	            });  
	        	
	        	$(window).resize();
	        	
	        },
	
	        // wrapper function to scroll to an element
	        scrollTo: function (el) {
	            pos = el ? el.offset().top : 0;
	            $('html,body').animate({
	                scrollTop: pos
	            }, 'slow');
	        },
	
	        // wrapper function to  block element(indicate loading)
	        blockUI: function (el, loaderOnTop) {
	            lastBlockedUI = el;
	            $(el).block({
	                message: '<img src="img/loading.gif" align="absmiddle">',
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
	        setMapPage: function (flag) {
	            isMapPage = flag;
	        }
	
	};
	
	

})(jQuery);


//Reload carousels on window resize to scroll only 1 item if viewport is small
jQuery(window).resize(function() {
	for(var i in App._uiList){
		var item = App._uiList[i];
		if(item.attr('ui-type')=='jcarousel'){		
			   var carousel = item.data("jcarousel"), win_width = jQuery(window).width();
			   if(!carousel)
				   return;
			   var visibleItems = (win_width > 767 ? 4 : 1);
			   carousel.options.visible = visibleItems;
			   carousel.options.scroll = visibleItems;
			   carousel.reload();
		}
	}
}); 


function convertVn (str) {
	return str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/gi, 'a')
			.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/gi, 'e')
			.replace(/ì|í|ị|ỉ|ĩ/gi, 'i')
			.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/gi, 'o')
			.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/gi, 'u')
			.replace(/ỳ|ý|ỵ|ỷ|ỹ/gi, 'y')
			.replace(/đ/gi, 'd');
}


//for all
(function($){
	$(function(){		
		$(document).on('submit', 'form', function(){
			var form = $(this);
			var data = form.serialize();
			$.post(form.attr('action'),data,function(ret){  					
				if(ret){				
					var html = ret.msg.join('<br/>');
					$.gritter.add({
			            title: 'Thông báo', 				            
			            image:'themes/anquyhung/img/msg_' + ret.type + '.png',
			            text: html
			        });
				}
			});
			return false;
		});
		
	    $(".mtoggle").click(function() {
	        $("#mmenu").slideToggle(500);
	    });
	    
	});
})(jQuery);
