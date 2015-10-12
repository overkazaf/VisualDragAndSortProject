;(function($){
	$('.friend-dropdown').each(function (){
		$(this).on('change', function (){
			var url = $(this).val();
			window.open(url);
		});
	});
})(jQuery);