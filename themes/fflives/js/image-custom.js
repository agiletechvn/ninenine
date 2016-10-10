var RGBA = 4;
// index from image with x and y coordination
function getPixelArrayIndex(bitmap, x, y) {
    return (y * bitmap.width + x) * RGBA;
}

// x,y is the click point
function floodFill(bitmap, replacementColor, tolerance, x, y) {

    var start = getPixelArrayIndex(bitmap, x || 0, y || 0);
    var queue = [];

    /**
     * http://en.wikipedia.org/wiki/Flood_fill
     */
    (function (node, targetColor, replColor, toler) {
        queue.push(node);

        while (queue.length) {
            node = queue.pop();
            // equal color will be replace by replace color with a tolerance
            if (colorEquals(node, targetColor, toler)) {
                setColor(node, replColor);
                // get node from west, east, north and south
                queue.push(
                        getNode('west', node),
                        getNode('east', node),
                        getNode('north', node),
                        getNode('south', node)
                        );
            }
        }
    }(
            start,
            Array.prototype.slice.call(bitmap.data, start, start + RGBA),
            replacementColor || [0, 0, 0, 0], // default is transparent
            tolerance || 10                     // for the simple image, we should use the tolerance gt than 100
            ));

    // check color is different with a tolerance
    function colorEquals(node, color, tolerance) {
        // r,g,b and alpha
        if (node < 0 || node + RGBA - 1 > bitmap.data.length) {
            return false;
        }

        var diff = 0;
        for (var i = 0; i < RGBA; i += 1) {
            diff += Math.abs(bitmap.data[node + i] - color[i]);
        }
        return diff <= tolerance;
    }

    function setColor(node, color) {
        for (var i = 0; i < RGBA; i += 1) {
            bitmap.data[node + i] = color[i];
        }
    }

    // get node around
    function getNode(direction, node) {
        var n = 0;
        switch (direction) {
            case 'west':
                n = 1;
                break;
            case 'east':
                n = -1;
                break;
            case 'north':
                n = -bitmap.width;
                break;
            case 'south':
                n = bitmap.width;
                break;
        }

        return node + n * RGBA;
    }


}

var geom = {};
geom.contour = function (bitmap, grid, start) {
    var s = start || d3_geom_contourStart(bitmap, grid), // starting point 
            c = [], // contour polygon 
            x = s[0], // current x position 
            y = s[1], // current y position 
            dx = 0, // next x direction 
            dy = 0, // next y direction 
            pdx = NaN, // previous x direction 
            pdy = NaN, // previous y direction 
            i = 0;

    do {
        // determine marching squares index 
        i = 0;
        if (grid(bitmap, x - 1, y - 1))
            i += 1;
        if (grid(bitmap, x, y - 1))
            i += 2;
        if (grid(bitmap, x - 1, y))
            i += 4;
        if (grid(bitmap, x, y))
            i += 8;

        // determine next direction 
        if (i === 6) {
            dx = pdy === -1 ? -1 : 1;
            dy = 0;
        } else if (i === 9) {
            dx = 0;
            dy = pdx === 1 ? -1 : 1;
        } else {
            dx = d3_geom_contourDx[i];
            dy = d3_geom_contourDy[i];
        }

        // update contour polygon 
        if (dx !== pdx && dy !== pdy) {
            c.push({x: x, y: y});
            pdx = dx;
            pdy = dy;
        }

        x += dx;
        y += dy;
    } while (s[0] != x || s[1] != y);

    return c;
};

// lookup tables for marching directions 
var d3_geom_contourDx = [1, 0, 1, 1, -1, 0, -1, 1, 0, 0, 0, 0, -1, 0, -1, NaN],
        d3_geom_contourDy = [0, -1, 0, 0, 0, -1, 0, 0, 1, -1, 1, 1, 0, -1, 0, NaN];

function d3_geom_contourStart(bitmap, grid) {
    var x = 0,
            y = 0;

    // search for a starting point; begin at origin 
    // and proceed along outward-expanding diagonals 
    while (true) {
        if (grid(bitmap, x, y)) {
            return [x, y];
        }
        if (x === 0) {
            x = y + 1;
            y = 0;
        } else {
            x = x - 1;
            y = y + 1;
        }
    }
}


// for simplify the points
// square distance between 2 points
function getSqDist(p1, p2) {

    var dx = p1.x - p2.x,
            dy = p1.y - p2.y;

    return dx * dx + dy * dy;
}

// square distance from a point to a segment
function getSqSegDist(p, p1, p2) {

    var x = p1.x,
            y = p1.y,
            dx = p2.x - x,
            dy = p2.y - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = p2.x;
            y = p2.y;

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p.x - x;
    dy = p.y - y;

    return dx * dx + dy * dy;
}
// rest of the code doesn't care about point format

