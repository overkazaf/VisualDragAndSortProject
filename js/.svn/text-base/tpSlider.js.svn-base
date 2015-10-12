(function ($){
    var preload = function() {
        $('.topic-list').each(function (){
            var first = $(this).children().first().clone();
            $(this).append(first);

            var aElem = $(this).children('a');

            if (!aElem.length) {
                aElem = $(this).children('li');
            }
            aElem.each(function(idx){
                var curLi = $(this);
                if (curLi.get(0).tagName.toLowerCase() == 'a'){
                    curLi = $(this).children('li');
                } 
                
                var curWidth = curLi.width();
                var curHeight = curLi.height();
                var curImage = curLi.css('background-image');
                var curImageSize = curLi.css('background-size');
                //curLi.attr('style','');
                curLi.attr({
                    'style' : 'position:relative;float:left;width:'+ curWidth + 'px;height:' + curHeight + 'px;background-image:'+curImage+";background-size:" + curImageSize+";"
                });
            });
            
        });
    }
    var animate = function(speeds) {
        speeds = speeds || [];
        $('.topic-list').each(function (index){
            var oList = $(this)[0], // mover
                aBtns = $(this).closest('.slider-body').find('.btn-list-item'), // page-btns
                picLi = $(this).find('li'), // slider pics
                picWidth = picLi.first().width(), // each slider width
                picLen = picLi.length, // total picture length
                fixCount = picLen - 1; // remove the last item from calculation
            oList.style.width = +picLen * picWidth + 'px';
            oList.l= 0; // start Position

            fnMove();
            oList.onmouseover = fnStop;
            oList.onmouseout = fnMove;

            //define animate and stop fns
            function fnStop () {
                clearInterval(oList.timer);
                oList.timer = null;
            }
            function fnMove(){
                oList.timer = setInterval(function (){
                    oList.style.left = --oList.l + 'px';
                    if (oList.l % picWidth == 0) {
                        aBtns.removeClass('active');
                        var cur = -oList.l/picWidth % fixCount;
                        aBtns.eq(cur).addClass('active');
                    }
                    if (oList.l == -(fixCount * picWidth)) {
                        oList.l = 0;
                    }
                }, speeds[index] || 15);
            }
        });
    }
    
    function TopicSlider (){};
    TopicSlider.prototype.run = function (){
        preload();
        animate();
    };

    TopicSlider.prototype.terminate = function (){
        $('.topic-list').each(function (){
            var obj = $(this)[0];
            if (obj.timer){
                clearInterval(obj.timer);
                obj.timer = null;
            }

            obj.onmouseover = null;
            obj.onmouseout = null;
        });
    };

    new TopicSlider().run();
})(jQuery);