/**
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-09-30 15:15:40
 * @version 1.0
 *
 * 
 * [widgetFactory for new feature that supports HTML codes loading and pre-defined widget replacing]
 * @param  {[Object]} $ [window referrence]
 * @param  {[Object]} $ [jQuery operator]
 * @return {[void]}   [description]
 */
;
(function(rootWin, doc, $) {
    var
        widgetIndicatorCache = {}; // 用于缓存原始的元素dom结构

    function WidgetFactory() {
        return new _WidgetFactory().init(arguments);
    };

    var defaults = {
        WIDGET_INDECATOR: '.tag-indicator', // a container that will be used to embed a well choosen widget
        WIDGET_COLLECTOR_CONTAINER_PREFIX: '#widget-tab-container-',
        WIDGET_COLLECTOR_TAB_PREFIX: '#widget-tab-',
        WIDGET_COLLECTOR_CTS_PREFIX: '#widget-cts-',
        WIDGET_COLLECTOR_INIT: getSingleton,
        WIDGET_COLLECTOR: null,
        CLASSICFIED_WIDGET_ARRAY: 'home;list;cont'.split(';')
    };


    /**
     * [getSingleton 抓取相应dom中的数据，建立一个分类部件的字典]
     * @param  {Function} fn [抓取函数]
     * @return {[type]}      [良好分类的部件]
     */
    var getSingleton = function(fn) {
        var cache;
        return function() {
            return cache || (cache = fn.apply(this, arguments));
        };
    };


    /**
     * [description]
     * @param  {[type]} ){	} [collect widget fn]
     * @return {[type]}        [widget collection that has been well classified]
     */
    var classifyWidgetCollection = getSingleton(function() {
        var collection = {};

        $.each('home;list;cont'.split(';'), function(index, widgetType) {

            var $tab = $(defaults.WIDGET_COLLECTOR_TAB_PREFIX + widgetType),
                $tabItems = $tab.find('.widget-items-tab>.widget-item-radio'),
                $cts = $(defaults.WIDGET_COLLECTOR_CTS_PREFIX + widgetType),
                $widgetContents = $cts.find('.widget-content'),
                subType = {};

            $tabItems.each(function(i) {
                var specItems = [],
                    type = $(this).find('small').text();

                $widgetContents.eq(i).find('.widget-list>.widget-list-item').each(function(j, item) {
                    var itemJson,
                        itemATag = $(this).find('a'),
                        itemImgTag = itemATag.find('img'),
                        itemName = itemATag.attr('alt'),
                        itemUrl = $(this).attr('data-widget'),
                        itemImgUrl = itemImgTag.attr('src');

                    itemJson = {
                        name: itemName,
                        url: itemUrl,
                        img: itemImgUrl,
                        pos: widgetType + ";" + type
                    };

                    specItems.push(itemJson);
                });

                subType[type] = specItems;
                specItems = null;
            });

            collection[widgetType] = subType;
        });

        return collection;
    });


    function _WidgetFactory() {
        var self = this;
        this.rawWidgets = classifyWidgetCollection();
        this.$modal = $('#configModal', rootWin.document);
        this.$modalBody = $('#configModal', rootWin.document).find('.modal-body');
        this.instance = null;
        this.cacheWidgets = {}; // Mapping: url -> htmlCode

        return {
            init: function(options) {
                var opt = $.extend({}, defaults, options || {});

                return this;
            },
            resetWidgetIndicator: function($dom) {
                $dom.replaceWith(widgetIndicatorCache[$dom.attr('id')]);
            },
            // allow users to choose a system-defined widget
            create: function() {
                var rawWidgets = self.rawWidgets,
                    $modal = self.$modal,
                    $modalBody = self.$modalBody,
                    instance = self.instance,
                    cache,
                    shopHTML,
                    genNavMenuHtml = function() {
                        var keys2Chinese = {
                                'home': '首页部件',
                                'list': '列表页部件',
                                'cont': '内容页部件'
                            },
                            first = true,
                            html = '';

                        html += '<ul id="nav4widget" class="nav nav-pills">';
                        for (var widgetPos in rawWidgets) {
                            var className = first ? 'active' : '';
                            first = false;
                            html += '<li role="presentation" data-widget-pos="' + widgetPos + '" class="' + className + '"><a href="#">' + keys2Chinese[widgetPos] + '</a></li>';
                        }
                        html += '</ul>';

                        return html;
                    },
                    genWidgetStaticHtml = function() {
                        var html = '',
                            index = 0;

                        html += '<div class="pull-left text-right" style="width:130px;">';
                        // header types
                        html += '<ul class="nav nav-pills nav-stacked">';
                        $.each(rawWidgets, function(idx, items) {
                            var widgetPosArray = ['home', 'list', 'cont'];
                            for (var subTypeKey in items) {
                                var wp = widgetPosArray[index];
                                wp += ';' + subTypeKey;
                                html += '<li data-widget-pos="' + wp + '"><a href="#">' + subTypeKey + ' <span class="badge">' + items[subTypeKey].length + '</span></a></li>';
                            }
                            ++index;
                        })

                        html += '</ul>';
                        html += '</div>'; // col-md-2

                        html += '<div class="pull-left" style="width:370px;">';
                        $.each(rawWidgets, function(i, posWidget) {
                            $.each(posWidget, function(j, itemArray) {
                                //html += '<div class="col-xs-3">';
                                $.each(itemArray, function(k, item) {
                                    html += '<div data-url="' + item['url'] + '" data-widget-pos="' + item['pos'] + '" class="widget-item pull-left text-center">';

                                    html += '<div class="widget-item-img">';
                                    html += '<img width="88" height="60" class="img-abs-bot" src="' + item['img'] + '" title="' + item['name'] + '"/>';
                                    html += '</div>';

                                    html += '</div>';
                                });

                                //html += '</div>';
                            });
                        });


                        return html;
                    };

                return self.instance = {
                    constructWidgetShop: function() {
                        if (shopHTML) return shopHTML;

                        var navMenuHtml = genNavMenuHtml(),
                            widgetStaticHtml = genWidgetStaticHtml(),
                            html = '';


                        html += '<div class="col-xs-5 col-md-4">';
                        /* nav part */

                        html += '<div class="row">';
                        html += navMenuHtml;
                        html += '</div>';

                        /* widget part */
                        html += '<div class="row">';
                        html += widgetStaticHtml;
                        html += '</div>';

                        html += '</div>';

                        return shopHTML = html;
                    },
                    displayRawWidgets: function($srcEl) {
                        $modalBody.html(self.instance.constructWidgetShop());
                        $modal.modal('show');
                        self.instance.bindWidgetEvents($srcEl);
                    },
                    bindWidgetEvents: function($srcEl) {
                        var that = this,
                            posNavItems = $('#nav4widget', rootWin.document).find('li'),
                            subTypeNav = $modalBody.find('.nav-stacked').children('li'),
                            widgets = $modalBody.find('.widget-item');

                        posNavItems.on('click', function() {
                            var currentPos = $(this).attr('data-widget-pos');

                            $(this).addClass('active').siblings().removeClass('active');
                            if (subTypeNav.length) {
                                subTypeNav.each(function() {
                                    var widgetPos = $(this).attr('data-widget-pos');
                                    widgetPos = widgetPos.split(';')[0];
                                    if (widgetPos === currentPos) {
                                        $(this).show();
                                    } else {
                                        $(this).hide();
                                    }
                                });

                                var $first = $modalBody
                                    .find('.nav-stacked')
                                    .children('li')
                                    .filter(':visible').first();
                                if ($first.length) {
                                    $first.trigger('click');
                                }
                            }
                        });

                        // triggerred after the modal has been shown
                        setTimeout(function() {
                            posNavItems.first().trigger('click');
                            //  console.log($modal);
                            //  console.log($modal.find('.btn-primary').length);
                            //  $modal.on('click', '.btn-primary', function (){
                            // 	fnConfirmWidgetSelection();
                            // });

                        }, 200);

                        if (subTypeNav.length) {
                            subTypeNav.on('click', function(ev) {
                                var currentSubType = $(this).attr('data-widget-pos');
                                widgets.each(function() {
                                    if ($(this).attr('data-widget-pos') === currentSubType) {
                                        $(this).show();
                                    } else {
                                        $(this).hide();
                                    }
                                });
                                $(this).addClass('active').siblings().removeClass('active');
                            });
                        }

                        if (widgets.length) {
                            widgets.on('click', function() {
                                if (!$(this).hasClass('widget-selected')) {
                                	$(this).addClass('widget-selected')
		                                    .siblings()
		                                    .removeClass('widget-selected');
                                } else {
                                	fnConfirmWidgetSelection();
                                }
                            });

                            var fnConfirmWidgetSelection = function(){
                            	var $widget = widgets.filter(function() {
                                    return $(this).hasClass('widget-selected');
                                });


                                if ($widget.length) {
                                    var data = $widget.attr('data-url'),
                                        params = $.parseJSON(unescape(data)),
                                        ajaxObject = that.requestWidget(params),
                                        fnCallback = function() {
                                            var newWidget = self.cacheWidgets[params.filename];
                                            // build setting panel and inject css/js
                                            // only inject css for now

                                            that.injectWidgetCSSJS(newWidget);
                                            // $modalBody.html(newWidget.html);
                                            var $destEl = $(newWidget.html);
                                            var $el = that.embedWidget($srcEl, $destEl);

                                            that.initializeWidget($destEl);

                                            $modal.modal('hide');
                                        };

                                    if ($.isFunction(ajaxObject.done)) {
                                        ajaxObject.done(fnCallback);
                                    } else {
                                        fnCallback();
                                    }

                                }
                            };
                        }
                    },
                    injectWidgetCSSJS: function(json) {
                        var css = json.css;
                        if (css) {
                            var cssArray = css.split(';'),
                                existedCss = $('#main-wrapper').find('link');

                            $.each(cssArray, function(i, href) {
                                var flag = true;
                                $.each(existedCss, function(j, linkEl) {
                                    if (linkEl && $(linkEl).prop('outerHTML').indexOf(href) >= 0) {
                                        flag = false;
                                    }
                                });

                                if (flag) {
                                    $style = $('<link>').attr({
                                        rel: "stylesheet",
                                        type: "text/css",
                                        href: href
                                    });
                                    $('#main-wrapper').prepend($style);
                                }
                            });
                        }
                    },
                    requestWidget: function(params) {

                        if (self.cacheWidgets[params.filename]) {
                            return self.cacheWidgets[params.filename];
                        }

                        var attributes = jsonToString(params);

                        attributes = StringUtil.Base64Encode(attributes);

                        return $.ajax({
                            type: 'GET',
                            url: params.filename + '&t=' + Math.random(),
                            data: {
                                params: attributes
                            },
                            dataType: 'json',
                            success: function(json) {
                                self.cacheWidgets[params.filename] = json;
                            },
                            error: function(err) {
                                console.log(err);
                            }
                        });
                    },
                    confirmWidgetSettings: function() {

                    },
                    // embed a widget instance and replace the indicator
                    embedWidget: function($sourceElement, $targetElement) {
                        // generate widget UUID and replace the widget dom
                        var uuid = generatorId(10, 16, 'widget', 'static');
                        widgetIndicatorCache[uuid] = $sourceElement.prop('outerHTML');

                        return $sourceElement.html($targetElement);

                    },
                    initializeWidget: function($dom) {
                        // init potential widget events
                        try {
                            WEProxy.scan($dom);
                        } catch (e) {
                            console.error(e);
                        }

                    },
                    dataBinding: function() {
                        // write cache data to the widget, in case of later usage
                    }
                };
            }
        };
    };

    rootWin.WidgetFactory = WidgetFactory;
    rootWin._WidgetFactory = _WidgetFactory;
})(window, document, jQuery);
