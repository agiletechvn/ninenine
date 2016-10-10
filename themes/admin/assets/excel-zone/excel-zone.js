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




App.loadCss($('<link href="themes/admin/assets/excel-zone/excel-zone.css" rel="stylesheet"/>'));

App.loadJs($('<script src="themes/admin/assets/excel-zone/xlsx/jszip.min.js"></script>'));
App.loadJs($('<script src="themes/admin/assets/excel-zone/xlsx/xlsx.js"></script>'));
App.loadJs($('<script src="themes/admin/assets/excel-zone/xlsx/ods.js"></script>'));


(function($){	

    var use_worker = typeof Worker !== 'undefined';

    function to_json(workbook) {
        var result = {};
        workbook.SheetNames.forEach(function (sheetName) {
            var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
            if (roa.length > 0) {
                result[sheetName] = roa;
            }
        });
        return result;
    }

    function xlsxworker_noxfer(data, cb) {
            var worker = new Worker('/themes/admin/assets/excel-zone/xlsxworker.js');
            worker.onmessage = function(e) {
                    switch(e.data.t) {
                            case 'ready': break;
                            case 'e': console.error(e.data.d); break;
                            case 'xlsx': cb(JSON.parse(e.data.d)); break;
                    }
            };
            worker.postMessage({d:data});
    }


    function xlsxworker(data, cb) {
            xlsxworker_noxfer(data, cb);
    }

    App.Func.handleExcelZone = function(selector){
        var drop = selector.find('.drop')[0];
        function handleDrop(e) {
            e.stopPropagation();
            e.preventDefault();
            var files = e.dataTransfer.files;
            handleFile(files);
        }

        function handleDragover(e) {
            e.stopPropagation();
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }

        if (drop.addEventListener) {
            drop.addEventListener('dragenter', handleDragover, false);
            drop.addEventListener('dragover', handleDragover, false);
            drop.addEventListener('drop', handleDrop, false);
        }


        function handleFile(files) {
            var i, f;
            for (i = 0, f = files[i]; i != files.length; ++i) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    if (use_worker) {
                        xlsxworker(data, process_wb);
                    } else {
                        var wb = XLSX.read(data, {type: 'binary'});

                        process_wb(wb);
                    }
                };

                reader.readAsBinaryString(f);
            }
        }

        function process_wb(wb) {
            var output = to_json(wb);
            selector.triggerHandler('onReadData', [output]);
        }
        var fileEl = selector.find('input:file');
        $(drop).bind('click', function(){
            fileEl.trigger('click');
            return false;
        });
        fileEl.change(function (e) {
            handleFile(e.target.files);
        });

    };

})(jQuery);  