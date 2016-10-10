/**
 * 
 * Currently, we debug this function to know why phantomjs doesn't have the same behavior like chrome
 * 
 * @param {type} imgEl
 * @param {type} opt
 * @returns {textFromImage.ret}
 */


function textFromImage(imgEl, opt){
        var debug = opt.debug || false;
        var invert = opt.invert || false;
        var threshold = opt.threshold || 120;
        var padding = opt.padding || 1;
        var hitRequire = opt.hitRequire || 2;
        var c = document.createElement('canvas');
        c.width = imgEl.naturalWidth - 2*padding;
        c.height = imgEl.naturalHeight - 2*padding;
        var ctx = c.getContext('2d');
        ctx.drawImage(imgEl,padding,padding,c.width,c.height,0,0,c.width,c.height);
        
        var image = ctx.getImageData(0, 0, c.width, c.height);
        // Convert to grayscale
        convertToGayScale(image, invert);
        thresholdImage(image,threshold);
        ctx.putImageData(image,0,0);
      
        var blocks = cutIntoBlocks(c, image, 200, 200, hitRequire);
        var ret = {text:'',output:[]};
        if(debug){
            ret.mainImage = c.toDataURL();
            ret.images = [];
        }
        c.width = c.height = 280;
        blocks.forEach(function(block){
            ctx.clearRect(0,0,c.width,c.height);
            ctx.putImageData(block.image, (c.width-block.image.width)/2, (c.height-block.image.height)/2);
            var temp = recognize(c);
            ret.text += temp.max;
            ret.output.push(temp.output);
            if(debug){
                ret.images.push(block.canvas.toDataURL());
            }
        });
        return ret;
}


 function convertToGayScale(image, invert) {
        var r = 0.299, g = 0.587, b = 0.114;
        for (var x = 0; x < image.width; x++) {
            for (var y = 0; y < image.height; y++) {
                var i = 4 * (x + y * image.width);
                var luma = Math.floor(
                        image.data[i] * r +
                        image.data[i + 1] * g +
                        image.data[i + 2] * b
                        );
                if (invert) {
                    luma = 255 - luma;
                }
                image.data[i] = luma;
                image.data[i + 1] = luma;
                image.data[i + 2] = luma;
                image.data[i + 3] = 255;
            }
        }
    }
    
    function thresholdImage(image, threshold) {
        var d = image.data;
        for (var x = 0; x < image.width; x++) {
            for (var y = 0; y < image.height; y++) {
                var i = 4 * (x + y * image.width);
                var v = d[i] > threshold ? 255 : 0;
                d[i] = d[i + 1] = d[i + 2] = v;
            }
        }
    }

    function cutIntoBlocks(canvas, image, blockWidth, blockHeight, hitRequire) {
        // we know getImageData is slow, that's why it is better to pass this through
        var ctx = canvas.getContext('2d');
        if(!image){
            image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
        hitRequire = hitRequire || 2;
        var blocks = [];
        var block_start = 0;
        var block_end = 0;
        var before_white = true;
        for (var x = 0; x < image.width; x++) {
            var white = true;
            var hit = 0;
            for (var y = 0; y < image.height; y++) {
                var i = 4 * (x + y * image.width);
                var c = image.data[i];
                if (c < 140) {
                    hit++;
                    if(hit>=hitRequire){
                        white = false;
                        break;
                    }
                }
            }
            if (before_white === true && white === false) {
                block_start = x;
            }
            else if (before_white === false && white === true) {
                block_end = x - 1;
                var block = {start: block_start, end: block_end, image: {}, canvas: {}};
                blocks.push(block);
            }
            before_white = white;
        }
        //console.log(blocks);

        // Clone each block
        for (var w = 0; w < blocks.length; w++) {
            blocks[w].image = ctx.createImageData(canvas.width, canvas.height);
            //blocks[w].image.width = image.width;
            //blocks[w].image.height = image.height;
            //blocks[w].image.data = new Uint8ClampedArray(image.data.length);
            for (var i = 0; i < image.data.length; i++) {
                blocks[w].image.data[i] = image.data[i];
            }
        }

        // Whiteout all other characters from each block
        for (var w = 0; w < blocks.length; w++) {
            for (var x = 0; x < image.width; x++) {
                if (x < blocks[w].start || x > blocks[w].end) {
                    for (var y = 0; y < image.height; y++) {
                        var i = 4 * (x + y * image.width);
                        blocks[w].image.data[i] = 255;
                        blocks[w].image.data[i + 1] = 255;
                        blocks[w].image.data[i + 2] = 255;
                    }
                }
            }
        }

        // Crop each block, pad with whitespace to appropriate ratio, and resize to 60 x 50
        for (var w = 0; w < blocks.length; w++) {
            // We already have the x-boundaries, just need to find y-boundaries
            var y_min = 0;
            findmin:
                    for (var y = 0; y < blocks[w].image.height; y++) {
                for (var x = 0; x < blocks[w].image.width; x++) {
                    var i = 4 * (x + y * image.width);
                    if (blocks[w].image.data[i] < 200) {
                        y_min = y;
                        break findmin;
                    }
                }
            }
            var y_max = 0;
            findmax:
                    for (var y = blocks[w].image.height; y >= 0; y--) {
                for (var x = 0; x < blocks[w].image.width; x++) {
                    var i = 4 * (x + y * image.width);
                    if (blocks[w].image.data[i] < 200) {
                        y_max = y;
                        break findmax;
                    }
                }
            }

            // Pad and resize
            var cwidth = blocks[w].end - blocks[w].start + 1;
            var cheight = y_max - y_min + 1;
            var cratio = cwidth / cheight;
            var sx = blocks[w].start;
            var sy = y_min;
            var sw = blocks[w].end - blocks[w].start + 1;
            var sh = y_max - y_min + 1;

            var dimx = blockWidth || 60;
            var dimy = blockHeight || 50;
            var dimr = dimx / dimy;
            var dh = dimy;
            var dw = dimx;
            var dy = 0;
            var dx = 0;
            if (cratio < dimr) {
                dh = dimy;
                dw = Math.round(cwidth * dimy / cheight);
                dy = 0;
                dx = Math.round((dimx - dw) / 2);
            }
            else if (cratio > dimr) {
                dw = dimx;
                dh = Math.round(cheight * dimx / cwidth);
                dx = 0;
                dy = Math.round((dimy - dh) / 2);
            }
            blocks[w].canvas = document.createElement('canvas');
            blocks[w].canvas.width = dimx;
            blocks[w].canvas.height = dimy;
            var context = blocks[w].canvas.getContext('2d');
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, dimx, dimy);
            context.drawImage(canvas, sx, sy, sw, sh, dx, dy, dw, dh);
            // rebind image
            blocks[w].image = context.getImageData(0, 0, blocks[w].canvas.width,blocks[w].canvas.height);
        }


        return blocks;
    }

