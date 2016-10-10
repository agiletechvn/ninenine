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


$(function () {
    function windowResize() {
        var screenHeight = $(window).height() - 50;
        $('.full-height').height(screenHeight);
    }
    windowResize();
    $(window).resize(windowResize);




    $('#toolbar').on('click', '[data-action]', function () {
        var item = $(this);
        var action = item.attr('data-action');
        var currentCanvasObj = canvas.getActiveObject();
        if (currentCanvasObj) {
            switch (action) {
                case 'remove':
                    canvas.remove(currentCanvasObj);
                    $('#toolbar').addClass('hidden');
                    if(selectedClipRect){
                        selectedClipRect.setFill(templateFill2);
                        selectedClipRect = null;
                        canvas.renderAll();
                    }
                    break;
                case 'flop':
                    currentCanvasObj.flipX = !currentCanvasObj.flipX;
                    canvas.renderAll();
                    if(currentCanvasObj.flipX){
                        $('#drag-proxy').addClass('flop');
                    } else {
                        $('#drag-proxy').removeClass('flop');
                    }
                    break;
                case 'flip':
                    currentCanvasObj.flipY = !currentCanvasObj.flipY;
                    canvas.renderAll();
                    if(currentCanvasObj.flipY){
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
        if(options.e.type === 'mousemove'){
            // check whether target is out of rect and move to next rect, so it will be bound to other rect
            // if it is bound, when mouse up, we will change the container
        }
        options.target.setCoords();
        canvas.forEachObject(function (obj) {
            if (obj === options.target) {
                obj.setOpacity(1);
                return;
            }
            obj.setOpacity(options.target.intersectsWithObject(obj) ? 0.7 : 1);
        });
    }

    var isDown = false;
    canvas.on('mouse:down', function (options) {
        var target = options.target;
        if (target.clipName) {
            $('#toolbar .bg-btn>div').css('background-image', 'url(' + target._element.src + ')');
            var thumbSrc = target._element.getAttribute('data-thumb');
            $('#drag-proxy').html('<img draggable="false" data-src="' + target._element.src + '" src="'+thumbSrc+'" />');
            $('#toolbar').removeClass('hidden');
        } else {
            $('#toolbar').addClass('hidden');
        }
        // do something
    });

    canvas.on('mouse:up', function (e) {
        isDown = false;
        var btn = $('#drag-proxy');
        if (!btn.hasClass('hidden') && e.target instanceof fabric.Image){            
            // add to new place
            var absCoords = canvas.getAbsoluteCoords({left: e.e.pageX, top: e.e.pageY});
            var eDrop = jQuery.Event( "drop" );
            eDrop.layerX = absCoords.left;
            eDrop.layerY = absCoords.top;
            var cName = getSelectCName(eDrop);
            var clipRect = findByClipName(cName);
            clipRect.setFill(templateFill2Active);
            
            // now we just set clipName, then redraw center
            e.target.clipName = cName;
            e.target.set('opacity',1).set('hasControls', true).set('hasBorders', true);
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