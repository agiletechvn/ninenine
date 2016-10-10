
(function($){

	/* nested sortables
	------------------------------------------------------------------------- */
	App.Func.handleNestedSortable = function(selector){
		
		var opt =$.extend({
			forcePlaceholderSize: true,
			handle: '.ns-title',
			helper:	'clone',
			items: 'li',
			opacity: .8,
			placeholder: 'placeholder',
			//revert: 250,
			tabSize: 25,
			tolerance: 'pointer',
			toleranceElement: '> div',
			maxLevels: 3,
	
			isTree: true,
			expandOnHover: 700,
			update: function() {
				selector.triggerHandler('nestedSortableUpdate');
			}
		}, selector.data());

		selector.nestedSortable(opt);
		
		if(!selector.hasDoneMenu){
			selector.on('click', '.disclose', function() {		
				$(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass('mjs-nestedSortable-expanded');
			});
			selector.hasDoneMenu = 1;
		}

		/* add menu group
		------------------------------------------------------------------------- */
		/*$('#add-group a').click(function() {
			gbox.show({
				type: 'ajax',
				url: $(this).attr('href'),
				buttons: {
					'Lưu': function() {
						var group_title = $('#menu-group-title').val();
						if (group_title == '') {
							$('#menu-group-title').focus();
						} else {
							//$('#gbox_ok').attr('disabled', true);
							$.ajax({
								type: 'POST',
								url: 'administrator/menu/group_add',
								data: 'title=' + group_title,
								error: function() {
									//$('#gbox_ok').attr('disabled', false);
								},
								success: function(data) {
									//$('#gbox_ok').attr('disabled', false);
									switch (data.status) {
										case 1:
											gbox.hide();
											$('#menu-group').append('<li><a href="administrator/menu/' + data.id + '">' + group_title + '</a></li>');
											break;
										case 2:
											$('<span class="error"></span>')
												.text(data.msg)
												.prependTo('#gbox_footer')
												.delay(1000)
												.fadeOut(500, function() {
													$(this).remove();
												});
											break;
										case 3:
											$('#menu-group-title').val('').focus();
											break;
									}
								}
							});
						}
					},
					'Hủy': gbox.hide
				}
			});
			return false;
		});*/

		/* edit group
		------------------------------------------------------------------------- */
		/*$('#edit-group').click(function() {
			var sgroup = $('#edit-group-input');
			var group_title = sgroup.text();
			sgroup.html('<input value="' + group_title + '">');
			var inputgroup = sgroup.find('input');
			inputgroup.focus().select().keydown(function(e) {
				if (e.which == 13) {
					var title = $(this).val();
					if (title == '') {
						return false;
					}
					$.ajax({
						type: 'POST',
						url: 'administrator/menu/group_edit',
						data: 'id=' + current_group_id + '&title=' + title,
						success: function(data) {
							if (data.success) {
								sgroup.html(title);
								$('#group-' + current_group_id + ' a').text(title);
							}
						}
					});
				}
				if (e.which == 27) {
					sgroup.html(group_title);
				}
			});
			return false;
		});
		*/
		/* delete menu group
		------------------------------------------------------------------------- */
		/*$('#delete-group').click(function() {
			var group_title = $('#menu-group li.current a').text();
			gbox.show({
				content: '<h2>Xóa bộ danh mục</h2>Bạn có muốn xóa bộ danh mục này?<br><b>'
					+ group_title +
					'</b><br><br>Và tất cả mục của danh mục này cũng sẽ bị xóa.',
				buttons: {
					'Có': function() {
						$.post('administrator/menu/group_delete/' + current_group_id, function(data) {
							if (data.success) {
								window.location = 'administrator/menu';
							} else {
								gbox.show({
									content: 'Lỗi xóa danh mục.'
								});
							}
						});
					},
					'Không': gbox.hide
				}
			});
			return false;
		});*/
	};
})(jQuery);