// computes center of mass of digit, for centering
// note 1 stands for black (0 white) so we have to invert.
function centerImage(img) {
    var meanX = 0;
    var meanY = 0;
    var rows = img.length;
    var columns = img[0].length;
    var sumPixels = 0;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < columns; x++) {
            var pixel = (1 - img[y][x]);
            sumPixels += pixel;
            meanY += y * pixel;
            meanX += x * pixel;
        }
    }
    meanX /= sumPixels;
    meanY /= sumPixels;

    var dY = Math.round(rows / 2 - meanY);
    var dX = Math.round(columns / 2 - meanX);
    return {transX: dX, transY: dY};
}

// given grayscale image, find bounding rectangle of digit defined
// by above-threshold surrounding
function getBoundingRectangle(img, threshold) {
    var rows = img.length;
    var columns = img[0].length;
    var minX = columns;
    var minY = rows;
    var maxX = -1;
    var maxY = -1;
    for (var y = 0; y < rows; y++) {
        for (var x = 0; x < columns; x++) {
            if (img[y][x] < threshold) {
                if (minX > x)
                    minX = x;
                if (maxX < x)
                    maxX = x;
                if (minY > y)
                    minY = y;
                if (maxY < y)
                    maxY = y;
            }
        }
    }
    return {minY: minY, minX: minX, maxY: maxY, maxX: maxX};
}

