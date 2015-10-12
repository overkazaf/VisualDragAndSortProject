(function ($){
    var titleArray = [];
    var preLoad = function (){
        $('.multi-ppt').each(function (idx){
            titleArray[idx] = new Array();
            var imgParent = $(this).find('.hidden-images');
            var aImages = imgParent.children('img');
            var aTitles = imgParent.children('div.imgtoclass');
            var oUl = $(this).find('.ppt-list');
            var oShortcut = $(this).find('.ppt-shortcut');
            var oShortcutUl = oShortcut.find('.ppt-shortcut-list');
            var oPager = $(this).find('.btn-list');
            oUl.empty();
            oShortcutUl.empty();
            oPager.empty();
            
            aImages.each(function (index){
                var oTitle = aTitles.eq(index);
                var oA = oTitle.children('a');
                var oLi = $('<li>').attr({
                    'class' : 'ppt-list-item'
                }).css({
                    width : $(oUl).closest('.ppt-slider').width() + 'px'
                }).append($(oA).clone());
                var title = $(oA).html();

                titleArray[idx].push(title);
                oTitle.remove();
                
                oLi.appendTo(oUl);
                var pagerLi = $('<li>').attr({
                    'class' : 'page-btn'
                }).html("").appendTo(oPager);
                if (0 == index) {
                    pagerLi.addClass('active');
                }
            });
            var aLi = oUl.find('.ppt-list-item');
            oUl.css({
                margin:0,padding:0,
                width : 100*aLi.length + '%'
            });
            
            aImages.each(function (index){
                var targetA = aLi.eq(index);
                targetA.html($(this));
                var oLi = $('<li>').attr({
                    'class' : 'shortcut-item',
                    'style' : 'background:url(' + $(this).attr('src') +') no-repeat;'
                }).css({
                    height : $(oUl).closest('.ppt-slider').height()/3 + 'px',
                    width : ($(oUl).closest('.powerpoint-body').width() * 0.3) + 'px'
                });

                oShortcutUl.append(oLi);
            });
            
            var cloneHTML = oShortcutUl.html();
            oShortcutUl.append(cloneHTML);
            oShortcutUl.children('li').first().addClass('active');
        });
    };
    
    var init = function (){
        $('.multi-ppt').each(function (idx){
            var id = $(this).attr('id');
            var cnt = $(this).find('.ppt-list-item').length;
            $('#' + id).slidable({
                context : '.widget-powerpoint',
                hasTitle       : 1,
                shortcut        : {
                    count               : cnt,
                    direction           : "vertical",
                    sliderContainer     : ".ppt-shortcut"
                },
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