// basic distance-based simplification
function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
            newPoints = [prevPoint],
            point;

    for (var i = 1, len = points.length; i < len; i++) {
        point = points[i];

        if (getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== point)
        newPoints.push(point);

    return newPoints;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    var maxSqDist = sqTolerance,
            index;

    for (var i = first + 1; i < last; i++) {
        var sqDist = getSqSegDist(points[i], points[first], points[last]);

        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }

    if (maxSqDist > sqTolerance) {
        if (index - first > 1)
            simplifyDPStep(points, first, index, sqTolerance, simplified);
        simplified.push(points[index]);
        if (last - index > 1)
            simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(points, sqTolerance) {
    var last = points.length - 1;

    var simplified = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
}

// both algorithms combined for awesome performance
function simplify(points, tolerance, highestQuality) {

    if (points.length <= 2)
        return points;

    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);

    return points;
}


function clippingPath(canvas, points, image) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    if (points.length < 2) {
        return false;
    }
    ctx.fillStyle = 'rgb(255,255,255)';
    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(points[0], points[1]);
    for (var i = 0; i < points.length; i += 2) {
        if (points.length > 2 && i > 1) {
            ctx.lineTo(points[i], points[i + 1]);
        }
    }
    ctx.closePath();
//            ctx.fillStyle = 'rgba(255,0,0,0.3)';
//            ctx.fill();
    ctx.stroke();

    // make the current path a clipping path
    ctx.clip();

    // draw the image which will be clipped except in the clipping path
    ctx.drawImage(image, 0, 0);

    // restore the unclipped context (==undo the clipping path)
    ctx.restore();


    return canvas.toDataURL();
}


// now the main part
window.addEventListener('load', function () {
    var img = document.querySelector('#img-before');
    var canvas = document.querySelector('#step1');
    canvas.width = img.width;
    canvas.height = img.height;

    var cc = canvas.getContext('2d');
    cc.drawImage(img, 0, 0);

    var bitmap = cc.getImageData(0, 0, canvas.width, canvas.height);
    cc.clearRect(0, 0, canvas.width, canvas.height);
    floodFill(bitmap, [0, 0, 0, 0], 100, 0, 0);


    // now the border
    // call the marching ants algorithm
    // to get the outline path of the image
    // (outline=outside path of transparent pixels
    // Function as argment This is used by the marching ants algorithm
    // to determine the outline of the non-transparent
    // pixels on the image
    var points = geom.contour(bitmap, function (bitmap, x, y) {
        var a = bitmap.data[getPixelArrayIndex(bitmap, x, y) + 3];
        return(a > 20);
    });

    // draw image
    cc.putImageData(bitmap, 0, 0);

    var filledImage = document.createElement('img');
    filledImage.src = canvas.toDataURL();
    canvas.parentNode.insertBefore(filledImage, canvas);
    canvas.parentNode.removeChild(canvas);



    var canvas2 = document.querySelector('#step2');
    canvas2.width = img.width;
    canvas2.height = img.height;

    var ctx = canvas2.getContext('2d');
    // draw outline path
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < points.length; i++) {
        var point = points[i];
        ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.stroke();


    // now for the polygon, we even use it as the mask for fabric to process the clip
    var simplerPoints = simplify(points, 2, true);
    var cropViewer = $('#crop-viewer');
    
//    cropViewer.attr('data-image-url',filledImage.src);

    // we assign simpler value for the view so it will display easier with html value
    var pointData = [];
    simplerPoints.forEach(function (point) {
        pointData.push(point.x);
        pointData.push(point.y);
    });

    // change background
    cropViewer.next().css('background','url("data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAChJREFUeNpiPHPmDAMDg7GxMZBkgrPOnj3L+P//fwgLKgNhAeUBAgwAccMOaDnngLgAAAAASUVORK5CYII=")');

    // trigger change
    cropViewer.val(pointData.join(',')).change();


    // we should make a preview, by using a canvas hidden, then crop them with simpler points, then get the url and
    // assign to preview
    var canvas1 = document.querySelector('#canvas-hidden');

    canvas1.width = img.width;
    canvas1.height = img.height;

    var a = [2, 5, 20, 40, 80];
    for (var i = 0; i < 5; i++) {
         var simplerPoints1 = simplify(points, a[i], true);

    // we assign simpler value for the view so it will display easier with html value
    var pointData1 = [];
    simplerPoints1.forEach(function (point) {
        pointData1.push(point.x);
        pointData1.push(point.y);
    });
    
        var src = clippingPath(canvas1, pointData1, img);

        $('#preview').append('<img height="100" src="' + src + '"/>');
    }

}, false);