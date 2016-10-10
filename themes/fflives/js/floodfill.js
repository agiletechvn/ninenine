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
                    getNode('west' , node),
                    getNode('east' , node),
                    getNode('north', node),
                    getNode('south', node)
                );
            }
        }
    }(
        start,
        Array.prototype.slice.call(bitmap.data, start, start + RGBA),
        replacementColor || [ 0, 0, 0, 0 ], // default is transparent
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