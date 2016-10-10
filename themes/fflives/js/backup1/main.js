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

/* Drag and Drop code adapted from http://www.html5rocks.com/en/tutorials/dnd/basics/ */

var templateFill2 = 'rgba(245,245,245,0.6)';
var templateFill2Over = 'rgba(193,190,162,0.6)';
var templateFill2Active = 'rgba(225,225,225,0.6)';

var minImageSize = 100; // min size of image when resize
var templateChoice = 0;
setTemplate(templateChoice);



// these functions are for custom template creating, using main.js, should put into core files
function testCanvas() {
    // also save clipName and clipFor
    var json = canvas.toJSON(['clipName', 'clipFor', 'hasRotatingPoint', 'lockRotation', 'thumbSrc']);
    var jsonStr = JSON.stringify(json);
//    var dataURL = canvas.toDataURL();
    //$('#main-canvas').parent().addClass('hidden');
    //Create Canvas2
//    var canvas2 = new fabric.Canvas('test');
//    canvas2.loadFromJSON(json, canvas2.renderAll.bind(canvas2));
//    

    canvas.clear();
    // and load everything from the same json
    canvas.loadFromJSON(jsonStr, function () {
        // making sure to render canvas at the end
        canvas.renderAll();
    });

}

function setCurrentTemplate() {
//    var dataURL = canvas.toDataURL();
    var jsonStr = localStorage.getItem('ffliveCurrentTemplate');
    templateChoice = +localStorage.getItem('ffliveTemplateChoice');
    if (jsonStr) {
        canvas.clear();
        // and load everything from the same json
        canvas.loadFromJSON(jsonStr, function () {
            // making sure to render canvas at the end
            canvas.renderAll();
            if (templateChoice == 0) {
                $('#toolbar .bg-custom').removeClass('hidden');
            } else {
                $('#toolbar .bg-custom').addClass('hidden');
            }
        });
    }

}


fabric.Image.fromObject = function (object, callback) {
//    fabric.util.loadImage(object.src, function (img) {
    var pugImg = new Image();
    pugImg.setAttribute('crossOrigin', 'anonymous');
    pugImg.onload = function () {        
        var pug = new fabric.Image(pugImg, object);
        // we process some custom attributes
        var element = pug.getElement();
        if (object.thumbSrc) {
            element.setAttribute('data-thumb', object.thumbSrc);
        }
        if (object.pointList) {
            // must have both point-list and data-orig
            element.setAttribute('data-orig', object.dataOrig);
            element.setAttribute('point-list', object.pointList);
        }

        callback && callback(pug);
    };
    pugImg.src = object.src;
//    });
};

fabric.Image.prototype.toObject = (function (toObject) {
    return function (extraFields) {
        var attributes = {};
        var element = this.getElement();
        if (element.hasAttribute('data-thumb')) {
            attributes.thumbSrc = element.getAttribute('data-thumb');
        }
        if (element.hasAttribute('point-list')) {
            attributes.pointList = element.getAttribute('point-list');
            attributes.dataOrig = element.getAttribute('data-orig');
        }
        var ret = toObject.call(this, extraFields);
        return fabric.util.object.extend(ret, attributes);
    };
})(fabric.Image.prototype.toObject);



var canvas = new fabric.Canvas('main-canvas');
// Note the use of the `originX` and `originY` properties, which we set
// to 'left' and 'top', respectively. This makes the math in the `clipTo`

canvas.selection = false;

fabric.Canvas.prototype.fitObject = function (currentCanvasObj) {
    var clipRect = findByClipName(currentCanvasObj.clipName);
    currentCanvasObj.angle = clipRect.angle;
    // scale to original first
    currentCanvasObj.scale(1);
    // just so simple, we center the currentCanvas to clipRect, and fit it
    var clipRectRatio = clipRect.width / clipRect.height;
    var objRectRatio = currentCanvasObj.width / currentCanvasObj.height;
    var radian = degToRad(clipRect.angle);

    if (clipRectRatio > objRectRatio) {
        // scale by height
        currentCanvasObj.height = clipRect.height;
        currentCanvasObj.width = clipRect.height * objRectRatio;
        var deltaX = (clipRect.width - currentCanvasObj.width) / 2;
        currentCanvasObj.top = clipRect.top + Math.sin(radian) * deltaX;
        currentCanvasObj.left = clipRect.left + Math.cos(radian) * deltaX;

    } else {
        // scale by width
        currentCanvasObj.width = clipRect.width;
        currentCanvasObj.height = clipRect.width / objRectRatio;
        var deltaY = (clipRect.height - currentCanvasObj.height) / 2;
        currentCanvasObj.left = clipRect.left - Math.sin(radian) * deltaY;
        currentCanvasObj.top = clipRect.top + Math.cos(radian) * deltaY;

    }

//    console.log(currentCanvasObj.left,clipRect.left);
//    console.log(currentCanvasObj.top,clipRect.top);

    // render again
    this.renderAll();
};


