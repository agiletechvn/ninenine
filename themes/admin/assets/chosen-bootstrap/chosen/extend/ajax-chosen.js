// tubackkhoa@gmail.com

(function($) {

    $.fn.ajaxChosen = function(settings, callback) {
        var chosenXhr, defaultOptions, options, select;
        defaultOptions = {
            minTermLength: 3,
            afterTypeDelay: 500,
            jsonTermKey: "term",
            keepTypingMsg: "Keep typing...",
            lookingForMsg: "Looking for",
            type: 'GET',
            dataType: 'json'
        };
        select = this;
        chosenXhr = null;
        options = $.extend(defaultOptions, settings);
        return this.each(function() {
            var chosen = $(this).data('chosen');
            var keyField = $(this).data('key') || 'key'; // mean id
            var valueField = $(this).data('value') || 'value'; // mean title or anything
            var groupKeyField = $(this).data('group-key') || 'text';
            var groupValueField = $(this).data('group-value') || 'items';
            
            return chosen.container.find(".search-field > input, .chzn-search > input").bind('keyup', function() {

                var field, msg, success, untrimmed_val, val;
                untrimmed_val = $(this).val();
                val = $.trim($(this).val());
                msg = val.length < options.minTermLength ? options.keepTypingMsg : options.lookingForMsg + (" '" + val + "'");
                select.next('.chzn-container').find('.no-results').text(msg);
                if (val === $(this).data('prevVal')) {
                    return false;
                }
                $(this).data('prevVal', val);
                if (this.timer) {
                    clearTimeout(this.timer);
                }

                if (val.length < options.minTermLength) {
                    return false;
                }

                field = $(this);
                if (!options.data) {
                    options.data = {};
                }
                options.data[options.jsonTermKey] = val;
                if (options.dataCallback) {
                    options.data = options.dataCallback(options.data);
                }
                success = options.success;
                options.success = function(data) {

                    var items, nbItems, selected_values;
                    if (!data) {
                        return;
                    }
                    // check value is the fastest and correct way
                    selected_values = [];
                    select.find('option').each(function() {
                        if (!$(this).is(":selected")) {
                            return $(this).remove();
                        } else {
                            return selected_values.push($(this).val());
                        }
                    });
                    select.find('optgroup:empty').each(function() {
                        return $(this).remove();
                    });
                    items = callback !== null ? callback(data, field) : data;
                    nbItems = 0;
                    $.each(items, function(i, element) {
                        var group, text, value;
                        nbItems++;
                        if (element[groupValueField]) { // kind of group
                            group = select.find("optgroup[label='" + element[groupKeyField] + "']");
                            if (!group.size()) {
                                group = $("<optgroup />");
                            }
                            group.attr('label', element[groupKeyField]).appendTo(select);
                            return $.each(element[groupValueField], function(i, element) {
                                var text, value;
                                if (typeof element === "string") {
                                    value = i;
                                    text = element;
                                } else {
                                    value = element[keyField];
                                    text = element[valueField];
                                }
                                if ($.inArray(value, selected_values) === -1) {
                                    return $("<option />").attr('value', value).html(text).appendTo(group);
                                }
                            });
                        } else {
                            if (typeof element === "string") {
                                value = i;
                                text = element;
                            } else {
                                value = element[keyField];
                                text = element[valueField];
                            }
                            if ($.inArray(value, selected_values) === -1) {
                                return $("<option />").attr('value', value).html(text).appendTo(select);
                            }
                        }
                    });
                    if (nbItems) {
                        select.trigger("liszt:updated");
                        //chosen.search_field_scale();
                    } else {
                        select.data().chosen.no_results_clear();
                        select.data().chosen.no_results(field.val());
                    }
                    if (settings.success) {
                        settings.success(data);
                    }
                    return field.val(untrimmed_val);
                };


                return this.timer = setTimeout(function() {
                    if (chosenXhr) {
                        chosenXhr.abort();
                    }

                    return chosenXhr = $.ajax(options);
                }, options.afterTypeDelay);
            });
        });
    };
})(jQuery);
