
var templateFill = 'rgba(245,245,245,0.6)';
var templateFillOver = 'rgba(193,190,162,0.6)';
var templateFillActive = 'rgba(225,225,225,0.6)';
var minImageSize = 100; // min size of image when resize

var fflivesEditor = new FFlivesEditor({
    canvasID: 'main-canvas',
    templateFill: templateFill,
    templateFillOver: templateFillOver
});
var canvas = fflivesEditor.getCanvas();
var templateChoice = 0;
setTemplate(templateChoice);
function setCurrentTemplate() {
    var jsonStr = localStorage.getItem('ffliveCurrentTemplate');
    templateChoice = +localStorage.getItem('ffliveTemplateChoice');
    fflivesEditor.loadJSON(jsonStr, function () {
        if (templateChoice === 0) {
            // custom template
            $('#toolbar .bg-custom').removeClass('hidden');
        } else {
            $('#toolbar .bg-custom').addClass('hidden');
        }
    });
}

function loadTemplateFromRet(ret) {        
    var jsonStr = ret.data; 
    // assign templateChoice   
    templateChoice = +ret.template_id;
    // load from json string
    fflivesEditor.loadJSON(jsonStr, function () {
        $('#toolbar .bg-custom').addClass('hidden');
    });
}

function setTemplate(num) {
    if (num === 0) {
        templateChoice = 0;
        fflivesEditor.clear();        
        $('#toolbar .bg-custom').removeClass('hidden');
    } else {
        $.get('template/creation/' + num + '/0', function (ret) {
            loadTemplateFromRet(ret);
        });
    }
    canvas.fire('mouse:down', {e: null, target: null}); 
}

function fitCheckRepeat(obj, fitEntireNoRepeat, fitEntire){
    if(obj.pattern && !obj.pattern.repeat){
        fflivesEditor.fitObject(obj, fitEntireNoRepeat || 100);
    } else {
        fflivesEditor.fitObject(obj, fitEntire || (obj.pattern ? obj.pattern.repeat : (obj.ebl == 1)));    
    }  
    if(obj.ebl && $.inArray(obj.ebl, [1,3,8]) !== -1){
        // send to bottom for background, color pattern and image pattern
        setZIndex('back', obj);
    }
}

function setZIndex(dir, obj){
    obj = obj || canvas.getActiveObject();
    if(obj){
        switch(dir){
            case 'back':
                fflivesEditor.sendToBack(obj);
                break;
            case 'backward':
                fflivesEditor.sendBackwards(obj, true);
                break;
            case 'forward':
                fflivesEditor.bringForward(obj, true);
                break;
            case 'front':
                fflivesEditor.bringToFront(obj);
                break;
            default:
                break;
        }
    }    
}

var copiedObject;
function copyObject(){
    copiedObject = canvas.getActiveObject();
}

function pasteObject(){
    if(copiedObject){
        var addObjectCallback = null;
        if(templateChoice){            
            if(fflivesEditor.mouseTarget){
                // maybe child or parent
                 var clipName = fflivesEditor.mouseTarget.clipName || fflivesEditor.mouseTarget.clipFor;
                 if(clipName && clipName !== copiedObject.clipName){
                    // add to current rect container
                    addObjectCallback = function(addObject){
                        // will remove children in this container
                        var childInRect = fflivesEditor.findByClipFor(clipName);
                        if (childInRect) {
                            canvas.remove(childInRect);
                        }
                        
                        // then add this
                        addObject.clipName = clipName;   
                        // check repeat, fit method will call renderAll                                             
                        fitCheckRepeat(addObject, 100); 
                    };                    
                       
                 }                         
            }            
            
        } else {                            
            addObjectCallback = function(addObject){
                addObject.left = fflivesEditor.mouseX - addObject.width/2;
                addObject.top = fflivesEditor.mouseY - addObject.height/2;
                canvas.renderAll();
            };                   
        }
        if(addObjectCallback){                     
            fflivesEditor.cloneObject(copiedObject, function (addObject) {                                
                if (addObject) {
                    canvas.add(addObject); 
                    addObjectCallback(addObject);                                                
                    canvas.setActiveObject(addObject);
                    canvas.fire('mouse:down', {e: null, target: addObject}); 
                } else {
                    console.log("Sorry Object Not Initialized");
                }
            });
            copiedObject = null;               
        }
    }
}

