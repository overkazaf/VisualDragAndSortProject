;(function($){
	$('.choice-card').each(function (){
		var $this = $(this);
		var tabContents = $('.tab-content', $this);
		$('.tab-list', $this).on('mouseover', '.tab-item', function (){
			var index = $(this).index();
			$(this).addClass('active').siblings().removeClass('active');
			tabContents.hide().eq(index).show();
		});

		$('.tab-item', $this).first().trigger('mouseover');
	});
})(jQuery);