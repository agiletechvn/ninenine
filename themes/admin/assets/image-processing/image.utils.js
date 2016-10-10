// we will convert image data to matrix, and then bind it back

//You shold probably not need to change thees
var RecognizeEngine = {
    conf : {
           'word_lines_min_dispersion' : 0,
           'letters_min_dispersion'	:0,
           'letters_number_require' :9,
           'letter_height_require'  :10,
           'letter_min_ratio' :0.25,
           'letter_max_ratio'  :0.8
   },
    recognize: function(pixels){
        var letters = getLetter(pixels);
        letters.chars = print_output_plain(letters.chars);
        return letters;
    }
};

//extracts col from two-dimensional array
function get_col(array, y) { 
    var retmas = [];
            var size_x = array.length;
            for(var x=0;x<size_x;x++) {
                    retmas.push(array[x][y]);
            }
    return retmas;
}

//gets dispersion from one-dimensional array using average bg
function get_dispersion(array, bg) { 	
	var size = array.length;
	if (size>0) {
		var dispersion = 0.0;
		for(var c=0;c<size;c++) {
			var val = bg-array[c];
			dispersion+=val*val;
		}
		return dispersion;
	}
	else {
		console.log("error!!!!!!!!!!");
		return -1;
	}
}

function parse_letters(row, max_x, bg) {

	var min_dispersion = RecognizeEngine.conf['letters_min_dispersion'];
	var letter = -1;
	var adding = false;
        var letters = [];
	for(var x=0;x<=max_x;x++) {
		var col = get_col(row, x);
                
		var dispersion = get_dispersion(col, bg);
       
		if (dispersion > min_dispersion) {
			if (adding===false)
				letter++;
                            if(!letters[letter]){
                                letters[letter] = [];
                            }
                        letters[letter].push(col);
			adding = true;
		}
		else {
				adding = false;
		}
	}
       
	var size = letters.length;
	for(var c=0;c<size;c++){
            
		letters[c] = transpon(letters[c]);
        }
       
        
	return letters;
}

function parse_word_lines(mas, max_y, bg) {

	var min_dispersion = RecognizeEngine.conf['word_lines_min_dispersion'];
	var line = -1;
	var adding = false;
        var lines = [];
	for(var y=0;y<=max_y;y++) {
		var row = get_col(mas, y);
		var dispersion = get_dispersion(row, bg);

		if (dispersion > min_dispersion) {
			if (adding===false)
				line++;
                        if(!lines[line]){
                            lines[line] = [];
                        }
			lines[line].push(row);
			adding = true;
		}
		else {
				adding = false;
		}
	}
	return lines;
}


function test_chars(letter,char_mas) {
    

	var lib_size = char_mas.length;
	var min_disp = -1,min_disp_at = 0;
	for(var c=0; c<lib_size;c++) {
		var disp = test_char(letter, c,char_mas);
		//echo 'AT:'.c.':'.disp.'<br>';
		if ((disp<min_disp)||(min_disp === -1)) {
			min_disp = disp;
			min_disp_at = c;
		}
	}
	//disp = ;
	return [min_disp,min_disp_at];
	//return min_disp_at;
}

function test_char(letter, template_index,char_mas) {

    var size = char_mas[template_index]['size'];
    var char = char_mas[template_index]['char'];

	var height=letter.length;
	var width=letter[0].length;
	var sum = 0;
	var x_diff = size[0]/width;
	var y_diff = size[1]/height;

	for(var y=0;y<height;y++) {
		for(var x=0;x<width;x++) {
			sum+= diff_char(letter, char,x_diff,y_diff, x,y);
		}
	}
	return sum;
}

function get_default_value(c_mas, x, y){
    return c_mas[x] ? (c_mas[x][y]||0) : 0;
}

//returns dispersion of one pixel in letter's coord. system
function diff_char(l_mas, c_mas,x_diff,y_diff, x,y) { 
       
        //translate x, y to relative coords
	var x_rel = Math.ceil(x*x_diff); 
	var y_rel = Math.ceil(y*y_diff);
        
        
        var val_m = [
               Math.abs((l_mas[y][x]) - get_default_value(c_mas,y_rel, x_rel)),
               Math.abs((l_mas[y][x]) - get_default_value(c_mas,y_rel + 1, x_rel)),
               Math.abs((l_mas[y][x]) - get_default_value(c_mas,y_rel - 1, x_rel)),
               Math.abs((l_mas[y][x]) - get_default_value(c_mas,y_rel, x_rel + 1)),
               Math.abs((l_mas[y][x]) - get_default_value(c_mas,y_rel, x_rel - 1)),
               Math.abs((l_mas[y][x]) - get_default_value(c_mas,y_rel + 1, x_rel + 1)),
               Math.abs((l_mas[y][x]) - get_default_value(c_mas,y_rel - 1, x_rel - 1)),
               Math.abs((l_mas[y][x]) - get_default_value(c_mas,y_rel + 1, x_rel - 1)),
               Math.abs((l_mas[y][x]) - get_default_value(c_mas,y_rel - 1, x_rel + 1))
        ];

	var val = Math.min.apply(null, val_m);
	return Math.pow(val,5);
}

function getmicrotime(){ 
    return new Date().getTime();
} 


function print_matrix(letter) {
	var ret = '';
	letter.forEach(function(row) {
		ret += "\n";
		row.forEach(function(pixel) {
                    ret += pixel + " ";
		});
	});
	return ret;
}

//replaces background with 0 and 1 otherwice
function flatten_matrix(letter, bg, max_color) { 
    
	var y_size = letter.length;
	var x_size = letter[0].length;
	
	for(var c=0;c<y_size;c++) {
		for(var c1=0;c1<x_size;c1++) {
				var tmp_val = (Math.abs(bg-letter[c][c1])/max_color)*3;
				letter[c][c1]=Math.round(tmp_val*tmp_val);
		}
	}
	return letter;
}

 //returns a transponed matrix
function transpon(mas) {
    
	var retmas = [];
        var row = mas[0];
	
        var size = row.length;
        for(var c=0;c<size;c++) {

                retmas.push(get_col(mas, c));
        }
        
        
        return retmas; 
	
}

//returns a two dimensional matrix with parsed data
function extract_mas(pixels) { 
	var mas = [];
	var imagewidth = pixels.width; 
	var imageheight = pixels.height; 

	var max_color=-1;
        
	for(var y=0;y<imageheight;y++) {
		for(var x=0;x<imagewidth;x++) {
			var rgb = imagecolorat(pixels, x, y);
			if(rgb>max_color) {
                            max_color=rgb;
                        }
                        if(!mas[x]){
                            mas[x] = [];
                        }
			mas[x][y] = rgb;
		}
	}
        //we detect background by checking the first top pixel
	var bg = mas[0][0];		

    return {
        'mas': mas,
        'max_color' : max_color,
        'imagewidth' : imagewidth,
        'imageheight' : imageheight,
        'bg' : bg
    };
}


