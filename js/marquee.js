;(function(){
	$('.widget-marquee').each(function(){
		var data = $(this).find('div.imgtoclass');
		var that = this;
		var ulData = $(that).find('.ulData');
	      $(that).hide().css({
	      	'width' : $(that).closest('.layout-cell').width() + 'px'
	      });
	      ulData.css({
	      	'background-color' : '#fff',
	      	'width' : $(that).height() + 'px'
	      });

		data.each(function() {
	      ulData.append('<li><img src="'+$(this).prev()[0].src+'" />'+$(this).html()+'</li>');
	    }); 

	    $(that).find('.ulData').find('img').each(function(){
	    	$(this).css({
	    		height : $(that).height() - 40 + 'px'
	    	});
	    });
	});

	var old_onload = window.onload || function(){};

	window.onload = function(){
		old_onload();
		$('.widget-marquee').each(function(){
			$(this).show().find(".scrollleft").imgscroll({
				speed: 40,    //图片滚动速度
				amount: 0,    //图片滚动过渡时间
				width: 1,     //图片滚动步数
				dir: "left"   // "left" 或 "up" 向左或向上滚动
			});
		});
	}
})(jQuery);