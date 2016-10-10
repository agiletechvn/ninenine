function parseQuery(query) {
    var params = {};
    if (!query)
        return params; // return empty object
    var pairs = query.replace(/^[^\?]+\??/, '').split(/[;&]/);
    for (var i = 0; i < pairs.length; i++) {
        var keyVal = pairs[i].split('=');
        if (!keyVal || keyVal.length !== 2)
            continue;
        var key = unescape(keyVal[0]);
        var val = unescape(keyVal[1]);
        val = val.replace(/\+/g, ' ');
        params[key] = val;
    }
    return params;
}

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
geom.contour = function (bitmap, grid, start, maxLoop) {
    var s = start || d3_geom_contourStart(bitmap, grid), // starting point 
            c = [], // contour polygon 
            x = s[0], // current x position 
            y = s[1], // current y position 
            dx = 0, // next x direction 
            dy = 0, // next y direction 
            pdx = NaN, // previous x direction 
            pdy = NaN, // previous y direction 
            i = 0, loop = 0;
    // not loop over 10000, this is a fault
    maxLoop = maxLoop || 10000;
    do {
        loop++;
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

        if (loop > maxLoop)
            break;
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
    ctx.strokeStyle = 'transparent';

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

function getPointArray(points) {
    var pointData = [];
    points.forEach(function (point) {
        pointData.push(point.x);
        pointData.push(point.y);
    });
    return pointData;
}

function getPointImage(img) {
    return [0, 0, img.width, 0, img.width, img.height, 0, img.height];
}

function setPointList(pointList) {
    $("#custom-modal .btn-polygon").addClass('active').siblings().removeClass('active');
    cropMode = 'polygon';
    var cropViewer = $('#crop-viewer');
    cropViewer.attr('data-image-url', cropImg.src);
    cropViewer.val(pointList).attr('data-fixed-point', 0).change();
}

// now the main part
var cropMode = 'polygon';
var cropImg = new Image();
cropImg.setAttribute('crossOrigin', 'anonymous');
var activeElement;

cropImg.onload = function () {

    var canvasHidden = document.querySelector('#canvas-hidden');
    canvasHidden.width = cropImg.width;
    canvasHidden.height = cropImg.height;


    var cc = canvasHidden.getContext('2d');
    cc.drawImage(cropImg, 0, 0);

    var bitmap = cc.getImageData(0, 0, canvasHidden.width, canvasHidden.height);
    cc.clearRect(0, 0, canvasHidden.width, canvasHidden.height);

    var match = cropImg.src.match(/.[\w]+$/);
    // if it is jpg then flood fill it
    if (match && match[0] === '.jpg') {
        floodFill(bitmap, [0, 0, 0, 0], 100, 0, 0);
        // floodFill(bitmap, [0, 0, 0, 0], 128, 50, 50);
    }

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

    // we should make a preview, by using a canvas hidden, then crop them with simpler points, then get the url and
    // assign to preview
    var a = [2, 5, 20, 40, 80];
    $('#mask-list .mask').each(function (i) {
        var imgEl = $(this).find('img:first');
        var simplerPointsItem = simplify(points, a[i], true);

        // we assign simpler value for the view so it will display easier with html value
        var pointDataItem = getPointArray(simplerPointsItem);
        imgEl.attr('src', clippingPath(canvasHidden, pointDataItem, cropImg)).attr('point-list', pointDataItem.join(','));
    });

    var pointList = activeElement.getAttribute('point-list');
    if (pointList) {
        setPointList(pointList);
    } else {
        $('#mask-list .mask:first').click();
    }
};

// will devide the code later
$(function () {
// dialog function
    $("#custom-modal").on('show.bs.modal', function () {
        activeElement = canvas.getActiveObject().getElement();
        $("#custom-modal .btn-polygon").addClass('active').siblings().removeClass('active');

        // when we use crop function, the image should be put in data-orig attribute, so we can render the crop
        // should use png ^^
        cropImg.src = activeElement.getAttribute('data-orig') || activeElement.src.replace(/.[\w]+$/, '.png');

    }).on('click', '.btn-primary', function () {

        activeElement.setAttribute('data-orig', cropImg.src);
        activeElement.setAttribute('point-list', $('#crop-viewer').val());
        // now the main source
        var pointDataItem = $('#crop-viewer').val().split(',');
        var canvasHidden = document.querySelector('#canvas-hidden');
        activeElement.setAttribute('src', clippingPath(canvasHidden, pointDataItem, cropImg));
        $('#custom-modal').modal('hide');
        canvas.renderAll();
        canvas.fire('mouse:down', {e: null, target: canvas.getActiveObject()});
    }).on('click', '#crop-viewer-reset', function () {

        // if mode is rectangle, reset to rectangle that cover the image
        // else reset to no point

        var cropViewer = $('#crop-viewer');
        if (cropMode == 'polygon') {
            cropViewer.val('').attr('data-fixed-point', 0);
        } else {
            var pointData = getPointImage(cropImg);
            cropViewer.val(pointData.join(',')).attr('data-fixed-point', 1);
        }
        cropViewer.change();

    }).on('click', '[data-crop]', function () {
        if (cropMode != $(this).attr('data-crop')) {
            $(this).addClass('active').siblings().removeClass('active');
            cropMode = $(this).attr('data-crop');
            $('#crop-viewer-reset').click();
        }
    }).on('click', '.mask', function () {
        $(this).addClass('active').siblings().removeClass('active');
        var imgEl = $(this).find('img:first');
        setPointList(imgEl.attr('point-list'));
    });


    $('#btn-save-template').click(function () {
        var id = $('#user_creation').val();
        if (id) {
            var title = $.trim($('[data-id=user_creation]').text());
            $('#save-modal [name=title]').val(title);
        }
        $('#save-modal').modal('show');

    });


    $('#save-modal').on('click', '.btn-primary', function () {

        var action = $('#save-modal form').attr('action') || "index/save";
        var json = fflivesEditor.toJSON();
        var jsonStr = JSON.stringify(json);
        localStorage.setItem('ffliveCurrentTemplate', jsonStr);
        localStorage.setItem('ffliveTemplateChoice', templateChoice);

        var title = $('#save-modal [name=title]').val();
        var creation_cat = $('#save-modal [name=creation_cat]').val();

        // toggle controls visibility
        canvas.setVisibleControls(false);
        var main_img = canvas.toDataURL();
        canvas.setVisibleControls(true);


        $.post(action, {
            title: title,
            creation_cat: creation_cat,
            data: jsonStr,
            main_img: main_img,
            template_id: templateChoice
        }, function (ret) {

            $('#save-modal').modal('hide');

            $.gritter.removeAll();
            $.gritter.add({
                title: 'Information',
                text: 'Updated successfully!'
            });


            var option = $('#user_creation option[value=' + ret.id + ']');

            if (!option.length) {
                option = $('<option/>');
                option.appendTo('#user_creation');
            }

            option.attr({
                'data-content': "<img height='20' src='media/images/fflives/creation/creation_"
                        + ret.id + ".png?t=" + (new Date().getTime()) + "'/> " + ret.title,
                value: ret.id
            });

            option.attr('selected', 'selected');



            // refresh result

            $("#user_creation").html($("#user_creation").html()).selectpicker('refresh');



        });

        return false;

    });


    $('#user_creation').change(function () {
        var creationId = $(this).val();
        if (creationId) {
            $.get('index/creation/' + creationId, function (ret) {
                loadTemplateFromRet(ret);
            });

        }
    });

    var params = parseQuery(location.href);
    if (params.creation_id) {        
        $('#user_creation').val(params.creation_id).change();
    }


});