function get_correct_letters(letters){

	var letters_require = RecognizeEngine.conf['letters_number_require'];
        var letter_height_require = RecognizeEngine.conf['letter_height_require'];
        var letter_min_ratio = RecognizeEngine.conf['letter_min_ratio'];
        var letter_max_ratio = RecognizeEngine.conf['letter_max_ratio'];
        
        //console.log(letters);return;
        // get biggest size that repeat much :D
        // but must have height/width > 1/4 (smallest size is 1)
        // and height/width < 4/5 (8)
        // may be require repeat number
        var statistic = {};
        var filter_letters = [];
        letters.forEach(function(letter){
            var h = letter.length;
            var w = letter[0].length;
            var ratio = w/h;
            // equal or less is slower than less :D
            if(h > letter_height_require && ratio > letter_min_ratio && ratio < letter_max_ratio){
                if(!statistic[h]){
                    statistic[h] = 0;
                }
                statistic[h]++;
                filter_letters.push(letter);
            }
        });
        
        // noise is often small object, so we sort by desc
        var hKey = [];
        for(var h in statistic){
            hKey.push(parseInt(h));
        }
        hKey.sort(function(a,b){return ~~(b > a);});
        
        var correct_letters = [];
        for(var i in hKey){
            var h = hKey[i];
            var number = statistic[h];
            if(number >= letters_require){
                for(var i=0;i<filter_letters.length;i++){
                    var letter = filter_letters[i];
                    var current_h = letter.length;
                    if(current_h === h){
                        correct_letters.push(letter);
                    }
                }
                break;
            }
        }
        
	return correct_letters;
}


//returns a two dimensional matrix with parsed data
// we get only one row
function parse_image(pixels) { 

	var image_data=extract_mas(pixels);
	
	var max_x		= image_data['imagewidth']-1;
	var max_y		= image_data['imageheight']-1;
	var mas		= image_data['mas'];
	var max_color	= image_data['max_color'];
	var bg			= image_data['bg'];

	var lines = parse_word_lines(mas, max_y, bg);
	
        
        
        
        var letters = [];
        lines.forEach(function(word_line){
            var temp = parse_letters(word_line, max_x, bg);
            temp.forEach(function(letter){
                letters.push(letter);
            });
        });
        
        //console.log(letters);
        letters = get_correct_letters(letters);
        
        
        
        
        var retmas = [];
        //for testing purposes. tests w different fonts
        	//console.log(letters);return;
        letters.forEach(function(letter) {
            //console.log([letter,bg,max_color]);die;
                var letter = flatten_matrix(letter,bg,max_color); //global $letter
                
                var tmp = test_chars(letter,char_mas);
                var disp = tmp[0];	//relative number of trust
                var num = tmp[1];		//parsed number
                retmas.push([num,disp]);
        });
      
	
	return retmas;
}

function getLetter(pixels){

    var time_start = getmicrotime();

    var chars = parse_image(pixels);
    
    //execution time
    var time = getmicrotime() - time_start;	

    return {
        time: time,
        chars: chars
    };

}

function print_output_plain(chars) {
    var ret = '';
    chars.forEach(function(digit) {
            ret+=digit[0];
    });
    return ret;
}


function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Engine(w, h) {
    this.width = w;

    this.height = h;
    this.points = [];
}



Engine.prototype.addPoint = function(x, y) {
    this.points.push(new Point(x, y));
};

Engine.prototype.getLine = function() {
    var denominator, getPoint, intercept, point, slope, sumX, sumX2, sumXY, sumY, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
    this.len = this.points.length;
    sumX = 0;
    sumY = 0;
    sumXY = 0;
    sumX2 = 0;
    _ref = this.points;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        sumX += point.x;
    }
    _ref1 = this.points;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        point = _ref1[_j];
        sumY += point.y;
    }
    _ref2 = this.points;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        point = _ref2[_k];
        sumXY += point.x * point.y;
    }
    _ref3 = this.points;
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        point = _ref3[_l];
        sumX2 += point.x * point.x;
    }
    denominator = (this.len * sumX2) - (sumX * sumX);
    intercept = ((sumY * sumX2) - (sumX * sumXY)) / denominator;
    slope = ((this.len * sumXY) - (sumX * sumY)) / denominator;
    getPoint = function(x) {

        return new Point(x, intercept + x * slope);
    };
    return {
        start: getPoint(0),
        end: getPoint(this.width)
    };
};


