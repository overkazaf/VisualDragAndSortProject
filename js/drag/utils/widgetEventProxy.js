/**
 *	This module must be embeded after jQuery, smartMenu and smartMenu-ext
 * 
 * [WEP this widget event proxy is used as a scanner]
 * @type {Object}
 */
var WEProxy = {
    scan: function($dom) {
        if (!$dom.attr('operable')) return;
        if (typeof menuData !== 'undefined') $dom.smartMenu(menuData);
        $dom.addClass('widgetHighLight');

        WEP_PREVENTOR($dom);
        WEP_PREDICTOR($dom);

        $dom.find('*[operable]').each(function(){
        	$(this).smartMenu(menuData);
        });
    },
    fetchType: function($dom) {
        for (var type in WEPStrategies) {
            if ($dom.hasClass(type)) {
                return type;
            }
        }
    }
};

/**
 * [WEP_PREDICTOR predict which strategy fn should be called on this dom element]
 * @param {[type]} $dom [description]
 */
var WEP_PREDICTOR = function($dom) {
    var fn = $dom.attr('operable') === 'navbar-list' ?
        WEPStrategies[$dom.attr('operable')] :
        WEPStrategies[WEProxy.fetchType($dom)];

    if ($.isFunction(fn)) {
    	fn.call($dom, $dom);
    }
};


var WEP_PREVENTOR = function ($dom){
	$dom.find('a').each(function (){
		$(this).on('click', function (ev){
			ev.preventDefault();
			return false;
		});
	});
};

/**
 * [WEPStrategies specific strategy for dom]
 * @type {Object}
 */
var WEPStrategies = {
    'navbar-list': function($dom) {
        if ($dom.hasClass('nav-vert')) {
            // stacked navigation
            var parentUl = $dom.children('ul.navlist');
            var parentAl = parentUl.children('li.navlist-item');

            parentUl.on('mouseover', 'li', function() {
                var index = $(this).index();
                $(this).addClass('active').siblings().removeClass('active');
                $dom.find('.menu-content').hide();
                $dom.find('.menu-content').eq(index).show();
            });

        } else {
            var parentUl = $dom.children('ul.navlist[data-level=0]');
            var parentAl = parentUl.children('li.navlist-item');

            parentAl.each(function() {
                $(this).children('ul.navlist').hide();
            });

            parentUl.on('mouseover', 'li', function() {
                $(this).siblings().removeClass('active').children('ul.navlist').hide();;
                $(this).addClass('active').children('ul.navlist').show();
            });
        }
    },
    'topic-slider': function($dom) {
        var oTopicList = $dom.find('ul.topic-list'),
            aTopicListItem = oTopicList.children('li'),
            oBtnList = $dom.find('ul.btn-list'),
            aBtnListItem = oBtnList.find('li.btn-list-item');

        aBtnListItem.on('mouseover', function() {
            var idx = $(this).index();
            aBtnListItem.removeClass('active');
            $(this).addClass('active');
            aTopicListItem.css({
                'z-index': -1
            });
            aTopicListItem.eq(idx).css({
                'z-index': 0
            });
        });


        $dom.find('*[operable]').each(function() {
            $(this).addClass('widgetHighLight');
            $(this).smartMenu(menuData);
        });
    },
    'navbox': function($dom) {
        $dom.on('mouseover', '.subNav', function() {
            var index = $(this).index();
            $(this).addClass('currentDd currentDt').siblings().removeClass('currentDd currentDt');
            if ($(this).next().is(':visible') == 'true') {} else {
                $(this).next().siblings().filter(function() {
                    return $(this).hasClass('navContent');
                }).hide();
                $(this).next().show('slow');
            }
        });
    },
    'multi-panel': function($dom) {
        var aPanel = $dom.find('.widget-panel');

        aPanel.each(function(idx) {
            var widgetId = generatorId(10, null, null, 'Generated');
            $(this).attr('id', widgetId).attr('data-widget-id', widgetId);
        });

        var tabList = $dom.find('.tab-list');
        tabList.on('mouseover', '.tab-list-item', function() {
            var index = $(this).index();
            $(this).addClass('active').siblings().removeClass('active');
            $dom.find('.widget-panel').hide().eq(index).show()
        });

        $dom.find('.tab-list-item').first().trigger('mouseover');
    },
    'widget-chunk': function($dom) {
        var aWidgets = $dom.find('div[class*=widget]');

        aWidgets.each(function(idx) {
            var widgetId = generatorId(10, null, null, 'Generated');
            $(this).attr('id', widgetId).attr('data-widget-id', widgetId);
        });


        // fix multiple site-list item
        var aSList = $dom.find('a[operable="site-list"]');
        aSList.each(function() {
            var widgetId = generatorId(10, null, null, 'Generated');
            $(this).attr('id', widgetId).attr('data-widget-id', widgetId);
        });
    },
    'choice-card': function($dom) {
        $('.tab-list', $dom).on('mouseover', '.tab-item', function() {
            var index = $(this).index();
            $(this).addClass('active').siblings().removeClass('active');
            $('.tab-content', $dom).hide().eq(index).show();
        });

        $('.tab-item', $dom).first().trigger('mouseover');
    }
};
