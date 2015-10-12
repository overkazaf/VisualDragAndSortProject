(function ($){
    var titleArray = [];
    var preLoad = function (){
        $('.widget-powerpoint').each(function (idx){
            titleArray[idx] = [];
            var imgParent = $(this).find('.hidden-images');

            var aImages = imgParent.children('img');
            var aTitles = imgParent.children('div.imgtoclass');
            var oUl = $(this).find('.slide-list');
            var oPager = $(this).find('.pagenation');
            oUl.empty();
            oPager.empty();
            aTitles.each(function (index){
                var oA = $(this).children('a');
                var oLi = $('<li>').attr({
                    'class' : 'slide-list-item'
                }).append($(oA).clone());
                var title = $(oA).attr('title');
                console.log(title);
                titleArray[index].push(title);
                $(this).remove();
                oLi.appendTo(oUl);
                var pagerLi = $('<li>').attr({
                    'class' : 'page-btn'
                }).text(index+1).appendTo(oPager);
                if (0 == index) {
                    pagerLi.addClass('active');
                }
            });
            
            var aLi = oUl.find('.slide-list-item');
            aImages.each(function (index){
                var targetA = aLi.eq(index).children('a');
                targetA.html($(this));
            });

			if ($(this).hasClass('marquee')){
				// fix the image length
				oUl.append(oUl.children().first().clone()).css({
					width : oUl.closest('.powerpoint-slider').width() * oUl.children().length + 'px'
				});
				oPager.hide();
			}
        });
    };
    
    var init = function (){
        $('.widget-powerpoint').each(function (idx){
            $(this).johnSlidable({
                slider : '.powerpoint-slider:eq('+idx+')',
                movedItemClass : '.slide-list',
                previousButton : 'a.sld-prev',
                nextButton     : 'a.sld-next',
                hasSmallButton : 1,
                sPagerClass    : '.pagenation',
                sButtonClass   : '.page-btn',
                itemsPerPage   : 1,
                autoPlay       : 1,
                loop           : 1,
				marquee		   : $(this).hasClass('marquee'),
                switchSpeed    : 800,
                interval       : 4000,
                hasTitle       : 1,
                titleClass     : '.powerpoint-title',
                titleArray     : titleArray[idx]
            });
        });
    };
    
    var $cb = $.Callbacks();
    
    $cb.add(preLoad);
    $cb.add(init);
    
    $cb.fire();
})(jQuery);