;
(function(exports) {

    function Canvas(id, w, h, res) {
        this.elem = document.getElementById(id);
        this.width = w || 600;
        this.height = h || 400;
        if (this.elem === null) {
            this.elem = document.createElement('canvas');
            this.elem.id = id;
            this.elem.width = this.width;
            this.elem.height = this.height;
            document.body.insertBefore(this.elem, document.body.firstChild);
        }
        this.ctx = this.elem.getContext('2d');
        this.images = [];
        this.currentImg = {};

        var resizable = res || true;
        if (resizable === true) {
            this.elem.onmouseover = this.resize;
            this.elem.onmouseout = function() {
                this.style.cursor = 'auto';
            };
        }
    }

    Canvas.prototype.resize = function(e) {
        if (e.pageX === this.offsetLeft && e.pageY !== this.offsetTop) {
            this.style.cursor = 'w-resize';
        } else if (e.pageX !== this.offsetLeft && e.pageY === this.offsetTop) {
            this.style.cursor = 'n-resize';
        } else if (e.pageX === this.offsetLeft + this.width - 1 && e.pageY !== this.offsetTop + this.height - 1) {
            this.style.cursor = 'e-resize';
        } else if (e.pageX !== this.offsetLeft + this.width - 1 && e.pageY === this.offsetTop + this.height - 1) {
            this.style.cursor = 's-resize';
        }
    };

    Canvas.prototype.loadImg = function(img, sx, sy) {
        this.images.push(img);
        this.currentImg.index = this.images.indexOf(img);

        var that = this;
        var usrImg = new Image();
        usrImg.onload = function() {
            if (usrImg.width !== that.width || usrImg.height !== that.height) {
                that.width = usrImg.width;
                that.height = usrImg.height;
                that.elem.width = that.width;
                that.elem.height = that.height;
            }
            that.ctx.drawImage(usrImg, sx || 0, sy || 0);
            that.currentImg.imgData = that.ctx.getImageData(0, 0, that.elem.width, that.elem.height);
        };
        usrImg.src = img;
    };

    Canvas.prototype.runImg = function(size, fn) {
        var that = this;

        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var i = x * 4 + y * this.width * 4;
                var matrix = getMatrix(x, y, size);
                fn(i, matrix);
            }
        }

        function getMatrix(cx, cy, size) {//will generate a 2d array of sizexsize given center x, center y, size, image width & height
            var matrix = [];
            for (var i = 0, y = -(size - 1) / 2; i < size; i++, y++) {
                matrix[i] = [];
                for (var j = 0, x = -(size - 1) / 2; j < size; j++, x++) {
                    matrix[i][j] = (cx + x) * 4 + (cy + y) * that.width * 4;
                }
            }
            return matrix;
        }
    };

    Canvas.prototype.copyImageData = function(src) {
        var dst = this.ctx.createImageData(src.width, src.height);
        dst.data.set(src.data);
        return dst;
    };

    Canvas.prototype.setPixel = function(i, val, imgData) {
        imgData.data[i] = typeof val === 'number' ? val : val.r;
        imgData.data[i + 1] = typeof val === 'number' ? val : val.g;
        imgData.data[i + 2] = typeof val === 'number' ? val : val.b;
    };

    Canvas.prototype.getPixel = function(i, imgData) {
        if (i < 0 || i > imgData.data.length - 4) {
            return {r: 255, g: 255, b: 255, a: 255};
        } else {
            return {r: imgData.data[i], g: imgData.data[i + 1], b: imgData.data[i + 2], a: imgData.data[i + 3]};
        }
    };
    Canvas.prototype.trimImage = function(img) {
        var w = img.width, h = img.height, x, y;


//find the size of the borders
        var b_top = 0;
        var b_btm = 0;
        var b_lft = 0;
        var b_rt = 0;

// replace transparent with white color, then cut white background 'till we get closer enough
// Create a white background, the same size as the original.
        var white = 0xffffff;

//top 
        loopTop:
                for (; b_top < h; ++b_top) {
            for (x = 0; x < w; ++x) {
                if (imagecolorat(img, x, b_top) !== white) {
                    break loopTop; //out of the 'top' loop
                }
            }
        }

//bottom
        loopBottom:
                for (; b_btm < h; ++b_btm) {
            for (x = 0; x < w; ++x) {
                if (imagecolorat(img, x, h - b_btm - 1) !== white) {
                    break loopBottom; //out of the 'bottom' loop
                }
            }
        }

//left
        loopLeft:
                for (; b_lft < w; ++b_lft) {
            for (y = 0; y < h; ++y) {
                if (imagecolorat(img, b_lft, y) !== white) {
                    break loopLeft; //out of the 'left' loop
                }
            }
        }

//right
        loopRight:
                for (; b_rt < w; ++b_rt) {
            for (y = 0; y < h; ++y) {
                if (imagecolorat(img, w - b_rt - 1, y) !== white) {
                    break loopRight; //out of the 'right' loop
                }
            }
        }

        var newimg = this.ctx.createImageData(w - (b_lft + b_rt), h - (b_top + b_btm));

// remove small value
//for(var x=0;x<newimg.width;++x){
//    for(var y=0;y<newimg.height;++y){
//        var iIndex = 4*(x + y*newimg.width);
//        newimg.data[iIndex] = 0;
//        newimg.data[iIndex+1] = 0;
//        newimg.data[iIndex+2] = 0;
//        newimg.data[iIndex+3] = 0;
//    }
//}

//copy the contents, excluding the border, and alpha too
        for (var x = 0; x < newimg.width; ++x) {
            for (var y = 0; y < newimg.height; ++y) {
                var iIndex = 4 * (x + y * newimg.width);
                var jIndex = 4 * ((x + b_lft) + (y + b_top) * w);

                newimg.data[iIndex] = img.data[jIndex];
                newimg.data[iIndex + 1] = img.data[jIndex + 1];
                newimg.data[iIndex + 2] = img.data[jIndex + 2];
                newimg.data[iIndex + 3] = img.data[jIndex + 3];

            }
        }

//console.log(b_lft,b_rt,b_top,b_btm);

        return newimg;

    }


    exports.Canvas = Canvas;

}(this));