$(function () {

    $('[data-toggle="tooltip"]').tooltip();

    function windowResize() {
        var screenHeight = $(window).height() - 50;
        $('.full-height').height(screenHeight);
        // set height for inner
        $('#fixed-header-tab').updateTabHeight(screenHeight);
    }
    windowResize();
    $(window).resize(windowResize);


    $(document).keydown(function(e){
        if(e.ctrlKey || e.metaKey){
            // copy
            if(e.keyCode === 67){
                e.preventDefault();
                copyObject();
            } else if(e.keyCode === 86){
                e.preventDefault();
                pasteObject();
            }
        }
    });

    /* 
     NOTE: the start and end handlers are events for the <img> elements; the rest are bound to the canvas container.
     */
    var activeDragElement = null;
    function handleDragStart(e) {
        activeDragElement = $(this);
        activeDragElement.addClass('img_dragging').siblings().removeClass('img_dragging');
    }

// make hover effect
    var selectedClipRect = null;
    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }

        if (e.dataTransfer)
            e.dataTransfer.dropEffect = 'copy'; // See the section on the DataTransfer object.
        // NOTE: comment above refers to the article (see top) -natchiketa

        // get the selected layer            
        var clipRect = fflivesEditor.findCNameByPosition(e.layerX, e.layerY);
        if (clipRect) {
            if (selectedClipRect && selectedClipRect !== clipRect) {
                selectedClipRect.setFill(templateFill);
            }
            clipRect.setFill(templateFillOver);
            selectedClipRect = clipRect;
            canvas.renderAll();
        }

        return false;
    }

    function handleDragEnter(e) {
// this / e.target is the current hover target.
        this.classList.add('over');
    }

    function handleDragLeave(e) {
        this.classList.remove('over'); // this / e.target is previous target element.
        if (selectedClipRect) {
            selectedClipRect.setFill(templateFill);
            selectedClipRect = null;
            canvas.renderAll();
        }
    }

    var btn = $('#drag-proxy'), preloader = $('#preloader');
    function positionBtn(e) {

        var absCoords = fflivesEditor.getAbsoluteCoords(e.pageX, e.pageY);
        btn.css({
            left: (absCoords.left - btn.width() / 2) + 'px',
            top: (absCoords.top - btn.height() / 2) + 'px'
        });
        var eDrag = jQuery.Event("dragover");
        eDrag.layerX = absCoords.left;
        eDrag.layerY = absCoords.top;
        handleDragOver(eDrag);
    }

    function getOffsetBeforeAddItem(cName, e) {
        var offset;
        if (templateChoice) {
            // remove the image in this rect first
            var imageInRect = fflivesEditor.findByClipFor(cName);
            if (imageInRect) {
                canvas.remove(imageInRect);
            }

// then create new one, maybe add loading state
            // show loading image at the center of this clip        
            var clipRect = fflivesEditor.findByClipName(cName);            
            var absCoords = clipRect ? {left: clipRect.oCoords.ml.x, top: clipRect.oCoords.ml.y} : {left:0,top:0};
            // console.log(absCoords);
            offset = {
                left: (absCoords.left + ((clipRect.width - preloader.width()) / 2)),
                top: (absCoords.top - preloader.height() / 2)
            };
        } else {
            // 1/2 of normal thumb size
            offset = {
                left: e.layerX - preloader.width() / 2,
                top: e.layerY - preloader.height() / 2
            };
        }
        return offset;
    }

    function addTextObj(cName, fontData, e) {

        var offset = getOffsetBeforeAddItem(cName, e);
        // fix this and process later
        var rectHeight = 200;
        var rectWidth = 200;
        var config = {
            // we create this with full quality
            width: rectWidth / 2,
            height: rectHeight / 2,
            // not smaller than 100 pixel, and should not be larger than 0.5            
            minScaleLimit: Math.min(0.5, minImageSize / Math.max(rectWidth, rectHeight)).toFixed(2),
            fontFamily: fontData.fontFamily,
            fontFileSvg: fontData.fontFileSvg,
            fontFileEot: fontData.fontFileEot,
            fontFileWoff: fontData.fontFileWoff,
            fontFileTtf: fontData.fontFileTtf,
            fill: fontData.fillColor
        };
        if (templateChoice) {
            config.left = 0;
            config.top = 0;
            config.clipName = cName;
            // we use this function to serialize as string, 'cos there is no specific name
            config.clipTo = function (ctx) {
                return this.canvas.editor.clipByName(ctx, this);
            };
            config.hasRotatingPoint = false;
            config.lockRotation = true;
        } else {
            config.left = offset.left + preloader.width() / 2 - config.width / 2;
            config.top = offset.top + preloader.width() / 2 - config.height / 2;
            config.hasRotatingPoint = true;
            config.lockRotation = false;
        }
        var pug = new fabric.IText(fontData.textSample, config);
        canvas.add(pug);
        if (templateChoice) {
            fflivesEditor.fitObject(pug);
        }
        canvas.setActiveObject(pug);
        canvas.fire('mouse:down', {e: null, target: pug});

    }

    function addRectObj(cName, fillColor, e) {

        var offset = getOffsetBeforeAddItem(cName, e);
        // fix this and process later
        var rectHeight = 200;
        var rectWidth = 200;        

        var config = {
            // we create this with full quality
            width: rectWidth / 2,
            height: rectHeight / 2,
            // not smaller than 100 pixel, and should not be larger than 0.5            
            minScaleLimit: Math.min(0.5, minImageSize / Math.max(rectWidth, rectHeight)).toFixed(2),
            fill: fillColor
        };
        if (templateChoice) {
            config.left = 0;
            config.top = 0;
            config.clipName = cName;
            config.clipTo = function (ctx) {
                // we use this function to serialize as string, 'cos there is no specific name
                return this.canvas.editor.clipByName(ctx, this);
            };
            config.hasRotatingPoint = false;
            config.lockRotation = true;

        } else {
            config.left = offset.left + preloader.width() / 2 - config.width / 2;
            config.top = offset.top + preloader.width() / 2 - config.height / 2;
            config.hasRotatingPoint = true;
            config.lockRotation = false;
        }

        // fill using pattern
        if(e.data){
            config.ebl = e.data.ebl;
            if(e.data.ebl === 8){
                // create a pattern  
                config.pattern = {
                    fill: 'image',
                    src: e.data.src,
                    padding: 0,
                    width: 50,
                    repeat: true
                };             
                var rect = _addRectObj(config, true);
                fflivesEditor.setRepeatPattern(rect, config.pattern);
            } else if(e.data.shape){                
                // custom shape here
                // create a pattern  
                config.pattern = {
                    fill: e.data.shape,
                    fillColor: e.data.color,
                    repeat: e.data.repeat                    
                }; 

                if(config.pattern.repeat){
                    config.pattern.padding = 10;
                    config.pattern.width = 50;
                    config.pattern.height = 50;                                        
                } else {
                    config.pattern.padding = 0;
                    config.pattern.width = 100;
                    config.pattern.height = 100;                                                            
                }

                // add custom pattern here
                var rect = _addRectObj(config, config.pattern.repeat ? true : 100);
                fflivesEditor.setRepeatPattern(rect, config.pattern);
            }
        } else {
            _addRectObj(config, config.width || 100);
        }
        
    }

    // function _addPattern

    function _addRectObj(config, fitEntire){
        var pug = new fabric.Rect(config);
        canvas.add(pug);
        if (templateChoice) {
            fflivesEditor.fitObject(pug, fitEntire);            
        }
        canvas.setActiveObject(pug);
        canvas.fire('mouse:down', {e: null, target: pug});
        return pug;
    }

    function addImageObj(cName, imgSrc, thumbSrc, e) {

        var offset = getOffsetBeforeAddItem(cName, e);

        preloader.css(offset).removeClass('hidden');
        // wait until image is show then hide preloader
        var pugImg = new Image();
        pugImg.setAttribute('crossOrigin', 'anonymous');
        pugImg.onload = function () {
            if (pugImg.init) {
                canvas.renderAll();
                return;
            }

            pugImg.init = true; // enable only one time
            // hide preload immediately
            preloader.addClass('hidden');
            var config = {
                // we create this with full quality
                width: pugImg.width / 2,
                height: pugImg.height / 2,
                // not smaller than 100 pixel, and should not be larger than 0.5
                minScaleLimit: Math.min(0.5, minImageSize / Math.max(pugImg.width, pugImg.height)).toFixed(2),
                backgroundColor: '#fff'
            };
            if (templateChoice) {
                config.left = 0;
                config.top = 0;
                config.clipName = cName;
                config.clipTo = function (ctx) {
                    // we use this function to serialize as string, 'cos there is no specific name
                    return this.canvas.editor.clipByName(ctx, this);
                };
                config.hasRotatingPoint = false;
                config.lockRotation = true;
            } else {
                config.left = offset.left + preloader.width() / 2 - config.width / 2;
                config.top = offset.top + preloader.width() / 2 - config.height / 2;
                config.hasRotatingPoint = true;
                config.lockRotation = false;
            }
            if(e.data){
                config.ebl = e.data.ebl;
            }
            var pug = new fabric.Image(pugImg, config);
            pug._element.setAttribute('data-thumb', thumbSrc);
            canvas.add(pug);
            if (templateChoice) {
                if(config.ebl === 1){
                    // fit entire for background image 
                    fflivesEditor.fitObject(pug, true);    
                } else {
                    // cloth is 200
                    fflivesEditor.fitObject(pug, 200);    
                }
                
            }
            canvas.setActiveObject(pug);            
            canvas.fire('mouse:down', {e: null, target: pug});
        };
        pugImg.init = false;
        pugImg.src = imgSrc;
    }


    // this is where we process the cavnas
    function handleDrop(e) {
        e.stopPropagation(); // Stops some browsers from redirecting.
        e.preventDefault(); // Stops some browsers from redirecting.
        var cName = null;
        if (templateChoice) {
            var clipRect = fflivesEditor.findCNameByPosition(e.layerX, e.layerY);
            if (clipRect) {
                clipRect.setFill(templateFillActive);
                cName = clipRect.clipFor;
            } else {
                // nothing to do, no clipRect to add
                return false;
            }
        }

        var itemType = activeDragElement.attr('data-type');
        switch (itemType) {
            case 'image':
                // handle browser images                
                var myImgSrc = activeDragElement.attr('data-src');
                var thumbSrc = activeDragElement.attr('src');
                $.extend(true, e, {data: activeDragElement.data()});
                // pattern overlay
                if(e.data.ebl === 8){
                    addRectObj(cName, 'transparent', e);
                } else {
                    addImageObj(cName, myImgSrc, thumbSrc, e);    
                }
                
                break;
            case 'text':
                var fontData = activeDragElement.data();
                fontData.fillColor = activeDragElement.css('color');
                fontData.textSample = $.trim(activeDragElement.text());
                addTextObj(cName, fontData, e);
                break;
            case 'rect':
                // console.log('add rect instead');
                var activeElData = activeDragElement.data();
                if(activeElData.shape){
                    // add as shape
                    $.extend(true, e, {data: activeElData});
                    addRectObj(cName, fillColor, e);   
                } else {
                    // add normal
                    var fillColor = activeDragElement.attr('data-color');
                    addRectObj(cName, fillColor, e);    
                }
                
                break;
        }

        return false;
    }

    function handleDragEnd(e) {
        // this/e.target is the source node.
        $(this).removeClass('img_dragging');
        activeDragElement = null;
    }