fabric.Canvas.prototype.getAbsoluteCoords = function (object) {
    return {
        left: object.left - this._offset.left,
        top: object.top - this._offset.top
    };
}

function isGoingOut(image, rect, padding) {
    // when resize, the image width is not change really, that's why intersect will not work properly
    //console.log(image.left, image.width, rect.left);
    padding = padding || 20; // 20px left mean it is out of rect
    // left out, right out, top out, bottom out
    // if one of these conditions found, then return true
    return image.left + (image.width * image.scaleX - padding) < rect.left || // left out
            image.left > rect.left + (rect.width - padding) || // right out
            image.top + (image.height * image.scaleY - padding) < rect.top || // top out
            image.top > rect.top + (rect.height - padding);     // bottom out

}

function findByClipName(name) {
    return _(canvas.getObjects()).where({
        clipFor: name
    }).first()
}

function findByClipFor(name) {
    return _(canvas.getObjects()).where({
        clipName: name
    }).first()
}

// Since the `angle` property of the Image object is stored 
// in degrees, we'll use this to convert it to radians.
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

// must remove this to render
function clipByName(ctx) {
    this.setCoords();
    var clipRect = findByClipName(this.clipName);
    // this is for fix 0 degree of cliprect
//    var radian = degToRad(this.angle * -1);  
    var radian = degToRad(clipRect.angle);

    var scaleXTo1 = (1 / this.scaleX);
    var scaleYTo1 = (1 / this.scaleY);
    ctx.save();


    var ctxLeft = -this.width / 2;// + clipRect.strokeWidth;
    var ctxTop = -this.height / 2;//  + clipRect.strokeWidth;

    ctx.translate(ctxLeft, ctxTop);

//    clipRect.flipX = this.flipX;    

    var scaleH = this.flipX ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
            scaleV = this.flipY ? -1 : 1, // Set verical scale to -1 if flip vertical
            posX = this.flipX ? this.width / scaleXTo1 * -1 : 0, // Set x position to -100% if flip horizontal 
            posY = this.flipY ? this.height / scaleYTo1 * -1 : 0; // Set y position to -100% if flip vertical   

    // scale here, because width and height is remain for easier calculating
    ctx.scale(scaleH * scaleXTo1, scaleV * scaleYTo1);


    var deltaX = (clipRect.left - this.oCoords.tl.x);/// Math.cos(radian);
    var deltaY = (clipRect.top - this.oCoords.tl.y);/// Math.cos(radian);

    var newX = (deltaX + posX) + (deltaY) * Math.tan(radian);/// Math.cos(radian);
    var newY = (deltaY + posY) - (deltaX) * Math.tan(radian);

    ctx.fillStyle = "#FF0000";
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'transparent';

    ctx.beginPath();
    ctx.rect(
            newX,
            newY,
            clipRect.width,
            clipRect.height
            );

    ctx.closePath();
//    ctx.stroke();
//    ctx.clip();
    ctx.restore();
}

function loadTemplateFromRet(ret) {
    var jsonStr = ret.data;
    templateChoice = +ret.template_id;
    if (jsonStr) {
        // clear canvas and current backgroundColor, together with image
        canvas.clear();
        canvas.backgroundColor = "";
        canvas.backgroundImage = "";
        // and load everything from the same json
        canvas.loadFromJSON(jsonStr, function () {

            // not allow rect or text to be editable :D
            canvas.getObjects().forEach(function (obj) {
                if (obj instanceof fabric.Image == false) {
                    obj.selectable = false;
                }
            });
            // making sure to render canvas at the end
            canvas.renderAll();
            if (templateChoice == 0) {
                $('#toolbar .bg-custom').removeClass('hidden');
            } else {
                $('#toolbar .bg-custom').addClass('hidden');
            }
        });
    }
}