;
(function(exports) {

    function Canny(canvElem) {

        var canvas = canvElem;
        
        this.grayscale = function(imgData) {
            var imgDataCopy = canvas.copyImageData(imgData);

            canvas.runImg(null, function(current) {
                var grayLevel = (0.3 * imgDataCopy.data[current]) + (0.59 * imgDataCopy.data[current + 1]) + (0.11 * imgDataCopy.data[current + 2]);
                canvas.setPixel(current, grayLevel, imgDataCopy);
            });

            return imgDataCopy;
        };

        this.gaussianBlur = function(imgData, sigma, size) {
            var imgDataCopy = canvas.copyImageData(imgData);
            var that = this;
            var kernel = generateKernel(sigma, size);

            canvas.runImg(size, function(current, neighbors) {
                var resultR = 0;
                var resultG = 0;
                var resultB = 0;
                for (var i = 0; i < size; i++) {
                    for (var j = 0; j < size; j++) {
                        var pixel = canvas.getPixel(neighbors[i][j], imgData);
                        resultR += pixel.r * kernel[i][j];//return the existing pixel value multiplied by the kernel matrix
                        resultG += pixel.g * kernel[i][j];
                        resultB += pixel.b * kernel[i][j];
                    }
                }
                canvas.setPixel(current, {r: resultR, g: resultG, b: resultB}, imgDataCopy);
            });


            function generateKernel(sigma, size) {
                var matrix = [];
                var E = 2.718;//Euler's number rounded of to 3 places
                for (var y = -(size - 1) / 2, i = 0; i < size; y++, i++) {
                    matrix[i] = [];
                    for (var x = -(size - 1) / 2, j = 0; j < size; x++, j++) {
                        //create matrix round to 3 decimal places
                        matrix[i][j] = 1 / (2 * Math.PI * Math.pow(sigma, 2)) * Math.pow(E, -(Math.pow(Math.abs(x), 2) + Math.pow(Math.abs(y), 2)) / (2 * Math.pow(sigma, 2)));
                    }
                }
                //normalize the matrix to make its sum 1
                var normalize = 1 / that.sum(matrix);
                for (var k = 0; k < matrix.length; k++) {
                    for (var l = 0; l < matrix[k].length; l++) {
                        matrix[k][l] = Math.round(normalize * matrix[k][l] * 1000) / 1000;
                    }
                }
                return matrix;
            }

            return imgDataCopy;
        };

        this.sobel = function(imgData) {//find intensity gradient of image
            var imgDataCopy = canvas.copyImageData(imgData);
            var dirMap = [];
            var dirAngleMap = [];
            var gradMap = [];
            //perform vertical convolution
            var xfilter = [[-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]];
            //perform horizontal convolution
            var yfilter = [[1, 2, 1],
                [0, 0, 0],
                [-1, -2, -1]];

            canvas.runImg(3, function(current, neighbors) {
                var edgeX = 0;
                var edgeY = 0;
                if (checkCornerOrBorder(current, imgDataCopy.width, imgDataCopy.height) === false) {
                    for (var i = 0; i < 3; i++) {
                        for (var j = 0; j < 3; j++) {
                            edgeX += imgData.data[neighbors[i][j]] * xfilter[i][j];
                            edgeY += imgData.data[neighbors[i][j]] * yfilter[i][j];
                        }
                    }
                }
                var angle = Math.atan2(edgeY, edgeX) * (180 / Math.PI);
                var dir = roundDir(angle);
                dirMap[current] = dir;
                dirAngleMap[current] = angle;

                var grad = Math.round(Math.sqrt(edgeX * edgeX + edgeY * edgeY));
                gradMap[current] = grad;

                canvas.setPixel(current, grad, imgDataCopy);
            });


            function checkCornerOrBorder(i, width, height) {//returns true if a pixel lies on the border of an image
                return i - (width * 4) < 0 || i % (width * 4) === 0 || i % (width * 4) === (width * 4) - 4 || i + (width * 4) > width * height * 4;
            }

            function roundDir(deg) {//rounds degrees to 4 possible orientations: horizontal, vertical, and 2 diagonals
                deg = deg < 0 ? deg + 180 : deg;
                var roundVal;
                if ((deg >= 0 && deg <= 22.5) || (deg > 157.5 && deg <= 180)) {
                    roundVal = 0;
                } else if (deg > 22.5 && deg <= 67.5) {
                    roundVal = 45;
                } else if (deg > 67.5 && deg <= 112.5) {
                    roundVal = 90;
                } else if (deg > 112.5 && deg <= 157.5) {
                    roundVal = 135;
                }
                return roundVal;
            }

            imgDataCopy.dirMap = dirMap;
            imgDataCopy.dirAngleMap = dirAngleMap;
            imgDataCopy.gradMap = gradMap;
            return imgDataCopy;
        };

        this.nonMaximumSuppress = function(imgData) {
            var imgDataCopy = canvas.copyImageData(imgData);

            canvas.runImg(3, function(current, neighbors) {
                var pixNeighbors = getNeighbors(imgData.dirMap[current]);

                //pixel neighbors to compare
                var pix1 = imgData.gradMap[neighbors[pixNeighbors[0].x][pixNeighbors[0].y]];
                var pix2 = imgData.gradMap[neighbors[pixNeighbors[1].x][pixNeighbors[1].y]];

                if (pix1 > imgData.gradMap[current] || pix2 > imgData.gradMap[current]) {//suppress
                    canvas.setPixel(current, 0, imgDataCopy);
                } else if (pix2 === imgData.gradMap[current] && pix1 < imgData.gradMap[current]) {
                    canvas.setPixel(current, 0, imgDataCopy);
                }
            });


            function getNeighbors(dir) {
                var degrees = {0: [{x: 1, y: 2}, {x: 1, y: 0}], 45: [{x: 0, y: 2}, {x: 2, y: 0}], 90: [{x: 0, y: 1}, {x: 2, y: 1}], 135: [{x: 0, y: 0}, {x: 2, y: 2}]};
                return degrees[dir];
            }

            return imgDataCopy;
        };

        this.hysteresis = function(imgData) { //mark strong and weak edges, discard others as false edges; only keep weak edges that are connected to strong edges
            var that = this;
            return function() {
                var imgDataCopy = canvas.copyImageData(imgData);
                var realEdges = []; //where real edges will be stored with the 1st pass
                var t1 = 150; //high threshold value
                var t2 = 100; //low threshold value
                //first pass

                canvas.runImg(null, function(current) {
                    if (imgData.data[current] > t1 && realEdges[current] === undefined) {//accept as a definite edge
                        var group = that.traverseEdge(current, imgData, t2, []);
                        for (var i = 0; i < group.length; i++) {
                            realEdges[group[i]] = true;
                        }
                    }
                });

                //second pass
                canvas.runImg(null, function(current) {
                    if (realEdges[current] === undefined) {
                        canvas.setPixel(current, 0, imgDataCopy);
                    } else {
                        canvas.setPixel(current, 255, imgDataCopy);
                    }
                });


                return imgDataCopy;
            };
        };


        this.invertColors = function(imgData) {
            var imgDataCopy = canvas.copyImageData(imgData);

            canvas.runImg(null, function(current) {
                canvas.setPixel(current, {r: 255 - imgDataCopy.data[current], g: 255 - imgDataCopy.data[current + 1], b: 255 - imgDataCopy.data[current + 2]}, imgDataCopy);
            });

            return imgDataCopy;
        };

        this.showDirMap = function(imgData) {//just a quick function to look at the direction results
            return function() {
                var imgDataCopy = canvas.copyImageData(imgData);
                canvas.runImg(null, function(i) {
                    if (imgData.dirMap[i] === 0) {
                        canvas.setPixel(i, {r: 255, g: 0, b: 0}, imgDataCopy);
                    } else if (imgData.dirMap[i] === 45) {
                        canvas.setPixel(i, {r: 0, g: 255, b: 0}, imgDataCopy);
                    } else if (imgData.dirMap[i] === 90) {
                        canvas.setPixel(i, {r: 0, g: 0, b: 255}, imgDataCopy);
                    } else if (imgData.dirMap[i] === 135) {
                        canvas.setPixel(i, {r: 255, g: 255, b: 0}, imgDataCopy);
                    } else {
                        canvas.setPixel(i, {r: 255, g: 0, b: 255}, imgDataCopy);
                    }
                });
                return imgDataCopy;
            };
        };

        this.showGradMap = function(imgData) {
            return function() {
                var imgDataCopy = canvas.copyImageData(imgData);
                canvas.runImg(null, function(i) {
                    if (imgData.gradMap[i] < 0) {
                        canvas.setPixel(i, {r: 255, g: 0, b: 0}, imgDataCopy);
                    } else if (imgData.gradMap[i] < 200) {
                        canvas.setPixel(i, {r: 0, g: 255, b: 0}, imgDataCopy);
                    } else if (imgData.gradMap[i] < 400) {
                        canvas.setPixel(i, {r: 0, g: 0, b: 255}, imgDataCopy);
                    } else if (imgData.gradMap[i] < 600) {
                        canvas.setPixel(i, {r: 255, g: 255, b: 0}, imgDataCopy);
                    } else if (imgData.gradMap[i] < 800) {
                        canvas.setPixel(i, {r: 0, g: 255, b: 255}, imgDataCopy);
                    } else {
                        canvas.setPixel(i, {r: 255, g: 0, b: 255}, imgDataCopy);
                    }
                });
                return imgDataCopy;
            };
        };

        //helper functions
        this.sum = function(arr) {//receives an array and returns sum
            var result = 0;
            for (var i = 0; i < arr.length; i++) {
                if (/^\s*function Array/.test(String(arr[i].constructor))) {
                    result += this.sum(arr[i]);
                } else {
                    result += arr[i];
                }
            }
            return result;
        };

        this.traverseEdge = function(current, imgData, threshold, traversed) {//traverses the current pixel until a length has been reached
            var group = [current]; //initialize the group from the current pixel's perspective
            var neighbors = this.getNeighborEdges(current, imgData, threshold, traversed);//pass the traversed group to the getNeighborEdges so that it will not include those anymore
            for (var i = 0; i < neighbors.length; i++) {
                group = group.concat(this.traverseEdge(neighbors[i], imgData, threshold, traversed.concat(group)));//recursively get the other edges connected
            }
            return group; //if the pixel group is not above max length, it will return the pixels included in that small pixel group
        };


        this.getNeighborEdges = function(i, imgData, threshold, includedEdges) {
            var neighbors = [];
            var directions = [
                i + 4, //e
                i - imgData.width * 4 + 4, //ne
                i - imgData.width * 4, //n
                i - imgData.width * 4 - 4, //nw
                i - 4, //w
                i + imgData.width * 4 - 4, //sw
                i + imgData.width * 4, //s
                i + imgData.width * 4 + 4 //se
            ];
            for (var j = 0; j < directions.length; j++)
                if (imgData.data[directions[j]] >= threshold && (includedEdges === undefined || includedEdges.indexOf(directions[j]) === -1))
                    neighbors.push(directions[j]);

            return neighbors;
        };

        this.getAllEdges = function(imgData) {
            var that = this;
            var traversed = [];
            var edges = [];

            canvas.runImg(null, function(current) {
                if (imgData.data[current] === 255 && traversed[current] === undefined) {//assumes that an edge has white value
                    var group = that.traverseEdge(current, imgData, 255, []);
                    edges.push(group);
                    for (var i = 0; i < group.length; i++) {
                        traversed[group[i]] = true;
                    }
                }
            });

            return edges;
        };
    }

    exports.Canny = Canny;

}(this));


