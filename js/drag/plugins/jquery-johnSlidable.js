/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-29 14:32:49
 * @version $Id$
 */

(function ($){
    window.sliderList = [];
    $.fn.johnSlidable = function (options) {
        var opts = $.extend({}, $.fn.johnSlidable, options);
        var itemList = [];
        var context = $(opts.slider);
        var movedItem = context.find(opts.movedItemClass);
        var titleElem = opts.hasTitle ? context.parent().find(opts.titleClass).children('a') : null;
        return this.each(function (i, cont){
            var that = this;
            var items = null;
            var Slider = {
                prevBtn : null,
                nextBtn : null,
                width   : 980,
                height  : 120,
                timer   : null,
                sBtn    : null,
                oPager  : null,
                currentIndex : 1,
                totalPages   : 1,
                ready : true,
                init : function (){
                    Slider.prevBtn = $(that).parent().find(opts.previousButton);
                    Slider.nextBtn = $(that).parent().find(opts.nextButton);
                    Slider.currentIndex = 1;
                    Slider.width = movedItem.parent().width() || opts.width || Slider.width;
                    Slider.height = movedItem.parent().height() || opts.height || Slider.height;
                    if (opts.hasSmallButton) {
                        Slider.oPager = $(that).find(opts.sPagerClass);
                        Slider.sBtn = Slider.oPager.find(opts.sButtonClass);
                        items = Slider.sBtn;
                    } else {
                        items = $(movedItem).find("li");
                    }
                    
                    if (titleElem) {
                        titleElem.text(opts.titleArray[0]);
                    }
                    $(items).each(function (){
                        itemList.push(this);
                    });
                    var t = itemList.length % opts.itemsPerPage == 0 ? itemList.length / opts.itemsPerPage : Math.floor(itemList.length / opts.itemsPerPage) + 1;
                    	t = itemList.length < opts.itemsPerPage ? 1 : t;
                    Slider.totalPages = opts.hasSmallButton ? items.length : parseInt(t);
                    Slider.bindEvent();
                },
                bindEvent : function (){
                    Slider.nextBtn.on('click', function (){
                        if (!Slider.ready)return;
                        Slider.currentIndex++;
                        if (opts.loop) {
                            if (Slider.currentIndex > Slider.totalPages) {
                                Slider.currentIndex = 1;
                            }
                        } else {
                            if (Slider.currentIndex > Slider.totalPages) {
                                Slider.currentIndex = Slider.totalPages;
                            }
                        }
                        
                        Slider.refresh();
                    });
                    
                    Slider.prevBtn.on('click', function (){
                        if (!Slider.ready)return;
                        Slider.currentIndex--;
                        if (opts.loop) {
                            if (Slider.currentIndex <= 0) {
                                Slider.currentIndex = Slider.totalPages;
                            }
                        } else {
                            if (Slider.currentIndex <= 0) {
                                Slider.currentIndex = 1;
                            }
                        }
                        Slider.refresh();
                    });
                    
                    if (opts.hasSmallButton) {
                        Slider.sBtn.each(function (index){
                            $(this).on('click', function (){
                                Slider.stop();
                                Slider.setActiveSmallButton(Slider.currentIndex-1);
                                Slider.currentIndex = index + 1;
                                Slider.refresh();
                                
                            });
                        });
                    }
                    opts.autoPlay && Slider.autoPlay();
                },
                autoPlay : function (){
                    if (opts.marquee) {
						var offsetLeft = 0;

						Slider.timer = setInterval(function (){
							movedItem.css({
								left : --offsetLeft + 'px'
							});	
							var tot = Slider.totalPages > 0 ? Slider.totalPages : 1;
							if (offsetLeft <= -(tot) * Slider.width){
								offsetLeft = 0;
							}
						}, 33);

						movedItem.parent().on('mouseover', function (){
							Slider.stop();
						}).on('mouseout', function (){
							Slider.timer = setInterval(function (){
								movedItem.css({
									left : --offsetLeft + 'px'
								});	
								var tot = Slider.totalPages > 0 ? Slider.totalPages : 1;
								if (offsetLeft <= -(tot) * Slider.width){
									offsetLeft = 0;
								}
							}, 33);
						});
                    } else {
						// normal ppt animate effects
						Slider.timer = setInterval(function (){
							Slider.nextBtn.trigger('click');
						}, opts.interval);
						
						movedItem.parent().on('mouseover', function (){
							Slider.stop();
						}).on('mouseout', function (){
							Slider.timer = setInterval(function (){
								Slider.nextBtn.trigger('click');
							}, opts.interval);
						});
					}
                },
                stop : function () {
                    if(Slider.timer){
                        clearInterval(Slider.timer);
                    }
                    Slider.timer = null;
                },
                refresh : function (ev){
                    var target = -(Slider.currentIndex-1) * Slider.width;
                    Slider.ready = false;
                    movedItem.animate({
                        left : target + 'px'
                    }, opts.switchSpeed, 'swing', function (){
                        if (opts.hasSmallButton) {
                            Slider.setActiveSmallButton(Slider.currentIndex-1);
                        }
                        
                        if (titleElem) {
                            titleElem.text(opts.titleArray[Slider.currentIndex-1]);
                        }
                        Slider.ready = true;
                    });
                },
                setActiveSmallButton : function (index) {
                    var smallButtons = Slider.sBtn;
                    smallButtons.removeClass('active');
                    smallButtons.eq(index).addClass('active');
                }
            };
            
            Slider.init();
            sliderList.push(Slider);
        });
    };
    
    $.fn.johnSlidable.defaults = {
        slider : '#slider',
        movedItemClass : '.list',
        previousButton : 'a.prev',
        nextButton     : 'a.next',
        hasSmallButton : !1,
        sPagerClass    : '.pagenation',
        sButtonClass   : '.page-btn', 
        itemsPerPage   : 5,
        autoPlay       : !1,
        loop           : !1,
		marquee        : !1,
        switchSpeed    : 2000,
        interval       : 3000,
        hasTitle       : 1,
        titleClass     : 'titleClass'
    };
})(jQuery);
