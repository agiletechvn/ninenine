(function ($) {
    /**
     * more func
     * remember to specify response type as json, so we can use xml to redirect to login when session is out
     */

    $.fn.serializeObject = function () {
        // must be include without ajax
        "use strict";

        var result = {};
        var extend = function (i, element) {
            var node = result[element.name];

            // If node with same name exists already, need to convert it to an array as it
            // is a multi-value field (i.e., checkboxes)

            if ('undefined' !== typeof node && node !== null) {
                if ($.isArray(node)) {
                    node.push(element.value);
                } else {
                    result[element.name] = [node, element.value];
                }
            } else {
                result[element.name] = element.value;
            }
        };

        $.each(this.serializeArray(), extend);
        return result;
    };

    App.Func.validateForm = function (modal, ret) {
        if (typeof ret === 'string') {
            try {
                ret = $.parseJSON(ret);
            } catch (e) {
                errorMessage(e);
            }
            ;
        }
        var formAdmin = modal.find('form');
        if (ret.id) {
            formAdmin.find('[name=id]').val(ret.id);
        }
        if (ret.msg) {
            modal.find('.modal-footer .message-info').html(ret.msg);
        }

        // default is empty array :D
        ret.error = ret.error || [];

        //var errorCount = 0;

        formAdmin.find('input:not(:hidden),textarea,select').each(function () {
            var el = $(this);
            var name = el.attr('name');
            var controlGroup = el.closest('.control-group');
            var helpInline = controlGroup.find('.help-inline[err-for="' + name + '"]');
            if (!helpInline.length) {
                // try with first inline :D
                helpInline = controlGroup.find('.help-inline:not([err-for]):first');
            }
            if (ret.error[name]) {
                var currentError = ret.error[name];
//                if (currentError.type === 'error')
//                    errorCount++;
                el.addClass(currentError.type || 'error');
                helpInline.html(currentError.msg)
                        .addClass(currentError.type || 'error');
            } else {
                el.removeClass('error warning');
                helpInline.html(helpInline.data('original-text'))
                        .removeClass('error warning');
            }
        });
        
        // errorCount mean nothing, when there was error, if we don't show it, it is still error, 
        // show it success doesnt mean a thing, because logic is not just has view or not
        return ret.error.length === 0;// errorCount === 0;
    };

    App.Func.handleAdminAddForm = function (selector) {
        var addModal = selector;
        var currentNumber;
        var eventData, totalFileNumber;
        var afterSubmitRet; // merge all responses

        // mark as ui-type
        selector.attr({'ui-init': 1, 'ui-type': 'admin-add-form'});
        // add to collector
        App.track(selector); // need destroy ?

        // for faster processing, we have to deal with show event, so deal with risk :D
        // in your code files, you should use shown event to prone these errors
        addModal.bind('show', function (e) {
            // allow tag in modal for event propagation only
            if ((!$(e.target).is('[data-toggle=tab]')) && (e.target !== addModal[0]))
                return; // propagation
            //
            // always scroll top for review
            var formBody = addModal.find('.modal-body').scrollTop(0);//.animate({'scrollTop': 0});

            // no need to worry about bubble :D, window is grant parent
            $(window).trigger('resize', [true]);

            // relatedTarget is tab
            if (!e.toggle && !e.relatedTarget) {
                // keep this info to tell user to know which one has just been updated ?
                addModal.find('.modal-footer .message-info').empty();
                var formTitle = addModal.find('.form-title');
                addModal.find('.modal-header h3').html(formTitle.html());
                formTitle.remove();

                // check notification from server, such as login session timeout
                var ajax = formBody.find('ajax');
                if (ajax.length) {
                    // test redirect via href set
                    var match = ajax.find('content').text().match(/href="(.*?)\?.*"/);
                    if (match) {
                        // redirect login form now, don't use ajax any more
                        location.href = match[1] + '?return_url=' + location.href;
                    }
                }
                // should init only one time
                //if(formBody.attr('modal-init'))					
                //return;
                //
                // init right before show
                App.init(formBody);


                //formBody.attr('modal-init', '1');

                var formAdmin = addModal.find('form.admin-form');

                formAdmin.find('.help-inline').each(function () {
                    var helpInline = $(this);
                    // use html for better display message
                    helpInline.data('original-text', helpInline.html());
                });

                formAdmin.attr('action', addModal.attr('action'))
                        .bind('fileUploadedOne', function (e, response, name, number, total, fieldName) {
                            // show error for file size sometime if we dont catch in code                   
                            if (typeof response === 'string') {
                                var ind = response.indexOf("{");
                                var msg = response.substr(0, ind);
                                var response = JSON.parse(response.substr(ind));
                                // if not closing show direct
                                if(addModal.hasClass('closing')){
                                    errorMessage(msg);
                                } else {
                                    // should show only one message
                                    response.error = {title:{type:'error',msg:'ngon'}};
                                    response.error[fieldName] = {type:'error',msg : msg};
                                    //console.log(response);
                                }
                                // it is string, so it must be serious error, bind it only]
                                afterSubmitRet = response;
                            } else {
                                // override and merge result recursively, 'cos we need all error and messages
                                afterSubmitRet = $.extend(true, afterSubmitRet, response);
                            }
                            // success when all file uploaded successfully
                            eventData[0] &= App.Func.validateForm(addModal, response);
                        })
                        // each uploaded event is for one file input, this input is not multiple, so default is one file
                        .bind('fileUploaded', function (e, total) {
                            // total is file that uploaded, if no file is uploaded, we assume one file is done
                            currentNumber += (total || 1);
                            // total is just for a group of files
                            // validate form again with new ret variable
                            // but after all validate has been success, submit will be called
                            // number of files have been uploaded for each file widget 
                            // each file widget uploaded successfully, we reload grid for immediately view
                            if (currentNumber === totalFileNumber) {
                                // tell last
                                eventData.push(true);
                                // afterSubmitAll done
                                selector.trigger('afterSubmitAll', [eventData[0], afterSubmitRet]);
                            }
                            // each update phrase trigger afterSubmit, when done is afterSubmitAll
                            selector.trigger('afterSubmit', eventData);

                        }).submit(function (event) {
                    var dados = formAdmin.serializeObject();
                    selector.trigger('beforeSubmit', [dados]);
                    $.post(formAdmin.attr('action'), dados, function (ret) {
                        var success = App.Func.validateForm(addModal, ret);
                        eventData = [success, ret];
                        afterSubmitRet = ret;
                        var hasFile = false;
                        if (success) {
                            // seperate ajax call to make it easier to maintain
                            // use query to make it easier than extrafield
                            // process for single file upload only
                            // for multi file upload, there's another
                            var files = formAdmin.find(':file:not([multiple])');
                            hasFile = (totalFileNumber = files.length) > 0;
                            if (hasFile) {
                                currentNumber = 0;
                                // check whether has any file to upload
                                var uploadEvent = $.Event('html5_upload.start');
                                files.trigger(uploadEvent);
                                hasFile = uploadEvent.result;
                                // check result is true or false, 
                                // if false should alert ....
                                // console.log(uploadEvent.result);
                            }
                        }
                        // delay until all files have been uploaded
                        // jquery will call ajax requests in queue, it's good news
                        // file upload doesn't make sense to reload table
                        // because at least we changed all data fields
                        if (!hasFile) {
                            // only one phrase 
                            selector.trigger('afterSubmitAll', eventData);

                            // last parameter show that this is the last ajax update
                            // in file upload, it tells form that all files has been updated then this is the last on submit
                            eventData.push(true);
                            // we use trigger, so even container can receive these events
                            selector.trigger('afterSubmit', eventData);

                        }

                    }, 'json');
                    return false;
                });
            }
        });

        addModal.find('.modal-footer button.btn-primary').click(function () {
            var formAdmin = addModal.find('form.admin-form');
            formAdmin.submit();
        });
    };

    App.Func.handleAdminDelForm = function (selector) {
        var delModal = selector;
        delModal.find('.modal-footer button.btn-primary').click(function () {
            var dados = {id: delModal.data('original').id};
            selector.trigger('beforeSubmit', [dados]);
            $.post(delModal.attr('action'), dados, function (ret) {
                if (ret.msg) {
                    delModal.find('.modal-footer .message-info').html(ret.msg);
                }
                selector.trigger('afterSubmit', [ret.type == 'success', ret.data]);
            }, 'json');
        });
    };

    // by default, each ui has only one ui-type, it tells collection the main type of that ui
    // but we can add more handle to it by hand, and we can use a bridge ui-type which calls two handle functions
    // together, of course, one ui-type helps the system to make garbage collector works better
    App.Func.handleResponsiveForm = function (selector) {
        // firefox don't accept i tag
        selector.on('click', '.modal-header .resize', function () {
            var item = $(this).find('i').first();
            if (!selector.hasClass('fullscreen')) {
                selector.addClass('fullscreen').attr('data-desktop', 'fullscreen');
                item.removeClass('icon-resize-full').addClass('icon-resize-small');
            } else {
                selector.removeClass('fullscreen').attr('data-desktop', '');
                item.removeClass('icon-resize-small').addClass('icon-resize-full');
            }
            // trigger resize normally, inside the dialog is better, but it doesn't matter what's going
            // at background
            setTimeout(function () {
                $(window).resize();
            }, 50);

        }).on('show', function (e) {
            if (e.target === this) {
                // on mobile, should remove desktop as fast as possible
                // class for modal should only be mobile and non-mobile(desktop)
                if (App.deviceType === 3)
                    selector.find('.responsive').each(function () {
                        var item = $(this);
                        item.removeClass(item.attr('data-desktop'));
                    });
            }
        });
    };

})(jQuery);