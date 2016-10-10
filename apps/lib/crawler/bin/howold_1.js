$('.accordianWrapCat').map(function(){
    var topic = $('h2',this).text();
    topic += "\n" + $('.accordionContent a', this).map(function(){
       return "\t\t" + $.trim($(this).text());
    }).get().join("\n");
    return topic;
}).get().join("\n")