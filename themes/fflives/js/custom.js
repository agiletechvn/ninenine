//
//
//
//
//////////////////////
//////////////////////
//// functions a little bit more straight-forward.
//var clipRect1_1 = new fabric.Rect({
//    originX: 'left',
//    originY: 'top',
//    left: 10,
//    top: 10,
//    width: 230,
//    height: 280,
//    fill: '#DDD', /* use transparent for no fill */
////    stroke:'black',
//    strokeWidth: 0,
//    selectable: false
//});
//// We give these `Rect` objects a name property so the `clipTo` functions can
//// find the one by which they want to be clipped.
//clipRect1_1.set({
//    clipFor: 'c1_1'
//});
//
//
//var clipRect1_2 = new fabric.Rect({
//    originX: 'left',
//    originY: 'top',
//    left: 260,
//    top: 10,
//    width: 230,    
//    height: 280,
//    fill: '#DDD', /* use transparent for no fill */
//    strokeWidth: 0,
//    selectable: false
//});
//// We give these `Rect` objects a name property so the `clipTo` functions can
//// find the one by which they want to be clipped.
//clipRect1_2.set({
//    clipFor: 'c1_2'
//});
//
//
//var clipRect1_3 = new fabric.Rect({
//    originX: 'left',
//    originY: 'top',
//    left: 10,
//    top: 310,
//    width: 480,
//    height: 180,
//    fill: '#DDD', /* use transparent for no fill */
//    strokeWidth: 0,
//    selectable: false
//});
//// We give these `Rect` objects a name property so the `clipTo` functions can
//// find the one by which they want to be clipped.
//clipRect1_3.set({
//    clipFor: 'c1_3'
//});
//
//// template 2
//var clipRect2_1 = new fabric.Rect({
//    originX: 'left',
//    originY: 'top',
//    left: 10,
//    top: 10,
//    width: 180,
//    height: 480,
//    strokeDashArray: [3, 5],
//    fill: templateFill2,
//    stroke: '#222222',
//    strokeWidth: 0.5,
//    selectable: false
//});
//// We give these `Rect` objects a name property so the `clipTo` functions can
//// find the one by which they want to be clipped.
//clipRect2_1.set({
//    clipFor: 'c2_1'
//});
//
//var clipRect2_2 = new fabric.Rect({
//    originX: 'left',
//    originY: 'top',
//    left: 300,
//    top: 10,
//    width: 190,
//    height: 480,
//    strokeDashArray: [3, 5],
//    fill: templateFill2,
//    stroke: '#222222',
//    strokeWidth: 0.5,
//    selectable: false
//});
//// We give these `Rect` objects a name property so the `clipTo` functions can
//// find the one by which they want to be clipped.
//clipRect2_2.set({
//    clipFor: 'c2_2'
//});
//
//var clipRect2_3 = new fabric.Rect({
//    originX: 'left',
//    originY: 'top',
//    left: 150,
//    top: 50,
//    width: 200,
//    height: 300,
//    strokeDashArray: [3, 5],
//    fill: templateFill2,
//    stroke: '#222222',
//    strokeWidth: 0.5,
//    selectable: false
//});
//// We give these `Rect` objects a name property so the `clipTo` functions can
//// find the one by which they want to be clipped.
//clipRect2_3.set({
//    clipFor: 'c2_3'
//});
//
//var clipRect2_4 = new fabric.Rect({
//    originX: 'left',
//    originY: 'top',
//    left: 120,
//    top: 300,
//    width: 260,
//    height: 180,
//    strokeDashArray: [3, 5],
//    fill: templateFill2,
//    stroke: '#222222',
//    strokeWidth: 0.5,
//    selectable: false
//});
//// We give these `Rect` objects a name property so the `clipTo` functions can
//// find the one by which they want to be clipped.
//clipRect2_4.set({
//    clipFor: 'c2_4'
//});
//
//
//
//// template 3
//var clipRect3_1 = new fabric.Rect({
//    originX: 'left',
//    originY: 'top',
//    left: 10,
//    top: 10,
//    width: 340,
//    height: 140,
//    fill: '#DDD', /* use transparent for no fill */
//    stroke: 'gray',
//    strokeWidth: 0,
//    selectable: false
//});
//// We give these `Rect` objects a name property so the `clipTo` functions can
//// find the one by which they want to be clipped.
//clipRect3_1.set({
//    clipFor: 'c3_1'
//});
//
//var clipRect3_2 = new fabric.Rect({
//    originX: 'left',
//    originY: 'top',
//    left: 360,
//    top: 10,
//    width: 130,
//    height: 480,
//    fill: '#DDD', /* use transparent for no fill */
//    stroke: 'gray',
//    strokeWidth: 0,
//    selectable: false
//});
//// We give these `Rect` objects a name property so the `clipTo` functions can
//// find the one by which they want to be clipped.
//clipRect3_2.set({
//    clipFor: 'c3_2'
//});
//
//var clipRect3_3 = new fabric.Rect({
//    originX: 'left',
//    originY: 'top',
//    left: 10,
//    top: 160,
//    width: 340,
//    height: 330,
//    fill: '#DDD', /* use transparent for no fill */
//    stroke: 'gray',
//    strokeWidth: 0,
//    selectable: false
//});
//// We give these `Rect` objects a name property so the `clipTo` functions can
//// find the one by which they want to be clipped.
//clipRect3_3.set({
//    clipFor: 'c3_3'
//});
//
//var text = new fabric.Text('FFlives', {
//    left: 210,
//    top: 10,
//    hasControls: false,
//    hasBorders: false,
//    scaleX: 0.5,
//    scaleY: 0.5,
//    fontFamily: 'helvetica',
//    fill: '#000000'
//});

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
