// tubackkhoa@gmail.com

(function($) {


    // map select ordered to original select
    function bindValue(selector, select, vals) {

        select.children().remove();
        vals.forEach(function(val) {
            var option = $('<option selected="selected"></option>').val(val);
            select.append(option);
        });

        // custom event, include re-ordered
        selector.triggerHandler('liszt:changed');
    }

    $.fn.sortableChosen = function(settings) {
        
        // always loop through, each have data for each item, bind with each
        // collection is small, so don't worry :D
        return this.each(function() {
            
            var selector = $(this), chosen = selector.data('chosen');
            // make it sortable, should use data() if call many times, 'cos it is cached
            var vals = selector.data('sortable-value') || selector.data('checked'), chosenContainer = chosen.container;
            // maybe data is number so we can't split it
            vals = vals ? (typeof vals === 'number' ? [vals] : vals.split(',')) : (selector.val() || []);

            // do code here to get the correct value
            var chosenChoices = chosenContainer.find('.chzn-choices');

            if (!settings.hideNote) {
                // no style, just use br
                selector.after('<br/><span class="label label-important">NOTE!</span><span> Drag and drop to re-order the selected items </span><br/>');
                // update layout after bind content
                //chosen.update_multiple_change();
            }
            

            // reorder
            var last = chosenChoices.find('.search-field');
            for (var i = 0; i < vals.length; ++i) {
                var val = vals[i];
                var choice = chosenChoices.find('li.search-choice[value="' + val + '"]');
                if(choice.length){
                    last.before(choice);
                }
            }

            // change field name to send to server
            var hidden = $('<select multiple style="display:none"></select>');
            selector.after(hidden);
            hidden.attr('name', selector.attr('name'));
            selector.removeAttr('name');

            // now we don't support search from text to value
            // you have always to put value into select, may be text-index
            // without value, there's nothing to post on server
            /*var hash = {};
             
             selector.bind('beforeDestroy', function(){
             delete hash;
             });
             
             var initHash = function(){
             selector.find('option').each(function() {
             var parsed = SelectParser.parseHTML($(this).text());
             hash[$.trim(parsed.text)] = $(this).val();
             });
             };
             initHash();*/

            // On mousedown of choice element,
            // we don't want to display the dropdown list, we want the sort action
            chosenChoices.bind('mousedown', function(event) {
                // always optimize if possible
                if (event.target.tagName === 'SPAN') {
                    event.stopPropagation();
                }
            });

            selector.bind('change', function(e, val) {
                // update hash, in case ajax binding :D
                //initHash();
                var vals;
                if (!val) {
                    vals = chosenChoices.find('li:not(.search-field)').map(function() {
                        if (!this) {
                            return undefined;
                        }
                        return $(this).attr('value'); //hash[$.trim($(this).text())];
                    }).get();


                } else {
                    vals = hidden.val() || [];
                    if (val.selected) {
                        vals.push(val.selected);
                    } else if (val.deselected) {
                        // delete one item should use splice
                        // delete many items should use $.grep to return new array
                        vals.splice($.inArray(val.deselected, vals), 1);
                    }
                }

                // rebind select
                bindValue(selector, hidden, vals);

            });
            // don't check this so user know their missing files
            // Initialize jQuery UI Sortable
            var tempStyle;
            chosenChoices.sortable({
                items: 'li:not(.search-field)',
                update: function() {
                    selector.trigger('change');
                },
                tolerance: 'pointer',
                helper: function(e, li) {
                    // remain width while dragging
                    // it will restore width later
                    // you can restore the whole style, but more expensive
                    tempStyle = li[0].style.width;
                    // fix styling for browser when change position to absolute
                    // this is known by experience, get width of first :D
                    li[0].style.width = li.children().first().width() + 'px';
                    return li;
                },
                stop: function(e, ui){
                    // no helper clone
                    ui.item[0].style.width = tempStyle;
                }
            });

            // for sortable chosen select, we get it as 
            bindValue(selector, hidden, vals);
        });
    };
})(jQuery);