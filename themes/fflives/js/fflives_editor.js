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




/**
 * Fix json serialization
 * @param {type} object
 * @param {type} callback
 * @returns {undefined}
 */

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

fabric.Object.prototype.toObject = (function (toObject) {
    return function (extraFields) {                        
        var obj = toObject.call(this, extraFields);      
        // we will override fill function using pattern attribute  
        if (obj.pattern) {
            obj.fill = '';
        }
        return obj;
    };
})(fabric.Object.prototype.toObject);

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

fabric.Canvas.prototype.setVisibleControls = function (state) {
    // deactiveAll, and then render before saving
    if (canvas.getActiveGroup()) {
        canvas.getActiveGroup().forEachObject(function (o) {
            o.hasControls = state;
            o.hasBorders = state;
        });
        canvas.discardActiveGroup().renderAll();
    } else {
        var o = canvas.getActiveObject();
        if (o) {
            o.hasControls = state;
            o.hasBorders = state;
        }
        canvas.renderAll();
    }
};

function FFlivesEditorException(message) {
    this.message = message;
    this.name = "FFlivesEditorException";

    // coordinators and current target with mouse
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseTarget = null;
}

function FFlivesEditor(obj) {
    var config = jQuery.extend({
        templateFill: 'rgba(245,245,245,0.6)',
        templateFillOver: 'rgba(193,190,162,0.6)'
    }, obj);

    if (config.canvasID) {
        this.canvas = new fabric.Canvas(config.canvasID);
        // disable group selection
        this.canvas.selection = false;

        this.canvas.on('mouse:move', function(e) {            
            this.editor.mouseX = e.e.layerX;
            this.editor.mouseY = e.e.layerY;    
            this.editor.mouseTarget = e.target;        
        });

        // hover effect
        this.canvas.on('mouse:over', function (e) {            
            if (e.target instanceof fabric.Rect && e.target.clipFor) {
                e.target.setFill(config.templateFillOver);
                canvas.renderAll();
            }
        });

        this.canvas.on('mouse:out', function (e) {
            if (e.target instanceof fabric.Rect && e.target.clipFor) {
                e.target.setFill(config.templateFill);
                canvas.renderAll();
            }
        });

        this.config = config;

        // reference
        this.canvas.editor = this;

    } else {
        throw new FFlivesEditorException("Invalid Canvas ID");
    }


}

// Since the `angle` property of the Image object is stored 
// in degrees, we'll use this to convert it to radians.
FFlivesEditor.degToRad = function (degrees) {
    return degrees * (Math.PI / 180);
};

FFlivesEditor.waitForFonts = function (fonts, callback) {
    var loadedFonts = 0;
    for (var i = 0, l = fonts.length; i < l; ++i) {
        (function (font) {
            var node = document.createElement('span');
            // Characters that vary significantly among different fonts
            node.innerHTML = 'giItT1WQy@!-/#';
            // Visible - so we can measure it - but not on the screen
            node.style.position = 'absolute';
            node.style.left = '-10000px';
            node.style.top = '-10000px';
            // Large font size makes even subtle changes obvious
            node.style.fontSize = '300px';
            // Reset any font properties            
            node.style.fontVariant = 'normal';
            node.style.fontStyle = 'normal';
            node.style.fontWeight = 'normal';
            node.style.letterSpacing = '0';

            document.body.appendChild(node);

            // Remember width with no applied web font
            node.style.fontFamily = font;

            var width = node.offsetWidth;
            var interval;
            function checkFont() {
                // Compare current width with original width
                if (node && node.offsetWidth !== width) {
                    ++loadedFonts;
                    node.parentNode.removeChild(node);
                    node = null;
                }

                // If all fonts have been loaded
                if (loadedFonts >= fonts.length) {
                    if (interval) {
                        clearInterval(interval);
                    }
                    if (loadedFonts === fonts.length) {
                        callback();
                        return true;
                    }
                }
            }
            ;

            if (!checkFont()) {
                interval = setInterval(checkFont, 50);
            }
        })(fonts[i]);
    }
};

FFlivesEditor.customFields = [
            // these for clipping
            'clipName', 'clipFor',
            // these for custom and specific template
            'hasRotatingPoint', 'lockRotation',
            // these for cropping images, and template admin with custom template
            // by default, selectable = false means nothing for controls
            'thumbSrc', 'selectable',
            // these are for font files required, can happen to any object like text, rich text.v..v
            'fontFileSvg', 'fontFileEot', 'fontFileWoff', 'fontFileTtf',
            // for extra pattern and embellishment type
            'ebl', 'pattern'
        ];