// auto listening, image items
    Track.listenNewNode('.images img[draggable=true]', function () {
        var img = this;
        img.addEventListener('dragstart', handleDragStart, false);
        img.addEventListener('dragend', handleDragEnd, false);
    });
    // auto listening for font items
    Track.listenNewNode('.texts div[draggable=true]', function () {
        var item = $(this);
        var data = item.data();
        FFlivesEditor.loadFont(data);
        item.css('font-family', data.fontFamily);
        // add event listener        
        item[0].addEventListener('dragstart', handleDragStart, false);
        item[0].addEventListener('dragend', handleDragEnd, false);
    });
    // auto listening for background color items
    Track.listenNewNode('.rects div[draggable=true]', function () {
        var item = $(this);
        // add event listener
        item[0].addEventListener('dragstart', handleDragStart, false);
        item[0].addEventListener('dragend', handleDragEnd, false);
    });
    function initImageHandle() {
        var images = document.querySelectorAll('#product-list .images img');
        [].forEach.call(images, function (img) {
            img.addEventListener('dragstart', handleDragStart, false);
            img.addEventListener('dragend', handleDragEnd, false);
        });
    }

    if (Modernizr.draganddrop) {
        // Browser supports HTML5 DnD.

// Bind the event listeners for the image elements
        initImageHandle();
        $('#home').on('click', '.pagination a', function () {
            var href = this.href;
            if (href.indexOf('javascript') === -1) {
                $.get(href, function (ret) {
                    $('#product-list').html(ret);
//                    initImageHandle();
                });
            }
            return false;
        });
        // Bind the event listeners for the canvas
        var canvasContainer = document.getElementById('canvas-container');
        canvasContainer.addEventListener('dragenter', handleDragEnter, false);
        canvasContainer.addEventListener('dragover', handleDragOver, false);
        canvasContainer.addEventListener('dragleave', handleDragLeave, false);
        canvasContainer.addEventListener('drop', handleDrop, false);
    } else {
        // Replace with a fallback to a library solution.
        alert("This browser doesn't support the HTML5 Drag and Drop API.");
    }


    // for z-index
    $('#zindex_tools').on('click', '[data-action]', function(){
        var dir = $(this).attr('data-action');
        setZIndex(dir);
        return false;
    });


    $('#toolbar').on('click', '[data-action]', function () {
        var item = $(this);
        var action = item.attr('data-action');
        var currentCanvasObj = canvas.getActiveObject();
        if (currentCanvasObj) {
            switch (action) {
                case 'remove':
                    canvas.remove(currentCanvasObj);
                    $('#toolbar').addClass('hidden');
                    $('#drag-proxy').addClass('hidden');
                    if (selectedClipRect) {
                        selectedClipRect.setFill(templateFill);
                        selectedClipRect = null;
                        canvas.renderAll();
                    }
                    break;
                case 'flop':
                    currentCanvasObj.flipX = !currentCanvasObj.flipX;
                    canvas.renderAll();
                    if (currentCanvasObj.flipX) {
                        $('#drag-proxy').addClass('flop');
                    } else {
                        $('#drag-proxy').removeClass('flop');
                    }
                    break;
                case 'flip':
                    currentCanvasObj.flipY = !currentCanvasObj.flipY;
                    canvas.renderAll();
                    if (currentCanvasObj.flipY) {
                        $('#drag-proxy').addClass('flip');
                    } else {
                        $('#drag-proxy').removeClass('flip');
                    }
                    break;
                case 'fit':
                    // fit works for template choice only
                    if (templateChoice) {
                        if($.inArray(currentCanvasObj.ebl, [1,3,8]) !== -1){
                            // check repeate              
                            fitCheckRepeat(currentCanvasObj, 100, true);          
                        } else {
                            fflivesEditor.fitObject(currentCanvasObj);    
                        }
                        
                    }
                    break;
                case 'png':
                case 'jpg':
                    var imgEl = currentCanvasObj.getElement();
                    var newSrc = imgEl.getAttribute('src').replace(/\.[\w]+$/, '.' + action);
                    if (newSrc !== imgEl.getAttribute('src')) {
                        imgEl.setAttribute('src', newSrc);
                    }

                    $(this).addClass('active').siblings().removeClass('active');
                    break;
                case 'custom':
                    $('#custom-modal').modal('show');
                    break;
            }
        }
    });
    canvas.on({
        'object:moving': onChange,
        'object:scaling': onChange,
        'object:rotating': onChange,
    });
    function onChange(options) {
        options.target.setCoords();
        if (templateChoice
                && (options.target.selectable
//                        options.target instanceof fabric.Image
//                        || (options.target instanceof fabric.Rect && !options.target.clipFor)
//                        || options.target instanceof fabric.IText
                        )) {
            // check whether target is out of rect and move to next rect, so it will be bound to other rect
            // if it is bound, when mouse up, we will change the container
            var clipRect = fflivesEditor.findByClipName(options.target.clipName);
            if (!btn.hasClass('hidden') || //!clipRect.intersectsWithObject(pug)) {
                    fflivesEditor.isGoingOut(options.target, clipRect)) { // pug is going out of clipRect                    
                btn.removeClass('hidden');
                positionBtn(options.e);
                //canvas.remove(pug);
                // change style for btn
                //$('#drag-proxy').css('transform', 'rotate(' + options.target.angle + 'deg)');
                options.target.set('opacity', 0).set('hasControls', false).set('hasBorders', false);
                $('#toolbar').addClass('hidden');
            } else {
                //btn.addClass('hidden');
            }

        }
    }

    

    canvas.on('mouse:down', function (options) {
        var target = options.target;// target can be null, this action is on whole canvas        
        if (target && target.selectable) {
            if(templateChoice){
                $('#toolbar [data-action=fit]').removeClass('hidden');
            } else {
                $('#toolbar [data-action=fit]').addClass('hidden');
            }
            $('#toolbar [data-action=custom]').addClass('hidden');
            if (target instanceof fabric.Image) {
                // check is it custom
                $('#toolbar [data-action=custom]').removeClass('hidden');
                if (target._element.hasAttribute('point-list')) {
                    $('#toolbar .bg-btn.png').addClass('hidden');
                    $('#toolbar .bg-btn.jpg').addClass('hidden');
                    $('#toolbar .bg-btn.bg-custom>div:first').css('background-image',
                            'url(' + target._element.getAttribute('data-orig') + ')');
                    $('#toolbar [data-action=custom]').addClass('active').siblings().removeClass('active');
                } else {
                    var pngSrc = target._element.src.replace(/\.[\w]+$/, '.png');
                    var jpgSrc = target._element.src.replace(/\.[\w]+$/, '.jpg');
                    $('#toolbar .bg-btn.png').removeClass('hidden').find('>div').css('background-image', 'url(' + pngSrc + ')');
                    $('#toolbar .bg-btn.jpg').removeClass('hidden').find('>div').css('background-image', 'url(' + jpgSrc + ')');
                    $('#toolbar .bg-btn.bg-custom>div:first').css('background-image', 'url(' + jpgSrc + ')');
                    var thumbSrc = target._element.getAttribute('data-thumb');
                    $('#drag-proxy').html('<img draggable="false" data-src="' + target._element.src + '" src="' + thumbSrc + '" />');
                    var imgExt = target._element.src.match(/.([\w]+)$/)[1];
                    $('#toolbar [data-action=' + imgExt + ']').addClass('active').siblings().removeClass('active');
                }
                $('#toolbar').removeClass('hidden')
                        .find('[data-action=flop],[data-action=flip],[data-action=png],[data-action=jpg]').removeClass('hidden');

                $('#opacity_size').addClass('hidden');
            } else if (target instanceof fabric.Rect && !target.clipFor) {
                // for rectangle
                if(target.pattern){

                    var imageSrc = target.pattern.src || (target.fill ? target.fill.source : preloader.find('img').attr('src'));
                    imageSrc = typeof imageSrc === 'function' ? imageSrc() : imageSrc;
                    if(typeof imageSrc !== 'string'){
                        imageSrc = imageSrc.tagName === 'CANVAS' ? imageSrc.toDataURL() : imageSrc.src;                        
                    }
                    if(imageSrc){
                        $('#drag-proxy').html('<img draggable="false" src="' + imageSrc + '" />');    
                    }
                    
                } else {
                    $('#drag-proxy').empty().css('background-color', target.fill);    
                }
                
                $('#toolbar').removeClass('hidden')
                        .find('[data-action=flop],[data-action=flip],[data-action=png],[data-action=jpg]').addClass('hidden');
                $('#opacity_size').removeClass('hidden').find('input').val(target.opacity * 10);

            } else if (target instanceof fabric.IText) {
                // for rectangle
                $('#drag-proxy').css({
                    backgroundColor: '',
                    color: target.fill,
                    fontFamily: target.fontFamily
                }).html('<span class="text-center">' + target.text + '</span>');
                $('#toolbar').removeClass('hidden')
                        .find('[data-action=png],[data-action=jpg]').addClass('hidden');
                $('#opacity_size').addClass('hidden');
            }
        }
        else {
            $('#toolbar').addClass('hidden');
        }
// do something
    });
    canvas.on('mouse:up', function (e) {
        // also check object
        if (e.target && e.target.selectable
//                e.target instanceof fabric.Image
//                || (e.target instanceof fabric.Rect && !e.target.clipFor)
//                || e.target instanceof fabric.IText
                ) {

            if (!templateChoice) {

                // should remove
                if (fflivesEditor.isGoingOut(e.target, canvas, 20)) {
                    $('#toolbar [data-action=remove]').trigger('click');
                }
                return;
            }

            if (!btn.hasClass('hidden')) {

                // add to new place
                var absCoords = fflivesEditor.getAbsoluteCoords(e.e.pageX, e.e.pageY);
                var clipRect = fflivesEditor.findCNameByPosition(absCoords.left, absCoords.top);
                if (clipRect) {
                    clipRect.setFill(templateFillActive);
                    // and we move back the image in the old rect to new one
                    var imageInRect = fflivesEditor.findByClipFor(clipRect.clipFor);
                    if (imageInRect) {
                        imageInRect.clipName = e.target.clipName;   
                        // check repeat                                             
                        fitCheckRepeat(imageInRect, 100);     
                    }

                    // now we just set clipName, then redraw center
                    e.target.clipName = clipRect.clipFor;
                    e.target.set('opacity', 1).set('hasControls', true).set('hasBorders', true);
                    // check repeat
                    fitCheckRepeat(e.target, 100);   

                    $('#toolbar').removeClass('hidden');
                    // set active, then hidden drag-proxy
                    btn.addClass('hidden');
                } else {

                    // should remove
                    //                    console.log('outside');
                    $('#toolbar [data-action=remove]').trigger('click');
                }
            }
        }
    });
    // code for fixed-header tab
    $("#fixed-header-tab").on("click", ".nav-tabs span.close", function () {
        var anchor = $(this).siblings('a');
        $(anchor.attr('href')).remove();
        $(this).parent().remove();
        // focus first one
        $("#fixed-header-tab .nav-tabs li").children('a').first().click();
    });
    $('#embellishments').on('click', '[data-type]', function () {
        var item = $(this);
        var type = +item.attr('data-type');
        $("#fixed-header-tab").addTab({title: $.trim(item.text())});
        $.get('index/get_embellishment/' + type, function (ret) {
            var currentTabPane = $("#fixed-header-tab .tab-pane:last");
            currentTabPane.html(ret);
            if (type === 2) {
                currentTabPane.find("[name=colorpicker]")
                        .simplecolorpicker({theme: 'glyphicons'}).on('change', function () {
                    var tabPane = $(this).closest('.tab-pane');
                    tabPane.find('.texts').css('color', $(this).val());
                });
            }
            $('.nav-tabs>li:last,.tab-pane:last', '#fixed-header-tab')
                    .addClass('active').siblings().removeClass('active');
        });
        return false;
    });
    $("#fixed-header-tab").on('click', '.color-shape [data-type]', function(){
        var data = $(this).data();        
        var colorShape = $(this).closest('.color-shape');
        var rectContainer = colorShape.next('.rects');
        $.get('index/get_embellishment/' + data.type, data, function (ret) {
            rectContainer.html(ret);
            var checked = colorShape.find('[name=repeat]')[0].checked;
            rectContainer.find('[data-type=rect]').data('repeat', checked);
        });
        return false;
    }).on('change', '.color-shape [name=repeat]', function(){
        var rectContainer = $(this).closest('.color-shape').next('.rects');
        var checked = this.checked;        
        rectContainer.find('[data-type=rect]').data('repeat', checked);
    });

    $('#opacity_size input').change(function () {
        var obj = canvas.getActiveObject();
        if (obj) {
            obj.opacity = $(this).val() / 10;
            canvas.renderAll();
        }
    });
});

$.fn.addTab = function (o) {
    return this.each(function () {
        var item = $(this);
        var id = (item.attr('id') || o.idPrefix) + '_' + item.find(".nav-tabs").children().length;
        item.find('.nav-tabs').append('<li><span class="close">×</span><a role="tab" data-toggle="tab" href="#' + id + '">' + (o.title || 'New Tab') + '</a></li>');
        item.find('.tab-content').append('<div class="tab-pane" id="' + id + '"></div>');
        item.updateTabHeight($(window).height() - 50);
    });
};
$.fn.updateTabHeight = function (height) {
    return this.each(function () {
        var item = $(this);
        item.find('.tab-content').height((height || item.height()) - item.find('.nav-tabs').height() - 5);
    });
};

