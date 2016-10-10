(function() {
    var commands = {
        album: t('New Album'),
        youtube: t('Youtube'),
        answer: t('Survey Answer')
    };
    
    $.each(commands, function(command){
        var label = this;
        CKEDITOR.plugins.add(command, {
            init: function(editor) {
                editor.addCommand(command, {
                    exec:function(){
                        switch(command){
                            case 'answer':
                                editor.insertHtml('[widget type="'+command+'" label=""][/widget]');
                            break;
                            default:
                                editor.insertHtml('[widget type="'+command+'" id=""/]');
                            break;
                        }
                    }
                });
                editor.ui.addButton(command, { 
                    label: label, 
                    icon: App.siteUrl + 'themes/admin/images/'+command+'.png', 
                    command: command
                });
                if (editor.addMenuItems) editor.addMenuItem("newplugin", { 
                    label: label, 
                    command: command, 
                    group: 'clipboard', 
                    order: 9 
                });
                if (editor.contextMenu) editor.contextMenu.addListener(function() {
                    var listener = {};
                    listener[command] = CKEDITOR.TRISTATE_OFF;
                    return listener;
                });
            }
        });
    
    });
})();