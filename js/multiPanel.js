(function ($){
    $('.multi-panel').each(function (){
		var aLi = $(this).find('.tab-list-item');
		var _this_ = $(this);

		var panels = _this_.find('.widget-panel');
		$(this).on('mouseover', '.tab-list-item', function (){
			var index =  $(this).index();
			$(this).addClass('active').siblings().removeClass('active');
			panels.hide().eq(index).show();
		})
		aLi.first().trigger('mouseover');
	});
})(jQuery);