function setTemplate(num) {
//    templateChoice = num;
//    if (templateChoice == 0) {
//        canvas.clear().renderAll();
//        canvas.backgroundColor = "#EEEEEE";
//    } else if (templateChoice == 1) {
//        canvas.clear().renderAll();
//        canvas.backgroundColor = "#E1F5FE";
//        canvas.add(clipRect1_1);
//        canvas.add(clipRect1_2);
//        canvas.add(clipRect1_3);
//    } else if (templateChoice == 2) {
//        canvas.clear().renderAll();
//        canvas.backgroundColor = "";
//        clipRect2_1.strokeWidth = 0.5;
//        clipRect2_2.strokeWidth = 0.5;
//        clipRect2_3.strokeWidth = 0.5;
//        clipRect2_4.strokeWidth = 0.5;
//
//
//        canvas.add(clipRect2_1);
//        canvas.add(clipRect2_2);
//        canvas.add(clipRect2_3);
//        canvas.add(clipRect2_4);
//    } else if (templateChoice == 3) {
//        canvas.clear().renderAll();
//        canvas.backgroundColor = "#fee";
//        canvas.add(clipRect3_1);
//        canvas.add(clipRect3_2);
//        canvas.add(clipRect3_3);
//    }
//    $('#toolbar').addClass('hidden');
//    if (templateChoice == 0) {
//        $('#toolbar .bg-custom').removeClass('hidden');
//    } else {
//        $('#toolbar .bg-custom').addClass('hidden');
//    }
//    // text here
//    canvas.add(text);

    $.get('template/creation/' + num, function (ret) {
        loadTemplateFromRet(ret);
    });
}

$(function () {
    function windowResize() {
        var screenHeight = $(window).height() - 50;
        $('.full-height').height(screenHeight);
    }
    windowResize();
    $(window).resize(windowResize);


    /* 
     NOTE: the start and end handlers are events for the <img> elements; the rest are bound to the canvas container.
     */

    function handleDragStart(e) {
        $('#images img').removeClass('img_dragging');
        this.classList.add('img_dragging');
    }

    var selectedClipRect = null;
    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }

        if (e.dataTransfer)
            e.dataTransfer.dropEffect = 'copy'; // See the section on the DataTransfer object.
        // NOTE: comment above refers to the article (see top) -natchiketa

        // get the selected layer    
        var cName = getSelectCName(e);
        var clipRect = findByClipName(cName);
        if (clipRect) {
            if (selectedClipRect && selectedClipRect != clipRect) {
                selectedClipRect.setFill(templateFill2);
            }
            clipRect.setFill(templateFill2Over);
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
            selectedClipRect.setFill(templateFill2);
            selectedClipRect = null;
            canvas.renderAll();
        }
    }

    var btn = $('#drag-proxy'), preloader = $('#preloader');

    function positionBtn(e) {

        var absCoords = canvas.getAbsoluteCoords({left: e.pageX, top: e.pageY});
        btn.css({
            left: (absCoords.left - btn.width() / 2) + 'px',
            top: (absCoords.top - btn.height() / 2) + 'px'
        });

        var eDrag = jQuery.Event("dragover");
        eDrag.layerX = absCoords.left;
        eDrag.layerY = absCoords.top;
        handleDragOver(eDrag);
    }

    function getSelectCName(e) {
        var cName;
        var objects = canvas.getObjects();
        for (var i = 0; i < objects.length; i++) {
            if (objects[i] instanceof fabric.Rect) {
                var rect = objects[i];
                // check if this point is in rect, by the default order(zIndex) of all rects
                if (e.layerX > rect.left && e.layerX < (rect.left + rect.width)
                        && e.layerY > rect.top && e.layerY < (rect.top + rect.height)) {

                    cName = rect.clipFor;
                    break;
                }
            }
        }

        return cName;
    }

    function addImageObj(cName, imgSrc, thumbSrc, e) {

        var offset;

        if (templateChoice) {
            // remove the image in this rect first
            var imageInRect = findByClipFor(cName);
            if (imageInRect) {
                canvas.remove(imageInRect);
            }

            // then create new one, maybe add loading state
            // show loading image at the center of this clip        
            var clipRect = findByClipName(cName);
            var absCoords = {left: clipRect.oCoords.ml.x, top: clipRect.oCoords.ml.y};

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
                    var _this = this;
                    return _.bind(clipByName, _this)(ctx);
                };

                config.hasRotatingPoint = false;
                config.lockRotation = true;
            } else {
                config.left = offset.left + preloader.width() / 2 - config.width / 2;
                config.top = offset.top + preloader.width() / 2 - config.height / 2;
                config.hasRotatingPoint = true;
                config.lockRotation = false;
            }
            var pug = new fabric.Image(pugImg, config);
            canvas.add(pug);
            if (templateChoice) {
                canvas.fitObject(pug);
            }
            canvas.setActiveObject(pug);
            pug._element.setAttribute('data-thumb', thumbSrc);
            canvas.fire('mouse:down', {e: null, target: pug});