FFlivesEditor.fontCache = {};
FFlivesEditor.loadFont = function (o) {
    if (o.fontFamily) {
        if (!FFlivesEditor.fontCache[o.fontFamily]) {
            FFlivesEditor.fontCache[o.fontFamily] = true;
            if (o.fontFileTtf) {
                // at least this one
                var f = document.createElement("style");
                f.type = "text/css";
                document.getElementsByTagName("head")[0].appendChild(f);
                var str = '@font-face {\tfont-family: "' + o.fontFamily + '";\t';
                if (o.fontFileEot) {
                    str += 'src: url("' + o.fontFileEot + '");\t' +
                            'src: url("' + o.fontFileEot + '?#iefix") format("embedded-opentype"),\t';
                }
                if (o.fontFileWoff) {
                    str += 'url("' + o.fontFileWoff + '") format("woff"),\t';
                }

                if (o.fontFileTtf) {
                    str += 'url("' + o.fontFileTtf + '") format("truetype"),\t';
                }

                if (o.fontFileSvg) {
                    str += 'url("' + o.fontFileSvg + "#" + o.fontFamily + '") format("svg");\t';
                }
                str += 'font-weight: normal;\t\tfont-style: normal;\t}';
                f.styleSheet ? f.styleSheet.cssText = str : f.innerHTML = str;

                return true;
            }
        }
    }

    return false;

};

