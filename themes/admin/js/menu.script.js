
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
	};
})(jQuery);