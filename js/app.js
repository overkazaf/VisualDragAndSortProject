/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 17:15:40
 * @version $Id$
 */
 window.debug = true;
 function log(k,v){
	if (window.debug && console && console.log) {
		k && (v ? console.log(k, v) : console.log(k));
	}
}

	// A tiny seed id generator
	var generatorId = function (len, radix, prefix, subfix){
		var targetId = '';
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	    var uuid = [], i;
	    len = len || 32;
			radix = radix || chars.length;
			prefix = prefix || '';
			prefix = prefix == '' ? '' : prefix + '_';
			subfix = subfix || '';
			subfix = subfix == '' ? '' : '_' + subfix;
	 
	    if (len) {
	      // Compact form
	      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
	    } else {
	      // rfc4122, version 4 form
	      var r;
	 
	      // rfc4122 requires these characters
	      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	      uuid[14] = '4';
	 
	      // Fill in random data.  At i==19 set the high bits of clock sequence as
	      // per rfc4122, sec. 4.1.5
	      for (i = 0; i < 36; i++) {
	        if (!uuid[i]) {
	          r = 0 | Math.random()*16;
	          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
	        }
	      }
	    }
	 
	  		targetId = uuid.join('');
			return prefix+targetId+subfix;
		};
	/**
	* Global dispatcher for intializing every modules
	*/
	function initModules(){
		// $.ajax({
		// 	url : 'publish/1429493589.html',
		// 	type : "GET",
		// 	dataType : "html",
		// 	success : function (data){
		// 		$('.wrapper').html(data);
		// 	}
		// }).done(function (){
		// 	initHeader();
		// 	initMainWrapper();
		// 	//initialize the widget dragging event
		// 	initDragWidgets();
		// });

		initHeader();
		initMainWrapper();
		//initialize the widget dragging event
		initDragWidgets();
		
	}

	function initHeader(){
		var oHeader = $('.header');
		var oTool = oHeader.find('.tool-part');
		var oToolMenu = oTool.find('ul.tool-menu');
		var oToolMenuItems = oToolMenu.find(".tool-menu-item");
		var oTooleMenuContainers = oTool.find("div.tool-container");

		initPublish();
		oToolMenu.on('click', 'li', function (index,value){
			if ($(this).hasClass('selected')) {
				$(this).removeClass('selected');
				$('.toggle-container').slideUp();
				$(window).scrollTop(0);
				$('.wrapper').css({
					'margin':'105px auto'
				});
			} else {
				var index = $(this).index();
				$(this).addClass('selected').siblings().removeClass('selected');
				$('.toggle-container').slideDown();
				$('.wrapper').css({
					'margin':'270px auto'
				});
				oTooleMenuContainers.hide().eq(index).fadeIn();
			}
		});
		//oToolMenuItems.eq(0).trigger('click');
		oTooleMenuContainers.hide();
		$('.toggle-container').slideUp();
		$('.wrapper').css({'margin':'105px auto'});
		

		// Init Layout Element
		initLayout();

		// Init radio btns
		initWidgetRadioButton();

		// Init Theme Elemnet
		initTheme();

		//
		initWrapperDraggable();
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
		var layoutList = $('.header').find('ul.layout-list');
		var layoutItems = layoutList.children('li.layout-list-item');
		layoutList.on('click', 'li', function (){
			//$.ajax();
			var template = $(this).attr('data-layout-template');
			var url = "http://localhost:8080/drag/bj/"+template+".html?t="+new Date();
			$.ajax({
				async : true,
				cache : false,
				url : url,
				type : "GET",
				dataType : "html",
				success : function (html){
					var oDrag = $('<li class="drag-part" data-source-code="layout"></li>');
					var $dom = $(html);
					var layoutId = generatorId(null, null, 'Layout', 'Generated');
					$dom.attr('id', layoutId).attr('data-layout-id', layoutId);
					oDrag.append($dom);
					//oDrag.smartMenu(menuData);
					$('#dragged-list').append(oDrag);
					oDrag.smartMenu(menuData);
					oDrag.find('*[operable]').smartMenu(menuData);
					oDrag.find('*[data-type=layout-template]').smartMenu(menuData);
				},
				error : function (XMLHttpRequest, textStatus, errorThrown){
					throw new Error(textStatus);
				}
			});
		});
	}

	function initTheme(){
		var themeList = $('.theme-list');

		//Theme items use event delegation
		themeList.on('click', 'li', function (){
			var url = 'publish/'+$(this).attr('data-theme-template')+".html";
			$.get(url, '', function (data){
				$('#dragged-list').dragsort('destroy');
				$('.wrapper').html(data);
				$('.wrapper').find('.layout-template').each(function (){
					$(this).smartMenu(menuData);
				});
				$('.wrapper').find('*[operable]').each(function (){
					$(this).smartMenu(menuData);
				});
				$('#dragged-list').dragsort();
				resetDragWidgets();
			});
		});

		$.ajax({
			url : "scan.php",
			cache : false,
			type : "GET",
			dataType : "JSON",
			success : function (d){
				if (d['success'] == true) {
					var fragment = '';
					var data = d['data'];
					$.each(data, function (i){
						var shortName = this.substring(0,this.indexOf('.html'));
						fragment += '<li class="theme-list-item" data-theme-template="'+shortName+'">主题'+(i)+'</li>';
					});
					themeList.html(fragment);
				}
			}
		});
	}

	function initWrapperDraggable(){
		var oWrapper = $('.wrapper');
		var aFlash = oWrapper.find('*[operable]');
		aFlash.each(function (){
			$(this).johnDraggable();
		});
	}

	function doPublish(html){
		$.ajax({
			url : 'publish.php',
			data : {"html":html},
			type : "POST",
			dataType : "JSON",
			success : function (d){
				if (d['success'] == true) {
					$('#dragged-list').dragsort("destroy");
					alert('发布成功');
					// return to previous page;
				}
			}
		});
		//step1. Directlly return editable wrapper html
		// $.ajax({
		// 	url : url,
		// 	type : "POST",
		// 	data : {},
		// 	success : function (){
		// 		var returnValue = [];
		// 		//step2.
		// 		var htmlShow = cleanHTMLTags(html);

		// 		//step3.
		// 		var htmlCleaned = cleanHTMLTags(html);


		// 		returnValue.push(htmlShow);
		// 		returnValue.push(htmlCleaned);

		// 		window.returnValue = returnValue;
		// 	}
		// });
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

		var aTemplates = $dom.find('.layout-template');
		aTemplates.each(function (){
			$(this).removeAttr('style').removeAttr('class').removeAttr('data-type');
		});

		var aOperables = $dom.find('*[operable]');
		aOperables.each(function (){
			$(this).removeAttr('operable');
		});
		
		
		var aLi = $dom.find('li.drag-part');
		//Step1. replace useless tags
		var fragment = '';
		aLi.each(function (){
			var html = $(this).html();
			var oRow = '<div class="row">' + html + "</div>";
			fragment += oRow;
		});
		fragment += '<link href="bootstrap.min.css" href="stylesheet">';
		fragment = '<div class="container">'+fragment+'</div>';
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
			doPublish(generatePreviewHTML(html));
		});
	}

	function trimEmptyDivs () {
		var html = $('.wrapper').html();
		var $dom = $(html);
		$dom.find('div[data-emptydiv=true]').remove();
		return $dom.prop('outerHTML');
	}
	/**
	 * [initWidgetRadioButton description]
	 * @return {[type]}
	 *
	 * comment : Change widget's contents automatically when user click the radio buttons under widget menu
	 */
	function initWidgetRadioButton(){
		var oTab = $('.widget-items-tab');
		var oWidget = oTab.parent();
		var aRadios = oTab.find('input[type=radio]');
		var aWidgetContents = oWidget.find('.widget-content');
		oTab.on('click', 'li', function (){
			var index = $(this).index();
			aRadios.removeAttr('checked');
			aRadios.eq(index).prop('checked', 'checked');
			aWidgetContents.hide();
			aWidgetContents.eq(index).fadeIn();
		});
		oTab.children('li').eq(0).trigger('click');
	}

	/**
	 * [displayConfigPanel description]
	 * @param  {[string]}
	 * @return {[type]}
	 *
	 * comment : 
	 */
	function displayConfigPanel(html){
		var oModal = $('#configModal');
		var oBody = oModal.find('.modal-body');
		var oFooter = oModal.find('.modal-footer');
		oBody.html(html['body']);
		oFooter.html(html['footer']);
		
		// Has render event
		if (typeof html['onRenderReady'] != 'undefined') {
			if ($.isFunction(html['onRenderReady']))
				html['onRenderReady']();
			oBody.find('button.upload').on('click', html['buttonFn']['fnUpload']);
		}
		
		oFooter.find('.btn-primary').on('click',html['buttonFn']['fnOK']);
		oFooter.find('.btn-default').on('click',html['buttonFn']['fnCancel']);
		oModal.modal('show');
	}


	//This panel is shown for layout configuration

	function displayLayoutConfigPanel(html){
		var oModal = $('#configModal');
		var oBody = oModal.find('.modal-body');
		var oFooter = oModal.find('.modal-footer');
		oBody.html(html['body']);
		oFooter.html(html['footer']);
		oFooter.find('.btn-primary').on('click',html['buttonFn']['fnOK']);
		oFooter.find('.btn-default').on('click',html['buttonFn']['fnCancel']);
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
	function initMainWrapper(){
		var draggedList = $('#dragged-list');
		draggedList.dragsort();
		draggedList.find('.layout-template').each(function (){
			$(this).smartMenu(menuData);
			$(this).find('*[operable]').each(function (){
				$(this).smartMenu(menuData);
			});
		});

		$(document).on('click', function (){
			$.smartMenu.hide();
		});
		$(window).on('scroll', function (){
			$.smartMenu.hide();
		});
	}


	//=================================================================
	//
	// Mask Controll Start
	// 
	// comment : This part is a tiny mask util for simulate a static 
	// 			 modal, witch should be combined with some DIY windows.
	//
	//
	//
	//=================================================================
	function mask (){
		var $doc = $(document);
		var $body = $(document.body);
		var $win = $(window);
		if (!$body.find('.mask').length) {
			$body.append($('<div class="mask"></div>'));
		}
		var m = maxMask();
		if (!m.data('data-resize')) {
			$(window).on('resize', function (){
				throttle(m.get(0),maxMask());
			});
			m.data('data-resize', true);
		}
		
	}
	function maxMask(){
		var $doc = $(document);
		var $body = $(document.body);
		var oMask = $body.find('.mask');
		oMask.css({
			"z-index" : 9999,
			"background-color" : '#000',
			"position" : "absolute",
			"left" : 0, "top" : 0,
			"width" : $doc.width(),
			"height" : $doc.height()
		}).fadeIn();

		var oPanel = $('#sourceCodePanel');
		if (oPanel.length) {
			var w = ($(window).width() - oPanel.width())/2;
			var h = ($(window).height() - oPanel.height())/2;

			w = w>10 ? w : 10;
			h = h>10 ? h : 10;
			oPanel.css({
				left : w,
				top : h
			})
		}
		return oMask;
	}
	function unmask(){
		var $doc = $(document);
		var $win = $(window);
		var oMask = $doc.find('.mask');
		if (oMask.length) {
			oMask.css({
				'z-index' : -1
			}).hide();
		}
	}

	function throttle (obj, fn){
		clearTimeout(obj.timeoutId);
		obj.timeoutId = setTimeout(function (){
			if ($.isFunction(fn)) {
				fn();
			}
		},50);
	}
	//=================================================================
	//
	// Mask Controll End
	// 
	//=================================================================

	/*
	*
	*	This allows user to drag and drop an explicit widget into layout-template,
	*	The callback function (fnDragEnd) points to a target widget witch has alreay been drop into a layout container	
	*
	*/
	function initDragWidgets(){
		var ctx = $('.widget-container');
		var aWidgets = ctx.find('.widget-list-item');
		aWidgets.each(function (){
			$(this).johnDraggable({
				context : 'body',
				targetWrapperClass : '.wrapper',
				targetClass : '.layout-template',
				fnDragEnd : function (oTargetWidget){
					//request html and append;
					var html = $(this).html();

				}
			});
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



	/**
	 * [description]
	 * @param  {[type]} ){		initModules();	} [description]
	 * @return {[type]}                        [description]
	 *
	 * comment : 
	 * 			Global Main Entry
	 */
	// $.holdReady(false);
	$(function (){
		initModules();
	});