//            pug.on('moving', function (options) {
//                
//            });
        };
        pugImg.init = false;
        pugImg.src = imgSrc;

    }

    function handleDrop(e) {

        e.stopPropagation(); // Stops some browsers from redirecting.
        e.preventDefault(); // Stops some browsers from redirecting.

        var cName = null;
        if (templateChoice) {
            cName = getSelectCName(e);
            //console.log(cName);
            var clipRect = findByClipName(cName);
            clipRect.setFill(templateFill2Active);
        } else {

        }

        // handle browser images
        var activeImage = $('#images img.img_dragging');
        var myImgSrc = activeImage.attr('data-src');
        var thumbSrc = activeImage.attr('src');
        addImageObj(cName, myImgSrc, thumbSrc, e);

        return false;
    }

    function handleDragEnd(e) {
        // this/e.target is the source node.
        $('#images img').removeClass('img_dragging');
    }

    function initImageHandle() {
        var images = document.querySelectorAll('#images img');
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
                    $('#home').html(ret);
                    initImageHandle();
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


//    $(window).keydown(function (e) {
//        switch (e.keyCode) {
//            case 46: // when press delete
//                if (canvas.getActiveGroup()) {
//                    canvas.getActiveGroup().forEachObject(function (o) {
//                        canvas.remove(o);
//                    });
//                    canvas.discardActiveGroup().renderAll();
//                } else {
//                    canvas.remove(canvas.getActiveObject());
//                }
//        }
//    });    


    $('#toolbar').on('click', '[data-action]', function () {
        var item = $(this);
        var action = item.attr('data-action');
        var currentCanvasObj = canvas.getActiveObject();
        if (currentCanvasObj) {
            switch (action) {
                case 'remove':
                    canvas.remove(currentCanvasObj);
                    $('#toolbar').addClass('hidden');
                    if (selectedClipRect) {
                        selectedClipRect.setFill(templateFill2);
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
                    if (templateChoice) {
                        canvas.fitObject(currentCanvasObj);
                    }
                    break;
                case 'png':
                case 'jpg':
                    var imgEl = currentCanvasObj.getElement();
                    var newSrc = imgEl.getAttribute('src').replace(/\.[\w]+$/, '.' + action);
                    if (newSrc != imgEl.getAttribute('src')) {
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
//        canvas.forEachObject(function (obj) {
//            if (obj === options.target) {
//                obj.setOpacity(1);
//                return;
//            }
//            obj.setOpacity(options.target.intersectsWithObject(obj) ? 0.7 : 1);
//        });
        if (templateChoice && options.target instanceof fabric.Image) {
            // check whether target is out of rect and move to next rect, so it will be bound to other rect
            // if it is bound, when mouse up, we will change the container
            var clipRect = findByClipName(options.target.clipName);
            if (!btn.hasClass('hidden') || //!clipRect.intersectsWithObject(pug)) {
                    isGoingOut(options.target, clipRect)) { // pug is going out of clipRect                    
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

    var isDown = false;
    canvas.on('mouse:down', function (options) {
        var target = options.target;
        if (target instanceof fabric.Image) {

            // check is it custom
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
            $('#toolbar').removeClass('hidden');
        } else {
            $('#toolbar').addClass('hidden');
        }
        // do something
    });

    canvas.on('mouse:up', function (e) {
        isDown = false;
        if (templateChoice == 0) {
            isDown = true;
            return;
        }

        if (!btn.hasClass('hidden') && e.target instanceof fabric.Image) {
            // add to new place
            var absCoords = canvas.getAbsoluteCoords({left: e.e.pageX, top: e.e.pageY});
            var eDrop = jQuery.Event("drop");
            eDrop.layerX = absCoords.left;
            eDrop.layerY = absCoords.top;
            var cName = getSelectCName(eDrop);
            var clipRect = findByClipName(cName);
            if (clipRect) {
                clipRect.setFill(templateFill2Active);
            }

            // and we move back the image in the old rect to new one
            var imageInRect = findByClipFor(cName);
            if (imageInRect) {
                imageInRect.clipName = e.target.clipName;
                canvas.fitObject(imageInRect);
            }

            // now we just set clipName, then redraw center
            e.target.clipName = cName;
            e.target.set('opacity', 1).set('hasControls', true).set('hasBorders', true);
            canvas.fitObject(e.target);
            $('#toolbar').removeClass('hidden');



            //canvas.fire('mouse:down', { e: null, target:e.target});

            // handle browser images, like new one ?
//            canvas.remove(e.target);
//            var imgEl = btn.find('img');
//            var myImgSrc = imgEl.attr('data-src');
//            var myThumbSrc = imgEl.attr('src');
//            addImageObj(cName, myImgSrc, myThumbSrc);

            // set active, then hidden drag-proxy
            btn.addClass('hidden');
        }
    });

    canvas.on('object:over', function (e) {
        console.log(e);
    });

    canvas.on('mouse:over', function (e) {
        //console.log(e);
        if (e.target instanceof fabric.Rect) {
            e.target.setFill(templateFill2Active);
            canvas.renderAll();
        }
    });

    canvas.on('mouse:out', function (e) {
        if (e.target instanceof fabric.Rect) {
            e.target.setFill(templateFill2);
            canvas.renderAll();
        }
    });



});