function clamp(val, min, max) {
    return Math.min(max, Math.max(min, val));
}

function imagecolorat(pixels, x, y) {
    var ind = (x + pixels.width * y) * 4;
    return (pixels.data[ind] << 16) | (pixels.data[ind + 1] << 8) | pixels.data[ind + 2];
}

function imagesetpixel(pixels, x, y, color) {
    var ind = (x + pixels.width * y) * 4;
    pixels.data[ind] = color;
    pixels.data[ind + 1] = color;
    pixels.data[ind + 2] = color;
}

function imagecolorattrue(pixels, x, y) {
    var r = imagecolorat(pixels, x, y);
    if (r !== 0)
        return 1;
    return 0;
}

function imagecolorsettrue(pixels, x, y, col) {
    imagesetpixel(pixels, x, y, col >= 1 ? 0 : 255);
}

function convolve3x3(inData, outData, width, height, kernel, progress, alpha, invert, mono) {
    var idx, r, g, b, a,
            pyc, pyp, pyn,
            pxc, pxp, pxn,
            x, y,
            prog, lastProg = 0,
            n = width * height * 4,
            k00 = kernel[0][0], k01 = kernel[0][1], k02 = kernel[0][2],
            k10 = kernel[1][0], k11 = kernel[1][1], k12 = kernel[1][2],
            k20 = kernel[2][0], k21 = kernel[2][1], k22 = kernel[2][2],
            p00, p01, p02,
            p10, p11, p12,
            p20, p21, p22;

    for (y = 0; y < height; ++y) {
        pyc = y * width * 4;
        pyp = pyc - width * 4;
        pyn = pyc + width * 4;

        if (y < 1)
            pyp = pyc;
        if (y >= width - 1)
            pyn = pyc;

        for (x = 0; x < width; ++x) {
            idx = (y * width + x) * 4;

            pxc = x * 4;
            pxp = pxc - 4;
            pxn = pxc + 4;

            if (x < 1)
                pxp = pxc;
            if (x >= width - 1)
                pxn = pxc;

            p00 = pyp + pxp;
            p01 = pyp + pxc;
            p02 = pyp + pxn;
            p10 = pyc + pxp;
            p11 = pyc + pxc;
            p12 = pyc + pxn;
            p20 = pyn + pxp;
            p21 = pyn + pxc;
            p22 = pyn + pxn;

            r = inData[p00] * k00 + inData[p01] * k01 + inData[p02] * k02
                    + inData[p10] * k10 + inData[p11] * k11 + inData[p12] * k12
                    + inData[p20] * k20 + inData[p21] * k21 + inData[p22] * k22;

            g = inData[p00 + 1] * k00 + inData[p01 + 1] * k01 + inData[p02 + 1] * k02
                    + inData[p10 + 1] * k10 + inData[p11 + 1] * k11 + inData[p12 + 1] * k12
                    + inData[p20 + 1] * k20 + inData[p21 + 1] * k21 + inData[p22 + 1] * k22;

            b = inData[p00 + 2] * k00 + inData[p01 + 2] * k01 + inData[p02 + 2] * k02
                    + inData[p10 + 2] * k10 + inData[p11 + 2] * k11 + inData[p12 + 2] * k12
                    + inData[p20 + 2] * k20 + inData[p21 + 2] * k21 + inData[p22 + 2] * k22;

            if (alpha) {
                a = inData[p00 + 3] * k00 + inData[p01 + 3] * k01 + inData[p02 + 3] * k02
                        + inData[p10 + 3] * k10 + inData[p11 + 3] * k11 + inData[p12 + 3] * k12
                        + inData[p20 + 3] * k20 + inData[p21 + 3] * k21 + inData[p22 + 3] * k22;
            } else {
                a = inData[idx + 3];
            }

            if (mono) {
                r = g = b = (r + g + b) / 3;
            }
            if (invert) {
                r = 255 - r;
                g = 255 - g;
                b = 255 - b;
            }

            outData[idx] = r;
            outData[idx + 1] = g;
            outData[idx + 2] = b;
            outData[idx + 3] = a;

            if (progress) {
                prog = (idx / n * 100 >> 0) / 100;
                if (prog > lastProg) {
                    lastProg = progress(prog);
                }
            }
        }
    }
}

