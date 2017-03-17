$(function () {
    
    Track.listenNewNode('.icon-chevron-down', function(){
       $(this).addClass('glyphicon glyphicon-chevron-down'); 
    });
    
    Track.listenNewNode('.icon-chevron-up', function(){
       $(this).addClass('glyphicon glyphicon-chevron-up'); 
    });

});