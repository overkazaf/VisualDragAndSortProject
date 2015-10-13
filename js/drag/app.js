/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 17:15:40
 * @version $Id$
 *
 * update logs : 
 * 		2015/10/09    new feature for special tagged html replacement
 */
	
	
	var HTMLCodeType;
	function CodePredictor (htmlJSON) {
		//console.log(CodePredictor.prototype.getHTMLCodeType(htmlJSON));
		return (HTMLCodeType = CodePredictor.prototype.getHTMLCodeType(htmlJSON)) === 'static' ?
			   new StaticCoder(htmlJSON) : 
			   new DraggedCoder(htmlJSON);
	}
	CodePredictor.prototype.isNullorEmpty = function (str){
		return str === null || (str && $.trim(str) === '');
	}
	CodePredictor.prototype.getHTMLCodeType = function (htmlJSON){
		// for testing
		var isNorE = CodePredictor.prototype.isNullorEmpty;
		if(isNorE(htmlJSON[0]) && isNorE(htmlJSON[1])) return 'dragged';
		if(!isNorE(htmlJSON[0]) && isNorE(htmlJSON[1])) return 'static';

		var type = 'dragged';
		$.each(htmlJSON, function (i, html){
			if (html 
				&& html.indexOf('class="tag-indicator') >= 0 
				|| $(html).find('.tag-indicator').length > 0) {
				type = 'static';
			}
		});
		return type;
	}

	function StaticCoder (htmlJSON){
		var code = htmlJSON[1];
		if (code === '' || $.trim(code) === '') {
			code = htmlJSON[0];
		}
		this.code = code;
	};

	StaticCoder.prototype.execute = function (){
		StaticCoder.prototype.embedTags(this.code);
		// alert(this.code);
		var callbacks = $.Callbacks('once');
			callbacks.add(initHeader);
  			callbacks.add(initMainWrapper);
  			// callbacks.add(initDragWidgets);
  			// callbacks.add(initDragLayouts);
  			callbacks.add(initWidgetFactory);
  			// callbacks.add(highlightListener);
  			callbacks.add(preloadCachedData);
  			callbacks.fire();
	};

	StaticCoder.prototype.embedTags = function (code){
		// tacle this case
		if(code && code.indexOf('main-wrapper') >= 0) {
			$('#main-wrapper').replaceWith(code);
		} else {
			$('#main-wrapper').html(code);
		}
		$('#main-wrapper').find('.tag-indicator').each(function(){
			var $this = $(this);
			
			$(this).on('click', function (){
				wfInstance.displayRawWidgets($this);
			});
		});
	};

	function DraggedCoder (htmlJSON) {
		this.code = htmlJSON[1];
	};
	DraggedCoder.prototype.embedTags = function (code){
		// tacle this case
		if(code && code.indexOf('main-wrapper') >= 0) {
			$('#main-wrapper').replaceWith(code);
		}

		$('#main-wrapper').find('.tag-indicator').each(function(){
			var $this = $(this);
			
			$(this).on('click', function (){
				wfInstance.displayRawWidgets($this);
			});
		});
	}

	DraggedCoder.prototype.execute = function (){
		DraggedCoder.prototype.embedTags(this.code);

		var callbacks = $.Callbacks('once');
			callbacks.add(initHeader);
			callbacks.add(initMainWrapper);
			callbacks.add(initDragWidgets);
			callbacks.add(initDragLayouts);
			callbacks.add(initWidgetFactory);
			callbacks.add(preloadCachedData);
			callbacks.add(highlightListener);
			callbacks.fire();
	};

	/**
	 * [loadHTMLCommand A command controller]
	 * @param  {[type]} instance [Code predictor instance]
	 * @return {[type]}          [description]
	 */
	function loadHTMLCommand (htmlJSON) {
		this.commands = [];
		this.instance = CodePredictor(htmlJSON);
	}

	/**
	 * [prototype prototype injection for loadHTMLCommand class]
	 * @type {Object}
	 */
	loadHTMLCommand.prototype = {
		constructor : loadHTMLCommand,
		execute : function (){
			this.instance.execute.call(this.instance);
		}
	}

	/**
	 * [initModules description]
	 * @param  {[Array]} json [Pass an Array inside, which allow user to judge it's a dragged/static code template]
	 * @return {[type]}       [description]
	 *
	 * update logs: 
	 * 		2015/10/09   change the input param
	 */
	var command;
	function initModules( htmlJSON ){
			command = new loadHTMLCommand(htmlJSON);
			command.execute();
	}
	
	var wFactory;  // widget factory instance
	var wfInstance;
	function initWidgetFactory(){
		wFactory = WidgetFactory();
		wfInstance = wFactory.create();
	}
	
	function highlightListener (){
		EventUtils.add(document, 'mousemove', highLightLayouts);
		EventUtils.add(document, 'mousemove', highLightWidgets);
	};

	function removeHighlightListener(){
		EventUtils.remove(document, 'mousemove', highLightLayouts);
		EventUtils.remove(document, 'mousemove', highLightWidgets);
	}

	function getInstance (fn){
		var div;
		return function (){
			return div || (div = fn.call(this));
		}
	}

	var createMask = function (){
		var oDiv = $('<div>').attr({
				'id' : 'globalMask'
			}).css({
				'display' : 'none',
				'position' : 'absolute',
				'left' : 0, 'top' : 0,
				'opacity' : 0.7,
				'background-color' : '#ccc',
				'width' : $(document).width() + 'px',
				'height' : $(document).height() + 'px'
			}).appendTo($('body'));
			return oDiv;
	};


	function initHeader(callback){
		var oHeader = $('.header');
		var oTool = oHeader.find('.tool-part');
		var oToolMenu = oTool.find('ul.tool-menu');
		var oToolMenuContainers = oTool.find("div.tool-container");

		initPublish();
		oToolMenu.on('click', 'li', function (index,value){
		    if ($(this).index() == 1) {
		        var cache = $(document).data('cachedWrapper');
		        if (cache){
		            // backto edit mode
		            $('.wrapper').replaceWith(cache);
		            //rebind functions
		            $('.wrapper').find('*[operable]').each(function (){
		                $(this).smartMenu(menuData);
		            });
		            var $cb = $.Callbacks();
		            $cb.add(resetDragWidgets);
		            $cb.add(initDragLayouts);
		            var fnClean = function (){
		                $('#dragged-list').dragsort('destroy');
	                    $('#dragged-list').dragsort();
	                    $(document).removeData('cachedWrapper');
		            };
		            $cb.add(fnClean);
		            $cb.fire();
		        }
		    }
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				$('.toggle-container').hide().animate({height : 0}, 'slow', 'swing');
				//$(window).scrollTop(0);
				$('.wrapper').animate({
					'margin':'60px auto'
				}, 400, 'swing');
			} else {
				var index = $(this).index();
				$(this).addClass('selected').siblings().removeClass('selected');
				$('.toggle-container').show().animate({height : '160px'}, 'slow', 'swing');
				$('.wrapper').animate({
					'margin':'260px auto'
				}, 500);
				oToolMenuContainers.hide().eq(index).fadeIn('slow');
			}
			
			
		});
		//oToolMenuItems.eq(0).trigger('click');
		oToolMenuContainers.hide();
		$('.toggle-container').hide().animate({height : 0});
		$('.wrapper').animate({'margin':'100px auto'},400);
		

		var callbacks = $.Callbacks();
		// Init Layout Element
		callbacks.add(initLayout);
		// Init radio btns
		callbacks.add(initWidgetRadioButton);
		// Init Theme Elemnet
		callbacks.add(initTheme);
		// Init Background Menu
		callbacks.add(initBackground);
		// Enable modal draggable
		callbacks.add(function(){
		    $('#configModal').dragModal();
		});
		// Enable tool part to be slidable
		callbacks.add(initSlider);
		callbacks.fire();
		
		if (callback && $.isFunction(callback)) {
		    callback();
		}
	}

	/**
     * [initSlider description]
     * @return {[type]} [description]
     *
     * comment : 
     *          Use slider to prevent conetent overflow
     */
	function initSlider(){
        $.each(['home', 'list', 'cont'], function (i, subfix){
        	var aLi = $('#widget-tab-' + subfix).find('ul.widget-items-tab').children('li');
		    var l = aLi.length;
	        if (l) {
				var bigW = +$(window).width();
					bigW = (bigW-50) >= 980 ? (bigW-50) : 980;
	            $('#widget-tab-container-' + subfix).css('width', bigW + 'px');
				$('#widget-tab-' + subfix).css('width', bigW + 'px');
	            
	            aLi.each(function (){
	                $(this).css({
	                    width: bigW / 10 + 'px'
	                });
	            });
	            var opt1 = {
	                'slider'       : '#widget-tab-' + subfix,
	                movedItemClass : '.widget-items-tab',
	                previousButton : 'a.prev',
	                nextButton     : 'a.next',
	                hasSmallButton : !1,
	                "width"        : bigW,
	                itemsPerPage   : 10
	            };
	            
	            $("#widget-tab-" + subfix).johnSlidable(opt1);
	        }
        });
        
	    $(".widget-content-slider").each(function (index){
	        var opt2 = {
                "slider" : ".widget-content-slider:eq(" + index +")",
                "movedItemClass" : 'ul.widget-list',
                "previousButton" : 'a.prev',
                "nextButton"     : 'a.next',
                "width"          : 980,
                hasSmallButton : !1,
                itemsPerPage   : 980/98
	        };
	        $(this).johnSlidable(opt2);
	    });
	    
	    var opt3 = {
            "slider" : ".theme-content-slider",
            "movedItemClass" : 'ul.theme-list',
            "previousButton" : 'a.prev',
            "nextButton"     : 'a.next',
            "width"          : 980,
            hasSmallButton   : !1,
            itemsPerPage     : 5
        };
	    $(".theme-content-slider").johnSlidable(opt3);
	}
	
	/**
	 * [initLayout description]
	 * @return {[type]} [description]
	 *
	 * comment : 
	 * 			Binding click events in layout part
	 */
	function initLayout(){
		//init layout events
//		var layoutList = $('.header').find('ul.layout-list');
//		layoutList.find('li').each(function (){
//		    $(this).on('click', function (){
//	            var template = $(this).attr('data-layout-template');
//	            var html = buildDraggableLayout(template);
//
//	            var oDrag = $('<li class="drag-part" data-source-code="layout"></li>');
//	            var $dom = $(html);
//	            var layoutId = generatorId(null, null, 'Layout', 'Generated');
//	            $dom.attr('id', layoutId).attr('data-layout-id', layoutId);
//	            oDrag.append($dom);
//	            //oDrag.smartMenu(menuData);
//	            $('#dragged-list').append(oDrag);
//	            oDrag.find('*[operable]').smartMenu(menuData);
//	            oDrag.find('*[data-type=layout-template]').smartMenu(menuData);
//	        });
//		});
	}

	function initTheme(){
		var themeList = $('.theme-list');

		//Theme items use event delegation
		if (themeList.length) {
			themeList.on('click', 'li', function (){
			    // Append a status flag to themeList
	            if (!$(document).data('cachedWrapper')){
	                $(document).data('cachedWrapper', $('.wrapper').clone());
	            }
			    var url = $(this).data('theme-template');
			    var themeType = url.indexOf("isModel=1") >= 0 ? 'code' : 'drag';
				$.ajax({
				    cache : false,
				    async : true,
				    url : url,
				    type : "GET",
				    dataType : "html",
				    success : function (data){
				        var oWrapper = $('#main-wrapper');
				    	$('#dragged-list').dragsort('destroy');
				    	oWrapper.empty().html(data);
				    	oWrapper.find('.layout-template').each(function (){
		                    $(this).smartMenu(menuData);
		                });
				    	oWrapper.find('*[operable]').each(function (){
		                    $(this).smartMenu(menuData);
		                });
		                $('#dragged-list').dragsort();
		                resetDragWidgets();
				    }
				});
			});
		}

		//This will get all the generated themes that have already been published
	}

	function initBackground () {
	    $('#rgb_diy').ColorPicker({
            onSubmit : function(hsb, hex, rgb, el) {
                $(el).val(hex);
                $(el).ColorPickerHide();
            },
            onBeforeShow : function() {
                $(this).ColorPickerSetColor(this.value);
            }
        }).on('keyup', function() {
            $(this).ColorPickerSetColor(this.value);
        });
	    
	    if ($("#bgUpload").length) {
	        try{
	            $("#bgUpload").uploadify('destroy');
	        }catch(e){};
	    }
	    
        $("#bgUpload").uploadify({
            height          : 30,
            width           : 200,
            buttonText      :'<div class="row-fluid"><button class="btn btn-block btn-primary">选择图片</button></div>',
            swf             : ctxUrl+'/cmskj/js/uploadify/uploadify.swf',
            uploader        : ctxUrl+'/attachmentController/uploadReturnUrl.do?type=1',
            'removeCompleted' : false,
            'onUploadSuccess' : function(file, data, response) {
                //alert('The file ' + file.name + ' was successfully uploaded with a response of ' + response + ':' + data);
                var res = $.parseJSON(data);
                if (res.success === true) {
                    $('#bg-url').val(res.url);
                }
            }
        });
        
        $('#clearBg').on('click', function (){
        	var bgi = '';
        	$('#bg-url').val('');
        	$('.wrapper').css("background-image", "url(/" + bgi + ")");
        });
        
        $('.dropdown-menu').on('click', 'li' ,function (){
           var txt = $(this).children('a').text();
           //var type = $(this).attr('data-type');
           var btn = $(this).closest('.btn-group').children('button');
           //btn.attr('data-type', type);
           //log(btn.html(txt + "  <span class='caret'></span>"));
           //.text(txt);
        });

        // init cached width 
         var ctx = $('.tool-container').filter('.background-container');
         var bgw = ctx.find('input').eq(1);
         var backgroundWidth = $('.wrapper').attr('data-cached-width');
         if (backgroundWidth) {
         	bgw.val(backgroundWidth);
         	globalWidth = backgroundWidth;
         	$('.wrapper').css(backgroundWidth);
         }
        $('#confirm-bg-btn').on('click', function (){
            var oWrapper = $('.wrapper');
            var ctx = $('.tool-container').filter('.background-container');
            
            var a = [];
            var aInps = ctx.find('input');
            aInps.each(function (){
                var val = $(this).val();
                a.push(val);
            });
            var bgc = a[0],
                bgw = a[1],
                bgi = a[2],
                position_x = a[3],
                position_y = a[4];
            bgi = $('#bg-url').val();
            var oRepeat = ctx.find('button.dropdown-toggle');
            var m = $.trim($(oRepeat).text());
            var repeat = 'no-repeat';
            if (m !== '') {
                if (m === 'Y-重复') {
                    repeat = 'repeat-y';
                } else if (m === 'X-重复') {
                    repeat = 'repeat-x';
                } else if (m === '重复') {
                    repeat = 'repeat';
                } else if (m === '不重复') {
                    repeat = 'no-repeat';
                }
            }
            
            bgc != '' && oWrapper.css("background-color", (bgc == 'transparent' ? bgc : '#'+bgc));
            
            if(bgw){
                var oW = oWrapper.width();
                var testWidth;

                if (bgw.indexOf('%') >= 0) {
                	testWidth = (parseInt(bgw) / 100)*oW;
                } else if (bgw.indexOf('px') >= 0) {
                	testWidth = parseInt(bgw);
                } else {
                	testWidth = parseInt(bgw);
                }


                if (testWidth < 680) {
                    alert('默认布局最小宽度为680px,请重新设置比例');
                    aInps[1].value = '100%';
                    aInps[1].focus();
                } else if (testWidth > 1920){
                    alert('默认布局最大宽度为1920px,请重新设置比例');
                    aInps[1].value = '100%';
                    aInps[1].focus();
                } else {
                    oWrapper.css("width", bgw);
                    globalWidth = bgw;
                }
            }
            
            if (bgi) {
                oWrapper.css("background-image", "url(/" + bgi + ")");
                if (position_x && position_y) {
                    oWrapper.css("background-position", position_x + " " + position_y);
                }
                oWrapper.css("background-repeat", repeat);
            }
            
        });
    }
	
	function initWrapperDraggable(){
		var oWrapper = $('.wrapper');
		var aOperable = oWrapper.find('*[operable]');
		aOperable.each(function (){
			var operType = $(this).attr('operable');
			if (operType) {
			    if (operType.indexOf('layout') >= 0) {
	                $(this).smartMenu(menuData);
	            } else {
	                if (operType.indexOf('text,href') >= 0) {
	                    $(this).smartMenu(menuData);
	                } else if($(this).attr('id') && operType == 'navbar-list'){
	                    $(this).smartMenu(menuData);
	                    $(this).find('*[operable]').each(function (){
                            $(this).smartMenu(menuData);
                        });
	                    var parentUl = $(this).children('ul.navlist');
	                    var aLi = parentUl.children('.navlist-item');
	                    aLi.smartMenu(menuData);
	                }
	            }
			}
		});
		
		var aDraggableWidgets = $('.wrapper').find('div[class^=widget]');
		aDraggableWidgets.each(function (){
		    $(this).johnDraggable(draggableData);
		});
	}

	window.widgetCachedData = {};
	window.layoutCachedData = {};
	window.globalWidth = '';
	function preloadCachedData () {
		var oWrapper = $('#main-wrapper');
		// for width
		//widgets
		oWrapper.find('div[class*=widget-]').each(function (){
			var _this = $(this);
			if (_this.attr('data-cache')) {
				var cache = _this.attr('data-cache'),
				    cachedObj = $.parseJSON(cache),
					widget = cachedObj['id'];
				widgetCachedData[widget] = cachedObj['data'];
			}
		});

		//layouts
		oWrapper.find('div[class*=layout-container]').each(function (){
			var _this = $(this);
			if (_this.attr('data-cache')) {
				var cache = _this.attr('data-cache'),
				    cachedObj = $.parseJSON(cache),
					layout = cachedObj['id'];
				layoutCachedData[layout] = cachedObj['data'];
			}
		});
	}
	

	


	function doPublish(originHTML){
	    alert('发布成功');
	    $('#dragged-list').dragsort("destroy");
	    var returnValue = [];
	    
	    var oMainWrapper = $('#main-wrapper');
	    var oWrapper = oMainWrapper.css({
	    	'position' : 'relative',
            'margin' : "0 auto",
            'height' : '1000px',
            'min-height' : '200px',
            'background-size' : '100% 100%',
            'background-image' : oMainWrapper.css('backgroundImage')
        });

        var tarHTML,
        	styleSheets = '',
        	appendScripts,
        	tick = generatePreviewHTML(originHTML),
        	targetHTML = oWrapper.html(tick).prop('outerHTML');

	    if (HTMLCodeType === 'dragged') {
	    	oWrapper.find('.widgetHighLight').length && oWrapper.find('.widgetHighLight').removeClass('widgetHighLight');
		    oWrapper.find('.highlight').length && oWrapper.find('.highlight').removeClass('highlight');
	    } 

	    tarHTML = targetHTML ? targetHTML : '';

	    styleSheets += '<link href="'+absUrl + '/cmskj/css/drag/css/' + 'layoutBuilder.css" type="text/css" rel="stylesheet">';
		styleSheets += '<link href="'+absUrl + '/cmskj/css/drag/css/' + 'ftlTransformer.css" type="text/css" rel="stylesheet">';
		// styleSheets += '<link href="'+absUrl + '/cmskj/css/drag/css/' + 'bootstrap.min.css" type="text/css" rel="stylesheet">';
	    appendScripts = constructAppenddedScripts();

	    targetHTML = '<!DOCTYPE html><html><head><meta charset="utf-8">'+ styleSheets +'</head><body>' + tarHTML + '</body>'+appendScripts+'</html>';

        returnValue.push(encodeURI(targetHTML));
        returnValue.push(encodeURI($('#ftlName').val()));
        returnValue.push(encodeURI(originHTML));

        top.setPublishVal(returnValue);
        
		top.designModelObj.close();
	}

	/**
	 * [constructAppenddedScripts Check the status bit and return witch script should be loaded, base on their priorities]
	 * @return {[String]} [script tags]
	 */
	function constructAppenddedScripts () {
		var scripts = '';

		if (hasJQ) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/jquery-1.11.1.min.js" ><\/script>';
        }
        
        if (hasMultiNav) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/multiNav.js" ><\/script>';
        }

		if (hasMultiPanel){
			scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/multiPanel.js" ><\/script>';
		}
        
        if (jsInjected) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/injectedJS.js" ><\/script>';
        }
        
        if (hasMarquee) {
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/jquery-marquee.js" ><\/script>';
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/marquee.js" ><\/script>';
        }

        if (hasTab) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/tab.js" ><\/script>';
        }

        if (hasDropdown) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/dropdown.js" ><\/script>';
        }

        if (hasShowtime) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/showtime.js" ><\/script>';
        }

        if (hasWeather) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/weather.js" ><\/script>';
        }

        if (hasBotPPT) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/jquery.cycle.all.min.js" ><\/script>';
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/slide_bot.js" ><\/script>';
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/botppt.js" ><\/script>';
        }

        if (hasEasySlides) {
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/responsiveslides.min.js" ><\/script>';
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/easyslides.js" ><\/script>';
        }

        if (hasSlideTop) {
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/jquery.SuperSlide.2.1.1.js" ><\/script>';
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/slidetop.js" ><\/script>';
        }

        if (hasSlideNormal) {
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/jquery.img_silder.js" ><\/script>';
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/slidenormal.js" ><\/script>';
        }

        if (hasCountdown) {
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/countdown.js" ><\/script>';
        }

        if (hasScrollText) {
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/scrollText.js" ><\/script>';
        }

        if (hasScrollLeft) {
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/scrollLeft.js" ><\/script>';
        }

        if (hasPPT) {
        	if (hasShortcutPPT) {
                scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/jquery-multiSlider.js" ><\/script>';
                scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/sliderShortcutJS.js" ><\/script>';
            } else {
            	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/jquery-johnSlidable.js" ><\/script>';
            	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/sliderJS.js" ><\/script>';
            }
        }
        
        
        if (hasVOTE) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/js/jquery.form.js" ><\/script>';
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/voteJS.js" ><\/script>';
        }
        
        if (hasTPSlider) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/tpSlider.js" ><\/script>';
        }

        if (hasNavBox) {
            scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/navbox.js" ><\/script>';
        }

        if (hasHotList) {
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/hotlist.js" ><\/script>';
        	scripts += '<script type="text/javascript" src="' + absUrl + '/cmskj/js/drag/modules/initHotlist.js" ><\/script>';
        }
        
        return scripts;
	}

	/**
	 * [updateWidgetDependencies Update global vars which indicate the widget dependencies]
	 * @param  {[String]} d [A given attribute value]
	 * @return {[void]}   [Update global vars]
	 */
	function updateWidgetDependencies (d) {
		if(d.indexOf('hasjq') >= 0){
			hasJQ = true;
		}
		
		//  Case 4: will Append injected JS scripts at the bottom
		if(d.indexOf('multi-nav') >= 0){
            hasMultiNav = true;
        }

		if(d.indexOf('multi-panel') >= 0){
            hasMultiPanel = true;
        }
		
		if (d.indexOf('jsinjected') >= 0) {
		    jsInjected = true;
		}
		
		//  Case 5: mark the ppt flag
		if (d.indexOf('ppt') >= 0 && !(d.indexOf('bot_ppt') >= 0)) {
            hasPPT = true;
        }
		
		if (d.indexOf('multi-ppt') >= 0) {
            hasShortcutPPT = true;
        }
		
		if (d.indexOf('vote') >= 0){
            hasVOTE = true;
        }
		
		if (d.indexOf('tp-slider') >= 0) {
		    hasTPSlider = true;
		}

		if (d.indexOf('marquee') >= 0) {
            hasMarquee = true;
        }

        if (d.indexOf('tab') >= 0) {
            hasTab = true;
        }

        if (d.indexOf('dropdown') >= 0) {
            hasDropdown = true;
        }

        if (d.indexOf('showtime') >= 0) {
            hasShowtime = true;
        }

        if (d.indexOf('weather') >= 0) {
            hasWeather = true;
        }

        if (d.indexOf('bot_ppt') >= 0) {
            hasBotPPT = true;
        }

        if (d.indexOf('easyslides') >= 0) {
            hasEasySlides = true;
        }

        if (d.indexOf('slidetop') >= 0) {
        	hasSlideTop = true;
        }

        if (d.indexOf('slidenormal') >= 0) {
        	hasSlideNormal = true;
        }

        if (d.indexOf('countdown') >= 0) {
        	hasCountdown = true;
        }

        if (d.indexOf('scroll-v') >= 0) {
        	hasScrollText = true;
        }

        if (d.indexOf('scrollLeft') >= 0) {
        	hasScrollLeft = true;
        }

        if (d.indexOf('navbox') >= 0) {
        	hasNavBox = true;
        }
	}

	/**
	 * [cleanHTMLTags description]
	 * @param  {[type]}
	 * @return {[HTML string]} 
	 *
	 * comment : Replace '<' and '>' flag so can review source code in previous edit panel
	 */
	function cleanHTMLTags (html){
		while (html.indexOf('<') != -1){
			html = html.replace('<', '[[');
		}
		while (html.indexOf('>') != -1){
			html = html.replace('>', ']]');
		}
		return html;
	}

	/**
	 * [generatePreviewHTML description]
	 * @param  {[type]} html [description]
	 * @return {[type]}      [Return a preview HTML, need to packed and unpacked some codes]
	 */
	function generatePreviewHTML(html){
		var $dom = $(html);
		var extScripts = $dom.find('script');
		var extLinks = $dom.find('link');
		
		//======================================================================================
		//  There are some cases should be well handled
		//  
		//  Case 1: Prepend base.css file into the wrapper header
		//  Case 2: Flash plugins should do some reconstruction and resize jobs
		//  Case 3: Include jQuery library if needed
		//  Case 4: Append injected JS scripts at the bottom
		//  Case 5: Append slider JS scripts at the bottom
		//  Case 6: Wrap the img element when it has 'link' attribute in data-history config
		//  Case 7: Replace the 'contentShow' area of 'desc_ext' area
		//  Case 8: Replace the 'vote-body' area of vote template
		//=======================================================================================
		
	    //  Case 0: Prepend charset into the wrapper header
		//$('<meta charset="GB2312">').prependTo($dom);
		//  Case 1: Prepend base.css file into the wrapper header
		$('<link>',{
			type : "text/css",
			href : absUrl + "/cmskj/css/base.css"
		}).prependTo($dom);
		
		//  Case 2: Widget should do some reconstruction handles
		var aOperables = $dom.find('*[operable]');
		aOperables.each(function (){
			var o = $(this).attr('operable');
			var oArray = o.split(',');

			if (oArray.length == 1) {
				var operType = oArray[0];
				if (operType == 'flash') {
					var	iW = 200,
						iH = 80,
						sLink = '',
						flashId = '',
						flashHTML = '',
						configString = $(this).attr('data-history-config');


					if (configString) {
						var config = Utils.parseKV2Json(configString);
						for (var attr in config) {
							if (attr == 'width') {
								iW = config[attr];
							} else if (attr == 'height'){
								iH = config[attr];
							} else if (attr == 'link') {
								sLink = config[attr];
								var url = new String(sLink);
								flashId = url.substring(0, url.lastIndexOf('.'));
							}
						}
					}
					flashHTML += '<object width="' + iW + '" height="' + iH + '" type="application/x-shockwave-flash" ';
					flashHTML += 'data="/' + sLink + '" id="flash_' + flashId + '" style="visibility:visible;">';
					flashHTML += '<param name="movie" value="/'+ sLink +'" />';
					flashHTML += '<param name="allowScriptAccess" value="always" />';
					flashHTML += '<param name="wmode" value="transparent" />';
					flashHTML += '<param name="allowFullscreen" value="true" />';
					flashHTML += '<param name="quality" value="high" />';
					flashHTML += '</object>';
					$(this).replaceWith(flashHTML);
				} else if (operType == 'upload') {
					// For pictures
					var configString = $(this).attr('data-history-config');
					if (configString) {
						var config = Utils.parseKV2Json(configString);
						for (var attr in config) {
                            if (attr == 'width') {
                                iW = config[attr];
                            } else if (attr == 'height'){
                                iH = config[attr];
                            } else if (attr == 'link') {
                                sLink = config[attr];
                            }
                        }
						
						// Case 6: Wrap the img element when it has 'link' attribute in data-history config
						//wrapp the image with a link
						$(this).css({
						    'width' : iW + "!important;",
						    'height' : iH + "!importaint;"
						});
						if(sLink){
							var oldHtml = $(this).prop('outerHTML');
							var oA = '<a href="'+sLink+'" title="图片链接">' + oldHtml + '</a>';
							$(this).replaceWith(oA);
						}
					}
				}
			}
			
		});

		var aDependencies = $dom.find('*[data-widget-dependency]');
		aDependencies.each(function (){
			var d = $(this).data('widget-dependency').toLowerCase();
			//  Case 3: Include jQuery library if needed
			updateWidgetDependencies(d);
		});

		// update content-panel templates
		var tplCls = ['cont-tpl', 'cont-tpl1', 'cont-tpl2', 'cont-tpl3'];
		for (var i=0,l=tplCls.length; i<l; i++) {
			var contTplCls = tplCls[i];
			var aContTpls = $dom.find('.' + contTplCls);
			aContTpls.each(function () {
				var ftlJson = {
					type: contTplCls
				};
				var ftlDom = ftlTransformer(ftlJson);
				var contentDom = contentTransformer(ftlJson);
				updateDomByTemplate($(this), contentDom, ftlDom, ftlJson);
			});
		}
		
		var contentSource = $dom.find('*[desc_ext]'),
			smContentSource = $dom.find('*[sm_desc_ext]'),
			contentSourceArray = [],
			contentShowArray = [],
			smContentSourceArray = [],
			smContentShowArray = [];

		contentSource.each(function (){
			var content = $(this).attr('desc_ext');
			var ctShow = $(this).find('[desc=contentShow]');
			contentShowArray.push(ctShow.html());
			contentSourceArray.push(content);
			$(this).removeAttr('desc_ext');
		});

		smContentSource.each(function (){
			var content = $(this).attr('sm_desc_ext');
			var ctShow = $(this).find('[desc=smContentShow]');
			smContentShowArray.push(ctShow.html());
			smContentSourceArray.push(content);
			$(this).removeAttr('sm_desc_ext');
		});

		$dom.find('[desc="articleContent"]').html('${nr.msgAll.msgcontent}');
		$dom.find('[desc="articleTitle"]').html('${nr.msgAll.msgTitle}');



		// Construct a brand new template
		var aTemplates = $dom.find('.layout-template');
		aTemplates.each(function (){
			$(this).removeAttr('style')
			       .removeAttr('class')
			       .removeAttr('data-type');
			//destroy data info
			//$(this).removeAttr('data-*');
		});
		
		//  Case 7: Replace the 'contentShow' area of 'desc_ext' area
		$dom.find('[desc=contentShow]').each(function (index){
			var rep = contentSourceArray[index];
			if (rep) {
				rep = rep.replace(/^\S@([A-Z]+)\S|\S#([A-Z]+)\S/g, function(m){return m.toLowerCase();});
			}
			$(this).text(rep);
		    $(this).removeAttr('desc');
		});

		$dom.find('[desc=smContentShow]').each(function (index){
			var rep = smContentSourceArray[index];
			if (rep) {
				rep = rep.replace(/^\S@([A-Z]+)\S|\S#([A-Z]+)\S/g, function(m){return m.toLowerCase();});
			}
			$(this).text(rep);
		    $(this).removeAttr('desc');
		});
		
        //  Case 8: Replace the 'vote-body' area of vote template
		var aVotes = $dom.find('[operable=vote]');
		aVotes.each(function (){
//		    var vBody = $(this).find('.vote-body');
//		    var template = buildVoteTemplate(CACHE.VOTE);
//		    vBody.html(template);
		});
		
		
		var aOperables = $dom.find('*[operable]');
		aOperables.each(function (){
		    //.removeAttr('id')
            //.removeAttr('data-widget-id')  
		    $(this).removeAttr('data-layout-id')
		             .removeAttr('data-layout-param')
		             .removeAttr('data-history-config')
		             .removeAttr('operable');
		});

		// Need to do the clean job after tackle all the corner cases
		var aDecorates = $dom.find('.layout-decoration');
		aDecorates.each(function (){
			var aHL = $(this).find('.highlight'),
				aWHL = $(this).find('.widgetHighLight');
			if (aHL.length){
				aHL.removeClass('highlight');
			}
			
			if (aWHL.length){
				aWHL.removeClass('widgetHighLight');
			}

			var pt = $(this).css('padding-top');
			var pb = $(this).css('padding-bottom');
			var pl = $(this).css('padding-left');
			var pr = $(this).css('padding-right');
		    var string  = '';
		    	string += 'pt:' + pt + ';';
		    	string += 'pb:' + pb + ';';
		    	string += 'pl:' + pl + ';';
		    	string += 'pr:' + pr + ';';

		    var $lc = $(this).closest('.layout-container');

		    if ($lc.attr('data-layer') >= 1) {
		    	var level = $lc.attr('data-layer');
		    	if (level == 2) {
		    		pt = parseInt(pt) + 11;
		    	}
		    	//pl = parseInt(pl) + 11 * (+level);

		    	// 修复左边距
		    	// if ($lc.attr('data-layer') == 2 && $(this).hasClass('layout-cell')) {
		    	// 	var index = $(this).index();
		    	// 	var offset = +index * 11;
		    	// 	p1 = parseInt(pl) - offset;
		    	// }

		    	// 如果存在同级兄弟节点，并且位于布局上方
		    	// if ($lc.prev('.layout-container').length) {
		    	// 	var l = 1,
		    	// 		$prev = $lc.prev('.layout-container');

		    	// 		while ($prev.prev('.layout-container').length) {
		    	// 			l++;
		    	// 			$prev = $prev.prev('.layout-container');
		    	// 		}
		    	// 	pt = parseInt(pt) + 11 * l;
		    	// }
		    }

		    $(this).css({
	    		'border' : '0'
	    	});
		    //$(this).removeClass('layout-decoration');
		    
		    $(this).css({
		    	'padding-top' : pt,
		    	'padding-bottom' : pb,
		    	'padding-left' : pl,
		    	'padding-right' : pr
		    });
		});
		
		// Need to fix the extra margin spaces
		var aLayoutContainers = $dom.find('.layout-container');
		aLayoutContainers.each(function (){
			if ($(this).attr('data-layer') == 2) {
				$(this).css({
					margin : '10px 0 0 0'
				});
			} else {
				$(this).css({
					margin : 0,
					'border-radius' : 0
				});
			}
		});

		var aLayers = $dom.find('*[data-layer]');
		aLayers.each(function (){
		    $(this).removeAttr('data-layer').removeAttr('data-type');
		});

		var aCache = $dom.find('*[data-cache]');
		aCache.each(function (){
			$(this).removeAttr('data-cache');
		});


		var fragment = '';
		if (HTMLCodeType === 'dragged') {
			var aLi = $dom.find('li.drag-part');
			aLi.each(function (){
				var html = $(this).html();
				var oRow = '<div class="row">' + html + "</div>";
				fragment += oRow;
			});
		} else {
			var $cloneDom = $dom.clone();
			$cloneDom.find('script').remove()
					 .find('link').remove();
			fragment = $cloneDom.html();

			$cloneDom = null;
		}
		
		
		// Append extra refference library
		$.each(extLinks, function (){
            fragment += $(this).prop('outerHTML').toString();
        });
		$.each(extScripts, function (){
		    fragment += $(this).prop('outerHTML').toString();
		});
		
		var fixedWidth = globalWidth ? 'width : ' + globalWidth + ';' : 'width:1024px;';
		fixedWidth = fixedWidth.indexOf('px') >= 0 ? fixedWidth : (fixedWidth.indexOf('%') >= 0 ? fixedWidth : fixedWidth + 'px');
		fragment = '<div style="margin:0 auto;'+fixedWidth+'">'+fragment+'</div><div style="clear:both;"></div>';
		
		return fragment;
	}

	/**
	 * [initPublish Binding publish event to Publish Button]
	 * @return {[void]}
	 * 	
	 * comment: As the publish action will take 3 steps, so to devide and conquer it
	 */
	function initPublish(){
		$('#btn-publish').on('click', function (){
			var html = trimEmptyDivs();
			doPublish(html);
		});
	}

	function trimEmptyDivs () {
		var oWrapper = $('#main-wrapper');
		if(globalWidth){
			globalWidth = globalWidth.indexOf('px') >= 0 ? globalWidth : (globalWidth.indexOf('%') >= 0 ? globalWidth : globalWidth + 'px');
		    oWrapper.attr('data-cached-width', globalWidth);
		}
		oWrapper.find('div[data-emptydiv=true]').remove();
		oWrapper.find('.highlight').removeClass('highlight');
		oWrapper.find('.widgetHighLight').removeClass('widgetHighLight');
		return oWrapper.prop('outerHTML');
	}
	/**
	 * [initWidgetRadioButton description]
	 * @return {[type]}
	 *
	 * comment : Change widget's contents automatically when user click the radio buttons under widget menu
	 */
	function initWidgetRadioButton(){
		$.each(['home', 'list', 'cont'], function (i, cont){
			var oTab = $('.widget-items-tab', $('#widget-tab-' + cont));
			var oWidget = $('#widget-tab-container' + '-' + cont).parent();
			var aRadios = oTab.find('input[type=radio]');
			var aWidgetContents = oWidget.find('.widget-content');
			aWidgetContents.hide();
			aRadios.each(function (index){
			    $(this).on('click',function (){
		            aRadios.removeAttr('checked').eq(index).prop('checked', 'checked');
		            aWidgetContents.hide().eq(index).fadeIn();
		        });
			});
			if (aRadios.length) {
				aRadios.eq(0).trigger('click');
			} else {
				oWidget.closest('.tool-container').empty();
			}
		});
	}

	/**
	 * [renderConfigPanel description]
	 * @param  {[string]}
	 * @return {[type]}
	 *
	 * comment : 
	 */
	function renderConfigPanel(html){
		var oModal = $('#configModal');
		var oBody = oModal.find('.modal-body');
		var oFooter = oModal.find('.modal-footer');
		oBody.html(html['body']);
		if(html['footer']){
		    oFooter.html(html['footer']);
		    oFooter.find('.btn-primary').on('click',function (){
		    	$.isFunction(html['buttonFn']['fnOK']) && html['buttonFn']['fnOK']();
		    	highlightListener();
		    });
	        oFooter.find('.btn-default').on('click',function(){
	        	$.isFunction(html['buttonFn']['fnCancel']) && html['buttonFn']['fnCancel']();
	        	highlightListener();
	        });
		}
		
		// Has render event
		if (typeof html['onRenderReady'] != 'undefined') {
			if ($.isFunction(html['onRenderReady']))
				html['onRenderReady']();
			oBody.find('button.upload').on('click', html['buttonFn']['fnUpload']);
		}
		
		oModal.modal('show');
	}

	

	//This panel is shown for layout configuration

	function renderLayoutConfigPanel(html){
		var oModal = $('#configModal');
		var oBody = oModal.find('.modal-body');
		var oFooter = oModal.find('.modal-footer');
		oBody.html(html['body']);
		oFooter.html(html['footer']);
		
		if (typeof html['onRenderReady'] != 'undefined') {
		    if ($.isFunction(html['onRenderReady']))
                html['onRenderReady']();
		}
		oFooter.find('.btn-primary').on('click',function(){
			html['buttonFn']['fnOK']();
			highlightListener();
		});
		oFooter.find('.btn-default').on('click',function (){
			html['buttonFn']['fnCancel']();
			highlightListener();
		});
		
		oModal.modal('show');
	}

	/**
	 * [initMainWrapper description]
	 * @return {[type]} [description]
	 *
	 * comment : 
	 * 			After Ajaxing template from remote server, 
	 * 			init all the widget and layout events
	 */
	function initMainWrapper(callback){
		var draggedList = $('#dragged-list');
		draggedList.dragsort();
		
		/* highlight all widgets */
		var oWrapper = $('#main-wrapper');
		oWrapper.find('*[operable]').each(function (){
		    $(this).addClass('widgetHighlight');
		});
		
		$('.layout-container').smartMenu(menuData);
		$('#main-wrapper, .layout-container').find('*[operable]').each(function (){
		    $(this).smartMenu(menuData);
		});
		
		if (HTMLCodeType === 'dragged') {
			$('*[data-widget-id]').each(function (){
				if ($(this).attr('operable') && $(this).attr('operable') == 'panel') {
					if ($(this).closest('.widget-chunk').length === 0) {
						$(this).johnDraggable(draggableData);
					}
				} else {
					$(this).johnDraggable(draggableData);
				}
			});
		}

		var $navs = $('.widget-nav');
		$navs.each(function(){
			var $nav = $(this);
			$nav.johnDraggable(draggableData);
            var parentUl = $nav.children('ul.navlist');
            var parentAl = parentUl.children('li.navlist-item');
            

            if($nav.hasClass('nav-vert')){
                parentUl.on('mouseover', 'li', function (){
                  var index = $(this).index();
                  var menuContents = $nav.find('.menu-content');
                  $(this).addClass('active').siblings().removeClass('active');
                  menuContents.hide();
                  menuContents.eq(index).show();
                });
            } else {
	            parentAl.each(function (){
	                parentAl.smartMenu(menuData);
	            });
	            parentAl.on('mouseover', function (){
	                $(this).siblings().removeClass('active').children('ul.navlist').hide();;
	                $(this).addClass('active').children('ul.navlist').show();
	            });
            }
		});
        
        // topic slider
        var $tpSlider = $('.topic-slider');
        if ($tpSlider.length) {
            $tpSlider.each(function (){
                var $dom = $(this);
                var oTopicList = $dom.find('ul.topic-list'),
                    aTopicListItem = oTopicList.children('li'),
                    oBtnList = $dom.find('ul.btn-list'),
                    aBtnListItem = oBtnList.find('li.btn-list-item');
                
                aBtnListItem.on('mouseover', function (){
                    var idx = $(this).index();
                    aBtnListItem.removeClass('active');
                    $(this).addClass('active');
                    aTopicListItem.css({
                        'z-index' : -1
                    });
                    aTopicListItem.eq(idx).css({
                        'z-index' : 0
                    });
                });
                $dom.johnDraggable(draggableData);
            });
        };


		//multi panel
		$('.multi-panel').each(function (){
			var aLi = $(this).find('.tab-list-item');
			var _this_ = $(this);

			var panels = _this_.find('.widget-panel');
			$(this).on('mouseover', '.tab-list-item', function (){
				var index =  $(this).index();
				$(this).addClass('active').siblings().removeClass('active');
				panels.hide().eq(index).show();
			})
			aLi.first().trigger('mouseover');
		});

		$('.navbox').each(function (){
			var that = this;
			$(this).on('mouseover', '.subNav', function (){
			  var index = $(this).index();
			  $(this).addClass('currentDd currentDt').siblings().removeClass('currentDd currentDt');
			  if ($(this).next().is(':visible') == 'true') {
		      } else {
		      	$(this).next().siblings().filter(function (){
		      		return $(this).hasClass('navContent');
		      	}).hide();
		      	$(this).next().show('slow');
		      }
			});
		});
		
		
		$(document).on('click',function (e){
		    $.smartMenu.hide();
			$('.widgetHighLight').removeClass('widgetHighLight');
			$('.navlist[data-level="1"]').hide();
			$('.active').removeClass('active');
			$('.menu-content').hide();
			$('.active').removeClass('active');
		});
		$(window).on('scroll', function (){
			$.smartMenu.hide();
		});

		if(HTMLCodeType === 'dragged')
			initWrapperDraggable();

		if (callback && $.isFunction(callback)) {
		    callback();
        }
	}

	/*
	*
	*	This allows user to drag and drop an explicit widget into layout-template,
	*	The callback function (fnDragEnd) points to a target widget witch has alreay been drop into a layout container	
	*
	*/
	var draggableData = {
        context : 'body',
        targetWrapperClass : '.wrapper',
        targetClass : '.layout-cell',
        fnDragEnd : function (oTargetWidget){
            //request html and append;
            //var html = $(this).html();

        }
	};
	function initDragWidgets(){
		var ctx = $('.widget-container');
		var aWidgets = ctx.find('.widget-list-item');
		aWidgets.each(function (){
			$(this).johnDraggable(draggableData);
		});
	};

	function resetDragWidgets(){
		var ctx = $('.widget-container');
		var aWidgets = ctx.find('.widget-list-item');
		aWidgets.each(function (){
			$(this).johnDraggable('destroy');
		});
		initDragWidgets();
		initWrapperDraggable();
	}

	function initDragLayouts(){
	    var ctx = $(".layout-container");
	    var aLayouts = ctx.find('.layout-list-item');
	    aLayouts.johnDraggable('destroy');
	    aLayouts.each(function (){
            $(this).johnDraggable(draggableData);
        });
	}
	
	
	//=================================================================================
	//
	//	There are some util functions
	//
	//==================================================================================

	
	

	window.debug = true;
	function log(k,v){
		if (window.debug && console && console.log) {
			k && (v ? console.log(k, v) : console.log(k));
		}
	}
	function dir(o){
		if (window.debug && console && console.dir) {
			console.dir(o);
		}
	}

	function calcPosition(targetClass) {
      var arr = [];
      (function() {
        $(targetClass).each(function() {
          var os = $(this).offset();
          var w = $(this).outerWidth();
          var h = $(this).outerHeight();
          var offset = {
            left: os.left,
            top: os.top,
            right: os.left + w,
            bottom: os.top + h,
            height: h
          };
          arr.push(offset);
        });
      })();
      return arr;
    };


    function highLightWidgets (ev) {
    	ev = ev || window.event;
    	// highlight widgets
		// widget highlight set to the priority
		var widgetElems = $('#main-wrapper').find('[class*=widget]'),
			posWidgets = calcPosition(widgetElems),
			targetIndex = -1,
			x = ev.pageX,
			y = ev.pageY;

		if (posWidgets.length) {
			for (var i=0,l=posWidgets.length; i<l; i++) {
				var c = posWidgets[i];
				if(x >= c.left && x <= c.right && y >= c.top && y <= c.bottom){
					targetIndex = i;
					break;
				}
			}
		}
		$('.widgetHighLight').removeClass('widgetHighLight');
		if(targetIndex !== -1){
			var tl = widgetElems.eq(targetIndex).closest('*[data-widget-id]');
			tl.addClass('widgetHighLight');
			$('.highlight').removeClass('highlight');
			return;
		}
    }

    /* this function is used to highlight layout and widgets when mouse point is over it */
	function highLightLayouts(ev){
		ev = ev || window.event;
		// highlight targetted widget or layout
		// will be refactorred by highLightFn function
		
		// Layout var definitions
		var posLayout = calcPosition('.layout-cell'),
			x = ev.pageX,
			y = ev.pageY,
			preLayoutArray = [];

		
		// highlight widgets
		// widget highlight set to the priority
		// var widgetElems = $('#main-wrapper').find('[class*=widget]'),
		// 	posWidgets = calcPosition(widgetElems),
		// 	targetIndex = -1;
		// if (posWidgets.length) {
		// 	for (var i=0,l=posWidgets.length; i<l; i++) {
		// 		var c = posWidgets[i];
		// 		if(x >= c.left && x <= c.right && y >= c.top && y <= c.bottom){
		// 			targetIndex = i;
		// 			break;
		// 		}
		// 	}
		// }
		// $('.widgetHighLight').removeClass('widgetHighLight');
		// if(targetIndex !== -1){
		// 	var tl = widgetElems.eq(targetIndex).closest('*[data-widget-id]');
		// 	tl.addClass('widgetHighLight');
		// 	$('.highlight').removeClass('highlight');
		// 	return;
		// }


		
		
		if (posLayout.length) {
			for (var i=0,l=posLayout.length; i<l; i++) {
				var c = posLayout[i];
				if(x >= c.left && x <= c.right && y >= c.top && y <= c.bottom){
					preLayoutArray.push(i);
				}
			}
		}
		$('.highlight').removeClass('highlight');
		if(preLayoutArray.length){
			var tl = -1,
				t = -1,
				layoutCells = $('.layout-cell');
			for (var j=0,ll=preLayoutArray.length; j < ll; j++) {
				var targetCell = layoutCells.eq(preLayoutArray[j]);
				var pContainer = targetCell.closest('.layout-container');
				var layer = +pContainer.attr('data-layer');
				if (layer > t) {
					t = layer;
					tl = preLayoutArray[j];
				}
			}

			if(t !== -1){
				var ctx = layoutCells.eq(tl).closest('.layout-container');
				ctx.addClass('highlight');
			}
		}

		if (ev.stopPropagation){
			ev.stopPropagation();
		} else {
			window.cancelBubble = true;
		}


	}
	
	$(function (){
	    /**
	     * [description]
	     * @param  {[type]} ){      initModules();  } [description]
	     * @return {[type]}                        [description]
	     *
	     * comment : 
	     *          Global Main Entry
	     */
	    // $.holdReady(false);
	
	    var param = [];
	    param.push(top.ftlResource);
	    param.push(top.ftlHtml);
	    initModules(param);
	});