
$(function () {

    $('#btn-save-template').click(function () {
        var id = $('#user_creation').val();
        if (id) {
            var title = $.trim($('[data-id=user_creation]').text());
            $('#save-modal [name=title]').val(title);
        }
        $('#save-modal').modal('show');

    });

    $('#save-modal').on('click', '.btn-primary', function () {

        var action = $('#save-modal form').attr('action') || "template/save";
        // by default, the template is not editable
        canvas.getObjects().forEach(function (obj) {
            obj.selectable = false;
        });
        var json = canvas.toJSON(['clipName', 'clipFor', 'hasRotatingPoint', 'lockRotation', 'selectable']);
        // return as it used to be
         canvas.getObjects().forEach(function (obj) {
            obj.selectable = true;
        });
        var jsonStr = JSON.stringify(json);
        
        // this is for admin to coninue edit
        var jsonRaw = canvas.toJSON(['clipName', 'clipFor', 'hasRotatingPoint', 'lockRotation', 'selectable']);
        var jsonStrRaw = JSON.stringify(jsonRaw);

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
            raw_data:jsonStrRaw,
            main_img: main_img
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
                'data-content': "<img height='20' src='media/images/fflives/template/creation_"
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
            $.get('template/creation/' + creationId, function (ret) {
                loadTemplateFromRet(ret);
            });

        }
    });


});