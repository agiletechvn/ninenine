
var canvas = new fabric.Canvas('main-canvas');


function getClipFor() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function setStyle(object, styleName, value) {

    if (object instanceof fabric.IText) {
        if (object.setSelectionStyles && object.isEditing) {
            var style = {};
            style[styleName] = value;
            object.setSelectionStyles(style);
        }
        else {
            object[styleName] = value;
        }
    } else {
        if (styleName === 'fill') {
            object.stroke = value;
        }
    }
}
function getStyle(object, styleName) {
    return (object.getSelectionStyles && object.isEditing)
            ? object.getSelectionStyles()[styleName]
            : object[styleName];
}

function addHandler(id, fn, eventName) {
    document.getElementById(id)[eventName || 'onclick'] = function () {
        var el = this;
        var obj = canvas.getActiveObject();
        if (obj) {
            fn.call(el, obj);
            canvas.renderAll();
        }
    };
}

addHandler('bold', function (obj) {
    var isBold = getStyle(obj, 'fontWeight') === 'bold';
    setStyle(obj, 'fontWeight', isBold ? '' : 'bold');
});

addHandler('italic', function (obj) {
    var isItalic = getStyle(obj, 'fontStyle') === 'italic';
    setStyle(obj, 'fontStyle', isItalic ? '' : 'italic');
});

addHandler('underline', function (obj) {
    var isUnderline = (getStyle(obj, 'textDecoration') || '').indexOf('underline') > -1;
    setStyle(obj, 'textDecoration', isUnderline ? '' : 'underline');
});

addHandler('line-through', function (obj) {
    var isLinethrough = (getStyle(obj, 'textDecoration') || '').indexOf('line-through') > -1;
    setStyle(obj, 'textDecoration', isLinethrough ? '' : 'line-through');
});

addHandler('bg-color', function (obj) {
    setStyle(obj, 'fill', this.value);
}, 'onchange');

addHandler('size', function (obj) {
    setStyle(obj, 'fontSize', parseInt(this.value, 10));
}, 'onchange');


var templateFill2 = 'rgba(245,245,245,0.6)';
var startY = 0, startX = 0, currentRect, currentText;
canvas.on('mouse:down', function (options) {
    var target = options.target;

    if (target instanceof fabric.Rect) {

        $('#template-item').bootstrapSwitch('state', true);

    } else if (target instanceof fabric.IText) {
        $('#template-item').bootstrapSwitch('state', false);
    }
    // do something

    else if (typeof target === "undefined") {
        startY = options.e.offsetY;
        startX = options.e.offsetX;

//        console.log(startX, startY, $('#template-item').bootstrapSwitch('state'));

        if ($('#template-item').bootstrapSwitch('state')) {
            console.log('hehe');
            currentRect = new fabric.Rect({
                top: startY,
                left: startX,
                width: 0,
                height: 0,
                strokeDashArray: [3, 5],
                fill: templateFill2,
                stroke: $('#bg-color').val(),
                strokeWidth: 0.5
            });


            console.log("added");

            canvas.add(currentRect);
        } else {



        }



    }
});

canvas.on('mouse:move', function (option) {
    if (currentRect) {
        var e = option.e;
        currentRect.set('width', e.offsetX - startX);
        currentRect.set('height', e.offsetY - startY);
        currentRect.setCoords();
    }
});

canvas.on('mouse:up', function (option) {
    // canvas.off('mouse:move');
    if (currentRect) {
        
        // too small, should remove it
        if (currentRect.width < 100 || currentRect.height < 100) {

            if (currentRect.width > 0) {
                alert('Minimum size is 100x100');
            }

            canvas.remove(currentRect);
            console.log("removed");
        } else {
            // set a uniq clipfor
            currentRect.set({
                clipFor: getClipFor()
            });
        }
    } else {
        if (option.e.offsetX === startX || option.offsetY === startY) {
            currentText = new fabric.IText('hello\nworld', {
                left: startX,
                top: startY,
                fontFamily: 'Helvetica',
                fill: $('#bg-color').val(),
                lineHeight: 1
            });
            canvas.add(currentText);
        }
    }
    currentRect = null;
});


function loadTemplateFromRet(ret) {
    var jsonStr = ret.data;
    if (jsonStr) {
        // clear canvas and current backgroundColor, together with image
        canvas.clear();
        canvas.backgroundColor = "";
        canvas.backgroundImage = "";
        // and load everything from the same json
        canvas.loadFromJSON(jsonStr, function () {
            // making sure to render canvas at the end
            canvas.renderAll();
        });
    }
}


$(function () {

    $('#template-item').bootstrapSwitch({
        onText: 'Rect',
        offText: 'Text'
    }).on('switchChange.bootstrapSwitch', function (event, state) {
        //console.log(state); // true | false
        if (state === false) {
            $('#text-button').css('visibility', 'visible');
        } else {
            $('#text-button').css('visibility', 'hidden');
        }
    });


    $('#remove-button').click(function () {
        if (canvas.getActiveGroup()) {
            canvas.getActiveGroup().forEachObject(function (o) {
                canvas.remove(o);
            });
            canvas.discardActiveGroup().renderAll();
        } else if (canvas.getActiveObject()) {
            canvas.remove(canvas.getActiveObject());
        }
    });

    var toggleBg = true;
    $('#canvas-bg').click(function () {
        canvas.setBackgroundImage(toggleBg ? 'themes/fflives/images/fflives_template_bg.jpg' : '', canvas.renderAll.bind(canvas), {
            backgroundImageOpacity: 0.5,
            backgroundImageStretch: false
        });

        toggleBg = !toggleBg;
    });

});