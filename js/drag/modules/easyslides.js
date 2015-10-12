$(function () {
	$(".rslides").each(function (){
		var $ul = $(this).find('ul');
		var $ali = $ul.find('li');
		var iW = $(this).width(),
			iH = $(this).height();
		$ali.each(function (){
			$(this).css({
				'width' : iW,
				'height' : iH
			});
		});
	});
	$(".rslides").responsiveSlides({
		auto: true,
		pager: false,
		nav: false,
		speed: 500,
		namespace: "slide"
	});
});