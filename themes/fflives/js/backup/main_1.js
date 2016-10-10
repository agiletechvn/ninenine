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
var canvas = new fabric.Canvas('main-canvas');
// Note the use of the `originX` and `originY` properties, which we set
// to 'left' and 'top', respectively. This makes the math in the `clipTo`

fabric.Canvas.prototype.fitObject = function (currentCanvasObj) {
    var clipRect = findByClipName(currentCanvasObj.clipName);
    // scale to original first
    currentCanvasObj.scale(1);
    // just so simple, we center the currentCanvas to clipRect, and fit it
    var clipRectRatio = clipRect.width / clipRect.height;
    var objRectRatio = currentCanvasObj.width / currentCanvasObj.height;
    if (clipRectRatio > objRectRatio) {
        // scale by height
        currentCanvasObj.top = clipRect.top;
        currentCanvasObj.height = clipRect.height;
        currentCanvasObj.width = clipRect.height * objRectRatio;
        // center left
        currentCanvasObj.left = clipRect.left + (clipRect.width - currentCanvasObj.width) / 2;
    } else {
        // scale by width
        currentCanvasObj.left = clipRect.left;
        currentCanvasObj.width = clipRect.width;
        currentCanvasObj.height = clipRect.width / objRectRatio;
        // center left
        currentCanvasObj.top = clipRect.top + (clipRect.height - currentCanvasObj.height) / 2;
    }
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
var clipByName = function (ctx) {
    this.setCoords();
    var clipRect = findByClipName(this.clipName);
    var scaleXTo1 = (1 / this.scaleX);
    var scaleYTo1 = (1 / this.scaleY);
    ctx.save();

    var ctxLeft = -(this.width / 2) + clipRect.strokeWidth;
    var ctxTop = -(this.height / 2) + clipRect.strokeWidth;
//    var ctxWidth = clipRect.width - clipRect.strokeWidth;
//    var ctxHeight = clipRect.height - clipRect.strokeWidth;

    ctx.translate(ctxLeft, ctxTop);
    
    clipRect.flipX = this.flipX;

    ctx.rotate(degToRad(this.angle * -1));
    
     var scaleH = this.flipX ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
        scaleV = this.flipY ? -1 : 1, // Set verical scale to -1 if flip vertical
        posX = this.flipX ? this.width/scaleXTo1 * -1 : 0, // Set x position to -100% if flip horizontal 
        posY = this.flipY ? this.height/scaleYTo1 * -1 : 0; // Set y position to -100% if flip vertical
        
    // scale here, because width and height is remain for easier calculating
    ctx.scale(scaleH * scaleXTo1, scaleV * scaleYTo1);
    
    ctx.beginPath();
    ctx.rect(
            clipRect.left - this.oCoords.tl.x + posX,
            clipRect.top - this.oCoords.tl.y  + posY,
            clipRect.width,
            clipRect.height
            );
    ctx.closePath();
    ctx.restore();
}

function setTemplate(num) {
    templateChoice = num;
    if (templateChoice == 1) {
        canvas.clear().renderAll();
        canvas.backgroundColor = "#E1F5FE";
        canvas.add(clipRect1_1);
        canvas.add(clipRect1_2);
        canvas.add(clipRect1_3);
    } else if (templateChoice == 2) {
        canvas.clear().renderAll();
        canvas.backgroundColor = "";
        clipRect2_1.strokeWidth = 0.5;
        clipRect2_2.strokeWidth = 0.5;
        clipRect2_3.strokeWidth = 0.5;
        canvas.add(clipRect2_1);
        canvas.add(clipRect2_2);
        canvas.add(clipRect2_3);
        canvas.add(clipRect2_4);
    } else if (templateChoice == 3) {
        canvas.clear().renderAll();
        canvas.backgroundColor = "#fee";
        canvas.add(clipRect3_1);
        canvas.add(clipRect3_2);
        canvas.add(clipRect3_3);
    }

    // text here
    canvas.add(text);
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
        [].forEach.call(images, function (img) {
            img.classList.remove('img_dragging');
        });
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
        if (templateChoice == 1) {
            if (e.layerX > 10 && e.layerX < 240 && e.layerY > 10 && e.layerY < 280) {
                cName = 'c1_1';
            }
            else if (e.layerX > 260 && e.layerX < 490 && e.layerY > 10 && e.layerY < 280) {
                cName = 'c1_2';
            }
            else if (e.layerX > 10 && e.layerX < 490 && e.layerY > 310 && e.layerY < 490) {
                cName = 'c1_3';
            }
        } else if (templateChoice == 2) {
            if (e.layerX > 10 && e.layerX < 190 && e.layerY > 10 && e.layerY < 490) {
                cName = 'c2_1';
            }
            else if (e.layerX > 300 && e.layerX < 490 && e.layerY > 10 && e.layerY < 490) {
                cName = 'c2_2';
            }
            else if (e.layerX > 150 && e.layerX < 350 && e.layerY > 50 && e.layerY < 350) {
                cName = 'c2_3';
            }
            else if (e.layerX > 120 && e.layerX < 380 && e.layerY > 300 && e.layerY < 480) {
                cName = 'c2_4';
            }

        } else if (templateChoice == 3) {
            if (e.layerX > 10 && e.layerX < 350 && e.layerY > 10 && e.layerY < 150) {
                cName = 'c3_1';

            }
            else if (e.layerX > 360 && e.layerX < 490 && e.layerY > 10 && e.layerY < 490) {
                cName = 'c3_2';
            }
            else if (e.layerX > 10 && e.layerX < 350 && e.layerY > 160 && e.layerY < 490) {
                cName = 'c3_3';
            }
        }
        return cName;
    }

    function addImageObj(cName, imgSrc, thumbSrc) {

        // remove the image in this rect first
        var imageInRect = findByClipFor(cName);
        if (imageInRect) {
            canvas.remove(imageInRect);
        }

        // then create new one, maybe add loading state
        // show loading image at the center of this clip        
        var clipRect = findByClipName(cName);
        var absCoords = {left: clipRect.oCoords.ml.x, top: clipRect.oCoords.ml.y};
        preloader.css({
            left: (absCoords.left + ((clipRect.width - preloader.width()) / 2)) + 'px',
            top: (absCoords.top - preloader.height() / 2) + 'px'
        }).removeClass('hidden');

        // wait until image is show then hide preloader
        var pugImg = new Image();
        pugImg.onload = function (img) {
            // hide preload immediately
            preloader.addClass('hidden');
            var pug = new fabric.Image(pugImg, {
                // we create this with full quality
                width: pugImg.width,
                height: pugImg.height,
                left: 0,
                top: 0,
                hasRotatingPoint:false,
                lockRotation:true,
                // not smaller than 100 pixel, and should not be larger than 0.5
                minScaleLimit: Math.min(0.5, minImageSize / Math.max(pugImg.width, pugImg.height)).toFixed(2),
                backgroundColor: '#fff',
                clipName: cName,
                clipTo: function (ctx) {
                    var _this = this;
                    return _.bind(clipByName, _this)(ctx);
                }
            });
            canvas.add(pug);
            canvas.fitObject(pug);
            canvas.setActiveObject(pug);
            pug._element.setAttribute('data-thumb', thumbSrc);
            canvas.fire('mouse:down', {e: null, target: pug});

//            pug.on('moving', function (options) {
//                
//            });
        };
        pugImg.src = imgSrc;

    }

    function handleDrop(e) {

        e.stopPropagation(); // Stops some browsers from redirecting.
        e.preventDefault(); // Stops some browsers from redirecting.

        var cName = getSelectCName(e);
        //console.log(cName);
        var clipRect = findByClipName(cName);
        clipRect.setFill(templateFill2Active);
        // handle browser images
        var activeImage = $('#images img.img_dragging');
        var myImgSrc = activeImage.attr('data-src');
        var thumbSrc = activeImage.attr('src');
        addImageObj(cName, myImgSrc, thumbSrc);

        return false;
    }

    function handleDragEnd(e) {
        // this/e.target is the source node.
        [].forEach.call(images, function (img) {
            img.classList.remove('img_dragging');
        });
    }

    if (Modernizr.draganddrop) {
        // Browser supports HTML5 DnD.

        // Bind the event listeners for the image elements
        var images = document.querySelectorAll('#images img');
        [].forEach.call(images, function (img) {
            img.addEventListener('dragstart', handleDragStart, false);
            img.addEventListener('dragend', handleDragEnd, false);
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
                    canvas.fitObject(currentCanvasObj);
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
        canvas.forEachObject(function (obj) {
            if (obj === options.target) {
                obj.setOpacity(1);
                return;
            }
            obj.setOpacity(options.target.intersectsWithObject(obj) ? 0.7 : 1);
        });
        if (options.target instanceof fabric.Image) {
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
        if (target.clipName) {
            $('#toolbar .bg-btn>div').css('background-image', 'url(' + target._element.src + ')');
            var thumbSrc = target._element.getAttribute('data-thumb');
            $('#drag-proxy').html('<img draggable="false" data-src="' + target._element.src + '" src="' + thumbSrc + '" />');
            $('#toolbar').removeClass('hidden');
        } else {
            $('#toolbar').addClass('hidden');
        }
        // do something
    });

    canvas.on('mouse:up', function (e) {
        isDown = false;
        if (!btn.hasClass('hidden') && e.target instanceof fabric.Image) {
            // add to new place
            var absCoords = canvas.getAbsoluteCoords({left: e.e.pageX, top: e.e.pageY});
            var eDrop = jQuery.Event("drop");
            eDrop.layerX = absCoords.left;
            eDrop.layerY = absCoords.top;
            var cName = getSelectCName(eDrop);
            var clipRect = findByClipName(cName);
            clipRect.setFill(templateFill2Active);

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