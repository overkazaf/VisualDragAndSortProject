$('.scroll-img').each(function (){
	var $that = $(this).find('ul');
	var liLen = $that.children('li').length || 1;
	var oW = $that.outerWidth();
	var percent = parseFloat(1 / liLen) * 100;
	var $children = $that.find('li').clone();
	$that.css({
		width : oW * 2
	}).append($children);

	$that.find('li').each(function (){
		$(this).attr({
			'style' : 'width :' + percent/2 + '% !important;'
		});
	});

	var oL = 0,
		step = 1,
		timer = null;

	var fnScrollLeft = function () {
		timer = setInterval(function (){
			oL -= step;
			$that.css({
				left : (oL)
			});
			if (-oL >= oW){
				oL = 0;
			}
		}, 30);
	};

	var fnStopScroll = function (){
		clearInterval(timer);
		timer = null;
	};

	$(this).on('mouseout', fnScrollLeft);
	$(this).on('mouseover', fnStopScroll);

	fnScrollLeft();
});