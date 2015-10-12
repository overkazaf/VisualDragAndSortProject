(function ($){
    $('.multi-nav').each(function (){
        var parentUl = $(this).children('ul.navlist[data-level=0]');
        var parentAl =  parentUl.children('li.navlist-item');
        parentAl.each(function (){
            var aNavList = $(this).children('ul.navlist[data-level=1]');
            aNavList.hide();
            aNavList.each(function (){
                var aSecondaryNavList = $(this).children();
                aSecondaryNavList.on('mouseover', function (){
                    $(this).siblings().removeClass('active');
                    $(this).addClass('active');
                });

                aSecondaryNavList.each(function (){
                    $(this).on('click', function (){
                        $(this).closest('ul.navlist[data-level=1]').hide();
                    })
                });
            });
        });
        
        parentAl.on('mouseover', function (){
            $(this).siblings().removeClass('active').children('ul.navlist').hide();
            $(this).addClass('active').children('ul.navlist').show();
        });
    });

    // vertical nav
    $('.nav-vert').each(function (){
        var $dom = $(this);
        var parentUl = $dom.children('ul.navlist');
        var parentAl = parentUl.children('li.navlist-item');
        $dom.find('.menu-content').hide();
        parentUl.on('mouseover', 'li', function (){
          var index = $(this).index();
          var menuContents = $dom.find('.menu-content');
          $(this).addClass('active').siblings().removeClass('active');
          menuContents.hide();
          menuContents.eq(index).show();
        });
    });
    $(document).on('click', function(){
        $('.menu-content').hide();
        $('.navlist[data-level="1"]').hide();
        $('.active').removeClass('active');
    });

    $('.menu-content').hide();
    $('.navlist[data-level="1"]').hide();
    $('.active').removeClass('active');
})(jQuery);