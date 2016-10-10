/* ===========================================================
 * bootstrap-fileupload.js j2
 * http://jasny.github.com/bootstrap/javascript.html#fileupload
 * ===========================================================
 * Copyright 2012 Jasny BV, Netherlands.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

!function ($) {

  "use strict"; // jshint ;_

 /* FILEUPLOAD PUBLIC CLASS DEFINITION
  * ================================= */
 
 var iconPath = 'themes/admin/assets/ckfinder/skins/kama/images/icons/32/';

  var Fileupload = function (element, options) {
    this.$element = $(element);
    var thumbnail = this.$element.find('.thumbnail');
    // file also has thumbnail
    this.type = this.$element.data('uploadtype') || "image";//(thumbnail.length > 0 ? "image" : "file");
    this.maxDisplaySize = this.$element.data('maxDisplaySize') || 30;
    
    if(thumbnail.length > 0){
        var value = $.trim(thumbnail.text());
        var newValue = '';
        var displayNote = '<span>File is larger than '+this.maxDisplaySize+'MB can not preview</span>';
        switch(this.type){
            case 'image' :
                newValue = '<img onerror="this.src=\''+(this.$element.data('no-image')||'themes/admin/img/no-image.gif')+'\'" src="' + value + '" alt="" />';
                // show note for user
                if(!this.$element.data('hideNote'))
                    this.$element.after('<span class="label label-important">NOTE!</span><span> Support Firefox, Chrome, Safari, IE10. </span>'+displayNote);
                break;
            case 'audio':
                var audioType = this.$element.data('media-type') || value.split('.').pop();
                var audioWidth = this.$element.data('media-width') || '100%';
                newValue = '<audio width="'+audioWidth+'" controls><source src="'+value+'" type="audio/'+audioType +'">Your browser does not support the audio element.</audio>';
                // show note for user
                if(!this.$element.data('hideNote'))
                   this.$element.after('<span class="label label-important">NOTE!</span><span> Audio tag is supported in Latest Firefox, Chrome, Opera, Safari and Internet Explorer 10 only. </span>'+displayNote);
                thumbnail.css({width: 'auto',height:'auto',maxWidth:'none',maxHeight:'none'});
                break;
            case 'video':
                var videoType = this.$element.data('media-type') || value.split('.').pop();
                
                // full height media video, with auto
                var videoHeight = this.$element.data('media-height') || 'auto';
                var videoWidth = this.$element.data('media-width') || (videoHeight !== 'auto' ? 'auto' : '100%');
                
                newValue = '<video poster="'+(this.$element.data('no-video')||'themes/admin/img/no-video.gif')+'" width="'+videoWidth+'" height="'+videoHeight+'" controls><source src="'+value+'" type="video/'+videoType+'">Your browser does not support the video tag.</video>';
                // show note for user
                if(!this.$element.data('hideNote'))
                   this.$element.after(this.$element.data('note')||('<span class="label label-important">NOTE!</span><span> Video tag is supported in Latest Firefox, Chrome, Opera, Safari and Internet Explorer 10 only. </span>'+displayNote));
                thumbnail.css({width: 'auto',height:'auto',maxWidth:'none',maxHeight:'none'});
                break;
            //case 'file':
            default:
                // whatever they assign, it would be file finally
                this.type = "file";
                var customNote = this.$element.data('note');
                var ext = value.split('.').pop();
                newValue = '<img onerror="this.src=\''+ (iconPath + 'default.icon.gif')+'\'" src="' + (iconPath + ext + '.gif') + '" alt="" />';
                newValue += '<span class="label label-info" style="margin-left:5px">' + value + '</span>';
                if(!this.$element.data('hideNote') && customNote)
                    this.$element.after(customNote);
                thumbnail.css({width: 'auto',height:'auto',maxWidth:'none',maxHeight:'none'});
                break;
        }
        thumbnail.html(newValue);
    }  
    
      
     
    this.$input = this.$element.find(':file');
    if (this.$input.length === 0) return;
    
    if(this.$element.data('accept'))
        this.$input.attr('accept', this.$element.data('accept'));

    this.name = this.$input.attr('name') || options.name

    this.$hidden = this.$element.find('input[type=hidden][name="'+this.name+'"]')
    if (this.$hidden.length === 0) {
      this.$hidden = $('<input type="hidden" />')
      this.$element.prepend(this.$hidden)
    }

    this.$preview = this.$element.find('.fileupload-preview')
    var height = this.$preview.css('height')
    if (this.$preview.css('display') != 'inline' && height != '0px' && height != 'none') this.$preview.css('line-height', height)

    this.original = {
      'exists': this.$element.hasClass('fileupload-exists'),
      'preview': this.$preview.html(),
      'hiddenVal': this.$hidden.val()
    }
    
    this.$remove = this.$element.find('[data-dismiss="fileupload"]')

    this.$element.find('[data-trigger="fileupload"]').on('click.fileupload', $.proxy(this.trigger, this))

    this.listen()
  }
  
  Fileupload.prototype = {
      
    listen: function() {
      this.$input.on('change.fileupload', $.proxy(this.change, this))
      $(this.$input[0].form).on('reset.fileupload', $.proxy(this.reset, this))
      if (this.$remove) this.$remove.on('click.fileupload', $.proxy(this.clear, this))
    },
    
    change: function(e, invoked) {
      var file = e.target.files !== undefined ? e.target.files[0] : (e.target.value ? { name: e.target.value.replace(/^.+\\/, '') } : null)
      if (invoked === 'clear') return
      
      if (!file) {
        this.clear()
        return
      }
      
      this.$hidden.val('')
      this.$hidden.attr('name', '')
      this.$input.attr('name', this.name)
      
      var preview = this.$preview
      var element = this.$element
      
      var uploadtype = this.type;
      
      // support preview video, image, audio but file size must be limited
      if (uploadtype !== 'file' && (preview.length > 0 && typeof FileReader !== "undefined" 
              && file.size < this.maxDisplaySize * (1024 * 1024))) {
          
        var reader = new FileReader();
        // use reader to read file content at local
        reader.onload = function(e) {
            var value = file.name;
            // display some format only ?
            switch (uploadtype) {
                case "image":
                    if (typeof file.type !== "undefined" ? file.type.match('image.*') : file.name.match('\\.(gif|png|jpe?g)$')) {
                        value = '<img src="' + e.target.result + '" ' + (preview.css('max-height') != 'none' ? 'style="max-height: ' + preview.css('max-height') + ';"' : '') + ' />';
                    }
                    break;
                case "audio":
                    if (typeof file.type !== "undefined" ? file.type.match('audio.*') : file.name.match('\\.(mp3|ogg|wma|wav|m4a)$')) {
                        var audioType = element.data('media-type') || file.name.split('.').pop();
                        // get previous height of thumbnail for audio
                        //var audioHeight = element.find('.thumbnail').height();
                        var audioWidth = element.data('media-width') || '100%';
                        value = '<audio width="' + audioWidth + '" controls><source src="' + e.target.result + '" type="audio/' + audioType + '">Your browser does not support the audio element.</audio>';
                    }
                    break;
                case "video":
                    if (typeof file.type !== "undefined" ? file.type.match('video.*') : file.name.match('\\.(avi|flv|m4v|wav|moo?v|mpeg?|wmv|mp4)$')) {
                        var videoType = element.data('media-type') || file.name.split('.').pop();
                        // stress full width
                        // full height media video, with auto
                        
                        var videoHeight = element.data('media-height') || 'auto';
                        var videoWidth = element.data('media-width') || (videoHeight !== 'auto' ? 'auto' : '100%');
                        value = '<video width="' + videoWidth + '" height="' + videoHeight + '" controls><source src="' + e.target.result + '" type="video/' + videoType + '">Your browser does not support the video tag.</video>';
                    }
                    break;
                
            }
         
             preview.html(value);
             element.addClass('fileupload-exists').removeClass('fileupload-new');
        };
        
        reader.readAsDataURL(file);
            
      } else {
            // simple display, run imediately
            var value = file.name;
            // something else ?
            var ext = file.name.split('.').pop();
            value = '<img onerror="this.src=\''+ (iconPath + 'default.icon.gif')+'\'" src="' + (iconPath + ext + '.gif') + '" alt="" />';
            value += '<span class="label label-info" style="margin-left:5px">' + file.name + '</span>';
            preview.css({width: 'auto',height:'auto',maxWidth:'none',maxHeight:'none'});
            preview.html(value);
            element.addClass('fileupload-exists').removeClass('fileupload-new');

      }
      
      
    },

    clear: function(e) {
      this.$hidden.val('')
      this.$hidden.attr('name', this.name)
      this.$input.attr('name', '')

      //ie8+ doesn't support changing the value of input with type=file so clone instead
      if($.browser.msie){
          var inputClone = this.$input.clone(true);
          this.$input.after(inputClone);
          this.$input.remove();
          this.$input = inputClone;
      }else{
          this.$input.val('')
      }

      this.$preview.html('')
      this.$element.addClass('fileupload-new').removeClass('fileupload-exists')

      if (e) {
        this.$input.trigger('change', [ 'clear' ])
        e.preventDefault()
      }
    },
    
    reset: function(e) {
      this.clear()
      
      this.$hidden.val(this.original.hiddenVal)
      this.$preview.html(this.original.preview)
      
      if (this.original.exists) this.$element.addClass('fileupload-exists').removeClass('fileupload-new')
       else this.$element.addClass('fileupload-new').removeClass('fileupload-exists')
    },
    
    update: function(url){
        this.original.hiddenVal = url;
        var $this = this;
        var fileuploadNew = this.$element.find('.fileupload-new');
        switch(this.type){
            case 'image' :
                fileuploadNew.find('img').attr('src', url);
                break;
            case 'audio':
                fileuploadNew.find('audio').attr('src', url); 
                break;
            case 'video':
                fileuploadNew.find('video').attr('src', url); 
                break;
            //case 'file':
            default:
                // whatever they assign, it would be file finally
                var ext = url.split('.').pop();
                fileuploadNew.find('img').attr('src', (iconPath + ext + '.gif')); 
                fileuploadNew.find('span.label-info').text(url);
                break;
        }
        setTimeout(function(){
            $this.reset();
        }, 500);
        
    },
    
    trigger: function(e) {
      this.$input.trigger('click')
      e.preventDefault()
    }
  }

  
 /* FILEUPLOAD PLUGIN DEFINITION
  * =========================== */

  $.fn.singlefileupload = function (options) {
    return this.each(function () {
      var $this = $(this)
      , data = $this.data('fileupload');
      if (!data) $this.data('fileupload', (data = new Fileupload(this, options)));
      
      if (typeof options == 'string') data[options]();
      
      if (jQuery().html5_upload) {    	
    	  var form = $this.closest('form');
    	  // we only support upload image for html5 
    	  data.$input.html5_upload({
    	      url: function(number){    	    	     
    	    	  // by uncomment this, we can run this kind of upload on non-html5 supported browser
    	    	  // such as ie, but should use html5 for full functionality
    	    	  //return App.url.add(form.attr('action'), 'id', form.find('[name=id]').val());
    	    	  return form.attr('action');
    	      },
    	      extraFields: function(){
    	    	  var extra = {
    	    		  id:form.find('[name=id]').val()
    	    	  };
                  form.trigger('onExtraFields', [extra]);
    	    	  return extra;
    	      },
    	      fieldName : data.$input.attr('name'),
    	      sendBoundary: window.FormData || $.browser.mozilla,
    	      autostart: +$this.attr('autostart') || false,
    	      onStart: function(event, total) {
    	          return true;
    	      },
    	      onFinish:function(event, total){
    	    	  $this.closest('form').trigger('fileUploaded', [total]);
    	      },
    	      onProgress: function(event, progress, name, number, total) {
    	  
    	      },
    	      setName: function(text) {
    	          $this.find(".progress-report-name").text(text);
    	      },
    	      setStatus: function(text) {
    	    	  $this.find(".progress-report-status").text(text);
    	      },
    	      setProgress: function(val) {
    	    	  $this.find(".progress-report-bar").css('width', Math.ceil(val*100)+"%");
    	      },
    	      onFinishOne: function(event, response, name, number, total) {
                  try{
                      response = $.parseJSON(response);
                  }
                  catch(e){}
                  if(response.data){
                        var url = response.data[data.$input.attr('name')];
                        if(url){
                            data.update(url);
                        }
                   }
                  // rebind thumbnail :D
    	    	  $this.closest('form').trigger('fileUploadedOne', [response, name, number, total]);
    	      },
    	      onError: function(event, name, error) {
    	      	errorMessage(name);
    	      }
    	  }).change(function(){
    		  $this.find(".progress-report-bar").css('width',0);
    		  $this.find(".progress-report-status,.progress-report-name").text('');
    	  });
      }
    });
  };

  $.fn.singlefileupload.Constructor = Fileupload;

}(window.jQuery);