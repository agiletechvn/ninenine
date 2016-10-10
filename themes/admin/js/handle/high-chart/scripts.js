
App.Func.handleHighChart = function(selector) {

    // load lib for this ui, these elements will be appened to head, then destroy later
    App.loadJs($('<script src="themes/admin/assets/highchart/highcharts.js"></script>'));

    // always update to newest
    if (!$().highcharts) {
        return;
    }

    var data = selector.data();
    var value;
    for (var i = 0; i < data.series.length; i++) {
        value = data.series[i].data;
        var cdata = new Array();
        for (var j = 0; j < value.length; j++) {
            cdata[j] = parseInt(value[j], 10);
        }

        data.series[i].data = cdata;
    }

    data.xAxis = data.xaxis;
    data.yAxis = data.yaxis;

    //console.log(data);

    selector.highcharts(data);

    //selector.bind("plothover", function (event, pos, item) {});
};