// take canvas image and convert to grayscale. Mainly because my
// own functions operate easier on grayscale, but some stuff like
// resizing and translating is better done with the canvas functions
function imageDataToGrayscale(imgData) {
    var grayscaleImg = [];
    for (var y = 0; y < imgData.height; y++) {
        grayscaleImg[y] = [];
        for (var x = 0; x < imgData.width; x++) {
            var offset = y * 4 * imgData.width + 4 * x;
            var alpha = imgData.data[offset + 3];
            // weird: when painting with stroke, alpha == 0 means white;
            // alpha > 0 is a grayscale value; in that case I simply take the R value
            if (alpha === 0) {
                imgData.data[offset] = 255;
                imgData.data[offset + 1] = 255;
                imgData.data[offset + 2] = 255;
            }
            imgData.data[offset + 3] = 255;
            // simply take red channel value. Not correct, but works for
            // black or white images.
            grayscaleImg[y][x] = imgData.data[y * 4 * imgData.width + x * 4 + 0] / 255;
        }
    }
    return grayscaleImg;
}

// takes the image in the canvas, centers & resizes it, then puts into 10x10 px bins
// to give a 28x28 grayscale image; then, computes class probability via neural network
function recognize(canvas, imgData) {
    //var t1 = new Date();
    if(!imgData){
        // convert RGBA image to a grayscale array, then compute bounding rectangle and center of mass  
        imgData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    }
    var grayscaleImg = imageDataToGrayscale(imgData);
    var boundingRectangle = getBoundingRectangle(grayscaleImg, 0.01);
    var trans = centerImage(grayscaleImg); // [dX, dY] to center of mass

    // copy image to hidden canvas, translate to center-of-mass, then
    // scale to fit into a 200x200 box (see MNIST calibration notes on
    // Yann LeCun's website)
    var canvasCopy = document.createElement("canvas");
    canvasCopy.width = imgData.width;
    canvasCopy.height = imgData.height;
    var copyCtx = canvasCopy.getContext("2d");
    var brW = boundingRectangle.maxX + 1 - boundingRectangle.minX;
    var brH = boundingRectangle.maxY + 1 - boundingRectangle.minY;
    var scaling = 190 / (brW > brH ? brW : brH);
    // scale
    copyCtx.translate(canvas.width / 2, canvas.height / 2);
    copyCtx.scale(scaling, scaling);
    copyCtx.translate(-canvas.width / 2, -canvas.height / 2);
    // translate to center of mass
    copyCtx.translate(trans.transX, trans.transY);


    // default take image from original canvas
    copyCtx.drawImage(canvas, 0, 0);
    


    // now bin image into 10x10 blocks (giving a 28x28 image)
    imgData = copyCtx.getImageData(0, 0, canvas.width, canvas.height);
    grayscaleImg = imageDataToGrayscale(imgData);
    var blockSize = Math.floor(canvas.width / 10);
    var nnInput = new Array(blockSize * blockSize);
    for (var y = 0; y < blockSize; y++) {
        for (var x = 0; x < blockSize; x++) {
            var mean = 0;
            for (var v = 0; v < 10; v++) {
                for (var h = 0; h < 10; h++) {
                    mean += grayscaleImg[y * 10 + v][x * 10 + h];
                }
            }
            mean = (1 - mean / 100); // average and invert
            nnInput[x * blockSize + y] = (mean - .5) / .5;
        }
    }

    //for copy & pasting the digit into matlab
    //document.getElementById('nnInput').innerHTML=JSON.stringify(nnInput)+';<br><br><br><br>';
    var maxIndex = 0;
    var nnOutput = nn(nnInput, w12, bias2, w23, bias3);
    //console.log(nnOutput);
    nnOutput.reduce(function(p, c, i) {
        if (p < c) {
            maxIndex = i;
            return c;
        } else
            return p;
    });
    if(maxIndex === 8){
        var max = Math.max(nnOutput[9], nnOutput[6]);
        if(max > 0.03)
            maxIndex = max === nnOutput[9] ? 9: 6; // may be 9 or 6
    }
    //console.log('maxIndex: ' + maxIndex);
    //document.getElementById('nnOut').innerHTML = maxIndex;
    //clearBeforeDraw = true;
    //var dt = new Date() - t1;
    //console.log('recognize time: ' + dt + 'ms');
    return {max:maxIndex,output:nnOutput};
}