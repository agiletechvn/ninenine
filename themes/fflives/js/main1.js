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


fabric.NamedImage = fabric.util.createClass(fabric.Image, {
    type: 'named-image',
    initialize: function (element, options) {
        this.callSuper('initialize', element, options);
        if (options) {
            this.set('name', options.name);
            this.set('clipTo', function (ctx) {

            });
        }
    },
    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {name: this.name});
    }
});

fabric.NamedImage.fromObject = function (object, callback) {
    fabric.util.loadImage(object.src, function (img) {
        callback && callback(new fabric.NamedImage(img, object));
    });
};

// parse to callback
fabric.NamedImage.async = true;



function setTemplate1(num) {
    // create image element
    var img = document.createElement('img');
    img.src = 'themes/fflives/images/data/thumb/151753756.jpg';

// create an instance of named image
    var namedImg = new fabric.NamedImage(img, {name: 'foobar'});

// add it to canvas
    canvas.add(namedImg);

// save json
    var json = JSON.stringify(canvas);

// clear canvas
    canvas.clear();

// and load everything from the same json
    canvas.loadFromJSON(json, function () {

        // making sure to render canvas at the end
        canvas.renderAll();

        // and checking if object's "name" is preserved
        console.log(canvas.item(0).name);
    });
}


function setTemplate() {
    var pugImg = new Image();
    pugImg.onload = function (img) {
        pugImg.init = true; // enable only one time
        // hide preload immediately
        var config = {
            // we create this with full quality
            width: pugImg.width / 2,
            height: pugImg.height / 2,
            backgroundColor: '#fff'
        };

        config.clipTo = function (ctx) {

        };

        var pug = new fabric.Image(pugImg, config);
        canvas.add(pug);


        // save json
        var json = JSON.stringify(canvas);

// clear canvas
        canvas.clear();

// and load everything from the same json
        canvas.loadFromJSON(json, function () {

            // making sure to render canvas at the end
            canvas.renderAll();

            // and checking if object's "name" is preserved
            console.log(canvas.item(0).name);
        });


//            pug.on('moving', function (options) {
//                
//            });
    };
    pugImg.init = false;
    pugImg.src = 'themes/fflives/images/data/thumb/151753756.jpg';
}