var ImageUtils = {
    // auto histogram
    otsu: function(histogram, total) {
        var sum = 0;
        for (var i = 1; i < 256; ++i)
            sum += i * histogram[i];
        var sumB = 0;
        var wB = 0;
        var wF = 0;
        var mB;
        var mF;
        var max = 0;
        var between = 0;
        var threshold1 = 0;
        var threshold2 = 0;
        for (var i = 0; i < 256; ++i) {
            wB += histogram[i];
            if (wB === 0)
                continue;
            wF = total - wB;
            if (wF === 0)
                break;
            sumB += i * histogram[i];
            mB = sumB / wB;
            mF = (sum - sumB) / wF;
            between = wB * wF * Math.pow(mB - mF, 2);
            if (between >= max) {
                threshold1 = i;
                if (between > max) {
                    threshold2 = i;
                }
                max = between;
            }
        }
        return (threshold1 + threshold2) / 2;
    },
    histogram: function(pixels) {
        var values = [],
                i, p,
                data = pixels.data,
                round = Math.round;
        n = pixels.width * pixels.height;

        for (i = 0; i < 256; i++) {
            values[i] = 0;
        }

        for (i = 0; i < n; i++) {
            p = i * 4;
            values[round((data[p] + data[p + 1] + data[p + 2]) / 3)]++;
        }

        return values;
    },
    // Convert to grayscale
    grayscale: function(pixels) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];
            // CIE luminance for the RGB
            // The human eye is bad at seeing red and blue, so we de-emphasize them.
            var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            d[i] = d[i + 1] = d[i + 2] = v
        }
        return pixels;
    },
    // Threshold filter
    // threshold : integer with the threshold for r+g+b
    threshold: function(pixels, threshold) {
        var d = pixels.data;
        for (var i = 0; i < d.length; i += 4) {
            var r = d[i];
            var g = d[i + 1];
            var b = d[i + 2];

            var v = 0;
            if ((r + g + b) > threshold) {
                v = 255;
            }
            d[i] = v;
            d[i + 1] = v;
            d[i + 2] = v;
        }
        return pixels;
    },
    replaceTransparent: function(pixels, color) {
        for (var x = 0; x < pixels.width; ++x) {
            for (var y = 0; y < pixels.height; ++y) {
                var jIndex = (x + y * pixels.width) * 4;
                if (pixels.data[jIndex + 3] !== 255) {
                    pixels.data[jIndex] = color;
                    pixels.data[jIndex + 1] = color;
                    pixels.data[jIndex + 2] = color;
                    pixels.data[jIndex + 3] = 255;
                }
            }
        }
    },
    // Pixelize the image
    pixelize: function(pixels, radius) {
        var d = pixels.data;

        // Failsafe so we don't end up in an endless loop
        if (radius === 0) {
            return pixels;
        }

        // Walk through width x height pixels.
        for (var x = 0; x < pixels.width; x += radius) {
            for (var y = 0; y < pixels.height; y += radius) {
                var r = 0, g = 0, b = 0, count = 0;
                ;

                // Average our pixels and count the amount of averaged pixels
                // We need to coutn them because of edge pixels
                for (var rX = x; rX < Math.min(x + radius, pixels.width); rX++) {
                    for (var rY = y; rY < Math.min(y + radius, pixels.height); rY++) {
                        var pos = (rY * pixels.width + rX) * 4;
                        count += 1;
                        r += d[pos];
                        g += d[pos + 1];
                        b += d[pos + 2];
                    }
                }

                // Set the averaged colors to the pixels.
                for (var rX = x; rX < Math.min(x + radius, pixels.width); rX++) {
                    for (var rY = y; rY < Math.min(y + radius, pixels.height); rY++) {
                        var pos = (rY * pixels.width + rX) * 4;
                        d[pos] = r / count;
                        d[pos + 1] = g / count;
                        d[pos + 2] = b / count;
                    }
                }
            }
        }
        return pixels;
    },
    findBottomLine: function(pixels, threshold) {
        var y, x;
        var width = pixels.width, height = pixels.height;
        var line = [];
        var maxPoint = 0;
        threshold = threshold || 20;
        var total = 0;
        for (y = 0; y < height; ++y) {
            var pointCount = 0;
            for (x = 0; x < width; ++x) {
                if (imagecolorat(pixels, x, y) === 0) {
                    pointCount++;
                }
            }

            if (maxPoint < pointCount) {
                maxPoint = pointCount;
            }

            total += pointCount;
            line.push(pointCount);
        }

        //console.log(maxPoint1,line);
        //console.log(maxPoint2,col);
        var mean = total / width - threshold;
        if (mean < 255 / 2) {
            for (var i = 0; i < line.length; ++i) {
                if (line[i] < mean) {
                    for (x = 0; x < width; ++x) {
                        imagesetpixel(pixels, x, i, 255);
                    }
                }

            }
        }




    },
    solarize: function(pixels, outPixels, options, progress) {
        var inData = pixels.data, width = pixels.width, height = pixels.height;
        var n = width * height * 4,
                prog, lastProg = 0,
                r, g, b;

        for (i = 0; i < n; i += 4) {
            r = inData[i];
            g = inData[i + 1];
            b = inData[i + 2];

            outPixels.data[i] = r > 127 ? 255 - r : r;
            outPixels.data[i + 1] = g > 127 ? 255 - g : g;
            outPixels.data[i + 2] = b > 127 ? 255 - b : b;
            outPixels.data[i + 3] = inData[i + 3];

            if (progress) {
                prog = (i / n * 100 >> 0) / 100;
                if (prog > lastProg) {
                    lastProg = progress(prog);
                }
            }
        }
        return outPixels;
    },
    equalize: function(pixels, outPixels, options, progress) {
        var inData = pixels.data, width = pixels.width, height = pixels.height;
        var n = width * height, p, i, level, ratio,
                prog, lastProg;
        var round = Math.round;
        // build histogram
        var pdf = new Array(256);
        for (i = 0; i < 256; i++) {
            pdf[i] = 0;
        }

        for (i = 0; i < n; i++) {
            p = i * 4;
            level = clamp(round(inData[p] * 0.3 + inData[p + 1] * 0.59 + inData[p + 2] * 0.11), 0, 255);
            outPixels.data[p + 3] = level;
            pdf[ level ]++;
        }

        // build cdf
        var cdf = new Array(256);
        cdf[0] = pdf[0];
        for (i = 1; i < 256; i++) {
            cdf[i] = cdf[i - 1] + pdf[i];
        }

        // normalize cdf
        for (i = 0; i < 256; i++) {
            cdf[i] = cdf[i] / n * 255.0;
        }

        // map the pixel values
        for (i = 0; i < n; i++) {
            p = i * 4;
            level = outPixels.data[p + 3];
            ratio = cdf[level] / (level || 1);
            outPixels.data[p] = clamp(round(inData[p] * ratio), 0, 255);
            outPixels.data[p + 1] = clamp(round(inData[p + 1] * ratio), 0, 255);
            outPixels.data[p + 2] = clamp(round(inData[p + 2] * ratio), 0, 255);
            outPixels.data[p + 3] = inData[p + 3];

            if (progress) {
                prog = (i / n * 100 >> 0) / 100;
                if (prog > lastProg) {
                    lastProg = progress(prog);
                }
            }
        }

        return outPixels;
    },
    removeNoise: function(pixels, outPixels, progress) {
        var r, g, b, c, y, x, idx,
                pyc, pyp, pyn,
                pxc, pxp, pxn,
                minR, minG, minB, maxR, maxG, maxB,
                n, prog, lastProg = 0;
        var inData = pixels.data, width = pixels.width, height = pixels.height;

        n = width * height * 4;

        for (y = 0; y < height; ++y) {
            pyc = y * width * 4;
            pyp = pyc - width * 4;
            pyn = pyc + width * 4;

            if (y < 1)
                pyp = pyc;
            if (y >= width - 1)
                pyn = pyc;

            for (x = 0; x < width; ++x) {
                idx = (y * width + x) * 4;

                pxc = x * 4;
                pxp = pxc - 4;
                pxn = pxc + 4;

                if (x < 1)
                    pxp = pxc;
                if (x >= width - 1)
                    pxn = pxc;

                minR = maxR = inData[pyc + pxp];
                c = inData[pyc + pxn];
                if (c < minR)
                    minR = c;
                if (c > maxR)
                    maxR = c;
                c = inData[pyp + pxc];
                if (c < minR)
                    minR = c;
                if (c > maxR)
                    maxR = c;
                c = inData[pyn + pxc];
                if (c < minR)
                    minR = c;
                if (c > maxR)
                    maxR = c;

                minG = inData[pyc + pxp + 1];
                c = inData[pyc + pxn + 1];
                if (c < minG)
                    minG = c;
                c = inData[pyp + pxc + 1];
                if (c < minG)
                    minG = c;
                c = inData[pyn + pxc + 1];
                if (c < minG)
                    minG = c;

                minB = inData[pyc + pxp + 2];
                c = inData[pyc + pxn + 2];
                if (c < minB)
                    minB = c;
                c = inData[pyp + pxc + 2];
                if (c < minB)
                    minB = c;
                c = inData[pyn + pxc + 2];
                if (c < minB)
                    minB = c;

                r = inData[idx];
                g = inData[idx + 1];
                b = inData[idx + 2];

                if (r < minR)
                    r = minR;
                if (r > maxR)
                    r = maxR;
                if (g < minG)
                    g = minG;
                if (g > maxG)
                    g = maxG;
                if (b < minB)
                    b = minB;
                if (b > maxB)
                    b = maxB;

                outPixels.data[idx] = r;
                outPixels.data[idx + 1] = g;
                outPixels.data[idx + 2] = b;
                outPixels.data[idx + 3] = inData[idx + 3];

                if (progress) {
                    prog = (idx / n * 100 >> 0) / 100;
                    if (prog > lastProg) {
                        lastProg = progress(prog);
                    }
                }
            }
        }

        return outPixels;
    },
    edgeEnhance3x3: function(pixels, outPixels, progress) {
        var inData = pixels.data, width = pixels.width, height = pixels.height;
        convolve3x3(
                inData, outPixels.data, width, height,
                [[-1 / 9, -1 / 9, -1 / 9],
                    [-1 / 9, 17 / 9, -1 / 9],
                    [-1 / 9, -1 / 9, -1 / 9]],
                progress
                );

        return outPixels;

    },
    sharpen3x3: function(pixels, outPixels, strength, progress) {
        var inData = pixels.data, width = pixels.width, height = pixels.height;
        strength = strength || 0.5;
        var a = -clamp(strength, 0, 1);
        convolve3x3(
                inData, outPixels.data, width, height,
                [[a, a, a],
                    [a, 1 - a * 8, a],
                    [a, a, a]],
                progress
                );
        return outPixels;
    },
    soften3x3: function(pixels, outPixels, options, progress) {
        var inData = pixels.data, width = pixels.width, height = pixels.height;
        var c = 1 / 9;
        convolve3x3(
                inData, outPixels.data, width, height,
                [[c, c, c],
                    [c, c, c],
                    [c, c, c]],
                progress
                );
        return outPixels;
    },
    removeBackgroundNoise: function(pixels, threshold) {
        threshold = threshold || 3;
        var w = pixels.width, h = pixels.height;
        var x, y, pixel, firstcol, firstrow, pval;
        //$w = imagesx($image);
        //$h = imagesy($image);

        //$black = imagecolorallocate($image, 0, 0, 0);
        //$white = imagecolorallocate($image, 255, 255, 255);

        var w8 = Math.floor(w / 6);
        var h8 = Math.floor(h / 6);



        //left vertical
        firstcol = -1;
        pixel = [];
        for (var x = 0; x <= w8; x++) {
            pval = 0;
            for (var y = 0; y < h; y++) {
                // if not 0, it is blank - white color
                if (!imagecolorattrue(pixels, x, y))
                {
                    pval++;
                    pixel.push([x, y]);
                }
            }

            if (firstcol !== -1)
            {
                //we have a first column, look for a second column with a pval <= threshold
                if (pval <= threshold)
                {
                    //found secondcol
                    //blank everything from firstcol to secondcol and break loop
                    //console.log('remove');
                    for (var i in pixel) {
                        p = pixel[i];
                        imagecolorsettrue(pixels, p[0], p[1], 0);
                    }
                    break;
                }
            }
            else
            {
                if (pval > 0)
                    firstcol = x;
            }
        }

        //right vertical
        firstcol = -1;
        pixel = [];
        for (x = (w - 1); x >= (w - 1 - w8); x--)
        {
            pval = 0;
            for (y = 0; y < h; y++)
            {
                if (!imagecolorattrue(pixels, x, y))
                {
                    pval++;
                    pixel.push([x, y]);
                }
            }

            if (firstcol !== -1)
            {
                //we have a first column, look for a second column with a pval <= threshold
                if (pval <= threshold)
                {
                    //found secondcol
                    //blank everything from firstcol to secondcol and break loop
                    for (var i in pixel) {
                        p = pixel[i];
                        imagecolorsettrue(pixels, p[0], p[1], 0);
                    }
                    break;
                }
            }
            else
            {
                if (pval > 0)
                    firstcol = x;
            }
        }

        //top horizontal
        firstrow = -1;
        pixel = [];
        for (y = 0; y <= h8; y++)
        {
            pval = 0;
            for (x = 0; x < w; x++)
            {
                if (!imagecolorattrue(pixels, x, y))
                {
                    pval++;
                    pixel.push([x, y]);
                }
            }

            if (firstrow !== -1)
            {
                //we have a first column, look for a second column with a pval <= threshold
                if (pval <= threshold)
                {
                    //found secondcol
                    //blank everything from firstcol to secondcol and break loop
                    for (var i in pixel) {
                        p = pixel[i];
                        imagecolorsettrue(pixels, p[0], p[1], 0);
                    }
                    break;
                }
            }
            else
            {
                if (pval > 0)
                    firstrow = y;
            }
        }


        //bottom horizontal
        firstrow = -1;
        pixel = [];
        for (y = (h - 1); y >= (h - 1 - h8); y--)
        {
            pval = 0;
            for (x = 0; x < w; x++)
            {
                if (!imagecolorattrue(pixels, x, y))
                {
                    pval++;
                    pixel.push([x, y]);
                }
            }

            if (firstrow !== -1)
            {
                //we have a first column, look for a second column with a pval <= threshold
                if (pval <= threshold)
                {
                    //found secondcol
                    //blank everything from firstcol to secondcol and break loop
                    for (var i in pixel) {
                        p = pixel[i];
                        imagecolorsettrue(pixels, p[0], p[1], 0);
                    }
                    break;
                }
            }
            else
            {
                if (pval > 0)
                    firstrow = y;
            }
        }

        return pixels;


    },
    // 3x3 directional emboss
    emboss: function(pixels, outPixels, amount, angle, progress) {
        var inData = pixels.data, width = pixels.width, height = pixels.height;

        var amount = amount || 0.5,
                angle = angle || 135 / 180 * Math.PI,
                x = Math.cos(-angle) * amount,
                y = Math.sin(-angle) * amount,
                n = width * height * 4,
                a00 = -x - y,
                a10 = -x,
                a20 = y - x,
                a01 = -y,
                a21 = y,
                a02 = -y + x,
                a12 = x,
                a22 = y + x,
                tmpData = [],
                prog, lastProg = 0,
                convProgress;

        if (progress) {
            convProgress = function(p) {
                progress(p * 0.5)
                return p;
            };
        }

        convolve3x3(
                inData, tmpData, width, height,
                [[a00, a01, a02],
                    [a10, 0, a12],
                    [a20, a21, a22]]
                );

        for (var i = 0; i < n; i += 4) {
            outPixels.data[i] = 128 + tmpData[i];
            outPixels.data[i + 1] = 128 + tmpData[i + 1];
            outPixels.data[i + 2] = 128 + tmpData[i + 2];
            outPixels.data[i + 3] = inData[i + 3];

            if (progress) {
                prog = 0.5 + (i / n * 100 >> 0) / 100 * 0.5;
                if (prog > lastProg) {
                    lastProg = progress(prog);
                }
            }
        }

        return outPixels;
    },
    
    // get line of an image, but we don't try to use preset filter or other convolution
    // let users do it 
    getLine: function(canvas){
        
        // get image data then return later
        var currentImgData = canvas.ctx.getImageData(0,0,canvas.width,canvas.height);
        
        //        
        var outPixels = canvas.ctx.createImageData(canvas.width,canvas.height);
        currentImgData= ImageUtils.equalize(currentImgData, outPixels);
        
        outPixels = canvas.ctx.createImageData(canvas.width,canvas.height);
        currentImgData= ImageUtils.removeNoise(currentImgData, outPixels);
        
        var canny = new Canny(canvas);
        
    var result = canny.sobel(currentImgData);
    canvas.ctx.putImageData(result, 0, 0);

      var newImgData = canny.nonMaximumSuppress(result);
       //canvas.ctx.clearRect(0,0,canvas.width,canvas.height);
      //canvas.ctx.putImageData(newImgData, 0, 0);

//      newImgData.dirMap = result.dirMap;
//      newImgData.gradMap = result.gradMap;

      var //dirMap = canny.showDirMap(newImgData),
          //gradMap = canny.showGradMap(newImgData),
          hysImgData = canny.hysteresis(newImgData);
  
        newImgData = hysImgData();

        
        var edges = canny.getAllEdges(newImgData);
        
        
        var count = 0;
        edges.forEach(function(edge){
           if(edge.length>count){
               count = edge.length;
           } 
        });
        var edge;
        for(var i=0;i<edges.length;i++){
            if(edges[i].length === count){
                edge = edges[i];
                break;
            }
        }
        
        //
        // parallel line
        //var angleCollect = [];
        //console.log(canvas.width,canvas.height);
        var engine = new Engine(canvas.width,canvas.height);
        //var prevY = 0;
        
        var dilect = 0; // to know angle will be negative or positive
        // find the longest edge
        //edges.forEach(function(edge){
            //console.log(edge);
           edge.forEach(function(point){
//               newImgData.data[point] = 0;
//               newImgData.data[point+1] = 0;
//               newImgData.data[point+2] = 0;
               // roundAngle larger than 0 and smaller than 180
               //dilect += (roundAngle < 90 ? -1 : 1);
               
               // angle always smaller than 90 and larger than -90 based on y axis
               var realAngle = result.dirAngleMap[point];
               var angle = Math.abs(realAngle);
               
               
                   // the longest incline line will decide the dilect :D
                   // more than 45 degree we can't understand the direction anymore
                   // so must trainning again, get line only
                   
//                    newImgData.data[point] = 0;
//                            newImgData.data[point+1] = 0;
//                            newImgData.data[point+2] = 0;
                            
                   if (45 < angle && angle < 135){
                        dilect += realAngle < 0 ? -1 : 1;
                        //angleCollect.push(angle);
                        //if(angle > 45){
                           var size = Math.floor(point/4);
               var y = Math.floor(size/canvas.width);
               var x = size - y * canvas.width;
                            //angleCollect.push(angle);
                            
                            engine.addPoint(x,y);
                            
                            //.log(x,y,angle);
                       // }
                    }
                  // prevY = y;
//               if(0 < angle && angle < 90){
//                   angleCollect.push(angle);
//                   
//               } 
               
           });
           
           return engine.getLine();
           
    }


};      