FFlivesEditor.prototype = {
    toJSON: function () {
        return this.canvas.toJSON(FFlivesEditor.customFields);
    },
    clear: function () {
        this.canvas.backgroundColor = "";
        this.canvas.backgroundImage = "";
        // clear all and re-draw
        this.canvas.clear();        
    },
    loadJSON: function (jsonStr, callback) {
        if (jsonStr) {
            // don't load from empty or error json
            this.clear();

            // and load everything from the same json
            this.canvas.loadFromJSON(jsonStr, function () {

                var waitedFonts = [];
                this.canvas.getObjects().forEach(function (obj) {                    
                    // as long as it has font requirement
                    if (obj.fontFamily) {
                        var hasLoaded = FFlivesEditor.loadFont(obj);
                        // wait for external fonts
                        if (hasLoaded) {
                            waitedFonts.push(obj.fontFamily);
                        }
                    }

                    // we have pattern here
                    if (obj.pattern){
                        this.canvas.editor.setRepeatPattern(obj, obj.pattern);
                    }
                });

                if (waitedFonts.length) {
                    // wait until document ready then render after all the fonts have been loaded
                    var _canvas = this.canvas;
                    jQuery(function () {
                        FFlivesEditor.waitForFonts(waitedFonts, function () {
                            // Will be called as soon as ALL specified fonts are available
                            _canvas.renderAll();
                        });
                    });
                }

                // making sure to render canvas at the end
                this.canvas.renderAll();
                callback && callback.call(this);
            });
        }
    },
    getCanvas: function () {
        return this.canvas;
    },
    isGoingOut: function (image, rect, padding) {
        // when resize, the image width is not change really, that's why intersect will not work properly
        //console.log(image.left, image.width, rect.left);
        padding = padding || 20; // 20px left mean it is out of rect
        // default canvas is at {0;0}
        var left = rect.left || 0;
        var top = rect.top || 0;
        // left out, right out, top out, bottom out
        // if one of these conditions found, then return true
        return image.left + (image.width * image.scaleX - padding) < left || // left out
                image.left > left + (rect.width - padding) || // right out
                image.top + (image.height * image.scaleY - padding) < top || // top out
                image.top > top + (rect.height - padding);     // bottom out

    },
    findByClipName: function (name) {
        return jQuery.grep(this.canvas.getObjects(), function (rect) {
            return rect.clipFor === name;
        })[0];
    },
    findByClipFor: function (name) {
        return jQuery.grep(this.canvas.getObjects(), function (image) {
            return image.clipName === name;
        })[0];
    },
    // must remove this to render
    clipByName: function (ctx, obj) {        
        var clipRect = this.findByClipName(obj.clipName);
        if(!clipRect){
            return;
        }
        obj.setCoords();
        // this is for fix 0 degree of cliprect
//    var radian = degToRad(this.angle * -1);  
        var radian = FFlivesEditor.degToRad(clipRect.angle);

        var scaleXTo1 = (1 / obj.scaleX);
        var scaleYTo1 = (1 / obj.scaleY);
        ctx.save();


        var ctxLeft = -obj.width / 2;// + clipRect.strokeWidth;
        var ctxTop = -obj.height / 2;//  + clipRect.strokeWidth;

        ctx.translate(ctxLeft, ctxTop);

//    clipRect.flipX = this.flipX;    

        var scaleH = obj.flipX ? -1 : 1, // Set horizontal scale to -1 if flip horizontal
                scaleV = obj.flipY ? -1 : 1, // Set verical scale to -1 if flip vertical
                posX = obj.flipX ? obj.width / scaleXTo1 * -1 : 0, // Set x position to -100% if flip horizontal 
                posY = obj.flipY ? obj.height / scaleYTo1 * -1 : 0; // Set y position to -100% if flip vertical   

        // scale here, because width and height is remain for easier calculating
        ctx.scale(scaleH * scaleXTo1, scaleV * scaleYTo1);


        var deltaX = (clipRect.left - obj.oCoords.tl.x);/// Math.cos(radian);
        var deltaY = (clipRect.top - obj.oCoords.tl.y);/// Math.cos(radian);

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
    },
    /**
     * 
     * @param {type} x
     * @param {type} y
     * @returns {FFlivesEditor.prototype.findCNameByPosition.rect|
        FFlivesEditor.prototype.findCNameByPosition.objects|
        FFlivesEditor@pro;canvas@call;getObjects}
     */
    findCNameByPosition: function (x, y) {
        var objects = this.canvas.getObjects();
        for (var i = 0; i < objects.length; i++) {
            if (objects[i] instanceof fabric.Rect && objects[i].clipFor) {
                var rect = objects[i];
                // check if this point is in rect, by the default order(zIndex) of all rects
                if (x > rect.left && x < (rect.left + rect.width)
                        && y > rect.top && y < (rect.top + rect.height)) {

                    return rect;
                }
            }
        }

        return null;
    },
    // Note the use of the `originX` and `originY` properties, which we set
    // to 'left' and 'top', respectively. This makes the math in the `clipTo`
    // this is for html element
    getAbsoluteCoords: function (x, y) {
        return {
            left: x - this.canvas._offset.left,
            top: y - this.canvas._offset.top
        };
    },

    fitObject: function (currentCanvasObj, fitEntire) {
        var clipRect = this.findByClipName(currentCanvasObj.clipName);
        if (clipRect) {

            var fitWholeEntire = typeof fitEntire !== 'number' && fitEntire;

            // we reset the width and height of it            
            if (fitWholeEntire && currentCanvasObj instanceof fabric.Rect) {
                currentCanvasObj.width = (clipRect.width / clipRect.height) * currentCanvasObj.height;                
            }

            currentCanvasObj.angle = clipRect.angle;
            // scale to original first
            clipRect.scale(1);
            currentCanvasObj.scale(1);
            // just so simple, we center the currentCanvas to clipRect, and fit it

            var clipRectWidth = clipRect.width, clipRectHeight = clipRect.height;
            if (typeof fitEntire === 'number'){
                clipRectWidth = clipRectHeight = fitEntire;
            }
            var clipRectRatio = clipRectWidth / clipRectHeight;
            var objRectRatio = currentCanvasObj.width / currentCanvasObj.height;
            var radian = FFlivesEditor.degToRad(clipRect.angle);
            var scaleByHeight = clipRectRatio > objRectRatio;
            if(fitWholeEntire){
                scaleByHeight = !scaleByHeight;
            }
            if (scaleByHeight) {
                // scale by height
                currentCanvasObj.height = clipRectHeight;
                currentCanvasObj.width = clipRectHeight * objRectRatio;
                var deltaX = (clipRect.width - currentCanvasObj.width) / 2;                
                currentCanvasObj.top = clipRect.top + Math.sin(radian) * deltaX;                                    
                currentCanvasObj.left = clipRect.left + Math.cos(radian) * deltaX;

            } else {
                // scale by width
                currentCanvasObj.width = clipRectWidth;
                currentCanvasObj.height = clipRectWidth / objRectRatio;
                var deltaY = (clipRect.height - currentCanvasObj.height) / 2;                
                currentCanvasObj.left = clipRect.left - Math.sin(radian) * deltaY;                                    
                currentCanvasObj.top = clipRect.top + Math.cos(radian) * deltaY;
            }

            //    console.log(currentCanvasObj.left,clipRect.left);
            //    console.log(currentCanvasObj.top,clipRect.top);

            // render again
            this.canvas.renderAll();
        }
    },

    setRepeatPattern: function(rect, config) {       

        var myPattern = null;     
        switch(config.fill){

            case 'image':                
                fabric.Image.fromURL(config.src, function(img) {   
                    img.scaleToWidth(config.width || 50);      
                    // pattern means always repeat
                    config.repeat = 'repeat';
                    this.canvas.editor.addRepeatPattern(rect, img, config.padding);                    
                });
                break;

            case 'circle':
                var radius = (config.width || 50) / 2;
                myPattern = new fabric.Circle({ top: 0, left: 0, radius: radius, fill: config.fillColor});                            
                break;

            case 'triangle':
                myPattern = new fabric.Triangle({width: (config.width || 50), height: (config.height || 50), fill: config.fillColor});                
                break;

            case 'heart':                                
                myPattern = this.customShapePath('heart');    
                var scale = (config.width || 50) / myPattern.width;
                myPattern.set({ left: 0, top: 0, scaleX: scale, scaleY: scale,  fill: config.fillColor});
                break;                

            case 'diamond':
                var radius = (config.width || 50) / 2;
                var points = this.regularPolygonPoints(6,radius);
                myPattern = new fabric.Polygon(points, {fill: config.fillColor, left: 0,top: 0}, false);                
                break;

            case 'star':
                var radius = (config.width || 50) / 2;
                var points = this.starPolygonPoints(5,radius, radius/2);
                myPattern = new fabric.Polygon(points, {fill: config.fillColor, left: 0,top: 0}, false);                
                break;

            default:
                break;
        }
        if(myPattern){
            if(config.repeat){
                this.addRepeatPattern(rect, myPattern, config.padding);
            } else {
                this.addNoRepeatPattern(rect, myPattern, config.padding);
            }            
        }                             
    },

    getPatternSourceCanvas: function(pattern, padding){
        var patternSourceCanvas = new fabric.StaticCanvas();        
        patternSourceCanvas.add(pattern);      
        patternSourceCanvas.setDimensions({
          width: pattern.getWidth() + (padding || 0),
          height: pattern.getHeight() + (padding || 0)
        });  
        return patternSourceCanvas;
    },

    addRepeatPattern: function(rect, pattern, padding){

        var patternSourceCanvas = this.getPatternSourceCanvas(pattern, padding);
        rect.fill = new fabric.Pattern({
            source: function() {                                                        
                
                return patternSourceCanvas.getElement();                                                
            },
            repeat: 'repeat'
        });   
        
        rect.on('scaling', function() {
          // apply the scale
          rect.set({width:rect.width*rect.scaleX,scaleX:1,height:rect.height*rect.scaleY, scaleY:1}); 
          // called so that the bounding box etc gets updated
          rect.setCoords(); 
        });

        this.canvas.renderAll();        

    },

    addNoRepeatPattern: function(rect, pattern, padding){
        var patternSourceCanvas = this.getPatternSourceCanvas(pattern, padding);
        var img = new Image();
        img.src = patternSourceCanvas.getElement().toDataURL("image/png");        
        rect.fill = new fabric.Pattern({
            source: img,
            repeat: 'no-repeat'
        });  
        this.canvas.renderAll();    
    },

    regularPolygonPoints:function (sideCount,radius){
      var sweep = Math.PI*2 / sideCount;
      var cx=radius;
      var cy=radius;
      var points=[];
      for(var i=0;i<sideCount;i++){
        var x=cx + radius * Math.cos(i*sweep);
        var y=cy + radius * Math.sin(i*sweep);
        points.push({x:x, y:y});
      }
      return(points);
    },

    customShapePath: function(name){
        switch(name){
            case 'heart':
                return new fabric.Path('M 272.70141,238.71731 \
                    C 206.46141,238.71731 152.70146,292.4773 152.70146,358.71731  \
                    C 152.70146,493.47282 288.63461,528.80461 381.26391,662.02535 \
                    C 468.83815,529.62199 609.82641,489.17075 609.82641,358.71731 \
                    C 609.82641,292.47731 556.06651,238.7173 489.82641,238.71731  \
                    C 441.77851,238.71731 400.42481,267.08774 381.26391,307.90481 \
                    C 362.10311,267.08773 320.74941,238.7173 272.70141,238.71731  \
                    z ');
                break;
            default:
                break;
        }
    },

    starPolygonPoints: function (spikeCount, outerRadius, innerRadius) {      
      var cx = outerRadius;
      var cy = outerRadius;
      var sweep = Math.PI / spikeCount;
      var points = [];
      var angle = 0;

      for (var i = 0; i < spikeCount; i++) {
        var x = cx + Math.cos(angle) * outerRadius;
        var y = cy + Math.sin(angle) * outerRadius;
        points.push({x: x, y: y});
        angle += sweep;

        x = cx + Math.cos(angle) * innerRadius;
        y = cy + Math.sin(angle) * innerRadius;
        points.push({x: x, y: y});
        angle += sweep
      }
      return points;
    },

    forEachObject: function(callback){
        if (this.canvas.getActiveGroup()) {
            this.canvas.getActiveGroup().forEachObject(function (o) {
                callback && callback.call(this.editor, o);
            });            
        } else {
            var o = this.canvas.getActiveObject();
            if (o) {
                callback && callback.call(this.editor, o);
            }            
        }
    },

    // we add some modify because default clone function just clone standard fields
    copyCustomFields: function(objDest, objSrc){
        FFlivesEditor.customFields.forEach(function(prop){
            if (objSrc.hasOwnProperty(prop)) {
                objDest[prop] = objSrc[prop];
            }        
        });

        if(objSrc.pattern){
            // we have pattern here, and we just copy from it
            objDest.fill = '';
            this.setRepeatPattern(objDest, objDest.pattern);                    
        }
    },

    // we support callback for both, so no need to check again
    cloneObject: function(obj, callback){
        // image need to wait for url, so we have to use callback
        if(obj instanceof fabric.Image){
            obj.clone(function(addObject){
                this.canvas.editor.copyCustomFields(addObject, obj);                
                callback && callback(addObject);
            });
        } else {
            var addObject = obj.clone();
            this.copyCustomFields(addObject, obj);                        
            if(callback){
                callback(addObject);
            } else {
                return addObject;
            }
        }
    },

    // find lowest index that we can place over
    findLowestIndex: function(){
        var lowestIdx = this.canvas._objects.length-1;
        while (lowestIdx >0) {
            if(!this.canvas._objects[lowestIdx].selectable){
                break;
            }
            lowestIdx--;
        }
        return lowestIdx;
    },

    // we support moving object, but will not move any object below diselectable object
    // we can use these methods to re-zindex of all object in a groups, even though it is not fast
    /**
     * Moves an object or the objects of a multiple selection
     * to the bottom of the stack of drawn objects
     * @param {fabric.Object} object Object to send to back
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    sendToBack: function (object) {
        if (!object) {
            return this;
        }
        var lowestIdx = this.findLowestIndex();
        this.canvas.moveTo(object, lowestIdx === 0 ? 0 : lowestIdx + 1);
        return this;
    },

    /**
     * Moves an object or the objects of a multiple selection
     * to the top of the stack of drawn objects
     * @param {fabric.Object} object Object to send
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    bringToFront: function (object) {
        // we always move to top so we don't have to care about, this method has checked object
        this.canvas.bringToFront(object);
        return this;
    },


    /**
     * Moves an object or a selection down in stack of drawn objects
     * @param {fabric.Object} object Object to send
     * @param {Boolean} [intersecting] If `true`, send object behind next lower intersecting object
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    sendBackwards: function (object, intersecting) {
        if (!object) {
            return this;
        }
        var idx = this.canvas._objects.indexOf(object);        
        if (idx !== 0) {          
          var newIdx = this.canvas._findNewLowerIndex(object, idx, intersecting);
          var lowestIdx = this.findLowestIndex();                    
          if(lowestIdx ===0 || newIdx > lowestIdx){
            this.canvas.moveTo(object, newIdx);
          }
        }        
        return this;
    },
   

    /**
     * Moves an object or a selection up in stack of drawn objects
     * @param {fabric.Object} object Object to send
     * @param {Boolean} [intersecting] If `true`, send object in front of next upper intersecting object
     * @return {fabric.Canvas} thisArg
     * @chainable
     */
    bringForward: function (object, intersecting) {
      this.canvas.bringForward(object, intersecting);
      return this;
    }

};